# InvestScape map evidence: remaining-gates review

Reviewed 2026-10-07. Assistant-run acquisition and geometry checks. Documentation/evidence only; no renderer, API, schema, deployment or publication changes. This report supersedes earlier pending acquisition statuses only where explicitly stated.

## Gate dispositions

| Gate | Result | Disposition |
| --- | --- | --- |
| Toronto/Vancouver city + CMA acquisition | Official StatCan REST returned four selected geometries with verified UID/name pairs; retained responses, request URLs and SHA256 | Acquisition closed for these selected 2021 display boundaries; earlier ZIP 403 remains historical |
| Individual geometry validity / IDs | All 186 features across five datasets valid and nonempty in source lon/lat and EPSG:6933 audit; IDs unique within each dataset | Check closed for acquired files only |
| Within-layer overlap | Toronto 49 positive-area pairs, total ~5.53 m², max ~1.54 m²; Vancouver 10 pairs, total ~14,247.44 m², max ~5,507.48 m²; selected CSD/CMA and AZ/TX pairs zero | Audit performed; clean partition gate remains open, particularly Vancouver |
| Boundary vintage / provenance | StatCan 2021, service publication 2022-09-21; Census archive 2025; Toronto 158 framework, selected resource modified 2026-02-20; Vancouver data processed/modified 2023-06-24 | Metadata dates recorded; they are not necessarily legal boundary effective dates |
| StatCan endpoint rights | Service explicitly identifies Open Government Licence–Canada | Licence linkage and version 2.0 text verified; conditional reuse review closed for selected service boundaries, subject to attribution/exclusions; do not substitute another delivery product licence |
| Census reuse | Official public archive retained; official DS027 supports general US copyright position for employee works with third-party exclusions | General policy evidence strengthened; exact product/international redistribution review remains open |
| Mapbox terms acquisition | July 21, 2026 product terms downloaded from current official legal portal | Retrieval closed; persistent Community exports not cleared |
| MapTiler Community exports | Cloud terms retain export/storage/redistribution restrictions | Not cleared; requires applicable written rights or alternative controlled export |
| Prototype readiness | Real source geometry acquired; no synthetic fixtures or renderer benchmark generated | Implementation authorization, synthetic fixture generation and actual performance/accessibility/privacy testing remain future gates |

## Canadian official replacement path
Service: https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer
Layer 6 CMA, lcma000b21s_e: Toronto CMAUID 535 / DGUID 2021S050535535; Vancouver CMAUID 933 / DGUID 2021S050559933.
Layer 9 CSD, lcsd000b21s_e: Toronto CSDUID 3520005 / DGUID 2021A00053520005; Vancouver CSDUID 5915022 / DGUID 2021A00055915022.
Source CRS EPSG:3347. REST requests explicitly requested outSR=4326; original service GeoJSON responses retained without client repair or simplification. Exact requests in canada-cma-request.txt and canada-csd-request.txt. These service products have suffix s; no equivalence to the earlier blocked suffix a ZIPs asserted.
CMA response: 2 features, 158,327 vertices, 6,457,365 bytes. CSD: 2 features, 119,289 vertices, 4,865,399 bytes. Full response sizes matter for later simplification/viewport tests. A city and its metro are distinct geography types, not interchangeable observations. BC/ON/country context geometries are not acquired in this pass.

## Topology implications
Reproducible check: topology-check.py, topology-audit.json and gate-pass-manifest.json. Pairwise polygon intersections measured in equal-area EPSG:6933; the 1 m² listing threshold is a reporting filter, not an approved tolerance. No geometry repaired or snapped. Source rows/IDs retained. Vancouver name is a display/source key, not a guaranteed permanent canonical ID. Toronto historic 140-to-158 crosswalk not produced.
Vancouver overlap examples: Mount Pleasant / Riley Park ~5,507 m²; Kitsilano / West Point Grey ~1,958 m². All polygons individually valid does not establish a non-overlapping partition. Proposed future point assignment must return ambiguous matches or use an approved deterministic policy; do not silently discard overlap. Toronto slivers also require an explicit tolerance before analytic use.
No authoritative same-vintage coverage mask acquired: gaps, coverage completeness and cross-level nesting are not certified. City/CMA/local-area layers differ in shoreline detail and purpose; union mismatch alone would not prove missing neighbourhoods. Cartographic boundaries are display fixtures, not parcel/zoning/legal surveys.
Vancouver metadata states approximate street centreline boundaries and no boundary change cadence; effective date remains unknown. Toronto catalog date_published=2010-11-05 describes the catalog, not the 158-framework effective date; CKAN licence fields say notspecified although official public catalog links its city licence. Preserve both records rather than inventing a uniform licence field.

## Provider export disposition
Current Mapbox Product Terms, last updated July 21, 2026, from https://www.mapbox.com/legal/product-terms, retained PDF/text for review.
Sections 1.7–1.10 distinguish limited promotional/Studio/purchased print rights from default export/storage and redistribution restrictions. Section 2.8.1 allows limited same-device caching but prohibits distributing mapping content through proxies or static images instead of direct API access. A general user-generated Community card is not established as incidental promotion or a purchased right. Static API availability is insufficient clearance. Account Orders may change rights; none inspected. Other provider constraints, including AI use and geocoding retention, need separate qualification before use.
MapTiler: https://www.maptiler.com/terms/cloud/ remains uncleared for persistent Community cards and server basemap caching. No vendors contacted or subscriptions purchased.
Planning recommendation: use original neutral backgrounds plus separately cleared overlays for the unpublished renderer/export comparison. Preserve interactive provider qualification separately; no provider tiles cached/downloaded as fixtures. Community posting remains gated. This review does not create an export feature.

## Remaining evidence/action owners
- Data qualification: Canada licence text acquired and reviewed (version 2.0; official page modified 2022-12-02). It permits lawful copying/adaptation/distribution with source acknowledgement and licence link where possible; excludes personal information, unauthorized third-party rights and official marks, and prohibits implied endorsement. Obtain Census product-specific reuse notes; preserve attribution/exclusions. Do not claim universal international reuse clearance from US employee-work policy.
- Geography/product: approve overlap handling/tolerance and versioned local-area keys; historical crosswalk only if historical metrics require it. Acquire remaining geographic levels if required by test scope.
- Map provider/commercial owner: select provider/plan only after renderer, geocoding, caching, AI-use and stored Community-export terms are satisfied; alternatively keep controlled export. Named owner not supplied.
- Implementation owner: only after separate authorization, create common synthetic fixtures and unpublished MapLibre/Leaflet prototype; measure shared-shell navigation, race/error states, privacy, accessibility and performance. No results claimed yet.
- Research remains separately gated by item rights, editorial owner and publication/audience rules; acquisition of boundaries does not close those gates.

Census policy: https://www2.census.gov/foia/ds_policies/ds027.pdf
Census citation: https://www.census.gov/about/policies/citation.html
Canada licence linkage: https://open.canada.ca/en/open-government-licence-canada
Vancouver metadata: https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/local-area-boundary
