package it.puglia.transit;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Stores downloaded street-map tiles on the phone (files/tiles/z/x/y).
 * Each saved area keeps a list of its tiles so areas can share tiles and be deleted independently.
 * Nothing is removed unless the user deletes an area or clears everything.
 */
public class MapStore {
    public static final double[] REGION = {16.3, 39.65, 18.75, 41.35}; // w,s,e,n (Puglia + Matera)
    private final File root, tiles, lists, manifest, cache;
    private Pmtiles live = null;
    private long liveFailUntil = 0;
    private int cacheWrites = 0;
    private volatile boolean busy = false;
    private String buildUrl = null;

    public interface Listener {
        void progress(String id, String phase, int done, int total, long bytes);
        void finished(String id, boolean ok, String message);
    }

    public MapStore(Context ctx) {
        root = new File(ctx.getFilesDir(), "map");
        tiles = new File(root, "tiles");
        lists = new File(root, "areas");
        manifest = new File(root, "areas.json");
        cache = new File(ctx.getCacheDir(), "livetiles");
        tiles.mkdirs(); lists.mkdirs(); cache.mkdirs();
    }

    public boolean isBusy() { return busy; }

    public File tileFile(int z, int x, int y) { return new File(tiles, z + "/" + x + "/" + y); }

    /** Saved tile, else cached live tile, else (when online) download it now. Returns null if nothing. */
    public byte[] tileOrLive(int z, int x, int y) {
        try {
            File f = tileFile(z, x, y);
            if (f.exists() && f.length() > 0) return readBytes(f);
            File c = new File(cache, z + "/" + x + "/" + y);
            if (c.exists() && c.length() > 0) return readBytes(c);
            if (System.currentTimeMillis() < liveFailUntil) return null;
            Pmtiles p = liveArchive();
            if (p == null) return null;
            byte[] data = p.getTile(z, x, y);
            if (data == null || data.length == 0) return new byte[0];   // never cache empty answers
            c.getParentFile().mkdirs();
            FileOutputStream o = new FileOutputStream(c); o.write(data); o.close();
            if (++cacheWrites % 200 == 0 && dirSize(cache) > 150L * 1024 * 1024) { deleteTree(cache); cache.mkdirs(); }
            return data;
        } catch (Exception e) {
            liveFailUntil = System.currentTimeMillis() + 20000;   // offline: don't keep trying for a bit
            synchronized (this) { live = null; buildUrl = null; }  // the online map build may have changed: find it again
            return null;
        }
    }

    /** Forget the online map build and the temporary tile cache (fixes a blank street map). */
    public synchronized void resetLive() {
        live = null; buildUrl = null; liveFailUntil = 0;
        deleteTree(cache); cache.mkdirs();
    }

    private synchronized Pmtiles liveArchive() throws IOException {
        if (live != null) return live;
        if (buildUrl == null) buildUrl = Pmtiles.findLatestBuild();
        Pmtiles p = new Pmtiles(buildUrl);
        p.connectTimeout = 5000; p.readTimeout = 10000;
        p.open();
        live = p;
        return live;
    }

    private static byte[] readBytes(File f) throws IOException {
        FileInputStream in = new FileInputStream(f);
        byte[] b = new byte[(int) f.length()]; int off = 0, n;
        while (off < b.length && (n = in.read(b, off, b.length - off)) > 0) off += n;
        in.close(); return b;
    }

    /* ---------------- manifest ---------------- */

    public synchronized JSONArray areas() {
        try {
            if (!manifest.exists()) return new JSONArray();
            return new JSONArray(readText(manifest));
        } catch (Exception e) { return new JSONArray(); }
    }

    private synchronized void saveAreas(JSONArray a) throws IOException {
        File tmp = new File(root, "areas.json.tmp");
        FileWriter w = new FileWriter(tmp); w.write(a.toString()); w.close();
        if (!tmp.renameTo(manifest)) { manifest.delete(); tmp.renameTo(manifest); }
    }

    public synchronized long usedBytes() { return dirSize(tiles); }

    public synchronized String summary() {
        try {
            JSONObject o = new JSONObject();
            o.put("areas", areas()); o.put("used", usedBytes()); o.put("busy", busy);
            return o.toString();
        } catch (Exception e) { return "{\"areas\":[],\"used\":0}"; }
    }

    /* ---------------- download ---------------- */

    public void download(final String id, final String name, final double w, final double s, final double e, final double n,
                         final int minZ, final int maxZ, final Listener l) {
        if (busy) { l.finished(id, false, "Another download is still running"); return; }
        busy = true;
        new Thread(new Runnable() { public void run() {
            try {
                l.progress(id, "Finding map data…", 0, 1, 0);
                if (buildUrl == null) buildUrl = Pmtiles.findLatestBuild();
                Pmtiles p = new Pmtiles(buildUrl);
                p.open();
                // 1) small overview of the whole region (once)
                if (!hasArea("overview")) {
                    l.progress(id, "Overview of the region…", 0, 1, 0);
                    saveArea("overview", "Region overview", REGION[0], REGION[1], REGION[2], REGION[3], 0, 9, p, l, "overview");
                }
                // 2) the requested area
                saveArea(id, name, w, s, e, n, minZ, Math.min(maxZ, p.maxZoom()), p, l, id);
                l.finished(id, true, "Saved");
            } catch (Exception ex) {
                String m = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
                if (ex instanceof java.net.UnknownHostException) m = "No internet connection";
                l.finished(id, false, m);
            } finally { busy = false; }
        }}).start();
    }

