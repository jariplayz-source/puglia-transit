"""Provinces of the Netherlands and Italy for the app: outline (simplified), box, 8 gym sites in the biggest towns and an Elite Four site.
Data: Natural Earth (public domain)."""
import json, hashlib
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union
adm=json.load(open('/tmp/ne/adm1.geojson'));urb=json.load(open('/tmp/ne/urban.geojson'));plc=json.load(open('/tmp/ne/places.geojson'))
urban=[(shape(f['geometry']),f['properties'].get('area_sqkm') or 0) for f in urb['features']]
places=[(float(c['lng']),float(c['lat']),c['name'],0) for c in json.load(open('/tmp/ne/cities.json')) if c.get('country') in ('IT','NL')]
out=[]
CAP={'Drenthe':'Assen','Flevoland':'Lelystad','Friesland':'Leeuwarden','Gelderland':'Arnhem','Groningen':'Groningen','Limburg':'Maastricht','Noord-Brabant':"'s-Hertogenbosch",'Noord-Holland':'Haarlem','Overijssel':'Zwolle','Utrecht':'Utrecht','Zeeland':'Middelburg','Zuid-Holland':'The Hague',
 'Aosta':'Aosta','Bolzano':'Bolzano','Barletta-Andria-Trani':'Barletta','Monza e della Brianza':'Monza','Forlì-Cesena':'Forlì','Pesaro e Urbino':'Pesaro','Massa-Carrara':'Massa','Verbano-Cusio-Ossola':'Verbania','Carbonia-Iglesias':'Carbonia','Medio Campidano':'Sanluri','Olbia-Tempio':'Olbia','Ogliastra':'Tortolì'}
for f in adm['features']:
    p=f['properties']
    if p['adm0_a3'] not in ('ITA','NLD') or p['type_en']!='Province':continue
    g=shape(f['geometry'])
    name=p['name_it'] if p['adm0_a3']=='ITA' and p.get('name_it') else p['name']
    simp=g.simplify(0.01,preserve_topology=True)
    polys=[simp] if simp.geom_type=='Polygon' else list(simp.geoms)
    polys=[q for q in polys if q.area>0.0005] or [max(polys,key=lambda q:q.area)]
    ring=[[[round(x,3),round(y,3)] for x,y in q.exterior.coords] for q in polys]
    minx,miny,maxx,maxy=g.bounds
    # gym sites: centres of the biggest urban areas inside, at least 6 km apart
    cand=[]
    for u,a in urban:
        if not u.intersects(g):continue
        c=u.representative_point()
        if not g.contains(c):continue
        cand.append((a,c.x,c.y))
    cand.sort(reverse=True)
    sites=[]
    def far_enough(x,y,d=0.06):return all((x-a)**2+(y-b)**2>d*d for a,b in sites)
    for a,x,y in cand:
        if far_enough(x,y):sites.append((x,y))
        if len(sites)>=9:break
    # not enough towns: spread the rest over the province
    h=int(hashlib.md5(name.encode()).hexdigest()[:8],16);k=0
    while len(sites)<9 and k<4000:
        k+=1;h=(h*1103515245+12345)&0x7fffffff
        x=minx+(h%10000)/10000*(maxx-minx);h=(h*1103515245+12345)&0x7fffffff;y=miny+(h%10000)/10000*(maxy-miny)
        if g.contains(Point(x,y)) and far_enough(x,y,0.08 if k<2000 else 0.03):sites.append((x,y))
    def town(x,y):
        best=None;bd=1e9
        for px,py,n,pop in places:
            d=(px-x)**2+(py-y)**2
            if d<bd:bd=d;best=n
        return best if bd<0.07**2 else None
    gyms=[[round(y,4),round(x,4),town(x,y)] for x,y in sites[:8]]
    cap=CAP.get(name,name);cc=[(px,py,n) for px,py,n,_ in places if n.lower()==cap.lower() and g.buffer(0.05).contains(Point(px,py))]
    e4=[round(cc[0][1],4),round(cc[0][0],4),cc[0][2]] if cc else [round(sites[0][1],4),round(sites[0][0],4),town(*sites[0])]
    out.append({'id':('nl-' if p['adm0_a3']=='NLD' else 'it-')+name.lower().replace(' ','-').replace("'",''),'n':name,'c':p['adm0_a3'][:2].lower() if p['adm0_a3']=='NLD' else 'it','r':p.get('region') or '',
                'b':[round(minx,3),round(miny,3),round(maxx,3),round(maxy,3)],'p':ring,'g':gyms,'e':e4})
out.sort(key=lambda o:(o['c'],o['n']))
s=json.dumps(out,separators=(',',':'),ensure_ascii=False)
open('/home/claude/puglia-transit/provinces.js','w').write('/* Provinces of the Netherlands and Italy (outlines simplified), with gym and Elite Four sites. Natural Earth (public domain); town names from GeoNames (CC BY 4.0). */\nwindow.PT_PROV='+s+';\n')
print(len(out),len(s)//1024,'KB')
for o in out[:3]+[x for x in out if x['n'] in ('Lecce','Brindisi','Utrecht')]:print(o['n'],o['c'],o['r'],o['e'],[g[2] for g in o['g']])
