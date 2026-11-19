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
    private Location lastLoc = null;
    /** Every 30 s: without internet, keep the group in touch by Bluetooth (nearby) and text messages. */
    private final Runnable offline = new Runnable() { public void run() {
        try {
            boolean on = OfflineLink.online(LocationShareService.this);
            GroupCore.prefs(LocationShareService.this).edit().putBoolean("offline", !on).apply();
            if (!on && GroupCore.anySharing(GroupCore.prefs(LocationShareService.this))) {
                Location l = lastLoc != null ? lastLoc : lastKnown();
                OfflineLink.btTick(LocationShareService.this, l != null ? l.getLatitude() : 999, l != null ? l.getLongitude() : 999);
                if (l != null) OfflineLink.maybeSms(LocationShareService.this, l.getLatitude(), l.getLongitude());
            } else OfflineLink.btStop(LocationShareService.this);
        } catch (Exception e) { }
        h.postDelayed(this, 30000);
    }};
    private final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
    /** Heartbeat: also send when you're not moving, so the group always sees a fresh position (every ~2 min). */
    private final Runnable beat = new Runnable() { public void run() {
        Location l = lastLoc;
        if (l == null) l = lastKnown();
        if (l != null) send(l, true);
        h.postDelayed(this, 120000);
    }};

    private Location lastKnown() {
        Location best = null;
        try {
            for (String p : new String[]{"fused", LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
                if (!lm.getAllProviders().contains(p)) continue;
                Location l = lm.getLastKnownLocation(p);
                if (l != null && (best == null || l.getTime() > best.getTime() + 60000 || (Math.abs(l.getTime() - best.getTime()) < 60000 && l.getAccuracy() < best.getAccuracy()))) best = l;
            }
        } catch (SecurityException e) { } catch (Exception e) { }
        return best;
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getBooleanExtra("stop", false)) {
            GroupCore.prefs(this).edit().putBoolean("sharing", false).putBoolean("tracking", false).apply();
            stopSelf(); return START_NOT_STICKY;
        }
        boolean sharing = GroupCore.anySharing(GroupCore.prefs(this)), tracking = GroupCore.prefs(this).getBoolean("tracking", false);
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            if (nm.getNotificationChannel(CH) == null) nm.createNotificationChannel(new NotificationChannel(CH, "Location sharing", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(this, CH);
        } else b = new Notification.Builder(this);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent open = new Intent(this, MainActivity.class); open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        Intent stop = new Intent(this, LocationShareService.class); stop.putExtra("stop", true);
        String grp = "";
        { org.json.JSONArray gs = GroupCore.groups(GroupCore.prefs(this)); for (int i = 0; i < gs.length(); i++) { org.json.JSONObject g = gs.optJSONObject(i); if (g != null && g.optBoolean("share")) grp += (grp.isEmpty() ? "" : ", ") + g.optString("gname", "group"); } }
        if (grp.isEmpty()) grp = "your travel group";
        String title = sharing && tracking ? "Recording your journey · sharing location" : sharing ? "Sharing your location" : "Recording your journey";
        String text = sharing ? "With " + grp + " (end-to-end encrypted)" : "Your route stays on this phone";
        b.setSmallIcon(android.R.drawable.ic_menu_mylocation).setContentTitle(title).setContentText(text)
         .setOngoing(true).setContentIntent(PendingIntent.getActivity(this, 1, open, fl))
         .addAction(new Notification.Action.Builder(null, "Stop", PendingIntent.getService(this, 2, stop, fl)).build());
        // Always go to the foreground first: Android kills the whole app if a service started with
        // startForegroundService() stops or fails before calling startForeground().
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(ID, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(ID, b.build());
        } catch (Exception e) { try { stopSelf(); } catch (Exception x) { } return START_NOT_STICKY; }
        if (!sharing && !tracking) { try { stopForeground(true); } catch (Exception e) { } stopSelf(); return START_NOT_STICKY; }
        lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        try { lm.removeUpdates(this); } catch (Exception e) { }
        try {
            for (String p : new String[]{"fused", LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
                if (lm.getAllProviders().contains(p) && lm.isProviderEnabled(p)) lm.requestLocationUpdates(p, 20000, 0, this);
            }
        } catch (SecurityException e) { stopSelf(); return START_NOT_STICKY; } catch (Exception e) { }
        h.removeCallbacks(beat); h.removeCallbacks(offline); OfflineLink.btStop(this);
        Location k = lastKnown();
        if (k != null && System.currentTimeMillis() - k.getTime() < 15 * 60000) { lastLoc = k; send(k, true); }
        h.postDelayed(beat, 120000);
        h.removeCallbacks(offline); h.postDelayed(offline, 5000);
        return START_STICKY;
    }

    @Override public void onLocationChanged(final Location l) {
        if (GroupCore.prefs(this).getBoolean("tracking", false))
            GroupCore.recordPoint(this, l.getLatitude(), l.getLongitude(), l.hasAccuracy() ? l.getAccuracy() : 50, l.hasSpeed() ? l.getSpeed() : -1);
        // keep the better of: newer fix, or a much more accurate one from the last minute
        if (lastLoc == null || l.getTime() - lastLoc.getTime() > 60000 || l.getAccuracy() <= lastLoc.getAccuracy() * 1.5) lastLoc = l;
        send(lastLoc, false);
    }

    private void send(final Location l, boolean force) {
        long now = System.currentTimeMillis();
        GroupCore.prefs(this).edit().putString("lastLoc", l.getLatitude() + "," + l.getLongitude() + "," + (l.hasAccuracy() ? l.getAccuracy() : 50) + "," + l.getTime()).apply();
        if (!GroupCore.anySharing(GroupCore.prefs(this))) return;
        if (now - lastSent < (force ? 30000 : 90000)) return;
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
        h.removeCallbacks(beat); h.removeCallbacks(offline);
        try { OfflineLink.btStop(this); } catch (Exception e) { }
        try { if (lm != null) lm.removeUpdates(this); } catch (Exception e) { }
        try { stopForeground(true); } catch (Exception e) { }
        super.onDestroy();
    }
}
