# 12 — Market Intel map source mapping and proposal closeout
Date: 2026-10-07 (America/Vancouver). Status: design/source review complete; implementation not authorized.

## Evidence boundary
Assistant reviewed API commit 2cec0ab519513a34aabbad909c4f24b1472d385c, package.json, package-lock.json, E65-economic-engine-adapters.ts and E66-service.ts. Retrieved and inspected the exact vendored archives through GitHub base64 file reads:
- MI 0.3.0: Git blob f3bf7ddd4ad20ce0f366c49861bf0a94cc0aa705.
- Economic 0.1.6: Git blob eabd86326136716e5db68be4dd3a5ecfccf9309e.
Inspected MI dist/market-intelligence/{domain,economic-engine-adapters,service}.d.ts and adapter/service .js; economic package.json, ESM E29/E30/E31 and corresponding UMD contents. No engines executed, endpoint requests sent, or live provider freshness verified in this pass.

**Material readiness finding:** the packaged E29 regionalMacroContext, E30 cityMarketAnalysis and E31 neighborhoodDemographics used by these adapter paths return hardcoded MOCK_DATA. They validate identifiers/parents and reject dates differing from the stored as-of date (2026-08-04 in reviewed fixtures). Economic require export points to UMD; matching static records/date rejection exist there. Names such as Statistics Canada, FRED, CREA or Census in those records do not establish a live fetch, item-level provenance or redistribution clearance. This qualifies earlier broad capability assessments: calculation/adaptation capability exists; production evidence readiness is not established for these paths. This is bounded to these paths and package versions, not a claim about every engine or separate repository.

## Exact existing output seam
| Existing output | Proposed map treatment | Additional required evidence |
|---|---|---|
| E65 region/city/neighborhood returns bundle, observations, dataQualityInputs | Server adapter preserves bundle lineage and normalizes a bounded selected layer | Provider record and data classification before member display |
| E66 snapshot returns observations, dataQuality | Details panel quality with issues preserved | Quality does not imply rights approval or authentic observations |
| E66 benchmark returns BenchmarkComparison or null when subject metric absent | Null becomes explicit unavailable benchmark | Compatible geography, dates, segment, currency; no investment ranking |
| MarketObservation metricId/value/unit | Metric and display unit; zero is valid | Missing metrics are omitted by E65, never substitute zero |
| geography id/name/level/parentId/countryCode/economicEngine | Explicit canonical crosswalk and original engine identifier retained | Engine city labels do not prove municipal or CMA extent; UNKNOWN stays unknown |
| periodStart/periodEnd/frequency | Preserve point_in_time as supplied | Separate actual observation period, release date and effective date; do not infer annual series from a snapshot |
| source sourceId/name/type/retrievedAt | Retain raw adapter metadata with limitations | Adapter sets retrievedAt from bundle.asOfDate, not a verified network retrieval timestamp |
| optional releasedAt/effectiveAt/sampleSize/marginOfError/confidenceLevel/tags | Preserve when evidenced, otherwise unknown | No filled-in dates or statistical certainty |
| dataQualityInputs completeness/freshness/sourceReliability | Explain components separately | Completeness excludes null values; freshness uses bundle date/TTL; reliability maps bundle high/medium/low to .9/.6/.3 |
| DataQualityAssessment score/label/components/issues | Preserve High/Moderate/Low/Uncertain vocabulary and issues | Never use quality as investment suitability or rights decision |
| observationKey / derivedFrom | Preserve reproducible references for derived results | Observation has no native id; reference key is not a database primary key |

E65 sourceType uses membership in a fixed government-source set; unmatched names become commercial. Composite source strings can therefore fall through. City source is labelled "CREA/Census composite"; neighborhood source is labelled "Statistics Canada/Census demographic composite". These labels are not per-field provider evidence and should not be displayed as independently verified attribution.

## Metric inventory in the inspected adapter
All identifiers below are existing engine identifiers, not new contract implementation.

| Level | Bundle fields -> observation suffixes | Units |
|---|---|---|
| region (7) | gdpGrowth -> gdp_growth; inflationRate -> inflation_rate; mortgageRate5yr -> mortgage_rate_5yr; employmentGrowth -> employment_growth; constructionStarts -> construction_starts; avgCapRate -> avg_cap_rate; avgAppreciation -> avg_appreciation | percent except construction_starts units_per_year |
| city (10) | population; medianHousePrice -> median_house_price; medianRent -> median_rent; capRateDistribution.p25/p50/p75 -> cap_rate_p25/p50/p75; priceChange12m -> price_change_12m; rentChange12m -> rent_change_12m; daysOnMarket -> days_on_market; absorptionRate -> absorption_rate | count; currency; currency_per_month; percent for cap/change; days; months |
| neighborhood (17) | population; populationGrowth -> population_growth; medianAge -> median_age; medianHouseholdIncome -> median_household_income; householdCount -> household_count; medianListPrice -> median_list_price; medianSoldPrice -> median_sold_price; pricePerSqft -> price_per_sqft; medianRent -> median_rent; rentPerSqft -> rent_per_sqft; rentalVacancyRate -> rental_vacancy_rate; daysOnMarket -> days_on_market; soldVolume12m -> sold_volume_12m; walkScore -> walk_score; transitScore -> transit_score; bikeScore -> bike_score; averageSchoolRating -> average_school_rating | count, percent, years, currency, currency_per_sqft, currency_per_month, days, score_0_100, score_0_10 according to metric |

