/* Shards 3D: monsters rise out of their cards, fight and shatter, in 3D (three.js, MIT) with the Grab3D models (CC0).
   AR mode puts the scene over your camera: the phone's orientation keeps it in place in the room, the room's light
   (sampled from the camera) lights the monsters, and they cast a shadow on the floor. Only runs while Shards is open. */
(function(){
const T=window.THREE,SKEL=window.THREE_SKEL;
const DOMC={E:0xff6a3d,T:0x3d9bff,G:0x4fd17a,S:0xffd23d,N:0xc8c8ff};
const OPT_KEY="pt-shards-fx";
const OPT=(()=>{try{return Object.assign({fx:true,ar:false},JSON.parse(localStorage.getItem(OPT_KEY)||"{}"));}catch(e){return {fx:true,ar:false};}})();
const saveOpt=()=>{try{localStorage.setItem(OPT_KEY,JSON.stringify(OPT));}catch(e){}};
let W=null;   // the running world
const TPL={},LOADING={};
const CSS=`#sfx{position:fixed;inset:0;z-index:310;display:none;background:radial-gradient(ellipse at 50% 30%,#2c2550,#0d0b1a 75%);touch-action:none;user-select:none}
#sfx.ar{background:#000}#sfx canvas{position:absolute;inset:0;width:100%;height:100%}#sfx video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#sfx .cap{position:absolute;left:0;right:0;top:calc(14px + env(safe-area-inset-top));text-align:center;color:#fff;font:900 24px system-ui;text-shadow:0 2px 10px rgba(0,0,0,.8),0 0 2px #000;padding:0 16px;pointer-events:none}
#sfx .sub{position:absolute;left:0;right:0;top:calc(50px + env(safe-area-inset-top));text-align:center;color:#fff;opacity:.9;font:700 15px system-ui;text-shadow:0 2px 8px rgba(0,0,0,.9);padding:0 16px;pointer-events:none}
#sfx .skip{position:absolute;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));color:#fff;opacity:.75;font:700 13px system-ui;background:rgba(0,0,0,.35);border-radius:14px;padding:7px 12px}
#sfx .bar{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));display:none;gap:8px;align-items:flex-end}
#sfx.insp .bar{display:flex}#sfx.insp .skip{display:none}
#sfx .info{flex:1;background:rgba(14,12,28,.82);color:#fff;border-radius:16px;padding:12px 14px;font:500 14px/1.4 system-ui;backdrop-filter:blur(6px)}
#sfx .info b{font-size:17px}#sfx .info .kw{display:inline-block;margin:4px 4px 0 0;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,.14);font-size:12.5px}
#sfx .btns{display:flex;flex-direction:column;gap:8px}#sfx .btns button{border:0;border-radius:14px;padding:11px 14px;font:800 14px system-ui;background:#fff;color:#1d1a33;min-width:74px}
#sfx .btns button.on{background:#7c5cff;color:#fff}
#sfx .dmg{position:absolute;color:#fff;font:900 30px system-ui;-webkit-text-stroke:1.5px #000;pointer-events:none;transform:translate(-50%,-50%)}
#sfx .arhint{position:absolute;left:0;right:0;bottom:calc(150px + env(safe-area-inset-bottom));text-align:center;color:#fff;font:600 13px system-ui;text-shadow:0 1px 6px #000;pointer-events:none}`;
function css(){if(document.getElementById("sfxCss"))return;const s=document.createElement("style");s.id="sfxCss";s.textContent=CSS;document.head.appendChild(s);}
const ease={out:t=>1-Math.pow(1-t,3),inout:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,back:t=>{const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}};

/* ---------- the world ---------- */
function world(){if(W)return W;css();
  const el=document.createElement("div");el.id="sfx";
  el.innerHTML=`<video playsinline muted autoplay hidden></video><canvas></canvas><div class="cap"></div><div class="sub"></div><div class="arhint"></div><div class="skip">Tap to skip</div>
    <div class="bar"><div class="info"></div><div class="btns"><button data-k="ar">AR</button><button data-k="x">Close</button></div></div>`;
  document.body.appendChild(el);
  const cv=el.querySelector("canvas"),R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"high-performance"});
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));R.outputColorSpace=T.SRGBColorSpace;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.setClearColor(0,0);
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(50,1,0.05,60);
  const hemi=new T.HemisphereLight(0xffffff,0x3a2a55,1.4),key=new T.DirectionalLight(0xfff0dd,2.2);key.position.set(2.5,5,3.5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:0.5,far:15});key.shadow.bias=-0.0008;
  const rim=new T.DirectionalLight(0x8899ff,1.6);rim.position.set(-3,2.5,-3);scene.add(hemi,key,rim);
  const stage=new T.Group();scene.add(stage);key.target=stage;
  // the arena: a glowing disc (or, in AR, only a shadow on your real floor)
  const disc=new T.Mesh(new T.CylinderGeometry(2.1,2.25,0.12,64),new T.MeshStandardMaterial({color:0x1c1838,roughness:0.6,metalness:0.2}));disc.position.y=-0.06;disc.receiveShadow=true;
  const ring=new T.Mesh(new T.TorusGeometry(2.12,0.025,8,96),new T.MeshBasicMaterial({color:0x7c5cff}));ring.rotation.x=Math.PI/2;ring.position.y=0.005;
  const shadow=new T.Mesh(new T.PlaneGeometry(8,8),new T.ShadowMaterial({opacity:0.35}));shadow.rotation.x=-Math.PI/2;shadow.receiveShadow=true;
  stage.add(disc,ring,shadow);
  W={el,cv,R,scene,cam,hemi,key,rim,stage,disc,ring,shadow,vid:el.querySelector("video"),objs:[],tw:[],q:[],busy:false,skip:null,raf:0,t0:performance.now(),ar:false,yaw:0,orient:null};
  el.addEventListener("pointerdown",e=>{if(W.insp)return;if(W.skip)W.skip();});
  el.querySelector('[data-k="x"]').onclick=e=>{e.stopPropagation();closeInspect();};
  el.querySelector('[data-k="ar"]').onclick=e=>{e.stopPropagation();setAR(!OPT.ar);};
  window.addEventListener("resize",size);return W;}
