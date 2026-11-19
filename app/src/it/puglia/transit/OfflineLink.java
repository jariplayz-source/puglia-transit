package it.puglia.transit;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Build;
import android.telephony.SmsManager;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Keeps a travel group in touch when the internet is down:
 *  - SMS: an encrypted location text to members whose number you have (they share it automatically while online);
 *  - Bluetooth: phones within ~50-100 m swap small encrypted location packets.
 * Both only run while there is no working internet connection.
 */
public class OfflineLink {
    static final String SMS_PREFIX = "Out&Back OAB1:";
    static final int MANUF = 0xFFFF;               // "test / personal" company id: no registration needed
    static final int SMS_PER_DAY = 16;

    // ---------- connectivity ----------
    static boolean online(Context c) {
        try {
            ConnectivityManager cm = (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (Build.VERSION.SDK_INT >= 23) {
                Network n = cm.getActiveNetwork(); if (n == null) return false;
                NetworkCapabilities nc = cm.getNetworkCapabilities(n);
                return nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
            }
            android.net.NetworkInfo ni = cm.getActiveNetworkInfo(); return ni != null && ni.isConnected();
        } catch (Exception e) { return true; }
    }

    // ---------- small helpers ----------
    static byte[] sha(String s) throws Exception { return MessageDigest.getInstance("SHA-256").digest(s.getBytes("UTF-8")); }
    static String tag(String topic) throws Exception { byte[] h = sha("tag:" + topic); return String.format("%02x%02x", h[0], h[1]); }
    static byte[] tag2(String topic) throws Exception { byte[] h = sha("tag:" + topic); return new byte[]{h[0], h[1]}; }
    static byte[] idHash(String id) throws Exception { byte[] h = sha("id:" + id); byte[] o = new byte[6]; System.arraycopy(h, 0, o, 0, 6); return o; }
    static byte[] key(String b64) { return Base64.decode(b64, Base64.NO_WRAP); }

    // ---------- inbox for the app (it reads and clears it) ----------
    static synchronized void inbox(Context c, JSONObject o) {
        SharedPreferences p = GroupCore.prefs(c);
        try { JSONArray a = new JSONArray(p.getString("inbox", "[]")); a.put(o); while (a.length() > 200) a.remove(0); p.edit().putString("inbox", a.toString()).apply(); } catch (Exception e) { }
    }
    static synchronized String takeInbox(Context c) { SharedPreferences p = GroupCore.prefs(c); String s = p.getString("inbox", "[]"); p.edit().putString("inbox", "[]").apply(); return s; }

    // ================= SMS =================
    /** Plain, readable text (one SMS): works even if the other person has no internet or no app.
     *  Play Protect blocks sideloaded apps that read incoming texts, so the app doesn't read SMS; the person sees it in their messages. */
    static String smsReadable(JSONObject g, String kind, double lat, double lon) {
        String nm = g.optString("name", "Your friend").replaceAll("[^\\p{L}\\p{N} .'-]", "");
        if (nm.length() > 18) nm = nm.substring(0, 18);
        String t = new java.text.SimpleDateFormat("HH:mm", java.util.Locale.US).format(new java.util.Date());
        if ("Q".equals(kind)) return "Out&Back: " + nm + " asks where you are (no internet here). Reply with your location or call.";
        String ll = String.format(java.util.Locale.US, "%.5f,%.5f", lat, lon);
        return "Out&Back: " + nm + " is at " + ll + " (" + t + "). Map: https://maps.google.com/?q=" + ll;
    }

    /** Compact, encrypted, fits one normal text message (~110 characters). */
    static String smsBody(JSONObject g, String kind, double lat, double lon) throws Exception {
        String plain = kind + "|" + g.optString("me") + "|" + (Math.round(lat * 1e5) / 1e5) + "|" + (Math.round(lon * 1e5) / 1e5) + "|" + Long.toString(System.currentTimeMillis() / 1000, 36);
        byte[] iv = new byte[12]; GroupCore.RND.nextBytes(iv);
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key(g.getString("key")), "AES"), new GCMParameterSpec(96, iv));
        byte[] ct = ci.doFinal(plain.getBytes("UTF-8"));
        byte[] out = new byte[12 + ct.length]; System.arraycopy(iv, 0, out, 0, 12); System.arraycopy(ct, 0, out, 12, ct.length);
        return SMS_PREFIX + tag(g.getString("topic")) + ":" + Base64.encodeToString(out, Base64.NO_WRAP | Base64.NO_PADDING);
    }

    /** Reads an incoming text; returns true if it was one of ours. */
    static boolean onSms(Context c, String from, String body) {
        int i = body.indexOf("OAB1:"); if (i < 0) return false;
        String rest = body.substring(i + 5).trim(); int k = rest.indexOf(':'); if (k != 4) return false;
        String tg = rest.substring(0, 4), data = rest.substring(5).trim();
        JSONArray gs = GroupCore.groups(GroupCore.prefs(c));
        for (int n = 0; n < gs.length(); n++) {
            JSONObject g = gs.optJSONObject(n); if (g == null) continue;
            try {
                if (!tag(g.getString("topic")).equals(tg)) continue;
                byte[] in = Base64.decode(data, Base64.NO_WRAP | Base64.NO_PADDING);
                Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
                ci.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key(g.getString("key")), "AES"), new GCMParameterSpec(96, in, 0, 12));
                String[] f = new String(ci.doFinal(in, 12, in.length - 12), "UTF-8").split("\\|");
                if (f.length < 5 || f[1].equals(g.optString("me"))) return true;
                long ts = Long.parseLong(f[4], 36) * 1000;
                JSONObject o = new JSONObject();
                o.put("topic", g.getString("topic")); o.put("from", f[1]); o.put("via", "sms"); o.put("phone", from == null ? "" : from); o.put("ts", ts);
                if ("L".equals(f[0]) || "R".equals(f[0])) { o.put("ty", "loc"); o.put("lat", Double.parseDouble(f[2])); o.put("lon", Double.parseDouble(f[3])); inbox(c, o); }
                if ("R".equals(f[0]) || "Q".equals(f[0])) {   // they ask where we are: answer by text if we share with this group
                    if ("Q".equals(f[0])) { o.put("ty", "locreq"); inbox(c, o); }
                    if (g.optBoolean("share") && from != null) {
                        String[] ll = GroupCore.prefs(c).getString("lastLoc", "").split(",");
                        if (ll.length >= 2 && canSendToday(c)) sendSms(c, from, smsBody(g, "L", Double.parseDouble(ll[0]), Double.parseDouble(ll[1])));
                    }
                }
                return true;
            } catch (Exception e) { }
        }
        return true;
    }

    static boolean canSendToday(Context c) {
        SharedPreferences p = GroupCore.prefs(c);
        String day = new java.text.SimpleDateFormat("yyyyMMdd", java.util.Locale.US).format(new java.util.Date());
        if (!day.equals(p.getString("smsDay", ""))) { p.edit().putString("smsDay", day).putInt("smsCount", 0).apply(); }
        return p.getInt("smsCount", 0) < SMS_PER_DAY * 3;
    }

    @SuppressLint("MissingPermission")
    static void sendSms(Context c, String to, String text) {
        try {
            if (Build.VERSION.SDK_INT >= 23 && c.checkSelfPermission(android.Manifest.permission.SEND_SMS) != android.content.pm.PackageManager.PERMISSION_GRANTED) return;
            SmsManager sm = Build.VERSION.SDK_INT >= 31 ? c.getSystemService(SmsManager.class) : SmsManager.getDefault();
            sm.sendTextMessage(to, null, text, null, null);
            SharedPreferences p = GroupCore.prefs(c); p.edit().putInt("smsCount", p.getInt("smsCount", 0) + 1).apply();
        } catch (Exception e) { }
    }

    /** Called with each fresh position while offline: texts each sharing group, at most every 30 min (or 400 m moved), 16 a day per group. */
    static void maybeSms(Context c, double lat, double lon) {
        SharedPreferences p = GroupCore.prefs(c);
        JSONArray gs = GroupCore.groups(p);
        String day = new java.text.SimpleDateFormat("yyyyMMdd", java.util.Locale.US).format(new java.util.Date());
        for (int n = 0; n < gs.length(); n++) {
            JSONObject g = gs.optJSONObject(n); if (g == null || !g.optBoolean("share")) continue;
            JSONObject phones = g.optJSONObject("phones"); if (phones == null || phones.length() == 0) continue;
            try {
                String t = g.getString("topic"), st = p.getString("sms:" + t, "");
                String[] s = st.split(",");   // day,count,lastTs,lat,lon
                int cnt = s.length >= 2 && day.equals(s[0]) ? Integer.parseInt(s[1]) : 0;
                long last = s.length >= 3 ? Long.parseLong(s[2]) : 0;
                double plat = s.length >= 5 ? Double.parseDouble(s[3]) : 999, plon = s.length >= 5 ? Double.parseDouble(s[4]) : 999;
                double moved = plat == 999 ? 1e9 : Math.hypot((lat - plat) * 111320, (lon - plon) * 111320 * Math.cos(Math.toRadians(lat)));
                long now = System.currentTimeMillis();
                if (cnt >= SMS_PER_DAY) continue;
                if (now - last < 30 * 60000 && moved < 400) continue;
                if (now - last < 5 * 60000) continue;
                String body = smsReadable(g, "L", lat, lon);
                java.util.Iterator<String> it = phones.keys();
                while (it.hasNext()) { String ph = phones.optString(it.next()); if (ph.length() > 5) sendSms(c, ph, body); }
                p.edit().putString("sms:" + t, day + "," + (cnt + 1) + "," + now + "," + lat + "," + lon).apply();
            } catch (Exception e) { }
        }
    }

    /** "Where are you?" by text to one member (used when offline). */
    static void askBySms(Context c, String topic, String phone) {
        JSONArray gs = GroupCore.groups(GroupCore.prefs(c));
        for (int n = 0; n < gs.length(); n++) {
            JSONObject g = gs.optJSONObject(n);
            if (g == null || !topic.equals(g.optString("topic"))) continue;
            try {
                String[] ll = GroupCore.prefs(c).getString("lastLoc", "").split(",");
                boolean have = ll.length >= 2 && g.optBoolean("share");
                sendSms(c, phone, have ? smsReadable(g, "L", Double.parseDouble(ll[0]), Double.parseDouble(ll[1])) + " Where are you?" : smsReadable(g, "Q", 0, 0));
            } catch (Exception e) { }
        }
    }

    // ================= Bluetooth nearby =================
    static BluetoothLeAdvertiser adv; static AdvertiseCallback advCb; static BluetoothLeScanner scn; static ScanCallback scnCb;
    static int rot = 0; static boolean btOn = false;

    static boolean btPermitted(Context c) {
        if (Build.VERSION.SDK_INT >= 31)
            return c.checkSelfPermission(android.Manifest.permission.BLUETOOTH_SCAN) == android.content.pm.PackageManager.PERMISSION_GRANTED
                && c.checkSelfPermission(android.Manifest.permission.BLUETOOTH_ADVERTISE) == android.content.pm.PackageManager.PERMISSION_GRANTED;
        return c.checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED;
    }
    static BluetoothAdapter adapter(Context c) { try { BluetoothManager m = (BluetoothManager) c.getSystemService(Context.BLUETOOTH_SERVICE); return m == null ? null : m.getAdapter(); } catch (Exception e) { return null; } }
    static boolean btAvailable(Context c) { BluetoothAdapter a = adapter(c); return a != null && a.isEnabled() && btPermitted(c); }

    /** 24-byte packet: tag(2) time(4) encrypted[id-hash(6) lat(4) lon(4)] mac(4). */
    static byte[] packet(JSONObject g, double lat, double lon) throws Exception {
        byte[] k = key(g.getString("key")), tg = tag2(g.getString("topic"));
        int ts = (int) (System.currentTimeMillis() / 1000);
        ByteBuffer pl = ByteBuffer.allocate(14); pl.put(idHash(g.optString("me"))); pl.putInt((int) Math.round(lat * 1e6)); pl.putInt((int) Math.round(lon * 1e6));
        byte[] ct = ctr(k, tg, ts, pl.array());
        ByteBuffer out = ByteBuffer.allocate(24); out.put(tg); out.putInt(ts); out.put(ct); out.put(mac(k, tg, ts, ct));
        return out.array();
    }
    static byte[] ctr(byte[] k, byte[] tg, int ts, byte[] in) throws Exception {
        byte[] iv = new byte[16]; iv[0] = tg[0]; iv[1] = tg[1]; ByteBuffer.wrap(iv, 2, 4).putInt(ts); iv[6] = 'B'; iv[7] = 'T';
        Cipher c = Cipher.getInstance("AES/CTR/NoPadding"); c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(k, "AES"), new IvParameterSpec(iv)); return c.doFinal(in);
    }
    static byte[] mac(byte[] k, byte[] tg, int ts, byte[] ct) throws Exception {
        Mac m = Mac.getInstance("HmacSHA256"); m.init(new SecretKeySpec(sha("mac:" + Base64.encodeToString(k, Base64.NO_WRAP)), "HmacSHA256"));
        m.update(tg); m.update(ByteBuffer.allocate(4).putInt(ts).array()); m.update(ct);
        byte[] h = m.doFinal(); return new byte[]{h[0], h[1], h[2], h[3]};
    }
    /** Returns {groupIndex, memberIdHash(hex), lat, lon, ts} or null. */
    static JSONObject readPacket(JSONArray gs, byte[] p) {
        if (p == null || p.length < 24) return null;
        for (int n = 0; n < gs.length(); n++) {
            JSONObject g = gs.optJSONObject(n); if (g == null) continue;
            try {
                byte[] tg = tag2(g.getString("topic")); if (p[0] != tg[0] || p[1] != tg[1]) continue;
                byte[] k = key(g.getString("key"));
                int ts = ByteBuffer.wrap(p, 2, 4).getInt();
                byte[] ct = new byte[14]; System.arraycopy(p, 6, ct, 0, 14);
                byte[] m = mac(k, tg, ts, ct); if (m[0] != p[20] || m[1] != p[21] || m[2] != p[22] || m[3] != p[23]) continue;
                if (Math.abs(System.currentTimeMillis() / 1000 - ts) > 3600) continue;
                byte[] pl = ctr(k, tg, ts, ct);
                ByteBuffer b = ByteBuffer.wrap(pl); byte[] idh = new byte[6]; b.get(idh);
                StringBuilder hx = new StringBuilder(); for (byte x : idh) hx.append(String.format("%02x", x));
                JSONObject o = new JSONObject();
                o.put("topic", g.getString("topic")); o.put("idh", hx.toString()); o.put("lat", b.getInt() / 1e6); o.put("lon", b.getInt() / 1e6); o.put("ts", ts * 1000L);
                o.put("ty", "loc"); o.put("via", "bt");
                if (hx.toString().equals(hexId(g.optString("me")))) return null;   // ourselves
                JSONArray mids = g.optJSONArray("mids");
                if (mids != null) for (int q = 0; q < mids.length(); q++) { String mid = mids.optString(q); if (hx.toString().equals(hexId(mid))) { o.put("from", mid); break; } }
                return o;
            } catch (Exception e) { }
        }
        return null;
    }
    static String hexId(String id) { try { StringBuilder hx = new StringBuilder(); for (byte x : idHash(id)) hx.append(String.format("%02x", x)); return hx.toString(); } catch (Exception e) { return ""; } }

    @SuppressLint("MissingPermission")
    static synchronized void btTick(final Context c, double lat, double lon) {
        if (!btAvailable(c)) { btStop(c); return; }
        final BluetoothAdapter a = adapter(c);
        JSONArray gs = GroupCore.groups(GroupCore.prefs(c));
        List<JSONObject> share = new ArrayList<JSONObject>();
        for (int n = 0; n < gs.length(); n++) { JSONObject g = gs.optJSONObject(n); if (g != null && g.optBoolean("share")) share.add(g); }
        try {
            // advertise (rotate between groups)
            if (adv == null) adv = a.getBluetoothLeAdvertiser();
            if (adv != null && advCb != null) { try { adv.stopAdvertising(advCb); } catch (Exception e) { } advCb = null; }
            if (adv != null && !share.isEmpty() && lat != 999) {
                JSONObject g = share.get(rot++ % share.size());
                AdvertiseSettings s = new AdvertiseSettings.Builder().setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
                    .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH).setConnectable(false).setTimeout(0).build();
                AdvertiseData d = new AdvertiseData.Builder().setIncludeDeviceName(false).setIncludeTxPowerLevel(false).addManufacturerData(MANUF, packet(g, lat, lon)).build();
                advCb = new AdvertiseCallback() { };
                adv.startAdvertising(s, d, advCb);
            }
            // scan
            if (scnCb == null) {
                scn = a.getBluetoothLeScanner();
                if (scn != null) {
                    scnCb = new ScanCallback() {
                        @Override public void onScanResult(int type, ScanResult r) {
                            try {
                                byte[] p = r.getScanRecord() == null ? null : r.getScanRecord().getManufacturerSpecificData(MANUF);
                                JSONObject o = readPacket(GroupCore.groups(GroupCore.prefs(c)), p);
                                if (o == null) return;
                                o.put("rssi", r.getRssi());
                                String key = "bt:" + o.optString("idh");
                                SharedPreferences pr = GroupCore.prefs(c);
                                if (pr.getLong(key, 0) == o.optLong("ts")) return;   // same packet again
                                pr.edit().putLong(key, o.optLong("ts")).apply();
                                inbox(c, o);
                            } catch (Exception e) { }
                        }
                    };
                    List<ScanFilter> f = new ArrayList<ScanFilter>();
                    f.add(new ScanFilter.Builder().setManufacturerData(MANUF, new byte[0]).build());
                    scn.startScan(f, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_POWER).build(), scnCb);
                }
            }
            btOn = true;
        } catch (Exception e) { }
    }

    @SuppressLint("MissingPermission")
    static synchronized void btStop(Context c) {
        try { if (adv != null && advCb != null) adv.stopAdvertising(advCb); } catch (Exception e) { }
        try { if (scn != null && scnCb != null) scn.stopScan(scnCb); } catch (Exception e) { }
        advCb = null; scnCb = null; btOn = false;
    }
}
