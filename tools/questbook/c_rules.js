/* ---------------- heroes: building and stats ---------------- */
/* points: −1…2 on each stat, adding up to 4 (lowering a stat gives you a point back) */
const ptsOk=p=>p.length===4&&p.every(v=>v>=-1&&v<=2)&&p.reduce((a,b)=>a+b,0)===4;
const packP=p=>[(p[0]+1)|((p[1]+1)<<4),(p[2]+1)|((p[3]+1)<<4)],unpackP=(a,b)=>[(a&15)-1,(a>>4)-1,(b&15)-1,(b>>4)-1];
function calc(h){const c=CL[h.cl],an=AN[h.an],s={};
  STS.forEach((k,i)=>{s[k]=c.s[k]+h.pa[i]+(an.s[k]||0)+(BG[h.bg].s===k?1:0);});
  if(h.tro&1)s.wit++;if(h.tro&2)s.agi++;if(h.tro&4)s.cha++;if(h.tro&8)s.mig++;
  for(const k of STS)s[k]=Math.min(5,s[k]);
  h.s=s;const old=h.max||0;h.max=c.hp+an.hp+(h.tr==="tough"?5:0)+(h.tro&32?4:0)+(h.lv-1)*4;
  if(old&&h.max>old)h.hp+=h.max-old;h.hp=Math.min(h.hp==null?h.max:h.hp,h.max);
  h.ac=c.ac+(h.tr==="stalwart"?1:0)+(h.tro&16?1:0);h.db=h.tr==="brawler"?2:0;return h;}
/* a hero's bonus for a stat; checks also count the Silver tongue / Keen mind traits */
const mod=(h,s,check)=>h.s[s]+(h.lv>1&&s===CL[h.cl].atk?h.lv-1:0)+(check&&h.tr==="silver"&&s==="cha"?2:0)+(check&&h.tr==="keen"&&s==="wit"?2:0);
const heroName=(S,k)=>S.names[k];
/* the action that brings a hero to the table: class, ancestry, background, trait, portrait, points, level, rewards, gold, gear */
function buildAct(b){return [1,CLS.indexOf(b.cl),ANS.indexOf(b.an),BGS.indexOf(b.bg),TRS.indexOf(b.tr),b.po,...packP(b.pa),Math.min(30,b.lv||1),(b.tro||0)&63,Math.min(255,b.gs||0),(b.up||0)&255];}
function randomBuild(lv){const cl=CLS[Math.floor(Math.random()*5)],an=ANS[Math.floor(Math.random()*3)];
  return {cl,an,bg:BGS[Math.floor(Math.random()*6)],tr:TRS[Math.floor(Math.random()*6)],po:Math.floor(Math.random()*POR[an].length),pa:CL[cl].sug.slice(),lv:lv||1};}
/* ---------------- the world ---------------- */
function cond(S,c){if(c==null||c==="")return true;if(Array.isArray(c))return c.every(x=>cond(S,x));
  if(c[0]==="!")return !cond(S,c.slice(1));const i=c.indexOf(":"),t=c.slice(0,i),v=c.slice(i+1);
  if(t==="f")return !!S.fl[v];
  if(t==="r"){const m=/^(\w+)(>=|<=|<|>)(-?\d+)$/.exec(v);if(!m)return false;const r=S.rep[m[1]]||0,n=+m[3];return m[2]===">="?r>=n:m[2]==="<="?r<=n:m[2]==="<"?r<n:r>n;}
  if(t==="an")return S.heroes.some(h=>h&&h.an===v);if(t==="bg")return S.heroes.some(h=>h&&h.bg===v);if(t==="cl")return S.heroes.some(h=>h&&h.cl===v);
  if(t==="it")return S.items.includes(v);if(t==="g")return S.gold>=+v;return false;}
/* the badge a special choice gets, so you can see why it's there */
function tagOf(c){const r=[].concat(c.req||[]);for(const x of r){const i=x.indexOf(":"),t=x.slice(0,i),v=x.slice(i+1);
    if(t==="an")return AN[v].e+" "+AN[v].n;if(t==="bg")return BG[v].e+" "+BG[v].n;if(t==="cl")return CL[v].e+" "+CL[v].n;
    if(t==="f"&&v==="gob_friends")return "👺 Goblin friends";if(t==="f"&&v==="smug_paid")return "🦜 Old deal";if(t==="f"&&v==="maren")return "🔥 Maren's gift";if(t==="f"&&v==="mer_ally")return "🧜 Merfolk friends";if(t==="f"&&v==="tobin")return "📜 Tobin's secret";}
  return "";}
