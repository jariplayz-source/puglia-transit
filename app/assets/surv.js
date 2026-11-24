/* Out & Back: survival guides, pictures and tools (loaded on demand by index.html) */
/* ---------- SURVIVAL PICTURES: original rounded pictograms, animated with CSS, drawn in code (offline, tiny) ---------- */
const svH="var(--svh)",svP="var(--svp)",svK="var(--sc)";
function svPl(pts,w,c,x){return `<path d="M${pts.map(p=>p.join(" ")).join("L")}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${x?" "+x:""}/>`;}
// figure: h head, s shoulder, p hip, a/b arms [elbow,hand], l/m legs [knee,foot]; b,m are the far limbs
// Figures in the mascot's retro poster style: outlined limbs, clothes, hands, boots and a cartoon head.
// The colour passed in picks the outfit: svH = hiker (our mascot), svP = the person being helped, svK = a second helper.
const SV_O="#1d2a30",SV_SK="#f4c9a0",SV_SK2="#e3a97f";
function svOutfit(c){return c===svP?{top:"#8fb3d9",top2:"#6f95bd",leg:"#5c6b7a",shoe:"#3a3f45",head:"hair",hair:"#7a4a2a"}
  :c===svH?{top:"#11706a",top2:"#0c5752",leg:"#c9a66b",shoe:"#7a4a2a",head:"hat",hat:"#e9d8a6",band:"#e8833a",scarf:"#d6452f"}
  :{top:"var(--sc)",top2:"var(--sc)",leg:"#33414c",shoe:"#2a2f35",head:"cap",hat:"var(--sc)"};}
function svLimb(pts,w,col,far){return `<path d="M${pts.map(p=>p.join(" ")).join("L")}" stroke="${SV_O}" stroke-width="${w+3.2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`+
  `<path d="M${pts.map(p=>p.join(" ")).join("L")}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${far?' opacity=".8"':""}/>`;}
