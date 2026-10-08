# 15 — Initial metric definitions and geographic coverage audit

Date: 2026-10-08. Read-only review of official dataset tables, catalogue metadata and API documentation. No bulk dataset or observation API was downloaded. Where the source table excerpt exposed observations, this note records only coverage and definitions, not the values.

## Result

The first pilot can be defined around one Canadian demographic lane, two distinct Canadian rental measures, and U.S. state-level context. The geographic units do not align perfectly:

- Canada can support both **city CSD** and **metro CMA** population estimates, while the QRS rent table is **CMA / CMA-part only**.
- CMHC has purpose-built rental measurements and neighbourhood/zone reporting for some markets, but a specific stable, code-keyed geometry join still needs separate verification.
- U.S. ACS can support Arizona and Texas statewide measurements. That is appropriate for the currently approved statewide scope, but two state-wide polygons alone do not create useful local-market shading. Local U.S. selections remain a later product decision.

Do not show city CSD population underneath CMA rent as though the rows describe the same population/area. Users must choose the City or Metro geography context; a cross-level comparison needs explicit labelling.

## Verified candidate rows and metric meanings

| Product | Geography / row evidence | Candidate metric | Coverage conclusion |
|---|---|---|---|
| Statistics Canada **17-10-0155-01** | The table is annual population estimates at CSD level, using 2021 SGC boundaries. Existing official geography crosswalk note 13 lists Vancouver CSD **5915022** and Toronto CSD **3520005**. | Total population, July 1; population change may be computed only from compatible annual estimates and should be labelled as InvestScape-derived. | Suitable source family for city-level context. Exact CSD row extraction and code-to-boundary join remain to be captured in the source registry; do not treat this as completed row-level validation. |
| Statistics Canada **17-10-0148-01** | Table covers CMA, CA, CMA-part and CA-part geographies. The public table output lists Vancouver CMA; the existing official geography crosswalk note 13 records Toronto CMA SGC **35535** / alternative code **535**, Vancouver CMA SGC **59933** / alternative code **933**. | Total population, July 1; 2025 estimates are preliminary postcensal, while earlier years have different status. | Suitable for metro context. The displayed population series may revise; store and show reference year plus estimate status. Recheck exact Toronto/Vancouver row codes in the machine-readable extract before map ingestion. |
| Statistics Canada–CMHC **46-10-0092-01**, Quarterly Rent Statistics | Table geography is CMA and CMA part; public table excerpt shows both Toronto CMA and Vancouver CMA rows. It is not a City CSD, county, tract, or neighbourhood dataset. | Recommended starting pair: average asking rent for a **two-bedroom apartment** and average paid rent for a two-bedroom apartment, displayed as separate series. Asking rent is advertised on major rental platforms; paid rent is derived from the Labour Force Survey rent component and excludes social/affordable housing. Paid rent is a moving average of the latest three quarters. | Strong Canadian metro comparison candidate. Use CMA-wide values only when Metro is selected. No city/borough/neighbourhood shading from this table. Show quarter, experimental status, ask/paid label, bedroom type and limitations. |
| CMHC **2025 Rental Market Survey** / Statistics Canada table **34-10-0133-01** and selected-centre report outputs | 2025 CMHC tables cover national, provincial and major-centre outputs; the 2025 report includes Vancouver CMA and Toronto/GTA market reporting. The report uses both “Toronto” and “Greater Toronto Area” in places; confirm which actual table geography is provided for every metric before mapping. | Candidate: primary purpose-built market vacancy rate and average rent for two-bedroom units. Turnover-rent can be a separate signal for new-tenant conditions. | Valuable complement to QRS because it describes a different rental universe and cadence. Do not treat report prose or a city label as a boundary join. Verify exact table, geography key, universe, reliability/suppression flag and applicable reuse terms. |
| U.S. Census **2020–2024 ACS 5-year** | Official API geography catalogue includes state level; Arizona and Texas are selected at state scope in note 13 (FIPS 04 and 48). The same API supports county, place, tract and other geographies, but those should be added only after local markets are selected. | Initial variable shortlist for review: total population (**B01003_001E**), median household income (**B19013_001E**, 2024 inflation-adjusted dollars), and median gross rent (**B25064_001E**, dollars). For each, retrieve the paired margin-of-error variable and annotations. | Suitable statewide context, subject to exact variable-vintage verification and display of 2020–2024 period, estimate and MOE. Median gross rent is not asking rent and should not be paired as though equivalent to Canadian QRS asking rent. |
| U.S. rental asking-price layer | No rights-cleared dataset verified in note 14. Zillow ZORI remains held pending terms/product clearance. | No initial U.S. asking-rent metric selected. | Do not replace this gap with ACS median gross rent while presenting it as current asking rent. |

