import fs from 'node:fs/promises';
await fs.mkdir('public/vendor',{recursive:true});
for(const [from,to] of [['maplibre-gl/dist/maplibre-gl.js','maplibre-gl.js'],['maplibre-gl/dist/maplibre-gl.css','maplibre-gl.css'],['leaflet/dist/leaflet.js','leaflet.js'],['leaflet/dist/leaflet.css','leaflet.css'],['maplibre-gl/LICENSE.txt','MAPLIBRE-LICENSE.txt'],['leaflet/LICENSE','LEAFLET-LICENSE.txt']])await fs.copyFile('node_modules/'+from,'public/vendor/'+to);
