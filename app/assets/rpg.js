/* Questbook: a story adventure with dice, the phone is the game master. Everyone plays their own hero on their own phone
   (or alone, with computer heroes). Choices lead to d20 checks; friends can help; fights are turn by turn.
   Runs on the shared room log (room.js), so every phone sees the same story and the same dice. All stories are original. */
(function(){
let X=null;
/* ---------------- heroes ---------------- */
const ST={mig:["Might","💪"],agi:["Agility","🤸"],wit:["Wits","🧠"],cha:["Charm","💬"]};
const CL={
  fighter:{n:"Fighter",e:"⚔️",s:{mig:3,agi:1,wit:-1,cha:0},hp:24,ac:15,atk:"mig",die:10,ab:"Mighty Blow",abt:"Attack with +6 damage.",tip:"Tough and strong. Best at breaking things and holding the line."},
  rogue:{n:"Rogue",e:"🗡️",s:{mig:0,agi:3,wit:1,cha:1},hp:18,ac:14,atk:"agi",die:6,ab:"Shadow Strike",abt:"An attack that always hits, double damage.",tip:"Quick and quiet. Best at sneaking, climbing and locks."},
  wizard:{n:"Wizard",e:"🔮",s:{mig:-1,agi:1,wit:3,cha:0},hp:14,ac:12,atk:"wit",die:6,ab:"Fireball",abt:"2d6 + Wits damage to every enemy.",tip:"Clever and fragile. Best at riddles, magic and old books."},
  cleric:{n:"Cleric",e:"✨",s:{mig:1,agi:0,wit:2,cha:1},hp:20,ac:15,atk:"mig",die:8,ab:"Healing Light",abt:"Heal a hero for 2d6 + 3 (also wakes up a fallen one).",tip:"Wise and steady. Keeps the party alive."},
  bard:{n:"Bard",e:"🎻",s:{mig:0,agi:1,wit:1,cha:3},hp:16,ac:13,atk:"agi",die:6,ab:"Inspire",abt:"A hero heals 1d6 and gets +4 on their next roll.",tip:"Charming and lucky. Best at talking your way through."}};
const CLS=Object.keys(CL);
/* ---------------- monsters ---------------- */
const MON={
  thug:["Tavern Thug","🧔",7,11,2,[1,6]],goblin:["Goblin","👺",6,12,3,[1,6]],gobboss:["Goblin Boss","👹",12,13,4,[1,8]],spider:["Giant Spider","🕷️",9,12,3,[1,6]],
  shade:["Shade","👻",8,12,3,[1,6]],wraith:["Shadow Wraith","💀",34,14,5,[2,6]],wolf:["Mist Wolf","🐺",9,12,4,[1,6]],
  smug:["Smuggler","🏴‍☠️",8,12,3,[1,6]],captain:["Smuggler Captain","🦜",15,13,4,[1,8]],crab:["Reef Crab","🦀",10,14,3,[1,6]],eel:["Storm Eel","🐍",9,13,4,[1,6]],
  siren:["Siren of the Deep","🧜‍♀️",38,14,5,[2,6]],drowned:["Drowned Sailor","🧟",10,11,3,[1,6]]};
/* ---------------- the stories ----------------
   node: {e: picture, t: title, x: text, c: [choices], f: fight {m:[monsters], win, lose}, end: "win"|"lose", gold, rest}
   choice: {l: label, s: stat, dc, ok, no, okx: text when it works, nox: text when it fails, hurt: [who, dice], need: {gold|item}, gain: {gold|item|potion}, go: next (no roll) } */
const ADV={
lantern:{n:"The Lantern of Brindlemere",e:"🏮",x:"The lantern on Brindlemere hill has kept the night-mists away for a hundred years. Last night it went dark, and its keeper vanished.",start:"a0",nodes:{
 a0:{e:"🍺",t:"The Crooked Kettle",x:"The village tavern is packed and scared. Mist curls under the door. Mayor Hollin slams a purse on the bar: “Fifty gold to whoever brings old Maren and her lantern back before the mist swallows us.”",
   c:[{l:"Ask the locals what they saw",s:"cha",dc:10,ok:"a1",no:"a0f",okx:"A shaky farmer leans in: “Pale lights by the old chapel in Whisperwood. And goblins at the bridge, charging tolls.”",nox:"You ask the wrong man about his cousin. Chairs fly."},
      {l:"Go straight up the hill",go:"a2"}]},
 a0f:{e:"🥊",t:"Tavern brawl",x:"Two big regulars want a word with you, mostly with their fists.",f:{m:["thug","thug"],win:"a1",lose:"a0l"}},
 a0l:{e:"🤕",t:"Thrown out",x:"You wake up in the hay behind the tavern. Nobody's hurt, only proud. The farmer who saw it all helps you up and tells you about the chapel in Whisperwood.",go:"a2"},
 a1:{e:"🗺️",t:"What the village knows",x:"Maren went up to fix the lantern at dusk and never came down. Since then, a cold blue glow has been seen at the ruined chapel deep in Whisperwood.",go:"a2"},
 a2:{e:"🏮",t:"Lantern Hill",x:"The great lantern stands cold. Its glass is smashed from the inside, and frost covers the stones in a strange pattern. Tracks lead down into Whisperwood.",
   c:[{l:"Search the lantern room",s:"wit",dc:12,ok:"a3",no:"a3",okx:"Under the frost you find Maren's silver key, and a note: “The heart of the flame must not leave the light.”",nox:"The mist rolls in while you search. It bites like ice.",gain:{item:"key"},hurt:["all",[1,4]]},
      {l:"Follow the tracks at once",go:"a3"}]},
 a3:{e:"🌲",t:"Whisperwood",x:"The trees whisper your names. The path splits: an easy track down to the river, or straight through a wall of thorns towards the blue glow.",
   c:[{l:"Take the river path",go:"a4"},{l:"Cut through the thorns",s:"agi",dc:13,ok:"a5",no:"a5",okx:"You slip through like shadows and come out right at the chapel.",nox:"You make it through, but the thorns leave their mark.",hurt:["one",[1,6]]}]},
 a4:{e:"🌉",t:"The goblin bridge",x:"Three goblins sit on a rickety bridge, sharpening spoons. “Toll!” squeaks the biggest. “Twenty gold, or we eat your boots.”",
   c:[{l:"Pay the 20 gold",need:{gold:20},go:"a5",gain:{gold:-20}},
      {l:"Talk them out of it",s:"cha",dc:14,ok:"a4t",no:"a4f",okx:"The goblins giggle and wave you through. “Mind the ghosty in the cellar. Hates light, it does.”",nox:"“Liar!” the goblins shriek, and grab their spoons."},
      {l:"Fight your way across",go:"a4f"}]},
 a4t:{e:"👺",t:"Friends with goblins",x:"The goblins even share their stew. Disgusting, but warming. Everyone gets back a little strength.",rest:0.3,go:"a5"},
 a4f:{e:"⚔️",t:"Goblin ambush",x:"Spoons out! The goblin boss jumps off the railing.",f:{m:["goblin","goblin","gobboss"],win:"a5",lose:"aL"},gold:15},
 a5:{e:"⛪",t:"The ruined chapel",x:"The old chapel glows blue from inside. Thick webs cover the doorway, and something big shifts in the dark beyond.",
   c:[{l:"Burn the webs away",s:"wit",dc:11,ok:"a6",no:"a5f",okx:"A quick spark and the webs go up. Whatever lived there flees deeper.",nox:"The webs won't catch. Two giant spiders drop down."},
      {l:"Sneak past along the wall",s:"agi",dc:13,ok:"a6",no:"a5f",okx:"Not a strand trembles. You're inside.",nox:"You touch one strand. Just one."}]},
 a5f:{e:"🕸️",t:"Spiders!",x:"Two giant spiders, all legs and hunger.",f:{m:["spider","spider"],win:"a6",lose:"aL"}},
 a6:{e:"🚪",t:"The riddle door",x:"Steps lead down to a stone door. Carved letters glow: “I am hungry, I must be fed; the finger I touch will soon turn red. What am I?”",
   c:[{l:"Answer the riddle",s:"wit",dc:13,ok:"a7",no:"a7",okx:"“Fire!” The door grinds open, warm air rushes past.",nox:"Wrong. A dart hisses out of the wall before the door opens.",hurt:["one",[1,6]]},
      {l:"Use Maren's silver key",need:{item:"key"},go:"a7"},
      {l:"Break it down",s:"mig",dc:14,ok:"a7",no:"a7",okx:"The old door gives way with a crash.",nox:"It breaks in the end, but so do your shoulders.",hurt:["all",[1,4]]}]},
 a7:{e:"💀",t:"The crypt",x:"Old Maren hangs in chains above a cold altar. On it lies the Ember Heart, the lantern's flame, and a Shadow Wraith drinks its light. It turns towards you.",
   c:[{l:"Free Maren first",s:"agi",dc:12,ok:"a7b",no:"a7c",okx:"You snap the chains. Maren grabs the Ember Heart and blasts the wraith with its light!",nox:"The wraith sees you coming."},
      {l:"Attack the wraith",go:"a7c"}]},
 a7b:{e:"🔥",t:"Light against shadow",x:"The wraith shrieks and shrinks, weakened by the flame. It still fights.",f:{m:["wraith","shade"],win:"a8",lose:"aL",weak:12}},
 a7c:{e:"💀",t:"The Shadow Wraith",x:"The wraith rises, and the shades of the crypt with it.",f:{m:["wraith","shade","shade"],win:"a8",lose:"aL"}},
 a8:{e:"🏮",t:"The lantern burns again",x:"The wraith bursts into mist and is gone. Maren carries the Ember Heart back up the hill, and the lantern blazes bright. The mist flees the valley. Mayor Hollin pays up, and the Crooked Kettle sings your names all night.",end:"win",gold:50},
 aL:{e:"🌫️",t:"Swallowed by mist",x:"Everything goes dark… You wake up in the village. A woodcutter found you at the edge of the forest. The lantern is still dark. Maybe another day.",end:"lose"}}},
bell:{n:"The Drowned Bell",e:"🔔",x:"Every night a bell rings under the sea near Saltmarrow, and the fishermen walk into the waves in their sleep.",start:"b0",nodes:{
 b0:{e:"⚓",t:"Saltmarrow harbour",x:"Fog, gulls and worried faces. Harbourmaster Brin points at the empty boats: “Six men gone this week. They walk into the water singing. The bell started when the smugglers came.”",
   c:[{l:"Talk to the old fisherwoman",s:"cha",dc:11,ok:"b1",no:"b2",okx:"Old Tessa lights her pipe. “The bell is the Siren's. It sank with the abbey. Something woke her.”",nox:"She only spits in the sea and turns away."},
      {l:"Climb the lighthouse to look out",go:"b2"}]},
 b1:{e:"🧓",t:"Tessa's story",x:"“A hundred years ago the sea took the abbey, bell and all. The Siren sleeps in its tower. If someone rings the bell, she wakes, and she's hungry for voices.” Tessa gives you a bottle: “For your lungs. You'll need it.”",gain:{potion:1},go:"b2"},
 b2:{e:"🗼",t:"The lighthouse",x:"From the top you see it: lantern lights in a cove north of town, where no boat should be. And far out, a ring of strange calm water.",
   c:[{l:"Sneak to the smugglers' cove",go:"b3"},{l:"Row straight to the calm water",s:"mig",dc:13,ok:"b4",no:"b4",okx:"Strong strokes through the swell bring you right above the old abbey.",nox:"The sea fights back. You get there, soaked and battered.",hurt:["all",[1,4]]}]},
 b3:{e:"🏴‍☠️",t:"The smugglers' cove",x:"Crates of stolen church silver, and a dozen smugglers around a fire. Their captain holds a tarnished bell clapper and laughs: “Every night we ring it, and every night the town sleeps while we work!”",
   c:[{l:"Bluff: “The harbour guard is coming!”",s:"cha",dc:14,ok:"b3w",no:"b3f",okx:"Panic! The smugglers run. In the rush, the captain drops the clapper.",nox:"The captain draws his sword. “Nice try.”"},
      {l:"Steal the clapper quietly",s:"agi",dc:14,ok:"b3w",no:"b3f",okx:"Nobody notices a thing until you're long gone.",nox:"A parrot screams. Everyone turns."},
      {l:"Charge!",go:"b3f"}]},
 b3w:{e:"🔔",t:"The clapper",x:"You hold the bell's clapper: without it, the Siren's call is half as strong. Now to the calm water.",gain:{item:"clapper"},go:"b4"},
 b3f:{e:"⚔️",t:"Fight in the cove",x:"Steel rings out over the waves.",f:{m:["smug","smug","captain"],win:"b3w",lose:"bL"},gold:25},
 b4:{e:"🌊",t:"Above the drowned abbey",x:"The water here is calm as glass. Far below, a tower. The way down is a sea cave in the cliff, or a dive straight down.",
   c:[{l:"Dive straight down",s:"agi",dc:13,ok:"b5",no:"b5",okx:"Down through the green light, into the tower's window.",nox:"Out of breath, you swallow half the sea before you make it.",hurt:["one",[2,4]]},
      {l:"Take the sea cave",go:"b4c"}]},
 b4c:{e:"🦀",t:"The sea cave",x:"The cave is dry at low tide, but it's not empty.",f:{m:["crab","eel"],win:"b5",lose:"bL"}},
 b5:{e:"🧜",t:"The merfolk guard",x:"A merfolk warrior blocks the tower with a coral spear. “Land-walkers. The Siren is our shame. Why should we let you pass?”",
   c:[{l:"Tell her you've come to stop the Siren",s:"cha",dc:12,ok:"b5o",no:"b5n",okx:"She lowers her spear. “Then take this. It's the old abbey's blessing.” She hands you a shell that glows softly.",nox:"“Words. Land-walkers always have words.” But she steps aside, coldly."},
      {l:"Show her the bell's clapper",need:{item:"clapper"},go:"b5o"}]},
 b5o:{e:"🐚",t:"A blessing",x:"The shell's glow warms you. Everyone heals.",rest:0.6,go:"b6"},
 b5n:{e:"🐚",t:"Alone",x:"You swim on into the tower, without her help.",go:"b6"},
 b6:{e:"🔔",t:"The bell tower",x:"The great bronze bell hangs in the dark water. Coiled around it, singing, the Siren of the Deep opens her eyes. Drowned sailors drift up around her.",
   c:[{l:"Cover your ears and attack",go:"b6f"},{l:"Sing louder than she does",s:"cha",dc:15,ok:"b6w",no:"b6f",okx:"Your voice fills the tower. Her song cracks!",nox:"Her song is stronger. Your head spins."}]},
 b6w:{e:"🎶",t:"The song breaks",x:"Weakened, the Siren lunges.",f:{m:["siren","drowned"],win:"b7",lose:"bL",weak:14}},
 b6f:{e:"🧜‍♀️",t:"The Siren of the Deep",x:"She screams, and the water itself attacks.",f:{m:["siren","drowned","drowned"],win:"b7",lose:"bL"}},
 b7:{e:"🌅",t:"The bell is silent",x:"The Siren sinks into the dark, and the bell goes still. At dawn the six fishermen wake up on the beach, confused and alive. Saltmarrow throws a feast, and Harbourmaster Brin pays you in silver.",end:"win",gold:60},
 bL:{e:"🌊",t:"Pulled under",x:"Cold water, then nothing… You wake up coughing on the beach. Tessa is there with a blanket: “The sea gave you back. It doesn't always.”",end:"lose"}}}};
const ADVS=Object.keys(ADV);
/* ---------------- rules ---------------- */
const mod=(h,s)=>CL[h.cl].s[s]+(h.lv>1&&s===CL[h.cl].atk?h.lv-1:0);
const alive=S=>S.heroes.filter(h=>h&&h.hp>0);
const roll=(S,n,d)=>{let t=0;for(let i=0;i<n;i++)t+=1+Math.floor(S.R()*d);return t;};
function log(S,t){S.log.push(t);if(S.log.length>40)S.log.shift();}
function hurt(S,k,n){const h=S.heroes[k];h.hp=Math.max(0,h.hp-n);return n;}
const DEF={min:1,max:4,aiDelay:1100,
  init(pl,seed,opts){const R=window.__rng(seed);return {R,names:pl.map(p=>p.name),n:pl.length,phase:"pick",heroes:pl.map(()=>null),adv:null,node:null,lead:0,gold:10,potions:pl.length===1?4:pl.length===2?3:2,items:[],
    pend:null,res:null,fight:null,log:[],rollN:0,last:null,fights:0,inspire:pl.map(()=>0),outcome:null};},
  turn(S){if(S.phase==="pick"){const i=S.heroes.findIndex(h=>!h);return i;}
    if(S.phase==="adv")return 0;if(S.phase==="scene"||S.phase==="who"||S.phase==="result")return S.lead;if(S.phase==="roll")return S.pend.k;
    if(S.phase==="fight")return S.fight.order[S.fight.i];return -1;},
  check(S,k,a){try{return legal(S,k,a);}catch(e){return false;}},
  apply(S,k,a){if(!legal(S,k,a))return false;act(S,k,a);return true;},
  ai(S,k){return aiMove(S,k);}};
const node=S=>ADV[S.adv].nodes[S.node];
function choiceOk(S,c){if(c.need){if(c.need.gold&&S.gold<c.need.gold)return false;if(c.need.item&&!S.items.includes(c.need.item))return false;}return true;}
function legal(S,k,a){const t=a[0];if(k<0||k>=S.n)return false;
  if(t===1)return S.phase==="pick"&&!S.heroes[k]&&a[1]<CLS.length;
  if(t===11)return S.phase==="adv"&&k===0&&a[1]<ADVS.length;
  if(t===9){if(S.potions<1)return false;const h=S.heroes[a[1]];if(!h||h.hp>=h.max)return false;   // potion: out of a fight anyone, in a fight it's your action
    if(S.phase==="fight")return S.fight.order[S.fight.i]===k;return ["scene","who","roll","result"].includes(S.phase);}
  if(t===2){if(S.phase!=="scene"||k!==S.lead)return false;const c=(node(S).c||[])[a[1]];return !!c&&choiceOk(S,c);}
  if(t===12)return S.phase==="who"&&k===S.lead&&S.heroes[a[1]]&&S.heroes[a[1]].hp>0;
  if(t===3)return S.phase==="roll"&&k!==S.pend.k&&S.heroes[k].hp>0&&!S.pend.help.includes(k)&&S.pend.help.length<2;
  if(t===4)return S.phase==="roll"&&k===S.pend.k;
  if(t===8)return (S.phase==="result"&&k===S.lead)||(S.phase==="scene"&&k===S.lead&&!node(S).c&&!node(S).f&&!node(S).end);
  if(t===5||t===6||t===7){if(S.phase!=="fight"||S.fight.order[S.fight.i]!==k)return false;if(t===7)return true;
    const h=S.heroes[k];if(t===6&&h.ab<1)return false;const cl=h.cl;
    if(t===5||(t===6&&(cl==="fighter"||cl==="rogue"))){const e=S.fight.en[a[1]];return !!e&&e.hp>0;}
    if(t===6&&cl==="wizard")return true;if(t===6){const h2=S.heroes[a[1]];return !!h2&&(cl==="cleric"||h2.hp>0);}return false;}
  if(t===10)return S.phase==="end"&&k===0;
  return false;}
function goNode(S,id){S.node=id;const N=node(S);S.pend=null;S.res=null;
  if(N.rest){for(const h of S.heroes)if(h&&h.hp>0)h.hp=Math.min(h.max,h.hp+Math.ceil(h.max*N.rest));}
  if(N.gain)gain(S,N.gain);
  if(N.f){startFight(S,N);return;}
  if(N.end){S.phase="end";S.outcome=N.end;if(N.gold&&N.end==="win")S.gold+=N.gold;log(S,N.end==="win"?`🏆 ${ADV[S.adv].n}: done!`:"The adventure ends here…");return;}
  S.phase="scene";}
function gain(S,g){if(g.gold)S.gold=Math.max(0,S.gold+g.gold);if(g.item&&!S.items.includes(g.item))S.items.push(g.item);if(g.potion)S.potions+=g.potion;}
function nextLead(S){for(let i=1;i<=S.n;i++){const k=(S.lead+i)%S.n;if(S.heroes[k]&&S.heroes[k].hp>0){S.lead=k;return;}}}
function act(S,k,a){const t=a[0],nm=S.names[k];
  if(t===1){const cl=CLS[a[1]],c=CL[cl];S.heroes[k]={cl,hp:c.hp,max:c.hp,lv:1,ab:2,def:0};log(S,`${nm} is the ${c.n}`);if(S.heroes.every(Boolean))S.phase="adv";return;}
  if(t===11){S.adv=ADVS[a[1]];log(S,`📖 ${ADV[S.adv].n}`);goNode(S,ADV[S.adv].start);return;}
  if(t===9){const h=S.heroes[a[1]];S.potions--;const v=roll(S,2,4)+2;h.hp=Math.min(h.max,h.hp+v);log(S,`🧪 ${S.names[a[1]]} drinks a potion: +${v} HP`);if(S.phase==="fight")fightNext(S);return;}
  if(t===2){const c=node(S).c[a[1]];if(c.gain&&!c.s)gain(S,c.gain);
    if(!c.s){log(S,`${nm}: ${c.l}`);nextLead(S);goNode(S,c.go);return;}
    S.pend={c:a[1],k:-1,help:[]};S.phase="who";return;}
  if(t===12){S.pend.k=a[1];S.phase="roll";return;}
  if(t===3){S.pend.help.push(k);log(S,`🤝 ${nm} helps (+2)`);return;}
  if(t===4){const c=node(S).c[S.pend.c],h=S.heroes[k],d=1+Math.floor(S.R()*20),b=mod(h,c.s)+S.pend.help.length*2+(S.inspire[k]||0);S.inspire[k]=0;
    const tot=d+b,ok=d===20||(d!==1&&tot>=c.dc);S.rollN++;S.last={n:S.rollN,k,d,b,tot,dc:c.dc,ok,st:c.s};
    log(S,`🎲 ${nm} rolls ${d} ${b>=0?"+":"−"} ${Math.abs(b)} = ${tot} vs ${c.dc}: ${ok?"success":"fail"}${d===20?" (critical!)":d===1?" (fumble!)":""}`);
    let txt=ok?c.okx:c.nox;
    if(ok&&c.gain)gain(S,c.gain);
    if(!ok&&c.hurt){const [who,[n,dd]]=c.hurt;if(who==="all"){const v=roll(S,n,dd);for(let i=0;i<S.n;i++)if(S.heroes[i]&&S.heroes[i].hp>0)hurt(S,i,v);txt+=` Everyone loses ${v} HP.`;}
      else{const v=roll(S,n,dd);hurt(S,k,v);txt+=` ${nm} loses ${v} HP.`;}}
    S.res={txt,ok,next:ok?c.ok:c.no};S.phase="result";
    if(!alive(S).length){S.res.next=ADV[S.adv].nodes[node(S).lose||""]?node(S).lose:Object.keys(ADV[S.adv].nodes).find(x=>ADV[S.adv].nodes[x].end==="lose");}
    return;}
  if(t===8){if(S.phase==="result"){const nx=S.res.next;nextLead(S);goNode(S,nx);}else{nextLead(S);goNode(S,node(S).go);}return;}
  if(t===10){const keepLv=S.heroes.map(h=>h&&{cl:h.cl,lv:h.lv});for(let i=0;i<S.n;i++){const c=CL[keepLv[i].cl];S.heroes[i]={cl:keepLv[i].cl,lv:keepLv[i].lv,max:c.hp+(keepLv[i].lv-1)*4,hp:c.hp+(keepLv[i].lv-1)*4,ab:2,def:0};}
    S.items=[];S.potions=Math.max(S.potions,2);S.phase="adv";S.adv=null;S.node=null;S.outcome=null;S.fight=null;log(S,"A new adventure…");return;}
  if(t===5||t===6||t===7)fightAct(S,k,a);}
/* ---------------- fights ---------------- */
// fights scale with the party: fewer and weaker enemies for one or two heroes
function startFight(S,N){const ms=N.f.m.slice(0,S.n===1?2:S.n===2?3:9),mult=[0.42,0.75,1.25,1.6][S.n-1]||1,lvl=Math.max(0,Math.round((S.heroes.reduce((a,h)=>a+(h?h.lv:1),0)/S.n-1)*1.5));
  const en=ms.map((m,i)=>{const M=MON[m],hp=Math.max(4,Math.round((M[2]+lvl*3)*mult));
    return {m,n:M[0]+(ms.filter(x=>x===m).length>1?" "+"ABCD"[ms.slice(0,i).filter(x=>x===m).length]:""),e:M[1],hp,max:hp,ac:M[3]-(S.n===1?1:0),atk:M[4]+Math.floor(lvl/2)-(S.n===1?1:0),dmg:M[5]};});
  if(N.f.weak)en[0].hp=en[0].max=Math.max(8,en[0].max-N.f.weak);
  for(const h of S.heroes)if(h)h.def=0;
  S.fight={en,order:S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]),i:0,round:1,ev:[],evn:0,win:N.f.win,lose:N.f.lose,gold:N.gold||0};S.phase="fight";
  log(S,`⚔ ${en.map(e=>e.n).join(", ")}!`);skipDown(S);}
