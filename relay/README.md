# Out & Back relay (your own, practically unlimited)

The app passes group messages (locations, check-ins, photos, voice notes) through a relay. The free public one (ntfy.sh) allows about 250 messages a day per internet connection. This is your own relay on Cloudflare's free plan: about 100,000 requests a day, which is effectively unlimited for a few people.

- It only stores **encrypted** data: your phones encrypt everything before it leaves them, the relay can't read it.
- Messages and files are deleted automatically after 3 days.
- Cost: €0 on Cloudflare's free plan (Workers + D1). No credit card needed.

## Set it up (about 15 minutes, on a computer)

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
- Limits in the code: messages 16 KB, photos/voice notes 4 MB, 300 messages per check.
- To stop it: delete the Worker and the D1 database in the Cloudflare dashboard.
