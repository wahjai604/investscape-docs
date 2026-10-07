const $=s=>document.querySelector(s),empty=()=>({type:'FeatureCollection',features:[]});
const state={renderer:new URLSearchParams(location.search).get('renderer')||'leaflet',family:'city',selected:null,owner:'A',portfolio:false,shading:true,volume:0,complexity:0,mode:'normal',camera:null,module:'Market Intel',comparison:[]};
let boundaries,ambiguity,map,leafLayers=[],epoch=0,evidenceEpoch=0,moreCursor=null,renderPromise,controller;const telemetry={renders:[],panels:[],errors:[],network:[],alive:0};
$('#renderer').value=state.renderer;
let panelPrefs={side:'right',pinned:false,expanded:true};
try{const saved=JSON.parse(localStorage.getItem('investscape-map-panel-v1')||'null');if(saved)panelPrefs={side:saved.side==='left'?'left':'right',pinned:saved.pinned===true,expanded:saved.expanded!==false};}catch{}
function panelUpdate(){
 const layout=$('.layout');layout.classList.toggle('panel-left',panelPrefs.side==='left');layout.classList.toggle('panel-collapsed',!panelPrefs.expanded);$('#evidence-panel').hidden=!panelPrefs.expanded;$('#panel-side').value=panelPrefs.side;$('#panel-toggle').setAttribute('aria-expanded',String(panelPrefs.expanded));$('#panel-toggle').textContent=panelPrefs.expanded?'Hide evidence panel':'Show evidence panel';$('#panel-pin').setAttribute('aria-pressed',String(panelPrefs.pinned));$('#panel-pin').textContent=panelPrefs.pinned?'Unpin panel':'Pin panel';
 try{localStorage.setItem('investscape-map-panel-v1',JSON.stringify(panelPrefs));}catch{}
 const current=map;if(current){const c=state.renderer==='leaflet'?current.getCenter():current.getCenter().toArray(),z=current.getZoom();requestAnimationFrame(()=>{if(map!==current)return;if(state.renderer==='leaflet'){current.invalidateSize({pan:false});current.setView(c,z,{animate:false});}else{current.resize();current.jumpTo({center:c,zoom:z});}});}
}
let panelUseVersion=0,mapPointerVersion=null,lastMapPointer=0;
function panelExpand(){panelUseVersion++;panelPrefs.expanded=true;panelUpdate();}
function panelCollapse(){if($('#evidence-panel').contains(document.activeElement))$('#panel-toggle').focus();panelPrefs.expanded=false;panelUpdate();}
$('#panel-toggle').onclick=()=>panelPrefs.expanded?panelCollapse():panelExpand();
$('#panel-side').onchange=e=>{panelPrefs.side=e.target.value;panelUpdate();};
$('#panel-pin').onclick=()=>{panelPrefs.pinned=!panelPrefs.pinned;if(panelPrefs.pinned)panelPrefs.expanded=true;panelUpdate();};
$('#map').addEventListener('pointerdown',()=>{mapPointerVersion=panelUseVersion;lastMapPointer=performance.now();});
window.addEventListener('pointerup',()=>{if(mapPointerVersion===null)return;const v=mapPointerVersion;mapPointerVersion=null;lastMapPointer=performance.now();setTimeout(()=>{if(!panelPrefs.pinned&&panelUseVersion===v)panelCollapse();},250);});
$('#map').addEventListener('focusin',()=>{if(!panelPrefs.pinned&&mapPointerVersion===null&&performance.now()-lastMapPointer>300)panelCollapse();});
$('#evidence-panel').addEventListener('keydown',e=>{if(e.key==='Escape'&&!panelPrefs.pinned){e.preventDefault();panelCollapse();}});
panelUpdate();