function fev(S,o){const F=S.fight;F.evn++;o.n=F.evn;F.ev.push(o);if(F.ev.length>12)F.ev.shift();}
function skipDown(S){const F=S.fight;let g=0;while(g++<10&&F.i<F.order.length&&S.heroes[F.order[F.i]].hp<=0)F.i++;if(F.i>=F.order.length)enemiesAct(S);}
function fightNext(S){const F=S.fight;if(!F)return;if(F.en.every(e=>e.hp<=0))return fightWon(S);F.i++;skipDown(S);}
function fightAct(S,k,a){const F=S.fight,h=S.heroes[k],c=CL[h.cl],nm=S.names[k],t=a[0];h.def=0;
  const hit=(e,always,extra,dbl)=>{const d=1+Math.floor(S.R()*20),tot=d+mod(h,c.atk)+1+(S.inspire[k]||0);S.inspire[k]=0;const ok=always||d===20||(d!==1&&tot>=e.ac);
    if(!ok){log(S,`${nm} attacks ${e.n}: ${d} = ${tot} vs AC ${e.ac}, miss`);fev(S,{k:"miss",t:F.en.indexOf(e),who:k});return;}
    let dmg=roll(S,1,c.die)+Math.max(0,mod(h,c.atk))+(extra||0);if(d===20||dbl)dmg*=2;e.hp=Math.max(0,e.hp-dmg);
    log(S,`${nm} hits ${e.n} for ${dmg}${d===20?" (critical!)":""}${e.hp<=0?`: ${e.n} falls`:""}`);fev(S,{k:"hit",t:F.en.indexOf(e),v:dmg,who:k,kill:e.hp<=0});};
  if(t===7){h.def=4;log(S,`🛡 ${nm} defends (+4 AC this round)`);fev(S,{k:"def",who:k});}
  else if(t===5)hit(F.en[a[1]]);
  else{h.ab--;const cl=h.cl;
    if(cl==="fighter")hit(F.en[a[1]],false,6);else if(cl==="rogue")hit(F.en[a[1]],true,0,true);
    else if(cl==="wizard"){const v=roll(S,2,6)+mod(h,"wit");for(const e of F.en)if(e.hp>0){e.hp=Math.max(0,e.hp-v);}log(S,`🔥 ${nm} casts Fireball: ${v} to every enemy`);fev(S,{k:"fire",v,who:k});}
    else if(cl==="cleric"){const h2=S.heroes[a[1]],v=roll(S,2,6)+3;h2.hp=Math.min(h2.max,h2.hp+v);log(S,`✨ ${nm} heals ${S.names[a[1]]} for ${v}`);fev(S,{k:"heal",to:a[1],v});}
    else if(cl==="bard"){const h2=S.heroes[a[1]],v=roll(S,1,6);h2.hp=Math.min(h2.max,h2.hp+v);S.inspire[a[1]]=4;log(S,`🎻 ${nm} inspires ${S.names[a[1]]}: +${v} HP and +4 on the next roll`);fev(S,{k:"heal",to:a[1],v});}}
  fightNext(S);}
