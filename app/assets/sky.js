/* Star map: point your phone at the sky. Stars, constellations, planets, the Moon and the Sun where they really are,
   with the camera behind it, a time slider, search with an arrow that shows the way, and a guide to finding your way by the stars.
   Works offline: everything is calculated on the phone. Star data: skydata.js. */
(function(){
const R=Math.PI/180,esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LANG=()=>{try{return typeof mapLang==="function"?mapLang():"en";}catch(e){return "en";}};
const jd=t=>t/864e5+2440587.5;
const gmst=t=>((280.46061837+360.98564736629*(jd(t)-2451545))%360+360)%360;
/* ---------- Sun and planets: JPL approximate Keplerian elements (good to well under a degree, 1800-2050) ---------- */
const EL={mercury:[0.38709927,0.20563593,7.00497902,252.2503235,77.45779628,48.33076593,0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.12534081],
 venus:[0.72333566,0.00677672,3.39467605,181.9790995,131.60246718,76.67984255,0.0000039,-0.00004107,-0.0007889,58517.81538729,0.00268329,-0.27769418],
 earth:[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0,0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0],
 mars:[1.52371034,0.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
 jupiter:[5.202887,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909,-0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
 saturn:[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448,-0.0012506,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794],
 uranus:[19.18916464,0.04725744,0.77263783,313.23810451,170.9542763,74.01692503,-0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589],
 neptune:[30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664]};
function helio(k,T){const q=EL[k],a=q[0]+q[6]*T,e=q[1]+q[7]*T,I=(q[2]+q[8]*T)*R,L=q[3]+q[9]*T,wb=q[4]+q[10]*T,Om=q[5]+q[11]*T;
  const w=(wb-Om)*R,O=Om*R,M=(((L-wb)%360)+540)%360-180;let E=M*R+e*Math.sin(M*R);for(let i=0;i<8;i++)E-=(E-e*Math.sin(E)-M*R)/(1-e*Math.cos(E));
  const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I);
  return [(cw*cO-sw*sO*cI)*xp+(-sw*cO-cw*sO*cI)*yp,(cw*sO+sw*cO*cI)*xp+(-sw*sO+cw*cO*cI)*yp,sw*sI*xp+cw*sI*yp];}
const EPS=23.43928*R;
function eq(v){const x=v[0],y=v[1]*Math.cos(EPS)-v[2]*Math.sin(EPS),z=v[1]*Math.sin(EPS)+v[2]*Math.cos(EPS),r=Math.hypot(x,y,z);return {ra:((Math.atan2(y,x)/R)+360)%360,dec:Math.asin(z/r)/R,dist:r};}
/* the Moon (low precision, with the main perturbations; topocentric correction happens when it's placed in your sky) */
function moonEq(t){const d=jd(t)-2451543.5,s=x=>Math.sin(x*R),c=x=>Math.cos(x*R);
  const N=125.1228-0.0529538083*d,i=5.1454,w=318.0634+0.1643573223*d,a=60.2666,e=0.0549,M=((115.3654+13.0649929509*d)%360+360)%360;
  let E=M+e/R*s(M)*(1+e*c(M));for(let k=0;k<5;k++)E=E-(E-e/R*s(E)-M)/(1-e*c(E));
  const xv=a*(c(E)-e),yv=a*Math.sqrt(1-e*e)*s(E),v=Math.atan2(yv,xv)/R,r=Math.hypot(xv,yv);
  let lon=Math.atan2(s(N)*c(v+w)+c(N)*s(v+w)*c(i),c(N)*c(v+w)-s(N)*s(v+w)*c(i))/R,lat=Math.asin(s(v+w)*s(i))/R;
  const Ms=356.047+0.9856002585*d,Ls=Ms+282.9404+4.70935e-5*d,Lm=N+w+M,D=Lm-Ls,F=Lm-N;
  lon+=-1.274*s(M-2*D)+0.658*s(2*D)-0.186*s(Ms)-0.059*s(2*M-2*D)-0.057*s(M-2*D+Ms)+0.053*s(M+2*D)+0.046*s(2*D-Ms)+0.041*s(M-Ms)-0.035*s(D)-0.031*s(M+Ms)-0.015*s(2*F-2*D)+0.011*s(M-4*D);
  lat+=-0.173*s(F-2*D)-0.055*s(M-F-2*D)-0.046*s(M+F-2*D)+0.033*s(F+2*D)+0.017*s(2*M+F);
  const rr=r-0.58*c(M-2*D)-0.46*c(2*D);
  const q=eq([c(lat)*c(lon),c(lat)*s(lon),s(lat)]);return {ra:q.ra,dec:q.dec,er:rr,lon,sunLon:Ls};}
/* ---------- names ---------- */
const PL_NAMES={sun:{en:"Sun",nl:"Zon",it:"Sole",de:"Sonne",fr:"Soleil",es:"Sol"},moon:{en:"Moon",nl:"Maan",it:"Luna",de:"Mond",fr:"Lune",es:"Luna"},
  mercury:{en:"Mercury",nl:"Mercurius",it:"Mercurio",de:"Merkur",fr:"Mercure",es:"Mercurio"},venus:{en:"Venus"},mars:{en:"Mars",fr:"Mars",es:"Marte",it:"Marte"},
  jupiter:{en:"Jupiter",it:"Giove",es:"Júpiter"},saturn:{en:"Saturn",nl:"Saturnus",it:"Saturno",de:"Saturn",fr:"Saturne",es:"Saturno"},uranus:{en:"Uranus",it:"Urano",es:"Urano"},neptune:{en:"Neptune",nl:"Neptunus",it:"Nettuno",de:"Neptun",es:"Neptuno"}};
const plName=k=>PL_NAMES[k][LANG()]||PL_NAMES[k].en;
const PL_INFO={sun:"Our star. Never look at it directly, and never through binoculars.",moon:"Earth's only natural moon, about 384,000 km away.",
  mercury:"The smallest planet and closest to the Sun. Only seen low in twilight, shortly after sunset or before sunrise.",
  venus:"The brightest thing in the night sky after the Moon. Often called the evening or morning star.",
  mars:"The red planet. Its orange colour gives it away.",jupiter:"The largest planet. Binoculars show up to four of its moons as tiny dots in a line.",
  saturn:"The ringed planet. A small telescope shows the rings.",uranus:"An ice giant, just about visible without a telescope from a very dark place.",neptune:"The farthest planet. Needs binoculars or a telescope."};
const PL_COL={mercury:"#c9b9a6",venus:"#fff3c4",mars:"#ff8a5c",jupiter:"#f2d6a8",saturn:"#e9d38f",uranus:"#a9e4ea",neptune:"#7f9cff"};
let D=null;
const starName=(hip)=>{const n=D.names[hip];if(!n)return null;return (n[2]&&n[2][LANG()])||n[0];};
const conName=d=>{const c=D.cons[d];if(!c)return d;return (c[5]&&c[5][LANG()])||c[0];};

/* ---------- maths: from the sky to your horizon ---------- */
// to east/north/up for a place (lat) and local sidereal time (deg)
function enu(ra,dec,lst,slat,clat){const H=(lst-ra)*R,sd=Math.sin(dec*R),cd=Math.cos(dec*R),cH=Math.cos(H);
  return [-cd*Math.sin(H),sd*clat-cd*cH*slat,sd*slat+cd*cH*clat];}
// precession from the J2000 catalogue to today's sky (about 0.36° by 2026)
function precess(ra,dec,T){const zeta=(2306.2181*T+0.30188*T*T)/3600*R,z=(2306.2181*T+1.09468*T*T)/3600*R,th=(2004.3109*T-0.42665*T*T)/3600*R;
  const a=ra*R,d=dec*R,A=Math.cos(d)*Math.sin(a+zeta),B=Math.cos(th)*Math.cos(d)*Math.cos(a+zeta)-Math.sin(th)*Math.sin(d),Cc=Math.sin(th)*Math.cos(d)*Math.cos(a+zeta)+Math.cos(th)*Math.sin(d);
  return [((Math.atan2(A,B)+z)/R+360)%360,Math.asin(Math.max(-1,Math.min(1,Cc)))/R];}
// the air bends light: near the horizon things look up to half a degree higher
function refract(v){const h=Math.asin(Math.max(-1,Math.min(1,v[2])))/R;if(h<-1.5)return v;const r=1.02/Math.tan((h+10.3/(h+5.11))*R)/60;const h2=(h+r)*R,c=Math.cos(h2)/Math.max(1e-9,Math.hypot(v[0],v[1]));return [v[0]*c,v[1]*c,Math.sin(h2)];}
const altaz=v=>({alt:Math.asin(Math.max(-1,Math.min(1,v[2])))/R,az:((Math.atan2(v[0],v[1])/R)+360)%360});
const norm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const eqv=(ra,dec)=>[Math.cos(dec*R)*Math.cos(ra*R),Math.cos(dec*R)*Math.sin(ra*R),Math.sin(dec*R)];
const vradec=v=>({ra:((Math.atan2(v[1],v[0])/R)+360)%360,dec:Math.asin(Math.max(-1,Math.min(1,v[2])))/R});
// a point k times as far along the great circle from a to b (k>1 goes past b)
function along(a,b,k){const A=eqv(a[0],a[1]),B=eqv(b[0],b[1]),th=Math.acos(Math.max(-1,Math.min(1,dot(A,B))));if(th<1e-6)return a;
  const s=Math.sin(th),fa=Math.sin((1-k)*th)/s,fb=Math.sin(k*th)/s;const p=vradec(norm([A[0]*fa+B[0]*fb,A[1]*fa+B[1]*fb,A[2]*fa+B[2]*fb]));return [p.ra,p.dec];}
function bvColor(bv){bv=Math.max(-0.4,Math.min(2,bv));if(bv<0)return "#aac4ff";if(bv<0.3)return "#dbe6ff";if(bv<0.6)return "#fff8f0";if(bv<1)return "#ffe7c0";if(bv<1.4)return "#ffcf96";return "#ffb07a";}

/* ---------- the guide: finding your way by the stars ---------- */
const STAR={polaris:11767,dubhe:54061,merak:53910,acrux:60718,gacrux:61084,rigilk:71683,hadar:68702,mintaka:25930,alnilam:26311,alnitak:26727,schedar:3179,caph:746,gcas:4427,ruchbah:6686,segin:8886,sirius:32349,vega:91262,deneb:102098,altair:97649};
const LESSONS=[
 {t:"Why the stars work as a compass",h:`The whole sky turns once a day around two fixed points: one exactly above the North Pole, one above the South Pole. Find that point and you know where north (or south) is, without a compass or a phone signal.<br><br>Everything else follows: stars <b>rise in the east</b>, climb, and <b>set in the west</b>, just like the Sun.`,show:null},
 {t:"North: the Pole Star",h:`In the northern half of the world, the <b>Pole Star</b> (Polaris) sits almost exactly above the North Pole and barely moves.<br><br>1. Find the <b>Big Dipper</b> (the “saucepan” in the Great Bear).<br>2. Take the two stars at the end of the pan, <b>Merak</b> then <b>Dubhe</b>.<br>3. Follow that line about <b>five times</b> their distance: the first fairly bright star you meet is the Pole Star.<br>4. Drop straight down from it to the horizon: that's <b>north</b>.<br><br>The Pole Star is not the brightest star at all; it's only medium bright. That's normal.`,
  show:()=>({target:{star:STAR.polaris},lines:[["merak","dubhe",5.2,true]],hl:[STAR.merak,STAR.dubhe,STAR.polaris]})},
 {t:"North, plan B: Cassiopeia",h:`If the Big Dipper is low or behind trees, look on the other side of the Pole Star for <b>Cassiopeia</b>: five stars in a big <b>W</b> (or M).<br><br>The Pole Star lies between the Big Dipper and the W, roughly the same distance from both. From the middle star of the W, follow the open side of the W outwards: you reach the Pole Star.`,
  show:()=>({target:{star:STAR.polaris},lines:[["gcas","polaris",1,false]],hl:[STAR.schedar,STAR.caph,STAR.gcas,STAR.ruchbah,STAR.segin,STAR.polaris],con:"Cas"})},
 {t:"Your latitude from the Pole Star",h:`The height of the Pole Star above the horizon equals your <b>latitude</b>. In the Netherlands it's about 52° up, in southern Italy about 40°. Sailors used this for centuries.<br><br>Measure with your hand at arm's length: a fist is about 10°, a spread hand (thumb to little finger) about 20°.`,
  show:()=>({target:{star:STAR.polaris},lines:[],hl:[STAR.polaris],latitude:true})},
 {t:"South: the Southern Cross",h:`Below the equator the Pole Star is out of sight. Use the <b>Southern Cross</b> instead: four bright stars in a small kite.<br><br>1. Follow the long bar of the cross, from <b>Gacrux</b> (top) through <b>Acrux</b> (bottom), about <b>4½ times</b> its length.<br>2. That empty spot is the south celestial pole. Drop straight down: <b>south</b>.<br><br>The two bright <b>Pointers</b> next to the cross help you be sure you have the real one, not the “false cross”. From most of Europe the Southern Cross stays below the horizon.`,
  show:()=>({target:{radec:[0,-89.99],label:"South celestial pole"},lines:[["gacrux","acrux",5.5,true],["rigilk","hadar",1,false]],hl:[STAR.acrux,STAR.gacrux,STAR.rigilk,STAR.hadar]})},
 {t:"East and west: Orion's Belt",h:`Orion is easy to spot in winter evenings: three bright stars in a short straight row, his <b>Belt</b>.<br><br>The right-hand star of the Belt, <b>Mintaka</b>, sits almost exactly on the celestial equator. Everywhere on Earth it <b>rises due east</b> and <b>sets due west</b>. Watch where it comes up or goes down and you have east or west.`,
  show:()=>({target:{star:STAR.mintaka},lines:[["mintaka","alnitak",1,false]],hl:[STAR.mintaka,STAR.alnilam,STAR.alnitak],con:"Ori"})},
 {t:"Any star: the two-stick trick",h:`Pick any bright star that isn't near the Pole Star. Push a stick into the ground and line its top up with the star, using a second, shorter stick (or a fixed spot to rest your eye). Wait 15 minutes and look again.<br><br>• Star went <b>up</b>: you face roughly <b>east</b><br>• Went <b>down</b>: roughly <b>west</b><br>• Moved to the <b>right</b>: roughly <b>south</b><br>• Moved to the <b>left</b>: roughly <b>north</b><br><br>(Northern half of the world. In the southern half, left and right swap.)`,show:null},
 {t:"The Moon",h:`When the Moon is a crescent, draw a line through its two tips and follow it down to the horizon: in the northern half of the world that's roughly <b>south</b>.<br><br>A full Moon rises in the east around sunset and stands roughly in the south around midnight.`,
  show:()=>({target:{body:"moon"},lines:[],hl:[]})},
 {t:"Summer nights: the Summer Triangle",h:`On summer nights in Europe three bright stars make a big triangle high in the sky: <b>Vega</b>, <b>Deneb</b> and <b>Altair</b>. Around midnight in July it's almost overhead, slightly towards the south.<br><br>It's not a compass by itself, but once you know it you can always find the Pole Star: it's on the side of Deneb and Vega, away from Altair.`,
  show:()=>({target:{star:STAR.vega},lines:[["vega","deneb",1,false],["deneb","altair",1,false],["altair","vega",1,false]],hl:[STAR.vega,STAR.deneb,STAR.altair]})}];


/* ---------- looks: the star map follows the style you picked for the app ---------- */
function theme(){const h=document.documentElement,skin=h.dataset.skin||"classic",soft=(()=>{try{return localStorage.getItem("pt-skinsoft")!=="0";}catch(e){return true;}})();
  const hue=parseFloat(getComputedStyle(h).getPropertyValue("--hue"))||210;
  const base={skin,sky:["#020617","#0c1a3e"],twi:["#0b1838","#3a3d6b"],day:["#2d6fb8","#8ec0ea"],line:"rgba(140,180,255,.36)",lineW:1,acc:"#ffd34d",accInk:"#1a1500",
    star:c=>c,name:"rgba(214,226,255,.86)",nameFont:"500 12px system-ui,sans-serif",con:"rgba(255,206,140,.72)",conFont:"600 10.5px system-ui,sans-serif",conCase:true,conSpace:"2.5px",
    ground:"#070f0a",ridge:"#0c1a12",glow:[90,140,255],mw:[190,205,255],mwA:1,grid:false,gridCol:"rgba(255,255,255,.08)",card:"#d8f0d8",north:"#ff6b6b",pl:null,
    ui:{panel:"rgba(14,22,46,.78)",ink:"#fff",line:"rgba(255,255,255,.12)",r:"22px",font:"system-ui,sans-serif",head:"system-ui,sans-serif",blur:"8px"}};
  const T={
    classic:{},
    mono:{sky:["#000","#0b0b0b"],twi:["#0a0a0a","#2a2a2a"],line:"rgba(255,255,255,.28)",acc:"#ffffff",accInk:"#000",star:c=>"#f4f4f4",name:"rgba(255,255,255,.8)",con:"rgba(255,255,255,.5)",conFont:"500 10px system-ui,sans-serif",conSpace:"3.5px",
      ground:"#000",ridge:"#050505",glow:[255,255,255],mw:[255,255,255],mwA:.7,card:"#fff",north:"#fff",pl:"#e6e6e6",ui:{panel:"rgba(0,0,0,.86)",ink:"#fff",line:"rgba(255,255,255,.35)",r:"6px",font:"system-ui,sans-serif",head:"system-ui,sans-serif",blur:"0px"}},
    editorial:{sky:["#0e1424","#212a40"],line:"rgba(237,228,211,.3)",acc:"#e08a6d",accInk:"#15120e",name:"rgba(237,228,211,.88)",nameFont:"italic 500 12.5px Georgia,'Times New Roman',serif",con:"#e9d2a8",conFont:"italic 500 13.5px Georgia,'Times New Roman',serif",conCase:false,conSpace:"0px",
      ground:"#15120e",ridge:"#1f1a14",glow:[224,138,109],mw:[237,228,211],mwA:.9,card:"#ede4d3",north:"#e08a6d",ui:{panel:"rgba(21,18,14,.93)",ink:"#ede4d3",line:"rgba(237,228,211,.2)",r:"8px",font:"Georgia,'Times New Roman',serif",head:"Georgia,'Times New Roman',serif",blur:"0px"}},
    glass:{sky:["#0d0826","#2b1f63"],line:"rgba(170,220,255,.4)",acc:"#9fe0ff",accInk:"#071a26",name:"rgba(225,238,255,.9)",con:"rgba(190,215,255,.7)",ground:"#0b0819",ridge:"#141032",glow:[160,120,255],mw:[205,185,255],mwA:1.25,card:"#cfe2ff",north:"#ff8fb1",
      ui:{panel:"rgba(255,255,255,.13)",ink:"#fff",line:"rgba(255,255,255,.28)",r:"24px",font:"system-ui,sans-serif",head:"system-ui,sans-serif",blur:"18px"}},
    float:{sky:[`hsl(${hue} 55% 5%)`,`hsl(${hue} 45% 16%)`],line:`hsla(${hue},70%,78%,.36)`,acc:`hsl(${hue} 75% 64%)`,accInk:`hsl(${hue} 60% 10%)`,con:`hsla(${hue},85%,82%,.72)`,ground:`hsl(${hue} 35% 4%)`,ridge:`hsl(${hue} 30% 8%)`,
      glow:hsl2rgb(hue,.7,.6),mw:hsl2rgb(hue,.5,.85),card:`hsl(${hue} 60% 85%)`,ui:{panel:`hsla(${hue},45%,12%,.86)`,ink:"#fff",line:`hsla(${hue},70%,70%,.25)`,r:"28px",font:"system-ui,sans-serif",head:"system-ui,sans-serif",blur:"10px"}},
    noir:{sky:["#000","#0a0805"],twi:["#050403","#231c10"],line:"rgba(212,175,55,.42)",acc:"#d4af37",accInk:"#000",star:c=>mixGold(c),name:"rgba(240,225,190,.86)",nameFont:"500 12px Georgia,'Times New Roman',serif",con:"#d4af37",conFont:"500 11px Georgia,'Times New Roman',serif",conSpace:"4px",
      ground:"#000",ridge:"#070604",glow:[212,175,55],mw:[230,205,150],mwA:.65,card:"#d4af37",north:"#f3d36b",ui:{panel:"rgba(0,0,0,.84)",ink:"#f1e6c8",line:"rgba(212,175,55,.55)",r:"14px",font:"system-ui,sans-serif",head:"Georgia,'Times New Roman',serif",blur:"0px"}},
    vault:{sky:["#000703","#03160b"],twi:["#020a04","#06261a"],day:["#04200f","#0a3a1d"],line:"rgba(125,255,168,.42)",acc:"#7dffa8",accInk:"#001a08",star:c=>"#9dffbd",name:"rgba(125,255,168,.9)",nameFont:"600 11px ui-monospace,Menlo,monospace",con:"rgba(125,255,168,.62)",conFont:"600 10.5px ui-monospace,Menlo,monospace",conSpace:"2px",
      ground:"#000703",ridge:"#021208",glow:[125,255,168],mw:[125,255,168],mwA:.75,grid:true,gridCol:"rgba(125,255,168,.13)",card:"#7dffa8",north:"#c8ffd9",pl:"#c8ffd9",scan:!soft,
      ui:{panel:"rgba(0,14,5,.9)",ink:"#9dffbd",line:"rgba(125,255,168,.5)",r:"3px",font:"ui-monospace,Menlo,monospace",head:"ui-monospace,Menlo,monospace",blur:"0px"}}};
  const t=Object.assign({},base,T[skin]||{});t.ui=Object.assign({},base.ui,(T[skin]||{}).ui||{});return t;}
function hsl2rgb(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return [f(0)*255,f(8)*255,f(4)*255].map(Math.round);}
function mixGold(c){const n=parseInt(c.slice(1),16),r=n>>16,g2=(n>>8)&255,b=n&255;return `rgb(${Math.round(r*.6+255*.4)},${Math.round(g2*.6+236*.4)},${Math.round(b*.45+190*.55)})`;}
/* soft glowing star dots, drawn once per colour and size */
const SPR={};
function sprite(col,r){const key=col+"|"+Math.round(r*4);if(SPR[key])return SPR[key];const s=Math.ceil(r*6+4),c=document.createElement("canvas");c.width=c.height=s*2;const x=c.getContext("2d");
  const gr=x.createRadialGradient(s,s,0,s,s,s);gr.addColorStop(0,"#ffffff");gr.addColorStop(Math.min(.35,r/s*1.1),col);gr.addColorStop(Math.min(.6,r/s*2.2),col.startsWith("rgb")?col.replace("rgb(","rgba(").replace(")",",.25)"):col+"40");gr.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=gr;x.fillRect(0,0,s*2,s*2);return SPR[key]={c,s};}
/* the Milky Way: a soft band along the plane of our galaxy, brightest towards its centre in Sagittarius */
const MW=(()=>{const out=[],aG=192.85948,dG=27.12825*R,lN=122.93192;for(let l=0;l<=360;l+=3){const L=(lN-l)*R;
  const sd=Math.sin(dG)*0+Math.cos(dG)*Math.cos(L),dec=Math.asin(sd)/R,ra=(aG+Math.atan2(Math.sin(L),-Math.sin(dG)*Math.cos(L))/R+360)%360;
  out.push({ra,dec,w:0.3+0.7*Math.pow((Math.cos(l*R)+1)/2,1.6),wid:(l<60||l>300?16:11)});}return out;})();

/* ---------- the tool ---------- */
function run(el,T){
  const lat0=(()=>{try{if(typeof me!=="undefined"&&me)return [me.lat,me.lon];}catch(e){}try{const l=JSON.parse(localStorage.getItem("pt-lastll")||"null");if(l)return [l.lat||l[0],l.lon||l[1]];}catch(e){}return [52.1,5.1];})();
  let LAT=lat0[0],LON=lat0[1];
  const ST=Object.assign({lines:true,names:true,cam:false,fov:70,camFov:66,off:0},(()=>{try{return JSON.parse(localStorage.getItem("pt-sky")||"{}");}catch(e){return {};}})());
  const saveST=()=>{try{localStorage.setItem("pt-sky",JSON.stringify({lines:ST.lines,names:ST.names,camFov:ST.camFov,fov:ST.fov}));}catch(e){}};
  ST.off=0;
  // your own correction for this phone's compass and tilt, from aligning on a star, planet or the Moon
  const CAL=Object.assign({az:0,alt:0,at:0},(()=>{try{return JSON.parse(localStorage.getItem("pt-skycal")||"{}");}catch(e){return {};}})());
  const saveCal=()=>{try{localStorage.setItem("pt-skycal",JSON.stringify(CAL));}catch(e){}};
  try{const hd=document.querySelector("#tlOv .tl-head");if(hd)hd.hidden=true;}catch(e){}
  const TH=theme();
  el.innerHTML=`<div class="sk" id="sk">
    <video id="skVid" class="sk-vid" playsinline muted autoplay hidden></video><canvas id="skCv" class="sk-cv"></canvas>
    <div class="sk-top"><button class="sk-b" id="skBack" aria-label="Close">‹</button><div class="sk-search"><input id="skQ" placeholder="Search: Mars, Orion, Polaris…" autocomplete="off"><div id="skRes" class="sk-res" hidden></div></div>
      <button class="sk-b" id="skGuide" aria-label="Navigate by the stars">🧭</button></div>
    <div class="sk-side"><button class="sk-b ${ST.cam?"on":""}" id="skCam" aria-label="Camera behind the stars">📷</button><button class="sk-b ${ST.lines?"on":""}" id="skLines" aria-label="Constellation lines">✶</button><button class="sk-b ${ST.names?"on":""}" id="skNames" aria-label="Names">Aa</button><button class="sk-b" id="skCal" aria-label="Line up with the sky">🎯</button></div>
    <div class="sk-cal" id="skCalBar" hidden></div>
    <div class="sk-hint" id="skHint"></div>
    <div class="sk-card" id="skCard" hidden></div>
    <div class="sk-time"><button class="sk-b" id="skMinus" aria-label="One hour earlier">−1h</button><div class="sk-tl"><span id="skTime"></span><input type="range" id="skSl" min="-720" max="720" step="10" value="0" aria-label="Shift the time"></div><button class="sk-b" id="skPlus" aria-label="One hour later">+1h</button><button class="sk-b" id="skNow">Now</button></div>
    <div class="sk-guide" id="skGd" hidden></div></div>`;
  {const sk=el.querySelector("#sk"),u=TH.ui;sk.classList.add("sk-"+TH.skin);if(TH.scan)sk.classList.add("sk-scan");
    for(const [k,v] of [["--skp",u.panel],["--ski",u.ink],["--skl",u.line],["--skr",u.r],["--skf",u.font],["--skh",u.head],["--skblur",u.blur],["--ska",TH.acc],["--skai",TH.accInk]])sk.style.setProperty(k,v);}
  const cv=el.querySelector("#skCv"),g=cv.getContext("2d"),vid=el.querySelector("#skVid"),hint=el.querySelector("#skHint");
  let W=0,H=0,DPR=1;const size=()=>{const r=el.querySelector("#sk").getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(2,window.devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;need();};
  /* view: forward / right / up vectors in east-north-up; from the phone's sensors, or by dragging */
  let F=[0,0.7071,0.7071],RT=[1,0,0],UP=[0,-0.7071,0.7071],manual=true,az0=180,alt0=35,gotSensor=0;
  const setManual=()=>{const a=az0*R,h=alt0*R;F=[Math.cos(h)*Math.sin(a),Math.cos(h)*Math.cos(a),Math.sin(h)];RT=[Math.cos(a),-Math.sin(a),0];UP=cross(RT,F);};
  setManual();
  const sm=(o,n,k)=>norm([o[0]+(n[0]-o[0])*k,o[1]+(n[1]-o[1])*k,o[2]+(n[2]-o[2])*k]);
  function fromMatrix(m,decl){const d=((decl||0)+CAL.az)*R,cd=Math.cos(d),sd=Math.sin(d),rot=v=>[v[0]*cd+v[1]*sd,-v[0]*sd+v[1]*cd,v[2]];
    let f=rot([-m[2],-m[5],-m[8]]),r=rot([m[0],m[3],m[6]]),u=rot([m[1],m[4],m[7]]);
    if(CAL.alt){const k=r,a=CAL.alt*R,ca=Math.cos(a),sa=Math.sin(a),turn=v=>{const kv=cross(k,v),kd=dot(k,v);return [v[0]*ca+kv[0]*sa+k[0]*kd*(1-ca),v[1]*ca+kv[1]*sa+k[1]*kd*(1-ca),v[2]*ca+kv[2]*sa+k[2]*kd*(1-ca)];};f=turn(f);u=turn(u);}
    if(!gotSensor){F=f;RT=r;UP=u;}else{F=sm(F,f,0.35);RT=sm(RT,r,0.35);UP=sm(UP,u,0.35);}
    gotSensor=Date.now();if(manual){manual=false;showHint("");}need();}
  window.onSky=(m,decl)=>{if(!dragging)fromMatrix(m,decl);};
  const web=e=>{if(window.AndroidGPS||e.alpha==null||(!e.absolute&&e.type!=="deviceorientationabsolute"))return;const a=e.alpha*R,b=e.beta*R,c=e.gamma*R,
    cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(c),sG=Math.sin(c);
    fromMatrix([cA*cG-sA*sB*sG,-cB*sA,cA*sG+cG*sA*sB,cG*sA+cA*sB*sG,cA*cB,sA*sG-cA*cG*sB,-cB*sG,sB,cB*cG],0);};
  if(window.AndroidGPS){try{AndroidGPS.sky(true);AndroidGPS.heading(true);}catch(e){}}else{addEventListener("deviceorientationabsolute",web);addEventListener("deviceorientation",web);}
  tlStop(T,()=>{window.onSky=null;try{AndroidGPS.sky(false);AndroidGPS.heading(false);}catch(e){}try{headSync();}catch(e){}removeEventListener("deviceorientationabsolute",web);removeEventListener("deviceorientation",web);camOff();});
  setTimeout(()=>{if(!gotSensor)showHint("Drag to look around, pinch to zoom. (No motion sensor found.)",6000);},1800);
  function showHint(t,ms){hint.textContent=t;hint.hidden=!t;clearTimeout(showHint.t);if(t&&ms)showHint.t=setTimeout(()=>{hint.hidden=true;},ms);}
  /* camera */
  let stream=null;
  async function camOn(){try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});vid.srcObject=stream;vid.hidden=false;await vid.play().catch(()=>{});ST.cam=true;}
    catch(e){ST.cam=false;showHint("The camera isn't available. Allow camera access for Out & Back to see the stars over it.",5000);}el.querySelector("#skCam").classList.toggle("on",ST.cam);need();}
  function camOff(){if(stream){for(const t of stream.getTracks())t.stop();stream=null;}vid.hidden=true;vid.srcObject=null;ST.cam=false;}
  /* time */
  const now=()=>Date.now()+ST.off*60e3;
  let cache=null;   // positions for the current minute
  function compute(){const t=now(),key=Math.floor(t/20000)+"|"+LAT.toFixed(2);if(cache&&cache.key===key)return cache;
    const lst=(gmst(t)+LON+360)%360,sl=Math.sin(LAT*R),cl=Math.cos(LAT*R),TT=(jd(t)-2451545)/36525,E0=(ra,dec)=>refract(enu(ra,dec,lst,sl,cl)),E=(ra,dec)=>{const q=precess(ra,dec,TT);return E0(q[0],q[1]);};
    const S=D.stars.map(s=>({id:s[0],v:E(s[1],s[2]),mag:s[3],col:bvColor(s[4]),ra:s[1],dec:s[2]}));const byId={};for(const s of S)byId[s.id]=s;
    const Lines=[];for(const k in D.lines)for(const seg of D.lines[k]){const pts=seg.map(p=>E(p[0],p[1]));Lines.push({k,pts});}
    const Cons=Object.entries(D.cons).map(([k,c])=>({k,v:E(c[2],c[3]),rank:c[4]}));
    const Tc=(jd(t)-2451545)/36525,Ea=helio("earth",Tc),P={};
    for(const k of ["mercury","venus","mars","jupiter","saturn","uranus","neptune"]){const h=helio(k,Tc),q=eq([h[0]-Ea[0],h[1]-Ea[1],h[2]-Ea[2]]);P[k]={k,ra:q.ra,dec:q.dec,v:E(q.ra,q.dec),dist:q.dist};}
    const sq=eq([-Ea[0],-Ea[1],-Ea[2]]);P.sun={k:"sun",ra:sq.ra,dec:sq.dec,v:E(sq.ra,sq.dec),dist:sq.dist};
    const mq=moonEq(t);let mv=enu(mq.ra,mq.dec,lst,sl,cl);/* the Moon is already worked out for today's equinox */{const aa=altaz(mv),par=Math.asin(1/mq.er),alt=aa.alt-Math.asin(Math.sin(par)*Math.cos(aa.alt*R))/R;const a=aa.az*R,h=alt*R;mv=refract([Math.cos(h)*Math.sin(a),Math.cos(h)*Math.cos(a),Math.sin(h)]);}
    const el2=((mq.lon-mq.sunLon)%360+360)%360;P.moon={k:"moon",ra:mq.ra,dec:mq.dec,v:mv,dist:mq.er*6371,phase:el2,illum:(1-Math.cos(el2*R))/2};
    return cache={key,t,lst,S,byId,Lines,Cons,P,E};}
  /* projection */
  const fov=()=>ST.cam?ST.camFov:ST.fov;
  function proj(v){const z=dot(v,F);if(z<=0.02)return null;const s=(H/2)/Math.tan(fov()*R/2);return [W/2+dot(v,RT)/z*s,H/2-dot(v,UP)/z*s,z];}
  /* what's selected, searched or shown by the guide */
  let TARGET=null,GUIDE=null,SEL=null;const HL=new Set();
  function targetVec(C){if(!TARGET)return null;if(TARGET.star){const s=C.byId[TARGET.star];return s&&s.v;}if(TARGET.body)return C.P[TARGET.body].v;if(TARGET.con){const c=C.Cons.find(x=>x.k===TARGET.con);return c&&c.v;}if(TARGET.radec)return C.E(TARGET.radec[0],TARGET.radec[1]);return null;}
  function targetName(){if(!TARGET)return "";if(TARGET.label)return TARGET.label;if(TARGET.star)return starName(TARGET.star)||("HIP "+TARGET.star);if(TARGET.body)return plName(TARGET.body);if(TARGET.con)return conName(TARGET.con);return "";}
  /* drawing */
  let raf=0,hits=[],MWC=null;const need=()=>{if(!raf)raf=requestAnimationFrame(draw);};
  function draw(){raf=0;if(!el.isConnected)return;const C=compute();g.setTransform(DPR,0,0,DPR,0,0);hits=[];const t=TH;
    const sun=altaz(C.P.sun.v).alt,night=sun<-12,day=sun>-2,sc=(H/2)/Math.tan(fov()*R/2);
    if(ST.cam)g.clearRect(0,0,W,H);else{const pal=day?t.day:night?t.sky:t.twi,gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,pal[0]);gr.addColorStop(1,pal[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);}
    const zoom=70/fov(),starA=ST.cam?1:day?0.45:1,limit=Math.min(6.2,(fov()>90?4.6:fov()>50?5.3:6.2)+(ST.cam?-0.6:0));
    // grid (Vault)
    if(t.grid&&!ST.cam)drawGrid();
    // the Milky Way: drawn small and blurred, then scaled up, so it's a soft glow and cheap to draw
    if(!ST.cam&&!day){const q=4,mw=MWC||(MWC=document.createElement("canvas")),w=Math.ceil(W/q),h=Math.ceil(H/q);if(mw.width!==w||mw.height!==h){mw.width=w;mw.height=h;}
      const m=mw.getContext("2d");m.clearRect(0,0,w,h);try{m.filter="blur(2.5px)";}catch(e){}m.lineCap="round";m.lineJoin="round";const bw=(night?1:0.45)*t.mwA;
      for(const pass of [[1,.05],[.55,.07],[.25,.08]]){for(let k0=0;k0<MW.length-1;k0+=5){const seg=MW.slice(k0,k0+6);let wsum=0;m.beginPath();let on=false,prev=null;
          for(const a of seg){const pa=proj(C.E(a.ra,a.dec));if(!pa||(prev&&Math.hypot(pa[0]-prev[0],pa[1]-prev[1])>W)){on=false;prev=pa;continue;}if(on)m.lineTo(pa[0]/q,pa[1]/q);else{m.moveTo(pa[0]/q,pa[1]/q);on=true;}prev=pa;wsum+=a.w;}
          const a=seg[0];m.strokeStyle=`rgba(${t.mw[0]},${t.mw[1]},${t.mw[2]},${(pass[1]*(wsum/seg.length)*bw).toFixed(3)})`;m.lineWidth=Math.max(2,a.wid*R*sc*pass[0]/q);m.stroke();}}
      g.save();g.imageSmoothingEnabled=true;g.drawImage(mw,0,0,w*q,h*q);g.restore();}
    // constellation lines, stopping just short of each star
    if(ST.lines){g.strokeStyle=day&&!ST.cam?"rgba(255,255,255,.35)":t.line;g.lineWidth=t.lineW;g.lineCap="round";g.beginPath();const gap=4;
      for(const L of C.Lines){let prev=null;for(const v of L.pts){const p=proj(v);if(p&&prev){const dx=p[0]-prev[0],dy=p[1]-prev[1],d=Math.hypot(dx,dy);if(d>gap*2.5&&d<W*1.5){const ux=dx/d*gap,uy=dy/d*gap;g.moveTo(prev[0]+ux,prev[1]+uy);g.lineTo(p[0]-ux,p[1]-uy);}}prev=p;}}g.stroke();}
    // guide lines
    if(GUIDE&&GUIDE.lines.length){g.save();g.strokeStyle=t.acc;g.lineWidth=2.2;g.setLineDash([7,6]);for(const seg of GUIDE.lines){g.beginPath();let prev=null;for(let k=0;k<=24;k++){const pt=along(seg.a,seg.b,seg.k*k/24),p=proj(C.E(pt[0],pt[1]));if(p&&prev)g.lineTo(p[0],p[1]);else if(p)g.moveTo(p[0],p[1]);prev=p;}g.stroke();}g.restore();}
    // stars
    for(const s of C.S){if(s.mag>limit)break;const p=proj(s.v);if(!p||p[0]<-10||p[1]<-10||p[0]>W+10||p[1]>H+10)continue;
      const r=Math.max(0.55,(3.5-0.6*s.mag)*Math.sqrt(zoom)*(ST.cam?1.15:1));g.globalAlpha=starA*(s.v[2]<0?0.3:1);const col=t.star(s.col);
      if(r>1.3){const sp=sprite(col,r);g.drawImage(sp.c,p[0]-sp.s,p[1]-sp.s);}else{g.fillStyle=col;g.fillRect(p[0]-r,p[1]-r,r*2,r*2);}
      if(s.mag<4.6)hits.push({x:p[0],y:p[1],o:{star:s.id},r:Math.max(r,4)});}
    g.globalAlpha=1;
    // star names
    g.textBaseline="middle";
    if(ST.names){g.font=t.nameFont;g.textAlign="left";setSpace("0px");const lim=fov()<40?3.4:fov()<70?2.2:1.6;
      for(const s of C.S){if(s.mag>lim)break;const n=D.names[s.id];if(!n)continue;const p=proj(s.v);if(!p||p[0]<0||p[0]>W||p[1]<0||p[1]>H)continue;g.fillStyle=t.name;g.fillText(starName(s.id),p[0]+8,p[1]);}}
    // constellation names
    if(ST.lines&&ST.names){g.font=t.conFont;g.textAlign="center";g.fillStyle=t.con;setSpace(t.conSpace);
      for(const c of C.Cons){if(c.rank>(fov()<60?3:2))continue;const p=proj(c.v);if(!p||p[0]<0||p[0]>W||p[1]<0||p[1]>H)continue;const n=conName(c.k);g.fillText(t.conCase?n.toUpperCase():n,p[0],p[1]);hits.push({x:p[0],y:p[1],o:{con:c.k},r:14,weak:true});}
      setSpace("0px");}
    // planets, Sun, Moon
    for(const k of ["neptune","uranus","saturn","jupiter","mars","venus","mercury","sun","moon"]){const b=C.P[k],p=proj(b.v);if(!p)continue;const pc=t.pl||PL_COL[k];
      if(k==="sun"){const r=Math.max(9,14*zoom),gl=g.createRadialGradient(p[0],p[1],r*.6,p[0],p[1],r*3.2);gl.addColorStop(0,t.pl?"rgba(220,255,230,.5)":"rgba(255,214,90,.55)");gl.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gl;g.beginPath();g.arc(p[0],p[1],r*3.2,0,7);g.fill();
        g.fillStyle=t.pl||"#ffd84a";g.beginPath();g.arc(p[0],p[1],r,0,7);g.fill();}
      else if(k==="moon"){const r=Math.max(9,13*zoom);moonDisk(p[0],p[1],r,b);}
      else{const r=(k==="venus"||k==="jupiter"?4.4:3.4)*Math.sqrt(zoom),sp=sprite(pc,r);g.drawImage(sp.c,p[0]-sp.s,p[1]-sp.s);g.strokeStyle=pc;g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.arc(p[0],p[1],r+4,0,7);g.stroke();g.globalAlpha=1;}
      g.font=t.nameFont.replace(/\d+(\.\d+)?px/,"13px").replace(/^(italic )?\d+ /,"$1600 ");g.textAlign="left";g.fillStyle=k==="sun"?(t.pl||"#ffe27a"):k==="moon"?(t.pl||"#f3f3f3"):pc;g.fillText(plName(k),p[0]+(k==="sun"||k==="moon"?17:10),p[1]+1);
      hits.push({x:p[0],y:p[1],o:{body:k},r:k==="sun"||k==="moon"?18:12});}
    // highlighted stars from the guide
    g.strokeStyle=t.acc;g.lineWidth=2;for(const id of HL){const s=C.byId[id];if(!s)continue;const p=proj(s.v);if(!p)continue;g.beginPath();g.arc(p[0],p[1],10,0,7);g.stroke();
      const n=starName(id);if(n){g.font=t.nameFont.replace(/\d+(\.\d+)?px/,"13px").replace(/^(italic )?\d+ /,"$1700 ");g.fillStyle=t.acc;g.textAlign="left";g.fillText(n,p[0]+13,p[1]-11);}}
    // horizon, ground and compass points
    drawHorizon(C);
    // target ring or arrow
    const tv=targetVec(C);if(tv){const p=proj(tv);const inView=p&&p[0]>20&&p[0]<W-20&&p[1]>90&&p[1]<H-110;
      if(inView){g.strokeStyle=t.acc;g.lineWidth=2.5;g.beginPath();g.arc(p[0],p[1],22,0,7);g.stroke();for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.moveTo(p[0]+Math.cos(a)*26,p[1]+Math.sin(a)*26);g.lineTo(p[0]+Math.cos(a)*34,p[1]+Math.sin(a)*34);g.stroke();}}
      else arrow(tv);
      const aa=altaz(tv);hint.hidden=false;hint.textContent=`${targetName()}: ${aa.alt>=0?Math.round(aa.alt)+"° up":"below the horizon"}, ${dirName(aa.az)} (${Math.round(aa.az)}°)${GUIDE&&GUIDE.latitude?` · your latitude ${Math.abs(LAT).toFixed(0)}°${LAT<0?"S":"N"}`:""}`;}
    // crosshair while lining up
    if(ALIGN){g.strokeStyle="#ff5d5d";g.lineWidth=2;g.beginPath();g.arc(W/2,H/2,16,0,7);g.moveTo(W/2-30,H/2);g.lineTo(W/2-8,H/2);g.moveTo(W/2+8,H/2);g.lineTo(W/2+30,H/2);g.moveTo(W/2,H/2-30);g.lineTo(W/2,H/2-8);g.moveTo(W/2,H/2+8);g.lineTo(W/2,H/2+30);g.stroke();}
    // time label
    const tt=new Date(C.t);el.querySelector("#skTime").textContent=(ST.off?"⏱ ":"")+tt.toLocaleString([], {weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    }
  function setSpace(v){try{g.letterSpacing=v;}catch(e){}}
  function drawGrid(){const t=TH,P=(a,h)=>proj([Math.cos(h*R)*Math.sin(a*R),Math.cos(h*R)*Math.cos(a*R),Math.sin(h*R)]);g.save();g.strokeStyle=t.gridCol;g.lineWidth=1;g.beginPath();
    for(let h=15;h<90;h+=15){let on=false;for(let a=0;a<=360;a+=3){const p=P(a,h);if(!p){on=false;continue;}if(on)g.lineTo(p[0],p[1]);else{g.moveTo(p[0],p[1]);on=true;}}}
    for(let a=0;a<360;a+=30){let on=false;for(let h=0;h<=90;h+=3){const p=P(a,h);if(!p){on=false;continue;}if(on)g.lineTo(p[0],p[1]);else{g.moveTo(p[0],p[1]);on=true;}}}
    g.stroke();g.font="500 9.5px ui-monospace,monospace";g.fillStyle=t.gridCol.replace(/[\d.]+\)$/,".5)");g.textAlign="left";for(let h=15;h<90;h+=15){const p=P(az0Now(),h);if(p)g.fillText(h+"°",p[0]+4,p[1]-4);}g.restore();}
  const az0Now=()=>altaz(F).az;
  function moonDisk(x,y,r,b){g.save();g.fillStyle="#2b2b30";g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle="#f1efe6";g.shadowColor="#fff";g.shadowBlur=14;
    const k=b.illum,wax=b.phase<180;g.beginPath();g.arc(x,y,r,-Math.PI/2,Math.PI/2,!wax);g.ellipse(x,y,Math.abs(1-2*k)*r,r,0,Math.PI/2,-Math.PI/2,k>0.5?!wax:wax);g.fill();g.restore();}
  // a low ridge of hills and trees along the horizon, the same every night
  const RIDGE=[];for(let a=0;a<=360;a+=2){const n=Math.sin(a*R*3+1)*0.5+Math.sin(a*R*7+2)*0.3+Math.sin(a*R*13)*0.2,tree=((a*37)%23<4)?1.2+((a*13)%7)/6:0;RIDGE.push(Math.max(0.2,1.1+n*0.9+tree));}
  function drawHorizon(C){const t=TH,P=(a,h)=>proj([Math.cos(h*R)*Math.sin(a*R),Math.cos(h*R)*Math.cos(a*R),Math.sin(h*R)]);
    // glow of the sky just above the horizon
    if(!ST.cam){g.save();for(const [h0,h1,al] of [[0,3,.22],[3,7,.13],[7,13,.06]]){g.fillStyle=`rgba(${t.glow[0]},${t.glow[1]},${t.glow[2]},${al})`;g.beginPath();
      for(let a=0;a<360;a+=6){const p1=P(a,h0),p2=P(a+6.5,h0),p3=P(a+6.5,h1),p4=P(a,h1);if(!p1||!p2||!p3||!p4)continue;g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.lineTo(p3[0],p3[1]);g.lineTo(p4[0],p4[1]);g.closePath();}g.fill();}g.restore();}
    // ground
    g.save();g.fillStyle=ST.cam?"rgba(0,0,0,.25)":t.ground;g.beginPath();
    for(let a=0;a<360;a+=6)for(let h=0;h>-90;h-=15){const p1=P(a,h),p2=P(a+6.5,h),p3=P(a+6.5,h-15.5),p4=P(a,h-15.5);if(!p1||!p2||!p3||!p4)continue;
      g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.lineTo(p3[0],p3[1]);g.lineTo(p4[0],p4[1]);g.closePath();}g.fill();
    // ridge silhouette
    if(!ST.cam){g.fillStyle=t.ridge;g.beginPath();for(let k=0;k<180;k++){const a=k*2,p1=P(a,-0.5),p2=P(a+2.2,-0.5),p3=P(a+2.2,RIDGE[k+1]),p4=P(a,RIDGE[k]);if(!p1||!p2||!p3||!p4)continue;
      g.moveTo(p1[0],p1[1]);g.lineTo(p2[0],p2[1]);g.lineTo(p3[0],p3[1]);g.lineTo(p4[0],p4[1]);g.closePath();}g.fill();}
    // the horizon line itself
    g.strokeStyle=ST.cam?"rgba(255,255,255,.7)":`rgba(${t.glow[0]},${t.glow[1]},${t.glow[2]},.55)`;g.lineWidth=1.2;g.beginPath();let on=false;
    for(let a=0;a<=360;a+=3){const p=P(a,0);if(!p){on=false;continue;}if(on)g.lineTo(p[0],p[1]);else{g.moveTo(p[0],p[1]);on=true;}}g.stroke();g.restore();
    g.font=t.nameFont.replace(/\d+(\.\d+)?px/,"15px").replace(/^(italic )?\d+ /,"$1700 ");g.textAlign="center";
    for(const [a,n] of [[0,"N"],[45,"NE"],[90,"E"],[135,"SE"],[180,"S"],[225,"SW"],[270,"W"],[315,"NW"]]){const p=P(a,0);if(!p)continue;g.fillStyle=n==="N"?t.north:t.card;g.globalAlpha=n.length>1?.6:1;g.fillText(n,p[0],p[1]+20);}g.globalAlpha=1;}
  function arrow(tv){const x=dot(tv,RT),y=dot(tv,UP),z=dot(tv,F);let ang=Math.atan2(-y,x);if(z<0&&Math.hypot(x,y)<0.05)ang=Math.PI/2;
    const cx=W/2,cy=H/2,rr=Math.min(W,H)/2-60,px=cx+Math.cos(ang)*rr,py=cy+Math.sin(ang)*rr;
    g.save();g.translate(px,py);g.rotate(ang);g.fillStyle=TH.acc;g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=8;g.beginPath();g.moveTo(22,0);g.lineTo(-10,-14);g.lineTo(-4,0);g.lineTo(-10,14);g.closePath();g.fill();g.restore();}
  const dirName=a=>["north","northeast","east","southeast","south","southwest","west","northwest"][Math.round(a/45)%8];
  /* info card for what you tapped */
  function card(C){const c=el.querySelector("#skCard");if(!SEL){c.hidden=true;return;}let v=null,t="",sub="",txt="";
    if(SEL.star){const s=C.byId[SEL.star];v=s.v;const n=D.names[SEL.star];t=starName(SEL.star)||"A star";sub=`Star${n&&n[1]?" in "+conName(n[1]):""} · brightness ${s.mag.toFixed(1)}`;txt=s.mag<1?"One of the brightest stars in the sky.":s.mag<2.5?"A bright star, easy to see even from town.":s.mag<4?"Visible without binoculars away from city lights.":"Faint: you need a dark sky to see this one.";
      if(SEL.star===STAR.polaris)txt="The Pole Star. It stays in the same place all night, right above north. Its height above the horizon equals your latitude.";}
    else if(SEL.body){const b=C.P[SEL.body];v=b.v;t=plName(SEL.body);txt=PL_INFO[SEL.body];
      if(SEL.body==="moon"){const ph=b.phase,n=ph<10||ph>350?"New Moon":ph<80?"Waxing crescent":ph<100?"First quarter":ph<170?"Waxing gibbous":ph<190?"Full Moon":ph<260?"Waning gibbous":ph<280?"Last quarter":"Waning crescent";sub=`${n} · ${Math.round(b.illum*100)}% lit · ${Math.round(b.dist).toLocaleString()} km`;}
      else if(SEL.body==="sun")sub=`${(b.dist*149.6).toFixed(1)} million km`;else sub=`Planet · ${(b.dist*149.6).toFixed(0)} million km from Earth`;}
    else if(SEL.con){const cc=C.Cons.find(x=>x.k===SEL.con);v=cc.v;t=conName(SEL.con);sub="Constellation · "+D.cons[SEL.con][1];txt="";}
    const aa=altaz(v);c.hidden=false;c.innerHTML=`<button class="sk-x" id="skCx" aria-label="Close">✕</button><b>${esc(t)}</b><small>${esc(sub)}</small>${txt?`<p>${esc(txt)}</p>`:""}<small>${aa.alt>=0?`${Math.round(aa.alt)}° above the horizon, ${dirName(aa.az)}`:`Below the horizon now (${dirName(aa.az)})`}</small>
      <div class="sk-cact"><button class="tl-act" id="skPoint">Point me there</button></div>`;
    c.querySelector("#skCx").onclick=()=>{SEL=null;c.hidden=true;};c.querySelector("#skPoint").onclick=()=>{TARGET=Object.assign({},SEL);SEL=null;c.hidden=true;GUIDE=null;HL.clear();goTo();need();};}
  function goTo(){if(!manual)return;const C=compute(),v=targetVec(C);if(!v)return;const aa=altaz(v),fa=az0,fh=alt0,ta=aa.az,th=Math.max(-10,aa.alt);let k=0;
    let da=((ta-fa+540)%360)-180;const step=()=>{k+=0.08;const e=k>=1?1:1-Math.pow(1-k,3);az0=(fa+da*e+360)%360;alt0=fh+(th-fh)*e;setManual();need();if(k<1)requestAnimationFrame(step);};step();}
  /* touch: drag to look around (when there's no sensor, or hold to override), pinch to zoom, tap for info */
  let dragging=false,pts=new Map(),pinch0=0,fov0=70,sx=0,sy=0,moved=false,lastX=0,lastY=0;
  cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=false;sx=lastX=e.clientX;sy=lastY=e.clientY;
    if(pts.size===2){const [a,b]=[...pts.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);fov0=ST.cam?ST.camFov:ST.fov;}});
  cv.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),f=fov0*pinch0/Math.max(10,d);
      if(ST.cam){ST.camFov=Math.max(30,Math.min(100,f));showHint(`Camera fit: ${ST.camFov.toFixed(0)}°. Pinch until the stars sit on the camera picture.`,2500);}else ST.fov=Math.max(15,Math.min(120,f));moved=true;need();return;}
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(Math.hypot(e.clientX-sx,e.clientY-sy)>8)moved=true;if(!moved)return;
    if(manual||!gotSensor||Date.now()-gotSensor>2000){manual=true;const k=fov()/H;az0=(az0-dx*k+360)%360;alt0=Math.max(-89,Math.min(89,alt0+dy*k));setManual();need();}});
  const up=e=>{if(pts.size===2)saveST();pts.delete(e.pointerId);if(!moved&&pts.size===0){let best=null,bd=1e9;for(const h of hits){const d=Math.hypot(h.x-e.clientX+cv.getBoundingClientRect().left,h.y-e.clientY+cv.getBoundingClientRect().top)-(h.weak?10:0);if(d<Math.max(26,h.r+12)&&d<bd){bd=d;best=h;}}
    SEL=best?best.o:null;if(best)card(compute());else el.querySelector("#skCard").hidden=true;}};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",e=>pts.delete(e.pointerId));
  /* buttons */
  el.querySelector("#skBack").onclick=()=>closeTool();
  el.querySelector("#skCam").onclick=()=>{if(ST.cam){camOff();el.querySelector("#skCam").classList.remove("on");need();}else camOn();};
  el.querySelector("#skLines").onclick=e=>{ST.lines=!ST.lines;e.currentTarget.classList.toggle("on",ST.lines);saveST();need();};
  el.querySelector("#skNames").onclick=e=>{ST.names=!ST.names;e.currentTarget.classList.toggle("on",ST.names);saveST();need();};
  const sl=el.querySelector("#skSl");sl.oninput=()=>{ST.off=+sl.value;need();};
  el.querySelector("#skMinus").onclick=()=>{ST.off=Math.max(-720*14,ST.off-60);sl.value=Math.max(-720,Math.min(720,ST.off));need();};
  el.querySelector("#skPlus").onclick=()=>{ST.off=Math.min(720*14,ST.off+60);sl.value=Math.max(-720,Math.min(720,ST.off));need();};
  el.querySelector("#skNow").onclick=()=>{ST.off=0;sl.value=0;need();};
  /* search */
  const q=el.querySelector("#skQ"),res=el.querySelector("#skRes");
  const index=[];for(const k of Object.keys(PL_NAMES))index.push({o:{body:k},n:plName(k),alt:[PL_NAMES[k].en],kind:k==="sun"||k==="moon"?"":"Planet"});
  for(const k in D.cons){const c=D.cons[k];index.push({o:{con:k},n:conName(k),alt:[c[0],c[1]],kind:"Constellation"});}
  for(const id in D.names){const n=D.names[id];index.push({o:{star:+id},n:starName(+id),alt:[n[0]],kind:"Star"});}
  q.oninput=()=>{const s=q.value.trim().toLowerCase();if(!s){res.hidden=true;return;}
    const hit=index.filter(x=>x.n.toLowerCase().includes(s)||x.alt.some(a=>String(a).toLowerCase().includes(s))).sort((a,b)=>(a.n.toLowerCase().startsWith(s)?0:1)-(b.n.toLowerCase().startsWith(s)?0:1)).slice(0,8);
    res.hidden=!hit.length;res.innerHTML=hit.map((x,i)=>`<button data-i="${i}"><b>${esc(x.n)}</b>${x.kind?` <small>${x.kind}</small>`:""}</button>`).join("");
    res.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const x=hit[+b.dataset.i];TARGET=Object.assign({},x.o);GUIDE=null;HL.clear();q.value="";res.hidden=true;q.blur();goTo();need();});};
  /* line up with the sky: aim the cross at something bright you can see, then tap Align */
  let ALIGN=null;
  function alignPick(C){const cands=[];const add=(o,n,v,score)=>{const aa=altaz(v);if(aa.alt>8)cands.push({o,n,v,score:score+aa.alt*0.02});};
    add({body:"moon"},plName("moon"),C.P.moon.v,10);for(const k of ["venus","jupiter","mars","saturn"])add({body:k},plName(k),C.P[k].v,{venus:9,jupiter:8,mars:6,saturn:5}[k]);
    for(const s of C.S){if(s.mag>1.6)break;if(D.names[s.id])add({star:s.id},starName(s.id),s.v,4-s.mag);}
    cands.sort((a,b)=>b.score-a.score);return cands;}
  function alignBar(){const bar=el.querySelector("#skCalBar"),C=compute();if(!ALIGN){bar.hidden=true;need();return;}
    const list=alignPick(C),cur=list[ALIGN.i%Math.max(1,list.length)];
    if(!cur){bar.hidden=false;bar.innerHTML=`<p>Nothing bright enough is up right now. Try again when it's darker.</p><div class="sk-cact"><button class="tl-act ghost" id="skCalX">Close</button></div>`;bar.querySelector("#skCalX").onclick=()=>{ALIGN=null;alignBar();};return;}
    TARGET=Object.assign({},cur.o);GUIDE=null;HL.clear();
    bar.hidden=false;bar.innerHTML=`<p>Find <b>${esc(cur.n)}</b> in the real sky (the arrow helps). Hold the phone so the red cross sits right on it, then tap <b>Align</b>.</p>
      <div class="sk-cact"><button class="tl-act" id="skCalGo">Align</button><button class="tl-act ghost" id="skCalNext">${list.length>1?"Pick another":"Cancel"}</button>${CAL.az||CAL.alt?`<button class="tl-act ghost" id="skCalReset">Reset</button>`:""}</div>`;
    bar.querySelector("#skCalGo").onclick=()=>{const v=targetVec(compute());if(!v)return;const want=altaz(v),have=altaz(F);let dz=((want.az-have.az+540)%360)-180;
      if(manual){showHint("Lining up needs the motion sensor: hold your phone up to the sky.",4000);return;}
      CAL.az=((CAL.az+dz)+540)%360-180;CAL.alt=Math.max(-15,Math.min(15,CAL.alt+(want.alt-have.alt)));CAL.at=Date.now();saveCal();gotSensor=0;ALIGN=null;TARGET=null;alignBar();
      showHint(`Lined up (${dz>=0?"+":""}${dz.toFixed(1)}° sideways). The correction is kept for next time.`,5000);};
    bar.querySelector("#skCalNext").onclick=()=>{if(list.length>1){ALIGN.i++;alignBar();}else{ALIGN=null;TARGET=null;alignBar();}};
    const rs=bar.querySelector("#skCalReset");if(rs)rs.onclick=()=>{CAL.az=0;CAL.alt=0;saveCal();gotSensor=0;ALIGN=null;TARGET=null;alignBar();showHint("Correction removed.",3000);};
    need();}
  el.querySelector("#skCal").onclick=()=>{ALIGN=ALIGN?null:{i:0};if(!ALIGN)TARGET=null;alignBar();};
  /* the guide */
  const gd=el.querySelector("#skGd");let lesson=0;
  function guide(){gd.hidden=false;const L=LESSONS[lesson];
    gd.innerHTML=`<div class="sk-gh"><b>🧭 Navigate by the stars</b><button class="sk-x" id="skGx" aria-label="Close">✕</button></div>
      <div class="sk-gt">${lesson+1}/${LESSONS.length} · ${esc(L.t)}</div><div class="sk-gb">${L.h}</div>
      <div class="sk-gn"><button class="tl-act ghost" id="skPrev" ${lesson?"":"disabled"}>‹</button>${L.show?`<button class="tl-act" id="skShow">Show me</button>`:""}<button class="tl-act ghost" id="skNext" ${lesson<LESSONS.length-1?"":"disabled"}>›</button></div>`;
    gd.querySelector("#skGx").onclick=()=>{gd.hidden=true;};
    gd.querySelector("#skPrev").onclick=()=>{lesson--;guide();};gd.querySelector("#skNext").onclick=()=>{lesson++;guide();};
    const sh=gd.querySelector("#skShow");if(sh)sh.onclick=()=>{const s=L.show();const st=k=>{const x=D.stars.find(z=>z[0]===STAR[k]);return [x[1],x[2]];};
      GUIDE={lines:s.lines.map(([a,b,k])=>({a:st(a),b:st(b),k})),latitude:s.latitude};HL.clear();for(const id of s.hl)HL.add(id);TARGET=s.target;gd.hidden=true;
      const C=compute(),v=targetVec(C);if(v&&altaz(v).alt<-2)showHint(`${targetName()} is below your horizon right now. Try a later time with the slider.`,6000);goTo();need();};}
  el.querySelector("#skGuide").onclick=()=>{if(gd.hidden)guide();else gd.hidden=true;};
  /* keep the clock moving and the size right */
  const ro=new ResizeObserver(size);ro.observe(el.querySelector("#sk"));tlStop(T,()=>ro.disconnect());
  tlEvery(T,10000,()=>{try{if(typeof me!=="undefined"&&me){LAT=me.lat;LON=me.lon;}}catch(e){}need();});
  if(ST.cam)camOn();size();}

