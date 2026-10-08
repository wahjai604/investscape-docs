# 20 — MapLibre versus Leaflet unpublished prototype test specification

Date: 2026-10-08. Documentation-only test plan. The goal is an equal comparison against the agreed Market Intel map requirements. This note does not implement either renderer or authorize a WeWeb change, service, schema, deployment or publication.

## Comparison rules

- Use the same synthetic fixture, boundary files, map style, API stub responses, browser/device matrix and test scripts for both renderers.
- Fix renderer versions, data compression/generalization and interaction settings during each run. Record versions and configuration.
- Separate client rendering results from backend/API performance. Use a deterministic local/staging stub for renderer-only tests; run service-load tests as a separate future gate.
- Do not use private portfolio data or unapproved Research content. Label test points synthetic.
- Do not claim a renderer wins based on the six pilot shapes alone; include larger synthetic volumes.

## Fixture set

### A. Pilot accuracy fixture

Use the selected source-key examples, with real values only where note 17 records public rendered observations:

- Two CSD features: Vancouver `5915022` and Toronto `3520005`, with 2021 boundary IDs/DGUID metadata. Vancouver city annual population is only partly observation-verified; unverified years stay absent.
- Two CMA features: Vancouver `59933` / DGUID `2021S0503933`, Toronto `35535` / DGUID `2021S0503535`.
- Two-bedroom QRS asking and paid rent as separate CMA series, with one unavailable value, one `E` caution value and one `F` unreliable-to-publish case represented as explicit fixture states. Only use actual Toronto/Vancouver numeric values from note 17.
- Two U.S. state features with synthetic state observations and MOEs for Arizona/Texas until exact ACS rows are retrieved.
- CMHC rows represented as unavailable-source fixtures until exact records/flags are verified. Do not place synthetic numbers under a CMHC source label.
- A small set of synthetic approved-item markers with title, source URL, publication/review dates and geography tags; these exercise the Research overlay only and are not real Research content.
- A small set of synthetic portfolio properties in a user-only layer for toggle and privacy behavior; never include them in public test output.

CSD, CMA and state layers are separate contexts. Do not draw City and Metro population on the same polygons or duplicate CMA rent across City features.

### B. Scale fixtures

Generate deterministic synthetic polygons/points, with source names clearly marked “synthetic test data”:

| Profile | Polygons in active geographic context | Qualitative item markers | Private portfolio markers | Purpose |
|---|---:|---:|---:|---|
| Pilot | 2–6 | 25 | 10 | Basic pan/zoom, selection, legend and overlays |
| Local expansion | 1,000 | 5,000 | 500 | Local-market browsing, clustering and viewport queries |
| Regional stress | 10,000 | 50,000 | 5,000 | Renderer memory, loading, filtering and layer-toggle stress |

The figures are test profiles, not a commitment to publish or ingest that many official geographies. Derive synthetic polygon complexity from the selected boundary files after generalization rules are agreed. Include dense urban features, large rural polygons, islands/water boundaries and overlapping marker clusters.

## Behaviour and acceptance matrix

| Area | Test | Pass condition |
|---|---|---|
| Geography/context | Select a CSD, a CMA and a U.S. state in their separate contexts. Verify feature IDs and labels. | Selected map feature, detail panel, API fixture key and legend label all refer to the same geographic level and vintage. No name-only join. |
| Quantitative shading | Toggle population, asking rent, paid rent, ACS income and gross rent, including missing/flagged samples. | Each layer identifies unit, period, source, geography and quality state; unverified/withheld data are not painted as zero. Asking/paid and median gross/asking rent remain distinct. |
| Research overlay | Enable/disable approved-item marker layer; select a marker and open its source card. | Markers are independent of the quantitative choropleth; card exposes only allowed summary/link and attribution fields; excluded/withdrawn items do not render. |
| Portfolio overlay | User toggles a synthetic private portfolio layer; compare authenticated owner view and logged-out view in stubbed scenarios. | Only authorized view displays private markers; user can switch layer off; no private values appear in public map/export fixture. |
| Ribbon navigation/state | Navigate among main-ribbon tabs and return to Market Intel. | Ribbon remains available; map selection and ephemeral view state follow the previously selected retention rule without an accidental backend write. |
| Legend controls | Move legend left/right; collapse; pin/unpin; resize viewport. | State is operable with keyboard and touch; pin/collapse state is visually clear and does not hide critical map controls. |
| Responsive layout | Test phone, tablet and desktop widths; portrait/landscape; browser zoom. | No clipped controls, inaccessible legend, unexpected horizontal scroll or blocked map gestures. |
| Accessibility | Keyboard navigation, visible focus, non-color cue for metric ranges/flags, reduced motion, screen-reader names for controls and selected geography. | Core select/toggle/detail flows work without a pointer; names and status are understandable without relying on color alone. |
| Data-state/error handling | Simulate empty, page/viewport continuation, stale, unavailable/suppressed, partial layer failure, timeout and retry. | Each state is distinguishable; one failing source layer does not erase successful layers; no stale value appears current without a dated status. |
| Rendering volume | Run all three scale profiles on the same target devices and network profiles. | Record render-ready time, pan/zoom responsiveness, memory, console errors, payload/geometry bytes, marker aggregation and dropped/hidden features. |
| Cache and viewport | Repeat same view, pan within and beyond loaded extent, switch a layer and revisit. | Requests are viewport-bounded; cached content is reused according to declared freshness; stale/invalidated responses are recognizable. |
| Geometric accuracy | Overlay each geometry with source feature IDs, inspect edges at intended zooms, run geometry validity and duplicate-key checks. | All expected pilot IDs match once at the correct level/vintage; map simplification does not change identity or imply parcel accuracy. |

