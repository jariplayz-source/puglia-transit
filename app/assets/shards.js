/* Shards: a two-player card battle with original cards. Pick a champion, play units and spells, move units onto two
   battlefields, conquer them for points and hold them for more. First to 10 points wins. Runs on the shared room log
   (room.js), so it plays the same on one phone against the computer, over Bluetooth or online. Loaded by games.js. */
(function(){
/* ---------------- the cards ----------------
   u = unit [cost, might, keywords, effect]; s = spell [cost, effect]. Might is both attack and health.
   Keywords: swift (can move the turn it's played), guard (takes hits first). */
const DOM={E:["Ember","#e0533c","🔥","Fast and fierce: burn and rush."],T:["Tide","#2f7fd0","🌊","Patient control: draw cards, push enemies back."],
  G:["Grove","#2e9d5b","🌿","Big, tough units that grow."],S:["Storm","#c49a1a","⚡","Swift units and sudden lightning."],N:["Neutral","#7a7f8c","◇",""]};
const CHAMP={E:{n:"Kira, Ash Dancer",ab:"Spark",ac:1,at:"Deal 1 damage to a unit.",tg:"unit"},T:{n:"Maelis, Deep Oracle",ab:"Insight",ac:2,at:"Draw a card.",tg:null},
  G:{n:"Bramblemaw",ab:"Nurture",ac:1,at:"Give one of your units +1 might for good.",tg:"mine"},S:{n:"Zephra, Sky Runner",ab:"Gust",ac:1,at:"One of your units may move again this turn.",tg:"mine"}};
// id: [domain, name, emoji, type, cost, might, keywords, effect, text]
const C={
 e1:["E","Cinder Pup","🐕","u",1,2,"swift","",""],e2:["E","Ash Raider","🏹","u",2,3,"swift","",""],e3:["E","Flame Lancer","🔱","u",3,3,"","dmg1","When played: deal 1 damage to an enemy unit."],
 e4:["E","Blaze Brute","👹","u",4,5,"","",""],e5:["E","Kira, Ash Dancer","💃","u",5,5,"swift","conqDmg2","Champion. When she conquers: deal 2 damage to the weakest enemy unit."],
 e6:["E","Firebolt","☄️","s",1,0,"","dmg2","Deal 2 damage to a unit."],e7:["E","Inferno","🌋","s",4,0,"","dmgAt2","Deal 2 damage to every enemy unit at one battlefield."],
 e8:["E","War Drums","🥁","s",2,0,"","buffAll2","Your units get +2 might this turn."],e9:["E","Smoke Screen","💨","s",1,0,"","toBase","Send an enemy unit back to its base."],
 t1:["T","Reef Sprite","🧚","u",1,1,"","draw1","When played: draw a card."],t2:["T","Shell Guard","🐚","u",2,3,"guard","",""],t3:["T","Tidecaller","🧜","u",3,3,"","bounce2","When played: return an enemy unit with 2 might or less to its owner's hand."],
 t4:["T","Deep Leviathan","🐋","u",6,7,"guard","",""],t5:["T","Maelis, Deep Oracle","🔮","u",5,4,"","upkeepDraw","Champion. At the start of your turn: draw a card."],
 t6:["T","Undertow","🌀","s",2,0,"","toBase","Send an enemy unit back to its base."],t7:["T","Foresight","📜","s",2,0,"","draw2","Draw 2 cards."],
 t8:["T","Riptide","🌊","s",3,0,"","bounce","Return a unit to its owner's hand."],t9:["T","Mist Wall","🌫️","u",3,4,"guard","",""],
 g1:["G","Seedling","🌱","u",1,2,"","",""],g2:["G","Moss Boar","🐗","u",2,3,"","",""],g3:["G","Vinecaller","🌿","u",3,2,"","buff2","When played: give a unit +2 might for good."],
 g4:["G","Old Grove Bear","🐻","u",4,6,"","",""],g5:["G","Bramblemaw","🌳","u",6,7,"guard","",""+"Champion. Guard."],
 g6:["G","Overgrowth","🍄","s",2,0,"","buff3","Give a unit +3 might for good."],g7:["G","Wild Growth","🌾","s",1,0,"","energy2","Get 2 extra energy this turn."],
 g8:["G","Thorn Hedge","🌵","u",2,4,"guard","",""],g9:["G","Ancient Stag","🦌","u",5,6,"swift","",""],
 s1:["S","Gale Kit","🦊","u",1,1,"swift","",""],s2:["S","Sky Scout","🕊️","u",2,2,"swift","draw1","Swift. When played: draw a card."],s3:["S","Thunder Hawk","🦅","u",3,3,"swift","",""],
 s4:["S","Storm Giant","🌩️","u",5,5,"swift","",""],s5:["S","Zephra, Sky Runner","🌪️","u",4,4,"swift","conqDraw","Champion. Swift. When she conquers: draw a card."],
 s6:["S","Lightning","⚡","s",2,0,"","dmg3","Deal 3 damage to a unit."],s7:["S","Tailwind","🍃","s",1,0,"","rally","Your units that already moved this turn may move again."],
 s8:["S","Chain Spark","✨","s",3,0,"","dmgAll1","Deal 1 damage to every enemy unit."],s9:["S","Static Field","🔌","s",2,0,"","weakAt1","Enemy units at one battlefield get −1 might this turn."],
 n1:["N","Wanderer","🧭","u",1,1,"","",""],n2:["N","Shardling","💎","u",2,2,"","",""],n3:["N","Watchtower Knight","🛡️","u",3,4,"guard","",""],
 n4:["N","Rift Golem","🗿","u",4,4,"","",""],n5:["N","Bolster","💪","s",2,0,"","buff1draw","Give a unit +1 might for good and draw a card."],n6:["N","Recall","↩️","s",0,0,"","recall","Bring one of your units back to your base."]};
const IDS=Object.keys(C),CI=id=>IDS.indexOf(id);
function deckFor(d,R){const own=IDS.filter(k=>C[k][0]===d),neu=IDS.filter(k=>C[k][0]==="N");const list=[];own.forEach(k=>{list.push(k,k);});neu.forEach(k=>{list.push(k,k);});
  return shuffle(list.map(CI),R);}
const TARGET={dmg1:"enemy",dmg2:"unit",dmg3:"unit",toBase:"enemyField",bounce2:"enemySmall",bounce:"unit",buff2:"unit",buff3:"unit",buff1draw:"unit",recall:"mineField",dmgAt2:"field",weakAt1:"field"};
const rngf=window.__rng,shuffle=window.__shuffle;
const WIN=10,BFN=["The Shattered Bridge","Crystal Grove"];

/* ---------------- the rules ---------------- */
const DEF={min:2,max:2,aiDelay:750,
  init(pl,seed){const R=rngf(seed);return {names:pl.map(p=>p.name),n:2,R,phase:"pick",dom:[null,null],deck:[[],[]],hand:[[],[]],units:[],uid:1,energy:[0,0],extra:[0,0],turnNo:[0,0],
    pts:[0,0],ctrl:[-1,-1],turn:Math.floor(R()*2),abUsed:false,win:-1,log:[],ev:[],conqThisTurn:[false,false]};},
  turn:S=>S.win>=0?-1:S.phase==="pick"?(S.dom[0]==null?0:S.dom[1]==null?1:-1):S.turn,
  check(S,k,a){try{return legal(S,k,a);}catch(e){return false;}},
  apply(S,k,a){if(!legal(S,k,a))return false;doAct(S,k,a);return true;},
  ai(S,k){return aiMove(S,k);}};
const U=(S,id)=>S.units.find(u=>u.id===id);
const mightOf=u=>Math.max(0,u.m+u.tmp);
const at=(S,loc,owner)=>S.units.filter(u=>u.loc===loc&&(owner==null||u.o===owner));   // loc: 0 = base, 1 and 2 = battlefields
function legal(S,k,a){if(S.win>=0)return false;const t=a[0];
  if(S.phase==="pick")return t===5&&a[1]<4&&S.dom[k]==null;
  if(k!==S.turn)return false;
  if(t===4)return true;   // end turn
  if(t===1){const hi=a[1];if(hi>=S.hand[k].length)return false;const c=C[IDS[S.hand[k][hi]]];if(c[4]>S.energy[k]+S.extra[k])return false;return targetOk(S,k,c[7],a[2]);}
  if(t===2){const u=U(S,a[1]),d=a[2];if(!u||u.o!==k||d>2||d===u.loc)return false;if(u.moved>=u.moves)return false;if(u.fresh&&!u.swift)return false;
    if(d>0&&at(S,d,k).length>=4)return false;return true;}
  if(t===3){if(S.abUsed)return false;const ch=CHAMP[S.dom[k]];if(ch.ac>S.energy[k]+S.extra[k])return false;return ch.tg==null||targetOk(S,k,ch.tg==="unit"?"dmg1x":"buff1self",a[1]);}
  return false;}
function targetOk(S,k,eff,t){const need=TARGET[eff]||(eff==="dmg1x"?"unit":eff==="buff1self"?"mine":null);if(!need)return true;
  if(need==="field")return t===1||t===2;
  const u=U(S,t);if(!u)return need==="enemy"&&!S.units.some(x=>x.o!==k);   // "deal 1 to an enemy" with no enemies: allowed, does nothing
  if(need==="enemy")return u.o!==k;if(need==="enemyField")return u.o!==k&&u.loc>0;if(need==="enemySmall")return u.o!==k&&mightOf(u)<=2;
  if(need==="mine")return u.o===k;if(need==="mineField")return u.o===k&&u.loc>0;return true;}
function spend(S,k,c){let x=c;const e=Math.min(S.extra[k],x);S.extra[k]-=e;x-=e;S.energy[k]-=x;}
function draw(S,k,n){for(let i=0;i<n;i++){if(!S.deck[k].length)return;const c=S.deck[k].pop();if(S.hand[k].length<9)S.hand[k].push(c);}}
function say(S,t){S.ev.push(t);if(S.ev.length>4)S.ev.shift();}
function damage(S,u,n){u.dmg=(u.dmg||0)+n;if(u.dmg>=mightOf(u))die(S,u);}
function die(S,u){S.units=S.units.filter(x=>x!==u);}
function effect(S,k,eff,t,src){const nm=S.names[k],u=t?U(S,t):null;
  switch(eff){
    case "dmg1":if(u)damage(S,u,1);break;case "dmg2":if(u)damage(S,u,2);break;case "dmg3":if(u)damage(S,u,3);break;
    case "dmgAt2":at(S,t,1-k).forEach(x=>damage(S,x,2));break;case "dmgAll1":S.units.filter(x=>x.o!==k).forEach(x=>damage(S,x,1));break;
    case "buffAll2":S.units.filter(x=>x.o===k).forEach(x=>x.tmp+=2);break;case "weakAt1":at(S,t,1-k).forEach(x=>{x.tmp-=1;if((x.dmg||0)>=mightOf(x))die(S,x);});break;
    case "toBase":if(u){u.loc=0;}break;case "bounce2":case "bounce":if(u){die(S,u);if(S.hand[u.o].length<9)S.hand[u.o].push(u.c);}break;
    case "buff2":if(u)u.m+=2;break;case "buff3":if(u)u.m+=3;break;case "buff1draw":if(u)u.m+=1;draw(S,k,1);break;
    case "draw1":draw(S,k,1);break;case "draw2":draw(S,k,2);break;case "energy2":S.extra[k]+=2;break;
    case "rally":S.units.filter(x=>x.o===k).forEach(x=>{if(x.moved>=x.moves)x.moves=x.moved+1;});break;
    case "recall":if(u&&u.o===k)u.loc=0;break;}}
function doAct(S,k,a){const t=a[0],nm=S.names[k];
  if(t===5){S.dom[k]="ETGS"[a[1]];say(S,`${nm} picks ${DOM[S.dom[k]][0]}`);
    if(S.dom[0]&&S.dom[1]){for(const p of [0,1]){S.deck[p]=deckFor(S.dom[p],S.R);draw(S,p,4);}draw(S,1-S.turn,1);S.phase="play";startTurn(S);}return;}
  if(t===4){endTurn(S);return;}
  if(t===1){const hi=a[1],ci=S.hand[k][hi],c=C[IDS[ci]];S.hand[k].splice(hi,1);spend(S,k,c[4]);
    if(c[3]==="u"){const u={id:S.uid++,c:ci,o:k,m:c[5],tmp:0,dmg:0,loc:0,swift:c[6].includes("swift"),guard:c[6].includes("guard"),fresh:true,moved:0,moves:1,fx:c[7]};S.units.push(u);if(S.uid>250)S.uid=1;
      say(S,`${nm} plays ${c[1]}`);if(c[7]&&TARGET[c[7]]!==undefined||["draw1"].includes(c[7]))effect(S,k,c[7],a[2],u);}
    else{say(S,`${nm} casts ${c[1]}`);effect(S,k,c[7],a[2]);}
    return;}
  if(t===3){const ch=CHAMP[S.dom[k]];spend(S,k,ch.ac);S.abUsed=true;say(S,`${nm} uses ${ch.ab}`);const u=U(S,a[1]);
    if(S.dom[k]==="E"&&u)damage(S,u,1);if(S.dom[k]==="T")draw(S,k,1);if(S.dom[k]==="G"&&u)u.m+=1;if(S.dom[k]==="S"&&u)u.moves=u.moved+1;return;}
  if(t===2){const u=U(S,a[1]),d=a[2];u.loc=d;u.moved++;if(d===0){say(S,`${nm} pulls ${C[IDS[u.c]][1]} back to base`);return;}
    const foes=at(S,d,1-k);if(foes.length)fight(S,k,d);else conquer(S,k,d,u);}}
// all your units at the battlefield against all of theirs; damage goes to guards first, then the weakest
function fight(S,k,d){const mine=at(S,d,k),foes=at(S,d,1-k),sum=l=>l.reduce((s,u)=>s+mightOf(u)-(u.dmg||0),0);let my=sum(mine),their=sum(foes);
  say(S,`⚔ Battle at ${BFN[d-1]}: ${my} against ${their}`);
  const hit=(list,n)=>{const q=list.slice().sort((a,b)=>(b.guard-a.guard)||((mightOf(a)-(a.dmg||0))-(mightOf(b)-(b.dmg||0))));for(const u of q){if(n<=0)break;const hp=mightOf(u)-(u.dmg||0);const x=Math.min(n,hp);u.dmg=(u.dmg||0)+x;n-=x;if(u.dmg>=mightOf(u))die(S,u);}};
  hit(foes,my);hit(mine,their);
  const mineLeft=at(S,d,k),foesLeft=at(S,d,1-k);
  if(mineLeft.length&&!foesLeft.length)conquer(S,k,d,mineLeft[0]);
  else if(mineLeft.length&&foesLeft.length){mineLeft.forEach(u=>{if(u.moved)u.loc=0;});say(S,"Both sides hold: the attackers fall back");}}
function conquer(S,k,d,u){if(S.ctrl[d-1]===k)return;S.ctrl[d-1]=k;S.pts[k]++;say(S,`🏳 ${S.names[k]} conquers ${BFN[d-1]} (+1)`);S.flash=[d,k];
  for(const x of at(S,d,k)){if(x.fx==="conqDmg2"){const foes=S.units.filter(y=>y.o!==k).sort((a,b)=>mightOf(a)-mightOf(b));if(foes[0])damage(S,foes[0],2);}if(x.fx==="conqDraw")draw(S,k,1);}
  if(S.pts[k]>=WIN){S.win=k;say(S,`🏆 ${S.names[k]} wins!`);}}
function startTurn(S){const k=S.turn;S.turnNo[k]++;S.energy[k]=Math.min(8,S.turnNo[k]+1);S.extra[k]=0;S.abUsed=false;
  for(const d of [1,2])if(S.ctrl[d-1]===k&&at(S,d,k).length){S.pts[k]++;say(S,`🏳 ${S.names[k]} holds ${BFN[d-1]} (+1)`);if(S.pts[k]>=WIN){S.win=k;say(S,`🏆 ${S.names[k]} wins!`);return;}}
  for(const d of [1,2])if(S.ctrl[d-1]===k&&!at(S,d,k).length&&at(S,d,1-k).length)S.ctrl[d-1]=-1;
  if(S.units.some(u=>u.o===k&&u.fx==="upkeepDraw"))draw(S,k,1);
  draw(S,k,1);}
function endTurn(S){for(const u of S.units){u.tmp=0;u.dmg=0;u.fresh=false;u.moved=0;u.moves=1;}S.turn=1-S.turn;startTurn(S);}

/* ---------------- the computer player ---------------- */
function aiMove(S,k){const a=aiPick(S,k);return legal(S,k,a)?a:[4];}   /* never get stuck on a move that isn't allowed */
function aiPick(S,k){if(S.phase==="pick")return [5,Math.floor(Math.random()*4)];
  const E=S.energy[k]+S.extra[k],hand=S.hand[k].map((ci,i)=>({ci,i,c:C[IDS[ci]]}));const foes=S.units.filter(u=>u.o!==k),mine=S.units.filter(u=>u.o===k);
  const pickTarget=eff=>{const need=TARGET[eff];if(!need)return 0;
    if(need==="field"){const f=[1,2].sort((a,b)=>at(S,b,1-k).length-at(S,a,1-k).length)[0];return at(S,f,1-k).length?f:-1;}
    if(need==="unit"&&/^buff/.test(eff)){const m=mine.filter(u=>u.loc>0).concat(mine).sort((a,b)=>mightOf(b)-mightOf(a))[0];return m?m.id:-1;}
    if(need==="unit"&&eff==="bounce"){const f=foes.sort((a,b)=>C[IDS[b.c]][4]-C[IDS[a.c]][4])[0];return f?f.id:-1;}
    const dmg={dmg1:1,dmg2:2,dmg3:3}[eff];if(dmg){const kill=foes.filter(u=>mightOf(u)-(u.dmg||0)<=dmg).sort((a,b)=>C[IDS[b.c]][4]-C[IDS[a.c]][4])[0];return kill?kill.id:(eff==="dmg1"&&!foes.length?0:-1);}
    if(need==="enemySmall"){const f=foes.find(u=>mightOf(u)<=2);return f?f.id:-1;}if(need==="enemyField"){const f=foes.filter(u=>u.loc>0).sort((a,b)=>mightOf(b)-mightOf(a))[0];return f?f.id:-1;}
    if(need==="mineField"){return -1;}if(need==="enemy"){const f=foes[0];return f?f.id:0;}return -1;};
  // 1. play the most expensive card that does something
  for(const h of hand.filter(h=>h.c[4]<=E).sort((a,b)=>b.c[4]-a.c[4])){if(h.c[7]==="buffAll2"&&!mine.some(u=>u.loc>0))continue;if(h.c[7]==="rally"||h.c[7]==="energy2"&&E<3)continue;
    const t=pickTarget(h.c[7]);if(t<0)continue;if(legal(S,k,[1,h.i,t]))return [1,h.i,t];}
  // 2. champion ability
  const ch=CHAMP[S.dom[k]];if(!S.abUsed&&ch.ac<=E){let t=0;if(S.dom[k]==="E"){const f=foes.find(u=>mightOf(u)-(u.dmg||0)<=1);t=f?f.id:-1;}else if(S.dom[k]==="G"){const m=mine.sort((a,b)=>mightOf(b)-mightOf(a))[0];t=m?m.id:-1;}else if(S.dom[k]==="S")t=-1;
    if(t>=0&&legal(S,k,[3,t]))return [3,t];}
  // 3. move: take empty battlefields, attack where we're stronger
  const ready=mine.filter(u=>u.loc===0&&u.moved<u.moves&&(!u.fresh||u.swift));
  for(const d of [1,2].sort((a,b)=>(S.ctrl[a-1]===k)-(S.ctrl[b-1]===k))){const theirs=at(S,d,1-k).reduce((s,u)=>s+mightOf(u),0),there=at(S,d,k).reduce((s,u)=>s+mightOf(u),0);
    if(!ready.length)break;
    if(!at(S,d,1-k).length&&S.ctrl[d-1]!==k){const u=ready.sort((a,b)=>mightOf(a)-mightOf(b))[0];return [2,u.id,d];}
    const avail=ready.reduce((s,u)=>s+mightOf(u),0);if(theirs&&avail+there>theirs){const u=ready.sort((a,b)=>mightOf(b)-mightOf(a))[0];return [2,u.id,d];}
    if(!theirs&&S.ctrl[d-1]===k&&!at(S,d,k).length){return [2,ready[0].id,d];}}
  return [4];}

/* ---------------- the board ---------------- */
const CSS=`.sh{display:flex;flex-direction:column;gap:6px;height:100%}
.sd-top,.sd-me{display:flex;align-items:center;gap:8px;font-size:13px}.sd-top b,.sd-me b{font-size:14px}
.sd-pts{display:flex;gap:3px}.sd-pts i{width:12px;height:12px;border-radius:50%;background:var(--chip);box-shadow:inset 0 0 0 1px var(--line)}.sd-pts i.on{background:var(--c,#f2b233);box-shadow:0 0 6px var(--c,#f2b233)}
.sd-en{margin-left:auto;font:700 13px system-ui;padding:3px 9px;border-radius:10px;background:var(--chip)}
.sd-bfs{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1;min-height:0}
.sd-bf{border-radius:16px;padding:6px;display:flex;flex-direction:column;gap:4px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12),0 4px 14px rgba(0,0,0,.25);position:relative;min-height:0;overflow:hidden;color:#fff}
.sd-bf[data-f="1"]{background:radial-gradient(ellipse at 50% 0%,#5a4a8a,#2a2246 70%)}.sd-bf[data-f="2"]{background:radial-gradient(ellipse at 50% 0%,#2f7a72,#16353a 70%)}
.sd-bf .mid{border-top:1px dashed rgba(255,255,255,.25)}
.sd-bf.tgt{box-shadow:inset 0 0 0 3px #f2b233;animation:shg 1s infinite}@keyframes shg{50%{box-shadow:inset 0 0 0 3px transparent}}
.sd-bf h4{margin:0;font:700 11.5px system-ui;text-align:center;opacity:.8}.sd-bf .flag{position:absolute;top:4px;right:6px;font-size:13px}
.sd-row{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:56px;align-content:flex-start}.sd-row.them{align-content:flex-end}
.sd-base{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;min-height:60px;padding:4px;border-radius:14px;background:var(--chip)}
.sd-u{width:50px;height:58px;border-radius:10px;border:0;padding:0;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:24px;line-height:1;box-shadow:0 2px 5px rgba(0,0,0,.25)}
.sd-u b{position:absolute;bottom:2px;right:4px;font:800 13px system-ui;text-shadow:0 1px 2px rgba(0,0,0,.6)}.sd-u .d{position:absolute;top:2px;left:3px;font:800 11px system-ui;color:#ffd0d0}
.sd-u.g::after{content:"🛡";position:absolute;top:1px;right:2px;font-size:10px}.sd-u.s::before{content:"»";position:absolute;bottom:1px;left:4px;font:800 12px system-ui}
.sd-u.sel{outline:3px solid #f2b233;transform:translateY(-3px)}.sd-u.tgt{outline:3px dashed #f2b233}.sd-u.tired{filter:saturate(.45) brightness(.85)}
.sd-hand{display:flex;gap:6px;overflow-x:auto;padding:8px 2px 2px;flex:none}
.sd-c{flex:none;width:92px;height:128px;border-radius:12px;border:0;padding:6px;text-align:left;color:#fff;display:flex;flex-direction:column;gap:2px;position:relative;box-shadow:0 3px 8px rgba(0,0,0,.3);font:600 10.5px/1.25 system-ui}
.sd-c .co{position:absolute;top:4px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:800 13px system-ui}
.sd-c .em{font-size:28px;line-height:1.1}.sd-c .nm{font:800 11.5px system-ui}.sd-c .tx{opacity:.92}.sd-c .mt{position:absolute;bottom:5px;right:7px;font:800 16px system-ui}
.sd-c.no{filter:saturate(.35) brightness(.8)}.sd-c.sel{transform:translateY(-8px);outline:3px solid #f2b233}
.sd-log{font-size:12px;color:var(--muted);text-align:center;min-height:16px}
.sd-acts{display:flex;gap:6px}.sd-acts .tl-act{min-height:46px;padding:8px}
.sd-pick{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sd-pick button{border:0;border-radius:18px;padding:14px;color:#fff;text-align:left;display:flex;flex-direction:column;gap:4px;min-height:140px;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.sd-pick b{font-size:18px}.sd-pick .e{font-size:34px}.sd-pick small{opacity:.9;font-size:12.5px;line-height:1.3}
.sd-flash{animation:shflash .9s}@keyframes shflash{30%{background:rgba(242,178,51,.45)}}`;
let X=null;
function view(R){const S=R.S,me=R.mySlot(),op=1-me,EL=X.EL();if(!document.getElementById("shCss")){const st=document.createElement("style");st.id="shCss";st.textContent=CSS;document.head.appendChild(st);}
  X.shell("Shards",R.status(),true);X.onBack(()=>X.leaveAsk(R));
  if(S.phase==="pick"){const mine=S.dom[me];
    EL.innerHTML=`<div class="gm-big">Pick your champion</div>${mine?`<p class="sv-note" style="text-align:center">You picked ${DOM[mine][0]}. Waiting for ${X.esc(S.names[op])}…</p>`:""}
      <div class="sd-pick">${"ETGS".split("").map((d,i)=>`<button data-pk="${i}" style="background:linear-gradient(150deg,${DOM[d][1]},#1c1c28)" ${mine?"disabled":""}><span class="e">${DOM[d][2]}</span><b>${DOM[d][0]}</b><small>${CHAMP[d].n}<br>${DOM[d][3]}<br><i>${CHAMP[d].ab} (${CHAMP[d].ac}⚡): ${CHAMP[d].at}</i></small></button>`).join("")}</div>
      <p class="sv-note">Units move to the two battlefields to conquer them (+1 point) and hold them (+1 point at the start of your turn). First to ${WIN} points wins.</p>`;
    EL.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{X.tapv();R.act([5,+b.dataset.pk]);});return;}
  const mine=S.turn===me&&S.win<0&&!R.pending,E=S.energy[me]+S.extra[me];let sel=view.sel&&view.R===R?view.sel:null;
  const uh=(u,cls)=>{const c=C[IDS[u.c]],m=mightOf(u);return `<button class="sd-u ${u.guard?"g":""} ${u.swift?"s":""} ${cls||""}" data-u="${u.id}" style="background:linear-gradient(150deg,${DOM[c[0]][1]},#1c1c28)">${c[2]}${u.dmg?`<span class="d">−${u.dmg}</span>`:""}<b>${m}</b></button>`;};
  const canMove=u=>mine&&u.o===me&&u.moved<u.moves&&(!u.fresh||u.swift);
  // what can be targeted right now
  let tgtU=new Set(),tgtF=new Set();
  if(sel&&sel.kind==="card"){const c=C[IDS[S.hand[me][sel.i]]];const need=TARGET[c[7]];if(need==="field"){tgtF.add(1);tgtF.add(2);}else if(need)S.units.forEach(u=>{if(legal(S,me,[1,sel.i,u.id]))tgtU.add(u.id);});}
  if(sel&&sel.kind==="ab"){S.units.forEach(u=>{if(legal(S,me,[3,u.id]))tgtU.add(u.id);});}
  if(sel&&sel.kind==="unit"){const u=U(S,sel.id);if(u)[0,1,2].forEach(d=>{if(legal(S,me,[2,u.id,d]))tgtF.add(d);});}
  const pts=k=>`<span class="sd-pts" style="--c:${DOM[S.dom[k]][1]}">${Array.from({length:WIN},(_,i)=>`<i class="${i<S.pts[k]?"on":""}"></i>`).join("")}</span>`;
  const bf=d=>`<div class="sd-bf ${tgtF.has(d)?"tgt":""} ${S.flash&&S.flash[0]===d&&view.fl!==R.log.length?"sd-flash":""}" data-f="${d}"><h4>${BFN[d-1]}</h4>${S.ctrl[d-1]>=0?`<span class="flag">${S.ctrl[d-1]===me?"🟢":"🔴"}</span>`:""}
      <div class="sd-row them">${at(S,d,op).map(u=>uh(u,tgtU.has(u.id)?"tgt":"")).join("")}</div><div class="mid"></div><div class="sd-row">${at(S,d,me).map(u=>uh(u,(sel&&sel.id===u.id?"sel ":"")+(tgtU.has(u.id)?"tgt ":"")+(canMove(u)?"":"tired"))).join("")}</div></div>`;
  const ch=CHAMP[S.dom[me]];
  EL.innerHTML=`<div class="sh">
    <div class="sd-top">${DOM[S.dom[op]][2]} <b>${X.esc(S.names[op])}</b> ${pts(op)}<span class="sd-en">🂠 ${S.hand[op].length} · ⚡${S.energy[op]}</span></div>
    <div class="sd-base" style="min-height:40px;opacity:.85">${at(S,0,op).map(u=>uh(u,tgtU.has(u.id)?"tgt":"")).join("")||`<small style="opacity:.6;align-self:center">their base</small>`}</div>
    <div class="sd-bfs">${bf(1)}${bf(2)}</div>
    <div class="sd-base ${tgtF.has(0)?"tgt":""}" data-f="0">${at(S,0,me).map(u=>uh(u,(sel&&sel.id===u.id?"sel ":"")+(tgtU.has(u.id)?"tgt ":"")+(canMove(u)?"":"tired"))).join("")||`<small style="opacity:.6;align-self:center">your base: units you play arrive here</small>`}</div>
    <div class="sd-me">${DOM[S.dom[me]][2]} <b>You</b> ${pts(me)}<span class="sd-en">⚡ ${E} · 🂠 ${S.deck[me].length}</span></div>
    <div class="sd-log">${S.win>=0?(S.win===me?"🏆 You win!":`${X.esc(S.names[S.win])} wins`):X.esc(S.ev[S.ev.length-1]||"")}</div>
    <div class="sd-hand">${S.hand[me].map((ci,i)=>{const c=C[IDS[ci]],ok=mine&&c[4]<=E;return `<button class="sd-c ${ok?"":"no"} ${sel&&sel.kind==="card"&&sel.i===i?"sel":""}" data-h="${i}" style="background:linear-gradient(160deg,${DOM[c[0]][1]},#1c1c28)"><span class="co">${c[4]}</span><span class="em">${c[2]}</span><span class="nm">${c[1]}</span><span class="tx">${c[3]==="s"?"Spell. ":""}${c[6]?c[6].replace("swift","Swift").replace("guard","Guard")+". ":""}${c[8]&&!/^Champion\. (Swift|Guard)\.$/.test(c[8])?c[8]:""}</span>${c[3]==="u"?`<span class="mt">${c[5]}</span>`:""}</button>`;}).join("")}</div>
    <div class="sd-acts">${S.win>=0?(R.host?`<button class="tl-act" id="shAgain">Play again</button>`:""):mine?`<button class="tl-act ghost" id="shAb" ${!S.abUsed&&ch.ac<=E?"":"disabled"}>${ch.ab} (${ch.ac}⚡)</button><button class="tl-act" id="shEnd">End turn</button>`:`<span class="sv-note" style="flex:1;text-align:center">${R.pending?"Sending…":X.esc(S.names[S.turn])+"'s turn…"}</span>`}</div></div>`;
  if(S.flash)view.fl=R.log.length;
  // animations: units that changed place
  const prev=view.pos&&view.R===R?view.pos:{};const now={};EL.querySelectorAll("[data-u]").forEach(e=>{now[e.dataset.u]=e.getBoundingClientRect();if(prev[e.dataset.u]){const p=prev[e.dataset.u],r=now[e.dataset.u];if(Math.abs(p.left-r.left)+Math.abs(p.top-r.top)>4)X.animateFrom(e,p,380);}});
  view.pos=now;view.R=R;
  if(S.win>=0&&view.won!==R.log.length){view.won=R.log.length;if(S.win===me)X.confetti();}
  const hint=t=>{const l=EL.querySelector(".sd-log");if(l)l.textContent=t;};
  if(sel&&sel.kind==="card")hint(TARGET[C[IDS[S.hand[me][sel.i]]][7]]?"Pick a target":"");
  if(sel&&sel.kind==="unit")hint("Tap a battlefield (or your base) to move there");if(sel&&sel.kind==="ab")hint(`${ch.ab}: pick a unit`);
  const go=a=>{view.sel=null;R.act(a);};const reselect=s=>{view.sel=s;view(R);};
  EL.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{if(!mine)return;const i=+b.dataset.h,c=C[IDS[S.hand[me][i]]];if(c[4]>E){X.toast(`Needs ${c[4]} energy`);return;}X.tapv();
    const need=TARGET[c[7]];if(!need||(need==="enemy"&&!S.units.some(u=>u.o!==me))){go([1,i,0]);return;}if(sel&&sel.kind==="card"&&sel.i===i){reselect(null);return;}reselect({kind:"card",i});});
  EL.querySelectorAll("[data-u]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(!mine)return;const id=+b.dataset.u;X.tapv();
    if(sel&&sel.kind==="card"&&tgtU.has(id)){go([1,sel.i,id]);return;}if(sel&&sel.kind==="ab"&&tgtU.has(id)){go([3,id]);return;}
    const u=U(S,id);if(u&&u.o===me&&canMove(u)){reselect(sel&&sel.id===id?null:{kind:"unit",id});return;}
    const c=C[IDS[u.c]];X.toast(`${c[1]} · ${mightOf(u)} might${c[8]?" · "+c[8]:""}`);});
  EL.querySelectorAll("[data-f]").forEach(f=>f.onclick=()=>{if(!mine||!sel)return;const d=+f.dataset.f;
    if(sel.kind==="card"&&tgtF.has(d)){X.tapv();go([1,sel.i,d]);return;}if(sel.kind==="unit"&&tgtF.has(d)){X.tapv();go([2,sel.id,d]);}});
  const ab=EL.querySelector("#shAb");if(ab)ab.onclick=()=>{X.tapv();if(!ch.tg){go([3,0]);return;}reselect(sel&&sel.kind==="ab"?null:{kind:"ab"});};
  const en=EL.querySelector("#shEnd");if(en)en.onclick=()=>{X.tapv();go([4]);};
  const ag=EL.querySelector("#shAgain");if(ag)ag.onclick=()=>{X.tapv();R.restart([]);};}

window.SHARDS={def:DEF,view,init(h){X=h;},_t:{C,IDS,legal,doAct,aiMove,DEF}};
})();
