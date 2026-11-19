package it.puglia.transit;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;

/** Shares your location with your travel group every ~2 minutes, also when the app is closed (shows a notification while on). */
public class LocationShareService extends Service implements LocationListener {
    static final String CH = "share";
    static final int ID = 9;
    private LocationManager lm;
    private long lastSent = 0, lastPoll = 0;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getBooleanExtra("stop", false)) {
            GroupCore.prefs(this).edit().putBoolean("sharing", false).putBoolean("tracking", false).apply();
            stopSelf(); return START_NOT_STICKY;
        }
        boolean sharing = GroupCore.prefs(this).getBoolean("sharing", false), tracking = GroupCore.prefs(this).getBoolean("tracking", false);
        if (!sharing && !tracking) { stopSelf(); return START_NOT_STICKY; }
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            if (nm.getNotificationChannel(CH) == null) nm.createNotificationChannel(new NotificationChannel(CH, "Location sharing", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(this, CH);
        } else b = new Notification.Builder(this);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent open = new Intent(this, MainActivity.class); open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        Intent stop = new Intent(this, LocationShareService.class); stop.putExtra("stop", true);
        String grp = GroupCore.prefs(this).getString("gname", "your travel group");
        String title = sharing && tracking ? "Recording your journey · sharing location" : sharing ? "Sharing your location" : "Recording your journey";
        String text = sharing ? "With " + grp + " (end-to-end encrypted)" : "Your route stays on this phone";
        b.setSmallIcon(android.R.drawable.ic_menu_mylocation).setContentTitle(title).setContentText(text)
         .setOngoing(true).setContentIntent(PendingIntent.getActivity(this, 1, open, fl))
         .addAction(new Notification.Action.Builder(null, "Stop", PendingIntent.getService(this, 2, stop, fl)).build());
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(ID, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(ID, b.build());
        } catch (Exception e) { stopSelf(); return START_NOT_STICKY; }
        lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        try { lm.removeUpdates(this); } catch (Exception e) { }
        try {
            lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 30000, 15, this);
            lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 30000, 15, this);
        } catch (SecurityException e) { stopSelf(); } catch (Exception e) { }
        return START_STICKY;
    }

    @Override public void onLocationChanged(final Location l) {
        long now = System.currentTimeMillis();
        if (GroupCore.prefs(this).getBoolean("tracking", false))
            GroupCore.recordPoint(this, l.getLatitude(), l.getLongitude(), l.hasAccuracy() ? l.getAccuracy() : 50, l.hasSpeed() ? l.getSpeed() : -1);
        if (!GroupCore.prefs(this).getBoolean("sharing", false) || GroupCore.prefs(this).getString("topic", null) == null) return;
        if (now - lastSent < 110000) return;
        lastSent = now;
        final boolean poll = now - lastPoll > 110000; if (poll) lastPoll = now;
        new Thread(new Runnable() { public void run() {
            GroupCore.sendLocation(LocationShareService.this, l.getLatitude(), l.getLongitude(), l.hasAccuracy() ? l.getAccuracy() : 50, l.hasSpeed() ? l.getSpeed() : -1);
            if (poll) GroupCore.pollAndNotify(LocationShareService.this);
        }}).start();
    }
    @Override public void onStatusChanged(String p, int s, Bundle b) {}
    @Override public void onProviderEnabled(String p) {}
    @Override public void onProviderDisabled(String p) {}

    @Override public void onDestroy() {
        try { if (lm != null) lm.removeUpdates(this); } catch (Exception e) { }
        try { stopForeground(true); } catch (Exception e) { }
        super.onDestroy();
    }
}
