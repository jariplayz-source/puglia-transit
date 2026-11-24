/* Out & Back games: card games (Pesten, and drinking games Horse race, Kingsen, Higher or lower, The bus) and the Wildlings creature game.
   Loaded only when you open Games. Two-player games run over Bluetooth (no internet, no pairing) or online through your circle. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tapv=()=>{try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}};
const TT=f=>{try{const t=window.AndroidTools;return t?f(t):undefined;}catch(e){}};
const h2=n=>(n&255).toString(16).padStart(2,"0");
const u8hex=s=>[...new TextEncoder().encode(String(s||""))].slice(0,12).map(b=>b.toString(16).padStart(2,"0")).join("");
const hexu8=h=>{try{return new TextDecoder().decode(new Uint8Array((h.match(/../g)||[]).map(x=>parseInt(x,16))));}catch(e){return "";}};
const bytes=h=>(h.match(/../g)||[]).map(x=>parseInt(x,16));
function rng(seed){let s=seed>>>0;s=Math.imul(s^(s>>>16),0x85ebca6b)>>>0;s=Math.imul(s^(s>>>13),0xc2b2ae35)>>>0;s=(s^(s>>>16))>>>0||0x9e3779b9;   // mix small seeds first
  const f=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};for(let i=0;i<4;i++)f();return f;}
function shuffle(a,R){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const MYNAME=()=>{try{const g=typeof gActive==="function"?gActive():null;if(g&&g.me&&g.me.name)return g.me.name;}catch(e){}try{return (JSON.parse(localStorage.getItem("pt-card")||"{}").name||"").split(" ")[0]||"Me";}catch(e){return "Me";}};
const store=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch(e){return d;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const toastG=m=>{try{toast(m);}catch(e){}};

/* ---------------- styles (only added when Games opens) ---------------- */
const CSS=`
.gm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gm-card{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:0;border-radius:16px;padding:14px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:inherit;min-height:96px}
.gm-card span{font-size:24px;line-height:1}.gm-card b{font-size:15px}.gm-card small{font-size:12.5px;color:var(--muted);line-height:1.3}
.gm-card.wide{grid-column:1/-1;flex-direction:row;align-items:center;gap:14px;background:linear-gradient(135deg,#3b6f3a,#24452a);color:#f3f7e8;box-shadow:none}
.gm-card.wide small{color:#cfe0c0}.gm-card.wide span{font-size:34px}
.gm-title{font:700 20px system-ui,sans-serif;margin:6px 2px 4px}
.gm-status{margin:4px 2px 10px;font-size:15px;color:var(--muted)}.gm-status.over{color:var(--ink);font-weight:700}
.gm-how{display:flex;flex-direction:column;gap:8px}.gm-how button{display:flex;flex-direction:column;gap:2px;text-align:left;border:0;border-radius:14px;padding:13px 14px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:inherit}
.gm-how small{color:var(--muted)}
.gm-link{margin-left:auto;align-self:center;font-size:13px;color:var(--muted)}
.gm-drink{font-size:13px;line-height:1.4;color:var(--muted);background:var(--chip);border-radius:12px;padding:10px 12px;margin:10px 0}
.gm-inv{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:var(--chip);margin-bottom:8px}.gm-inv b{flex:1}
.gc{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:44px;height:64px;border-radius:7px;background:#fffdf8;color:#1a1a1a;box-shadow:0 1px 3px rgba(0,0,0,.35);font:700 16px/1.05 system-ui,sans-serif;flex:none;border:0;padding:0;position:relative}
.gc i{font-style:normal;font-size:19px}.gc.r{color:#c62828}.gc.jk{color:#6a1b9a;font-size:11px}
.gc.back{background:repeating-linear-gradient(45deg,#2c5f8e 0 5px,#234e76 5px 10px);box-shadow:0 0 0 2px #fff inset,0 1px 3px rgba(0,0,0,.35)}
.gc.big{width:104px;height:148px;border-radius:12px;font-size:34px}.gc.big i{font-size:44px}
.gc.mid{width:62px;height:88px;border-radius:9px;font-size:22px}.gc.mid i{font-size:26px}
.gc.ok{box-shadow:0 0 0 3px var(--tc),0 4px 10px rgba(0,0,0,.3);transform:translateY(-6px)}.gc.no{opacity:.55}
.gm-hand{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:10px 0 4px}
.gm-table{display:flex;align-items:center;justify-content:center;gap:18px;padding:14px 0;border-radius:18px;background:radial-gradient(circle at 50% 40%,#2f7d4f,#1d5434);margin:6px 0 10px;color:#fff}
.gm-opps{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px}.gm-opp{padding:6px 10px;border-radius:12px;background:var(--chip);font-size:13px}.gm-opp.on{background:var(--tc);color:#fff}
.gm-suits{display:flex;gap:10px;justify-content:center;margin:8px 0}.gm-suits button{font-size:30px;width:58px;height:58px;border-radius:14px;border:0;background:#fffdf8;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.gm-big{font:700 26px system-ui,sans-serif;text-align:center;margin:10px 0 4px}.gm-sub{text-align:center;color:var(--muted);font-size:15px;margin-bottom:12px;line-height:1.4}
.gm-row2{display:flex;gap:8px;margin:8px 0}.gm-row2 .tl-act{min-height:52px}
.gm-names{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.gm-names span{padding:6px 10px;border-radius:20px;background:var(--chip);font-size:14px}.gm-names button{border:0;background:none;color:var(--muted);font-size:14px;padding:0 0 0 6px}
.gm-race{display:grid;gap:6px;margin:8px 0}.gm-lane{display:grid;grid-template-columns:repeat(9,1fr);gap:3px;align-items:center}
.gm-lane .cell{height:46px;border-radius:6px;background:var(--chip);display:flex;align-items:center;justify-content:center}.gm-lane .fin{background:repeating-linear-gradient(45deg,rgba(128,128,128,.35) 0 4px,transparent 4px 8px)}
.tl-row [data-home]{flex:none;padding:10px 16px}
.gm-lane .gc{width:34px;height:46px;font-size:12px}.gm-lane .gc i{font-size:15px}
.gm-side{display:grid;grid-template-columns:repeat(9,1fr);gap:3px}.gm-side .gc{width:34px;height:46px;font-size:12px;justify-self:center}.gm-side .gc i{font-size:15px}
.gm-pyr{display:flex;flex-direction:column;align-items:center;gap:6px;margin:8px 0}.gm-pyr div{display:flex;gap:6px}
.gm-log{font-size:13.5px;color:var(--muted);margin:6px 2px;line-height:1.4;min-height:1.4em}
`;
function addCss(){if(document.getElementById("gmCss"))return;const s=document.createElement("style");s.id="gmCss";s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- cards ---------------- */
const SUIT=["♠","♥","♦","♣"],RANKS=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const cS=c=>Math.floor(c/13),cR=c=>c%13+1,isJk=c=>c>=52;
function cardH(c,cls){if(c==null||c<0)return `<span class="gc back ${cls||""}"></span>`;if(isJk(c))return `<span class="gc jk ${cls||""}">JOKER<i>★</i></span>`;
  return `<span class="gc ${cS(c)===1||cS(c)===2?"r":""} ${cls||""}">${RANKS[cR(c)]}<i>${SUIT[cS(c)]}</i></span>`;}
const cName=c=>isJk(c)?"Joker":RANKS[cR(c)]+SUIT[cS(c)];

/* ---------------- link: Bluetooth (GameLink advertising) ---------------- */
const GL={on:false,room:"",me:"",peer:null,peerName:"",mySeq:0,ack:0,peerAck:0,cur:null,q:[],seen:0,h:null,timer:null,
  start(room,h){this.stop();this.on=true;this.room=room;this.me=Math.floor(Math.random()*65535).toString(16).padStart(4,"0");this.peer=null;this.mySeq=0;this.ack=0;this.peerAck=0;this.cur=null;this.q=[];this.seen=0;this.h=h;
    const st=String(TT(t=>t.gameListen(room))||"no bluetooth");if(st!=="ok"){this.on=false;return st;}
    this.timer=setInterval(()=>this.tick(),150);this.pump();return "ok";},
  stop(){if(this.timer)clearInterval(this.timer);this.timer=null;if(this.on)TT(t=>t.gameStop());this.on=false;this.h=null;},
  send(type,d){this.q.push({type,d:(d||"").slice(0,30)});this.pump();},
  pump(){if(!this.on)return;if(this.cur&&this.peerAck===this.cur.seq)this.cur=null;
    if(!this.cur&&this.q.length){const m=this.q.shift();this.mySeq=this.mySeq%250+1;m.seq=this.mySeq;this.cur=m;}
    const m=this.cur||{seq:this.mySeq,type:0,d:""};
    TT(t=>t.gameSend("4f42"+this.room+this.me+h2(m.seq)+h2(this.ack)+h2(m.type)+m.d));},
  tick(){let a=[];try{a=JSON.parse(TT(t=>t.gameTake())||"[]");}catch(e){}
    for(const x of a){const p=String(x.p||"");if(p.length<18||p.slice(4,8)!==this.room)continue;const from=p.slice(8,12);if(from===this.me)continue;
      const seq=parseInt(p.slice(12,14),16),ack=parseInt(p.slice(14,16),16),type=parseInt(p.slice(16,18),16),d=p.slice(18);
      if(!this.peer){if(type!==1)continue;this.peer=from;}
      if(from!==this.peer)continue;this.seen=Date.now();this.peerAck=ack;
      if(type!==0&&seq!==this.ack){this.ack=seq;try{this.h&&this.h.msg(type,d);}catch(e){console.error(e);}}}
    this.pump();try{this.h&&this.h.tick&&this.h.tick();}catch(e){}}};

/* ---------------- link: online through your circle (encrypted group messages) ---------------- */
const NET={s:null,timer:null,
  start(G,sid,peer,peerName,role){this.stop();this.s={G,sid,peer,peerName,role,n:0,want:0,buf:{},on:null,seen:Date.now()};
    this.timer=setInterval(()=>this.poll(),5000);return this.s;},
  poll(){if(!this.s||document.hidden||typeof gPollGame!=="function")return;gPollGame(this.s.G);},
  send(t,d){const s=this.s;if(!s)return;const env={ty:"game",k:"m",sid:s.sid,to:s.peer,t,d:d||"",n:s.n++};
    gPublish(env,null,s.G).catch(()=>{setTimeout(()=>gPublish(env,null,s.G).catch(()=>toastG("⚠ Couldn't reach your friend online")),4000);});},
  got(env){const s=this.s;if(!s||env.sid!==s.sid||env.from!==s.peer)return;s.seen=Date.now();
    if(env.k==="bye"){s.on&&s.on(4,"");return;}
    if(env.k!=="m")return;s.buf[env.n]=env;while(s.buf[s.want]){const e=s.buf[s.want];delete s.buf[s.want];s.want++;try{s.on&&s.on(e.t,e.d||"");}catch(x){console.error(x);}}},
  stop(){if(this.timer)clearInterval(this.timer);this.timer=null;this.s=null;}};
/* invites from the circle (index.html keeps them in pt-ginv when Games isn't loaded yet) */
const INV=()=>store("pt-ginv",[]).filter(x=>Date.now()-x.ts<15*60e3);
let ACCEPT_WAIT=null;   // the invite you sent: {sid,peer,game,onAcc}
let HUB_REDRAW=null;
window.GAME_IN=function(G,env){
  if(env.k==="inv"){const a=INV().filter(x=>x.sid!==env.sid);a.push({g:G.id,from:env.from,name:env.name,game:env.g,sid:env.sid,ts:env.ts||Date.now()});save("pt-ginv",a.slice(-5));
    toastG(`🎮 ${env.name} invites you to ${GNAME[env.g]||"a game"}: open Games`);if(HUB_REDRAW)HUB_REDRAW();return;}
  if(env.k==="acc"&&ACCEPT_WAIT&&env.sid===ACCEPT_WAIT.sid&&env.from===ACCEPT_WAIT.peer){const w=ACCEPT_WAIT;ACCEPT_WAIT=null;w.onAcc(G,env);return;}
  if(env.k==="no"&&ACCEPT_WAIT&&env.sid===ACCEPT_WAIT.sid){ACCEPT_WAIT=null;toastG(`${env.name} can't play right now`);if(HUB_REDRAW)HUB_REDRAW();return;}
  NET.got(env);};
const GNAME={pesten:"Pesten",mon:"a Wildlings battle",trade:"a Wildlings trade"};

/* A link the games use, whatever is underneath: {kind, role (0 starts), peerName, send(t,hex), on, close()} */
function btLink(role,peerName){const L={kind:"bt",role,peerName,on:null,send:(t,d)=>GL.send(t,d),close(){GL.send(4,"");setTimeout(()=>GL.stop(),700);},status:()=>GL.seen&&Date.now()-GL.seen>12000?"⚠ Lost your friend: come closer":"📶 "+peerName};
  GL.h={msg:(t,d)=>{if(t===4){L.on&&L.on(4,"");return;}L.on&&L.on(t,d);},tick:()=>{const w=document.getElementById("gmLink");if(w)w.textContent=L.status();}};return L;}
function netLink(G,sid,peer,peerName,role){const s=NET.start(G,sid,peer,peerName,role);
  const L={kind:"net",role,peerName,on:null,send:(t,d)=>NET.send(t,d),close(){try{gPublish({ty:"game",k:"bye",sid,to:peer},null,G).catch(()=>{});}catch(e){}NET.stop();},status:()=>"🌐 "+peerName+" (online, a few seconds per move)"};
  s.on=(t,d)=>L.on&&L.on(t,d);return L;}

/* ---------------- hub ---------------- */
let EL=null,T=null,LINK=null;
function stopAll(){if(LINK){try{LINK.close();}catch(e){}LINK=null;}GL.stop();NET.stop();ACCEPT_WAIT=null;clearInterval(AUTO);AUTO=0;try{window.MON&&MON.stop();}catch(e){}}
let AUTO=0;
const backRow=(extra)=>`<div class="tl-row"><button class="tl-act ghost" data-home>‹ Games</button>${extra||""}</div>`;
function wireBack(cb){const b=EL.querySelector("[data-home]");if(b)b.onclick=()=>{tapv();if(cb)cb();stopAll();hub();};}
const DRINK_NOTE=`<div class="gm-drink">🍺 Drinking games are for adults (18+). Sips can be water or anything else. Stop when you've had enough and make sure everyone gets home safely.</div>`;
function hub(){stopAll();HUB_REDRAW=()=>{if(EL&&EL.querySelector("#gmHub"))hub();};
  const inv=INV();
  EL.innerHTML=`<div id="gmHub">${inv.map(x=>`<div class="gm-inv"><span>🎮</span><b>${esc(x.name)} invites you to ${esc(GNAME[x.game]||"play")}</b><button class="tl-act" data-acc="${esc(x.sid)}" style="flex:none;padding:10px 14px">Play</button><button class="tl-act ghost" data-dec="${esc(x.sid)}" style="flex:none;padding:10px 12px">✕</button></div>`).join("")}
    <div class="gm-grid"><button class="gm-card wide" data-g="mon"><span>🌿</span><div><b>Wildlings</b><br><small>Catch, raise and battle your own creatures. Some show up along your real routes. Battle and trade over Bluetooth or online.</small></div></button></div>
    <div class="tl-sec">Card games</div>
    <div class="gm-grid">
      <button class="gm-card" data-g="pesten"><span>🃏</span><b>Pesten</b><small>Against the phone, over Bluetooth or online</small></button>
      <button class="gm-card" data-g="race"><span>🏇</span><b>Horse race</b><small>Drinking game: bet sips on an ace</small></button>
      <button class="gm-card" data-g="kings"><span>👑</span><b>Kingsen</b><small>Drinking game: every card is a task</small></button>
      <button class="gm-card" data-g="hl"><span>↕️</span><b>Higher or lower</b><small>Drinking game: guess the next card</small></button>
      <button class="gm-card" data-g="bus"><span>🚌</span><b>The bus</b><small>Drinking game: 4 questions, the pyramid, then someone rides the bus</small></button>
    </div><p class="sv-note">Everything works without internet. Bluetooth reaches about 10 to 20 metres and needs no pairing: one phone shows a code, the other types it in.</p></div>`;
  EL.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{tapv();const g=b.dataset.g;({mon:openMon,pesten:pestenMenu,race:raceSetup,kings:kingsStart,hl:hlStart,bus:busSetup})[g]();});
  EL.querySelectorAll("[data-acc]").forEach(b=>b.onclick=()=>{tapv();acceptInv(b.dataset.acc);});
  EL.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const x=INV().find(i=>i.sid===b.dataset.dec);save("pt-ginv",INV().filter(i=>i.sid!==b.dataset.dec));
    if(x){const G=(typeof gGroups==="function"?gGroups():[]).find(g=>g.id===x.g);if(G)gPublish({ty:"game",k:"no",sid:x.sid,to:x.from},null,G).catch(()=>{});}hub();});}