function svHand(p){return `<circle cx="${p[0]}" cy="${p[1]}" r="3.3" fill="${SV_SK}" stroke="${SV_O}" stroke-width="1.5"/>`;}
function svShoe(k,f,col){const dx=f[0]-k[0],dy=f[1]-k[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  // toe points forward (sideways from the leg); pick the side the knee bends to
  const sx=-uy,sy=ux,sgn=(k[0]>f[0]?-1:1)*(Math.abs(uy)>.7?1:0)||1;const t=[f[0]+sx*5*sgn,f[1]+sy*5*sgn];
  return `<path d="M${f[0]} ${f[1]}L${t[0]} ${t[1]}" stroke="${SV_O}" stroke-width="8.6" stroke-linecap="round"/><path d="M${f[0]} ${f[1]}L${t[0]} ${t[1]}" stroke="${col}" stroke-width="5.6" stroke-linecap="round"/>`;}
function svFig(P,c,cls){const F=svOutfit(c),o=k=>P[k];let g=`<g class="nolines${cls?" "+cls:""}">`;
  if(P.m){g+=svLimb([o("p"),...P.m],7,F.leg,1)+svShoe(P.m[0],P.m[1],F.shoe);}
  if(P.b){g+=svLimb([o("s"),...P.b],6,F.top2,1)+svHand(P.b[P.b.length-1]);}
  g+=svLimb([o("s"),o("p")],12,F.top);
  if(c===svH){const d=[o("p")[0]-o("s")[0],o("p")[1]-o("s")[1]],L=Math.hypot(...d)||1;const q=[o("s")[0]+d[0]/L*13,o("s")[1]+d[1]/L*13];   // backpack strap + belt line
    g+=`<path d="M${o("s")[0]} ${o("s")[1]}L${q[0]} ${q[1]}" stroke="#e8833a" stroke-width="2.6" stroke-linecap="round"/>`;}
  if(P.l){g+=svLimb([o("p"),...P.l],7,F.leg)+svShoe(P.l[0],P.l[1],F.shoe);}
  if(P.a){g+=svLimb([o("s"),...P.a],6,F.top)+svHand(P.a[P.a.length-1]);}
  return g+svHead(P,c,F)+`</g>`;}
function svHead(P,c,F){const [x,y]=P.h,dx=P.h[0]-P.s[0],dy=P.h[1]-P.s[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  const ang=Math.atan2(ux,-uy)*180/Math.PI;                         // rotate the head so "up" points away from the shoulders
  const look=Math.abs(uy)>.6&&P.a&&P.a.length?Math.sign(P.a[P.a.length-1][0]-P.s[0])*1.6:0;
  const asleep=c===svP;
  let g=`<g transform="translate(${x} ${y}) rotate(${ang.toFixed(1)})">`;
  if(F.head==="hair")g+=`<path d="M-9.5 -1q-1-11 9.5-11q10.5 0 9.5 11q-3-6-9-6.5q-6 .5-10 6.5z" fill="${F.hair}" stroke="${SV_O}" stroke-width="1.6" stroke-linejoin="round"/>`;
  g+=`<circle cx="${-9.6}" cy="1" r="2.6" fill="${SV_SK}" stroke="${SV_O}" stroke-width="1.4"/><circle cx="9.6" cy="1" r="2.6" fill="${SV_SK}" stroke="${SV_O}" stroke-width="1.4"/>`;
  g+=`<circle r="9.5" fill="${SV_SK}" stroke="${SV_O}" stroke-width="1.8"/>`;
  if(F.head==="hair")g+=`<path d="M-9 -3q2-7 9-7q7 0 9 7q-4-4-9-4.5q-5 .5-9 4.5z" fill="${F.hair}"/>`;
  g+=`<circle cx="${-5.2+look}" cy="3.4" r="1.8" fill="#ef8f86" opacity=".55"/><circle cx="${5.2+look}" cy="3.4" r="1.8" fill="#ef8f86" opacity=".55"/>`;
  if(asleep)g+=`<path d="M${-5+look} -.5q1.6 1.4 3.2 0M${1.8+look} -.5q1.6 1.4 3.2 0" stroke="${SV_O}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M${-2.2+look} 5q2.2 -1.2 4.4 0" stroke="${SV_O}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  else g+=`<g class="a-eye"><ellipse cx="${-3.4+look}" cy="-1" rx="1.25" ry="1.75" fill="${SV_O}"/><ellipse cx="${3.4+look}" cy="-1" rx="1.25" ry="1.75" fill="${SV_O}"/></g>`+
    `<path d="M${-5.2+look} -4.6q1.8-1.4 3.6-.4M${1.6+look} -5q1.8-1 3.6.4" stroke="${SV_O}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`+
    `<path d="M${-4.2+look} 3.2q4.2 4.6 8.4 0z" fill="#5b1f1f" stroke="${SV_O}" stroke-width="1.1" stroke-linejoin="round"/><path d="M${-3.4+look} 3.6h6.8" stroke="#fff" stroke-width="1.1"/>`;
  g+=`<ellipse cx="${look*.6}" cy="1.6" rx="1.4" ry="1.1" fill="${SV_SK2}"/>`;
  if(F.head==="hat")g+=`<path d="M-14 -6.5q14-5 28 0q-14 3.2-28 0z" fill="${F.hat}" stroke="${SV_O}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-8.4 -7q-.4-8.6 8.4-9.4q8.8.8 8.4 9.4z" fill="${F.hat}" stroke="${SV_O}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-8.3 -9.4q8.3 2.2 16.6 0v2q-8.3 2-16.6 0z" fill="${F.band}"/>`;
  if(F.head==="cap")g+=`<path d="M-9.4 -4q0-8.6 9.4-8.6q9.4 0 9.4 8.6z" fill="${F.hat}" stroke="${SV_O}" stroke-width="1.5"/><path d="M${look>=0?2:-2} -4.2h${look>=0?10:-10}" stroke="${SV_O}" stroke-width="3.6" stroke-linecap="round"/><path d="M${look>=0?2:-2} -4.2h${look>=0?10:-10}" stroke="${F.hat}" stroke-width="1.8" stroke-linecap="round"/>`;
  return g+`</g>`;}
function svMv(P,dx,dy=0){const r={};for(const k in P){const v=P[k];r[k]=typeof v[0]==="number"?[v[0]+dx,v[1]+dy]:v.map(q=>[q[0]+dx,q[1]+dy]);}return r;}
const svStand=x=>({h:[x,24],s:[x,37],p:[x,61],a:[[x-6,49],[x-7,61]],b:[[x+6,49],[x+7,61]],l:[[x-3,76],[x-4,92]],m:[[x+3,76],[x+4,92]]});
const svLie=x=>({h:[x,83],s:[x+12,86],p:[x+38,86],a:[[x+24,89],[x+36,89]],l:[[x+52,87],[x+68,88]],m:[[x+52,85],[x+68,86]]});
const svGround=`<path d="M6 93H154" stroke="var(--line)" stroke-width="2" stroke-linecap="round"/>`;
const svArr=(d,cls)=>`<path class="${cls||""}" d="${d}" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const svTxt=(x,y,t,s,c,a)=>`<text x="${x}" y="${y}" font-size="${s||11}" font-weight="800" fill="${c||svK}" text-anchor="${a||"middle"}" font-family="system-ui,sans-serif">${t}</text>`;
const svX=(x,y)=>`<g stroke="#c5221f" stroke-width="4.5" stroke-linecap="round"><path d="M${x-7} ${y-7}L${x+7} ${y+7}M${x+7} ${y-7}L${x-7} ${y+7}"/></g>`;
const svPhone=(x,y,inner)=>`<rect x="${x}" y="${y}" width="34" height="58" rx="7" fill="${svH}"/><rect x="${x+3.5}" y="${y+7}" width="27" height="42" rx="3" fill="var(--card)"/>${inner||""}`;
const svRings=(x,y)=>[0,1,2].map(i=>`<circle class="a-ring" style="animation-delay:${i*.5}s" cx="${x}" cy="${y}" r="14" fill="none" stroke="${svK}" stroke-width="3"/>`).join("");
const svWater=(y,cls)=>`<path class="${cls||"a-wave"}" d="M-20 ${y}q10 -5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0V104H-20Z" fill="#3b8fd0" opacity=".35"/>`;
const svClock=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="var(--card)" stroke="${svH}" stroke-width="4"/><path class="a-spin" style="transform-origin:${x}px ${y}px" d="M${x} ${y}V${y-r+5}" stroke="${svK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="2.5" fill="${svH}"/>`;
const svOver={h:[45,42],s:[49,53],p:[70,64],a:[[48,68],[47,81]],b:[[51,68],[50,81]],l:[[64,90],[84,92]]};
const svKneel={h:[66,38],s:[64,51],p:[72,68],a:[[54,66],[44,83]],b:[[58,64],[48,82]],l:[[64,90],[86,92]]};
const SV_ART={
 phone:()=>svRings(80,46)+svPhone(63,17,svTxt(80,52,"112",13)),
 speaker:()=>svPhone(50,17,svTxt(67,52,"112",13))+[0,1,2].map(i=>`<path class="a-pulse" style="animation-delay:${i*.25}s" d="M${96+i*9} ${30-i*4}q${8+i*3} ${16+i*4} 0 ${32+i*8}" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join(""),
 pin:()=>svGround+`<path d="M30 80H130M50 66H120M70 52H110" stroke="var(--line)" stroke-width="2"/><g class="a-bounce"><path d="M80 70c-12-15-17-23-17-31a17 17 0 0 1 34 0c0 8-5 16-17 31z" fill="${svK}"/><circle cx="80" cy="39" r="6.5" fill="var(--card)"/></g>`,
 talk:()=>svGround+svFig(svStand(40),svH)+`<rect x="62" y="12" width="88" height="46" rx="12" fill="var(--card)" stroke="${svK}" stroke-width="3"/><path d="M70 58l-8 10 16-10" fill="${svK}"/>`+svTxt(70,29,"1 Where",10,svH,"start")+svTxt(70,41,"2 What",10,svH,"start")+svTxt(70,53,"3 How many",10,svH,"start"),
 run:()=>svGround+svFig({h:[56,26],s:[52,38],p:[46,60],a:[[60,46],[68,40]],b:[[44,48],[36,56]],l:[[56,74],[52,92]],m:[[38,74],[26,84]]},svH,"a-jog")+`<path class="a-pulse" d="M14 40H30M8 52H26M14 64H28" stroke="${svK}" stroke-width="3" stroke-linecap="round"/><rect x="104" y="48" width="38" height="40" rx="7" fill="#1e8e3e"/><path d="M123 56l-6 12h6l-3 12 9-15h-6l3-9z" fill="#fff"/>`,
 safe:()=>svGround+svFig(svStand(70),svH,"")+`<g class="a-pulse"><path d="M112 20l20 34h-40z" fill="#f2b632"/>`+svTxt(112,50,"!",18,"#3a2a00")+`</g><path d="M28 30q8-8 16 0M24 46q8-8 16 0" stroke="${svK}" stroke-width="3" fill="none" stroke-linecap="round" class="a-pulse"/>`,
 shake:()=>svGround+svFig(svLie(30),svP)+svFig(svKneel,svH,"a-wig")+svTxt(112,34,"Hello?",13)+svTxt(126,52,"!",18),
 tilt:()=>`<circle cx="70" cy="62" r="26" fill="${SV_SK}"/><path d="M60 56q4 3 8 0M76 56q4 3 8 0" stroke="${SV_O}" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="66" rx="3.4" ry="2.6" fill="${SV_SK2}" stroke="none"/><path d="M64 74q8 4 16 0" stroke="${SV_O}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M50 50q-6-14 10-22q14-6 26 6" fill="#7a4a2a" stroke="${SV_O}" stroke-width="2"/><path d="M44 66h-24" stroke="${SV_O}" stroke-width="19.2" stroke-linecap="round"/><path d="M44 66h-24" stroke="${SV_SK}" stroke-width="16" stroke-linecap="round"/>`+svLimb([[56,10],[64,34]],8,"#11706a")+svHand([65,37])+svLimb([[124,64],[96,76]],8,"#11706a")+svHand([93,77])+svArr("M42 30q-12 14 0 30","a-pulse")+`<path d="M38 60l5 3 2-6" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
 listen:()=>svGround+svFig(svLie(30),svP)+svFig({h:[38,70],s:[50,64],p:[64,72],a:[[44,78],[34,84]],b:[[52,78],[50,90]],l:[[58,92],[80,92]],m:[[62,92],[84,92]]},svH)+`<path class="a-pulse" d="M28 70q-6 -8 0 -16M22 74q-10 -12 0 -24" stroke="${svK}" stroke-width="3" fill="none" stroke-linecap="round"/>`+svClock(128,28,15)+svTxt(128,58,"10 s",11),
 compress:()=>svGround+svFig(svLie(30),svP)+svFig(svOver,svH,"a-push")+svTxt(128,30,"5–6 cm",12)+svArr("M120 40v20M114 54l6 7 6-7","a-pulse"),
 breaths:()=>svGround+svFig(svLie(30),svP)+svFig({h:[36,70],s:[48,62],p:[64,72],a:[[42,76],[30,82]],b:[[50,78],[40,88]],l:[[58,92],[80,92]],m:[[62,92],[84,92]]},svH)+[0,1].map(i=>`<circle class="a-puff" style="animation-delay:${i*.6}s" cx="30" cy="76" r="4" fill="${svK}"/>`).join("")+svTxt(124,30,"30 : 2",14),
 aed:()=>svGround+svFig(svLie(30),svP)+`<rect x="98" y="40" width="44" height="46" rx="8" fill="#1e8e3e"/><path class="a-blink" d="M121 48l-8 15h8l-4 15 12-19h-8l4-11z" fill="#fff"/><path d="M98 70q-20 6-46 14M98 76q-20 6-36 9" stroke="${svH}" stroke-width="2.5" fill="none"/><rect x="46" y="80" width="10" height="7" rx="2" fill="${svH}"/><rect x="58" y="82" width="10" height="7" rx="2" fill="${svH}"/>`,
 swap:()=>svGround+svFig(svStand(46),svH)+svFig(svStand(114),svK)+`<g class="a-spin" style="transform-origin:80px 46px">`+svArr("M70 34a14 14 0 0 1 22 0")+svArr("M90 58a14 14 0 0 1-22 0")+`</g>`+svTxt(80,90,"2 min",11),
 roll:()=>svGround+`<g class="a-roll" style="transform-origin:66px 88px">`+svFig({h:[34,82],s:[46,80],p:[72,80],a:[[54,70],[44,72]],b:[[52,90],[62,90]],l:[[84,72],[96,88]],m:[[86,88],[102,89]]},svP)+`</g>`+svArr("M92 34q22 0 22 24","a-pulse")+`<path d="M108 54l6 7 6-7" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
 side:()=>svGround+svFig({h:[34,82],s:[46,80],p:[72,80],a:[[54,70],[44,72]],b:[[52,90],[62,90]],l:[[84,72],[96,88]],m:[[86,88],[102,89]]},svP)+`<path class="a-puff" d="M24 86q-4 4-8 3" stroke="${svK}" stroke-width="3" fill="none" stroke-linecap="round"/>`+svTxt(120,40,"✓",22,"#1e8e3e"),
 cough:()=>svGround+svFig({...svStand(70),a:[[62,46],[63,30]]},svH)+`<g class="a-pulse"><path d="M52 24h-14M52 31h-18M52 38h-12" stroke="${svK}" stroke-width="3.5" stroke-linecap="round"/></g>`,
 backblow:()=>svGround+svFig({h:[46,44],s:[56,46],p:[74,60],a:[[52,60],[50,72]],l:[[73,76],[72,92]],m:[[77,76],[78,92]]},svP)+svFig({h:[112,24],s:[110,37],p:[110,61],a:[[102,46],[86,44]],b:[[96,50],[84,54]],l:[[107,76],[106,92]],m:[[113,76],[114,92]]},svH,"a-hit")+svTxt(82,30,"×5",14),
 thrust:()=>svGround+svFig(svStand(66),svP)+svFig({h:[86,22],s:[84,36],p:[84,61],a:[[72,46],[62,52]],b:[[76,52],[68,56]],l:[[81,76],[80,92]],m:[[87,76],[88,92]]},svH,"a-tug")+svArr("M36 62q8-2 14-10","a-pulse")+`<path d="M44 50l7 1-1 7" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+svTxt(130,30,"×5",14),
 press:()=>`<path d="M14 72H118" stroke="${SV_O}" stroke-width="25.2" stroke-linecap="round"/><path d="M14 72H118" stroke="${SV_SK}" stroke-width="22" stroke-linecap="round"/><circle cx="66" cy="72" r="5" fill="#c5221f"/><g class="a-press"><rect x="46" y="50" width="40" height="14" rx="3" fill="var(--card)" stroke="${svH}" stroke-width="2"/>`+svPl([[66,10],[66,48]],12,svH)+svPl([[54,38],[66,48],[78,38]],6,svH)+`</g>`+svTxt(132,34,"10 min",12),
 tourniquet:()=>`<path d="M14 66H140" stroke="${SV_O}" stroke-width="25.2" stroke-linecap="round"/><path d="M14 66H140" stroke="${SV_SK}" stroke-width="22" stroke-linecap="round"/><rect x="58" y="51" width="12" height="30" rx="3" fill="${svK}"/><circle cx="110" cy="66" r="5" fill="#c5221f"/>`+svTxt(64,40,"5–7 cm",11)+svClock(124,28,13),
 face:()=>`<circle cx="80" cy="50" r="34" fill="${SV_SK}"/><circle cx="68" cy="42" r="4" fill="${svH}"/><circle class="a-droopE" cx="92" cy="42" r="4" fill="${svH}"/><path d="M64 62Q72 66 80 64" stroke="${svH}" stroke-width="4" fill="none" stroke-linecap="round"/><path class="a-droop" style="transform-origin:80px 64px" d="M80 64Q88 62 96 62" stroke="${svH}" stroke-width="4" fill="none" stroke-linecap="round"/>`+svTxt(20,30,"F",22),
 arms:()=>svGround+svFig({...svStand(80),a:[[66,34],[54,30]]},svH)+`<g class="a-drift" style="transform-origin:80px 37px">`+svPl([[80,37],[94,34],[106,30]],6.5,svH)+`</g>`+svTxt(20,30,"A",22),
 speech:()=>`<circle cx="50" cy="56" r="22" fill="${SV_SK}"/><path d="M30 50q-2-20 20-21q22 1 20 21q-6-10-20-11q-14 1-20 11z" fill="#7a4a2a" stroke="${SV_O}" stroke-width="2"/><ellipse cx="43" cy="55" rx="2" ry="2.8" fill="${SV_O}" stroke="none"/><ellipse cx="57" cy="55" rx="2" ry="2.8" fill="${SV_O}" stroke="none"/><path class="a-wob" d="M42 67q4-3 8 0t8 0" stroke="${SV_O}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M78 20h64a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-50l-12 10v-10a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" fill="var(--card)" stroke="${svK}" stroke-width="3"/><path class="a-wob" d="M86 41q6-8 12 0t12 0t12 0t12 0" stroke="${svH}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`+svTxt(20,30,"S",22),
 clock:()=>svClock(80,50,32)+svTxt(130,30,"T",22),
 sit:()=>svGround+`<rect x="22" y="20" width="10" height="73" rx="3" fill="var(--line)"/>`+svFig({h:[46,40],s:[42,52],p:[48,76],a:[[54,66],[66,74]],l:[[72,70],[90,92]],m:[[70,74],[86,90]]},svH)+`<path class="a-beat" style="transform-origin:120px 40px" d="M120 54c-16-10-22-16-22-24a9 9 0 0 1 22-4 9 9 0 0 1 22 4c0 8-6 14-22 24z" fill="${svK}"/>`,
 pill:()=>`<rect x="40" y="40" width="40" height="18" rx="9" fill="var(--card)" stroke="${svH}" stroke-width="3"/><path d="M60 40v18" stroke="${svH}" stroke-width="3"/><path d="M98 30h28l-4 52h-20z" fill="#3b8fd0" opacity=".35" stroke="${svH}" stroke-width="3"/>`+svTxt(60,80,"chew",12),
 inject:()=>`<path d="M10 70H120q16 0 16-14" stroke="${SV_O}" stroke-width="29.2" stroke-linecap="round" fill="none"/><path d="M10 70H120q16 0 16-14" stroke="${SV_SK}" stroke-width="26" stroke-linecap="round" fill="none"/><g class="a-press" style="--d:6px"><rect x="64" y="10" width="14" height="44" rx="6" fill="#f2b632"/><rect x="66" y="52" width="10" height="6" rx="2" fill="${svH}"/></g>`+svTxt(110,22,"click",12)+svClock(28,26,12),
 tap:()=>`<path d="M30 20h40v10H48v8" stroke="${svH}" stroke-width="8" fill="none" stroke-linecap="round"/><path class="a-flow" d="M48 44V76" stroke="#3b8fd0" stroke-width="7" stroke-dasharray="6 6" stroke-linecap="round"/><path d="M10 82H110" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round"/><path d="M10 82H110" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round"/>`+svTxt(134,40,"20",20)+svTxt(134,56,"min",11),
 ringoff:()=>`<path d="M20 60H90" stroke="${SV_O}" stroke-width="23.2" stroke-linecap="round"/><path d="M20 60H90" stroke="${SV_SK}" stroke-width="20" stroke-linecap="round"/><path d="M90 60h40" stroke="${SV_O}" stroke-width="15.2" stroke-linecap="round"/><path d="M90 60h40" stroke="${SV_SK}" stroke-width="12" stroke-linecap="round"/><rect class="a-slide" x="100" y="51" width="8" height="18" rx="3" fill="#f2b632"/>`,
 wrap:()=>`<path d="M10 60H140" stroke="${SV_O}" stroke-width="25.2" stroke-linecap="round"/><path d="M10 60H140" stroke="${SV_SK}" stroke-width="22" stroke-linecap="round"/>`+[0,1,2,3].map(i=>`<path d="M${46+i*14} 44l10 32" stroke="#9fd3f0" stroke-width="5" opacity=".8"/>`).join("")+`<rect x="40" y="46" width="64" height="28" rx="6" fill="#bfe3f7" opacity=".45"/>`,
 cool:()=>svGround+`<path d="M18 30q32-24 64 0z" fill="${svK}" opacity=".85"/><path d="M50 26V92" stroke="${svH}" stroke-width="3"/>`+svFig(svLie(60),svP)+[0,1,2,3].map(i=>`<circle class="a-drop" style="animation-delay:${i*.3}s" cx="${74+i*14}" cy="52" r="3" fill="#3b8fd0"/>`).join("")+`<path class="a-fan" style="transform-origin:140px 70px" d="M140 70l-14-26q14-4 22 4z" fill="${svH}"/>`,
 drink:()=>`<path d="M60 22h40l-6 62H66z" fill="#3b8fd0" opacity=".35" stroke="${svH}" stroke-width="3" stroke-linejoin="round"/><path class="a-pulse" d="M66 44h28" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
 dropcover:()=>`<g class="a-quake">`+svGround+`<rect x="34" y="44" width="94" height="8" rx="3" fill="${svH}"/><path d="M42 52V92M120 52V92" stroke="${svH}" stroke-width="6"/>`+svFig({h:[70,64],s:[78,70],p:[96,80],a:[[74,58],[66,58]],l:[[88,92],[104,92]]},svK)+`</g>`+[0,1].map(i=>`<rect class="a-fall" style="animation-delay:${i*.7}s" x="${60+i*30}" y="8" width="8" height="8" rx="2" fill="var(--muted)"/>`).join(""),
 window:()=>`<rect x="46" y="14" width="68" height="70" rx="4" fill="#bfe3f7" opacity=".6" stroke="${svH}" stroke-width="4"/><path d="M80 14v70M46 49h68" stroke="${svH}" stroke-width="3"/><path d="M58 24l10 14-6 6 10 12" stroke="${svH}" stroke-width="2" fill="none"/>`+svX(128,22),
 lift:()=>`<rect x="30" y="14" width="50" height="74" rx="3" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><path d="M55 14v74" stroke="${svH}" stroke-width="3"/>`+svX(55,50)+`<path d="M96 88h14v-14h14v-14h14v-14h14" stroke="#1e8e3e" stroke-width="5" fill="none" stroke-linejoin="round"/>`+svTxt(126,30,"✓",20,"#1e8e3e"),
 away:()=>svGround+`<rect x="10" y="22" width="40" height="71" fill="var(--line)"/><path d="M18 32h8M34 32h8M18 48h8M34 48h8M18 64h8M34 64h8" stroke="var(--card)" stroke-width="6"/>`+svFig({h:[100,26],s:[96,38],p:[92,60],a:[[102,46],[110,40]],b:[[90,48],[82,56]],l:[[100,74],[96,92]],m:[[86,74],[76,84]]},svH,"a-jog")+svArr("M58 52h20M72 46l6 6-6 6","a-pulse"),
 car:()=>svGround+`<g class="a-quake"><path d="M30 80V64l14-16h52l18 16h12v16z" fill="${svH}"/><circle cx="52" cy="82" r="9" fill="${svK}"/><circle cx="108" cy="82" r="9" fill="${svK}"/><path d="M50 52h20v12H40z M76 52h18l12 12H76z" fill="#bfe3f7"/></g>`,
 gas:()=>`<path d="M20 60H140" stroke="${svH}" stroke-width="12" stroke-linecap="round"/><rect x="70" y="48" width="20" height="24" rx="4" fill="${svH}"/><g class="a-turn" style="transform-origin:80px 46px"><rect x="62" y="40" width="36" height="10" rx="5" fill="#f2b632"/></g>`+svTxt(80,92,"OFF",12),
 sms:()=>svPhone(30,17)+`<g class="a-send"><rect x="70" y="30" width="52" height="24" rx="10" fill="${svK}"/><path d="M80 42h32" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
 exit:()=>svGround+`<rect x="98" y="20" width="44" height="73" fill="#1e8e3e"/><path d="M98 20l18 8v60l-18 5z" fill="#13652b"/>`+svFig({h:[64,26],s:[60,38],p:[56,60],a:[[66,46],[74,40]],b:[[54,48],[46,56]],l:[[64,74],[62,92]],m:[[48,74],[38,84]]},svH,"a-jog")+svArr("M78 70h14M86 64l6 6-6 6","a-pulse"),
 doorclose:()=>`<rect x="50" y="12" width="60" height="80" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><path class="a-door" style="transform-origin:52px 50px" d="M52 14h56v76H52z" fill="${svH}"/><circle cx="100" cy="54" r="3" fill="#f2b632"/>`+[0,1].map(i=>`<path class="a-smoke" style="animation-delay:${i}s" d="M${20+i*8} 80q-8-10 0-20t0-20" stroke="var(--muted)" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>`).join(""),
 crawl:()=>svGround+`<path class="a-smoke2" d="M-10 10h180v26q-20 8-40 0t-40 0t-40 0t-40 0t-20 0z" fill="var(--muted)" opacity=".45"/>`+svFig({h:[42,68],s:[52,72],p:[82,72],a:[[50,82],[46,92]],b:[[56,82],[54,92]],l:[[86,92],[108,92]],m:[[90,92],[112,92]]},svH,"a-jog")+svArr("M24 82h-12M18 76l-6 6 6 6","a-pulse"),
 hotdoor:()=>`<rect x="70" y="10" width="64" height="84" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><circle cx="122" cy="54" r="3" fill="#f2b632"/><path d="M30 60h28" stroke="${SV_O}" stroke-width="17.2" stroke-linecap="round"/><path d="M30 60h28" stroke="${SV_SK}" stroke-width="14" stroke-linecap="round"/>`+[0,1,2].map(i=>`<path class="a-pulse" style="animation-delay:${i*.2}s" d="M${86+i*14} 40q-6-6 0-12t0-12" stroke="#c5221f" stroke-width="3" fill="none" stroke-linecap="round"/>`).join(""),
 buddy:()=>svGround+`<g class="a-bob" transform="translate(44 -2) scale(.6)">`+svMascot("thumb")+`</g>`+`<g class="a-pulse"><path d="M124 22l5-6M127 32l8-1M123 42l6 5" stroke="#f2b632" stroke-width="3" stroke-linecap="round"/></g>`,
 wave:()=>`<rect x="20" y="16" width="80" height="76" fill="var(--line)"/><rect x="40" y="30" width="40" height="34" fill="#bfe3f7"/>`+svFig({h:[60,44],s:[60,56],p:[60,80],a:[[70,46],[78,30]]},svH)+`<path class="a-flag" style="transform-origin:78px 30px" d="M78 30l26-6-4 12z" fill="${svK}"/>`,
 alert:()=>`<g class="a-buzz">`+svPhone(63,17,`<path d="M80 30l14 24H66z" fill="#c5221f"/>`+svTxt(80,51,"!",14,"#fff"))+`</g><path class="a-pulse" d="M52 30v28M108 30v28" stroke="${svK}" stroke-width="3" stroke-linecap="round"/>`,
 up:()=>`<rect x="40" y="10" width="80" height="84" fill="var(--line)"/><path d="M40 52h80" stroke="var(--card)" stroke-width="3"/>`+svFig({h:[80,20],s:[80,30],p:[80,46],a:[[86,24],[92,14]],b:[[74,38],[72,46]],l:[[78,50],[78,52]]},svH)+svWater(78,"a-rise")+svArr("M134 70V30M128 36l6-6 6 6","a-pulse"),
 power:()=>`<rect x="58" y="16" width="44" height="70" rx="8" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><rect class="a-switch" x="70" y="26" width="20" height="24" rx="4" fill="${svK}"/>`+svTxt(80,80,"OFF",12,svH),
 bag:()=>`<rect x="48" y="30" width="64" height="60" rx="14" fill="${svK}"/><path d="M64 30v-6a16 16 0 0 1 32 0v6" stroke="${svK}" stroke-width="6" fill="none"/><rect x="60" y="54" width="40" height="22" rx="5" fill="rgba(255,255,255,.25)"/><g class="a-pop"><rect x="18" y="20" width="18" height="30" rx="3" fill="#3b8fd0" opacity=".7"/><rect x="124" y="34" width="22" height="14" rx="3" fill="#1e8e3e"/></g>`,
 battery:()=>`<rect x="40" y="34" width="72" height="34" rx="6" fill="none" stroke="${svH}" stroke-width="5"/><rect x="113" y="44" width="7" height="14" rx="2" fill="${svH}"/><rect class="a-blink" x="47" y="41" width="14" height="20" rx="2" fill="#c5221f"/>`,
 meet:()=>svGround+svFig(svStand(36),svH)+svFig(svStand(124),svK)+`<path d="M80 92V30" stroke="${svH}" stroke-width="3"/><path class="a-flag" style="transform-origin:80px 30px" d="M80 30h24l-6 8 6 8H80z" fill="#f2b632"/>`,
 cash:()=>`<rect x="34" y="30" width="92" height="44" rx="6" fill="#7cc48a" stroke="#2e7d4f" stroke-width="3"/><circle cx="80" cy="52" r="12" fill="none" stroke="#2e7d4f" stroke-width="3"/>`+svTxt(80,57,"€",13,"#2e7d4f"),
 radio:()=>`<rect x="34" y="40" width="80" height="46" rx="8" fill="${svH}"/><circle cx="60" cy="63" r="13" fill="var(--card2)"/><rect x="82" y="54" width="22" height="6" rx="3" fill="var(--card2)"/><path d="M100 40l14-26" stroke="${svH}" stroke-width="3"/>`+[0,1].map(i=>`<path class="a-pulse" style="animation-delay:${i*.3}s" d="M${120+i*8} ${16-i*2}q${6+i*3} 8 0 ${16+i*4}" stroke="${svK}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join(""),
 nowade:()=>svWater(62)+svFig(svStand(70),svH)+svArr("M20 76h30M44 70l6 6-6 6","a-flowx")+svX(122,24),

 shadow:()=>svGround+`<path d="M60 92V40" stroke="${svH}" stroke-width="5" stroke-linecap="round"/><g class="a-shadow" style="transform-origin:60px 92px"><path d="M60 92L120 92" stroke="var(--muted)" stroke-width="5" opacity=".5" stroke-linecap="round"/></g><circle cx="120" cy="92" r="4" fill="${svK}"/><circle class="a-pulse" cx="104" cy="98" r="4" fill="${svK}"/>`+svTxt(132,84,"W",11,svH)+svTxt(110,84,"E",11,svH)+`<circle cx="22" cy="24" r="10" fill="#f2b632"/>`,
 stars:()=>`<rect width="160" height="104" rx="10" fill="#14243a"/>`+[[30,70],[46,66],[58,72],[70,68],[72,52],[92,50],[90,66]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("")+`<path class="a-draw" d="M91 58L96 18" stroke="#f2d24a" stroke-width="2" stroke-dasharray="3 4"/><circle class="a-pulse" cx="97" cy="12" r="5" fill="#f2d24a"/>`+svTxt(114,16,"N",12,"#f2d24a"),
 watch:()=>`<circle cx="66" cy="54" r="34" fill="var(--card)" stroke="${svH}" stroke-width="5"/><path d="M66 54L92 40" stroke="${svH}" stroke-width="5" stroke-linecap="round"/><path class="a-pulse" d="M66 54L80 22" stroke="${svK}" stroke-width="3" stroke-dasharray="4 3"/><circle cx="66" cy="54" r="3" fill="${svH}"/>`+svTxt(66,30,"12",9,svH)+`<circle cx="130" cy="26" r="11" fill="#f2b632"/>`+svTxt(82,16,"S",13),
 hand:()=>`<rect width="160" height="70" fill="#f6c58a" opacity=".45"/><path d="M0 74H160" stroke="${svH}" stroke-width="3"/><circle class="a-sink" cx="120" cy="22" r="11" fill="#f2b632"/>`+[0,1,2,3].map(i=>`<rect x="40" y="${58-i*12}" width="56" height="11" rx="5.5" fill="${SV_SK}" stroke="${svH}" stroke-width="1.5"/>`).join("")+`<path d="M96 22v48" stroke="${svK}" stroke-width="2" stroke-dasharray="3 3"/>`+svTxt(130,64,"15 min",11)+svTxt(130,78,"/ finger",10),
 count:()=>`<path d="M30 24a16 12 0 0 1 30-8 14 12 0 0 1 28 4 12 10 0 0 1-2 20H32a10 9 0 0 1-2-16z" fill="var(--muted)" opacity=".6"/><path class="a-blink" d="M54 40l-10 18h10l-6 18 18-24H56l6-12z" fill="#f2b632"/>`+svTxt(118,46,"3 s",20)+svTxt(118,66,"= 1 km",12,svH),
 rope:()=>`<path class="a-tie" d="M14 70H60c20 0 26-36 6-38s-22 30 0 34 40 4 40-14-24-16-26 0 10 18 52 18" stroke="#c08a45" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="300" />`,
 pole:()=>`<rect x="72" y="8" width="16" height="88" rx="4" fill="${svH}"/><path class="a-tie" d="M10 50H70a9 9 0 0 1 0 14H96M70 66a9 9 0 0 0 0 14l26-14H150" stroke="#c08a45" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="300"/>`,
 sunscreen:()=>`<rect x="52" y="30" width="34" height="58" rx="8" fill="${svK}"/><rect x="60" y="20" width="18" height="12" rx="3" fill="${svH}"/>`+svTxt(69,64,"30",13,"#fff")+`<g class="a-spin" style="transform-origin:122px 36px">`+[0,60,120,180,240,300].map(a=>`<path d="M122 16v-6" stroke="#f2b632" stroke-width="3.5" stroke-linecap="round" transform="rotate(${a} 122 36)"/>`).join("")+`</g><circle cx="122" cy="36" r="12" fill="#f2b632"/>`+svClock(122,78,13),
 fire:()=>[0,1,2].map(i=>`<path class="a-flick" style="animation-delay:${i*.15}s" d="M${70+i*10} 80c-10-10-6-24 5-36 0 10 9 14 9 24s-6 13-14 12z" fill="${i===1?"#f2b632":"#e8542e"}"/>`).join(""),
 firering:()=>svGround+SV_ART.fire()+[44,58,74,90,106,120].map((x,i)=>`<ellipse cx="${x}" cy="${88+(i%2)*2}" rx="9" ry="6" fill="var(--muted)"/>`).join("")+`<path d="M132 56h20l-3 34h-14z" fill="#3b8fd0" opacity=".6" stroke="${svH}" stroke-width="2.5"/>`+svTxt(26,30,"3 m",12),
 douse:()=>svGround+`<g class="a-tilt" style="transform-origin:110px 40px"><path d="M96 24h28l-3 30h-22z" fill="#3b8fd0" opacity=".7" stroke="${svH}" stroke-width="2.5"/></g>`+[0,1,2].map(i=>`<circle class="a-drop" style="animation-delay:${i*.3}s" cx="${90-i*6}" cy="62" r="3" fill="#3b8fd0"/>`).join("")+`<path d="M50 88h56" stroke="var(--muted)" stroke-width="8" stroke-linecap="round"/><path class="a-smoke" d="M70 80q-6-8 0-16t0-16" stroke="var(--muted)" stroke-width="4" fill="none" opacity=".5"/>`,
 piles:()=>svGround+`<path d="M18 92q14-22 28 0z" fill="#d9c27a"/><path d="M62 92l10-20M70 92l4-22M78 92l-4-22M86 92l-10-20" stroke="#a0763f" stroke-width="2.5" stroke-linecap="round"/><path d="M104 88h44M106 80h40M110 72h32" stroke="#7a5228" stroke-width="7" stroke-linecap="round"/>`+svTxt(32,62,"tinder",10,svH)+svTxt(74,62,"kindling",10,svH)+svTxt(126,62,"fuel",10,svH),
 teepee:()=>svGround+`<path d="M56 92L80 30L104 92M64 92L80 30L96 92M72 92L80 30L88 92" stroke="#a0763f" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="80" cy="88" rx="10" ry="5" fill="#d9c27a"/><g class="a-grow" style="transform-origin:80px 92px"><path d="M80 90c-8-6-5-16 1-24 0 7 7 10 7 16s-4 9-8 8z" fill="#e8542e"/></g>`,
 blow:()=>svGround+SV_ART.teepee()+svFig({h:[56,66],s:[48,64],p:[34,74],a:[[52,78],[58,92]],b:[[48,78],[52,92]],l:[[40,92],[20,92]],m:[[36,92],[16,92]]},svH)+[0,1].map(i=>`<circle class="a-puff2" style="animation-delay:${i*.5}s" cx="66" cy="76" r="3" fill="${svK}"/>`).join(""),
 ferro:()=>`<ellipse cx="96" cy="86" rx="22" ry="8" fill="#d9c27a"/><path d="M40 20L90 70" stroke="${svH}" stroke-width="7" stroke-linecap="round"/><g class="a-strike"><rect x="44" y="34" width="22" height="8" rx="2" fill="#9aa6b1" transform="rotate(45 55 38)"/></g>`+[0,1,2,3].map(i=>`<circle class="a-spark" style="animation-delay:${i*.12}s" cx="90" cy="72" r="2.5" fill="#f2b632"/>`).join(""),
 battery9:()=>`<rect x="40" y="20" width="36" height="52" rx="4" fill="${svH}"/><rect x="46" y="12" width="8" height="8" fill="#9aa6b1"/><rect x="62" y="12" width="8" height="8" fill="#9aa6b1"/>`+svTxt(58,52,"9V",13,"#fff")+`<path d="M44 0q14 14 30 0" stroke="#9aa6b1" stroke-width="5" fill="none" class="a-press" style="--d:8px"/><circle class="a-blink" cx="60" cy="6" r="6" fill="#f2b632" opacity=".8"/><ellipse cx="116" cy="84" rx="26" ry="9" fill="#d9c27a"/>`+svArr("M84 46h18M96 40l6 6-6 6","a-pulse"),
 lens:()=>`<circle cx="30" cy="20" r="12" fill="#f2b632"/><path d="M40 28L84 62M36 34L84 62" stroke="#f2b632" stroke-width="2" opacity=".6"/><ellipse cx="72" cy="50" rx="6" ry="18" fill="#bfe3f7" stroke="${svH}" stroke-width="3" transform="rotate(-40 72 50)"/><ellipse cx="96" cy="84" rx="26" ry="8" fill="#6b4f2a"/><circle class="a-blink" cx="90" cy="80" r="3" fill="#fff"/><path class="a-smoke" d="M92 74q-6-8 0-16" stroke="var(--muted)" stroke-width="3" fill="none"/>`,
 embers:()=>svGround+[40,56,72,88,104,120].map((x,i)=>`<ellipse class="a-glow" style="animation-delay:${i*.2}s" cx="${x}" cy="88" rx="9" ry="5" fill="${i%2?"#e8542e":"#f2913d"}"/>`).join("")+`<rect x="34" y="70" width="12" height="16" rx="3" fill="var(--muted)"/><rect x="114" y="70" width="12" height="16" rx="3" fill="var(--muted)"/><path d="M40 70h80" stroke="${svH}" stroke-width="5"/><path d="M50 50h60l-6 20H56z" fill="${svH}"/><path class="a-smoke" d="M70 44q-6-8 0-16M90 44q-6-8 0-16" stroke="var(--muted)" stroke-width="3" fill="none"/>`,
 foil:()=>svGround+[40,60,80,100,120].map((x,i)=>`<ellipse class="a-glow" style="animation-delay:${i*.2}s" cx="${x}" cy="88" rx="10" ry="5" fill="#e8542e"/>`).join("")+`<path d="M52 82q28-22 56 0z" fill="#c9d1d8" stroke="#8a96a0" stroke-width="2"/><path d="M60 72l40 2" stroke="#8a96a0" stroke-width="1.5"/>`,
 stoveout:()=>`<path d="M14 92V46l30-24 30 24v46z" fill="var(--line)"/>`+svX(44,64)+svGround+`<rect x="104" y="76" width="40" height="16" rx="3" fill="${svH}"/><rect x="110" y="62" width="28" height="12" rx="3" fill="#8a96a0"/>`+[0,1,2].map(i=>`<path class="a-flick" style="animation-delay:${i*.15}s" d="M${114+i*9} 76c-3-3-2-7 1-10 1 3 3 5 2 8z" fill="#3b8fd0"/>`).join("")+svTxt(124,40,"outside ✓",11,"#1e8e3e"),
 tins:()=>`<rect x="26" y="40" width="30" height="44" rx="4" fill="${svK}"/><rect x="62" y="48" width="30" height="36" rx="4" fill="#3b8fd0"/><path d="M98 84c0-24 10-40 24-40s24 16 24 40z" fill="#d9a35b"/><path d="M26 50h30M62 58h30" stroke="rgba(255,255,255,.5)" stroke-width="3"/>`,
 haybox:()=>`<rect x="30" y="34" width="100" height="56" rx="10" fill="#c45a10" opacity=".85"/><path class="a-pulse" d="M50 34q30-16 60 0" stroke="#c45a10" stroke-width="10" fill="none" opacity=".85"/><rect x="58" y="50" width="44" height="30" rx="5" fill="${svH}"/>`+svClock(140,22,12),
 fridge:()=>`<rect x="46" y="10" width="56" height="86" rx="6" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><path d="M46 40h56" stroke="${svH}" stroke-width="3"/><path d="M92 20v12M92 50v16" stroke="${svH}" stroke-width="4" stroke-linecap="round"/>`+svTxt(130,44,"4 h",14)+svTxt(130,26,"❄",14,"#3b8fd0")+`<path class="a-pulse" d="M28 30v40" stroke="#c5221f" stroke-width="3" stroke-dasharray="4 4"/>`,
 freezer:()=>`<rect x="40" y="30" width="80" height="60" rx="6" fill="var(--card2)" stroke="${svH}" stroke-width="4"/>`+[0,1,2].map(i=>`<rect x="${50+i*22}" y="44" width="18" height="36" rx="3" fill="#9fd3f0"/>`).join("")+svTxt(140,20,"48 h",13),
 trash:()=>`<path d="M54 36h52l-6 56H60z" fill="var(--muted)"/><rect x="48" y="28" width="64" height="8" rx="3" fill="${svH}"/><g class="a-bounce"><rect x="70" y="4" width="20" height="14" rx="3" fill="#e8a19b"/></g>`+svClock(132,30,12),
 leanto:()=>svGround+`<path d="M24 92V20M136 92V20" stroke="#6b4f2a" stroke-width="8" stroke-linecap="round"/><path d="M20 44H140" stroke="#a0763f" stroke-width="6" stroke-linecap="round"/>`+[0,1,2,3,4,5,6].map(i=>`<path d="M${34+i*16} 44L${46+i*16} 92" stroke="#a0763f" stroke-width="4" stroke-linecap="round"/>`).join("")+`<path class="a-grow2" d="M30 44h104l12 48H42z" fill="#5a8a3a" opacity=".55"/>`,
 tarp:()=>svGround+`<path d="M18 92V28M142 92V28" stroke="#6b4f2a" stroke-width="7" stroke-linecap="round"/><path d="M18 36H142" stroke="${svH}" stroke-width="2"/><path class="a-flag" style="transform-origin:80px 36px" d="M80 36L40 92H120z" fill="${svK}" opacity=".9"/><path d="M40 92l-8 2M120 92l8 2" stroke="${svH}" stroke-width="3"/>`,
 bed:()=>svGround+`<path d="M24 92q56-26 112 0z" fill="#5a8a3a" opacity=".7"/><path d="M30 86q50-16 100 0" stroke="#a0763f" stroke-width="3" fill="none"/>`+svFig({h:[40,70],s:[52,74],p:[78,76],a:[[64,80],[76,80]],l:[[96,78],[114,80]]},svH)+svArr("M140 40v-20M134 26l6-6 6 6","a-pulse")+svTxt(118,30,"warm",10),
 bottlefilter:()=>`<path d="M60 10h40v70l-12 10h-16L60 80z" fill="var(--card)" stroke="${svH}" stroke-width="3"/><rect x="62" y="14" width="36" height="14" fill="#9aa6b1"/><rect x="62" y="28" width="36" height="14" fill="#d9c27a"/><rect x="62" y="42" width="36" height="14" fill="#e8d3a2"/><rect x="62" y="56" width="36" height="12" fill="#333"/><rect x="62" y="68" width="36" height="8" fill="#fff"/>`+[0,1].map(i=>`<circle class="a-drop" style="animation-delay:${i*.5}s" cx="80" cy="94" r="3" fill="#3b8fd0"/>`).join("")+svTxt(130,30,"stones",9,svH)+svTxt(130,48,"sand",9,svH)+svTxt(130,64,"charcoal",9,svH),
 tub:()=>`<path d="M20 50h120v20a20 20 0 0 1-20 20H40a20 20 0 0 1-20-20z" fill="var(--card2)" stroke="${svH}" stroke-width="4"/><path class="a-rise2" d="M24 72h112v4a14 14 0 0 1-14 12H38a14 14 0 0 1-14-12z" fill="#3b8fd0" opacity=".5"/><path d="M110 50V20h-20" stroke="${svH}" stroke-width="6" fill="none" stroke-linecap="round"/><path class="a-flow" d="M90 26v40" stroke="#3b8fd0" stroke-width="5" stroke-dasharray="6 6"/>`,
 rain:()=>`<path d="M40 30a18 14 0 0 1 32-10 16 14 0 0 1 32 4 14 12 0 0 1-2 22H44a12 10 0 0 1-4-16z" fill="var(--muted)" opacity=".6"/>`+[0,1,2,3].map(i=>`<path class="a-drop" style="animation-delay:${i*.25}s" d="M${56+i*14} 54v6" stroke="#3b8fd0" stroke-width="3" stroke-linecap="round"/>`).join("")+`<path d="M58 70h44l-4 24H62z" fill="${svH}"/>`,
 warmroom:()=>`<rect x="10" y="10" width="140" height="84" rx="4" fill="var(--card2)" stroke="${svH}" stroke-width="3"/><rect x="22" y="22" width="34" height="40" fill="#14243a"/><path d="M22 22h8v40h-8zM48 22h8v40h-8z" fill="${svK}"/>`+svFig({h:[96,48],s:[96,58],p:[100,80],a:[[104,66],[110,70]],l:[[112,84],[118,92]]},svH)+`<path d="M82 56q18-8 34 2l4 34H80z" fill="#c45a10" opacity=".85"/><rect x="132" y="74" width="6" height="14" fill="#f6f1e7"/><path class="a-flick" d="M135 74c-3-3-2-8 0-10 2 3 3 6 0 10z" fill="#f2b632"/>`,
 co:()=>`<path d="M20 92V44l40-30 40 30v48z" fill="var(--line)"/><rect x="44" y="70" width="32" height="20" rx="3" fill="${svH}"/><path class="a-smoke" d="M54 64q-8-10 0-20t0-20M68 64q-8-10 0-20" stroke="var(--muted)" stroke-width="5" fill="none" opacity=".6"/>`+svX(60,58)+svTxt(126,46,"CO",20,"#c5221f")+svTxt(126,64,"invisible",9,svH),

 nose:()=>svGround+`<rect x="84" y="64" width="40" height="8" rx="2" fill="#a0763f"/><path d="M90 72v20M118 72v20" stroke="#a0763f" stroke-width="4"/>`+svFig({h:[76,38],s:[86,48],p:[102,62],a:[[78,60],[70,42]],b:[[90,62],[84,70]],l:[[80,68],[78,92]],m:[[84,70],[86,92]]},svH)+svArr("M56 28q-8 10 2 20","a-pulse")+`<path d="M52 44l6 5 2-7" stroke="${svK}" stroke-width="3" fill="none" stroke-linecap="round"/>`+svClock(136,24,12)+svTxt(136,50,"10 min",10),
 legsup:()=>svGround+svFig({h:[24,84],s:[36,86],p:[62,86],a:[[48,89],[60,89]],l:[[84,70],[104,60]],m:[[84,68],[104,58]]},svP)+`<rect x="96" y="62" width="34" height="8" rx="3" fill="#a0763f"/><path d="M100 70v22M126 70v22" stroke="#a0763f" stroke-width="4"/>`+svArr("M120 40v-14M114 32l6-6 6 6","a-pulse"),
 legx:()=>svGround+svFig({h:[80,24],s:[80,37],p:[80,61],a:[[74,50],[72,60]],b:[[86,50],[88,60]],l:[[86,76],[74,92]],m:[[74,76],[86,92]]},svH)+[0,1].map(i=>`<path class="a-pulse" style="animation-delay:${i*.3}s" d="M${62+i*36} 74l-6 -4M${62+i*36} 80l-7 0" stroke="${svK}" stroke-width="3" stroke-linecap="round"/>`).join(""),
 cubes:()=>`<rect x="34" y="50" width="22" height="22" rx="3" fill="#fff" stroke="${svH}" stroke-width="2.5"/><rect x="50" y="36" width="22" height="22" rx="3" fill="#fff" stroke="${svH}" stroke-width="2.5"/><rect x="64" y="52" width="22" height="22" rx="3" fill="#fff" stroke="${svH}" stroke-width="2.5"/><path d="M100 26h30l-4 60h-22z" fill="#e8542e" opacity=".75" stroke="${svH}" stroke-width="3"/>`+svTxt(116,60,"20 g",11,"#fff"),
 seiz:()=>svGround+`<g class="a-wig">`+svFig(svLie(30),svP)+`</g><rect x="20" y="84" width="20" height="8" rx="4" fill="#9fd3f0"/>`+svClock(130,26,13)+svTxt(130,54,"5 min?",10)+`<path d="M100 60l10-10M110 60l-10-10" stroke="var(--muted)" stroke-width="3" opacity=".6"/>`,
 ankle:()=>`<rect x="20" y="70" width="60" height="16" rx="6" fill="#a3b1bb" opacity=".6"/><path d="M60 30V64q0 10 10 12h38q8 0 8-8" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round" fill="none"/><path d="M60 30V64q0 10 10 12h38q8 0 8-8" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round" fill="none"/><rect class="a-press" x="56" y="40" width="26" height="18" rx="5" fill="#9fd3f0"/>`+svTxt(132,30,"20 min",11)+svArr("M140 76v-22M134 60l6-6 6 6","a-pulse"),
 tickpull:()=>`<path d="M10 78H150" stroke="${SV_O}" stroke-width="23.2" stroke-linecap="round"/><path d="M10 78H150" stroke="${SV_SK}" stroke-width="20" stroke-linecap="round"/><g class="a-lift2"><ellipse cx="80" cy="64" rx="6" ry="5" fill="#3b2a1e"/><path d="M75 62l-5-4M75 66l-6 0M85 62l5-4M85 66l6 0" stroke="#3b2a1e" stroke-width="1.5"/><path d="M76 58L70 14M84 58L90 14" stroke="${svH}" stroke-width="3.5" stroke-linecap="round"/></g>`+svArr("M110 50V26M104 32l6-6 6 6","a-pulse"),
 rinseeye:()=>`<circle cx="60" cy="56" r="30" fill="${SV_SK}"/><ellipse cx="70" cy="52" rx="9" ry="6" fill="#fff"/><circle cx="72" cy="52" r="3.5" fill="${svH}"/><path d="M118 14l-20 20" stroke="${svH}" stroke-width="10" stroke-linecap="round"/><path class="a-flow" d="M96 36q-10 8-20 14" stroke="#3b8fd0" stroke-width="4" stroke-dasharray="5 5" fill="none" stroke-linecap="round"/>`+svTxt(130,72,"10–15",12)+svTxt(130,86,"min",10),
 slingarm:()=>svGround+svFig({h:[80,24],s:[80,37],p:[80,61],a:[[90,54],[72,50]],b:[[70,50],[66,62]],l:[[76,77],[74,92]],m:[[84,77],[86,92]]},svH)+`<path d="M70 36L96 60H66z" fill="${svK}" opacity=".85"/><path d="M70 36q8-8 16 0" stroke="${svK}" stroke-width="3" fill="none"/>`,
 // outdoors & disasters & travel packs
 rip:()=>`<rect x="0" y="0" width="160" height="70" fill="#3b8fd0" opacity=".28"/><rect x="0" y="70" width="160" height="34" fill="#e8d3a2"/>`+svArr("M80 66V20M74 26l6-6 6 6","a-pulse")+`<g class="a-swim"><g transform="translate(14 8) scale(.55)">`+svFig({h:[40,40],s:[52,44],p:[78,48],a:[[62,34],[70,26]],b:[[46,54],[38,60]],l:[[92,44],[104,50]],m:[[92,52],[104,48]]},svH)+`</g></g>`+svArr("M44 52h70M108 46l6 6-6 6"),
 float:()=>svWater(56)+`<g class="a-bob">`+svFig({h:[40,50],s:[52,52],p:[80,52],a:[[44,40],[36,32]],b:[[64,42],[70,34]],l:[[96,50],[112,52]]},svH)+`</g>`,
 handup:()=>svWater(60)+`<g class="a-bob">`+svFig({h:[80,46],s:[80,58],p:[80,80],a:[[88,40],[94,22]]},svH)+`</g>`+svTxt(120,30,"Help!",13),
 throwring:()=>svWater(60)+svFig(svStand(20),svH)+`<circle class="a-arc" cx="40" cy="30" r="9" fill="none" stroke="#e8542e" stroke-width="6"/>`,
 jelly:()=>svWater(70)+`<g class="a-jelly"><path d="M50 50a30 24 0 0 1 60 0z" fill="#b06ad6" opacity=".85"/>`+[0,1,2,3].map(i=>`<path d="M${58+i*14} 50q-4 12 0 22t0 16" stroke="#b06ad6" stroke-width="3" fill="none" opacity=".8"/>`).join("")+`</g>`,
 rinse:()=>`<path d="M84 18l30 10-6 18-30-10z" fill="${svH}"/><path class="a-flow" d="M84 44q-6 14-8 28" stroke="#3b8fd0" stroke-width="7" stroke-dasharray="6 6" stroke-linecap="round" fill="none"/><path d="M10 82H130" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round"/><path d="M10 82H130" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round"/>`+svTxt(36,30,"sea",13,"#3b8fd0"),
 tweezers:()=>`<path d="M10 76H140" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round"/><path d="M10 76H140" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round"/><path d="M50 72q14-6 28 0t28 0" stroke="#b06ad6" stroke-width="3" fill="none"/><g class="a-lift"><path d="M70 66L110 14M78 68l36-52" stroke="${svH}" stroke-width="4" stroke-linecap="round"/></g>`,
 coldpack:()=>`<path d="M10 76H140" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round"/><path d="M10 76H140" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round"/><rect class="a-press" x="56" y="48" width="44" height="20" rx="6" fill="#9fd3f0"/>`+svTxt(78,38,"cold",12,"#3b8fd0"),
 snake:()=>svGround+`<path class="a-slither" d="M20 84q12-12 24 0t24 0t24 0" stroke="#5a7d2a" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="94" cy="84" r="6" fill="#5a7d2a"/>`+svArr("M110 60h30M134 54l6 6-6 6","a-pulse"),
 still:()=>`<path d="M14 64H120" stroke="${SV_O}" stroke-width="23.2" stroke-linecap="round"/><path d="M14 64H120" stroke="${SV_SK}" stroke-width="20" stroke-linecap="round"/><rect x="30" y="50" width="80" height="6" rx="3" fill="#c08a45"/><rect x="30" y="72" width="80" height="6" rx="3" fill="#c08a45"/><path d="M50 50v28M90 50v28" stroke="${svK}" stroke-width="4"/>`+svTxt(132,30,"still",12),
 mark:()=>`<path d="M14 64H140" stroke="${SV_O}" stroke-width="27.2" stroke-linecap="round"/><path d="M14 64H140" stroke="${SV_SK}" stroke-width="24" stroke-linecap="round"/><ellipse cx="78" cy="64" rx="26" ry="11" fill="#e8a19b" opacity=".7"/><path class="a-draw" d="M52 64a26 11 0 1 0 52 0a26 11 0 1 0-52 0" stroke="${svH}" stroke-width="2.5" stroke-dasharray="4 4" fill="none"/>`+svClock(130,24,12),
 scrape:()=>`<path d="M10 76H140" stroke="${SV_O}" stroke-width="21.2" stroke-linecap="round"/><path d="M10 76H140" stroke="${SV_SK}" stroke-width="18" stroke-linecap="round"/><path d="M78 66v-6" stroke="${svH}" stroke-width="3"/><rect class="a-scrape" x="88" y="44" width="34" height="22" rx="4" fill="${svK}"/>`,
 blanket:()=>svGround+svFig(svStand(80),svH)+`<path d="M60 36q20-8 40 0l4 50q-24 6-48 0z" fill="#c45a10" opacity=".85"/>`+[0,1].map(i=>`<path class="a-pulse" style="animation-delay:${i*.4}s" d="M${30+i*100} 40q-6 6 0 12t0 12" stroke="#3b8fd0" stroke-width="3" fill="none"/>`).join(""),
 sun:()=>`<g class="a-spin" style="transform-origin:80px 46px">`+[0,45,90,135,180,225,270,315].map(a=>`<path d="M80 18v-10" stroke="#f2b632" stroke-width="4" stroke-linecap="round" transform="rotate(${a} 80 46)"/>`).join("")+`</g><circle cx="80" cy="46" r="18" fill="#f2b632"/>`+svTxt(20,92,"E",13,svH,"start")+svTxt(140,92,"W",13,svH,"end"),
 whistle:()=>`<path d="M40 56h40a14 14 0 1 1-14 14H40z" fill="${svH}"/>`+[0,1,2].map(i=>`<path class="a-pulse" style="animation-delay:${i*.3}s" d="M${96+i*12} ${40-i*4}q${8} ${16+i*4} 0 ${32+i*8}" stroke="${svK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join("")+svTxt(36,30,"× 3",14),
 torch:()=>`<rect x="20" y="44" width="50" height="18" rx="5" fill="${svH}"/><path d="M70 40h10v26H70z" fill="${svH}"/><path class="a-sos" d="M80 40l70-16v58L80 66z" fill="#f2d24a" opacity=".7"/>`+svTxt(116,96,"· · · — — — · · ·",11,svH),
 boil:()=>`<path class="a-pulse" d="M60 22q-6-6 0-12M80 22q-6-6 0-12M100 22q-6-6 0-12" stroke="var(--muted)" stroke-width="3" fill="none"/><rect x="44" y="30" width="72" height="48" rx="8" fill="${svH}"/>`+[0,1,2].map(i=>`<circle class="a-bubble" style="animation-delay:${i*.35}s" cx="${62+i*18}" cy="40" r="4" fill="#9fd3f0"/>`).join("")+`<path class="a-flick" d="M60 92q4-12 10 0q4-12 10 0q4-12 10 0q4-12 10 0" fill="#e8542e"/>`,
 flames:()=>svGround+[0,1,2].map(i=>`<path class="a-flick" style="animation-delay:${i*.2}s" d="M${100+i*18} 92c-10-10-6-22 4-34 0 10 10 14 10 24s-6 12-14 10z" fill="${i%2?"#f2b632":"#e8542e"}"/>`).join("")+svFig({h:[44,26],s:[40,38],p:[36,60],a:[[30,46],[22,40]],b:[[46,48],[52,56]],l:[[30,74],[34,92]],m:[[44,74],[52,84]]},svH,"a-jog"),
 lightning:()=>`<path d="M30 30a20 14 0 0 1 36-12 18 14 0 0 1 34 4 14 12 0 0 1-2 24H34a12 10 0 0 1-4-16z" fill="var(--muted)" opacity=".6"/><path class="a-blink" d="M70 46l-12 22h12l-8 22 22-30H72l8-14z" fill="#f2b632"/>`+svFig({h:[130,62],s:[126,72],p:[128,86],a:[[120,82],[118,90]],l:[[136,92],[142,92]]},svH),
 shutters:()=>`<rect x="40" y="16" width="80" height="72" fill="var(--card2)" stroke="${svH}" stroke-width="4"/>`+[0,1,2,3,4,5].map(i=>`<path d="M44 ${26+i*11}h72" stroke="${svH}" stroke-width="4"/>`).join("")+`<circle cx="140" cy="20" r="10" fill="#f2b632" class="a-pulse"/>`,
 passport:()=>`<rect x="56" y="16" width="48" height="70" rx="5" fill="#7b2a2a"/><circle cx="80" cy="44" r="10" fill="none" stroke="#f2d24a" stroke-width="2.5"/>`+svTxt(80,74,"ID",10,"#f2d24a"),
 lock:()=>svPhone(50,17,`<rect x="58" y="40" width="18" height="14" rx="2" fill="${svK}"/><path d="M61 40v-5a6 6 0 0 1 12 0v5" stroke="${svK}" stroke-width="3" fill="none"/>`)+`<path class="a-pulse" d="M100 46h30" stroke="${svK}" stroke-width="3" stroke-dasharray="3 5"/>`,
 card:()=>`<rect x="34" y="28" width="80" height="50" rx="7" fill="#1f5fa8"/><rect x="44" y="40" width="16" height="12" rx="2" fill="#f2d24a"/>`+svX(122,30),
 cross:()=>`<rect x="56" y="22" width="48" height="48" rx="8" fill="#1e8e3e"/><path d="M80 34v24M68 46h24" stroke="#fff" stroke-width="7" stroke-linecap="round" class="a-pulse"/>`,
 luggage:()=>svGround+`<rect x="56" y="34" width="48" height="56" rx="7" fill="${svK}"/><path d="M70 34v-8h20v8" stroke="${svH}" stroke-width="4" fill="none"/><g class="a-flag" style="transform-origin:104px 46px"><rect x="104" y="46" width="22" height="14" rx="3" fill="#f2d24a"/></g>`,
 pocket:()=>svFig(svStand(80),svH)+`<rect x="70" y="56" width="14" height="10" rx="2" fill="#f2b632"/><path d="M68 54h18" stroke="${svK}" stroke-width="3"/>`+`<path d="M140 60h-24" stroke="${SV_O}" stroke-width="10.2" stroke-linecap="round"/><path class="a-sneak" d="M140 60h-24" stroke="${SV_SK}" stroke-width="7" stroke-linecap="round"/>`,
};
// which picture goes with each step (null = no picture for that step)
const SV_STEPS={splint:["still", "blanket", "slingarm", "phone", "cross", null],wound:["tap", "press", "tap", "wrap", "cross", "clock"],nosebleed:["nose","nose","clock","coldpack","cross"],faint:["sit","legx","legsup","legsup","phone"],sugar:["cubes","cubes","clock",null,"side"],seizure:["clock","seiz","seiz","roll","listen","phone"],sprain:[null,"ankle","ankle","cross"],tick:["tickpull","tickpull",null,null,"clock"],eye:[null,"rinseeye","rinseeye","cross"],sling:["slingarm","slingarm","slingarm","slingarm",null],firesafe:[null,"firering","firering","fire","douse"],firelay:["piles","piles","teepee","teepee","blow","fire"],firestart:["ferro","battery9","lens",null],campcook:["embers","embers","foil","embers","boil"],nopowercook:["stoveout","tins","haybox",null],fridge:["fridge","fridge","freezer","tins","trash"],shelter:[null,"leanto","leanto","leanto","tarp","bed"],filter:["bottlefilter","bottlefilter","bottlefilter","boil"],taps:["drink","tub",null,"rain","tub"],keepwarm:["warmroom","blanket","warmroom","drink","warmroom"],north:["sun","sun","shadow","stars","watch"],daylight:["hand","hand","hand","sun"],thunder:["count","count","lightning","clock"],knots:["rope","rope","pole",null],daybag:["drink","sunscreen",null,null,"battery","card","cross"],sunwater:["drink","sunscreen","cool","sit"],call:["phone","speaker","talk",null,"pin","run"],cpr:["safe","shake","tilt","compress","compress","breaths","aed","swap"],
 recovery:["phone","roll","roll","roll","side","listen"],choking:["cough","backblow","thrust","phone",null,"cross"],bleeding:["phone","press","press","clock","tourniquet",null],
 stroke:["face","arms","speech","phone","clock",null],heart:["phone","sit",null,"pill",null,"compress"],allergy:["phone","inject","sit","inject","compress"],
 burns:["tap","ringoff","wrap","phone"],heat:["phone","cool","cool","drink",null],quake:["dropcover","window","lift","away","car","gas","sms"],
 fire:["exit","doorclose","crawl","hotdoor","lift","wave"],flood:["alert","up","power","bag",null],nonet:["sms",null,"battery","meet","cash","radio"],
 rip:["float",null,"rip","float","handup","throwring"],jelly:[null,"rinse","tweezers","coldpack","phone"],snake:["snake","still","still","ringoff","mark","pill"],
 sting:["scrape","coldpack","clock","phone"],cold:["blanket","blanket","blanket","drink","phone"],lost:["meet",null,"sms","sun","wave"],signal:["whistle","torch","wave","torch"],
 water:["drink","boil",null,"boil"],wildfire:["phone","away","flames","car","shutters",null],storm:["lightning","lightning","clock","window"],
 heatwave:["drink","sun","shutters","meet","cool"],evac:["exit","bag","power","sms","meet"],kit:["drink","bag","radio","battery","cross","passport","whistle"],
 passport:["passport","passport",null,null],phone:["lock","lock","lock",null,"sms"],cards:["card",null,null,"cash"],medical:["phone","cross","card",null],
 luggage:["luggage",null,null,"luggage"],scam:["car",null,null,"pocket"]};
const SV_HERO={nosebleed:"nose",faint:"legsup",sugar:"cubes",seizure:"seiz",sprain:"ankle",tick:"tickpull",eye:"rinseeye",sling:"slingarm",firesafe:"firering",firelay:"teepee",firestart:"ferro",campcook:"embers",nopowercook:"stoveout",fridge:"fridge",shelter:"leanto",filter:"bottlefilter",taps:"tub",keepwarm:"warmroom",north:"shadow",daylight:"hand",thunder:"count",knots:"rope",daybag:"bag",sunwater:"sunscreen",call:"phone",cpr:"compress",recovery:"side",choking:"backblow",bleeding:"press",stroke:"face",heart:"sit",allergy:"inject",burns:"tap",heat:"cool",quake:"dropcover",fire:"crawl",flood:"up",nonet:"battery"};
// Our mascot: a cheerful hiker drawn like a retro safety poster (bold outline, flat colours). Poses: "thumb", "wave", "point".
function svMascot(pose){return `<g class="nolines">`+svMascotBody(pose)+`</g>`;}
function svMascotBody(pose){const O="#1d2a30",SK="#f4c9a0",SK2="#e3a97f",JK="#11706a",JK2="#0c5752",PK="#e8833a",HT="#e9d8a6",TR="#c9a66b",BT="#7a4a2a",sw=`stroke="${O}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const raise=pose!=="none";
  const armR=pose==="thumb"?`<path d="M79 84q14-6 18-24" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M79 84q14-6 18-24" fill="none" stroke="${JK}" stroke-width="9" stroke-linecap="round"/>
      <g class="a-thumb2"><path d="M90 47q0-3 3-3h4v-9q0-5 4.5-5t4.5 5v9h1q4 0 4 4v11q0 4-4 4H94q-4 0-4-4z" fill="${SK}" ${sw}/><path d="M97 44h14M99 50h12M99 55.5h12" fill="none" stroke="${O}" stroke-width="1.8" stroke-linecap="round"/></g>`
    :pose==="wave"?`<path d="M79 84q14-6 18-26" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M79 84q14-6 18-26" fill="none" stroke="${JK}" stroke-width="9" stroke-linecap="round"/>
      <g class="a-wave2" style="transform-origin:97px 58px"><path d="M90 58c-2-8 0-16 4-20 1-4 5-4 6 0 1-5 6-5 6 0 2-3 6-2 6 2 0 6-1 12-4 18z" fill="${SK}" ${sw}/><path d="M89 50q-5-3-6 2" fill="none" ${sw}/></g>`
    :`<path d="M79 84q16 2 26-4" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M79 84q16 2 26-4" fill="none" stroke="${JK}" stroke-width="9" stroke-linecap="round"/>
      <g class="a-point"><rect x="103" y="73" width="13" height="12" rx="5" fill="${SK}" ${sw}/><rect x="112" y="74" width="12" height="5.5" rx="2.7" fill="${SK}" ${sw}/></g>`;
  return `<g>
  <rect x="33" y="80" width="54" height="40" rx="10" fill="#c45a10" ${sw}/>
  <path d="M42 120h15v24h-15zM63 120h15v24h-15z" fill="${TR}" ${sw}/>
  <path d="M38 150c0-6 5-9 12-9h8v9zM62 150v-9h8c7 0 12 3 12 9z" fill="${BT}" ${sw}/>
  <path d="M38 84q-8 14-4 32" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M38 84q-8 14-4 32" fill="none" stroke="${JK}" stroke-width="9" stroke-linecap="round"/><circle cx="34" cy="120" r="6.5" fill="${SK}" ${sw}/>
  <path d="M40 80q20-8 40 0l4 40H36z" fill="${JK}" ${sw}/>
  <path d="M60 80v40" stroke="${JK2}" stroke-width="2"/><path d="M66 100h11v8H66z" fill="${JK2}"/>
  <path d="M46 80v26M74 80v26" stroke="${PK}" stroke-width="5"/>
  <path d="M36 118h48" stroke="${O}" stroke-width="2.6"/><rect x="56" y="114" width="8" height="7" rx="1.5" fill="#f2b632" ${sw}/>
  <path d="M49 74l11 12 11-12z" fill="#d6452f" ${sw}/><circle cx="60" cy="78" r="3.6" fill="#d6452f" ${sw}/>
  ${armR}
  <circle cx="39" cy="50" r="5.5" fill="${SK}" ${sw}/><circle cx="81" cy="50" r="5.5" fill="${SK}" ${sw}/>
  <ellipse cx="60" cy="50" rx="21" ry="23" fill="${SK}" ${sw}/>
  <circle cx="47" cy="59" r="4.2" fill="#ef8f86" opacity=".55"/><circle cx="73" cy="59" r="4.2" fill="#ef8f86" opacity=".55"/>
  <path d="M45 56l1.2 .6M49 57.5l1 .4M71 57.5l1-.4M75 56l-1.2.6" stroke="#b77a55" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M46 40q5-4 10-1M64 39q5-3 10 1" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>
  <g class="a-eye2"><ellipse cx="52" cy="47" rx="3.2" ry="4.3" fill="${O}"/><ellipse cx="68" cy="47" rx="3.2" ry="4.3" fill="${O}"/><circle cx="53.2" cy="45.4" r="1.2" fill="#fff"/><circle cx="69.2" cy="45.4" r="1.2" fill="#fff"/></g>
  <ellipse cx="60" cy="54.5" rx="3.6" ry="2.8" fill="${SK2}"/>
  <path d="M47 60q13 15 26 0z" fill="#5b1f1f" ${sw}/><path d="M49.5 61.2h21l-1.6 3.2h-17.8z" fill="#fff"/><path d="M54 67.5q6 3.5 12 0q-6-3-12 0z" fill="#e8736b"/>
  <path d="M30 31q30-12 60 0q-30 7-60 0z" fill="${HT}" ${sw}/>
  <path d="M42 30q-1-17 18-19q19 2 18 19z" fill="${HT}" ${sw}/><path d="M42.5 25q17.5 5 35 0v5q-17.5 4-35 0z" fill="${PK}"/>
  <path d="M50 16q4-3 8-2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
  </g>`;}
function svMascotSvg(pose,cls){return `<svg class="sv-art${cls?" "+cls:""}" viewBox="0 0 132 160" aria-hidden="true">${svMascot(pose)}</svg>`;}
function svArt(name,cls){const f=SV_ART[name];if(!f)return "";return `<svg class="sv-art${cls?" "+cls:""}" viewBox="0 0 160 104" aria-hidden="true">${f()}</svg>`;}
function svStepArt(g,i){const a=(g.a&&g.a[i])||(SV_STEPS[g.id]||[])[i];return a?svArt(a):"";}
function svHeroArt(g){const n=g.hero||SV_HERO[g.id]||(SV_STEPS[g.id]||g.a||[]).find(Boolean);return n?svArt(n,"hero"):"";}

/* ---------- SURVIVAL (basics built in, extra packs downloadable, all offline once saved) ---------- */
const SURV_BASE=[{"id":"nosebleed","cat":"first","ic":"👃","t":"Nosebleed","w":"Blood from the nose","call":false,"s":["Sit down and lean forward, so blood doesn't run down the throat.","Pinch the soft part of the nose firmly, just below the bone, and breathe through the mouth.","Keep pinching for 10–15 minutes without letting go to check.","A cold pack on the neck or nose may help.","Still bleeding after 20 minutes, a lot of blood, or after a blow to the head: get medical help."],"d":["Don't tilt the head back","Don't lie down"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"faint","cat":"first","ic":"😵‍💫","t":"Fainting","w":"Feeling faint, or fainted briefly","call":false,"s":["Feeling faint: sit or lie down straight away.","If you can't lie down: cross your legs and squeeze your leg, belly and bottom muscles, or squat down.","Someone fainted: lay them on their back and raise their legs.","They usually wake up within a minute. Let them get up slowly.","Not waking up within a minute, not breathing normally, or injured: call 112."],"d":["Don't give anything to drink until they're fully awake"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"sugar","cat":"first","ic":"🍬","t":"Low blood sugar (diabetes)","w":"Shaky, sweaty, confused, someone with diabetes","call":false,"s":["If they're awake and can swallow: give sugar right away: glucose tablets, a sugary drink (not diet), or sweets.","About 15–20 grams of sugar: for example 4–5 glucose tablets or a glass of regular soft drink.","Wait 15 minutes. Not better? Give sugar again.","When they feel better, a snack like bread or a biscuit.","Not able to swallow, very drowsy or unconscious: call 112 and put them on their side."],"d":["Don't give food or drink to someone who can't swallow safely"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"seizure","cat":"first","ic":"⚡","t":"Seizure (epileptic fit)","w":"Shaking, stiff, not responding","call":false,"s":["Stay calm and note the time it started.","Move hard or sharp things away and put something soft under the head.","Don't hold them down; let the shaking run its course.","When it stops: roll them onto their side and check their breathing.","Stay with them and talk calmly until they're fully awake.","Call 112 if it lasts more than 5 minutes, it's their first seizure, they're injured, in water, or don't wake up."],"d":["Don't put anything in their mouth","Don't hold them down"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"sprain","cat":"first","ic":"🦶","t":"Sprained ankle or wrist","w":"Twisted, painful, swelling","call":false,"s":["Stop and rest it.","Cool it: a cold pack or ice wrapped in a cloth, about 20 minutes.","Keep it raised, higher than the heart if you can.","Can't put weight on it, it looks bent, or the pain is very bad: see a doctor; it may be broken."],"d":["No ice directly on the skin"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"tick","cat":"first","ic":"🕷️","t":"Tick bite","w":"A small tick stuck in the skin","call":false,"s":["Remove it as soon as possible: grab it with a tick remover or fine tweezers, as close to the skin as you can.","Pull it straight out slowly and steadily.","Clean the bite with disinfectant.","Write down the date and place.","See a doctor if a red ring appears and grows in the next weeks, or if you get flu-like symptoms."],"d":["Don't squeeze the tick's body","No oil, alcohol or burning before removing it"],"src":"RIVM / public-health advice"},{"id":"eye","cat":"first","ic":"👁️","t":"Something in the eye","w":"Dust, sand or a chemical splash","call":false,"s":["Don't rub it.","Rinse the eye with lots of clean, lukewarm water, from the nose side outwards.","A chemical splash: rinse for at least 10–15 minutes, then get medical help.","Something stuck in the eye, or the eye stays painful or blurry: see a doctor."],"d":["Don't try to remove something stuck in the eye"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"sling","cat":"first","ic":"🩹","t":"Making an arm sling","w":"Support a hurt arm or wrist","call":false,"s":["Let them hold the hurt arm across the chest, hand slightly higher than the elbow.","Slide a triangle of cloth (a scarf, a shirt) between the arm and chest, point at the elbow.","Bring the lower end up over the arm to the other shoulder and tie both ends behind the neck.","Pin or twist the point at the elbow so the arm can't slide out.","Check the fingers stay warm and pink."],"d":[],"src":"Red Cross first-aid guidance","see":["splint","reef"]},{"id":"wound","cat":"first","ic":"🩹","t":"Cleaning a small wound","w":"Cuts and grazes","call":false,"s":["Wash your hands first.","Press with a clean cloth until the bleeding stops (a few minutes).","Rinse the wound under running tap water for a few minutes and gently remove dirt.","Cover it with a plaster or clean dressing.","See a doctor if it gapes, won't stop bleeding, is from a bite, is very dirty, or if your last tetanus jab was over 10 years ago.","Red, warm, swelling or pus after a day or two: infection, see a doctor."],"d":["No cotton wool directly on the wound"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"splint","cat":"first","ic":"🦴","t":"Possible broken bone","w":"Bent, very painful, can't use it","call":false,"s":["Keep the injured part still, in the position you found it. Don't try to straighten it.","Support it with padding: rolled clothing, a cushion or a blanket around it.","An arm: support it in a sling across the chest (see Making an arm sling).","A leg, the back, neck or hip, or bone through the skin: call 112 and don't move them unless they're in danger.","Check that the fingers or toes stay warm and pink.","No food or drink: they may need an operation."],"d":["Don't try to put a bone back","Don't let them walk on a leg that may be broken"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"north","cat":"info","ic":"🧭","t":"Finding north without a phone","w":"Sun, shadows, stars or a watch","call":false,"s":["The sun rises roughly in the east and sets roughly in the west.","In Europe the sun is roughly due south around midday (about 13:00 in summer time).","Shadow stick: put a stick upright and mark the tip of its shadow. Wait 15–20 minutes and mark it again. The first mark is west, the second east.","At night: find the Plough (Big Dipper). The two stars at the end of the ‘pan’ point to the North Star, about five times the gap between them.","With a watch with hands: point the hour hand at the sun. South is halfway between the hour hand and 12 (use 1 o'clock in summer time)."],"d":[],"src":"","see":["compass","papermap"]},{"id":"daylight","cat":"info","ic":"🌅","t":"How much daylight is left","w":"Plan to be back before dark","call":false,"s":["Stretch your arm out, hand flat and fingers sideways, with your little finger resting on the horizon.","Count how many fingers fit between the horizon and the sun.","Each finger is roughly 15 minutes of daylight, a full hand roughly an hour. It's a rough guide: it varies with season and place.","Start heading back with time to spare: after sunset it gets dark quickly in the south."],"d":[],"src":"","see":["dark","distance"]},{"id":"thunder","cat":"info","ic":"⚡","t":"How far away is the storm?","w":"Count after the flash","call":false,"s":["Count the seconds between the lightning flash and the thunder.","Divide by 3 to get the distance in kilometres (9 seconds ≈ 3 km).","Under 30 seconds (about 10 km): go inside a building or a car now.","Wait 30 minutes after the last thunder before going back out."],"d":["Don't shelter under a lone tree"],"src":"Red Cross first-aid guidance","see":["clouds","storm"]},{"id":"daybag","cat":"info","ic":"🎒","t":"What to bring for a day out","w":"Small bag, big difference","call":false,"s":["Water: at least 1 litre per person, more in the heat.","Sun cream, a hat and sunglasses.","A light extra layer or rain jacket.","A snack.","A charged phone, power bank and the offline map of the area.","ID, a bank card and some cash.","A few plasters, painkillers and your own medicines."],"d":[],"src":"","see":["carkit"]},{"id":"sunwater","cat":"info","ic":"🧴","t":"Sun and water","w":"Staying well in the heat","call":false,"s":["Drink regularly, also before you feel thirsty. Pale urine is a good sign; dark means drink more.","Use sun cream SPF 30 or higher. Put it on before going out and again every 2 hours and after swimming.","Find shade in the middle of the day and wear a hat.","Headache, dizziness or feeling sick in the heat: stop, cool down in the shade and drink. Confused or very hot: see “Heat stroke”."],"d":[],"src":"Red Cross first-aid guidance"},{"id":"call","cat":"first","ic":"📞","t":"Calling for help","w":"Before anything else in a serious emergency","call":true,"s":["Call 112. It works free from any mobile phone everywhere in the EU, also abroad and without credit.","Put the phone on speaker so your hands are free.","Say WHERE you are first (address, or the coordinates shown at the top of this screen), then WHAT happened and HOW MANY people are hurt.","Follow the operator's instructions and don't hang up until they tell you to.","Android phones usually send your location to 112 automatically during the call.","Send someone to meet the ambulance and to look for an AED (defibrillator) if there is one nearby."],"d":["Don't hang up early","Don't move an injured person unless they're in danger where they are"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"cpr","cat":"first","ic":"❤️","t":"CPR: not responding, not breathing normally","w":"Someone collapsed and doesn't react","call":true,"metro":true,"s":["Make sure it's safe for you to approach.","Shout and gently shake their shoulders. If there's no reaction, call 112 on speaker straight away.","Open the airway: tilt the head back, lift the chin. Look and listen for normal breathing for no more than 10 seconds. Gasping is NOT normal breathing.","Not breathing normally? Start CPR: heel of one hand in the centre of the chest, other hand on top, arms straight.","Push hard and fast: 5–6 cm deep, 100–120 times a minute (use the beat button below). Let the chest come back up fully each time.","If you're trained: after 30 compressions give 2 rescue breaths, then continue 30:2. Not trained or not willing: just keep doing compressions.","As soon as an AED arrives, switch it on and follow its voice instructions.","Keep going until help takes over, the person clearly starts breathing normally, or you're exhausted. Swap with someone every 2 minutes if you can."],"d":["Don't stop to check for a pulse","Don't worry about hurting them: doing nothing is worse"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"recovery","cat":"first","ic":"🛌","t":"Unconscious but breathing","w":"Not responding, but breathing normally","call":true,"s":["Call 112.","Kneel beside them. Put the arm nearest you at a right angle, elbow bent, palm up.","Bring the other arm across the chest and hold the back of that hand against their cheek nearest you.","Bend the far knee up, then pull on that knee to roll them towards you onto their side.","Tilt the head back slightly so the airway stays open and anything in the mouth can drain out.","Check their breathing every minute. If it stops or isn't normal, start CPR."],"d":["Don't give food or drink","Don't leave them alone"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"choking","cat":"first","ic":"😮","t":"Choking (adult or child over 1)","w":"Can't breathe, can't speak, clutching the throat","call":true,"s":["Ask: “Are you choking?” If they can cough, tell them to keep coughing.","If coughing doesn't work: stand to the side and slightly behind, lean them forward and give up to 5 sharp blows between the shoulder blades with the heel of your hand.","Still blocked? Give up to 5 abdominal thrusts: stand behind, fist just above the belly button, other hand over it, pull sharply inwards and upwards.","If it's still not cleared, call 112 and keep alternating 5 back blows and 5 abdominal thrusts.","If they become unresponsive, start CPR.","Anyone who had abdominal thrusts should see a doctor afterwards."],"d":["Don't do abdominal thrusts on a baby under 1 (use back blows and chest thrusts)","Don't put your fingers blindly in their mouth"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"bleeding","cat":"first","ic":"🩸","t":"Severe bleeding","w":"Blood spurting or soaking through quickly","call":true,"s":["Call 112 (or let someone else call) right away.","Press firmly and directly on the wound with a clean cloth, or your hand if nothing else. Keep pressing.","If blood soaks through, put more cloth on top and keep pressing. Don't lift it to look.","Keep the pressure on for at least 10 minutes, or until help arrives.","Life-threatening bleeding from an arm or leg that pressure doesn't stop: a tourniquet 5–7 cm above the wound (not on a joint), tightened until the bleeding stops. Note the time.","Let them lie down and keep them warm."],"d":["Don't remove an object stuck in the wound: press around it","Don't loosen a tourniquet once it's on"],"src":"European Resuscitation Council Guidelines 2025","see":["wound"]},{"id":"stroke","cat":"first","ic":"🧠","t":"Stroke: think FAST","w":"Sudden drooping face, weak arm, slurred speech","call":true,"s":["F (face): ask them to smile. Does one side droop?","A (arms): can they lift both arms and keep them up?","S (speech): is their speech slurred or strange?","T (time): if you see any of these, call 112 immediately. Every minute counts.","Note the time the symptoms started and tell the ambulance.","Keep them comfortable and stay with them."],"d":["Don't give food, drink or medicines"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"heart","cat":"first","ic":"💔","t":"Heart attack","w":"Chest pain or pressure lasting more than a few minutes","call":true,"s":["Call 112.","Let them sit down and rest in the position most comfortable for them, often half-sitting.","Loosen tight clothing.","If they're an adult, not allergic to aspirin, and the dispatcher agrees: one aspirin (150–300 mg) to chew.","If they have their own heart medication (e.g. a nitro spray), help them use it.","Stay with them. If they stop responding and aren't breathing normally, start CPR."],"d":["Don't let them walk around or ‘wait and see’"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"allergy","cat":"first","ic":"🐝","t":"Severe allergic reaction","w":"Swelling, hives, trouble breathing after food, a sting or medicine","call":true,"s":["Call 112 and say it's anaphylaxis.","If they have an adrenaline auto-injector (EpiPen etc.), help them use it in the outer thigh, through clothing if needed.","Breathing hard? Let them sit up. Feeling faint? Let them lie down with the legs raised.","If there's no improvement after 5 minutes and they have a second injector, use it.","If they stop responding and aren't breathing normally, start CPR."],"d":["Don't let them stand up or walk suddenly"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"burns","cat":"first","ic":"🔥","t":"Burns","w":"Hot liquid, fire, sun, chemicals","call":false,"s":["Cool the burn under cool or lukewarm running water for at least 20 minutes, as soon as possible.","Remove rings, watches and clothing near the burn, unless it's stuck to the skin.","Cover loosely with cling film or a clean plastic bag (not wrapped tightly).","Call 112 for large burns, burns on the face, hands, feet, genitals or airway, electrical or chemical burns, and burns on children."],"d":["No ice, butter, toothpaste or creams","Don't pop blisters"],"src":"European Resuscitation Council Guidelines 2025"},{"id":"heat","cat":"first","ic":"🥵","t":"Heat stroke","w":"Hot, confused, very unwell in the heat","call":true,"s":["Call 112: heatstroke is life-threatening.","Move them to a cool, shaded place and remove outer clothing.","Cool them fast: cold water over the body, a cold wet sheet with more water poured on, fanning, or cold packs in armpits, groin and neck. Cold water immersion up to the neck is best if it's safe.","If they're fully awake and can swallow, give sips of cold water.","Keep cooling and watch them until help arrives. Ready for CPR if they stop responding."],"d":["Don't give alcohol or caffeine"],"src":"Red Cross first-aid guidance"},{"id":"quake","cat":"danger","ic":"🌋","t":"Earthquake","w":"The ground is shaking","call":false,"s":["Inside: DROP, COVER, HOLD ON. Get under a sturdy table or bed, or against a load-bearing wall, and protect your head and neck.","Stay away from windows, mirrors, shelves and anything that can fall.","Don't run for the stairs or the lift during the shaking.","Outside: move away from buildings, trees, street lights and power lines.","In a car: stop away from bridges, flyovers and buildings, and stay inside.","After the shaking: leave the building carefully (stairs, not the lift), turn off gas if you can, expect aftershocks.","Keep phone lines free for emergencies; send texts instead of calling."],"d":["Don't use the lift","Don't go back inside a damaged building"],"src":"Protezione Civile, “Io non rischio”"},{"id":"fire","cat":"danger","ic":"🚒","t":"Fire in a building","w":"Smoke or fire where you are","call":true,"s":["Warn everyone and get out. Leave your belongings.","Close doors behind you to slow the fire.","Stay low under smoke: the air is cleaner near the floor.","Feel doors with the back of your hand before opening. Hot? Use another way out.","Use the stairs, never the lift. Call 112 once you're outside.","Trapped? Close the door, block gaps with wet cloth, go to a window and signal (light, cloth, shouting)."],"d":["Never go back in for belongings or pets","Don't open a hot door"],"src":"Red Cross first-aid guidance"},{"id":"flood","cat":"danger","ic":"🌊","t":"Flood","w":"Water is rising or a flood warning is out","call":false,"s":["Follow official alerts: NL-Alert in the Netherlands, IT-alert in Italy (they arrive as loud messages on your phone).","Go up: to a higher floor or higher ground. If told to evacuate, leave early.","Switch off electricity and gas if you can do it safely.","Take your phone, power bank, medicines, documents and water.","Keep the app's offline map downloaded so you can find routes without internet."],"d":["Don't walk or drive through moving water: even shallow water can sweep you or your car away","Stay away from flood water near electrical cables"],"src":"NL-Alert / Protezione Civile","see":["dike","evac"]},{"id":"nonet","cat":"trouble","ic":"📴","t":"No internet or no power","w":"Network down, power cut, battery low","call":false,"s":["112 still works if there's any mobile network. Texts often get through when calls and data don't.","This app keeps working: offline maps, saved places, train estimates, this survival guide, group by Bluetooth and text messages.","Save battery: low-power mode, lower brightness, close other apps. Airplane mode with location on keeps GPS working on offline maps.","Agree a meeting point with your group in advance, and a time to meet if you get separated.","Keep some cash: card payments may not work.","A battery or wind-up radio gives official news when phones don't."],"d":["Don't waste battery searching for signal: check now and then"],"src":"","see":["longout","smsbusy","contactplan"]}];
const SURV_URL="https://raw.githubusercontent.com/jariplayz-source/puglia-transit/main/packs/";
const SURV_COL={grid:"#a0522d",info:"#11706a",first:"#c5221f",danger:"#c45a10",trouble:"#455a64",out:"#2e7d4f",dis:"#c45a10",trv:"#1f5fa8",food:"#5b8c2a",skill:"#7a5c2e",road:"#1f5fa8",home:"#6a4c93",fun:"#3f8f3a"};
/* Shelves keep the guides organised: every guide lives on exactly one shelf (its own "shelf", its pack's, or from its category). */
const SV_SHELVES=[["first","First aid","🩹"],["danger","Emergencies & disasters","⚠️"],["know","Useful to know","💡"],["nature","Outdoors & nature","🌿"],["home","Home & no power","🏠"],["food","Food: grow, find & keep","🥕"],["skills","Skills","🪢"],["road","On the road & travel","🧭"],["fun","Just for fun","🧟"]];
const SV_CAT2SHELF={first:"first",danger:"danger",trouble:"danger",dis:"danger",info:"know",out:"nature",grid:"home",home:"home",food:"food",skill:"skills",road:"road",trv:"road",fun:"fun"};
// The pack catalog (with every guide title, so search finds guides in packs you haven't downloaded). Built in, refreshed from packs/index.json.
const SURV_OFFER_BUILTIN=/*SURV_INDEX*/[{"id":"outdoors","v":2,"name":"Outdoors & sea","ic":"🌿","desc":"Rip currents, jellyfish, sea urchins, weever fish, snakes, stings, cold, getting lost, signalling","shelf":"nature","n":9,"size":5877,"guides":[{"id":"rip","t":"Caught in a rip current","w":"Being pulled out to sea"},{"id":"jelly","t":"Jellyfish sting (Mediterranean)","w":"Burning stripes after swimming"},{"id":"snake","t":"Snake bite (vipers in Europe)","w":"Bitten by a snake"},{"id":"sting","t":"Bee and wasp stings","w":"Painful sting"},{"id":"cold","t":"Hypothermia","w":"Very cold, shivering, confused or sleepy"},{"id":"lost","t":"Lost outdoors","w":"You don't know where you are"},{"id":"signal","t":"Signalling for help","w":"You need to be found"},{"id":"urchin","t":"Stepped on a sea urchin","w":"Black spines in the foot"},{"id":"weever","t":"Weever fish sting (pieterman)","w":"Sudden sharp pain in the foot on a sandy beach"}]},{"id":"disasters","v":3,"name":"Disasters & alerts","ic":"⚠️","desc":"Wildfire, storms, heatwaves, high water and dike breaches, long power cuts, evacuation, emergency kit","shelf":"danger","n":7,"size":6756,"guides":[{"id":"wildfire","t":"Wildfire nearby","w":"Smoke, flames or an evacuation order"},{"id":"storm","t":"Thunderstorm","w":"Thunder, lightning, strong wind"},{"id":"heatwave","t":"Heatwave","w":"Several very hot days"},{"id":"evac","t":"Evacuation","w":"You're told to leave"},{"id":"kit","t":"Emergency kit checklist","w":"Be ready before it happens"},{"id":"dike","t":"High water or a dike breach","w":"The Netherlands: water from rivers or sea"},{"id":"longout","t":"Power out for days","w":"A long blackout"}]},{"id":"offgrid","v":3,"name":"Off-grid skills","ic":"🔥","desc":"Making fire, cooking without power, keeping food safe, simple shelter, drinking water, toilet and light without power, staying warm","shelf":"home","n":13,"size":11506,"guides":[{"id":"firesafe","t":"Fire safety first","w":"Before you light anything"},{"id":"firelay","t":"Building a fire","w":"Tinder, kindling, fuel"},{"id":"firestart","t":"Lighting a fire without matches","w":"When the lighter is gone"},{"id":"campcook","t":"Cooking on a fire","w":"Embers, not flames"},{"id":"nopowercook","t":"Cooking when the power is out","w":"Gas, barbecue or no cooking at all"},{"id":"fridge","t":"Keeping food safe without power","w":"Fridge and freezer in a power cut"},{"id":"shelter","t":"Building a simple shelter","w":"Out of wind and rain, off the cold ground"},{"id":"water","t":"Safe drinking water","w":"No bottled water available"},{"id":"filter","t":"A simple water filter","w":"Make dirty water clearer"},{"id":"taps","t":"Water when the taps stop","w":"Store it before you need it"},{"id":"keepwarm","t":"Staying warm without heating","w":"When the heating is off"},{"id":"sanitation","t":"Toilet and washing without running water","w":"When the toilet won't flush for days"},{"id":"lightout","t":"Lighting your home in a blackout","w":"Dark evenings without electricity"}]},{"id":"travel","v":2,"name":"Travel trouble","ic":"🧳","desc":"Lost passport, phone or cards, doctor abroad, lost luggage, scams","shelf":"road","n":6,"size":2778,"guides":[{"id":"passport","t":"Lost or stolen passport","w":"Your ID is gone abroad"},{"id":"phone","t":"Phone lost or stolen","w":"Your phone is gone"},{"id":"cards","t":"Bank cards lost or stolen","w":"Wallet or cards gone"},{"id":"medical","t":"Medical care abroad","w":"You need a doctor"},{"id":"luggage","t":"Lost luggage","w":"Your bag didn't arrive"},{"id":"scam","t":"Common scams","w":"Something feels off"}]},{"id":"keepfood","v":1,"name":"Food that keeps","ic":"🫙","desc":"Preserving in jars, jam, freezing, a food store, dried meat, hard bread, smoking fish, and how to tell if food is still safe","shelf":"food","n":10,"size":16550,"guides":[{"id":"kfbasics","t":"How to make food keep: the basics","w":"Read this before you preserve anything"},{"id":"kfjars","t":"Preserving in jars (water bath)","w":"Fruit, jam, pickles and tomatoes that keep for a year"},{"id":"kfjam","t":"Jam that keeps","w":"Summer fruit for the winter"},{"id":"kffreeze","t":"Freezing food so it keeps","w":"The easiest way to keep almost anything"},{"id":"kfstore","t":"A food store that lasts","w":"A cupboard that gets you through two weeks"},{"id":"kfsafe","t":"Is it still safe to eat?","w":"Dates, smells, mould and dented tins"},{"id":"kfoil","t":"Garlic and herbs in oil: the hidden danger","w":"It looks lovely in the jar"},{"id":"kfsmoke","t":"Hot-smoking fish","w":"Catch of the day, keeps a few extra days"},{"id":"kfjerky","t":"Dried meat (jerky)","w":"Light, protein-rich food that travels"},{"id":"kfhardbread","t":"Hard bread that keeps for months","w":"Ship's biscuit: flour, water, salt"}]},{"id":"growkeep","v":2,"name":"Grow & keep","ic":"🥕","desc":"A vegetable patch, pots on a balcony, easy crops, sprouts, potatoes, saving seeds, compost, drying, pickling and storing","shelf":"food","n":10,"size":39598,"guides":[{"id":"growstart","t":"Starting a vegetable patch","w":"Your first bed of food"},{"id":"growpots","t":"Growing in pots on a balcony","w":"No garden needed"},{"id":"easycrops","t":"Easy crops for beginners","w":"What to grow first"},{"id":"sprouts","t":"Sprouts in a jar","w":"Fresh food in 4 days, no garden"},{"id":"potatoes","t":"Growing potatoes","w":"The most food for the space"},{"id":"seeds","t":"Saving seeds for next year","w":"Free seeds, every year"},{"id":"compost","t":"Compost from scraps","w":"Free food for your plants"},{"id":"drying","t":"Drying food","w":"Keeps for months without a fridge"},{"id":"pickle","t":"Pickling and fermenting","w":"Sour, tasty and long-lasting"},{"id":"storing","t":"Storing a harvest","w":"Make it last through winter"}]},{"id":"wildfood","v":1,"name":"Wild food & mushrooms","ic":"🍄","desc":"Rules for picking wild food, nettles, dandelions, berries, wild garlic, chestnuts, and mushroom safety","shelf":"food","n":9,"size":44066,"guides":[{"id":"forage","t":"Rules for picking wild food","w":"Before you eat anything wild"},{"id":"nettle","t":"Stinging nettles","w":"Free spinach, nearly everywhere"},{"id":"dandelion","t":"Dandelions","w":"The whole plant is edible"},{"id":"berries","t":"Wild berries","w":"Which ones, and which to avoid"},{"id":"garlic","t":"Wild garlic and its deadly look-alikes","w":"Spring, in damp woods"},{"id":"chestnut","t":"Sweet chestnuts (not conkers!)","w":"Autumn food from the trees"},{"id":"mushrules","t":"Mushrooms: the safety rules","w":"Read this before picking any"},{"id":"deadlymush","t":"Deadly mushrooms to know","w":"Learn these so you never touch them"},{"id":"mushpoison","t":"Mushroom poisoning: what to do","w":"Someone ate a wild mushroom and feels ill"}]},{"id":"knots","v":1,"name":"Knots & rope","ic":"🪢","desc":"Ten knots drawn step by step, lashing poles together and making cord from plants","shelf":"skills","n":11,"size":36206,"guides":[{"id":"ropewords","t":"Rope words and tips","w":"Read this first"},{"id":"overhand","t":"Overhand knot","w":"Stop a rope sliding through a hole"},{"id":"eight","t":"Figure-eight knot","w":"A stopper that's easy to undo"},{"id":"reef","t":"Reef knot","w":"Tie two ends together: bandage, sling, bundle"},{"id":"sheetbend","t":"Sheet bend","w":"Join two ropes, even of different thickness"},{"id":"bowline","t":"Bowline","w":"A loop that won't slip or tighten"},{"id":"clove","t":"Clove hitch","w":"Quickly tie a rope to a pole or rail"},{"id":"halfhitch","t":"Round turn and two half hitches","w":"Tie a rope to a ring, tree or post that carries a load"},{"id":"tautline","t":"Taut-line hitch","w":"An adjustable line for tents and tarps"},{"id":"lashing","t":"Lashing two poles together","w":"For a shelter, a tripod or a stretcher"},{"id":"cordage","t":"Making cord from plants","w":"No rope? Twist your own"}]},{"id":"navweather","v":1,"name":"Finding your way & weather","ic":"🧭","desc":"Paper maps, compass, distance and time, no-phone navigation, clouds, weather signs, walking in the dark","shelf":"nature","n":7,"size":28519,"guides":[{"id":"papermap","t":"Reading a paper map","w":"When the phone is dead"},{"id":"compass","t":"Using a compass","w":"Find a direction and keep it"},{"id":"distance","t":"Judging distance and time","w":"How far, how long"},{"id":"nophone","t":"Navigating without a phone","w":"Old tricks that still work"},{"id":"clouds","t":"Reading the clouds","w":"What's coming in the next hours"},{"id":"wind","t":"Wind and weather signs","w":"No forecast? Read the signs"},{"id":"dark","t":"Walking in the dark","w":"When you didn't make it back before sunset"}]},{"id":"talk","v":1,"name":"Talking without internet","ic":"📻","desc":"Walkie-talkies, news by radio, texts when the network is busy, Morse, notes and a contact plan","shelf":"home","n":6,"size":7457,"guides":[{"id":"walkie","t":"Walkie-talkies","w":"Talk to your group without a network"},{"id":"radionews","t":"News by radio","w":"When internet and TV are down"},{"id":"smsbusy","t":"Texts when the network is busy","w":"Calls fail but you need to reach someone"},{"id":"morse","t":"Morse code","w":"Signal with light or sound"},{"id":"notes","t":"Leaving messages","w":"When people can't reach you"},{"id":"contactplan","t":"A contact plan for your people","w":"Make it now, before anything happens"}]},{"id":"road","v":2,"name":"On the road","ic":"🚗","desc":"Flat tyre, jump-start, warning lights, motorway breakdown, car kit, snow and heat, bike repairs","shelf":"road","n":9,"size":26774,"guides":[{"id":"tyre","t":"Changing a car tyre","w":"Flat tyre on the road"},{"id":"jump","t":"Jump-starting a car","w":"The battery is flat"},{"id":"dash","t":"Dashboard warning lights","w":"A light comes on while driving"},{"id":"breakdown","t":"Breaking down on the motorway","w":"The car stops on a fast road"},{"id":"carkit","t":"What to keep in the car","w":"Pack it once, then forget about it"},{"id":"snowheat","t":"Stuck in snow or heat","w":"In the car for a long time"},{"id":"bikeflat","t":"Fixing a bike flat","w":"Puncture on the way"},{"id":"chain","t":"Chain came off","w":"Pedals spin, nothing happens"},{"id":"bikesafe","t":"Cycling safely in wind, rain and dark","w":"Bad weather on two wheels"}]},{"id":"fixhome","v":1,"name":"Fix it at home","ic":"🔧","desc":"Shutting off water, gas and power, tripped fuses, gas smell, leaks, blocked drains, broken windows","shelf":"home","n":6,"size":10939,"guides":[{"id":"shutoff","t":"Shutting off water, gas and power","w":"Find them before you need them"},{"id":"fuses","t":"The power went off in part of the house","w":"A switch in the fuse box has flipped"},{"id":"gasleak","t":"You smell gas","w":"A rotten-egg smell in the house"},{"id":"leak","t":"Leaking tap or pipe","w":"Water where it shouldn't be"},{"id":"drain","t":"Blocked sink or toilet","w":"Water won't go down"},{"id":"glass","t":"A broken window","w":"Make it safe and weatherproof"}]},{"id":"zombie","v":1,"name":"Zombie apocalypse","ic":"🧟","desc":"Just for fun, but every step is real preparation: day zero, go-bag, home, moving, finding people, a base","shelf":"fun","n":8,"size":35106,"guides":[{"id":"zday0","t":"Day zero: the first hour","w":"The news says the dead are walking"},{"id":"zgobag","t":"The go-bag","w":"When you have to run, grab this"},{"id":"zfort","t":"Fortify your home","w":"Staying in is safer than going out"},{"id":"zmove","t":"Moving through town","w":"You have to get from A to B"},{"id":"zfind","t":"Finding your people","w":"The network is gone. Where is everyone?"},{"id":"zscav","t":"Scavenging rules","w":"What's actually worth taking"},{"id":"zbase","t":"A long-term base","w":"It's been a month. Now what?"},{"id":"zrules","t":"Rules of survival","w":"Stick them on the fridge"}]},{"id":"stockcook","v":1,"name":"Cooking from your stock","ic":"🍲","desc":"Meals from your emergency food: no-cook breakfasts and salads, one-pot meals on a camping stove, saving gas and water, flatbread","shelf":"food","n":10,"size":10101,"guides":[{"id":"sc_nocook","t":"Meals from your stock without cooking","w":"No power, no gas: still a proper meal"},{"id":"sc_salad","t":"Tuna and bean salad (no cooking)","w":"Ready in 5 minutes, for 2"},{"id":"sc_oats","t":"Overnight oats (no cooking)","w":"A warm-feeling breakfast without a stove"},{"id":"sc_stove","t":"Cooking on a camping stove safely","w":"Gas or spirit stove when the power is out"},{"id":"sc_fuel","t":"Saving gas and water when you cook","w":"Make your stock and your gas last"},{"id":"sc_onepot","t":"One-pot rice with vegetables and meat","w":"A hot meal with one pan, for 2"},{"id":"sc_pasta","t":"One-pan pasta with tomato and tuna","w":"Pasta without pouring away water, for 2"},{"id":"sc_soup","t":"Bean and vegetable soup from tins","w":"Warming and filling, 10 minutes"},{"id":"sc_flatbread","t":"Flatbread in a frying pan","w":"Fresh bread from flour, water and salt"},{"id":"sc_ricepud","t":"Rice pudding with UHT milk","w":"Sweet energy, children love it"}]}];
let SURV_OFFER=SURV_OFFER_BUILTIN;try{const c=JSON.parse(localStorage.getItem("pt-surv-idx")||"null");if(c&&Array.isArray(c.packs)&&c.packs.length)SURV_OFFER=c.packs;}catch(e){}
const SURV_NUMS={it:[["118","Ambulance"],["115","Fire"],["113","Police"],["1530","Coastguard"]],nl:[["0900-8844","Police (not urgent)"]]};
let SURV_PACKS={};try{SURV_PACKS=JSON.parse(localStorage.getItem("pt-surv")||"{}");}catch(e){}
// packs may bring their own pictures (plain SVG): register them, with anything that could run code stripped out
function svSafeSvg(x){return String(x||"").replace(/<\/?(script|foreignObject|iframe|object|embed|use)[^>]*>/gi,"").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/(href\s*=\s*["'])\s*(?!#)[^"']*/gi,"$1#");}
const SV_PACKART=new Set();
function svRegisterArt(){for(const k in SURV_PACKS){const a=SURV_PACKS[k].art||{};for(const n in a)if(!SV_ART[n]||SV_PACKART.has(n)){const v=svSafeSvg(a[n]);SV_ART[n]=()=>v;SV_PACKART.add(n);}}}
function svShelf(g){if(g.shelf)return g.shelf;const P=g.pk&&(SURV_PACKS[g.pk]||SURV_OFFER.find(p=>p.id===g.pk));return (P&&P.shelf)||SV_CAT2SHELF[g.cat]||"know";}
function svPackOf(id){return SURV_OFFER.find(p=>(p.guides||[]).some(x=>x.id===id));}
// keep downloaded packs up to date (at most twice a day, only when online); a pack only changes when its "v" goes up
async function svRefresh(force){if(isOffline())return;if(!force&&typeof bgOk==="function"&&!bgOk())return;let last=0;try{last=+localStorage.getItem("pt-surv-chk")||0;}catch(e){}
  if(!force&&Date.now()-last<12*3600e3)return;try{localStorage.setItem("pt-surv-chk",String(Date.now()));}catch(e){}
  try{const url=SURV_URL+"index.json?t="+Math.floor(Date.now()/3600e3);
    const txt=window.AndroidNet&&typeof netGet==="function"?await netGet(url,15000):await (await fetch(url)).text();
    const j=JSON.parse(txt);if(!j||!Array.isArray(j.packs)||!j.packs.length)return;SURV_OFFER=j.packs;localStorage.setItem("pt-surv-idx",JSON.stringify(j));
    for(const p of j.packs){const have=SURV_PACKS[p.id];if(have&&(have.v||0)<(p.v||0))await svDownload(p.id,true);}
    if(document.getElementById("survBox")&&document.getElementById("survBox").offsetParent)renderSurv();}catch(e){}}
let svBusy="",svQ="",svBeat=null;const SV_OPEN=new Set();
function svAll(){const a=SURV_BASE.map(g=>({...g,pk:""}));for(const k in SURV_PACKS)(SURV_PACKS[k].guides||[]).forEach(g=>a.push({...g,pk:k}));return a;}
function svCC(){try{return (typeof appMode==="function"&&appMode()==="home")?"nl":(document.documentElement.dataset.country||"it");}catch(e){return "it";}}
function svPackRow(p){const have=!!SURV_PACKS[p.id];return `<div class="sv-pack"><span class="e">${p.ic}</span><div><b>${svEsc(p.name)}</b><small>${svEsc(p.desc)}<br>${p.n} guides · ${Math.max(1,Math.round(p.size/1024))} KB${have?" · on this phone":""}</small></div>
   ${svBusy===p.id?`<button disabled>…</button>`:have?`<button class="rm" data-svrm="${p.id}">Remove</button>`:`<button data-svdl="${p.id}">Download</button>`}</div>`;}
function svCard(g,wide){const pic=wide?"":svHeroArt(g).replace('class="sv-art hero"','class="sv-art still"');return `<button class="sv-g${wide?" wide":""}" style="--sc:${SURV_COL[g.cat]||"#455a64"}" data-sv="${g.id}">${pic||`<span class="e">${g.ic}</span>`}<span><b>${svEsc(g.t)}</b>${g.w?`<small>${svEsc(g.w)}</small>`:""}</span></button>`;}
function renderSurv(){const box=document.getElementById("survBox");if(!box)return;
  const ll=(typeof me!=="undefined"&&me)?me.lat.toFixed(5)+", "+me.lon.toFixed(5):"";
  const nums=(SURV_NUMS[svCC()]||[]).map(([n,l])=>`<a href="tel:${n.replace(/-/g,"")}">${l} ${n}</a>`).join("");
  let h=`${svMascotSvg("wave","sv-mascot")}<h2 class="sv-title">Survival guides</h2><p class="sv-lead">Handy know-how for outdoors, travel and when things go wrong. Everything works without internet.</p>
   <input class="sv-search" id="svSearch" type="search" placeholder="Search: north, knots, bleeding, jellyfish…" value="${svEsc(svQ)}">
   <div class="sv-call"><div><b>Emergency? Call 112</b><small>Free from any phone in Europe.</small></div><a class="big" href="tel:112" aria-label="Call 112">112</a>
   <div class="sv-where"><span>Your location<br><code>${ll||"Waiting for GPS…"}</code></span>${ll?`<button id="svCopy">Copy</button>`:""}</div>${nums?`<div class="sv-nums">${nums}</div>`:""}</div>`;
  svRegisterArt();const all=svAll();
  if(!svQ.trim())h+=`<div class="sv-h">🧰 Tools</div>${tlTiles()}`;
  if(svQ.trim()){const q=svQ.trim().toLowerCase();const r=all.filter(g=>(g.t+" "+g.w+" "+g.s.join(" ")).toLowerCase().includes(q));
    const tq=tlAvail().filter(x=>(x.t+" "+x.w).toLowerCase().includes(q));if(tq.length)h+=`<div class="sv-h">🧰 Tools</div><div class="tl-grid">${tq.map(x=>`<button class="tl-tile" data-tool="${x.id}"><span>${x.ic}</span><b>${x.t}</b></button>`).join("")}</div>`;
    // also guides in packs that aren't on the phone yet (titles come from the catalog)
    const more=[];for(const p of SURV_OFFER)if(!SURV_PACKS[p.id])for(const x of p.guides||[])if((x.t+" "+(x.w||"")+" "+(x.k||"")).toLowerCase().includes(q))more.push([p,x]);
    h+=`<div class="sv-h">${r.length+more.length?(r.length+more.length)+" found":"Nothing found"}</div><div class="sv-grid">${r.map(g=>svCard(g,true)).join("")}</div>`;
    if(more.length){const ps=[...new Set(more.map(m=>m[0]))];h+=`<div class="sv-h">In packs you can download</div>`+ps.map(p=>`<div class="sv-more">${more.filter(m=>m[0]===p).map(m=>`<span>${svEsc(m[1].t)}</span>`).join("")}</div>${svPackRow(p)}`).join("");}}
  else{for(const [id,name,ic] of SV_SHELVES){const gs=all.filter(g=>svShelf(g)===id),todo=SURV_OFFER.filter(p=>p.shelf===id&&!SURV_PACKS[p.id]);
      if(!gs.length&&!todo.length)continue;
      const open=SV_OPEN.has(id)||gs.length<=6,shown=open?gs:gs.slice(0,4);
      h+=`<div class="sv-h">${ic} ${svEsc(name)}</div>${gs.length?`<div class="sv-grid">${shown.map(g=>svCard(g)).join("")}</div>`:""}${open?"":`<button class="sv-moreb" data-svshelf="${id}">Show all ${gs.length}</button>`}${todo.map(p=>svPackRow(p)).join("")}`;}}
  h+=`<details class="sv-all"><summary>All packs (${Object.keys(SURV_PACKS).length} of ${SURV_OFFER.length} on this phone)</summary>${SURV_OFFER.map(svPackRow).join("")}</details>`;
  h+=`<p class="sv-note">Everything here works without internet: the basics are built in, and packs stay on your phone after downloading. The first-aid guides are a reminder, not a replacement for a first-aid course. Always follow what the 112 operator tells you.</p>`;
  box.innerHTML=h;
  const s=document.getElementById("svSearch");s.oninput=()=>{svQ=s.value;const p=s.selectionStart;renderSurv();const n=document.getElementById("svSearch");n.focus();try{n.setSelectionRange(p,p);}catch(e){}};}
async function svDownload(id,quiet){if(isOffline()){if(!quiet)alert("Downloading a pack needs internet. The basics work offline already.");return;}
  svBusy=id;if(!quiet)renderSurv();
  try{const url=SURV_URL+"pack-"+id+".json?t="+Math.floor(Date.now()/3600e3);
    const txt=window.AndroidNet&&typeof netGet==="function"?await netGet(url,15000):await (await fetch(url)).text();
    const j=JSON.parse(txt);if(!j||!Array.isArray(j.guides))throw new Error("bad pack");
    SURV_PACKS[id]=j;localStorage.setItem("pt-surv",JSON.stringify(SURV_PACKS));}
  catch(e){if(!quiet)alert("Couldn't download the pack: "+(e.message||e)+". Try again with a better connection.");}
  svBusy="";if(!quiet)renderSurv();}
function svRemove(id){delete SURV_PACKS[id];try{localStorage.setItem("pt-surv",JSON.stringify(SURV_PACKS));}catch(e){}renderSurv();}
function svStopBeat(){if(svBeat){clearInterval(svBeat.t);try{svBeat.ac&&svBeat.ac.close();}catch(e){}svBeat=null;}}
function svToggleBeat(){const b=document.getElementById("svBeatBtn"),d=document.getElementById("svDot");
  if(svBeat){svStopBeat();if(b)b.textContent="Start beat";return;}
  let ac=null;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}
  const tick=()=>{if(d){d.classList.add("p");setTimeout(()=>d.classList.remove("p"),90);}
    if(ac){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;g.gain.value=.25;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.05);}
    try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}};
  svBeat={ac,t:setInterval(tick,545)};tick();if(b)b.textContent="Stop";}
/* ---------- TOOLS: the phone as a survival kit ----------
   Designed like instruments: a dark face with one accent colour per tool, thin numerals, fine ticks.
   Each tool only switches its sensor on while it's on screen, and off again when you leave it. */
const TL_ICONS={
 compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2.2 5-4.8 2 2.2-5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
 where:'<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
 torch:'<path d="M8 3h8l-1.5 5h-5zM9.5 8h5v11.5a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M12 12.5v2"/>',
 thunder:'<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
 baro:'<path d="M4.5 16a8 8 0 1 1 15 0"/><path d="M12 16l3.5-5.5"/><circle cx="12" cy="16" r="1.2"/><path d="M4 19.5h16"/>',
 pace:'<path d="M8.5 3.5c1.6 0 2.5 1.6 2.5 3.6s-1 4.4-2.6 4.4S6 9.7 6 7.4 6.9 3.5 8.5 3.5zM15.5 9.5c1.6 0 2.5 1.6 2.5 3.6s-1 4.4-2.6 4.4-2.4-1.8-2.4-4.1.9-3.9 2.5-3.9z"/><path d="M7.4 14.5l1.8.3-.3 2.4-1.8-.3zM14.4 20.5l1.8.3"/>',
 level:'<rect x="2.5" y="8.5" width="19" height="7" rx="3.5"/><rect x="9.5" y="10.3" width="5" height="3.4" rx="1.7"/><path d="M8 8.5v7M16 8.5v7"/>',
 timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M18.5 6l1.3-1.3"/>',
 card:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 8.5v7M8.5 12h7"/>',
 phrases:'<path d="M4 5.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3.5V14.5H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/><path d="M18.5 9.5H20a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2h-1v2.5l-3-2.5h-3.5"/>',
 saver:'<rect x="3" y="7" width="16" height="10" rx="2.5"/><path d="M21.5 10.5v3"/><path d="M11.5 9l-2.5 3.5h3.5L10 16"/>',
 supplies:'<path d="M4.5 8.5h15l-1.3 10.6a1.8 1.8 0 0 1-1.8 1.4H7.6a1.8 1.8 0 0 1-1.8-1.4z"/><path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5M9.5 13.5l2 2 3.5-3.5"/>',
};
const tlIcon=(id,size)=>`<svg viewBox="0 0 24 24" width="${size||24}" height="${size||24}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TL_ICONS[id]||""}</svg>`;
const TOOLS=[
 {id:"compass",c:"#e4572e",t:"Compass",w:"Live direction, and keep a bearing"},
 {id:"sun",c:"#f0a828",t:"Sun & daylight",w:"Where the sun is, sunset, daylight left"},
 {id:"where",c:"#3d8fd6",t:"Where am I",w:"Coordinates to read out to 112"},
 {id:"supplies",c:"#b0864c",t:"Supplies & shopping lists",w:"Emergency food for your household, and your own lists"},
 {id:"torch",c:"#e8b923",t:"Torch & SOS",w:"Light, or flash SOS in Morse"},
 {id:"thunder",c:"#7d6be0",t:"Thunder counter",w:"How far away is the storm?"},
 {id:"baro",c:"#2ea597",t:"Barometer",w:"Pressure trend and bad-weather warning",need:()=>tlTry(t=>t.hasPressure(),false)},
 {id:"pace",c:"#5aa95a",t:"Pace counter",w:"Steps and distance walked"},
 {id:"level",c:"#8bb83c",t:"Spirit level",w:"Is it flat?"},
 {id:"timer",c:"#e0703f",t:"Timers",w:"Boiling water, cooling a burn, a nosebleed…"},
 {id:"card",c:"#d6404a",t:"Emergency card",w:"Your medical info for rescuers"},
 {id:"phrases",c:"#4f7fe0",t:"Phrasebook",w:"Italian and Dutch for emergencies"},
 {id:"saver",c:"#33a873",t:"Battery saver",w:"Make the battery last longer"},
];
// which guides open which tool
const SV_TOOLS_FOR={north:["compass","sun"],compass:["compass"],papermap:["compass"],nophone:["compass","sun"],lost:["where","compass"],daylight:["sun"],dark:["sun","torch"],
  thunder:["thunder"],storm:["thunder","baro"],clouds:["baro"],wind:["baro"],morse:["torch"],signal:["torch","where"],call:["where"],distance:["pace"],
  burns:["timer"],nosebleed:["timer"],water:["timer","supplies"],filter:["timer"],rinseeye:["timer"],shelter:["level"],tautline:["level"],longout:["supplies","saver","torch"],
  nonet:["saver","where"],contactplan:["card"],zgobag:["supplies","card"],kit:["supplies","card"],doctor:["phrases","card"],medical:["phrases","card"],allergy:["card"],
  dike:["supplies"],evac:["supplies"],zday0:["supplies"],storing:["supplies"]};
function tlAvail(){return TOOLS.filter(x=>!x.need||x.need());}
const tlTile=x=>`<button class="tl-tile" data-tool="${x.id}" style="--tc:var(--skin-tc,${x.c})"><span class="tl-ico">${tlIcon(x.id)}</span><b>${x.t}</b></button>`;
function tlTiles(){return `<div class="tl-grid">${tlAvail().map(tlTile).join("")}</div>`;}
function tlLinks(gid){const ids=(SV_TOOLS_FOR[gid]||[]).filter(id=>tlAvail().some(x=>x.id===id));
  return ids.length?`<div class="tl-links">${ids.map(id=>{const x=TOOLS.find(t=>t.id===id);return `<button data-tool="${id}" style="--tc:var(--skin-tc,${x.c})">${tlIcon(id,18)} ${x.t}</button>`;}).join("")}</div>`:"";}
const tap=()=>{try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}};

let TOOL=null;   // {id, stops[]}
function openTool(id){const x=TOOLS.find(t=>t.id===id);if(!x)return;closeTool();
  const ov=document.createElement("div");ov.className="sv-ov tl-ov";ov.id="tlOv";ov.style.setProperty("--tc","var(--skin-tc,"+x.c+")");
  ov.innerHTML=`<div class="sv-top"><button data-tlclose>‹ Back</button></div><div class="tl-head"><span class="tl-ico big">${tlIcon(id,30)}</span><div><h2>${x.t}</h2><p>${x.w}</p></div></div><div class="tl-body" id="tlBody"></div>`;
  document.body.appendChild(ov);history.pushState&&history.pushState({tl:1},"");
  TOOL={id,stops:[]};try{TL_RUN[id](document.getElementById("tlBody"),TOOL);}catch(e){document.getElementById("tlBody").innerHTML=`<p class="sv-note">This tool couldn't start: ${svEsc(e.message||String(e))}</p>`;}}
function closeTool(){if(TOOL){for(const f of TOOL.stops)try{f();}catch(e){}TOOL=null;}const o=document.getElementById("tlOv");if(o)o.remove();headSync();}
function tlStop(T,f){T.stops.push(f);}
function tlEvery(T,ms,f){const i=setInterval(()=>{if(!document.hidden)f();},ms);tlStop(T,()=>clearInterval(i));f();}

/* compass heading from the phone (native sensor in the app, the browser's otherwise) */
function tlHeading(T,cb){let got=false;TL_HEAD=d=>{got=true;cb(d);};headSync();
  const web=e=>{let d=null;if(e.webkitCompassHeading!=null)d=e.webkitCompassHeading;else if(e.absolute&&e.alpha!=null)d=(360-e.alpha)%360;if(d!=null){got=true;cb(d);}};
  if(!window.AndroidGPS){addEventListener("deviceorientationabsolute",web);addEventListener("deviceorientation",web);}
  tlStop(T,()=>{TL_HEAD=null;removeEventListener("deviceorientationabsolute",web);removeEventListener("deviceorientation",web);});
  return ()=>got;}
/* Turns a dial smoothly to a heading, always the short way round: it keeps counting past 360 instead of
   jumping back to 0 (that jump was the "full spin"). */
function tlSpinner(T,apply){let target=null,shown=null,raf=0;
  const step=()=>{const d=((target-shown)%360+540)%360-180;shown+=d*0.2;apply(shown);raf=Math.abs(d)>0.15?requestAnimationFrame(step):0;};
  tlStop(T,()=>cancelAnimationFrame(raf));
  return d=>{target=d;if(shown==null){shown=d;apply(d);return;}if(!raf)raf=requestAnimationFrame(step);};}
const CARD16=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],CARD8=["north","north-east","east","south-east","south","south-west","west","north-west"];
const norm=d=>((d%360)+360)%360,cardOf=d=>CARD16[Math.round(norm(d)/22.5)%16],card8=d=>CARD8[Math.round(norm(d)/45)%8];
function dialSvg(extra){let t="";for(let i=0;i<120;i++){const a=i*3,major=i%10===0,mid=i%5===0;t+=`<line x1="0" y1="-100" x2="0" y2="${major?-88:mid?-92:-95}" transform="rotate(${a})" stroke="${major?"#f4f1e8":"rgba(244,241,232,.45)"}" stroke-width="${major?1.8:1}"/>`;}
  const L=["N","E","S","W"].map((c,i)=>`<text transform="rotate(${i*90}) translate(0 -70)" text-anchor="middle" font-size="17" font-weight="600" fill="${i?"#f4f1e8":"var(--tc)"}" dy="6">${c}</text>`).join("");
  const n=[30,60,120,150,210,240,300,330].map(a=>`<text transform="rotate(${a}) translate(0 -74)" text-anchor="middle" font-size="9" fill="rgba(244,241,232,.55)" dy="3">${a}</text>`).join("");
  return `<circle r="104" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="6"/>${t}${L}${n}<circle r="52" fill="none" stroke="rgba(255,255,255,.08)"/>${extra||""}`;}

/* ---------- sun position and times (NOAA / suncalc formulas), all offline ---------- */
const SUN=(()=>{const rad=Math.PI/180,J1970=2440588,J2000=2451545,dayMs=864e5,e=rad*23.4397;
  const toJ=d=>d.valueOf()/dayMs-0.5+J1970,fromJ=j=>new Date((j+0.5-J1970)*dayMs),toDays=d=>toJ(d)-J2000;
  const ra=(l,b)=>Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)),dec=(l,b)=>Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
  const M=d=>rad*(357.5291+0.98560028*d),L=m=>{const C=rad*(1.9148*Math.sin(m)+0.02*Math.sin(2*m)+0.0003*Math.sin(3*m));return m+C+rad*102.9372+Math.PI;};
  const sid=(d,lw)=>rad*(280.16+360.9856235*d)-lw;
  function pos(date,lat,lng){const lw=rad*-lng,phi=rad*lat,d=toDays(date),m=M(d),l=L(m),D=dec(l,0),H=sid(d,lw)-ra(l,0);
    const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(D)*Math.cos(phi)),alt=Math.asin(Math.sin(phi)*Math.sin(D)+Math.cos(phi)*Math.cos(D)*Math.cos(H));
    return {az:(az/rad+180+360)%360,alt:alt/rad};}
  function times(date,lat,lng){const lw=rad*-lng,phi=rad*lat,d=toDays(date),n=Math.round(d-0.0009-lw/(2*Math.PI)),ds=0.0009+lw/(2*Math.PI)+n,m=M(ds),l=L(m),D=dec(l,0);
    const Jnoon=J2000+ds+0.0053*Math.sin(m)-0.0069*Math.sin(2*l);
    const at=h=>{const w=Math.acos((Math.sin(h*rad)-Math.sin(phi)*Math.sin(D))/(Math.cos(phi)*Math.cos(D)));if(isNaN(w))return null;const a=0.0009+(w+lw)/(2*Math.PI)+n,Jset=J2000+a+0.0053*Math.sin(m)-0.0069*Math.sin(2*l);return [fromJ(Jnoon-(Jset-Jnoon)),fromJ(Jset)];};
    const s=at(-0.833),c=at(-6);return {noon:fromJ(Jnoon),rise:s&&s[0],set:s&&s[1],dawn:c&&c[0],dusk:c&&c[1]};}
  const MOON_NAMES=["New moon","Waxing crescent","First quarter","Waxing gibbous","Full moon","Waning gibbous","Last quarter","Waning crescent"];
  // moon position, light and distance (suncalc formulas)
  function mc(d){const Lm=rad*(218.316+13.176396*d),Mm=rad*(134.963+13.064993*d),F=rad*(93.272+13.229350*d),l=Lm+rad*6.289*Math.sin(Mm),b=rad*5.128*Math.sin(F);return {ra:ra(l,b),dec:dec(l,b),dist:385001-20905*Math.cos(Mm)};}
  function moonPos(date,lat,lng){const lw=rad*-lng,phi=rad*lat,d=toDays(date),c=mc(d),H=sid(d,lw)-c.ra;
    let h=Math.asin(Math.sin(phi)*Math.sin(c.dec)+Math.cos(phi)*Math.cos(c.dec)*Math.cos(H));const hc=h<0?0:h;h+=0.0002967/Math.tan(hc+0.00312536/(hc+0.08901179));
    const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(c.dec)*Math.cos(phi));return {az:(az/rad+180+360)%360,alt:h/rad,dist:c.dist};}
  function moon(date){const d=toDays(date),m=M(d),l=L(m),sra=ra(l,0),sdec=dec(l,0),c=mc(d),sd=149598000;
    const ph=Math.acos(Math.sin(sdec)*Math.sin(c.dec)+Math.cos(sdec)*Math.cos(c.dec)*Math.cos(sra-c.ra)),inc=Math.atan2(sd*Math.sin(ph),c.dist-sd*Math.cos(ph));
    const ang=Math.atan2(Math.cos(sdec)*Math.sin(sra-c.ra),Math.sin(sdec)*Math.cos(c.dec)-Math.cos(sdec)*Math.sin(c.dec)*Math.cos(sra-c.ra));
    const f=(0.5+0.5*inc*(ang<0?-1:1)/Math.PI+1)%1;return {f,lit:(1+Math.cos(inc))/2,dist:c.dist,name:MOON_NAMES[Math.round(f*8)%8]};}
  // moonrise and moonset today (scan the day in 10-minute steps)
  function moonTimes(date,lat,lng){const t0=new Date(date);t0.setHours(0,0,0,0);let rise=null,set=null,prev=moonPos(t0,lat,lng).alt-0.133;
    for(let i=1;i<=144;i++){const t=new Date(+t0+i*6e5),a=moonPos(t,lat,lng).alt-0.133;if(prev<0&&a>=0&&!rise)rise=new Date(+t-6e5*a/(a-prev));if(prev>=0&&a<0&&!set)set=new Date(+t-6e5*a/(a-prev));prev=a;}
    return {rise,set};}
  // the next new / first quarter / full / last quarter moon after a date (hour steps)
  function nextPhase(date,target){let p=moon(date).f;for(let h=1;h<=24*31;h++){const t=new Date(+date+h*36e5),q=moon(t).f;const crossed=target===0?q<p&&p-q>0.5:p<target&&q>=target;if(crossed)return {t,dist:moon(t).dist};p=q;}return null;}
  return {pos,times,moon,moonPos,moonTimes,nextPhase,MOON_NAMES};})();
