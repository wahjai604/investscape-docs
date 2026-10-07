import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
// Disposable fixture service. Header is a mock selector, not authentication.
const articles=[
{id:'approved-summary',title:'Housing supply and transit: Vancouver example',status:'published',approved:true,rights:'summary-permitted',audience:'member',geo:'Vancouver',scope:'city',summary:'Synthetic example: planned transit may influence housing demand, but this fixture supplies no actual market conclusion.',source:'https://example.com/research/vancouver',date:null,reviewDate:'2026-10-07',attribution:'InvestScape synthetic fixture author'},
{id:'approved-link',title:'Regional infrastructure: wider context example',status:'published',approved:true,rights:'link-only',audience:'public',geo:'All',scope:'regional',summary:'MUST_NOT_EXPOSE_LINK_ONLY_TEXT',source:'https://example.com/research/regional',date:'2026-09-01',reviewDate:'2026-10-07',attribution:'Synthetic external source'},
{id:'draft-secret',title:'DRAFT_SECRET',status:'draft',approved:false,rights:'summary-permitted'},
{id:'withdrawn-secret',title:'WITHDRAWN_SECRET',status:'withdrawn',approved:true,rights:'summary-permitted'},
{id:'withheld-secret',title:'WITHHELD_SECRET',status:'published',approved:true,rights:'withheld'}];
const visible=x=>x.approved&&x.status==='published'&&['summary-permitted','link-only'].includes(x.rights);
const sanitize=x=>{const {approved,status,summary,...rest}=x;return {...rest,...(x.rights==='summary-permitted'?{summary}:{})};};
const holdings=[{id:'A-1',owner:'A',name:'Sample investment',precision:'approximate',kind:'investment',coordinates:[-123.12,49.25]},{id:'A-2',owner:'A',name:'Sample development',precision:'exact',kind:'development',coordinates:[-123.10,49.26]},{id:'A-3',owner:'A',name:'Unmapped holding',precision:'unmapped',kind:'investment',coordinates:null},{id:'B-1',owner:'B',name:'Account B sample',precision:'approximate',kind:'investment',coordinates:[-79.38,43.65]}];
function json(res,status,d){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(d));}
export const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://127.0.0.1');const owner=req.headers['x-mock-owner'];
 if(u.pathname.startsWith('/api/')){
  if(u.searchParams.get('mode')==='error')return json(res,503,{error:'fixture-unavailable'});
  if(u.searchParams.get('delay'))await new Promise(r=>setTimeout(r,Math.min(1000,Number(u.searchParams.get('delay')))));
  if(u.pathname==='/api/holdings')return owner==='A'||owner==='B'?json(res,200,{items:holdings.filter(h=>h.owner===owner)}):json(res,401,{error:'mock-owner-required'});
  if(u.pathname==='/api/research'){
   let xs=articles.filter(visible).filter(a=>a.audience==='public'||owner==='A'||owner==='B');const geo=u.searchParams.get('geo');if(geo)xs=xs.filter(a=>a.geo===geo||a.geo==='All');if(u.searchParams.get('mode')==='empty')xs=[];
   const cursor=Number(u.searchParams.get('cursor')||0);if(!Number.isInteger(cursor)||cursor<0)return json(res,400,{error:'invalid-cursor'});
   const items=xs.slice(cursor,cursor+1).map(sanitize);return json(res,200,{items,nextCursor:cursor+1<xs.length?String(cursor+1):null});
  }
  if(u.pathname.startsWith('/api/research/')){const x=articles.find(a=>a.id===u.pathname.split('/').at(-1)&&visible(a)&&(a.audience==='public'||owner==='A'||owner==='B'));return x?json(res,200,sanitize(x)):json(res,404,{error:'unavailable'});}
  return json(res,404,{error:'unavailable'});
 }
 const assets={'/vendor/maplibre.js':'public/vendor/maplibre-gl.js','/vendor/maplibre.css':'public/vendor/maplibre-gl.css','/vendor/leaflet.js':'public/vendor/leaflet.js','/vendor/leaflet.css':'public/vendor/leaflet.css'};
 const rel=assets[u.pathname]||'public/'+(u.pathname==='/'?'index.html':u.pathname.slice(1));const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)||!['.html','.js','.css','.geojson'].includes(path.extname(file)))return json(res,404,{error:'unavailable'});
 const body=await fs.readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'application/javascript','.css':'text/css','.geojson':'application/geo+json'})[path.extname(file)],'Cache-Control':'public,max-age=3600'});res.end(body);
 }catch{json(res,404,{error:'unavailable'});}});
if(process.argv[1]===fileURLToPath(import.meta.url)){server.listen(4173,'127.0.0.1',()=>console.log('Unpublished fixture preview http://127.0.0.1:4173'));}
