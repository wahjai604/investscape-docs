# 14 — Initial quantitative cohort and source clearance

Date: 2026-10-08. Read-only source qualification for the proposed Market Intel map. This is not an ingestion or implementation decision.

## Decision summary

A small first cohort can anchor the map in identified, public datasets:

1. **Canadian population context:** Statistics Canada annual population estimates for city CSDs and metro CMAs.
2. **Canadian current rental context:** Statistics Canada–CMHC Quarterly Rent Statistics (QRS), with asking and paid rent kept as separate concepts.
3. **Canadian rental supply and conditions:** CMHC Rental Market Survey (RMS) data distributed through Statistics Canada tables, subject to the exact table definition and CMHC attribution/redistribution terms.
4. **U.S. demographic context:** 2020–2024 American Community Survey (ACS) 5-year estimates, showing the pooled period and estimate uncertainty.
5. **U.S. current asking-rent context:** no source cleared yet. Zillow ZORI is a candidate for business review, but its public download statement and broader terms do not resolve commercial member-app redistribution clearly.

This cohort supports distinct evidence lanes, not a cross-border score. No dataset was downloaded, queried for observations, or added to a source registry in this review.

## Dataset-level qualification

| Source / exact product | Geography and concept | Update / temporal meaning | Access and reuse evidence | Status for proposal |
|---|---|---|---|---|
| Statistics Canada table **17-10-0155-01**, *Population estimates, July 1, by census subdivision, 2021 boundaries* | Canadian CSDs, including candidate city geography for Vancouver and Toronto; annual population estimate as of July 1. Use CSD identifiers, not city-name matching. | Annual. Reference date is July 1; the table uses SGC 2021 boundaries. The estimate is not a census count or a live population figure. | Table and CSV download are published by Statistics Canada. Statistics Canada Open Licence allows commercial reuse and redistribution subject to attribution, accurate representation, and third-party exclusions. | **Qualified dataset candidate.** Before mapping, verify the selected CSD rows, variable, SGC key, exact release/vintage, licence snapshot, and visible attribution. |
| Statistics Canada table **17-10-0148-01**, *Population estimates, July 1, by census metropolitan area and census agglomeration, 2021 boundaries* | Canadian CMA/CA geographies, including candidate Vancouver and Toronto CMA geographies. A CMA is a multi-municipality statistical area and must remain distinct from its core city CSD. | Annual July 1 estimate on SGC 2021 boundaries. | Statistics Canada Open Licence conditions apply as above. | **Qualified dataset candidate.** Verify exact CMA keys and rows; never substitute CMA values for city values. |
| Statistics Canada table **46-10-0092-01**, *Asking rent and paid rent prices, by rental unit type and number of bedrooms, experimental estimates* (QRS) | Select Canadian CMAs and CMA parts; average asking and paid rent by rental unit type and bedrooms. Toronto and Vancouver CMA are candidate geographies. Asking and paid rent are separate measures. | Quarterly, data series from Q1 2019. The latest release reviewed was Q2 2026, published 2026-09-09. Experimental estimates may be revised. | Open Government Portal record **064d9f22-74a2-4d1c-99da-8c5d7bca789c** identifies the product and Open Government Licence–Canada. CSV, XML/SDMX and developer access are listed. | **Best first Canadian current-rent candidate.** Verify actual row coverage, rental types/bedroom categories, missing/suppressed values, method notes, retrieval hash and release vintage before use. Do not label the series as all rents currently paid. |
| CMHC Rental Market Survey, 2025 tables and related Statistics Canada tables (including table **34-10-0133-01**, average rents) | Annual survey of the primary purpose-built rental universe, with major-centre and smaller-centre products. Table 34-10-0133-01 includes structure and unit-type breakdowns. CMHC 2025 tables include vacancy, average rents, turnover and universe counts; condominium secondary-market results are separately identified for selected centres. | Survey conducted in October each year; 2025 outputs were published in December 2025. This is an annual survey reference, not current advertised asking rent. | CMHC's data licence permits use and distribution, including value-added products, with required source notices and a condition that redistributed users agree to CMHC's terms. Separately, the StatCan-hosted table 34-10-0133-01 has an Open Government Portal record identifying Open Government Licence–Canada. Capture both the specific table record and applicable CMHC product terms; do not assume all CMHC web products have the same rights. | **Conditional candidate, with a potentially clear StatCan-hosted table path.** Confirm the precise table and subpopulation needed, row-level Toronto/Vancouver coverage, terms that apply to the selected file, and how end-user terms/attribution will be surfaced. Distinguish the CMHC RMS from QRS. |
| U.S. Census Bureau, **2020–2024 ACS 5-year estimates** (2024 ACS 5-year API / tables) | State, county, place and smaller supported Census geographies, including Arizona and Texas geographies. Use Census geographic identifiers and retain estimate and margin of error. | Five-year period estimate; 2020–2024 is not a 2024 point-in-time reading. Released to the public 2026-01-29. ACS products update annually, subject to release schedule and comparability guidance. | The Census API supports application access and analysis. Census API terms require the prominent notice: “This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau.” Verify specific product terms and suppression/annotation behavior for selected variables. | **Qualified for U.S. demographic and housing-stock context.** Select exact table variables and geographies next; preserve MOE, period, geography vintage, annotations and notice. Not a current asking-rent source. |
| Zillow Research **ZORI** downloadable dataset | U.S. rental-market candidate; Zillow describes ZORI as a smoothed, repeat-rent measure intended to reflect typical observed asking market rates, weighted to rental housing stock. | Monthly dataset; published data page reviewed describes monthly updates. Reference month and category (all homes, SFR, MFR) must be retained. | Zillow's Research/API page says downloadable metrics are free for public use subject to its published terms and attribution. Zillow's general Terms of Use state limits on use of content and require prior written approval to display other Zillow data outside its stated aggregate-data allowance. It is unclear from those terms whether an InvestScape commercial member map using the Research CSV is permitted. | **Hold for commercial member display.** Do not ingest or render until product-specific written authorization or unambiguous applicable terms are obtained. This is a product-rights gate, not an API engineering question. |