const route=(S,g)=>{if(!Array.isArray(g))return g;for(const x of g){if(!Array.isArray(x))return x;if(cond(S,x[0]))return x[1];}return null;};
function setFl(S,a){for(const f of a||[])S.fl[f]=1;}
function addRep(S,o){for(const [f,v] of Object.entries(o||{})){const old=S.rep[f]||0;S.rep[f]=Math.max(-3,Math.min(3,old+v));
    if(S.rep[f]!==old){const t=`${FAC[f][1]} ${FAC[f][0]} ${v>0?"likes you more":"likes you less"}`;S.notes.push([t,v>0]);log(S,t);}}}
const node=S=>ADV[S.adv].nodes[S.node];
function choiceOk(S,c){if(c.req&&!cond(S,c.req))return false;if(c.need){if(c.need.gold&&S.gold<c.need.gold)return false;if(c.need.item&&!S.items.includes(c.need.item))return false;}return true;}
const choiceShown=(S,c)=>!c.req||cond(S,c.req);
function price(S,N,it){const r=S.rep[N.shop.fac]||0,p=ITEM[it].p;return Math.max(Math.ceil(p/2),p-2*r);}
const shopShut=(S,N)=>(S.rep[N.shop.fac]||0)<=-2;
function canBuy(S,N,it){if(!N.shop||shopShut(S,N)||!N.shop.it.includes(it)||S.gold<price(S,N,it))return false;if(it==="blade")return S.up.dmg<2;if(it==="mail")return S.up.ac<2;return true;}
/* ---------------- rules ---------------- */
const alive=S=>S.heroes.filter(h=>h&&h.hp>0);
const roll=(S,n,d)=>{let t=0;for(let i=0;i<n;i++)t+=1+Math.floor(S.R()*d);return t;};
function log(S,t){S.log.push(t);if(S.log.length>50)S.log.shift();}
function hurt(S,k,n){const h=S.heroes[k];h.hp=Math.max(0,h.hp-n);return n;}
/* computer heroes take their time, so people can read what happens: longer for long story text */
const DEF={min:1,max:4,sync:true,aiDelay(S){if(S.phase==="scene"){const N=node(S);return Math.min(8000,2200+(N.x||"").length*30);}if(S.phase==="who")return 2200;if(S.phase==="roll")return 1600;if(S.phase==="fight")return 2300;return 1300;},
  /* opts carry the remembered world and who's a computer hero: reputation (2 bytes, a nibble each, +3), flags (2), finished adventures (1), computer seats (1) */
  init(pl,seed,opts){const R=window.__rng(seed),o=opts||[],rep={},fl={};FACS.forEach((f,i)=>{const b=o[i>>1];rep[f]=b==null?0:Math.max(-3,Math.min(3,((b>>((i&1)*4))&15)-3));});
    const bits=(o[2]||0)|((o[3]||0)<<8);WF.forEach((f,i)=>{if(bits&(1<<i))fl[f]=1;});const cpu=pl.map((p,i)=>!!((o[5]||0)&(1<<i)));
    return {R,names:pl.map(p=>p.name),n:pl.length,phase:"pick",heroes:pl.map(()=>null),adv:null,node:null,lead:0,gold:10,potions:pl.length===1?4:pl.length===2?3:2,items:[],
      pend:null,res:null,fight:null,log:[],rollN:0,last:null,fights:0,inspire:pl.map(()=>0),outcome:null,fl,rep,done:o[4]||0,cpu,up:{dmg:0,ac:0},lk:pl.map(()=>0),notes:[],endN:0,ending:null};},
  turn(S){if(S.phase==="pick"){const i=S.heroes.findIndex(h=>!h);return i;}
    if(S.phase==="adv")return 0;if(S.phase==="scene"||S.phase==="who"||S.phase==="result")return S.lead;if(S.phase==="roll")return S.pend.k;
    if(S.phase==="fight")return S.fight.order[S.fight.i];return -1;},
  check(S,k,a){try{return legal(S,k,a);}catch(e){return false;}},
  apply(S,k,a){if(!legal(S,k,a))return false;act(S,k,a);return true;},
  ai(S,k){return aiMove(S,k);}};