function acceptInv(sid){const x=INV().find(i=>i.sid===sid);save("pt-ginv",INV().filter(i=>i.sid!==sid));if(!x)return hub();
  const G=(typeof gGroups==="function"?gGroups():[]).find(g=>g.id===x.g);if(!G){toastG("That circle isn't on this phone anymore");return hub();}
  if(typeof isOffline==="function"&&isOffline()){toastG("📴 You're offline: online games need internet");return hub();}
  gPublish({ty:"game",k:"acc",sid,to:x.from},null,G).catch(()=>toastG("⚠ Couldn't answer: check your internet"));
  LINK=netLink(G,sid,x.from,x.name,1);
  if(x.game==="pesten")pestenNet(LINK);else if(x.game==="mon"||x.game==="trade")withMon(()=>MON.netStart(LINK,x.game));}

/* Choose how to play with a friend. onLink(link) is called once both phones are connected. */
const GAME_IDX=["pesten","mon","trade"];
function friendMenu(game,title,onLink,extraTop){
  EL.innerHTML=backRow()+`<div class="gm-title">${title}</div>${extraTop||""}<div class="gm-how">
    <button data-m="bthost"><b>📶 Bluetooth: start</b><small>Your phone shows a code for your friend</small></button>
    <button data-m="btjoin"><b>📶 Bluetooth: join</b><small>Type the code from your friend's phone</small></button>
    <button data-m="net"><b>🌐 Someone in your circle</b><small>Online, also far away. Each move takes a few seconds.</small></button></div><div id="gmWhy"></div>`;
  wireBack();
  EL.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{tapv();const m=b.dataset.m;
    if(m==="net")return netPick(game,title,onLink);
    if(!TT(t=>t.gameBt())){TT(()=>{try{window.AndroidGroup.askOfflinePerms(false);}catch(e){}});
      EL.querySelector("#gmWhy").innerHTML=`<div class="tl-why"><span>${window.AndroidTools?"Bluetooth is off or not allowed yet. Switch Bluetooth on (and allow “Nearby devices” if asked), then try again.":"Bluetooth games work in the Android app."}</span></div>`;return;}
    if(m==="bthost")btHost(game,title,onLink);else btJoin(game,title,onLink);});}
