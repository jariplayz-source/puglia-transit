package it.puglia.transit;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

public class MainActivity extends Activity implements LocationListener, SensorEventListener {
    private static final int REQ_LOC = 1;
    private WebView web;
    private LocationManager lm;
    private SensorManager sm;
    private boolean gpsWanted = false;
    ToolsBridge tools;
    private long lastHeadingPush = 0;
    private final float[] rot = new float[9];
    private final float[] ori = new float[3];

    /** Called from the page: window.AndroidGPS.start() */
    private boolean fastGps = false;
    /** The compass sensor only runs while the map or the compass tool is on screen (saves battery). */
    private boolean headingWanted = false;
    private volatile boolean skyWanted = false; private long skyAt = 0; private final float[] sky9 = new float[9];
    /** Battery saver (set from the page): slower GPS, fewer background jobs. */
    boolean lowPower() { return getSharedPreferences("app", 0).getBoolean("lowpower", false); }
    private boolean paused = false, bgBusy = false;

    public class Bridge {
        @JavascriptInterface
        public void start() {
            runOnUiThread(new Runnable() { public void run() { gpsWanted = true; startLocation(); } });
        }
        /** Walking mode: GPS every second and keep the screen on. */
        @JavascriptInterface
        public void walking(final boolean on) {
            runOnUiThread(new Runnable() { public void run() {
                if (on) getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                fastGps = on;
                if (gpsWanted) { stopLocation(); startLocation(); }
            }});
        }
        /** Turn the compass sensor on only while something on screen needs it. */
        @JavascriptInterface
        public void heading(final boolean on) {
            runOnUiThread(new Runnable() { public void run() {
                final boolean changed = on != headingWanted;
                headingWanted = on;
                if (!changed) return;
                try { sm.unregisterListener(MainActivity.this); } catch (Exception e) { }
                if (paused) return;
                if (gpsWanted) { try { lm.removeUpdates(MainActivity.this); } catch (Exception e) { } startLocation(); }   // map on screen: GPS every second, else every 3 (startLocation also starts the compass)
                else if (on) { Sensor rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR); if (rv != null) sm.registerListener(MainActivity.this, rv, SensorManager.SENSOR_DELAY_GAME); }
            }});
        }
        /** Star map: send the phone's full orientation to the page while it's open (the compass sensor must be on too). */
        @JavascriptInterface public void sky(boolean on) { skyWanted = on;
            if (on) try {   // magnetic north isn't true north: work out the difference here even if the map's GPS isn't running
                android.location.Location l = best;
                if (l == null) for (String pv : new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER}) { try { android.location.Location k = lm.getLastKnownLocation(pv); if (k != null && (l == null || k.getTime() > l.getTime())) l = k; } catch (Exception ignored) {} }
                if (l != null) { decl = new android.hardware.GeomagneticField((float) l.getLatitude(), (float) l.getLongitude(), (float) (l.hasAltitude() ? l.getAltitude() : 0), System.currentTimeMillis()).getDeclination(); declAt = System.currentTimeMillis(); }
            } catch (Exception ignored) { }
        }
        /** Is the phone in dark mode? */
        /** true when the user allowed "Precise location" (Android 12+ can give approximate only). */
        @JavascriptInterface
        public boolean precise() {
            return Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }
        @JavascriptInterface
        public boolean gpsOn() {
            try { return lm.isProviderEnabled(LocationManager.GPS_PROVIDER); } catch (Exception e) { return true; }
        }
        @JavascriptInterface
        public void askPrecise() {
            runOnUiThread(new Runnable() { public void run() {
                if (Build.VERSION.SDK_INT >= 23 && !precise())
                    requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOC);
                else openLocSettings();
            }});
        }
        @JavascriptInterface
        public void appSettings() {
            runOnUiThread(new Runnable() { public void run() {
                try { startActivity(new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) {}
            }});
        }
        @JavascriptInterface
        public boolean isNight() {
            int m = getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK;
            return m == android.content.res.Configuration.UI_MODE_NIGHT_YES;
        }
        /** Colour the status and navigation bars to match the app. */
        @JavascriptInterface
        public void setBars(final String color, final boolean light) {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    int c = android.graphics.Color.parseColor(color);
                    Window w = getWindow();
                    if (Build.VERSION.SDK_INT >= 21) { w.setStatusBarColor(c); w.setNavigationBarColor(c); }
                    if (Build.VERSION.SDK_INT >= 23) {
                        int f = w.getDecorView().getSystemUiVisibility();
                        f = light ? (f | 0x00002000) : (f & ~0x00002000);          // light status bar icons
                        if (Build.VERSION.SDK_INT >= 26) f = light ? (f | 0x00000010) : (f & ~0x00000010); // light nav bar
                        w.getDecorView().setSystemUiVisibility(f);
                    }
                } catch (Exception e) { }
            }});
        }
    }


    /* ---------- Live check: Trenitalia journey search (public website endpoints) ---------- */
    private static final String LF = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website";
    private final Map<String, Long> stationIds = new HashMap<String, Long>();

    public class Live {
        /** Trains between any two stations, from now on (today only), for the departures card. */
        @JavascriptInterface
        public void trip(final String fromQuery, final String toQuery, final String key) {
            new Thread(new Runnable() { public void run() {
                JSONObject res = new JSONObject();
                try {
                    res = search(fromQuery, toQuery, true);
                } catch (Exception e) {
                    try { res.put("ok", false); res.put("error", friendly(e)); } catch (Exception ignored) {}
                }
                final String js = "window.onTripResult&&window.onTripResult(" + JSONObject.quote(key) + "," + res.toString() + ")";
                web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
            }}).start();
        }
        @JavascriptInterface
        public void lastBack(final String fromQuery, final String key) {
            new Thread(new Runnable() { public void run() {
                JSONObject res = new JSONObject();
                try {
                    res = searchToBrindisi(fromQuery);
                } catch (Exception e) {
                    try { res.put("ok", false); res.put("error", friendly(e)); } catch (Exception ignored) {}
                }
                final String js = "window.onLiveResult&&window.onLiveResult(" + JSONObject.quote(key) + "," + res.toString() + ")";
                web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
            }}).start();
        }
    }

    private String friendly(Exception e) {
        String m = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        if (e instanceof java.net.UnknownHostException) return "No internet connection";
        if (e instanceof java.net.SocketTimeoutException) return "Trenitalia didn't answer in time";
        return "Couldn't get times (" + m + ")";
    }

    private String http(String method, String url, String body) throws Exception {
        OfflineLink.need();
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000); c.setReadTimeout(12000);
        c.setRequestMethod(method);
        c.setRequestProperty("Accept", "application/json");
        c.setRequestProperty("Accept-Language", "en");
        if (body != null) {
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            OutputStream os = c.getOutputStream(); os.write(body.getBytes("UTF-8")); os.close();
        }
        int code = c.getResponseCode();
        if (code == 429) throw new Exception("too many requests, try again in a minute");
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
        InputStream in = c.getInputStream();
        ByteArrayOutputStream bo = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
        while ((n = in.read(b)) > 0) bo.write(b, 0, n);
        in.close(); c.disconnect();
        return bo.toString("UTF-8");
    }

    private long stationId(String q) throws Exception {
        Long cached = stationIds.get(q); if (cached != null) return cached;
        JSONArray arr = new JSONArray(http("GET", LF + "/locations/search?name=" + URLEncoder.encode(q, "UTF-8") + "&limit=10", null));
        long best = -1; String ql = q.toLowerCase(Locale.ITALIAN);
        for (int i = 0; i < arr.length() && best < 0; i++) {          // 1) exact name
            JSONObject o = arr.getJSONObject(i);
            if (o.optString("name").toLowerCase(Locale.ITALIAN).equals(ql)) best = o.getLong("id");
        }
        for (int i = 0; i < arr.length() && best < 0; i++) {          // 2) Leuca special case
            JSONObject o = arr.getJSONObject(i);
            if (ql.startsWith("gagliano") && o.optString("name").toLowerCase(Locale.ITALIAN).contains("leuca")) best = o.getLong("id");
        }
        for (int i = 0; i < arr.length() && best < 0; i++) {          // 3) starts with the name
            JSONObject o = arr.getJSONObject(i);
            if (o.optString("name").toLowerCase(Locale.ITALIAN).startsWith(ql)) best = o.getLong("id");
        }
        if (best < 0 && arr.length() > 0) best = arr.getJSONObject(0).getLong("id");
        if (best < 0) throw new Exception("station " + q + " not found");
        stationIds.put(q, best);
        return best;
    }

    private JSONObject searchToBrindisi(String fromQuery) throws Exception { return search(fromQuery, "Brindisi", false); }

    private JSONObject search(String fromQuery, String toQuery, boolean fromNow) throws Exception {
        long from = stationId(fromQuery), to = stationId(toQuery);
        TimeZone tz = TimeZone.getTimeZone("Europe/Rome");
        Calendar now = Calendar.getInstance(tz);
        SimpleDateFormat day = new SimpleDateFormat("yyyy-MM-dd", Locale.US); day.setTimeZone(tz);
        String today = day.format(now.getTime());
        String start = today + "T" + String.format(Locale.US, "%02d", now.get(Calendar.HOUR_OF_DAY)) + ":" + (fromNow ? String.format(Locale.US, "%02d", now.get(Calendar.MINUTE)) : "00") + ":00.000";
        List<JSONObject> out = new ArrayList<JSONObject>();
        java.util.HashSet<String> seen = new java.util.HashSet<String>();
        for (int offset = 0; offset < (fromNow ? 20 : 60); offset += 10) {
            JSONObject body = new JSONObject();
            body.put("departureLocationId", from); body.put("arrivalLocationId", to);
            body.put("departureTime", start); body.put("adults", 1); body.put("children", 0);
            JSONObject crit = new JSONObject();
            crit.put("frecceOnly", false); crit.put("regionalOnly", false); crit.put("intercityOnly", false);
            crit.put("tourismOnly", false); crit.put("noChanges", false); crit.put("order", "DEPARTURE_DATE");
            crit.put("offset", offset); crit.put("limit", 10);
            body.put("criteria", crit);
            JSONObject adv = new JSONObject(); adv.put("bestFare", false); body.put("advancedSearchRequest", adv);
            JSONObject data = new JSONObject(http("POST", LF + "/ticket/solutions", body.toString()));
            JSONArray sols = data.optJSONArray("solutions");
            if (sols == null) break;
            boolean nextDay = false;
            for (int i = 0; i < sols.length(); i++) {
                JSONObject s = sols.getJSONObject(i).optJSONObject("solution");
                if (s == null) continue;
                String dep = s.optString("departureTime"), arr = s.optString("arrivalTime");
                if (dep.length() < 16) continue;
                if (dep.substring(0, 10).compareTo(today) > 0) { nextDay = true; continue; }
                if (dep.substring(0, 10).compareTo(today) < 0) continue;
                if (!seen.add(dep + arr)) continue;
                JSONArray nodes = s.optJSONArray("nodes");
                StringBuilder legs = new StringBuilder(); String o0num = "";
                int n = nodes == null ? 0 : nodes.length();
                JSONArray legArr = new JSONArray();
                for (int k = 0; k < n; k++) {
                    JSONObject nd = nodes.getJSONObject(k);
                    JSONObject t = nd.optJSONObject("train");
                    JSONObject lg = new JSONObject();
                    lg.put("from", nd.optString("origin", "")); lg.put("to", nd.optString("destination", ""));
                    String ld = nd.optString("departureTime", ""), la = nd.optString("arrivalTime", "");
                    lg.put("dep", ld.length() >= 16 ? ld.substring(11, 16) : ""); lg.put("arr", la.length() >= 16 ? la.substring(11, 16) : "");
                    if (t != null) {
                        lg.put("acr", t.optString("acronym", "")); lg.put("num", t.optString("name", ""));
                        lg.put("desc", t.optString("description", "")); lg.put("cat", t.optString("trainCategory", ""));
                        lg.put("by", t.optString("denomination", ""));
                    }
                    legArr.put(lg);
                    String name = t == null ? "" : (t.optString("acronym", "") + " " + t.optString("name", "")).trim();
                    if (name.length() == 0 && t != null) name = t.optString("description", "");
                    if (legs.length() > 0) legs.append(" + ");
                    legs.append(name);
                    if (k == 0 && t != null) o0num = t.optString("name", "");
                }
                JSONObject o = new JSONObject();
                o.put("dep", dep.substring(11, 16)); o.put("arr", arr.length() >= 16 ? arr.substring(11, 16) : "?");
                o.put("changes", Math.max(0, n - 1)); o.put("legs", legs.toString()); o.put("num", o0num);
                o.put("dur", s.optString("duration", ""));
                o.put("legList", legArr);
                out.add(o);
            }
            if (sols.length() < 10 || nextDay) break;
        }
        JSONObject res = new JSONObject();
        JSONArray list = new JSONArray();
        java.util.Collections.sort(out, new java.util.Comparator<JSONObject>() {
            public int compare(JSONObject a, JSONObject b) { return a.optString("dep").compareTo(b.optString("dep")); }
        });
        for (JSONObject o : out) list.put(o);
        res.put("ok", true); res.put("list", list);
        return res;
    }



    /* ---------- Online helper for the page (search, nearby places, walking routes) ---------- */
    public class Net {
        @JavascriptInterface
        public void get(final String reqId, final String url) {
            new Thread(new Runnable() { public void run() {
                String js;
                try {
                    OfflineLink.need();
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setConnectTimeout(10000); c.setReadTimeout(40000);
                    if (url.contains("transitous.org")) {
                        c.setRequestProperty("User-Agent", "OutAndBack/1.31 (+https://github.com/jariplayz-source/puglia-transit)");
                        c.setRequestProperty("Accept", "application/json");
                    } else if (url.contains("viaggiatreno.it")) {
                        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36");
                        c.setRequestProperty("Accept", "*/*");
                        c.setRequestProperty("Referer", "https://www.viaggiatreno.it/infomobilita/index.jsp");
                    } else {
                        c.setRequestProperty("User-Agent", "OutAndBack/1.31 (+https://github.com/jariplayz-source/puglia-transit)");
                        c.setRequestProperty("Accept", "application/json");
                    }
                    int code = c.getResponseCode();
                    InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                    ByteArrayOutputStream bo = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
                    if (in != null) { while ((n = in.read(b)) > 0) bo.write(b, 0, n); in.close(); }
                    c.disconnect();
                    String body = bo.toString("UTF-8");
                    if (code >= 400) body = "server said " + code + (code == 429 ? " (too busy, try again in a minute)" : code >= 500 ? " (server busy)" : "");
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + "," + (code < 400) + "," + JSONObject.quote(body) + ")";
                } catch (Exception e) {
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",false," + JSONObject.quote(friendly(e)) + ")";
                }
                js(js);
            }}).start();
        }
        /** POST a form (used for OpenStreetMap queries, which are too long or get refused as GET). */
        @JavascriptInterface
        public void post(final String reqId, final String url, final String form) {
            new Thread(new Runnable() { public void run() {
                String js;
                try {
                    OfflineLink.need();
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setConnectTimeout(10000); c.setReadTimeout(60000);
                    c.setRequestMethod("POST"); c.setDoOutput(true);
                    c.setRequestProperty("User-Agent", "OutAndBack/1.31 (+https://github.com/jariplayz-source/puglia-transit)");
                    c.setRequestProperty("Accept", "application/json,*/*");
                    c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                    byte[] out = form.getBytes("UTF-8"); c.setFixedLengthStreamingMode(out.length);
                    java.io.OutputStream os = c.getOutputStream(); os.write(out); os.close();
                    int code = c.getResponseCode();
                    InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                    ByteArrayOutputStream bo = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
                    if (in != null) { while ((n = in.read(b)) > 0) bo.write(b, 0, n); in.close(); }
                    c.disconnect();
                    String body = bo.toString("UTF-8");
                    if (code >= 400) body = "server said " + code + (code == 429 ? " (too busy, try again in a minute)" : code >= 500 ? " (server busy)" : "");
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + "," + (code < 400) + "," + JSONObject.quote(body) + ")";
                } catch (Exception e) {
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",false," + JSONObject.quote(friendly(e)) + ")";
                }
                js(js);
            }}).start();
        }
        @JavascriptInterface
        public void sleep(final String reqId, final int ms) {
            new Thread(new Runnable() { public void run() {
                try { Thread.sleep(Math.max(0, Math.min(ms, 120000))); } catch (Exception e) { }
                js("window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",true,\"\")");
            }}).start();
        }
        /** Follows redirects (e.g. maps.app.goo.gl short links) and returns the final URL. */
        @JavascriptInterface
        public void resolve(final String reqId, final String url) {
            new Thread(new Runnable() { public void run() {
                String js;
                try {
                    String u = url;
                    for (int i = 0; i < 6; i++) {
                        OfflineLink.need();
                        HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
                        c.setInstanceFollowRedirects(false); c.setConnectTimeout(7000); c.setReadTimeout(10000);
                        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Android) OutAndBack/1.31 (+https://github.com/jariplayz-source/puglia-transit)");
                        int code = c.getResponseCode(); String loc = c.getHeaderField("Location"); c.disconnect();
                        if (code >= 300 && code < 400 && loc != null) u = new URL(new URL(u), loc).toString(); else break;
                    }
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",true," + JSONObject.quote(u) + ")";
                } catch (Exception e) {
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",false," + JSONObject.quote(friendly(e)) + ")";
                }
                js(js);
            }}).start();
        }
    }

    /** Travel group: encryption, relay, live location sharing, album files, sharing with other apps. */
    /** Updates from the app's GitHub page: download the new APK, check it, hand it to Android's installer. */
    public class Updater {
        // small flags kept by Android itself, so they survive even if the web page's storage isn't ready or got lost
        @JavascriptInterface public boolean flag(String k) { return getSharedPreferences("app", 0).getBoolean("f:" + k, false); }
        @JavascriptInterface public void setFlag(String k) { getSharedPreferences("app", 0).edit().putBoolean("f:" + k, true).apply(); }
        /** Opens the file picker on Downloads so you can tick old Out & Back installers; they're deleted right away. */
        @JavascriptInterface public void pickOldApks() {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT); i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("application/vnd.android.package-archive"); i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    if (Build.VERSION.SDK_INT >= 26) i.putExtra(android.provider.DocumentsContract.EXTRA_INITIAL_URI, Uri.parse("content://com.android.externalstorage.documents/document/primary%3ADownload"));
                    startActivityForResult(i, REQ_OLDAPK);
                } catch (Exception e) { Toast.makeText(MainActivity.this, "Couldn't open your files", Toast.LENGTH_LONG).show(); }
            }});
        }
        @JavascriptInterface public int versionCode() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode; } catch (Exception e) { return 0; }
        }
        @JavascriptInterface public void download(final String url, final String sha, final String key) {
            new Thread(new Runnable() { public void run() {
                String err = null;
                try {
                    File d = new File(getCacheDir(), "share"); d.mkdirs();
                    File f = new File(d, "update.apk"), tmp = new File(d, "update.part");
                    OfflineLink.need();
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setConnectTimeout(15000); c.setReadTimeout(60000); c.setInstanceFollowRedirects(true);
                    c.setRequestProperty("User-Agent", "OutAndBack/1.31 (+https://github.com/jariplayz-source/puglia-transit)");
                    if (c.getResponseCode() != 200) throw new Exception("download server said " + c.getResponseCode());
                    long total = c.getContentLength(), got = 0; int lastPct = -1;
                    java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                    InputStream in = c.getInputStream(); java.io.FileOutputStream o = new java.io.FileOutputStream(tmp);
                    byte[] b = new byte[32768]; int n;
                    while ((n = in.read(b)) > 0) {
                        o.write(b, 0, n); md.update(b, 0, n); got += n;
                        int pct = total > 0 ? (int) (got * 100 / total) : -1;
                        if (pct != lastPct && pct % 5 == 0) { lastPct = pct; final String js = "window.onUpdateProgress&&window.onUpdateProgress(" + JSONObject.quote(key) + "," + pct + ")"; web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } }); }
                    }
                    o.close(); in.close();
                    StringBuilder hx = new StringBuilder(); for (byte x : md.digest()) hx.append(String.format("%02x", x));
                    if (sha != null && sha.length() == 64 && !sha.equalsIgnoreCase(hx.toString())) { tmp.delete(); throw new Exception("the download is damaged (checksum mismatch), try again"); }
                    if (f.exists()) f.delete();
                    if (!tmp.renameTo(f)) throw new Exception("couldn't save the update");
                } catch (Exception e) { err = e.getMessage() == null ? "download failed" : e.getMessage(); }
                final String js = "window.onUpdateDone&&window.onUpdateDone(" + JSONObject.quote(key) + "," + (err == null) + "," + JSONObject.quote(err == null ? "" : err) + ")";
                web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
            }}).start();
        }
        /** Returns "ok", "permission" (user must allow installing from this app first) or an error. */
        @JavascriptInterface public String install() {
            try {
                File f = new File(new File(getCacheDir(), "share"), "update.apk");
                if (!f.exists()) return "no downloaded update";
                if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
                    runOnUiThread(new Runnable() { public void run() {
                        try { startActivity(new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()))); } catch (Exception e) { }
                    }});
                    return "permission";
                }
                final Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(Uri.parse("content://" + ShareProvider.AUTH + "/update.apk"), "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                runOnUiThread(new Runnable() { public void run() { try { startActivity(i); } catch (Exception e) { Toast.makeText(MainActivity.this, "Couldn't open the installer", Toast.LENGTH_LONG).show(); } } });
                return "ok";
            } catch (Exception e) { return e.getMessage() == null ? "failed" : e.getMessage(); }
        }
    }

    /** Dutch road situation near points (NDW open data). */
    public class Road {
        @JavascriptInterface
        public void near(final String ptsJson, final double radiusKm, final String key) {
            new Thread(new Runnable() { public void run() {
                JSONObject res = new JSONObject();
                try { res = RoadInfo.near(new JSONArray(ptsJson), radiusKm, 40); }
                catch (Exception e) { try { res.put("ok", false); res.put("error", e.getMessage() == null ? "no answer" : e.getMessage()); } catch (Exception ignored) {} }
                final String js = "window.onRoadResult&&window.onRoadResult(" + JSONObject.quote(key) + "," + res.toString() + ")";
                web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
            }}).start();
        }
    }

    public class Group {
        @JavascriptInterface public String newKey() { return GroupCore.newKey(); }
        @JavascriptInterface public String newTopic() { return GroupCore.newTopic(); }
        @JavascriptInterface public String encrypt(String key, String text) { try { return GroupCore.encrypt(key, text.getBytes("UTF-8")); } catch (Exception e) { return ""; } }
        @JavascriptInterface public String decrypt(String key, String s) { try { return new String(GroupCore.decrypt(key, s), "UTF-8"); } catch (Exception e) { return ""; } }
        /** Settings the background parts need (relay topic, key, your id and name, notifications on/off). */
        @JavascriptInterface public void config(String json) {
            try {
                JSONObject o = new JSONObject(json);
                android.content.SharedPreferences.Editor ed = GroupCore.prefs(MainActivity.this).edit();
                JSONArray gs = o.optJSONArray("groups");
                if (gs == null) gs = new JSONArray();
                boolean any = gs.length() > 0, anyShare = false;
                if (any) {
                    JSONArray store = new JSONArray();
                    for (int i = 0; i < gs.length(); i++) {
                        JSONObject g = gs.getJSONObject(i);
                        if (g.optBoolean("share")) anyShare = true;
                        if (g.has("since") && g.optString("since").length() > 0) ed.putString("lastNote:" + g.getString("topic"), g.getString("since"));
                        g.remove("since"); store.put(g);
                    }
                    JSONObject first = gs.getJSONObject(0);
                    ed.putString("groups", store.toString()).putString("topic", first.getString("topic")).putString("key", first.getString("key"))
                      .putString("me", first.optString("me")).putString("name", first.optString("name")).putString("gname", first.optString("gname"))
                      .putBoolean("notify", o.optBoolean("notify", true)).putBoolean("sharing", anyShare);
                    if (o.has("places")) ed.putString("places", o.getJSONArray("places").toString());
                    if (o.has("home") && o.optJSONObject("home") != null) ed.putString("homeLL", o.getJSONObject("home").optDouble("lat") + "," + o.getJSONObject("home").optDouble("lon"));
                    else ed.remove("homeLL");
                    ed.putBoolean("placeAlerts", o.optBoolean("placeAlerts", true));
                } else {
                    boolean tr = GroupCore.prefs(MainActivity.this).getBoolean("tracking", false);
                    ed.clear(); ed.putBoolean("tracking", tr);
                }
                ed.apply();
                GroupPollJob.schedule(MainActivity.this, any && o.optBoolean("notify", true));
                restartService();
            } catch (Exception e) { }
        }
        @JavascriptInterface public void share(final boolean on) { GroupCore.prefs(MainActivity.this).edit().putBoolean("sharing", on).apply(); restartService(); }
        /** Journey: record your route in the background (stays on this phone). */
        @JavascriptInterface public void track(final boolean on) { GroupCore.prefs(MainActivity.this).edit().putBoolean("tracking", on).apply(); restartService(); }
        @JavascriptInterface public boolean tracking() { return GroupCore.prefs(MainActivity.this).getBoolean("tracking", false); }
        @JavascriptInterface public String trackCsv() {
            try { File f = new File(getFilesDir(), "track.csv"); if (!f.exists()) return ""; byte[] b = new byte[(int) f.length()]; java.io.FileInputStream in = new java.io.FileInputStream(f);
                  int o = 0, n; while (o < b.length && (n = in.read(b, o, b.length - o)) > 0) o += n; in.close(); return new String(b, "UTF-8"); } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public void clearTrack() { new File(getFilesDir(), "track.csv").delete(); }
        @JavascriptInterface public int battery() { return GroupCore.battery(MainActivity.this); }
        /** Offline link: messages that came in by text message or Bluetooth while there was no internet. */
        @JavascriptInterface public String inbox() { return OfflineLink.takeInbox(MainActivity.this); }
        @JavascriptInterface public boolean offline() { return !OfflineLink.online(MainActivity.this); }
        @JavascriptInterface public String relayStatus() { return GroupCore.relayStatus(MainActivity.this); }
        @JavascriptInterface public boolean btReady() { return OfflineLink.btAvailable(MainActivity.this); }
        @JavascriptInterface public boolean smsReady() { return Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED; }
        @JavascriptInterface public void askOfflinePerms(final boolean sms) {
            runOnUiThread(new Runnable() { public void run() {
                if (Build.VERSION.SDK_INT < 23) return;
                java.util.ArrayList<String> p = new java.util.ArrayList<String>();
                if (sms) { p.add(Manifest.permission.SEND_SMS); }
                if (Build.VERSION.SDK_INT >= 31) { p.add(Manifest.permission.BLUETOOTH_SCAN); p.add(Manifest.permission.BLUETOOTH_ADVERTISE); }
                java.util.ArrayList<String> need = new java.util.ArrayList<String>();
                for (String x : p) if (checkSelfPermission(x) != PackageManager.PERMISSION_GRANTED) need.add(x);
                if (!need.isEmpty()) requestPermissions(need.toArray(new String[0]), 77);
            }});
        }
        @JavascriptInterface public void fastShare(String topic, long until) { GroupCore.startFast(MainActivity.this, topic, until); }
        @JavascriptInterface public void askBySms(final String topic, final String phone) { new Thread(new Runnable() { public void run() { OfflineLink.askBySms(MainActivity.this, topic, phone); } }).start(); }
        @JavascriptInterface public boolean sharing() { return GroupCore.prefs(MainActivity.this).getBoolean("sharing", false); }
        /** Sends an encrypted message to the relay; big ones (photos, voice notes) go as an attachment with a small encrypted note. */
        @JavascriptInterface public void publish(final String reqId, final String topic, final String body, final String note) {
            new Thread(new Runnable() { public void run() {
                String js;
                try {
                    JSONObject hd = null;
                    if (note != null && note.length() > 0) { hd = new JSONObject(); hd.put("Filename", "m.bin"); hd.put("Message", note); }
                    String r = GroupCore.http(hd != null ? "PUT" : "POST", GroupCore.RELAY + topic, body.getBytes("UTF-8"), hd, 60000);
                    js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",true," + JSONObject.quote(r) + ")";
                } catch (Exception e) { js = "window.onNetResult&&window.onNetResult(" + JSONObject.quote(reqId) + ",false," + JSONObject.quote(String.valueOf(e.getMessage())) + ")"; }
                final String j = js; web.post(new Runnable() { public void run() { web.evaluateJavascript(j, null); } });
            }}).start();
        }
        @JavascriptInterface public boolean saveMedia(String name, String b64) {
            if (name.contains("/") || name.contains("..")) return false;
            try { java.io.FileOutputStream o = new java.io.FileOutputStream(new File(mediaDir(), name)); o.write(android.util.Base64.decode(b64, android.util.Base64.DEFAULT)); o.close(); return true; } catch (Exception e) { return false; }
        }
        @JavascriptInterface public String mediaB64(String name) {
            try { File f = new File(mediaDir(), name); byte[] b = new byte[(int) f.length()]; java.io.FileInputStream in = new java.io.FileInputStream(f); int o = 0, n; while (o < b.length && (n = in.read(b, o, b.length - o)) > 0) o += n; in.close();
                  return android.util.Base64.encodeToString(b, android.util.Base64.NO_WRAP); } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public void deleteMedia(String name) { if (!name.contains("/")) new File(mediaDir(), name).delete(); }
        @JavascriptInterface public void deleteAllMedia() { File[] fs = mediaDir().listFiles(); if (fs != null) for (File f : fs) f.delete(); }
        @JavascriptInterface public void shareText(final String text) {
            runOnUiThread(new Runnable() { public void run() {
                Intent i = new Intent(Intent.ACTION_SEND); i.setType("text/plain"); i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "Share"));
            }});
        }
        /** Writes a file (e.g. your trip summary page) and opens Android's share menu for it. */
        @JavascriptInterface public void shareFile(final String name, final String content, final String mime) {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    File d = new File(getCacheDir(), "share"); d.mkdirs();
                    File f = new File(d, name.replaceAll("[^A-Za-z0-9._-]", "_"));
                    java.io.FileOutputStream o = new java.io.FileOutputStream(f); o.write(content.getBytes("UTF-8")); o.close();
                    Uri u = Uri.parse("content://" + ShareProvider.AUTH + "/" + f.getName());
                    Intent i = new Intent(Intent.ACTION_SEND); i.setType(mime); i.putExtra(Intent.EXTRA_STREAM, u); i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(i, "Share your trip"));
                } catch (Exception e) { Toast.makeText(MainActivity.this, "Couldn't share: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
            }});
        }
    }

    /** Starts the location service when sharing or journey recording is on, stops it when both are off. */
    void restartService() {
        runOnUiThread(new Runnable() { public void run() {
            Intent i = new Intent(MainActivity.this, LocationShareService.class);
            android.content.SharedPreferences sp = GroupCore.prefs(MainActivity.this);
            boolean any = GroupCore.anySharing(sp) || sp.getBoolean("tracking", false);
            try {
                // Don't stop and restart: a running service just re-reads its settings. Stopping one that was
                // started a moment ago (before it reached the foreground) crashes the app on Android 12+.
                if (!any) { stopService(i); return; }
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED)
                    requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 79);
                if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i);
            } catch (Exception e) { Toast.makeText(MainActivity.this, "Couldn't start location: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
        }});
    }

    /** Planned notifications (shown even when the app is closed). */
    public class Notify {
        @JavascriptInterface public void schedule(String id, double when, String title, String text) {
            AlarmReceiver.schedule(MainActivity.this, id, (long) when, title, text);
        }
        @JavascriptInterface public void cancelPrefix(String prefix) { AlarmReceiver.cancelPrefix(MainActivity.this, prefix); }
        @JavascriptInterface public void now(String id, String title, String text) { AlarmReceiver.show(MainActivity.this, id, title, text, true); }
        @JavascriptInterface public void askPermission() {
            runOnUiThread(new Runnable() { public void run() {
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                    try { requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 78); } catch (Exception e) { }
                }
            }});
        }
    }

    /** Keeps downloads going while you use other apps (shows a notification). */
    public class Bg {
        private boolean asked = false;
        @JavascriptInterface public void start(final String text, final int cur, final int max) {
            runOnUiThread(new Runnable() { public void run() {
                if (Build.VERSION.SDK_INT >= 33 && !asked && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                    asked = true; try { requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 77); } catch (Exception e) { }
                }
                try {
                    bgBusy = true;
                    Intent i = new Intent(MainActivity.this, DownloadService.class);
                    i.putExtra("text", text); i.putExtra("cur", cur); i.putExtra("max", max);
                    if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i);
                } catch (Exception e) { /* not allowed right now (e.g. app in background): the download still runs while possible */ }
            }});
        }
        @JavascriptInterface public void stop() {
            runOnUiThread(new Runnable() { public void run() {
                try { stopService(new Intent(MainActivity.this, DownloadService.class)); } catch (Exception e) { }
                bgBusy = false; if (paused) { try { web.pauseTimers(); } catch (Exception e) { } }
            }});
        }
    }

    /* ---------- Offline street maps ---------- */
    private MapStore store;

    public class Maps {
        @JavascriptInterface public String summary() { return store.summary(); }
        @JavascriptInterface public void download(String id, String name, double w, double s, double e, double n, int minZ, int maxZ) {
            store.download(id, name, w, s, e, n, minZ, maxZ, new MapStore.Listener() {
                public void progress(String aid, String phase, int done, int total, long bytes) {
                    js("window.onMapProgress&&window.onMapProgress(" + JSONObject.quote(aid) + "," + JSONObject.quote(phase) + "," + done + "," + total + "," + bytes + ")");
                }
                public void finished(String aid, boolean ok, String msg) {
                    js("window.onMapDone&&window.onMapDone(" + JSONObject.quote(aid) + "," + ok + "," + JSONObject.quote(msg) + ")");
                }
            });
        }
        @JavascriptInterface public String delete(String id) { try { store.delete(id); return "ok"; } catch (Exception e) { return "error: " + e.getMessage(); } }
        @JavascriptInterface public void clearAll() { store.clearAll(); }
        @JavascriptInterface public void resetLive() { store.resetLive(); }
        @JavascriptInterface public String liveStatus() { String e = store.liveStatus(); return e.isEmpty() && Pmtiles.lastProblem != null ? Pmtiles.lastProblem : e; }
        @JavascriptInterface public String liveInfo() { return store.liveInfo(); }
    }

    private void js(final String code) {
        web.post(new Runnable() { public void run() { web.evaluateJavascript(code, null); } });
    }

    private static final int REQ_FILE = 501, REQ_MIC = 502, REQ_CAM = 503;
    private android.webkit.PermissionRequest camReq;
    private android.webkit.ValueCallback<Uri[]> fileCb;
    private android.webkit.PermissionRequest micReq;
    File mediaDir() { File d = new File(getFilesDir(), "media"); d.mkdirs(); return d; }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_OLDAPK) {   // old installers you picked: delete them
            int n = 0;
            if (res == RESULT_OK && data != null) {
                java.util.ArrayList<Uri> us = new java.util.ArrayList<Uri>();
                if (data.getClipData() != null) for (int i = 0; i < data.getClipData().getItemCount(); i++) us.add(data.getClipData().getItemAt(i).getUri());
                else if (data.getData() != null) us.add(data.getData());
                for (Uri u : us) { try { if (android.provider.DocumentsContract.deleteDocument(getContentResolver(), u)) n++; } catch (Exception e) { } }
            }
            final String js = "window.onOldApksDeleted&&window.onOldApksDeleted(" + n + ")";
            web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
            return;
        }
        if (req != REQ_FILE || fileCb == null) return;
        Uri[] out = null;
        if (res == RESULT_OK && data != null) {
            if (data.getClipData() != null) { int n = data.getClipData().getItemCount(); out = new Uri[n]; for (int i = 0; i < n; i++) out[i] = data.getClipData().getItemAt(i).getUri(); }
            else if (data.getData() != null) out = new Uri[]{data.getData()};
        }
        fileCb.onReceiveValue(out); fileCb = null;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i); setIntent(i);
        if (web != null) web.post(new Runnable() { public void run() { web.evaluateJavascript("window.onAppOpened&&window.onAppOpened()", null); } });
    }

    private WebResourceResponse serveLocal(String path) {
        Map<String, String> hdr = new HashMap<String, String>();
        hdr.put("Access-Control-Allow-Origin", "*");
        hdr.put("Cache-Control", "no-store");
        try {
            if (path.startsWith("/t/")) {
                String[] p = path.substring(3).split("/");
                byte[] data = store.tileOrLive(Integer.parseInt(p[0]), Integer.parseInt(p[1]), Integer.parseInt(p[2]));
                return new WebResourceResponse("application/x-protobuf", null, 200, "OK", hdr, new ByteArrayInputStream(data == null ? new byte[0] : data));
            }
            if (path.startsWith("/media/")) {
                String n = path.substring(7);
                if (n.contains("/") || n.contains("..")) throw new Exception("bad name");
                File f = new File(mediaDir(), n);
                String mime = n.endsWith(".jpg") ? "image/jpeg" : n.endsWith(".webm") ? "audio/webm" : n.endsWith(".m4a") ? "audio/mp4" : "application/octet-stream";
                return new WebResourceResponse(mime, null, 200, "OK", hdr, new java.io.FileInputStream(f));
            }
            if (path.startsWith("/fonts/") || path.startsWith("/sprites/")) {
                String mime = path.endsWith(".png") ? "image/png" : path.endsWith(".json") ? "application/json" : "application/x-protobuf";
                try {
                    return new WebResourceResponse(mime, null, 200, "OK", hdr, getAssets().open("map" + path));
                } catch (IOException missing) {
                    return new WebResourceResponse(mime, null, 200, "OK", hdr, new ByteArrayInputStream(new byte[0]));
                }
            }
        } catch (Exception ignored) {}
        return new WebResourceResponse("text/plain", null, 404, "Not Found", hdr, new ByteArrayInputStream(new byte[0]));
    }

    static final int REQ_OLDAPK = 4711;

    /** Storage: remove the downloaded update once it's installed, half-finished downloads, and shared files older than a week. */
    static void cleanStorage(final Context c) {
        new Thread(new Runnable() { public void run() {
            try {
                File d = new File(c.getCacheDir(), "share");
                File apk = new File(d, "update.apk");
                if (apk.exists()) {
                    int have = c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
                    android.content.pm.PackageInfo pi = c.getPackageManager().getPackageArchiveInfo(apk.getPath(), 0);
                    if (pi == null || pi.versionCode <= have) apk.delete();
                }
                File[] fs = d.listFiles();
                if (fs != null) for (File f : fs) {
                    long age = System.currentTimeMillis() - f.lastModified();
                    if ((f.getName().endsWith(".part") && age > 3600000L) || (!f.getName().equals("update.apk") && age > 7 * 86400000L)) f.delete();
                }
            } catch (Exception e) { }
        }}).start();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        OfflineLink.APP = getApplicationContext();
        UpdateJob.schedule(getApplicationContext());
        GroupCore.init(this); try { BaroReceiver.schedule(this, ToolsBridge.prefs(this).getBoolean("baro:watch", false)); } catch (Exception e) { }
        super.onCreate(savedInstanceState);
        // keep a note of the last crash (shown in Settings → Diagnostics), then let Android handle it as usual
        final Thread.UncaughtExceptionHandler prev = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() { public void uncaughtException(Thread t, Throwable e) {
            try { java.io.StringWriter sw = new java.io.StringWriter(); e.printStackTrace(new java.io.PrintWriter(sw)); String st = sw.toString();
                  ToolsBridge.prefs(MainActivity.this).edit().putString("crash", new java.util.Date() + " · " + (st.length() > 1500 ? st.substring(0, 1500) : st)).commit(); } catch (Exception x) { }
            if (prev != null) prev.uncaughtException(t, e);
        }});
        cleanStorage(this);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        sm = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        store = new MapStore(this);

        web = new WebView(this);
        web.setBackgroundColor(0xFF0E4A52);   // matches the startup animation: no white flash
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " PugliaTransitApp");
        s.setMediaPlaybackRequiresUserGesture(false);   // voice notes from your group play by themselves
        web.addJavascriptInterface(new Bridge(), "AndroidGPS");
        web.addJavascriptInterface(new Live(), "AndroidLive");
        web.addJavascriptInterface(new Maps(), "AndroidMaps");
        web.addJavascriptInterface(new Net(), "AndroidNet");
        web.addJavascriptInterface(new Bg(), "AndroidBg");
        web.addJavascriptInterface(new Notify(), "AndroidNotify");
        web.addJavascriptInterface(new Group(), "AndroidGroup");
        web.addJavascriptInterface(new Road(), "AndroidRoad");
        web.addJavascriptInterface(new Updater(), "AndroidUpdate");
        tools = new ToolsBridge(this); web.addJavascriptInterface(tools, "AndroidTools");
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                cb.invoke(origin, true, false);
            }
            /** Photo picker for the travel album. */
            @Override
            public boolean onShowFileChooser(WebView v, android.webkit.ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT); i.addCategory(Intent.CATEGORY_OPENABLE); i.setType("image/*");
                    i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                    startActivityForResult(Intent.createChooser(i, "Add photos"), REQ_FILE);
                } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
            /** Microphone for voice notes (asks Android the first time). */
            @Override
            public void onPermissionRequest(final android.webkit.PermissionRequest r) {
                runOnUiThread(new Runnable() { public void run() {
                    boolean audio = false, video = false; for (String res : r.getResources()) { if (android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) audio = true; if (android.webkit.PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) video = true; }
                    if (video && !audio) {   // the camera behind the star map
                        if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) { r.grant(r.getResources()); return; }
                        camReq = r; requestPermissions(new String[]{android.Manifest.permission.CAMERA}, REQ_CAM); return;
                    }
                    if (!audio) { r.deny(); return; }
                    if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) { r.grant(r.getResources()); return; }
                    micReq = r; requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                }});
            }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("tiles.local".equals(u.getHost())) return serveLocal(u.getPath());
                return null;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("file:///android_asset/")) return false;
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    if (url.startsWith("geo:")) {
                        // Let the user pick Organic Maps (offline) or Google Maps
                        startActivity(Intent.createChooser(i, "Open with"));
                    } else {
                        startActivity(i);
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this,
                        url.startsWith("geo:") ? "Install Organic Maps (see Info tab)" : "No app can open this link",
                        Toast.LENGTH_LONG).show();
                }
                return true;
            }
        });
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    private boolean hasLocPerm() {
        return Build.VERSION.SDK_INT < 23
            || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private void startLocation() {
        if (!hasLocPerm()) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOC);
            return;
        }
        try {
            boolean any = false;
            try { lm.removeUpdates(this); } catch (Exception ignored) {}
            for (String p : new String[]{"fused", LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
                if (lm.getAllProviders().contains(p) && lm.isProviderEnabled(p)) {
                    boolean gps = LocationManager.GPS_PROVIDER.equals(p) || "fused".equals(p);
                    boolean lp = lowPower();
                    boolean onMap = fastGps || headingWanted;   // the map (or walking) is on screen: as smooth as Google Maps
                    long every = gps ? (onMap ? (lp ? 3000 : 1000) : lp ? 10000 : 3000) : (lp ? 60000 : 10000);
                    lm.requestLocationUpdates(p, every, onMap ? 0 : lp ? 15 : 3, this);
                    Location last = lm.getLastKnownLocation(p);
                    if (last != null && System.currentTimeMillis() - last.getTime() < 120000) onLocationChanged(last);
                    any = true;
                }
            }
            if (!any) Toast.makeText(this, "Turn on Location in your phone settings", Toast.LENGTH_LONG).show();
        } catch (SecurityException e) {
            Toast.makeText(this, "Location permission needed", Toast.LENGTH_LONG).show();
        }
        if (headingWanted) { Sensor rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR); if (rv != null) sm.registerListener(this, rv, SensorManager.SENSOR_DELAY_GAME); }
    }

    private void openLocSettings() {
        try { startActivity(new Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS)); } catch (Exception ignored) {}
    }

    private void stopLocation() {
        try { lm.removeUpdates(this); } catch (Exception ignored) {}
        sm.unregisterListener(this);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_CAM && camReq != null) {
            if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) camReq.grant(camReq.getResources()); else camReq.deny();
            camReq = null; return;
        }
        if (code == REQ_MIC && micReq != null) {
            if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) micReq.grant(micReq.getResources()); else micReq.deny();
            micReq = null; return;
        }
        if (code == ToolsBridge.REQ_STEPS) { js("window.onStepsPerm&&window.onStepsPerm(" + (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) + ")"); return; }
        if (code == REQ_LOC) {
            if (hasLocPerm()) startLocation();
            else Toast.makeText(this, "Without location the map can't show where you are", Toast.LENGTH_LONG).show();
        }
    }

    private Location best = null;
    private double kLat, kLon, kVar = -1; private long kTime;

    /** Keep a new fix only if it is better than what we have: more accurate, or ours is getting old. */
    private boolean better(Location n) {
        if (best == null) return true;
        long dt = n.getTime() - best.getTime();
        if (dt > 12000) return true;                 // ours is stale
        if (dt < -2000) return false;                // older than ours
        float na = n.hasAccuracy() ? n.getAccuracy() : 999, ba = best.hasAccuracy() ? best.getAccuracy() : 999;
        if (na <= ba) return true;
        boolean sameSrc = n.getProvider() != null && n.getProvider().equals(best.getProvider());
        return sameSrc && na < ba * 1.6 && dt > 0;   // same source, a bit worse but newer: take it
    }

    @Override
    public void onLocationChanged(Location raw) {
        if (raw.hasAccuracy() && raw.getAccuracy() > 3000) return;
        if (!better(raw)) return;
        best = raw;
        // light Kalman filter: steadies the dot when the signal jitters, follows quickly when you move
        double acc = Math.max(raw.hasAccuracy() ? raw.getAccuracy() : 50, 3);
        long t = raw.getTime() > 0 ? raw.getTime() : System.currentTimeMillis();
        double speed = raw.hasSpeed() ? raw.getSpeed() : 0, q = Math.max(1.5, speed);
        if (kVar < 0 || Math.abs(raw.getLatitude() - kLat) * 111000 > acc * 4 + 60 || Math.abs(raw.getLongitude() - kLon) * 78000 > acc * 4 + 60) {
            kLat = raw.getLatitude(); kLon = raw.getLongitude(); kVar = acc * acc; kTime = t;
        } else {
            double dt = Math.max(0, (t - kTime) / 1000.0); kTime = t;
            kVar += dt * q * q;
            double k = kVar / (kVar + acc * acc);
            kLat += k * (raw.getLatitude() - kLat); kLon += k * (raw.getLongitude() - kLon);
            kVar = (1 - k) * kVar;
        }
        final Location l = raw;
        final double outAcc = Math.min(acc, Math.sqrt(kVar));
        final String js = "window.onNativeLocation&&window.onNativeLocation(" + kLat + ","
                + kLon + "," + Math.round(outAcc) + ","
                + (l.hasBearing() && l.hasSpeed() && l.getSpeed() > 0.7 ? l.getBearing() : -1) + ")";
        web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
    }
    @Override public void onStatusChanged(String p, int s, Bundle b) {}
    @Override public void onProviderEnabled(String p) {}
    @Override public void onProviderDisabled(String p) {}

    /* Compass like Google Maps: works flat and held upright, corrected from magnetic to true north,
       smoothed, and sent ~15 times a second only when it actually turned. */
    private final float[] rotUp = new float[9];
    private boolean upright = false;
    private double hSin = 0, hCos = 1, lastSentDeg = -999; private float decl = 0; private long declAt = 0;
    @Override
    public void onSensorChanged(SensorEvent e) {
        if (skyWanted) {   // star map: the whole orientation of the phone, about 30 times a second
            long t = System.currentTimeMillis();
            if (t - skyAt >= 33) { skyAt = t; SensorManager.getRotationMatrixFromVector(sky9, e.values);
                final String js = "window.onSky&&onSky([" + sky9[0] + "," + sky9[1] + "," + sky9[2] + "," + sky9[3] + "," + sky9[4] + "," + sky9[5] + "," + sky9[6] + "," + sky9[7] + "," + sky9[8] + "]," + decl + ")";
                web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } }); }
        }
        SensorManager.getRotationMatrixFromVector(rot, e.values);
        SensorManager.getOrientation(rot, ori);
        float[] m = rot;
        double pitch = Math.toDegrees(ori[1]);
        if (upright ? pitch > -35 : pitch < -55) upright = !upright;   // switch between flat and upright with some margin, so it can't flip back and forth
        if (upright) {   // phone held upright (screen facing you): use where the back of the phone points
            SensorManager.remapCoordinateSystem(rot, SensorManager.AXIS_X, SensorManager.AXIS_Z, rotUp);
            SensorManager.getOrientation(rotUp, ori); m = rotUp;
        }
        long now = System.currentTimeMillis();
        if (best != null && now - declAt > 600000) { declAt = now;
            try { decl = new android.hardware.GeomagneticField((float) best.getLatitude(), (float) best.getLongitude(), (float) (best.hasAltitude() ? best.getAltitude() : 0), now).getDeclination(); } catch (Exception x) { } }
        double a = ori[0] + Math.toRadians(decl);
        hSin = hSin * 0.75 + Math.sin(a) * 0.25; hCos = hCos * 0.75 + Math.cos(a) * 0.25;   // smooth on the circle (no jump at north)
        if (now - lastHeadingPush < 66) return;
        double deg = (Math.toDegrees(Math.atan2(hSin, hCos)) + 360) % 360;
        double d = Math.abs(((deg - lastSentDeg + 540) % 360) - 180);
        if (d < 0.8) return;
        lastHeadingPush = now; lastSentDeg = deg;
        final String js = "window.onNativeHeading&&window.onNativeHeading(" + Math.round(deg * 10) / 10.0 + ")";
        web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } });
    }
    @Override public void onAccuracyChanged(Sensor s, int a) {}

    /* In the background the page's timers stop (no polling, no redraws: that's battery). Group messages, location sharing
       and alerts keep working natively. Only while a download is running do the page's timers keep going. */
    @Override protected void onPause() { super.onPause(); paused = true; stopLocation(); if (tools != null) tools.torchOff(); if (!bgBusy) { try { web.pauseTimers(); } catch (Exception e) { } } }
    @Override protected void onResume() { super.onResume(); paused = false; try { web.resumeTimers(); } catch (Exception e) { } if (gpsWanted) startLocation(); else if (headingWanted) { Sensor rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR); if (rv != null) sm.registerListener(this, rv, SensorManager.SENSOR_DELAY_GAME); } }

    void clearWebCache() { runOnUiThread(new Runnable() { public void run() { try { web.clearCache(false); } catch (Exception e) { } } }); }
    @Override protected void onDestroy() { if (tools != null) tools.shutdown(); super.onDestroy(); }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
}
