# Phase 3 map comparison — five-step completion report

Date: 2026-10-07. Authorized isolated unpublished prototype work. Assistant-run checks; no user-reported results substituted. No WeWeb editing/publication, production deployment, schema change, engine release or Community posting.

## Sequential deliverables

1. Geographic selection contract: geography type/authority/vintage/source ID; explicit multiple-match chooser including shared edges; no match retains selection; local-area analytic tolerance/crosswalk not invented. Display-only simplification retains original provenance.
2. Controlled content frozen: original neutral background plus attributed government display boundaries. No commercial tiles/geocoding. Mapbox/MapTiler export gate remains open independently of this prototype.
3. Common fixtures: 8 hashed/validated files; 186 simplified display features; synthetic overlap, 100/1,000/10,000 points and 1,000/10,000/50,000 exterior-vertex polygons with holes. Point seed 20261007, deterministic prefixes verified. Synthetic metric zero/missing cases and Research/holding fixtures are original test data.
4. Both renderers implemented under one ribbon/evidence shell. Camera, selection, filters, visible layers and comparison preserved through module stubs; hidden map disposed; no transfer/overwrite behavior. Research list/detail/pagination, mock Portfolio opt-in/isolation, comparison caveats, light/dark, keyboard/touch selection and accessible fit/zoom actions.
5. Comparison executed: 43 passing checks (7 API, 36 browser), covering API privacy/filtering, race/error recovery, direct detail denial, responsive/a11y scans, navigation lifecycle, identical point/vertex workloads and repeated load timings. Source ZIP, screenshots, fixture manifest and machine-readable test results retained.

## Measurements

| Renderer | Cache-cleared load median (5) | Warm reload median (5) | 10,000 points update | 50,000 exterior vertices update |
| --- | --- | --- | --- | --- |
| maplibre | 463.3 ms | 527.5 ms | 506.6 ms | 590.4 ms |
| leaflet | 119.3 ms | 100.6 ms | 207.4 ms | 61.5 ms |

Load clock: navigation to boot completion; cache cleared via CDP with warm browser process. Update clock: full map teardown/reinitialization, local fixture fetch and renderer completion (MapLibre idle; Leaflet two animation frames). This is not a pure draw-cost benchmark; the completion signals differ. No provider tiles or WAN latency. Both passed provisional <=3s usable-load target in this environment. Evidence panel DOM updates after response were <500ms; this excludes network/paint and is not a production interaction guarantee.

Environment: Linux, Node 24.19.0, Chromium 143.0.7499.0, software WebGL/SwiftShader. Versions: MapLibre 5.20.0, Leaflet 1.9.4. No physical phone, hardware GPU, screen reader or production network test. 1440/390/320 widths in light/dark; touch emulated. Twelve screenshots retained. Automated axe serious/critical violations: zero on these twelve views; this does not certify all accessibility. Cold HTTP-cache loads are not cold device/process starts.

## Renderer decision

Leaflet is the provisional isolated-preview default: lower load and update times in this bounded software-rendering workload, with required behaviors passing. MapLibre remains a working comparison option. This revises the earlier preference only for the prototype; neither is selected for production. Local results do not establish MapLibre hardware-GPU performance, vector-tile performance, network efficiency or tens-of-thousands-user capacity. Before production selection, test physical/mobile devices, licensed basemap delivery, vector tile/viewport loading, interaction frame rates, memory and actual API payloads. No recommendation/scoring algorithm introduced.

## Remaining integration gates

- Production geography joins still need approved canonical keys, overlap/tolerance handling, gap/crosswalk evidence and remaining geographic levels. CSD != CMA; local-area geometry is not parcel/zoning evidence.
- Licensed tile/geocoder procurement, provider AI-use/retention/export conditions and Census product-specific/international public redistribution evidence remain open. No provider agreement purchased/contacted. Community export remains deferred.
- Research editorial owner, catalog/item rights and audience/publication rules still required before live content. Fixture filtering does not approve a source or simulate crawler/ingestion throughput.
- Mock owner header is NOT auth/RLS; live owner isolation and approved API integration must be tested separately. Public client never receives fixture hidden items; internal records remain server-only. No actual Portfolio data used.
- Proposed next integration design: Railway API/worker for authorized read envelopes and viewport data; Supabase for governed records/provenance/owner storage; WeWeb for main-ribbon map state and panels. This report does not authorize changes to those systems.

See README.md, GEOGRAPHIC-SELECTION-CONTRACT.md, fixture-manifest.json and evidence/test-results.json in the prototype bundle. The fixture server binds only 127.0.0.1 and all test servers/browser processes are torn down. Initial browser download/extraction failures were environment issues; final results supersede those attempts, which are retained as diagnostics only.
