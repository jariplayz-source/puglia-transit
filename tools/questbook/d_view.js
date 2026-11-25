/* ---------------- the screen ---------------- */
const CSS=`.rq{display:flex;flex-direction:column;gap:9px}
.rq-party{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
.rq-h{flex:1 0 92px;min-width:92px;border:0;text-align:left;border-radius:14px;padding:6px 8px 6px 6px;background:var(--chip);color:var(--ink);position:relative;font:600 12px system-ui;display:flex;gap:6px;align-items:center}
.rq-h .av{flex:none;width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:50% 8%;background:#3a3156;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.rq-h .in{min-width:0;flex:1}.rq-h b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-h.lead{box-shadow:inset 0 0 0 2px var(--tc)}.rq-h.now{box-shadow:inset 0 0 0 2px #f2b233,0 0 12px rgba(242,178,51,.5)}.rq-h.down{opacity:.5;filter:grayscale(.8)}
.rq-h .crown{position:absolute;top:-6px;left:4px;font-size:14px}
.rq-bar{height:6px;border-radius:3px;background:rgba(0,0,0,.15);overflow:hidden;margin-top:3px}.rq-bar i{display:block;height:100%;background:#3fb56b;transition:width .4s}
.rq-bar i.lo{background:#e0533c}.rq-h small{opacity:.8;display:block;white-space:nowrap}
.rq-scene{border-radius:20px;background:#171428;color:#f3eee2;box-shadow:0 6px 20px rgba(0,0,0,.25);position:relative;overflow:hidden}
.rq-art{position:relative;aspect-ratio:16/9;max-height:42vh;overflow:hidden;background:#241d3a}
.rq-art .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:rqkb 26s ease-in-out infinite alternate;transform-origin:60% 40%}
@keyframes rqkb{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-1.5%,-1%)}}
.rq-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,20,40,0) 45%,rgba(23,20,40,.65) 75%,#171428)}
.rq-art h3{position:absolute;left:14px;right:38%;bottom:6px;z-index:2;margin:0;font:800 21px/1.15 Georgia,serif;color:#ffd98a;text-shadow:0 2px 8px rgba(0,0,0,.8)}
.rq-who{position:absolute;right:4px;bottom:0;top:0;padding-top:30px;box-sizing:border-box;z-index:1;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;pointer-events:none}
.rq-who img{height:100%;max-height:100%;max-width:46vw;object-fit:contain;object-position:bottom right;filter:drop-shadow(0 4px 10px rgba(0,0,0,.6))}
.rq-who span{position:absolute;top:8px;right:6px;z-index:3;font:700 11px system-ui;color:#fff;background:rgba(0,0,0,.55);padding:2px 8px;border-radius:999px;white-space:nowrap}
.rq-in .rq-art .bg{animation:rqfade .9s ease-out,rqkb 26s ease-in-out .9s infinite alternate}@keyframes rqfade{from{opacity:0;transform:scale(1.08)}}
.rq-in .rq-who{animation:rqwho .7s .25s ease-out backwards}@keyframes rqwho{from{opacity:0;transform:translateX(30px)}}
.rq-txt{padding:4px 14px 14px}.rq-txt p{margin:8px 0;font:400 15.5px/1.55 Georgia,serif}.rq-txt p.xf{color:#e9d8ff;font-style:italic}
.rq-txt p.res{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.08)}.rq-txt p.ok{box-shadow:inset 3px 0 0 #3fb56b}.rq-txt p.no{box-shadow:inset 3px 0 0 #e0533c}
.rq-notes{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}.rq-notes span{font:700 12px system-ui;padding:4px 10px;border-radius:999px;background:rgba(63,181,107,.22);color:#b9f5cd;animation:rqin .6s ease-out backwards .3s}
.rq-notes span.bad{background:rgba(224,83,60,.22);color:#ffc4b8}
.rq-in .rq-txt{animation:rqin .6s ease-out}@keyframes rqin{from{opacity:0;transform:translateY(8px)}}
.rq-ch{display:flex;flex-direction:column;gap:8px}
.rq-c{border:0;border-radius:14px;padding:12px 14px;text-align:left;background:var(--card);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 1px var(--line);font:600 15px system-ui;display:flex;gap:10px;align-items:center}
.rq-c small{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}.rq-c .tag{flex:none;font-size:22px}
.rq-c .bdg{display:inline-block;font:800 11px system-ui;color:#fff;background:linear-gradient(135deg,#8a5cf0,#c4497d);padding:2px 8px;border-radius:999px;margin-bottom:3px}
.rq-c.sp{box-shadow:0 2px 10px rgba(138,92,240,.25),inset 0 0 0 2px #8a5cf0}
.rq-c:disabled{opacity:.5}.rq-c.mine{box-shadow:0 2px 8px rgba(0,0,0,.12),inset 0 0 0 2px var(--tc)}.rq-c.sp.mine{box-shadow:0 2px 10px rgba(138,92,240,.3),inset 0 0 0 2px #8a5cf0}
.rq-note{font:600 13px system-ui;color:var(--muted);text-align:center}
.rq-big{border:0;border-radius:18px;padding:16px;font:800 18px system-ui;background:var(--tc);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.rq-big.alt{background:var(--chip);color:var(--ink)}.rq-big:disabled{opacity:.45}
.rq-fight{position:relative;border-radius:20px;overflow:hidden;color:#fff;padding:10px 10px 12px;background:#120f1f}
.rq-fight .fbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.42) saturate(.9)}
.rq-fight>*:not(.fbg){position:relative}.rq-fight h3{margin:2px 0 8px;text-align:center;font:800 18px Georgia,serif;color:#ffd98a}
.rq-en{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rq-e{border:0;background:rgba(10,8,20,.55);color:#fff;border-radius:14px;padding:4px 6px 6px;width:100px;position:relative;font:700 12px system-ui;backdrop-filter:blur(2px)}
.rq-e img{display:block;height:86px;width:100%;object-fit:contain;object-position:bottom;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
.rq-e.tgt{box-shadow:0 0 0 2px #f2b233;animation:rqp 1s infinite}@keyframes rqp{50%{box-shadow:0 0 0 2px transparent}}
.rq-e.dead{opacity:.25;filter:grayscale(1)}.rq-e .rq-bar i{background:#e0533c}
.rq-helps{font:600 12.5px system-ui;color:#d6f5dd;text-align:center;margin-top:6px}
.rq-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-acts button{border:0;border-radius:14px;padding:12px 8px;font:700 14px system-ui;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line)}
.rq-acts button.on{background:var(--tc);color:#fff}.rq-acts button small{display:block;font-weight:500;font-size:11.5px;opacity:.8}
.rq-log{font:500 13px/1.45 system-ui;color:var(--muted);background:var(--chip);border-radius:12px;padding:8px 10px}.rq-log b{color:var(--ink);font-size:14.5px;font-weight:700}.rq-log span{opacity:.75}.rq-new{display:inline-block;animation:rqin .5s ease-out}
.rq-inv{display:flex;gap:8px;justify-content:center;font:700 14px system-ui;flex-wrap:wrap;align-items:center}.rq-inv button,.rq-inv span{border:0;background:var(--chip);color:var(--ink);border-radius:12px;padding:6px 10px;font:inherit}
.rq-shop{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-shop button{border:0;border-radius:14px;padding:10px;text-align:left;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:700 14px system-ui}
.rq-shop button small{display:block;font:500 11.5px/1.35 system-ui;color:var(--muted);margin-top:2px}.rq-shop button .pr{float:right;color:#b8860b}.rq-shop button:disabled{opacity:.45}
.rq-sec{font:800 13px system-ui;color:var(--muted);margin:4px 2px -2px}
/* building a hero */
.rq-bh{display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,#2a2346,#171428);color:#f3eee2;border-radius:18px;padding:8px 12px 8px 8px}
.rq-bh img{width:64px;height:64px;border-radius:14px;object-fit:cover;object-position:50% 8%;background:#3a3156}.rq-bh b{font:800 16px Georgia,serif;color:#ffd98a;display:block}.rq-bh small{font:500 12px system-ui;opacity:.85}
.rq-steps{display:flex;gap:4px}.rq-steps i{flex:1;height:4px;border-radius:2px;background:var(--line)}.rq-steps i.on{background:var(--tc)}
.rq-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rq-grid.g3{grid-template-columns:1fr 1fr 1fr}
.rq-opt{border:0;border-radius:16px;padding:10px;text-align:left;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);font:500 12px/1.35 system-ui;position:relative}
.rq-opt b{display:block;font-size:14.5px}.rq-opt .e{font-size:22px}.rq-opt.on{box-shadow:inset 0 0 0 3px var(--tc),0 4px 12px rgba(0,0,0,.15)}
.rq-opt img.cp{display:block;width:100%;height:96px;object-fit:contain;object-position:bottom;margin-bottom:4px}
.rq-por{border:0;padding:0;border-radius:14px;background:linear-gradient(180deg,#3a3156,#1d1830);aspect-ratio:3/4;overflow:hidden;box-shadow:inset 0 0 0 1px var(--line)}
.rq-por img{width:100%;height:100%;object-fit:contain;object-position:bottom}.rq-por.on{box-shadow:0 0 0 3px var(--tc),0 4px 12px rgba(0,0,0,.25)}
.rq-st{display:flex;align-items:center;gap:8px;background:var(--card);border-radius:14px;padding:8px 10px;box-shadow:inset 0 0 0 1px var(--line)}
.rq-st .nm{flex:1;font:700 14px system-ui}.rq-st .nm small{display:block;font:500 11.5px system-ui;color:var(--muted)}
.rq-st .v{font:900 22px system-ui;width:42px;text-align:center}.rq-st button{width:38px;height:38px;border:0;border-radius:12px;background:var(--chip);color:var(--ink);font:800 20px system-ui}
.rq-st button:disabled{opacity:.35}
.rq-row{display:flex;gap:8px}.rq-row>*{flex:1}
/* sheets */
.rq-sheetimg{float:right;width:38%;max-height:220px;object-fit:contain;object-position:bottom;margin:0 0 6px 8px}
.rq-tro{display:flex;flex-wrap:wrap;gap:6px}.rq-tro span{font:600 12.5px system-ui;padding:5px 10px;border-radius:999px;background:var(--chip)}
.rq-rep{display:flex;align-items:center;gap:8px;margin:6px 0}.rq-rep .f{width:150px;font:700 13px system-ui}.rq-rep .b{flex:1;height:8px;border-radius:4px;background:var(--chip);position:relative}
.rq-rep .b i{position:absolute;top:0;bottom:0;border-radius:4px}.rq-rep .w{width:66px;font:600 12px system-ui;color:var(--muted);text-align:right}
.rq-end{text-align:center}.rq-end .en{font:800 13px system-ui;color:#c9b6ff;margin-top:2px}.rq-end .rw{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0 4px}
.rq-end .rw span{font:700 13px system-ui;padding:6px 12px;border-radius:999px;background:rgba(255,217,138,.15);color:#ffe7ae;animation:rqin .6s ease-out backwards}
.rq-advs{display:flex;flex-direction:column;gap:10px}.rq-adv{border:0;padding:0;border-radius:18px;overflow:hidden;background:#171428;color:#f3eee2;text-align:left;position:relative;box-shadow:0 6px 18px rgba(0,0,0,.2)}
.rq-adv img{display:block;width:100%;aspect-ratio:21/9;object-fit:cover}.rq-adv div{padding:8px 12px 12px;font:400 14px/1.45 Georgia,serif}.rq-adv b{display:block;font:800 18px Georgia,serif;color:#ffd98a}
.rq-adv .dn{position:absolute;top:8px;right:8px;font:800 12px system-ui;background:rgba(63,181,107,.9);color:#fff;padding:3px 10px;border-radius:999px}
@media (prefers-reduced-motion: reduce){.rq-art .bg,.rq-in .rq-art .bg{animation:none}}
/*@CSSDICE@*/
.rq-float{position:fixed;z-index:290;pointer-events:none;font:900 24px system-ui;color:#fff;-webkit-text-stroke:1.2px #000;transform:translate(-50%,-50%)}
.rq-shake{animation:rqsh .4s}@keyframes rqsh{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}}
.rq-ov{position:fixed;inset:0;z-index:300;background:rgba(10,8,20,.7);display:flex;align-items:flex-end;justify-content:center;padding:10px 10px calc(10px + env(safe-area-inset-bottom))}
.rq-sheet{width:100%;max-width:520px;max-height:86vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:20px;padding:14px}.rq-sheet h3{margin:4px 0 8px;font:900 19px system-ui}.rq-sheet p,.rq-sheet li{font-size:14px;line-height:1.45}`;
const DCW=dc=>dc<=10?"easy":dc<=12?"medium":dc<=14?"hard":"very hard";
const HELP=`<h3>How to play Questbook</h3><p>The phone is your game master: it tells the story, you decide what your heroes do. Work together to reach the end.</p>
  <ul><li><b>Your hero:</b> pick a class, a people (human, elf or dwarf), a look, a background and a trait, then spend 4 points on your stats. Lower a stat to get a point back.</li>
  <li><b>Choices:</b> one hero leads each scene (👑, it goes round) and picks what the party does. Purple choices are special: your party can only take them because of who you are or what you did before.</li>
  <li><b>Checks:</b> the leader picks who tries. That hero rolls a <b>d20</b> and adds their skill (💪 Might, 🤸 Agility, 🧠 Wits, 💬 Charm). Reach the number (DC) and it works. A 20 always works, a 1 always fails.</li>
  <li><b>Help:</b> while someone is about to roll, others can tap <b>Help</b>: +2 each (two helpers at most).</li>
  <li><b>Fights:</b> take turns: Attack, use your class Ability, Defend (+4 armour this round) or drink a Potion. Then the enemies strike back. A hero at 0 HP is down until the fight is won.</li>
  <li><b>The world remembers:</b> the people you help or cross remember it, also in the next adventure and the next game. Prices, help and endings change with it. Tap 🗺️ to see where you stand.</li>
  <li><b>Endings:</b> every adventure ends in more than one way. Good endings give rewards every hero keeps.</li>
  <li><b>Your hero is saved</b> on this phone with their level and rewards. Next time, carry on with them.</li>
  <li><b>Shops:</b> spend the party's gold on potions, meals and gear. Anyone can buy.</li></ul>
  <p style="font-size:12px;color:var(--muted)">Paintings and portraits: the artists of Battle for Wesnoth (wesnoth.org), GNU GPL v2 or later. Stories: original.</p>`;