/* what the moon is doing, in plain words */
const MOON_INFO=[["New moon","🌑","The moon is between the earth and the sun, so you can't see it. The darkest nights of the month: best for stars, worst for walking without a torch."],
  ["Waxing crescent","🌒","A thin sliver in the west just after sunset. It grows a little every evening (the lit side is on the right)."],
  ["First quarter","🌓","Half lit, on the right side. Highest around sunset and sets around midnight: light in the evening, dark after."],
  ["Waxing gibbous","🌔","More than half and growing. Up most of the evening and night."],
  ["Full moon","🌕","Fully lit. Rises around sunset and sets around sunrise: light all night, bright enough to walk on open paths without a torch."],
  ["Waning gibbous","🌖","Shrinking again. Rises later every evening, still bright in the second half of the night."],
  ["Last quarter","🌗","Half lit, on the left side. Rises around midnight, still visible in the morning sky."],
  ["Waning crescent","🌘","A thin sliver in the east just before sunrise, getting thinner until it's new moon again."]];
const MOON_SPECIAL=[["Supermoon","A full moon when the moon is closest to the earth: up to 14% bigger and 30% brighter than the smallest full moon."],
  ["Blue moon","The second full moon in one calendar month. It happens about every 2–3 years (the moon isn't actually blue)."],
  ["Blood moon","A total eclipse of the moon: the earth's shadow covers the full moon and it turns copper-red."],
  ["Harvest moon","The full moon nearest the start of autumn (around 22 September). For several evenings it rises soon after sunset, so there's light after dark."],
  ["Spring tides","Around full and new moon the sea goes higher and lower than usual. Good to know on the coast and the Wadden."]];
