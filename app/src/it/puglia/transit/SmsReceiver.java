package it.puglia.transit;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

/** Picks up encrypted Out & Back location texts from your group (only used when someone has no internet). */
public class SmsReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        try {
            SmsMessage[] msgs = Telephony.Sms.Intents.getMessagesFromIntent(i);
            if (msgs == null || msgs.length == 0) return;
            StringBuilder b = new StringBuilder(); String from = null;
            for (SmsMessage m : msgs) { b.append(m.getMessageBody()); if (from == null) from = m.getOriginatingAddress(); }
            String body = b.toString();
            if (body.contains("OAB1:")) OfflineLink.onSms(c, from, body);
        } catch (Exception e) { }
    }
}