function btHost(game,title,onLink){const code=String(1000+Math.floor(Math.random()*9000)),room=(+code).toString(16).padStart(4,"0");
  EL.innerHTML=backRow()+`<div class="gm-title">${title}</div><div class="gm-big">${code}</div><div class="gm-sub" id="gmLob">Your code. On your friend's phone: Games → ${title} → Bluetooth: join, and type it in.</div>`;wireBack();
  const st=GL.start(room,{msg:(t,d)=>{if(t===1){const name=hexu8(d.slice(2))||"Friend";LINK=btLink(0,name);onLink(LINK);}}});
  if(st!=="ok"){EL.querySelector("#gmLob").textContent="Bluetooth didn't start: "+st;return;}
  GL.send(1,h2(GAME_IDX.indexOf(game))+u8hex(MYNAME()));}
function btJoin(game,title,onLink){
  EL.innerHTML=backRow()+`<div class="gm-title">${title}: join</div><div class="tl-check"><div class="tl-add"><input id="gmCode" inputmode="numeric" maxlength="4" placeholder="4-digit code"><button id="gmGo" aria-label="Join">→</button></div></div><p class="sv-note" id="gmLob">Keep the phones within a few metres while you connect.</p>`;wireBack();
  const go=()=>{const c=EL.querySelector("#gmCode").value.trim();if(!/^\d{4}$/.test(c))return;tapv();EL.querySelector("#gmLob").textContent="Looking for your friend's phone…";
    const st=GL.start((+c).toString(16).padStart(4,"0"),{msg:(t,d)=>{if(t!==1)return;const g=GAME_IDX[parseInt(d.slice(0,2),16)];
      if(g!==game){EL.querySelector("#gmLob").textContent=`That phone is playing ${GNAME[g]||"another game"}. Pick that game first.`;GL.stop();return;}
      GL.send(1,h2(GAME_IDX.indexOf(game))+u8hex(MYNAME()));LINK=btLink(1,hexu8(d.slice(2))||"Friend");onLink(LINK);}});
    if(st!=="ok")EL.querySelector("#gmLob").textContent="Bluetooth didn't start: "+st;};
  EL.querySelector("#gmGo").onclick=go;EL.querySelector("#gmCode").onkeydown=e=>{if(e.key==="Enter")go();};}
