/* Wildlings: catch, raise and battle your own creatures. All creatures, names and art are original to this app.
   A small pixel world to explore, plus creatures that turn up along the routes you really travel (the app's normal location fixes, no extra GPS).
   Battle and trade with friends over Bluetooth or online through your circle (the link from games.js). */
(function(){
let X=null;   // helpers from games.js
const EL=()=>X.EL();

/* ---------------- creatures ---------------- */
const TY=["wild","ember","tide","leaf","stone","gust","spark","shade"];
const TYN={wild:"Wild",ember:"Ember",tide:"Tide",leaf:"Leaf",stone:"Stone",gust:"Gust",spark:"Spark",shade:"Shade"};
const TYC={wild:["#c9a66b","#8a6d3b","#ecd7a8"],ember:["#ef7b3a","#a8401a","#ffd08a"],tide:["#4a9be0","#245e9c","#b7e1ff"],leaf:["#5fb84c","#2f7a2a","#c8f0a0"],
  stone:["#a08f7c","#5e5246","#d8cbb8"],gust:["#9fc7e8","#5b86ad","#f0f8ff"],spark:["#f2d03b","#a88a12","#fff6b0"],shade:["#7b5ea8","#3e2a63","#c9b3ee"]};
const STRONG={ember:["leaf","gust"],tide:["ember","stone"],leaf:["tide","stone"],stone:["ember","gust","spark"],gust:["leaf"],spark:["tide","gust","shade"],shade:["shade","gust"],wild:[]};
const WEAK={ember:["tide","stone","ember"],tide:["tide","leaf"],leaf:["ember","gust","leaf"],stone:["stone"],gust:["stone","spark"],spark:["stone","leaf"],shade:["spark"],wild:["stone"]};
const eff=(a,d)=>STRONG[a].includes(d)?2:WEAK[a].includes(d)?0.5:1;
// [name, type, hp, atk, def, spd, evolves to, at level, second move type, rarity 1-3, art seed, stage]
const SP=[
 ["Cindle","ember",39,52,43,65,1,16,"stone",1,101,0],["Pyrrot","ember",68,84,70,90,-1,0,"gust",2,101,1],
 ["Puddlo","tide",44,48,65,43,3,18,"stone",1,202,0],["Tidewyrm","tide",79,83,90,78,-1,0,"shade",2,202,1],
 ["Sprig","leaf",45,49,49,45,5,17,"stone",1,303,0],["Thornback","leaf",80,82,83,70,-1,0,"stone",2,303,1],
 ["Pebbit","stone",40,70,95,25,7,20,"wild",1,404,0],["Bouldrum","stone",80,105,125,40,-1,0,"wild",2,404,1],
 ["Fluffin","gust",40,45,40,56,9,18,"wild",1,505,0],["Galeon","gust",75,80,70,101,-1,0,"wild",2,505,1],
 ["Zappik","spark",35,55,40,90,11,20,"wild",2,606,0],["Voltusk","spark",70,90,65,110,-1,0,"stone",3,606,1],
 ["Murkle","shade",45,50,45,60,13,22,"wild",2,707,0],["Gloomaw","shade",80,95,80,85,-1,0,"spark",3,707,1],
 ["Scampy","wild",38,56,35,72,15,15,"shade",1,808,0],["Scamperon","wild",70,81,60,97,-1,0,"shade",2,808,1],
 ["Mosscap","leaf",60,55,75,30,-1,0,"tide",2,909,1],["Shellmo","tide",50,65,95,35,-1,0,"stone",2,1010,1],
 ["Blazet","ember",58,72,55,95,-1,0,"spark",3,1111,1],["Clawrock","stone",55,85,90,45,-1,0,"tide",2,1212,1],
 ["Owlune","gust",60,60,55,70,-1,0,"shade",2,1313,1],["Glimmerfly","spark",45,50,45,85,-1,0,"leaf",3,1414,0],
 ["Wispet","shade",45,70,40,95,-1,0,"gust",3,1515,0],["Oakmoth","leaf",95,100,95,60,-1,0,"stone",3,1616,1]];
const N_SP=SP.length;
const MV={wild:[["Bump",35,100],["Quick Dash",50,100],["Wallop",80,90]],ember:[["Ember Flick",40,100],["Blaze Rush",60,100],["Inferno Roar",85,90]],
  tide:[["Splash Shot",40,100],["Wave Slap",60,100],["Torrent Crash",85,90]],leaf:[["Leaf Flick",40,100],["Bramble Lash",60,100],["Bloom Burst",85,90]],
  stone:[["Pebble Toss",40,100],["Rock Ram",60,95],["Landslide",85,90]],gust:[["Gust Puff",40,100],["Wing Cut",60,100],["Cyclone Dive",85,90]],
  spark:[["Jolt",40,100],["Static Snap",60,100],["Storm Arc",85,90]],shade:[["Shadow Nip",40,100],["Night Claw",60,100],["Dread Pulse",85,90]]};
// a move: {n,ty,p,a} or a buff {n,fx}
function movesOf(sp,lv){const s=SP[sp],t=s[1],e=s[8],L=[];
  const add=(l,m)=>{if(lv>=l)L.push(m);};
  add(1,{n:MV.wild[0][0],ty:"wild",p:MV.wild[0][1],a:100});
  add(3,{n:MV[t][0][0],ty:t,p:MV[t][0][1],a:100});
  add(6,{n:"Brace",fx:"def"});
  add(11,{n:MV[t][1][0],ty:t,p:MV[t][1][1],a:MV[t][1][2]});
  add(15,{n:"Glare",fx:"atk"});
  add(20,{n:MV[e][1][0],ty:e,p:MV[e][1][1],a:MV[e][1][2]});
  add(25,{n:MV[t][2][0],ty:t,p:MV[t][2][1],a:MV[t][2][2]});
  add(31,{n:MV.wild[2][0],ty:"wild",p:MV.wild[2][1],a:90});
  // keep 4: the strongest attacks plus one buff once there are enough attacks
  if(L.length<=4)return L;const atk=L.filter(m=>m.p).sort((a,b)=>b.p-a.p),buf=L.filter(m=>m.fx);
  return atk.slice(0,3).concat(buf.length?[buf[buf.length-1]]:atk.slice(3,4));}
function stats(sp,lv){const s=SP[sp],f=b=>Math.floor(b*2*lv/100)+5;return {hp:Math.floor(s[2]*2*lv/100)+lv+10,atk:f(s[3]),def:f(s[4]),spd:f(s[5])};}
const xpNeed=lv=>6*lv*lv;
const spName=sp=>SP[sp][0];
function newMon(sp,lv){return {id:Math.random().toString(36).slice(2,9),sp,lv,xp:0,hp:stats(sp,lv).hp};}

/* ---------------- pixel art: every species gets its own sprite from a fixed seed; the evolved form is a bigger, spikier version ---------------- */
const ART={};
function art(sp){if(ART[sp])return ART[sp];const s=SP[sp],R=X.rng(s[10]*7919),big=s[11],N=18,g=new Array(N*N).fill(0),P=TYC[s[1]];
  const cy=10+R()*1.2,rx=4.2+big*1.3+R()*1.4,ry=3.6+big*1.4+R()*1.4;
  for(let y=1;y<N-1;y++)for(let x=1;x<9;x++){const dx=(x+0.5-9)/rx,dy=(y+0.5-cy)/ry,d=dx*dx+dy*dy;const p=d<0.55?1:d<1.05?0.75:d<1.6?0.13:0;if(R()<p){g[y*N+x]=1;g[y*N+(N-1-x)]=1;}}
  // ears or horns
  const ex=Math.round(9-rx*0.55),top=Math.max(1,Math.round(cy-ry)-1);const horn=R();
  if(horn<0.7){for(let k=0;k<2+big;k++){const yy=top-k+1;if(yy<1)break;g[yy*N+ex-(horn<0.35?k:0)]=1;g[yy*N+(N-1-ex+(horn<0.35?k:0))]=1;}}
  // feet
  const fy=Math.min(N-2,Math.round(cy+ry));for(const fx of [Math.round(9-rx*0.5),Math.round(9-rx*0.5)+1]){g[fy*N+fx]=1;g[fy*N+(N-1-fx)]=1;}
  // a tail on one side
  if(R()<0.6){let tx=Math.round(9+rx)-1,ty=Math.round(cy+ry*0.3);for(let k=0;k<2+big*2&&tx<N-1;k++){g[ty*N+tx]=1;tx++;if(R()<0.5)ty--;if(ty<1)break;}}
  // tidy up lonely pixels
  for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x;if(g[i]&&!g[i-1]&&!g[i+1]&&!g[i-N]&&!g[i+N])g[i]=0;}
  const c=document.createElement("canvas");c.width=N;c.height=N;const x2=c.getContext("2d");
  const spot=R()<0.5,acc=TYC[TY[1+Math.floor(R()*7)]][0];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;
    if(g[i]){const dx=(x+0.5-9)/rx,dy=(y+0.5-cy)/ry,d=dx*dx+dy*dy;let col=P[0];
      if(dy>0.25&&d<0.5)col=P[2];else if(y>cy+ry*0.55||(x>=N-1-1))col=P[1];if(spot&&((x*7+y*3+s[10])%11===0)&&d<0.8)col=acc;
      x2.fillStyle=col;x2.fillRect(x,y,1,1);}
    else if(g[i-1]||g[i+1]||g[i-N]||g[i+N]){x2.fillStyle="#1d1a22";x2.fillRect(x,y,1,1);}}
  // eyes
  const ey=Math.round(cy-ry*0.3),eo=big?2:1;for(const exx of [9-eo-1,9+eo]){x2.fillStyle="#fff";x2.fillRect(exx,ey-1,1,1);x2.fillStyle="#111";x2.fillRect(exx,ey,1,1);}
  return ART[sp]=c.toDataURL();}