function enemiesAct(S){const F=S.fight;
  for(const e of F.en){if(e.hp<=0)continue;const targets=S.heroes.map((h,i)=>i).filter(i=>S.heroes[i]&&S.heroes[i].hp>0);if(!targets.length)break;
    const ti=targets[Math.floor(S.R()*targets.length)],h=S.heroes[ti],ac=CL[h.cl].ac+h.def,d=1+Math.floor(S.R()*20),tot=d+e.atk;
    if(d===20||(d!==1&&tot>=ac)){let v=Math.max(1,roll(S,e.dmg[0],e.dmg[1])+Math.floor(e.atk/2)-(S.n===1?2:S.n===2?1:0));if(d===20)v*=2;hurt(S,ti,v);log(S,`${e.e} ${e.n} hits ${S.names[ti]} for ${v}${h.hp<=0?`: ${S.names[ti]} is down!`:""}`);fev(S,{k:"ehit",from:F.en.indexOf(e),to:ti,v,down:h.hp<=0});}
    else{log(S,`${e.e} ${e.n} attacks ${S.names[ti]} and misses`);fev(S,{k:"emiss",from:F.en.indexOf(e),to:ti});}}
  if(!alive(S).length){fightLost(S);return;}
  for(const h of S.heroes)if(h)h.def=0;F.round++;F.i=0;skipDown(S);}
