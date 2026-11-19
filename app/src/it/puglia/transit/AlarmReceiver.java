package it.puglia.transit;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.HashSet;
import java.util.Set;

/** Shows the app's planned notifications (last train, trip steps, strikes, rain, group messages). */
public class AlarmReceiver extends BroadcastReceiver {
    static final String CH = "info";
    static final String PREF = "notif";

    @Override public void onReceive(Context ctx, Intent i) {
        String id = i.getStringExtra("id");
        show(ctx, id == null ? "x" : id, i.getStringExtra("title"), i.getStringExtra("text"), i.getBooleanExtra("loud", true));
        SharedPreferences sp = ctx.getSharedPreferences(PREF, 0);
        Set<String> ids = new HashSet<String>(sp.getStringSet("ids", new HashSet<String>()));
        ids.remove(id); sp.edit().putStringSet("ids", ids).apply();
    }

    static void show(Context ctx, String id, String title, String text, boolean loud) {
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            if (nm.getNotificationChannel(CH) == null) {
                NotificationChannel c = new NotificationChannel(CH, "Travel info", NotificationManager.IMPORTANCE_HIGH);
                c.setDescription("Last train back, trip steps, strikes, weather and your travel group");
                nm.createNotificationChannel(c);
            }
            b = new Notification.Builder(ctx, CH);
        } else { b = new Notification.Builder(ctx); b.setPriority(Notification.PRIORITY_HIGH); if (loud) b.setDefaults(Notification.DEFAULT_ALL); }
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        open.putExtra("notif", id);
        PendingIntent pi = PendingIntent.getActivity(ctx, id.hashCode(), open, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        b.setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle(title).setContentText(text)
         .setStyle(new Notification.BigTextStyle().bigText(text)).setAutoCancel(true).setContentIntent(pi);
        try { nm.notify(id.hashCode(), b.build()); } catch (Exception e) { }
    }

    static PendingIntent pending(Context ctx, String id, String title, String text) {
        Intent i = new Intent(ctx, AlarmReceiver.class);
        i.setAction("pt." + id);
        i.putExtra("id", id); i.putExtra("title", title); i.putExtra("text", text);
        return PendingIntent.getBroadcast(ctx, id.hashCode(), i, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
    }

    static void schedule(Context ctx, String id, long when, String title, String text) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = pending(ctx, id, title, text);
        if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
        else am.set(AlarmManager.RTC_WAKEUP, when, pi);
        SharedPreferences sp = ctx.getSharedPreferences(PREF, 0);
        Set<String> ids = new HashSet<String>(sp.getStringSet("ids", new HashSet<String>()));
        ids.add(id); sp.edit().putStringSet("ids", ids).apply();
    }

    static void cancelPrefix(Context ctx, String prefix) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences sp = ctx.getSharedPreferences(PREF, 0);
        Set<String> ids = new HashSet<String>(sp.getStringSet("ids", new HashSet<String>()));
        Set<String> keep = new HashSet<String>();
        for (String id : ids) {
            if (id.startsWith(prefix)) { try { am.cancel(pending(ctx, id, "", "")); } catch (Exception e) { } }
            else keep.add(id);
        }
        sp.edit().putStringSet("ids", keep).apply();
    }
}