function size(){if(!W)return;const w=innerWidth,h=innerHeight;W.R.setSize(w,h,false);W.cam.aspect=w/h;W.cam.updateProjectionMatrix();}
function show(on){world();W.el.style.display=on?"block":"none";if(on){size();applyAR();loop();}else{cancelAnimationFrame(W.raf);W.raf=0;camOff();}}
function loop(){if(W.raf)return;const f=now=>{W.raf=requestAnimationFrame(f);tick(now);};W.raf=requestAnimationFrame(f);}
function tick(now){const dt=Math.min(0.05,(now-(W.last||now))/1000);W.last=now;
  W.tw=W.tw.filter(t=>{const k=Math.min(1,(now-t.s)/t.d);t.f(t.e?t.e(k):k);if(k>=1){t.done&&t.done();return false;}return true;});
  for(const o of W.objs){if(o.mixer)o.mixer.update(dt);if(o.idle)o.idle(now/1000);if(o.idle2)o.idle2(now/1000);}
  if(W.parts)W.parts=W.parts.filter(p=>p.step(dt));
  if(!W.ar){const a=Math.sin(now/4000)*0.2,d=W.insp?4.4:5.4;W.cam.position.set(Math.sin(a)*d,1.9,Math.cos(a)*d);W.cam.lookAt(0,0.7,0);}
  else camFromSensor();
  W.R.render(W.scene,W.cam);}
const tween=(d,f,e,done)=>{W.tw.push({s:performance.now(),d,f,e,done});};
const wait=ms=>new Promise(r=>{const t=setTimeout(r,ms);W.skipT=()=>{clearTimeout(t);r();};});