function fightWon(S){const F=S.fight;S.fights++;let lvUp=false;
  for(const h of S.heroes){if(!h)continue;if(h.hp<=0)h.hp=1;}
  if(S.fights%2===0){for(const h of S.heroes)if(h){h.lv++;h.max+=4;h.hp=Math.min(h.max,h.hp+4);h.ab=Math.min(3,h.ab+1);}lvUp=true;}
  const g=F.gold+5*F.en.length;S.gold+=g;if(S.R()<0.35)S.potions++;
  log(S,`🏆 Victory! +${g} gold${lvUp?` · ⭐ everyone reaches level ${S.heroes.find(Boolean).lv}`:""}`);
  const win=F.win;S.fight=null;S.lastWin={g,lvUp,n:S.rollN+1000+S.fights};goNode(S,win);}
function fightLost(S){const F=S.fight;S.fight=null;for(const h of S.heroes)if(h)h.hp=Math.max(1,Math.ceil(h.max/3));goNode(S,F.lose);}
/* ---------------- the computer heroes ---------------- */
function best(S,c){let bk=-1,bv=-99;for(let i=0;i<S.n;i++){const h=S.heroes[i];if(!h||h.hp<=0)continue;const v=mod(h,c.s);if(v>bv){bv=v;bk=i;}}return bk;}
function aiMove(S,k){const a=aiPick(S,k);if(a&&legal(S,k,a))return a;   /* never get stuck on a move that isn't allowed */
  if(S.phase==="fight"){const F=S.fight,i=F.en.findIndex(e=>e.hp>0);return i>=0?[5,i]:[7];}return a;}
function aiPick(S,k){
  if(S.phase==="pick"){const taken=S.heroes.filter(Boolean).map(h=>h.cl),free=CLS.filter(c=>!taken.includes(c));return [1,CLS.indexOf(free[Math.floor(Math.random()*free.length)]||"fighter")];}
  if(S.phase==="adv")return [11,0];
  if(S.phase==="scene"){const N=node(S);if(!N.c)return [8];let bi=0,bs=-99;N.c.forEach((c,i)=>{if(!choiceOk(S,c))return;const sc=c.s?mod(S.heroes[best(S,c)],c.s)-c.dc+12:(c.need?9:8);if(sc>bs){bs=sc;bi=i;}});return [2,bi];}
  if(S.phase==="who")return [12,best(S,node(S).c[S.pend.c])];
  if(S.phase==="roll")return [4];if(S.phase==="result")return [8];
  if(S.phase==="fight"){const F=S.fight,h=S.heroes[k],en=F.en.map((e,i)=>[e,i]).filter(x=>x[0].hp>0).sort((a,b)=>a[0].hp-b[0].hp),weak=S.heroes.map((x,i)=>[x,i]).filter(x=>x[0]).sort((a,b)=>a[0].hp/a[0].max-b[0].hp/b[0].max)[0];
    if(h.ab>0&&h.cl==="cleric"&&weak&&weak[0].hp/weak[0].max<0.45)return [6,weak[1]];
    if(h.ab>0&&h.cl==="wizard"&&en.length>=2)return [6,0];
    if(h.ab>0&&(h.cl==="fighter"||h.cl==="rogue")&&en.length&&en[en.length-1][0].hp>8)return [6,en[en.length-1][1]];
    if(h.ab>0&&h.cl==="bard"&&weak&&weak[0].hp>0&&weak[0].hp/weak[0].max<0.5)return [6,weak[1]];
    if(h.hp/h.max<0.3&&S.potions>0)return [9,k];
    return en.length?[5,en[0][1]]:[7];}
  return null;}