Prefixes are region., city., neighborhood. Monetary units are generic: CAD/USD must not be guessed or treated as comparable. Percent convention and underlying numerator/denominator, property segment, reference period and methodology require verification before cross-country comparison.

## Proposed read response
The companion JSON is an illustrative response shape, not an existing endpoint, schema, measured runtime response or cleared boundary payload. It deliberately contains no numeric market observation. Canonical example selection is Vancouver municipal CSD 5915022; engine candidate vancouver-bc has unresolved extent and is not silently equated with CSD or CMA 933. Toronto CSD 3520005 and CMA 535 stay distinct. Arizona 04 and Texas 48 are state selections; broad us-west/us-south engine regions cannot stand in for them. No US local market is selected by this proposal.

Boundary assets require a separately approved manifest: authority, canonical URL, identifier/type, vintage, rights/attribution, content hash, transformation and display-only simplification. Boundary fixture existence is not production clearance.

## State and transport decisions (proposed)
| Condition | Proposed outcome |
|---|---|
| Known geography, no approved observations | Successful read, layer unavailable with reason; neutral map, no zero shading |
| Approved query with no matching Research | Empty results only after approved catalog/audience policy exists |
| Research catalog/rights/audience unresolved | Unavailable, not "no articles exist" |
| Metric absent in bundle | unavailable_metric; no zero/imputation |
| Fixture-only output | Block from normal member/AI evidence; explicitly labelled synthetic preview only |
| Unknown geographic crosswalk | unavailable_geography_mapping; choice needed for ambiguous match |
| Unknown currency or incompatible method/time/segment | Comparison unavailable or qualified; no fabricated conversion/ranking |
| Invalid query | 400 with stable safe validation code |
| No permitted detail | Non-disclosing 404-style unavailable detail; no private existence/count leakage |
| Upstream failure | Separate safe error state; bounded retry, never relabel as empty |
| Bounded read exceeded | Document truncation/cursor; no silent omission or unbounded viewport fetch |
| Stale response after identity/selection change | Discard before rendering; clear private data on account change |

These are proposed map semantics. Existing E65/E66 routes currently return 400 for validation and caught errors; this review does not claim the proposed transport codes already exist.

## Server, storage and client responsibilities
- Railway API: bounded read orchestration, crosswalk resolution, evidence/rights filtering, provenance and compatibility; stateless replicas. Separate bounded ingestion workers only after source/implementation authorization. Avoid rerunning bulk acquisition for every viewer.
- Supabase: prospective governed catalogs, provenance and private ownership records after schema approval. Existing private tables and security-invoker public views remain as verified in reports 09/10; no map tables, extensions, grants or migrations are justified by this proposal alone.
- WeWeb: map beneath shared ribbon; viewport reads, rendering and transient selection; movable/collapsible/pinnable sidebar. No private payload in URLs, localStorage or shared cache. Renderer provisional; tile/geocoding services need capacity and rights review.
- Public geography/evidence and private Portfolio reads remain separate. Private overlays opt-in, exact/approximate/unmapped explicitly represented, no guessed addresses. Cross-module buttons resolve real pages and authorized resource IDs, not copies of module data.
- AI receives the same authorized evidence plus limitations/source references; fixtures and uncleared Research excluded from normal answers. Recommendations/scoring and write actions remain separately scoped.
- Community sharing remains a future user-initiated preview/redaction/export flow with explicit inclusion choices and tile/data export rights; no automatic post.

## Sequential implementation handoff and gates
1. Approve canonical crosswalk, cleared boundary manifest and initial authentic metric cohort. **Blocked:** municipal/CMA extent, Arizona/Texas state evidence, per-field provenance/currency/rights.
2. Separately authorize bounded API read implementation: proposed map-read route, validation schema, adapter, manifest and meaningful acceptance tests from report 11. Existing engine calculation routes retained; default-off integration proposed.
3. Select renderer and tile/geocoding providers using the common prototype dataset and measured budgets. **Pending:** provider terms, export rights, cost/capacity and representative load criteria.
4. Separately authorize unpublished WeWeb integration below shared ribbon; navigation, mobile, accessibility, sidebar and late-response tests.
5. Separately authorize isolated staging deployment and acceptance; no production release implied.
6. Add private Portfolio overlays only after authorized ownership/location contract and direct A/B read/update denial tests for that path. Existing native draft denial success does not prove map overlay isolation.
7. Add Research only after named editorial owner, audience, rights, publication/correction/withdrawal and approved catalog decisions.
8. Add compatible geographic comparisons and AI read integration; test limitations and citations before advice-like outputs. Community export remains separate.

## Proposal closeout
This bounded source-review sequence is complete: package pins, actual output seam, metric inventory, illustrative unavailable response, transport cases, service responsibilities and ordered gates are documented. Implementation readiness is conditional, not fully cleared. Next concrete preparation is the crosswalk and authentic provider observation qualification in step 1. No implementation, schema, deployment, WeWeb edits, E85 release or publication occurred.