const sprH=(sp,size,cls)=>`<img class="wl-spr ${cls||""}" src="${art(sp)}" width="${size}" height="${size}" alt="${spName(sp)}">`;

/* ---------------- save ---------------- */
let S=null;
function load(){S=X.store("pt-mon",null);if(S&&!S.party)S=null;if(S){S.bag=Object.assign({orb:0,sorb:0,berry:0,bigb:0},S.bag);S.box=S.box||[];S.dex=S.dex||{seen:[],caught:[]};S.beat=S.beat||{};}}
function persist(){X.save("pt-mon",S);}
const seen=sp=>{if(!S.dex.seen.includes(sp))S.dex.seen.push(sp);};
const caught=sp=>{seen(sp);if(!S.dex.caught.includes(sp))S.dex.caught.push(sp);};
const today=()=>new Date().toDateString();

/* ---------------- styles ---------------- */
const CSS=`
.wl{--wl-ink:#1d1a22;--wl-pap:#f6f1e1;font-family:ui-monospace,"Courier New",monospace}
.wl-spr{image-rendering:pixelated;image-rendering:crisp-edges}
.wl-cv{display:block;width:100%;aspect-ratio:1;image-rendering:pixelated;border-radius:10px;border:3px solid var(--wl-ink);background:#8fce6a;touch-action:none}
.wl-box{background:var(--wl-pap);color:var(--wl-ink);border:3px solid var(--wl-ink);border-radius:10px;padding:10px 12px;font:600 15px/1.35 ui-monospace,"Courier New",monospace;margin:8px 0;min-height:48px}
.wl-pad{display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(3,52px);gap:4px}
.wl-pad button,.wl-ab button{border:0;border-radius:12px;background:#3a3542;color:#fff;font-size:20px;touch-action:none;-webkit-tap-highlight-color:transparent}
.wl-pad button:active,.wl-ab button:active{background:#5b5466}
.wl-ctl{display:flex;justify-content:space-between;align-items:center;margin:10px 4px}
.wl-ab{display:flex;gap:12px}.wl-ab button{width:62px;height:62px;border-radius:50%;background:#a3324a;font:700 18px system-ui}
.wl-menu{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.wl-menu button{border:0;border-radius:10px;padding:8px 2px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:600 12px system-ui;display:flex;flex-direction:column;align-items:center;gap:2px}.wl-menu button span{font-size:18px}
.wl-menu button.dot::after{content:"";width:7px;height:7px;border-radius:50%;background:#e0531f;position:absolute;margin:-2px 0 0 26px}
.wl-bt{position:relative;background:linear-gradient(#cfe8f5 0 55%,#9ed07a 55%);border:3px solid var(--wl-ink);border-radius:12px;height:250px;overflow:hidden}
.wl-bt.cave{background:linear-gradient(#3b3440 0 55%,#6b5e55 55%)}.wl-bt.night{background:linear-gradient(#1e2440 0 55%,#3e5a3a 55%)}
.wl-bt .foe{position:absolute;right:14px;top:22px}.wl-bt .mine{position:absolute;left:14px;bottom:10px;transform:scaleX(-1)}
.wl-bt .pad{position:absolute;width:120px;height:22px;border-radius:50%;background:rgba(0,0,0,.18)}
.wl-hp{position:absolute;background:var(--wl-pap);border:3px solid var(--wl-ink);border-radius:8px;padding:4px 8px;font:700 13px ui-monospace,monospace;color:var(--wl-ink);min-width:150px}
.wl-hp .bar{height:7px;border-radius:4px;background:#ddd;margin-top:3px;overflow:hidden}.wl-hp .bar i{display:block;height:100%;background:#3cb95b;transition:width .5s}
.wl-hp .bar i.mid{background:#e7b52c}.wl-hp .bar i.low{background:#d8433a}
.wl-hp.f{left:10px;top:12px}.wl-hp.m{right:10px;bottom:14px}
.wl-hp small{font-weight:600;opacity:.75}
.wl-acts{display:grid;grid-template-columns:1fr 1fr;gap:6px}.wl-acts button{border:3px solid var(--wl-ink);border-radius:10px;background:var(--wl-pap);color:var(--wl-ink);padding:10px 8px;font:700 14px ui-monospace,monospace;text-align:left}
.wl-acts button small{display:block;font-weight:600;font-size:11px;opacity:.7}
.wl-acts button:disabled{opacity:.4}
.wl-list{display:flex;flex-direction:column;gap:6px}.wl-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);color:var(--ink);border:0;font:inherit;text-align:left;width:100%}
.wl-row b{display:block}.wl-row small{color:var(--muted)}.wl-row .grow{flex:1;min-width:0}.wl-row.sel{box-shadow:inset 0 0 0 3px var(--tc)}
.wl-mini{height:5px;border-radius:3px;background:var(--chip);overflow:hidden;margin-top:3px;max-width:150px}.wl-mini i{display:block;height:100%;background:#3cb95b}.wl-mini.xp i{background:#4a9be0}
.wl-dex{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.wl-dex div{background:var(--card);border-radius:10px;box-shadow:inset 0 0 0 1px var(--line);text-align:center;padding:6px 2px;font-size:11px}
.wl-dex img.sil{filter:brightness(0);opacity:.35}
.wl-tag{display:inline-block;padding:1px 6px;border-radius:6px;font:700 10.5px system-ui;color:#fff;vertical-align:middle}
.wl-shake{animation:wlsh .5s 3}@keyframes wlsh{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}75%{transform:rotate(14deg)}}
.wl-hit{animation:wlhit .35s 2}@keyframes wlhit{50%{opacity:.2}}
.wl-faint{transition:transform .5s,opacity .5s;transform:translateY(40px)!important;opacity:0}
`;
function addCss(){if(document.getElementById("wlCss"))return;const s=document.createElement("style");s.id="wlCss";s.textContent=CSS;document.head.appendChild(s);}
const tag=t=>`<span class="wl-tag" style="background:${TYC[t][1]}">${TYN[t]}</span>`;

/* ---------------- the world ---------------- */
const W=40,H=36;let MAP=null;
function buildMap(){const m=[];for(let y=0;y<H;y++)m.push(Array(W).fill("."));
  const r=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x>=0&&y>=0&&x<W&&y<H)m[y][x]=c;};
  r(2,1,37,7,";");for(const [a,b,c,d] of [[5,3,6,4],[10,1,12,1],[16,3,18,4],[28,3,29,4],[22,1,25,1],[10,6,12,7],[25,6,27,7],[34,6,37,7],[2,6,4,7],[13,7,14,7],[31,1,33,2]])r(a,b,c,d,"T");
  r(20,1,20,8,"=");r(2,8,37,8,"T");r(7,8,8,8,".");r(16,8,24,8,".");r(20,8,20,8,"=");r(32,8,33,8,".");
  r(6,9,14,11,",");r(26,9,30,11,",");
  r(22,10,36,22,'"');r(23,11,35,21,"~");r(37,9,37,22,".");
  r(7,12,10,12,"f");r(5,13,8,13,"r");r(5,14,8,14,"H");m[14][6]="D";r(12,13,15,13,"r");r(12,14,15,14,"H");m[14][13]="S";
  r(5,17,7,17,"r");r(5,18,7,18,"H");m[18][6]="h";m[15][10]="i";
  r(2,16,21,16,"=");r(6,15,6,15,"=");r(13,15,13,15,"=");r(6,17,6,17,"r");
  r(9,19,16,21,",");r(2,22,4,22,"f");
  r(21,16,37,16,"b");r(20,9,20,22,"=");
  r(2,23,37,23,"T");r(8,23,9,23,".");
  r(2,24,17,34,":");r(4,26,7,28,"s");r(11,30,14,32,"s");r(9,25,9,26,"#");r(15,27,16,27,"#");
  r(18,24,37,34,"#");r(21,27,35,33,"c");r(26,29,27,31,"#");r(31,28,32,29,"#");r(20,23,20,26,"=");r(20,27,21,27,"c");
  r(0,0,W-1,0,"T");r(0,H-1,W-1,H-1,"T");r(0,0,1,H-1,"T");r(38,0,39,H-1,"T");
  MAP=m;}
const tile=(x,y)=>MAP[y]&&MAP[y][x]?MAP[y][x]:"T";
const BLOCK=new Set(["T","~","r","H","#","i"]);
const ENC={",":{c:0.11,lv:[2,4],t:[[14,5],[8,4],[4,2],[10,1],[21,0.4]]},";":{c:0.11,lv:[4,8],t:[[4,4],[16,2],[8,3],[20,2,"n"],[12,2,"n"],[14,2]]},
  '"':{c:0.12,lv:[6,10],t:[[2,5],[17,3],[4,2],[8,1]]},":":{c:0.08,lv:[8,12],t:[[0,4],[6,3],[14,2],[18,0.5]]},"s":{c:0.05,lv:[8,12],t:[[0,3],[6,4],[19,1]]},
  "c":{c:0.1,lv:[11,16],t:[[6,4],[19,3],[10,2],[12,2],[22,0.6]]}};
