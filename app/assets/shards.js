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
const CHAMPU={E:"e5",T:"t5",G:"g5",S:"s5"};
const KW={swift:"Swift: can move to a battlefield the same turn you play it.",guard:"Guard: in a battle, enemy damage hits this unit first."};
function deckFor(d,R){const own=IDS.filter(k=>C[k][0]===d),neu=IDS.filter(k=>C[k][0]==="N");const list=[];own.forEach(k=>{list.push(k,k);});neu.forEach(k=>{list.push(k,k);});
  return shuffle(list.map(CI),R);}
const TARGET={dmg1:"enemy",dmg2:"unit",dmg3:"unit",toBase:"enemyField",bounce2:"enemySmall",bounce:"unit",buff2:"unit",buff3:"unit",buff1draw:"unit",recall:"mineField",dmgAt2:"field",weakAt1:"field"};
const rngf=window.__rng,shuffle=window.__shuffle;
const WIN=10,BFN=["The Shattered Bridge","Crystal Grove"];

/* ---------------- the rules ---------------- */
const DEF={min:2,max:2,aiDelay:750,
  init(pl,seed){const R=rngf(seed);return {names:pl.map(p=>p.name),n:2,R,phase:"pick",dom:[null,null],deck:[[],[]],hand:[[],[]],units:[],uid:1,energy:[0,0],extra:[0,0],turnNo:[0,0],
    pts:[0,0],ctrl:[-1,-1],turn:Math.floor(R()*2),abUsed:false,win:-1,log:[],ev:[],conqThisTurn:[false,false],fx:[],fxn:0};},
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
function say(S,t){S.ev.push(t);if(S.ev.length>14)S.ev.shift();}
// what happened, for the 3D scenes (part of the shared state, so every phone sees the same)
function fx(S,e){S.fxn=(S.fxn||0)+1;e.n=S.fxn;(S.fx=S.fx||[]).push(e);if(S.fx.length>8)S.fx.shift();}
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
    if(c[3]==="u"){const u={id:S.uid++,c:ci,o:k,m:c[5],tmp:0,dmg:0,loc:0,swift:c[6].includes("swift"),guard:c[6].includes("guard"),fresh:true,moved:0,moves:1,fx:c[7]};S.units.push(u);if(S.uid>250)S.uid=1;fx(S,{k:"sum",c:ci,o:k,id:u.id});
      say(S,`${nm} plays ${c[1]}`);if(c[7]&&TARGET[c[7]]!==undefined||["draw1"].includes(c[7]))effect(S,k,c[7],a[2],u);}
    else{say(S,`${nm} casts ${c[1]}`);const tu=a[2]?U(S,a[2]):null;effect(S,k,c[7],a[2]);fx(S,{k:"spl",c:ci,o:k,tc:tu?tu.c:-1,tid:tu?tu.id:-1,kill:!!(tu&&!S.units.includes(tu)),fd:TARGET[c[7]]==="field"?a[2]:0});}
    return;}
  if(t===3){const ch=CHAMP[S.dom[k]];spend(S,k,ch.ac);S.abUsed=true;say(S,`${nm} uses ${ch.ab}`);const u=U(S,a[1]);
    if(S.dom[k]==="E"&&u)damage(S,u,1);if(S.dom[k]==="T")draw(S,k,1);if(S.dom[k]==="G"&&u)u.m+=1;if(S.dom[k]==="S"&&u)u.moves=u.moved+1;return;}
  if(t===2){const u=U(S,a[1]),d=a[2];u.loc=d;u.moved++;if(d===0){say(S,`${nm} pulls ${C[IDS[u.c]][1]} back to base`);return;}
    const foes=at(S,d,1-k);if(foes.length)fight(S,k,d);else{const had=S.ctrl[d-1];conquer(S,k,d,u);if(had!==k)fx(S,{k:"con",c:u.c,o:k,d});}}}
