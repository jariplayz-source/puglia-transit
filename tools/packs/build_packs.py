"""Build all survival packs + index, render pack pictures, inject the catalog into the app, and check for duplicates.
Usage: python3 build_packs.py [--write]   (without --write it only checks)"""
import json, re, subprocess, sys, copy, os, difflib
sys.path.insert(0, os.path.dirname(__file__))
import packs2 as P

APP = "/home/claude/puglia-transit/surv.js"
REPO = "/home/claude/pt-repo/packs"
WRITE = "--write" in sys.argv
html = open(APP).read()

# ---------- load what exists ----------
m = re.search(r"const SURV_BASE=(\[.*?\]);\n", html, re.S)
base = json.loads(m.group(1))
old = {k: json.load(open(f"{REPO}/pack-{k}.json")) for k in ("outdoors", "disasters", "offgrid", "travel")}

def clean(g):
    g = {k: v for k, v in g.items() if v not in (None, [], "") or k in ("s",)}
    g.setdefault("call", False); g.setdefault("d", [])
    return g

# ---------- reshuffle existing packs ----------
out, dis, off, trv = (copy.deepcopy(old[k]) for k in ("outdoors", "disasters", "offgrid", "travel"))
water = next((g for g in out["guides"] if g["id"] == "water"), None)
if water:
    out["guides"] = [g for g in out["guides"] if g["id"] != "water"]
    water["cat"] = "grid"
    i = next(i for i, g in enumerate(off["guides"]) if g["id"] == "filter")
    off["guides"].insert(i, water)
for g in P.ADD_OUT:
    if not any(x["id"] == g["id"] for x in out["guides"]): out["guides"].append(clean(g))
for g in P.ADD_DIS:
    if not any(x["id"] == g["id"] for x in dis["guides"]): dis["guides"].append(clean(g))
SEE = {"water": ["filter", "taps"], "filter": ["water", "taps"], "taps": ["water", "filter", "longout"], "lost": ["nophone", "compass", "dark"],
       "signal": ["morse", "walkie"], "storm": ["clouds", "thunder"], "evac": ["dike", "kit", "contactplan"], "kit": ["zgobag", "carkit"],
       "nopowercook": ["longout", "campcook"], "fridge": ["longout", "storing"], "keepwarm": ["longout"], "shelter": ["tautline", "lashing"],
       "campcook": ["chestnut"], "jelly": ["urchin", "weever"], "phone": ["smsbusy"], "medical": ["mushpoison"],
       # built-in
       "flood": ["dike", "evac"], "nonet": ["longout", "smsbusy", "contactplan"], "north": ["compass", "papermap"],
       "thunder": ["clouds", "storm"], "sling": ["splint", "reef"], "bleeding": ["wound"], "daylight": ["dark", "distance"], "daybag": ["carkit"]}
for pk in (out, dis, off, trv):
    for g in pk["guides"]:
        if g["id"] in SEE: g["see"] = SEE[g["id"]]
meta = {"outdoors": ("nature", "Rip currents, jellyfish, sea urchins, weever fish, snakes, stings, cold, getting lost, signalling"),
        "disasters": ("danger", "Wildfire, storms, heatwaves, high water and dike breaches, long power cuts, evacuation, emergency kit"),
        "offgrid": ("home", "Making fire, cooking without power, keeping food safe, simple shelter, drinking water and staying warm"),
        "travel": ("road", "Lost passport, phone or cards, doctor abroad, lost luggage, scams")}
for pk in (out, dis, off, trv):
    pk["shelf"], pk["desc"] = meta[pk["id"]]
    pk["v"] = 2
out["name"] = "Outdoors & sea"

# ---------- built-in basics ----------
base = [g for g in base if g["id"] != "knots"]
for g in P.ADD_BASE:
    if not any(x["id"] == g["id"] for x in base):
        i = next(i for i, x in enumerate(base) if x["id"] == "sling") + 1
        base.insert(i, clean(g))
for g in base:
    if g["id"] in SEE: g["see"] = SEE[g["id"]]

# ---------- new packs ----------
new = []
for p in P.PACKS:
    for g in p["guides"]:
        k = [n for n in g.get("a", []) if n and n.startswith("k_")]
        if p["id"] == "knots" and k and "hero" not in g: g["hero"] = k[-1]
    pk = {"id": p["id"], "v": p.get("v", 1), "name": p["name"], "ic": p["ic"], "desc": p["desc"], "shelf": p["shelf"], "guides": [clean(g) for g in p["guides"]]}
    new.append(pk)
packs = [out, dis, off, trv] + new

# ---------- checks ----------
DISTINCT=[{"call","signal"},{"north","nophone"}]   # similar names, different topics (checked by hand)
errs, warn = [], []
app_art = set(re.findall(r"^\s*([a-z0-9]+):\(\)=>", html[html.index("const SV_ART={"):html.index("const SV_STEPS=")], re.M))
steps_map = re.search(r"const SV_STEPS=\{(.*?)\};", html, re.S).group(1)
ids = {}
for g in base: ids.setdefault(g["id"], []).append("built-in")
for pk in packs:
    for g in pk["guides"]: ids.setdefault(g["id"], []).append(pk["id"])