function netPick(game,title,onLink){const GS=(typeof gGroups==="function"?gGroups():[]);
  if(typeof isOffline==="function"&&isOffline()){EL.querySelector("#gmWhy").innerHTML=`<div class="tl-why"><span>📴 You're offline. Online games need internet; Bluetooth works without.</span></div>`;return;}
  const rows=[];for(const G of GS)for(const id in (G.members||{})){const m=G.members[id];if(id!==G.me.id&&m&&m.name)rows.push({G,id,name:m.name,seen:m.seen||0});}
  rows.sort((a,b)=>b.seen-a.seen);
  EL.innerHTML=backRow()+`<div class="gm-title">${title}: invite</div>${rows.length?`<div class="gm-how">${rows.map((r,i)=>`<button data-r="${i}"><b>${esc(r.name)}</b><small>${esc(r.G.name)}</small></button>`).join("")}</div>`:`<p class="sv-note">Nobody in your circles yet. Make or join a circle on the Group tab first.</p>`}`;wireBack();
  EL.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{tapv();const r=rows[+b.dataset.r],sid=Math.random().toString(36).slice(2,10);
    gPublish({ty:"game",k:"inv",g:game,sid,to:r.id},null,r.G).then(()=>{}).catch(()=>toastG("⚠ Couldn't send the invite: check your internet"));
    EL.innerHTML=backRow()+`<div class="gm-title">${title}</div><div class="gm-big">⏳</div><div class="gm-sub">Invite sent to ${esc(r.name)}. They get a message and open Games to accept. This screen starts the game when they do.</div>`;wireBack();
    ACCEPT_WAIT={sid,peer:r.id,game,onAcc:(G)=>{LINK=netLink(G,sid,r.id,r.name,0);onLink(LINK);}};
    NET.stop();NET.timer=setInterval(()=>{if(!ACCEPT_WAIT){clearInterval(NET.timer);NET.timer=null;return;}if(!document.hidden&&typeof gPollGame==="function")gPollGame(r.G);},5000);});}

/* ================= PESTEN ================= */
/* Rules: match suit or rank. 2 = next draws 2, Joker = next draws 5 (both stack: put a 2 on a 2, a Joker on anything that has to be drawn).
   7 = play again, 8 = next player skips, Ace = reverse (with 2 players: play again), Jack = wild, choose the suit. No card: draw one. */
function pNew(seed,names,starter){const R=rng(seed),deck=shuffle([...Array(54).keys()],R),n=names.length;
  const S={R,deck,pile:[],hands:names.map(()=>[]),names,n,turn:starter||0,dir:1,pend:0,pk:0,suit:null,drew:-1,win:-1,log:"",sips:names.map(()=>0)};
  for(let k=0;k<7;k++)for(let p=0;p<n;p++)S.hands[p].push(S.deck.pop());
  let i=S.deck.findIndex(c=>!isJk(c)&&[3,4,5,6,9,10,12,13].includes(cR(c)));S.pile.push(S.deck.splice(i,1)[0]);return S;}
function pDraw(S,p){if(!S.deck.length){const top=S.pile.pop();S.deck=shuffle(S.pile,S.R);S.pile=[top];}if(!S.deck.length)return null;const c=S.deck.pop();S.hands[p].push(c);return c;}
function pCan(S,c){const top=S.pile[S.pile.length-1];
  if(S.pend>0)return isJk(c)||(S.pk===2&&cR(c)===2);
  if(isJk(c)||cR(c)===11||isJk(top))return true;
  const su=S.suit!=null?S.suit:cS(top);return cS(c)===su||(S.suit==null&&cR(c)===cR(top));}
function pNext(S,steps){S.turn=((S.turn+S.dir*(steps||1))%S.n+S.n)%S.n;S.drew=-1;}
function pApply(S,a){const p=S.turn,nm=S.names[p];S.log="";
  if(a.k===1){const i=S.hands[p].indexOf(a.c);if(i<0||!pCan(S,a.c))return false;S.hands[p].splice(i,1);S.pile.push(a.c);S.suit=null;const c=a.c,r=isJk(c)?0:cR(c);
    if(!S.hands[p].length){S.win=p;S.log=`${nm} played the last card!`;return true;}
    if(isJk(c)){S.pend+=5;S.pk=5;S.log=`${nm}: Joker! Next draws ${S.pend}`;pNext(S);}
    else if(r===2){S.pend+=2;S.pk=2;S.log=`${nm}: 2! Next draws ${S.pend}`;pNext(S);}
    else if(r===11){S.suit=a.s;S.log=`${nm} picks ${SUIT[a.s]}`;pNext(S);}
    else if(r===7){S.log=`${nm}: 7, plays again`;S.drew=-1;}
    else if(r===8){S.log=`${nm}: 8, ${S.names[((p+S.dir)%S.n+S.n)%S.n]} skips a turn`;pNext(S,2);}
    else if(r===1){if(S.n===2){S.log=`${nm}: Ace, plays again`;S.drew=-1;}else{S.dir*=-1;S.log=`${nm}: Ace, the other way round`;pNext(S);}}
    else pNext(S);return true;}
  if(a.k===2){if(S.pend>0){const n=S.pend;for(let k=0;k<n;k++)pDraw(S,p);S.pend=0;S.pk=0;S.sips[p]+=n;S.log=`${nm} draws ${n}`;S.drink={p,n};pNext(S);return true;}
    if(S.drew>=0)return false;const c=pDraw(S,p);if(c==null){pNext(S);return true;}S.log=`${nm} draws a card`;
    if(pCan(S,c))S.drew=c;else pNext(S);return true;}
  if(a.k===3){if(S.drew<0)return false;S.log=`${nm} passes`;pNext(S);return true;}
  return false;}
function pAI(S){const p=S.turn,H=S.hands[p];
  if(S.drew>=0)return pCan(S,S.drew)&&Math.random()<0.9?{k:1,c:S.drew,s:bestSuit(H.filter(c=>c!==S.drew))}:{k:3};
  const ok=H.filter(c=>pCan(S,c));if(!ok.length)return {k:2};
  const next=S.hands[((p+S.dir)%S.n+S.n)%S.n].length;
  const score=c=>{if(isJk(c))return next<=2?9:1;const r=cR(c);if(r===11)return 0;if(r===2)return next<=2?8:3;if(r===7)return 6;if(r===8||r===1)return 5;return 4+(H.filter(x=>!isJk(x)&&cS(x)===cS(c)).length)*0.3;};
  ok.sort((a,b)=>score(b)-score(a));const c=ok[0];return {k:1,c,s:bestSuit(H.filter(x=>x!==c))};}
function bestSuit(H){const n=[0,0,0,0];for(const c of H)if(!isJk(c)&&cR(c)!==11)n[cS(c)]++;return n.indexOf(Math.max(...n));}

