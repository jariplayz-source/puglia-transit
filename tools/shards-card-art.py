import base64,os,json
from playwright.sync_api import sync_playwright
DOMC={'E':'#ff6a3d','T':'#3d9bff','G':'#4fd17a','S':'#ffd23d','N':'#c8c8ff'}
M={'baby-dragon':'E','velociraptor':'E','t-rex':'E','dragon':'E','phoenix':'E','cartoon-dragon':'T','stegosaurus':'T','chinese-dragon':'T','kraken':'T','hydra':'T','yeti':'T',
 'spinosaurus':'G','triceratops':'G','kitsune-fox':'G','brachiosaurus':'G','mammoth':'G','unicorn':'G','spirit-stag':'G','sabertooth-tiger':'S','pterodactyl':'S','griffin':'S','wyvern':'S','crystal-dragon':'S',
 'mimic-chest':'N','gargoyle':'N','werewolf':'N','stone-golem':'N'}
data={k:base64.b64encode(open('out/'+k+'.glb','rb').read()).decode() for k in M}
html="<html><body style='margin:0'><canvas id=c width=320 height=320></canvas><script>"+open('three3d.js').read()+"</script></body></html>"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"]);pg=b.new_page(viewport={'width':400,'height':400})
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.set_content(html)
    out=pg.evaluate("""async([D,M,DC])=>{const T=THREE,cv=document.getElementById('c'),R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});R.setSize(320,320,false);R.outputColorSpace=T.SRGBColorSpace;R.setClearColor(0,0);
      const L=new THREE_GLTF(),res={};
      for(const k of Object.keys(D)){const b=Uint8Array.from(atob(D[k]),c=>c.charCodeAt(0)).buffer;const g=await new Promise((ok,no)=>L.parse(b,'',ok,no));
        const sc=new T.Scene();sc.add(new T.HemisphereLight(0xffffff,0x332244,1.5));const key=new T.DirectionalLight(0xfff2dd,2.4);key.position.set(2,4,4);sc.add(key);
        const rim=new T.DirectionalLight(new T.Color(DC[M[k]]),3.2);rim.position.set(-3,2,-3);sc.add(rim);
        const o=g.scene;const bx=new T.Box3().setFromObject(o),sz=bx.getSize(new T.Vector3()),c=bx.getCenter(new T.Vector3());o.position.sub(c);const s=1.75/Math.max(sz.x,sz.y,sz.z);o.scale.setScalar(s);o.position.multiplyScalar(s);
        o.rotation.y=-0.55;sc.add(o);const cam=new T.PerspectiveCamera(32,1,0.1,50);cam.position.set(0,0.35,3.4);cam.lookAt(0,0,0);R.render(sc,cam);
        res[k]=cv.toDataURL('image/webp',0.86);}
      return res;}""",[data,M,DOMC])
    json.dump(out,open('art.json','w'));print(len(out),sum(len(v) for v in out.values())//1024,'KB',errs[:2])
    pg.set_content("<html><body style='background:#222;display:flex;flex-wrap:wrap'>"+"".join(f"<img src='{v}' width=150>" for v in out.values())+"</body></html>");pg.set_viewport_size({'width':1200,'height':700});pg.wait_for_timeout(300);pg.screenshot(path='artprev.png')