for k, v in ids.items():
    if len(v) > 1: errs.append(f"duplicate id {k}: {v}")
allg = [(g, "built-in") for g in base] + [(g, pk["id"]) for pk in packs for g in pk["guides"]]
norm = lambda t: re.sub(r"[^a-z ]", "", t.lower().replace("(", " ").replace(")", " "))
for i, (a, pa) in enumerate(allg):
    for b, pb in allg[i + 1:]:
        r = difflib.SequenceMatcher(None, norm(a["t"]), norm(b["t"])).ratio()
        if r > 0.72 and {a["id"],b["id"]} not in DISTINCT: errs.append(f"similar titles: '{a['t']}' ({pa}) ~ '{b['t']}' ({pb}) {r:.2f}")
for g, pk in allg:
    for s in g.get("see", []):
        if s not in ids: errs.append(f"{g['id']}: see-also target '{s}' doesn't exist")
        if s == g["id"]: errs.append(f"{g['id']}: sees itself")
    if len(g.get("a", [])) > len(g["s"]): errs.append(f"{g['id']}: more pictures than steps")
    if pk != "built-in" and pk in [p["id"] for p in new] and not g.get("a"): warn.append(f"{g['id']}: no pictures")
used = sorted({n for g, _ in allg for n in g.get("a", []) + [g.get("hero")] if n})
need = [n for n in used if n not in app_art]
# render pack pictures with the app's own drawing code
helpers = html[html.index("/* ---------- SURVIVAL PICTURES"):html.index("/* ---------- SURVIVAL (basics")]
scenes = open(os.path.join(os.path.dirname(__file__), "scenes3.js")).read()
js = helpers + "\n" + scenes + "\nconst need=" + json.dumps(need) + ";const out={},miss=[];for(const n of need){if(NEW_ART[n])out[n]=NEW_ART[n]().replace(/\\s+/g,' ');else miss.push(n);}console.log(JSON.stringify({out,miss,extra:Object.keys(NEW_ART).filter(k=>!need.includes(k))}));"
open("/tmp/packart.js", "w").write(js)
r = subprocess.run(["node", "/tmp/packart.js"], capture_output=True, text=True)
if r.returncode: print(r.stderr[:2000]); sys.exit(1)
R = json.loads(r.stdout)
for n in R["miss"]: errs.append(f"picture '{n}' doesn't exist")
if R["extra"]: warn.append(f"unused pictures: {R['extra']}")
for pk in packs:
    names = sorted({n for g in pk["guides"] for n in g.get("a", []) + [g.get("hero")] if n in R["out"]})
    if names: pk["art"] = {n: R["out"][n] for n in names}
    elif "art" in pk: del pk["art"]

print(f"built-in: {len(base)} guides; packs: " + ", ".join(f"{p['id']} {len(p['guides'])}" for p in packs))
print(f"{len(ids)} guides in total, {len(need)} pack pictures")
for w in warn: print("warn:", w)
for e in errs: print("ERROR:", e)
if errs: sys.exit(1)

if WRITE:
    idx = {"v": 2, "packs": []}
    for pk in packs:
        txt = json.dumps(pk, ensure_ascii=False, separators=(",", ":"))
        open(f"{REPO}/pack-{pk['id']}.json", "w").write(txt)
        idx["packs"].append({"id": pk["id"], "v": pk["v"], "name": pk["name"], "ic": pk["ic"], "desc": pk["desc"], "shelf": pk["shelf"],
                             "n": len(pk["guides"]), "size": len(txt.encode()), "guides": [{"id": g["id"], "t": g["t"], "w": g.get("w", "")} for g in pk["guides"]]})
    open(f"{REPO}/index.json", "w").write(json.dumps(idx, ensure_ascii=False, separators=(",", ":")))
    h = html
    h = h[:m.start(1)] + json.dumps(base, ensure_ascii=False, separators=(",", ":")) + h[m.end(1):]
    h = re.sub(r"const SURV_OFFER_BUILTIN=/\*SURV_INDEX\*/\[.*?\];", lambda _: "const SURV_OFFER_BUILTIN=/*SURV_INDEX*/" + json.dumps(idx["packs"], ensure_ascii=False, separators=(",", ":")) + ";", h, flags=re.S)
    # pictures for the new built-in guides
    sm = re.search(r"const SV_STEPS=\{", h)
    add = "".join(f"{k}:{json.dumps(v)}," for k, v in P.BASE_STEPS.items() if f"{k}:[" not in h[sm.end():sm.end() + 6000])
    h = h[:sm.end()] + add + h[sm.end():]
    open(APP, "w").write(h)
    print("written:", [p["id"] for p in packs], "index", len(json.dumps(idx)), "bytes")
