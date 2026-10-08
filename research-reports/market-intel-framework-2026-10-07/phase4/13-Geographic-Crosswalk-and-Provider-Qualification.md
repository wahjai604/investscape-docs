# 13 — Geographic crosswalk and provider qualification
Date: 2026-10-07 (America/Vancouver). Read-only source review. No engine execution, provider API call, asset download, or production use.

## 1. Canonical geography crosswalk

Identifiers were checked against Statistics Canada SGC 2021 sources and the U.S. Census Bureau state code list. Keep code system, boundary vintage, and geographic level with every ID; bare strings are not globally unique.

| User-facing starting market | Canonical geography | Official code(s) | Relationship / status |
|---|---|---|---|
| Vancouver city | City of Vancouver CSD | CSD 5915022; Greater Vancouver CD 5915 | Official 2021 municipal CSD. The 2021 hierarchy lists it as a city within the Greater Vancouver census division. |
| Vancouver metro | Vancouver CMA | CMA alternative code 933; SGC 59933 | Separate broad metropolitan area. The 2021 CMA member list contains Vancouver plus distinct adjacent municipalities and other CSDs. Do not equate with City of Vancouver. |
| Toronto city | City of Toronto CSD | CSD 3520005; Toronto CMA alternative code 535; SGC 35535 | City CSD and CMA are distinct. Census profile confirms 3520005 as the City of Toronto CSD; 35535 is the five-digit Ontario SGC for the CMA. |
| Toronto metro | Toronto CMA | CMA alternative code 535; SGC 35535 | Broad metropolitan area, not City of Toronto. |
| Arizona | U.S. state | FIPS/ANSI state code 04; USPS AZ | Statewide scope only. No local city selected. |
| Texas | U.S. state | FIPS/ANSI state code 48; USPS TX | Statewide scope only. No local city selected. |

Official references:
- SGC 2021 Vancouver CSD and its SGC classification: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=5&CPV=5915022&CST=01012021&CVD=1341558&Function=getVD&MLV=5&TVD=1348372
- Greater Vancouver CSD list: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=1&CPV=5915&CST=01012021&CVD=1346800&Function=getVD&MLV=5&TVD=1346772
- Vancouver CMA 2021 member list: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=2&CPV=933&CST=01012021&CVD=1348199&Function=getVD&MLV=3&TVD=1348193
- Toronto CSD 3520005 classified under SGC 35535: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=5&CPV=3520005&CST=01012021&CVD=1341558&Function=getVD&MLV=5&TVD=1348372
- Toronto Census Profile DGUID 2021S0503535 and City CSD cross-reference: https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?DGUIDlist=2021S0503535%2C2021A00053519054&GENDERlist=1%2C2%2C3&HEADERlist=0&Lang=E&STATISTIClist=1%2C4&SearchText=toronto
- U.S. Census ANSI state codes: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
- 2021 Statistics Canada Boundary Files Reference Guide: https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm

### Boundary sourcing qualification
| Candidate | Finding | Qualification for proposed use |
|---|---|---|
| Statistics Canada 2021 digital/cartographic CSD and CMA boundaries | Official boundary framework offers CSD and CMA layers; geometry has UID/DGUID, name/type and can be linked using 2021 relationship file. Its map-service metadata declares Open Government Licence–Canada. | **Conditionally cleared as a source family for a 2021-vintage display-only candidate**, subject to selecting an exact downloadable/service layer, recording its retrieval/hash, preserving reference vintage and required attribution. Not proof the prior prototype's geometry came from this exact product. Does not make other linked datasets automatically open. |
| Statistics Canada Open Licence | Allows use, adaptation, commercial distribution and value-added products under terms; requires accurate representation and attribution, prohibits implying endorsement; third-party material excluded. | Record the exact product and licence version/date. Attribution must travel with visible map or accessible source list. Avoid unauthorized official logos/insignia. |
| U.S. Census TIGER/Line | Census describes TIGER/Line as geographic entity codes/boundary products distinct from demographic data. Its 2021 page specifies legal boundaries and names as of Jan. 1, 2021; current code page confirms AZ=04 and TX=48. | **Geography identifiers qualified; exact display geometry not yet selected or cleared.** Choose an exact vintage/product and inspect its metadata and terms, retrieval/hash and treatment of generalized/cartographic geometry before distribution. Do not assume rights for unrelated basemaps or joined data. |

