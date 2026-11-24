package it.puglia.transit;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;

/** Every ~15 minutes (Android decides exactly), checks for new group messages and notifies you, even when the app is closed. */
public class GroupPollJob extends JobService {
    static final int JOB = 4711;
    static void schedule(Context c, boolean on) {
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (!on) { js.cancel(JOB); return; }
        JobInfo ji = new JobInfo.Builder(JOB, new ComponentName(c, GroupPollJob.class))
            .setPeriodic(15 * 60 * 1000).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPersisted(false).build();
        try { js.schedule(ji); } catch (Exception e) { }
    }
    @Override public boolean onStartJob(final JobParameters p) {
        OfflineLink.APP = getApplicationContext();
        new Thread(new Runnable() { public void run() { GroupCore.pollAndNotify(GroupPollJob.this); jobFinished(p, false); } }).start();
        return true;
    }
    @Override public boolean onStopJob(JobParameters p) { return true; }
}