const NPCS=[
  {id:"mira",x:10,y:10,d:2,name:"Mira",col:"#e0629a",team:[[14,4],[8,5]],say:"I just caught my first Wildlings! Battle?",after:"Tall grass is where they hide. Keep some Orbs on you."},
  {id:"bram",x:15,y:2,d:2,name:"Bram",col:"#4f8a3c",team:[[4,8],[20,9],[16,9]],say:"The forest is mine. Show me what you've got!",after:"At night, other Wildlings come out in the forest."},
  {id:"sal",x:37,y:13,d:3,name:"Old Sal",col:"#3a7bbf",team:[[2,11],[17,12],[3,18]],say:"Fifty years fishing this lake. Fancy a battle?",after:"Reeds by the water: that's where Tide types live."},
  {id:"kai",x:12,y:28,d:1,name:"Kai",col:"#d0702a",team:[[0,13],[6,14],[18,15]],say:"Hot out here. My team's hotter!",after:"Blazet is rare. I only ever saw one."},
  {id:"vex",x:28,y:32,d:0,name:"Vex",col:"#6b4fa0",team:[[12,18],[19,19],[11,20],[13,22]],say:"You found the cave. Few leave it winning.",after:"Deep in the cave sits Ilse. She's the best around."},
  {id:"ilse",x:34,y:32,d:3,name:"Champion Ilse",col:"#222",team:[[9,26],[7,27],[3,27],[13,28],[1,30]],say:"So you made it to me. Let's have a real battle.",after:"Well played. Come back any day for a rematch."}];
const npcAt=(x,y)=>NPCS.find(n=>n.x===x&&n.y===y);
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];   // up right down left

/* tiles, drawn once into a cache */
let TILECV=null;
function hashXY(x,y){let h=x*374761393+y*668265263;h=(h^(h>>>13))*1274126177;return (h^(h>>>16))>>>0;}
function drawTile(g,c,x,y,px,py){const h=hashXY(x,y),f=(col,a,b,w,hh)=>{g.fillStyle=col;g.fillRect(px+a,py+b,w,hh);};
  const grass=()=>{f("#8fce6a",0,0,16,16);if(h%3===0){f("#7dbb5a",(h>>3)%14,(h>>7)%14,2,1);}if(h%5===0)f("#a6dc84",(h>>5)%14,(h>>9)%14,1,1);};
  switch(c){
    case ".":grass();break;
    case ",":f("#79bd55",0,0,16,16);for(let k=0;k<6;k++){const a=(h>>(k*3))%14,b=(h>>(k*2+5))%12;f("#4e9a3a",a,b+2,1,3);f("#4e9a3a",a+1,b+1,1,2);}break;
    case ";":f("#5aa64c",0,0,16,16);for(let k=0;k<6;k++){const a=(h>>(k*3))%14,b=(h>>(k*2+5))%12;f("#2f7a2a",a,b+2,1,3);f("#3d8d36",a+1,b,1,3);}break;
    case '"':grass();for(let k=0;k<5;k++){const a=2+k*3,b=(h>>k)%4;f("#7a9a3a",a,b+2,1,12-b);f("#c9a64a",a,b,1,3);}break;
    case "T":grass();f("#2e6b2a",1,1,14,11);f("#3f8a37",2,2,10,7);f("#5aa64c",4,3,4,3);f("#6b4a2a",7,12,3,4);f("#1d4a1d",1,10,14,2);break;
    case "~":f("#4aa3df",0,0,16,16);if(h%2)f("#7cc2f0",(h>>3)%12,(h>>6)%14,4,1);if(h%3===0)f("#3a8bc8",(h>>4)%12,(h>>8)%14,3,1);break;
    case "=":f("#d9c08c",0,0,16,16);if(h%4===0)f("#c4aa76",(h>>3)%14,(h>>6)%14,2,1);break;
    case "f":grass();for(let k=0;k<3;k++){const a=2+((h>>(k*4))%11),b=2+((h>>(k*3+2))%11),cc=["#f2f2f2","#f05a7e","#f2d03b"][k];f(cc,a,b,2,2);f("#b8860b",a,b,1,1);}break;
    case "r":f(x<10?"#d0453a":x<17?"#3a6fd0":"#8a5a3a",0,0,16,16);f("rgba(0,0,0,.18)",0,12,16,4);for(let k=0;k<16;k+=4)f("rgba(255,255,255,.18)",k,0,1,12);break;
    case "H":f("#efe3c8",0,0,16,16);f("#c8b48c",0,14,16,2);if(h%2===0){f("#7bb8e8",4,4,8,6);f("#3a3542",4,4,8,1);}break;
    case "D":case "S":case "h":f("#efe3c8",0,0,16,16);f(c==="D"?"#c0392b":c==="S"?"#2d6fd0":"#7a4f2a",3,2,10,14);f("#f6d36b",10,9,2,2);
      if(c==="D"){f("#fff",6,4,4,1);f("#fff",7,3,2,3);}if(c==="S"){f("#fff",5,4,6,2);}break;
    case "i":grass();f("#7a4f2a",7,8,2,8);f("#b07d4a",2,2,12,7);f("#7a4f2a",2,8,12,1);f("#5a3a1a",4,4,8,1);f("#5a3a1a",4,6,6,1);break;
    case "b":f("#4aa3df",0,0,16,16);f("#b07d4a",0,2,16,12);for(let k=0;k<16;k+=4)f("#8a5a3a",k,2,1,12);f("#6b4a2a",0,2,16,1);f("#6b4a2a",0,13,16,1);break;
    case ":":f("#d8c27a",0,0,16,16);for(let k=0;k<4;k++){const a=(h>>(k*3))%14,b=(h>>(k*2+4))%12;f("#a8923a",a,b+2,1,2);f("#b8a24a",a+1,b+1,1,2);}break;
    case "s":f("#ecd9a0",0,0,16,16);if(h%3===0)f("#d8c28a",(h>>3)%14,(h>>6)%14,2,1);break;
    case "#":f("#8a7f74",0,0,16,16);f("#a59a8e",1,1,8,5);f("#6b6157",0,12,16,4);f("#6b6157",10,4,6,2);if(h%2)f("#bdb2a5",3,2,3,2);break;
    case "c":f("#6b5e55",0,0,16,16);if(h%3===0)f("#584c44",(h>>3)%14,(h>>6)%14,3,2);if(h%7===0)f("#8a7c70",(h>>4)%14,(h>>8)%14,1,1);break;
    default:grass();}}
function tileCanvas(){if(TILECV)return TILECV;const c=document.createElement("canvas");c.width=W*16;c.height=H*16;const g=c.getContext("2d");
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(g,MAP[y][x],x,y,x*16,y*16);return TILECV=c;}
function drawPerson(g,px,py,dir,col,step){const f=(c,a,b,w,h)=>{g.fillStyle=c;g.fillRect(px+a,py+b,w,h);};
  f("rgba(0,0,0,.22)",3,14,10,2);
  f("#1d1a22",4,1,8,1);f(col,4,2,8,3);f(col,3,4,10,1);       // cap
  f("#f1c7a0",4,5,8,4);                                       // face
  if(dir===2){f("#1d1a22",5,6,1,1);f("#1d1a22",10,6,1,1);}else if(dir===1){f("#1d1a22",10,6,1,1);}else if(dir===3){f("#1d1a22",5,6,1,1);}else f(col,4,5,8,2);
  f(col,4,9,8,3);f("#1d1a22",4,9,8,1);f("#3a3542",4,12,3,2+(step?0:1));f("#3a3542",9,12,3,2+(step?1:0));f("#f1c7a0",3,9,1,2);f("#f1c7a0",12,9,1,2);}

/* ---------------- screens ---------------- */
let VIEW="world",PL={x:6,y:15,d:2},anim=null,raf=0,hold=null,MSG=null,MSGQ=[],BUSY=false;
function stop(){cancelAnimationFrame(raf);raf=0;clearInterval(hold);hold=null;}
function home(){addCss();load();if(!MAP)buildMap();if(!S)return starter();PL=Object.assign({x:6,y:15,d:2},S.pos||{});VIEW="world";world();}
function starter(){const E=EL();
  E.innerHTML=X.back()+`<div class="wl"><div class="wl-box">Welcome to the world of Wildlings! Pick your first partner. You'll find many more in the tall grass, and some along the routes you really travel.</div>
    <div class="wl-list">${[0,2,4].map(sp=>`<button class="wl-row" data-starter="${sp}">${sprH(sp,64)}<div class="grow"><b>${spName(sp)}</b> ${tag(SP[sp][1])}<br><small>${{0:"Quick and fiery. Strong against Leaf.",2:"Calm and sturdy. Strong against Ember and Stone.",4:"Patient and tough. Strong against Tide and Stone."}[sp]}</small></div></button>`).join("")}</div></div>`;
  X.wireBack();E.querySelectorAll("[data-starter]").forEach(b=>b.onclick=()=>{X.tapv();const sp=+b.dataset.starter;
    S={v:1,pos:{x:6,y:15,d:2},party:[newMon(sp,6)],box:[],bag:{orb:5,sorb:0,berry:3,bigb:0},coins:100,dex:{seen:[],caught:[]},beat:{},wins:0,started:Date.now()};caught(sp);persist();
    PL={x:6,y:15,d:2};VIEW="world";world();say([`${spName(sp)} joined you! Explore with the arrows, talk with A.`,"The red door heals your team, the blue door is the shop. Good luck!"]);});}