### Source notes and links

- Statistics Canada 17-10-0155-01: https://www150.statcan.gc.ca/n1/en/catalogue/1710015501
- Statistics Canada 17-10-0148-01: https://www150.statcan.gc.ca/n1/en/catalogue/1710014801
- Statistics Canada QRS 46-10-0092-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201
- Open Government Portal QRS record and licence: https://open.canada.ca/data/en/dataset/064d9f22-74a2-4d1c-99da-8c5d7bca789c
- Statistics Canada Open Licence: https://www.statcan.gc.ca/en/terms-conditions/open-licence
- Open Government Portal CMHC average-rent table 34-10-0133-01: https://open.canada.ca/data/en/dataset/18b0c898-393f-4465-bb2a-31c922ad4d86
- CMHC Rental Market Survey data tables (2025): https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables
- CMHC Rental Market Survey methodology: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-research/surveys/methods/methodology-rental-market-survey
- CMHC data licence: https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions
- U.S. Census 2024 ACS 5-year API documentation: https://www.census.gov/data/developers/data-sets/acs-5year/2024.html
- Census API terms: https://www.census.gov/data/developers/about/terms-of-service.html
- Census 2020–2024 ACS 5-year release information: https://www.census.gov/programs-surveys/acs/news/data-releases/2024/release.html
- Zillow ZORI research page: https://www.zillow.com/research/data/
- Zillow Research data/API description: https://www.zillowgroup.com/developers/api/public-data/real-estate-metrics/
- Zillow general Terms of Use: https://www.zillow.com/corporate/terms-of-use/

## Candidate map lanes

| Lane | Initial candidate layers | Display rule |
|---|---|---|
| Canadian population | CSD and CMA population estimates, shown as separate geography choices | Show reference date, SGC 2021 geography, estimate status, source and attribution. Never imply that a city CSD is equivalent to a CMA. |
| Canadian rental market | QRS asking rent, QRS paid rent, CMHC RMS average rent/vacancy/turnover, each as a distinct series | Show source, measure, structure/unit segment, bedroom type, reference period and method. Do not combine QRS and RMS into a single rent value. |
| U.S. demographic context | ACS population, income, housing and occupancy variables selected in a later variable review | Show 2020–2024 pooled period, estimate/MOE or confidence information, geography, annotation and Census API notice. |
| U.S. current rental market | None cleared in this pass | Leave absent or explicitly unavailable until a suitable source and display rights are cleared. |

## Comparability rules

- **Canadian QRS asking rent and U.S. ACS gross rent are not an apples-to-apples pair.** QRS asking rent concerns advertised units; ACS rent variables reflect household survey estimates of rents paid by occupied units. Keep the measures separate and explain the populations represented.
- **QRS asking rent and CMHC RMS average rent are not one measure.** QRS is quarterly and listings-based; RMS is an October annual survey of purpose-built rental stock with its own sample, unit universe, and reliability/suppression rules. They can complement each other but should not be averaged together.
- **Canada annual July 1 population estimates and U.S. ACS five-year estimates differ in reference period and estimation method.** Side-by-side display can be useful if the labels stay explicit; a combined rank, index or recommendation requires a separately designed and reviewed normalization method.
- **City and metro comparisons require geography alignment.** Vancouver CSD versus Toronto CSD is not the same comparison as Vancouver CMA versus Toronto CMA. Arizona/Texas are currently statewide scopes; no local U.S. markets have been selected.
- Do not generate investment recommendations or map scores from this cohort. The map may present sourced observations and limitations; the broader AI response policy and any scoring are separate contracts.

## Qualification checklist before a source enters the registry

For each individual table, file, metric and geography, record:

1. Official product/table ID, canonical title, publisher and exact product URL.
2. Metric definition, unit, property/rental universe, currency, geography level/code, and reference period.
3. Release date, last updated/retrieved timestamp, declared update cadence, revision or correction behavior, and any suppression or uncertainty field.
4. Access route (download/API), terms and licence version/date, exact attribution, third-party exclusions, caching/retention and redistribution conditions.
5. Geographic key mapping to the boundary vintage, row coverage, unmatched/suppressed locations, and any aggregation/crosswalk method.
6. Retrieval hash, source-file version, transformation notes and QA owner once actual data access is separately authorized.
7. Member-facing text for limitations, source attribution, unavailable coverage and freshness.

## Still open

- Select which population and demographic variables are useful for the first map experience; verify their exact definitions and geography row support.
- Inspect table 34-10-0133-01 and the selected 2025 RMS workbook structure to decide whether the map needs the direct CMHC workbook, the StatCan-hosted table, or both.
- Verify the QRS and RMS rows against the four Canadian canonical geographies already identified in note 13.
- Choose exact U.S. ACS variables and geographies for Arizona and Texas, including rules for margins of error and missing/suppressed estimates.
- Find/qualify a rights-cleared U.S. asking-rent data source.
- Define a named data/editorial owner, refresh monitoring, correction path and display policy.
- No Research articles are included here. Research remains a separate qualitative catalog and approval stream that may later be spatially linked to Market Intel under its own source-rights and publication controls.

**Readiness after this pass:** the first source family is concrete enough for an item-level registry and sample row-mapping review. It is not yet a production-ready data manifest and does not authorize ingestion, deployment, or recommendations.
