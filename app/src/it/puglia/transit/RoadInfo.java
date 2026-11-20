package it.puglia.transit;

import org.json.JSONArray;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserFactory;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.zip.GZIPInputStream;

/** Dutch road situation (NDW open data, CC0): accidents, jams, closures, works and road conditions near given points. */
public class RoadInfo {
    static final String FEED = "https://opendata.ndw.nu/actueel_beeld.xml.gz";
    static final Set<String> KEEP = new HashSet<String>(java.util.Arrays.asList(
        "latitude", "longitude", "roadNumber", "roadName", "overallStartTime", "overallEndTime", "abnormalTrafficType", "accidentType",
        "queueLength", "lengthAffected", "vehicleObstructionType", "obstructionType", "roadMaintenanceType",
        "roadOrCarriagewayOrLaneManagementType", "trafficConstrictionType", "value", "delayTimeValue", "poorRoadInfrastructureType",
        "nonWeatherRelatedRoadConditionType", "weatherRelatedRoadConditionType", "visibility", "causeType", "alertCDirectionCoded",
        "directionBound", "probabilityOfOccurrence", "overallSeverity", "numberOfLanesRestricted", "generalNetworkManagementType",
        "complianceOption", "roadOrCarriagewayOrLaneManagementType"));

    /** pts = [[lat,lon],...]; returns records within radiusKm of any point, nearest first. */
    public static JSONObject near(JSONArray pts, double radiusKm, int max) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(FEED).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(45000);
        c.setRequestProperty("User-Agent", "OutAndBack/1.15 (+https://github.com/jariplayz-source/puglia-transit)");
        if (c.getResponseCode() != 200) throw new Exception("road data server said " + c.getResponseCode());
        String mod = c.getHeaderField("Last-Modified");
        InputStream in = new GZIPInputStream(c.getInputStream(), 65536);
        Reader r = new InputStreamReader(in, "UTF-8");
        XmlPullParserFactory f = XmlPullParserFactory.newInstance();
        f.setNamespaceAware(true);
        XmlPullParser p = f.newPullParser();
        p.setInput(r);
        try { return parse(p, pts, radiusKm, max, mod); } finally { r.close(); }
    }

    public static JSONObject parse(XmlPullParser p, JSONArray pts, double radiusKm, int max, String mod) throws Exception {
        final ArrayList<JSONObject> out = new ArrayList<JSONObject>();
        int depth = 0, recDepth = -1, total = 0;
        String sitSeverity = "";
        Map<String, String> cur = null;
        String type = "", recId = "";
        String commentNl = "", commentAny = "";
        boolean inComment = false;
        int ev = p.getEventType();
        while (ev != XmlPullParser.END_DOCUMENT) {
            if (ev == XmlPullParser.START_TAG) {
                depth++;
                String n = p.getName();
                if ("situation".equals(n)) sitSeverity = "";
                if ("situationRecord".equals(n)) {
                    recDepth = depth; cur = new HashMap<String, String>(); commentNl = ""; commentAny = "";
                    type = attr(p, "type"); recId = attr(p, "id");
                    int i = type.indexOf(':'); if (i >= 0) type = type.substring(i + 1);
                } else if (cur != null) {
                    if ("generalPublicComment".equals(n) || "nonGeneralPublicComment".equals(n)) inComment = true;
                    if (KEEP.contains(n)) {
                        String lang = attr(p, "lang");
                        String t = readText(p); depth--;   // readText consumed the END_TAG
                        if (t != null && t.length() > 0) {
                            if ("value".equals(n)) {
                                if (inComment) { if ("nl".equals(lang) && commentNl.length() == 0) commentNl = t; else if (commentAny.length() == 0) commentAny = t; }
                            } else if (!cur.containsKey(n)) cur.put(n, t);
                        }
                    }
                } else if ("overallSeverity".equals(n)) {
                    String t = readText(p); depth--; if (t != null) sitSeverity = t;
                }
            } else if (ev == XmlPullParser.END_TAG) {
                String n = p.getName();
                if ("generalPublicComment".equals(n) || "nonGeneralPublicComment".equals(n)) inComment = false;
                if ("situationRecord".equals(n) && cur != null && depth == recDepth) {
                    total++;
                    try {
                        if (cur.containsKey("latitude") && cur.containsKey("longitude")) {
                            double la = Double.parseDouble(cur.get("latitude")), lo = Double.parseDouble(cur.get("longitude"));
                            double best = 1e9;
                            for (int k = 0; k < pts.length(); k++) {
                                JSONArray q = pts.getJSONArray(k);
                                best = Math.min(best, km(la, lo, q.getDouble(0), q.getDouble(1)));
                            }
                            if (best <= radiusKm) {
                                JSONObject o = new JSONObject();
                                o.put("id", recId); o.put("type", type); o.put("lat", la); o.put("lon", lo); o.put("km", Math.round(best * 10) / 10.0);
                                for (Map.Entry<String, String> e : cur.entrySet()) if (!"latitude".equals(e.getKey()) && !"longitude".equals(e.getKey())) o.put(e.getKey(), e.getValue());
                                String cm = commentNl.length() > 0 ? commentNl : commentAny;
                                if (cm.length() > 0) o.put("comment", cm.length() > 300 ? cm.substring(0, 300) : cm);
                                if (sitSeverity.length() > 0) o.put("severity", sitSeverity);
                                out.add(o);
                            }
                        }
                    } catch (Exception ignored) {}
                    cur = null; recDepth = -1;
                }
                depth--;
            }
            ev = p.next();
        }
        Collections.sort(out, new Comparator<JSONObject>() {
            public int compare(JSONObject a, JSONObject b) { return Double.compare(a.optDouble("km"), b.optDouble("km")); }
        });
        JSONArray list = new JSONArray();
        for (int i = 0; i < out.size() && i < max; i++) list.put(out.get(i));
        JSONObject res = new JSONObject();
        res.put("ok", true); res.put("list", list); res.put("total", total); res.put("modified", mod == null ? "" : mod);
        return res;
    }

    static String attr(XmlPullParser p, String local) {
        for (int i = 0; i < p.getAttributeCount(); i++) if (local.equals(p.getAttributeName(i))) return p.getAttributeValue(i);
        return "";
    }

    /** Text of a simple element; skips nested tags. Leaves the parser on the element's END_TAG. */
    static String readText(XmlPullParser p) throws Exception {
        StringBuilder b = new StringBuilder(); int d = 1;
        while (d > 0) {
            int ev = p.next();
            if (ev == XmlPullParser.START_TAG) d++;
            else if (ev == XmlPullParser.END_TAG) d--;
            else if (ev == XmlPullParser.TEXT && d == 1) b.append(p.getText());
            else if (ev == XmlPullParser.END_DOCUMENT) break;
        }
        return b.toString().trim();
    }

    static double km(double a1, double o1, double a2, double o2) {
        double r = Math.PI / 180, dla = (a2 - a1) * r, dlo = (o2 - o1) * r;
        double h = Math.sin(dla / 2) * Math.sin(dla / 2) + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dlo / 2) * Math.sin(dlo / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
}
