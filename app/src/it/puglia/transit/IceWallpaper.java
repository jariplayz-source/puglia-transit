package it.puglia.transit;

import android.app.WallpaperManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Build;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import org.json.JSONArray;

/** The emergency card as the lock-screen picture: always fully readable, nothing to tap or unfold.
 *  The top third stays free for the clock, the bottom for the phone's own buttons. */
final class IceWallpaper {
    private IceWallpaper() { }

    static String set(Context c, String name, String rowsJson) {
        if (Build.VERSION.SDK_INT < 24) return "old";
        try {
            DisplayMetrics dm = new DisplayMetrics();
            ((WindowManager) c.getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay().getRealMetrics(dm);
            int W = Math.max(720, dm.widthPixels), H = Math.max(1280, dm.heightPixels); float d = W / 412f;
            Bitmap b = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888); Canvas cv = new Canvas(b);
            Paint bg = new Paint(); bg.setShader(new LinearGradient(0, 0, 0, H, Color.rgb(16, 20, 26), Color.rgb(6, 8, 11), Shader.TileMode.CLAMP));
            cv.drawRect(0, 0, W, H, bg);
            JSONArray rows = new JSONArray(rowsJson);
            float top = H * 0.36f, bottom = H * 0.88f, pad = 22 * d, x0 = 18 * d, x1 = W - 18 * d, textW = x1 - x0 - 2 * pad;
            // shrink the text until everything fits on the card
            float scale = 1f; StaticLayout[] ls = null; float need = 0;
            for (int tries = 0; tries < 12; tries++) {
                ls = new StaticLayout[rows.length() * 2]; need = pad + 30 * d * scale + 40 * d * scale;
                for (int i = 0; i < rows.length(); i++) {
                    JSONArray r = rows.getJSONArray(i);
                    ls[i * 2] = lay(r.optString(0).toUpperCase(), 12.5f * d * scale, Color.rgb(255, 138, 128), true, textW);
                    ls[i * 2 + 1] = lay(r.optString(1), 19 * d * scale, Color.WHITE, true, textW);
                    need += ls[i * 2].getHeight() + ls[i * 2 + 1].getHeight() + 12 * d * scale;
                }
                if (need + pad <= bottom - top) break;
                scale *= 0.9f;
            }
            float h = Math.min(bottom - top, need + pad), y = top + (bottom - top - h) / 2;
            Paint card = new Paint(Paint.ANTI_ALIAS_FLAG); card.setColor(Color.argb(235, 24, 28, 34));
            cv.drawRoundRect(new RectF(x0, y, x1, y + h), 26 * d, 26 * d, card);
            Paint red = new Paint(Paint.ANTI_ALIAS_FLAG); red.setColor(Color.rgb(226, 61, 52));
            cv.drawRoundRect(new RectF(x0, y, x1, y + 8 * d), 4 * d, 4 * d, red);
            float yy = y + pad + 6 * d;
            StaticLayout hd = lay("🆘  EMERGENCY INFORMATION", 14 * d * scale, Color.rgb(255, 138, 128), true, textW);
            yy = draw(cv, hd, x0 + pad, yy) + 4 * d;
            if (name != null && !name.isEmpty()) yy = draw(cv, lay(name, 28 * d * scale, Color.WHITE, true, textW), x0 + pad, yy) + 14 * d * scale;
            for (int i = 0; ls != null && i < ls.length; i += 2) { yy = draw(cv, ls[i], x0 + pad, yy) + 2 * d; yy = draw(cv, ls[i + 1], x0 + pad, yy) + 12 * d * scale; }
            WallpaperManager.getInstance(c).setBitmap(b, null, true, WallpaperManager.FLAG_LOCK);
            b.recycle();
            return "ok";
        } catch (SecurityException e) { return "denied"; }
        catch (Exception e) { return "error: " + e.getMessage(); }
    }

    /** Back to the normal lock screen (Android then shows your home-screen picture there). */
    static String clear(Context c) {
        if (Build.VERSION.SDK_INT < 24) return "old";
        try { WallpaperManager.getInstance(c).clear(WallpaperManager.FLAG_LOCK); return "ok"; } catch (Exception e) { return "error: " + e.getMessage(); }
    }

    private static StaticLayout lay(String t, float size, int color, boolean bold, float w) {
        TextPaint p = new TextPaint(Paint.ANTI_ALIAS_FLAG); p.setTextSize(size); p.setColor(color);
        p.setTypeface(Typeface.create("sans-serif", bold ? Typeface.BOLD : Typeface.NORMAL));
        return new StaticLayout(t, p, (int) w, Layout.Alignment.ALIGN_NORMAL, 1.1f, 0, false);
    }
    private static float draw(Canvas c, StaticLayout l, float x, float y) { c.save(); c.translate(x, y); l.draw(c); c.restore(); return y + l.getHeight(); }
}
