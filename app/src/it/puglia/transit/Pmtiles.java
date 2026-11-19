package it.puglia.transit;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.zip.GZIPInputStream;

/**
 * Minimal PMTiles v3 reader that extracts selected tiles from a remote archive
 * using HTTP range requests (same approach as `pmtiles extract`).
 * Pure Java (no Android APIs) so it can be tested on a desktop JVM.
 */
public class Pmtiles {

    public interface Sink { void tile(int z, int x, int y, byte[] data) throws IOException; }
    public interface Progress { void update(int done, int total, long bytes); }

    public static final String BUILDS = "https://build.protomaps.com/";

    private final String url;
    private Header h;
    private Entry[] root;
    private final Map<Long, Entry[]> leafCache = java.util.Collections.synchronizedMap(new HashMap<Long, Entry[]>());
    public int connectTimeout = 15000, readTimeout = 30000;
    public long bytesFetched = 0;

    public Pmtiles(String url) { this.url = url; }

    /* ---------------- header & directories ---------------- */

    static class Header {
        long rootOff, rootLen, metaOff, metaLen, leafOff, leafLen, dataOff, dataLen;
        int internalComp, tileComp, tileType, minZ, maxZ;
    }

    static class Entry {
        long tileId, offset; int length, runLength;
    }

    public void open() throws IOException {
        byte[] b = range(0, 16384);
        if (b.length < 127 || b[0] != 'P' || b[1] != 'M' || b[7] != 3) throw new IOException("Not a PMTiles v3 archive");
        Header x = new Header();
        x.rootOff = u64(b, 8); x.rootLen = u64(b, 16); x.metaOff = u64(b, 24); x.metaLen = u64(b, 32);
        x.leafOff = u64(b, 40); x.leafLen = u64(b, 48); x.dataOff = u64(b, 56); x.dataLen = u64(b, 64);
        x.internalComp = b[97] & 0xff; x.tileComp = b[98] & 0xff; x.tileType = b[99] & 0xff;
        x.minZ = b[100] & 0xff; x.maxZ = b[101] & 0xff;
        h = x;
        byte[] rootBytes = (x.rootOff + x.rootLen <= b.length)
                ? Arrays.copyOfRange(b, (int) x.rootOff, (int) (x.rootOff + x.rootLen))
                : range(x.rootOff, x.rootLen);
        root = parseDir(decompress(rootBytes, x.internalComp));
    }

    public int maxZoom() { return h == null ? 15 : h.maxZ; }

    static long u64(byte[] b, int o) {
        long v = 0; for (int i = 7; i >= 0; i--) v = (v << 8) | (b[o + i] & 0xffL); return v;
    }

    static Entry[] parseDir(byte[] d) throws IOException {
        int[] p = {0};
        int n = (int) varint(d, p);
        Entry[] e = new Entry[n];
        long last = 0;
        for (int i = 0; i < n; i++) { e[i] = new Entry(); last += varint(d, p); e[i].tileId = last; }
        for (int i = 0; i < n; i++) e[i].runLength = (int) varint(d, p);
        for (int i = 0; i < n; i++) e[i].length = (int) varint(d, p);
        for (int i = 0; i < n; i++) {
            long v = varint(d, p);
            if (v == 0 && i > 0) e[i].offset = e[i - 1].offset + e[i - 1].length;
            else e[i].offset = v - 1;
        }
        return e;
    }

    static long varint(byte[] d, int[] p) throws IOException {
        long r = 0; int shift = 0;
        while (true) {
            if (p[0] >= d.length) throw new IOException("Bad directory");
            int b = d[p[0]++] & 0xff;
            r |= (long) (b & 0x7f) << shift;
            if ((b & 0x80) == 0) return r;
            shift += 7;
            if (shift > 63) throw new IOException("Bad varint");
        }
    }

    static byte[] decompress(byte[] b, int comp) throws IOException {
        if (comp == 2) { // gzip
            GZIPInputStream in = new GZIPInputStream(new ByteArrayInputStream(b));
            return readAll(in);
        }
        if (comp == 0 || comp == 1) return b; // unknown/none
        throw new IOException("Unsupported compression " + comp);
    }