function finds(){const W2=X.store("pt-wfind",{});return (W2.f||[]).filter(x=>Date.now()-x.ts<3*864e5);}
function world(){const E=EL();stop();VIEW="world";const nf=finds().length;
  E.innerHTML=X.back()+`<div class="wl"><canvas class="wl-cv" id="wlCv" width="176" height="176"></canvas>
    <div class="wl-box" id="wlMsg" ${MSG?"":"hidden"}>${MSG?X.esc(MSG):""}</div>
    <div class="wl-ctl"><div class="wl-pad"><span></span><button data-dir="0" aria-label="Up">▲</button><span></span><button data-dir="3" aria-label="Left">◀</button><span></span><button data-dir="1" aria-label="Right">▶</button><span></span><button data-dir="2" aria-label="Down">▼</button><span></span></div>
      <div class="wl-ab"><button id="wlA" aria-label="A: talk or read">A</button></div></div>
    <div class="wl-menu"><button data-mn="team"><span>🐾</span>Team</button><button data-mn="bag"><span>🎒</span>Bag</button><button data-mn="dex"><span>📖</span>Dex</button>
      <button data-mn="finds" class="${nf?"dot":""}"><span>🗺️</span>Routes${nf?` (${nf})`:""}</button><button data-mn="friends"><span>🤝</span>Friends</button></div>
    <div class="gm-log" style="text-align:center">💰 ${S.coins} coins · Orbs ${S.bag.orb}${S.bag.sorb?` · Super ${S.bag.sorb}`:""} · Berries ${S.bag.berry+S.bag.bigb}</div></div>`;
  X.wireBack(()=>{S.pos=PL;persist();});
  const pads=E.querySelectorAll("[data-dir]");pads.forEach(b=>{const d=+b.dataset.dir;
    const start=e=>{e.preventDefault();if(MSG){next();return;}tryMove(d);clearInterval(hold);hold=setInterval(()=>tryMove(d),170);};
    const end=()=>{clearInterval(hold);hold=null;};
    b.addEventListener("pointerdown",start);b.addEventListener("pointerup",end);b.addEventListener("pointerleave",end);b.addEventListener("pointercancel",end);});
  E.querySelector("#wlA").onclick=()=>{X.tapv();if(MSG)return next();interact();};
  E.querySelector("#wlMsg").onclick=()=>next();
  E.querySelectorAll("[data-mn]").forEach(b=>b.onclick=()=>{X.tapv();S.pos=PL;persist();({team:()=>team(),bag:()=>bag(),dex,finds:findsView,friends})[b.dataset.mn]();});
  // swipe on the map to walk
  const cv=E.querySelector("#wlCv");let sx=0,sy=0;cv.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;});
  cv.addEventListener("pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20){if(MSG)next();else interact();return;}if(MSG)return;tryMove(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));});
  render();}
function say(lines,then){MSGQ=MSGQ.concat(lines.map(t=>({t,then:null})));if(then)MSGQ[MSGQ.length-1].then=then;if(!MSG)next();}
function next(){const m=MSGQ.shift();const box=document.getElementById("wlMsg");
  if(!m){MSG=null;if(box){box.hidden=true;box.textContent="";}const f=next.then;next.then=null;if(f)f();return;}
  MSG=m.t;if(m.then)next.then=m.then;if(box){box.hidden=false;box.textContent=m.t;}}
function render(){const cv=document.getElementById("wlCv");if(!cv)return;const g=cv.getContext("2d");g.imageSmoothingEnabled=false;
  let px=PL.x*16,py=PL.y*16,step=false;if(anim){const t=Math.min(1,(performance.now()-anim.t0)/150);px=(anim.fx+(PL.x-anim.fx)*t)*16;py=(anim.fy+(PL.y-anim.fy)*t)*16;step=t<0.5;if(t>=1){anim=null;}}
  const cx=Math.max(0,Math.min(W*16-176,px-80)),cy=Math.max(0,Math.min(H*16-176,py-80));
  g.drawImage(tileCanvas(),cx,cy,176,176,0,0,176,176);
  const night=isNight();
  for(const n of NPCS){const nx=n.x*16-cx,ny=n.y*16-cy;if(nx>-16&&ny>-16&&nx<176&&ny<176)drawPerson(g,nx,ny,n.d,n.col,false);}
  drawPerson(g,px-cx,py-cy,PL.d,"#d63a3a",step);
  if(night){g.fillStyle="rgba(20,24,60,.28)";g.fillRect(0,0,176,176);}
  if(tile(PL.x,PL.y)==="c"){g.fillStyle="rgba(0,0,0,.22)";g.fillRect(0,0,176,176);}
  if(anim)raf=requestAnimationFrame(render);else raf=0;}
const isNight=()=>{const h=new Date().getHours();return h>=21||h<6;};
function tryMove(d){if(MSG||anim||VIEW!=="world")return;PL.d=d;const nx=PL.x+DIRS[d][0],ny=PL.y+DIRS[d][1],c=tile(nx,ny);
  if(BLOCK.has(c)||npcAt(nx,ny)){render();return;}
  anim={fx:PL.x,fy:PL.y,t0:performance.now()};PL.x=nx;PL.y=ny;if(!raf)raf=requestAnimationFrame(render);
  setTimeout(()=>arrived(c),160);}
function arrived(c){if(VIEW!=="world")return;
  if(c==="D"){healAll();clearInterval(hold);say(["Welcome to the rest hut. Your Wildlings are fully healed! ❤️"],()=>{PL.y++;render();});return;}
  if(c==="S"){clearInterval(hold);PL.y++;render();shop();return;}
  if(c==="h"){clearInterval(hold);const got=S.gift!==today();PL.y++;render();if(got){S.gift=today();S.bag.orb+=2;S.bag.berry+=1;persist();say(["Granny: Oh, a visitor! Here, take 2 Orbs and a Berry. Come back tomorrow, dear."]);}else say(["Granny: Back already? Come see me tomorrow, dear."]);return;}
  const e=ENC[c];if(e&&Math.random()<e.c){clearInterval(hold);hold=null;const sp=pickWild(e);const lv=e.lv[0]+Math.floor(Math.random()*(e.lv[1]-e.lv[0]+1));setTimeout(()=>startWild(sp,lv,c==="c"?"cave":isNight()?"night":""),200);}}
function pickWild(e){const night=isNight(),opts=e.t.filter(o=>o[2]!=="n"||night);if(night&&e.t.some(o=>o[2]==="n"))opts.push(...e.t.filter(o=>o[2]==="n"));
  let tot=opts.reduce((s,o)=>s+o[1],0),r=Math.random()*tot;for(const o of opts){r-=o[1];if(r<=0)return o[0];}return opts[0][0];}
function interact(){const nx=PL.x+DIRS[PL.d][0],ny=PL.y+DIRS[PL.d][1],n=npcAt(nx,ny),c=tile(nx,ny);
  if(n){n.d=(PL.d+2)%4;render();const beaten=S.beat[n.id]===today();
    if(beaten)return say([`${n.name}: ${n.after}`]);
    return say([`${n.name}: ${n.say}`],()=>startNpc(n));}
  if(c==="i")return say(["SIGN: Wildling Village. Red door: rest hut (free healing). Blue door: shop.","North: Whisper Forest. East: Mirror Lake. South: Sunbaked Flats and Echo Cave."]);
  if(c==="~")return say(["The water is deep and still. Something splashes in the distance."]);
  if(c==="T")return say(["A big old tree."]);}
function healAll(){for(const m of S.party)m.hp=stats(m.sp,m.lv).hp;persist();}

