package it.puglia.transit;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.os.Build;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.ForegroundColorSpan;
import android.text.style.StyleSpan;
import android.widget.RemoteViews;
import org.json.JSONArray;

/** The emergency card as a widget, for the home screen and (on phones that allow it) the lock screen. */
public class IceWidget extends AppWidgetProvider {
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) m.updateAppWidget(id, views(c)); }

    static void refresh(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, IceWidget.class));
        for (int id : ids) m.updateAppWidget(id, views(c));
    }
    static int count(Context c) { return AppWidgetManager.getInstance(c).getAppWidgetIds(new ComponentName(c, IceWidget.class)).length; }

    static RemoteViews views(Context c) {
        SharedPreferences p = ToolsBridge.prefs(c);
        String name = p.getString("iceName", ""), rows = p.getString("iceRows", "[]");
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.ice_widget);
        SpannableStringBuilder sb = new SpannableStringBuilder();
        try {
            JSONArray a = new JSONArray(rows);
            for (int i = 0; i < a.length(); i++) {
                JSONArray r = a.getJSONArray(i);
                if (sb.length() > 0) sb.append("\n");
                int s0 = sb.length(); sb.append(r.optString(0).toUpperCase()).append("\n");
                sb.setSpan(new ForegroundColorSpan(0xFFFF8A80), s0, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                sb.setSpan(new AbsoluteSizeSpan(11, true), s0, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                sb.setSpan(new StyleSpan(Typeface.BOLD), s0, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                int s1 = sb.length(); sb.append(r.optString(1));
                sb.setSpan(new StyleSpan(Typeface.BOLD), s1, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            }
        } catch (Exception e) { }
        v.setTextViewText(R.id.iceName, name.replaceFirst("^🆘 Emergency info:? ?", ""));
        v.setTextViewText(R.id.iceBody, sb.length() > 0 ? sb : "Tap to fill in your emergency card: allergies, medicines and who to call.");
        Intent open = new Intent(c, MainActivity.class); open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP); open.putExtra("tool", "card");
        v.setOnClickPendingIntent(R.id.iceRoot, PendingIntent.getActivity(c, 41, open, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)));
        return v;
    }

    /** Ask the launcher to put the widget on the home screen (Android 8+). */
    static boolean pin(Context c) {
        if (Build.VERSION.SDK_INT < 26) return false;
        try { AppWidgetManager m = AppWidgetManager.getInstance(c); if (!m.isRequestPinAppWidgetSupported()) return false;
            return m.requestPinAppWidget(new ComponentName(c, IceWidget.class), null, null); } catch (Exception e) { return false; }
    }
}