function pestenMenu(){const drink=store("pt-pdrink",false);
  EL.innerHTML=backRow()+`<div class="gm-title">🃏 Pesten</div>
    <div class="gm-how"><button data-ai="1"><b>🤖 Against the phone: 1 opponent</b></button><button data-ai="2"><b>🤖 Against the phone: 2 opponents</b></button><button data-ai="3"><b>🤖 Against the phone: 3 opponents</b></button>
    <button data-fr><b>👥 With a friend</b><small>Bluetooth or online through your circle</small></button></div>
    <label class="gm-drink" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="gmDrink" ${drink?"checked":""}> <span>🍺 Drinking rules: a sip for every card you have to draw from a 2 or Joker, and the losers drink one sip per card left in their hand (max 5).</span></label>
    <p class="sv-note">2: next draws 2 · Joker: next draws 5 (both stack) · 7: play again · 8: next skips · Ace: reverse · Jack: wild, pick the suit. No card to play: draw one.</p>`;
  wireBack();EL.querySelector("#gmDrink").onchange=e=>save("pt-pdrink",e.target.checked);
  EL.querySelectorAll("[data-ai]").forEach(b=>b.onclick=()=>{tapv();const n=+b.dataset.ai,names=["You","Phone A","Phone B","Phone C"].slice(0,n+1);
    pestenPlay({S:pNew(Date.now()&0xffffffff,names,0),me:0,ai:true,drink:store("pt-pdrink",false)});});
  EL.querySelector("[data-fr]").onclick=()=>{tapv();friendMenu("pesten","Pesten",pestenNet);};}
function pestenNet(L){const drink=store("pt-pdrink",false);let G=null;
  const start=(seed,starter)=>{const names=L.role===0?[MYNAME(),L.peerName]:[L.peerName,MYNAME()];
    G={S:pNew(seed,names,starter),me:L.role,ai:false,drink,L};pestenPlay(G);};
  L.on=(t,d)=>{if(t===3){const b=bytes(d);start(((b[0]<<24)|(b[1]<<16)|(b[2]<<8)|b[3])>>>0,b[4]||0);return;}
    if(t===2&&G&&G.S.turn!==G.me){const b=bytes(d);if(pApply(G.S,{k:b[0],c:b[1],s:b[2]}))G.draw();return;}
    if(t===4){toastG(`${L.peerName} left the game`);stopAll();hub();}};
  if(L.role===0){const seed=(Math.random()*4294967295)>>>0;L.send(3,[seed>>>24,seed>>>16,seed>>>8,seed].map(h2).join("")+h2(0));start(seed,0);}
  else EL.innerHTML=backRow()+`<div class="gm-big">🃏</div><div class="gm-sub">Connected to ${esc(L.peerName)}. Shuffling…</div>`,wireBack();}
function pestenPlay(G){const S=G.S;let pickFor=null;
  const act=a=>{if(!pApply(S,a))return;if(G.L)G.L.send(2,h2(a.k)+h2(a.c||0)+h2(a.s||0));G.draw();};
  G.draw=()=>{const me=G.me,mine=S.turn===me&&S.win<0,top=S.pile[S.pile.length-1];
    if(S.drink&&G.drink){const d=S.drink;S.drink=null;if(d.p===me)setTimeout(()=>toastG(`🍺 Drink ${d.n} sip${d.n>1?"s":""}`),300);}
    let over="";if(S.win>=0){over=S.win===me?"🎉 You win!":`${esc(S.names[S.win])} wins`;
      if(G.drink){const left=S.hands.map((h,i)=>i===S.win?"":`${esc(S.names[i])} drinks ${Math.min(5,h.length)}`).filter(x=>x).join(" · ");over+=`<div class="gm-sub">🍺 ${left}</div>`;}}
    EL.innerHTML=backRow(G.L?`<span class="gm-link" id="gmLink">${esc(G.L.status())}</span>`:"")+`
      <div class="gm-opps">${S.names.map((n,i)=>i===me?"":`<span class="gm-opp ${S.turn===i&&S.win<0?"on":""}">${esc(n)}: ${S.hands[i].length} 🂠</span>`).join("")}</div>
      <div class="gm-table"><button class="gc back mid" id="gmDeck" aria-label="Draw a card" ${mine&&S.drew<0?"":"disabled"}></button>${cardH(top,"mid")}${S.suit!=null?`<span style="font-size:30px">→ ${SUIT[S.suit]}</span>`:""}</div>
      <div class="gm-status ${S.win>=0?"over":""}">${S.win>=0?over:mine?(S.pend?`Play a ${S.pk===2?"2 or ":""}Joker, or draw ${S.pend}`:S.drew>=0?"You drew a card you can play. Play it or pass.":"Your turn"):`${esc(S.names[S.turn])}'s turn…`}</div>
      <div class="gm-log">${esc(S.log)}</div>
      ${pickFor!=null?`<div class="gm-sub">Pick a suit</div><div class="gm-suits">${SUIT.map((s,i)=>`<button data-su="${i}" style="color:${i===1||i===2?"#c62828":"#111"}">${s}</button>`).join("")}</div>`:""}
      <div class="gm-hand">${S.hands[me].slice().sort((a,b)=>a-b).map(c=>{const ok=mine&&pickFor==null&&(S.drew>=0?c===S.drew:pCan(S,c));return `<button class="gc ${isJk(c)?"jk":cS(c)===1||cS(c)===2?"r":""} ${mine?ok?"ok":"no":""}" data-c="${c}">${isJk(c)?"JOKER<i>★</i>":RANKS[cR(c)]+"<i>"+SUIT[cS(c)]+"</i>"}</button>`;}).join("")}</div>
      <div class="gm-row2">${mine&&S.pend?`<button class="tl-act" id="gmTake">Draw ${S.pend}</button>`:""}${mine&&S.drew>=0?`<button class="tl-act ghost" id="gmPass">Pass</button>`:""}${S.win>=0?`<button class="tl-act" id="gmAgain">Play again</button>`:""}</div>`;
    wireBack();
    const dk=EL.querySelector("#gmDeck");if(dk)dk.onclick=()=>{if(!mine||S.drew>=0)return;tapv();act({k:2});};
    const tk=EL.querySelector("#gmTake");if(tk)tk.onclick=()=>{tapv();act({k:2});};
    const ps=EL.querySelector("#gmPass");if(ps)ps.onclick=()=>{tapv();act({k:3});};
    EL.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{const c=+b.dataset.c;if(!mine||pickFor!=null)return;if(S.drew>=0&&c!==S.drew)return;if(!pCan(S,c))return;tapv();
      if(!isJk(c)&&cR(c)===11&&S.hands[me].length>1){pickFor=c;G.draw();return;}act({k:1,c,s:0});});
    EL.querySelectorAll("[data-su]").forEach(b=>b.onclick=()=>{tapv();const c=pickFor;pickFor=null;act({k:1,c,s:+b.dataset.su});});
    const ag=EL.querySelector("#gmAgain");if(ag)ag.onclick=()=>{tapv();const st=(S.win+1)%S.n;
      if(G.L){const seed=(Math.random()*4294967295)>>>0;G.L.send(3,[seed>>>24,seed>>>16,seed>>>8,seed].map(h2).join("")+h2(st));G.S=pNew(seed,S.names,st);}else G.S=pNew(Date.now()&0xffffffff,S.names,st);
      pestenPlay(G);};
    if(G.ai&&S.win<0&&S.turn!==me){clearTimeout(G.t);G.t=setTimeout(()=>{if(!EL.isConnected||G.S!==S)return;pApply(S,pAI(S));G.draw();},S.drew>=0?500:900);}
    if(S.win>=0&&navigator.vibrate)try{navigator.vibrate(S.win===me?[60,60,60]:90);}catch(e){}};
  G.draw();}

/* ================= players list for the drinking games (one phone, pass it round) ================= */
function playersBox(id){const P=store("pt-gplayers",[]);
  return `<div class="tl-sec">Players</div><div class="gm-names" id="${id}">${P.map((n,i)=>`<span>${esc(n)}<button data-gprm="${i}" aria-label="Remove">✕</button></span>`).join("")||`<span style="opacity:.7">Add everyone who plays</span>`}</div>
  <div class="tl-check"><div class="tl-add"><input id="${id}In" maxlength="14" placeholder="Name"><button id="${id}Add" aria-label="Add">+</button></div></div>`;}
function wirePlayers(id,redraw){const add=()=>{const i=EL.querySelector("#"+id+"In"),v=i.value.trim();if(!v)return;const P=store("pt-gplayers",[]);if(P.length>=10)return;P.push(v);save("pt-gplayers",P);redraw();setTimeout(()=>{const x=EL.querySelector("#"+id+"In");if(x)x.focus();},0);};
  EL.querySelector("#"+id+"Add").onclick=add;EL.querySelector("#"+id+"In").onkeydown=e=>{if(e.key==="Enter")add();};
  EL.querySelectorAll("#"+id+" [data-gprm]").forEach(b=>b.onclick=()=>{const P=store("pt-gplayers",[]);P.splice(+b.dataset.gprm,1);save("pt-gplayers",P);redraw();});}

/* ================= HORSE RACE (paardenrace) ================= */
function raceSetup(){const P=store("pt-gplayers",[]),bets=store("pt-rbets",{});
  EL.innerHTML=backRow()+`<div class="gm-title">🏇 Horse race</div>${DRINK_NOTE}${playersBox("rp")}
    ${P.length?`<div class="tl-sec">Bets: pick a horse and how many sips</div>${P.map((n,i)=>{const b=bets[n]||{s:i%4,n:2};return `<div class="tl-row" style="align-items:center;gap:6px;margin:6px 0"><b style="flex:1">${esc(n)}</b>
      <span class="tl-seg" style="margin:0">${SUIT.map((s,k)=>`<button data-bs="${i}:${k}" class="${b.s===k?"on":""}" style="color:${k===1||k===2?"#c62828":""}">${s}</button>`).join("")}</span>
      <span class="tl-seg" style="margin:0"><button data-bn="${i}:-1">−</button><button class="on" style="min-width:44px">${b.n}</button><button data-bn="${i}:1">+</button></span></div>`;}).join("")}`:""}
    <div class="gm-row2"><button class="tl-act" id="gmGo" ${P.length?"":"disabled"}>Start the race</button></div>
    <p class="sv-note">The four aces race. Every card that's turned moves the horse of that suit one step. Once every horse has passed a side card, it's turned and that suit's horse goes one step back. First past the finish wins: its backers hand out double their bet, everyone else drinks their bet.</p>`;
  wireBack();wirePlayers("rp",raceSetup);
  const B=()=>store("pt-rbets",{});
  EL.querySelectorAll("[data-bs]").forEach(b=>b.onclick=()=>{const [i,k]=b.dataset.bs.split(":").map(Number),bb=B(),n=P[i];bb[n]=Object.assign({s:i%4,n:2},bb[n],{s:k});save("pt-rbets",bb);raceSetup();});
  EL.querySelectorAll("[data-bn]").forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.bn.split(":").map(Number),bb=B(),n=P[i],cur=Object.assign({s:i%4,n:2},bb[n]);cur.n=Math.max(1,Math.min(20,cur.n+d));bb[n]=cur;save("pt-rbets",bb);raceSetup();});
  EL.querySelector("#gmGo").onclick=()=>{tapv();const bb=B();raceRun(P.map((n,i)=>({n,...Object.assign({s:i%4,n2:2},bb[n]?{s:bb[n].s,amt:bb[n].n}:{amt:2})})));};}