/* ---------------- shop, bag, team, dex ---------------- */
const ITEMS={orb:["Orb",20,"Catches Wildlings. Works best when they're weak."],sorb:["Super Orb",50,"Catches 1.6 times as well as an Orb."],berry:["Berry",15,"Heals 30 HP."],bigb:["Big Berry",60,"Heals fully."]};
function shop(){VIEW="shop";const E=EL();
  E.innerHTML=X.back()+`<div class="wl"><div class="wl-box">SHOP: What would you like? You have 💰 ${S.coins}.</div><div class="wl-list">${Object.entries(ITEMS).map(([k,v])=>`<button class="wl-row" data-buy="${k}"><span style="font-size:24px">${{orb:"🔴",sorb:"🔵",berry:"🫐",bigb:"🍇"}[k]}</span><div class="grow"><b>${v[0]}</b><small>${v[2]} You have ${S.bag[k]}.</small></div><b>${v[1]}</b></button>`).join("")}</div>
    <div class="gm-row2"><button class="tl-act ghost" id="wlBack">Leave the shop</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{const k=b.dataset.buy,p=ITEMS[k][1];if(S.coins<p){X.toast("Not enough coins: win battles to earn more");return;}X.tapv();S.coins-=p;S.bag[k]++;persist();shop();});
  E.querySelector("#wlBack").onclick=()=>world();}
function bag(){const E=EL();VIEW="bag";
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">🎒 Bag</div><div class="wl-list">${Object.entries(ITEMS).map(([k,v])=>`<div class="wl-row"><span style="font-size:22px">${{orb:"🔴",sorb:"🔵",berry:"🫐",bigb:"🍇"}[k]}</span><div class="grow"><b>${v[0]} × ${S.bag[k]}</b><small>${v[2]}</small></div>${(k==="berry"||k==="bigb")&&S.bag[k]?`<button class="tl-act" data-use="${k}" style="flex:none;padding:8px 12px">Use</button>`:""}</div>`).join("")}</div>
    <p class="sv-note">💰 ${S.coins} coins. Buy more at the blue door in the village.</p><div class="gm-row2"><button class="tl-act ghost" id="wlBack">Back to the map</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-use]").forEach(b=>b.onclick=()=>pickMon("Heal which Wildling?",m=>{const st=stats(m.sp,m.lv);if(m.hp>=st.hp){X.toast("Already full");return false;}const k=b.dataset.use;S.bag[k]--;m.hp=k==="bigb"?st.hp:Math.min(st.hp,m.hp+30);persist();X.toast(`${spName(m.sp)} feels better`);bag();return true;},bag));
  E.querySelector("#wlBack").onclick=()=>world();}
function monRow(m,extra){const st=stats(m.sp,m.lv);if(m.hp>st.hp)m.hp=st.hp;return `${sprH(m.sp,48)}<div class="grow"><b>${spName(m.sp)} <small>Lv ${m.lv}</small> ${tag(SP[m.sp][1])}</b>
  <div class="wl-mini"><i style="width:${Math.max(0,m.hp/st.hp*100)}%"></i></div><small>${m.hp}/${st.hp} HP${extra||""}</small></div>`;}
function pickMon(title,cb,back){const E=EL();
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">${title}</div><div class="wl-list">${S.party.map((m,i)=>`<button class="wl-row" data-pm="${i}">${monRow(m)}</button>`).join("")}</div><div class="gm-row2"><button class="tl-act ghost" id="wlBack">Cancel</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-pm]").forEach(b=>b.onclick=()=>{X.tapv();cb(S.party[+b.dataset.pm]);});E.querySelector("#wlBack").onclick=back;}
function team(sel){const E=EL();VIEW="team";
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">🐾 Team (${S.party.length}/6)</div><div class="wl-list">${S.party.map((m,i)=>`<button class="wl-row ${sel===i?"sel":""}" data-tm="${i}">${monRow(m,` · XP ${m.xp}/${xpNeed(m.lv)}`)}</button>`).join("")}</div>
    ${sel!=null?monDetail(S.party[sel],sel):`<p class="sv-note">Tap a Wildling for its moves. The first one in the list goes into battle first.</p>`}
    ${S.box.length?`<div class="tl-sec">In the box (${S.box.length})</div><div class="wl-list">${S.box.map((m,i)=>`<div class="wl-row">${monRow(m)}<button class="tl-act ghost" data-take="${i}" style="flex:none;padding:8px 10px" ${S.party.length>=6?"disabled":""}>To team</button></div>`).join("")}</div>`:""}
    <div class="gm-row2"><button class="tl-act ghost" id="wlBack">Back to the map</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-tm]").forEach(b=>b.onclick=()=>{X.tapv();team(+b.dataset.tm===sel?null:+b.dataset.tm);});
  E.querySelectorAll("[data-take]").forEach(b=>b.onclick=()=>{const m=S.box.splice(+b.dataset.take,1)[0];S.party.push(m);persist();team();});
  const f=E.querySelector("#wlFirst");if(f)f.onclick=()=>{const m=S.party.splice(sel,1)[0];S.party.unshift(m);persist();team(0);};
  const bx=E.querySelector("#wlBox");if(bx)bx.onclick=()=>{if(S.party.length<2)return;S.box.push(S.party.splice(sel,1)[0]);persist();team();};
  E.querySelector("#wlBack").onclick=()=>world();}
function monDetail(m,i){const st=stats(m.sp,m.lv),s=SP[m.sp];
  return `<div class="wl-box" style="font-size:13.5px">${sprH(m.sp,72)} <b>${spName(m.sp)}</b> Lv ${m.lv}<br>ATK ${st.atk} · DEF ${st.def} · SPD ${st.spd}${s[6]>=0?`<br>Grows into ${S.dex.caught.includes(s[6])?spName(s[6]):"???"} at Lv ${s[7]}`:""}
    <br><br>${movesOf(m.sp,m.lv).map(v=>v.fx?`${v.n} <small>(${v.fx==="def"?"raises its defence":"lowers the foe's attack"})</small>`:`${v.n} ${tag(v.ty)} <small>power ${v.p}</small>`).join("<br>")}</div>
    <div class="gm-row2">${i>0?`<button class="tl-act" id="wlFirst">Send out first</button>`:""}${S.party.length>1?`<button class="tl-act ghost" id="wlBox">Put in the box</button>`:""}</div>`;}
function dex(){const E=EL();VIEW="dex";
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">📖 Dex: ${S.dex.caught.length} caught, ${S.dex.seen.length} seen of ${N_SP}</div>
    <div class="wl-dex">${SP.map((s,i)=>{const c=S.dex.caught.includes(i),sn=S.dex.seen.includes(i);return `<div>${c||sn?`<img class="wl-spr ${c?"":"sil"}" src="${art(i)}" width="54" height="54" alt="">`:`<div style="height:54px;font-size:28px;line-height:54px;opacity:.3">?</div>`}<br>${c||sn?s[0]:"???"}${c?"<br>"+tag(s[1]):""}</div>`;}).join("")}</div>
    <p class="sv-note">Some Wildlings only come out at night, some only live in the cave, and a few only turn up along the routes you really travel.</p>
    <div class="gm-row2"><button class="tl-act ghost" id="wlBack">Back to the map</button></div></div>`;X.wireBack();E.querySelector("#wlBack").onclick=()=>world();}

/* ---------------- route finds: from your real-world travels ---------------- */
function findMon(f){const R=X.rng(f.k+7);const avg=Math.max(3,Math.round(S.party.reduce((s,m)=>s+m.lv,0)/S.party.length));
  let pool;if(f.night)pool=[12,20,22,13,8];else if(f.fast)pool=[10,9,21,11,8];else if(/^🏠/.test(f.town||""))pool=[14,6,10,4];else pool=[4,8,2,0,14,16,17,19,21,18,6];
  if(R()<0.04)return {sp:23,lv:avg+2};           // Oakmoth: only ever found on real routes
  const sp=pool[Math.floor(R()*pool.length)];return {sp,lv:Math.max(2,avg-2+Math.floor(R()*4))};}
function findsView(){const E=EL();VIEW="finds";const F=finds(),off=localStorage.getItem("pt-wfoff")==="1";
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">🗺️ Route finds</div>
    <p class="sv-note">While the app knows where you are (for the map, your circle or a journey), a Wildling turns up about every 700 m you travel, up to 6 a day. Night, fast trains and home all bring different ones. They stay for 3 days.</p>
    ${F.length?`<div class="wl-list">${F.map((f,i)=>{const m=findMon(f),known=S.dex.seen.includes(m.sp);return `<button class="wl-row" data-f="${i}">${known?sprH(m.sp,48):`<span style="width:48px;text-align:center;font-size:30px">❔</span>`}<div class="grow"><b>${known?spName(m.sp):"Something"} <small>Lv ${m.lv}</small></b><small>${f.town?X.esc(f.town)+" · ":""}${new Date(f.ts).toLocaleString([], {weekday:"short",hour:"2-digit",minute:"2-digit"})}${f.night?" · 🌙":""}${f.fast?" · 🚆":""}</small></div><b>Meet ›</b></button>`;}).join("")}</div>`:`<div class="wl-box">No finds yet. Take a walk or a trip with the app on, and check back here.</div>`}
    <label class="gm-drink" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="wlOff" ${off?"":"checked"}> <span>Let Wildlings turn up along my routes (uses no extra battery: only the location the app already has)</span></label>
    <div class="gm-row2"><button class="tl-act ghost" id="wlBack">Back to the map</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{X.tapv();const all=X.store("pt-wfind",{}),f=finds()[+b.dataset.f];if(!f)return;all.f=(all.f||[]).filter(x=>x.k!==f.k);X.save("pt-wfind",all);const m=findMon(f);startWild(m.sp,m.lv,f.night?"night":"",true);});
  E.querySelector("#wlOff").onchange=e=>{try{localStorage.setItem("pt-wfoff",e.target.checked?"0":"1");}catch(x){}};
  E.querySelector("#wlBack").onclick=()=>world();}