/*@OV@*/
/*@DICE@*/
function float(el,t,col){if(!el)return;const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="rq-float";f.textContent=t;if(col)f.style.color=col;f.style.left=r.left+r.width/2+"px";f.style.top=r.top+r.height/3+"px";document.body.appendChild(f);
  f.animate([{transform:"translate(-50%,-30%) scale(.6)",opacity:0},{transform:"translate(-50%,-70%) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-130%)",opacity:0}],{duration:1000,fill:"forwards"}).onfinish=()=>f.remove();}
const REPW=v=>["Hated","Disliked","Wary","Neutral","Liked","Trusted","Heroes"][v+3];
const heroPor=h=>por(POR[h.an][h.po]||POR[h.an][0]);
const sumLine=h=>`${AN[h.an].n} ${CL[h.cl].n} · ${BG[h.bg].n} · ${TR[h.tr].n}`;
function heroSheet(S,k,me){const h=S.heroes[k];if(!h)return;const tro=TRO.filter((t,i)=>h.tro&(1<<i));
  ov(`<img class="rq-sheetimg" src="${heroPor(h)}" alt=""><h3>${k===me?"You":X.esc(S.names[k])}</h3><p><b>${sumLine(h)}</b><br>Level ${h.lv} · ❤ ${h.hp}/${h.max} · 🛡 ${h.ac+S.up.ac}${h.db+S.up.dmg?` · 🗡 +${h.db+S.up.dmg} damage`:""}</p>
    <p>${STS.map(s=>`${ST[s][1]} ${ST[s][0]} <b>${mod(h,s)>=0?"+":""}${mod(h,s)}</b>`).join("<br>")}</p>
    <p><b>${CL[h.cl].ab}:</b> ${CL[h.cl].abt}<br><b>${TR[h.tr].e} ${TR[h.tr].n}:</b> ${TR[h.tr].t}<br><b>${BG[h.bg].e} ${BG[h.bg].n}:</b> ${BG[h.bg].t}</p>
    ${tro.length?`<div class="rq-sec">Rewards</div><div class="rq-tro">${tro.map(t=>`<span>${t[1]} ${t[2]}: ${t[3]}</span>`).join("")}</div>`:""}`);}