## Measurement and decision procedure

For each renderer/device/network/profile, record:

- first meaningful map display and first interactive time;
- pan/zoom frame responsiveness and any dropped events;
- peak client memory and CPU;
- geometry/marker payload bytes before and after compression/generalization;
- requests per interaction, cache hit/miss behavior and API stub latency;
- layer-enable time, filter response and selection/detail latency;
- keyboard/a11y findings, functional failures, browser errors and recovery behavior.

Do not invent the pass thresholds after seeing the preferred renderer. Before prototype execution, set target devices, network profiles, required supported polygon/marker counts, p95 latency targets, acceptable transfer/memory budgets and accessibility release criteria. Compare results against those targets and record the reasons for any failure.

## Separate server-load profile

A smooth browser render does not establish service scalability. For a later isolated performance review, keep the same response fixture but vary concurrent callers in controlled steps (for example, 1, 10, 100 and 1,000) against a non-production stub/staging service. Measure p50/p95/p99, cache effectiveness, bytes served, errors, queue saturation and provider calls. Higher user-count projections (tens or hundreds of thousands) require an arrival-rate model, cache/CDN design and budget review; they cannot be inferred from renderer benchmarking.

## Decision sheet

After an authorized prototype comparison, score each renderer independently for:

1. correctness and geographic key handling;
2. vector/raster/tile support and rendering options needed by the approved layers;
3. mobile interaction and accessibility;
4. large local/regional fixtures and viewport loading;
5. integration friction with the existing WeWeb/app architecture;
6. hosting/tile style/provider costs and terms;
7. maintenance, library versions and operational observability.

Record any feature that requires a plugin, paid service or provider terms. Choose only after both implementations pass the same functional suite and their measured trade-offs are reviewed.

**Disposition:** test fixture and acceptance matrix are ready for review. Numeric performance thresholds and the prototype authorization remain open. No renderer package, page, component, data store, map tile service or deployment was created.


## Official renderer capability review

The current official library documentation supports treating these as different rendering models, not interchangeable skins:

| Capability | MapLibre GL JS | Leaflet | Relevance to InvestScape |
|---|---|---|---|
| Core rendering model | WebGL map renderer designed around vector tiles and a style document/layer stack. | General-purpose interactive map with tile/grid layers and vector geometries rendered through SVG or Canvas. Canvas can be selected for paths. | MapLibre is a stronger candidate if the approved production design depends on server-generated vector tiles and many styled thematic layers. Leaflet can remain a viable candidate for a simpler GeoJSON/CSS/SVG/Canvas pilot. |
| Large datasets | Official guidance recommends loading GeoJSON by URL rather than embedding it in JavaScript, considering vector tiles, and server tiling for very large data. | GridLayer supports tiled display; GeoJSON and vector layers are available, with Canvas as an option. | Neither renderer removes the need to bound data by viewport, simplify shapes, cache results and select an appropriate tile/data service. |
| Keyboard and motion | The current MapOptions documentation exposes keyboard interaction; map animation respects reduced-motion settings unless explicitly overridden as essential. | Leaflet publishes a map accessibility guide and advises keyboard and screen-reader testing; control/feature labelling must be checked in the constructed interface. | Build control names, focus order, selected-feature announcements and legend semantics into tests for both. Library interactions alone do not make the surrounding UI accessible. |
| Cost/rights | The rendering library does not provide unrestricted basemap tiles or geocoding. A style source, tile source, hosting and attribution are separate decisions. | Same: the renderer does not grant tile, geocoding or data rights. | Compare full serving/usage terms and operational cost separately from library license. |

**Current planning recommendation:** keep both renderers in the equal-fixture comparison. If the approved scale target requires server-side vector tiles, use MapLibre as the initial benchmark candidate because vector tiles and style-layer rendering are central to its documented model. Do not select it as final until the same prototype fixture, target-device tests, WebGL/device support, accessibility checks and whole-system hosting costs are measured. If the first release remains a small, low-complexity GeoJSON pilot, Leaflet may be simpler to prototype. This is an inference from the libraries' official documented rendering models, not a measured performance conclusion.

### Official library references

- MapLibre GL JS introduction (WebGL, vector tiles and style document): https://maplibre.org/maplibre-gl-js/docs/
- MapLibre large-data guidance (GeoJSON URL, vector tiles and server tiling): https://maplibre.org/maplibre-gl-js/docs/guides/large-data/
- MapLibre map options (keyboard, gestures): https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/
- MapLibre map/keyboard and reduced-motion behavior: https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/
- Leaflet API reference (SVG/Canvas vector renderer and `preferCanvas`): https://leafletjs.com/reference.html
- Leaflet accessibility guide: https://leafletjs.com/examples/accessibility/
- Leaflet GeoJSON guide: https://leafletjs.com/examples/geojson/