function legal(S,k,a){const t=a[0];if(k<0||k>=S.n)return false;
  if(t===1){if(S.phase!=="pick"||S.heroes[k]||a.length<12)return false;const an=ANS[a[2]];
    return a[1]<CLS.length&&!!an&&a[3]<BGS.length&&a[4]<TRS.length&&a[5]<POR[an].length&&ptsOk(unpackP(a[6],a[7]))&&a[8]>=1&&a[8]<=30;}
  if(t===11)return S.phase==="adv"&&k===0&&a[1]<ADVS.length;
  if(t===9){if(S.potions<1)return false;const h=S.heroes[a[1]];if(!h||h.hp>=h.max)return false;   // potion: out of a fight anyone, in a fight it's your action
    if(S.phase==="fight")return S.fight.order[S.fight.i]===k;return ["scene","who","roll","result"].includes(S.phase);}
  if(t===2){if(S.phase!=="scene")return false;const N=node(S);if(k!==S.lead&&!N.shop)return false;const c=(N.c||[])[a[1]];return !!c&&choiceOk(S,c);}   // at a shop anyone may move on
  if(t===14){if(S.phase!=="scene")return false;const N=node(S);return !!N.shop&&canBuy(S,N,N.shop.it[a[1]]);}
  if(t===12)return S.phase==="who"&&k===S.lead&&S.heroes[a[1]]&&S.heroes[a[1]].hp>0;
  if(t===3)return S.phase==="roll"&&k!==S.pend.k&&S.heroes[k].hp>0&&!S.pend.help.includes(k)&&S.pend.help.length<2;
  if(t===4)return S.phase==="roll"&&k===S.pend.k;
  if(t===8){if(S.phase==="result")return true;if(S.phase!=="scene")return false;const N=node(S);return !N.c&&!N.f&&!N.end;}
  if(t===5||t===6||t===7){if(S.phase!=="fight"||S.fight.order[S.fight.i]!==k)return false;if(t===7)return true;
    const h=S.heroes[k];if(t===6&&h.ab<1)return false;const cl=h.cl;
    if(t===5||(t===6&&(cl==="fighter"||cl==="rogue"))){const e=S.fight.en[a[1]];return !!e&&e.hp>0;}
    if(t===6&&cl==="wizard")return true;if(t===6){const h2=S.heroes[a[1]];return !!h2&&(cl==="cleric"||h2.hp>0);}return false;}
  if(t===10)return S.phase==="end"&&k===0;
  return false;}
function goNode(S,id,depth){S.node=id;const N=node(S);S.pend=null;S.res=null;
  if(N.set)setFl(S,N.set);if(N.rep)addRep(S,N.rep);
  if(N.rest){for(const h of S.heroes)if(h&&h.hp>0)h.hp=Math.min(h.max,h.hp+Math.ceil(h.max*N.rest));}
  if(N.gain)gain(S,N.gain);
  if(!N.t){goNode(S,route(S,N.go),(depth||0)+1);return;}   // a crossroads: straight on to the right place
  if(N.f){startFight(S,N);return;}
  if(N.end)return finish(S,N);
  S.phase="scene";}
function finish(S,N){S.phase="end";S.outcome=N.end;S.endN++;const win=N.end==="win";let g=0;const got=[];
  if(win){g=(N.gold||0);for(const [c,v] of N.goldIf||[])if(cond(S,c))g+=v;S.gold+=g;
    const tr=(N.tr||[]).slice();for(const [c,v] of N.trIf||[])if(cond(S,c))tr.push(v);
    for(const t of tr){const b=1<<TROI[t];let any=false;for(const h of S.heroes)if(h&&!(h.tro&b)){h.tro|=b;any=true;calc(h);}got.push(t);void any;}
    S.done|=1<<ADVS.indexOf(S.adv);}
  else{S.fl[S.adv==="lantern"?"lan_lost":"bell_lost"]=1;}
  S.ending={en:N.en||N.t,gold:g,tr:got,win};
  log(S,win?`🏆 ${ADV[S.adv].n}: ${N.en||"done"}!`:"The adventure ends here…");}