/* ---------------- the screen ---------------- */
const CSS=`.rq{display:flex;flex-direction:column;gap:8px}
.rq-party{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
.rq-h{flex:1 0 82px;min-width:82px;border-radius:14px;padding:6px 8px;background:var(--chip);position:relative;font:600 12px system-ui}
.rq-h.lead{box-shadow:inset 0 0 0 2px var(--tc)}.rq-h.now{box-shadow:inset 0 0 0 2px #f2b233,0 0 12px rgba(242,178,51,.5)}.rq-h.down{opacity:.5;filter:grayscale(.8)}
.rq-h .e{font-size:20px}.rq-h b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-bar{height:6px;border-radius:3px;background:rgba(0,0,0,.15);overflow:hidden;margin-top:3px}.rq-bar i{display:block;height:100%;background:#3fb56b;transition:width .4s}
.rq-bar i.lo{background:#e0533c}.rq-h small{opacity:.8}
.rq-scene{border-radius:20px;padding:14px;background:linear-gradient(160deg,#2a2346,#171428);color:#f3eee2;box-shadow:0 6px 20px rgba(0,0,0,.25);position:relative;overflow:hidden}
.rq-pic{font-size:64px;text-align:center;line-height:1.1;animation:rqfloat 4s ease-in-out infinite;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))}@keyframes rqfloat{50%{transform:translateY(-6px)}}
.rq-scene h3{margin:6px 0 6px;font:800 20px Georgia,serif;text-align:center;color:#ffd98a}
.rq-scene p{margin:6px 0;font:400 15.5px/1.5 Georgia,serif}.rq-scene p.res{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.08)}
.rq-scene p.ok{box-shadow:inset 3px 0 0 #3fb56b}.rq-scene p.no{box-shadow:inset 3px 0 0 #e0533c}
.rq-in{animation:rqin .6s ease-out}@keyframes rqin{from{opacity:0;transform:translateY(8px)}}
.rq-ch{display:flex;flex-direction:column;gap:8px}
.rq-c{border:0;border-radius:14px;padding:12px 14px;text-align:left;background:var(--card);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 1px var(--line);font:600 15px system-ui;display:flex;gap:10px;align-items:center}
.rq-c small{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}.rq-c .tag{flex:none;font-size:22px}
.rq-c:disabled{opacity:.5}.rq-c.mine{box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 2px var(--tc)}
.rq-note{font:600 13px system-ui;color:var(--muted);text-align:center}
.rq-big{border:0;border-radius:18px;padding:16px;font:800 18px system-ui;background:var(--tc);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.rq-big.alt{background:var(--chip);color:var(--ink)}
.rq-en{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rq-e{border:0;background:rgba(255,255,255,.07);color:#fff;border-radius:14px;padding:8px 6px 6px;width:96px;position:relative;font:700 12px system-ui}
.rq-e .em{font-size:44px;line-height:1.1;display:block}.rq-e.tgt{box-shadow:0 0 0 2px #f2b233;animation:rqp 1s infinite}@keyframes rqp{50%{box-shadow:0 0 0 2px transparent}}
.rq-e.dead{opacity:.25;filter:grayscale(1)}.rq-e .rq-bar i{background:#e0533c}
.rq-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-acts button{border:0;border-radius:14px;padding:12px 8px;font:700 14px system-ui;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line)}
.rq-acts button.on{background:var(--tc);color:#fff}.rq-acts button small{display:block;font-weight:500;font-size:11.5px;opacity:.8}
.rq-log{font:500 12.5px/1.4 system-ui;color:var(--muted);background:var(--chip);border-radius:12px;padding:8px 10px}
.rq-inv{display:flex;gap:10px;justify-content:center;font:700 14px system-ui;flex-wrap:wrap}.rq-inv button{border:0;background:var(--chip);color:var(--ink);border-radius:12px;padding:6px 10px;font:inherit}
.rq-cls{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-cls button{border:0;border-radius:16px;padding:10px;text-align:left;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:500 12px/1.35 system-ui}
.rq-cls button b{display:block;font-size:15px}.rq-cls button .e{font-size:28px}.rq-cls button.taken{box-shadow:inset 0 0 0 2px var(--tc)}
.rq-dice{position:fixed;inset:0;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(48,34,96,.78),rgba(6,4,16,.9));backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);-webkit-tap-highlight-color:transparent}
.rq-stage{position:relative;width:190px;height:210px;display:flex;align-items:center;justify-content:center}
.rq-dw{position:relative;width:170px;height:170px;will-change:transform}.rq-dt{width:100%;height:100%;will-change:transform}
.rq-die{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45));transition:filter .4s}
.rq-die .fc{stroke:rgba(255,255,255,.28);stroke-width:1.3;stroke-linejoin:round}.rq-die stop{transition:stop-color .45s}
.rq-die .n{font:900 40px system-ui;fill:#fff;text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:rgba(0,0,0,.35);stroke-width:3px}
.rq-die .sn{font:800 15px system-ui;fill:rgba(255,255,255,.55);text-anchor:middle;dominant-baseline:central}
.rq-die .ck{fill:none;stroke:#1a0503;stroke-width:3;stroke-linecap:round;stroke-dasharray:160;stroke-dashoffset:160;opacity:0}
.rq-dice.ok .rq-die{filter:drop-shadow(0 0 22px rgba(80,230,140,.65)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-dice.no .rq-die{filter:drop-shadow(0 0 18px rgba(255,90,60,.5)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-dice.crit .rq-die{filter:drop-shadow(0 0 30px rgba(255,210,90,.9)) drop-shadow(0 10px 18px rgba(0,0,0,.4))}
.rq-shadow{position:absolute;left:50%;bottom:4px;width:120px;height:18px;margin-left:-60px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.55),transparent 70%)}
.rq-ring{position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:3px solid var(--rc,#fff);opacity:0;pointer-events:none}
.rq-spark{position:absolute;left:50%;top:50%;font-size:18px;color:#ffe38a;pointer-events:none;text-shadow:0 0 8px #ffb300}
.rq-dice .cap{margin-top:6px;font:900 28px system-ui;color:#fff;letter-spacing:.5px;text-shadow:0 2px 12px rgba(0,0,0,.7);opacity:0}
.rq-dice.ok .cap{color:#8ff0b0}.rq-dice.no .cap{color:#ffab96}.rq-dice.crit .cap{color:#ffe38a}
.rq-dice .sub{margin-top:6px;display:flex;gap:6px;align-items:center;opacity:0}
.rq-dice .sub span{font:800 14px system-ui;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);padding:4px 10px;border-radius:999px}
.rq-dice .who{font:700 13px system-ui;color:rgba(255,255,255,.75);margin-bottom:4px}.rq-dice .tap{position:absolute;bottom:28px;font:600 12px system-ui;color:rgba(255,255,255,.45)}
.rq-float{position:fixed;z-index:290;pointer-events:none;font:900 24px system-ui;color:#fff;-webkit-text-stroke:1.2px #000;transform:translate(-50%,-50%)}
.rq-shake{animation:rqsh .4s}@keyframes rqsh{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}}
.rq-ov{position:fixed;inset:0;z-index:300;background:rgba(10,8,20,.7);display:flex;align-items:flex-end;justify-content:center;padding:10px 10px calc(10px + env(safe-area-inset-bottom))}
.rq-sheet{width:100%;max-width:520px;max-height:86vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:20px;padding:14px}.rq-sheet h3{margin:4px 0 8px;font:900 19px system-ui}.rq-sheet p,.rq-sheet li{font-size:14px;line-height:1.45}`;
const DCW=dc=>dc<=10?"easy":dc<=12?"medium":dc<=14?"hard":"very hard";
const HELP=`<h3>How to play Questbook</h3><p>The phone is your game master: it tells the story, you decide what your heroes do. Work together to reach the end.</p>
  <ul><li><b>Choices:</b> one hero leads each scene (👑, it goes round) and picks what the party does.</li>
  <li><b>Checks:</b> some choices need a roll. The leader picks who tries. That hero rolls a <b>d20</b> and adds their skill (💪 Might, 🤸 Agility, 🧠 Wits, 💬 Charm). Reach the number (DC) and it works. A 20 always works, a 1 always fails.</li>
  <li><b>Help:</b> while someone is about to roll, others can tap <b>Help</b>: +2 each (two helpers at most).</li>
  <li><b>Fights:</b> take turns: Attack an enemy, use your class Ability (2 per adventure, more as you level), Defend (+4 armour this round) or drink a Potion. Then the enemies strike back. A hero at 0 HP is down until the fight is won.</li>
  <li><b>Growing:</b> every two fights the party gains a level: more HP, better attacks and an extra ability charge.</li>
  <li><b>Potions</b> 🧪 are shared: tap them at the bottom outside fights to heal someone.</li></ul>`;