Neither boundary candidate has been downloaded, hashed, or inserted into a production manifest in this pass. Geographic code verification does not establish the displayed map outline, update cadence, or market metric coverage.

## 2. Engine crosswalk: what maps, what does not

Pinned API: `wahjai604/investscape-api` at `2cec0ab519513a34aabbad909c4f24b1472d385c`; vendored `@investscape/economic-engine@0.1.6`, `@investscape/market-intelligence-engine@0.3.0`. The exact E29–E31 package implementation contains fixed MOCK_DATA records and date guards, not verified provider fetching. The API validation accepts caller-supplied IDs/names and (for neighborhood) coordinates; that permissive shape is not a canonical crosswalk.

| Engine record / level | Crosswalk to official geography | Readiness |
|---|---|---|
| `toronto-on` / city; `vancouver-bc` / city | Names are supported in E30 mock fixtures. E65 wraps an economic-engine city ID and parent region. Neither fixture declares whether its extent is CSD, CMA, metro-market convention or another polygon. | **Unresolved; unavailable for choropleth/join.** May only appear as a clearly labelled synthetic fixture in prototype. |
| `toronto-downtown-on` / neighborhood; `vancouver-downtown-bc`, `vancouver-east-bc` / neighborhood | Mock E31 IDs have point coordinates and parent city ID. They are not shown as matching Statistics Canada CT/DA/CSD IDs or municipal neighborhood polygons. E65 does not return their polygon boundaries. | **Unresolved.** Do not assign to local-area polygons by name or centroid. |
| Vancouver local areas / Toronto neighbourhoods from map fixtures | Some 2021/statistical and municipality-defined areas overlap or do not partition exactly. They use different definitions and vintages. | **No one-to-one match assumed.** Require explicit mapping crosswalk, match method, coverage, ambiguity result and named approval; otherwise expose the two geography systems separately. |
| `west-coast-canada`, `central-canada`, `us-west`, `us-south` / region | Broad engine regions are thematic buckets in mocks; not equivalent to a province, state, Census division, or Statistics Canada economic region by virtue of name. | **Unresolved for geographic overlay.** No AZ/TX state polygon or region-to-state identity inferred. |
| Arizona / Texas state | State identifiers are official and unambiguous in Census code list. | Can be selected as geographic scope once exact TIGER boundary vintage is chosen. E29/E30 fixture records are not established as AZ/TX statewide observations. |

Map rule: a geography selector may show an engine layer only where an approved crosswalk explicitly relates its support extent to the selected canonical geography. If no relationship exists, report `unavailable_geography_mapping`; do not silently promote a point, name, or broad region to a polygon.

## 3. Authentic provider-data qualification

### What the pinned package establishes
- E29 regional records, E30 city records and E31 neighborhood records are bundled mock constants; requested dates must match the fixture as-of date (the reviewed fixtures use 2026-08-04).
- E65 converts those records into `MarketObservation[]`; its `retrievedAt` is copied from fixture `asOfDate`, not a measured network retrieval time.
- E65 labels some source values as composite strings (e.g. CREA/CMHC, Statistics Canada/Census, FRED/Zillow). Such labels do not identify the source dataset or which fields it contributed. Source-type mapping tests membership against exact source names and defaults unmatched strings to commercial.
- The captured package has no source URL, dataset/table identifier, source release timestamp per metric, field-level methodology, retrieval log, license record, source-specific schedule, or evidence of provider API access in these E29–E31 records.
- Therefore all of these mock observations are **fixture-only**. No one is cleared for live map shading or normal AI geographic comparison based on this package.