function gain(S,g){if(g.gold)S.gold=Math.max(0,S.gold+g.gold);if(g.item&&!S.items.includes(g.item))S.items.push(g.item);if(g.potion)S.potions+=g.potion;}
/* the lead goes round the people at the table; computer heroes don't lead when a person can */
function nextLead(S){const people=S.cpu&&S.cpu.some(c=>!c);for(let i=1;i<=S.n;i++){const k=(S.lead+i)%S.n;if(S.heroes[k]&&S.heroes[k].hp>0&&!(people&&S.cpu[k])){S.lead=k;return;}}
  for(let i=1;i<=S.n;i++){const k=(S.lead+i)%S.n;if(S.heroes[k]&&S.heroes[k].hp>0){S.lead=k;return;}}}
function act(S,k,a){const t=a[0],nm=S.names[k];if(t!==14&&t!==3&&t!==9)S.notes=[];
  if(t===1){const an=ANS[a[2]],up=a[11]||0;const h={cl:CLS[a[1]],an,bg:BGS[a[3]],tr:TRS[a[4]],po:a[5],pa:unpackP(a[6],a[7]),lv:a[8],tro:a[9]&63,hp:null,ab:2,def:0};calc(h);h.hp=h.max;S.heroes[k]=h;
    S.gold+=(a[10]||0)*5+(h.bg==="noble"?15:0);S.up.dmg=Math.max(S.up.dmg,Math.min(2,up&15));S.up.ac=Math.max(S.up.ac,Math.min(2,up>>4));
    log(S,`${nm} is a ${AN[an].n.toLowerCase()} ${CL[h.cl].n.toLowerCase()}${h.lv>1?` (level ${h.lv})`:""}`);if(S.heroes.every(Boolean))S.phase="adv";return;}
  if(t===11){S.adv=ADVS[a[1]];S.lk=S.heroes.map(()=>0);log(S,`📖 ${ADV[S.adv].n}`);goNode(S,ADV[S.adv].start);return;}
  if(t===9){const h=S.heroes[a[1]];S.potions--;const v=roll(S,2,4)+2;h.hp=Math.min(h.max,h.hp+v);log(S,`🧪 ${S.names[a[1]]} drinks a potion: +${v} HP`);if(S.phase==="fight")fightNext(S);return;}
  if(t===14){const N=node(S),it=N.shop.it[a[1]],p=price(S,N,it);S.gold-=p;
    if(it==="potion")S.potions++;if(it==="meal")for(const h of S.heroes)if(h&&h.hp>0)h.hp=Math.min(h.max,h.hp+6);if(it==="blade")S.up.dmg++;if(it==="mail")S.up.ac++;
    log(S,`🛒 ${nm} buys ${ITEM[it].n.toLowerCase()} for ${p} gold`);S.buyN=(S.buyN||0)+1;return;}
  if(t===2){const c=node(S).c[a[1]];if(c.set)setFl(S,c.set);if(c.rep)addRep(S,c.rep);if(c.take)S.items=S.items.filter(x=>x!==c.take);
    if(!c.s){if(c.gain)gain(S,c.gain);log(S,`${nm}: ${c.l}`);
      if(c.tx){S.res={txt:c.tx,ok:true,next:c.go};S.phase="result";nextLead(S);return;}
      nextLead(S);goNode(S,c.go);return;}
    log(S,`${nm}: ${c.l}`);S.pend={c:a[1],k:-1,help:[]};S.phase="who";return;}
  if(t===12){S.pend.k=a[1];S.phase="roll";return;}
  if(t===3){S.pend.help.push(k);log(S,`🤝 ${nm} helps (+2)`);return;}
  if(t===4){const c=node(S).c[S.pend.c],h=S.heroes[k],b=mod(h,c.s,true)+S.pend.help.length*2+(S.inspire[k]||0);S.inspire[k]=0;
    let d=1+Math.floor(S.R()*20),lucky=0;const pass=x=>x===20||(x!==1&&x+b>=c.dc);
    if(!pass(d)&&h.tr==="lucky"&&!S.lk[k]){S.lk[k]=1;lucky=d;d=1+Math.floor(S.R()*20);log(S,`🍀 ${nm} is lucky and rolls again`);}
    const tot=d+b,ok=pass(d);S.rollN++;S.last={n:S.rollN,k,d,b,tot,dc:c.dc,ok,st:c.s,lucky};
    log(S,`🎲 ${nm} rolls ${d} ${b>=0?"+":"−"} ${Math.abs(b)} = ${tot} vs ${c.dc}: ${ok?"success":"fail"}${d===20?" (critical!)":d===1?" (fumble!)":""}`);
    let txt=ok?c.okx:c.nox;
    if(ok&&c.gain)gain(S,c.gain);if(ok)setFl(S,c.oks);else setFl(S,c.nos);addRep(S,ok?c.okr:c.nor);
    if(!ok&&c.hurt){const [who,[n,dd]]=c.hurt;if(who==="all"){const v=roll(S,n,dd);for(let i=0;i<S.n;i++)if(S.heroes[i]&&S.heroes[i].hp>0)hurt(S,i,v);txt+=` Everyone loses ${v} HP.`;}
      else{const v=roll(S,n,dd);hurt(S,k,v);txt+=` ${nm} loses ${v} HP.`;}}
    S.res={txt,ok,next:ok?c.ok:c.no};S.phase="result";
    if(!alive(S).length){S.res.next=Object.keys(ADV[S.adv].nodes).find(x=>ADV[S.adv].nodes[x].end==="lose");}
    return;}
  if(t===8){if(S.phase==="result"){const nx=route(S,S.res.next);nextLead(S);goNode(S,nx);}else{nextLead(S);goNode(S,route(S,node(S).go));}return;}
  if(t===10){for(const h of S.heroes)if(h){h.hp=h.max;h.ab=2;h.def=0;}
    const keep={};for(const f of WF)if(S.fl[f])keep[f]=1;S.fl=keep;
    S.items=[];S.potions=Math.max(S.potions,2);S.phase="adv";S.adv=null;S.node=null;S.outcome=null;S.fight=null;S.ending=null;S.notes=[];log(S,"A new adventure…");return;}
  if(t===5||t===6||t===7)fightAct(S,k,a);}
