# Market Intel map visualization framework

Status: accepted planning direction, unimplemented. See [pack index](README.md).

## Application shell
The map opens below the main ribbon inside Market Intel. The ribbon stays available so users can jump to other modules. Market Intel sub-navigation controls Overview, Metrics, Research and Compare. Do not force every other module to render on top of the map.
On leaving Market Intel preserve camera, selected geography, boundary version, metric/period, filters, layer choices and comparison tray in session state. On return restore state and revalidate evidence. No background refresh/polling is required while hidden. Destroy or pause renderer resources safely; restore from compact state. Logout/account switch clears personal state and caches. Persisted preferences require a separately reviewed owner contract.

## Responsibilities
Railway: API authorization, comparisons, permitted ingestion/preparation workers.
Supabase Database: canonical geography and observations, provenance, editorial states and owner records; future PostGIS adoption requires schema authorization.
Supabase Storage: permitted files and versioned simplified display geometry.
WeWeb/browser: map component, ribbon, evidence panels, interactions and list fallback.
External provider: licensed basemap tiles and geocoding. Renderer does not supply data rights.
Prepare shared evidence once; serve bounded reads repeatedly. Workers and API replicas can execute common engine functions without duplicating definitions. No scale capacity is certified.

## Proposed read operations
Find geography: query/country/levels/cursor -> canonical ID, name, parent, boundary version and bounds.
Map evidence: bbox [west,south,east,north], zoom, requested resolution, metric, period, Research filters, requestId -> geometry references, observations, approved references, legend, gaps, pagination and partial status.
Selected detail: geography ID/boundary version/filters -> permitted observations and approved Research.
Compare: geography IDs/metrics/periods -> direct, adjusted, context-only or unavailable with reasons.
Research detail: ID -> permitted content or neutral unavailable response.
Version envelope: contractVersion, requestId, generatedAt, datasetRevision, effective resolution, boundaryVersion, coverage, continuation and errors. Bound inputs and response size; no silent truncation.
Each observation retains actual unit/currency, source, period, definition, geography, revision and observed/derived/estimated/fixture state. Unknown dates remain unknown. Fixture values excluded from normal member reads.
Use one primary colour scale; missing is distinct from zero. Render attribution, dates and limits. GeoJSON longitude precedes latitude. Handle multipolygons/holes; anti-meridian viewports require explicit split or rejection.
Debounce settled movement, cancel obsolete requests, ignore stale response IDs. Equivalent list/table supports keyboard tasks.
Only approved audience-permitted Research appears. Broad-area articles do not get arbitrary parcel pins.

## Mandatory comparison rules
Percentage changes require compatible definitions. FX conversion does not establish affordability. Per-person/household metrics require compatible periods/geographies and disclosed formula/denominator. Currency, boundary, asset and rent definitions must be checked before comparison.

## Boundary and provider candidates
StatCan municipality/CMA/province products; Vancouver local areas; Toronto versioned neighbourhoods; Census state/place/county/metro products. Pin vintage, IDs, licence and provenance individually. Municipal and census areas need explicit crosswalks. Simplification is display-only, never legal parcel accuracy.
Provider criteria: Canada/US quality, raster/vector compatibility, attribution, storage/export/caching permissions, quota/SLA, costs, credential restrictions, privacy and replaceability. Named-market catalog search precedes external geocoding.
Sources checked 2026-10-07:
https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm
https://opendata.vancouver.ca/explore/dataset/local-area-boundary/
https://www.toronto.ca/city-government/data-research-maps/neighbourhoods-communities/neighbourhood-profiles/about-toronto-neighbourhoods/
https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
https://operations.osmfoundation.org/policies/tiles/
https://operations.osmfoundation.org/policies/nominatim/
https://docs.maptiler.com/cloud/api/geocoding/
https://docs.mapbox.com/help/dive-deeper/understand-temporary-vs-permanent-geocoding/
Public Nominatim is not the default autocomplete/backend; public OSM tile capacity is not a production SLA. No provider contract is cleared by listing it.