    private boolean hasArea(String id) {
        JSONArray a = areas();
        for (int i = 0; i < a.length(); i++) if (id.equals(a.optJSONObject(i).optString("id"))) return true;
        return false;
    }

    private void saveArea(final String id, String name, double w, double s, double e, double n, int minZ, int maxZ,
                          Pmtiles p, final Listener l, final String reportId) throws Exception {
        List<int[]> cover = Pmtiles.cover(w, s, e, n, minZ, maxZ);
        Set<String> have = new HashSet<String>();
        for (int[] t : cover) if (tileFile(t[0], t[1], t[2]).exists()) have.add(t[0] + "/" + t[1] + "/" + t[2]);
        final String phase = "overview".equals(id) ? "Overview of the region…" : "Downloading " + name + "…";
        p.extract(cover, new Pmtiles.Sink() {
            public void tile(int z, int x, int y, byte[] data) throws IOException {
                File f = tileFile(z, x, y); f.getParentFile().mkdirs();
                File tmp = new File(f.getPath() + ".tmp");
                FileOutputStream o = new FileOutputStream(tmp); o.write(data); o.close();
                if (!tmp.renameTo(f)) { f.delete(); tmp.renameTo(f); }
            }
        }, new Pmtiles.Progress() {
            public void update(int done, int total, long bytes) { l.progress(reportId, phase, done, total, bytes); }
        }, have);
        // record the tiles that belong to this area (only ones that exist: empty sea tiles aren't stored)
        StringBuilder sb = new StringBuilder(); long bytes = 0; int count = 0;
        for (int[] t : cover) {
            File f = tileFile(t[0], t[1], t[2]);
            if (f.exists()) { sb.append(t[0]).append('/').append(t[1]).append('/').append(t[2]).append('\n'); bytes += f.length(); count++; }
        }
        FileWriter fw = new FileWriter(new File(lists, safe(id) + ".txt")); fw.write(sb.toString()); fw.close();
        synchronized (this) {
            JSONArray a = areas(), b = new JSONArray();
            for (int i = 0; i < a.length(); i++) if (!id.equals(a.optJSONObject(i).optString("id"))) b.put(a.optJSONObject(i));
            JSONObject o = new JSONObject();
            o.put("id", id); o.put("name", name); o.put("w", w); o.put("s", s); o.put("e", e); o.put("n", n);
            o.put("tiles", count); o.put("bytes", bytes);
            o.put("date", new SimpleDateFormat("d MMM yyyy", Locale.ENGLISH).format(new Date()));
            b.put(o);
            saveAreas(b);
        }
    }

    /* ---------------- delete ---------------- */

    public synchronized void delete(String id) throws IOException {
        JSONArray a = areas(), keep = new JSONArray();
        Set<String> stillUsed = new HashSet<String>();
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (id.equals(o.optString("id"))) continue;
            keep.put(o);
            stillUsed.addAll(readList(o.optString("id")));
        }
        for (String k : readList(id)) if (!stillUsed.contains(k)) new File(tiles, k).delete();
        new File(lists, safe(id) + ".txt").delete();
        saveAreas(keep);
    }

    public synchronized void clearAll() {
        deleteTree(root); tiles.mkdirs(); lists.mkdirs();
    }

    /* ---------------- helpers ---------------- */

    private List<String> readList(String id) {
        List<String> out = new ArrayList<String>();
        File f = new File(lists, safe(id) + ".txt");
        if (!f.exists()) return out;
        try {
            BufferedReader r = new BufferedReader(new InputStreamReader(new FileInputStream(f), "UTF-8"));
            String line; while ((line = r.readLine()) != null) if (line.length() > 0) out.add(line);
            r.close();
        } catch (IOException ignored) {}
        return out;
    }

    private static String safe(String id) { return id.replaceAll("[^A-Za-z0-9_-]", "_"); }

    private static String readText(File f) throws IOException {
        BufferedReader r = new BufferedReader(new InputStreamReader(new FileInputStream(f), "UTF-8"));
        StringBuilder sb = new StringBuilder(); String line;
        while ((line = r.readLine()) != null) sb.append(line);
        r.close();
        return sb.toString();
    }

    private static long dirSize(File f) {
        if (f.isFile()) return f.length();
        long s = 0; File[] c = f.listFiles();
        if (c != null) for (File x : c) s += dirSize(x);
        return s;
    }

    private static void deleteTree(File f) {
        File[] c = f.listFiles();
        if (c != null) for (File x : c) deleteTree(x);
        f.delete();
    }
}