/* ---------------- fights ---------------- */
// fights scale with the party: fewer and weaker enemies for one or two heroes
function startFight(S,N){const ms=N.f.m.slice(0,S.n===1?2:S.n===2?3:9),mult=[0.42,0.75,1.25,1.6][S.n-1]||1,lvl=Math.max(0,Math.round((S.heroes.reduce((a,h)=>a+(h?h.lv:1),0)/S.n-1)*1.5));
  const en=ms.map((m,i)=>{const M=MON[m],hp=Math.max(4,Math.round((M[2]+lvl*3)*mult));
    return {m,n:M[0]+(ms.filter(x=>x===m).length>1?" "+"ABCD"[ms.slice(0,i).filter(x=>x===m).length]:""),e:M[1],hp,max:hp,ac:M[3]-(S.n===1?1:0),atk:M[4]+Math.floor(lvl/2)-(S.n===1?1:0),dmg:M[5]};});
  const helps=[];let weak=N.f.weak||0;for(const [c,v,txt] of N.f.weakIf||[])if(cond(S,c)){weak+=v;helps.push(txt);}
  if(weak)en[0].hp=en[0].max=Math.max(8,en[0].max-weak);
  for(const h of S.heroes)if(h)h.def=0;
  S.fight={en,order:S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]),i:0,round:1,ev:[],evn:0,win:N.f.win,lose:N.f.lose,gold:N.gold||0,helps};S.phase="fight";
  log(S,`⚔ ${en.map(e=>e.n).join(", ")}!`);for(const t of helps)log(S,t);skipDown(S);}
