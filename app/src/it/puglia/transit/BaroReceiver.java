package it.puglia.transit;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.os.Build;
import android.os.SystemClock;
import org.json.JSONArray;

/** Bad-weather warning from the phone's pressure sensor. About every 30 minutes, but only when the phone is awake anyway
 *  (no wake-ups), it reads the pressure once (about a second of sensor time) and warns when it falls fast. */
public class BaroReceiver extends BroadcastReceiver {
    static void schedule(Context c, boolean on) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent pi = PendingIntent.getBroadcast(c, 4802, new Intent(c, BaroReceiver.class), fl);
        am.cancel(pi);
        if (on) am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_HALF_HOUR, AlarmManager.INTERVAL_HALF_HOUR, pi);
    }
    /** keep 48 hours of readings, at most one per 10 minutes */
    static synchronized void store(Context c, float hpa) {
        SharedPreferences p = ToolsBridge.prefs(c);
        try {
            JSONArray a = new JSONArray(p.getString("baro:log", "[]")), out = new JSONArray();
            long now = System.currentTimeMillis();
            if (a.length() > 0 && now - a.getJSONArray(a.length() - 1).getLong(0) < 10 * 60000) return;
            for (int i = 0; i < a.length(); i++) if (now - a.getJSONArray(i).getLong(0) < 48 * 3600000L) out.put(a.get(i));
            out.put(new JSONArray().put(now).put(Math.round(hpa * 10) / 10.0));
            p.edit().putString("baro:log", out.toString()).apply();
        } catch (Exception e) { }
    }
    @Override public void onReceive(final Context c, Intent i) {
        if (!ToolsBridge.prefs(c).getBoolean("baro:watch", false)) { schedule(c, false); return; }
        final PendingResult r = goAsync();
        new Thread(new Runnable() { public void run() {
            try {
                float hpa = ToolsBridge.readOnce(c, Sensor.TYPE_PRESSURE, 3000);
                if (hpa > 0) { store(c, hpa); check(c, hpa); }
            } catch (Exception e) { }
            r.finish();
        }}).start();
    }
    /** A drop of 3 hPa or more within about 3 hours usually means wind and rain on the way. */
    static void check(Context c, float now) {
        SharedPreferences p = ToolsBridge.prefs(c);
        try {
            JSONArray a = new JSONArray(p.getString("baro:log", "[]"));
            long t = System.currentTimeMillis(); double then = -1;
            for (int i = 0; i < a.length(); i++) { JSONArray x = a.getJSONArray(i); long age = t - x.getLong(0); if (age >= 150 * 60000L && age <= 210 * 60000L) { then = x.getDouble(1); break; } }
            if (then < 0 || then - now < 3) return;
            if (t - p.getLong("baro:warned", 0) < 6 * 3600000L) return;
            p.edit().putLong("baro:warned", t).apply();
            AlarmReceiver.show(c, "baro", "🌧 Pressure is falling fast", String.format(java.util.Locale.US, "−%.1f hPa in 3 hours: wind and rain likely within hours. (Driving up a hill also lowers it.)", then - now), true);
        } catch (Exception e) { }
    }
}
