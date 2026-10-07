# InvestScape unpublished map comparison v0.1

An isolated comparison harness, not a WeWeb page or deployed service. Includes MapLibre GL JS 5.20.0 and Leaflet 1.9.4 under a common navigation shell, controlled background, government boundary display fixtures, synthetic quantitative/evidence/Portfolio examples and a loopback-only fixture server.

## Open the preview

Requires Node.js 22 or later. Unzip, open a terminal in this folder and run:

```
node server.mjs
```

Then open http://127.0.0.1:4173. Leaflet is the provisional preview default. Switch the Renderer control to compare implementations. Stop the server with Ctrl+C. Bundled vendor JS/CSS permit preview without an npm install or remote CDN; there are no basemap tile requests. Node serves loopback only. Do not expose this fixture server to the Internet. The mock account header is a fixture selector, not an authentication implementation.

## Included behavior

- Map beneath ribbon; module stubs retain camera, geography, filters, layers and comparison choices and destroy hidden renderer. Stubs do not perform transfers or modify projects.
- City/CMA/state/municipal display layers, manual/keyboard/touch selection, explicit ambiguity choices and no-match feedback. Display simplification is not analytic topology correction.
- Synthetic choropleth legend, zero/missing distinctions and comparison limitations. No actual investment recommendation.
- Research list/detail/pagination with approved/publication/rights/audience filtering in fixture service; link-only text omitted, direct hidden detail denied. Unknown dates remain unknown; API empty/error/unavailable states distinct. Original links are deliberately synthetic, availability unverified, not broken-link monitoring.
- Portfolio opt-in; mock owner switch clears former holdings. Exact/approximate/unmapped examples. No real holdings, database or Supabase RLS accessed.
- Light/dark desktop/phone layouts, labelled form controls and list-based keyboard alternative to canvas interaction.
- 100/1,000/10,000 point fixtures, and 1,000/10,000/50,000 exterior-vertex polygons with a hole. Shared fixture bytes and seed across renderers.

## Reproduce checks

```
npm ci
npx playwright install chromium
npm test
```

Tests use Playwright Chromium plus axe. REVIEW_CHROMIUM_PATH can select a pre-existing Chromium executable; the recorded run used the pinned @sparticuz/chromium package. Restricted containers may require unpacking the @sparticuz/chromium Brotli archives without preserving owners and setting REVIEW_CHROMIUM_PATH, TMPDIR and FONTCONFIG_PATH; see evidence environment/limitations. The published results used Chromium 143 with software WebGL, FONTCONFIG_PATH=/etc/fonts, loopback networking, 1440/390/320 pixel viewports, and five cache-cleared loads / five warm reloads per renderer. Cache-cleared loads reuse a warm browser process and do not simulate a real cold device start, WAN or provider latency. No actual phone/GPU/network throttling benchmark claimed. Test server is closed in finally.

Fixture regeneration: generate-fixtures.py requires shapely and original evidence GeoJSON files in sibling map-review/. They are retained in the separate boundary evidence bundle. fixture-manifest.json pins generated files; evidence/fixture-validation.json records validity/hash checks. Simplification tolerance .00015 degrees with preserve_topology=True is for display testing only; no repair/snapping.

## Rights and scope

- MapLibre and Leaflet licences in public/vendor/. Both renderer dependencies and test dependency versions are pinned in package-lock.json. Vendor code is unmodified distribution code.
- Selected StatCan 2021 service boundaries: Open Government Licence–Canada v2.0. Contains information licensed under the Open Government Licence–Canada. https://open.canada.ca/en/open-government-licence-canada. Source https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer. Display geometry adapted/simplified; no endorsement.
- Municipal display fixtures: City of Vancouver and City of Toronto, adapted/simplified under their open-data licences. https://opendata.vancouver.ca/pages/licence/ and https://open.toronto.ca/open-data-licence/. Source caveats in geographic contract and prior gate report; Toronto CKAN licence field is inconsistent with its public catalog link.
- U.S. Census Bureau 2025 cartographic state display product; product-specific/international reuse review remains open. Internal unpublished evaluation only; no clearance for public asset redistribution asserted.
- Original synthetic fixtures/background: not real observations or advice. No Mapbox/MapTiler/OSM public tiles incorporated. Commercial provider/geocoding/Community exports remain separate gates.

## Future integration responsibilities (design only)

| Layer | Proposed responsibility |
| --- | --- |
| Railway API/worker | Authorized evidence/Portfolio reads; viewport and geography filters; revision-aware responses; ingestion and geometry preprocessing in separate workers, not per user request |
| Supabase | Governed records, source provenance, geography/version metadata and owner-controlled holdings; approved object storage for retained source/derived artifacts. Tables, PostGIS and migrations remain unimplemented |
| WeWeb client | Main ribbon shell, map component, selection/layer state, accessible evidence panels and request cancellation; renderer fetches approved payloads, no provider secrets embedded |
| Licensed map/tile provider | Basemap delivery and geocoding under verified plan/retention/export rights; separate from InvestScape evidence caching |

This preview does not verify production API, AI, DB, WeWeb integration or RLS. No production deployment/publication or Community post made. Renderer selection remains revisitable after real device, licensed basemap and production API benchmarks.

The GitHub documentation branch retains a source snapshot and machine-readable results. The complete downloadable bundle also contains generated fixtures, twelve screenshots and vendored renderer assets. To run the source snapshot alone, restore public/data from the bundle or regenerate it from the acquired boundary evidence; npm ci prepares vendored assets.

## Revision 2: movable, collapsible evidence panel

Use Panel position to choose Left/Right on desktop. Pin panel keeps it open while using the map; unpinned panels collapse after map interaction unless selecting evidence. Show/Hide remains available at all times. Preferences persist locally across module switches and reloads. On phones the panel stays below the map. See PANEL-REVISION-REPORT.md and the latest regression results. When replacing an earlier preview, stop the old server and hard-refresh the browser with Ctrl+F5 after starting this version.
