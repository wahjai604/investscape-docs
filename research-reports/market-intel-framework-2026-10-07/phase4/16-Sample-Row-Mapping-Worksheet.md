# 16 — Sample row-mapping worksheet

Date: 2026-10-08. Read-only source review for a proposed Market Intel pilot. This worksheet specifies the source dimensions, metric columns, geography keys and join rules for sample rows. The public web review verified the listed metadata and selected CMA observations, but did not execute bulk-file/API downloads for the complete rows. Treat rows marked **key/fields verified; extract pending** as mapping specifications, not loaded observations.

## Status legend

- **Verified** — official source metadata or a rendered table result confirms the key, variable, dimension, or row coverage stated.
- **Extract pending** — exact machine-readable observation row and numeric value were not retrieved in this review. Do not put a placeholder zero in its place.
- **Separate geography** — the metrics use different boundary levels and cannot be joined as if they represented the same area.
- **Terms check** — product record provides a public licence, but intended redistribution/display still needs product-specific attribution and terms review.

## Canadian geography keys

Use 2021 Statistics Canada geography identifiers as stable source-side keys. Retain both the standard code and DGUID; do not fuzzy-match on labels.

| Market label | Geography level | SGC code | Alternative SGC component | DGUID |
|---|---|---:|---:|---|
| City of Vancouver | Census subdivision (CSD) | `5915022` | — | `2021A00055915022` |
| City of Toronto | Census subdivision (CSD) | `3520005` | — | `2021A00053520005` |
| Vancouver CMA | Census metropolitan area (CMA) | `59933` | `933` | `2021S0503933` |
| Toronto CMA | Census metropolitan area (CMA) | `35535` | `535` | `2021S0503535` |

**Important key distinction:** `5915022` / `3520005` are CSD codes. `59933` / `35535` are five-digit CMA SGC codes. `933` / `535` are the CMA code components used in some alternative 2021 SGC variants. DGUIDs encode the geography type and vintage. Store the code system and level beside every identifier.

## Worksheet A — Canadian population

| Source row | Exact row selector / fields | Target key | Join and interpretation | Status |
|---|---|---|---|---|
| Statistics Canada 17-10-0155-01, Vancouver City | Geography: Vancouver CSD; reference date July 1; measure: total population; filter age/gender to table’s total series; source row geography code `5915022` (DGUID crosswalk `2021A00055915022`). | CSD DGUID `2021A00055915022`; SGC `5915022`. | Exact one-to-one CSD join after matching the source’s SGC 2021 geography. Keep reference year and estimate status. Do not attach to Vancouver CMA polygons. | Key and table coverage verified; selected annual data row extract pending. |
| Statistics Canada 17-10-0155-01, Toronto City | Geography: Toronto CSD; reference date July 1; measure: total population; filter age/gender to table’s total series; source row geography code `3520005` (DGUID crosswalk `2021A00053520005`). | CSD DGUID `2021A00053520005`; SGC `3520005`. | Exact one-to-one CSD join after matching the source’s SGC 2021 geography. Keep reference year and estimate status. Do not attach to Toronto CMA polygons. | Key and table coverage verified; selected annual data row extract pending. |
| Statistics Canada 17-10-0148-01, Vancouver CMA | Geography: Vancouver CMA; July 1; total population; total gender; all ages. Table output exposes years 2021–2025. | CMA DGUID `2021S0503933`; SGC `59933` (alternative component `933`). | Exact one-to-one CMA join. Published table has the Vancouver CMA observation; retain estimate status. 2025 is preliminary postcensal. | Key and rendered observation verified; numeric series need machine-readable extraction for ingestion. |
| Statistics Canada 17-10-0148-01, Toronto CMA | Geography: Toronto CMA; July 1; total population; total gender; all ages. Table output exposes years 2021–2025. | CMA DGUID `2021S0503535`; SGC `35535` (alternative component `535`). | Exact one-to-one CMA join. Published table has the Toronto CMA observation; retain estimate status. 2025 is preliminary postcensal. | Key and rendered observation verified; numeric series need machine-readable extraction for ingestion. |

For both population tables, the 2025 estimate is preliminary postcensal; 2022–2024 estimates are updated postcensal; 2021 is final postcensal; years through 2020 are final intercensal. A 2021 boundary vintage does not mean every estimate is for 2021.

## Worksheet B — Canadian rental measures