## First pilot metric set — proposed for review

1. **Canadian market selector has two separate levels:** City (CSD) and Metro (CMA). On City, show annual CSD population. On Metro, show annual CMA population plus available CMA rental metrics. Do not silently switch levels between layers.
2. **Canadian Metro rental card/map overlay:** QRS two-bedroom apartment average asking rent and average paid rent, as two distinct measures. Add CMHC RMS vacancy/average rent as a separate annual series when the exact table and row mapping are confirmed.
3. **U.S. state context:** ACS total population, median household income and median gross rent for Arizona and Texas. Treat these as broad demographic/housing context at state scope. Wait on county/place/tract heatmaps until the user's local markets are selected and matched boundaries are verified.
4. **No composite market score:** show source-specific observations and limitations. A normalized cross-border rank, investment recommendation or AI-generated “best market” score remains outside this review.

## Required mapping checks before an actual sample row

For every selected row, a registry record should include:

- exact provider table and column/variable name;
- source geography name plus official code system, ID and vintage;
- target boundary ID, level and vintage;
- verified one-to-one key or explicit aggregation method;
- record reference period, release date and estimate status;
- value unit, currency and any seasonal adjustment;
- MOE, reliability, suppression, annotation or experimental flag;
- source attribution, applicable licence/terms and display treatment.

### Known row-level limitations

- The CSD and CMA population products are defined for 2021 SGC boundaries. Their reported estimates are updated annually, with revised/preliminary status by reference year; geometry vintage and estimate period must remain separate metadata.
- QRS identifies CMA / CMA-part geography and publishes experimental estimates. A CMA-part row is not a CSD or municipal ward. Do not allocate a CMA value down to component cities or map polygons.
- CMHC RMS primary-market estimates cover privately initiated purpose-built rental structures in scope under the survey method. Secondary-market condo results are separate. Published reliability/suppression indicators must not be converted to zero.
- ACS is a five-year period estimate and includes margins of error. A 2020–2024 ACS value is not a 2024 snapshot. Use paired estimate/MOE and API-required notice.
- An absent, suppressed, unreliable or unsupported source row is not zero and must remain distinguishable from an API failure.

## Next step

Build a **sample row-mapping worksheet** for only these candidates and geographies after an authorized, read-only pull of the table/API metadata and selected records: Vancouver/Toronto CSD and CMA population; Toronto/Vancouver CMA QRS; exact selected CMHC RMS tables; Arizona/Texas ACS. That is still a source-review artifact; it is not permission to ingest into an InvestScape environment, change a schema, create a service, or build map UI.

## Official references

- Statistics Canada CSD population table: https://www150.statcan.gc.ca/n1/tbl1/en/tv.action?pid=1710015501
- Statistics Canada CMA/CA population table and definition: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710014801
- Statistics Canada 2025 population estimates release (estimate status): https://www150.statcan.gc.ca/n1/daily-quotidien/260114/dq260114a-eng.htm
- Statistics Canada QRS table: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201
- Statistics Canada QRS methodology/release note (asking vs. paid and paid-rent moving average): https://www150.statcan.gc.ca/n1/daily-quotidien/260909/dq260909c-eng.htm
- CMHC 2025 Rental Market Report: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres
- CMHC RMS methodology: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-research/surveys/methods/methodology-rental-market-survey
- Statistics Canada / CMHC table 34-10-0133-01 record: https://open.canada.ca/data/en/dataset/18b0c898-393f-4465-bb2a-31c922ad4d86
- 2024 ACS 5-year API geography catalogue: https://api.census.gov/data/2024/acs/acs5/geography.html
- 2024 ACS variable catalogue: https://api.census.gov/data/2024/acs/acs5/variables.html
- B19013_001E median household income definition: https://api.census.gov/data/2024/acs/acs5/variables/B19013_001E.html
- Census API terms and required notice: https://www.census.gov/data/developers/about/terms-of-service.html
- Official crosswalk note 13 (committed alongside this note): ../13-Geographic-Crosswalk-and-Provider-Qualification.md

**Readiness:** metric concepts and broad geography support are now defined. Exact CSD row extraction, selected ACS variable/MOE checks, and CMHC table-to-geography matching remain open. No module implementation or map contract is authorized by this note.
