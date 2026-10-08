# 18 — Market Intel map pilot: remaining phases and sequential gates

Date: 2026-10-08. Read-only checkpoint after notes 16–17. The selected Canadian and U.S. geographies are a **pilot cohort** to validate data identity, map layers and interaction rules. They are not an exhaustive coverage plan. Porting v2-remastered to WeWeb will not itself populate missing providers, localities or metrics; each new coverage cohort needs source qualification, geography crosswalks, rights/terms review and validation.

## Ordered work and current disposition

| Step | Work | Status | Evidence / exit condition |
|---|---|---|---|
| 1 | Reconcile pilot source rows and metric definitions | **Partially complete** | CMA annual population series are rendered for Toronto and Vancouver; Toronto CSD series is rendered; Vancouver CSD 2024–2025 appears in a municipal report reproducing the official table, while earlier city years remain unverified here. Q2 2026 two-bedroom QRS asking/paid rents are rendered for both CMAs. Note 17 corrects the unsupported Vancouver CSD numbers previously included. |
| 2 | Complete exact source-record extraction and symbols/flags | **Open** | Download/query the selected-data records and metadata for CSD, QRS, CMHC and ACS; store a dated source snapshot/checksum in the review package. The search tool could not fetch the data API responses or selected CSV rows. Do not convert a retrieval gap into a data gap or a zero. |
| 3 | Complete item-level source and reuse review | **Partially complete** | StatCan source tables expose methodology and symbols. CMHC-linked table notes cite CMHC's data licence; the Open Government Portal record marks the average-rent table OGL-Canada. Confirm terms against the exact downloaded table/report artifact and prepare attribution wording before republishing. Census API requires a key per its current examples page; do not put a key in chat or in a documentation example. |
| 4 | Validate geometry files and exact feature joins | **Open; source family qualified** | For Canada, acquire the 2021 Census CSD and CMA/CA digital boundary files and verify the DGUID/UID on the selected features. For U.S. state pilot layers, use the TIGER/Line state boundary vintage matched to the chosen ACS geography vintage. Check feature count, CRS, geometry validity, boundary IDs, uniqueness and rendering generalization. No geometry file was fetched or checked in this review. |
| 5 | Freeze pilot layer semantics and display states | **Planning baseline available; implementation remains gated** | Use City (CSD), Metro (CMA) and State as separate selectable contexts. City population must use CSD; metro population and CMA rent use CMA; ACS state context uses state. Display asking and paid rent separately; carry period, source, unit, estimate status, MOE/quality symbols and unavailable states. Never copy one geography's value onto another geography's shape. |
| 6 | Complete server/client/storage responsibility review | **Proposal drafted; technical selections open** | Note 19 proposes a provider-neutral split: server-side source retrieval/validation/cache; client-side viewport, layer visibility, selection and rendering; explicit decisions for durable user state and private portfolio data. Exact Railway routes/jobs, Supabase tables/policies, tile provider and persistence remain unverified. |
| 7 | Build an equivalent renderer test specification | **Specification drafted; thresholds and prototype remain gated** | Note 20 defines identical pilot and synthetic scale fixtures, functional/a11y/error-state tests, client performance measures and separate server-load tests for MapLibre and Leaflet. Device targets, numeric acceptance thresholds and prototype authorization remain unresolved. |
| 8 | Run an unpublished renderer prototype and compare results | **Not started** | This is a separate prototype authorization gate. Keep any prototype unpublished and isolated. Do not edit WeWeb, deploy services, add libraries to product, alter schemas or publish as part of this review. |
| 9 | Plan broader Canadian/U.S. coverage | **Future cohort selection** | After pilot evidence and renderer acceptance, select additional metros/cities/states, qualify each source, boundary vintage, terms and refresh cadence. Expansion must be an explicit coverage plan, not assumed migration output from v2-remastered. |

## Pilot facts now supported by rendered official/agency records

