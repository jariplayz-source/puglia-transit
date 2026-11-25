package it.puglia.transit;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/** Two phones playing a game over Bluetooth, no pairing and no internet: each phone keeps broadcasting a tiny
 *  packet (its latest move plus what it has received) and listens for the other one. Only runs while a game is open. */
final class GameLink {
    private GameLink() { }
    private static BluetoothLeAdvertiser adv; private static AdvertiseCallback advCb;
    private static BluetoothLeScanner scn; private static ScanCallback scnCb;
    private static final List<JSONObject> inbox = new ArrayList<JSONObject>();
    private static final HashMap<String, String> last = new HashMap<String, String>();
    private static final HashMap<String, Long> lastAt = new HashMap<String, Long>();
    private static String advHex = "";

    static boolean ready(Context c) { return OfflineLink.btAvailable(c); }

    /** Start listening for packets that begin with "OB" + room (2 bytes). */
    @SuppressLint("MissingPermission")
    static synchronized String listen(final Context c, String roomHex) {
        if (!ready(c)) return "bluetooth";
        stopScan();
        try {
            BluetoothAdapter a = OfflineLink.adapter(c); scn = a.getBluetoothLeScanner(); if (scn == null) return "bluetooth";
            byte[] room = hex(roomHex); byte[] pre = new byte[]{'O', 'B', room[0], room[1]};
            List<ScanFilter> f = new ArrayList<ScanFilter>();
            f.add(new ScanFilter.Builder().setManufacturerData(OfflineLink.MANUF, pre, new byte[]{(byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff}).build());
            scnCb = new ScanCallback() {
                @Override public void onScanResult(int type, ScanResult r) {
                    try {
                        byte[] p = r.getScanRecord() == null ? null : r.getScanRecord().getManufacturerSpecificData(OfflineLink.MANUF);
                        if (p == null || p.length < 10) return;
                        String h = toHex(p), from = h.substring(8, 12);
                        synchronized (GameLink.class) {
                            long now = System.currentTimeMillis();
                            Long at = lastAt.get(from);
                            if (h.equals(last.get(from)) && at != null && now - at < 1000) return;   // the same packet again (let it through once a second, in case the game missed it)
                            last.put(from, h); lastAt.put(from, now);
                            JSONObject o = new JSONObject(); o.put("p", h); o.put("rssi", r.getRssi()); inbox.add(o);
                            while (inbox.size() > 50) inbox.remove(0);
                        }
                    } catch (Exception e) { }
                }
            };
            scn.startScan(f, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scnCb);
            return "ok";
        } catch (Exception e) { return "error: " + e.getMessage(); }
    }

    /** Broadcast this packet (hex, max 24 bytes) until the next one replaces it. */
    @SuppressLint("MissingPermission")
    static synchronized String send(Context c, String h) {
        if (!ready(c)) return "bluetooth";
        if (h.equals(advHex) && advCb != null) return "ok";
        try {
            if (adv == null) adv = OfflineLink.adapter(c).getBluetoothLeAdvertiser();
            if (adv == null) return "no-advertise";
            if (advCb != null) { try { adv.stopAdvertising(advCb); } catch (Exception e) { } }
            AdvertiseSettings s = new AdvertiseSettings.Builder().setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM).setConnectable(false).setTimeout(0).build();
            AdvertiseData d = new AdvertiseData.Builder().setIncludeDeviceName(false).setIncludeTxPowerLevel(false).addManufacturerData(OfflineLink.MANUF, hex(h)).build();
            final String want = h;
            advCb = new AdvertiseCallback() {
                @Override public void onStartFailure(int code) { synchronized (GameLink.class) { if (want.equals(advHex)) { advHex = ""; advCb = null; } } }   // try again with the next send
            };
            advHex = h; adv.startAdvertising(s, d, advCb);
            return "ok";
        } catch (Exception e) { return "error: " + e.getMessage(); }
    }

    static synchronized String take() { JSONArray a = new JSONArray(); for (JSONObject o : inbox) a.put(o); inbox.clear(); return a.toString(); }

    @SuppressLint("MissingPermission")
    static synchronized void stop() {
        stopScan();
        try { if (adv != null && advCb != null) adv.stopAdvertising(advCb); } catch (Exception e) { }
        advCb = null; advHex = ""; inbox.clear(); last.clear(); lastAt.clear();
    }
    @SuppressLint("MissingPermission")
    private static void stopScan() { try { if (scn != null && scnCb != null) scn.stopScan(scnCb); } catch (Exception e) { } scnCb = null; }

    static byte[] hex(String h) { byte[] b = new byte[h.length() / 2]; for (int i = 0; i < b.length; i++) b[i] = (byte) Integer.parseInt(h.substring(i * 2, i * 2 + 2), 16); return b; }
    static String toHex(byte[] b) { StringBuilder s = new StringBuilder(); for (byte x : b) s.append(String.format("%02x", x)); return s.toString(); }
}
