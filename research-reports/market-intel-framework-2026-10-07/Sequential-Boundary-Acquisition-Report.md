# Sequential boundary acquisition and rights review — 2026-10-07

Assistant-run acquisition, hashing and geometry checks. No prototype/infrastructure implementation.

## Acquired
Toronto 158 neighbourhoods, 46,564 coordinate vertices; Vancouver 22 local areas, 1,215 vertices; Arizona/Texas 2 state features, 14,344 vertices. Zero invalid individual geometries. Toronto/Vancouver IDs unique; US GEOIDs 04/48 verified.
Original Canadian GeoJSON retained. Census 2025 state archive retained and subset transformed EPSG:4269 -> EPSG:4326 using pyproj always_xy, no simplification/repair. Full overlap topology/crosswalk audit not run. Current municipal downloads do not establish effective boundary dates.
Archive InvestScape-Boundary-Review-2026-10-07.zip SHA256 91f96752bf48390391faa493d3022638dc98445866fe2a6519473cc4f61f98d8; contains source artifacts, metadata, manifest, extraction/check script and notices. Durable artifact provided separately; large binary source archive is not embedded in this docs commit.

## Blocked
StatCan official 2021 CMA/CSD ZIP attempts both HTTP 403. No unofficial substitute and no city/metro boundary completion claim. User-provided official download or permitted alternate official delivery path can close this artifact gap.

## Community export/provider decision
MapTiler terms review remains restrictive for persistent screenshots/server-cached map content; Static Maps API exists but does not establish clearance for Community storage/redistribution. https://www.maptiler.com/terms/cloud/
Mapbox Static Images docs demonstrate generation, not unrestricted persistent reuse. Current legal page links July 21 2026 Product Terms; linked PDF failed browser retrieval in this pass. Historical terms/snippets are not substituted for current clearance. https://www.mapbox.com/legal/product-terms ; https://docs.mapbox.com/api/maps/static-images/
No vendor cleared for Community screenshots, no vendor contacted, no purchase.
Recommended initial export: approved InvestScape layers on original controlled neutral background, with source attribution; no vendor basemap tiles. Census-specific final reuse notes and all per-layer rights still require closure. Canadian municipal licences provide conditional commercial use/attribution, not permission for third-party layers.
Private Portfolio holdings excluded; AI draft reviewed before explicit post. No posting authorized.

## Next gates
Close StatCan artifact gap, final source product rights/vintages, full topology/CRS review, provider agreement if basemap in exports desired. Synthetic fixture generation and renderer implementation remain unexecuted/separately authorized. Map-first ribbon, Research and cross-module baseline remain unchanged.

## Populated acquisition manifest
```json
{
  "retrievedDate": "2026-10-07",
  "artifacts": [
    {
      "file": "toronto.geojson",
      "sha256": "b0cb58077f5b3a47e0e56a68913c6980cfaf39d37d7d020fd91b60650c480233",
      "bytes": 2141269,
      "features": 158,
      "vertices": 46564,
      "invalid": 0,
      "empty": 0,
      "uniqueIds": 158,
      "idField": "AREA_SHORT_CODE",
      "bounds": [
        -79.6392649324429,
        43.5809960000775,
        -79.1152736124458,
        43.8554571861712
      ],
      "topologyOverlapAudit": "not_run"
    },
    {
      "file": "vancouver.geojson",
      "sha256": "3144cc6b045e24df8b4c324e976aa4d826c75ac7fb1ab4a1dfadf07f09a7bbb2",
      "bytes": 52441,
      "features": 22,
      "vertices": 1215,
      "invalid": 0,
      "empty": 0,
      "uniqueIds": 22,
      "idField": "name",
      "bounds": [
        -123.22484588623045,
        49.1989364614697,
        -123.02320098876953,
        49.295810698530715
      ],
      "topologyOverlapAudit": "not_run"
    },
    {
      "file": "arizona-texas.geojson",
      "sha256": "c5dc122ab6f7fca8e8966e551baf4af1c20a23b77983765e5a875ae5a2da4b5d",
      "bytes": 353344,
      "features": 2,
      "vertices": 14344,
      "invalid": 0,
      "ids": [
        "04",
        "48"
      ],
      "sourceCrs": "EPSG:4269",
      "outputCrs": "EPSG:4326",
      "sourceArchiveSha256": "9cbfe171dad1555e11770c981d8f4db9e687a65c86f5bdae684eeb487e2e9b80",
      "sourceArchiveBytes": 3245373,
      "transformation": "pyproj always_xy; no simplification",
      "topologyOverlapAudit": "not_run"
    }
  ],
  "blocked": [
    "StatCan CMA 2021 HTTP 403",
    "StatCan CSD 2021 HTTP 403"
  ],
  "scope": "display fixtures, not parcel or financial validation",
  "sources": {
    "toronto.geojson": {
      "url": "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/fc443770-ef0a-4025-9c2c-2cb558bfab00/resource/0719053b-28b7-48ea-b863-068823a93aaa/download/neighbourhoods-4326.geojson",
      "licence": "https://open.toronto.ca/open-data-licence/",
      "attribution": "Contains information licensed under the Open Government Licence \u2013 Toronto.",
      "vintage": "158-neighbourhood framework; precise artifact revision unknown"
    },
    "vancouver.geojson": {
      "url": "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/local-area-boundary/exports/geojson",
      "licence": "https://opendata.vancouver.ca/pages/licence/",
      "attribution": "Contains information licensed under the Open Government Licence \u2013 Vancouver.",
      "vintage": "current download; effective date unknown"
    },
    "arizona-texas.geojson": {
      "url": "https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_500k.zip",
      "attribution": "Source: U.S. Census Bureau, 2025 Cartographic Boundary File, State and Equivalent Entities, 1:500,000.",
      "rightsStatus": "official product acquired; final export rights review pending",
      "vintage": "2025"
    }
  }
}
```
