# 17 — Observation extraction status and validated CMA population sample

Date: 2026-10-08. Read-only follow-up to note 16. This note records the official rendered observations retrieved for the Canadian CMA population sample and the remaining extraction limits.

## Validated rendered rows: CMA population

Statistics Canada table **17-10-0148-01**, total gender, all ages, annual July 1 estimates, 2021 boundaries, publicly renders the following rows for Vancouver CMA and Toronto CMA:

| Geography | CMA SGC | DGUID | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---|---:|---:|---:|---:|---:|
| Vancouver (CMA), British Columbia | `59933` | `2021S0503933` | 2,771,430 | 2,855,205 | 2,970,008 | 3,081,713 | 3,088,036 |
| Toronto (CMA), Ontario | `35535` | `2021S0503535` | 6,472,951 | 6,591,642 | 6,840,723 | 7,109,866 | 7,108,874 |

The rendered table identifies 2021 as final postcensal, 2022–2024 as updated postcensal, and 2025 as preliminary postcensal. The estimates are as of July 1 and are subject to revision according to those statuses. Keep the DGUID and SGC values in separate key fields; use the CMA boundary vintage matching the 2021 SGC definitions.

**Validation scope:** this confirms the two visible rows, values, years, source table, geography label, and table’s estimate-status notes as rendered by Statistics Canada. It does not independently verify a downloadable selected-data CSV checksum or map geometry file join.

## Requested extracts not completed

| Candidate observation | Status | Why it remains open |
|---|---|---|
| Vancouver and Toronto CSD population rows from 17-10-0155-01 | Exact CSD codes/DGUIDs and table geography coverage were verified in official catalog/profile metadata; annual numeric observations were not extracted in this pass. | Statistics Canada’s rendered query path did not return the selected rows to the available read tool. |
| Vancouver/Toronto QRS two-bedroom asking/paid rent rows from 46-10-0092-01 | Official release/table rendering confirms the two CMAs and the current Q2 2026 values; the keyed machine-readable table record/flags were not retrieved here. | Query/open tool could not retrieve the selected-data endpoint with data-series identifiers and metadata symbols. Preserve asking and paid measures as separate. |
| Vancouver/Toronto CMHC annual average rent rows from 34-10-0133-01 | Geography levels and dimensions verified (CSD/CMA/CA/parts; structure and bedroom type); no numeric selected records retrieved. | Table metadata was accessible, but selected data rows and flags were not. |
| Vancouver/Toronto CMHC vacancy rows from 34-10-0130-01 | Table definition verified: annual, CMA/CMA-part, weighted average for privately initiated row/apartment structures of 3+ units. No numeric selected records retrieved. | Selected row response and any reliability/suppression symbols were not accessible. |
| Arizona and Texas ACS state rows | ACS5 variable names and paired estimate/MOE catalogue fields verified; state FIPS 04 and 48 are the intended filters. No raw state JSON observation or returned annotations retrieved. | Census API query URLs were inaccessible in the available retrieval tool. Search results included unrelated ACS geographies, so none were used as substitutes. |

Do not describe the unresolved rows as zero, absent, suppressed, or API failures. Those states can only be distinguished after retrieving the actual response.

## Method to complete remaining rows

Use the official source’s supported selected-data routes when an authenticated/public data retrieval channel is available:

- Statistics Canada: select the exact geography, measure and period in table 17-10-0155-01, 46-10-0092-01, 34-10-0133-01 and 34-10-0130-01; retrieve the selected-data CSV plus symbol/metadata output; preserve coordinate identifiers, DGUID/SGC mapping, footnotes, symbols and retrieval date.
- Census ACS: request 2024 ACS 5-year variables `NAME,B01003_001E,B01003_001M,B19013_001E,B19013_001M,B25064_001E,B25064_001M` for `state:04` and `state:48`; retain any returned estimate/MOE annotations and confirm the geography names.
- Validate each selected row against its data dictionary and source-specific boundary vintage before loading or rendering.
- Store the original raw response and its checksum outside this planning note if/when a later authorized data-ingestion process exists. This review does not authorize ingestion into InvestScape.

## Source references

- Official Statistics Canada table 17-10-0148-01, rendered observations and status notes: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710014801
- Statistics Canada 2025 subprovincial estimates release: https://www150.statcan.gc.ca/n1/daily-quotidien/260114/dq260114a-eng.htm
- Statistics Canada CSD table 17-10-0155-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710015501
- Statistics Canada QRS table 46-10-0092-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201
- Statistics Canada / CMHC average rent table 34-10-0133-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301
- Statistics Canada / CMHC vacancy table 34-10-0130-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013001
- 2024 ACS 5-year API: https://api.census.gov/data/2024/acs/acs5.html
- 2024 ACS 5-year variables: https://api.census.gov/data/2024/acs/acs5/variables.html

**Readiness:** Vancouver/Toronto CMA population has an official rendered sample series with keys and estimate-status notes. Other rows remain defined but not observation-validated. No source data were loaded into InvestScape; no schema, API, deployment, or WeWeb change was made.


## Additional official rendered sample rows retrieved on 2026-10-08

The public Statistics Canada table outputs now expose the following selected rows. These remain rendered-table observations, not checksummed selected-data CSV/API extracts.

### City CSD population — Statistics Canada 17-10-0155-01

| Geography | CSD SGC | DGUID | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---:|---|---:|---:|---:|---:|---:|
| Vancouver (CY), British Columbia | `5915022` | `2021A00055915022` | 748,788 | 749,404 | 765,294 | 748,788 | 740,454 |
| Toronto (C), Ontario | `3520005` | `2021A00053520005` | 2,917,666 | 2,988,742 | 3,134,010 | 3,280,417 | 3,271,830 |

These are July 1 estimates for 2021–2025; follow the table’s final postcensal/updated postcensal/preliminary postcensal status notes for each reference year. Do not substitute 2021 Census population counts for the annual estimate series.

### Toronto and Vancouver CMA QRS rent sample — Statistics Canada 46-10-0092-01

For **Apartment - 2 bedrooms**, the Q2 2026 rendered table gives (monthly dollars):

| CMA | DGUID | Q2 2026 average asking rent | Q2 2026 average paid rent | Table display status |
|---|---|---:|---:|---|
| Toronto CMA | `2021S0503535` | $2,650 | $2,160 | Values displayed without a caution/suppression symbol in this period |
| Vancouver CMA | `2021S0503933` | $3,030 | $2,470 | Values displayed without a caution/suppression symbol in this period |

These are different measures: asking rent reflects asking prices for listed rental units; paid rent is based on a moving average of the last three quarters. Keep the table’s experimental designation and table-level method/limitations visible. Preserve all table symbols on other rows/periods: `..` means unavailable for a specific reference period, `E` means use with caution, and `F` means too unreliable to publish. In particular, do not transform `..` or `F` to zero. The StatCan Daily release notes that one paid-rent observation (Ottawa–Gatineau Ontario part) is suppressed in Q2 2026; the Toronto and Vancouver values above are shown as numeric values in the table.

### Remaining observation gaps

CMHC numeric selected rows for 34-10-0133-01 and 34-10-0130-01 remain pending. The rendered data table pages expose metadata and dimensions, but the available search/open tool has not yielded the selected Toronto and Vancouver record values and associated symbols. ACS 2024 five-year Arizona and Texas observations also remain pending: the official Census API variable/geography documentation is accessible, but the query response itself is not. Third-party pages and other ACS vintages/geography levels were not used as substitutes.

No map geometry file or boundary join was fetched or checked in this pass. Numeric source observations alone do not validate geometry matching.
