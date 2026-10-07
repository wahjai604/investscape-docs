# Map renderer prototype implementation plan

Status: reviewable proposal; building code, WeWeb component publication and deployment not authorized.

## Deliverables
Two isolated local implementations (MapLibre and Leaflet), shared shell/API mock/fixtures, fixture manifest, scripted runbook, measurements and recommendation. No real user holdings, live API writes, production integration or E85 activation.
Pin stable dependency versions/lockfiles when implementation begins. No new E-number.
Fixtures not created by this planning commit; hashes and actual counts PENDING, never invented.

## Fixture manifest specification
Record path, SHA-256, licence/attribution, origin URL, retrievedAt, boundary vintage/CRS, feature/vertex count, byte size, purpose, synthetic flag and generator seed where applicable.
Boundary files qualify individually before downloading. GeoJSON WGS84 lon/lat; preserve canonical IDs and holes/multipolygons. Display simplification versions separately.
Synthetic metrics: compatible and mismatched periods/definitions/currencies, zeros/missing, estimated/derived/fixture; no financial validity claim.
Research: approved/draft/withdrawn/link-only, point/city/state coverage.
Synthetic owner A/B holdings: investments/developments, approximate/unmapped, never actual portfolio rows.
Stress tiers: 100/1,000/10,000 points; polygon complexity tiers with measured vertex counts. These are test inputs not capacity promises.
Controlled local basemap for performance; licensed remote-provider visual check separately records raster/vector/network differences. Do not load-test public third-party services.

## Functional runbook
Search/select each area; pan/zoom/filter; Research list/detail; compare compatible/incompatible cases; toggle personal layer; jump ribbon away/back; stale/out-of-order responses; logout/account switch; errors/empty/partial; export synthetic Community preview without posting.
Mock authorization validates client behaviour only, not backend security.
Selected UI widths 320/390/430 and desktop; both themes. Keyboard and equivalent list tasks. Real-device follow-up before mobile readiness claim.
Tests should validate behaviour, not mirror library internals.

## Proposed gates and measurement
Zero wrong IDs/geographic joins/publication states, stale overwrites or privacy leaks. Missing distinct from zero. All incompatibilities disclosed.
Local evidence panel <=500 ms after mock response; usable map <=3 s reference device excluding remote network. Provisional targets, measure feasibility.
Record browser/device/OS/dependency versions, cold/warm runs, median/max timing, payload/request counts, errors, memory and vertex/point count. At least five runs per normal scenario; repeated cycle checks for retained-memory growth. Stress degradation documented rather than automatically rejected.
Functional/accessibility failures outweigh minor speed differences. Evaluate WeWeb lifecycle feasibility before selecting final renderer.
No checks executed by documentation creation.

## Sequencing
1. Review this pack and unresolved product decisions.
2. Qualify boundary/provider rights and finalize exact fixture list.
3. Separately authorize isolated prototype only.
4. Create/pin fixtures and implementations, run bounded verification.
5. Return comparative evidence and WeWeb integration proposal.
6. Separately authorize component/API/schema work as required; no production or page publication.
