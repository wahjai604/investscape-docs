# Boundary qualification and fixture manifest specification — 2026-10-07

Status: planning evidence, not completed fixture acquisition or prototype implementation. Supplements [index](README.md) and [prototype plan](Map-Prototype-Implementation-Plan.md). Reviewed official sources on 2026-10-07. No provider purchased/contacted and no geometry downloaded or processed.

## Source qualification
| Candidate | Verified evidence | Remaining gate |
| --- | --- | --- |
| StatCan 2021 municipalities/CMA/provinces | Boundary reference products exist; open licence permits commercial use with accurate reproduction, source notices and non-endorsement | Exact downloadable files/resources and applicable licence linkage, IDs, CRS, vintage and byte/hash verification; download selector inaccessible through this browser tool |
| Vancouver local areas | Official catalog located; prior catalog search exposes Open Government Licence–Vancouver; city licence permits commercial copying/adaptation subject to conditions | Dynamic current catalog metadata/export endpoint, release date, field IDs and artifact validation |
| Toronto neighbourhoods | Official catalog explicitly links Open Government Licence–Toronto; official neighbourhood framework identifies 158 areas and 2022 changes | Pin exact resource URL, release/update timestamp and bytes; historical crosswalk not assumed |
| Arizona/Texas state display | Census cartographic products are simplified thematic boundaries; current page includes 2025 vintage | Exact archive link and relevant rights/product notes still to pin; no invented file URL or parcel-accuracy claim |

Do not mark any binary artifact qualified until downloaded, hashed, parsed and checked. Display vintages need not be newest if matching observation geography requires another vintage. Canonical analysis boundaries and simplified display boundaries remain distinct.

## Rights evidence
StatCan licence: commercial/non-commercial redistribution under conditions; source/adaptation notice, no implied endorsement, accurate representation, no identification linkage.
https://www.statcan.gc.ca/en/terms-conditions/open-licence
https://www.statcan.gc.ca/en/terms-conditions/open-licence-faq
Boundary guide: https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm

Vancouver: commercial use subject to attribution/exclusions; dataset-level applicability still must be captured.
https://opendata.vancouver.ca/pages/licence/
https://opendata.vancouver.ca/explore/dataset/local-area-boundary/

Toronto: commercial copy/adapt/distribute permitted with attribution; excludes personal information, unlicensed third-party rights and official symbols; non-endorsement.
https://open.toronto.ca/open-data-licence/
https://open.toronto.ca/dataset/neighbourhoods/
https://www.toronto.ca/city-government/data-research-maps/neighbourhoods-communities/neighbourhood-profiles/about-toronto-neighbourhoods/

Census: thematic small-scale simplified boundaries and geographic join codes. Product acquisition/rights gate remains open.
https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html
https://www.census.gov/about/policies/citation.html

## Provider export finding — corrects any blanket sharing assumption
MapTiler Cloud remains an interactive evaluation candidate, NOT cleared for persistent Community screenshots or server-cached basemaps.
Official Cloud terms: section 6 requires agreement for proxy and exports outside Service; section 7 restricts storing/redistributing map content through server cache or screenshot/static image instead of direct APIs. Section 4 documents Static Maps API, but its existence does not clear persistent user-generated Community images. Free plan is noncommercial/R&D only. Individual contracts may differ.
https://www.maptiler.com/terms/cloud/
https://docs.maptiler.com/cloud/api/static-maps/
https://docs.maptiler.com/guides/map-design/attribution/add-attribution/

Planning decision: controlled locally generated basemap for renderer benchmarks/export tests. Do not download provider tiles into those fixtures. For future Community sharing choose explicitly licensed export/storage rights or export only cleared InvestScape overlays over controlled geometry. Attribution alone does not overcome contractual restrictions. Keep API cache of InvestScape observations distinct from provider basemap cache.
No provider support email sent. No paid subscription authorized.

## Frozen fixture specification v0.1
This is a selection specification, NOT a populated artifact manifest. Every absent hash/count remains null or pending.
Proposed entries:
- ca-admin-2021: selected province/municipality/CMA source geometry after resource qualification
- vancouver-local-areas: official municipal display layer after acquisition check
- toronto-neighbourhoods: explicitly versioned 158-framework display layer after acquisition check
- us-state-display: Arizona/Texas selected from pinned Census cartographic product
- synthetic-metrics: population/income/rent, zeros/missing, observed/derived/estimated/fixture labels, incompatible periods/currency/definitions
- synthetic-research: point/city/state scopes, approved/draft/withdrawn/link-only states; mocks never return hidden states to member client
- synthetic-holdings: owner-A/owner-B examples, investment/development, exact/approximate/unmapped
- synthetic-point-stress: 100/1000/10000 points; seed specification 20261007, generator/version/hash pending
- synthetic-polygon-stress: escalating vertex counts, multipolygons/holes, generated shapes not represented as real boundaries
- controlled-basemap: original simple neutral background/grid; no third-party map content

Manifest columns: artifactId, relativePath, sourceUrl, resourceId, licenceUrl, attribution, sourceVintage, retrievedAt, originalCrs, outputCrs, canonicalIds, sha256, bytes, featureCount, vertexCount, generatorVersion, seed, synthetic, permittedUses, qualificationStatus.
No generated metrics represent actual investment evidence. CRS output WGS84 longitude/latitude; retain source CRS. Check geometry validity, IDs, overlaps/holes, bounding boxes and intended subset. Record transformations/simplification parameters and source/derived hashes.
Provider-independent content and shell stay identical in renderer tests. Capture plan: five cold/five warm normal runs with device/browser/version and controlled network condition; stress limits separately disclosed. No performance measurements made.

## Next deliverable
Acquire and validate the named official boundary artifacts where permitted; populate a real manifest. Resolve Census product notes and provider Community-export rights before declaring clearance. Creation of renderer code, API routes, schema/PostGIS changes, service provisioning, WeWeb component/page publication and live Community posting remain separately gated.
