import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import draco3d from 'draco3dgltf';
import {dedup,prune,weld,simplify,textureCompress,quantize,center,resample} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';import sharp from 'sharp';import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule(),'draco3d.encoder':await draco3d.createEncoderModule()});
await MeshoptSimplifier.ready;
fs.mkdirSync('out',{recursive:true});
for(const f of process.argv.slice(2)){
  const d=await io.read(f);const r=d.getRoot();
  for(const e of r.listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
  let tri=0;for(const m of r.listMeshes())for(const p of m.listPrimitives()){const i=p.getIndices();tri+=(i?i.getCount():p.getAttribute('POSITION').getCount())/3;}
  const target=r.listSkins().length?9000:7000;
  for(const m of r.listMaterials()){m.setNormalTexture(null);m.setMetallicRoughnessTexture(null);m.setOcclusionTexture(null);m.setMetallicFactor(0);m.setRoughnessFactor(0.75);}
  await d.transform(dedup(),prune(),weld({tolerance:0.0001}),
    ...(tri>target?[simplify({simplifier:MeshoptSimplifier,ratio:target/tri,error:0.02,lockBorder:false})]:[]),
    textureCompress({encoder:sharp,targetFormat:'jpeg',resize:[512,512],quality:80}),prune(),quantize({quantizeNormal:10,quantizePosition:14,quantizeTexcoord:12}));
  const out='out/'+f.split('/').pop();await io.write(out,d);
  let t2=0;for(const m of r.listMeshes())for(const p of m.listPrimitives()){const i=p.getIndices();t2+=(i?i.getCount():p.getAttribute('POSITION').getCount())/3;}
  console.log(out,Math.round(tri),'->',Math.round(t2),(fs.statSync(out).size/1024).toFixed(0)+'KB');}