### Candidate provider register — qualify at dataset/metric level
| Candidate named in existing fixture/docs | Intended candidate use | Evidence in pinned package | Still required before an authentic map layer |
|---|---|---|---|
| Statistics Canada | Population/demographic/economic statistics and 2021 boundary framework | E29/E31 source strings only; no dataset or table identified. Separate official boundary-file/licence evidence above. | Exact table/API/product and geography/vintage; metric definition/unit/reference period/release/revision; retrieval method and cadence; exact licence/attribution and third-party exclusions; match rules and test rows. |
| Census 2021 / U.S. Census Bureau | Demographic baselines and U.S. boundary/statistical areas | Mock source label only; no ACS table, Census API query, TIGER vintage or geography key bound to observation. | Exact ACS/Census dataset and vintage/geography; definition/margin of error/suppression; release/update schedule; access/API details; terms and attribution; geographic crosswalk. |
| CMHC | Canadian rental/vacancy/housing indicators | E30 composite string includes CMHC; no table/series or attribution to a particular field. | Identify Rental Market Survey or other exact product/table, geography, property universe, reference date/release date, update schedule, access, use/redistribution conditions, source-to-field map. |
| CREA | Canadian resale/market indicators | E30 composite string includes CREA; no report/series or provider license record. | Exact public table/report/feed and field; whether data can be retained, displayed, redistributed or used in derivatives; market/geography/property definitions; schedule, attribution and API/feed terms. |
| FRED | U.S. macro/financial series | E29/E30 source strings only; no series IDs or distinction between FRED hosting and original publisher. | Series ID plus original publisher, geography, units, seasonal adjustment, release/effective dates, revision policy, API/update limits and applicable terms/attribution. |
| Zillow / Redfin / CBRE | Commercial U.S. housing / market estimates | Composite/mock source strings only; no dataset, contract or use rights. | Named product/series, data acquisition path, field-level mapping, license permitting storage/derived display and member access, update cadence, geographic coverage and validation method. |
| Other public, academic, chamber and industry sources | Future qualitative or specialized measures | Not present as verified live feeds in E29–E31. | Treat each article/data product independently: publisher, canonical URL, author, date, geography tags, summary/link/full-text rights, retrieval/cadence, correction/withdrawal and audience rules. |

Publisher names alone do not qualify a source. “Publicly viewable” is not the same as permission to bulk-ingest, cache, republish, or create derived map tiles.

## 4. First authentic cohort decision (proposed)
A practical first cohort is intentionally small and vintage-compatible:
1. **Map boundaries:** Vancouver CSD + Vancouver CMA + Toronto CSD + Toronto CMA from one exact Statistics Canada 2021 boundary product; Arizona and Texas state outlines from one selected U.S. Census TIGER/Line state product/vintage. Keep municipal and metro outlines as separate selectable areas.
2. **Demographic baseline:** select one or two exact Statistics Canada and U.S. Census products with data published for matching 2021 geographies before considering current-market claims. Preserve estimates, suppression, and uncertainty. The precise tables/series remain to be selected and source-mapped.
3. **Current housing-market measures:** qualify a small set of CMHC and CREA Canadian series and U.S. Census/FRED plus separately licensed market series. No values from the engine mock package substitute for these.
4. **Qualitative Research:** separate source catalog and editorial approval process; not a prerequisite for accepting a quantitative record and never fused into its provenance.

This is a proposed discovery cohort, not a production-ready registry or a claim that exact source tables, permissions, and currentness have been cleared.

## 5. Ready vs blocked
**Verified now:** official canonical codes distinguish Vancouver CSD/CMA and Toronto CSD/CMA; Arizona/Texas are state codes 04/48; Statistics Canada boundary source family exposes 2021 CSD/CMA products and an Open Government Licence reference; pinned E65/E66 upstream records are fixtures, not verified live provider observations.

**Still blocked:** exact boundary assets and hashes; current official boundary vintage choice; code-to-polygon retrieval; local-area crosswalk; authentic per-field observations and method/currency/period definitions; provider API/access and cadence; dataset-specific reuse rights for all third-party/commercial publishers; current-data refresh/QA owner.

## Sources
- API pinned source: https://github.com/wahjai604/investscape-api/tree/2cec0ab519513a34aabbad909c4f24b1472d385c/src/routes/market-intelligence
- Economic engine archive in API commit: `vendor/investscape-economic-engine-0.1.6.tgz`; package export targets bundled UMD; exact archive inspected read-only.
- Market Intelligence engine archive in API commit: `vendor/investscape-market-intelligence-engine-0.3.0.tgz`; exact adapter/type/build artifacts inspected read-only.
- Statistics Canada boundary reference guide, 2021 second edition: https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm
- Statistics Canada cartographic boundary service metadata, OGL Canada declared: https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer
- Statistics Canada Open Licence, attribution and third-party exclusions: https://www.statcan.gc.ca/en/terms-conditions/open-licence
- Statistics Canada Open Licence FAQ, including commercial redistribution and citation guidance: https://www.statcan.gc.ca/en/terms-conditions/open-licence-faq
- U.S. Census ANSI state code list: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
- U.S. Census TIGER/Line documentation: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.2021.html
