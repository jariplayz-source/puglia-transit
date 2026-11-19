package it.puglia.transit;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** Keeps the app running while it downloads (street maps, places, shop hours) when you switch to other apps. */
public class DownloadService extends Service {
    static final String CH = "downloads";
    static final int ID = 7;
    private boolean started = false;
    private PowerManager.WakeLock wake;
    private WifiManager.WifiLock wifi;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getBooleanExtra("stop", false)) { stopSelf(); return START_NOT_STICKY; }
        String text = intent != null ? intent.getStringExtra("text") : null;
        int cur = intent != null ? intent.getIntExtra("cur", 0) : 0, max = intent != null ? intent.getIntExtra("max", 0) : 0;
        Notification n = build(text == null ? "Downloading…" : text, cur, max);
        try {
            if (!started) {
                if (Build.VERSION.SDK_INT >= 29) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
                else startForeground(ID, n);
                started = true;
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PugliaTransit:download");
                wake.acquire(2 * 60 * 60 * 1000L);
                WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) { wifi = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "PugliaTransit:download"); wifi.acquire(); }
            } else {
                ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(ID, n);
            }
        } catch (Exception e) { stopSelf(); }
        return START_NOT_STICKY;
    }

    private Notification build(String text, int cur, int max) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            if (nm.getNotificationChannel(CH) == null) {
                NotificationChannel c = new NotificationChannel(CH, "Downloads", NotificationManager.IMPORTANCE_LOW);
                c.setDescription("Shows while maps, places and shop hours download");
                nm.createNotificationChannel(c);
            }
            b = new Notification.Builder(this, CH);
        } else b = new Notification.Builder(this);
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        b.setSmallIcon(android.R.drawable.stat_sys_download).setContentTitle("Out & Back").setContentText(text)
         .setOngoing(true).setOnlyAlertOnce(true).setContentIntent(pi);
        if (max > 0) b.setProgress(max, cur, false); else b.setProgress(0, 0, true);
        return b.build();
    }

    @Override public void onDestroy() {
        try { if (wake != null && wake.isHeld()) wake.release(); } catch (Exception e) { }
        try { if (wifi != null && wifi.isHeld()) wifi.release(); } catch (Exception e) { }
        try { stopForeground(true); } catch (Exception e) { }
        super.onDestroy();
    }
}
