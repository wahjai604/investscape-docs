# Market Intel map — first integration proposal
2026-10-08 UTC / 2026-10-07 Vancouver. Design-only, sequential work packages. This document authorizes no implementation, migration, deployment or publication.

## Recommended first deliverable
An unpublished Investscape Dev Market Intel workspace beneath the shared main ribbon, with renderer-independent boundary selection and an accessible evidence panel. Start with permitted public geography and an explicitly unavailable quantitative/Research state where no approved data exists. Private portfolio markers follow as a separate integration after their own read contract and tests. Existing Quick/Full denial acceptance is useful baseline evidence, not approval of a new map access path.

## Sequence
| Order | Deliverable | Concrete completion |
|---|---|---|
| 1 | Final route/field mapping and fixture manifest | Pin current engine output types, canonical geography crosswalk and cleared boundary assets; identify every observed/derived/mock/unavailable field. |
| 2 | Isolated API source candidate, when implementation authorized | Authenticated geography/boundary/observation read adapters with bounded requests and honest layer states; local tests, no deployment. |
| 3 | Review renderer/provider decision | Same behavior/data tested with Leaflet and MapLibre. Provisional Leaflet preference remains reversible; no commercial tile/geocoding integration before rights/budget decision. |
| 4 | Unpublished WeWeb source candidate, when draft edits authorized | Map fills workspace below shared ribbon; panel left/right/collapse/pin, area selection, table alternative, loading/error states and navigation restoration. |
| 5 | Isolated staging verification, when deployment authorized | Pin deployed commit, provider configuration and allowed origin; verify real requests, hidden-map teardown and device behavior. |
| 6 | Private portfolio overlay | Owner-scoped minimized records, approved location model, off by default, direct read denial/identity-switch/cache tests. No automatic geocoding or guessing. |
| 7 | Approved Research integration | Approved catalog, editorial owner/audience/rights, geographic matching and withdrawal invalidation before member payloads. |
| 8 | Comparison/AI integration | Compatible metric comparisons and authorized cited evidence; no automatic score/write/transfer. Community screenshot/export remains separate and rights-dependent. |

## Client workspace
Market Intel is a genuine page under the shared ribbon, not multiple modules simulated by one current-tab variable. A proposed /market-intel path requires collision/inventory review before page creation. Other modules remain genuine pages. Returning restores permitted viewport/selection/filter state. Map renderer is suspended/destroyed while hidden; restore on entry.
Map container occupies remaining viewport height after main/sub-ribbon. Data layers draw within the map; search/legend/evidence/AI panels are positioned above it. Desktop panel may sit left/right and pin/collapse. Phone details use a bottom sheet or below-map panel; no guaranteed desktop-style floating sidebar at 320px. Keyboard-accessible area list and evidence detail exist independently of map hit-testing.
Only non-sensitive layout preferences persist locally. Private marker data, credentials and AI context never persist in URLs/local storage/shared caches.

## Proposed source changes, not existing files/routes
| Target | Candidate artifacts |
|---|---|
| API isolated branch/worktree | src/routes/market-intelligence/map-read.ts; src/validation/market-map-read-schemas.ts; src/market-map/readAdapter.ts; relevant tests and versioned boundary manifest |
| API existing routes | Minimal mount gated off by default; preserve E60–E66 and Full/Quick calculation contracts and helper bytes |
| Docs | Contract examples, source manifest, crosswalk review, UI mapping and acceptance report |
| WeWeb Investscape Dev | Draft Market Intel page sharing header; renderer host/component chosen after inventory; named read workflows and state variables |
No new E number is assigned to rendering or a replica. No schema/table/PostGIS/storage requirement is presumed.

## Proposed read-service surface
Candidate namespace /v1/market-intelligence/map (not implemented).
- POST /read: read-only bounded query accepting contract version, request ID, typed geography IDs/viewport, zoom, layers, periods/metric IDs/cursor. POST is a query transport here; it creates no stored state or lock/fence operation.
- GET /geographies: bounded curated search or explicit canonical ID lookup. No unlimited worldwide geocoder claim.
- Research and portfolio operations remain separate candidates with their own authorization/rights, not bundled into public cache entries.
Authentication uses verified session identity before private access. No body-supplied owner grants access. Default-off routes return unavailable if configuration/approved sources are absent.
Response follows proposed read envelope with per-layer status, provenance and revision vector. Public geography may be available while metrics/Research are unavailable; this is partial coverage, not empty evidence.
Operational caps (page/feature/vertex/response byte/request rate) must be explicit in a future implementation contract after fixture measurement. Limits fail visibly, never silently truncate area coverage.

## Initial geography and evidence
Vancouver and Toronto city/CMA kept distinct; Arizona/Texas statewide. US cities unselected. Official display boundaries are not zoning/parcel authority. Previously detected local-area overlaps require ambiguity choices; geometry simplification is display-only.
Manifest fields: artifact hash, authority/source URL, license evidence/attribution, canonical type/ID/vintage, effective date if known, fetched/review dates, simplification profile, display-only flag and coverage. Unknown remains unknown.
Existing prototype fixtures stay labelled synthetic and cannot be substituted in live mode. No cleared catalog means Research layer unavailable. Existing E66 snapshot inputs require genuine neighborhood identifiers/coordinates and approved mappings; do not manufacture observations from boundary centroids.

## Acceptance for first source candidate
1. Boundary ID/type/vintage, holes, ambiguous overlaps and unsupported bounds validated.
2. Approved-source filtering and attribution carried into panel and accessible list.
3. Zero/missing, source periods, observed/derived/synthetic/unavailable distinguished.
4. New query/session generation rejects late responses; per-layer failure visible; expired session clears private state.
5. Ribbon navigation preserves safe UI state and stops hidden-map requests.
6. Left/right/pin/collapse and 320/390/desktop keyboard/light/dark checked; physical mobile verification reported separately.
7. No Research/private/AI fixture leaks into live mode; new private operation denial separately tested when introduced.
8. Candidate source/review hashes and scope confirmed; no unrelated Relationship OS or engine changes.

## Immediate bounded next action
Read and map E65/E66 engine result fields and existing source/provider lineage at pinned API commit 2cec0ab. Finalize one illustrative map response and its unavailable cases, then prepare a concrete implementation change list for owner review. This continues planning/source review only.
Pending product gates: renderer final choice, provider/export rights, canonical local-area crosswalk/ambiguity policy, approved observation source cohort, Research editorial owner/catalog/audience, portfolio location model, production workload budgets.