/* ---------------- battle engine (the same rules for wild, tamers and friends) ---------------- */
function fighter(m){const st=stats(m.sp,m.lv);return {m,sp:m.sp,lv:m.lv,max:st.hp,hp:Math.max(0,Math.min(st.hp,m.hp==null?st.hp:m.hp)),atk:st.atk,def:st.def,spd:st.spd,moves:movesOf(m.sp,m.lv),sa:0,sd:0};}
const stage=s=>s>=0?(2+s)/2:2/(2-s);
function alive(side){return side.team.some(f=>f.hp>0);}
function snap(B){return B.sides.map(s=>{const f=s.team[s.cur];return {sp:f.sp,lv:f.lv,hp:f.hp,max:f.max,n:s.team.filter(x=>x.hp>0).length};});}
function resolve(B,acts){const R=B.R,ev=[],push=(t,extra)=>ev.push(Object.assign({t,snap:snap(B)},extra||{}));B.turn++;
  const nm=i=>{const s=B.sides[i],f=s.team[s.cur];return (i===B.me?"":s.foePrefix)+spName(f.sp);};
  // non-move actions first
  for(const i of [0,1]){const a=acts[i];if(!a)continue;const s=B.sides[i];
    if(a.k==="sw"){const old=nm(i);s.team[s.cur].sa=0;s.team[s.cur].sd=0;s.cur=a.i;push(`${i===B.me?"Come back, "+old+"! Go, ":s.name+" sends out "}${spName(s.team[s.cur].sp)}!`,{sw:i});}
    if(a.k==="ff"){B.over=1-i;push(`${i===B.me?"You give":s.name+" gives"} up.`);return ev;}
    if(a.k==="run"){const me=B.sides[i].team[B.sides[i].cur],foe=B.sides[1-i].team[B.sides[1-i].cur];if(R()<0.55+0.4*me.spd/(me.spd+foe.spd)){B.over=-2;push("You got away safely.");return ev;}push("Couldn't get away!");}
    if(a.k==="item"){const f=s.team[a.i];const big=a.it==="bigb";f.hp=big?f.max:Math.min(f.max,f.hp+30);push(`${spName(f.sp)} ate a ${big?"Big Berry":"Berry"} and feels better.`);}
    if(a.k==="orb"){const foe=B.sides[1-i].team[B.sides[1-i].cur],rare=SP[foe.sp][9],mult=a.it==="sorb"?1.6:1;
      const ch=Math.min(0.97,(1-0.72*foe.hp/foe.max)*[0,0.75,0.5,0.3][rare]*mult*(foe.lv>25?0.8:1)+0.05);const ok=R()<ch;const sh=ok?3:Math.floor(R()*3);
      push(`You throw ${a.it==="sorb"?"a Super Orb":"an Orb"}…`,{orb:sh,caught:ok});if(ok){B.over=-3;push(`Gotcha! ${spName(foe.sp)} was caught!`);return ev;}push(["Oh no, it broke free!","Argh, so close!","It slipped out!"][sh]||"It broke free!");}}
  // moves, fastest first
  const order=[0,1].filter(i=>acts[i]&&acts[i].k==="mv");order.sort((a,b)=>{const fa=B.sides[a].team[B.sides[a].cur],fb=B.sides[b].team[B.sides[b].cur];return (fb.spd-fa.spd)||(R()<0.5?-1:1);});
  for(const i of order){const s=B.sides[i],o=B.sides[1-i],f=s.team[s.cur],t=o.team[o.cur];if(f.hp<=0||t.hp<=0)continue;
    const mv=f.moves[acts[i].i]||f.moves[0];
    if(mv.fx==="def"){f.sd=Math.min(3,f.sd+1);push(`${nm(i)} uses Brace. Its defence rises!`,{who:i});continue;}
    if(mv.fx==="atk"){t.sa=Math.max(-3,t.sa-1);push(`${nm(i)} uses Glare. ${nm(1-i)}'s attack drops!`,{who:i});continue;}
    if(R()*100>=mv.a){push(`${nm(i)} uses ${mv.n}, but misses!`,{who:i});continue;}
    const e=eff(mv.ty,SP[t.sp][1]),stab=mv.ty===SP[f.sp][1]?1.5:1,crit=R()<1/16?1.5:1;
    const dmg=Math.max(1,Math.floor(((2*f.lv/5+2)*mv.p*(f.atk*stage(f.sa))/(t.def*stage(t.sd))/50+2)*e*stab*crit*(0.85+R()*0.15)));
    t.hp=Math.max(0,t.hp-dmg);
    push(`${nm(i)} uses ${mv.n}!${crit>1?" A critical hit!":""}${e>1?" It's super effective!":e<1?" It's not very effective…":""}`,{who:i,hit:1-i});
    if(t.hp<=0){push(`${nm(1-i)} faints!`,{faint:1-i});B.onFaint&&B.onFaint(1-i,t,f,push);
      if(alive(o)){o.cur=o.team.findIndex(x=>x.hp>0);push(`${1-i===B.me?"Go, ":o.name+" sends out "}${spName(o.team[o.cur].sp)}!`,{sw:1-i});}
      else{B.over=i;push(i===B.me?(B.kind==="wild"?"":`You beat ${o.name}!`):`${B.me===1-i?"You're out of Wildlings!":""}`);}}}
  return ev.filter(e=>e.t);}
function aiAct(B,i){const s=B.sides[i],f=s.team[s.cur],t=B.sides[1-i].team[B.sides[1-i].cur];
  const val=f.moves.map(m=>m.fx?(B.turn<2&&Math.random()<0.5?40:5):m.p*eff(m.ty,SP[t.sp][1])*(m.ty===SP[f.sp][1]?1.5:1)*m.a/100);
  if(B.kind==="wild"&&Math.random()<0.35)return {k:"mv",i:Math.floor(Math.random()*f.moves.length)};
  let best=0;val.forEach((v,k)=>{if(v>val[best])best=k;});return {k:"mv",i:best};}

/* ---------------- battle screen ---------------- */
let BT=null;
function startWild(sp,lv,bg,fromRoute){seen(sp);persist();const foe=newMon(sp,lv);
  battle({kind:"wild",bg,sides:[{name:"You",team:S.party.map(fighter),cur:0,foePrefix:""},{name:"Wild",team:[fighter(foe)],cur:0,foePrefix:"Wild "}],me:0,intro:`A wild ${spName(sp)} appears!`,route:fromRoute});}
function startNpc(n){for(const t of n.team)seen(t[0]);persist();
  battle({kind:"npc",npc:n,bg:n.id==="vex"||n.id==="ilse"?"cave":"",sides:[{name:"You",team:S.party.map(fighter),cur:0,foePrefix:""},{name:n.name,team:n.team.map(([sp,lv])=>fighter(newMon(sp,lv))),cur:0,foePrefix:"The foe's "}],me:0,intro:`${n.name} wants to battle!`});}
function battle(o){stop();VIEW="battle";const firstAlive=o.sides[0].team.findIndex(f=>f.hp>0);if(firstAlive<0){say(["Your Wildlings are too tired to battle. Rest at the red door first."]);return world();}
  o.sides[0].cur=firstAlive;BT=Object.assign({R:X.rng(o.seed||((Math.random()*4294967295)>>>0)),turn:0,over:null,q:[],busy:false,xpGain:{}},o);
  if(BT.kind!=="pvp")BT.onFaint=(side,dead,killer,push)=>{if(side!==BT.me)gainXp(dead,push);};
  drawBattle(snap(BT));queue([{t:BT.intro,snap:snap(BT)}],()=>menuB());}
function gainXp(dead,push){const f=BT.sides[BT.me].team[BT.sides[BT.me].cur],g=Math.floor(dead.lv*(BT.kind==="npc"?18:13)*(SP[dead.sp][9]>=2?1.3:1));
  for(const x of BT.sides[BT.me].team){if(x.hp<=0)continue;const amt=x===f?g:Math.floor(g/3);if(!amt)continue;const m=x.m;m.xp+=amt;if(x===f)push(`${spName(m.sp)} gains ${amt} XP.`);
    while(m.xp>=xpNeed(m.lv)&&m.lv<60){m.xp-=xpNeed(m.lv);m.lv++;const ns=stats(m.sp,m.lv);x.hp+=ns.hp-x.max;Object.assign(x,{lv:m.lv,max:ns.hp,atk:ns.atk,def:ns.def,spd:ns.spd,moves:movesOf(m.sp,m.lv)});
      push(`${spName(m.sp)} grows to level ${m.lv}!`);const e=SP[m.sp][6];if(e>=0&&m.lv>=SP[m.sp][7])BT.evolve=(BT.evolve||[]).concat([m]);}}}
function drawBattle(sn){const E=EL();const [a,b]=[sn[BT.me],sn[1-BT.me]];
  const hp=(s,cls)=>{const p=s.hp/s.max*100;return `<div class="wl-hp ${cls}"><div>${spName(s.sp)} <small>Lv ${s.lv}</small></div><div class="bar"><i class="${p<25?"low":p<50?"mid":""}" style="width:${p}%"></i></div>${cls==="m"?`<small>${s.hp}/${s.max}</small>`:""}${BT.kind!=="wild"?` <small>${"●".repeat(s.n)}</small>`:""}</div>`;};
  if(!E.querySelector("#wlBt")){E.innerHTML=`<div class="wl"><div class="tl-row">${BT.link?`<span class="gm-link" id="gmLink">${X.esc(BT.link.status())}</span>`:""}</div><div class="wl-bt ${BT.bg||""}" id="wlBt"></div><div class="wl-box" id="wlBMsg"></div><div id="wlBAct"></div></div>`;}
  E.querySelector("#wlBt").innerHTML=`<div class="pad" style="right:10px;top:104px"></div><div class="pad" style="left:16px;bottom:6px"></div>
    <div class="foe" id="wlFoe">${sprH(b.sp,110)}</div><div class="mine" id="wlMine">${sprH(a.sp,120)}</div>${hp(b,"f")}${hp(a,"m")}`;}