function worldSheet(S){const fl=WF.filter(f=>S.fl[f]&&WFT[f]);
  ov(`<h3>🗺️ The world remembers</h3>${FACS.map(f=>{const v=S.rep[f]||0;return `<div class="rq-rep"><span class="f">${FAC[f][1]} ${FAC[f][0]}</span><span class="b"><i style="${v>=0?`left:50%;width:${v/3*50}%;background:#3fb56b`:`right:50%;width:${-v/3*50}%;background:#e0533c`}"></i></span><span class="w">${REPW(v)}</span></div>`;}).join("")}
    <p style="font-size:12.5px;color:var(--muted)">Liked places give discounts and help. At −2 their shops close their doors to you.</p>
    ${fl.length?`<div class="rq-sec">What happened</div><ul>${fl.map(f=>`<li>${WFT[f]}</li>`).join("")}</ul>`:`<p>Nothing yet. Your deeds will be remembered here.</p>`}
    ${S.up.dmg||S.up.ac?`<div class="rq-sec">Party gear</div><div class="rq-tro">${S.up.dmg?`<span>🗡️ +${S.up.dmg} damage</span>`:""}${S.up.ac?`<span>⛓️ +${S.up.ac} armour</span>`:""}</div>`:""}`);}
/* building your hero, on your own phone; nothing is sent until you're ready */
let B=null;
function builder(S,R,me,EL){const saved=store("pt-rq-hero");
  if(!B)B={step:saved&&CL[saved.cl]?-1:0,cl:"fighter",an:"human",po:0,bg:"soldier",tr:"tough",pa:CL.fighter.sug.slice()};
  const b=B,c=CL[b.cl],left=4-b.pa.reduce((a,v)=>a+v,0),h=calc({cl:b.cl,an:b.an,bg:b.bg,tr:b.tr,pa:b.pa,lv:1,tro:0,hp:null});
  const head=`<div class="rq-bh"><img src="${por(POR[b.an][b.po])}" alt=""><div><b>${X.esc(S.names[me])}</b><small>${AN[b.an].n} ${c.n}${b.step>=2?` · ${BG[b.bg].n} · ${TR[b.tr].n}`:""}</small><br><small>❤ ${h.max} · 🛡 ${h.ac} · ${STS.map(s=>`${ST[s][1]}${h.s[s]>=0?"+":""}${h.s[s]}`).join(" ")}</small></div></div>
    <div class="rq-steps">${[0,1,2,3].map(i=>`<i class="${i<=b.step?"on":""}"></i>`).join("")}</div>`;
  let body="";
  if(b.step===-1){const sh=calc({...saved,hp:null});
    body=`<div class="gm-big">Welcome back</div><div class="rq-bh"><img src="${heroPor(sh)}" alt=""><div><b>${X.esc(S.names[me])}</b><small>${sumLine(sh)}</small><br><small>Level ${sh.lv}${sh.tro?" · "+TRO.filter((t,i)=>sh.tro&(1<<i)).map(t=>t[1]).join(""):""}${saved.gs?` · brings ${saved.gs*5} gold`:""}</small></div></div>
      <button class="rq-big" id="rqKeep">Play on with this hero</button><button class="rq-big alt" id="rqNew">Make a new hero</button>`;}
  else if(b.step===0)body=`${head}<div class="gm-big">Choose a class</div><div class="rq-grid">${CLS.map(k=>{const x=CL[k];return `<button class="rq-opt ${b.cl===k?"on":""}" data-bcl="${k}"><img class="cp" src="${por(POR.human[POR0[k][0]])}" alt=""><b>${x.e} ${x.n}</b>${x.tip}<br>❤ ${x.hp} · 🛡 ${x.ac}<br><i>${x.ab}: ${x.abt}</i></button>`;}).join("")}</div>`;
  else if(b.step===1)body=`${head}<div class="rq-sec">Your people</div><div class="rq-grid g3">${ANS.map(k=>`<button class="rq-opt ${b.an===k?"on":""}" data-ban="${k}"><span class="e">${AN[k].e}</span><b>${AN[k].n}</b></button>`).join("")}</div>
      <p class="rq-note" style="text-align:left">${AN[b.an].t}</p><div class="rq-sec">Your look</div><div class="rq-grid g3">${POR[b.an].map((p,i)=>`<button class="rq-por ${b.po===i?"on":""}" data-bpo="${i}"><img src="${por(p)}" alt="" loading="lazy"></button>`).join("")}</div>`;
  else if(b.step===2)body=`${head}<div class="rq-sec">Background: who were you before?</div><div class="rq-grid">${BGS.map(k=>`<button class="rq-opt ${b.bg===k?"on":""}" data-bbg="${k}"><span class="e">${BG[k].e}</span><b>${BG[k].n}</b>${BG[k].t}</button>`).join("")}</div>
      <div class="rq-sec">Trait</div><div class="rq-grid">${TRS.map(k=>`<button class="rq-opt ${b.tr===k?"on":""}" data-btr="${k}"><span class="e">${TR[k].e}</span><b>${TR[k].n}</b>${TR[k].t}</button>`).join("")}</div>`;
  else body=`${head}<div class="gm-big">${left?`${left} point${left>1?"s":""} to spend`:"Ready to go"}</div><p class="rq-note">Lower a stat to get a point back. Each stat: −1 to +2 from points.</p>
      ${STS.map((s,i)=>`<div class="rq-st"><span class="nm">${ST[s][1]} ${ST[s][0]}<small>${c.n} ${c.s[s]>=0?"+":""}${c.s[s]}${AN[b.an].s[s]?` · ${AN[b.an].n} ${AN[b.an].s[s]>0?"+":""}${AN[b.an].s[s]}`:""}${BG[b.bg].s===s?` · ${BG[b.bg].n} +1`:""} · points ${b.pa[i]>=0?"+":""}${b.pa[i]}</small></span>
        <button data-bm="${i}" ${b.pa[i]<=-1?"disabled":""}>−</button><span class="v">${h.s[s]>=0?"+":""}${h.s[s]}</span><button data-bp="${i}" ${b.pa[i]>=2||left<=0?"disabled":""}>+</button></div>`).join("")}`;
  const nav=b.step>=0?`<div class="rq-row">${b.step>0?`<button class="rq-big alt" id="rqBk">Back</button>`:`<button class="rq-big alt" id="rqRnd">🎲 Surprise me</button>`}${b.step<3?`<button class="rq-big" id="rqFw">Next</button>`:`<button class="rq-big" id="rqGo" ${left?"disabled":""}>Ready!</button>`}</div>`:"";
  EL.innerHTML=`<div class="rq">${body}${nav}</div>`;
  const q=s=>EL.querySelector(s),re=()=>view(R),send=x=>{X.tapv();B=null;R.act(buildAct(x));};
  EL.querySelectorAll("[data-bcl]").forEach(e=>e.onclick=()=>{b.cl=e.dataset.bcl;b.pa=CL[b.cl].sug.slice();b.po=POR0[b.cl][ANS.indexOf(b.an)]%POR[b.an].length;re();});
  EL.querySelectorAll("[data-ban]").forEach(e=>e.onclick=()=>{b.an=e.dataset.ban;b.po=POR0[b.cl][ANS.indexOf(b.an)]%POR[b.an].length;re();});
  EL.querySelectorAll("[data-bpo]").forEach(e=>e.onclick=()=>{b.po=+e.dataset.bpo;re();});
  EL.querySelectorAll("[data-bbg]").forEach(e=>e.onclick=()=>{b.bg=e.dataset.bbg;re();});EL.querySelectorAll("[data-btr]").forEach(e=>e.onclick=()=>{b.tr=e.dataset.btr;re();});
  EL.querySelectorAll("[data-bm]").forEach(e=>e.onclick=()=>{b.pa[+e.dataset.bm]--;re();});EL.querySelectorAll("[data-bp]").forEach(e=>e.onclick=()=>{b.pa[+e.dataset.bp]++;re();});
  if(q("#rqBk"))q("#rqBk").onclick=()=>{b.step--;re();};if(q("#rqFw"))q("#rqFw").onclick=()=>{X.tapv();b.step++;EL.scrollTop=0;re();};
  if(q("#rqRnd"))q("#rqRnd").onclick=()=>{const r=randomBuild(1);Object.assign(b,r,{step:3});re();};
  if(q("#rqGo"))q("#rqGo").onclick=()=>send({cl:b.cl,an:b.an,bg:b.bg,tr:b.tr,po:b.po,pa:b.pa,lv:1});
  if(q("#rqKeep"))q("#rqKeep").onclick=()=>send(saved);if(q("#rqNew"))q("#rqNew").onclick=()=>{b.step=0;re();};}