function raceRun(bets){const L=6,R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1),R);
  const side=deck.splice(0,L),pos=[0,0,0,0],flipped=Array(L).fill(false);let last=null,win=-1,msg="Tap “Next card” to start the race";
  const step=()=>{if(win>=0)return;if(!deck.length){deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1&&!side.includes(c)),R);}
    const c=deck.pop();last=c;pos[cS(c)]++;msg=`${cName(c)}: the ${SUIT[cS(c)]} horse moves forward`;
    if(pos[cS(c)]>L){win=cS(c);clearInterval(AUTO);AUTO=0;draw();return;}
    for(let k=0;k<L;k++)if(!flipped[k]&&Math.min(...pos)>k+0){flipped[k]=true;const s=cS(side[k]);pos[s]=Math.max(0,pos[s]-1);msg+=` · side card ${cName(side[k])}: ${SUIT[s]} goes back!`;}
    draw();};
  const draw=()=>{const res=win>=0?bets.map(b=>b.s===win?`<b>${esc(b.n)}</b> hands out ${b.amt*2}`:`${esc(b.n)} drinks ${b.amt}`).join("<br>"):"";
    EL.innerHTML=backRow()+`<div class="gm-title">🏇 Horse race</div>
      <div class="gm-side"><span></span>${side.map((c,k)=>flipped[k]?cardH(c):cardH(-1)).join("")}<span></span><span></span></div>
      <div class="gm-race">${[0,1,2,3].map(s=>`<div class="gm-lane">${Array.from({length:L+2},(_,k)=>`<div class="cell ${k===L+1?"fin":""}">${pos[s]===k||(k===L+1&&pos[s]>L)?cardH(s*13):""}</div>`).join("")}</div>`).join("")}</div>
      <div class="gm-table" style="padding:10px">${cardH(last==null?-1:last,"mid")}</div>
      <div class="gm-status ${win>=0?"over":""}">${win>=0?`🏆 The ${SUIT[win]} horse wins!`:esc(msg)}</div>${res?`<div class="gm-sub" style="text-align:left">${res}</div>`:""}
      <div class="gm-row2">${win<0?`<button class="tl-act" id="gmNext">Next card</button><button class="tl-act ghost" id="gmAuto">${AUTO?"⏸ Pause":"▶ Auto"}</button>`:`<button class="tl-act" id="gmAgain">New race</button>`}</div>`;
    wireBack();const n=EL.querySelector("#gmNext");if(n)n.onclick=()=>{tapv();step();};
    const a=EL.querySelector("#gmAuto");if(a)a.onclick=()=>{tapv();if(AUTO){clearInterval(AUTO);AUTO=0;draw();}else{AUTO=setInterval(()=>{if(!EL.isConnected){clearInterval(AUTO);AUTO=0;return;}step();},1300);draw();}};
    const g=EL.querySelector("#gmAgain");if(g)g.onclick=()=>{tapv();raceSetup();};};
  draw();}