function queue(evs,done){BT.busy=true;const act=document.getElementById("wlBAct");if(act)act.innerHTML="";let i=0;
  const step=()=>{if(!document.getElementById("wlBMsg"))return;if(i>=evs.length){BT.busy=false;done&&done();return;}const e=evs[i++];
    drawBattle(e.snap);const m=document.getElementById("wlBMsg");m.textContent=e.t;
    const foeEl=document.getElementById("wlFoe"),meEl=document.getElementById("wlMine"),sideEl=s=>s===BT.me?meEl:foeEl;
    if(e.hit!=null&&sideEl(e.hit))sideEl(e.hit).classList.add("wl-hit");
    if(e.faint!=null&&sideEl(e.faint)){const el=sideEl(e.faint);requestAnimationFrame(()=>el.classList.add("wl-faint"));}
    if(e.orb!=null&&foeEl){foeEl.innerHTML=`<div class="wl-shake" style="font-size:54px;margin:28px 26px">🔴</div>`;}
    setTimeout(step,e.orb!=null?1700:e.t.length>40?1500:1100);};
  step();const m=document.getElementById("wlBMsg");if(m)m.onclick=()=>{};}
function menuB(){if(BT.over!=null)return endBattle();const E=EL(),act=E.querySelector("#wlBAct"),s=BT.sides[BT.me],f=s.team[s.cur];
  E.querySelector("#wlBMsg").textContent=`What will ${spName(f.sp)} do?`;
  act.innerHTML=`<div class="wl-acts">${f.moves.map((m,i)=>`<button data-mv="${i}">${m.n}<small>${m.fx?"support":TYN[m.ty]+" · "+m.p}</small></button>`).join("")}</div>
    <div class="gm-row2"><button class="tl-act ghost" id="wlSw" ${s.team.filter(x=>x.hp>0).length>1?"":"disabled"}>🐾 Switch</button>
    ${BT.kind==="pvp"?`<button class="tl-act ghost" id="wlFf">🏳 Give up</button>`:`<button class="tl-act ghost" id="wlBag">🎒 Bag</button>`}
    ${BT.kind==="wild"?`<button class="tl-act ghost" id="wlRun">🏃 Run</button>`:""}</div>`;
  act.querySelectorAll("[data-mv]").forEach(b=>b.onclick=()=>{X.tapv();choose({k:"mv",i:+b.dataset.mv});});
  const sw=act.querySelector("#wlSw");if(sw)sw.onclick=()=>{X.tapv();act.innerHTML=`<div class="wl-list">${s.team.map((x,i)=>`<button class="wl-row" data-sw="${i}" ${x.hp<=0||i===s.cur?"disabled":""}>${sprH(x.sp,40)}<div class="grow"><b>${spName(x.sp)} <small>Lv ${x.lv}</small></b><small>${x.hp}/${x.max} HP</small></div></button>`).join("")}</div><div class="gm-row2"><button class="tl-act ghost" id="wlCan">Cancel</button></div>`;
    act.querySelectorAll("[data-sw]").forEach(b=>b.onclick=()=>{if(b.disabled)return;choose({k:"sw",i:+b.dataset.sw});});act.querySelector("#wlCan").onclick=menuB;};
  const bg=act.querySelector("#wlBag");if(bg)bg.onclick=()=>{X.tapv();const it=[];if(BT.kind==="wild"){if(S.bag.orb)it.push(["orb","🔴 Orb",S.bag.orb]);if(S.bag.sorb)it.push(["sorb","🔵 Super Orb",S.bag.sorb]);}
    if(S.bag.berry)it.push(["berry","🫐 Berry",S.bag.berry]);if(S.bag.bigb)it.push(["bigb","🍇 Big Berry",S.bag.bigb]);
    act.innerHTML=`<div class="wl-acts">${it.map(([k,l,n])=>`<button data-it="${k}">${l}<small>× ${n}</small></button>`).join("")||"<span class='sv-note'>Your bag is empty.</span>"}</div>${BT.kind==="npc"?`<p class="sv-note">You can't catch a tamer's Wildlings.</p>`:""}<div class="gm-row2"><button class="tl-act ghost" id="wlCan">Cancel</button></div>`;
    act.querySelector("#wlCan").onclick=menuB;
    act.querySelectorAll("[data-it]").forEach(b=>b.onclick=()=>{const k=b.dataset.it;X.tapv();
      if(k==="orb"||k==="sorb"){if(S.party.length+S.box.length>=200){X.toast("Your box is full");return;}S.bag[k]--;persist();choose({k:"orb",it:k});return;}
      act.innerHTML=`<div class="wl-list">${s.team.map((x,i)=>`<button class="wl-row" data-hi="${i}" ${x.hp<=0||x.hp>=x.max?"disabled":""}>${sprH(x.sp,40)}<div class="grow"><b>${spName(x.sp)}</b><small>${x.hp}/${x.max} HP</small></div></button>`).join("")}</div><div class="gm-row2"><button class="tl-act ghost" id="wlCan">Cancel</button></div>`;
      act.querySelector("#wlCan").onclick=menuB;act.querySelectorAll("[data-hi]").forEach(h=>h.onclick=()=>{if(h.disabled)return;S.bag[k]--;persist();choose({k:"item",it:k,i:+h.dataset.hi});});});};
  const rn=act.querySelector("#wlRun");if(rn)rn.onclick=()=>{X.tapv();choose({k:"run"});};
  const ff=act.querySelector("#wlFf");if(ff)ff.onclick=()=>{X.tapv();choose({k:"ff"});};}
function choose(a){if(BT.busy)return;if(BT.kind==="pvp")return pvpChoose(a);const acts=[null,null];acts[BT.me]=a;
  if(a.k!=="run"&&a.k!=="orb")acts[1-BT.me]=aiAct(BT,1-BT.me);else acts[1-BT.me]=aiAct(BT,1-BT.me);
  queue(resolve(BT,acts),()=>menuB());}
function endBattle(){const B=BT,E=EL();
  // carry HP back to the real team (not for friend battles)
  if(B.kind!=="pvp")for(const f of B.sides[0].team)f.m.hp=f.hp;
  const lines=[];let win=B.over===B.me;
  if(B.kind==="wild"){if(B.over===-3){const foe=B.sides[1].team[0];const m=newMon(foe.sp,foe.lv);m.hp=foe.hp;caught(foe.sp);if(S.party.length<6){S.party.push(m);lines.push(`${spName(foe.sp)} joins your team!`);}else{S.box.push(m);lines.push(`${spName(foe.sp)} went to your box (your team is full).`);}}
    else if(win){const c=2+B.sides[1].team[0].lv;S.coins+=c;lines.push(`You found ${c} coins.`);}}
  if(B.kind==="npc"){if(win){const n=B.npc,c=n.team.reduce((s,t)=>s+t[1],0)*6;S.coins+=c;S.beat[n.id]=today();S.wins=(S.wins||0)+1;lines.push(`${n.name}: ${n.after}`,`You won ${c} coins!`);}}
  if(B.kind==="pvp"){const n=B.sides[1-B.me].name;if(win){S.coins+=40;S.wins=(S.wins||0)+1;lines.push(`🏆 You beat ${n}! +40 coins`);}else if(B.over!==B.me)lines.push(`${n} won this time.`);}
  if(B.kind!=="pvp"&&!alive(B.sides[0])){const lost=Math.floor(S.coins/4);S.coins-=lost;healAll();PL={x:6,y:15,d:2};lines.push(`You hurry back to the rest hut${lost?` and drop ${lost} coins on the way`:""}. Your team is healed.`);}
  for(const m of (B.evolve||[])){const to=SP[m.sp][6];if(to<0||m.lv<SP[m.sp][7])continue;const from=spName(m.sp);m.sp=to;m.hp=stats(m.sp,m.lv).hp;caught(to);lines.push(`What's this? ${from} grew into ${spName(to)}! ✨`);}
  persist();const link=B.link;BT=null;
  if(B.kind==="pvp"){E.innerHTML=`<div class="wl"><div class="wl-box">${lines.map(X.esc).join("<br>")||"Battle over."}</div><div class="gm-row2"><button class="tl-act" id="wlRe">Rematch</button><button class="tl-act ghost" id="wlOut">Done</button></div></div>`;
    if(PV){PV.begun=false;if(PV.pendingRe)return pvpBegin(link);}
    E.querySelector("#wlRe").onclick=()=>{X.tapv();if(!PV)return;link.send(10,"01");if(!PV.begun)pvpBegin(link);};E.querySelector("#wlOut").onclick=()=>{X.stopAll();X.hub();};return;}
  VIEW="world";world();if(lines.length)say(lines);}

