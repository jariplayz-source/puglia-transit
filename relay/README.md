# Out & Back relay (your own, practically unlimited)

The app passes group messages (locations, check-ins, photos, voice notes) through a relay. The free public one (ntfy.sh) allows about 250 messages a day per internet connection. This is your own relay on Cloudflare's free plan: about 100,000 requests a day, which is effectively unlimited for a few people.

- It only stores **encrypted** data: your phones encrypt everything before it leaves them, the relay can't read it.
- Messages and files are deleted automatically after 3 days.
- Cost: €0 on Cloudflare's free plan (Workers + D1). No credit card needed.

## Set it up in the browser (about 15 minutes, no installing)

1. **Make a free Cloudflare account** at dash.cloudflare.com/sign-up and confirm your email.
2. **Create the database:** Storage & Databases → D1 SQL Database → Create. Name it `outandback`.
3. **Make the tables:** open the database → Console → paste everything from `schema.sql` → Execute.
4. **Create the Worker:** Compute → Workers & Pages → Create → Worker → start from "Hello World", name it `outandback-relay` → Deploy.
5. **Put in the code:** Edit code → delete everything → paste all of `worker.js` → Deploy.
6. **Connect the database:** the Worker → Settings → Bindings → Add → D1 database. Variable name `DB`, database `outandback` → Save.
7. **Daily clean-up:** Settings → Trigger events → Add → Cron trigger → `17 3 * * *` → Add.
8. **Check it:** open the Worker's address (`https://outandback-relay.<your-name>.workers.dev`). It should say "Out & Back relay is running."
9. **Send the address to Claude.**

## Or with the command line (on a computer)

1. **Make a free Cloudflare account** at dash.cloudflare.com/sign-up and confirm your email.
2. **Install the tool** (needs Node.js from nodejs.org): open a terminal and run
   `npm install -g wrangler` and then `wrangler login` (a browser window opens: allow it).
3. **Create the database:** in this `relay` folder run
   `wrangler d1 create outandback`
   It prints a `database_id`. Paste it into `wrangler.toml` where it says `PASTE-THE-ID-FROM-STEP-3-HERE`.
4. **Create the tables:**
   `wrangler d1 execute outandback --remote --file=schema.sql`
5. **Publish the relay:**
   `wrangler deploy`
   It prints your relay's address, something like `https://outandback-relay.<your-name>.workers.dev`.
6. **Check it:** open that address in a browser. It should say "Out & Back relay is running."
7. **Send the address to Claude.** The app update that switches your groups to it is then made (your groups move over automatically, also on Giulia's and Tom's phones).

## Good to know
- If the relay is ever unreachable, the app falls back to ntfy.sh and to Bluetooth/text messages, as it does now.
- Limits in the code: messages 16 KB, photos/voice notes 4 MB (stored in pieces, a database row holds at most 2 MB), 300 messages per check.
- To stop it: delete the Worker and the D1 database in the Cloudflare dashboard.