let SEL=null;
function view(R){const S=R.S,me=R.mySlot(),EL=X.EL();if(!document.getElementById("rqCss")){const st=document.createElement("style");st.id="rqCss";st.textContent=CSS;document.head.appendChild(st);}
  if(view.R!==R){view.R=R;view.roll=S.rollN;view.fe=S.fight?S.fight.evn:0;view.node=null;view.ph=null;SEL=null;B=null;view.saved=0;}
  X.shell("Questbook",R.status(),false);X.onBack(()=>X.leaveAsk(R));
  try{if(!localStorage.getItem("pt-rq-help2")){localStorage.setItem("pt-rq-help2","1");setTimeout(()=>ov(HELP),300);}}catch(e){}
  if(S.phase==="pick"&&me>=0&&!S.heroes[me]){builder(S,R,me,EL);return;}
  const nm=k=>k===me?"You":X.esc(S.names[k]),turn=DEF.turn(S),mine=turn===me&&!R.pending,cpuLead=!!(R.players[S.lead]&&R.players[S.lead].ai);
  const party=`<div class="rq-party">${S.heroes.map((h,k)=>{if(!h)return `<div class="rq-h"><span class="av" style="display:grid;place-items:center">❔</span><span class="in"><b>${nm(k)}</b><small>building a hero…</small></span></div>`;const p=Math.round(h.hp/h.max*100);
    return `<button class="rq-h ${k===S.lead&&S.phase!=="fight"?"lead":""} ${S.phase==="fight"&&turn===k?"now":""} ${h.hp<=0?"down":""}" data-hero="${k}">${k===S.lead&&S.phase!=="fight"?`<span class="crown">👑</span>`:""}<img class="av" src="${heroPor(h)}" alt=""><span class="in"><b>${nm(k)}</b><small>${CL[h.cl].e} lv ${h.lv} · ✦${h.ab}</small>
      <span class="rq-bar"><i class="${p<35?"lo":""}" style="width:${p}%"></i></span><small>${h.hp}/${h.max} HP</small></span></button>`;}).join("")}</div>`;
  const inv=`<div class="rq-inv"><span>💰 ${S.gold}</span><button id="rqPot">🧪 ${S.potions}</button>${S.items.map(i=>`<span>${{key:"🗝️ Silver key",clapper:"🔔 Bell clapper"}[i]||i}</span>`).join("")}<button id="rqWorld">🗺️</button><button id="rqLog">📜</button><button id="rqHelp">?</button></div>`;
  const notes=S.notes&&S.notes.length?`<div class="rq-notes">${S.notes.map(([t,g])=>`<span class="${g?"":"bad"}">${X.esc(t)}</span>`).join("")}</div>`:"";
  const art=(p,t,who,fresh)=>`<div class="rq-art"><img class="bg" src="${pic(p)}" alt="">${who&&NPC[who]?`<div class="rq-who"><img src="${por(NPC[who][0])}" alt=""><span>${NPC[who][1]}</span></div>`:""}<h3>${t}</h3></div>`;
  let body="";
  if(S.phase==="pick"){body=`<div class="gm-big">The party gathers</div><p class="rq-note">Waiting for everyone to finish their hero…</p>`;}
  else if(S.phase==="adv"){body=me===0?`<div class="gm-big">Choose an adventure</div><div class="rq-advs">${ADVS.map((a,i)=>`<button class="rq-adv" data-adv="${i}"><img src="${pic(ADV[a].p)}" alt="">${S.done&(1<<i)?`<span class="dn">✓ Done · play again</span>`:""}<div><b>${ADV[a].n}</b>${ADV[a].x}</div></button>`).join("")}</div>`
      :`<div class="gm-big">📖</div><p class="rq-note">${X.esc(S.names[0])} is choosing the adventure…</p>`;}
  else if(S.phase==="end"){const N=node(S),E=S.ending||{},nEnd=Object.values(ADV[S.adv].nodes).filter(n=>n.end==="win").length;
    if(view.saved!==S.endN){view.saved=S.endN;saveHero(S,me);saveWorld(S);}
    body=`<div class="rq-scene ${view.node!==S.node?"rq-in":""}">${art(N.p,N.t,N.who)}<div class="rq-txt"><p>${N.x}</p>${(N.xf||[]).filter(x=>cond(S,x[0])).map(x=>`<p class="xf">${x[1]}</p>`).join("")}
      <div class="rq-end"><div class="en">${E.win?`Ending ${"·"} ${X.esc(E.en)}`:"The end… for now"}</div><div class="rw">${E.gold?`<span>💰 +${E.gold} gold</span>`:""}${(E.tr||[]).map((t,i)=>{const T=TRO[TROI[t]];return `<span style="animation-delay:${.2+i*.25}s">${T[1]} ${T[2]} (${T[3]})</span>`;}).join("")}</div>${notes}
      ${E.win&&nEnd>1?`<p class="rq-note" style="color:#bdb3d6">This adventure has ${nEnd} endings. Your heroes and the world remember this one.</p>`:""}</div></div></div>
      ${me===0?`<button class="rq-big" id="rqAgain">${E.win?"Next adventure":"Try again"}</button>`:`<p class="rq-note">${X.esc(S.names[0])} can start the next adventure.</p>`}`;view.node=S.node;}
  else if(S.phase==="fight"){const F=S.fight,h=S.heroes[me],myTurn=mine&&h&&h.hp>0,N=node(S);
    const sel=SEL&&SEL.n===F.evn+"_"+F.i?SEL:null;const needEnemy=sel&&(sel.a===5||(sel.a===6&&["fighter","rogue"].includes(h.cl))),needAlly=sel&&sel.a===6&&["cleric","bard"].includes(h.cl);
    body=`<div class="rq-fight"><img class="fbg" src="${pic(N.p)}" alt=""><h3>⚔ ${N.t} · round ${F.round}</h3><div class="rq-en">${F.en.map((e,i)=>`<button class="rq-e ${e.hp<=0?"dead":""} ${needEnemy&&e.hp>0?"tgt":""}" data-en="${i}">${MON[e.m]&&MON[e.m][6]?`<img src="${por(MON[e.m][6])}" alt="">`:`<span style="font-size:44px">${e.e}</span>`}${X.esc(e.n)}<div class="rq-bar"><i style="width:${Math.round(e.hp/e.max*100)}%"></i></div><small>${e.hp}/${e.max} · AC ${e.ac}</small></button>`).join("")}</div>
      ${F.helps&&F.helps.length&&F.round===1?`<div class="rq-helps">${F.helps.map(X.esc).join("<br>")}</div>`:""}</div>
      ${myTurn?`<div class="rq-note">${needEnemy?"Tap an enemy":needAlly?"Tap a hero in the party bar":"Your turn: what do you do?"}</div>
        <div class="rq-acts"><button data-fa="5" class="${sel&&sel.a===5?"on":""}">⚔️ Attack<small>d20 + ${ST[CL[h.cl].atk][0]} vs armour, d${CL[h.cl].die} damage</small></button>
        <button data-fa="6" class="${sel&&sel.a===6?"on":""}" ${h.ab<1?"disabled":""}>${CL[h.cl].e} ${CL[h.cl].ab} ✦${h.ab}<small>${CL[h.cl].abt}</small></button>
        <button data-fa="7">🛡 Defend<small>+4 armour until your next turn</small></button><button data-fa="9" ${S.potions<1||h.hp>=h.max?"disabled":""}>🧪 Potion (${S.potions})<small>Heal yourself 2d4 + 2</small></button></div>`
      :`<p class="rq-note">${turn>=0?`${nm(turn)} ${turn===me?"":"is "}taking a turn…`:""}</p>`}
      <div class="rq-log">${S.log.slice(-5).map((l,i,a)=>i===a.length-1?`<b class="${view.ll!==S.log.length?"rq-new":""}">${X.esc(l)}</b>`:`<span>${X.esc(l)}</span>`).join("<br>")}</div>`;view.ll=S.log.length;view.node=S.node;}
  else{const N=node(S),lead=S.lead===me&&!R.pending;
    let txt=`<div class="rq-scene ${view.node!==S.node?"rq-in":""}">${art(N.p,N.t,N.who)}<div class="rq-txt"><p>${N.x}</p>${(N.xf||[]).filter(x=>cond(S,x[0])).map(x=>`<p class="xf">${x[1]}</p>`).join("")}${S.res?`<p class="res ${S.res.ok?"ok":"no"}">${X.esc(S.res.txt)}</p>`:""}${notes}</div></div>`;
    if(S.phase==="scene"&&N.shop){const shut=shopShut(S,N);
      txt+=shut?`<p class="rq-note">🚪 The door stays shut for you. ${FAC[N.shop.fac][0]} doesn't want your business.</p>`:`<div class="rq-sec">For sale · anyone can buy · 💰 ${S.gold}</div><div class="rq-shop">${N.shop.it.map((it,i)=>{const I=ITEM[it],p=price(S,N,it);
        return `<button data-buy="${i}" ${canBuy(S,N,it)?"":"disabled"}><span class="pr">💰 ${p}</span>${I.e} ${I.n}<small>${I.t}</small></button>`;}).join("")}</div>`;}
    if(S.phase==="scene"){const shop=!!N.shop,can=lead||shop;
      if(N.c)txt+=`<div class="rq-note">${shop?"Anyone can move on when the party is ready.":lead?"👑 You lead this scene: what does the party do?":`👑 ${nm(S.lead)} ${cpuLead?"is thinking…":"chooses what the party does…"}`}</div><div class="rq-ch">${N.c.map((c,i)=>{if(!choiceShown(S,c))return "";const ok=choiceOk(S,c),bh=c.s?best(S,c):-1,tg=tagOf(c);
        return `<button class="rq-c ${can?"mine":""} ${tg?"sp":""}" data-ch="${i}" ${!can||!ok?"disabled":""}><span class="tag">${c.s?ST[c.s][1]:c.need?(c.need.gold?"💰":"🗝️"):tg?"✦":"➡️"}</span><div>${tg?`<span class="bdg">${tg}</span><br>`:""}${X.esc(c.l)}<small>${c.s?`${ST[c.s][0]} check · ${DCW(c.dc)} (DC ${c.dc}) · best: ${nm(bh)} ${mod(S.heroes[bh],c.s,true)>=0?"+":""}${mod(S.heroes[bh],c.s,true)}`:c.need?(c.need.gold?`Costs ${c.need.gold} gold${ok?"":" (not enough)"}`:`Needs the ${c.need.item==="key"?"silver key":c.need.item}${ok?"":" (you don't have it)"}`):"No roll needed"}</small></div></button>`;}).join("")}</div>`;
      else txt+=lead||cpuLead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;}
    if(S.phase==="who"){const c=N.c[S.pend.c];txt+=`<div class="rq-note">${X.esc(c.l)}: ${ST[c.s][0]} check, DC ${c.dc}. ${lead?"Who tries?":`${nm(S.lead)} picks who tries…`}</div>
      <div class="rq-ch">${S.heroes.map((h,k)=>h&&h.hp>0?`<button class="rq-c ${lead?"mine":""}" data-who="${k}" ${lead?"":"disabled"}><span class="tag"><img src="${heroPor(h)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;object-position:50% 8%"></span><div>${nm(k)}<small>${ST[c.s][0]} ${mod(h,c.s,true)>=0?"+":""}${mod(h,c.s,true)} · needs ${Math.max(2,c.dc-mod(h,c.s,true))}+ on the d20${h.tr==="lucky"&&!S.lk[k]?" · 🍀 lucky":""}</small></div></button>`:"").join("")}</div>`;}
    if(S.phase==="roll"){const c=N.c[S.pend.c],h=S.heroes[S.pend.k],b=mod(h,c.s,true)+S.pend.help.length*2+(S.inspire[S.pend.k]||0);
      txt+=`<div class="rq-note">${nm(S.pend.k)} ${S.pend.k===me?"try":"tries"}: d20 ${b>=0?"+":"−"} ${Math.abs(b)} vs DC ${c.dc}${S.pend.help.length?` (helped by ${S.pend.help.map(nm).join(" and ")})`:""}</div>`;
      txt+=S.pend.k===me&&!R.pending?`<button class="rq-big" id="rqRoll">🎲 Roll the d20</button>`:`${S.heroes[me]&&S.heroes[me].hp>0&&!S.pend.help.includes(me)&&S.pend.help.length<2?`<button class="rq-big alt" id="rqHelp2">🤝 Help (+2)</button>`:""}<p class="rq-note">Waiting for ${nm(S.pend.k)} to roll…</p>`;}
    if(S.phase==="result")txt+=lead||cpuLead?`<button class="rq-big" id="rqNext">Continue</button>`:`<p class="rq-note">${nm(S.lead)} continues the story…</p>`;
    body=txt;view.node=S.node;}
  EL.innerHTML=`<div class="rq">${party}${body}${S.phase!=="pick"?inv:""}</div>`;
  if(view.ph!==S.phase+S.node){view.ph=S.phase+S.node;EL.scrollTop=0;}
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
  EL.querySelectorAll("[data-adv]").forEach(b=>b.onclick=()=>{X.tapv();go([11,+b.dataset.adv]);});
  EL.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{X.tapv();go([2,+b.dataset.ch]);});
  EL.querySelectorAll("[data-who]").forEach(b=>b.onclick=()=>{X.tapv();go([12,+b.dataset.who]);});
  EL.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{X.tapv();go([14,+b.dataset.buy]);});
  const q=id=>EL.querySelector(id);
  if(q("#rqNext"))q("#rqNext").onclick=()=>{X.tapv();go([8]);};if(q("#rqRoll"))q("#rqRoll").onclick=()=>{X.tapv();go([4]);};
  if(q("#rqHelp2"))q("#rqHelp2").onclick=()=>{X.tapv();go([3]);};if(q("#rqAgain"))q("#rqAgain").onclick=()=>{X.tapv();go([10]);};
  if(q("#rqLog"))q("#rqLog").onclick=()=>ov(`<h3>📜 What happened</h3><p>${S.log.slice().reverse().map(X.esc).join("<br>")}</p>`);
  if(q("#rqHelp"))q("#rqHelp").onclick=()=>ov(HELP);if(q("#rqWorld"))q("#rqWorld").onclick=()=>worldSheet(S);
  if(q("#rqPot"))q("#rqPot").onclick=()=>{if(S.potions<1){X.toast("No potions left");return;}if(S.phase==="fight"){X.toast("In a fight, drink one with the Potion button on your turn");return;}
    ov(`<h3>🧪 Who drinks a potion?</h3><p>Heals 2d4 + 2. You have ${S.potions}.</p><div class="rq-ch">${S.heroes.map((h,k)=>h?`<button class="rq-c" data-pot="${k}" ${h.hp>=h.max?"disabled":""}><span class="tag">${CL[h.cl].e}</span><div>${nm(k)}<small>${h.hp}/${h.max} HP</small></div></button>`:"").join("")}</div>`,
      (o,close)=>o.querySelectorAll("[data-pot]").forEach(b=>b.onclick=()=>{close();go([9,+b.dataset.pot]);}));};
  const h=S.heroes[me],F=S.fight;
  EL.querySelectorAll("[data-hero]").forEach(b=>b.onclick=()=>{const k=+b.dataset.hero;
    if(S.phase==="fight"&&SEL&&SEL.a===6&&h&&["cleric","bard"].includes(h.cl)){X.tapv();go([6,k]);return;}heroSheet(S,k,me);});
  // fights: pick an action, then a target
  if(S.phase==="fight"){
    EL.querySelectorAll("[data-fa]").forEach(b=>b.onclick=()=>{X.tapv();const a=+b.dataset.fa;
      if(a===7){go([7]);return;}if(a===9){go([9,me]);return;}if(a===6&&h.cl==="wizard"){go([6,0]);return;}
      SEL={a,n:F.evn+"_"+F.i};const alv=F.en.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);
      if((a===5||(a===6&&["fighter","rogue"].includes(h.cl)))&&alv.length===1){go([a,alv[0]]);return;}view(R);});
    EL.querySelectorAll("[data-en]").forEach(b=>b.onclick=()=>{if(!SEL)return;X.tapv();go([SEL.a,+b.dataset.en]);});}}
function stop(){document.querySelectorAll(".rq-ov,.rq-dice,.rq-float").forEach(e=>e.remove());const s=document.getElementById("rqCss");if(s)s.remove();view.R=null;B=null;}
window.RPG={def:DEF,view,stop,opts:worldOpts,init(h){X=h;},_t:{DEF,ADV,CL,MON,AN,BG,TR,POR,NPC,aiMove,legal,buildAct,randomBuild,cond,calc},_dice:(L,me,nm)=>dice(L,me,nm)};
})();