/* ---------------- friends: battle and trade over the link from games.js ---------------- */
let PV=null;   // {L, mode, peerTeam, seed, acts:{}, turn}
function friends(){const E=EL();VIEW="friends";
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">🤝 With friends</div><div class="gm-how">
    <button data-fm="mon"><b>⚔️ Battle</b><small>Your whole team against theirs. Everyone starts at full health; nothing is lost.</small></button>
    <button data-fm="trade"><b>🔁 Trade</b><small>Swap one Wildling each. Both of you have to accept.</small></button></div>
    <p class="sv-note">Over Bluetooth next to each other, or online with someone in your circle. Wins so far: ${S.wins||0}.</p><div class="gm-row2"><button class="tl-act ghost" id="wlBack">Back to the map</button></div></div>`;X.wireBack();
  E.querySelectorAll("[data-fm]").forEach(b=>b.onclick=()=>{X.tapv();const m=b.dataset.fm;X.friendMenu(m,m==="mon"?"Wildlings battle":"Wildlings trade",L=>netStart(L,m));});
  E.querySelector("#wlBack").onclick=()=>world();}
const teamHex=()=>S.party.slice(0,6).map(m=>X.h2(m.sp)+X.h2(m.lv)).join("");
function netStart(L,mode){addCss();load();if(!MAP)buildMap();X.setLink(L);
  if(!S){EL().innerHTML=`<div class="wl"><div class="wl-box">Pick your first Wildling before you battle or trade with friends.</div></div>`;L.send(4,"");setTimeout(()=>{X.stopAll();openStarter();},1500);return;}
  PV={L,mode,peerTeam:null,seeds:{},round:0,begun:false,pendingRe:false,acts:{},offer:null,peerOffer:null,acc:false,peerAcc:false};
  L.on=(t,d)=>{const b=X.bytes(d);
    if(t===4){X.toast(`${L.peerName} left`);X.stopAll();X.hub();return;}
    if(t===5){PV.peerTeam=[];for(let i=0;i+1<b.length;i+=2)if(b[i]<N_SP&&b[i+1]>0)PV.peerTeam.push([b[i],Math.min(100,b[i+1])]);if(PV.mode==="mon")tryPvp();return;}
    if(t===6){PV.seeds[b[4]]=((b[0]<<24)|(b[1]<<16)|(b[2]<<8)|b[3])>>>0;tryPvp();return;}
    if(t===7){PV.acts[b[0]+":"+b[1]+":"+(1-L.role)]={k:["","mv","sw","ff"][b[2]],i:b[3]};pvpTry();return;}
    if(t===10){if(BT)PV.pendingRe=true;else if(!PV.begun)pvpBegin(L);return;}
    if(t===8){PV.peerOffer=b[0]===255?null:{sp:b[0],lv:b[1],xp:(b[2]<<16)|(b[3]<<8)|b[4]};PV.acc=false;PV.peerAcc=false;tradeView();return;}
    if(t===9){const o=PV.offer,p=PV.peerOffer;   // an accept only counts for exactly the two Wildlings on the table now
      PV.peerAcc=b[0]===1&&!!o&&!!p&&b[1]===o.m.sp&&b[2]===o.m.lv&&b[3]===p.sp&&b[4]===p.lv;/* they list what they get, then what they give */tradeTry();tradeView();return;}};
  if(mode==="mon")pvpBegin(L);else tradeView();}
function openStarter(){X.hub();}
function pvpBegin(L){if(!PV)return;PV.begun=true;PV.pendingRe=false;
  EL().innerHTML=`<div class="wl"><div class="wl-box">Connected to ${X.esc(L.peerName)}. Getting the teams ready…</div></div>`;
  L.send(5,teamHex());if(L.role===0){const seed=(Math.random()*4294967295)>>>0;PV.seeds[PV.round]=seed;L.send(6,[seed>>>24,seed>>>16,seed>>>8,seed,PV.round].map(X.h2).join(""));}tryPvp();}
function tryPvp(){if(!PV||PV.mode!=="mon"||!PV.begun||!PV.peerTeam||PV.seeds[PV.round]==null||BT)return;const L=PV.L;PV.seed=PV.seeds[PV.round];PV.cur=PV.round;PV.round=(PV.round+1)&255;
  const mine={name:"You",team:S.party.slice(0,6).map(m=>{const f=fighter(Object.assign({},m,{hp:null}));return f;}),cur:0,foePrefix:""};
  const theirs={name:L.peerName,team:PV.peerTeam.map(([sp,lv])=>fighter({sp,lv,hp:null})),cur:0,foePrefix:L.peerName+"'s "};
  for(const t of PV.peerTeam)seen(t[0]);persist();
  const sides=L.role===0?[mine,theirs]:[theirs,mine];
  battle({kind:"pvp",link:L,seed:PV.seed,sides,me:L.role,intro:`${L.peerName} wants to battle!`});BT.onFaint=null;}
function pvpChoose(a){const key=PV.cur+":"+(BT.turn&255)+":"+BT.me;if(PV.acts[key])return;PV.acts[key]=a;
  PV.L.send(7,X.h2(PV.cur)+X.h2(BT.turn)+X.h2({mv:1,sw:2,ff:3}[a.k])+X.h2(a.i||0));
  document.getElementById("wlBAct").innerHTML="";document.getElementById("wlBMsg").textContent=`Waiting for ${PV.L.peerName}…`;pvpTry();}
function pvpTry(){if(!BT||BT.busy||BT.kind!=="pvp"||BT.over!=null)return;const t=PV.cur+":"+(BT.turn&255);let a0=PV.acts[t+":0"],a1=PV.acts[t+":1"];
  if((a0&&a0.k==="ff")||(a1&&a1.k==="ff")){if(!(a0&&a0.k==="ff"))a0=null;else a1=null;}   // giving up doesn't wait for the other player
  else if(!a0||!a1)return;delete PV.acts[t+":0"];delete PV.acts[t+":1"];
  const ev=resolve(BT,[a0,a1]);queue(ev,()=>{menuB();if(BT&&PV&&PV.acts[PV.cur+":"+(BT.turn&255)+":"+BT.me])pvpTry();});}
/* trade */
function tradeView(){if(!PV||PV.mode!=="trade")return;const E=EL(),all=S.party.map((m,i)=>({m,where:"p",i})).concat(S.box.map((m,i)=>({m,where:"b",i}))),o=PV.offer,po=PV.peerOffer;
  E.innerHTML=X.back()+`<div class="wl"><div class="gm-title">🔁 Trade with ${X.esc(PV.L.peerName)}</div><div class="tl-row"><span class="gm-link" id="gmLink">${X.esc(PV.L.status())}</span></div>
    <div class="wl-box" style="display:flex;gap:10px;align-items:center;justify-content:space-around;text-align:center">
      <div>${o?sprH(o.m.sp,72)+`<br>${spName(o.m.sp)} Lv ${o.m.lv}`:"Pick one below"}<br><small>You give ${PV.acc?"✅":""}</small></div><div style="font-size:26px">⇄</div>
      <div>${po?sprH(po.sp,72)+`<br>${spName(po.sp)} Lv ${po.lv}`:"…"}<br><small>You get ${PV.peerAcc?"✅":""}</small></div></div>
    <div class="gm-row2"><button class="tl-act" id="wlAcc" ${o&&po&&!PV.acc?"":"disabled"}>${PV.acc?"Waiting for them…":"Accept the trade"}</button></div>
    <div class="wl-list">${all.map((x,k)=>`<button class="wl-row ${o&&o.m===x.m?"sel":""}" data-off="${k}" ${x.where==="p"&&S.party.length<2&&!S.box.length?"disabled":""}>${monRow(x.m,x.where==="b"?" · box":"")}</button>`).join("")}</div></div>`;
  X.wireBack();
  E.querySelectorAll("[data-off]").forEach(b=>b.onclick=()=>{const x=all[+b.dataset.off];if(x.where==="p"&&S.party.length<2&&!S.box.length){X.toast("Keep at least one Wildling");return;}X.tapv();
    PV.offer=x;PV.acc=false;PV.L.send(8,X.h2(x.m.sp)+X.h2(x.m.lv)+X.h2(x.m.xp>>16)+X.h2(x.m.xp>>8)+X.h2(x.m.xp));tradeView();});
  const a=E.querySelector("#wlAcc");if(a)a.onclick=()=>{X.tapv();PV.acc=true;PV.L.send(9,[1,po.sp,po.lv,o.m.sp,o.m.lv].map(X.h2).join(""));tradeTry();tradeView();};}
function tradeTry(){if(!PV.acc||!PV.peerAcc||!PV.offer||!PV.peerOffer)return;const o=PV.offer,p=PV.peerOffer;
  const list=o.where==="p"?S.party:S.box,i=list.indexOf(o.m);if(i<0)return;list.splice(i,1);
  const m=newMon(p.sp,p.lv);m.xp=p.xp||0;if(o.where==="p")S.party.splice(i,0,m);else S.box.push(m);
  if(!S.party.length)S.party.push(S.box.shift());caught(p.sp);persist();
  // the trade is done: a traded Wildling that's ready grows right away
  if(SP[m.sp][6]>=0&&m.lv>=SP[m.sp][7]){const from=spName(m.sp);m.sp=SP[m.sp][6];caught(m.sp);X.toast(`✨ ${from} grew into ${spName(m.sp)}!`);}
  X.toast(`🔁 You got ${spName(m.sp)}!`);PV.offer=null;PV.peerOffer=null;PV.acc=false;PV.peerAcc=false;}

window.MON={init(h){X=h;},home(){addCss();home();},netStart(L,mode){netStart(L,mode);},stop(){stop();if(S&&VIEW==="world"){S.pos=PL;persist();}PV=null;BT=null;},
  _t:{SP,movesOf,stats,resolve,fighter,eff,art,MAPF:()=>{if(!MAP)buildMap();return MAP;},state:()=>S,BT:()=>BT,pl:()=>PL}};
})();
