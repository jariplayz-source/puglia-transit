package it.puglia.transit;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.SystemClock;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import java.util.Locale;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Phone tools for the survival guides: torch, barometer, step counter, speech, lock-screen card, battery.
 *  Every sensor is read once and switched off again, so nothing keeps running in the background. */
public class ToolsBridge {
    static final int REQ_STEPS = 4801;
    static final String CH_CARD = "card";
    private final Activity a;
    private TextToSpeech tts; private boolean ttsReady = false;
    private String torchId = null; private boolean torchOn = false;

    ToolsBridge(Activity a) { this.a = a; }
    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("app", 0); }

    // ---------- torch ----------
    private String torchCam() {
        if (torchId != null || Build.VERSION.SDK_INT < 23) return torchId;
        try {
            CameraManager cm = (CameraManager) a.getSystemService(Context.CAMERA_SERVICE);
            for (String id : cm.getCameraIdList()) {
                Boolean f = cm.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                if (f != null && f) { torchId = id; break; }
            }
        } catch (Exception e) { }
        return torchId;
    }
    @JavascriptInterface public boolean hasTorch() { return torchCam() != null; }
    @JavascriptInterface public boolean torch(boolean on) {
        String id = torchCam(); if (id == null) return false;
        try { ((CameraManager) a.getSystemService(Context.CAMERA_SERVICE)).setTorchMode(id, on); torchOn = on; return true; } catch (Exception e) { return false; }
    }
    void torchOff() { if (torchOn) torch(false); }

    // ---------- sensors: one reading, then off ----------
    static float readOnce(Context c, int type, long waitMs) {
        final SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        Sensor s = sm == null ? null : sm.getDefaultSensor(type); if (s == null) return -1;
        final float[] v = {-1}; final CountDownLatch done = new CountDownLatch(1);
        SensorEventListener l = new SensorEventListener() {
            public void onSensorChanged(SensorEvent e) { if (v[0] < 0) { v[0] = e.values[0]; done.countDown(); } }
            public void onAccuracyChanged(Sensor x, int y) { }
        };
        android.os.HandlerThread t = new android.os.HandlerThread("sensor1"); t.start();
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL, new android.os.Handler(t.getLooper()));
        try { done.await(waitMs, TimeUnit.MILLISECONDS); } catch (InterruptedException e) { }
        sm.unregisterListener(l); t.quitSafely();
        return v[0];
    }
    @JavascriptInterface public boolean hasPressure() { SensorManager sm = (SensorManager) a.getSystemService(Context.SENSOR_SERVICE); return sm != null && sm.getDefaultSensor(Sensor.TYPE_PRESSURE) != null; }
    @JavascriptInterface public float pressure() { float p = readOnce(a, Sensor.TYPE_PRESSURE, 2500); if (p > 0) BaroReceiver.store(a, p); return p; }
    @JavascriptInterface public String baroLog() { return prefs(a).getString("baro:log", "[]"); }
    @JavascriptInterface public boolean baroWatching() { return prefs(a).getBoolean("baro:watch", false); }
    @JavascriptInterface public void baroWatch(boolean on) { prefs(a).edit().putBoolean("baro:watch", on).apply(); BaroReceiver.schedule(a, on); }

    @JavascriptInterface public boolean hasSteps() { SensorManager sm = (SensorManager) a.getSystemService(Context.SENSOR_SERVICE); return sm != null && sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null; }
    @JavascriptInterface public boolean stepsAllowed() { return Build.VERSION.SDK_INT < 29 || a.checkSelfPermission("android.permission.ACTIVITY_RECOGNITION") == PackageManager.PERMISSION_GRANTED; }
    @JavascriptInterface public void askSteps() {
        a.runOnUiThread(new Runnable() { public void run() { if (Build.VERSION.SDK_INT >= 29) a.requestPermissions(new String[]{"android.permission.ACTIVITY_RECOGNITION"}, REQ_STEPS); } });
    }
    /** Steps since the phone started (the step chip counts by itself, also with the screen off, using almost no power). */
    @JavascriptInterface public float steps() { return stepsAllowed() ? readOnce(a, Sensor.TYPE_STEP_COUNTER, 3000) : -1; }

    // ---------- speech (offline voices) ----------
    @JavascriptInterface public void speak(final String text, final String lang) {
        a.runOnUiThread(new Runnable() { public void run() {
            final Runnable say = new Runnable() { public void run() {
                try { tts.setLanguage(Locale.forLanguageTag(lang)); tts.setSpeechRate(0.85f); tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "pt"); } catch (Exception e) { }
            }};
            if (tts != null && ttsReady) { say.run(); return; }
            tts = new TextToSpeech(a, new TextToSpeech.OnInitListener() { public void onInit(int st) { ttsReady = st == TextToSpeech.SUCCESS; if (ttsReady) say.run(); } });
        }});
    }
    void shutdown() { torchOff(); try { if (tts != null) tts.shutdown(); } catch (Exception e) { } tts = null; }

    // ---------- emergency card on the lock screen ----------
    @JavascriptInterface public void lockCard(final String title, final String text) {
        NotificationManager nm = (NotificationManager) a.getSystemService(Context.NOTIFICATION_SERVICE);
        if (text == null || text.isEmpty()) { nm.cancel(31); return; }
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            if (nm.getNotificationChannel(CH_CARD) == null) { NotificationChannel ch = new NotificationChannel(CH_CARD, "Emergency card", NotificationManager.IMPORTANCE_LOW); ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC); ch.setShowBadge(false); nm.createNotificationChannel(ch); }
            b = new Notification.Builder(a, CH_CARD);
        } else b = new Notification.Builder(a);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent open = new Intent(a, MainActivity.class); open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        b.setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle(title).setContentText(text.split("\n")[0])
         .setStyle(new Notification.BigTextStyle().bigText(text)).setOngoing(true).setShowWhen(false)
         .setVisibility(Notification.VISIBILITY_PUBLIC).setContentIntent(PendingIntent.getActivity(a, 31, open, fl));
        nm.notify(31, b.build());
    }

    // ---------- battery ----------
    @JavascriptInterface public String battery() {
        try {
            Intent i = a.registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            int lv = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1), sc = i.getIntExtra(BatteryManager.EXTRA_SCALE, 100), st = i.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
            boolean chg = st == BatteryManager.BATTERY_STATUS_CHARGING || st == BatteryManager.BATTERY_STATUS_FULL;
            return "{\"pct\":" + Math.round(lv * 100f / sc) + ",\"chg\":" + chg + "}";
        } catch (Exception e) { return "{}"; }
    }
    /** Battery saver: slower GPS and location sharing (read by the location code each time it starts). */
    @JavascriptInterface public void lowPower(boolean on) {
        boolean was = prefs(a).getBoolean("lowpower", false); if (was == on) return;
        prefs(a).edit().putBoolean("lowpower", on).apply();
        GroupCore.prefs(a).edit().putBoolean("lowpower", on).apply();
        try { if (GroupCore.anySharing(GroupCore.prefs(a)) || GroupCore.prefs(a).getBoolean("tracking", false)) {
            Intent i = new Intent(a, LocationShareService.class); i.putExtra("reprov", true);
            if (Build.VERSION.SDK_INT >= 26) a.startForegroundService(i); else a.startService(i);
        } } catch (Exception e) { }
    }

    // ---------- storage ----------
    static long sizeOf(java.io.File f) { if (f == null || !f.exists()) return 0; if (f.isFile()) return f.length(); long n = 0; java.io.File[] k = f.listFiles(); if (k != null) for (java.io.File x : k) n += sizeOf(x); return n; }
    @JavascriptInterface public String storage() {
        java.io.File media = new java.io.File(a.getFilesDir(), "media"), track = new java.io.File(a.getFilesDir(), "track.csv");
        java.io.File[] ms = media.listFiles();
        return "{\"media\":" + sizeOf(media) + ",\"mediaN\":" + (ms == null ? 0 : ms.length) + ",\"track\":" + sizeOf(track)
            + ",\"cache\":" + sizeOf(a.getCacheDir()) + ",\"files\":" + sizeOf(a.getFilesDir()) + ",\"free\":" + a.getFilesDir().getUsableSpace() + "}";
    }
    /** Delete photo / voice files that no album uses any more (older than a day, so nothing arriving right now). */
    @JavascriptInterface public long cleanMedia(String keepJson) {
        long freed = 0;
        try {
            org.json.JSONArray k = new org.json.JSONArray(keepJson); java.util.HashSet<String> keep = new java.util.HashSet<String>();
            for (int i = 0; i < k.length(); i++) keep.add(k.getString(i));
            java.io.File[] fs = new java.io.File(a.getFilesDir(), "media").listFiles();
            if (fs != null) for (java.io.File f : fs) if (!keep.contains(f.getName()) && System.currentTimeMillis() - f.lastModified() > 86400000L) { long n = f.length(); if (f.delete()) freed += n; }
        } catch (Exception e) { }
        return freed;
    }
    /** Remove recorded route points older than this many days. */
    @JavascriptInterface public long trimTrack(int days) {
        java.io.File f = new java.io.File(a.getFilesDir(), "track.csv"); if (!f.exists()) return 0;
        long before = f.length(), cut = System.currentTimeMillis() - days * 86400000L;
        try {
            java.io.File tmp = new java.io.File(a.getFilesDir(), "track.tmp");
            java.io.BufferedReader r = new java.io.BufferedReader(new java.io.FileReader(f)); java.io.FileWriter w = new java.io.FileWriter(tmp);
            String l; while ((l = r.readLine()) != null) { int c = l.indexOf(','); try { if (c > 0 && Long.parseLong(l.substring(0, c)) >= cut) w.write(l + "\n"); } catch (Exception x) { } }
            r.close(); w.close(); if (!tmp.renameTo(f)) tmp.delete();
        } catch (Exception e) { }
        return before - f.length();
    }
    @JavascriptInterface public long clearCache() {
        long before = sizeOf(a.getCacheDir());
        try { java.io.File[] fs = a.getCacheDir().listFiles(); if (fs != null) for (java.io.File x : fs) if (!x.getName().equals("share") && !x.getName().startsWith("WebView")) delTree(x); } catch (Exception e) { }
        if (a instanceof MainActivity) ((MainActivity) a).clearWebCache();
        return Math.max(0, before - sizeOf(a.getCacheDir()));
    }
    static void delTree(java.io.File f) { java.io.File[] k = f.listFiles(); if (k != null) for (java.io.File x : k) delTree(x); f.delete(); }

    // ---------- connection: wifi / mobile / none ----------
    @JavascriptInterface public String net() {
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager) a.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (Build.VERSION.SDK_INT >= 23) {
                android.net.NetworkCapabilities nc = cm.getNetworkCapabilities(cm.getActiveNetwork());
                if (nc == null) return "none";
                if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI) || nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_ETHERNET)) return nc.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_NOT_METERED) ? "wifi" : "wifi-metered";
                if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR)) return "cell";
                return "other";
            }
            android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
            return ni == null || !ni.isConnected() ? "none" : ni.getType() == android.net.ConnectivityManager.TYPE_WIFI ? "wifi" : "cell";
        } catch (Exception e) { return "unknown"; }
    }

    // ---------- diagnostics ----------
    @JavascriptInterface public String lastCrash() { return prefs(a).getString("crash", ""); }
    @JavascriptInterface public void clearCrash() { prefs(a).edit().remove("crash").apply(); }
    @JavascriptInterface public String device() { return Build.MANUFACTURER + " " + Build.MODEL + " · Android " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")"; }
    @JavascriptInterface public String sensors() {
        android.hardware.SensorManager sm = (android.hardware.SensorManager) a.getSystemService(Context.SENSOR_SERVICE);
        return "{\"compass\":" + (sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) != null) + ",\"pressure\":" + (sm.getDefaultSensor(Sensor.TYPE_PRESSURE) != null)
            + ",\"steps\":" + (sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null) + ",\"torch\":" + hasTorch() + "}";
    }
}