/* ---------- AR: camera behind, the phone's orientation keeps the arena in place, the room's light lights it ---------- */
async function camOn(){if(W.stream)return true;try{W.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});W.vid.srcObject=W.stream;W.vid.hidden=false;await W.vid.play().catch(()=>{});return true;}catch(e){return false;}}
function camOff(){if(W&&W.stream){for(const t of W.stream.getTracks())t.stop();W.stream=null;W.vid.srcObject=null;W.vid.hidden=true;}sensors(false);clearInterval(W&&W.lightT);}
function sensors(on){if(on){if(W.sensOn)return;W.sensOn=true;W.prevSky=window.onSky;W.orient=null;
    window.onSky=(m)=>{W.orient=m;};
    W.web=e=>{if(window.AndroidGPS||e.alpha==null)return;const R=Math.PI/180,a=e.alpha*R,b=e.beta*R,c=e.gamma*R,cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(c),sG=Math.sin(c);
      W.orient=[cA*cG-sA*sB*sG,-cB*sA,cA*sG+cG*sA*sB,cG*sA+cA*sB*sG,cA*cB,sA*sG-cA*cG*sB,-cB*sG,sB,cB*cG];};
    if(window.AndroidGPS&&AndroidGPS.sky){try{AndroidGPS.sky(true);}catch(e){}}else addEventListener("deviceorientation",W.web);}
  else{if(!W||!W.sensOn)return;W.sensOn=false;window.onSky=W.prevSky||null;try{if(window.AndroidGPS&&AndroidGPS.sky)AndroidGPS.sky(false);}catch(e){}removeEventListener("deviceorientation",W.web);}}
const sm=(a,b,k)=>a+(b-a)*k;
// Android's rotation matrix (east, north, up) → three.js (x east, y up, z south); the arena stays where you first looked
function camFromSensor(){const m=W.orient;W.cam.position.set(0,1.35,0);
  if(!m){W.cam.lookAt(0,0.3,-2.4);return;}
  const v=(x,y,z)=>new T.Vector3(x,z,-y);
  const right=v(m[0],m[3],m[6]),up=v(m[1],m[4],m[7]),back=v(m[2],m[5],m[8]);
  const M=new T.Matrix4().makeBasis(right,up,back),q=new T.Quaternion().setFromRotationMatrix(M);
  if(W.anchorYaw==null){const f=back.clone().multiplyScalar(-1);W.anchorYaw=Math.atan2(f.x,-f.z);}
  const rot=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),W.anchorYaw);q.premultiply(rot.invert());   // the world turns so you first look straight at the arena
  W.cam.quaternion.slerp(q,0.35);}
// the light of the room, from the camera picture: brightness and colour, a few times a second
function lightProbe(){const c=document.createElement("canvas");c.width=c.height=12;const g=c.getContext("2d",{willReadFrequently:true});
  clearInterval(W.lightT);W.lightT=setInterval(()=>{if(!W.ar||!W.stream||W.vid.readyState<2)return;try{g.drawImage(W.vid,0,0,12,12);const d=g.getImageData(0,0,12,12).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];}
    const n=d.length/4;r/=n*255;gg/=n*255;b/=n*255;const lum=0.3*r+0.59*gg+0.11*b,mx=Math.max(r,gg,b,0.01),tint=new T.Color(sm(1,r/mx,0.55),sm(1,gg/mx,0.55),sm(1,b/mx,0.55));
    W.hemi.intensity=sm(W.hemi.intensity,0.35+lum*2.3,0.3);W.hemi.color.lerp(tint,0.3);W.key.intensity=sm(W.key.intensity,0.6+lum*2.6,0.3);W.key.color.lerp(tint,0.3);
    W.shadow.material.opacity=sm(W.shadow.material.opacity,0.18+lum*0.35,0.3);}catch(e){}},350);}
async function applyAR(){if(!W)return;const want=OPT.ar;W.el.querySelector('[data-k="ar"]').classList.toggle("on",want);
  if(want&&!W.ar){const ok=await camOn();if(!ok){OPT.ar=false;saveOpt();W.el.querySelector('.arhint').textContent="The camera isn't available, so AR is off";setTimeout(()=>{if(W)W.el.querySelector('.arhint').textContent="";},2500);return applyAR();}
    W.ar=true;W.anchorYaw=null;sensors(true);lightProbe();W.el.classList.add("ar");W.disc.visible=false;W.ring.visible=true;W.shadow.visible=true;
    W.stage.position.set(0,0,-2.4);W.stage.scale.setScalar(0.55);W.el.querySelector('.arhint').textContent="Point at the floor in front of you. Turn around: the monsters stay where they are.";
    setTimeout(()=>{if(W)W.el.querySelector('.arhint').textContent="";},4000);}
  if(!want&&W.ar){W.ar=false;camOff();W.el.classList.remove("ar");W.disc.visible=true;W.shadow.visible=false;W.stage.position.set(0,0,0);W.stage.scale.setScalar(1);W.hemi.intensity=1.4;W.hemi.color.set(0xffffff);W.key.intensity=2.2;W.key.color.set(0xfff0dd);}
  if(!W.ar){W.shadow.visible=false;W.disc.visible=true;}}