const CSS=`.sk{position:fixed;inset:0;z-index:60;background:#03060f;overflow:hidden;touch-action:none;color:var(--ski);font-family:var(--skf)}
.sk-cv,.sk-vid{position:absolute;inset:0;width:100%;height:100%}.sk-vid{object-fit:cover}
.sk-scan::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}
.sk-top{position:absolute;left:10px;right:10px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:8px;align-items:flex-start}
.sk-b{min-width:44px;height:44px;border-radius:var(--skr);border:1px solid var(--skl);background:var(--skp);color:var(--ski);font:600 15px var(--skf);padding:0 12px;-webkit-backdrop-filter:blur(var(--skblur));backdrop-filter:blur(var(--skblur))}
.sk-b.on{background:var(--ska);color:var(--skai);border-color:var(--ska)}
.sk-search{flex:1;position:relative}.sk-search input{width:100%;height:44px;border-radius:var(--skr);border:1px solid var(--skl);background:var(--skp);color:var(--ski);padding:0 16px;font:15px var(--skf);-webkit-backdrop-filter:blur(var(--skblur));backdrop-filter:blur(var(--skblur))}
.sk-search input::placeholder{color:var(--ski);opacity:.55}
.sk-res{position:absolute;left:0;right:0;top:50px;background:var(--skp);border:1px solid var(--skl);border-radius:var(--skr);overflow:hidden;-webkit-backdrop-filter:blur(calc(var(--skblur) + 12px));backdrop-filter:blur(calc(var(--skblur) + 12px))}
.sk-res button{display:block;width:100%;text-align:left;border:0;background:none;color:var(--ski);padding:12px 16px;font:15px var(--skf);border-bottom:1px solid var(--skl)}.sk-res small{opacity:.55}
.sk-side{position:absolute;right:10px;top:calc(66px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:8px}
.sk-hint{position:absolute;left:12px;right:70px;top:calc(66px + env(safe-area-inset-top));font:600 13.5px/1.35 var(--skf);color:var(--ska);text-shadow:0 1px 3px #000}
.sk-time{position:absolute;left:10px;right:10px;bottom:calc(12px + env(safe-area-inset-bottom));display:flex;gap:6px;align-items:center}
.sk-tl{flex:1;display:flex;flex-direction:column;align-items:center;background:var(--skp);border:1px solid var(--skl);border-radius:var(--skr);padding:4px 14px;-webkit-backdrop-filter:blur(var(--skblur));backdrop-filter:blur(var(--skblur))}
.sk-tl span{font:600 12.5px var(--skf)}.sk-tl input{width:100%;accent-color:var(--ska)}
.sk-card,.sk-cal{position:absolute;left:10px;right:10px;bottom:calc(74px + env(safe-area-inset-bottom));background:var(--skp);border:1px solid var(--skl);border-radius:var(--skr);padding:14px 16px;font:14.5px/1.45 var(--skf);-webkit-backdrop-filter:blur(calc(var(--skblur) + 10px));backdrop-filter:blur(calc(var(--skblur) + 10px));box-shadow:0 10px 40px rgba(0,0,0,.45)}
.sk-card b{display:block;font:600 20px/1.2 var(--skh);color:var(--ska);margin-bottom:2px}.sk-card small{display:block;opacity:.7}.sk-card p{margin:8px 0}.sk-cal p{margin:0 0 10px}
.sk-x{position:absolute;right:10px;top:10px;border:0;background:none;color:var(--ski);font-size:18px;width:36px;height:36px}
.sk-cact{margin-top:10px;display:flex;gap:8px}.sk-cact .tl-act{flex:1}
.sk .tl-act{background:var(--ska);color:var(--skai);border-radius:var(--skr);box-shadow:none;font-family:var(--skf)}
.sk .tl-act.ghost{background:transparent;color:var(--ski);box-shadow:inset 0 0 0 1px var(--skl)}.sk .tl-act:disabled{opacity:.35}
.sk-guide{position:absolute;left:0;right:0;bottom:0;max-height:68%;overflow:auto;background:var(--skp);border-top:1px solid var(--skl);border-radius:calc(var(--skr) + 4px) calc(var(--skr) + 4px) 0 0;padding:18px 18px calc(16px + env(safe-area-inset-bottom));font:15px/1.55 var(--skf);-webkit-backdrop-filter:blur(calc(var(--skblur) + 14px));backdrop-filter:blur(calc(var(--skblur) + 14px));box-shadow:0 -10px 40px rgba(0,0,0,.5)}
.sk-gh{display:flex;justify-content:space-between;align-items:center;font-size:14px;opacity:.85}.sk-gh .sk-x{position:static}
.sk-gt{font:600 21px/1.25 var(--skh);color:var(--ska);margin:4px 0 10px}.sk-gb{opacity:.9}.sk-gb b{color:var(--ska);font-weight:600}
.sk-gn{display:flex;gap:8px;margin-top:16px}.sk-gn .tl-act{flex:1}.sk-gn .tl-act.ghost{flex:0 0 56px;font-size:20px}
.sk-glass .sk-b,.sk-glass .sk-search input,.sk-glass .sk-tl{box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.sk-vault .sk-hint,.sk-vault .sk-gt,.sk-vault .sk-card b{text-transform:uppercase;letter-spacing:.04em;text-shadow:0 0 8px rgba(125,255,168,.5)}
.sk-vault .sk-b,.sk-vault input,.sk-vault .sk-gb{text-shadow:0 0 6px rgba(125,255,168,.35)}
.sk-noir .sk-gt,.sk-noir .sk-card b{letter-spacing:.06em;text-transform:uppercase;font-weight:500;font-size:18px}
.sk-mono .sk-gt,.sk-mono .sk-card b{color:#fff}
.sk-editorial .sk-gt{font-style:italic;font-size:24px}
.sk-float .sk-b,.sk-float .sk-tl,.sk-float .sk-search input{box-shadow:0 6px 20px rgba(0,0,0,.35)}`;

window.SKY={run(el,T){if(!document.getElementById("skCss")){const s=document.createElement("style");s.id="skCss";s.textContent=CSS;document.head.appendChild(s);}D=window.SKY_DATA;run(el,T);},
  _t:{helio,eq,moonEq,gmst,enu,altaz,along,jd}};
})();
