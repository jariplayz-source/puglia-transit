/* Out & Back relay: a tiny stand-in for ntfy.sh on your own free Cloudflare account.
   It only ever sees encrypted text (the app encrypts before sending), keeps messages 3 days, then deletes them.
   Speaks the bits of the ntfy API the app uses:
     POST /<topic>                       body = message                      -> {id,time,event,topic,message}
     PUT  /<topic>  (Filename, Message)  body = attachment, header = message -> {..., attachment:{name,url,size}}
     GET  /<topic>/json?poll=1&since=…   since = message id | 10m/12h/2d | unix seconds | all  -> one JSON message per line
     GET  /file/<id>                     the attachment
   Topics look like pt-<32 hex>, exactly as the app makes them; anything else is refused. */
const TOPIC = /^pt-[0-9a-f]{32}$/;
const KEEP_S = 3 * 86400;             // keep messages and files for 3 days
const MAX_MSG = 16 * 1024;            // a message (encrypted location / note) is small
const MAX_FILE = 4 * 1024 * 1024;     // photo or voice note, encrypted
const MAX_LIST = 300;                 // at most this many messages per poll
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "Filename,Message,Content-Type,Title,Priority,Tags" };
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { "Content-Type": "application/json", ...CORS } });
const err = (st, m) => json({ code: st, http: st, error: m }, st);
const newId = () => { const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", b = crypto.getRandomValues(new Uint8Array(12)); let s = ""; for (const x of b) s += a[x % a.length]; return s; };

export default {
  async fetch(req, env) {
    const url = new URL(req.url), p = url.pathname.split("/").filter(Boolean);
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method === "GET" && p.length === 0) return new Response("Out & Back relay is running.", { headers: CORS });

    // attachment download
    if (req.method === "GET" && p[0] === "file" && p[1]) {
      const r = await env.DB.prepare("SELECT data, name FROM files WHERE id = ?").bind(p[1]).first();
      if (!r) return err(404, "not found (files are kept 3 days)");
      return new Response(r.data, { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "private, max-age=86400", ...CORS } });
    }

    const topic = p[0];
    if (!topic || !TOPIC.test(topic)) return err(400, "unknown topic");

    // poll
    if (req.method === "GET" && p[1] === "json") {
      const since = url.searchParams.get("since") || "all";
      let q, args;
      const now = Math.floor(Date.now() / 1000);
      if (since === "all") { q = "time >= ?"; args = [now - KEEP_S]; }
      else if (/^\d+$/.test(since)) { q = "time >= ?"; args = [+since]; }
      else if (/^\d+[smhd]$/.test(since)) { const n = parseInt(since), u = { s: 1, m: 60, h: 3600, d: 86400 }[since.slice(-1)]; q = "time >= ?"; args = [now - n * u]; }
      else {
        const ref = await env.DB.prepare("SELECT seq FROM messages WHERE id = ? AND topic = ?").bind(since, topic).first();
        if (ref) { q = "seq > ?"; args = [ref.seq]; } else { q = "time >= ?"; args = [now - 12 * 3600]; }   // unknown id: like ntfy, fall back
      }
      const rows = await env.DB.prepare(`SELECT id, time, message, att_name, att_size FROM messages WHERE topic = ? AND ${q} ORDER BY seq LIMIT ${MAX_LIST}`).bind(topic, ...args).all();
      const base = url.origin;
      const lines = (rows.results || []).map(r => JSON.stringify({ id: r.id, time: r.time, event: "message", topic, message: r.message,
        ...(r.att_name ? { attachment: { name: r.att_name, size: r.att_size, url: `${base}/file/${r.id}` } } : {}) }));
      return new Response(lines.length ? lines.join("\n") + "\n" : "", { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store", ...CORS } });
    }

    // publish
    if ((req.method === "POST" || req.method === "PUT") && p.length === 1) {
      const fname = req.headers.get("Filename");
      const body = new Uint8Array(await req.arrayBuffer());
      const id = newId(), time = Math.floor(Date.now() / 1000);
      let message, att = null;
      if (fname) {
        if (body.length > MAX_FILE) return err(413, "attachment too large");
        message = req.headers.get("Message") || req.headers.get("X-Message") || "";
        att = { name: fname.slice(0, 64), size: body.length };
        await env.DB.prepare("INSERT INTO files (id, topic, time, name, data) VALUES (?, ?, ?, ?, ?)").bind(id, topic, time, att.name, body).run();
      } else {
        if (body.length > MAX_MSG) return err(413, "message too large");
        message = new TextDecoder().decode(body);
      }
      if (message.length > MAX_MSG) return err(413, "message too large");
      await env.DB.prepare("INSERT INTO messages (id, topic, time, message, att_name, att_size) VALUES (?, ?, ?, ?, ?, ?)").bind(id, topic, time, message, att ? att.name : null, att ? att.size : null).run();
      return json({ id, time, event: "message", topic, message, ...(att ? { attachment: { ...att, url: `${url.origin}/file/${id}` } } : {}) });
    }
    return err(405, "not supported");
  },

  // once a day: delete everything older than 3 days
  async scheduled(ev, env) {
    const cut = Math.floor(Date.now() / 1000) - KEEP_S;
    await env.DB.prepare("DELETE FROM messages WHERE time < ?").bind(cut).run();
    await env.DB.prepare("DELETE FROM files WHERE time < ?").bind(cut).run();
  },
};