function setAR(on){OPT.ar=!!on;saveOpt();if(W&&W.el.style.display==="block")applyAR();}

/* ---------- monsters ---------- */
function loadModel(name){if(TPL[name])return Promise.resolve(TPL[name]);if(LOADING[name])return LOADING[name];
  LOADING[name]=(window.SH3D&&window.SH3D[name]?Promise.resolve():loadScript(`shards3d/${name}.js`)).then(()=>new Promise((ok,no)=>{
    const b64=window.SH3D[name],bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    delete window.SH3D[name];   // keep memory low: the parsed model is kept instead
    new window.THREE_GLTF().parse(u.buffer,"",g=>{const o=g.scene;o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=false;}});
      const bx=new T.Box3().setFromObject(o),sz=bx.getSize(new T.Vector3()),c=bx.getCenter(new T.Vector3());
      const s=1.45/Math.max(sz.x,sz.y*0.9,sz.z);const holder=new T.Group();o.position.set(-c.x*s,-bx.min.y*s,-c.z*s);o.scale.setScalar(s);holder.add(o);
      TPL[name]={obj:holder,anims:g.animations,skinned:g.animations.length>0};ok(TPL[name]);},no);}));
  return LOADING[name];}
function spawn(tpl,opts){const o=tpl.skinned?SKEL.clone(tpl.obj):tpl.obj.clone(true);const mats=[];
  o.traverse(n=>{if(n.isMesh){n.material=n.material.clone();n.material.emissive=new T.Color(0);mats.push(n.material);n.castShadow=true;}});
  const rec={o,mats,mixer:null};if(tpl.anims.length){rec.mixer=new T.AnimationMixer(o);const clip=tpl.anims.find(a=>/walk/i.test(a.name))||tpl.anims[0];const a=rec.mixer.clipAction(clip);a.timeScale=0.45;a.play();}
  W.stage.add(o);W.objs.push(rec);return rec;}
function glow(rec,color,amt){for(const m of rec.mats){m.emissive.setHex(color);m.emissiveIntensity=amt;}}
function clear(){for(const r of W.objs)W.stage.remove(r.o);W.objs=[];for(const x of (W.extra||[]))W.stage.remove(x);W.extra=[];W.parts=[];W.tw=[];}
function addX(o){W.stage.add(o);(W.extra=W.extra||[]).push(o);return o;}
function caption(a,b){W.el.querySelector(".cap").textContent=a||"";W.el.querySelector(".sub").textContent=b||"";}
// particles: sparks, embers, leaves, shards
function burst(pos,color,n,speed,life,up,size){const g=new T.BufferGeometry(),p=new Float32Array(n*3),v=[];for(let i=0;i<n;i++){p[i*3]=pos.x;p[i*3+1]=pos.y;p[i*3+2]=pos.z;
    const th=Math.random()*Math.PI*2,ph=Math.random()*Math.PI;v.push(new T.Vector3(Math.cos(th)*Math.sin(ph),Math.abs(Math.cos(ph))*(up||1),Math.sin(th)*Math.sin(ph)).multiplyScalar(speed*(0.4+Math.random()*0.8)));}
  g.setAttribute("position",new T.BufferAttribute(p,3));const m=new T.PointsMaterial({color,size:size||0.07,transparent:true,blending:T.AdditiveBlending,depthWrite:false});const pts=addX(new T.Points(g,m));let t=0;
  (W.parts=W.parts||[]).push({step(dt){t+=dt;const a=g.attributes.position;for(let i=0;i<n;i++){v[i].y-=dt*1.6;a.array[i*3]+=v[i].x*dt;a.array[i*3+1]+=v[i].y*dt;a.array[i*3+2]+=v[i].z*dt;}a.needsUpdate=true;m.opacity=Math.max(0,1-t/life);if(t>=life){W.stage.remove(pts);return false;}return true;}});}