| Source row | Exact dimensions / columns | Target key | Join and interpretation | Status |
|---|---|---|---|---|
| Quarterly Rent Statistics, Statistics Canada 46-10-0092-01, Vancouver | Geography Vancouver CMA; period/quarter; rental unit type: apartment, two bedrooms; measure: average monthly asking rent **or** average monthly paid rent. Keep these as separate records/series. Preserve any experimental, suppression or quality flags. | CMA DGUID `2021S0503933` / SGC `59933`. | Direct CMA join only. Asking rent represents available rental listings; paid rent is a distinct measure sourced from LFS rent data, excludes social/affordable housing and is a moving average of the latest three quarters. Do not map to CSD. | Geography row and metric concepts verified; selected series extract pending. |
| Quarterly Rent Statistics, Statistics Canada 46-10-0092-01, Toronto | Same dimensions as above, Geography Toronto CMA. | CMA DGUID `2021S0503535` / SGC `35535`. | Direct CMA join only. Preserve asking vs paid distinction, quarter and experimental/quality flags. | Geography row and metric concepts verified; selected series extract pending. |
| CMHC average rents, Statistics Canada 34-10-0133-01, Vancouver City | Geography Vancouver CSD; type of structure: choose one explicitly (recommended first comparison: apartment structures of three units and over); type of unit: two bedroom; annual reference year; average rent in dollars. | CSD DGUID `2021A00055915022` / SGC `5915022`. | Direct CSD join if the selected source row is present. Keep distinct from QRS asking rent: this is the CMHC annual rental-survey average-rent concept and specified structure universe. | Table expressly supports CSD geography and these dimensions; Vancouver selected row/value extract pending. |
| CMHC average rents, Statistics Canada 34-10-0133-01, Toronto City | Same dimensions as above, Geography Toronto CSD. | CSD DGUID `2021A00053520005` / SGC `3520005`. | Direct CSD join if the selected source row is present. Do not infer city value from CMA or GTA prose. | Table expressly supports CSD geography and these dimensions; Toronto selected row/value extract pending. |
| CMHC average rents, Statistics Canada 34-10-0133-01, Vancouver CMA | Geography Vancouver CMA; same selected structure/unit dimensions and annual period. | CMA DGUID `2021S0503933` / SGC `59933`. | Direct CMA join if source row is present. Do not conflate with Vancouver City CSD. | Table expressly supports CMA geography; selected row/value extract pending. |
| CMHC average rents, Statistics Canada 34-10-0133-01, Toronto CMA | Geography Toronto CMA; same selected structure/unit dimensions and annual period. | CMA DGUID `2021S0503535` / SGC `35535`. | Direct CMA join if source row is present. Toronto-labelled prose may refer to GTA; use the table’s official geography row and key. | Table expressly supports CMA geography; selected row/value extract pending. |
| CMHC vacancy rates, Statistics Canada 34-10-0130-01, Vancouver CMA | Geography Vancouver CMA; annual reference year; weighted average vacancy rate for privately initiated row and apartment structures of three units and over. | CMA DGUID `2021S0503933` / SGC `59933`. | CMA-only. This table’s universe is not all rental housing and is not a CSD measure. Preserve suppression/reliability flags. | Table title, annual frequency, CMA/CMA-part geography and concept verified; specific observation extract pending. |
| CMHC vacancy rates, Statistics Canada 34-10-0130-01, Toronto CMA | Same as above, Geography Toronto CMA. | CMA DGUID `2021S0503535` / SGC `35535`. | CMA-only; do not infer City CSD or neighbourhood vacancy from this value. Preserve flags. | Table title, annual frequency, CMA/CMA-part geography and concept verified; specific observation extract pending. |

**CMHC dimensional notes:** table 34-10-0133-01 is annual and exposes CSD, CMA, CA and part geographies; its dimensions include four structure categories (apartment 3+, apartment 6+, row-and-apartment 3+, row 3+) and bachelor/one-/two-/three-bedroom units. Table 34-10-0130-01 is annual and limited to CMA and CMA-part geographies. Treat CMHC rental-survey values, QRS asking rents, and QRS paid rents as different measures with different source universes and periods.

**CMHC terms:** the Statistics Canada / Open Government Portal records for tables 34-10-0133-01 and 34-10-0130-01 identify open-data terms (OGL Canada) for those published products. CMHC’s own data-use terms also describe attribution and downstream-user conditions for CMHC data. Before republishing, retain the dataset-specific record and verify which terms govern each downloaded artifact; do not assume a direct CMHC workbook/report has identical terms to a StatCan table product.

## Worksheet C — U.S. ACS

Use the 2024 ACS 5-year release (2020–2024 period). The unit is a **five-year period estimate**, not a one-year 2024 snapshot. For each estimate retain its paired MOE, annotation fields when available, period, geography, and release vintage.

| Geography row | API geography keys | Metric estimate field | Paired margin-of-error field | Interpretation / join |
|---|---|---|---|---|
| Arizona state | `for=state:04`; `NAME` expected “Arizona” | Total population: `B01003_001E`; median household income: `B19013_001E`; median gross rent: `B25064_001E` | `B01003_001M`; `B19013_001M`; `B25064_001M` | State FIPS `04`; one state-level record. Join to the Arizona state polygon only. |
| Texas state | `for=state:48`; `NAME` expected “Texas” | Same variables as Arizona. | Same paired `_001M` fields as Arizona. | State FIPS `48`; one state-level record. Join to the Texas state polygon only. |

