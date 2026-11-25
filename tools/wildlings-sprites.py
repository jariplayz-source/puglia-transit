"""Build Wildlings species from credited Tuxemon creatures: recolour to the type colour, make Black & White style idle animations."""
import yaml, os, re, colorsys, json, base64, io, hashlib, math
from PIL import Image
exec(open('/tmp/tuxpick.py').read().split("# --- whole lines")[0])
TYPE={  # our type for each line (by first member)
 'agnite':'ember','cardiling':'ember','djinnbo':'ember',
 'anoleaf':'leaf','chloragon':'leaf','lambert':'leaf','bamboon':'leaf','conifrost':'leaf','dandylion':'leaf','fruitera':'leaf','spycozeus':'leaf',
 'tweesher':'tide','axolightl':'tide','dollfin':'tide','nostray':'tide','chillimp':'tide','hydrone':'tide',
 'selket':'stone','sludgehog':'stone','wrougon':'stone',
 'arthrobolt':'spark','merlicun':'spark','pigabyte':'spark','propellercat':'spark',
 'corvix':'gust','noctula':'gust',
 'eyenemy':'shade','cateye':'shade','cairfrey':'shade','tumbleworm':'shade','vamporm':'shade',
 'aardorn':'wild','capiti':'wild','zunna':'wild'}
HUE={'ember':(12,1.0),'tide':(212,1.0),'leaf':(105,1.0),'spark':(50,1.0),'shade':(278,0.9),'gust':(196,0.55),'stone':(28,0.42),'wild':(34,0.6)}
cred={s for s in mons if s.lower() in CRED}
def prev(s):return [x for x in cred if any(e['monster_slug']==s for e in (mons[x].get('evolutions') or []))]
lines=[]
for s in sorted(cred):
    if prev(s):continue
    line=[s];cur=mons[s]
    while cur.get('evolutions'):
        nx=[e for e in cur['evolutions'] if e['monster_slug'] in cred]
        if not nx or nx[0]['monster_slug'] in line:break
        line.append(nx[0]['monster_slug']);cur=mons[nx[0]['monster_slug']]
    lines.append(line)
def sheet(slug):return Image.open(SPR+f'/{slug}-sheet.png').convert('RGBA')
def hue_ok(t,c):return fits(t,c)
def recolour(im,t):
    """Shift the main colour family of the sprite to the type's colour; outlines, eyes and small accents stay."""
    px=im.load();W,H=im.size;bins={}
    for y in range(H):
        for x in range(W):
            r,g,b,a=px[x,y]
            if a<200:continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            if s<0.18 or v<0.2:continue
            k=int(h*360)//20;bins[k]=bins.get(k,0)+1
    tot=sum(1 for y in range(H) for x in range(W) if px[x,y][3]>=200)
    th,ts=HUE[t]
    if (not bins or sum(bins.values())<tot*0.35) and t not in ('stone','wild'):
        # mostly grey: tint the greys with the type colour
        out=im.copy();po=out.load()
        for y in range(H):
            for x in range(W):
                r,g,b,a=px[x,y]
                if a<10:continue
                h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
                if s<0.28 and 0.22<v<0.97 or (t=='spark' and s<0.6 and 0.22<v and abs(((h*360-35+540)%360)-180)<40):
                    rr,gg,bb=colorsys.hsv_to_rgb(th/360,0.62 if t=='spark' else 0.5*(0.6 if t=='gust' else 1),min(1,v*1.18+0.08) if t=='spark' else v);po[x,y]=(int(rr*255),int(gg*255),int(bb*255),a)
        return out
    if not bins:return im
    dom=max(bins,key=bins.get)*20+10
    out=im.copy();po=out.load()
    for y in range(H):
        for x in range(W):
            r,g,b,a=px[x,y]
            if a<10:continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            dh=((h*360-dom+540)%360)-180
            if s<0.15 or abs(dh)>50:continue
            nh=((th+dh*0.5)%360)/360;ns=min(1,s*ts) if ts<1 else min(1,s*1.05)
            if t=='spark':v=min(1,v*1.22+0.1);ns=max(ns,0.6)
            rr,gg,bb=colorsys.hsv_to_rgb(nh,ns,v)
            po[x,y]=(int(rr*255),int(gg*255),int(bb*255),a)
    return out