function pillar(pos,color){const c=document.createElement("canvas");c.width=4;c.height=128;const g=c.getContext("2d"),gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(0.7,"rgba(255,255,255,.75)");gr.addColorStop(1,"rgba(255,255,255,1)");g.fillStyle=gr;g.fillRect(0,0,4,128);
  const m=new T.MeshBasicMaterial({map:new T.CanvasTexture(c),color,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const p=addX(new T.Mesh(new T.CylinderGeometry(0.55,0.55,3.2,32,1,true),m));p.position.set(pos.x,1.6,pos.z);p.scale.set(1,0.01,1);
  tween(420,k=>{p.scale.y=k;},ease.out);tween(1500,k=>{m.opacity=1-k;p.scale.x=p.scale.z=1-k*0.6;},ease.inout,()=>W.stage.remove(p));return p;}
// the card lying on the field, then flipping up
function cardMesh(art,color){const c=document.createElement("canvas");c.width=180;c.height=252;const g=c.getContext("2d");
  const col="#"+color.toString(16).padStart(6,"0");g.fillStyle="#141226";g.fillRect(0,0,180,252);g.strokeStyle=col;g.lineWidth=10;g.strokeRect(5,5,170,242);
  const gr=g.createLinearGradient(0,0,0,252);gr.addColorStop(0,col);gr.addColorStop(1,"#141226");g.fillStyle=gr;g.globalAlpha=0.55;g.fillRect(12,12,156,228);g.globalAlpha=1;
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const m=new T.Mesh(new T.PlaneGeometry(0.75,1.05),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide}));
  if(art){const im=new Image();im.onload=()=>{g.drawImage(im,12,30,156,156);tex.needsUpdate=true;};im.src=art;}
  return m;}
const skipper=()=>new Promise(r=>{W.skip=()=>{W.skip=null;W.tw.forEach(t=>{t.f(t.e?t.e(1):1);t.done&&t.done();});W.tw=[];if(W.skipT)W.skipT();r("skip");};});

/* ---------- the scenes ---------- */
async function summon(ev,info){const tpl=await loadModel(info.model);clear();const col=DOMC[info.dom]||0xffffff;W.ring.material.color.setHex(col);W.rim.color.setHex(col);
  caption(`${info.name}`,`${info.owner} summons · ${info.might} might${info.kw?" · "+info.kw:""}`);
  const card=addX(cardMesh(info.art,col));card.rotation.x=-Math.PI/2;card.position.set(0,0.01,0.2);
  const r=spawn(tpl);r.o.scale.setScalar(0.01);r.o.position.y=-0.4;glow(r,col,1.4);
  const sk=skipper();
  tween(500,k=>{card.position.y=0.01+Math.sin(k*Math.PI)*0.5;card.rotation.x=-Math.PI/2+k*Math.PI*1.0;},ease.inout);
  await Promise.race([wait(450),sk]);pillar(new T.Vector3(0,0,0),col);burst(new T.Vector3(0,0.2,0),col,140,2.2,1.4,1.6,0.06);
  tween(380,k=>{card.material.opacity=1-k;},null,()=>W.stage.remove(card));
  tween(900,k=>{r.o.scale.setScalar(Math.max(0.01,k));r.o.position.y=-0.4+0.4*k;r.o.rotation.y=(1-k)*Math.PI*1.4;},ease.back);
  tween(1400,k=>glow(r,col,1.4*(1-k)),ease.out);
  r.idle=t=>{r.o.position.y=Math.sin(t*2.2)*0.03;};
  await Promise.race([wait(2300),sk]);W.skip=null;}
