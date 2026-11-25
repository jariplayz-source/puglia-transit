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

.gx{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;background:var(--bg);color:var(--ink)}
.gx-top{display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;flex:none}
.gx-back{border:0;background:var(--card);color:var(--ink);width:44px;height:44px;border-radius:22px;font-size:22px;box-shadow:inset 0 0 0 1px var(--line);flex:none}
.gx-title{font:700 18px system-ui,sans-serif;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gx-st{font-size:12px;color:var(--muted);text-align:right;max-width:52%}
.gx-body{flex:1;overflow:auto;padding:4px 12px calc(14px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}
.gx-body.fit{overflow:hidden;display:flex;flex-direction:column;padding-bottom:calc(10px + env(safe-area-inset-bottom))}
.pt-seats{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:2px 0 6px}
.pt-seat{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:64px;padding:6px 6px 4px;border-radius:16px;transition:background .3s}
.pt-seat .av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 17px system-ui;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.pt-seat small{font-size:11.5px;color:var(--muted);max-width:76px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pt-seat .fan{display:flex;height:22px;margin-top:-2px}.pt-seat .fan i{width:13px;height:20px;border-radius:3px;margin-left:-8px;background:repeating-linear-gradient(45deg,#2c5f8e 0 3px,#234e76 3px 6px);box-shadow:0 0 0 1px #fff inset,0 1px 2px rgba(0,0,0,.3)}
.pt-seat .fan i:first-child{margin-left:0}.pt-seat .n{font:700 12px system-ui}
.pt-seat.on{background:color-mix(in srgb,var(--tc) 22%,transparent)}.pt-seat.on .av{animation:ptpulse 1.4s infinite}
@keyframes ptpulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--tc) 70%,transparent)}50%{box-shadow:0 0 0 8px transparent}}
.pt-table{flex:1;min-height:200px;position:relative;display:flex;align-items:center;justify-content:center;gap:26px;border-radius:26px;margin:4px 0 8px;
  background:radial-gradient(ellipse at 50% 35%,#3b8f5d,#1f5a39 70%,#174a2e);box-shadow:inset 0 0 0 6px rgba(0,0,0,.18),inset 0 10px 40px rgba(0,0,0,.35);color:#fff}
.pt-deck{position:relative;width:76px;height:108px;border:0;padding:0;background:none}.pt-deck .gc{position:absolute;left:0;top:0;width:76px;height:108px;border-radius:10px}
.pt-deck .gc:nth-child(2){transform:translate(-2px,-2px)}.pt-deck .gc:nth-child(3){transform:translate(-4px,-4px)}
.pt-deck:not(:disabled) .gc:last-child{box-shadow:0 0 0 3px #ffe08a,0 0 0 2px #fff inset,0 6px 14px rgba(0,0,0,.4)}
.pt-pile{position:relative;width:86px;height:118px}.pt-pile .gc{position:absolute;left:5px;top:5px;width:76px;height:108px;border-radius:10px;font-size:26px}.pt-pile .gc i{font-size:32px}
.pt-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#d8433a;color:#fff;font:800 15px system-ui;padding:4px 12px;border-radius:14px;box-shadow:0 3px 8px rgba(0,0,0,.3);animation:ptpop .35s}
.pt-suit{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:#fffdf8;font-size:22px;padding:2px 12px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.pt-dir{position:absolute;top:10px;right:14px;font-size:22px;opacity:.7}
@keyframes ptpop{from{transform:translateX(-50%) scale(.3)}to{transform:translateX(-50%) scale(1)}}
.pt-msg{text-align:center;font:600 15px system-ui;min-height:22px;margin:2px 0}.pt-sub{text-align:center;font-size:13px;color:var(--muted);min-height:18px}
.pt-hand{display:flex;justify-content:center;padding:14px 6px 6px;min-height:110px;flex:none;overflow-x:auto}
.pt-hand .gc{width:62px;height:90px;border-radius:9px;font-size:20px;margin-left:var(--ov,-14px);transition:transform .18s;flex:none}.pt-hand .gc i{font-size:24px}
.pt-hand .gc:first-child{margin-left:0}.pt-hand .gc.ok{transform:translateY(-12px);box-shadow:0 0 0 3px var(--tc),0 8px 16px rgba(0,0,0,.3);z-index:1}
.pt-hand .gc.no{filter:brightness(.82)}
.pt-btns{display:flex;gap:8px;flex:none}.pt-btns .tl-act{min-height:52px}
.gx-fly{position:fixed;z-index:70;pointer-events:none}
.gx-confetti{position:fixed;inset:0;z-index:80;pointer-events:none}
.gm-lobby{display:flex;flex-direction:column;gap:8px}.gm-pl{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);animation:gmin .3s}
.gm-pl .av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:700 15px system-ui}.gm-pl b{flex:1}
@keyframes gmin{from{opacity:0;transform:translateY(8px)}}
.gm-code{font:800 54px/1 ui-monospace,monospace;letter-spacing:.18em;text-align:center;margin:12px 0 4px}
.gm-sel{display:flex;flex-direction:column;gap:6px}.gm-sel label{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.gm-sel input{width:22px;height:22px;accent-color:var(--tc)}
@media (prefers-reduced-motion:reduce){.pt-seat.on .av,.gm-pl,.pt-badge{animation:none}}
`;
function addCss(){if(document.getElementById("gmCss"))return;const s=document.createElement("style");s.id="gmCss";s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- the full-screen frame every game screen sits in ---------------- */
let SHELL=null;
function makeShell(el){el.innerHTML=`<div class="gx"><div class="gx-top"><button class="gx-back" id="gxBack" aria-label="Back">‹</button><div class="gx-title" id="gxTitle">Games</div><div class="gx-st" id="gxSt"></div></div><div class="gx-body" id="gxBody"></div></div>`;
  SHELL=el.querySelector(".gx");return SHELL.querySelector("#gxBody");}
/* a game redraws its screen on every move: only jump back to the top when the screen itself changes */
let SHELLT="";
function shell(title,status,fit){const t=title||"Games",inRoom=(()=>{try{return !!ROOMR&&ROOMR.started;}catch(e){return false;}})(),same=t===SHELLT&&inRoom;SHELLT=t;SHELL.querySelector("#gxTitle").textContent=t;setStatus(status);EL.className="gx-body"+(fit?" fit":"");if(!same)EL.scrollTop=0;return EL;}
function setStatus(t){const x=SHELL&&SHELL.querySelector("#gxSt");if(x)x.textContent=t||"";}
function onBack(f){const b=SHELL&&SHELL.querySelector("#gxBack");if(b)b.onclick=()=>{tapv();f();};}
const AVC=["#e0533c","#2f7fd0","#2e9d5b","#c4602a","#8a4fc0","#c23f86","#178a8a","#6b6f1f"];
const avatar=(name,k)=>`<span class="av" style="background:${AVC[k%AVC.length]}">${esc((String(name||"?").replace(/^🤖\s*/,"")[0]||"?").toUpperCase())}</span>`;
const RM=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}};
// an element flies from one place on screen to another (used for cards)
function fly(html,from,to,ms,delay){if(!from||!to)return;const d=document.createElement("div");d.className="gx-fly";d.innerHTML=html;document.body.appendChild(d);
  const w=to.width||from.width,h=to.height||from.height;d.style.left=to.left+"px";d.style.top=to.top+"px";d.style.width=w+"px";d.style.height=h+"px";
  const an=d.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/w}) rotate(-8deg)`,opacity:.9},{transform:"translate(0,0) scale(1) rotate(0)",opacity:1}],{duration:ms||380,delay:delay||0,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});
  an.onfinish=()=>d.remove();setTimeout(()=>d.remove(),(ms||380)+(delay||0)+200);}
function animateFrom(el,from,ms,delay){if(!el||!from)return;const to=el.getBoundingClientRect();if(!to.width)return;
  el.animate([{transform:`translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${Math.max(.35,from.width/to.width)}) rotate(-10deg)`,opacity:.6},{transform:"none",opacity:1}],{duration:ms||420,delay:delay||0,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});}
function confetti(){if(RM())return;const c=document.createElement("canvas");c.className="gx-confetti";document.body.appendChild(c);const W=c.width=innerWidth,H=c.height=innerHeight,g=c.getContext("2d");
  const P=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*80,y:H*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*16-6,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,c:AVC[Math.floor(Math.random()*AVC.length)],w:6+Math.random()*6}));
  const t0=performance.now();const step=t=>{const dt=(t-t0)/1000;g.clearRect(0,0,W,H);for(const p of P){p.vy+=.45;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);g.restore();}
    if(dt<2.6)requestAnimationFrame(step);else c.remove();};requestAnimationFrame(step);}

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
  if(window.ROOM_IN&&ROOM_IN(G,env))return;
  if(env.k==="inv"&&Array.isArray(env.to)){if(!env.to.includes(G.me.id))return;env=Object.assign({},env,{to:G.me.id});}
  if(env.k==="inv"){const a=INV().filter(x=>x.sid!==env.sid);a.push({g:G.id,from:env.from,name:env.name,game:env.g,sid:env.sid,ts:env.ts||Date.now()});save("pt-ginv",a.slice(-5));
    toastG(`🎮 ${env.name} invites you to ${GNAME[env.g]||"a game"}: open Games`);if(HUB_REDRAW)HUB_REDRAW();return;}
  if(env.k==="acc"&&ACCEPT_WAIT&&env.sid===ACCEPT_WAIT.sid&&env.from===ACCEPT_WAIT.peer){const w=ACCEPT_WAIT;ACCEPT_WAIT=null;w.onAcc(G,env);return;}
  if(env.k==="no"&&ACCEPT_WAIT&&env.sid===ACCEPT_WAIT.sid){ACCEPT_WAIT=null;toastG(`${env.name} can't play right now`);if(HUB_REDRAW)HUB_REDRAW();return;}
  NET.got(env);};
const GNAME={pesten:"Pesten",mon:"a Wildlings battle",trade:"a Wildlings trade",rpg:"a Questbook adventure",mb:"a Wildlings battle",mt:"a Wildlings trade",race:"Horse race",kings:"Kingsen",hl:"Higher or lower",bus:"The bus",faker:"Faker",wolves:"Werewolves",tcg:"Shards"};

/* A link the games use, whatever is underneath: {kind, role (0 starts), peerName, send(t,hex), on, close()} */
function btLink(role,peerName){const L={kind:"bt",role,peerName,on:null,send:(t,d)=>GL.send(t,d),close(){GL.send(4,"");setTimeout(()=>GL.stop(),700);},status:()=>GL.seen&&Date.now()-GL.seen>12000?"⚠ Lost your friend: come closer":"📶 "+peerName};
  GL.h={msg:(t,d)=>{if(t===4){L.on&&L.on(4,"");return;}L.on&&L.on(t,d);},tick:()=>{const w=document.getElementById("gmLink");if(w)w.textContent=L.status();setStatus(L.status());}};return L;}
function netLink(G,sid,peer,peerName,role){const s=NET.start(G,sid,peer,peerName,role);
  const L={kind:"net",role,peerName,on:null,send:(t,d)=>NET.send(t,d),close(){try{gPublish({ty:"game",k:"bye",sid,to:peer},null,G).catch(()=>{});}catch(e){}NET.stop();},status:()=>"🌐 "+peerName+" (online, a few seconds per move)"};
  s.on=(t,d)=>L.on&&L.on(t,d);return L;}

