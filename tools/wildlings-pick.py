"""Pick Tuxemon creatures for Wildlings: whole evolution lines whose colours match their type, with credits."""
import yaml, os, re, colorsys, json, base64, io, hashlib
from PIL import Image
R='/tmp/tux/repo/mods/tuxemon'
SPR=R+'/gfx/sprites/battle'
MAP={'fire':'ember','water':'tide','frost':'tide','wood':'leaf','earth':'stone','metal':'stone','sky':'gust','lightning':'spark','shadow':'shade','cosmic':'shade','venom':'shade','normal':'wild','heroic':'wild'}
# --- credits
att=open('/tmp/tux/repo/ATTRIBUTIONS.md').read()
sec=att[att.index('### Tuxemon'):att.index('### Bubbles')]
CRED={}
for m in re.finditer(r'\* \["([^"]+)"\]\([^)]*\)\s*by\s*(.*?)\s*is licensed under\s*\[([^\]]+)\]',sec,re.S):
    name,who,lic=m.group(1),m.group(2),m.group(3)
    authors=re.findall(r'\[([^\]]+)\]',who) or [who.strip()]
    CRED[name.lower()]={'by':', '.join(a for a in authors),'lic':lic.strip()}
mons={}
for f in os.listdir(R+'/db/monster'):
    d=yaml.safe_load(open(R+'/db/monster/'+f))
    mons[d['slug']]=d
# --- colour of the front sprite
def colour(slug):
    p=SPR+f'/{slug}-sheet.png'
    if not os.path.exists(p):return None
    im=Image.open(p).convert('RGBA').crop((0,0,64,64))
    px=[c for c in im.getdata() if c[3]>200]
    if len(px)<150:return None
    bins={}
    for r,g,b,a in px:
        h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
        if v<0.18:continue                     # outlines
        if s<0.22:k='grey' if v<0.8 else 'white'
        else:k=int(h*360)//15
        bins[k]=bins.get(k,0)+1
    tot=sum(bins.values()) or 1
    return {k:v/tot for k,v in bins.items()}
def share(c,lo,hi):return sum(v for k,v in c.items() if isinstance(k,int) and lo<=k*15<hi)
def fits(t,c):
    red=share(c,0,30)+share(c,345,360);orange=share(c,15,45);yellow=share(c,45,70);green=share(c,70,165);blue=share(c,165,250);purple=share(c,250,330);grey=c.get('grey',0);white=c.get('white',0)
    if t=='ember':return red+orange>0.45 and green<0.2 and blue<0.2
    if t=='tide':return blue>0.45 and green<0.25
    if t=='leaf':return green>0.45
    if t=='spark':return yellow>0.38 and blue<0.3 and green<0.3
    if t=='shade':return purple>0.38 or (purple+grey>0.6 and purple>0.2)
    if t=='gust':return blue+white+grey>0.6 and blue>0.15 and orange<0.25
    if t=='stone':return grey+orange>0.55 and green<0.15 and blue<0.2 and purple<0.15
    if t=='wild':return orange+red+grey+white+yellow>0.65 and green<0.15 and blue<0.15 and purple<0.15
    return False
def ok(slug):
    d=mons.get(slug)
    if not d or not d.get('types'):return None
    if d['slug'].lower() not in CRED:return None
    if 'NC' in CRED[d['slug'].lower()]['lic'].upper():return None
    t=MAP.get(d['types'][0])
    c=colour(slug)
    if not t or not c or not fits(t,c):return None
    return t
# --- whole lines: start from basic forms
lines=[]
for s,d in mons.items():
    if d.get('stage')!='basic':continue
    line=[s];cur=d
    while cur.get('evolutions'):
        nx=cur['evolutions'][0]['monster_slug']
        if nx not in mons or nx in line:break
        line.append(nx);cur=mons[nx]
    ts=[ok(x) for x in line]
    if ts[0] is None:continue
    keep=[line[0]]
    for x,t in zip(line[1:],ts[1:]):
        if t!=ts[0]:break
        keep.append(x)
    lines.append((ts[0],keep))
from collections import defaultdict
by=defaultdict(list)
for t,l in lines:by[t].append(l)
for t in by:print(t,len(by[t]),[len(l) for l in by[t]][:30])
json.dump({t:by[t] for t in by},open('/tmp/tuxlines.json','w'))
json.dump(CRED,open('/tmp/tuxcred.json','w'))