function text(el,t){el.textContent=t;}function status(t){text($('#map-status'),t);}function card(t){const d=document.createElement('div');d.className='card';d.textContent=t;return d;}
async function get(url,signal){telemetry.network.push(url);const r=await fetch(url,{signal,headers:{'X-Mock-Owner':state.owner}});if(!r.ok)throw new Error(r.status===404?'unavailable':r.status===503?'API error':'Request failed');return r.json();}
function active(){return(state.family==='ambiguity'?ambiguity:boundaries).features.filter(f=>f.properties.family===state.family);}
function saveCamera(){if(!map)return;if(state.renderer==='leaflet'){const c=map.getCenter();state.camera={center:[c.lng,c.lat],zoom:map.getZoom()};}else state.camera={center:map.getCenter().toArray(),zoom:map.getZoom()};}
function destroy(){if(map){map.remove();map=null;telemetry.alive=0;}leafLayers=[];}
function bounds(g){let xs=[],ys=[];function walk(c){if(typeof c[0]==='number'){xs.push(c[0]);ys.push(c[1]);}else c.forEach(walk);}walk(g.coordinates);return [[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];}
function fit(f){if(!map)return;const b=bounds(f.geometry);if(state.renderer==='leaflet')map.fitBounds([[b[0][1],b[0][0]],[b[1][1],b[1][0]]],{animate:false,padding:[15,15]});else map.fitBounds(b,{duration:0,padding:25});saveCamera();}
function updateAreas(){const list=$('#area');list.replaceChildren();for(const f of active()){const o=document.createElement('option');o.value=f.properties.id;o.textContent=f.properties.name;list.append(o);}if(!active().some(f=>f.properties.id===state.selected))state.selected=active()[0]?.properties.id||null;list.value=state.selected;}
function pointInRing(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){
 const a=r[j],b=r[i],cross=(p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]);if(Math.abs(cross)<1e-12&&p[0]>=Math.min(a[0],b[0])-1e-12&&p[0]<=Math.max(a[0],b[0])+1e-12&&p[1]>=Math.min(a[1],b[1])-1e-12&&p[1]<=Math.max(a[1],b[1])+1e-12)return 2;
 if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside?1:0;}
function contains(p,g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;return polys.some(poly=>{const outer=pointInRing(p,poly[0]);if(!outer)return false;if(outer===2)return true;for(const hole of poly.slice(1)){const v=pointInRing(p,hole);if(v===2)return true;if(v===1)return false;}return true;});}
function choosePoint(p){const matches=active().filter(f=>contains(p,f.geometry));$('#ambiguity').replaceChildren();if(!matches.length){status('No boundary match. Selection retained.');return;}if(matches.length>1){panelExpand();status('Ambiguous location: choose a boundary below.');for(const f of matches){const b=document.createElement('button');b.textContent=f.properties.name;b.onclick=()=>select(f.properties.id,true);$('#ambiguity').append(b);}return;}select(matches[0].properties.id,false);}
async function select(id,doFit=false){state.selected=id;panelExpand();$('#area').value=id;$('#ambiguity').replaceChildren();if(doFit)fit(active().find(f=>f.properties.id===id));await evidence();}
function metric(f){if(f.properties.family==='state')return null;if(f.properties.family==='city')return f.properties.name==='Vancouver'?0:100;return [...f.properties.id].reduce((a,c)=>a+c.charCodeAt(0),0)%150;}
function metricColor(v){return v===null?'#9aa8ae':v<50?'#c0e0eb':v<100?'#6aafc4':'#26728d';}
function paintGeo(geo,type,color){if(state.renderer==='leaflet'){
 const layer=L.geoJSON(geo,{renderer:L.canvas(),style:f=>({color:type==='boundary'?'#326a80':color,weight:1.5,fillColor:type==='boundary'?metricColor(f.properties.fixtureIndex):color,fillOpacity:type==='boundary'?(state.shading?.35:.05):.2}),pointToLayer:(_,p)=>L.circleMarker(p,{radius:type==='holdings'?7:3,color:color,weight:1,fillOpacity:.85})}).addTo(map);leafLayers.push(layer);
 }else{map.addSource(type,{type:'geojson',data:geo});if(type==='boundary'||type==='complexity'){
 map.addLayer({id:type+'-fill',type:'fill',source:type,paint:{'fill-color':type==='boundary'?['case',['==',['get','fixtureIndex'],null],'#9aa8ae',['<',['get','fixtureIndex'],50],'#c0e0eb',['<',['get','fixtureIndex'],100],'#6aafc4','#26728d']:color,'fill-opacity':type==='boundary'?(state.shading?.35:.05):.2}});map.addLayer({id:type+'-line',type:'line',source:type,paint:{'line-color':'#326a80','line-width':1.5}});
 }else map.addLayer({id:type,type:'circle',source:type,paint:{'circle-radius':type==='holdings'?7:3,'circle-color':color,'circle-opacity':.85}});}}