/* ---------------- hub ---------------- */
let EL=null,T=null,LINK=null;
function stopAll(){try{if(window.SHARDS&&SHARDS.stop)SHARDS.stop();if(window.RPG&&RPG.stop)RPG.stop();}catch(e){}leaveRoom();clearInterval(pestenView.t);clearInterval(lobbyView.t);if(LINK){try{LINK.close();}catch(e){}LINK=null;}GL.stop();NET.stop();ACCEPT_WAIT=null;clearInterval(AUTO);AUTO=0;try{window.MON&&MON.stop();}catch(e){}}
let AUTO=0;
// older screens: the header's back button goes to the games list; extra (a connection note) shows in the header
const backRow=(extra)=>{shell("Games","",false);if(extra){const d=document.createElement("div");d.innerHTML=extra;setStatus(d.textContent);}return "";};
function wireBack(cb){onBack(()=>{if(cb)cb();stopAll();hub();});}
const DRINK_NOTE=`<div class="gm-drink">🍺 Drinking games are for adults (18+). Sips can be water or anything else. Stop when you've had enough and make sure everyone gets home safely.</div>`;
function hub(){stopAll();if(SHELL)SHELL.classList.remove("ww-night","ww");shell("Games","",false);onBack(()=>{try{closeTool();}catch(e){}});HUB_REDRAW=()=>{if(EL&&EL.querySelector("#gmHub"))hub();};
  const inv=INV();
  EL.innerHTML=`<div id="gmHub">${inv.map(x=>`<div class="gm-inv"><span>🎮</span><b>${esc(x.name)} invites you to ${esc(GNAME[x.game]||"play")}</b><button class="tl-act" data-acc="${esc(x.sid)}" style="flex:none;padding:10px 14px">Play</button><button class="tl-act ghost" data-dec="${esc(x.sid)}" style="flex:none;padding:10px 12px">✕</button></div>`).join("")}
    <div class="gm-grid"><button class="gm-card wide" data-g="mon"><span>🌿</span><div><b>Wildlings</b> <small style="background:#e0531f;color:#fff;border-radius:6px;padding:1px 6px;font-weight:700">TEST</small><br><small>Walk around the real map to catch creatures, spin stops for supplies and beat the Wardens at landmarks for 8 badges. Battle and trade with your circle within 100 m.</small></div></button></div>
    <div class="gm-grid" style="margin-top:10px"><button class="gm-card wide" data-g="rpg" style="background:linear-gradient(135deg,#6b3f1e,#1d1430)"><span>🎲</span><div><b>Questbook</b><br><small>A story adventure with dice: the phone is the game master. Choose, roll the d20, help each other and fight together. Alone or 2 to 4 heroes, each on their own phone.</small></div></button></div>
    <div class="gm-grid" style="margin-top:10px"><button class="gm-card wide" data-g="tcg" style="background:linear-gradient(135deg,#3a2a7a,#14182c)"><span>💎</span><div><b>Shards</b><br><small>A card battle: pick a champion, send units to the battlefields, first to 10 points wins. Against the phone or a friend.</small></div></button></div>
    <div class="tl-sec">Party games</div>
    <div class="gm-grid"><button class="gm-card" data-g="wolves"><span>🐺</span><b>Werewolves</b><small>Secret roles, a night and a day. 5–8 players</small></button><button class="gm-card" data-g="faker"><span>🤫</span><b>Faker</b><small>Everyone gets a task, except one. Who's faking? 3–8 players</small></button></div>
    <div class="tl-sec">Card games</div>
    <div class="gm-grid">
      <button class="gm-card" data-g="pesten"><span>🃏</span><b>Pesten</b><small>Against the phone, over Bluetooth or online</small></button>
      <button class="gm-card" data-g="race"><span>🏇</span><b>Horse race</b><small>Drinking game: bet sips on an ace</small></button>
      <button class="gm-card" data-g="kings"><span>👑</span><b>Kingsen</b><small>Drinking game: every card is a task</small></button>
      <button class="gm-card" data-g="hl"><span>↕️</span><b>Higher or lower</b><small>Drinking game: guess the next card</small></button>
      <button class="gm-card" data-g="bus"><span>🚌</span><b>The bus</b><small>Drinking game: 4 questions, the pyramid, then someone rides the bus</small></button>
    </div><p class="sv-note">Everything works without internet. Bluetooth reaches about 10 to 20 metres and needs no pairing: one phone shows a code, the other types it in.</p></div>`;
  EL.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{tapv();const g=b.dataset.g;({mon:openMon,pesten:pestenMenu,race:()=>roomMenu("race"),kings:()=>roomMenu("kings"),hl:()=>roomMenu("hl"),bus:()=>roomMenu("bus"),rpg:()=>withRoom(()=>roomMenu("rpg",`<p class="sv-note">The phone is the game master and tells the story. Each of you picks a hero, chooses what to do, and rolls a d20 to see if it works. Everyone on their own phone, or alone with computer heroes.</p>`)),tcg:()=>withRoom(()=>roomMenu("tcg",`<p class="sv-note">Pick one of four champions, each with its own deck of 30 cards. Play units and spells with your energy, move units onto the two battlefields: conquer one for a point, and hold it for another point at the start of each of your turns. First to 10 points wins.</p>`)),wolves:()=>roomMenu("wolves",`<p class="sv-note">Everyone on their own phone, sitting together. The phone is the narrator: no game master needed.</p>`),faker:()=>roomMenu("faker",`<p class="sv-note">Everyone plays on their own phone. Sit together (or video call), because the tasks are done for real.</p>`)})[g]();});
  EL.querySelectorAll("[data-acc]").forEach(b=>b.onclick=()=>{tapv();acceptInv(b.dataset.acc);});
  EL.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const x=INV().find(i=>i.sid===b.dataset.dec);save("pt-ginv",INV().filter(i=>i.sid!==b.dataset.dec));
    if(x){const G=(typeof gGroups==="function"?gGroups():[]).find(g=>g.id===x.g);if(G)gPublish({ty:"game",k:"no",sid:x.sid,to:x.from},null,G).catch(()=>{});}hub();});}
function acceptInv(sid){const x=INV().find(i=>i.sid===sid);save("pt-ginv",INV().filter(i=>i.sid!==sid));if(!x)return hub();
  const G=(typeof gGroups==="function"?gGroups():[]).find(g=>g.id===x.g);if(!G){toastG("That circle isn't on this phone anymore");return hub();}
  if(typeof isOffline==="function"&&isOffline()){toastG("📴 You're offline: online games need internet");return hub();}
  gPublish({ty:"game",k:"acc",sid,to:x.from},null,G).catch(()=>toastG("⚠ Couldn't answer: check your internet"));
  if(x.game==="mb"||x.game==="mt")return withMon(()=>withRoom(()=>joinRoomNet(x.game,G,sid,x.from)));
  if(RG[x.game])return withRoom(()=>joinRoomNet(x.game,G,sid,x.from));
  if(x.game==="mon"||x.game==="trade"){toastG("That invite is from an older version of the app: ask them to update");return hub();}
  LINK=netLink(G,sid,x.from,x.name,1);}

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

/* ================= PESTEN =================
   Rules: match suit or rank. 2 = next draws 2, Joker = next draws 5 (both stack: a 2 on a 2, a Joker on anything that has to be drawn).
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
function pApply(S,a){const p=S.turn,nm=S.names[p];S.log="";S.lastP=p;S.lastK=a.k;
  if(S.win>=0)return false;
  if(a.k===1){const i=S.hands[p].indexOf(a.c);if(i<0||!pCan(S,a.c)||(S.drew>=0&&a.c!==S.drew))return false;S.hands[p].splice(i,1);S.pile.push(a.c);S.suit=null;const c=a.c,r=isJk(c)?0:cR(c);
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


const PESTEN_DEF={min:2,max:6,aiDelay:1000,
  init(players,seed,o){const S=pNew(seed,players.map(p=>p.name),(o[0]||0)%players.length);S.drink=!!o[1];S.seed=seed;return S;},
  check(S,slot,a){if(S.win>=0||slot!==S.turn)return false;const [k,c]=a;
    if(k===1)return S.hands[slot].includes(c)&&pCan(S,c)&&(S.drew<0||c===S.drew);if(k===2)return S.pend>0||S.drew<0;if(k===3)return S.drew>=0;return false;},
  apply(S,slot,a){if(!PESTEN_DEF.check(S,slot,a))return false;return pApply(S,{k:a[0],c:a[1],s:a[2]||0});},
  turn:S=>S.win>=0?-1:S.turn,
  ai(S){const a=pAI(S);return [a.k,a.c||0,a.s||0];}};


/* ================= drinking games with everyone on their own phone =================
   The host deals and turns cards; everyone bets, draws or guesses on their own phone. All of it goes through the room's log. */
const flipCss=`.flipin{animation:flipin .45s cubic-bezier(.2,.8,.2,1)}@keyframes flipin{from{transform:rotateY(90deg) scale(.9)}to{transform:none}}
.dg-who{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0 8px}.dg-who span{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border-radius:20px;background:var(--chip);font-size:13px}
.dg-who span .av{width:24px;height:24px;font-size:12px}.dg-who span.on{background:var(--tc);color:#fff}
.dg-big{font:800 28px system-ui;text-align:center;margin:6px 0 2px}.dg-rule{text-align:center;font-size:16px;line-height:1.45;margin:0 8px 8px}
.dg-res{background:var(--chip);border-radius:14px;padding:10px 12px;font-size:14px;line-height:1.6;margin:6px 0}
.rc-lane{display:grid;grid-template-columns:28px repeat(8,1fr);gap:3px;align-items:center;margin:3px 0}.rc-lane .cell{height:48px;border-radius:7px;background:rgba(255,255,255,.08)}
.rc-lane .cell{display:flex;align-items:center;justify-content:center;height:52px}.rc-lane .gc{width:30px;height:44px;font-size:11px;border-radius:5px}.rc-lane .gc i{font-size:14px}
.rc-lane .fin{background:repeating-linear-gradient(45deg,rgba(255,255,255,.3) 0 4px,transparent 4px 8px)}.rc-lane b{text-align:center;font-size:20px}
.rc-horse{position:absolute;transition:left .55s cubic-bezier(.2,.8,.2,1);top:0}
.rc-track{position:relative}.rc-side{display:grid;grid-template-columns:28px repeat(8,1fr);gap:3px;margin-bottom:6px}.rc-side .gc{width:34px;height:48px;font-size:12px;justify-self:center}.rc-side .gc i{font-size:15px}
.rc-bets{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;font-size:12px;margin-top:4px}`;
function dgCss(){if(document.getElementById("dgCss"))return;const st=document.createElement("style");st.id="dgCss";st.textContent=flipCss;document.head.appendChild(st);}
const whoRow=(R,on)=>`<div class="dg-who">${R.players.map((p,k)=>`<span class="${on===k?"on":""}">${avatar(p.name,k)}${esc(p.name)}</span>`).join("")}</div>`;
const nm=(S,k)=>esc((S.names||[])[k]||"?");

/* ---------- horse race ---------- */
const RACE_DEF={min:2,max:8,
  init(pl,seed){const R=rng(seed),deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1),R);return {names:pl.map(p=>p.name),n:pl.length,R,deck,side:deck.splice(0,6),pos:[0,0,0,0],flip:[0,0,0,0,0,0],phase:0,bets:pl.map(()=>null),last:null,win:-1,msg:""};},
  check(S,k,a){if(a[0]===1)return S.phase===0&&a[1]<4&&a[2]>=1&&a[2]<=20;if(a[0]===2)return k===0&&S.phase===0&&S.bets.some(b=>b);if(a[0]===3)return k===0&&S.phase===1;return false;},
  apply(S,k,a){if(!RACE_DEF.check(S,k,a))return false;
    if(a[0]===1){S.bets[k]={s:a[1],n:a[2]};return true;}
    if(a[0]===2){S.phase=1;S.msg="And they're off!";return true;}
    if(!S.deck.length)S.deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1&&!S.side.includes(c)),S.R);
    const c=S.deck.pop();S.last=c;S.pos[cS(c)]++;S.msg=`${cName(c)}: ${SUIT[cS(c)]} moves on`;
    if(S.pos[cS(c)]>6){S.win=cS(c);S.phase=2;S.msg=`The ${SUIT[S.win]} horse wins!`;return true;}
    for(let i=0;i<6;i++)if(!S.flip[i]&&Math.min(...S.pos)>i){S.flip[i]=1;const s=cS(S.side[i]);S.pos[s]=Math.max(0,S.pos[s]-1);S.msg+=` · ${cName(S.side[i])} turns: ${SUIT[s]} goes back!`;}
    return true;},
  turn:S=>-1};
