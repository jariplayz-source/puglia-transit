package it.puglia.transit;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** After the phone restarts or the app is updated, Android removes our notifications: put the emergency card back on the lock screen. */
public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        try {
            android.content.SharedPreferences p = ToolsBridge.prefs(c);
            String t = p.getString("cardT", ""), x = p.getString("cardX", "");
            if (x != null && !x.isEmpty()) ToolsBridge.postCard(c, t, x);
        } catch (Exception e) { }
    }
}