Variable meanings: `B01003_001E/M` total population; `B19013_001E/M` median household income (2024 inflation-adjusted dollars for the 2024 ACS); `B25064_001E/M` median gross rent in dollars. Median gross rent is for renter-occupied housing units paying cash rent. Preserve Census API annotation fields (for example `_EA` / `_MA`) if requested/returned; a missing or annotated estimate must not be silently converted to zero. Include the Census API’s required non-endorsement notice wherever the API data are republished.

**MOE handling:** expose estimate and MOE together in detail; show the period and unit. Do not rank Arizona and Texas or claim precision by ignoring MOE. For a derived difference or ratio, select and document a statistical method before calculating it.

**Extract status:** exact Arizona and Texas JSON observations were not fetched in this documentation review. The API variable definitions, state geography format, selected FIPS codes, and paired estimate/MOE fields are the proposed row mapping; machine-readable row values and annotation behavior still require a read-only API pull.

## Geography and join rules

1. Keep CSD, CMA, U.S. state, county, place, tract and block group as distinct geography levels and code systems.
2. Use an explicit crosswalk with level and vintage. Do not join source rows to a map by display name alone.
3. Join only if source unit and boundary unit match one-to-one. For a mismatch, use an explicit aggregation/areal-weighting method approved for that metric or omit the overlay.
4. Never allocate CMA population/rent to a CSD, or a CSD population/rent to a CMA, by copying the same value to multiple shapes.
5. Preserve source symbols, suppression/unavailable status, experimental flags, estimate status, reference period, release date, units and the source URL.
6. Keep original-source values separate from InvestScape-derived values and derived comparisons.

## Retrieval still required before a concrete sample dataset

The next verification action is a read-only, targeted table/API selection and extraction that records the exact observation keys and raw values for the rows above, along with metadata CSV/XML where necessary. For Statistics Canada, use the table’s selected-data CSV or supported Web Data Service query; for Census, request the listed variables for Arizona and Texas with `for=state:04,48` if supported by the endpoint, otherwise make two state requests. Record the request URL/coordinates, retrieval date, response fields, any annotations, and an integrity checksum. This review itself did not download a bulk file or fetch API observations.

## Source records and official references

- Statistics Canada, CSD July 1 population, table 17-10-0155-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710015501
- Statistics Canada, CMA/CA July 1 population, table 17-10-0148-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710014801
- Statistics Canada SGC 2021, Toronto CSD code 3520005: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=4&CPV=3520005&CST=01012021&CVD=1341558&Function=getVD&MLV=4&TVD=1346772
- Statistics Canada Census Profile, Toronto CSD DGUID 2021A00053520005: https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?DGUIDlist=2021A00053520005
- Statistics Canada Census Profile, Vancouver CSD DGUID 2021A00055915022: https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?DGUIDlist=2021A00055915022
- Statistics Canada SGC 2021, Toronto CMA code 35535: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=2&CPV=35535&CST=01012021&CVD=1348435&Function=getVD&MLV=5&TVD=1348372
- Statistics Canada SGC 2021, Vancouver CMA code 59933: https://www23.statcan.gc.ca/imdb/p3VD.pl?CLV=2&CPV=59933&CST=01012021&CVD=1348435&Function=getVD&MLV=5&TVD=1348372
- Statistics Canada Census Profile, Toronto CMA DGUID 2021S0503535: https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?DGUIDlist=2021S0503535
- Statistics Canada Focus on Geography, Vancouver CMA DGUID 2021S0503933: https://www12.statcan.gc.ca/census-recensement/2021/as-sa/fogs-spg/page.cfm?dguid=2021S0503933&lang=E&topic=1
- Statistics Canada, Quarterly Rent Statistics, table 46-10-0092-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201
- Statistics Canada, Quarterly Rent Statistics, Q2 2026 release: https://www150.statcan.gc.ca/n1/daily-quotidien/260909/dq260909c-eng.htm
- Statistics Canada / CMHC average rents, table 34-10-0133-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301
- Open Government Portal record for table 34-10-0133-01: https://open.canada.ca/data/en/dataset/18b0c898-393f-4465-bb2a-31c922ad4d86
- Statistics Canada / CMHC vacancy rates, table 34-10-0130-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013001
- CMHC Rental Market Survey data tables and 2025 output description: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables
- CMHC Rental Market Survey methodology: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-research/surveys/methods/methodology-rental-market-survey
- Census 2024 ACS 5-year API geography list: https://api.census.gov/data/2024/acs/acs5/geography.html
- Census 2024 ACS 5-year variable catalogue: https://api.census.gov/data/2024/acs/acs5/variables.html
- Census API terms and required notice: https://www.census.gov/data/developers/about/terms-of-service.html

**Readiness:** key/field mapping is now specified for the selected pilot rows. The next gate is sample observation extraction and exact row-level code/flag validation. This remains documentation and source-review work; no Market Intel implementation, API, schema, deployment, or WeWeb change is authorized or performed.