    static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[16384]; int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        in.close();
        return o.toByteArray();
    }

    /** Finds the data range of a tile, or null if the tile isn't in the archive. */
    synchronized long[] find(long tileId) throws IOException {
        Entry[] dir = root; long dirBase = -1;
        for (int depth = 0; depth < 4; depth++) {
            Entry e = search(dir, tileId);
            if (e == null) return null;
            if (e.runLength > 0) {
                if (tileId >= e.tileId + e.runLength) return null;
                return new long[]{h.dataOff + e.offset, e.length};
            }
            // leaf directory
            long key = e.offset;
            Entry[] leaf = leafCache.get(key);
            if (leaf == null) {
                leaf = parseDir(decompress(range(h.leafOff + e.offset, e.length), h.internalComp));
                leafCache.put(key, leaf);
            }
            dir = leaf;
        }
        return null;
    }

    static Entry search(Entry[] e, long id) {
        int lo = 0, hi = e.length - 1, best = -1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (e[mid].tileId <= id) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        return best < 0 ? null : e[best];
    }

    /* ---------------- tile ids ---------------- */

    public static long zxyToId(int z, long x, long y) {
        long acc = ((1L << (2 * z)) - 1) / 3;
        for (long s = (z == 0 ? 0 : 1L << (z - 1)); s > 0; s >>= 1) {
            long rx = (x & s) != 0 ? 1 : 0, ry = (y & s) != 0 ? 1 : 0;
            acc += s * s * ((3 * rx) ^ ry);
            if (ry == 0) {
                if (rx == 1) { x = s - 1 - x; y = s - 1 - y; }
                long t = x; x = y; y = t;
            }
        }
        return acc;
    }

    public static int lonToX(double lon, int z) {
        int n = 1 << z; int x = (int) Math.floor((lon + 180.0) / 360.0 * n);
        return Math.max(0, Math.min(n - 1, x));
    }
    public static int latToY(double lat, int z) {
        int n = 1 << z; double r = Math.toRadians(lat);
        int y = (int) Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n);
        return Math.max(0, Math.min(n - 1, y));
    }

    /** All tiles covering a bbox for a zoom range: list of {z,x,y}. */
    public static List<int[]> cover(double w, double s, double e, double n, int minZ, int maxZ) {
        List<int[]> out = new ArrayList<int[]>();
        for (int z = minZ; z <= maxZ; z++) {
            int x0 = lonToX(w, z), x1 = lonToX(e, z), y0 = latToY(n, z), y1 = latToY(s, z);
            for (int x = x0; x <= x1; x++) for (int y = y0; y <= y1; y++) out.add(new int[]{z, x, y});
        }
        return out;
    }

    /* ---------------- extraction ---------------- */

    static class Want { int z, x, y; long off; int len; }

    /** Downloads the given tiles (skipping ones the sink already has, if skip returns true). Returns tiles written. */
    public int extract(List<int[]> tiles, Sink sink, Progress progress, java.util.Set<String> skip) throws IOException {
        if (h == null) open();
        List<Want> wants = new ArrayList<Want>();
        int checked = 0;
        for (int[] t : tiles) {
            if (t[0] > h.maxZ) continue;
            if (skip != null && skip.contains(t[0] + "/" + t[1] + "/" + t[2])) continue;
            long[] r = find(zxyToId(t[0], t[1], t[2]));
            if (r != null) {
                Want w = new Want(); w.z = t[0]; w.x = t[1]; w.y = t[2]; w.off = r[0]; w.len = (int) r[1];
                wants.add(w);
            }
            if (progress != null && (++checked % 50 == 0)) progress.update(0, Math.max(1, wants.size()), bytesFetched);
        }
        Collections.sort(wants, new Comparator<Want>() {
            public int compare(Want a, Want b) { return a.off < b.off ? -1 : (a.off > b.off ? 1 : 0); }
        });
        int done = 0, i = 0;
        while (i < wants.size()) {
            // merge neighbouring ranges into one request (gap < 64 KB, chunk < 4 MB)
            int j = i; long start = wants.get(i).off, end = start + wants.get(i).len;
            while (j + 1 < wants.size()) {
                Want nx = wants.get(j + 1);
                long nEnd = Math.max(end, nx.off + nx.len);
                if (nx.off - end > 65536 || nEnd - start > 4L * 1024 * 1024) break;
                end = nEnd; j++;
            }
            byte[] chunk = range(start, end - start);
            for (int k = i; k <= j; k++) {
                Want w = wants.get(k);
                byte[] raw = Arrays.copyOfRange(chunk, (int) (w.off - start), (int) (w.off - start + w.len));
                sink.tile(w.z, w.x, w.y, decompress(raw, h.tileComp));
                done++;
            }
            if (progress != null) progress.update(done, wants.size(), bytesFetched);
            i = j + 1;
        }
        return done;
    }

    /** One tile, decompressed, or null if the archive has no tile there. */
    public byte[] getTile(int z, int x, int y) throws IOException {
        if (h == null) { synchronized (this) { if (h == null) open(); } }
        if (z > h.maxZ) return null;
        long[] r = find(zxyToId(z, x, y));
        if (r == null) return null;
        return decompress(range(r[0], r[1]), h.tileComp);
    }

    /* ---------------- http ---------------- */

    byte[] range(long off, long len) throws IOException {
        IOException last = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(connectTimeout); c.setReadTimeout(readTimeout);
                c.setRequestProperty("Range", "bytes=" + off + "-" + (off + len - 1));
                c.setRequestProperty("User-Agent", "OutAndBack/6.7 (+https://github.com/jariplayz-source/puglia-transit)");
                int code = c.getResponseCode();
                if (code != 206 && code != 200) throw new IOException("HTTP " + code);
                byte[] b = readAll(c.getInputStream());
                c.disconnect();
                if (code == 200 && b.length > len) b = Arrays.copyOfRange(b, (int) off, (int) (off + len)); // server ignored Range
                bytesFetched += b.length;
                return b;
            } catch (IOException e) { last = e; try { Thread.sleep(1000L * (attempt + 1)); } catch (InterruptedException ignored) {} }
        }
        throw last;
    }

    /** Finds the newest daily world build that is still online (builds are kept about a week). */
    public static String findLatestBuild() throws IOException {
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        c.add(Calendar.DAY_OF_MONTH, -1);   // yesterday's build first: today's may still be uploading
        for (int i = 0; i < 12; i++) {
            String name = String.format(java.util.Locale.US, "%04d%02d%02d.pmtiles",
                    c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
            try {
                HttpURLConnection h = (HttpURLConnection) new URL(BUILDS + name).openConnection();
                h.setConnectTimeout(10000); h.setReadTimeout(10000);
                h.setRequestProperty("Range", "bytes=0-6");
                int code = h.getResponseCode(); h.disconnect();
                if (code == 206 || code == 200) return BUILDS + name;
            } catch (IOException ignored) {}
            c.add(Calendar.DAY_OF_MONTH, -1);
        }
        throw new IOException("Couldn't find the map data online");
    }
}