function ov(html,wire){const o=document.createElement("div");o.className="rq-ov";o.innerHTML=`<div class="rq-sheet">${html}<div class="gm-row2" style="margin-top:10px"><button class="tl-act ghost" data-x>Close</button></div></div>`;
  (document.querySelector(".gx")||document.body).appendChild(o);const close=()=>o.remove();o.onclick=e=>{if(e.target===o)close();};o.querySelector("[data-x]").onclick=close;if(wire)wire(o,close);}
const D20=(()=>{const P=(a,r)=>[100+r*Math.cos(a*Math.PI/180),100+r*Math.sin(a*Math.PI/180)],V=[-90,-30,30,90,150,210].map(a=>P(a,94)),C=[-90,30,150].map(a=>P(a,54));
  /* the visible faces of an icosahedron seen point-up: centre face, three edge faces, six rim faces, each with its own light */
  const F=[[C[0],C[1],V[1],.16],[C[1],C[2],V[3],-.3],[C[2],C[0],V[5],.05],[V[0],V[1],C[0],.3],[V[1],V[2],C[1],-.05],[V[2],V[3],C[1],-.22],[V[3],V[4],C[2],-.38],[V[4],V[5],C[2],-.18],[V[5],V[0],C[0],.22],[C[0],C[1],C[2],.1]];
  const pts=a=>a.slice(0,3).map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" "),cen=f=>[(f[0][0]+f[1][0]+f[2][0])/3,(f[0][1]+f[1][1]+f[2][1])/3];
  const side=[[F[0],60],[F[1],180],[F[2],-60]].map(([f,r])=>{const c=cen(f);return `<text class="sn" x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" transform="rotate(${r} ${c[0].toFixed(1)} ${c[1].toFixed(1)})">8</text>`;}).join("");
  return `<svg class="rq-die" viewBox="0 0 200 200"><defs><linearGradient id="rqDg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--d1)"/><stop offset="1" style="stop-color:var(--d2)"/></linearGradient>
    <radialGradient id="rqDs" cx=".32" cy=".22" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="url(#rqDg)"/>
    ${F.map(f=>`<polygon class="fc" points="${pts(f)}" fill="${f[3]>0?"#fff":"#000"}" fill-opacity="${Math.abs(f[3])}"/>`).join("")}
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="url(#rqDs)" style="mix-blend-mode:screen"/>
    <polygon points="${V.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-linejoin="round"/>
    ${side}<text class="n" x="100" y="108">20</text><polyline class="ck" points="62,40 84,78 72,96 104,126 96,150 122,176"/></svg>`;})();
const DCOL={roll:["#8b74ff","#2a1b78"],ok:["#58e08b","#0f6a35"],no:["#ff7d62","#7d160b"],crit:["#ffe9a0","#b87a0a"],fum:["#5a1c16","#160404"]};
function dice(L,me,names){const rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=document.createElement("div");d.className="rq-dice";
  d.innerHTML=`<div class="who">${L.k===me?"You roll":X.esc(names[L.k])+" rolls"}</div><div class="rq-stage"><div class="rq-shadow"></div><div class="rq-ring"></div><div class="rq-dw"><div class="rq-dt">${D20}</div></div></div><div class="cap"></div><div class="sub"></div><div class="tap">tap to continue</div>`;
  (document.querySelector(".gx")||document.body).appendChild(d);
  const svg=d.querySelector(".rq-die"),n=svg.querySelector(".n"),sn=[...svg.querySelectorAll(".sn")],dw=d.querySelector(".rq-dw"),dt=d.querySelector(".rq-dt"),sh=d.querySelector(".rq-shadow");
  const col=c=>{svg.style.setProperty("--d1",DCOL[c][0]);svg.style.setProperty("--d2",DCOL[c][1]);};col("roll");
  const rnd=()=>1+Math.floor(Math.random()*20),face=v=>{n.textContent=v;sn.forEach(t=>t.textContent=rnd());};face(rnd());
  let done=false,timers=[];const T=(f,ms)=>timers.push(setTimeout(f,ms));
  const close=()=>{if(done)return;done=true;timers.forEach(clearTimeout);d.animate([{opacity:1},{opacity:0}],{duration:220,fill:"forwards"}).onfinish=()=>d.remove();};
  d.onclick=close;d.animate([{opacity:0},{opacity:1}],{duration:160});
  const LAND=rm?120:760;
  if(!rm){/* thrown in from below: an arc, a hard landing, two small bounces */
    dw.animate([{transform:"translate(130px,330px) rotate(-320deg) scale(.45)"},{transform:"translate(40px,-70px) rotate(-110deg) scale(1.12)",offset:.45},{transform:"translate(0,0) rotate(14deg) scale(1)",offset:.72},
      {transform:"translate(0,-22px) rotate(-5deg)",offset:.83},{transform:"translate(0,0) rotate(2deg)",offset:.93},{transform:"translate(0,-4px) rotate(0)",offset:.97},{transform:"none"}],{duration:1050,easing:"cubic-bezier(.25,.6,.4,1)"});
    dt.animate([{transform:"perspective(500px) rotate3d(1,.6,0,0deg)"},{transform:"perspective(500px) rotate3d(1,.6,0,540deg)",offset:.7},{transform:"perspective(500px) rotate3d(1,.6,0,720deg)"}],{duration:LAND,easing:"cubic-bezier(.2,.7,.35,1)"});
    sh.animate([{transform:"scale(.3)",opacity:.2},{transform:"scale(.55)",opacity:.3,offset:.45},{transform:"scale(1.05)",opacity:1,offset:.72},{transform:"scale(.85)",opacity:.75,offset:.83},{transform:"scale(1)",opacity:1}],{duration:1050});
    /* numbers flick past fast, then slow down as the die settles */
    let t=0,gap=45;while(t<LAND-60){T(()=>face(rnd()),t);t+=gap;gap*=1.13;}}
  T(()=>{const c=L.d===20?"crit":L.d===1?"fum":L.ok?"ok":"no";face(L.d);col(c);d.classList.add(L.d===20?"crit":L.ok?"ok":"no");X.tapv();
    dt.animate([{transform:"scale(1.16,.86)"},{transform:"scale(.95,1.06)",offset:.45},{transform:"none"}],{duration:380,easing:"ease-out"});
    const ring=d.querySelector(".rq-ring");ring.style.setProperty("--rc",DCOL[c==="fum"?"no":c][0]);ring.animate([{transform:"scale(.6)",opacity:.9},{transform:"scale(1.9)",opacity:0}],{duration:650,easing:"ease-out"});
    if(c==="crit"){for(let i=0;i<14;i++){const s=document.createElement("div");s.className="rq-spark";s.textContent=i%3?"✦":"✧";d.querySelector(".rq-stage").appendChild(s);const a=i/14*Math.PI*2,r=90+Math.random()*50;
        s.animate([{transform:"translate(-50%,-50%) scale(.3)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px)) scale(1.1) rotate(${180+Math.random()*180}deg)`,opacity:0}],{duration:900+Math.random()*300,easing:"cubic-bezier(.1,.7,.3,1)",fill:"forwards"});}
      X.confetti();}
    if(c==="fum"){const ck=svg.querySelector(".ck");ck.style.opacity=1;ck.animate([{strokeDashoffset:160},{strokeDashoffset:0}],{duration:260,fill:"forwards"});
      dw.animate([{transform:"translateX(0)"},{transform:"translateX(-9px)"},{transform:"translateX(8px)"},{transform:"translateX(-5px)"},{transform:"translateX(3px)"},{transform:"none"}],{duration:380,delay:60});}
    const cap=d.querySelector(".cap"),sub=d.querySelector(".sub");cap.textContent=L.d===20?"Critical!":L.d===1?"Fumble!":L.ok?"Success!":"Failed";
    cap.animate([{opacity:0,transform:"translateY(10px) scale(.9)"},{opacity:1,transform:"none"}],{duration:300,delay:120,easing:"cubic-bezier(.3,1.5,.5,1)",fill:"forwards"});
    sub.innerHTML=`<span>🎲 ${L.d}</span><span>${L.b>=0?"+":"−"} ${Math.abs(L.b)}</span><span>= ${L.tot}</span><span>DC ${L.dc}</span>`;
    sub.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:280,delay:260,fill:"forwards"});},LAND);
  T(close,LAND+2100);}