function tlWhere(){if(typeof me!=="undefined"&&me&&me.lat)return [me.lat,me.lon,me.acc||50];
  try{const h=JSON.parse(localStorage.getItem("pt-lastll")||"null");if(h&&Date.now()-h[3]<7*864e5)return h;}catch(e){}
  if(typeof NLHOME!=="undefined"&&NLHOME)return [NLHOME.lat,NLHOME.lon,5000];return null;}
function tlNeedGps(){if(typeof gpsOn!=="undefined"&&!gpsOn&&typeof startGPS==="function")try{startGPS();}catch(e){}}
const tlHM=d=>d?d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}):"–";
const tlDur=ms=>{const m=Math.max(0,Math.round(ms/60e3));return m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`;};
const tlDurBig=ms=>{const m=Math.max(0,Math.round(ms/60e3));return m>=60?`${Math.floor(m/60)}<small>h</small> ${String(m%60).padStart(2,"0")}<small>m</small>`:`${m}<small>min</small>`;};

/* ---------- Open Location Code (plus code), the short code 112 operators and maps understand ---------- */
function plusCode(lat,lng){const A="23456789CFGHJMPQRVWX";lat=Math.min(89.999999,Math.max(-90,lat))+90;lng=((lng+180)%360+360)%360;
  let c="",r=20;for(let i=0;i<5;i++){const la=Math.floor(lat/r),lo=Math.floor(lng/r);lat-=la*r;lng-=lo*r;c+=A[la]+A[lo];if(i===3)c+="+";r/=20;}return c;}
function dms(v,p,n){const a=Math.abs(v),d=Math.floor(a),m=Math.floor((a-d)*60),s=((a-d)*60-m)*60;return `${d}°${String(m).padStart(2,"0")}′${s.toFixed(1).padStart(4,"0")}″ ${v>=0?p:n}`;}
const ring=(pct,r,w)=>{const C=2*Math.PI*r;return `<circle r="${r}" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="${w}"/><circle r="${r}" fill="none" stroke="var(--tc)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(C*Math.max(0,Math.min(1,pct))).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90)"/>`;};

const TL_RUN={
 compass(el,T){let target=null;try{target=JSON.parse(localStorage.getItem("pt-bearing")||"null");}catch(e){}
  el.innerHTML=`<div class="tl-face"><svg viewBox="-112 -122 224 236" class="tl-dial"><g id="tlRose">${dialSvg(`<g id="tlSun"></g><g id="tlTgt"></g>`)}</g>
      <path d="M0 -116l7 12h-14z" fill="var(--tc)"/><circle r="3" fill="var(--tc)"/></svg>
     <div class="tl-read"><span class="tl-num" id="tlDeg">–</span><span class="tl-cap" id="tlCard">Hold the phone flat or upright</span></div></div>
   <div class="tl-pill" id="tlCourse"></div>
   <div class="tl-row"><button class="tl-act" id="tlSet">Keep direction</button><button class="tl-act ghost" id="tlClr">Clear</button></div>
   <p class="sv-note">Keep it away from metal, magnets and speakers. If it seems off, move the phone in a figure 8 a few times. The amber dot is the sun.</p>`;
  let cur=null;const rose=el.querySelector("#tlRose");
  const sun=()=>{const w=tlWhere();const g=el.querySelector("#tlSun");if(!w||!g)return;const p=SUN.pos(new Date(),w[0],w[1]);
    g.innerHTML=p.alt>-2?`<g transform="rotate(${p.az.toFixed(1)}) translate(0 -52)"><circle r="6" fill="#f0a828"/><circle r="10" fill="#f0a828" opacity=".2"/></g>`:"";};
  const course=()=>{const c=el.querySelector("#tlCourse"),g=el.querySelector("#tlTgt");
    if(target==null){c.innerHTML=`Point the top of the phone where you want to go, then tap <b>Keep direction</b>.`;c.className="tl-pill";g.innerHTML="";return;}
    g.innerHTML=`<g transform="rotate(${target})"><path d="M0 -104l-6 -10h12z" fill="#4cc38a"/><line x1="0" y1="-86" x2="0" y2="-56" stroke="#4cc38a" stroke-width="2.4" stroke-linecap="round"/></g>`;
    if(cur==null){c.textContent=`Bearing ${Math.round(target)}° ${cardOf(target)}`;return;}
    const diff=((target-cur)%360+540)%360-180,a=Math.abs(diff);
    c.className="tl-pill"+(a<6?" good":"");
    c.innerHTML=a<6?`<b>On course</b> · ${Math.round(target)}° ${cardOf(target)}`:`Turn <b>${diff>0?"right":"left"} ${Math.round(a)}°</b> · bearing ${Math.round(target)}° ${cardOf(target)}`;};
  let lastTxt=-1;
  const spin=tlSpinner(T,v=>{rose.setAttribute("transform",`rotate(${(-v).toFixed(2)})`);const r=Math.round(norm(v));if(r!==lastTxt){lastTxt=r;el.querySelector("#tlDeg").textContent=r+"°";el.querySelector("#tlCard").textContent=card8(r);course();}});
  const got=tlHeading(T,d=>{cur=norm(d);spin(cur);});
  el.querySelector("#tlSet").onclick=()=>{tap();if(cur==null)return toast("Waiting for the compass…");target=Math.round(cur);localStorage.setItem("pt-bearing",JSON.stringify(target));course();toast(`Keeping ${target}° ${cardOf(target)}`);};
  el.querySelector("#tlClr").onclick=()=>{tap();target=null;localStorage.removeItem("pt-bearing");course();};
  sun();course();tlEvery(T,60e3,sun);
  setTimeout(()=>{if(!got()&&document.getElementById("tlDeg"))el.querySelector("#tlCard").textContent="No compass sensor found: use the sun or the stars (see “Finding north”)";},3000);},

 sun(el,T){tlNeedGps();let head=null,open=false;
  const draw=()=>{const w=tlWhere();if(!w){el.innerHTML=`<div class="tl-face"><div class="tl-read"><span class="tl-num sm">Finding you…</span><span class="tl-cap">Works without internet, it only needs GPS</span></div></div>`;return;}
    const now=new Date(),p=SUN.pos(now,w[0],w[1]),t=SUN.times(now,w[0],w[1]),tm=SUN.times(new Date(+now+864e5),w[0],w[1]),mo=SUN.moon(now),mp=SUN.moonPos(now,w[0],w[1]),mt=SUN.moonTimes(now,w[0],w[1]);
    let big,sub;
    if(!t.rise){big=p.alt>0?"Sun all day":"No sunrise";sub="";}
    else if(now<t.dawn){big="Night";sub=`First light ${tlHM(t.dawn)} · sunrise ${tlHM(t.rise)}`;}
    else if(now<t.rise){big=tlDurBig(t.rise-now);sub=`until sunrise at ${tlHM(t.rise)}`;}
    else if(now<t.set){big=tlDurBig(t.set-now);sub=`of daylight left · sunset ${tlHM(t.set)}`;}
    else if(now<t.dusk){big=tlDurBig(t.dusk-now);sub=`until dark · the sun set at ${tlHM(t.set)}`;}
    else {big="Night";sub=`Sunrise tomorrow ${tlHM(tm.rise)}`;}
    // the day as an arc: sunrise on the left, sunset on the right, the sun where it is now
    let arc="";if(t.rise&&t.set){const f=Math.max(-0.08,Math.min(1.08,(now-t.rise)/(t.set-t.rise))),ang=Math.PI*(1-f),x=Math.cos(ang)*120,y=-Math.sin(ang)*100;
      arc=`<svg viewBox="-140 -118 280 140" class="tl-arc"><path d="M-130 0H130" stroke="rgba(244,241,232,.25)" stroke-width="1"/>
        <path d="M-120 0A120 100 0 0 1 120 0" fill="none" stroke="rgba(244,241,232,.18)" stroke-width="1.5" stroke-dasharray="3 5"/>
        ${f>0&&f<1?`<path d="M-120 0A120 100 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="var(--tc)" stroke-width="2.5" stroke-linecap="round"/>`:""}
        <circle cx="${x.toFixed(1)}" cy="${Math.min(10,y).toFixed(1)}" r="18" fill="var(--tc)" opacity="${f>0&&f<1?.18:.06}"/><circle cx="${x.toFixed(1)}" cy="${Math.min(10,y).toFixed(1)}" r="8" fill="${f>0&&f<1?"var(--tc)":"rgba(244,241,232,.35)"}"/>
        <text x="-120" y="16" text-anchor="middle" font-size="10" fill="rgba(244,241,232,.6)">${tlHM(t.rise)}</text><text x="120" y="16" text-anchor="middle" font-size="10" fill="rgba(244,241,232,.6)">${tlHM(t.set)}</text></svg>`;}
    // the sky seen from above: the edge is the horizon, the middle is straight up. Turns with the phone so it matches what's in front of you.
    const spot=(az,alt)=>{const r=alt>0?100*(1-alt/90):100;const a=az*Math.PI/180;return [(Math.sin(a)*r).toFixed(1),(-Math.cos(a)*r).toFixed(1)];};
    const [sx,sy]=spot(p.az,p.alt),[mx,my]=spot(mp.az,mp.alt),mUp=mp.alt>0,sUp=p.alt>0;
    const lit=mo.f<0.5,k=Math.cos(mo.f*2*Math.PI);  // moon picture: lit part on the right while it grows (seen from the north)
    const moonSvg=(R)=>`<g><circle r="${R}" fill="#3a3f4a"/><path d="M0 ${-R}A${R} ${R} 0 0 ${lit?1:0} 0 ${R}A${(R*Math.abs(k)).toFixed(2)} ${R} 0 0 ${(lit?k<0:k>0)?1:0} 0 ${-R}z" fill="#f4f1e8"/></g>`;
    const sky=`<svg viewBox="-118 -124 236 244" class="tl-dial tl-sky"><g id="tlSkyR">${dialSvg("")}<circle r="66.7" fill="none" stroke="rgba(255,255,255,.06)"/><circle r="33.3" fill="none" stroke="rgba(255,255,255,.06)"/>
        <g transform="translate(${sx} ${sy})" opacity="${sUp?1:.35}"><circle r="15" fill="#f0a828" opacity=".2"/><circle r="8" fill="#f0a828"/></g>
        <g transform="translate(${mx} ${my})" opacity="${mUp?1:.35}"><circle r="13" fill="#f4f1e8" opacity=".12"/><g id="tlMoonG">${moonSvg(8)}</g></g></g>
        <path d="M0 -122l7 12h-14z" fill="var(--tc)"/></svg>`;
    const nf=SUN.nextPhase(now,0.5),nn=SUN.nextPhase(now,0),dd=d=>d?d.t.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})+", ≈ "+tlHM(d.t):"–";
    const sup=nf&&nf.dist<361000;
    el.innerHTML=`<div class="tl-face">${arc}<div class="tl-read"><span class="tl-num">${big}</span><span class="tl-cap">${sub}</span></div></div>
     <div class="tl-face tl-skyface">${sky}<div class="tl-read"><span class="tl-cap" id="tlSkyCap">${head==null?"North is at the top. Edge = horizon, middle = straight up.":"Turns with your phone: hold it flat and face where you look."}</span>
       <span class="tl-skyk"><i style="background:#f0a828"></i>Sun ${sUp?`${card8(p.az)}, ${Math.round(p.alt)}° up`:"below the horizon"} &nbsp; <i style="background:#f4f1e8"></i>Moon ${mUp?`${card8(mp.az)}, ${Math.round(mp.alt)}° up`:"below the horizon"}</span></div></div>
     <div class="tl-list">
      <div><span>First light</span><b>${tlHM(t.dawn)}</b></div><div><span>Sunrise</span><b>${tlHM(t.rise)}</b></div>
      <div><span>Sun highest (due south)</span><b>${tlHM(t.noon)}</b></div><div><span>Sunset</span><b>${tlHM(t.set)}</b></div><div><span>Dark</span><b>${tlHM(t.dusk)}</b></div></div>
     <div class="tl-list">
      <div><span>Moon</span><b><span class="tl-moonic">${moonSvg(9).replace("<g>",'<svg viewBox="-10 -10 20 20" width="18" height="18">').replace(/<\/g>$/,"</svg>")}</span>${mo.name} · ${Math.round(mo.lit*100)}% lit</b></div>
      <div><span>Moonrise</span><b>${mt.rise?tlHM(mt.rise):"not today"}</b></div><div><span>Moonset</span><b>${mt.set?tlHM(mt.set):"not today"}</b></div>
      <div><span>Next full moon</span><b>${dd(nf)}${sup?" · supermoon":""}</b></div><div><span>Next new moon</span><b>${dd(nn)}</b></div></div>
     <details class="tl-moonx"${open?" open":""}><summary>What the moon phases mean ▸</summary>
       ${MOON_INFO.map(([n,e,txt])=>`<div class="tl-mrow${n===mo.name?" now":""}"><span class="e">${e}</span><div><b>${n}${n===mo.name?" · now":""}</b><small>${txt}</small></div></div>`).join("")}
       <div class="tl-sec">Special moons</div>${MOON_SPECIAL.map(([n,txt])=>`<div class="tl-mrow"><div><b>${n}</b><small>${txt}</small></div></div>`).join("")}
       <p class="sv-note">A whole cycle, new moon to new moon, takes 29.5 days. In the southern hemisphere the lit side is the other way round.</p></details>
     <p class="sv-note">Hand trick: hold your arm out with your fingers sideways under the sun. Each finger to the horizon is about 15 minutes of sun left.${w[2]>2000?" Location is approximate, so times can be a few minutes off.":""}</p>`;
    const dt=el.querySelector(".tl-moonx");if(dt)dt.ontoggle=()=>{open=dt.open;};
    if(head!=null){const r=el.querySelector("#tlSkyR");if(r)r.setAttribute("transform",`rotate(${(-head).toFixed(1)})`);}};
  const spin=tlSpinner(T,v=>{head=v;const r=el.querySelector("#tlSkyR");if(r)r.setAttribute("transform",`rotate(${(-v).toFixed(1)})`);const c=el.querySelector("#tlSkyCap");if(c&&!c.dataset.h){c.dataset.h=1;c.textContent="Turns with your phone: hold it flat and face where you look.";}});
  tlHeading(T,d=>spin(norm(d)));
  tlEvery(T,30e3,draw);},

 where(el,T){tlNeedGps();
  const draw=()=>{const w=(typeof me!=="undefined"&&me&&me.lat)?[me.lat,me.lon,me.acc||0]:null;
    if(!w){el.innerHTML=`<div class="tl-face"><div class="tl-read"><span class="tl-num sm">Finding you…</span><span class="tl-cap">Go outside or near a window. GPS works without internet.</span></div></div><div class="tl-row"><a class="tl-act red" href="tel:112">Call 112</a></div>`;return;}
    const pc=plusCode(w[0],w[1]),txt=`My location: ${w[0].toFixed(5)}, ${w[1].toFixed(5)} (plus code ${pc}, accuracy ${Math.round(w[2])} m) https://maps.google.com/?q=${w[0].toFixed(5)},${w[1].toFixed(5)}`;
    const q=Math.max(0,Math.min(1,1-(w[2]-5)/95));
    el.innerHTML=`<div class="tl-face left"><span class="tl-cap">Latitude</span><span class="tl-coord">${w[0].toFixed(5)}</span><span class="tl-cap">Longitude</span><span class="tl-coord">${w[1].toFixed(5)}</span>
      <div class="tl-facerow"><div><span class="tl-cap">Plus code</span><b class="tl-mono">${pc}</b></div><div><span class="tl-cap">Degrees</span><b class="tl-mono sm">${dms(w[0],"N","S")}<br>${dms(w[1],"E","W")}</b></div></div>
      <div class="tl-acc"><i style="width:${(q*100).toFixed(0)}%"></i></div><span class="tl-cap">Accurate to about ${Math.round(w[2])} m${w[2]>100?" · wait a moment outside for a better fix":""}${typeof hereTown!=="undefined"&&hereTown?` · near ${svEsc(hereTown)}`:""}</span></div>
     <div class="tl-row"><a class="tl-act red" href="tel:112">Call 112</a><a class="tl-act" href="sms:?body=${encodeURIComponent(txt)}">Text my location</a></div>
     <p class="sv-note">On the phone with 112, read the two numbers slowly, digit by digit. 112 calls in Europe usually also send your location automatically.</p>`;};
  tlEvery(T,4000,draw);},

 torch(el,T){const has=tlTry(t=>t.hasTorch(),false);let mode="off",tmr=null;
  const set=on=>{if(has)tlTry(t=>t.torch(on));const s=el.querySelector("#tlScreen");if(s)s.classList.toggle("on",on&&!has);const b=el.querySelector(".tl-power");if(b)b.classList.toggle("lit",on);};
  const stop=()=>{clearTimeout(tmr);tmr=null;set(false);mode="off";paint();};
  const U=220,seq=[];for(const L of ["...","---","..."]){for(const c of L)seq.push([true,c==="."?U:3*U],[false,U]);seq[seq.length-1][1]=3*U;}seq[seq.length-1][1]=7*U;
  const sos=()=>{let i=0;const step=()=>{if(mode!=="sos")return;const [on,ms]=seq[i++%seq.length];set(on);tmr=setTimeout(step,ms);};step();};
  const paint=()=>{el.querySelector("#tlOn").classList.toggle("on",mode==="on");el.querySelector("#tlSos").classList.toggle("on",mode==="sos");
    el.querySelector("#tlState").textContent=mode==="on"?"On":mode==="sos"?"SOS":"Off";el.querySelector("#tlStateSub").textContent=mode==="sos"?"· · ·  — — —  · · ·":has?"Camera light":"Screen light (no camera light found)";};
  el.innerHTML=`<div class="tl-screen" id="tlScreen"></div>
   <div class="tl-face"><button class="tl-power" id="tlOn" aria-label="Torch on or off">${tlIcon("torch",44)}</button>
    <div class="tl-read"><span class="tl-num" id="tlState">Off</span><span class="tl-cap" id="tlStateSub"></span></div></div>
   <div class="tl-row"><button class="tl-act red" id="tlSos">Flash SOS</button></div>
   <p class="sv-note">SOS is three short, three long, three short. Point it at a rescuer, a boat, a helicopter or a window. The light goes off when you leave this screen.</p>`;
  el.querySelector("#tlOn").onclick=()=>{tap();if(mode==="on")return stop();stop();mode="on";set(true);paint();};
  el.querySelector("#tlSos").onclick=()=>{tap();if(mode==="sos")return stop();stop();mode="sos";sos();paint();};
  paint();tlStop(T,stop);},

 thunder(el,T){let t0=null,hist=[],raf=0;
  const ui=()=>{const r=hist[0];
   el.innerHTML=`<div class="tl-face"><button class="tl-power ${t0?"lit":""}" id="tlTap">${t0?"Thunder":"Flash"}</button>
     <div class="tl-read"><span class="tl-num" id="tlT">${t0?"0.0<small>s</small>":r?`${r.km.toFixed(1)}<small>km</small>`:"Ready"}</span>
     <span class="tl-cap">${t0?"Counting… tap when you hear the thunder":r?(r.s<30?"Close: get inside a building or a car now":"Further than 10 km, keep an eye on it"):"Tap when you see the lightning"}</span></div></div>
    ${hist.length>1?`<div class="tl-pill${hist[0].km<hist[1].km-0.3?" warn":""}">${hist[0].km<hist[1].km-0.3?"<b>Coming closer</b>":hist[0].km>hist[1].km+0.3?"Moving away":"About the same distance"} · ${hist.slice(0,4).map(h=>h.km.toFixed(1)+" km").join(" · ")}</div>`:""}
    <p class="sv-note">Sound travels about 1 km in 3 seconds. Under 30 seconds (10 km) you're in reach of lightning: go inside, and wait 30 minutes after the last thunder.</p>`;
   el.querySelector("#tlTap").onclick=()=>{tap();if(!t0){t0=performance.now();ui();tick();}else{const s=(performance.now()-t0)/1000;t0=null;cancelAnimationFrame(raf);hist.unshift({s,km:s*0.343});ui();}};};
  const tick=()=>{const e=el.querySelector("#tlT");if(!t0||!e)return;e.innerHTML=((performance.now()-t0)/1000).toFixed(1)+"<small>s</small>";raf=requestAnimationFrame(tick);};
  ui();tlStop(T,()=>cancelAnimationFrame(raf));},

 baro(el,T){let watch=tlTry(t=>t.baroWatching(),false);
  const draw=()=>{const now=tlTry(t=>t.pressure(),-1);let log=[];try{log=JSON.parse(tlTry(t=>t.baroLog(),"[]"));}catch(e){}
    const ago=h=>{let b=null;for(const x of log){if(Math.abs(Date.now()-x[0]-h*3600e3)<40*60e3)b=x[1];}return b;};
    const p3=ago(3),d=now>0&&p3?now-p3:null;
    const trend=d==null?["Learning","After 3 hours of readings the app can tell the trend. Leave the warning on."]:d<=-3?["Falling fast","Wind and rain likely within hours."]:d<=-1?["Falling","Weather may get worse."]:d>=3?["Rising fast","Clearing up, often windy at first."]:d>=1?["Rising","Weather getting better."]:["Steady","No big change coming."];
    const a=now>0?Math.max(-120,Math.min(120,(now-1013)/40*120)):-120;   // 973–1053 hPa across the gauge
    let ticks="";for(let i=0;i<=16;i++){const r=-120+i*15;ticks+=`<line x1="0" y1="-100" x2="0" y2="${i%4===0?-88:-94}" transform="rotate(${r})" stroke="${i%4===0?"#f4f1e8":"rgba(244,241,232,.4)"}" stroke-width="${i%4===0?1.8:1}"/>`;}
    const lbl=[[-120,"973"],[-60,"993"],[0,"1013"],[60,"1033"],[120,"1053"]].map(([r,t])=>`<text transform="rotate(${r}) translate(0 -74) rotate(${-r})" text-anchor="middle" font-size="9" fill="rgba(244,241,232,.55)" dy="3">${t}</text>`).join("");
    const pts=log.filter(x=>Date.now()-x[0]<24*3600e3);let spark="";
    if(pts.length>2){const lo=Math.min(...pts.map(x=>x[1]))-0.5,hi=Math.max(...pts.map(x=>x[1]))+0.5,t0=Date.now()-24*3600e3;
      spark=`<svg viewBox="0 0 300 60" class="tl-spark"><polyline fill="none" stroke="var(--tc)" stroke-width="2" stroke-linejoin="round" points="${pts.map(x=>`${((x[0]-t0)/864e5*300).toFixed(1)},${(55-(x[1]-lo)/(hi-lo)*50).toFixed(1)}`).join(" ")}"/></svg><span class="tl-cap">Last 24 hours · ${lo.toFixed(0)}–${hi.toFixed(0)} hPa</span>`;}
    el.innerHTML=`<div class="tl-face"><svg viewBox="-110 -112 220 150" class="tl-gauge"><path d="M-86.6 50A100 100 0 1 1 86.6 50" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="6"/>${ticks}${lbl}
       <g transform="rotate(${a.toFixed(1)})"><path d="M-3 0L0 -84L3 0z" fill="var(--tc)"/></g><circle r="6" fill="var(--tc)"/></svg>
      <div class="tl-read"><span class="tl-num">${now>0?now.toFixed(1)+"<small>hPa</small>":"–"}</span><span class="tl-cap">${trend[0]}${d!=null?` · ${d>0?"+":""}${d.toFixed(1)} hPa in 3 h`:""}</span></div>${spark}</div>
     <div class="tl-pill${d!=null&&d<=-3?" warn":""}">${trend[1]}</div>
     <label class="tl-switch"><span>Warn me when pressure falls fast</span><input type="checkbox" id="tlW" ${watch?"checked":""}><i></i></label>
     <p class="sv-note">The warning reads the sensor about every 30 minutes, only when the phone is awake anyway, so it uses almost no battery. Going up or down a hill also changes the pressure (about 1 hPa per 8 m).</p>`;
    el.querySelector("#tlW").onchange=e=>{tap();watch=e.target.checked;tlTry(t=>t.baroWatch(watch));toast(watch?"Pressure warning on":"Pressure warning off");};};
  tlEvery(T,5*60e3,draw);},

 pace(el,T){const nat=tlTry(t=>t.hasSteps(),false);let st={};try{st=JSON.parse(localStorage.getItem("pt-pace")||"{}");}catch(e){}st.stride=st.stride||75;
  const save=()=>localStorage.setItem("pt-pace",JSON.stringify(st));let acc=null;
  const read=()=>nat&&tlTry(t=>t.stepsAllowed(),false)?tlTry(t=>t.steps(),-1):-1;
  const draw=()=>{let n=0;if(st.on){if(nat&&st.base!=null){const v=read();if(v>=0)n=Math.max(0,v-st.base);}else n=st.js||0;}
    const m=n*st.stride/100,el2=st.on?Date.now()-st.t:0;
    el.innerHTML=`<div class="tl-face"><svg viewBox="-110 -110 220 220" class="tl-dial sm">${ring((m%1000)/1000,92,8)}</svg>
      <div class="tl-read over"><span class="tl-num">${st.on?(m>=1000?(m/1000).toFixed(2)+"<small>km</small>":Math.round(m)+"<small>m</small>"):"0<small>m</small>"}</span>
      <span class="tl-cap">${st.on?`${n} steps · ${tlDur(el2)}${el2>60e3&&m>20?` · ${(m/1000/(el2/3600e3)).toFixed(1)} km/h`:""}`:"Tap start, then walk"}</span></div></div>
     <div class="tl-row"><button class="tl-act" id="tlGo">${st.on?"Start again":"Start"}</button>${st.on?`<button class="tl-act ghost" id="tlEnd">Stop</button>`:""}</div>
     <label class="tl-switch"><span>Step length</span><span class="tl-stepper"><input type="number" id="tlStride" value="${st.stride}" min="40" max="120"> cm</span></label>
     <p class="sv-note">${nat?"Uses the phone's step counter: it keeps counting with the screen off and uses almost no battery.":"Keep this screen open while walking (this phone has no separate step counter)."} To find your step length: walk 10 steps, measure, divide by 10. The ring fills every kilometre.</p>`;
    el.querySelector("#tlGo").onclick=()=>{tap();if(nat&&!tlTry(t=>t.stepsAllowed(),true)){tlTry(t=>t.askSteps());window.onStepsPerm=ok=>{if(ok)el.querySelector("#tlGo").click();else toast("Without that permission the screen has to stay open");};return;}
      st={on:true,t:Date.now(),stride:st.stride,base:nat?read():null,js:0};if(nat&&st.base<0){st.base=null;}save();draw();};
    const e=el.querySelector("#tlEnd");if(e)e.onclick=()=>{tap();st.on=false;save();draw();};
    el.querySelector("#tlStride").onchange=e=>{st.stride=Math.max(40,Math.min(120,+e.target.value||75));save();draw();};};
  if(!nat){let last=0,hi=false;acc=e=>{const a=e.accelerationIncludingGravity;if(!a||!st.on)return;const g=Math.hypot(a.x||0,a.y||0,a.z||0);
      if(!hi&&g>11.5&&performance.now()-last>300){hi=true;last=performance.now();st.js=(st.js||0)+1;}else if(hi&&g<10)hi=false;};
    addEventListener("devicemotion",acc);tlStop(T,()=>{removeEventListener("devicemotion",acc);save();});}
  tlEvery(T,3000,()=>{if(!typing())draw();});},

 level(el,T){let ticks="";for(let i=0;i<72;i++)ticks+=`<line x1="0" y1="-96" x2="0" y2="${i%9===0?-86:-91}" transform="rotate(${i*5})" stroke="rgba(244,241,232,${i%9===0?.6:.25})" stroke-width="1"/>`;
  el.innerHTML=`<div class="tl-face"><svg viewBox="-104 -104 208 208" class="tl-dial">${ticks}<circle r="30" fill="none" stroke="rgba(244,241,232,.35)" stroke-width="1.2"/><circle r="6" fill="none" stroke="rgba(244,241,232,.5)"/>
     <line x1="-96" y1="0" x2="96" y2="0" stroke="rgba(244,241,232,.12)"/><line x1="0" y1="-96" x2="0" y2="96" stroke="rgba(244,241,232,.12)"/>
     <g id="tlBub"><circle r="22" fill="var(--tc)" opacity=".18"/><circle r="15" fill="var(--tc)"/><circle cx="-5" cy="-5" r="4" fill="#fff" opacity=".45"/></g></svg>
    <div class="tl-read"><span class="tl-num" id="tlLv">–</span><span class="tl-cap">Lay the phone on the surface</span></div></div>`;
  let got=false,x=0,y=0,raf=0;const f=e=>{if(e.beta==null)return;got=true;const b=e.beta,g=e.gamma;x=Math.max(-74,Math.min(74,-g*4));y=Math.max(-74,Math.min(74,-b*4));
    if(!raf)raf=requestAnimationFrame(()=>{raf=0;const bub=el.querySelector("#tlBub");if(!bub)return;bub.setAttribute("transform",`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      const t=Math.hypot(b,g);el.querySelector("#tlLv").innerHTML=t<1?"Level":`${t.toFixed(1)}<small>°</small>`;el.querySelector(".tl-face").classList.toggle("ok",t<1);});};
  addEventListener("deviceorientation",f);tlStop(T,()=>{removeEventListener("deviceorientation",f);cancelAnimationFrame(raf);});
  setTimeout(()=>{if(!got&&el.querySelector("#tlLv"))el.querySelector("#tlLv").textContent="No tilt sensor";},2500);},

 timer(el,T){const P=[["Boil drinking water",1,"Rolling boil for 1 minute (3 minutes above 2,000 m)."],["Cool a burn",20,"Under cool running water."],["Nosebleed",10,"Lean forward, pinch the soft part of the nose."],["Rinse an eye",15,"Keep rinsing with clean water."],["Press on a wound",10,"Firm, steady pressure."],["Pasta or rice",10,""]];
  let L=[];try{L=JSON.parse(localStorage.getItem("pt-timers")||"[]");}catch(e){}
  const save=()=>localStorage.setItem("pt-timers",JSON.stringify(L));
  const add=(t,min,tip)=>{tap();const end=Date.now()+min*60e3,id="tm"+Date.now();L.push({id,t,end,tip,len:min*60e3});save();
    try{window.AndroidNotify&&window.AndroidNotify.schedule(id,end,`⏱️ ${t}: time's up`,tip||"Your timer has finished.");}catch(e){}draw();};
  const fmt=r=>`${Math.floor(r/60e3)}:${String(Math.floor(r%60e3/1000)).padStart(2,"0")}`;
  const draw=()=>{const now=Date.now();L=L.filter(x=>now-x.end<10*60e3);
    el.innerHTML=`${L.length?`<div class="tl-timers">${L.map(x=>{const r=x.end-now,len=x.len||Math.max(r,1);return `<div class="tl-face tl-tm ${r<=0?"done":""}"><svg viewBox="-30 -30 60 60" class="tl-mini">${ring(r>0?r/len:1,24,5)}</svg>
        <div><b>${svEsc(x.t)}</b><small>${svEsc(x.tip||"")}</small></div><div class="tl-left">${r>0?fmt(r):"Done"}</div><button data-tmx="${x.id}" aria-label="Stop timer">✕</button></div>`;}).join("")}</div>`:""}
     <div class="tl-presets">${P.map((p,i)=>`<button data-tmp="${i}"><b>${p[1]}<small>min</small></b><span>${p[0]}</span></button>`).join("")}</div>
     <div class="tl-row"><input type="number" class="tl-in" id="tlMin" min="1" max="600" placeholder="Minutes"><button class="tl-act" id="tlAdd">Start</button></div>
     <p class="sv-note">You get a notification when time is up, also with the screen off or another app open.</p>`;
    el.querySelectorAll("[data-tmp]").forEach(b=>b.onclick=()=>{const p=P[+b.dataset.tmp];add(p[0],p[1],p[2]);});
    el.querySelectorAll("[data-tmx]").forEach(b=>b.onclick=()=>{tap();L=L.filter(x=>x.id!==b.dataset.tmx);save();try{window.AndroidNotify&&window.AndroidNotify.cancelPrefix(b.dataset.tmx);}catch(e){}draw();});
    el.querySelector("#tlAdd").onclick=()=>{const m=+el.querySelector("#tlMin").value;if(!(m>0))return toast("Type the minutes first");add("Timer",m,"");};};
  tlEvery(T,1000,()=>{if(!typing())draw();});},

 card(el,T){let C={};try{C=JSON.parse(localStorage.getItem("pt-card")||"{}");}catch(e){}
  const F=CARD_F;
  const text=()=>F.filter(f=>C[f[0]]&&f[0]!=="name").map(f=>`${f[1]}: ${C[f[0]]}`).join("\n");
  const view=()=>{const has=F.some(f=>C[f[0]]);
    el.innerHTML=has?`<div class="tl-ice"><div class="tl-ice-h"><span>${tlIcon("card",22)}</span><div><small>Emergency information</small><b>${svEsc(C.name||"")}</b></div></div>${F.filter(f=>C[f[0]]&&f[0]!=="name").map(f=>`<div class="tl-ice-r"><small>${f[1]}</small><b>${svEsc(C[f[0]])}</b></div>`).join("")}</div>
      <label class="tl-switch"><span>Lock screen picture<small>The whole card, always readable without tapping</small></span><input type="checkbox" id="tlWall" ${C.wall?"checked":""}><i></i></label><div id="tlWallWhy"></div>
      <div class="tl-row"><button class="tl-act ghost" id="tlWidget">➕ Add as widget</button></div><div id="tlWidgetWhy"></div>
      <label class="tl-switch"><span>Lock screen notification<small>Also as a notification you can unfold</small></span><input type="checkbox" id="tlLock" ${C.lock?"checked":""}><i></i></label><div id="tlLockWhy"></div>
      <div class="tl-row"><button class="tl-act ghost" id="tlEdit">Edit</button></div>
      <p class="sv-note">Stays on this phone only. On the lock screen anyone can read it: that's the point, so a rescuer can see it without unlocking.</p>`:
      `<div class="tl-face"><div class="tl-read"><span class="tl-num sm">Not filled in yet</span><span class="tl-cap">In an emergency, rescuers can read your allergies, medicines and who to call, even from the lock screen.</span></div></div><div class="tl-row"><button class="tl-act" id="tlEdit">Fill in my card</button></div>`;
    el.querySelector("#tlEdit").onclick=()=>{tap();edit();};const lk=el.querySelector("#tlLock");
    if(lk)lk.onchange=e=>{tap();C.lock=e.target.checked;localStorage.setItem("pt-card",JSON.stringify(C));if(C.lock&&lockSt()==="perm")tlTry(t=>{try{window.AndroidNotify.askPermission();}catch(e){}});post();};
    const wl=el.querySelector("#tlWall");
    if(wl)wl.onchange=e=>{tap();C.wall=e.target.checked;localStorage.setItem("pt-card",JSON.stringify(C));wall(true);};
    const wg=el.querySelector("#tlWidget");if(wg)wg.onclick=()=>{tap();let ok=false;tlTry(t=>{ok=!!t.pinIceWidget();});
      const w=el.querySelector("#tlWidgetWhy");if(w)w.innerHTML=`<div class="tl-why ok"><span>${ok?"Your phone asks where to put it: choose Add.":"Add it yourself: touch and hold your home screen → Widgets → Out & Back → Emergency card."} On phones with lock screen widgets (e.g. Pixel with Android 16, swipe left on the lock screen) you can add it there too.</span></div>`;};
    post();wall(false);widget();};
  /* keep the widget showing the latest card */
  const widget=()=>{const rows=F.filter(f=>C[f[0]]&&f[0]!=="name").map(f=>[f[1],C[f[0]]]),key=JSON.stringify([C.name||"",rows]);
    if(localStorage.getItem("pt-card-widget")===key)return;tlTry(t=>{if(t.iceWidget){t.iceWidget(C.name||"",JSON.stringify(rows));localStorage.setItem("pt-card-widget",key);}});};
  /* the card as the lock-screen picture: everything visible at once. Only redrawn when the card changes. */
  const wall=(force)=>{const w=el.querySelector("#tlWallWhy"),rows=F.filter(f=>C[f[0]]&&f[0]!=="name").map(f=>[f[1],C[f[0]]]),key=JSON.stringify([C.name||"",rows]);
    let st="";
    if(!C.wall){if(force||localStorage.getItem("pt-card-wall")){tlTry(t=>{st=String(t.iceWallpaper("","")||"");});localStorage.removeItem("pt-card-wall");if(force&&st==="ok")toast("Lock screen back to your normal picture");}if(w)w.innerHTML="";return;}
    if(!force&&localStorage.getItem("pt-card-wall")===key){if(w)w.innerHTML=`<div class="tl-why ok"><span>✓ Your card is your lock screen picture. Edit the card and it updates.</span></div>`;return;}
    tlTry(t=>{st=String(t.iceWallpaper(C.name||"",JSON.stringify(rows))||"");});
    if(st==="ok"){localStorage.setItem("pt-card-wall",key);if(force)toast("✓ Lock your phone to see it");}
    if(w)w.innerHTML=st==="ok"?`<div class="tl-why ok"><span>✓ Your card is your lock screen picture. Edit the card and it updates. Switch this off to get your normal lock screen picture back.</span></div>`
      :`<div class="tl-why"><span>${st==="old"?"This needs Android 7 or newer.":st?"Couldn't set the lock screen picture ("+svEsc(st)+").":"Works in the Android app."}</span></div>`;};
  /* put the card on the lock screen and say plainly when the phone is hiding it */
  const lockSt=()=>{let r="";tlTry(t=>{r=String(t.lockCard("🆘 Emergency info"+(C.name?": "+C.name:""),C.lock?text():"")||"");});return r;};
  const post=()=>{const w=el.querySelector("#tlLockWhy");const st=lockSt();if(!w)return;if(!C.lock||!st||st==="off"){w.innerHTML="";return;}
    const M={perm:["Out & Back isn't allowed to show notifications yet.","Allow","allow"],blocked:["Your phone has turned off notifications for the emergency card.","Open settings","card"],
      hidden:["Your phone hides the emergency card on the lock screen.","Open settings","card"],lockoff:["Your phone shows no notifications on the lock screen at all.","Lock screen settings","lock"],
      ok:["✓ It's on your lock screen. Only see an icon there? In your phone's lock screen settings, set notifications to show their content.","Lock screen settings","lock"]}[st]||null;
    if(!M){w.innerHTML="";return;}
    w.innerHTML=`<div class="tl-why${st==="ok"?" ok":""}"><span>${M[0]}</span><button class="tl-act ghost" data-lw="${M[2]}">${M[1]}</button></div>`;
    w.querySelector("[data-lw]").onclick=b=>{tap();const k=b.currentTarget.dataset.lw;tlTry(t=>{if(k==="allow"){try{window.AndroidNotify.askPermission();}catch(e){}}else if(k==="card")t.cardSettings();else t.lockSettings();});
      const back=()=>{if(!document.hidden){document.removeEventListener("visibilitychange",back);setTimeout(post,300);}};document.addEventListener("visibilitychange",back);setTimeout(post,4000);};};
  const edit=()=>{el.innerHTML=`<div class="tl-form">${F.map(f=>`<label>${f[1]}<input data-cf="${f[0]}" value="${svEsc(C[f[0]]||"")}" placeholder="${f[2]}"></label>`).join("")}</div><div class="tl-row"><button class="tl-act" id="tlSave">Save</button></div>`;
    el.querySelector("#tlSave").onclick=()=>{tap();el.querySelectorAll("[data-cf]").forEach(i=>C[i.dataset.cf]=i.value.trim());localStorage.setItem("pt-card",JSON.stringify(C));
      if(C.lock)tlTry(t=>t.lockCard("🆘 Emergency info"+(C.name?": "+C.name:""),text()));view();toast("Saved");};};
  view();},

 phrases(el,T){let lang=localStorage.getItem("pt-phl")||(typeof curCountry==="function"&&curCountry()==="nl"?"nl":"it");
  const draw=()=>{el.innerHTML=`<div class="tl-seg"><button data-pl="it" class="${lang==="it"?"on":""}">Italiano</button><button data-pl="nl" class="${lang==="nl"?"on":""}">Nederlands</button></div>
    ${PHRASES.map(([cat,list])=>`<div class="tl-sec">${cat.replace(/^\S+\s/,"")}</div><div class="tl-phr">${list.map(p=>`<button data-say="${svEsc(p[lang==="it"?1:3])}"><small>${svEsc(p[0])}</small><b>${svEsc(p[lang==="it"?1:3])}</b><i>${svEsc(p[lang==="it"?2:4])}</i><span class="tl-spk"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg></span></button>`).join("")}</div>`).join("")}
    <p class="sv-note">Tap a phrase to hear it. It uses your phone's own voices and works offline if the language is installed. Or just show the screen.</p>`;
   el.querySelectorAll("[data-pl]").forEach(b=>b.onclick=()=>{tap();lang=b.dataset.pl;localStorage.setItem("pt-phl",lang);draw();});
   el.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>{tap();const t=b.dataset.say,lg=lang==="it"?"it-IT":"nl-NL";
     if(TL())tlTry(x=>x.speak(t,lg));else if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(t);u.lang=lg;u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u);}
     b.classList.add("say");setTimeout(()=>b.classList.remove("say"),900);});};
  draw();},

 saver(el,T){const draw=()=>{const b=batt(),pct=b.pct!=null?b.pct:null;
   el.innerHTML=`<div class="tl-face"><svg viewBox="-110 -110 220 220" class="tl-dial sm">${ring(pct!=null?pct/100:0,92,8)}</svg>
     <div class="tl-read over"><span class="tl-num">${pct!=null?pct+"<small>%</small>":"–"}</span><span class="tl-cap">${LOWPOWER?"Battery saver is on":"Battery saver is off"}${b.chg?" · charging":""}</span></div></div>
    <div class="tl-row"><button class="tl-act ${LOWPOWER?"ghost":""}" id="tlLp">${LOWPOWER?"Switch off":"Switch on now"}</button></div>
    <label class="tl-switch"><span>Switch on by itself below 20%</span><input type="checkbox" id="tlAuto" ${SAVER_AUTO?"checked":""}><i></i></label>
    <div class="tl-list"><div class="tl-li">GPS updates less often, and location sharing only uses GPS while you move</div><div class="tl-li">No automatic refreshing of departures, shops and weather</div><div class="tl-li">Animations off</div></div>
    <p class="sv-note">Everything still works, it just updates a bit less often. Lowering the screen brightness saves the most of all.</p>`;
   el.querySelector("#tlLp").onclick=()=>{tap();setLowPower(!LOWPOWER,true);draw();};
   el.querySelector("#tlAuto").onchange=e=>{tap();SAVER_AUTO=e.target.checked;localStorage.setItem("pt-saverauto",SAVER_AUTO?"1":"0");};};
  draw();tlEvery(T,60e3,draw);},

 supplies(el,T){let S={};try{S=JSON.parse(localStorage.getItem("pt-supplies")||"{}");}catch(e){}
  if(S.ad==null){S.ad=Math.max(1,S.n||2);S.ch=0;}S.ch=S.ch||0;S.dog=S.dog||0;S.cat=S.cat||0;S.days=S.days||3;S.got=S.got||{};S.hide=S.hide||{};S.own=S.own||[];S.lists=S.lists||[];
  const auto=(typeof curCountry==="function"&&curCountry())||"nl";let cc=S.cc||(SUPPLIES[auto]?auto:"eu");let tab=S.tab||"kit",showHid=false,openList=null;
  const save=()=>localStorage.setItem("pt-supplies",JSON.stringify(S));
  const H={ad:S.ad,ch:S.ch,dog:S.dog,cat:S.cat,days:S.days};
  const qty=(f)=>{const n=f.q(H);return n>0?f.u(n):"";};
  const foodItems=()=>FOODPLAN.flatMap(g=>g[2]).filter(f=>f.q(H)>0);
  const kitItems=()=>{const L=SUPPLIES[cc];return [...foodItems().map(f=>({id:"f-"+f.id,en:f.en,loc:f[cc]||"",q:qty(f),note:f.note||""})),
     ...L.groups.flatMap(g=>g[1]).filter(i=>!["water","food","petfood"].includes(i[0])).map(([id,en,loc,q,note])=>({id,en,loc,q:typeof q==="function"?q(S.ad+S.ch):q,note})),
     ...S.own.map(o=>({id:o.id,en:o.t,loc:"",q:o.q||"",note:"",own:1}))];};
  const step=(k,label,min,max)=>`<div class="tl-hh"><span class="tl-cap">${label}</span><span class="tl-stepper"><button data-st="${k}" data-d="-1" aria-label="Fewer">−</button><b>${S[k]}</b><button data-st="${k}" data-d="1" aria-label="More">+</button></span></div>`;
  const row=(it,hidden)=>`<label class="${S.got[it.id]?"got":""}"><input type="checkbox" data-sp="${it.id}" ${S.got[it.id]?"checked":""}><i></i><div><b>${svEsc(it.en)}${it.q?` <em>${svEsc(it.q)}</em>`:""}</b>${it.loc&&it.loc!==it.en?`<span class="tl-loc">${svEsc(it.loc)}</span>`:""}${it.note?`<small>${svEsc(it.note)}</small>`:""}</div><button class="tl-x" data-${hidden?"unhide":"hide"}="${it.id}" aria-label="${hidden?"Put back":"Not needed"}">${hidden?"↺":"✕"}</button></label>`;
  const draw=()=>{Object.assign(H,{ad:S.ad,ch:S.ch,dog:S.dog,cat:S.cat,days:S.days});
    const tabs=`<div class="tl-seg"><button data-tab="kit" class="${tab==="kit"?"on":""}">Emergency kit</button><button data-tab="lists" class="${tab==="lists"?"on":""}">Shopping lists${S.lists.length?" ("+S.lists.length+")":""}</button></div>`;
    if(tab==="lists"){drawLists(tabs);return;}
    const all=kitItems(),vis=all.filter(i=>!S.hide[i.id]),hid=all.filter(i=>S.hide[i.id]),done=vis.filter(i=>S.got[i.id]).length;
    const fid=new Set(foodItems().map(f=>"f-"+f.id));
    el.innerHTML=tabs+`<div class="tl-seg">${Object.entries(SUPPLIES).map(([k,v])=>`<button data-cc="${k}" class="${cc===k?"on":""}">${v.name}${k===auto?" · here":""}</button>`).join("")}</div>
     <div class="tl-face left"><div class="tl-facerow top"><div><span class="tl-cap">Ready for ${S.days} days</span><span class="tl-num">${done}<small>/ ${vis.length}</small></span></div>
       <svg viewBox="-34 -34 68 68" class="tl-mini big">${ring(vis.length?done/vis.length:0,28,6)}</svg></div>
      ${step("ad","Adults",1,12)}${step("ch","Children (under 12)",0,10)}${step("dog","Dogs",0,6)}${step("cat","Cats",0,6)}
      <div class="tl-hh"><span class="tl-cap">How long</span><span class="tl-days">${[3,7,14].map(d=>`<button data-days="${d}" class="${S.days===d?"on":""}">${d} days</button>`).join("")}</span></div></div>
     <details class="tl-moonx"><summary>Eating well from your stock ▸</summary>
       <p class="sv-note" style="margin:8px 0">Aim for this every day: something filling (crackers, muesli), protein (fish, meat, beans, nuts), fruit or vegetables, milk for the children, and something with fat or sugar for energy. That's roughly 2,000 kcal for an adult and 1,400 for a child.</p>
       <p class="sv-note" style="margin:0 0 8px">Pick things you already eat and that need no cooking or fridge. With a camping stove you can add rice, pasta and soup. Use the oldest first and replace what you eat.</p></details>
     ${FOODPLAN.map(([gname,gnote,list])=>{const its=vis.filter(i=>list.some(f=>"f-"+f.id===i.id));return its.length?`<div class="tl-sec">${gname}</div>${gnote?`<p class="sv-note" style="margin:-4px 0 8px">${gnote}</p>`:""}<div class="tl-check">${its.map(i=>row(i)).join("")}</div>`:"";}).join("")}
     ${SUPPLIES[cc].groups.map(([gname,list])=>{const its=vis.filter(i=>list.some(x=>x[0]===i.id)&&!fid.has(i.id));return its.length?`<div class="tl-sec">${gname.replace("Water & food","Kitchen")}</div><div class="tl-check">${its.map(i=>row(i)).join("")}</div>`:"";}).join("")}
     <div class="tl-sec">Your own items</div><div class="tl-check">${vis.filter(i=>i.own).map(i=>row(i)).join("")}
       <div class="tl-add"><input id="tlOwnT" placeholder="Add something, e.g. baby food" maxlength="60"><input id="tlOwnQ" placeholder="How many" maxlength="20"><button id="tlOwnAdd" aria-label="Add">＋</button></div></div>
     ${hid.length?`<button class="tl-act ghost" id="tlShowHid" style="margin-top:10px">${showHid?"Hide":"Show"} ${hid.length} item${hid.length>1?"s":""} you don't need</button>${showHid?`<div class="tl-check" style="margin-top:8px">${hid.map(i=>row(i,1)).join("")}</div>`:""}`:""}
     <div class="tl-sec">Cooking from your stock</div><div class="tl-recipes">${STOCK_RECIPES.map(([id,t])=>{const have=typeof svAll==="function"&&svAll().some(x=>x.id===id);return `<button ${have?`data-sv="${id}"`:`data-svdlgo="stockcook" data-id="${id}"`}>${t}</button>`;}).join("")}</div>
     <p class="sv-note" style="margin-top:6px">${typeof svAll==="function"&&svAll().some(x=>x.id==="sc_nocook")?"Step-by-step recipes with what's in your stock.":"Tap a recipe to download the free “Cooking from your stock” guides (once, then they work offline)."}</p>
     <div class="tl-row"><button class="tl-act" id="tlToList">🛒 Put what's missing on a shopping list</button></div>
     <div class="tl-row"><button class="tl-act ghost" id="tlSpReset">Uncheck all</button></div>
     <p class="sv-note">${SUPPLIES[cc].src} Amounts are for ${S.ad+S.ch} ${S.ad+S.ch>1?"people":"person"}${S.dog+S.cat?` and ${S.dog+S.cat} pet${S.dog+S.cat>1?"s":""}`:""} for ${S.days} days. Check your stock twice a year, for example when the clocks change.</p>`;
    el.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tap();tab=b.dataset.tab;S.tab=tab;save();draw();});
    el.querySelectorAll("[data-cc]").forEach(b=>b.onclick=()=>{tap();cc=b.dataset.cc;S.cc=cc===auto?undefined:cc;save();draw();});
    el.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{tap();const k=b.dataset.st,lim={ad:[1,12],ch:[0,10],dog:[0,6],cat:[0,6]}[k];S[k]=Math.max(lim[0],Math.min(lim[1],S[k]+ +b.dataset.d));save();draw();});
    el.querySelectorAll("[data-days]").forEach(b=>b.onclick=()=>{tap();S.days=+b.dataset.days;save();draw();});
    el.querySelectorAll("[data-sp]").forEach(c=>c.onchange=()=>{tap();S.got[c.dataset.sp]=c.checked;save();draw();});
    el.querySelectorAll("[data-hide]").forEach(b=>b.onclick=e=>{e.preventDefault();tap();const id=b.dataset.hide;if(id.startsWith("own-")){S.own=S.own.filter(o=>o.id!==id);}else S.hide[id]=1;save();draw();});
    el.querySelectorAll("[data-unhide]").forEach(b=>b.onclick=e=>{e.preventDefault();tap();delete S.hide[b.dataset.unhide];save();draw();});
    const sh=el.querySelector("#tlShowHid");if(sh)sh.onclick=()=>{tap();showHid=!showHid;draw();};
    el.querySelector("#tlOwnAdd").onclick=()=>{const t=el.querySelector("#tlOwnT").value.trim();if(!t)return;tap();S.own.push({id:"own-"+Date.now(),t,q:el.querySelector("#tlOwnQ").value.trim()});save();draw();};
    el.querySelector("#tlToList").onclick=()=>{tap();const miss=vis.filter(i=>!S.got[i.id]);if(!miss.length){toast("✓ You have everything");return;}
      let L=S.lists.find(l=>l.kit);if(!L){L={id:"l"+Date.now(),name:"Emergency shopping",kit:1,items:[]};S.lists.unshift(L);}
      for(const i of miss){const t=i.en+(i.loc&&i.loc!==i.en?" ("+i.loc+")":"");const ex=L.items.find(x=>x.src===i.id);if(ex){ex.q=i.q;ex.t=t;}else L.items.push({id:"i"+Date.now()+Math.random().toString(36).slice(2,6),t,q:i.q,src:i.id});}
      tab="lists";S.tab=tab;openList=L.id;save();draw();toast(`🛒 ${miss.length} item${miss.length>1?"s":""} on “${L.name}”`);};
    el.querySelector("#tlSpReset").onclick=()=>{tap();S.got={};save();draw();};};
  const drawLists=(tabs)=>{const L=S.lists.find(l=>l.id===openList);
    if(!L){el.innerHTML=tabs+`${S.lists.length?`<div class="tl-check">${S.lists.map(l=>{const n=l.items.length,d=l.items.filter(x=>x.done).length;return `<button class="tl-listrow" data-open="${l.id}"><b>🛒 ${svEsc(l.name)}</b><small>${n?`${d}/${n} done`:"empty"}</small></button>`;}).join("")}</div>`:`<p class="sv-note">No lists yet. Make one here, or use “Put what's missing on a shopping list” in the emergency kit.</p>`}
      <div class="tl-check" style="margin-top:10px"><div class="tl-add"><input id="tlNewL" placeholder="New list, e.g. Weekly shopping" maxlength="40"><button id="tlNewLAdd" aria-label="Make list">＋</button></div></div>`;
      el.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tap();tab=b.dataset.tab;S.tab=tab;save();draw();});
      el.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{tap();openList=b.dataset.open;draw();});
      el.querySelector("#tlNewLAdd").onclick=()=>{const t=el.querySelector("#tlNewL").value.trim();if(!t)return;tap();const l={id:"l"+Date.now(),name:t,items:[]};S.lists.push(l);openList=l.id;save();draw();};return;}
    const left=L.items.filter(x=>!x.done),got=L.items.filter(x=>x.done);
    const it=(x)=>`<label class="${x.done?"got":""}"><input type="checkbox" data-li="${x.id}" ${x.done?"checked":""}><i></i><div><b>${svEsc(x.t)}${x.q?` <em>${svEsc(x.q)}</em>`:""}</b></div><button class="tl-x" data-ldel="${x.id}" aria-label="Remove">✕</button></label>`;
    el.innerHTML=tabs+`<div class="tl-listhead"><button class="tl-act ghost" id="tlBack">‹ Lists</button><input id="tlLName" value="${svEsc(L.name)}" maxlength="40" aria-label="List name"></div>
      <div class="tl-check">${left.map(it).join("")}<div class="tl-add"><input id="tlItT" placeholder="Add an item" maxlength="60"><input id="tlItQ" placeholder="How many" maxlength="20"><button id="tlItAdd" aria-label="Add">＋</button></div></div>
      ${got.length?`<div class="tl-sec">In the basket (${got.length})</div><div class="tl-check">${got.map(it).join("")}</div>`:""}
      <div class="tl-row">${got.length?`<button class="tl-act ghost" id="tlClrGot">Remove ticked items</button>`:""}<button class="tl-act ghost" id="tlShareL">Share list</button><button class="tl-act ghost red" id="tlDelL">Delete list</button></div>`;
    el.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tap();tab=b.dataset.tab;S.tab=tab;save();draw();});
    el.querySelector("#tlBack").onclick=()=>{tap();openList=null;draw();};
    el.querySelector("#tlLName").onchange=e=>{L.name=e.target.value.trim()||L.name;save();};
    el.querySelectorAll("[data-li]").forEach(c=>c.onchange=()=>{tap();const x=L.items.find(y=>y.id===c.dataset.li);if(x){x.done=c.checked;if(x.done&&x.src)S.got[x.src]=true;}save();draw();});
    el.querySelectorAll("[data-ldel]").forEach(b=>b.onclick=e=>{e.preventDefault();tap();L.items=L.items.filter(y=>y.id!==b.dataset.ldel);save();draw();});
    const add=()=>{const t=el.querySelector("#tlItT").value.trim();if(!t)return;tap();L.items.push({id:"i"+Date.now(),t,q:el.querySelector("#tlItQ").value.trim()});save();draw();const n=el.querySelector("#tlItT");if(n)n.focus();};
    el.querySelector("#tlItAdd").onclick=add;el.querySelector("#tlItT").onkeydown=e=>{if(e.key==="Enter")add();};
    const cg=el.querySelector("#tlClrGot");if(cg)cg.onclick=()=>{tap();L.items=left;save();draw();};
    el.querySelector("#tlShareL").onclick=()=>{tap();const txt=`🛒 ${L.name}\n`+left.map(x=>`• ${x.t}${x.q?" – "+x.q:""}`).join("\n");try{if(window.AndroidGroup&&window.AndroidGroup.shareText){window.AndroidGroup.shareText(txt);return;}}catch(e){}copyText(txt);toast("List copied: paste it in WhatsApp or a message");};
    const dl=el.querySelector("#tlDelL");dl.onclick=()=>{tap();if(dl.dataset.sure){S.lists=S.lists.filter(x=>x!==L);openList=null;save();draw();return;}dl.dataset.sure=1;dl.textContent="Tap again to delete";setTimeout(()=>{if(dl.isConnected){delete dl.dataset.sure;dl.textContent="Delete list";}},4000);};};
  draw();},
};

const STOCK_RECIPES=[["sc_nocook","🥫 Meals without cooking"],["sc_salad","🥗 Tuna & bean salad"],["sc_oats","🥣 Overnight oats"],["sc_soup","🥣 Soup from tins"],["sc_onepot","🍲 One-pot rice"],["sc_pasta","🍝 One-pan pasta"],["sc_flatbread","🫓 Pan flatbread"],["sc_ricepud","🍚 Rice pudding"],["sc_fuel","⛽ Saving gas & water"],["sc_stove","🔥 Camping stove safety"]];
/* What to eat from your stock, per day: q(H) = how much for the household (adults, children, dogs, cats, days); u(n) = how to say it */
const g2=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1).replace(".0","")+" kg":Math.round(n/50)*50+" g",tins=n=>`${n} tin${n>1?"s":""}`,lit=n=>`${n} L`;
const FOODPLAN=[
 ["Water","3 litres per person per day: for drinking and a little cooking and washing. Keep it in closed bottles, cool and dark.",[
   {id:"water",en:"Drinking water",nl:"Drinkwater in flessen",it:"Acqua in bottiglia",q:H=>Math.ceil(((H.ad+H.ch)*3+H.dog*1+H.cat*0.25)*H.days),u:lit,note:"Includes about 1 L a day per dog and a glass per cat"}]],
 ["Filling food","Bread that keeps and cereals: the base of every meal.",[
   {id:"crackers",en:"Crackers, crispbread or rusks",nl:"Crackers, knäckebröd of beschuit",it:"Crackers, fette biscottate o gallette",q:H=>(H.ad*100+H.ch*60)*H.days,u:g2},
   {id:"muesli",en:"Muesli, oats or granola",nl:"Muesli, havermout of granola",it:"Muesli, fiocchi d'avena",q:H=>(H.ad*60+H.ch*40)*H.days,u:g2,note:"Eat it with UHT milk or water"},
   {id:"rice",en:"Rice or pasta (only if you can cook)",nl:"Rijst of pasta (als je kunt koken)",it:"Riso o pasta (se puoi cucinare)",q:H=>H.days>3?(H.ad*80+H.ch*50)*H.days:0,u:g2,note:"Needs a camping stove and water"}]],
 ["Protein","For strength and staying full: one tin or portion per person a day.",[
   {id:"fish",en:"Tinned fish (tuna, sardines, mackerel)",nl:"Vis in blik (tonijn, sardines, makreel)",it:"Pesce in scatola (tonno, sardine, sgombro)",q:H=>Math.ceil((H.ad+H.ch*0.5)*H.days/2),u:tins},
   {id:"meat",en:"Tinned meat, chicken or ready meals",nl:"Vlees of maaltijden in blik",it:"Carne o piatti pronti in scatola",q:H=>Math.ceil((H.ad+H.ch*0.5)*H.days/2),u:tins,note:"Ready meals in tins or pouches can be eaten cold"},
   {id:"beans",en:"Tinned beans, chickpeas or lentils",nl:"Bonen, kikkererwten of linzen in blik",it:"Fagioli, ceci o lenticchie in scatola",q:H=>Math.ceil((H.ad+H.ch)*H.days/3),u:tins},
   {id:"nuts",en:"Nuts and peanut butter",nl:"Noten en pindakaas",it:"Frutta secca e burro di arachidi",q:H=>(H.ad*40+H.ch*25)*H.days,u:g2,note:"Leave these out if anyone has a nut allergy"}]],
 ["Fruit & vegetables","For vitamins and fibre: one tin of vegetables per two people a day, and some fruit.",[
   {id:"veg",en:"Tinned vegetables or soup",nl:"Groente of soep in blik",it:"Verdure o zuppa in scatola",q:H=>Math.ceil((H.ad+H.ch)*H.days/2),u:tins},
   {id:"fruit",en:"Tinned fruit in juice",nl:"Fruit op sap in blik",it:"Frutta sciroppata o al naturale",q:H=>Math.ceil((H.ad+H.ch)*H.days/3),u:tins},
   {id:"dried",en:"Dried fruit (raisins, apricots)",nl:"Gedroogd fruit (rozijnen, abrikozen)",it:"Frutta secca (uvetta, albicocche)",q:H=>(H.ad*40+H.ch*30)*H.days,u:g2},
   {id:"juice",en:"Long-life fruit juice",nl:"Houdbaar vruchtensap",it:"Succo di frutta a lunga conservazione",q:H=>Math.ceil((H.ad+H.ch)*H.days*0.2),u:lit}]],
 ["Milk & energy","Milk for calcium (more for children), and something sweet or fatty for energy.",[
   {id:"milk",en:"UHT milk (or long-life plant milk)",nl:"Houdbare melk (of plantaardige melk)",it:"Latte UHT (o bevanda vegetale)",q:H=>Math.ceil((H.ad*0.25+H.ch*0.5)*H.days),u:lit},
   {id:"bars",en:"Energy or muesli bars, chocolate",nl:"Mueslirepen, energierepen, chocolade",it:"Barrette ai cereali, cioccolato",q:H=>(H.ad+H.ch)*H.days,u:n=>`${n} bars`},
   {id:"spread",en:"Honey, jam or chocolate spread",nl:"Honing, jam of hagelslag",it:"Miele, marmellata o crema spalmabile",q:H=>H.days>=3?Math.max(1,Math.ceil((H.ad+H.ch)*H.days/14)):0,u:n=>`${n} jar${n>1?"s":""}`},
   {id:"extras",en:"Salt, sugar, coffee and tea",nl:"Zout, suiker, koffie en thee",it:"Sale, zucchero, caffè e tè",q:H=>1,u:()=>"",note:"Small comforts help a lot when things are hard"}]],
 ["Pets","",[
   {id:"dogfood",en:"Dog food (dry)",nl:"Hondenbrokken",it:"Crocchette per cani",q:H=>H.dog*300*H.days,u:g2,note:"About 300 g a day for a medium dog: check your bag for your dog's weight"},
   {id:"catfood",en:"Cat food",nl:"Kattenvoer",it:"Cibo per gatti",q:H=>H.cat*H.days*2,u:n=>`${n} pouches (or ${Math.round(n*35)} g dry)`,note:"Plus cat litter"},
   {id:"petmeds",en:"Pet medicines, lead and a carrier",nl:"Medicijnen, riem en reismand voor je dier",it:"Medicine, guinzaglio e trasportino",q:H=>H.dog+H.cat?1:0,u:()=>""}]],
];
/* What to keep at home for 72 hours, per country, with the names you'll find on the shelf. Quantities follow the household size. */
const L3=n=>`${n*9} L`,FOOD=n=>`${n*3} days`;
const SUPPLIES={
 nl:{name:"Nederland",src:"Based on the Dutch government's “Denk vooruit” emergency kit (denkvooruit.nl): be able to manage on your own for 72 hours.",groups:[
  ["Water & food",[["water","Drinking water","Drinkwater (flessen)",L3,"3 litres per person per day"],["food","Food that keeps, no cooking needed","Houdbaar eten: blikken, crackers, noten",FOOD,""],["opener","Tin opener","Blikopener","",""],["petfood","Pet food, if you have pets","Dierenvoer","",""]]],
  ["Light & information",[["radio","Radio on batteries or wind-up","Noodradio / radio op batterijen","","Listen to the regional broadcaster for official news"],["torch","Torch","Zaklamp",n=>`${Math.max(1,Math.ceil(n/2))}`,""],["batt","Spare batteries","Batterijen","",""],["powerbank","Power bank, charged","Powerbank","",""],["candles","Candles and matches or a lighter","Kaarsen en lucifers / aansteker","","Never leave them burning alone"]]],
  ["Health & hygiene",[["firstaid","First-aid kit","EHBO-doos / verbandtrommel","",""],["meds","Your own medicines","Medicijnen","for a week",""],["toilet","Toilet paper and wet wipes","Toiletpapier en vochtige doekjes","",""],["bags","Bin bags","Vuilniszakken","",""]]],
  ["Warmth & documents",[["blankets","Blankets or sleeping bags","Dekens / slaapzakken",n=>`${n}`,""],["cash","Cash in small notes","Contant geld","","Card machines don't work without power"],["docs","Copies of ID and important papers","Kopieën van identiteitsbewijs en papieren","","In a waterproof bag"],["whistle","Whistle","Fluitje","","To be heard when you need help"],["multitool","Multitool or pocket knife","Multitool / zakmes","",""]]]]},
 it:{name:"Italia",src:"Based on the Italian Civil Protection's emergency kit (Protezione Civile, “Io non rischio”).",groups:[
  ["Water & food",[["water","Drinking water","Acqua in bottiglia",L3,"3 litres per person per day"],["food","Food that keeps, no cooking needed","Cibo a lunga conservazione: scatolette, crackers, frutta secca",FOOD,""],["opener","Tin opener","Apriscatole","",""],["petfood","Pet food, if you have pets","Cibo per animali","",""]]],
  ["Light & information",[["radio","Radio on batteries or wind-up","Radio a pile / a manovella","","Listen to RAI radio for official news"],["torch","Torch","Torcia",n=>`${Math.max(1,Math.ceil(n/2))}`,""],["batt","Spare batteries","Pile di ricambio","",""],["powerbank","Power bank, charged","Power bank / caricabatterie portatile","",""],["candles","Candles and matches or a lighter","Candele e fiammiferi / accendino","","Never leave them burning alone"]]],
  ["Health & hygiene",[["firstaid","First-aid kit","Kit di pronto soccorso","",""],["meds","Your own medicines","Medicinali","for a week",""],["toilet","Toilet paper and wet wipes","Carta igienica e salviette umide","",""],["bags","Bin bags","Sacchi per la spazzatura","",""]]],
  ["Warmth & documents",[["blankets","Blankets and warm clothes, a rain jacket","Coperte, vestiti pesanti, impermeabile",n=>`${n}`,""],["cash","Cash in small notes","Contanti","","Card machines don't work without power"],["docs","Copies of ID and important papers","Copia dei documenti","","In a waterproof bag"],["whistle","Whistle","Fischietto","","To be heard when you need help"],["multitool","Multitool or pocket knife","Coltellino multiuso","",""]]]]},
 eu:{name:"Other",src:"Based on the EU's advice to be able to manage on your own for 72 hours in an emergency.",groups:[
  ["Water & food",[["water","Drinking water","",L3,"3 litres per person per day"],["food","Food that keeps, no cooking needed","",FOOD,""],["opener","Tin opener","","",""]]],
  ["Light & information",[["radio","Radio on batteries or wind-up","","",""],["torch","Torch and spare batteries","",n=>`${Math.max(1,Math.ceil(n/2))}`,""],["powerbank","Power bank, charged","","",""]]],
  ["Health & hygiene",[["firstaid","First-aid kit","","",""],["meds","Your own medicines","","for a week",""],["toilet","Toilet paper and wet wipes","","",""]]],
  ["Warmth & documents",[["blankets","Blankets or sleeping bags","",n=>`${n}`,""],["cash","Cash in small notes","","",""],["docs","Copies of ID and important papers","","",""],["whistle","Whistle","","",""]]]]},
};

const PHRASES=[
 ["🚨 Emergency",[
  ["Help!","Aiuto!","a-YOO-toh","Help!","help"],
  ["Call an ambulance!","Chiami un'ambulanza!","KYAH-mee oon am-boo-LAN-tsa","Bel een ambulance!","bel ayn am-buu-LAN-suh"],
  ["Call the police!","Chiami la polizia!","KYAH-mee la po-lee-TSEE-a","Bel de politie!","bel duh po-LEET-see"],
  ["There's a fire!","C'è un incendio!","cheh oon een-CHEN-dyoh","Er is brand!","er is brant"],
  ["I'm lost.","Mi sono perso.","mee SOH-noh PER-soh","Ik ben verdwaald.","ik ben ver-DWAALT"],
  ["Someone is hurt.","C'è una persona ferita.","cheh OO-na per-SOH-na feh-REE-ta","Er is iemand gewond.","er is EE-mant khuh-WONT"],
  ["Leave me alone!","Mi lasci in pace!","mee LA-shee een PA-cheh","Laat me met rust!","laat muh met rust"]]],
 ["🩺 Doctor & pharmacy",[
  ["I need a doctor.","Ho bisogno di un medico.","oh bee-ZOH-nyoh dee oon MEH-dee-koh","Ik heb een dokter nodig.","ik hep ayn DOK-ter NOH-dikh"],
  ["Where is the pharmacy?","Dov'è la farmacia?","doh-VEH la far-ma-CHEE-a","Waar is de apotheek?","waar is duh a-po-TAYK"],
  ["It hurts here.","Mi fa male qui.","mee fa MA-leh kwee","Het doet hier pijn.","het doot heer pain"],
  ["I'm allergic to…","Sono allergico a…","SOH-noh al-LER-jee-koh a","Ik ben allergisch voor…","ik ben a-LER-khis vohr"],
  ["I have diabetes.","Ho il diabete.","oh eel dee-a-BEH-teh","Ik heb diabetes.","ik hep dee-a-BAY-tes"],
  ["I'm pregnant.","Sono incinta.","SOH-noh een-CHEEN-ta","Ik ben zwanger.","ik ben ZWANG-er"],
  ["I take this medicine.","Prendo questa medicina.","PREN-doh KWES-ta meh-dee-CHEE-na","Ik neem dit medicijn.","ik naym dit may-dee-SAIN"],
  ["Fever / headache","Febbre / mal di testa","FEB-breh / mal dee TES-ta","Koorts / hoofdpijn","koorts / HOHFT-pain"]]],
 ["🧭 Directions & transport",[
  ["Where is…?","Dov'è…?","doh-VEH","Waar is…?","waar is"],
  ["The station","La stazione","la sta-TSYOH-neh","Het station","het sta-SHON"],
  ["The bus stop","La fermata dell'autobus","la fer-MA-ta del OW-toh-boos","De bushalte","duh BUS-hal-tuh"],
  ["Left / right / straight on","Sinistra / destra / dritto","see-NEES-tra / DES-tra / DREET-toh","Links / rechts / rechtdoor","links / rekhts / rekht-DOHR"],
  ["How much is a ticket to…?","Quanto costa un biglietto per…?","KWAN-toh KOS-ta oon bee-LYET-toh per","Hoeveel kost een kaartje naar…?","hoo-VAYL kost ayn KAART-yuh naar"],
  ["Is it far?","È lontano?","eh lon-TA-noh","Is het ver?","is het ver"],
  ["My car broke down.","La mia macchina è guasta.","la MEE-a MAK-kee-na eh GWAS-ta","Mijn auto is kapot.","main OW-toh is ka-POT"]]],
 ["🍽️ Food & allergies",[
  ["Does this contain…?","Contiene…?","kon-TYEH-neh","Zit hier … in?","zit heer … in"],
  ["Nuts / milk / gluten","Frutta a guscio / latte / glutine","FROOT-ta a GOO-shoh / LAT-teh / GLOO-tee-neh","Noten / melk / gluten","NOH-tuh / melk / GLUU-tuh"],
  ["Without…, please.","Senza…, per favore.","SEN-tsa … per fa-VOH-reh","Zonder…, alstublieft.","ZON-der … als-tuu-BLEEFT"],
  ["Water, please.","Acqua, per favore.","AK-kwa per fa-VOH-reh","Water, alstublieft.","WAA-ter als-tuu-BLEEFT"],
  ["The bill, please.","Il conto, per favore.","eel KON-toh per fa-VOH-reh","De rekening, alstublieft.","duh RAY-kuh-ning als-tuu-BLEEFT"]]],
 ["🙂 Basics",[
  ["Hello / goodbye","Buongiorno / arrivederci","bwon-JOR-noh / ar-ree-veh-DER-chee","Hallo / tot ziens","HA-loh / tot zeens"],
  ["Please / thank you","Per favore / grazie","per fa-VOH-reh / GRA-tsyeh","Alstublieft / dank u","als-tuu-BLEEFT / dank uu"],
  ["I don't understand.","Non capisco.","non ka-PEES-koh","Ik begrijp het niet.","ik buh-KHRAIP het neet"],
  ["Do you speak English?","Parla inglese?","PAR-la een-GLEH-zeh","Spreekt u Engels?","spraykt uu ENG-uls"],
  ["Can you write it down?","Può scriverlo?","pwoh SKREE-ver-loh","Kunt u het opschrijven?","kunt uu het OP-skhrai-vuh"]]],
];

function openSurvGuide(id){svRegisterArt();const g=svAll().find(x=>x.id===id);if(!g)return;svStopBeat();closeSurvGuide();
  const ov=document.createElement("div");ov.className="sv-ov";ov.id="svOv";ov.style.setProperty("--sc",SURV_COL[g.cat]||"#455a64");
  ov.innerHTML=`<div class="sv-top"><button data-svclose>‹ Back</button></div>
   <div class="sv-hero"><h2>${g.ic} ${svEsc(g.t)}</h2>${g.w?`<p>${svEsc(g.w)}</p>`:""}${svHeroArt(g)}</div>
   ${g.call?`<div class="sv-callbar"><a href="tel:112">📞 Call 112</a></div>`:""}${tlLinks(g.id)}
   ${g.metro?`<div class="sv-beat"><span class="sv-dot" id="svDot"></span><span><b>Compression beat</b><br><small style="color:var(--muted)">110 per minute, sound and vibration</small></span><button id="svBeatBtn">Start beat</button></div>`:""}
   <ol class="sv-steps">${g.s.map((x,i)=>{const a=svStepArt(g,i);return a?`<li class="pic"><div class="sv-pic">${a}</div>${svEsc(x)}</li>`:`<li>${svEsc(x)}</li>`;}).join("")}</ol>
   ${g.d&&g.d.length?`<div class="sv-dont"><b>Don't</b><ul>${g.d.map(x=>`<li>${svEsc(x)}</li>`).join("")}</ul></div>`:""}
   ${(g.see||[]).length?`<div class="sv-see"><b>See also</b>${g.see.map(id=>{const x=svAll().find(y=>y.id===id);if(x)return `<button data-sv="${x.id}">${x.ic} ${svEsc(x.t)}</button>`;
      const p=svPackOf(id),t=p&&(p.guides||[]).find(y=>y.id===id);return t?`<button data-svdlgo="${p.id}" data-id="${id}">${p.ic} ${svEsc(t.t)} <small>· in ${svEsc(p.name)}, tap to download</small></button>`:"";}).join("")}</div>`:""}
   <div class="sv-end">${svMascotSvg("thumb")}<div><b>${g.cat==="first"?"You did the right thing.":"You've got this."}</b><small>${g.cat==="first"?"Stay with them until help takes over.":"Practise it once on a calm day, then it's easy when it counts."}</small></div></div>
   ${g.src?`<div class="sv-src">Based on: ${svEsc(g.src)}</div>`:""}`;
  document.body.appendChild(ov);history.pushState&&history.pushState({sv:1},"");}
function closeSurvGuide(){svStopBeat();const o=document.getElementById("svOv");if(o)o.remove();}
window.addEventListener("popstate",()=>{if(document.getElementById("tlOv"))closeTool();else if(document.getElementById("svOv"))closeSurvGuide();});
document.addEventListener("click",e=>{const t=e.target.closest?e.target:null;if(!t)return;
  if(t.closest("#survBack")){showTab(prevTab||"dest");return;}
  const c=t.closest("[data-sv]");if(c){openSurvGuide(c.dataset.sv);return;}
  const tb=t.closest("[data-tool]");if(tb){openTool(tb.dataset.tool);return;}
  if(t.closest("[data-tlclose]")){if(history.state&&history.state.tl)history.back();else closeTool();return;}
  if(t.closest("[data-svclose]")){if(history.state&&history.state.sv)history.back();else closeSurvGuide();return;}
  if(t.closest("#svBeatBtn")){svToggleBeat();return;}
  const sh=t.closest("[data-svshelf]");if(sh){SV_OPEN.add(sh.dataset.svshelf);renderSurv();return;}
  const dl=t.closest("[data-svdl]");if(dl){svDownload(dl.dataset.svdl);return;}
  const dg=t.closest("[data-svdlgo]");if(dg){svDownload(dg.dataset.svdlgo).then(()=>{if(svAll().some(x=>x.id===dg.dataset.id))openSurvGuide(dg.dataset.id);});return;}
  const rm=t.closest("[data-svrm]");if(rm){svRemove(rm.dataset.svrm);return;}
  if(t.closest("#svCopy")&&typeof me!=="undefined"&&me){const s=me.lat.toFixed(5)+", "+me.lon.toFixed(5);copyText(s);t.closest("#svCopy").textContent="Copied";}
});

/* the emergency card fields, and keeping the home/lock-screen widget up to date (also when the card tool isn't opened) */
const CARD_F=[["name","Name",""],["born","Date of birth","e.g. 12 March 1995"],["blood","Blood type","e.g. A+"],["allergies","Allergies","Medicines, food, insects…"],["conditions","Medical conditions","e.g. asthma, diabetes"],["meds","Medicines I take",""],["ice1","Emergency contact 1","Name and phone number"],["ice2","Emergency contact 2",""],["notes","Other notes","e.g. organ donor, language"]];
(function(){try{const C=JSON.parse(localStorage.getItem("pt-card")||"{}"),rows=CARD_F.filter(f=>C[f[0]]&&f[0]!=="name").map(f=>[f[1],C[f[0]]]),key=JSON.stringify([C.name||"",rows]);
  if(localStorage.getItem("pt-card-widget")!==key&&window.AndroidTools&&window.AndroidTools.iceWidget){window.AndroidTools.iceWidget(C.name||"",JSON.stringify(rows));localStorage.setItem("pt-card-widget",key);}}catch(e){}})();

/* ---------- Games: the games themselves live in games.js (and the creature game in mon.js), loaded when you open it ---------- */
TL_ICONS.games='<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9"/><circle cx="17.8" cy="13.8" r=".9"/>';
TOOLS.push({id:"games",c:"#7a5bc4",t:"Games",w:"Card games, drinking games and Wildlings. Play together over Bluetooth or online."});
TL_RUN.games=function(el,T){const go=()=>{if(T!==TOOL)return;try{GAMES.run(el,T);}catch(e){el.innerHTML=`<p class="sv-note">Games couldn't start: ${svEsc(e.message)}</p>`;}};
  if(window.GAMES)return go();el.innerHTML=`<p class="sv-note">Loading games…</p>`;
  const sc=document.createElement("script");sc.src=location.protocol==="file:"?"games.js":"games.js?v="+APP_VERSION;sc.onload=go;sc.onerror=()=>{el.innerHTML=`<p class="sv-note">Games couldn't load.</p>`;};document.head.appendChild(sc);};

/* ---------- Star map: the tool lives in sky.js, the star catalogue in skydata.js; both load when you open it ---------- */
TL_ICONS.sky='<path d="M12 3l1.8 4.2 4.5.4-3.4 3 1 4.4L12 12.8 8.1 15l1-4.4-3.4-3 4.5-.4z"/><path d="M4 20h16"/><path d="M6.5 20c1.5-2.5 3.4-3.7 5.5-3.7s4 1.2 5.5 3.7"/>';
TOOLS.splice(Math.max(0,TOOLS.findIndex(t=>t.id==="games")),0,{id:"sky",c:"#2b3a8c",t:"Star map",w:"Point your phone at the sky: stars, planets, and how to find your way by them"});   // games stay last
TL_RUN.sky=function(el,T){const v=location.protocol==="file:"?"":"?v="+APP_VERSION,go=()=>{if(T!==TOOL)return;try{SKY.run(el,T);}catch(e){el.innerHTML=`<p class="sv-note">The star map couldn't start: ${svEsc(e.message)}</p>`;}};
  const load=(src,cb)=>{const sc=document.createElement("script");sc.src=src+v;sc.onload=cb;sc.onerror=()=>{el.innerHTML=`<p class="sv-note">The star map couldn't load.</p>`;};document.head.appendChild(sc);};
  el.innerHTML=`<p class="sv-note">Loading the sky…</p>`;
  const need=()=>window.SKY?go():load("sky.js",go);if(window.SKY_DATA)need();else load("skydata.js",need);};