async function render(){const n=++epoch,t=performance.now();renderPromise=(async()=>{
 saveCamera();destroy();if(state.module!=='Market Intel')return;status('Loading map…');
 const camera=state.camera||{center:[-123.12,49.25],zoom:10};
 if(state.renderer==='leaflet')map=L.map('map',{attributionControl:false,zoomControl:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([camera.center[1],camera.center[0]],camera.zoom);
 else{map=new maplibregl.Map({container:'map',style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':document.body.classList.contains('dark')?'#203c46':'#e9f0ee'}}]},center:camera.center,zoom:camera.zoom,attributionControl:false,renderWorldCopies:false,canvasContextAttributes:{preserveDrawingBuffer:true}});map.on('error',e=>telemetry.errors.push(String(e.error)));await new Promise(r=>{map.once('load',r);map.once('remove',r);});}
 if(n!==epoch||state.module!=='Market Intel')return;telemetry.alive=1;
 map.on('click',e=>choosePoint(state.renderer==='leaflet'?[e.latlng.lng,e.latlng.lat]:[e.lngLat.lng,e.lngLat.lat]));
 paintGeo({type:'FeatureCollection',features:active().map(f=>({...f,properties:{...f.properties,fixtureIndex:metric(f)}}))},'boundary','#298baa');
 if(state.volume){const pts=await get('/data/points-'+state.volume+'.geojson');if(n!==epoch)return;paintGeo(pts,'points','#9b5100');}
 if(state.complexity){const poly=await get('/data/polygon-'+state.complexity+'.geojson');if(n!==epoch)return;paintGeo(poly,'complexity','#835cb0');}
 let holdings=[];if(state.portfolio){const d=await get('/api/holdings');if(n!==epoch)return;holdings=d.items;paintGeo({type:'FeatureCollection',features:holdings.filter(h=>h.coordinates).map(h=>({type:'Feature',properties:{id:h.id},geometry:{type:'Point',coordinates:h.coordinates}}))},'holdings','#8c4600');}
 $('#holdings').replaceChildren(...(state.portfolio?holdings.map(h=>card(`${h.name} · ${h.kind} · ${h.precision}`)):[card('Overlay off. No holdings loaded.')]));
 if(state.renderer==='maplibre')await new Promise(r=>{map.once('idle',r);map.once('remove',r);});else await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 if(n!==epoch)return;telemetry.renders.push({renderer:state.renderer,ms:performance.now()-t,volume:state.volume,complexity:state.complexity});status('Map ready · display fixtures only');
 })().catch(e=>{if(n===epoch){status('Map unavailable. Retry by changing a control.');telemetry.errors.push(String(e));}});return renderPromise;}
async function evidence(append=false){controller?.abort();controller=new AbortController();const n=++evidenceEpoch;const f=active().find(f=>f.properties.id===state.selected);if(!f)return;
 text($('#selection'),f.properties.name);text($('#boundary-note'),`${f.properties.family} · ${f.properties.vintage||'synthetic'} · ${f.properties.id}. Display geometry; overlap and precision caveats apply.`);
 $('#metrics').replaceChildren(card('Illustrative index: '+(metric(f)===null?'unavailable':String(metric(f)))+' · fixture, not observed data. Shade legend: under 50 / 50–99 / 100+; gray = unavailable.'),card('Period/definition/currency differ across examples. No investment ranking.'));$('#detail').replaceChildren();if(!append)$('#research').replaceChildren(card('Loading approved evidence…'));$('#more').hidden=true;
 const geo=f.properties.name.includes('Vancouver')||state.family.includes('vancouver')?'Vancouver':f.properties.name;const params=new URLSearchParams({geo,mode:state.mode==='delayed'?'normal':state.mode});if(state.mode==='delayed')params.set('delay','500');if(append&&moreCursor)params.set('cursor',moreCursor);
 try{const d=await get('/api/research?'+params,controller.signal);if(n!==evidenceEpoch)return;const t=performance.now();if(!append)$('#research').replaceChildren();if(!d.items.length&&!append)$('#research').append(card('No approved research matches this geography.'));for(const a of d.items){const div=document.createElement('div');div.className='card';const btn=document.createElement('button');btn.textContent=a.title;btn.onclick=()=>detail(a.id);div.append(btn,card(`${a.scope} · ${a.rights} · publication ${a.date||'unknown'} · reviewed ${a.reviewDate}`));$('#research').append(div);}moreCursor=d.nextCursor;$('#more').hidden=!moreCursor;telemetry.panels.push(performance.now()-t);
 }catch(e){if(e.name!=='AbortError'&&n===evidenceEpoch)$('#research').replaceChildren(card('Research API error. Change response to Normal to retry.'));}}
async function detail(id){const n=evidenceEpoch;try{const d=await get('/api/research/'+id);if(n!==evidenceEpoch)return;$('#detail').replaceChildren(card(d.summary||'Link-only item. Summary and full text are not available.'),card('Attribution: '+d.attribution));const link=document.createElement('a');link.href=d.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Original source (synthetic link; availability not verified)';$('#detail').append(link);}catch{if(n===evidenceEpoch)$('#detail').replaceChildren(card('Detail unavailable.'));}}
async function navigate(module){saveCamera();state.module=module;controller?.abort();evidenceEpoch++;epoch++;destroy();$('#map-shell').hidden=module!=='Market Intel';$('#other-module').hidden=module==='Market Intel';text($('#module-title'),module);for(const b of document.querySelectorAll('nav button')){b.removeAttribute('aria-current');if(b.dataset.module===module)b.setAttribute('aria-current','page');}if(module==='Market Intel'){await render();await evidence();}}
for(const b of document.querySelectorAll('[data-module]'))b.onclick=()=>navigate(b.dataset.module);$('#return').onclick=()=>navigate('Market Intel');
$('#renderer').onchange=async e=>{saveCamera();destroy();state.renderer=e.target.value;await render();};
$('#family').onchange=async e=>{state.family=e.target.value;state.camera=null;updateAreas();await render();fit(active()[0]);await evidence();};
$('#fit').onclick=()=>fit(active().find(f=>f.properties.id===state.selected));$('#zoom-in').onclick=()=>{map?.zoomIn();};$('#zoom-out').onclick=()=>{map?.zoomOut();};
$('#area').onchange=e=>select(e.target.value,true);$('#more').onclick=()=>evidence(true);
for(const name of ['volume','complexity','portfolio','shading'])$('#'+name).onchange=async e=>{state[name]=e.target.type==='checkbox'?e.target.checked:Number(e.target.value);await render();};
$('#owner').onchange=async e=>{state.owner=e.target.value;controller?.abort();evidenceEpoch++;$('#holdings').replaceChildren();$('#detail').replaceChildren();epoch++;destroy();await render();await evidence();};
$('#mode').onchange=e=>{state.mode=e.target.value;evidence();};
$('#theme').onclick=async()=>{document.body.classList.toggle('dark');text($('#theme'),document.body.classList.contains('dark')?'Light mode':'Dark mode');await render();};
$('#compare').onclick=()=>{const f=active().find(f=>f.properties.id===state.selected);if(!state.comparison.some(x=>x.id===f.properties.id))state.comparison.push({id:f.properties.id,name:f.properties.name,family:f.properties.family});text($('#comparison'),state.comparison.map(x=>x.name+' ('+x.family+')').join(' vs ')+' · Comparison requires compatible definitions, periods, geographic levels and currency.');};
window.review={state,panelPrefs,telemetry,choosePoint,contains,detail,render,pixel:p=>state.renderer==='leaflet'?map.latLngToContainerPoint([p[1],p[0]]):map.project(p),ready:()=>renderPromise};
try{[boundaries,ambiguity]=await Promise.all([get('/data/boundaries.geojson'),get('/data/ambiguity.geojson')]);updateAreas();await render();fit(active()[0]);await evidence();window.review.booted=true;}catch(e){status('Fixture load failed. Reload to retry.');telemetry.errors.push(String(e));}
