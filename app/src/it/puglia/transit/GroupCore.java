package it.puglia.transit;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONArray;
import org.json.JSONObject;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import java.io.File;
import java.io.FileWriter;

/** Travel group: end-to-end encryption (AES-256-GCM) and the relay (ntfy.sh) that passes scrambled messages between phones. */
public class GroupCore {
    static final String RELAY = "https://ntfy.sh/";
    static final SecureRandom RND = new SecureRandom();

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("group", 0); }

    static String newKey() { byte[] k = new byte[32]; RND.nextBytes(k); return Base64.encodeToString(k, Base64.NO_WRAP); }
    static String newTopic() { byte[] b = new byte[16]; RND.nextBytes(b); StringBuilder s = new StringBuilder("pt-"); for (byte x : b) s.append(String.format("%02x", x)); return s.toString(); }

    static String encrypt(String keyB64, byte[] plain) throws Exception {
        byte[] iv = new byte[12]; RND.nextBytes(iv);
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(Base64.decode(keyB64, Base64.NO_WRAP), "AES"), new GCMParameterSpec(128, iv));
        byte[] ct = c.doFinal(plain);
        byte[] out = new byte[iv.length + ct.length];
        System.arraycopy(iv, 0, out, 0, 12); System.arraycopy(ct, 0, out, 12, ct.length);
        return "PT1:" + Base64.encodeToString(out, Base64.NO_WRAP);
    }
    static byte[] decrypt(String keyB64, String s) throws Exception {
        if (s == null || !s.startsWith("PT1:")) throw new Exception("not ours");
        byte[] in = Base64.decode(s.substring(4), Base64.NO_WRAP);
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(Base64.decode(keyB64, Base64.NO_WRAP), "AES"), new GCMParameterSpec(128, in, 0, 12));
        return c.doFinal(in, 12, in.length - 12);
    }

    static String http(String method, String url, byte[] body, JSONObject headers, int timeout) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(10000); c.setReadTimeout(timeout);
        c.setRequestMethod(method);
        c.setRequestProperty("User-Agent", "OutAndBack/1.16 (+https://github.com/jariplayz-source/puglia-transit)");
        if (headers != null) { java.util.Iterator<String> it = headers.keys(); while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, headers.getString(k)); } }
        if (body != null) { c.setDoOutput(true); c.setFixedLengthStreamingMode(body.length); OutputStream os = c.getOutputStream(); os.write(body); os.close(); }
        int code = c.getResponseCode();
        boolean relayPost = !"GET".equals(method) && url.startsWith(RELAY) && sCtx != null;
        if (relayPost && code < 400) countSent(sCtx);
        if (relayPost && code == 429) {
            long wait = -1; try { wait = Long.parseLong(c.getHeaderField("Retry-After")) * 1000L; } catch (Exception e) { }
            long until = wait > 0 ? System.currentTimeMillis() + wait : nextUtcMidnight();
            prefs(sCtx).edit().putLong("limitedUntil", until).apply();
        }
        InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
        ByteArrayOutputStream bo = new ByteArrayOutputStream(); byte[] b = new byte[16384]; int n;
        if (in != null) { while ((n = in.read(b)) > 0) bo.write(b, 0, n); in.close(); }
        c.disconnect();
        if (code >= 400) throw new Exception("relay said " + code + (code == 429 ? " (too many messages, wait a minute)" : code == 413 ? " (file too big)" : ""));
        return bo.toString("UTF-8");
    }

    /* ---------- message budget: the free relay (ntfy.sh) accepts ~250 messages a day per internet connection ---------- */
    static final int DAY_LIMIT = 250;
    static Context sCtx;                                   // set once by the app/service so http() can count
    static void init(Context c) { if (sCtx == null) sCtx = c.getApplicationContext(); }
    static String utcDay() { java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("yyyyMMdd", java.util.Locale.US); f.setTimeZone(java.util.TimeZone.getTimeZone("UTC")); return f.format(new java.util.Date()); }
    static long nextUtcMidnight() { java.util.Calendar k = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("UTC")); k.add(java.util.Calendar.DAY_OF_MONTH, 1);
        k.set(java.util.Calendar.HOUR_OF_DAY, 0); k.set(java.util.Calendar.MINUTE, 2); k.set(java.util.Calendar.SECOND, 0); return k.getTimeInMillis(); }
    static synchronized int sentToday(Context c) { SharedPreferences p = prefs(c); return utcDay().equals(p.getString("msgDay", "")) ? p.getInt("msgN", 0) : 0; }
    static synchronized void countSent(Context c) { SharedPreferences p = prefs(c); String d = utcDay(); int n = d.equals(p.getString("msgDay", "")) ? p.getInt("msgN", 0) : 0; p.edit().putString("msgDay", d).putInt("msgN", n + 1).apply(); }
    /** May we send now? Routine updates stop first, so SOS, check-ins and photos always have room left. */
    static boolean allow(Context c, int upTo) {
        init(c);
        if (System.currentTimeMillis() < prefs(c).getLong("limitedUntil", 0)) return false;
        return sentToday(c) < upTo;
    }
    static String relayStatus(Context c) {
        init(c);
        try { JSONObject o = new JSONObject(); o.put("n", sentToday(c)); o.put("limit", DAY_LIMIT); o.put("limitedUntil", prefs(c).getLong("limitedUntil", 0)); o.put("reset", nextUtcMidnight()); return o.toString(); } catch (Exception e) { return "{}"; }
    }

    /** Battery level 0-100 (and +1000 when charging), or -1. */
    static int battery(Context ctx) {
        try {
            Intent b = ctx.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            int lvl = b.getIntExtra(BatteryManager.EXTRA_LEVEL, -1), sc = b.getIntExtra(BatteryManager.EXTRA_SCALE, 100), st = b.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
            if (lvl < 0) return -1;
            int pct = Math.round(lvl * 100f / sc);
            return pct + ((st == BatteryManager.BATTERY_STATUS_CHARGING || st == BatteryManager.BATTERY_STATUS_FULL) ? 1000 : 0);
        } catch (Exception e) { return -1; }
    }

    /** Journey: adds a point to your own route (kept only on this phone). */
    static double tLat = 999, tLon = 999; static long tTs = 0;
    static void recordPoint(Context ctx, double lat, double lon, float acc, float spd) {
        // only reasonably precise fixes: phone-mast and Wi-Fi guesses make the zigzags across town
        if (acc > 50) return;
        long now = System.currentTimeMillis();
        if (tLat != 999) {
            double d = Math.hypot((lat - tLat) * 111320, (lon - tLon) * 111320 * Math.cos(Math.toRadians(lat)));
            double dt = Math.max(1, (now - tTs) / 1000.0);
            if (d < Math.max(25, acc) && now - tTs < 10 * 60000) return;   // standing still or GPS wobble
            if (d / dt > 70 && dt < 600) return;                           // a jump faster than 250 km/h: a bad fix
        }
        tLat = lat; tLon = lon; tTs = now;
        try { FileWriter w = new FileWriter(new File(ctx.getFilesDir(), "track.csv"), true);
              w.write(now + "," + (Math.round(lat * 1e5) / 1e5) + "," + (Math.round(lon * 1e5) / 1e5) + "," + Math.round(acc) + "," + Math.round(spd * 10) / 10.0 + "\n"); w.close(); } catch (Exception e) { }
    }

    /** All your groups: [{topic,key,me,name,gname,share}]. Older versions stored one group directly. */
    static JSONArray groups(SharedPreferences p) {
        try { String g = p.getString("groups", null); if (g != null) return new JSONArray(g); } catch (Exception e) { }
        JSONArray a = new JSONArray();
        try {
            String topic = p.getString("topic", null), key = p.getString("key", null);
            if (topic != null && key != null) {
                JSONObject o = new JSONObject();
                o.put("topic", topic); o.put("key", key); o.put("me", p.getString("me", "")); o.put("name", p.getString("name", ""));
                o.put("gname", p.getString("gname", "")); o.put("share", p.getBoolean("sharing", false));
                a.put(o);
            }
        } catch (Exception e) { }
        return a;
    }
    static boolean anySharing(SharedPreferences p) {
        if (!p.getBoolean("sharing", false)) return false;
        JSONArray g = groups(p);
        for (int i = 0; i < g.length(); i++) if (g.optJSONObject(i).optBoolean("share")) return true;
        return false;
    }

    /** Sends one encrypted location update to every group you share with (used by the background location service). */
    static void sendLocation(Context ctx, double lat, double lon, float acc) { sendLocation(ctx, lat, lon, acc, -1, null); }
    static void sendLocation(Context ctx, double lat, double lon, float acc, float spd) { sendLocation(ctx, lat, lon, acc, spd, null); }
    static void sendLocation(Context ctx, double lat, double lon, float acc, float spd, String onlyTopic) {
        SharedPreferences p = prefs(ctx);
        JSONArray gs = groups(p);
        if (!allow(ctx, onlyTopic != null ? 235 : 170)) return;     // routine location: keep ~80 messages a day for everything else
        int bat = battery(ctx);
        for (int i = 0; i < gs.length(); i++) {
            JSONObject g = gs.optJSONObject(i);
            if (g == null || !g.optBoolean("share")) continue;
            if (onlyTopic != null && !onlyTopic.equals(g.optString("topic"))) continue;
            try {
                JSONObject m = new JSONObject();
                m.put("v", 1); m.put("ver", "1.16"); m.put("ty", "loc"); m.put("from", g.optString("me")); m.put("name", g.optString("name"));
                m.put("ts", System.currentTimeMillis()); m.put("lat", Math.round(lat * 1e5) / 1e5); m.put("lon", Math.round(lon * 1e5) / 1e5); m.put("acc", Math.round(acc));
                if (bat >= 0) { m.put("bat", bat % 1000); m.put("chg", bat >= 1000); }
                if (spd >= 0) m.put("spd", Math.round(spd * 10) / 10.0);
                http("POST", RELAY + g.getString("topic"), encrypt(g.getString("key"), m.toString().getBytes("UTF-8")).getBytes("UTF-8"), null, 20000);
            } catch (Exception e) { }
        }
    }

    /** Things your circle can be told about you, checked on every location fix in the background:
     *  leaving/arriving home or a saved place, low battery, starting to drive. Each circle chooses what it gets ("push"). */
    static void myEvents(Context ctx, double lat, double lon, float acc, float spd) {
        SharedPreferences p = prefs(ctx);
        if (!anySharing(p)) return;
        long now = System.currentTimeMillis();
        SharedPreferences.Editor ed = p.edit();
        // --- where am I: home, one of my places, or nowhere (with hysteresis so GPS wobble doesn't flip it) ---
        if (acc <= 100) try {
            JSONArray pl = new JSONArray();
            String hm = p.getString("homeLL", "");
            if (hm.contains(",")) { String[] a = hm.split(","); JSONObject h = new JSONObject(); h.put("n", "home"); h.put("lat", Double.parseDouble(a[0])); h.put("lon", Double.parseDouble(a[1])); h.put("r", 150); h.put("home", true); pl.put(h); }
            JSONArray mine = new JSONArray(p.getString("places", "[]"));
            for (int i = 0; i < mine.length(); i++) { JSONObject q = mine.getJSONObject(i); if (!q.optBoolean("home")) pl.put(q); }
            String at = p.getString("myAt", null), cand = "";
            double best = 1e9;
            for (int i = 0; i < pl.length(); i++) {
                JSONObject q = pl.getJSONObject(i);
                double d = Math.hypot((lat - q.getDouble("lat")) * 111320, (lon - q.getDouble("lon")) * 111320 * Math.cos(Math.toRadians(lat)));
                double r = q.optDouble("r", 150);
                boolean inside = q.getString("n").equals(at) ? d < r + 120 : d < r && acc < 80;   // leave only well outside
                if (inside && d < best) { best = d; cand = q.getString("n"); }
            }
            if (at == null) ed.putString("myAt", cand);                                            // first fix: just remember
            else if (!cand.equals(at)) {
                String pend = p.getString("myAtPend", "");
                int n = pend.equals(cand) ? p.getInt("myAtN", 0) + 1 : 1;
                if (n >= 2) {                                                                       // confirmed by two fixes in a row
                    ed.putString("myAt", cand).putString("myAtPend", "").putInt("myAtN", 0);
                    if (!at.isEmpty()) pushEvent(ctx, p, "home".equals(at) ? "home" : "places", "leave", at);
                    if (!cand.isEmpty()) pushEvent(ctx, p, "home".equals(cand) ? "home" : "places", "arrive", cand);
                } else ed.putString("myAtPend", cand).putInt("myAtN", n);
            } else ed.putString("myAtPend", "").putInt("myAtN", 0);
        } catch (Exception e) { }
        // --- battery low (once per discharge) ---
        int bat = battery(ctx);
        if (bat >= 0) {
            int lvl = bat % 1000; boolean chg = bat >= 1000;
            if (!chg && lvl <= 15 && !p.getBoolean("batSent", false)) { ed.putBoolean("batSent", true); pushEvent(ctx, p, "battery", "battery", String.valueOf(lvl)); }
            if (chg || lvl >= 30) ed.putBoolean("batSent", false);
        }
        // --- started driving: faster than ~30 km/h on two fixes, at most once per 30 min after being still ---
        if (spd >= 0) {
            int fast = spd > 8.5 ? p.getInt("fastN", 0) + 1 : 0;
            ed.putInt("fastN", fast);
            if (spd < 1.5) ed.putLong("stillAt", now);
            if (fast == 2 && now - p.getLong("driveSent", 0) > 30 * 60000 && now - p.getLong("stillAt", 0) < 20 * 60000) { ed.putLong("driveSent", now); pushEvent(ctx, p, "drive", "drive", ""); }
        }
        ed.apply();
    }

    static void pushEvent(Context ctx, SharedPreferences p, String kind, String ev, String place) {
        if (!allow(ctx, 225)) return;
        JSONArray gs = groups(p);
        for (int i = 0; i < gs.length(); i++) {
            JSONObject g = gs.optJSONObject(i);
            if (g == null || !g.optBoolean("share")) continue;
            JSONObject push = g.optJSONObject("push");
            if (push == null || !push.optBoolean(kind)) continue;
            try {
                JSONObject m = new JSONObject();
                m.put("v", 1); m.put("ver", "1.16"); m.put("ty", "event"); m.put("ev", ev); m.put("kind", kind); m.put("place", place);
                m.put("from", g.optString("me")); m.put("name", g.optString("name")); m.put("ts", System.currentTimeMillis());
                http("POST", RELAY + g.getString("topic"), encrypt(g.getString("key"), m.toString().getBytes("UTF-8")).getBytes("UTF-8"), null, 20000);
            } catch (Exception e) { }
        }
    }

    static String[] eventText(JSONObject env, String name) {
        String ev = env.optString("ev"), pl = env.optString("place"), kind = env.optString("kind");
        if ("battery".equals(ev)) return new String[]{"🪫 " + name + "'s battery is low", pl + "% left. They may go offline soon."};
        if ("drive".equals(ev)) return new String[]{"🚗 " + name + " started driving", "Just now"};
        boolean home = "home".equals(kind);
        if ("leave".equals(ev)) return new String[]{(home ? "🏠 " : "🚶 ") + name + " left " + (home ? "home" : pl), "Just now"};
        if ("arrive".equals(ev)) return new String[]{(home ? "🏠 " : "📍 ") + name + (home ? " arrived home" : " arrived at " + pl), "Just now"};
        return null;
    }

    /** "Sam arrived at B&B" / "Sam left B&B" for the places you saved (radius ~150 m). */
    static void placeAlert(Context ctx, SharedPreferences p, JSONObject env) {
        if (!p.getBoolean("placeAlerts", true)) return;
        try {
            JSONArray pl = new JSONArray(p.getString("places", "[]"));
            double lat = env.getDouble("lat"), lon = env.getDouble("lon");
            String now = "";
            for (int i = 0; i < pl.length(); i++) {
                JSONObject q = pl.getJSONObject(i);
                double d = Math.hypot((lat - q.getDouble("lat")) * 111320, (lon - q.getDouble("lon")) * 111320 * Math.cos(Math.toRadians(lat)));
                if (d < q.optDouble("r", 150)) { now = q.getString("n"); break; }
            }
            String key = "in:" + env.optString("from"), was = p.getString(key, null);
            boolean recentEvent = System.currentTimeMillis() - p.getLong("evAt:" + env.optString("from"), 0) < 15 * 60000;
            p.edit().putString(key, now).apply();
            if (was == null || was.equals(now) || recentEvent) return;   // first sighting, no change, or they already told us
            String name = env.optString("name", "Someone");
            if (!now.isEmpty()) AlarmReceiver.show(ctx, "plc:" + env.optString("from") + now, "📍 " + name + " arrived at " + now, "Just now", true);
            else AlarmReceiver.show(ctx, "plc:" + env.optString("from") + was, "🚶 " + name + " left " + was, "Just now", true);
        } catch (Exception e) { }
    }

    /** Checks the relay for new group messages and shows a notification for each (works while the app is closed). */
    static void pollAndNotify(Context ctx) {
        SharedPreferences p = prefs(ctx);
        if (!p.getBoolean("notify", true)) return;
        JSONArray gs = groups(p);
        for (int i = 0; i < gs.length(); i++) {
            JSONObject g = gs.optJSONObject(i);
            if (g != null) pollGroup(ctx, p, g, gs.length() > 1);
        }
    }

    static void pollGroup(Context ctx, SharedPreferences p, JSONObject g, boolean many) {
        String topic = g.optString("topic", null), key = g.optString("key", null), me = g.optString("me", "");
        if (topic == null || key == null) return;
        String gl = many && g.optString("gname").length() > 0 ? " (" + g.optString("gname") + ")" : "";
        String since = p.getString("lastNote:" + topic, p.getString("lastNote", "6h"));
        try {
            String txt = http("GET", RELAY + topic + "/json?poll=1&since=" + since, null, null, 20000);
            String last = null;
            for (String line : txt.split("\n")) {
                line = line.trim(); if (line.isEmpty()) continue;
                JSONObject o = new JSONObject(line);
                if (!"message".equals(o.optString("event"))) continue;
                last = o.optString("id", last);
                try {
                    JSONObject env = new JSONObject(new String(decrypt(key, o.optString("message")), "UTF-8"));
                    if (me.equals(env.optString("from"))) continue;
                    String ty = env.optString("ty"), name = env.optString("name", "Your group") + gl, cap = env.optString("cap", "");
                    String title = null, text = null;
                    if ("loc".equals(ty)) { placeAlert(ctx, p, env); continue; }
                    if ("event".equals(ty)) {
                        if (System.currentTimeMillis() - env.optLong("ts", 0) > 3 * 3600000L) continue;   // too old to matter
                        String[] t = eventText(env, name); if (t == null) continue;
                        p.edit().putLong("evAt:" + env.optString("from"), System.currentTimeMillis()).apply();
                        AlarmReceiver.show(ctx, "ev:" + o.optString("id"), t[0], t[1], true); continue;
                    }
                    if ("locreq".equals(ty)) {
                        if (System.currentTimeMillis() - env.optLong("ts", 0) > 30 * 60000) continue;   // old request
                        if (p.getBoolean("sharing", false) && g.optBoolean("share")) {
                            String[] ll = p.getString("lastLoc", "").split(",");
                            if (ll.length >= 3) try { sendLocation(ctx, Double.parseDouble(ll[0]), Double.parseDouble(ll[1]), Float.parseFloat(ll[2]), -1, topic); } catch (Exception ignored) {}
                            continue;
                        }
                        title = "📍 " + name + " asks where you are"; text = "Open the app and switch on “Share my live location” in Group.";
                    }
                    if ("sos".equals(ty)) { title = "🆘 " + name + " needs help"; text = cap.isEmpty() ? "Open the app to see where they are." : cap; }
                    else if ("checkin".equals(ty)) { title = "✅ " + name; text = cap.isEmpty() ? "Checked in: all OK" : cap; }
                    else if ("voice".equals(ty)) { title = "🎙 " + name + " sent a voice note"; text = "Open the app to hear it (it plays by itself)."; }
                    else if ("photo".equals(ty)) { title = "📷 " + name + " added a photo"; text = cap.isEmpty() ? "Open the album to see it." : cap; }
                    else if ("text".equals(ty)) { title = "💬 " + name; text = cap; }
                    else if ("hello".equals(ty)) { title = "👋 " + name + " joined your travel group"; text = "You can now see each other on the map when location sharing is on."; }
                    if (title != null) AlarmReceiver.show(ctx, "grp:" + o.optString("id"), title, text, true);
                } catch (Exception notOurs) { }
            }
            if (last != null) p.edit().putString("lastNote:" + topic, last).apply();
        } catch (Exception e) { }
    }
}
