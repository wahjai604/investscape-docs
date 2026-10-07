import pathlib,json,hashlib,math
from shapely.geometry import shape,mapping
p=pathlib.Path(__file__).parent;src=p.parent/'map-review';out=p/'public/data';fs=[]
for file,family,field,vintage in [('canada-csd','city','CSDUID','2021'),('canada-cma','metro','CMAUID','2021'),('arizona-texas','state','GEOID','2025'),('toronto','toronto-neighbourhood','AREA_SHORT_CODE','resource-2026-02-20'),('vancouver','vancouver-local-area','name','resource-2023-06-24')]:
 d=json.loads((src/(file+'.geojson')).read_text())
 for f in d['features']:
  props=f['properties'];name=props.get('CSDNAME',props.get('CMANAME',props.get('NAME',props.get('AREA_NAME',props.get('name')))));ident=str(props[field]);g=shape(f['geometry']);render=g.simplify(.00015,preserve_topology=True)
  authority='statcan' if file.startswith('canada') else 'census' if family=='state' else 'toronto' if file=='toronto' else 'vancouver'
  fs.append({'type':'Feature','properties':{'id':f'{authority}:{family}:{vintage}:{ident}','name':name,'family':family,'vintage':vintage,'authority':authority,'sourceId':ident,'synthetic':False,'displayOnly':True},'geometry':mapping(render)})
(out/'boundaries.geojson').write_text(json.dumps({'type':'FeatureCollection','features':fs},separators=(',',':')))
# Overlap fixture is intentionally synthetic and located beside Vancouver for a deterministic ambiguity test.
amb=[]
for i,x in enumerate([-123.13,-123.12]):
 amb.append({'type':'Feature','properties':{'id':f'synthetic:ambiguity:1:{i}','name':f'Ambiguity example {i+1}','family':'ambiguity','synthetic':True},'geometry':{'type':'Polygon','coordinates':[[[x,49.25],[x+.02,49.25],[x+.02,49.27],[x,49.27],[x,49.25]]]}})
(out/'ambiguity.geojson').write_text(json.dumps({'type':'FeatureCollection','features':amb}))
# deterministic LCG, with independently reproducible prefix equality
for n in [100,1000,10000]:
 seed=20261007;points=[]
 for i in range(n):
  seed=(1664525*seed+1013904223)%2**32;x=-123.22+seed/2**32*.2
  seed=(1664525*seed+1013904223)%2**32;y=49.20+seed/2**32*.1
  points.append({'type':'Feature','properties':{'id':f'stress-{i}','synthetic':True},'geometry':{'type':'Point','coordinates':[x,y]}})
 (out/f'points-{n}.geojson').write_text(json.dumps({'type':'FeatureCollection','features':points},separators=(',',':')))
for n in [1000,10000,50000]:
 ring=[[-123.12+.06*math.cos(i*2*math.pi/n),49.25+.035*math.sin(i*2*math.pi/n)] for i in range(n)];ring.append(ring[0]);hole=[[-123.125,49.245],[-123.115,49.245],[-123.115,49.255],[-123.125,49.255],[-123.125,49.245]]
 d={'type':'FeatureCollection','features':[{'type':'Feature','properties':{'id':f'complexity-{n}','synthetic':True},'geometry':{'type':'MultiPolygon','coordinates':[[ring,hole]]}}]}
 (out/f'polygon-{n}.geojson').write_text(json.dumps(d,separators=(',',':')))
manifest=[]
for f in sorted(out.iterdir()):
 b=f.read_bytes();d=json.loads(b);manifest.append({'file':f.name,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'features':len(d['features']),'crs':'EPSG:4326 longitude/latitude','generator':'generate-fixtures.py v0.1','seed':20261007 if f.name.startswith('points') else None,'synthetic':f.name!='boundaries.geojson'})
def vertices(v):
 if isinstance(v,list) and v and isinstance(v[0],(int,float)):return 1
 return sum(vertices(c) for c in v) if isinstance(v,list) else 0
sources=[('canada-csd','https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/9','https://open.canada.ca/en/open-government-licence-canada','EPSG:3347; service output EPSG:4326'),('canada-cma','https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer/6','https://open.canada.ca/en/open-government-licence-canada','EPSG:3347; service output EPSG:4326'),('arizona-texas','https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_500k.zip',None,'EPSG:4269 archive; pyproj output EPSG:4326'),('toronto','https://open.toronto.ca/dataset/neighbourhoods/','https://open.toronto.ca/open-data-licence/','CRS84'),('vancouver','https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/local-area-boundary/exports/geojson','https://opendata.vancouver.ca/pages/licence/','GeoJSON lon/lat; no explicit CRS member')]
for m in manifest:
 d=json.loads((out/m['file']).read_text());m['vertexCount']=sum(vertices(f['geometry']['coordinates']) for f in d['features']);m['retrievedOrGeneratedDate']='2026-10-07';m['permittedUse']='isolated unpublished prototype; no production clearance implied'
 if not m['synthetic']:
  m['transformation']='shapely simplify tolerance .00015 degrees, preserve_topology=True; display only; no repair';m['canonicalIds']=[f['properties']['id'] for f in d['features']];m['sources']=[{'file':name+'.geojson','sourceUrl':url,'licenceUrl':licence,'sourceCrs':crs,'sourceGeojsonSha256':hashlib.sha256((src/(name+'.geojson')).read_bytes()).hexdigest()} for name,url,licence,crs in sources]
(p/'fixture-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps(manifest,indent=2))