function fev(S,o){const F=S.fight;F.evn++;o.n=F.evn;F.ev.push(o);if(F.ev.length>12)F.ev.shift();}
function skipDown(S){const F=S.fight;let g=0;while(g++<10&&F.i<F.order.length&&S.heroes[F.order[F.i]].hp<=0)F.i++;if(F.i>=F.order.length)enemiesAct(S);}
function fightNext(S){const F=S.fight;if(!F)return;if(F.en.every(e=>e.hp<=0))return fightWon(S);F.i++;skipDown(S);}
function fightAct(S,k,a){const F=S.fight,h=S.heroes[k],c=CL[h.cl],nm=S.names[k],t=a[0];h.def=0;
  const hit=(e,always,extra,dbl)=>{const d=1+Math.floor(S.R()*20),tot=d+mod(h,c.atk)+1+(S.inspire[k]||0);S.inspire[k]=0;const ok=always||d===20||(d!==1&&tot>=e.ac);
    if(!ok){log(S,`${nm} attacks ${e.n}: ${d} = ${tot} vs AC ${e.ac}, miss`);fev(S,{k:"miss",t:F.en.indexOf(e),who:k});return;}
    let dmg=roll(S,1,c.die)+Math.max(0,mod(h,c.atk))+(extra||0)+h.db+S.up.dmg;if(d===20||dbl)dmg*=2;e.hp=Math.max(0,e.hp-dmg);
    log(S,`${nm} hits ${e.n} for ${dmg}${d===20?" (critical!)":""}${e.hp<=0?`: ${e.n} falls`:""}`);fev(S,{k:"hit",t:F.en.indexOf(e),v:dmg,who:k,kill:e.hp<=0});};
  if(t===7){h.def=4;log(S,`🛡 ${nm} defends (+4 armour this round)`);fev(S,{k:"def",who:k});}
  else if(t===5)hit(F.en[a[1]]);
  else{h.ab--;const cl=h.cl;
    if(cl==="fighter")hit(F.en[a[1]],false,6);else if(cl==="rogue")hit(F.en[a[1]],true,0,true);
    else if(cl==="wizard"){const v=roll(S,2,6)+mod(h,"wit");for(const e of F.en)if(e.hp>0){e.hp=Math.max(0,e.hp-v);}log(S,`🔥 ${nm} casts Fireball: ${v} to every enemy`);fev(S,{k:"fire",v,who:k});}
    else if(cl==="cleric"){const h2=S.heroes[a[1]],v=roll(S,2,6)+3;h2.hp=Math.min(h2.max,h2.hp+v);log(S,`✨ ${nm} heals ${S.names[a[1]]} for ${v}`);fev(S,{k:"heal",to:a[1],v});}
    else if(cl==="bard"){const h2=S.heroes[a[1]],v=roll(S,1,6);h2.hp=Math.min(h2.max,h2.hp+v);S.inspire[a[1]]=4;log(S,`🎻 ${nm} inspires ${S.names[a[1]]}: +${v} HP and +4 on the next roll`);fev(S,{k:"heal",to:a[1],v});}}
  fightNext(S);}
function enemiesAct(S){const F=S.fight;
  for(const e of F.en){if(e.hp<=0)continue;const targets=S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]&&S.heroes[i].hp>0);if(!targets.length)break;
    const ti=targets[Math.floor(S.R()*targets.length)],h=S.heroes[ti],ac=h.ac+S.up.ac+h.def,d=1+Math.floor(S.R()*20),tot=d+e.atk;
    if(d===20||(d!==1&&tot>=ac)){let v=Math.max(1,roll(S,e.dmg[0],e.dmg[1])+Math.floor(e.atk/2)-(S.n===1?2:S.n===2?1:0));if(d===20)v*=2;hurt(S,ti,v);log(S,`${e.e} ${e.n} hits ${S.names[ti]} for ${v}${h.hp<=0?`: ${S.names[ti]} is down!`:""}`);fev(S,{k:"ehit",from:F.en.indexOf(e),to:ti,v,down:h.hp<=0});}
    else{log(S,`${e.e} ${e.n} attacks ${S.names[ti]} and misses`);fev(S,{k:"emiss",from:F.en.indexOf(e),to:ti});}}
  if(!alive(S).length){fightLost(S);return;}
  for(const h of S.heroes)if(h)h.def=0;F.round++;F.i=0;skipDown(S);}
function fightWon(S){const F=S.fight;S.fights++;let lvUp=false;
  for(const h of S.heroes){if(!h)continue;if(h.hp<=0)h.hp=1;}
  if(S.fights%2===0){for(const h of S.heroes)if(h){h.lv++;calc(h);h.hp=Math.min(h.max,h.hp+4);h.ab=Math.min(3,h.ab+1);}lvUp=true;}
  const g=F.gold+5*F.en.length;S.gold+=g;if(S.R()<0.35)S.potions++;
  log(S,`🏆 Victory! +${g} gold${lvUp?` · ⭐ everyone goes up a level`:""}`);
  const win=F.win;S.fight=null;S.lastWin={g,lvUp,n:S.rollN+1000+S.fights};goNode(S,win);}