def sparkify(im):
    out=im.copy();po=out.load();W,H=im.size
    for y in range(H):
        for x in range(W):
            r,g,b,a=po[x,y]
            if a<10:continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255);hd=h*360
            if v>0.42 and (s<0.3 or 15<hd<75):
                rr,gg,bb=colorsys.hsv_to_rgb(50/360,max(s,0.68),min(1,v*1.3+0.12));po[x,y]=(int(rr*255),int(gg*255),int(bb*255),a)
    return out
def frames(im,n=16,amp=0.05,sway=1.6):
    """Black & White style idle: the body breathes (squash and stretch towards the feet, wider when lower),
    and a soft wave runs up the body so the head and top lag behind, like the handheld games."""
    W,H=im.size;px=im.load()
    pts=[(x,y) for y in range(H) for x in range(W) if px[x,y][3]>20]
    top=min(p[1] for p in pts);bot=max(p[1] for p in pts);h=max(1,bot-top);cx=sum(p[0] for p in pts)/len(pts)
    out=Image.new('RGBA',(W*n,H),(0,0,0,0))
    for f in range(n):
        ph=2*math.pi*f/n;sq=math.sin(ph)
        fr=Image.new('RGBA',(W,H),(0,0,0,0));pf=fr.load()
        for y in range(H):
            sy=bot-(bot-y)/(1+amp*sq)
            iy=int(round(sy))
            if iy<0 or iy>=H:continue
            k=max(0.0,min(1.0,(bot-iy)/h))
            ox=sway*math.sin(ph-1.3*k)*k**1.3
            wx=1+0.55*amp*sq*(1-0.6*k)
            for x in range(W):
                sx=int(round(cx+(x-ox-cx)/wx))
                if 0<=sx<W:pf[x,y]=px[sx,iy]
        out.paste(fr,(f*W,0))
    return out
def b64(im):
    b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
SP=[];FR=[];BK=[];CR=[];idx={}
for line in lines:
    t=TYPE.get(line[0])
    if not t:continue
    for i,s in enumerate(line):idx[s]=len(idx)
def tmap(x):return MAP.get(x)
order=[s for line in lines if TYPE.get(line[0]) for s in line]
for s in order:
    d=mons[s];line=next(l for l in lines if s in l);t=TYPE[line[0]];i=line.index(s)
    sh=sheet(s);front=sh.crop((0,0,64,64));back=sh.crop((64,0,128,64))
    col=colour(s);rec=not fits(t,col)
    if rec:front=recolour(front,t);back=recolour(back,t)
    if t=='spark':front=sparkify(front);back=sparkify(back)
    st=i;n=len(line)
    nxt=line[i+1] if i+1<n else None
    evlv=0
    if nxt:
        e=[e for e in d['evolutions'] if e['monster_slug']==nxt][0];evlv=max(14,min(40,int(e.get('at_level') or 20)))
        if i==1:evlv=max(evlv,30)
    h=int(hashlib.md5(s.encode()).hexdigest()[:8],16)
    tot=[300,410,500][min(st,2)]+(60 if n==1 and d.get('stage')=='standalone' else 0)
    w=[(h>>k)%7+4 for k in (0,4,8,12)];sw_=sum(w);hp,atk,df,spd=[round(tot*x/sw_) for x in w]
    t2s=[tmap(x) for x in d['types'][1:]]+[None];t2=t2s[0] if t2s[0] and t2s[0]!=t else {'ember':'stone','tide':'stone','leaf':'stone','spark':'wild','shade':'wild','gust':'wild','stone':'wild','wild':'shade'}[t]
    cr=float(d.get('catch_rate') or 100);rar=1 if cr>=100 else 2 if cr>=45 else 3
    if st>=2:rar=max(rar,2)
    name=s.replace('_',' ').title()
    SP.append([name,t,hp,atk,df,spd,idx[nxt] if nxt else -1,evlv,t2,rar,h%9973,min(st,2)])
    FR.append(b64(frames(front)));BK.append(b64(frames(back,amp=0.04,sway=1.0)))
    c=CRED[s.lower()];CR.append([name,c['by'],c['lic'],rec])
json.dump({'SP':SP,'FR':FR,'BK':BK,'CR':CR,'order':order},open('/tmp/tuxdata.json','w'))
print(len(SP),sum(len(x) for x in FR+BK)//1024,'KB')
for i,r in enumerate(SP):print(i,r[0],r[1],'evo->',r[6],r[7],'stage',r[11],'rar',r[9],'recol' if CR[i][3] else '')