function raceView(R){dgCss();const S=R.S,me=R.mySlot(),host=R.host;shell("Horse race",R.status(),false);onBack(()=>leaveAsk(R));
  const mine=S.bets[me]||{s:me%4,n:2},pend=!!R.pending;
  if(S.phase===0){raceView.key=null;EL.innerHTML=`<div class="dg-big">Place your bet</div><p class="dg-rule">Pick a horse and how many sips. If it wins you hand out double; if not, you drink them.</p>
      <div class="gm-suits">${SUIT.map((x,i)=>`<button data-bs="${i}" style="color:${i===1||i===2?"#c62828":"#111"};${mine.s===i&&S.bets[me]?"box-shadow:0 0 0 4px var(--tc)":""}">${x}</button>`).join("")}</div>
      <div class="gm-row2" style="justify-content:center;align-items:center"><button class="tl-act ghost" data-bn="-1" style="flex:0 0 60px">−</button><div class="dg-big" style="min-width:90px">${mine.n} 🍺</div><button class="tl-act ghost" data-bn="1" style="flex:0 0 60px">+</button></div>
      <div class="dg-res">${R.players.map((p,k)=>`${esc(p.name)}: ${S.bets[k]?`${SUIT[S.bets[k].s]} · ${S.bets[k].n} sips`:"<i>thinking…</i>"}`).join("<br>")}</div>
      ${host?`<div class="gm-row2"><button class="tl-act" id="rcGo" ${S.bets.some(b=>b)?"":"disabled"}>Start the race</button></div>`:`<p class="sv-note" style="text-align:center">${pend?"Sending…":"The host starts the race."}</p>`}${DRINK_NOTE}`;}
  else{const key=R.log.findLastIndex?R.log.findLastIndex(e=>e[0]===255):0;
    if(!EL.querySelector("#rcHost")||raceView.key!==key){EL.innerHTML=`<div id="rcHost"></div><div id="rcBelow"></div>`;raceView.key=key;}
    rcBoard(EL.querySelector("#rcHost"),S,key).querySelector(".rcb-msg").textContent=(S.phase===2?"🏆 ":"")+S.msg;
    EL.querySelector("#rcBelow").innerHTML=`${S.phase===2?`<div class="dg-res">${R.players.map((p,k)=>{const b=S.bets[k];if(!b)return `${esc(p.name)}: no bet`;return b.s===S.win?`<b>${esc(p.name)}</b> hands out ${b.n*2} sips`:`${esc(p.name)} drinks ${b.n}`;}).join("<br>")}</div>`:`<div class="gm-names" style="justify-content:center">${R.players.map((p,k)=>S.bets[k]?`<span>${esc(p.name)} ${SUIT[S.bets[k].s]} ${S.bets[k].n}🍺</span>`:"").join("")}</div>`}
      ${host?`<div class="gm-row2">${S.phase===1?`<button class="tl-act" id="rcNext">Next card</button><button class="tl-act ghost" id="rcAuto">${AUTO?"⏸ Pause":"▶ Auto"}</button>`:`<button class="tl-act" id="rcAgain">New race</button>`}</div>`:""}`;
    if(S.phase===2&&raceView.done!==R.log.length){raceView.done=R.log.length;const b=S.bets[me];if(b&&b.s===S.win)setTimeout(confetti,800);clearInterval(AUTO);AUTO=0;}}
  EL.querySelectorAll("[data-bs]").forEach(b=>b.onclick=()=>{tapv();R.act([1,+b.dataset.bs,mine.n]);});
  EL.querySelectorAll("[data-bn]").forEach(b=>b.onclick=()=>{tapv();R.act([1,mine.s,Math.max(1,Math.min(20,mine.n+ +b.dataset.bn))]);});
  const go=EL.querySelector("#rcGo");if(go)go.onclick=()=>{tapv();R.act([2]);};
  const nx=EL.querySelector("#rcNext");if(nx)nx.onclick=()=>{tapv();R.act([3]);};
  const au=EL.querySelector("#rcAuto");if(au)au.onclick=()=>{tapv();if(AUTO){clearInterval(AUTO);AUTO=0;}else AUTO=setInterval(()=>{if(R!==ROOMR||R.S.phase!==1){clearInterval(AUTO);AUTO=0;return;}R.act([3]);},1400);raceView(R);};
  const ag=EL.querySelector("#rcAgain");if(ag)ag.onclick=()=>{tapv();R.restart([]);};}

/* ---------- Kingsen ---------- */
const KINGS_DEF={min:2,max:8,
  init(pl,seed){return {names:pl.map(p=>p.name),n:pl.length,deck:shuffle([...Array(52).keys()],rng(seed)),cur:null,kings:0,turn:0,by:-1};},
  check(S,k,a){if(a[0]===1)return S.deck.length>0&&k===S.turn;if(a[0]===9)return k===0&&S.deck.length>0;return false;},
  apply(S,k,a){if(!KINGS_DEF.check(S,k,a))return false;if(a[0]===9){S.turn=(S.turn+1)%S.n;return true;}
    S.cur=S.deck.pop();S.by=k;if(cR(S.cur)===13)S.kings++;S.turn=(S.turn+1)%S.n;return true;},
  turn:S=>S.deck.length?S.turn:-1};
function kingsView(R){dgCss();const S=R.S,me=R.mySlot();shell("Kingsen",R.status(),false);onBack(()=>leaveAsk(R));
  const r=S.cur!=null?KRULES[cR(S.cur)]:null,mine=S.turn===me&&S.deck.length&&!R.pending;
  EL.innerHTML=whoRow(R,S.deck.length?S.turn:-1)+`<div class="pt-table" style="flex:none;min-height:200px">${cardH(S.cur==null?-1:S.cur,"big"+(kingsView.last!==R.log.length&&S.cur!=null?" flipin":""))}</div>
    ${r?`<div class="dg-big">${r[0]}${cR(S.cur)===13?` (${S.kings}/4)`:""}</div><div class="dg-rule"><b>${nm(S,S.by)}</b>: ${cR(S.cur)===13&&S.kings===4?"That's the 4th King: drink the king's cup! 👑":r[1]}</div>`:`<div class="dg-rule">${nm(S,S.turn)} goes first.</div>`}
    <div class="gm-row2">${S.deck.length?(mine?`<button class="tl-act" id="kgDraw">Draw a card</button>`:`<span class="sv-note" style="flex:1;text-align:center">${nm(S,S.turn)} draws next${R.host?"":""}</span>`):(R.host?`<button class="tl-act" id="kgAgain">New game</button>`:`<span class="sv-note" style="flex:1;text-align:center">That was the last card.</span>`)}</div>
    ${R.host&&S.deck.length&&S.turn!==me?`<div class="gm-row2"><button class="tl-act ghost" id="kgSkip">Skip ${nm(S,S.turn)}</button></div>`:""}
    <div class="gm-log" style="text-align:center">${S.deck.length} cards left</div>
    <details class="gm-drink"><summary>All the rules</summary>${Object.entries(KRULES).map(([k,v])=>`<div><b>${RANKS[k]}</b> ${v[0]}: ${v[1]}</div>`).join("")}</details>`;
  if(kingsView.last!==R.log.length&&S.turn===me&&S.deck.length)try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}
  kingsView.last=R.log.length;
  const d=EL.querySelector("#kgDraw");if(d)d.onclick=()=>{tapv();R.act([1]);};const sk=EL.querySelector("#kgSkip");if(sk)sk.onclick=()=>{tapv();R.act([9]);};
  const ag=EL.querySelector("#kgAgain");if(ag)ag.onclick=()=>{tapv();R.restart([]);};}

/* ---------- Higher or lower ---------- */
const HL_DEF={min:2,max:8,
  init(pl,seed){const Rn=rng(seed),deck=shuffle([...Array(52).keys()],Rn);return {names:pl.map(p=>p.name),n:pl.length,R:Rn,deck,row:[deck.pop()],turn:0,msg:"",bad:false};},
  check(S,k,a){if(a[0]===1)return k===S.turn&&(a[1]===1||a[1]===2);if(a[0]===2)return k===S.turn&&S.row.length>=4;if(a[0]===9)return k===0;return false;},
  apply(S,k,a){if(!HL_DEF.check(S,k,a))return false;
    if(a[0]===9||a[0]===2){S.turn=(S.turn+1)%S.n;S.row=[S.row[S.row.length-1]];S.msg=a[0]===2?`${S.names[k]} passes`:"";S.bad=false;return true;}
    if(!S.deck.length)S.deck=shuffle([...Array(52).keys()].filter(c=>!S.row.includes(c)),S.R);
    const prev=S.row[S.row.length-1],c=S.deck.pop();S.row.push(c);const ok=a[1]===1?cR(c)>cR(prev):cR(c)<cR(prev);
    if(ok){S.msg=`✅ ${cName(c)}: right! ${S.row.length-1} in a row`;S.bad=false;}
    else{const n=S.row.length-1;S.msg=`❌ ${cName(c)}. ${S.names[k]} drinks ${n} sip${n>1?"s":""}`;S.bad=true;S.row=[c];S.turn=(S.turn+1)%S.n;}
    return true;},
  turn:S=>S.turn};
function hlView(R){dgCss();const S=R.S,me=R.mySlot(),mine=S.turn===me&&!R.pending;shell("Higher or lower",R.status(),false);onBack(()=>leaveAsk(R));
  EL.innerHTML=whoRow(R,S.turn)+`<div class="pt-table" style="flex:none;min-height:200px">${cardH(S.row[S.row.length-1],"big"+(hlView.last!==R.log.length?" flipin":""))}</div>
    <div class="dg-big" style="font-size:20px;${S.bad?"color:#d8433a":""}">${esc(S.msg)||"Higher or lower?"}</div>
    ${mine?`<div class="gm-row2"><button class="tl-act" data-hl="1">▲ Higher</button><button class="tl-act" data-hl="2">▼ Lower</button></div>${S.row.length>=4?`<div class="gm-row2"><button class="tl-act ghost" id="hlPass">Pass it on</button></div>`:""}`:`<p class="sv-note" style="text-align:center">${nm(S,S.turn)} is guessing…</p>`}
    ${R.host&&S.turn!==me?`<div class="gm-row2"><button class="tl-act ghost" id="hlSkip">Skip ${nm(S,S.turn)}</button></div>`:""}
    <div class="gm-hand">${S.row.slice(0,-1).map(c=>cardH(c)).join("")}</div>`;
  if(hlView.last!==R.log.length&&S.bad&&hlView.last!=null)try{navigator.vibrate&&navigator.vibrate(150);}catch(e){}
  hlView.last=R.log.length;
  EL.querySelectorAll("[data-hl]").forEach(b=>b.onclick=()=>{tapv();R.act([1,+b.dataset.hl]);});
  const ps=EL.querySelector("#hlPass");if(ps)ps.onclick=()=>{tapv();R.act([2]);};const sk=EL.querySelector("#hlSkip");if(sk)sk.onclick=()=>{tapv();R.act([9]);};}

/* ---------- The bus ---------- */
const BUS_Q=[["Red or black?",[[0,"🟥 Red"],[1,"⬛ Black"]]],["Higher or lower than your first card?",[[0,"▲ Higher"],[1,"▼ Lower"],[2,"= Same"]]],
  ["Inside or outside your first two?",[[0,"↔ Inside"],[1,"⇹ Outside"],[2,"= Same"]]],["Which suit?",SUIT.map((s,i)=>[i,s])]];
function busJudge(r,a,c,h){if(r===0)return (cS(c)===1||cS(c)===2)===(a===0);
  if(r===1){const f=cR(h[0]);return a===2?cR(c)===f:a===0?cR(c)>f:cR(c)<f;}
  if(r===2){const lo=Math.min(cR(h[0]),cR(h[1])),hi=Math.max(cR(h[0]),cR(h[1])),v=cR(c);if(a===2)return v===lo||v===hi;return a===0?(v>lo&&v<hi):(v<lo||v>hi);}
  return cS(c)===a;}
const BUS_DEF={min:2,max:8,
  init(pl,seed){const Rn=rng(seed);return {names:pl.map(p=>p.name),n:pl.length,R:Rn,deck:shuffle([...Array(52).keys()],Rn),hands:pl.map(()=>[]),res:pl.map(()=>[]),round:0,phase:1,pyr:[],pi:0,msg:"",rider:-1,bus:[],bi:0,tries:0};},
  check(S,k,a){if(a[0]===1)return S.phase===1&&a[1]===S.round&&S.hands[k].length===S.round;if(a[0]===2)return S.phase===2&&k===0&&S.pi<10;if(a[0]===3)return S.phase===2&&k===0&&S.pi>=10;
    if(a[0]===4)return S.phase===3&&k===S.rider&&S.bi<S.bus.length-1&&(a[1]===1||a[1]===2);return false;},
  apply(S,k,a){if(!BUS_DEF.check(S,k,a))return false;
    if(a[0]===1){const c=S.deck.pop(),ok=busJudge(S.round,a[2],c,S.hands[k]);S.hands[k].push(c);S.res[k][S.round]=ok?1:0;
      if(S.hands.every(h=>h.length>S.round)){S.round++;if(S.round>3){S.phase=2;S.pyr=S.deck.splice(-10);}}return true;}
    if(a[0]===2){const c=S.pyr[S.pi],v=S.pi<4?1:S.pi<7?2:S.pi<9?3:4;S.pi++;const got=[];S.hands.forEach((h,i)=>{const x=h.findIndex(y=>cR(y)===cR(c));if(x>=0){h.splice(x,1);got.push(S.names[i]);}});
      S.msg=`${cName(c)}: `+(got.length?`${got.join(", ")} hand${got.length>1?"":"s"} out ${v} sip${v>1?"s":""}`:"nobody has it");return true;}
    if(a[0]===3){const most=Math.max(...S.hands.map(h=>h.length));const cand=S.hands.map((h,i)=>i).filter(i=>S.hands[i].length===most);
      S.rider=cand.sort((x,y)=>S.hands[y].reduce((s,c)=>s+cR(c),0)-S.hands[x].reduce((s,c)=>s+cR(c),0))[0];S.phase=3;S.deck=shuffle([...Array(52).keys()],S.R);S.bus=S.deck.splice(-7);S.bi=0;S.msg=`${S.names[S.rider]} takes the bus!`;return true;}
    const x=S.bus[S.bi],c=S.bus[S.bi+1],ok=a[1]===1?cR(c)>cR(x):cR(c)<cR(x);S.bi++;
    if(ok)S.msg=S.bi>=S.bus.length-1?`🎉 ${S.names[S.rider]} is off the bus${S.tries?` after ${S.tries+1} tries`:""}!`:"✅ Keep going";
    else{S.msg=`❌ ${cName(c)}: ${S.names[S.rider]} drinks ${S.bi} and starts again`;S.tries++;if(S.deck.length<8)S.deck=shuffle([...Array(52).keys()],S.R);S.bus=S.deck.splice(-7);S.bi=0;}
    return true;},
  turn:S=>-1};
function busView(R){dgCss();const S=R.S,me=R.mySlot();shell("The bus",R.status(),false);onBack(()=>leaveAsk(R));let h="";
  if(S.phase===1){const q=BUS_Q[S.round],done=S.hands[me].length>S.round;
    h=`<div class="dg-big" style="font-size:22px">Round ${S.round+1} of 4</div><div class="dg-rule">${q[0]}</div>
      <div class="gm-hand">${S.hands[me].map((c,i)=>cardH(c,"mid"+(i===S.hands[me].length-1&&busView.last!==R.log.length?" flipin":""))).join("")}</div>
      ${!done&&!R.pending?`<div class="gm-row2" style="flex-wrap:wrap">${q[1].map(([k,l])=>`<button class="tl-act" data-ba="${k}">${l}</button>`).join("")}</div>`:`<p class="sv-note" style="text-align:center">${R.pending?"Sending…":"Waiting for the others…"}</p>`}
      <div class="dg-res">${R.players.map((p,k)=>`${esc(p.name)}: ${S.res[k].map(x=>x?"✅":"❌").join(" ")}${S.res[k].length?" · drinks "+S.res[k].reduce((s,x,i)=>s+(x?0:i+1),0):""}`).join("<br>")}</div>`;}
  else if(S.phase===2){const rows=[[9],[7,8],[4,5,6],[0,1,2,3]];
    h=`<div class="dg-big" style="font-size:22px">The pyramid</div><div class="gm-pyr">${rows.map(r=>`<div>${r.map(i=>cardH(i<S.pi?S.pyr[i]:-1,"mid"+(i===S.pi-1&&busView.last!==R.log.length?" flipin":""))).join("")}</div>`).join("")}</div>
      <div class="pt-msg">${esc(S.msg)||"Row 1 = 1 sip, top = 4 sips"}</div><div class="gm-hand">${S.hands[me].map(c=>cardH(c)).join("")||"<span class='sv-note'>No cards left</span>"}</div>
      ${R.host?`<div class="gm-row2">${S.pi<10?`<button class="tl-act" id="bsFlip">Turn a card</button>`:`<button class="tl-act" id="bsBus">Who takes the bus?</button>`}</div>`:""}`;}
  else{const rider=S.rider===me;h=`<div class="dg-big" style="font-size:22px">🚌 ${nm(S,S.rider)} takes the bus</div>
      <div class="gm-hand">${S.bus.map((c,i)=>cardH(i<=S.bi?c:-1,"mid"+(i===S.bi&&busView.last!==R.log.length?" flipin":""))).join("")}</div><div class="pt-msg">${esc(S.msg)}</div>
      ${S.bi<S.bus.length-1?(rider&&!R.pending?`<div class="gm-row2"><button class="tl-act" data-bb="1">▲ Higher</button><button class="tl-act" data-bb="2">▼ Lower</button></div>`:`<p class="sv-note" style="text-align:center">${rider?"Sending…":nm(S,S.rider)+" is guessing…"}</p>`):(R.host?`<div class="gm-row2"><button class="tl-act" id="bsAgain">New game</button></div>`:"")}`;
    if(S.bi>=S.bus.length-1&&busView.conf!==R.log.length&&S.rider===me){busView.conf=R.log.length;confetti();}}
  EL.innerHTML=h;busView.last=R.log.length;
  EL.querySelectorAll("[data-ba]").forEach(b=>b.onclick=()=>{tapv();R.act([1,S.round,+b.dataset.ba]);});
  const fl=EL.querySelector("#bsFlip");if(fl)fl.onclick=()=>{tapv();R.act([2]);};const bb=EL.querySelector("#bsBus");if(bb)bb.onclick=()=>{tapv();R.act([3]);};
  EL.querySelectorAll("[data-bb]").forEach(b=>b.onclick=()=>{tapv();R.act([4,+b.dataset.bb]);});const ag=EL.querySelector("#bsAgain");if(ag)ag.onclick=()=>{tapv();R.restart([]);};}
function leaveAsk(R){if(R.mode==="solo"||Date.now()-(leaveAsk.t||0)<3000){leaveRoom();hub();return;}leaveAsk.t=Date.now();toastG("Tap ‹ again to leave the game");}


/* ================= FAKER: everyone gets a task on their own phone, except one. Spot who's faking. ================= */
const FK_TASKS=[
 ["✋ Hands up","Raise your hand if you've ever slept in an airport."],["✋ Hands up","Raise your hand if you've ever missed a train or a flight."],
 ["✋ Hands up","Raise your hand if you can cook a proper meal without a recipe."],["✋ Hands up","Raise your hand if you've ever been lost abroad."],
 ["✋ Hands up","Raise your hand if you sing in the shower."],["✋ Hands up","Raise your hand if you've ever eaten something you couldn't name."],
 ["✋ Hands up","Raise your hand if you've ever sent a message to the wrong person."],["✋ Hands up","Raise your hand if you still have a teddy bear."],
 ["👉 Point","Point at the person most likely to forget their passport."],["👉 Point","Point at the person most likely to become famous."],
 ["👉 Point","Point at the person most likely to talk their way out of a parking ticket."],["👉 Point","Point at the person who'd survive longest on a desert island."],
 ["👉 Point","Point at the person most likely to cry at a film."],["👉 Point","Point at the person who takes the longest to get ready."],
 ["👉 Point","Point at the person most likely to adopt a stray cat on holiday."],["👉 Point","Point at the best dancer here."],
 ["🔢 Fingers","Hold up fingers: how many countries have you been to? (max 10)"],["🔢 Fingers","Hold up fingers: how spicy do you like your food, 0 to 10?"],
 ["🔢 Fingers","Hold up fingers: how many hours did you sleep last night?"],["🔢 Fingers","Hold up fingers: how good a driver are you, 0 to 10?"],
 ["🔢 Fingers","Hold up fingers: how many cups of coffee do you have on a normal day?"],["🔢 Fingers","Hold up fingers: how scared are you of spiders, 0 to 10?"],
 ["😮 Faces","Make the face of someone who just stepped in something."],["😮 Faces","Make the face of someone who just tasted a lemon."],
 ["😮 Faces","Make the face of someone who just won the lottery."],["😮 Faces","Make the face of someone who just saw a ghost."],
 ["😮 Faces","Make the face of someone whose ice cream just fell on the floor."],["😮 Faces","Make your best innocent face."],
 ["🙋 Do it","Touch your nose with your left hand."],["🙋 Do it","Stand up if you're the oldest sibling."],["🙋 Do it","Clap once for every pet you've ever had."],
 ["🙋 Do it","Put both thumbs up if you'd go skydiving."],["🙋 Do it","Shake your head if you've never been on a boat."],["🙋 Do it","Nod if you like pineapple on pizza."]];
const FAKER_DEF={min:3,max:8,
  init(pl,seed){const R=rng(seed),n=pl.length,order=shuffle([...Array(FK_TASKS.length).keys()],R);return {names:pl.map(p=>p.name),n,R,order,oi:0,round:0,faker:Math.floor(R()*n),task:-1,step:0,votes:pl.map(()=>-1),score:pl.map(()=>0),t:0,caught:false};},
  check(S,k,a){if(a[0]===1)return k===0&&(S.step===0||(S.step===1&&S.t<2));if(a[0]===5)return k===0&&S.step===1;if(a[0]===2)return S.step===2&&a[1]<S.n&&a[1]!==k;if(a[0]===3)return k===0&&S.step===2;if(a[0]===4)return k===0&&S.step===3;return false;},
  apply(S,k,a){if(!FAKER_DEF.check(S,k,a))return false;
    if(a[0]===1){if(S.oi>=S.order.length){S.order=shuffle(S.order,S.R);S.oi=0;}S.task=S.order[S.oi++];S.t++;S.step=1;return true;}
    if(a[0]===5){S.step=2;S.votes=S.votes.map(()=>-1);return true;}
    if(a[0]===2){S.votes[k]=a[1];return true;}
    if(a[0]===3){const cnt=Array(S.n).fill(0);S.votes.forEach(v=>{if(v>=0)cnt[v]++;});const top=Math.max(...cnt);S.caught=cnt[S.faker]===top&&top>0&&cnt.filter(x=>x===top).length===1;
      S.votes.forEach((v,i)=>{if(i!==S.faker&&v===S.faker)S.score[i]+=100;});if(!S.caught)S.score[S.faker]+=100*(S.n-1-cnt[S.faker]);S.step=3;return true;}
    if(a[0]===4){S.round++;S.faker=Math.floor(S.R()*S.n);S.t=0;S.task=-1;S.step=0;S.voteNext=false;S.votes=S.votes.map(()=>-1);return true;}
    return false;},
  turn:S=>-1};
const FK_CSS=`.fk-card{margin:10px 0;border-radius:22px;padding:22px 18px;text-align:center;background:linear-gradient(150deg,#3a2a7a,#7a2a6a);color:#fff;min-height:180px;display:flex;flex-direction:column;justify-content:center;gap:10px;user-select:none;-webkit-user-select:none}
.fk-card .k{font:700 14px system-ui;opacity:.8;letter-spacing:.04em}.fk-card .t{font:800 23px/1.3 system-ui}.fk-card{position:relative}.fk-card.fake{background:linear-gradient(150deg,#7a1f1f,#3a0d0d)}
.fk-card.hide{background:linear-gradient(150deg,#2b2f45,#151827)}.fk-card.hide .t,.fk-card.hide .k{visibility:hidden}.fk-card.hide::after{content:"🂠  Your task";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 20px system-ui;opacity:.75;pointer-events:none}
.fk-cd{font:900 90px system-ui;text-align:center;animation:fkcd 1s ease-out}@keyframes fkcd{from{transform:scale(2);opacity:0}to{transform:scale(1);opacity:1}}
.fk-vote{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fk-vote button{display:flex;align-items:center;gap:8px;padding:10px;border-radius:14px;border:0;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:600 15px system-ui}
.fk-vote button.on{box-shadow:inset 0 0 0 3px var(--tc)}.fk-score{display:flex;flex-direction:column;gap:4px;margin-top:8px}.fk-score div{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:var(--chip)}.fk-score b{flex:1}`;
function fakerView(R){dgCss();if(!document.getElementById("fkCss")){const st=document.createElement("style");st.id="fkCss";st.textContent=FK_CSS;document.head.appendChild(st);}
  const S=R.S,me=R.mySlot(),fake=me===S.faker,host=R.host;shell("Faker",R.status(),false);onBack(()=>leaveAsk(R));let h="";
  const scores=`<div class="fk-score">${R.players.map((p,k)=>({p,k,sc:S.score[k]})).sort((a,b)=>b.sc-a.sc).map(x=>`<div>${avatar(x.p.name,x.k)}<b>${esc(x.p.name)}</b>${x.sc}</div>`).join("")}</div>`;
  if(S.step===0){h=`<div class="dg-big">Round ${S.round+1}</div><p class="dg-rule">Everyone gets the same task on their phone, except the faker, who only knows the kind of task. Do it all at the same moment, then vote who was faking.</p>
      ${host?`<div class="gm-row2"><button class="tl-act" id="fkGo">Give the first task</button></div>`:`<p class="sv-note" style="text-align:center">${esc(R.players[0].name)} starts the round.</p>`}${S.round?scores:""}`;}
  else if(S.step===1){const t=FK_TASKS[S.task],fresh=fakerView.t!==S.t+"/"+S.round;
    h=`${fresh?`<div class="fk-cd" id="fkCd">3</div>`:""}<div class="fk-card ${fake?"fake":""} hide" id="fkCard"><div class="k">${t[0]}</div><div class="t">${fake?"You're the FAKER 🤫<br><small style='font-size:16px;font-weight:600'>Watch the others and blend in.</small>":esc(t[1])}</div><small>Hold to see it · let go to hide</small></div>
      <p class="sv-note" style="text-align:center">Everyone acts at the same time when the countdown ends.</p>
      ${host?`<div class="gm-row2">${S.t<2?`<button class="tl-act ghost" id="fkMore">Another task</button>`:""}<button class="tl-act" id="fkVote">Vote now</button></div>`:""}`;
    fakerView.t=S.t+"/"+S.round;}
  else if(S.step===2){const my=S.votes[me];const n=S.votes.filter(v=>v>=0).length;
    h=`<div class="dg-big">Who's faking?</div><div class="fk-vote">${R.players.map((p,k)=>k===me?"":`<button data-v="${k}" class="${my===k?"on":""}">${avatar(p.name,k)}${esc(p.name)}</button>`).join("")}</div>
      <p class="sv-note" style="text-align:center">${n} of ${S.n} voted${fake?" · you can vote too, to throw them off":""}</p>${host?`<div class="gm-row2"><button class="tl-act" id="fkReveal">Reveal</button></div>`:""}`;}
  else{const fk=R.players[S.faker];h=`<div class="dg-big">${S.caught?"Caught! 🎯":"Got away with it 😎"}</div><div class="fk-card fake"><div class="k">The faker was</div><div class="t">${esc(fk.name)}</div><small>${esc(FK_TASKS[S.task][1])}</small></div>
      <div class="dg-res">${R.players.map((p,k)=>`${esc(p.name)} voted ${S.votes[k]>=0?esc(R.players[S.votes[k]].name):"nobody"}`).join("<br>")}</div>${scores}
      ${host?`<div class="gm-row2"><button class="tl-act" id="fkNext">Next round</button></div>`:""}`;
    if(fakerView.rev!==R.log.length){fakerView.rev=R.log.length;if((me===S.faker&&!S.caught)||(me!==S.faker&&S.votes[me]===S.faker))confetti();}}
  EL.innerHTML=h;
  const cd=EL.querySelector("#fkCd");if(cd){let n=3;const tick=()=>{n--;if(!cd.isConnected)return;if(n>0){cd.textContent=n;cd.style.animation="none";void cd.offsetWidth;cd.style.animation="";setTimeout(tick,1000);}else{cd.textContent="GO!";try{navigator.vibrate&&navigator.vibrate(200);}catch(e){}setTimeout(()=>cd.remove(),900);}};setTimeout(tick,1000);}
  const card=EL.querySelector("#fkCard");if(card){const show=e=>{e.preventDefault();card.classList.remove("hide");},hide=()=>card.classList.add("hide");card.addEventListener("pointerdown",show);card.addEventListener("pointerup",hide);card.addEventListener("pointerleave",hide);card.addEventListener("pointercancel",hide);}
  const g=EL.querySelector("#fkGo");if(g)g.onclick=()=>{tapv();R.act([1]);};const mo=EL.querySelector("#fkMore");if(mo)mo.onclick=()=>{tapv();R.act([1]);};
  const vt=EL.querySelector("#fkVote");if(vt)vt.onclick=()=>{tapv();R.act([5]);};
  EL.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{tapv();R.act([2,+b.dataset.v]);});
  const rv=EL.querySelector("#fkReveal");if(rv)rv.onclick=()=>{tapv();R.act([3]);};const nx=EL.querySelector("#fkNext");if(nx)nx.onclick=()=>{tapv();R.act([4]);};}


/* ================= WEREWOLVES: secret roles on everyone's own phone; the phone is the narrator ================= */
const WW_ROLES={w:["🐺","Werewolf","At night, pick someone to eat together with the other wolves. By day, act innocent."],s:["🔮","Seer","Each night, look at one player and learn if they're a werewolf."],
  d:["🩺","Doctor","Each night, protect one player (yourself too) from the wolves."],v:["🧑‍🌾","Villager","Find the werewolves and vote them out by day."]};
const WOLF_DEF={min:5,max:8,
  init(pl,seed){const R=rng(seed),n=pl.length,w=n>=7?2:1,deck=["w","s"].concat(n>=6?["d"]:[]);if(w===2)deck.push("w");while(deck.length<n)deck.push("v");
    return {names:pl.map(p=>p.name),n,roles:shuffle(deck,R),alive:pl.map(()=>1),phase:"night",night:1,wv:{},seer:-1,doc:-1,seen:[],dead:-1,saved:false,votes:pl.map(()=>-1),lynch:-1,win:""};},
  alive:(S,k)=>S.alive[k]===1,
  check(S,k,a){const t=a[1],ok=t!=null&&t<S.n&&S.alive[t];if(!S.alive[k]&&a[0]<5)return false;
    if(a[0]===1)return S.phase==="night"&&S.roles[k]==="w"&&ok&&S.roles[t]!=="w";
    if(a[0]===2)return S.phase==="night"&&S.roles[k]==="s"&&ok&&t!==k&&S.seer<0;
    if(a[0]===3)return S.phase==="night"&&S.roles[k]==="d"&&ok;
    if(a[0]===4)return S.phase==="day"&&(ok&&t!==k||t===255);
    if(a[0]===5)return k===0&&S.phase==="night";if(a[0]===6)return k===0&&S.phase==="day";return false;},
  apply(S,k,a){if(!WOLF_DEF.check(S,k,a))return false;const t=a[1];
    if(a[0]===1){S.wv[k]=t;return true;}if(a[0]===2){S.seer=t;S.seen.push([S.night,t,S.roles[t]==="w"?1:0]);return true;}if(a[0]===3){S.doc=t;return true;}
    if(a[0]===4){S.votes[k]=t;return true;}
    if(a[0]===5){const cnt={};Object.values(S.wv).forEach(v=>{cnt[v]=(cnt[v]||0)+1;});let best=-1,bn=0;for(const v in cnt)if(cnt[v]>bn){bn=cnt[v];best=+v;}
      S.dead=best;S.saved=best>=0&&best===S.doc;if(best>=0&&!S.saved)S.alive[best]=0;S.phase="day";S.votes=S.votes.map(()=>-1);S.lynch=-1;WOLF_DEF.end(S);return true;}
    if(a[0]===6){const cnt=Array(S.n).fill(0);S.votes.forEach((v,i)=>{if(S.alive[i]&&v>=0&&v<255)cnt[v]++;});const top=Math.max(...cnt);
      S.lynch=top>0&&cnt.filter(x=>x===top).length===1?cnt.indexOf(top):-1;if(S.lynch>=0)S.alive[S.lynch]=0;
      if(!WOLF_DEF.end(S)){S.phase="night";S.night++;S.wv={};S.seer=-1;S.doc=-1;S.dead=-1;S.saved=false;}else S.lastLynch=S.lynch;return true;}
    return false;},
  end(S){const w=S.roles.filter((r,i)=>r==="w"&&S.alive[i]).length,o=S.roles.filter((r,i)=>r!=="w"&&S.alive[i]).length;
    if(!w){S.win="village";S.phase="over";}else if(w>=o){S.win="wolves";S.phase="over";}return !!S.win;},
  turn:S=>-1};
const WW_CSS=`.ww{transition:background .6s}.ww-night{background:linear-gradient(#0b1030,#1a1440)!important;color:#e8e6ff}.ww-night .sv-note,.ww-night .dg-rule{color:#b9b6e6}
.ww-role{border-radius:22px;padding:20px;text-align:center;background:linear-gradient(150deg,#2a3150,#14182c);color:#fff;margin:8px 0;user-select:none;-webkit-user-select:none}
.ww-role .e{font-size:56px;line-height:1}.ww-role .t{font:800 24px system-ui;margin:6px 0}.ww-role{position:relative}.ww-role.hide .e,.ww-role.hide .t,.ww-role.hide p{visibility:hidden}.ww-role.hide::after{content:"🂠  Your role";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 20px system-ui;opacity:.75;pointer-events:none}.ww-role p{margin:6px 0 0;font-size:14px;opacity:.85}
.ww-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ww-pick button{display:flex;align-items:center;gap:8px;padding:10px;border-radius:14px;border:0;background:rgba(255,255,255,.1);color:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);font:600 15px system-ui}
.ww-pick button.on{box-shadow:inset 0 0 0 3px #ffd34d}.ww-pick button:disabled{opacity:.35}.ww-day .ww-pick button{background:var(--card);box-shadow:inset 0 0 0 1px var(--line);color:var(--ink)}
.ww-moon{font-size:64px;text-align:center;animation:wwmoon 3s ease-in-out infinite}@keyframes wwmoon{50%{transform:translateY(-6px)}}`;
function wolfView(R){dgCss();if(!document.getElementById("wwCss")){const st=document.createElement("style");st.id="wwCss";st.textContent=WW_CSS;document.head.appendChild(st);}
  const S=R.S,me=R.mySlot(),role=S.roles[me],alive=S.alive[me],night=S.phase==="night";shell("Werewolves",R.status(),false);onBack(()=>leaveAsk(R));
  SHELL.classList.toggle("ww-night",night);SHELL.classList.add("ww");
  const rc=WW_ROLES[role],nm2=k=>esc(R.players[k].name);
  const roleCard=`<div class="ww-role hide" id="wwRole"><div class="e">${rc[0]}</div><div class="t">${rc[1]}</div><p>${rc[2]}${role==="w"&&S.roles.filter(r=>r==="w").length>1?`<br>Your pack: ${S.roles.map((r,k)=>r==="w"&&k!==me?nm2(k):"").filter(x=>x).join(", ")}`:""}</p><small style="opacity:.6">Hold to see · let go to hide</small></div>`;
  const pick=(kind,sel,filter)=>`<div class="ww-pick">${R.players.map((p,k)=>!S.alive[k]||!filter(k)?"":`<button data-${kind}="${k}" class="${sel===k?"on":""}">${avatar(p.name,k)}${esc(p.name)}</button>`).join("")}</div>`;
  let h="";
  if(S.phase==="over"){h=`<div class="dg-big">${S.win==="village"?"🌞 The village wins!":"🐺 The werewolves win!"}</div>${S.lastLynch>=0?`<p class="dg-rule">${nm2(S.lastLynch)} was voted out.</p>`:""}
      <div class="dg-res">${R.players.map((p,k)=>`${WW_ROLES[S.roles[k]][0]} ${esc(p.name)}: ${WW_ROLES[S.roles[k]][1]}${S.alive[k]?"":" †"}`).join("<br>")}</div>${R.host?`<div class="gm-row2"><button class="tl-act" id="wwAgain">New game</button></div>`:""}`;
    if(wolfView.over!==R.log.length){wolfView.over=R.log.length;if((S.win==="wolves")===(role==="w"))confetti();}}
  else if(night){const sees=S.seen.filter(x=>x[0]===S.night);
    h=`<div class="ww-moon">🌙</div><div class="dg-big">Night ${S.night}</div><p class="dg-rule">Everyone closes their eyes… (keep your screen to yourself)</p>${roleCard}`;
    if(!alive)h+=`<p class="sv-note" style="text-align:center">You're out. Watch quietly.</p>`;
    else if(role==="w")h+=`<div class="tl-sec">Who do the wolves eat?</div>${pick("ww",S.wv[me],k=>S.roles[k]!=="w")}<p class="sv-note">${Object.keys(S.wv).length} of ${S.roles.filter((r,k)=>r==="w"&&S.alive[k]).length} wolves chose.</p>`;
    else if(role==="s")h+=S.seer<0?`<div class="tl-sec">Who do you look at?</div>${pick("ws",-1,k=>k!==me)}`:`<div class="dg-res">🔮 ${nm2(S.seer)} is <b>${S.roles[S.seer]==="w"?"a WEREWOLF 🐺":"not a werewolf"}</b>.</div>`;
    else if(role==="d")h+=`<div class="tl-sec">Who do you protect?</div>${pick("wd",S.doc,k=>true)}`;
    else h+=`<p class="sv-note" style="text-align:center">Sleep tight. Pretend to tap your screen so nobody can tell who's who.</p><div class="ww-pick">${R.players.map((p,k)=>S.alive[k]&&k!==me?`<button data-fake="1">${avatar(p.name,k)}${esc(p.name)}</button>`:"").join("")}</div>`;
    if(role==="s"&&S.seen.length>1)h+=`<p class="sv-note">Earlier: ${S.seen.filter(x=>x[0]<S.night).map(x=>`${nm2(x[1])} ${x[2]?"🐺":"✔"}`).join(" · ")}</p>`;
    if(R.host)h+=`<div class="gm-row2"><button class="tl-act" id="wwMorning">☀️ Morning</button></div><p class="sv-note" style="text-align:center">Wait until the wolves${S.roles.includes("s")?", the seer":""}${S.roles.includes("d")?" and the doctor":""} have chosen.</p>`;}
  else{const v=S.votes[me];
    h=`<div class="ww-moon" style="animation:none">☀️</div><div class="dg-big">Day ${S.night}</div><p class="dg-rule">${S.dead<0?"Nobody was attacked last night.":S.saved?`The wolves attacked ${nm2(S.dead)}, but the doctor saved them! 🩺`:`${nm2(S.dead)} was eaten in the night. They were the ${WW_ROLES[S.roles[S.dead]][1]}.`}</p>
      ${roleCard}${alive?`<div class="tl-sec">Talk it over, then vote who to send away</div>${pick("wv",v,k=>k!==me)}<div class="gm-row2"><button class="tl-act ghost" data-wv="255" ${v===255?"style='box-shadow:inset 0 0 0 3px var(--tc)'":""}>Nobody</button></div>`:`<p class="sv-note" style="text-align:center">You're out. Watch quietly.</p>`}
      <p class="sv-note">${S.votes.filter((x,k)=>S.alive[k]&&x>=0).length} of ${S.alive.filter(x=>x).length} voted</p>${R.host?`<div class="gm-row2"><button class="tl-act" id="wwCount">Count the votes</button></div>`:""}`;}
  EL.innerHTML=`<div class="${night?"":"ww-day"}">${h}</div>`;
  if(wolfView.ph!==S.phase+S.night){wolfView.ph=S.phase+S.night;try{navigator.vibrate&&navigator.vibrate(night?[80,80,80]:120);}catch(e){}}
  const rc2=EL.querySelector("#wwRole");if(rc2){const sh=e=>{e.preventDefault();rc2.classList.remove("hide");},hd=()=>rc2.classList.add("hide");rc2.addEventListener("pointerdown",sh);rc2.addEventListener("pointerup",hd);rc2.addEventListener("pointerleave",hd);rc2.addEventListener("pointercancel",hd);}
  const on=(sel,f)=>EL.querySelectorAll(sel).forEach(b=>b.onclick=()=>{tapv();f(b);});
  on("[data-ww]",b=>R.act([1,+b.dataset.ww]));on("[data-ws]",b=>R.act([2,+b.dataset.ws]));on("[data-wd]",b=>R.act([3,+b.dataset.wd]));on("[data-wv]",b=>R.act([4,+b.dataset.wv]));
  on("[data-fake]",b=>{EL.querySelectorAll("[data-fake]").forEach(x=>x.classList.remove("on"));b.classList.add("on");});
  const m=EL.querySelector("#wwMorning");if(m)m.onclick=()=>{tapv();R.act([5]);};const c=EL.querySelector("#wwCount");if(c)c.onclick=()=>{tapv();R.act([6]);};
  const ag=EL.querySelector("#wwAgain");if(ag)ag.onclick=()=>{tapv();R.restart([]);};}

/* ---------------- room games: lobby, inviting and joining ---------------- */
const RG={pesten:{def:PESTEN_DEF,title:"Pesten",view:(R)=>pestenView(R),opts:()=>[0,store("pt-pdrink",false)?1:0],ai:true},
  race:{def:RACE_DEF,title:"Horse race",view:R=>raceView(R),opts:()=>[],local:()=>raceSetup(),drink:true},
  kings:{def:KINGS_DEF,title:"Kingsen",view:R=>kingsView(R),opts:()=>[],local:()=>kingsStart(),drink:true},
  hl:{def:HL_DEF,title:"Higher or lower",view:R=>hlView(R),opts:()=>[],local:()=>hlStart(),drink:true},
  bus:{def:BUS_DEF,title:"The bus",view:R=>busView(R),opts:()=>[],local:()=>busSetup(),drink:true},
  faker:{def:FAKER_DEF,title:"Faker",view:R=>fakerView(R),opts:()=>[]},
  wolves:{def:WOLF_DEF,title:"Werewolves",view:R=>wolfView(R),opts:()=>[]},
  tcg:{get def(){return window.SHARDS?SHARDS.def:{min:2,max:2};},title:"Shards",view:R=>SHARDS.view(R),opts:()=>[],ai:true},
  rpg:{get def(){return window.RPG?RPG.def:{min:1,max:4};},title:"Questbook",view:R=>RPG.view(R),opts:()=>window.RPG&&RPG.opts?RPG.opts(ROOMR):[],ai:true,soloMin:0,soloLabel:["🧙 Play now","Alone or with up to 3 computer heroes"]},
  mb:{get def(){return window.MON?MON.MB_DEF:{min:2,max:2};},title:"Wildlings battle",view:R=>MON.mbView(R),opts:()=>[],back:()=>openMon()},
  mt:{get def(){return window.MON?MON.MT_DEF:{min:2,max:2};},title:"Wildlings trade",view:R=>MON.mtView(R),opts:()=>[],back:()=>openMon()}};
let ROOMR=null;
function loadJs(name,f){const sc=document.createElement("script");sc.src=location.protocol==="file:"?name:name+"?v="+(typeof APP_VERSION!=="undefined"?APP_VERSION:"");sc.onload=f;sc.onerror=()=>toastG("Couldn't load part of the games");document.head.appendChild(sc);}
// the multiplayer part (room.js) and the card battle (shards.js) load the first time they're needed
function withRoom(f){const H={EL:()=>EL,shell,onBack,leaveAsk,tapv,esc,toast:toastG,animateFrom,confetti};
  const rpg=()=>{if(window.RPG)return f();loadJs("rpg.js",()=>{RPG.init(H);f();});};
  const go=()=>{if(window.SHARDS)return rpg();window.__rng=rng;window.__shuffle=shuffle;loadJs("shards.js",()=>{SHARDS.init(H);rpg();});};
  if(window.ROOMS)return go();loadJs("room.js",go);}
function leaveRoom(){if(ROOMR){try{ROOMS.close(ROOMR);}catch(e){}ROOMR=null;}}
const AI_NAMES=["🤖 Robin","🤖 Sam","🤖 Kim","🤖 Alex","🤖 Noor","🤖 Max","🤖 Lou"];
function roomCallbacks(key){const g=RG[key];
  // the table only shows once this phone knows which seat is its own
  const safeView=R=>{if(R.mySlot()<0){shell(g.title,R.status(),false);EL.innerHTML=`<div class="gm-big">🃏</div><p class="sv-note" style="text-align:center">Getting the table ready…</p>`;return;}try{g.view(R);}catch(e){console.error(e);}};
  return {game:key,def:g.def,
    onUpdate:R=>{if(R!==ROOMR)return;if(R.started)safeView(R);else lobbyView(R,key);},
    onRoster:R=>{if(R!==ROOMR)return;if(!R.started)lobbyView(R,key);else safeView(R);},
    onLeft:p=>{if(p.host){toastG("The host left the game");leaveRoom();hub();}else toastG(`${p.name} left${g.ai?": the phone plays for them":""}`);}};}
// how do you want to play?
function roomMenu(key,extra){const g=RG[key];shell(g.title,"",false);onBack(()=>{leaveRoom();(g.back||hub)();});
  EL.innerHTML=`${g.drink?DRINK_NOTE:""}${extra||""}<div class="gm-how">
    ${g.ai?`<button data-m="solo"><b>${g.soloLabel?g.soloLabel[0]:"🤖 Against the phone"}</b><small>${g.soloLabel?g.soloLabel[1]:`1 to ${g.def.max-1} computer players`}</small></button>`:""}
    ${g.local?`<button data-m="local"><b>📱 One phone, pass it round</b><small>Everyone plays on this phone</small></button>`:""}
    <button data-m="bt"><b>📶 Host over Bluetooth</b><small>Friends next to you join with a code. No internet needed.</small></button>
    <button data-m="net"><b>🌐 Host online with your circle</b><small>Invite one or more people from your circles, wherever they are</small></button>
    <button data-m="join"><b>🔢 Join with a code</b><small>Someone nearby is hosting over Bluetooth</small></button></div>
    <p class="sv-note">Up to ${g.def.max} players. Online invites arrive as a message; they open Games to join.</p><div id="gmWhy"></div>`;
  EL.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{tapv();const m=b.dataset.m;
    if(m==="solo")return soloSetup(key);
    if(m==="local")return g.local();
    if(m==="net")return netInvite(key);
    if(!TT(t=>t.gameBt())){TT(()=>{try{window.AndroidGroup.askOfflinePerms(false);}catch(e){}});
      EL.querySelector("#gmWhy").innerHTML=`<div class="tl-why"><span>${window.AndroidTools?"Bluetooth is off or not allowed yet. Switch Bluetooth on (and allow “Nearby devices” if asked), then try again.":"Bluetooth games work in the Android app."}</span></div>`;return;}
    if(m==="bt")withRoom(()=>{ROOMR=ROOMS.host(Object.assign(roomCallbacks(key),{mode:"bt",name:MYNAME()}));if(ROOMR.error){toastG("Bluetooth didn't start: "+ROOMR.error);ROOMR=null;return;}lobbyView(ROOMR,key);});
    if(m==="join")joinCode(key);});}
function soloSetup(key){const g=RG[key],lo=g.soloMin!=null?g.soloMin:1;let n=g.soloMin===0?0:Math.min(3,g.def.max-1);const draw=()=>{shell(g.title,"",false);onBack(()=>roomMenu(key));
  EL.innerHTML=`<div class="gm-big">${key==="rpg"?(n?`You and ${n} computer hero${n>1?"es":""}`:"Just you"):`Against ${n} computer player${n>1?"s":""}`}</div><div class="gm-row2" style="justify-content:center"><button class="tl-act ghost" id="gmM" style="flex:0 0 70px">−</button><button class="tl-act ghost" id="gmP" style="flex:0 0 70px">+</button></div>
    <div class="gm-row2"><button class="tl-act" id="gmGo">Start</button></div>`;
  EL.querySelector("#gmM").onclick=()=>{n=Math.max(lo,n-1);draw();};EL.querySelector("#gmP").onclick=()=>{n=Math.min(g.def.max-1,n+1);draw();};
  EL.querySelector("#gmGo").onclick=()=>{tapv();withRoom(()=>{ROOMR=ROOMS.host(Object.assign(roomCallbacks(key),{mode:"solo",name:MYNAME(),ai:AI_NAMES.slice(0,n)}));ROOMR.restart(g.opts());});};};draw();}
function netInvite(key){const g=RG[key],GS=(typeof gGroups==="function"?gGroups():[]);
  if(typeof isOffline==="function"&&isOffline()){toastG("📴 You're offline: online games need internet. Bluetooth works without.");return;}
  shell(g.title+": invite","",false);onBack(()=>roomMenu(key));
  const rows=GS.map(G=>({G,m:Object.entries(G.members||{}).filter(([id,m])=>id!==G.me.id&&m&&m.name)})).filter(x=>x.m.length);
  if(!rows.length){EL.innerHTML=`<p class="sv-note">Nobody in your circles yet. Make or join a circle on the Group tab first.</p>`;return;}
  EL.innerHTML=rows.map((r,gi)=>`<div class="tl-sec">${esc(r.G.name)}</div><div class="gm-sel">${r.m.map(([id,m])=>`<label><input type="checkbox" data-gi="${gi}" value="${esc(id)}" checked> ${esc(m.name)}</label>`).join("")}</div>`).join("")+
    `<p class="sv-note">Everyone you tick gets an invite. Pick people from one circle per game.</p><div class="gm-row2"><button class="tl-act" id="gmGo">Send invites</button></div>`;
  EL.querySelector("#gmGo").onclick=()=>{const ch=[...EL.querySelectorAll("input:checked")];if(!ch.length)return;const gi=+ch[0].dataset.gi,to=ch.filter(x=>+x.dataset.gi===gi).map(x=>x.value).slice(0,g.def.max-1);tapv();
    withRoom(()=>{ROOMR=ROOMS.host(Object.assign(roomCallbacks(key),{mode:"net",name:rows[gi].G.me.name||MYNAME(),G:rows[gi].G,to}));lobbyView(ROOMR,key);});};}
function joinCode(key){const g=RG[key];shell(g.title+": join","",false);onBack(()=>{leaveRoom();roomMenu(key);});
  EL.innerHTML=`<div class="tl-check"><div class="tl-add"><input id="gmCode" inputmode="numeric" maxlength="4" placeholder="4-digit code"><button id="gmGo" aria-label="Join">→</button></div></div><p class="sv-note" id="gmLob">Keep the phones within a few metres while you join.</p>`;
  const go=()=>{const c=EL.querySelector("#gmCode").value.trim();if(!/^\d{4}$/.test(c))return;tapv();
    withRoom(()=>{ROOMR=ROOMS.joinBt(Object.assign(roomCallbacks(key),{code:c,name:MYNAME()}));if(ROOMR.error){toastG("Bluetooth didn't start: "+ROOMR.error);ROOMR=null;return;}lobbyView(ROOMR,key);});};
  EL.querySelector("#gmGo").onclick=go;EL.querySelector("#gmCode").onkeydown=e=>{if(e.key==="Enter")go();};}
function joinRoomNet(key,G,sid,hostId){ROOMR=ROOMS.joinNet(Object.assign(roomCallbacks(key),{G,sid,hostId}));lobbyView(ROOMR,key);}
function lobbyView(R,key){const g=RG[key];shell(g.title,R.status(),false);onBack(()=>{leaveRoom();(g.back||hub)();});
  const me=R.mySlot(),n=R.players.length;
  EL.innerHTML=`${R.code&&R.host?`<div class="sv-note" style="text-align:center">Code for your friends</div><div class="gm-code">${R.code}</div><p class="sv-note" style="text-align:center">They choose ${g.title} → Join with a code.</p>`:""}
    ${!R.host?`<div class="gm-big">${me<0?"Joining…":"You're in!"}</div><p class="sv-note" style="text-align:center">${me<0?"Looking for the host's phone. Keep close.":"Waiting for the host to start."}</p>`:""}
    <div class="tl-sec">Players (${n}/${g.def.max})</div><div class="gm-lobby">${R.players.map((p,k)=>`<div class="gm-pl">${avatar(p.name,k)}<b>${esc(p.name)}</b>${k===0?"<small>host</small>":p.id===R.me?"<small>you</small>":""}</div>`).join("")}</div>
    ${R.host?`${g.ai?`<div class="gm-row2"><button class="tl-act ghost" id="gmAddAi" ${n>=g.def.max?"disabled":""}>+ Computer player</button><button class="tl-act ghost" id="gmDropAi" ${R.players.some(p=>p.ai)?"":"disabled"}>− Computer</button></div>`:""}
      ${R.mode==="net"&&R.tr.to&&R.tr.to.some(id=>R.slotOf(id)<0)?`<div class="gm-row2"><button class="tl-act ghost" id="gmReInv">Invite again</button></div>`:""}
      <div class="gm-row2"><button class="tl-act" id="gmStart" ${n>=g.def.min?"":"disabled"}>Start with ${n} player${n===1?"":"s"}</button></div>`:""}`;
  const ri=EL.querySelector("#gmReInv");if(ri)ri.onclick=()=>{tapv();R.tr.reinvite();toastG("Invite sent again");};
  const a=EL.querySelector("#gmAddAi");if(a)a.onclick=()=>{tapv();ROOMS.addAi(R,AI_NAMES[R.players.filter(p=>p.ai).length%AI_NAMES.length]);};
  const d=EL.querySelector("#gmDropAi");if(d)d.onclick=()=>{tapv();ROOMS.dropAi(R);};
  const st=EL.querySelector("#gmStart");if(st)st.onclick=()=>{tapv();R.restart(g.opts());};
  clearInterval(lobbyView.t);lobbyView.t=setInterval(()=>{if(R!==ROOMR||R.started){clearInterval(lobbyView.t);return;}setStatus(R.status());},1000);}

/* ---------------- the Pesten table ---------------- */
let PV={};   // what was on screen last time, for the animations
function pestenView(R){const S=R.S;if(!S)return;const me0=R.mySlot();if(me0>=S.n)return;const me=Math.max(0,me0),n=S.n,mine=S.turn===me&&S.win<0&&!R.pending,top=S.pile[S.pile.length-1];
  if(R.def!==PESTEN_DEF)return;
  const prev=PV.R===R&&PV.seed===S.seed?PV:null;const fresh=!prev||prev.logLen>R.log.length;
  // where things are before we redraw, so cards can fly from there
  const rect=sel=>{const e=EL.querySelector(sel);return e?e.getBoundingClientRect():null;};
  const before={deck:rect("#ptDeck"),hand:rect("#ptHand"),seats:[...EL.querySelectorAll("[data-seat]")].reduce((o,e)=>{o[e.dataset.seat]=e.getBoundingClientRect();return o;},{}),picked:PV.picked};
  shell("Pesten",R.status(),true);onBack(()=>{if(S.win>=0||R.mode==="solo"||Date.now()-(PV.leaveAsk||0)<3000){leaveRoom();hub();return;}PV.leaveAsk=Date.now();toastG("Tap ‹ again to leave the game");});
  const order=[];for(let k=1;k<n;k++)order.push((me+k)%n);
  let msg="",sub=S.log||"";
  if(S.win>=0)msg=S.win===me?"🎉 You win!":`${esc(S.names[S.win])} wins`;
  else if(R.pending)msg="Sending your move…";
  else if(mine)msg=S.pend?`Play a ${S.pk===2?"2 or ":""}Joker, or draw ${S.pend}`:S.drew>=0?"You drew a card you can play: play it or pass":"Your turn";
  else msg=`${esc(S.names[S.turn])}'s turn…`;
  if(S.win>=0&&S.drink)sub="🍺 "+S.hands.map((h,i)=>i===S.win?"":`${esc(S.names[i])} drinks ${Math.min(5,h.length)}`).filter(x=>x).join(" · ");
  const hand=S.hands[me].slice().sort((a,b)=>(isJk(a)?99:cS(a)*13+cR(a))-(isJk(b)?99:cS(b)*13+cR(b)));
  const ov=hand.length>10?-34:hand.length>7?-24:-14;
  const under=S.pile.slice(-3,-1);
  EL.innerHTML=`<div class="pt-seats">${order.map(k=>`<div class="pt-seat ${S.turn===k&&S.win<0?"on":""}" data-seat="${k}">${avatar(S.names[k],k)}<small>${esc(S.names[k])}</small><div class="fan">${"<i></i>".repeat(Math.min(8,S.hands[k].length))}</div><span class="n">${S.hands[k].length}</span></div>`).join("")}</div>
    <div class="pt-table">${n>2?`<span class="pt-dir">${S.dir>0?"↻":"↺"}</span>`:""}${S.pend?`<span class="pt-badge">+${S.pend}</span>`:""}
      <button class="pt-deck" id="ptDeck" aria-label="Draw a card" ${mine&&!S.pend&&S.drew<0?"":"disabled"}>${cardH(-1)}${cardH(-1)}${cardH(-1)}</button>
      <div class="pt-pile" id="ptPile">${under.map((c,k)=>`<span style="position:absolute;inset:0;transform:rotate(${(k?-7:9)}deg)">${cardH(c)}</span>`).join("")}<span id="ptTop" style="position:absolute;inset:0">${cardH(top)}</span></div>
      ${S.suit!=null?`<span class="pt-suit" style="color:${S.suit===1||S.suit===2?"#c62828":"#111"}">${SUIT[S.suit]}</span>`:""}</div>
    <div class="pt-msg ${mine?"":""}">${msg}</div><div class="pt-sub">${esc(sub)}</div>
    ${PV.pick!=null&&mine?`<div class="gm-suits">${SUIT.map((s,i)=>`<button data-su="${i}" style="color:${i===1||i===2?"#c62828":"#111"}">${s}</button>`).join("")}</div>`:""}
    <div class="pt-hand" id="ptHand" style="--ov:${ov}px">${hand.map(c=>{const ok=mine&&PV.pick==null&&PESTEN_DEF.check(S,me,[1,c]);return `<button class="gc ${isJk(c)?"jk":cS(c)===1||cS(c)===2?"r":""} ${mine?ok?"ok":"no":""}" data-c="${c}">${isJk(c)?"JOKER<i>★</i>":RANKS[cR(c)]+"<i>"+SUIT[cS(c)]+"</i>"}</button>`;}).join("")}</div>
    <div class="pt-btns">${mine&&S.pend?`<button class="tl-act" id="ptTake">Draw ${S.pend}</button>`:""}${mine&&S.drew>=0?`<button class="tl-act ghost" id="ptPass">Pass</button>`:""}
      ${S.win>=0?(R.host?`<button class="tl-act" id="ptAgain">Play again</button>`:`<span class="sv-note" style="flex:1;text-align:center">Waiting for ${esc(R.players[0].name)} to start the next game…</span>`):""}</div>`;
  // animations: the card that was just played, cards drawn, the deal
  if(prev&&!fresh){if(S.pile.length>prev.pile||(S.pile.length!==prev.pile&&top!==prev.top)){const who=S.lastP,from=who===me?(before.picked||before.hand):before.seats[who];animateFrom(EL.querySelector("#ptTop .gc"),from,420);}
    const newMine=S.hands[me].filter(c=>!prev.mine.includes(c));if(newMine.length&&before.deck)newMine.forEach((c,k)=>animateFrom(EL.querySelector(`#ptHand [data-c="${c}"]`),before.deck,420,k*90));
    order.forEach(k=>{const d=S.hands[k].length-prev.counts[k];if(d>0&&before.deck&&before.seats[k])for(let x=0;x<Math.min(d,6);x++)fly(cardH(-1),before.deck,before.seats[k],420,x*90);});}
  else if(fresh)[...EL.querySelectorAll("#ptHand .gc")].forEach((e,k)=>animateFrom(e,rect("#ptDeck"),460,k*70));
  if(S.win>=0&&(!prev||prev.win<0)){if(S.win===me)confetti();try{navigator.vibrate&&navigator.vibrate(S.win===me?[60,60,60]:90);}catch(e){}}
  PV={leaveAsk:PV.leaveAsk,R,seed:S.seed,logLen:R.log.length,pile:S.pile.length,top,mine:S.hands[me].slice(),counts:S.hands.map(h=>h.length),win:S.win,pick:PV.R===R?PV.pick:null,picked:null};
  // input
  const act=a=>{PV.pick=null;R.act(a);};
  const dk=EL.querySelector("#ptDeck");if(dk)dk.onclick=()=>{if(!mine)return;tapv();act([2,0,0]);};
  const tk=EL.querySelector("#ptTake");if(tk)tk.onclick=()=>{tapv();act([2,0,0]);};
  const ps=EL.querySelector("#ptPass");if(ps)ps.onclick=()=>{tapv();act([3,0,0]);};
  EL.querySelectorAll("#ptHand [data-c]").forEach(b=>b.onclick=()=>{const c=+b.dataset.c;if(!mine||!PESTEN_DEF.check(S,me,[1,c]))return;tapv();PV.picked=b.getBoundingClientRect();
    if(!isJk(c)&&cR(c)===11&&S.hands[me].length>1){PV.pick=c;pestenView(R);return;}act([1,c,0]);});
  EL.querySelectorAll("[data-su]").forEach(b=>b.onclick=()=>{tapv();const c=PV.pick;act([1,c,+b.dataset.su]);});
  const ag=EL.querySelector("#ptAgain");if(ag)ag.onclick=()=>{tapv();const o=RG.pesten.opts();o[0]=(S.win+1)%n;R.restart(o);};
  clearInterval(pestenView.t);pestenView.t=setInterval(()=>{if(R!==ROOMR){clearInterval(pestenView.t);return;}setStatus(R.status());},2000);}

function pestenMenu(){const drink=store("pt-pdrink",false);
  roomMenu("pesten",`<label class="gm-drink" style="display:flex;gap:10px;align-items:center;margin-top:0"><input type="checkbox" id="gmDrink" ${drink?"checked":""}> <span>🍺 Drinking rules: a sip for every card you have to draw from a 2 or Joker, and the losers drink one sip per card left in their hand (max 5).</span></label>
    <p class="sv-note">2: next draws 2 · Joker: next draws 5 (both stack) · 7: play again · 8: next skips · Ace: reverse · Jack: wild, pick the suit. No card to play: draw one.</p>`);
  EL.querySelector("#gmDrink").onchange=e=>save("pt-pdrink",e.target.checked);}

/* ================= players list for the drinking games (one phone, pass it round) ================= */
function playersBox(id){const P=store("pt-gplayers",[]);
  return `<div class="tl-sec">Players</div><div class="gm-names" id="${id}">${P.map((n,i)=>`<span>${esc(n)}<button data-gprm="${i}" aria-label="Remove">✕</button></span>`).join("")||`<span style="opacity:.7">Add everyone who plays</span>`}</div>
  <div class="tl-check"><div class="tl-add"><input id="${id}In" maxlength="14" placeholder="Name"><button id="${id}Add" aria-label="Add">+</button></div></div>`;}
function wirePlayers(id,redraw){const add=()=>{const i=EL.querySelector("#"+id+"In"),v=i.value.trim();if(!v)return;const P=store("pt-gplayers",[]);if(P.length>=10)return;P.push(v);save("pt-gplayers",P);redraw();setTimeout(()=>{const x=EL.querySelector("#"+id+"In");if(x)x.focus();},0);};
  EL.querySelector("#"+id+"Add").onclick=add;EL.querySelector("#"+id+"In").onkeydown=e=>{if(e.key==="Enter")add();};
  EL.querySelectorAll("#"+id+" [data-gprm]").forEach(b=>b.onclick=()=>{const P=store("pt-gplayers",[]);P.splice(+b.dataset.gprm,1);save("pt-gplayers",P);redraw();});}


/* ---------------- the race track: one board for both the one-phone and the every-phone race. It stays on screen and
   only changes what moved, so the horses gallop to their new place. ---------------- */
const RC_CSS=`.rcb{margin:4px 0 8px}.rcb-side{display:grid;grid-template-columns:30px repeat(8,1fr);gap:3px;margin-bottom:6px;perspective:400px}
.rcb-side .slot{display:flex;justify-content:center}.rcb-side .gc{width:30px;height:44px;font-size:11px;border-radius:5px}.rcb-side .gc i{font-size:13px}
.rcb-track{border-radius:22px;padding:10px 8px;background:radial-gradient(ellipse at 50% 30%,#3b8f5d,#1f5a39 70%,#174a2e);box-shadow:inset 0 0 0 5px rgba(0,0,0,.18),inset 0 8px 30px rgba(0,0,0,.35)}
.rcb-lane{display:grid;grid-template-columns:30px 1fr;align-items:center;margin:5px 0}.rcb-lane>b{font-size:22px;text-align:center;filter:drop-shadow(0 1px 1px rgba(0,0,0,.4))}
.rcb-run{position:relative;height:54px;border-radius:10px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 calc(12.5% - 3px),transparent calc(12.5% - 3px) 12.5%)}
.rcb-run::after{content:"";position:absolute;right:0;top:0;bottom:0;width:12.5%;border-radius:0 10px 10px 0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.35) 0 5px,rgba(0,0,0,.25) 5px 10px)}
.rcb-h{position:absolute;top:5px;width:12.5%;display:flex;justify-content:center;transition:left .65s cubic-bezier(.3,1.35,.5,1);z-index:1}
.rcb-h .gc{width:31px;height:44px;font-size:11px;border-radius:5px;box-shadow:0 3px 6px rgba(0,0,0,.4)}.rcb-h .gc i{font-size:14px}
.rcb-h.hop .gc{animation:rchop .65s}@keyframes rchop{25%{transform:translateY(-14px) rotate(-8deg)}55%{transform:translateY(0) rotate(4deg)}75%{transform:translateY(-5px)}}
.rcb-h.back .gc{animation:rcback .7s}@keyframes rcback{0%,100%{transform:none}20%,60%{transform:translateX(-5px) rotate(-6deg);box-shadow:0 0 0 3px #ff4d4d}40%,80%{transform:translateX(5px) rotate(6deg)}}
.rcb-h.win .gc{animation:rcwin 1s infinite;box-shadow:0 0 0 3px #ffd34d,0 0 18px #ffd34d}@keyframes rcwin{50%{transform:scale(1.18)}}
.rcb-draw{display:flex;align-items:center;justify-content:center;gap:16px;margin:10px 0 4px;perspective:500px}
.rcb-draw .deck .gc,.rcb-draw .cur .gc{width:62px;height:88px;font-size:20px;border-radius:9px}.rcb-draw .cur .gc i{font-size:24px}
.rcb-draw .cur .gc.deal{animation:rcdeal .5s cubic-bezier(.2,.8,.2,1)}@keyframes rcdeal{from{transform:translateX(-80px) rotateY(180deg) scale(.8);opacity:.4}to{transform:none;opacity:1}}
.flipin{animation:flipin .5s cubic-bezier(.2,.8,.2,1)}@keyframes flipin{from{transform:rotateY(90deg) scale(.9)}to{transform:none}}
.rcb-msg{text-align:center;font:600 15px system-ui;min-height:22px}`;
function rcCss(){if(document.getElementById("rcCss"))return;const st=document.createElement("style");st.id="rcCss";st.textContent=RC_CSS;document.head.appendChild(st);}
// pos: 4 horse positions (0..7+), side: 6 cards, flip: which side cards are turned, last: the card just drawn (or null), win: winning suit or -1
function rcBoard(host,S,key){rcCss();let b=host.querySelector(".rcb");
  if(!b||b.dataset.key!==String(key)){host.innerHTML=`<div class="rcb" data-key="${key}">
      <div class="rcb-side"><span></span>${S.side.map((c,i)=>`<span class="slot" data-sd="${i}">${S.flip[i]?cardH(c):cardH(-1)}</span>`).join("")}<span></span><span></span></div>
      <div class="rcb-track">${[0,1,2,3].map(s=>`<div class="rcb-lane"><b style="color:${s===1||s===2?"#ff6b6b":"#fff"}">${SUIT[s]}</b><div class="rcb-run"><span class="rcb-h" data-h="${s}" style="left:${Math.min(S.pos[s],7)*12.5}%">${cardH(s*13)}</span></div></div>`).join("")}</div>
      <div class="rcb-draw"><span class="deck">${cardH(-1)}</span><span class="cur">${S.last!=null?cardH(S.last):`<span class="gc" style="opacity:.25;width:62px;height:88px"></span>`}</span></div><div class="rcb-msg"></div></div>`;
    b=host.querySelector(".rcb");b._pos=S.pos.slice();b._flip=S.flip.slice();b._last=S.last;b._win=S.win;return b;}
  // something changed: move horses, turn side cards, deal the new card
  if(S.last!==b._last&&S.last!=null){const cur=b.querySelector(".cur");cur.innerHTML=cardH(S.last,"deal");}
  [0,1,2,3].forEach(s=>{const h=b.querySelector(`[data-h="${s}"]`),was=b._pos[s],now=S.pos[s];if(was===now)return;
    const go=()=>{h.style.left=Math.min(now,7)*12.5+"%";h.classList.remove("hop","back");void h.offsetWidth;h.classList.add(now>was?"hop":"back");};
    // a horse that's sent back waits until its side card has turned
    if(now<was)setTimeout(go,450);else setTimeout(go,180);});
  S.flip.forEach((f,i)=>{if(f&&!b._flip[i]){const sl=b.querySelector(`[data-sd="${i}"]`);setTimeout(()=>{sl.innerHTML=cardH(S.side[i],"flipin");},300);}});
  if(S.win>=0&&b._win<0)setTimeout(()=>{const h=b.querySelector(`[data-h="${S.win}"]`);if(h)h.classList.add("win");},700);
  b._pos=S.pos.slice();b._flip=S.flip.slice();b._last=S.last;b._win=S.win;return b;}

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
function raceRun(bets){const R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1),R);
  const S={side:deck.splice(0,6),pos:[0,0,0,0],flip:[0,0,0,0,0,0],last:null,win:-1},key=Date.now();let msg="Tap “Next card” to start the race";
  const step=()=>{if(S.win>=0)return;if(!deck.length)deck=shuffle([...Array(52).keys()].filter(c=>cR(c)!==1&&!S.side.includes(c)),R);
    const c=deck.pop();S.last=c;S.pos[cS(c)]++;msg=`${cName(c)}: the ${SUIT[cS(c)]} horse moves on`;
    if(S.pos[cS(c)]>6){S.win=cS(c);clearInterval(AUTO);AUTO=0;}
    else for(let k=0;k<6;k++)if(!S.flip[k]&&Math.min(...S.pos)>k){S.flip[k]=1;const s=cS(S.side[k]);S.pos[s]=Math.max(0,S.pos[s]-1);msg+=` · ${cName(S.side[k])} turns: ${SUIT[s]} goes back!`;}
    draw();};
  backRow();shell("Horse race","",false);EL.innerHTML=`<div id="rcHost"></div><div id="rcBelow"></div>`;
  const draw=()=>{rcBoard(EL.querySelector("#rcHost"),S,key).querySelector(".rcb-msg").textContent=S.win>=0?`🏆 The ${SUIT[S.win]} horse wins!`:msg;
    const res=S.win>=0?bets.map(b=>b.s===S.win?`<b>${esc(b.n)}</b> hands out ${b.amt*2}`:`${esc(b.n)} drinks ${b.amt}`).join("<br>"):"";
    EL.querySelector("#rcBelow").innerHTML=`${res?`<div class="gm-sub" style="text-align:left;line-height:1.6">${res}</div>`:`<div class="gm-names" style="justify-content:center">${bets.map(b=>`<span>${esc(b.n)} ${SUIT[b.s]} ${b.amt}🍺</span>`).join("")}</div>`}
      <div class="gm-row2">${S.win<0?`<button class="tl-act" id="gmNext">Next card</button><button class="tl-act ghost" id="gmAuto">${AUTO?"⏸ Pause":"▶ Auto"}</button>`:`<button class="tl-act" id="gmAgain">New race</button>`}</div>`;
    if(S.win>=0&&!draw.c){draw.c=1;setTimeout(confetti,800);}
    wireBack(()=>{clearInterval(AUTO);AUTO=0;});const n=EL.querySelector("#gmNext");if(n)n.onclick=()=>{tapv();step();};
    const a=EL.querySelector("#gmAuto");if(a)a.onclick=()=>{tapv();if(AUTO){clearInterval(AUTO);AUTO=0;draw();}else{AUTO=setInterval(()=>{if(!EL.isConnected||!EL.querySelector("#rcHost")){clearInterval(AUTO);AUTO=0;return;}step();},1400);draw();}};
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
function kingsRun(P){rcCss();const deck=shuffle([...Array(52).keys()],rng(Date.now()&0xffffffff));let cur=null,kings=0,turn=-1;
  const draw=()=>{const r=cur!=null?KRULES[cR(cur)]:null,who=P.length&&turn>=0?P[turn%P.length]:"";
    EL.innerHTML=backRow()+`<div class="gm-title">👑 Kingsen</div><div class="gm-table" style="perspective:500px">${cardH(cur==null?-1:cur,"big"+(cur!=null?" flipin":""))}</div>
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
function hlRun(P){rcCss();const R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()],R),row=[deck.pop()],who=0,msg="";
  const next=g=>{if(!deck.length)deck=shuffle([...Array(52).keys()].filter(c=>!row.includes(c)),R);const prev=row[row.length-1],c=deck.pop();row.push(c);
    const ok=g>0?cR(c)>cR(prev):cR(c)<cR(prev);
    if(!ok){const n=row.length-1;msg=`❌ ${cName(c)}. ${P.length?esc(P[who%P.length])+" drinks":"Drink"} ${n} sip${n>1?"s":""}`;if(navigator.vibrate)try{navigator.vibrate(120);}catch(e){}row=[c];}
    else msg=`✅ ${cName(c)}: right! ${row.length-1} in a row`;draw();};
  const draw=()=>{const name=P.length?P[who%P.length]:"";
    EL.innerHTML=backRow()+`<div class="gm-title">↕️ Higher or lower</div>${name?`<div class="gm-sub"><b>${esc(name)}</b>'s turn</div>`:""}
      <div class="gm-table" style="perspective:500px">${cardH(row[row.length-1],"big"+(row.length>1||msg?" flipin":""))}</div><div class="gm-status over" style="text-align:center">${msg||"Higher or lower?"}</div>
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
function busRun(P){rcCss();const R=rng(Date.now()&0xffffffff);let deck=shuffle([...Array(52).keys()],R);const hands=P.map(()=>[]);
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
        <div class="gm-hand">${hands[pl].map(c=>cardH(c,"mid")).join("")}${reveal!=null?cardH(reveal,"mid flipin"):""}</div>
        <div class="gm-status over" style="text-align:center">${msg}</div>
        ${reveal==null?`<div class="gm-row2" style="flex-wrap:wrap">${q[1].map(([k,l])=>`<button class="tl-act" data-a="${k}" style="${round===3&&(k==="1"||k==="2")?"color:#ffd0d0":""}">${l}</button>`).join("")}</div>`:`<div class="gm-row2"><button class="tl-act" id="gmOn">${pl+1<P.length?`Next: ${esc(P[pl+1])}`:round<3?"Next round":"On to the pyramid"}</button></div>`}`;}
    else if(phase===2){const rows=[[0,1,2,3],[4,5,6],[7,8],[9]].reverse();
      h=`<div class="gm-big">The pyramid</div><div class="gm-pyr">${rows.map(r=>`<div>${r.map(i=>cardH(i<pi?pyr[i]:-1,"mid"+(i===pi-1?" flipin":""))).join("")}</div>`).join("")}</div>
        <div class="gm-status over" style="text-align:center">${msg||"Turn the cards one by one. Row 1 = 1 sip, top = 4 sips."}</div>
        <div class="gm-row2">${pi<10?`<button class="tl-act" id="gmFlip">Turn a card (${pRow(pi)} sip${pRow(pi)>1?"s":""})</button>`:`<button class="tl-act" id="gmBus">Who takes the bus?</button>`}</div>
        <details class="gm-drink"><summary>Cards in hand</summary>${P.map((n,i)=>`<div><b>${esc(n)}</b> ${hands[i].map(cName).join(" ")||"none"}</div>`).join("")}</details>`;}
    else{h=`<div class="gm-big">🚌 ${esc(P[rider])} takes the bus</div><div class="gm-sub">${bi>=bus.length-1?"":"Higher or lower than the last card?"}</div>
        <div class="gm-hand">${bus.map((c,i)=>cardH(i<=bi?c:-1,"mid"+(i===bi&&bi>0?" flipin":""))).join("")}</div><div class="gm-status over" style="text-align:center">${msg}</div>
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
  sc.onload=()=>{try{MON.init({EL:()=>EL,SHELL:()=>SHELL,shell,onBack,leaveAsk,leaveRoom,confetti,stopAll,hub,esc,tapv,rng,shuffle,store,save,toast:toastG,MYNAME,
    roomMenu:k=>withRoom(()=>roomMenu(k)),
    inviteRoom:(k,G,to)=>{if(typeof isOffline==="function"&&isOffline()){toastG("📴 You're offline: use Bluetooth from Team → Battle a friend");return openMon();}withRoom(()=>{ROOMR=ROOMS.host(Object.assign(roomCallbacks(k),{mode:"net",name:G.me.name||MYNAME(),G,to}));lobbyView(ROOMR,k);});}});f();}catch(e){EL.innerHTML=`<p class="sv-note">Wildlings couldn't start: ${esc(e.message)}</p>`;}};
  sc.onerror=()=>{EL.innerHTML=backRow()+`<p class="sv-note">Wildlings couldn't load.</p>`;wireBack();};document.head.appendChild(sc);}
function openMon(){withMon(()=>MON.home());}

window.GAMES={run(el,tool){addCss();EL=makeShell(el);T=tool;try{const hd=document.querySelector("#tlOv .tl-head");if(hd)hd.hidden=true;}catch(e){}tool.stops.push(()=>{stopAll();HUB_REDRAW=null;});hub();},
  open(sub){if(sub==="mon")openMon();},withMon,EL:()=>EL,_room:()=>ROOMR};
})();