- Statistics Canada table 17-10-0148-01 reports July 1 annual population estimates for Toronto CMA and Vancouver CMA over 2021–2025, with vintage-specific estimate status.
- Statistics Canada table 17-10-0155-01 reports CSD-level annual estimates. Toronto's five-year series is visible in the rendered table output. Vancouver's 2024 and 2025 values were seen in a municipal report reproducing this Statistics Canada table; Vancouver's 2021–2023 values remain blank in note 17 pending direct verification.
- Statistics Canada table 46-10-0092-01 publishes experimental quarterly asking and paid rent estimates by CMA/CMA-part and apartment bedroom count. The Q2 2026 table output includes Toronto and Vancouver two-bedroom observations and symbols; paid rent uses a three-quarter moving average.
- The U.S. Census 2024 ACS 5-year product supports state and finer geographies. Its 2020–2024 period estimate is not an annual snapshot. The exact Arizona/Texas record responses and paired MOEs remain to be retrieved.

## Boundary source qualifications

**Canada:** Statistics Canada's 2021 Census Boundary Files include CSD and CMA/CA levels, DGUID and geographic identifiers, and downloadable digital formats including Shapefile/File Geodatabase plus mapping services. They use January 1, 2021 reference boundaries. The guide cautions that source scale limits the precision of boundary use; these files are not parcel/cadastral outlines. Target geometry should therefore be a market-analysis display boundary only.

**United States:** The 2024 TIGER/Line page states legal boundaries and names are as of January 1, 2024. If ACS 2024 is retained as the pilot data vintage, compare the corresponding geography reference rules and choose the matching TIGER vintage explicitly; record any boundary-vintage mismatch instead of assuming boundaries update with the data.

## User-facing map placement and overlay implications

- The map is a Market Intel surface beneath the main ribbon, so users can change ribbon tabs while the map remains a module view; selected geography and layer state need defined retention behavior.
- Geographic evidence should stay source-separated in the UI: quantitative metric layers, approved Research item markers or summaries, and the user's portfolio overlay are distinct layer types. Portfolio and Research selection should not silently influence a population/rent choropleth.
- Keep the legend movable/collapsible and pinnable as previously requested. Its state is a client preference unless product later chooses cross-device persistence.
- Community sharing of a map visualization is a later, explicit share/export workflow. No private portfolio values or unpublished Research items should be included by default.

These interaction statements preserve the planning decisions in the conversation; they do not claim they were freshly verified in a WeWeb project.

## Next executable review action

The next source-review pass should obtain exact machine-readable rows and boundary metadata using an approved retrieval channel. First complete Canadian table extracts and DGUID feature matching, then the U.S. ACS state rows/MOEs and TIGER state-feature match, then CMHC selected records and their flags/terms. Keep each source/geography lane independent; do not combine them into one derived score.

## Official references

- Statistics Canada, 2021 Boundary Files reference guide: https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm
- U.S. Census Bureau, 2024 TIGER/Line Shapefiles: https://www.census.gov/geographies/mapping-files/2024/geo/tiger-line-file.html
- U.S. Census Bureau 2024 ACS API examples and current key requirement: https://api.census.gov/data/2024/acs/acs1/examples.html
- Statistics Canada CSD population table 17-10-0155-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710015501
- Statistics Canada CMA population table 17-10-0148-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710014801
- Statistics Canada Quarterly Rent Statistics table 46-10-0092-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201
- Statistics Canada / CMHC average rents table 34-10-0133-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301
- Statistics Canada / CMHC vacancy table 34-10-0130-01: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013001
- CMHC Rental Market Survey data tables and terms context: https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables

**Disposition:** steps 1 and 3 are partial; steps 2 and 4 are evidence blockers; step 5 has a planning baseline; step 6's responsibility proposal and step 7's test specification are drafted but require technical/owner review and leave provider, storage and threshold choices open; step 8 remains separately gated. No implementation, schema, deployment, WeWeb edit/publication, data ingestion or public release was performed.
