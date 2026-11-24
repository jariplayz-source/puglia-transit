package it.puglia.transit;

import java.io.ByteArrayOutputStream;

/** Makes a more zoomed-in map tile from a saved tile one level up (whole provinces are saved at zoom 14):
 *  every coordinate is doubled and shifted to the quarter that the child tile covers. Shapes outside the
 *  tile are left in; the map clips them, and labels outside a tile aren't drawn there. */
final class MvtZoom {
    private MvtZoom() { }
    static byte[] child(byte[] parent, int qx, int qy) {
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream(parent.length + 1024);
            int[] p = {0};
            while (p[0] < parent.length) {
                int start = p[0]; long key = varint(parent, p); int f = (int) (key >>> 3), wt = (int) (key & 7);
                if (f == 3 && wt == 2) { int len = (int) varint(parent, p); byte[] l = layer(parent, p[0], len, qx, qy); p[0] += len; writeVarint(o, key); writeVarint(o, l.length); o.write(l, 0, l.length); }
                else { skip(parent, p, wt); o.write(parent, start, p[0] - start); }
            }
            return o.toByteArray();
        } catch (Exception e) { return null; }
    }
    private static byte[] layer(byte[] b, int off, int len, int qx, int qy) {
        int end = off + len; long extent = 4096;
        int[] p = {off};
        while (p[0] < end) { long key = varint(b, p); int f = (int) (key >>> 3), wt = (int) (key & 7); if (f == 5 && wt == 0) extent = varint(b, p); else skip(b, p, wt); }
        ByteArrayOutputStream o = new ByteArrayOutputStream(len + 512); p[0] = off;
        while (p[0] < end) {
            int start = p[0]; long key = varint(b, p); int f = (int) (key >>> 3), wt = (int) (key & 7);
            if (f == 2 && wt == 2) { int l = (int) varint(b, p); byte[] ft = feature(b, p[0], l, qx * extent, qy * extent); p[0] += l; writeVarint(o, key); writeVarint(o, ft.length); o.write(ft, 0, ft.length); }
            else { skip(b, p, wt); o.write(b, start, p[0] - start); }
        }
        return o.toByteArray();
    }
    private static byte[] feature(byte[] b, int off, int len, long ox, long oy) {
        int end = off + len; ByteArrayOutputStream o = new ByteArrayOutputStream(len + 64); int[] p = {off};
        while (p[0] < end) {
            int start = p[0]; long key = varint(b, p); int f = (int) (key >>> 3), wt = (int) (key & 7);
            if (f == 4 && wt == 2) {
                int l = (int) varint(b, p), ge = p[0] + l; ByteArrayOutputStream g = new ByteArrayOutputStream(l + 16); boolean first = true;
                while (p[0] < ge) {
                    long cmd = varint(b, p); writeVarint(g, cmd); int id = (int) (cmd & 7), n = (int) (cmd >>> 3);
                    if (id == 1 || id == 2) for (int i = 0; i < n && p[0] < ge; i++) {
                        long dx = unzig(varint(b, p)), dy = unzig(varint(b, p));
                        if (first) { dx = 2 * dx - ox; dy = 2 * dy - oy; first = false; } else { dx *= 2; dy *= 2; }
                        writeVarint(g, zig(dx)); writeVarint(g, zig(dy));
                    }
                }
                byte[] gb = g.toByteArray(); writeVarint(o, key); writeVarint(o, gb.length); o.write(gb, 0, gb.length);
            } else { skip(b, p, wt); o.write(b, start, p[0] - start); }
        }
        return o.toByteArray();
    }
    private static long zig(long v) { return (v << 1) ^ (v >> 63); }
    private static long unzig(long v) { return (v >>> 1) ^ -(v & 1); }
    private static long varint(byte[] b, int[] p) { long r = 0; int s = 0; while (true) { int x = b[p[0]++] & 0xff; r |= (long) (x & 0x7f) << s; if ((x & 0x80) == 0) return r; s += 7; } }
    private static void skip(byte[] b, int[] p, int wt) { if (wt == 0) varint(b, p); else if (wt == 1) p[0] += 8; else if (wt == 2) { int l = (int) varint(b, p); p[0] += l; } else if (wt == 5) p[0] += 4; else throw new IllegalStateException("wire " + wt); }
    private static void writeVarint(ByteArrayOutputStream o, long v) { while ((v & ~0x7fL) != 0) { o.write((int) ((v & 0x7f) | 0x80)); v >>>= 7; } o.write((int) v); }
}