// all your units at the battlefield against all of theirs; damage goes to guards first, then the weakest
function fight(S,k,d){const mine=at(S,d,k),foes=at(S,d,1-k),sum=l=>l.reduce((s,u)=>s+mightOf(u)-(u.dmg||0),0);let my=sum(mine),their=sum(foes);
  say(S,`⚔ Battle at ${BFN[d-1]}: ${my} against ${their}`);
  const hit=(list,n)=>{const q=list.slice().sort((a,b)=>(b.guard-a.guard)||((mightOf(a)-(a.dmg||0))-(mightOf(b)-(b.dmg||0))));for(const u of q){if(n<=0)break;const hp=mightOf(u)-(u.dmg||0);const x=Math.min(n,hp);u.dmg=(u.dmg||0)+x;n-=x;if(u.dmg>=mightOf(u))die(S,u);}};
  const best=l=>l.slice().sort((a,b)=>mightOf(b)-mightOf(a))[0];const bm=best(mine),bf=best(foes);
  hit(foes,my);hit(mine,their);
  const mineLeft=at(S,d,k),foesLeft=at(S,d,1-k);
  fx(S,{k:"bat",dead:mine.concat(foes).filter(u=>!S.units.includes(u)).map(u=>[u.id,u.c]),o:k,d,mc:bm.c,fc:bf.c,my,their,nm:mine.length,nf:foes.length,ml:mineLeft.length,fl:foesLeft.length,bmDead:!S.units.includes(bm),bfDead:!S.units.includes(bf)});
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
.sd-pts{display:flex;gap:3px;align-items:center}.sd-pts i{width:11px;height:11px;border-radius:50%;background:var(--chip);box-shadow:inset 0 0 0 1px var(--line)}.sd-pts i.on{background:var(--c,#f2b233);box-shadow:0 0 6px var(--c,#f2b233)}
.sd-pts em{font:800 12px system-ui;font-style:normal;margin-left:4px}
.sd-en{margin-left:auto;font:700 13px system-ui;padding:3px 9px;border-radius:10px;background:var(--chip)}
.sd-tools{display:flex;gap:6px;justify-content:flex-end}.sd-tools button{border:0;border-radius:12px;padding:5px 10px;font:800 12px system-ui;background:var(--chip);color:var(--ink)}.sd-tools button.on{background:#7c5cff;color:#fff}
.sd-bfs{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1;min-height:0}
.sd-bf{border-radius:16px;padding:6px;display:flex;flex-direction:column;gap:4px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12),0 4px 14px rgba(0,0,0,.25);position:relative;min-height:0;overflow:hidden;color:#fff}
.sd-bf[data-f="1"]{background:radial-gradient(ellipse at 50% 0%,#5a4a8a,#2a2246 70%)}.sd-bf[data-f="2"]{background:radial-gradient(ellipse at 50% 0%,#2f7a72,#16353a 70%)}
.sd-bf .mid{border-top:1px dashed rgba(255,255,255,.25)}
.sd-bf.tgt,.sd-base.tgt{box-shadow:inset 0 0 0 3px #f2b233;animation:shg 1s infinite}@keyframes shg{50%{box-shadow:inset 0 0 0 3px transparent}}
.sd-bf h4{margin:0;font:800 11.5px system-ui;text-align:center;opacity:.9}.sd-bf .who{font:600 10.5px system-ui;text-align:center;opacity:.8;margin-top:-2px}
.sd-row{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:62px;align-content:flex-start}.sd-row.them{align-content:flex-end}
.sd-base{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;min-height:66px;padding:4px;border-radius:14px;background:var(--chip)}
.sd-u{width:52px;height:64px;border-radius:10px;border:0;padding:0;position:relative;overflow:hidden;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,.3);background:#1c1c28}
.sd-u img{position:absolute;inset:-4px -4px 6px;width:calc(100% + 8px);height:calc(100% + 2px);object-fit:contain}
.sd-u .em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px}
.sd-u b{position:absolute;bottom:1px;right:2px;min-width:20px;height:20px;border-radius:10px;background:rgba(0,0,0,.6);font:900 13px/20px system-ui;text-align:center}
.sd-u .d{position:absolute;top:1px;left:2px;font:900 11px system-ui;color:#fff;background:#d33;border-radius:8px;padding:0 4px}
.sd-u .k{position:absolute;bottom:2px;left:3px;font:800 11px system-ui;text-shadow:0 1px 2px #000}
.sd-u.sel{outline:3px solid #f2b233;transform:translateY(-3px)}.sd-u.tgt{outline:3px dashed #f2b233}.sd-u.tired{filter:saturate(.4) brightness(.75)}
.sd-u.ready{animation:shready 1.4s ease-in-out infinite}@keyframes shready{50%{box-shadow:0 0 0 3px #7cf29a,0 0 14px #7cf29a}}
.sd-hand{display:flex;gap:6px;overflow-x:auto;padding:10px 2px 2px;flex:none}
.sd-c{flex:none;width:104px;height:150px;border-radius:12px;border:0;padding:0;text-align:left;color:#fff;position:relative;box-shadow:0 3px 8px rgba(0,0,0,.35);font:600 9.5px/1.22 system-ui;overflow:hidden;background:#15131f}
.sd-c .fr{position:absolute;inset:0;border-radius:12px;box-shadow:inset 0 0 0 3px var(--dc)}
.sd-c .nm{position:absolute;left:6px;right:24px;top:5px;font:800 10.5px/1.15 system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sd-c .co{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff7c2,#f2b233 55%,#a5700a);color:#3a2600;display:flex;align-items:center;justify-content:center;font:900 12px system-ui}
.sd-c .art{position:absolute;left:5px;right:5px;top:22px;height:62px;border-radius:7px;background:radial-gradient(circle at 50% 40%,var(--dc),#100e1a 80%);display:flex;align-items:center;justify-content:center;font-size:34px;overflow:hidden}
.sd-c .art img{width:100%;height:100%;object-fit:contain}
.sd-c .ty{position:absolute;left:6px;right:6px;top:86px;font:800 8.5px system-ui;letter-spacing:.3px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sd-c .tx{position:absolute;left:6px;right:6px;top:97px;bottom:4px;overflow:hidden;opacity:.95}
.sd-c .mt{position:absolute;bottom:3px;right:3px;min-width:22px;height:22px;border-radius:11px;background:var(--dc);font:900 13px/22px system-ui;text-align:center;box-shadow:0 0 0 2px #15131f}
.sd-c.no{filter:saturate(.3) brightness(.65)}.sd-c.ok{box-shadow:0 0 0 2px #7cf29a,0 0 14px rgba(124,242,154,.6)}.sd-c.sel{transform:translateY(-8px);outline:3px solid #f2b233}
.sd-log{font-size:12px;color:var(--muted);text-align:center;min-height:16px}
.sd-coach{font:600 12.5px/1.35 system-ui;padding:8px 10px;border-radius:12px;background:var(--chip);color:var(--ink)}.sd-coach b{color:var(--tc)}
.sd-acts{display:flex;gap:6px}.sd-acts .tl-act{min-height:46px;padding:8px}
.sd-pick{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sd-pick button{border:0;border-radius:18px;padding:12px;color:#fff;text-align:left;display:flex;flex-direction:column;gap:4px;min-height:150px;box-shadow:0 4px 12px rgba(0,0,0,.25);position:relative;overflow:hidden}
.sd-pick b{font-size:17px;position:relative}.sd-pick img{position:absolute;right:-14px;top:-6px;width:110px;height:110px;object-fit:contain;opacity:.95}.sd-pick small{opacity:.92;font-size:12px;line-height:1.3;position:relative;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.sd-flash{animation:shflash .9s}@keyframes shflash{30%{background:rgba(242,178,51,.45)}}
.sd-ov{position:fixed;inset:0;z-index:300;background:rgba(10,8,20,.72);display:flex;align-items:flex-end;justify-content:center;padding:10px 10px calc(10px + env(safe-area-inset-bottom))}
.sd-sheet{width:100%;max-width:520px;max-height:88vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:20px;padding:14px 14px 12px;animation:sdup .25s ease-out}@keyframes sdup{from{transform:translateY(40px);opacity:0}}
.sd-sheet h3{margin:4px 0 8px;font:900 19px system-ui}.sd-sheet h4{margin:12px 0 4px;font:800 15px system-ui}.sd-sheet p,.sd-sheet li{font-size:14px;line-height:1.45;margin:4px 0}.sd-sheet ol,.sd-sheet ul{padding-left:20px;margin:4px 0}
.sd-big{display:flex;gap:12px;align-items:flex-start}.sd-big .c{flex:none;width:150px;height:216px;font-size:11.5px}.sd-big .c .art{height:96px;font-size:48px}.sd-big .c .ty{top:122px;font-size:10px}.sd-big .c .tx{top:136px}.sd-big .c .nm{font-size:12.5px}
.sd-kw{display:inline-block;margin:3px 4px 0 0;padding:3px 8px;border-radius:10px;background:var(--chip);font:600 12.5px system-ui}`;
let X=null;
const dc=d=>DOM[d][1];
const artOf=()=>null;
function kwText(c){const k=[];if(c[6].includes("swift"))k.push("Swift");if(c[6].includes("guard"))k.push("Guard");return k.join(" · ");}
function cardText(c){let t=c[8]||"";t=t.replace(/^Champion\. (Swift|Guard)\.?\s*/,"Champion. ").replace(/^Swift\. /,"");if(c[3]==="u"&&!t){t=c[6].includes("guard")?"Takes hits first in a battle.":c[6].includes("swift")?"Can move the turn you play it.":"";}return t;}
function cardHtml(ci,cls,extra){const c=C[IDS[ci]],a=artOf(ci),kw=kwText(c);
  return `<button class="sd-c ${cls||""}" ${extra||""} style="--dc:${dc(c[0])}"><span class="fr"></span><span class="nm">${X.esc(c[1])}</span><span class="co">${c[4]}</span>
    <span class="art">${a?`<img src="${a}" alt="">`:c[2]}</span><span class="ty">${c[3]==="s"?"SPELL":"UNIT"}${kw?" · "+kw.toUpperCase():""} · ${DOM[c[0]][0].toUpperCase()}</span><span class="tx">${X.esc(cardText(c))}</span>${c[3]==="u"?`<span class="mt">${c[5]}</span>`:""}</button>`;}
function unitHtml(u,cls){const c=C[IDS[u.c]],m=mightOf(u),a=artOf(u.c);
  return `<button class="sd-u ${cls||""}" data-u="${u.id}" style="background:radial-gradient(circle at 50% 35%,${dc(c[0])},#15131f 78%)">${a?`<img src="${a}" alt="">`:`<span class="em">${c[2]}</span>`}${u.dmg?`<span class="d">−${u.dmg}</span>`:""}<span class="k">${u.guard?"🛡":""}${u.swift?"»":""}</span><b>${m}</b></button>`;}
// the explanation: what the game is about and what you do on your turn
const HELP=`<h3>How to play Shards</h3>
  <p><b>Goal:</b> be the first to <b>${WIN} points</b>. You score by taking the two battlefields in the middle and keeping them.</p>
  <h4>Your turn, step by step</h4><ol>
  <li><b>Energy ⚡</b> refills at the start of your turn: 2 on your first turn, then one more each turn (up to 8).</li>
  <li><b>Play cards</b> from your hand: tap a card to read it, then <i>Play</i>. The number in the gold circle is what it costs. Cards you can play glow green.
    <br>• <b>Units</b> (they have might, the number bottom-right) arrive in <b>your base</b>, at the bottom.<br>• <b>Spells</b> do something once and are gone.</li>
  <li><b>Move units</b>: tap one of your units (ready ones pulse green), then tap a battlefield. Each unit moves once per turn. A unit you just played has to wait a turn, unless it's <b>Swift »</b>.</li>
  <li><b>Champion ability</b>: the button next to End turn. Once per turn, costs energy.</li>
  <li><b>End turn</b> when you're done. Damage heals and units can move again next turn.</li></ol>
  <h4>Battlefields and points</h4><ul>
  <li>Move onto a battlefield nobody holds, or beat everyone there: you <b>conquer</b> it, <b>+1 point</b> 🟢.</li>
  <li>Still holding it (with a unit there) at the start of your next turn: <b>+1 point</b> again.</li></ul>
  <h4>Battles</h4><ul>
  <li>When you move onto a battlefield with enemies, everyone there fights at once: your <b>total might</b> against theirs.</li>
  <li>Each side deals damage equal to its total. Damage goes to <b>Guard 🛡</b> units first, then the weakest. A unit with as much damage as its might is destroyed.</li>
  <li>If both sides have units left, the attackers go back to base.</li></ul>
  <h4>Words on cards</h4><ul><li>${KW.swift}</li><li>${KW.guard}</li><li><b>Might</b> is both how hard a unit hits and how much damage it can take.</li></ul>
  <h4>Animations</h4><p>Short effects show what happened on the board: new units pop in, battlefields shake in a fight, destroyed units shatter. Switch them off with <b>✨ Animations</b>. Tap any unit on the board to read its card.</p>`;
function overlay(html,wire){const o=document.createElement("div");o.className="sd-ov";o.innerHTML=`<div class="sd-sheet">${html}<div class="gm-row2" style="margin-top:10px"><button class="tl-act ghost" data-x>Close</button></div></div>`;
  (document.querySelector(".gx")||document.body).appendChild(o);const close=()=>o.remove();o.onclick=e=>{if(e.target===o)close();};o.querySelector("[data-x]").onclick=close;if(wire)wire(o,close);return close;}
function closeOverlays(){document.querySelectorAll(".sd-ov").forEach(o=>o.remove());}
/* ---------- animations: short and right on the board, nothing waits for them ---------- */
const FXCSS=`.sdfx{position:fixed;pointer-events:none;z-index:250;line-height:1}
@keyframes sdpop{0%{transform:scale(.1);filter:brightness(3)}60%{transform:scale(1.25)}100%{transform:scale(1);filter:none}}
.sd-u.pop{animation:sdpop .45s cubic-bezier(.3,1.4,.5,1)}
@keyframes sdhit{0%,100%{transform:translate(0,0)}20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-3px,2px)}}
.sd-bf.hit{animation:sdhit .4s}.sd-bf.hit::after{content:"";position:absolute;inset:0;border-radius:16px;background:rgba(255,60,60,.35);animation:sdfade .5s forwards;pointer-events:none}
.sd-bf.won::after{content:"";position:absolute;inset:0;border-radius:16px;background:var(--wc);opacity:.45;animation:sdfade .7s forwards;pointer-events:none}
@keyframes sdfade{to{opacity:0}}
.sd-u.zap{animation:sdzap .45s}@keyframes sdzap{30%{filter:brightness(2.5);transform:scale(1.12)}}`;
const fxOpt=()=>{try{return Object.assign({fx:true},JSON.parse(localStorage.getItem("pt-shards-fx")||"{}"));}catch(e){return {fx:true};}};
const fxOn=()=>fxOpt().fx;
function setOpt(k,v){const o=fxOpt();o[k]=v;try{localStorage.setItem("pt-shards-fx",JSON.stringify(o));}catch(e){}}
const P={E:"🔥",T:"💧",G:"🍃",S:"⚡",N:"✨"};
function fxCss(){if(document.getElementById("sdfxCss"))return;const st=document.createElement("style");st.id="sdfxCss";st.textContent=FXCSS;document.head.appendChild(st);}
function bit(x,y,ch,size,kf,dur,delay){const d=document.createElement("div");d.className="sdfx";d.textContent=ch;d.style.cssText=`left:${x}px;top:${y}px;font-size:${size}px`;document.body.appendChild(d);
  const a=d.animate(kf,{duration:dur,delay:delay||0,easing:"cubic-bezier(.2,.8,.3,1)",fill:"forwards"});a.onfinish=()=>d.remove();setTimeout(()=>d.remove(),dur+(delay||0)+300);}
function sparks(r,ch,n){const cx=r.left+r.width/2,cy=r.top+r.height/2;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,d=24+Math.random()*26;
  bit(cx,cy,ch,12+Math.random()*8,[{transform:"translate(-50%,-50%) scale(.5)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(1)`,opacity:0}],420+Math.random()*200);}}
// a destroyed unit breaks apart where it stood
function shatterAt(r,ch){if(!r)return;const cx=r.left+r.width/2,cy=r.top+r.height/2;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>bit(cx,cy,ch,26,[{transform:"translate(-50%,-50%)",opacity:1,clipPath:`inset(${dy>0?50:0}% ${dx<0?50:0}% ${dy<0?50:0}% ${dx>0?50:0}%)`},
    {transform:`translate(calc(-50% + ${dx*26}px),calc(-50% + ${dy*20+18}px)) rotate(${dx*50}deg)`,opacity:0,clipPath:`inset(${dy>0?50:0}% ${dx<0?50:0}% ${dy<0?50:0}% ${dx>0?50:0}%)`}],520));
  sparks(r,"💎",4);}
function floatNum(r,t){if(!r)return;bit(r.left+r.width/2,r.top+8,t,20,[{transform:"translate(-50%,0) scale(.6)",opacity:0},{transform:"translate(-50%,-14px) scale(1.1)",opacity:1,offset:.3},{transform:"translate(-50%,-30px)",opacity:0}],750);}
function boardFx(EL,S,e,me,prev){const q=sel=>EL.querySelector(sel),rect=el=>el&&el.getBoundingClientRect(),c=C[IDS[e.c]]||[];
  if(e.k==="sum"){const u=q(`[data-u="${e.id}"]`);if(u){u.classList.add("pop");sparks(rect(u),P[c[0]]||"✨",5);}}
  if(e.k==="spl"){const t=e.tid>=0?q(`[data-u="${e.tid}"]`):null;if(t){t.classList.add("zap");sparks(rect(t),P[c[0]]||"✨",6);}
    else if(e.fd){const f=q(`.sd-bf[data-f="${e.fd}"]`);if(f){f.classList.add("hit");sparks(rect(f),P[c[0]]||"✨",8);}}
    if(e.kill&&prev[e.tid])shatterAt(prev[e.tid],(C[IDS[e.tc]]||[])[2]||"✨");}
  if(e.k==="bat"){const f=q(`.sd-bf[data-f="${e.d}"]`);if(f){f.classList.add("hit");const r=rect(f);bit(r.left+r.width/2,r.top+r.height/2,"💥",34,[{transform:"translate(-50%,-50%) scale(.3)",opacity:1},{transform:"translate(-50%,-50%) scale(1.4)",opacity:0}],450);
      floatNum({left:r.left,top:r.top+r.height*0.25,width:r.width},`−${e.my}`);floatNum({left:r.left,top:r.top+r.height*0.7,width:r.width},`−${e.their}`);}
    for(const [id,ci] of (e.dead||[]))if(prev[id])setTimeout(()=>shatterAt(prev[id],(C[IDS[ci]]||[])[2]||"✨"),180);
    if(e.ml&&!e.fl&&f){f.style.setProperty("--wc",dc(S.dom[e.o]));setTimeout(()=>{f.classList.add("won");const r=rect(f);bit(r.left+r.width/2,r.top+20,"🚩",26,[{transform:"translate(-50%,-30px)",opacity:0},{transform:"translate(-50%,0)",opacity:1,offset:.4},{transform:"translate(-50%,0)",opacity:0}],900);},300);}}
  if(e.k==="con"){const f=q(`.sd-bf[data-f="${e.d}"]`);if(f){f.style.setProperty("--wc",dc(S.dom[e.o]));f.classList.add("won");const r=rect(f);
      bit(r.left+r.width/2,r.top+20,"🚩",26,[{transform:"translate(-50%,-30px)",opacity:0},{transform:"translate(-50%,0)",opacity:1,offset:.4},{transform:"translate(-50%,0)",opacity:0}],900);}}}
function playFx(R,S,me,EL,prev){if(!S.fx)return;if(view.fxR!==R){view.fxR=R;view.fxSeen=S.fxn||0;return;}   // a game you join: don't replay what already happened
  const fresh=S.fx.filter(e=>e.n>(view.fxSeen||0));view.fxSeen=S.fxn||0;if(!fresh.length||!fxOn())return;fxCss();
  for(const e of fresh)try{boardFx(EL,S,e,me,prev||{});}catch(err){}}
function fxStop(){document.querySelectorAll(".sdfx").forEach(e=>e.remove());const c=document.getElementById("sdfxCss");if(c)c.remove();}
function inspectUnit(S,ci,u,me){const c=C[IDS[ci]];
  const html=`<p>${c[3]==="u"?`Might <b>${u?mightOf(u):c[5]}</b>${u&&u.dmg?` (damaged −${u.dmg})`:""} · costs ${c[4]}⚡`:`Spell · costs ${c[4]}⚡`}${u?` · ${u.o===me?"yours":"enemy"}${u.loc?` · at ${BFN[u.loc-1]}`:" · in base"}`:""}</p><p>${X.esc(cardText(c))}</p>
    ${c[6].includes("swift")?`<span class="sd-kw">${KW.swift}</span>`:""}${c[6].includes("guard")?`<span class="sd-kw">${KW.guard}</span>`:""}`;
  overlay(`<h3>${X.esc(c[1])}</h3><div class="sd-big">${cardHtml(ci,"c")}<div>${html}</div></div>`);}
function view(R){const S=R.S,me=R.mySlot(),op=1-me,EL=X.EL();if(!document.getElementById("shCss")){const st=document.createElement("style");st.id="shCss";st.textContent=CSS;document.head.appendChild(st);}
  view.R=R;
  X.shell("Shards",R.status(),true);X.onBack(()=>{closeOverlays();X.leaveAsk(R);});
  try{if(!localStorage.getItem("pt-shards-help")){localStorage.setItem("pt-shards-help","1");setTimeout(()=>overlay(HELP),300);}}catch(e){}
  const tools=`<div class="sd-tools"><button id="shHelp">? How to play</button><button id="sh3d" class="${fxOn()?"on":""}">✨ Animations</button></div>`;
  const wireTools=()=>{EL.querySelector("#shHelp").onclick=()=>{X.tapv();overlay(HELP);};
    EL.querySelector("#sh3d").onclick=()=>{X.tapv();setOpt("fx",!fxOn());X.toast(fxOn()?"Animations on":"Animations off");view(R);};};
  if(S.phase==="pick"){const mine=S.dom[me];
    EL.innerHTML=`${tools}<div class="gm-big">Pick your champion</div>${mine?`<p class="sv-note" style="text-align:center">You picked ${DOM[mine][0]}. Waiting for ${X.esc(S.names[op])}…</p>`:`<p class="sv-note" style="text-align:center">Your champion decides your deck: 9 cards of its domain (twice each) plus neutral cards.</p>`}
      <div class="sd-pick">${"ETGS".split("").map((d,i)=>{const a=artOf(CI(CHAMPU[d]));return `<button data-pk="${i}" style="background:linear-gradient(150deg,${dc(d)},#1c1c28)" ${mine?"disabled":""}><span style="position:absolute;right:8px;top:4px;font-size:54px;opacity:.95">${C[CHAMPU[d]][2]}</span><b>${DOM[d][2]} ${DOM[d][0]}</b><small>${CHAMP[d].n}<br>${DOM[d][3]}<br><i>Ability ${CHAMP[d].ab} (${CHAMP[d].ac}⚡): ${CHAMP[d].at}</i></small></button>`;}).join("")}</div>
      <p class="sv-note">Units move onto the two battlefields to conquer them (+1 point) and hold them (+1 point at the start of your turn). First to ${WIN} points wins. Tap “? How to play” for the full rules.</p>`;
    wireTools();EL.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{X.tapv();R.act([5,+b.dataset.pk]);});playFx(R,S,me,EL,{});return;}
  const mine=S.turn===me&&S.win<0&&!R.pending,E=S.energy[me]+S.extra[me];let sel=view.sel&&view.R===R?view.sel:null;
  const canMove=u=>mine&&u.o===me&&u.moved<u.moves&&(!u.fresh||u.swift);
  // a card can be played if you can pay for it and it has something to aim at
  const hasTarget=i=>{const c=C[IDS[S.hand[me][i]]],need=TARGET[c[7]];if(!need||need==="field")return true;if(need==="enemy"&&!S.units.some(u=>u.o!==me))return true;return S.units.some(u=>legal(S,me,[1,i,u.id]));};
  const canPlay=i=>mine&&C[IDS[S.hand[me][i]]][4]<=E&&hasTarget(i);
  let tgtU=new Set(),tgtF=new Set();
  if(sel&&sel.kind==="card"){const c=C[IDS[S.hand[me][sel.i]]];const need=TARGET[c[7]];if(need==="field"){tgtF.add(1);tgtF.add(2);}else if(need)S.units.forEach(u=>{if(legal(S,me,[1,sel.i,u.id]))tgtU.add(u.id);});}
  if(sel&&sel.kind==="ab"){S.units.forEach(u=>{if(legal(S,me,[3,u.id]))tgtU.add(u.id);});}
  if(sel&&sel.kind==="unit"){const u=U(S,sel.id);if(u)[0,1,2].forEach(d=>{if(legal(S,me,[2,u.id,d]))tgtF.add(d);});}
  const pts=k=>`<span class="sd-pts" style="--c:${dc(S.dom[k])}">${Array.from({length:WIN},(_,i)=>`<i class="${i<S.pts[k]?"on":""}"></i>`).join("")}<em>${S.pts[k]}/${WIN}</em></span>`;
  const ucls=u=>(sel&&sel.id===u.id?"sel ":"")+(tgtU.has(u.id)?"tgt ":"")+(u.o===me&&mine?(canMove(u)?"ready ":"tired "):"");
  const holder=d=>S.ctrl[d-1]<0?"nobody holds it":S.ctrl[d-1]===me?"🟢 you hold it":`🔴 ${X.esc(S.names[S.ctrl[d-1]])} holds it`;
  const bf=d=>`<div class="sd-bf ${tgtF.has(d)?"tgt":""} ${S.flash&&S.flash[0]===d&&view.fl!==R.log.length?"sd-flash":""}" data-f="${d}"><h4>${BFN[d-1]}</h4><div class="who">${holder(d)}</div>
      <div class="sd-row them">${at(S,d,op).map(u=>unitHtml(u,ucls(u))).join("")}</div><div class="mid"></div><div class="sd-row">${at(S,d,me).map(u=>unitHtml(u,ucls(u))).join("")}</div></div>`;
  const ch=CHAMP[S.dom[me]];
  const playable=S.hand[me].filter((ci,i)=>canPlay(i)).length,movable=S.units.filter(canMove).length,abOk=!S.abUsed&&ch.ac<=E&&(ch.tg==null||S.units.some(u=>legal(S,me,[3,u.id])));
  let coach="";
  if(S.win>=0)coach=S.win===me?"🏆 You win! Play again from the button below.":`${X.esc(S.names[S.win])} wins this one.`;
  else if(!mine)coach=R.pending?"Sending your move…":`<b>${X.esc(S.names[S.turn])}</b> is playing. Watch the battlefields; tap any unit to see it up close.`;
  else if(sel&&sel.kind==="card"){const c=C[IDS[S.hand[me][sel.i]]];coach=TARGET[c[7]]==="field"?`<b>${X.esc(c[1])}</b>: tap a battlefield.`:`<b>${X.esc(c[1])}</b>: tap a unit with a dashed outline. Tap the card again to cancel.`;}
  else if(sel&&sel.kind==="unit")coach="Tap a battlefield to move there (or your base to pull back). Tap the unit again to cancel.";
  else if(sel&&sel.kind==="ab")coach=`<b>${ch.ab}</b>: tap a unit with a dashed outline.`;
  else{const st=[];if(playable)st.push(`play a card (<b>${playable}</b> glow${playable>1?"":"s"} green)`);if(movable)st.push(`move a ready unit (<b>${movable}</b> pulse${movable>1?"":"s"}) to a battlefield`);if(abOk)st.push(`use <b>${ch.ab}</b>`);
    coach=st.length?`<b>Your turn</b> · ⚡${E}: ${st.join(", ")}. Then <b>End turn</b>.`:`<b>Your turn</b> · nothing left you can do: tap <b>End turn</b>.`;}
  EL.innerHTML=`<div class="sh">${tools}
    <div class="sd-top">${DOM[S.dom[op]][2]} <b>${X.esc(S.names[op])}</b> ${pts(op)}<span class="sd-en">🂠 ${S.hand[op].length} · ⚡${S.energy[op]}</span></div>
    <div class="sd-base" style="min-height:44px;opacity:.9">${at(S,0,op).map(u=>unitHtml(u,ucls(u))).join("")||`<small style="opacity:.6;align-self:center">their base</small>`}</div>
    <div class="sd-bfs">${bf(1)}${bf(2)}</div>
    <div class="sd-base ${tgtF.has(0)?"tgt":""}" data-f="0">${at(S,0,me).map(u=>unitHtml(u,ucls(u))).join("")||`<small style="opacity:.6;align-self:center">your base: units you play arrive here</small>`}</div>
    <div class="sd-me">${DOM[S.dom[me]][2]} <b>You</b> ${pts(me)}<span class="sd-en">⚡ ${E} energy · 🂠 ${S.deck[me].length} in deck</span></div>
    <div class="sd-coach">${coach}</div>
    <div class="sd-log" id="shLog">${X.esc(S.ev[S.ev.length-1]||"")}${S.ev.length?" · tap for history":""}</div>
    <div class="sd-hand">${S.hand[me].map((ci,i)=>{const ok=canPlay(i);return cardHtml(ci,`${mine?(ok?"ok":"no"):""} ${sel&&sel.kind==="card"&&sel.i===i?"sel":""}`,`data-h="${i}"`);}).join("")}</div>
    <div class="sd-acts">${S.win>=0?(R.host?`<button class="tl-act" id="shAgain">Play again</button>`:""):mine?`<button class="tl-act ghost" id="shAb" ${abOk?"":"disabled"}>${ch.ab} (${ch.ac}⚡)</button><button class="tl-act" id="shEnd">End turn</button>`:`<span class="sv-note" style="flex:1;text-align:center">${R.pending?"Sending…":X.esc(S.names[S.turn])+"'s turn…"}</span>`}</div></div>`;
  wireTools();
  if(S.flash)view.fl=R.log.length;
  const prev=view.pos&&view.R===R?view.pos:{};const now={};EL.querySelectorAll("[data-u]").forEach(e=>{now[e.dataset.u]=e.getBoundingClientRect();if(prev[e.dataset.u]){const p=prev[e.dataset.u],r=now[e.dataset.u];if(Math.abs(p.left-r.left)+Math.abs(p.top-r.top)>4)X.animateFrom(e,p,380);}});
  view.pos=now;view.R=R;
  if(S.win>=0&&view.won!==R.log.length){view.won=R.log.length;if(S.win===me)X.confetti();}
  playFx(R,S,me,EL,prev);
  const go=a=>{view.sel=null;closeOverlays();R.act(a);};const reselect=s=>{view.sel=s;view(R);};
  EL.querySelector("#shLog").onclick=()=>overlay(`<h3>What happened</h3><ul>${S.ev.slice().reverse().map(t=>`<li>${X.esc(t)}</li>`).join("")}</ul>`);
  // a card: read it first, then play it
  EL.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{X.tapv();const i=+b.dataset.h,ci=S.hand[me][i],c=C[IDS[ci]];
    if(sel&&sel.kind==="card"&&sel.i===i){reselect(null);return;}
    const need=TARGET[c[7]],afford=c[4]<=E,why=!mine?"It's not your turn.":!afford?`Needs ${c[4]} energy, you have ${E}.`:!hasTarget(i)?"There's nothing it can target right now.":"";
    const kws=[c[6].includes("swift")?KW.swift:"",c[6].includes("guard")?KW.guard:""].filter(Boolean);
    overlay(`<h3>${X.esc(c[1])}</h3><div class="sd-big">${cardHtml(ci,"c")}<div><p>${c[3]==="u"?`<b>Unit</b> with <b>${c[5]} might</b>. It arrives in your base.`:"<b>Spell</b>: happens once."}</p><p>${X.esc(cardText(c))||""}</p>${kws.map(k=>`<span class="sd-kw">${k}</span>`).join("")}
      <p class="sv-note">Costs ${c[4]}⚡ · ${DOM[c[0]][0]}</p>${why?`<p class="sv-note">${why}</p>`:""}</div></div><div class="gm-row2"><button class="tl-act" id="shPlay" ${why?"disabled":""}>${need&&!(need==="enemy"&&!S.units.some(u=>u.o!==me))?"Play: pick a target":"Play"}</button></div>`,
      (o,close)=>{const p=o.querySelector("#shPlay");if(p)p.onclick=()=>{X.tapv();close();if(!need||(need==="enemy"&&!S.units.some(u=>u.o!==me))){go([1,i,0]);return;}reselect({kind:"card",i});};
});});
  EL.querySelectorAll("[data-u]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=+b.dataset.u;X.tapv();const u=U(S,id);if(!u)return;
    if(mine&&sel&&sel.kind==="card"&&tgtU.has(id)){go([1,sel.i,id]);return;}if(mine&&sel&&sel.kind==="ab"&&tgtU.has(id)){go([3,id]);return;}
    if(u.o===me&&canMove(u)&&!(sel&&sel.id===id)){reselect({kind:"unit",id});return;}
    if(sel&&sel.id===id){reselect(null);return;}
    inspectUnit(S,u.c,u,me);});
  EL.querySelectorAll("[data-f]").forEach(f=>f.onclick=()=>{if(!mine||!sel)return;const d=+f.dataset.f;
    if(sel.kind==="card"&&tgtF.has(d)){X.tapv();go([1,sel.i,d]);return;}if(sel.kind==="unit"&&tgtF.has(d)){X.tapv();go([2,sel.id,d]);}});
  const ab=EL.querySelector("#shAb");if(ab)ab.onclick=()=>{X.tapv();if(!ch.tg){go([3,0]);return;}reselect(sel&&sel.kind==="ab"?null:{kind:"ab"});};
  const en=EL.querySelector("#shEnd");if(en)en.onclick=()=>{X.tapv();if(playable||movable)overlay(`<h3>End your turn?</h3><p>You can still ${[playable?`play ${playable} card${playable>1?"s":""}`:"",movable?`move ${movable} unit${movable>1?"s":""}`:""].filter(Boolean).join(" and ")}.</p><div class="gm-row2"><button class="tl-act" id="shYes">End turn</button></div>`,(o,close)=>{o.querySelector("#shYes").onclick=()=>{close();go([4]);};});else go([4]);};
  const ag=EL.querySelector("#shAgain");if(ag)ag.onclick=()=>{X.tapv();R.restart([]);};}
// leaving Shards: the 3D, camera and sensors switch off and the styles go
function stop(){closeOverlays();fxStop();view.R=null;view.fxR=null;const s=document.getElementById("shCss");if(s)s.remove();}
window.SHARDS={def:DEF,view,stop,init(h){X=h;},_t:{C,IDS,legal,doAct,aiMove,DEF}};
})();