async function battle(ev,info){clear();const L=info.left,Rr=info.right;W.ring.material.color.setHex(0xff4d6d);
  caption(`⚔ ${info.place}`,`${L.total} might against ${Rr.total}`);
  const [tl,tr]=await Promise.all([loadModel(L.model),loadModel(Rr.model)]);
  const a=spawn(tl),b=spawn(tr);a.o.position.set(-1.05,0,0);b.o.position.set(1.05,0,0);a.o.rotation.y=Math.PI/2;b.o.rotation.y=-Math.PI/2;
  a.o.scale.setScalar(0.01);b.o.scale.setScalar(0.01);
  const sk=skipper();
  tween(500,k=>{a.o.scale.setScalar(Math.max(.01,k));b.o.scale.setScalar(Math.max(.01,k));},ease.back);
  await Promise.race([wait(650),sk]);
  // the attacker charges, both hit
  const att=info.attackerLeft?a:b,def=info.attackerLeft?b:a,dir=info.attackerLeft?1:-1,x0=att.o.position.x;
  tween(360,k=>{att.o.position.x=x0+dir*0.85*Math.sin(k*Math.PI);},ease.inout);
  await Promise.race([wait(190),sk]);
  burst(new T.Vector3(0,0.75,0),0xffffff,90,2.6,0.7,1,0.05);burst(new T.Vector3(0,0.75,0),0xffb03d,60,1.8,0.9,1,0.08);
  glow(def,0xff2a2a,1.2);glow(att,0xff2a2a,0.6);tween(500,k=>{glow(def,0xff2a2a,1.2*(1-k));glow(att,0xff2a2a,0.6*(1-k));});
  const dx0=def.o.position.x;tween(420,k=>{def.o.position.x=dx0+dir*0.12*Math.sin(k*Math.PI*3)*(1-k);});
  shake(260);
  await Promise.race([wait(650),sk]);
  // who's left standing
  const out=[];if(info.leftLoses)out.push([a,DOMC[L.dom]]);if(info.rightLoses)out.push([b,DOMC[Rr.dom]]);
  for(const [r,c] of out)shatter(r,c);
  caption(info.result,info.detail||"");
  await Promise.race([wait(out.length?1500:1200),sk]);W.skip=null;}
async function spell(ev,info){clear();const col=DOMC[info.dom]||0xffffff;W.ring.material.color.setHex(col);caption(info.name,`${info.owner} casts · ${info.text}`);
  let r=null;if(info.model){const tpl=await loadModel(info.model);r=spawn(tpl);r.o.position.set(0,0,0);r.o.rotation.y=0.4;}
  const sk=skipper();const tgt=new T.Vector3(0,0.7,0);
  for(let i=0;i<5;i++){setTimeout(()=>{if(!W)return;const from=new T.Vector3((Math.random()-0.5)*3,2.6+Math.random(),(Math.random()-0.5)*2);
    const orb=addX(new T.Mesh(new T.SphereGeometry(0.09,12,12),new T.MeshBasicMaterial({color:col})));orb.position.copy(from);
    tween(380,k=>orb.position.lerpVectors(from,tgt,k),ease.inout,()=>{W.stage.remove(orb);burst(tgt,col,50,1.8,0.8,1,0.06);if(r)glow(r,col,1);});},i*130);}
  if(info.dom==="S")setTimeout(()=>{if(W)bolt(tgt);},500);
  await Promise.race([wait(900),sk]);
  if(r){tween(500,k=>glow(r,col,1-k));if(info.kills)shatter(r,col);}
  await Promise.race([wait(info.kills?1300:900),sk]);W.skip=null;}
async function conquer(ev,info){const tpl=await loadModel(info.model);clear();const col=DOMC[info.dom]||0xffffff;W.ring.material.color.setHex(col);
  caption(info.result,info.detail);const r=spawn(tpl);r.o.scale.setScalar(0.01);const sk=skipper();
  tween(600,k=>{r.o.scale.setScalar(Math.max(.01,k));r.o.rotation.y=(1-k)*2;},ease.back);burst(new T.Vector3(0,0.1,0),col,120,2,1.2,1.4);
  const flag=addX(new T.Group());const pole=new T.Mesh(new T.CylinderGeometry(0.02,0.02,1.4,8),new T.MeshStandardMaterial({color:0xdddddd,metalness:0.6,roughness:0.3}));pole.position.y=0.7;
  const cloth=new T.Mesh(new T.PlaneGeometry(0.55,0.34),new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.5,side:T.DoubleSide}));cloth.position.set(0.29,1.2,0);flag.add(pole,cloth);flag.traverse(n=>{if(n.isMesh)n.castShadow=true;});
  flag.position.set(1.0,0,-0.4);flag.scale.setScalar(0.01);r.idle2=t=>{cloth.rotation.y=Math.sin(t*5)*0.25;};
  tween(500,k=>flag.scale.setScalar(Math.max(.01,k)),ease.back);r.idle=t=>{r.o.position.y=Math.abs(Math.sin(t*4))*0.06;};
  await Promise.race([wait(1700),sk]);W.skip=null;}