/* ================= KINGSEN ================= */
const KRULES={1:["Waterfall","Everyone starts drinking. You may only stop once the person before you stops; whoever drew the card stops first."],
  2:["You","Point at someone: they drink 2."],3:["Me","You drink 3."],4:["Floor","Last one to touch the floor drinks."],
  5:["Guys","All the guys drink."],6:["Ladies","All the ladies drink."],7:["Heaven","Last one with a hand in the air drinks."],
  8:["Mate","Pick a mate: they drink whenever you drink, until the next 8."],9:["Rhyme","Say a word. Go round rhyming on it; whoever can't, drinks."],
  10:["Categories","Pick a category (car brands, cheeses…). Go round; whoever can't name one, drinks."],
  11:["Rule","Make a rule that holds until the next Jack. Whoever breaks it drinks."],12:["Question master","Until the next Queen: anyone who answers your question drinks."],
  13:["King","Pour some of your drink into the king's cup. The 4th King drinks the whole cup!"]};
function kingsStart(){const P=store("pt-gplayers",[]);
  EL.innerHTML=backRow()+`<div class="gm-title">👑 Kingsen</div>${DRINK_NOTE}${playersBox("kp")}<div class="gm-row2"><button class="tl-act" id="gmGo">Start</button></div>
    <p class="sv-note">Draw a card on your turn and do what it says. Players are optional: with names the app shows whose turn it is.</p>`;
  wireBack();wirePlayers("kp",kingsStart);EL.querySelector("#gmGo").onclick=()=>{tapv();kingsRun(P);};}
function kingsRun(P){const deck=shuffle([...Array(52).keys()],rng(Date.now()&0xffffffff));let cur=null,kings=0,turn=-1;
  const draw=()=>{const r=cur!=null?KRULES[cR(cur)]:null,who=P.length&&turn>=0?P[turn%P.length]:"";
    EL.innerHTML=backRow()+`<div class="gm-title">👑 Kingsen</div><div class="gm-table">${cardH(cur==null?-1:cur,"big")}</div>
      ${r?`<div class="gm-big">${r[0]}${cR(cur)===13?` (${kings}/4)`:""}</div><div class="gm-sub">${who?`<b>${esc(who)}</b>: `:""}${cR(cur)===13&&kings===4?"That's the 4th King: drink the king's cup! 👑":r[1]}</div>`:`<div class="gm-sub">${P.length?`${esc(P[0])} goes first.`:""} Tap to draw.</div>`}
      <div class="gm-row2">${deck.length?`<button class="tl-act" id="gmNext">Draw a card${P.length&&deck.length<52?` (${esc(P[(turn+1)%P.length])})`:""}</button>`:`<button class="tl-act" id="gmAgain">New game</button>`}</div>
      <div class="gm-log">${deck.length} cards left</div>
      <details class="gm-drink"><summary>All the rules</summary>${Object.entries(KRULES).map(([k,v])=>`<div><b>${RANKS[k]}</b> ${v[0]}: ${v[1]}</div>`).join("")}</details>`;
    wireBack();const n=EL.querySelector("#gmNext");if(n)n.onclick=()=>{tapv();cur=deck.pop();turn++;if(cR(cur)===13)kings++;draw();};
    const g=EL.querySelector("#gmAgain");if(g)g.onclick=()=>{tapv();kingsRun(P);};};
  draw();}

/* ================= HIGHER OR LOWER ================= */
function hlStart(){const P=store("pt-gplayers",[]);
  EL.innerHTML=backRow()+`<div class="gm-title">↕️ Higher or lower</div>${DRINK_NOTE}${playersBox("hp")}<div class="gm-row2"><button class="tl-act" id="gmGo">Start</button></div>
    <p class="sv-note">Guess if the next card is higher or lower (Ace is low). Wrong, or the same card: drink as many sips as the cards in the row, and start a new row. After 3 right in a row you may pass the phone.</p>`;
  wireBack();wirePlayers("hp",hlStart);EL.querySelector("#gmGo").onclick=()=>{tapv();hlRun(P);};}
