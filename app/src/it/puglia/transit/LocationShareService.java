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
    static final String CH = "share2";
    static final int ID = 9;
    private LocationManager lm;
    private long lastSent = 0, lastPoll = 0;
    private double sentLat = 999, sentLon = 999;
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
        if (l != null) send(l, false);   // the normal rules decide (moved, or the 45-minute heartbeat)
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
        OfflineLink.APP = getApplicationContext();
        if (intent != null && intent.getBooleanExtra("stop", false)) {
            GroupCore.prefs(this).edit().putBoolean("sharing", false).putBoolean("tracking", false).apply();
            stopSelf(); return START_NOT_STICKY;
        }
        boolean sharing = GroupCore.anySharing(GroupCore.prefs(this)), tracking = GroupCore.prefs(this).getBoolean("tracking", false);
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            // "min": no icon in the status bar, no sound, folded away at the bottom of the notifications (Android needs one while it records)
            try { if (nm.getNotificationChannel("share") != null) nm.deleteNotificationChannel("share"); } catch (Exception e) { }
            if (nm.getNotificationChannel(CH) == null) { NotificationChannel ch = new NotificationChannel(CH, "Recording & sharing (quiet)", NotificationManager.IMPORTANCE_MIN); ch.setShowBadge(false); nm.createNotificationChannel(ch); }
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
         .setOngoing(Build.VERSION.SDK_INT < 33).setPriority(Notification.PRIORITY_MIN).setShowWhen(false).setContentIntent(PendingIntent.getActivity(this, 1, open, fl))
         .addAction(new Notification.Action.Builder(null, "Stop", PendingIntent.getService(this, 2, stop, fl)).build());
        // Always go to the foreground first: Android kills the whole app if a service started with
        // startForegroundService() stops or fails before calling startForeground().
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(ID, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(ID, b.build());
        } catch (Exception e) { try { stopSelf(); } catch (Exception x) { } return START_NOT_STICKY; }
        if (!sharing && !tracking) { try { stopForeground(true); } catch (Exception e) { } stopSelf(); return START_NOT_STICKY; }
        lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if (intent != null && intent.getBooleanExtra("reprov", false) && lastLoc != null) { providers(!still); return START_STICKY; }
        still = false; ancT = System.currentTimeMillis();
        if (!providers(true)) { stopSelf(); return START_NOT_STICKY; }
        h.removeCallbacks(beat); h.removeCallbacks(offline); OfflineLink.btStop(this);
        Location k = lastKnown();
        if (k != null && System.currentTimeMillis() - k.getTime() < 15 * 60000) { lastLoc = k; send(k, true); }
        h.postDelayed(beat, 120000);
        h.removeCallbacks(offline); h.postDelayed(offline, 5000);
        return START_STICKY;
    }

    /* Battery: GPS only while you move. After 5 minutes in the same spot it switches to the phone network's location
       (cell towers / wifi, almost free) and wakes GPS again as soon as you've moved. Battery saver makes it all slower. */
    private boolean fastOn = false; private long lastFast = 0;
    private boolean still = false; private double ancLat = 999, ancLon = 999; private float ancAcc = 50; private long ancT = 0;
    private boolean providers(boolean moving) {
        boolean fast = System.currentTimeMillis() < GroupCore.prefs(this).getLong("fastUntil", 0); fastOn = fast;
        boolean lp = GroupCore.prefs(this).getBoolean("lowpower", false) && !fast; if (fast) moving = true;
        try { lm.removeUpdates(this); } catch (Exception e) { }
        try {
            for (String p : new String[]{"fused", LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER}) {
                if (!lm.getAllProviders().contains(p) || !lm.isProviderEnabled(p)) continue;
                boolean net = LocationManager.NETWORK_PROVIDER.equals(p), pas = LocationManager.PASSIVE_PROVIDER.equals(p);
                if (!moving && !net && !pas) continue;
                long every = pas ? 30000 : net ? (moving ? 60000 : lp ? 300000 : 120000) : (lp ? 60000 : 20000);
                if (fast && !net && !pas) every = 15000;
                lm.requestLocationUpdates(p, every, fast ? 0 : pas ? 0 : moving ? (lp ? 30 : 10) : 50, this);
            }
            return true;
        } catch (SecurityException e) { return false; } catch (Exception e) { return true; }
    }
    private void motion(Location l) {
        long now = System.currentTimeMillis();
        double d = ancLat == 999 ? 1e9 : Math.hypot((l.getLatitude() - ancLat) * 111320, (l.getLongitude() - ancLon) * 111320 * Math.cos(Math.toRadians(l.getLatitude())));
        float acc = l.hasAccuracy() ? l.getAccuracy() : 50;
        boolean moved = d > Math.max(still ? 150 : 80, acc + ancAcc) || (l.hasSpeed() && l.getSpeed() > 1.5f && acc < 40);
        if (moved) { ancLat = l.getLatitude(); ancLon = l.getLongitude(); ancAcc = Math.min(acc, 100); ancT = now; if (still) { still = false; providers(true); } }
        else if (!still && now - ancT > 5 * 60000) { still = true; providers(false); }
    }

    @Override public void onLocationChanged(final Location l) {
        motion(l);
        if (GroupCore.prefs(this).getBoolean("tracking", false))
            GroupCore.recordPoint(this, l.getLatitude(), l.getLongitude(), l.hasAccuracy() ? l.getAccuracy() : 50, l.hasSpeed() ? l.getSpeed() : -1);
        final double la = l.getLatitude(), lo = l.getLongitude(); final float ac = l.hasAccuracy() ? l.getAccuracy() : 50, sp = l.hasSpeed() ? l.getSpeed() : -1;
        new Thread(new Runnable() { public void run() { try { GroupCore.myEvents(LocationShareService.this, la, lo, ac, sp); } catch (Exception e) { } } }).start();
        // keep the better of: newer fix, or a much more accurate one from the last minute
        if (lastLoc == null || l.getTime() - lastLoc.getTime() > 60000 || l.getAccuracy() <= lastLoc.getAccuracy() * 1.5) lastLoc = l;
        send(lastLoc, false);
    }

    private void send(final Location l, boolean force) {
        long now = System.currentTimeMillis();
        GroupCore.prefs(this).edit().putString("lastLoc", l.getLatitude() + "," + l.getLongitude() + "," + (l.hasAccuracy() ? l.getAccuracy() : 50) + "," + l.getTime()).apply();
        if (!GroupCore.anySharing(GroupCore.prefs(this))) return;
        // someone driving near you asked for your position every 30 s
        long fu = GroupCore.prefs(this).getLong("fastUntil", 0);
        if (now < fu && now - lastFast >= 28000) {
            lastFast = now; final String ft = GroupCore.prefs(this).getString("fastTopic", null);
            final boolean fpoll = now - lastPoll > 60000; if (fpoll) lastPoll = now;
            new Thread(new Runnable() { public void run() {
                GroupCore.sendLocation(LocationShareService.this, l.getLatitude(), l.getLongitude(), l.hasAccuracy() ? l.getAccuracy() : 50, l.hasSpeed() ? l.getSpeed() : -1, ft);
                if (fpoll) GroupCore.pollAndNotify(LocationShareService.this);
            }}).start();
        } else if (fastOn && now >= fu) providers(!still);   // the ask ran out: back to the normal, slower pace
        // while you're on the move, look for messages about every 75 s (so an ask like that reaches you quickly)
        if (!still && now - lastPoll > 75000) { lastPoll = now; new Thread(new Runnable() { public void run() { GroupCore.pollAndNotify(LocationShareService.this); } }).start(); }
        // Budget-friendly: send when you moved 150 m+ (at most every 4 min), otherwise a heartbeat every 45 min.
        double moved = sentLat == 999 ? 1e9 : Math.hypot((l.getLatitude() - sentLat) * 111320, (l.getLongitude() - sentLon) * 111320 * Math.cos(Math.toRadians(l.getLatitude())));
        if (force) { if (now - lastSent < 30000) return; }
        else if (!(moved >= 150 && now - lastSent >= 4 * 60000) && now - lastSent < 45 * 60000) return;
        lastSent = now; sentLat = l.getLatitude(); sentLon = l.getLongitude();
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