function shatter(r,color){const pos=new T.Vector3().setFromMatrixPosition(r.o.matrixWorld);pos.y+=0.6;
  W.stage.worldToLocal(pos);for(let i=0;i<3;i++)setTimeout(()=>{if(W)burst(pos,i?color:0xffffff,80,2.4,1.2,1.2,0.07);},i*90);
  const s0=r.o.scale.x;tween(550,k=>{r.o.scale.setScalar(Math.max(0.001,s0*(1-k)));glow(r,0xffffff,k*2);},ease.inout,()=>{W.stage.remove(r.o);});}
function bolt(p){const pts=[];let x=p.x+(Math.random()-0.5)*0.4,y=3.2;while(y>p.y){pts.push(new T.Vector3(x,y,p.z));y-=0.3;x+=(Math.random()-0.5)*0.35;}pts.push(p.clone());
  const l=addX(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xfff6a0})));let n=0;const f=setInterval(()=>{l.visible=!l.visible;if(++n>5){clearInterval(f);W&&W.stage.remove(l);}},60);}
function shake(ms){const c=W.el.querySelector("canvas");c.animate([{transform:"translate(0,0)"},{transform:"translate(-8px,4px)"},{transform:"translate(7px,-5px)"},{transform:"translate(-4px,2px)"},{transform:"translate(0,0)"}],{duration:ms});}

/* ---------- the queue: scenes play one after another while the game goes on underneath ---------- */
const SCENES={summon,battle,spell,conquer};
function play(kind,info){if(!OPT.fx)return;W||world();W.q.push([kind,info]);if(W.q.length>6)W.q.splice(0,W.q.length-6);run();}
async function run(){if(W.busy||W.insp)return;W.busy=true;show(true);
  while(W.q.length&&!W.insp){const [k,info]=W.q.shift();try{await SCENES[k](k,info);}catch(e){console.warn("shards fx",e);}}
  W.busy=false;if(!W.insp){clear();caption("","");show(false);}}
/* ---------- inspect: one monster to turn around (and see in AR) with its card text ---------- */
let drag=null;
async function inspect(info){world();W.insp=true;W.q=[];if(W.skip)W.skip();clear();caption("","");W.el.classList.add("insp");show(true);
  W.el.querySelector(".info").innerHTML=info.html;
  try{const tpl=await loadModel(info.model);if(!W||!W.insp)return;const r=spawn(tpl);r.o.position.set(0,0,0);r.o.scale.setScalar(1.25);const col=DOMC[info.dom]||0xffffff;W.ring.material.color.setHex(col);W.rim.color.setHex(col);
    pillar(new T.Vector3(),col);glow(r,col,1);tween(900,k=>glow(r,col,1-k));let spin=0.4;r.idle=t=>{if(!drag)spin+=0.004;r.o.rotation.y=spin;};
    W.el.onpointerdown=e=>{drag={x:e.clientX,s:spin};};W.el.onpointermove=e=>{if(drag){spin=drag.s+(e.clientX-drag.x)/90;}};W.el.onpointerup=W.el.onpointercancel=()=>{drag=null;};}
  catch(e){W.el.querySelector(".info").innerHTML+="<br><small>The 3D model couldn't load.</small>";}}
function closeInspect(){if(!W)return;W.insp=false;W.el.classList.remove("insp");W.el.onpointerdown=W.el.onpointermove=W.el.onpointerup=null;clear();show(false);if(W.q.length)run();}
// leaving Shards: everything goes (renderer, camera, sensors, the cached models)
function stop(){if(!W)return;try{camOff();}catch(e){}cancelAnimationFrame(W.raf);try{W.R.dispose();W.R.forceContextLoss();}catch(e){}W.el.remove();removeEventListener("resize",size);W=null;
  for(const k in TPL)delete TPL[k];for(const k in LOADING)delete LOADING[k];const s=document.getElementById("sfxCss");if(s)s.remove();}
window.SHFX={play,inspect,closeInspect,stop,opt:OPT,setFx(on){OPT.fx=!!on;saveOpt();},setAR,busy:()=>!!(W&&(W.busy||W.insp))};
})();