function hlRun(P){const R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()],R),row=[deck.pop()],who=0,msg="";
  const next=g=>{if(!deck.length)deck=shuffle([...Array(52).keys()].filter(c=>!row.includes(c)),R);const prev=row[row.length-1],c=deck.pop();row.push(c);
    const ok=g>0?cR(c)>cR(prev):cR(c)<cR(prev);
    if(!ok){const n=row.length-1;msg=`❌ ${cName(c)}. ${P.length?esc(P[who%P.length])+" drinks":"Drink"} ${n} sip${n>1?"s":""}`;if(navigator.vibrate)try{navigator.vibrate(120);}catch(e){}row=[c];}
    else msg=`✅ ${cName(c)}: right! ${row.length-1} in a row`;draw();};
  const draw=()=>{const name=P.length?P[who%P.length]:"";
    EL.innerHTML=backRow()+`<div class="gm-title">↕️ Higher or lower</div>${name?`<div class="gm-sub"><b>${esc(name)}</b>'s turn</div>`:""}
      <div class="gm-table">${cardH(row[row.length-1],"big")}</div><div class="gm-status over" style="text-align:center">${msg||"Higher or lower?"}</div>
      <div class="gm-row2"><button class="tl-act" data-hl="1">▲ Higher</button><button class="tl-act" data-hl="-1">▼ Lower</button></div>
      ${P.length>1&&row.length>=4?`<div class="gm-row2"><button class="tl-act ghost" id="gmPass">Pass to ${esc(P[(who+1)%P.length])}</button></div>`:""}
      <div class="gm-hand">${row.slice(0,-1).map(c=>cardH(c)).join("")}</div>`;
    wireBack();EL.querySelectorAll("[data-hl]").forEach(b=>b.onclick=()=>{tapv();next(+b.dataset.hl);});
    const p=EL.querySelector("#gmPass");if(p)p.onclick=()=>{tapv();who++;row=[row[row.length-1]];msg="";draw();};};
  draw();}

/* ================= THE BUS (bussen) ================= */
function busSetup(){const P=store("pt-gplayers",[]);
  EL.innerHTML=backRow()+`<div class="gm-title">🚌 The bus</div>${DRINK_NOTE}${playersBox("bp")}<div class="gm-row2"><button class="tl-act" id="gmGo" ${P.length>=2?"":"disabled"}>Start (2 or more players)</button></div>
    <p class="sv-note">1. Everyone answers 4 questions about their own cards: red or black, higher or lower, inside or outside, which suit. Wrong costs 1, 2, 3 or 4 sips.<br>2. The pyramid: cards are turned; if you hold the same number you lay it down and hand out sips.<br>3. Whoever has the most cards left takes the bus: guess higher or lower along 7 cards. Wrong? Drink and start again.</p>`;
  wireBack();wirePlayers("bp",busSetup);EL.querySelector("#gmGo").onclick=()=>{if(P.length<2)return;tapv();busRun(P);};}
function busRun(P){const R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()],R);const hands=P.map(()=>[]);
  let round=0,pl=0,phase=1,msg="",reveal=null;
  const Q=[["Red or black?",[["red","🟥 Red"],["black","⬛ Black"]]],["Higher or lower than your first card?",[["hi","▲ Higher"],["lo","▼ Lower"],["eq","= Same"]]],
    ["Inside or outside your first two?",[["in","↔ Inside"],["out","⇹ Outside"],["eq","= Same"]]],["Which suit?",SUIT.map((s,i)=>[String(i),s])]];
  const judge=(r,a,c,h)=>{if(r===0)return (cS(c)===1||cS(c)===2)===(a==="red");
    if(r===1){const f=cR(h[0]);return a==="eq"?cR(c)===f:a==="hi"?cR(c)>f:cR(c)<f;}
    if(r===2){const lo=Math.min(cR(h[0]),cR(h[1])),hi=Math.max(cR(h[0]),cR(h[1])),v=cR(c);if(a==="eq")return v===lo||v===hi;return a==="in"?(v>lo&&v<hi):(v<lo||v>hi);}
    return String(cS(c))===a;};
  // pyramid
  let pyr=[],pi=0;const pRow=i=>i<4?1:i<7?2:i<9?3:4;
  // bus
  let rider=-1,bus=[],bi=0,tries=0;
  const draw=()=>{let h="";
    if(phase===1){const q=Q[round];
      h=`<div class="gm-sub">Round ${round+1} of 4 · <b>${esc(P[pl])}</b></div><div class="gm-big">${q[0]}</div>
        <div class="gm-hand">${hands[pl].map(c=>cardH(c,"mid")).join("")}${reveal!=null?cardH(reveal,"mid"):""}</div>
        <div class="gm-status over" style="text-align:center">${msg}</div>
        ${reveal==null?`<div class="gm-row2" style="flex-wrap:wrap">${q[1].map(([k,l])=>`<button class="tl-act" data-a="${k}" style="${round===3&&(k==="1"||k==="2")?"color:#ffd0d0":""}">${l}</button>`).join("")}</div>`:`<div class="gm-row2"><button class="tl-act" id="gmOn">${pl+1<P.length?`Next: ${esc(P[pl+1])}`:round<3?"Next round":"On to the pyramid"}</button></div>`}`;}
    else if(phase===2){const rows=[[0,1,2,3],[4,5,6],[7,8],[9]].reverse();
      h=`<div class="gm-big">The pyramid</div><div class="gm-pyr">${rows.map(r=>`<div>${r.map(i=>cardH(i<pi?pyr[i]:-1,"mid")).join("")}</div>`).join("")}</div>
        <div class="gm-status over" style="text-align:center">${msg||"Turn the cards one by one. Row 1 = 1 sip, top = 4 sips."}</div>
        <div class="gm-row2">${pi<10?`<button class="tl-act" id="gmFlip">Turn a card (${pRow(pi)} sip${pRow(pi)>1?"s":""})</button>`:`<button class="tl-act" id="gmBus">Who takes the bus?</button>`}</div>
        <details class="gm-drink"><summary>Cards in hand</summary>${P.map((n,i)=>`<div><b>${esc(n)}</b> ${hands[i].map(cName).join(" ")||"none"}</div>`).join("")}</details>`;}
    else{h=`<div class="gm-big">🚌 ${esc(P[rider])} takes the bus</div><div class="gm-sub">${bi>=bus.length-1?"":"Higher or lower than the last card?"}</div>
        <div class="gm-hand">${bus.map((c,i)=>cardH(i<=bi?c:-1,"mid")).join("")}</div><div class="gm-status over" style="text-align:center">${msg}</div>
        <div class="gm-row2">${bi<bus.length-1?`<button class="tl-act" data-b="1">▲ Higher</button><button class="tl-act" data-b="-1">▼ Lower</button>`:`<button class="tl-act" id="gmAgain">New game</button>`}</div>`;}
    EL.innerHTML=backRow()+`<div class="gm-title">🚌 The bus</div>`+h;wireBack();
    EL.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{tapv();const c=deck.pop(),ok=judge(round,b.dataset.a,c,hands[pl]);reveal=c;msg=ok?"✅ Right!":`❌ ${esc(P[pl])} drinks ${round+1}`;draw();});
    const on=EL.querySelector("#gmOn");if(on)on.onclick=()=>{tapv();hands[pl].push(reveal);reveal=null;msg="";pl++;if(pl>=P.length){pl=0;round++;}
      if(round>3){phase=2;pyr=deck.splice(-10);}draw();};
    const fl=EL.querySelector("#gmFlip");if(fl)fl.onclick=()=>{tapv();const c=pyr[pi],v=pRow(pi);pi++;const got=[];
      P.forEach((n,i)=>{const k=hands[i].findIndex(x=>cR(x)===cR(c));if(k>=0){hands[i].splice(k,1);got.push(n);}});
      msg=`${cName(c)}: `+(got.length?got.map(esc).join(", ")+` hand${got.length>1?"":"s"} out ${v} sip${v>1?"s":""}`:"nobody has it");draw();};
    const bb=EL.querySelector("#gmBus");if(bb)bb.onclick=()=>{tapv();const most=Math.max(...hands.map(h=>h.length)),cand=P.map((n,i)=>i).filter(i=>hands[i].length===most);
      rider=cand.length>1?cand.sort((a,b)=>hands[b].reduce((s,c)=>s+cR(c),0)-hands[a].reduce((s,c)=>s+cR(c),0))[0]:cand[0];
      phase=3;deck=shuffle([...Array(52).keys()],R);bus=deck.splice(-7);bi=0;msg=`${esc(P[rider])} has ${most} card${most===1?"":"s"} left`;draw();};
    EL.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{tapv();const g=+b.dataset.b,a=bus[bi],c=bus[bi+1],ok=g>0?cR(c)>cR(a):cR(c)<cR(a);bi++;
      if(ok){msg=bi>=bus.length-1?`🎉 Off the bus${tries?` after ${tries+1} tries`:""}!`:"✅ Keep going";}
      else{const n=bi;msg=`❌ ${cName(c)}: drink ${n} and start again`;tries++;if(deck.length<8)deck=shuffle([...Array(52).keys()],R);setTimeout(()=>{bus=deck.splice(-7);bi=0;draw();},1400);}
      draw();});
    const ag=EL.querySelector("#gmAgain");if(ag)ag.onclick=()=>{tapv();busRun(P);};};
  draw();}

/* ================= Wildlings lives in mon.js ================= */
function withMon(f){if(window.MON)return f();const sc=document.createElement("script");sc.src=location.protocol==="file:"?"mon.js":"mon.js?v="+(typeof APP_VERSION!=="undefined"?APP_VERSION:"");
  sc.onload=()=>{try{MON.init({EL:()=>EL,back:backRow,wireBack,friendMenu,stopAll,hub,esc,tapv,rng,shuffle,h2,bytes,store,save,toast:toastG,setLink:l=>{LINK=l;},getLink:()=>LINK,MYNAME});f();}catch(e){EL.innerHTML=`<p class="sv-note">Wildlings couldn't start: ${esc(e.message)}</p>`;}};
  sc.onerror=()=>{EL.innerHTML=backRow()+`<p class="sv-note">Wildlings couldn't load.</p>`;wireBack();};document.head.appendChild(sc);}
function openMon(){withMon(()=>MON.home());}

window.GAMES={run(el,tool){addCss();EL=el;T=tool;try{const hd=document.querySelector("#tlOv .tl-head");if(hd)hd.hidden=true;}catch(e){}tool.stops.push(()=>{stopAll();HUB_REDRAW=null;});hub();},
  open(sub){if(sub==="mon")openMon();},withMon,EL:()=>EL};
})();
