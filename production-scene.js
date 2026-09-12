import * as THREE from './assets/vendor/three.module.js';

const STAGES=['frontend','backend','data','build','test','deploy'];
const PROJECTS=['your-senior','ubuntu-tool','mindful-u','emotion-classifier'];
const IDS=[...STAGES,...PROJECTS.map(id=>'project:'+id)];
const BLUE='#0866ed', TEAL='#00aaa2', EMERALD='#13b881';

/** A continuous, physical pipeline. The HTML shell owns routing and accessible controls. */
export async function mountProduction(container,{reducedMotion=false,onSelect=()=>{},onHover=()=>{},onProgress=()=>{},onFlowStage=()=>{},onReady=()=>{}}={}){
  if(!container?.appendChild)throw new TypeError('The production scene needs a container.');
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.94;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  // All shadow-casting geometry is stationary; the moving packets and instruments cast no shadows.
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y;';container.append(canvas);
  const scene=new THREE.Scene();scene.name='code-to-production';scene.background=new THREE.Color('#c6e1ff').multiplyScalar(2);scene.fog=new THREE.Fog(scene.background,48,115);
  const camera=new THREE.PerspectiveCamera(38,1,0.1,140),world=new THREE.Group();world.name='production-world';scene.add(world);
  const geometries=new Set(),materials=new Set(),textures=new Set(),nodes=new Map(),edges=[],pickable=[],pipeParts=[],rotators=[],pulseObjects=[],activationMaterials=[];
  let destroyed=false,ready=false,visible=true,contextAvailable=true,motion=!reducedMotion,selected=null,hovered=null,journey=null,frame=0,previousTime=0,elapsed=0,renders=0,aspect=1,flowPhase=null,projectionDirty=true,environmentSource='procedural';
  let frameWidth=1,frameHeight=1;const screenCenter=new THREE.Vector2(.5,.56);
  const cameraBase=new THREE.Vector3(),target=new THREE.Vector3(),parallax=new THREE.Vector2(),pointerTarget=new THREE.Vector2(),lastCenter=new THREE.Vector2(-1,-1);

  const material = (color, properties = {}) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.58, ...properties });
    materials.add(value); return value;
  };
  const blueMetal = material('#1874dc', { metalness: 0.48, roughness: 0.2 });
  const darkMetal = material('#081427', { metalness: 0.65, roughness: 0.31 });
  const silver = material('#cbdff3', { metalness: 0.88, roughness: 0.14 });
  const glass = material('#b6e8ff', { transparent: true, opacity: 0.2, depthWrite: false, metalness: 0.42, roughness: 0.11 });
  const cyan = material('#24bfff', { emissive: '#138eff', emissiveIntensity: 1.65, metalness: 0.2 });
  const emerald = material('#36efbe', { emissive: '#05cb98', emissiveIntensity: 1.45, metalness: 0.2 });
  const mesh = (parent, geometry, mat, x = 0, y = 0, z = 0) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
  };
  const box = (parent, w, h, d, x, y, z, mat = blueMetal) => mesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
  const cylinder = (parent, radius, height, x, y, z, mat, segments = 32) => mesh(parent, new THREE.CylinderGeometry(radius, radius, height, segments), mat, x, y, z);
  const sphereGeometry = new THREE.SphereGeometry(0.07, 12, 8);
  geometries.add(sphereGeometry);
  function shape(w, h, radius = 0.12) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2, r = Math.min(radius, w / 3, h / 3);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function rounded(parent, w, h, d, x, y, z, mat = blueMetal, radius = 0.12) {
    return mesh(parent, new THREE.ExtrudeGeometry(shape(w, h, radius), { depth: d, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2, curveSegments: 8, steps: 1 }), mat, x, y, z);
  }
  function rim(parent, w, h, x, y, z, color, horizontal = false) {
    const points = shape(w, h, 0.18).getPoints(10).map(p => horizontal ? new THREE.Vector3(p.x, 0, p.y) : new THREE.Vector3(p.x, p.y, 0));
    const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 80, horizontal ? 0.028 : 0.016, 6, true);
    geometries.add(geometry);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(horizontal ? 1.18 : 1.1) });
    materials.add(mat);
    const line = new THREE.Mesh(geometry, mat); line.position.set(x, y, z); parent.add(line); return line;
  }
  function tube(parent, points, radius = 0.026, mat = cyan) {
    return mesh(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), radius>.12?96:28, radius, radius>.12?28:6, false), mat);
  }
  function texture(draw, width = 1024, height = 640) {
    const surface = document.createElement('canvas'); surface.width = width; surface.height = height;
    const ctx = surface.getContext('2d');
    ctx.fillStyle = '#f5faff'; ctx.fillRect(0, 0, width, height);
    const text = (value, x, y, size = 28, color = '#17364d', weight = '400', mono = false) => {
      const ink=new THREE.Color(color);if(ink.r*.2126+ink.g*.7152+ink.b*.0722<.62)ink.multiplyScalar(.6);ctx.fillStyle=ink.getStyle(); ctx.font = `${weight==="400"?"600":weight} ${size}px ${mono ? 'Consolas, monospace' : 'Arial, sans-serif'}`; ctx.fillText(value, x, y);
    };
    const card = (x, y, w, h, fill = '#102e50', radius = 12) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill(); };
    draw(ctx, text, card, width, height);
    const result = new THREE.CanvasTexture(surface); result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4); textures.add(result); return result;
  }
  function screen(parent, w, h, x, y, z, map, color = '#32caff') {
    const group = new THREE.Group(); group.position.set(x, y, z); parent.add(group);
    rounded(group, w, h, 0.11, 0, 0, -0.06, whiteMetal);
    const faceMaterial = new THREE.MeshBasicMaterial({ map, toneMapped: false, fog: false }); materials.add(faceMaterial);
    mesh(group, new THREE.PlaneGeometry(w - 0.11, h - 0.11), faceMaterial, 0, 0, 0.095).castShadow = false;
    rim(group, w + 0.005, h + 0.005, 0, 0, 0.118, color);
    return group;
  }

  const whiteMetal=material('#e5f0fc',{metalness:0.36,roughness:0.2});
  // Polished enamel keeps saturated body color beneath the studio highlights.
  const enamel=color=>material(color,{metalness:.52,roughness:.17});
  const cobalt=enamel('#0054e5'),teal=enamel('#008e98'),green=enamel('#008e72');
  const lightStrip=new THREE.MeshBasicMaterial({color:new THREE.Color('#7cecff').multiplyScalar(1.25)});materials.add(lightStrip);
  const studioCanvas=document.createElement('canvas');studioCanvas.width=512;studioCanvas.height=256;
  const studioCtx=studioCanvas.getContext('2d');studioCtx.fillStyle='#244667';studioCtx.fillRect(0,0,512,256);
  for(const [x,y,w,h,color]of[[25,16,160,115,'#ffffff'],[235,28,62,158,'#e4f5ff'],[346,38,136,54,'#f8fcff'],[4,185,480,36,'#9fb3cd']]){studioCtx.fillStyle=color;studioCtx.fillRect(x,y,w,h);}
  const studioMap=new THREE.CanvasTexture(studioCanvas);studioMap.colorSpace=THREE.SRGBColorSpace;studioMap.mapping=THREE.EquirectangularReflectionMapping;textures.add(studioMap);scene.environment=studioMap;scene.environmentIntensity=0.72;
  scene.add(new THREE.HemisphereLight('#e5f5ff','#617f9e',1.35));
  const key=new THREE.DirectionalLight('#ffffff',2.6);key.position.set(-7,23,16);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-21,right:90,top:35,bottom:-65,near:0.5,far:145});key.shadow.normalBias=0.035;key.shadow.bias=-0.0001;key.shadow.radius=3;key.shadow.intensity=.7;scene.add(key);
  const fill=new THREE.DirectionalLight('#82ccff',.9);fill.position.set(14,10,-8);scene.add(fill);
  const floor=mesh(scene,new THREE.PlaneGeometry(400,400),material('#c9e0f7',{metalness:0.32,roughness:0.19,emissive:'#6685a7',emissiveIntensity:.14}),0,-4.05,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  // Soft studio lights are actual scene surfaces and environment highlights.
  // Their feathered edges avoid a flat background plate or another render pass.
  const softboxCanvas=document.createElement('canvas');softboxCanvas.width=128;softboxCanvas.height=256;const softboxCtx=softboxCanvas.getContext('2d'),softboxGradient=softboxCtx.createLinearGradient(0,0,128,0);
  for(const [at,alpha]of[[0,0],[.15,.06],[.38,.6],[.5,.9],[.62,.6],[.85,.06],[1,0]])softboxGradient.addColorStop(at,'rgba(255,255,255,'+alpha+')');softboxCtx.fillStyle=softboxGradient;softboxCtx.fillRect(0,0,128,256);
  const softboxFade=softboxCtx.createLinearGradient(0,0,0,256);softboxFade.addColorStop(0,'transparent');softboxFade.addColorStop(.16,'#fff');softboxFade.addColorStop(.84,'#fff');softboxFade.addColorStop(1,'transparent');softboxCtx.globalCompositeOperation='destination-in';softboxCtx.fillStyle=softboxFade;softboxCtx.fillRect(0,0,128,256);
  const softboxMap=new THREE.CanvasTexture(softboxCanvas);textures.add(softboxMap);
  const softboxMaterial=new THREE.MeshBasicMaterial({map:softboxMap,color:new THREE.Color('#c7eaff').multiplyScalar(1.8),transparent:true,opacity:.23,depthWrite:false});materials.add(softboxMaterial);
  for(const [x,z,w]of[[-13,-15,3.5],[-7,-20,2.2],[7,-18,3.4],[16,-15,2.5]]){const panel=mesh(scene,new THREE.PlaneGeometry(w,24),softboxMaterial,x,7,z);panel.castShadow=false;}
  const sheenMaterial=softboxMaterial.clone();sheenMaterial.opacity=.28;materials.add(sheenMaterial);
  for(const x of[-9,3,12]){const sheen=mesh(scene,new THREE.PlaneGeometry(3.8,38),sheenMaterial,x,-4.037,-6);sheen.rotation.x=-Math.PI/2;sheen.rotation.z=-.2;sheen.castShadow=false;}

  // These parts share a parent and never move independently. Batching preserves
  // the parent transform, material and shadow behavior without merging pick targets.
  function batchStatic(parts,parent){
    const buckets=new Map();
    for(const part of parts){const key=part.material.uuid+':'+part.castShadow+':'+part.receiveShadow;const list=buckets.get(key)||[];list.push(part);buckets.set(key,list);}
    for(const list of buckets.values()){
      if(list.length<2)continue;
      const arrays={position:[],normal:[],uv:[]},indices=[];let offset=0;
      for(const part of list){part.updateMatrix();const geometry=part.geometry.clone().applyMatrix4(part.matrix);for(const name of Object.keys(arrays))arrays[name].push(geometry.attributes[name].array);const index=geometry.index?.array;for(let i=0;i<(index?.length||geometry.attributes.position.count);i++)indices.push((index?index[i]:i)+offset);offset+=geometry.attributes.position.count;geometry.dispose();}
      const combined=new THREE.BufferGeometry();for(const [name,chunks]of Object.entries(arrays)){const values=new Float32Array(chunks.reduce((n,a)=>n+a.length,0));let start=0;for(const chunk of chunks){values.set(chunk,start);start+=chunk.length;}combined.setAttribute(name,new THREE.BufferAttribute(values,name==='uv'?2:3));}combined.setIndex(indices);combined.computeBoundingSphere();
      const first=list[0],joined=mesh(parent,combined,first.material);joined.castShadow=first.castShadow;joined.receiveShadow=first.receiveShadow;
      for(const part of list){parent.remove(part);geometries.delete(part.geometry);part.geometry.dispose();}
    }
  }

  function addNode(id,position,title,color=BLUE){
    const group=new THREE.Group();group.name='destination:'+id;group.position.set(...position);world.add(group);
    const node={id,group,position:new THREE.Vector3(...position),title,color,look:new THREE.Vector3(...position).add(new THREE.Vector3(0,1.2,0)),distance:8.6};nodes.set(id,node);return node;
  }
  function tag(node){node.group.traverse(object=>{if(object.isMesh){object.userData.destination=node.id;pickable.push(object);}});}
  function label(parent,value,x,y,z,width=2.25,color=BLUE){
    const map=texture((ctx,text,card)=>{card(0,0,768,128,'#f1f8ff',0);ctx.fillStyle=color;ctx.fillRect(0,0,9,128);text(value,29,85,51,'#102946','700');},768,128);
    return screen(parent,width,0.39,x,y,z,map,color);
  }
  function slab(parent,w,d,x,y,z){const p=rounded(parent,w,d,0.16,x,y,z,whiteMetal,0.26);p.rotation.x=-Math.PI/2;p.userData.framingIgnore=true;const edge=rim(parent,w,d,x,y+0.18,z,'#aad7f5',true);edge.userData.framingIgnore=true;return p;}
  function ring(parent,r,x,y,z,color=BLUE){
    const body=cylinder(parent,r,0.24,x,y,z,silver,40);body.rotation.x=Math.PI/2;
    const inset=cylinder(parent,r*0.78,0.265,x,y,z,material(color,{metalness:0.4,roughness:0.2}));inset.rotation.x=Math.PI/2;
    inset.material.emissive=new THREE.Color(color);activationMaterials.push({id:parent.name.replace('destination:',''),material:inset.material});
    mesh(parent,new THREE.TorusGeometry(r*0.84,0.025,8,48),lightStrip,x,y,z+0.155).castShadow=false;
    return body;
  }
  function icon(parent,type,x,y,z,size=0.8,color=BLUE){
    const map=texture((ctx,text)=>{
      ctx.clearRect(0,0,256,256);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=14;ctx.lineCap='round';ctx.lineJoin='round';
      if(type==='check'){ctx.beginPath();ctx.moveTo(53,131);ctx.lineTo(103,179);ctx.lineTo(204,76);ctx.stroke();}
      if(type==='branch'){ctx.beginPath();ctx.moveTo(84,48);ctx.lineTo(84,207);ctx.moveTo(84,153);ctx.bezierCurveTo(84,93,180,165,180,55);ctx.stroke();for(const [a,b]of[[84,42],[84,209],[180,43]]){ctx.beginPath();ctx.arc(a,b,17,0,Math.PI*2);ctx.fill();}}
      if(type==='rocket'){ctx.save();ctx.translate(132,133);ctx.rotate(.52);ctx.beginPath();ctx.moveTo(0,-86);ctx.bezierCurveTo(40,-42,40,18,25,48);ctx.lineTo(-25,48);ctx.bezierCurveTo(-40,18,-40,-42,0,-86);ctx.stroke();ctx.beginPath();ctx.arc(0,-23,15,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-25,23);ctx.lineTo(-52,63);ctx.lineTo(-25,54);ctx.moveTo(25,23);ctx.lineTo(52,63);ctx.lineTo(25,54);ctx.moveTo(-9,63);ctx.lineTo(-9,89);ctx.moveTo(11,63);ctx.lineTo(11,78);ctx.stroke();ctx.restore();}
      if(type==='terminal'){text('>_',31,173,130,color,'700',true);}
      if(type==='chat'){ctx.beginPath();ctx.roundRect(32,47,193,143,25);ctx.stroke();ctx.beginPath();ctx.moveTo(69,189);ctx.lineTo(59,225);ctx.lineTo(112,190);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(79+i*50,120,9,0,Math.PI*2);ctx.fill();}}
      if(type==='heart'){ctx.beginPath();ctx.moveTo(128,216);ctx.bezierCurveTo(-33,103,61,-6,128,76);ctx.bezierCurveTo(199,-7,289,103,128,216);ctx.stroke();}
      if(type==='emotion'){ctx.beginPath();ctx.arc(128,128,91,0,Math.PI*2);ctx.stroke();for(const x of[92,165]){ctx.beginPath();ctx.arc(x,106,8,0,Math.PI*2);ctx.fill();}ctx.beginPath();ctx.arc(128,139,44,.18,Math.PI-.18);ctx.stroke();}
    },256,256);
    const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false,fog:false});materials.add(mat);const p=mesh(parent,new THREE.PlaneGeometry(size,size),mat,x,y,z);p.castShadow=false;return p;
  }
  function gear(parent,x,y,z,r=0.5){
    const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
    mesh(group,new THREE.TorusGeometry(r*0.61,r*.2,10,32),cobalt);
    for(let i=0;i<10;i++){const a=i*Math.PI/5;const tooth=box(group,r*.26,r*.3,.18,Math.cos(a)*r*.9,Math.sin(a)*r*.9,0,cobalt);tooth.rotation.z=a-Math.PI/2;}
    const center=cylinder(group,r*.24,.22,0,0,0,silver,24);center.rotation.x=Math.PI/2;group.traverse(o=>{o.castShadow=false;});batchStatic([...group.children],group);rotators.push({object:group,speed:.16,axis:'z'});return group;
  }
  function pipeline(from,to,points,color=BLUE,radius=.34){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    const pipeMat=color===BLUE?cobalt:color===TEAL?teal:green;
    const parts=[];parts.push(mesh(world,new THREE.TubeGeometry(curve,64,radius,28,false),pipeMat));
    const tracePoints=curve.getPoints(72).map(p=>p.add(new THREE.Vector3(0,radius*.42,radius*.92)));
    const traceCurve=new THREE.CatmullRomCurve3(tracePoints);const trace=mesh(world,new THREE.TubeGeometry(traceCurve,56,.019,5,false),lightStrip);trace.castShadow=false;parts.push(trace);
    for(const t of[.06,.93]){const at=curve.getPoint(t),joint=mesh(world,new THREE.TorusGeometry(radius+.038,.075,10,28),silver,...at.toArray());joint.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangent(t));parts.push(joint);}
    // Alcove conduits remain separate from the core so closeups can cull them.
    if(to.startsWith('project:'))batchStatic(parts,world);else pipeParts.push(...parts);
    const edge={from,to,curve,traceCurve,length:traceCurve.getLength()};edges.push(edge);
    return edge;
  }

  function heading(parent,value,x,y,z,width=2.8,color='#082f64'){
    const map=texture((ctx,text)=>{ctx.clearRect(0,0,768,128);text(value,8,90,67,color,'700');},768,128);
    const mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false,fog:false});materials.add(mat);
    const label=mesh(parent,new THREE.PlaneGeometry(width,width/6),mat,x,y,z);label.castShadow=false;return label;
  }
  function codeDiff(parent,file,removed,added,color){
    const map=texture((ctx,text,card)=>{
      card(0,0,720,360,'#f4f9ff',0);card(0,0,720,77,'#dfedfb',0);
      text(file,28,52,32,'#0a2c50','700',true);
      card(20,100,680,78,'#ffe6e7',7);text('− '+removed,34,151,32,'#ab253f','600',true);
      card(20,201,680,78,'#d6f5e8',7);text('+ '+added,34,252,32,'#086447','600',true);
      text('reviewed change',30,329,23,'#4b687e','600',true);
    },720,360);
    return screen(parent,2.8,1.42,-.48,1.02,.28,map,color);
  }
  function jointPair(node){
    for(const x of[-2.07,1.98]){ring(node.group,.43,x,0,.26,node.color);const seal=mesh(node.group,new THREE.TorusGeometry(.34,.065,10,32),silver,x,0,.45);seal.castShadow=false;}
    const check=ring(node.group,.18,2.01,.55,.27,EMERALD);icon(node.group,'check',2.01,.55,.45,.23,'#ffffff');check.castShadow=false;
  }

  const source=addNode('source',[-7.15,.45,.1],'Source',BLUE);
  const sourceUi=texture((ctx,text,card)=>{text('UI / UX',30,66,42,'#0b3157','700');text('Design system',30,115,35,'#0b3157','700');card(28,160,340,370,'#d9eafa');card(47,182,82,90,BLUE);text('◆',68,242,43,'#fff','700');for(let i=0;i<4;i++){card(148,187+i*77,195-i%2*37,20,i===0?'#529feb':'#91b6d8',7);card(148,216+i*77,157-i%2*32,12,'#b7d1e6',5);}for(let i=0;i<3;i++)card(48,308+i*70,66,48,i===0?'#22bca8':'#84b9ec');},400,565);
  screen(source.group,1.95,2.67,0,1.06,.26,sourceUi,BLUE);ring(source.group,.46,0,-.55,.3,BLUE);icon(source.group,'branch',0,-.55,.47,.6,'#fff');
  source.group.traverse(object=>{if(object.isMesh){object.userData.destination='frontend';pickable.push(object);}});
  const frontend=addNode('frontend',[-3.3,2.45,0],'Frontend',BLUE),backend=addNode('backend',[-3.3,-.2,0],'APIs / Backend',TEAL),data=addNode('data',[-3.3,-2.85,0],'Database',EMERALD);
  const merge=addNode('merge',[1.05,.0,0],'Merge',TEAL);ring(merge.group,.37,0,0,.12,TEAL);
  const build=addNode('build',[2.6,.0,0],'Build',BLUE),test=addNode('test',[4.2,.0,0],'Test',TEAL),deploy=addNode('deploy',[5.8,.0,0],'Deploy',BLUE);
  for(const node of[frontend,backend,data]){
    jointPair(node);heading(node.group,node.title,-.32,2.02,.25,3.7,node.color===BLUE?'#034ea9':'#075e5a');
    pipeline('source',node.id,[source.position.toArray(),[-6.35,.45,.1],[-5.9,node.position.y,.04],node.position.toArray()],node.color,.34);
    pipeline(node.id,'merge',[node.position.toArray(),[-.8,node.position.y,0],[.22,node.position.y*.52,.01],merge.position.toArray()],node.color,.34);
  }
  codeDiff(frontend.group,'components / Button.js','className="btn"','className="btn primary"',BLUE);
  codeDiff(backend.group,'routes / project.js','res.send(data)','res.json(data)',TEAL);
  codeDiff(data.group,'schema.sql','name TEXT','name VARCHAR(255)',EMERALD);
  const frontPreview=texture((ctx,text,card)=>{card(0,0,280,450,'#eaf5ff',0);card(0,0,280,55,BLUE,0);for(let i=0;i<3;i++){card(19,90+i*106,64,72,['#1b77e4','#47a9f3','#79c8e4'][i]);card(103,99+i*106,154,18,'#76a4ce',5);card(103,134+i*106,120,13,'#b3d0e7',4);}},280,450);
  screen(frontend.group,.92,1.5,1.45,1.08,.3,frontPreview,BLUE);
  const apiPreview=texture((ctx,text,card)=>{card(0,0,330,450,'#102b47',0);for(let i=0;i<5;i++){card(23,44+i*77,31,31,i===0?'#1b8de9':'#3ca49c',5);card(73,46+i*77,224-i%2*53,13,'#5898b7',4);card(73,71+i*77,167,10,'#365f7b',3);}},330,450);
  screen(backend.group,.96,1.42,1.44,1.06,.31,apiPreview,TEAL);
  const dbBack=rounded(data.group,1.04,1.48,.1,1.44,1.05,.11,cobalt,.1);dbBack.castShadow=false;
  for(let i=0;i<3;i++){cylinder(data.group,.3,.29,1.44,.65+i*.3,.43,silver,28);cylinder(data.group,.306,.032,1.44,.805+i*.3,.43,teal,28);}

  // One transparent delivery capsule wraps the three real selectable instruments.
  pipeline('merge','build',[merge.position.toArray(),[1.75,0,0],build.position.toArray()],BLUE,.38);
  pipeline('build','test',[build.position.toArray(),[3.4,0,0],test.position.toArray()],BLUE,.38);
  pipeline('test','deploy',[test.position.toArray(),[5,0,0],deploy.position.toArray()],TEAL,.38);
  const capsule=new THREE.Group();capsule.name='delivery-capsule';capsule.position.set(4.2,.05,.13);world.add(capsule);
  const shell=mesh(capsule,new THREE.CylinderGeometry(.96,.96,4.9,40,1,true),glass);shell.rotation.z=Math.PI/2;shell.castShadow=false;
  for(const x of[-2.45,2.45]){const collar=mesh(capsule,new THREE.TorusGeometry(.96,.048,10,56),whiteMetal,x,0,0);collar.rotation.y=Math.PI/2;collar.castShadow=false;}
  for(const node of[build,test,deploy]){
    ring(node.group,.45,0,.14,.93,node.color);heading(node.group,node.title,.1,-.56,1.03,1.32,'#123854');
    const border=mesh(node.group,new THREE.TorusGeometry(.87,.022,8,48),lightStrip,0,.05,.13);border.rotation.y=Math.PI/2;border.castShadow=false;
  }
  gear(build.group,0,.14,1.13,.23);icon(test.group,'check',0,.14,1.13,.51,'#ffffff');icon(deploy.group,'rocket',0,.14,1.13,.57,'#ffffff');
  const testLights=[];for(let i=0;i<3;i++){const led=mesh(test.group,new THREE.SphereGeometry(.045,10,8),lightStrip,-.14+i*.14,-.31,1.08);led.castShadow=false;testLights.push(led);}
  for(const x of[3.38,4.97])heading(world,'→',x,-.12,1.05,.42,'#155275');

  const showcase=addNode('showcase',[4.15,2.8,-.15],'Projects',BLUE);
  const showcaseBack=rounded(showcase.group,5.5,2.86,.14,0,0,-.2,glass,.24);showcaseBack.castShadow=false;rim(showcase.group,5.53,2.9,0,0,.0,'#a4dcff');heading(showcase.group,'Projects',-1.19,1.02,.13,2.35,'#0b2f5a');
  const projectDefinitions=[
    {slug:'your-senior',title:'Your Senior',icon:'chat',color:BLUE,portal:[2.9,2.98,.08],position:[25,-2.75,-9]},
    {slug:'ubuntu-tool',title:'Ubuntu Tool',icon:'terminal',color:TEAL,portal:[5.4,2.98,.08],position:[43,-2.75,-9]},
    {slug:'mindful-u',title:'Mindful U',icon:'heart',color:EMERALD,portal:[2.9,1.93,.08],position:[61,-2.75,-9]},
    {slug:'emotion-classifier',title:'Emotion classifier',icon:'emotion',color:BLUE,portal:[5.4,1.93,.08],position:[79,-2.75,-9]}
  ];
  for(const p of projectDefinitions){
    const portal=addNode('portal:'+p.slug,p.portal,p.title,p.color);
    const map=texture((ctx,text,card)=>{card(0,0,660,220,p.slug==='ubuntu-tool'?'#103550':'#e2f1ff',0);text(p.title,32,80,47,p.slug==='ubuntu-tool'?'#ffffff':'#0a3558','700');text('Open project  →',32,160,32,p.slug==='ubuntu-tool'?'#79e6dc':'#0876ca','700');},660,220);
    screen(portal.group,2.24,.77,0,0,.16,map,p.color);
    portal.group.traverse(o=>{if(o.isMesh){o.userData.destination='project:'+p.slug;pickable.push(o);}});
    // The connected project rail passes beneath the studio floor, then enters
    // each separate exhibit. Its hidden section remains part of camera routing.
    const curve=new THREE.CatmullRomCurve3([deploy.position.clone(),new THREE.Vector3(7,-4.8,0),new THREE.Vector3(p.position[0]-6,-4.8,p.position[2]+2),new THREE.Vector3(...p.position)],false,'centripetal');
    edges.push({from:'deploy',to:portal.id,curve:new THREE.LineCurve3(deploy.position,portal.position)});edges.push({from:portal.id,to:'project:'+p.slug,curve});
    const exhibit=addNode('project:'+p.slug,p.position,p.title,p.color);
    const plinth=slab(exhibit.group,7.5,4.6,0,-.12,.25);
    for(const x of[-2.7,2.7])cylinder(exhibit.group,.58,1.2,x,-.71,.15,silver,28);
    const localPipe=tube(exhibit.group,[[-9,.07,2.05],[-3,.03,2.15],[-1,0,2.45],[1,.02,2.48],[3,.11,2.17],[9,.23,1.9]],.34,cobalt);localPipe.userData.framingIgnore=true;
    ring(exhibit.group,.53,-1.7,.04,2.63,p.color);icon(exhibit.group,p.icon,-1.7,.04,2.83,.68,'#fff');
    for(const x of[.5,3.6]){const collar=mesh(exhibit.group,new THREE.TorusGeometry(.38,.075,10,32),silver,x,.07,2.35);collar.rotation.y=Math.PI/2;collar.userData.framingIgnore=true;}
    exhibit.group.traverse(object=>{if(object.isMesh)object.userData.framingIgnore=true;});
  }
  const projectBadge=addNode('project-badge',[4.7,-2.1,.12],'Project showcase',BLUE);
  ring(projectBadge.group,.6,0,0,.24,BLUE);icon(projectBadge.group,'branch',0,0,.43,.84,'#fff');label(projectBadge.group,'VIEW PROJECTS',1.97,-.02,.34,2.82,BLUE);
  projectBadge.group.traverse(o=>{if(o.isMesh){o.userData.destination='projects';pickable.push(o);}});
  pipeline('deploy','project-badge',[deploy.position.toArray(),[6.67,-.32,.03],[6.2,-1.6,.06],projectBadge.position.toArray()],BLUE,.37);
  for(const x of[-6.7,-1.75,5.9]){cylinder(world,.71,.18,x,-3.91,.02,silver,36);cylinder(world,.31,.93,x,-3.37,.02,whiteMetal,28);}
  const senior=nodes.get('project:your-senior').group;
  const seniorMap=texture((ctx,text,card)=>{
    card(0,0,1050,60,'#e0effc',0);text('YOUR SENIOR',29,41,27,BLUE,'700');text('DOCUMENT SEARCH',665,40,18,'#5182a4');
    card(0,61,221,609,'#edf5fc',0);text('+ New chat',24,126,27,BLUE,'700');['Conversations','Documents','Source library'].forEach((v,i)=>text(v,24,205+i*55,22,'#5c7a91'));
    text('Search documents',267,138,53,'#18324a','700');text('Ask a question',267,200,53,BLUE,'700');
    card(387,252,617,75,'#126fdf');text('Summarize the design notes.',412,299,26,'#ffffff');
    card(270,354,686,167,'#e7f4fc');text('Answer',294,397,29,'#164469','700');text('Source: Design notes.pdf · Passage 04',294,442,24,'#597992');card(293,467,232,34,'#c4e6f7');text('↗  View source',307,491,20,'#12609b','700');
    card(268,553,736,72,'#f8fcff');text('Ask a question…',292,599,26,'#7591a7');card(930,562,59,55,BLUE);text('↑',947,601,31,'#fff','700');
  },1050,670);
  screen(senior,5.05,3.23,-.53,1.93,-.2,seniorMap,BLUE);box(senior,1.25,.12,.72,-.53,.18,0,silver);box(senior,.16,.5,.16,-.53,.45,-.38,silver);
  const sourceMap=texture((ctx,text,card)=>{text('SOURCE',23,52,29,BLUE,'700');text('Design notes.pdf',23,108,26,'#1b465e','700');for(let i=0;i<6;i++)card(24,146+i*27,245-(i%3)*30,7,i===2?'#53b9ee':'#b6d0e2',2);card(23,339,247,78,'#d9effa');text('Passage 04',39,385,25,'#146997','700');},300,440);
  const sources=screen(senior,1.5,2.23,2.33,1.57,.79,sourceMap,TEAL);sources.rotation.y=-.18;
  for(let i=0;i<3;i++){const sheet=rounded(senior,.82,1.1,.045,-2.94+i*.09,.74+i*.04,.92-i*.1,whiteMetal,.08);sheet.rotation.z=.1-i*.05;}

  const ubuntu=nodes.get('project:ubuntu-tool').group;
  const terminalMap=texture((ctx,text,card)=>{ctx.fillStyle='#07172c';ctx.fillRect(0,0,650,790);card(0,0,650,57,'#19324a',0);for(const[i,c]of['#ff756f','#ffc659','#65db9d'].entries()){ctx.fillStyle=c;ctx.beginPath();ctx.arc(25+i*26,28,7,0,Math.PI*2);ctx.fill();}text('Terminal',132,37,23,'#d8edfc');['$ config.yaml → apply → validate','','packages:','  - git','  - curl','  - build-essential','  - python3','','hostname: devbox','timezone: Europe/Dublin','','apply → validate → report','  → Installing packages…','  → Setting hostname…','  → Writing JSON report…','','status: SUCCESS'].forEach((v,i)=>text(v,25,110+i*36,22,i===16?'#62e2aa':i===0||i===11?'#f0fbff':'#abd0e1','400',true));},650,790);
  screen(ubuntu,3.38,3.53,-1.87,1.96,.02,terminalMap,'#57a5cf');
  const configMap=texture((ctx,text,card)=>{text('Configuration',27,59,41,'#17334e','700');for(const[i,k]of['Hostname','Timezone','Packages'].entries()){text(k,30,126+i*108,26,'#47708d');card(200,91+i*108,442,69,'#e4eff8');text(['devbox','Europe / Dublin','git · curl · python3'][i],220,135+i*108,25,'#254e6b');}card(29,425,612,74,'#00a99b');text('Apply configuration',126,473,30,'#ffffff','700');text('Validation result',31,558,32,'#194261','700');['Packages installed','Hostname applied','Report generated'].forEach((v,i)=>{card(29,589+i*57,612,48,'#e7f4f4');text('✓',43,623+i*57,25,'#00a27d','700');text(v,94,623+i*57,25,'#386575');});},680,800);
  const config=screen(ubuntu,3.65,3.57,1.89,1.96,.14,configMap,TEAL);config.rotation.y=-.09;
  slab(ubuntu,5.5,.96,0,.14,1.35);const keys=[];for(let i=0;i<16;i++)keys.push(box(ubuntu,.19,.035,.19,-2.15+i*.28,.36,1.45,i%5===0?teal:whiteMetal));batchStatic(keys,ubuntu);

  const mindful=nodes.get('project:mindful-u').group;
  const mindfulMap=texture((ctx,text,card)=>{ctx.fillStyle='#edf9f4';ctx.fillRect(0,0,570,850);text('MINDFUL U',34,62,31,'#137e6d','700');text('Activities',35,160,50,'#254e51','700');text('Breathing exercise',35,218,50,'#254e51','700');const g=ctx.createRadialGradient(290,407,15,290,407,150);g.addColorStop(0,'#d0f8e6');g.addColorStop(.62,'#7ddab9');g.addColorStop(1,'#c4f0dc');ctx.fillStyle=g;ctx.beginPath();ctx.arc(290,408,145,0,Math.PI*2);ctx.fill();text('Breathe in',182,422,38,'#1b7265','700');card(33,609,503,88,'#117f74');text('Start exercise',112,664,31,'#ffffff','700');text('Breathing    Journal',45,769,28,'#589488');},570,850);
  const mindfulPhone=screen(mindful,2.21,3.34,-1.19,1.93,.37,mindfulMap,EMERALD);mindfulPhone.rotation.z=-.04;mindfulPhone.rotation.y=.12;
  const orb=mesh(mindful,new THREE.SphereGeometry(.73,40,24),material('#78dcc4',{metalness:.25,roughness:.18,transparent:true,opacity:.88}),1.54,2.5,.1);orb.castShadow=false;pulseObjects.push(orb);
  for(let i=0;i<3;i++){const ringMesh=mesh(mindful,new THREE.TorusGeometry(.96+i*.15,.026,7,56),i===1?silver:teal,1.54,2.5,.1);ringMesh.rotation.x=.24+i*.68;ringMesh.rotation.y=.34;ringMesh.castShadow=false;rotators.push({object:ringMesh,speed:.1+i*.025,axis:'z'});}
  const journalMap=texture((ctx,text,card)=>{text('Daily check-in',29,57,35,'#236655','700');text('How are you feeling?',29,114,27,'#5c8c7d');for(let i=0;i<4;i++){ctx.fillStyle=['#54bda1','#7fceb6','#afdcc8','#cceadd'][i];ctx.beginPath();ctx.arc(69+i*113,200,35,0,Math.PI*2);ctx.fill();}card(29,278,440,82,'#e0f2e9');text('Add a journal entry',51,328,27,'#528372');},500,400);
  const journal=screen(mindful,2.67,1.92,1.5,.78,1.03,journalMap,EMERALD);journal.rotation.x=-.13;

  const emotion=nodes.get('project:emotion-classifier').group;
  const signalMap=texture((ctx,text)=>{text('FEATURE INPUT',24,48,27,BLUE,'700');ctx.strokeStyle='#249fd2';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<520;i++){const y=175+Math.sin(i*.08)*Math.sin(i*.011)*77;i?ctx.lineTo(i+21,y):ctx.moveTo(i+21,y);}ctx.stroke();text('Extract → normalize',27,305,26,'#567c94','700');},565,360);
  const signal=screen(emotion,2.51,1.66,-2.12,1.57,.09,signalMap,BLUE);signal.rotation.y=.16;
  const graph=new THREE.Group();graph.position.set(.33,1.45,.2);emotion.add(graph);
  const graphPoints=[];for(let col=0;col<3;col++)for(let row=0;row<3;row++){const p=[-.65+col*.68,-.65+row*.66,col%2?-.17:.05];graphPoints.push(p);mesh(graph,new THREE.SphereGeometry(.14,16,12),col===2?green:cobalt,...p);}
  const graphLinks=[];for(let col=0;col<2;col++)for(let a=0;a<3;a++)for(let b=0;b<3;b++)graphLinks.push(tube(graph,[graphPoints[col*3+a],graphPoints[(col+1)*3+b]],.014,silver));batchStatic(graphLinks,graph);
  const resultMap=texture((ctx,text,card)=>{text('CLASSIFICATION',21,48,25,BLUE,'700');['Joy','Sadness','Fear','Surprise'].forEach((v,i)=>{text(v,24,107+i*65,25,'#355775');card(140,83+i*65,215,30,'#dfebf3');card(140,83+i*65,[179,104,49,26][i],30,i===0?'#008fbb':'#94c9da');});text('MODEL OUTPUT',24,386,20,'#7b98a9','700');},400,425);
  screen(emotion,1.91,2.03,2.12,1.43,.12,resultMap,TEAL);
  tube(emotion,[[-3,.31,1.22],[-1.8,.37,1.45],[0,.37,1.47],[1.8,.37,1.45],[3,.31,1.22]],.07,cobalt);
  batchStatic(pipeParts,world);
  for(const id of IDS)tag(nodes.get(id));

  const request=new THREE.Group();request.name='production-commit';scene.add(request);const requestCore=mesh(request,new THREE.IcosahedronGeometry(.13,1),lightStrip);requestCore.castShadow=false;
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const glowCtx=glowCanvas.getContext('2d'),gradient=glowCtx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.9)');gradient.addColorStop(.18,'rgba(255,255,255,.3)');gradient.addColorStop(1,'rgba(255,255,255,0)');glowCtx.fillStyle=gradient;glowCtx.fillRect(0,0,128,128);const glowTexture=new THREE.CanvasTexture(glowCanvas);textures.add(glowTexture);
  const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,color:'#159cff',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});materials.add(glowMaterial);const glow=new THREE.Sprite(glowMaterial);glow.geometry=glow.geometry.clone();geometries.add(glow.geometry);glow.scale.setScalar(1.1);request.add(glow);request.visible=false;

  // A release cycle has three contributions, one explicit merge and one ordered
  // delivery commit. Curve arc lengths keep the visible speed in world units.
  const FLOW_SPEED=2.25,SOURCE_HOLD=.75,STAGE_HOLD=.5,MERGE_HOLD=.65,TRAIL_COUNT=14;
  const edgeFor=(from,to)=>edges.find(edge=>edge.from===from&&edge.to===to);
  const contributionTracks=['frontend','backend','data'].map(id=>{const incoming=edgeFor('source',id),outgoing=edgeFor(id,'merge'),arrival=SOURCE_HOLD+incoming.length/FLOW_SPEED;return{id,incoming,outgoing,arrival,departure:arrival+STAGE_HOLD,end:arrival+STAGE_HOLD+outgoing.length/FLOW_SPEED};});
  const mergeTime=Math.max(...contributionTracks.map(track=>track.end)),releaseTracks=[];let releaseTime=mergeTime+MERGE_HOLD;
  for(const [from,id]of[['merge','build'],['build','test'],['test','deploy']]){const edge=edgeFor(from,id),start=releaseTime,arrival=start+edge.length/FLOW_SPEED;releaseTracks.push({id,edge,start,arrival,end:arrival+STAGE_HOLD});releaseTime=arrival+STAGE_HOLD;}
  const cycleDuration=releaseTime+1.1,packetStates=Array.from({length:4},()=>({visible:false,distance:0,edge:null,position:new THREE.Vector3()}));
  const packetMaterial=new THREE.MeshBasicMaterial({color:0xffffff});materials.add(packetMaterial);
  const heads=new THREE.InstancedMesh(sphereGeometry,packetMaterial,4);heads.name='flow-commit-heads';heads.frustumCulled=false;heads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);world.add(heads);
  const trailGeometry=new THREE.CylinderGeometry(1,1,1,6,1,true);geometries.add(trailGeometry);
  const trails=new THREE.InstancedMesh(trailGeometry,packetMaterial,4*TRAIL_COUNT);trails.name='flow-commit-trails';trails.frustumCulled=false;trails.instanceMatrix.setUsage(THREE.DynamicDrawUsage);world.add(trails);
  const packetMatrix=new THREE.Object3D(),tailStart=new THREE.Vector3(),tailEnd=new THREE.Vector3(),tailDirection=new THREE.Vector3(),axisY=new THREE.Vector3(0,1,0);
  const packetColors=['#2a8bff','#00c8cd','#14dbaa','#5cfcce'].map(color=>new THREE.Color(color).multiplyScalar(3.5));
  for(let i=0;i<4;i++){heads.setColorAt(i,packetColors[i]);for(let j=0;j<TRAIL_COUNT;j++)trails.setColorAt(i*TRAIL_COUNT+j,packetColors[i].clone().multiplyScalar(1-j/TRAIL_COUNT*.72));}
  function paintPacket(index,edge,distance,shown=true){
    const state=packetStates[index];state.visible=shown;state.edge=edge;state.distance=distance;
    edge.traceCurve.getPointAt(THREE.MathUtils.clamp(distance/edge.length,0,1),state.position);
    packetMatrix.position.copy(state.position);packetMatrix.quaternion.identity();packetMatrix.scale.setScalar(shown?1.55:0);packetMatrix.updateMatrix();heads.setMatrixAt(index,packetMatrix.matrix);
    for(let j=0;j<TRAIL_COUNT;j++){
      const ahead=distance-j*.085,behind=Math.max(0,ahead-.088);let length=0;
      if(shown&&ahead>0){edge.traceCurve.getPointAt(THREE.MathUtils.clamp(ahead/edge.length,0,1),tailStart);edge.traceCurve.getPointAt(THREE.MathUtils.clamp(behind/edge.length,0,1),tailEnd);tailDirection.subVectors(tailStart,tailEnd);length=tailDirection.length();packetMatrix.position.copy(tailStart).add(tailEnd).multiplyScalar(.5);if(length>0)packetMatrix.quaternion.setFromUnitVectors(axisY,tailDirection.multiplyScalar(1/length));}
      const radius=.04*(1-j/TRAIL_COUNT*.78);packetMatrix.scale.set(radius,length,radius);packetMatrix.updateMatrix();trails.setMatrixAt(index*TRAIL_COUNT+j,packetMatrix.matrix);
    }
  }
  function updateFlow(){
    const time=elapsed%cycleDuration,activation=new Map();let phase='source';
    if(time>=SOURCE_HOLD)phase='contributions';if(time>=mergeTime)phase='merge';
    activation.set('source',time<SOURCE_HOLD?1:.04);
    for(const [index,track]of contributionTracks.entries()){
      const outgoing=time>=track.departure,edge=outgoing?track.outgoing:track.incoming;
      const distance=outgoing?(time-track.departure)*FLOW_SPEED:Math.max(0,time-SOURCE_HOLD)*FLOW_SPEED;
      paintPacket(index,edge,Math.min(edge.length,distance),time<track.end);
      activation.set(track.id,Math.exp(-Math.abs(time-track.arrival)*2.7));
    }
    activation.set('merge',Math.exp(-Math.abs(time-mergeTime)*2.5));
    let release=releaseTracks[0];for(const stage of releaseTracks){if(time>=stage.start)release=stage;activation.set(stage.id,Math.exp(-Math.abs(time-stage.arrival)*2.8));}
    if(time>=releaseTracks[0].start)phase=release.id;
    paintPacket(3,release.edge,THREE.MathUtils.clamp((time-release.start)*FLOW_SPEED,0,release.edge.length),time>=releaseTracks[0].start&&time<releaseTime+.65);
    for(const signal of activationMaterials)signal.material.emissiveIntensity=(activation.get(signal.id)||0)*1.7;
    for(const [index,led]of testLights.entries())led.scale.setScalar(time>=releaseTracks[1].arrival+index*.12&&time<releaseTracks[2].arrival?1.6:.8);
    heads.instanceMatrix.needsUpdate=true;trails.instanceMatrix.needsUpdate=true;
    if(phase!==flowPhase){flowPhase=phase;onFlowStage(phase);}
  }

  // Linear render targets; only the final composite tone-maps and converts to sRGB.
  const targetOptions={type:THREE.HalfFloatType,depthBuffer:false};
  const sceneTarget=new THREE.WebGLRenderTarget(1,1,{...targetOptions,depthBuffer:true,samples:2});
  const bloomA=new THREE.WebGLRenderTarget(1,1,targetOptions),bloomB=new THREE.WebGLRenderTarget(1,1,targetOptions);
  const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),postGeometry=new THREE.PlaneGeometry(2,2);geometries.add(postGeometry);
  const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  const thresholdMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:sceneTarget.texture}},vertexShader,fragmentShader:'uniform sampler2D source;varying vec2 vUv;void main(){vec3 c=texture2D(source,vUv).rgb;float v=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(1.8,3.2,v),1.0);}'});
  const blurMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:bloomA.texture},direction:{value:new THREE.Vector2()}},vertexShader,fragmentShader:'uniform sampler2D source;uniform vec2 direction;varying vec2 vUv;void main(){vec3 c=vec3(0.0);float total=0.0;for(int i=-6;i<=6;i++){float weight=exp(-float(i*i)/18.0);c+=texture2D(source,vUv+direction*float(i)).rgb*weight;total+=weight;}gl_FragColor=vec4(c/total,1.0);}'});
  const compositeMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{source:{value:sceneTarget.texture},bloom:{value:bloomA.texture}},vertexShader,fragmentShader:`uniform sampler2D source;uniform sampler2D bloom;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(source,vUv).rgb+texture2D(bloom,vUv).rgb*0.19,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`});
  for(const mat of[thresholdMaterial,blurMaterial,compositeMaterial])materials.add(mat);const postQuad=new THREE.Mesh(postGeometry,compositeMaterial);postQuad.frustumCulled=false;postScene.add(postQuad);
  function drawScene(){renderer.setRenderTarget(sceneTarget);renderer.render(scene,camera);postQuad.material=thresholdMaterial;renderer.setRenderTarget(bloomA);renderer.render(postScene,postCamera);postQuad.material=blurMaterial;blurMaterial.uniforms.source.value=bloomA.texture;blurMaterial.uniforms.direction.value.set(1.3/bloomA.width,0);renderer.setRenderTarget(bloomB);renderer.render(postScene,postCamera);blurMaterial.uniforms.source.value=bloomB.texture;blurMaterial.uniforms.direction.value.set(0,1.3/bloomA.height);renderer.setRenderTarget(bloomA);renderer.render(postScene,postCamera);postQuad.material=compositeMaterial;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}

  // Fit the actual software geometry to the area reserved by the HTML layout.
  // Plinth edges may extend beyond a closeup; every display and destination label stays inside it.
  world.updateMatrixWorld(true);
  const framingPoints=new Map();
  for(const [id,node]of nodes){if(!node.group)continue;const points=[];node.group.traverse(object=>{if(!object.isMesh||object.userData.framingIgnore)return;object.geometry.computeBoundingBox();const box=object.geometry.boundingBox;for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).applyMatrix4(object.matrixWorld));});framingPoints.set(id,points);}
  const overviewPoints=['source',...STAGES,'showcase','project-badge',...PROJECTS.map(id=>'portal:'+id)].flatMap(id=>framingPoints.get(id));
  function destination(id){
    const points=id?framingPoints.get(id):overviewPoints,look=new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());
    const mobile=frameWidth<=700,project=id?.startsWith('project:'),center=new THREE.Vector2(mobile?.5:project?.5:id?.73:.5,mobile?.5:project?.5:id?.48:.49);
    const direction=new THREE.Vector3(project?.18:.24,project?.10:.13,1).normalize(),right=new THREE.Vector3(direction.z,0,-direction.x).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),halfWidth=mobile?.94:project?.86:id?.45:.90,halfHeight=mobile?.85:project?.60:id?.75:.62;
    let distance=id?5.8:12;
    for(const point of points){const relative=point.clone().sub(look),depth=relative.dot(direction);distance=Math.max(distance,Math.abs(relative.dot(right))/(tan*aspect*halfWidth)+depth,Math.abs(relative.dot(up))/(tan*halfHeight)+depth);}
    return{eye:look.clone().addScaledVector(direction,distance*1.035),look,center};
  }
  function route(from,to){
    const queue=[from],seen=new Set([from]),parents=new Map();
    while(queue.length){const current=queue.shift();if(current===to)break;for(const edge of edges){const next=edge.from===current?edge.to:edge.to===current?edge.from:null;if(next&&!seen.has(next)){seen.add(next);parents.set(next,{previous:current,edge,reverse:edge.to===current});queue.push(next);}}}
    const steps=[];let current=to;while(parents.has(current)){const value=parents.get(current);steps.unshift(value);current=value.previous;}
    const points=[];for(const step of steps)for(let i=0;i<=5;i++){if(points.length&&i===0)continue;points.push(step.edge.curve.getPoint(step.reverse?1-i/5:i/5).add(new THREE.Vector3(0,.25,.1)));}
    if(points.length<2){const p=nodes.get(to)?.position||source.position;points.push(p.clone(),p.clone().add(new THREE.Vector3(.08,0,.08)));}
    return new THREE.CatmullRomCurve3(points,false,'centripetal');
  }
  function updateAmbient(){
    updateFlow();
    for(const rotator of rotators)rotator.object.rotation[rotator.axis]=elapsed*rotator.speed;
    for(const object of pulseObjects)object.scale.setScalar(1+Math.sin(elapsed*1.2)*.045);
  }
  function render(){if(destroyed||!contextAvailable)return;camera.position.copy(cameraBase);camera.position.x+=parallax.x*.17;camera.position.y+=parallax.y*.11;if(projectionDirty||!lastCenter.equals(screenCenter)){camera.setViewOffset(frameWidth,frameHeight,frameWidth*(.5-screenCenter.x),frameHeight*(.5-screenCenter.y),frameWidth,frameHeight);lastCenter.copy(screenCenter);projectionDirty=false;}camera.up.set(0,1,0);camera.lookAt(target);drawScene();renders++;if(!ready){ready=true;onReady();}}
  function schedule(){if(!destroyed&&contextAvailable&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  const ease=value=>value*value*value*(value*(value*6-15)+10);
  function cameraRail(end){
    const start=cameraBase.clone(),delta=end.eye.clone().sub(start),length=delta.length();
    // Both controls stay near the direct segment. A small, consistent upward
    // sweep creates depth without a detour, roll reversal or waypoint overshoot.
    const sweep=new THREE.Vector3(.16,.62,.06).multiplyScalar(Math.min(.95,length*.035));
    return new THREE.CubicBezierCurve3(start,start.clone().addScaledVector(delta,.32).add(sweep),start.clone().addScaledVector(delta,.7).add(sweep),end.eye.clone());
  }
  function rebaseJourney(end){
    const old=journey,progress=old.progressStart+(1-old.progressStart)*Math.min(1,old.elapsed/old.duration);
    old.duration=Math.max(.12,old.duration-old.elapsed);old.elapsed=0;old.progressStart=progress;old.cameraPath=cameraRail(end);old.startLook=target.clone();old.endLook=end.look;old.startCenter=screenCenter.clone();old.endCenter=end.center;old.endEye=end.eye;
  }
  function completeJourney(){if(!journey)return;const current=journey;journey=null;cameraBase.copy(current.endEye);target.copy(current.endLook);screenCenter.copy(current.endCenter);request.visible=false;onProgress(1,selected);current.resolve(true);}
  function tick(time){
    frame=0;if(destroyed||!contextAvailable||!visible||document.hidden){previousTime=0;return;}
    const rawDt=previousTime?(time-previousTime)/1000:0,dt=Math.min(rawDt,.07);previousTime=time;
    if(motion){elapsed+=dt;if(!journey)parallax.lerp(pointerTarget,1-Math.exp(-dt*4));updateAmbient();}
    if(journey){const current=journey;current.elapsed+=rawDt;const p=Math.min(1,current.elapsed/current.duration),e=ease(p);current.cameraPath.getPointAt(e,cameraBase);target.lerpVectors(current.startLook,current.endLook,e);screenCenter.lerpVectors(current.startCenter,current.endCenter,e);const progress=current.progressStart+(1-current.progressStart)*p;current.conduit.getPointAt(Math.min(1,ease(progress)+.065),request.position);onProgress(progress,selected);if(p===1&&journey===current)completeJourney();}
    render();if(motion||journey)schedule();
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pick(event){if(!contextAvailable)return null;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(pickable,false)[0]?.object.userData.destination||null;}
  function hover(event){const id=pick(event);if(id!==hovered){hovered=id;canvas.style.cursor=id?'pointer':'default';onHover(id);}}
  function leave(){if(hovered){hovered=null;canvas.style.cursor='default';onHover(null);}}
  let pressed=null;const down=event=>{if(event.button===0)pressed={x:event.clientX,y:event.clientY,id:event.pointerId};};
  const up=event=>{if(!pressed||pressed.id!==event.pointerId)return;const moved=Math.hypot(event.clientX-pressed.x,event.clientY-pressed.y);pressed=null;if(moved<7){const id=pick(event);if(id)onSelect(id);}};const cancel=()=>{pressed=null;};
  function resize(){const width=Math.max(container.clientWidth,1),height=Math.max(container.clientHeight,1);aspect=width/height;frameWidth=width;frameHeight=height;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5,Math.sqrt(1900000/(width*height))));renderer.setSize(width,height,false);const ratio=renderer.getPixelRatio();sceneTarget.setSize(Math.round(width*ratio),Math.round(height*ratio));bloomA.setSize(Math.max(1,Math.round(width*ratio*.4)),Math.max(1,Math.round(height*ratio*.4)));bloomB.setSize(bloomA.width,bloomA.height);camera.aspect=aspect;projectionDirty=true;const end=destination(selected);if(journey)rebaseJourney(end);else{cameraBase.copy(end.eye);target.copy(end.look);screenCenter.copy(end.center);}schedule();if(!motion&&!journey)render();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);const intersectionObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;previousTime=0;}});intersectionObserver.observe(container);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previousTime=0;}else schedule();};
  const contextLost=event=>{
    event.preventDefault();contextAvailable=false;cancelAnimationFrame(frame);frame=0;previousTime=0;leave();cancel();
    // Let the route finish presenting its HTML even when its camera flight cannot.
    // Retain selected so recovery can show the latest destination without replaying it.
    if(journey){const interrupted=journey;journey=null;request.visible=false;interrupted.resolve(false);}
  };
  const contextRestored=()=>{
    contextAvailable=true;previousTime=0;const end=destination(selected);
    cameraBase.copy(end.eye);target.copy(end.look);screenCenter.copy(end.center);projectionDirty=true;
    renderer.shadowMap.needsUpdate=true;schedule();
  };
  document.addEventListener('visibilitychange',visibility);canvas.addEventListener('pointermove',hover);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  resize();updateAmbient();render();schedule();
  // The first frame uses the local procedural studio. Load the optional CC0
  // environment independently so a missing/failed asset never blocks navigation.
  // HDRLoader preserves linear HDR data; the renderer prefilters it for PBR.
  import('./assets/vendor/HDRLoader.js').then(({HDRLoader})=>new HDRLoader().loadAsync(new URL('./assets/environment/studio_small_09_1k.hdr',import.meta.url).href)).then(environment=>{
    if(destroyed){environment.dispose();return;}
    environment.name='studio-small-09-hdri';environment.mapping=THREE.EquirectangularReflectionMapping;textures.add(environment);scene.environment=environment;scene.environmentIntensity=.34;scene.environmentRotation.y=Math.PI*.3;environmentSource='studio-small-09';schedule();
  }).catch(()=>{/* The procedural studio remains available when the optional HDR fails. */});
  return{
    travelTo(id=null,{immediate=false}={}){
      if(destroyed)return Promise.resolve(false);if(id!==null&&!IDS.includes(id))return Promise.reject(new TypeError('Unknown production destination: '+id));
      if(selected===id&&!journey){onProgress(1,id);return Promise.resolve(contextAvailable);}
      const from=selected||'source';if(journey){journey.resolve(false);journey=null;}selected=id;const end=destination(id);onProgress(0,id);
      return new Promise(resolve=>{
        if(immediate||!motion||!contextAvailable){cameraBase.copy(end.eye);target.copy(end.look);screenCenter.copy(end.center);request.visible=false;render();onProgress(1,id);resolve(contextAvailable);return;}
        const conduit=route(from,id||'source'),distance=cameraBase.distanceTo(end.eye),duration=THREE.MathUtils.clamp(1.35+distance*.025,1.55,2);
        journey={resolve,elapsed:0,progressStart:0,startCenter:screenCenter.clone(),endCenter:end.center,duration,conduit,cameraPath:cameraRail(end),startLook:target.clone(),endLook:end.look,endEye:end.eye};
        request.visible=true;conduit.getPoint(0,request.position);previousTime=0;schedule();
      });
    },
    setMotion(enabled){if(destroyed)return;motion=Boolean(enabled);previousTime=0;if(!motion&&journey)completeJourney();schedule();if(!motion)render();},
    setPointer(x,y){if(destroyed||!Number.isFinite(x)||!Number.isFinite(y))return;pointerTarget.set(THREE.MathUtils.clamp(x,-1,1),THREE.MathUtils.clamp(y,-1,1));if(motion)schedule();},
    getState(){return{selected,transitioning:Boolean(journey),motion,visible,contextAvailable,elapsed,renders,destroyed,environmentSource,camera:camera.position.toArray(),target:target.toArray(),center:screenCenter.toArray(),request:request.visible?request.position.toArray():null,flowPhase,flowTime:elapsed%cycleDuration,flowDuration:cycleDuration,packets:packetStates.map(packet=>({visible:packet.visible,from:packet.edge?.from,to:packet.edge?.to,distance:packet.distance,position:packet.position.toArray()})),destinations:IDS.slice(),objects:world.children.length};},
    destroy(){if(destroyed)return;destroyed=true;cancelAnimationFrame(frame);if(journey){journey.resolve(false);journey=null;}resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointermove',hover);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);heads.dispose();trails.dispose();for(const geometry of geometries)geometry.dispose();for(const mat of materials)mat.dispose();for(const map of textures)map.dispose();sceneTarget.dispose();bloomA.dispose();bloomB.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}
  };
}