function fightLost(S){const F=S.fight;S.fight=null;for(const h of S.heroes)if(h)h.hp=Math.max(1,Math.ceil(h.max/3));goNode(S,F.lose);}
/* ---------------- the computer heroes ---------------- */
function best(S,c){let bk=-1,bv=-99;for(let i=0;i<S.n;i++){const h=S.heroes[i];if(!h||h.hp<=0)continue;const v=mod(h,c.s,true);if(v>bv){bv=v;bk=i;}}return bk;}
function aiMove(S,k){const a=aiPick(S,k);if(a&&legal(S,k,a))return a;   /* never get stuck on a move that isn't allowed */
  if(S.phase==="fight"){const F=S.fight,i=F.en.findIndex(e=>e.hp>0);return i>=0?[5,i]:[7];}return null;}
function aiPick(S,k){
  if(S.phase==="pick"){const lv=Math.max(1,...S.heroes.filter(Boolean).map(h=>h.lv));const b=randomBuild(lv);
    const taken=S.heroes.filter(Boolean).map(h=>h.cl),free=CLS.filter(c=>!taken.includes(c));if(free.length){b.cl=free[Math.floor(Math.random()*free.length)];b.pa=CL[b.cl].sug.slice();}
    return buildAct(b);}
  if(S.phase==="adv")return [11,0];
  if(S.phase==="scene"){const N=node(S);if(!N.c||N.shop)return null;   /* shops: people decide when to move on */
    let bi=-1,bs=-99;N.c.forEach((c,i)=>{if(!choiceOk(S,c))return;const sc=c.req?20:c.s?mod(S.heroes[best(S,c)],c.s,true)-c.dc+12:(c.need?9:8);if(sc>bs){bs=sc;bi=i;}});return bi>=0?[2,bi]:null;}
  if(S.phase==="who")return [12,best(S,node(S).c[S.pend.c])];
  if(S.phase==="roll")return [4];if(S.phase==="result")return null;   /* people press Continue themselves, after reading */
  if(S.phase==="fight"){const F=S.fight,h=S.heroes[k],en=F.en.map((e,i)=>[e,i]).filter(x=>x[0].hp>0).sort((a,b)=>a[0].hp-b[0].hp),weak=S.heroes.map((x,i)=>[x,i]).filter(x=>x[0]).sort((a,b)=>a[0].hp/a[0].max-b[0].hp/b[0].max)[0];
    if(h.ab>0&&h.cl==="cleric"&&weak&&weak[0].hp/weak[0].max<0.45)return [6,weak[1]];
    if(h.ab>0&&h.cl==="wizard"&&en.length>=2)return [6,0];
    if(h.ab>0&&(h.cl==="fighter"||h.cl==="rogue")&&en.length&&en[en.length-1][0].hp>8)return [6,en[en.length-1][1]];
    if(h.ab>0&&h.cl==="bard"&&weak&&weak[0].hp>0&&weak[0].hp/weak[0].max<0.5)return [6,weak[1]];
    if(h.hp/h.max<0.3&&S.potions>0)return [9,k];
    return en.length?[5,en[0][1]]:[7];}
  return null;}
/* ---------------- saving: your hero and the world, on this phone ---------------- */
function store(k,v){try{if(v===undefined){const s=localStorage.getItem(k);return s?JSON.parse(s):null;}localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}return v;}
function saveHero(S,me){const h=S.heroes[me];if(!h)return;store("pt-rq-hero",{cl:h.cl,an:h.an,bg:h.bg,tr:h.tr,po:h.po,pa:h.pa,lv:h.lv,tro:h.tro,gs:Math.min(255,Math.floor(S.gold/S.n/5)),up:S.up.dmg|(S.up.ac<<4)});}
function saveWorld(S){let bits=0;WF.forEach((f,i)=>{if(S.fl[f])bits|=1<<i;});store("pt-rq-world",{rep:S.rep,bits,done:S.done});}
/* the start options: the world as this phone remembers it */
function worldOpts(R){const w=store("pt-rq-world")||{},r=w.rep||{},n=f=>Math.max(0,Math.min(6,(r[f]||0)+3));let cpu=0;if(R&&R.players)R.players.forEach((p,i)=>{if(p&&p.ai)cpu|=1<<i;});
  return [n("brin")|(n("salt")<<4),n("gob")|(n("mer")<<4),(w.bits||0)&255,((w.bits||0)>>8)&255,(w.done||0)&255,cpu];}