function float(el,t,col){if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="rq-float";f.textContent=t;if(col)f.style.color=col;f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/3+"px";document.body.appendChild(f);
  f.animate([{transform:"translate(-50%,-30%) scale(.6)",opacity:0},{transform:"translate(-50%,-70%) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-130%)",opacity:0}],{duration:1000,fill:"forwards"}).onfinish=()=>f.remove();}
let SEL=null;
function view(R){const S=R.S,me=R.mySlot(),EL=X.EL();if(!document.getElementById("rqCss")){const st=document.createElement("style");st.id="rqCss";st.textContent=CSS;document.head.appendChild(st);}
  if(view.R!==R){view.R=R;view.roll=S.rollN;view.fe=S.fight?S.fight.evn:0;view.node=null;SEL=null;}
  X.shell("Questbook",R.status(),false);X.onBack(()=>X.leaveAsk(R));
  try{if(!localStorage.getItem("pt-rq-help")){localStorage.setItem("pt-rq-help","1");setTimeout(()=>ov(HELP),300);}}catch(e){}
  const nm=k=>k===me?"You":X.esc(S.names[k]),turn=DEF.turn(S),mine=turn===me&&!R.pending;
  const party=`<div class="rq-party">${S.heroes.map((h,k)=>{if(!h)return `<div class="rq-h"><span class="e">❔</span><b>${nm(k)}</b><small>choosing…</small></div>`;const c=CL[h.cl],p=Math.round(h.hp/h.max*100);
    return `<div class="rq-h ${k===S.lead&&S.phase!=="fight"?"lead":""} ${S.phase==="fight"&&turn===k?"now":""} ${h.hp<=0?"down":""}" data-hero="${k}"><span class="e">${c.e}</span>${k===S.lead&&S.phase!=="fight"?" 👑":""}<b>${nm(k)}</b><small>${c.n} · lv ${h.lv} · ✦${h.ab}</small>
      <div class="rq-bar"><i class="${p<35?"lo":""}" style="width:${p}%"></i></div><small>${h.hp}/${h.max} HP</small></div>`;}).join("")}</div>`;
  const inv=`<div class="rq-inv"><span>💰 ${S.gold}</span><button id="rqPot">🧪 ${S.potions}</button>${S.items.map(i=>`<span>${{key:"🗝️ Silver key",clapper:"🔔 Bell clapper"}[i]||i}</span>`).join("")}<button id="rqLog">📜 Log</button><button id="rqHelp">?</button></div>`;
  let body="";
  if(S.phase==="pick"){const h=S.heroes[me];
    body=`<div class="gm-big">${h?`You're the ${CL[h.cl].n}!`:"Choose your hero"}</div>${h?`<p class="rq-note">Waiting for the others to choose…</p>`:""}
      <div class="rq-cls">${CLS.map((k,i)=>{const c=CL[k],who=S.heroes.map((x,j)=>x&&x.cl===k?nm(j):null).filter(Boolean);
        return `<button data-cls="${i}" ${h?"disabled":""} class="${who.length?"taken":""}"><span class="e">${c.e}</span><b>${c.n}</b>${Object.keys(ST).map(s=>`${ST[s][1]}${c.s[s]>=0?"+":""}${c.s[s]}`).join(" ")}<br>❤ ${c.hp} · 🛡 ${c.ac}<br>${c.tip}<br><i>${c.ab}: ${c.abt}</i>${who.length?`<br><b style="font-size:12px">${who.join(", ")}</b>`:""}</button>`;}).join("")}</div>`;}
  else if(S.phase==="adv"){body=me===0?`<div class="gm-big">Choose an adventure</div><div class="rq-ch">${ADVS.map((a,i)=>`<button class="rq-c" data-adv="${i}"><span class="tag">${ADV[a].e}</span><div>${ADV[a].n}<small>${ADV[a].x}</small></div></button>`).join("")}</div>`
      :`<div class="gm-big">📖</div><p class="rq-note">${X.esc(S.names[0])} is choosing the adventure…</p>`;}
  else if(S.phase==="end"){const N=node(S),win=S.outcome==="win";
    body=`<div class="rq-scene rq-in"><div class="rq-pic">${N.e}</div><h3>${N.t}</h3><p>${N.x}</p></div><div class="gm-big">${win?"🏆 Adventure complete!":"The end… for now"}</div>
      ${me===0?`<button class="rq-big" id="rqAgain">${win?"Next adventure":"Try again"}</button>`:`<p class="rq-note">${X.esc(S.names[0])} can start the next adventure.</p>`}`;}
  else if(S.phase==="fight"){const F=S.fight,h=S.heroes[me],myTurn=mine&&h&&h.hp>0;
    const sel=SEL&&SEL.n===F.evn+"_"+F.i?SEL:null;const needEnemy=sel&&(sel.a===5||(sel.a===6&&["fighter","rogue"].includes(h.cl))),needAlly=sel&&sel.a===6&&["cleric","bard"].includes(h.cl);
    body=`<div class="rq-scene"><h3>⚔ Round ${F.round}</h3><div class="rq-en">${F.en.map((e,i)=>`<button class="rq-e ${e.hp<=0?"dead":""} ${needEnemy&&e.hp>0?"tgt":""}" data-en="${i}"><span class="em">${e.e}</span>${X.esc(e.n)}<div class="rq-bar"><i style="width:${Math.round(e.hp/e.max*100)}%"></i></div><small>${e.hp}/${e.max} · AC ${e.ac}</small></button>`).join("")}</div></div>
      ${myTurn?`<div class="rq-note">${needEnemy?"Tap an enemy":needAlly?"Tap a hero in the party bar":"Your turn: what do you do?"}</div>
        <div class="rq-acts"><button data-fa="5" class="${sel&&sel.a===5?"on":""}">⚔️ Attack<small>d20 + ${ST[CL[h.cl].atk][0]} vs armour, d${CL[h.cl].die} damage</small></button>
        <button data-fa="6" class="${sel&&sel.a===6?"on":""}" ${h.ab<1?"disabled":""}>${CL[h.cl].e} ${CL[h.cl].ab} ✦${h.ab}<small>${CL[h.cl].abt}</small></button>
        <button data-fa="7">🛡 Defend<small>+4 armour until your next turn</small></button><button data-fa="9" ${S.potions<1||h.hp>=h.max?"disabled":""}>🧪 Potion (${S.potions})<small>Heal yourself 2d4 + 2</small></button></div>`
      :`<p class="rq-note">${turn>=0?`${nm(turn)} ${turn===me?"":"is "}taking a turn…`:""}</p>`}
      <div class="rq-log">${S.log.slice(-4).map(X.esc).join("<br>")}</div>`;}
  else{const N=node(S),lead=S.lead===me&&!R.pending;
    let txt=`<div class="rq-scene ${view.node!==S.node?"rq-in":""}"><div class="rq-pic">${N.e}</div><h3>${N.t}</h3><p>${N.x}</p>${S.res?`<p class="res ${S.res.ok?"ok":"no"}">${X.esc(S.res.txt)}</p>`:""}</div>`;
    if(S.phase==="scene"){if(N.c)txt+=`<div class="rq-note">${lead?"👑 You lead this scene: what does the party do?":`👑 ${nm(S.lead)} chooses what the party does…`}</div><div class="rq-ch">${N.c.map((c,i)=>{const ok=choiceOk(S,c),bh=c.s?best(S,c):-1;
        return `<button class="rq-c ${lead?"mine":""}" data-ch="${i}" ${!lead||!ok?"disabled":""}><span class="tag">${c.s?ST[c.s][1]:c.need?(c.need.gold?"💰":"🗝️"):"➡️"}</span><div>${X.esc(c.l)}<small>${c.s?`${ST[c.s][0]} check · ${DCW(c.dc)} (DC ${c.dc}) · best: ${nm(bh)} ${mod(S.heroes[bh],c.s)>=0?"+":""}${mod(S.heroes[bh],c.s)}`:c.need?(c.need.gold?`Costs ${c.need.gold} gold${ok?"":" (not enough)"}`:ok?"You have it":"You don't have it"):"No roll needed"}</small></div></button>`;}).join("")}</div>`;
      else txt+=lead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;}
    if(S.phase==="who"){const c=N.c[S.pend.c];txt+=`<div class="rq-note">${X.esc(c.l)}: ${ST[c.s][0]} check, DC ${c.dc}. ${lead?"Who tries?":`${nm(S.lead)} picks who tries…`}</div>
      <div class="rq-ch">${S.heroes.map((h,k)=>h&&h.hp>0?`<button class="rq-c ${lead?"mine":""}" data-who="${k}" ${lead?"":"disabled"}><span class="tag">${CL[h.cl].e}</span><div>${nm(k)}<small>${ST[c.s][0]} ${mod(h,c.s)>=0?"+":""}${mod(h,c.s)} · needs ${Math.max(2,c.dc-mod(h,c.s))}+ on the d20</small></div></button>`:"").join("")}</div>`;}
    if(S.phase==="roll"){const c=N.c[S.pend.c],h=S.heroes[S.pend.k],b=mod(h,c.s)+S.pend.help.length*2+(S.inspire[S.pend.k]||0);
      txt+=`<div class="rq-note">${nm(S.pend.k)} ${S.pend.k===me?"try":"tries"}: d20 ${b>=0?"+":"−"} ${Math.abs(b)} vs DC ${c.dc}${S.pend.help.length?` (helped by ${S.pend.help.map(nm).join(" and ")})`:""}</div>`;
      txt+=S.pend.k===me&&!R.pending?`<button class="rq-big" id="rqRoll">🎲 Roll the d20</button>`:`${S.heroes[me]&&S.heroes[me].hp>0&&!S.pend.help.includes(me)&&S.pend.help.length<2?`<button class="rq-big alt" id="rqHelp2">🤝 Help (+2)</button>`:""}<p class="rq-note">Waiting for ${nm(S.pend.k)} to roll…</p>`;}
    if(S.phase==="result")txt+=lead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;
    body=txt;view.node=S.node;}
  EL.innerHTML=`<div class="rq">${party}${body}${S.phase!=="pick"?inv:""}</div>`;
  // what just happened: the dice, hits and heals
  if(S.last&&S.last.n!==view.roll&&S.phase!=="pick"){view.roll=S.last.n;dice(S.last,me,S.names);}else view.roll=S.last?S.last.n:view.roll;
  if(S.fight){const F=S.fight;for(const e of F.ev)if(e.n>view.fe){
      if(e.k==="hit"){const el=EL.querySelector(`[data-en="${e.t}"]`);float(el,`−${e.v}`,"#ffd2d2");if(el)el.classList.add("rq-shake");}
      if(e.k==="miss")float(EL.querySelector(`[data-en="${e.t}"]`),"miss","#ddd");
      if(e.k==="fire")EL.querySelectorAll("[data-en]").forEach(el=>{float(el,`🔥−${e.v}`);el.classList.add("rq-shake");});
      if(e.k==="heal")float(EL.querySelector(`[data-hero="${e.to}"]`),`+${e.v}`,"#9cf2b5");
      if(e.k==="ehit"){const el=EL.querySelector(`[data-hero="${e.to}"]`);float(el,`−${e.v}`,"#ffb3a8");if(el)el.classList.add("rq-shake");if(e.to===me)X.tapv();}
      if(e.k==="emiss")float(EL.querySelector(`[data-hero="${e.to}"]`),"miss","#ddd");}
    view.fe=F.evn;}
  const go=a=>{SEL=null;R.act(a);};
  EL.querySelectorAll("[data-cls]").forEach(b=>b.onclick=()=>{X.tapv();go([1,+b.dataset.cls]);});
  EL.querySelectorAll("[data-adv]").forEach(b=>b.onclick=()=>{X.tapv();go([11,+b.dataset.adv]);});
  EL.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{X.tapv();go([2,+b.dataset.ch]);});
  EL.querySelectorAll("[data-who]").forEach(b=>b.onclick=()=>{X.tapv();go([12,+b.dataset.who]);});
  const q=id=>EL.querySelector(id);
  if(q("#rqNext"))q("#rqNext").onclick=()=>{X.tapv();go([8]);};if(q("#rqRoll"))q("#rqRoll").onclick=()=>{X.tapv();go([4]);};
  if(q("#rqHelp2"))q("#rqHelp2").onclick=()=>{X.tapv();go([3]);};if(q("#rqAgain"))q("#rqAgain").onclick=()=>{X.tapv();go([10]);};
  if(q("#rqLog"))q("#rqLog").onclick=()=>ov(`<h3>📜 What happened</h3><p>${S.log.slice().reverse().map(X.esc).join("<br>")}</p>`);
  if(q("#rqHelp"))q("#rqHelp").onclick=()=>ov(HELP);
  if(q("#rqPot"))q("#rqPot").onclick=()=>{if(S.potions<1){X.toast("No potions left");return;}if(S.phase==="fight"){X.toast("In a fight, drink one with the Potion button on your turn");return;}
    ov(`<h3>🧪 Who drinks a potion?</h3><p>Heals 2d4 + 2. You have ${S.potions}.</p><div class="rq-ch">${S.heroes.map((h,k)=>h?`<button class="rq-c" data-pot="${k}" ${h.hp>=h.max?"disabled":""}><span class="tag">${CL[h.cl].e}</span><div>${nm(k)}<small>${h.hp}/${h.max} HP</small></div></button>`:"").join("")}</div>`,
      (o,close)=>o.querySelectorAll("[data-pot]").forEach(b=>b.onclick=()=>{close();go([9,+b.dataset.pot]);}));};
  // fights: pick an action, then a target
  if(S.phase==="fight"){const F=S.fight,h=S.heroes[me];
    EL.querySelectorAll("[data-fa]").forEach(b=>b.onclick=()=>{X.tapv();const a=+b.dataset.fa;
      if(a===7){go([7]);return;}if(a===9){go([9,me]);return;}if(a===6&&h.cl==="wizard"){go([6,0]);return;}
      SEL={a,n:F.evn+"_"+F.i};const alive=F.en.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);
      if((a===5||(a===6&&["fighter","rogue"].includes(h.cl)))&&alive.length===1){go([a,alive[0]]);return;}view(R);});
    EL.querySelectorAll("[data-en]").forEach(b=>b.onclick=()=>{if(!SEL)return;X.tapv();go([SEL.a,+b.dataset.en]);});
    EL.querySelectorAll("[data-hero]").forEach(b=>b.onclick=()=>{if(!SEL||SEL.a!==6||!["cleric","bard"].includes(h.cl))return;X.tapv();go([6,+b.dataset.hero]);});}}
function stop(){document.querySelectorAll(".rq-ov,.rq-dice,.rq-float").forEach(e=>e.remove());const s=document.getElementById("rqCss");if(s)s.remove();view.R=null;}
window.RPG={def:DEF,view,stop,init(h){X=h;},_t:{DEF,ADV,CL,MON,aiMove,legal},_dice:(L,me,nm)=>dice(L,me,nm)};
})();
