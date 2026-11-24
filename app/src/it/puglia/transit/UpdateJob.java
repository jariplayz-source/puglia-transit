package it.puglia.transit;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** About twice a day (only with internet, Android picks the moment): is there a newer Out & Back?
 *  Then one notification per new version, so people know without opening the app. */
public class UpdateJob extends JobService {
    static final int JOB = 4712;
    static final String URL_LATEST = "https://api.github.com/repos/jariplayz-source/puglia-transit/contents/dist/latest.json?ref=main";
    static void schedule(Context c) {
        try {
            JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            for (JobInfo j : js.getAllPendingJobs()) if (j.getId() == JOB) return;   // already planned
            JobInfo ji = new JobInfo.Builder(JOB, new ComponentName(c, UpdateJob.class))
                .setPeriodic(12 * 3600 * 1000L).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPersisted(true).build();
            js.schedule(ji);
        } catch (Exception e) { }
    }
    static void check(Context c) {
        SharedPreferences p = c.getSharedPreferences("app", 0);
        if (System.currentTimeMillis() - p.getLong("updChk", 0) < 10 * 3600000L) return;
        if (!OfflineLink.online(c)) return;
        try {
            HttpURLConnection h = (HttpURLConnection) new URL(URL_LATEST).openConnection();
            h.setConnectTimeout(10000); h.setReadTimeout(15000);
            h.setRequestProperty("User-Agent", "OutAndBack-update-check");
            h.setRequestProperty("Accept", "application/vnd.github.raw+json");
            if (h.getResponseCode() != 200) return;
            InputStream in = h.getInputStream(); ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[4096]; int n;
            while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close();
            JSONObject j = new JSONObject(o.toString("UTF-8"));
            p.edit().putLong("updChk", System.currentTimeMillis()).apply();
            int code = j.optInt("code", 0), have = c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
            if (code <= have || p.getInt("updTold", 0) >= code) return;
            p.edit().putInt("updTold", code).apply();
            String notes = j.optString("notes", ""); if (notes.length() > 140) notes = notes.substring(0, 137) + "…";
            AlarmReceiver.show(c, "upd", "⬆ Out & Back " + j.optString("version") + " is ready", "Tap to update" + (notes.isEmpty() ? "" : ": " + notes), true);
        } catch (Exception e) { }
    }
    @Override public boolean onStartJob(final JobParameters p) {
        OfflineLink.APP = getApplicationContext();
        new Thread(new Runnable() { public void run() { check(UpdateJob.this); jobFinished(p, false); } }).start();
        return true;
    }
    @Override public boolean onStopJob(JobParameters p) { return true; }
}
