/* Rooms: 2 to 8 phones playing one game together, over Bluetooth (no internet, no pairing) or online through your circle.
   One phone hosts. Every move becomes an entry in one shared list ("the log"); every phone builds the game from that same
   list, so they can't drift apart. A phone that misses something asks again (online) or simply picks it up the next time
   the host's broadcast comes round (Bluetooth). If someone leaves mid-game, the host's phone plays for them. */
(function(){
const TT=f=>{try{const t=window.AndroidTools;return t?f(t):undefined;}catch(e){}};
const h2=n=>(n&255).toString(16).padStart(2,"0");
const hexb=h=>(h.match(/../g)||[]).map(x=>parseInt(x,16));
const u8=s=>[...new TextEncoder().encode(String(s||""))];
const fromU8=a=>{try{return new TextDecoder().decode(new Uint8Array(a));}catch(e){return "";}};
const trimU8=(s,n)=>{let b=u8(s);while(b.length>n){s=s.slice(0,-1);b=u8(s);}return b;};
const rid=()=>Math.floor(Math.random()*0xfff0+1).toString(16).padStart(4,"0");

/* ---------------- the room itself: same on every phone ---------------- */
function Room(o){Object.assign(this,{game:o.game,def:o.def,mode:o.mode,host:!!o.host,me:o.me,players:[],log:[],S:null,started:false,over:false,
  onUpdate:o.onUpdate||(()=>{}),onRoster:o.onRoster||(()=>{}),onLeft:o.onLeft||(()=>{}),pending:null,net:null,aiT:0,closed:false,lastHeard:Date.now()});}
Room.prototype.syncNames=function(){if(this.S&&Array.isArray(this.S.names))this.players.forEach((p,k)=>{if(p&&p.name&&p.name!=="…"&&k<this.S.names.length)this.S.names[k]=p.name;});};
Room.prototype.slotOf=function(id){return this.players.findIndex(p=>p.id===id);};
Room.prototype.mySlot=function(){return this.slotOf(this.me);};
// apply one entry from the log. 255 = (re)start: seed + number of players + game options
Room.prototype._apply=function(e){
  if(e[0]===255){const seed=((e[1]<<24)|(e[2]<<16)|(e[3]<<8)|e[4])>>>0,n=e[5],pl=[];for(let i=0;i<n;i++)pl.push(this.players[i]||{id:"----",name:"…"});   // always the number of seats in the start entry
    while(this.players.length<n)this.players.push({id:"----",name:"…"});this.S=this.def.init(pl,seed,e.slice(6));this.started=true;this.over=false;return true;}
  if(!this.S)return false;return !!this.def.apply(this.S,e[0],e.slice(1));};
// host: try a move, and if it's allowed, add it to the log for everyone
Room.prototype._append=function(e){if(!this.host)return false;
  if(e[0]!==255){const test=this.def.check?this.def.check(this.S,e[0],e.slice(1)):true;if(!test)return false;}
  if(!this._apply(e))return false;this.log.push(e);this.tr.published(this.log.length-1);this._after();return true;};
Room.prototype._after=function(){try{this.onUpdate(this);}catch(x){console.error(x);}this._ai();};
// the host's phone plays for computer players and for anyone who left
Room.prototype._ai=function(){if(!this.host||!this.S||this.closed)return;clearTimeout(this.aiT);const t=this.def.turn(this.S);if(t<0||t>=this.players.length||!this.players[t].ai)return;
  this.aiT=setTimeout(()=>{if(this.closed||!this.S)return;const t2=this.def.turn(this.S);if(t2!==t)return;const a=this.def.ai(this.S,t);if(a)this._append([t,...a]);},this.def.aiDelay||900);};
// your own move
Room.prototype.act=function(a){const s=this.mySlot();if(s<0||!this.S)return false;
  if(this.host)return this._append([s,...a]);
  if(this.def.check&&!this.def.check(this.S,s,a))return false;
  this.qn=((this.qn||0)%250)+1;this.pending={q:this.qn,a,at:Date.now()};/* every move gets the next number, so the host never mistakes it for an old one */this.tr.propose(this.pending);this.onUpdate(this);return true;};
Room.prototype.restart=function(opts){if(!this.host)return;const seed=(Math.random()*4294967295)>>>0;this._append([255,seed>>>24&255,seed>>>16&255,seed>>>8&255,seed&255,this.players.length,...(opts||[])]);};
// a client receives log entry i
Room.prototype._got=function(i,e){this.lastHeard=Date.now();if(i!==this.log.length)return i>this.log.length;   // true = there's a gap
  this.log.push(e);this._apply(e);if(this.pending&&e[0]===this.mySlot())this.pending=null;this._after();return false;};
Room.prototype.status=function(){return this.tr?this.tr.status():"";};
Room.prototype.leave=function(){if(this.closed)return;this.closed=true;clearTimeout(this.aiT);try{this.tr.close();}catch(e){}};
// host: someone left: their seat becomes a computer player so the game can go on
Room.prototype._left=function(id){const s=this.slotOf(id);if(s<0)return;const p=this.players[s];if(p.ai)return;
  if(!this.started){this.players.splice(s,1);}else{p.ai=true;p.left=true;}this.tr.roster&&this.tr.roster();this.onRoster(this);this.onLeft(p);this._ai();};

/* ---------------- Bluetooth: every phone keeps broadcasting a tiny packet; the host's packets take turns ---------------- */
/* packet = "4f42" room(2) me(2) then:
   host:   1 L(2) i(2) entry(<=13)  one log entry, plus how long the log is
           2 n slot id(2) flags name(<=12)  one seat of the roster   (flags: 1 started, 2 computer)
           4 id(2) q                 "I handled your move q"
   others: 5 name(<=17)              "let me in"
           3 have(2) q move(<=14)    "I have this many entries; here's my move q" */
function BTTr(room,code){this.room=room;this.code=code;this.rh=(+code).toString(16).padStart(4,"0");this.peers={};this.rot=[];this.ri=0;this.timer=0;this.tx=0;this.lastSend="";this.hostSeen=0;}
BTTr.prototype.start=function(){const st=String(TT(t=>t.gameListen(this.rh))||"no bluetooth");if(st!=="ok")return st;
  this.timer=setInterval(()=>this.tick(),150);this.tx=setInterval(()=>this.send(),220);return "ok";};
BTTr.prototype.adv=function(bytes){const hx="4f42"+this.rh+this.room.me+bytes.map(h2).join("");if(hx===this.lastSend)return;this.lastSend=hx;TT(t=>t.gameSend(hx.slice(0,48)));};
BTTr.prototype.send=function(){const R=this.room;
  if(!R.host){const s=R.mySlot();if(s<0){this.adv([5,...trimU8(R.myName,17)]);return;}
    const p=R.pending;this.adv([3,R.log.length>>8,R.log.length&255,p?p.q:(this.lastQ||0),...(p?p.a:[]).slice(0,14)]);if(p)this.lastQ=p.q;return;}
  // host: build the next round of packets once the last one is through
  if(this.ri>=this.rot.length){this.rot=[];this.ri=0;const L=R.log.length,peers=Object.values(this.peers);
    if(!this.round||this.round%3===0)R.players.forEach((p,k)=>this.rot.push([2,R.players.length,k,parseInt(p.id.slice(0,2),16),parseInt(p.id.slice(2,4),16),(R.started?1:0)|(p.ai?2:0),...trimU8(p.name,12)]));
    this.round=(this.round||0)+1;
    const need=[...new Set(peers.filter(c=>c.slot>=0&&c.have<L).map(c=>c.have))].sort((a,b)=>a-b).slice(0,4);
    for(const i of need)for(let k=i;k<Math.min(L,i+3);k++)this.rot.push([1,L>>8,L&255,k>>8,k&255,...R.log[k]]);
    if(L)this.rot.push([1,L>>8,L&255,(L-1)>>8,(L-1)&255,...R.log[L-1]]);
    for(const c of peers)if(c.ackLeft>0){c.ackLeft--;this.rot.push([4,parseInt(c.id.slice(0,2),16),parseInt(c.id.slice(2,4),16),c.q]);}
    if(!this.rot.length)this.rot.push([2,R.players.length,0,parseInt(R.me.slice(0,2),16),parseInt(R.me.slice(2,4),16),R.started?1:0,...trimU8(R.myName,12)]);}
  this.adv(this.rot[this.ri++]);};
BTTr.prototype.tick=function(){const R=this.room;let a=[];try{a=JSON.parse(TT(t=>t.gameTake())||"[]");}catch(e){}
  for(const x of a){const p=String(x.p||"");if(p.length<14||p.slice(4,8)!==this.rh)continue;const from=p.slice(8,12);if(from===R.me)continue;const b=hexb(p.slice(12));
    if(R.host){let c=this.peers[from];
      if(b[0]===5){if(!c&&!R.started&&R.players.length<R.def.max){R.players.push({id:from,name:fromU8(b.slice(1))||"Player"});c=this.peers[from]={id:from,slot:R.players.length-1,have:0,q:0,acked:0,pq:0,seen:Date.now()};R.onRoster(R);}continue;}
      if(!c)continue;c.seen=Date.now();
      if(b[0]===3){c.have=(b[1]<<8)|b[2];const q=b[3];if(q&&q!==c.pq){c.pq=q;c.q=q;c.ackLeft=6;R._append([c.slot,...b.slice(4)]);}}
      continue;}
    // client: only listen to the host (the first phone that sends a roster with seat 0)
    if(!this.hostId){if(b[0]===2&&b[2]===0)this.hostId=from;else continue;}
    if(from!==this.hostId)continue;this.hostSeen=Date.now();R.lastHeard=Date.now();
    if(b[0]===2){const n=b[1],k=b[2],id=h2(b[3])+h2(b[4]);R.players.length=Math.max(n,0);R.players[k]={id,name:fromU8(b.slice(6))||"Player",ai:!!(b[5]&2)};
      for(let i=0;i<n;i++)if(!R.players[i])R.players[i]={id:"----",name:"…"};R.syncNames();R.onRoster(R);}
    if(b[0]===1){const i=(b[3]<<8)|b[4];R._got(i,b.slice(5));}
    if(b[0]===4){const id=h2(b[1])+h2(b[2]);if(id===R.me&&R.pending&&R.pending.q===b[3]){R.pending=null;R.onUpdate(R);}}}
  // the host notices a phone that went quiet for long
  if(R.host)for(const c of Object.values(this.peers))if(c.slot>=0&&!c.gone&&Date.now()-c.seen>45000){c.gone=true;R._left(c.id);}};
BTTr.prototype.published=function(){this.ri=this.rot.length;};   // something new: start a fresh round right away
BTTr.prototype.propose=function(){this.lastSend="";};
BTTr.prototype.roster=function(){this.ri=this.rot.length;};
BTTr.prototype.status=function(){if(this.room.host){const n=Object.values(this.peers).filter(c=>!c.gone&&Date.now()-c.seen<12000).length;return `📶 Bluetooth · ${n} phone${n===1?"":"s"} connected`;}
  return !this.hostSeen?"📶 Looking for the host…":Date.now()-this.hostSeen>10000?"⚠ Lost the host's phone: come closer":"📶 Bluetooth";};
BTTr.prototype.close=function(){clearInterval(this.timer);clearInterval(this.tx);TT(t=>t.gameStop());};

/* ---------------- online: through your circle's encrypted messages ---------------- */
function NetTr(room,G,sid){this.room=room;this.G=G;this.sid=sid;this.timer=0;this.q=[];this.sentAt=0;this.peers={};this.lastNeed=0;}
NetTr.prototype.pub=function(m){const env=Object.assign({ty:"game",sid:this.sid},m);if(this.room.host)env.L=this.room.log.length;return gPublish(env,null,this.G).catch(()=>{setTimeout(()=>gPublish(env,null,this.G).catch(()=>{}),3000);});};
NetTr.prototype.start=function(){this.timer=setInterval(()=>this.tick(),5000);setTimeout(()=>this.tick(),1200);return "ok";};
NetTr.prototype.tick=function(){if(document.hidden)return;if(typeof gPollGame==="function")gPollGame(this.G);const R=this.room;this.n=(this.n||0)+1;
  if(R.host&&!R.started&&this.n%2===0)this.roster();   /* in the lobby: repeat who's in, for anyone who missed it */
  if(!R.host&&R.mySlot()<0&&R.players.length<R.def.max)this.pub({k:"join"});   /* not in yet: ask again */
  if(!R.host){// a move that wasn't confirmed: send it again; and if it's gone quiet, ask what we missed
    if(R.pending&&Date.now()-R.pending.at>8000){R.pending.at=Date.now();this.propose(R.pending);}
    /* quiet for a while: ask the host what we missed (after 12 s, then less and less often while it stays quiet) */
    const wait=Math.min(60000,12000*Math.pow(2,this.needs||0));
    if(R.mySlot()>=0&&!R.over&&Date.now()-R.lastHeard>wait&&Date.now()-this.lastNeed>wait){this.lastNeed=Date.now();this.needs=(this.needs||0)+1;this.pub({k:"need",have:R.log.length});}}};
NetTr.prototype.reinvite=function(){const R=this.room,inn=new Set(R.players.map(p=>p.id));this.pub({k:"inv",g:R.game,to:(this.to||[]).filter(id=>!inn.has(id)),host:R.myName});};
NetTr.prototype.got=function(env){const R=this.room;if(env.sid!==this.sid||R.closed)return;const from=env.from;
  if(R.host){
    if(env.k==="join"){if(R.slotOf(from)<0&&!R.started&&R.players.length<R.def.max){R.players.push({id:from,name:env.name||"Player"});R.onRoster(R);}this.roster();return;}
    if(R.slotOf(from)<0)return;
    if(env.k==="prop"){const s=R.slotOf(from),last=this.peers[from]||0;if(env.q===last){this.pub({k:"ack",to:from,q:env.q});return;}this.peers[from]=env.q;
      const ok=R._append([s,...(env.a||[])]);if(!ok)this.pub({k:"ack",to:from,q:env.q});return;}
    if(env.k==="need"){const have=env.have|0;this.roster();this.pub({k:"log",i:have,e:R.log.slice(have,have+60)});return;}
    if(env.k==="bye"){R._left(from);return;}
    return;}
  if(from!==this.hostId)return;   /* only the host's messages matter to a client */
  R.lastHeard=Date.now();this.needs=0;
  const behind=()=>{if(typeof env.L==="number"&&env.L>R.log.length&&Date.now()-this.lastNeed>5000){this.lastNeed=Date.now();this.pub({k:"need",have:R.log.length});}};
  if(env.k==="roster"){R.players=(env.pl||[]).map(([id,name,ai])=>({id,name,ai:!!ai}));R.syncNames();R.onRoster(R);behind();return;}
  if(env.k==="log"){let gap=false;(env.e||[]).forEach((e,k)=>{if(R._got((env.i|0)+k,e))gap=true;});
    if(env.by===R.me&&R.pending&&R.pending.q===env.q)R.pending=null;
    if(gap&&Date.now()-this.lastNeed>5000){this.lastNeed=Date.now();this.pub({k:"need",have:R.log.length});}else behind();return;}
  if(env.k==="ack"){if(env.to===R.me&&R.pending&&R.pending.q===env.q){R.pending=null;R.onUpdate(R);}behind();return;}
  if(env.k==="bye"&&from===this.hostId){R.onLeft({host:true,name:env.name});return;}};
NetTr.prototype.published=function(i){const R=this.room,e=R.log[i],by=e[0]===255?null:(R.players[e[0]]||{}).id,i0=Math.max(0,i-2);
  this.pub({k:"log",i:i0,e:R.log.slice(i0,i+1),by,q:by?this.peers[by]:undefined});};   /* the last few moves ride along, so one lost message doesn't stall anyone */
NetTr.prototype.propose=function(p){this.pub({k:"prop",q:p.q,a:p.a});};
NetTr.prototype.roster=function(){this.pub({k:"roster",pl:this.room.players.map(p=>[p.id,p.name,p.ai?1:0])});};
NetTr.prototype.status=function(){const R=this.room;return R.host?`🌐 Online · moves take a few seconds`:Date.now()-R.lastHeard>40000?"⚠ Haven't heard from the host for a while":"🌐 Online · moves take a few seconds";};
NetTr.prototype.close=function(){clearInterval(this.timer);this.pub({k:"bye"});};

/* ---------------- on one phone only (against the computer) ---------------- */
function SoloTr(){}SoloTr.prototype.published=function(){};SoloTr.prototype.propose=function(){};SoloTr.prototype.status=function(){return "";};SoloTr.prototype.close=function(){};

/* ---------------- making and joining rooms ---------------- */
const NETROOMS={};   // sid -> transport, for messages coming in from the circle
window.ROOM_IN=function(G,env){const t=NETROOMS[env.sid];if(t&&t.G.id===G.id){t.got(env);return true;}return false;};
window.ROOMS={
  // host a room. mode: "solo" | "bt" | "net". For "net", pass G (the circle) and to (member ids to invite)
  host(o){const me=o.mode==="net"?o.G.me.id:rid(),R=new Room(Object.assign({},o,{host:true,me}));R.myName=o.name;R.players.push({id:me,name:o.name});
    for(const n of (o.ai||[]))R.players.push({id:"a"+R.players.length+"00".slice(0,2),name:n,ai:true});
    if(o.mode==="bt"){R.code=String(1000+Math.floor(Math.random()*9000));R.tr=new BTTr(R,R.code);const st=R.tr.start();if(st!=="ok")return {error:st};}
    else if(o.mode==="net"){R.sid=Math.random().toString(36).slice(2,10);R.tr=new NetTr(R,o.G,R.sid);NETROOMS[R.sid]=R.tr;R.tr.start();
      R.tr.to=o.to;R.tr.pub({k:"inv",g:o.game,to:o.to,host:o.name});}
    else R.tr=new SoloTr();
    return R;},
  joinBt(o){const me=rid(),R=new Room(Object.assign({},o,{host:false,me}));R.myName=o.name;R.tr=new BTTr(R,o.code);const st=R.tr.start();if(st!=="ok")return {error:st};return R;},
  joinNet(o){const R=new Room(Object.assign({},o,{host:false,me:o.G.me.id}));R.myName=o.G.me.name;R.sid=o.sid;R.tr=new NetTr(R,o.G,o.sid);R.tr.hostId=o.hostId;NETROOMS[o.sid]=R.tr;R.tr.start();R.tr.pub({k:"join"});return R;},
  // the host adds or removes a computer player before the start
  addAi(R,name){if(!R.host||R.started||R.players.length>=R.def.max)return;R.players.push({id:"c"+(R.players.length)+"0".repeat(2).slice(0,2),name,ai:true});R.tr.roster&&R.tr.roster();R.onRoster(R);},
  dropAi(R){if(!R.host||R.started)return;for(let i=R.players.length-1;i>0;i--)if(R.players[i].ai){R.players.splice(i,1);break;}R.tr.roster&&R.tr.roster();R.onRoster(R);},
  close(R){if(!R)return;R.leave();for(const k in NETROOMS)if(NETROOMS[k]===R.tr)delete NETROOMS[k];}};
})();
