# InvestScape Market Intel Map Read Contract — Five-Decision Review

**Date:** 2026-10-08  
**Status:** Finalized proposed read contract; owner approved the five design directions and answered the outstanding planning questions on 2026-10-08. Implementation remains separately gated.

## Purpose

Resolve the five open design points for a map-facing Market Intel read contract. This contract covers quantitative observations and map feature summaries. Research articles remain an independently governed content track and can be composed into the Market Intel experience after their own visibility and rights controls are defined.

## Verified repository evidence

- `investscape-api`, branch `feat/native-full-api-adapter`, HEAD `2cec0ab519513a34aabbad909c4f24b1472d385c`: E60–E66 exposes 18 `/v1/calculate/market-intelligence/*` POST routes for comparability, geography wrapping, trend calculations, benchmarking, data quality, economic-engine observation adapters, and neighborhood snapshots.
- The handlers validate caller-supplied inputs and invoke calculation/normalization functions. They do not query a published general observation catalog or provide a viewport-based map read.
- Docs branch `docs/phase2-saas-reconciliation-2026-10-02`, HEAD `10ab05c0c506f1fcca9a11c9b96bb5f3a7811379`, Doc 74 explicitly describes E60–E66 as an integration seam and says no real `MarketObservation` data is wired behind the routes.
- The Market Intelligence engine defines `MarketObservation` fields for metric ID, value, unit, period, frequency, geography, source, release/effective dates, seasonal/revision status, sample size, margin of error, confidence level, and tags. Its geography wrapper preserves an economic-engine geography key; it is not a boundary geometry registry.
- E67 reshapes chart outputs, including a choropleth view model; it does not supply boundary geometry, map tiles, or a general geographic observation catalog.
- E86 separately exposes a curated CRE cap-rate lookup, backed by in-repository observation pools and selection/qualification functions. It is a specialized benchmark source, not the general Market Intel catalog.

## Five decisions — proposed resolution

### 1. One combined map response or separate layer reads?

**Proposed default: a map-view manifest plus separate layer reads.**

Use a lightweight view request to resolve the selected geography, boundary version, and enabled layer definitions. Fetch each quantitative layer as a bounded read keyed by stable `layerId` and request/view ID. The client can load, cache, retry, and invalidate layers independently. A combined response may be offered later as a server-side convenience when the layer set is small and response cost is predictable; it must preserve per-layer coverage and error status.

This avoids one slow source or large layer blocking unrelated layers and supports viewport-based loading. It does not prescribe service count or storage topology.

### 2. Initial geography levels and boundary-version policy?

**Proposed default: support only verified boundary keys at launch; never infer geometry from a display name.**

Initial pilot levels are country, province/state, metro/CMA, and city where a stable official or otherwise approved feature ID and geometry source have been verified. Neighborhood, postal/ZIP, and custom polygons remain unavailable until their boundary source, version, and crosswalk are qualified.

Every feature must identify `boundarySource`, `boundaryDatasetVersion`, `featureId`, and `validTime` (or equivalent vintage). Observations retain their source geography key and vintage. A crosswalk is explicit and versioned, with relationship type and coverage; it must not silently rewrite an observation’s original geography. If a metric’s geography only partially matches a displayed feature, return coverage and warning information rather than presenting it as an exact match.

The Toronto/Vancouver/Arizona/Texas pilot mappings are a validation cohort, not an exhaustive launch geography list. The actual accepted boundary package and metric-to-boundary crosswalk should remain the authority for which joins are enabled.

### 3. How should Research relate to this endpoint?

**Proposed default: separate Research reads; shared Market Intel presentation.**

The quantitative map read returns no article body or Research visibility decision. A separate Research search/list/detail read returns only items approved for the requesting audience and includes item ID, headline, publisher, canonical URL, publication/review dates (unknown stays unknown), geographic/topic matches, rights state, permitted summary or link-only behavior, and withdrawal status handling. Market Intel may request or compose approved Research references for the selected geography and display them as another independently loading layer/panel.

No draft, withdrawn, withheld-rights, or unknown-rights full text may be exposed through a direct detail lookup. AI receives the same visibility-filtered record and permitted content as the member UI, plus provenance and caveats. Research editorial and rights decisions remain owned by the Research track.

### 4. Coverage-state names and partial-coverage behavior?

**Proposed canonical per-layer states:**

| State | Meaning | UI/AI behavior |
|---|---|---|
| `available` | At least one valid observation/feature is returned for the request | Render results with coverage denominator and source/period details |
| `no_data` | Request succeeded but no qualifying observation exists for the selected metric/geography/period | Show an honest empty state; do not call it an API error |
| `partial` | Some requested features, metrics, or periods have data and some do not | Render only supported values and disclose coverage counts/extent |
| `unavailable` | A known layer or detail cannot currently be served (for example, unsupported boundary or temporarily unavailable source) | Preserve other layers; show a retry or explanation where useful |
| `error` | The read failed due to invalid request, authorization, upstream/service failure, or server error | Return a typed error code and request ID; do not mislabel as empty data |

Pagination is an independent response property, not a coverage state. A successful page with `nextCursor` is still `available` or `partial`. For map feature reads, the response should report `matchedFeatureCount`, `returnedFeatureCount`, and whether the set is viewport-clipped or otherwise limited. “Unavailable detail” is represented as `unavailable` for that requested resource, not as `no_data`.

### 5. Which service/storage layer owns the published observation catalog?

**Verified status: repository evidence reviewed here does not establish a general published catalog or its storage owner.** The existing E60–E66 routes calculate on supplied inputs; E86’s cap-rate data is bundled in the engine repository. Do not assume that Railway, Supabase, or WeWeb currently owns the missing catalog.

**Proposed responsibility boundary, pending architecture decision:** Railway-hosted API is the authenticated read/orchestration boundary; persistent normalized observations and publication metadata belong in an explicitly selected backend data store after source licensing, refresh cadence, retention, and row-level access requirements are known. Supabase may be evaluated for that store because it is already part of InvestScape’s backend, but this review does not verify a suitable schema/table or authorize one. WeWeb remains the client renderer and should not hold canonical source datasets or privileged provider credentials. Large boundary geometry or vector tiles may need object storage or a tile service, selected separately from the metric catalog; map renderer choice does not determine data ownership.

No schema, service, route, deployment, WeWeb page, or source registry change is authorized by this proposal.

## Proposed contract shape (illustrative)

### Map view manifest

`GET /v1/market-intel/map-view?geographyId=...&boundaryVersion=...`

Returns a stable `viewId`, requested geography/boundary identity, allowed layer descriptors (`layerId`, metric IDs, display label, unit, supported geography/period range), and data `asOf`. The endpoint does not return user portfolio holdings unless a separately authorized user-scoped request explicitly asks for that overlay.

### Layer read

`GET /v1/market-intel/map-layers/{layerId}?viewId=...&bbox=...&periodStart=...&periodEnd=...&cursor=...`

Returns:

```json
{
  "contractVersion": "1",
  "requestId": "opaque-id",
  "viewId": "opaque-id",
  "layerId": "metric-layer-id",
  "asOf": "ISO-8601 timestamp",
  "coverage": {
    "status": "available | no_data | partial | unavailable | error",
    "matchedFeatureCount": 0,
    "returnedFeatureCount": 0,
    "missingFeatureCount": 0,
    "nextCursor": null
  },
  "features": [
    {
      "featureId": "boundary-key",
      "geography": {
        "id": "stable-geography-key",
        "name": "Display name",
        "level": "city",
        "parentId": "parent-key",
        "boundarySource": "approved-boundary-source",
        "boundaryDatasetVersion": "vintage",
        "crosswalk": null
      },
      "observations": [
        {
          "observationId": "stable-observation-key",
          "metricId": "metric-key",
          "value": 0,
          "unit": "unit",
          "periodStart": "YYYY-MM-DD",
          "periodEnd": "YYYY-MM-DD",
          "frequency": "annual",
          "source": {
            "sourceId": "source-key",
            "sourceName": "Source",
            "sourceUrl": "https://example.invalid/source",
            "methodologyUrl": null,
            "retrievedAt": "ISO-8601 timestamp",
            "releasedAt": null
          },
          "revisionStatus": "unknown",
          "uncertainty": {
            "sampleSize": null,
            "marginOfError": null,
            "confidenceLevel": null
          },
          "quality": {
            "status": "unknown",
            "warnings": [],
            "comparability": null
          }
        }
      ]
    }
  ],
  "error": null
}
```

The example is illustrative, not a binding schema. `sourceUrl` and distinct public citation URL are proposed additions to the existing `SourceMetadata`, which currently has `methodologyUrl`, `licenseNotes`, and `retrievedAt` but no general source URL or item-level rights grant. Rights/licensing display metadata must be explicitly governed; do not expose internal license notes as if they were user-facing permissions.

### AI comparison context

AI receives the same authorized observations and a machine-readable comparison envelope containing the compared geography IDs and boundary vintages, metric IDs/units, period alignment, currency where applicable, source references, uncertainty fields, crosswalks, comparability result/issues, missing coverage, and a statement that the data is descriptive evidence—not an investment recommendation. If a required comparison is not supportable, the context must say so instead of manufacturing a normalized “apples-to-apples” value.

### Error envelope

Transport/API failures use a typed error with `code`, safe `message`, and `requestId`; valid empty results use `coverage.status: "no_data"`. Authorization failures must not leak whether an inaccessible resource exists. The existing E60–E66 calculation handlers currently use `{error:{message}}`; they do not yet define this catalog read envelope.

## Decision ledger

| Point | Proposed resolution | Evidence or owner decision still required |
|---|---|---|
| 1. Combined vs separate reads | **Approved:** separate map manifest and independently fetched layers | Performance/load testing later |
| 2. Geography and vintages | **Approved:** verified levels only; stable feature ID and explicit boundary version/crosswalk | Boundary providers and enabled level list still need to be selected against the validated pilot dataset |
| 3. Research connection | **Approved:** separate visibility-filtered Research endpoint, composed in Market Intel UI/AI | Research editorial owner, audience rules, item rights, publication/withdrawal policy remain open |
| 4. Coverage states | **Approved:** `available`, `no_data`, `partial`, `unavailable`, `error`; pagination separate | Validate against source-specific edge cases later |
| 5. Catalog storage | **Approved boundary:** API is read boundary; canonical persistent store undecided; Supabase only candidate | Inspect current backend schemas/exposure, then choose store, retention, refresh, and geometry/tile ownership |

## Owner questions for remaining decisions

The owner approved the five contract directions above. The following answers are still needed before they can be made concrete. Defaults are proposed starting points, not repository facts. Reply with the proposed answer, change it, or type your own in the answer field.

### Q1 — Initial map geography levels

**Question:** Which levels should the first map contract support once their exact boundaries and joins are verified?

**Proposed answer:** Country, province/state, and metro/CMA first; enable city only where the pilot boundary and metric crosswalk are verified. Keep neighborhood, postal/ZIP, and custom polygons out of the initial contract.

**Your answer:** `____________________________________________`

### Q2 — Boundary providers and pilot scope

**Question:** Should the first boundary qualification stay with the already reviewed Canada/US pilot—Toronto, Vancouver, Arizona, and Texas—and use the validated official boundary packages for those geographies?

**Proposed answer:** Yes. Keep that as a test cohort and expand only after provider licensing, vintage, feature IDs, and joins are qualified.

**Your answer:** `____________________________________________`

### Q3 — Research publication audience

**Question:** Who should be able to read approved Research items in the initial product: all visitors, signed-in members, or a mix determined item by item?

**Proposed answer:** Signed-in InvestScape members only at first; public access can be approved for specific items later if rights and editorial policy support it.

**Your answer:** `____________________________________________`

### Q4 — Research editorial and rights owner

**Question:** Who is accountable for approving items, recording rights, reviewing freshness, and withdrawing or correcting Research content?

**Proposed answer:** Name a Lighthouse Research editorial owner (individual or role) before the first item is published; require documented per-item rights evidence and a review cadence before approval.

**Your answer:** `____________________________________________`

### Q5 — Canonical observation storage

**Question:** Which backend should be evaluated first as the canonical store for normalized, published observations: Supabase Postgres, a Railway-managed database, or another approved store?

**Proposed answer:** Evaluate the existing Supabase Postgres project first for metadata and normalized observations, while checking current schema exposure, access controls, expected volume, refresh workload, retention, and export needs. Keep bulk geometry/vector tiles separate pending sizing/provider review. This is an evaluation order, not authorization to alter Supabase.

**Your answer:** `____________________________________________`

### Q6 — Data refresh and retention expectations

**Question:** What initial freshness target and history-retention expectation should the source registry record by source class?

**Proposed answer:** Do not impose one global cadence. Record each provider’s verified publication cadence; set a per-source target and alert threshold after source qualification. Retain historical versions when the provider revises values, subject to source terms and storage review.

**Your answer:** `____________________________________________`

## Explicit exclusions

- No Research catalog or article ingestion implementation.
- No general observation catalog implementation.
- No schema, API route, service, deployment, or WeWeb change.
- No E85 zoning/land-use release or use as a general recommendation layer.
- No ranking/recommendation algorithm, portfolio overlay write, or cross-module action.

## Geography-level and pilot crosswalk reconciliation (2026-10-08)

This is the read-only follow-up to the approved levels and pilot scope. It checks the local pilot boundary package, its recorded validation manifests, and the uploaded statistical tables. It does not modify those inputs.

### Results by approved level

| Approved level | Pilot evidence | Join outcome | Readiness |
|---|---|---|---|
| Country | No Canada/US national polygon or country-level observation crosswalk in the selected pilot package | No country geometry/metric join validated | Not available in this pilot |
| Province/state | Official 2025 Census state cartographic file was reduced to Arizona and Texas; features carry GEOID/STATEFP 04 and 48 and names Arizona/Texas. ACS exports contain state names and values but no GEO_ID column | Name-to-state-FIPS mapping is evident from the official boundary properties; the submitted exports do not preserve a numeric geographic key, so future ingestion should retain ACS GEO_ID/FIPS explicitly | Pilot display join supported; ingestion key should be strengthened |
| Metro/CMA | Official 2021 Statistics Canada CMA service response has Toronto CMAUID=535 and Vancouver CMAUID=933. Table 17100148 rows are 2021-boundary CMA population; table 46100092 observations use the same 2021 DGUID pattern | Population and QRS rents join by the official CMA alternative codes 535/933 (and by matching names); preserve each source key and boundary source/version | Verified for these selected CMA measures |
| City/municipality CSD | Official 2021 Statistics Canada CSD geometries use Toronto CSDUID=3520005, DGUID 2021A00053520005, and Vancouver CSDUID=5915022, DGUID 2021A00055915022. Table 17100155 has exact matching DGUIDs | Exact DGUID join for 2025 municipal population rows | Verified for municipal population only; do not reuse CMA-valued metrics as city-valued |

### Canadian CMA key and vintage details

For the CMA join, use **CMAUID / official alternative geographic code** as the canonical crosswalk key and preserve the DGUIDs exactly as each source supplied them. The boundary package's CMA DGUIDs are 2021S050535535 and 2021S050559933; the selected CMA statistical tables use 2021S0503535 and 2021S0503933. The DGUID strings are not equal, so a join must not be implemented as raw DGUID equality. Statistics Canada identifies the alternative geographic codes as 535 for Toronto and 933 for Vancouver. The boundary feature names and province codes also agree.

The 2025 CMA population rows in table 17100148 are 7,108,874 (Toronto) and 3,088,036 (Vancouver). Their geographic reference is explicitly 2021 boundaries. In table 46100092, 2026-04 two-bedroom apartment observations are at the same 2021 CMA DGUIDs: asking rent $2,650/$3,030 and paid rent $2,160/$2,470 for Toronto/Vancouver, respectively.

The selected CMHC tables are a separate case: 2025 vacancy table 34100130 and average-rent table 34100133 use legacy 2011 CMA DGUIDs 2011S0503535 and 2011S0503933. Their names and three-digit alternative CMA codes map to the same selected 2021 CMA features, but matching IDs do **not** prove identical geographic footprints across vintages. Statistics Canada cautions that boundaries and included CSDs can change between censuses. Preserve observationGeographyVintage=2011 and boundaryVersion=2021, mark the crosswalk as same_cma_code_vintage_differs, and expose that limitation. Do not present these as exact 2021-area observations without a more specific vintage crosswalk or source confirmation.

### City-level limitation and excluded local areas

The Toronto and Vancouver CSD polygons are municipalities, not their wider CMAs. Exact 2021 DGUID matches support the 2025 municipal population metric only among the reviewed tables. The QRS and CMHC rents/vacancy rows reviewed here are CMA measurements and must remain attached to CMA features.

The same local package contains Toronto's 158-neighbourhood framework and Vancouver's 22 local areas. They are not part of the approved initial map geography levels. The recorded topology audit found small Toronto overlaps and material Vancouver overlaps (about 14,247 m² combined; maximum about 5,507 m²). Keep these local-area overlays disabled for analytic joins/point assignment pending a product-approved overlap policy, stable key, vintage and coverage checks.

### United States level limitation

The selected Census cartographic features are state-level display polygons only; Arizona 04 and Texas 48 correspond to the ACS state rows. The ACS CSV exports show state-name column labels but omit GEO_ID; the future normalized records should add and retain state FIPS/GEOID. These artifacts do not establish city, county, or metro coverage for Arizona/Texas.

### Geometry validation evidence and limits

The local assistant-run map-review/Remaining-Gates-Review.md, manifests, and topology audit record the following for the selected package: all five datasets' geometries were individually valid/nonempty with unique within-dataset IDs; the selected Toronto/Vancouver CMA and CSD pairs and Arizona/Texas pair had zero measured overlap. CMA/CSD and state files are display/cartographic geometries, not legal boundary surveys. No authoritative expected coverage mask was acquired, so complete national coverage and gap-free coverage are not certified. Toronto/Vancouver local-area overlap findings above remain a separate limitation.

Official references used for definitions and caveats:

- Statistics Canada 2021 boundary reference guide: https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021001-eng.pdf (boundary reference date is January 1, 2021).
- Statistics Canada geography comparison notes: https://www150.statcan.gc.ca/n1/pub/72-212-x/2025001/sect4-eng.htm (CMA/CSD boundary and membership changes can affect geographic comparisons).
- Toronto CMA official alternative code/DGUID: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?geocode=S0503535&pid=9810004001.
- Vancouver CMA official alternative code/DGUID: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?geocode=S0503933&pid=9810032601.
- U.S. Census cartographic-boundary description: https://www.census.gov/programs-surveys/geography/technical-documentation/naming-convention/cartographic-boundary-file.html.
- 2024 ACS API geography examples: https://api.census.gov/data/2024/acs/acs5/examples.html.

### Gate decision

**The selected pilot supports three useful, bounded joins:** (1) U.S. statewide ACS data to 2025 Arizona/Texas display boundaries with explicit state FIPS added to the normalized observation; (2) Canadian 2021 CMA population and QRS observations to Toronto/Vancouver CMA features via official alternative CMA codes; and (3) Canadian municipal population estimates to Toronto/Vancouver CSD polygons via exact DGUID.

**CMHC 2011-CMA observations may be crosswalked to current CMA features only with an explicit vintage-mismatch disclosure.** Country-level geometries/data are absent. U.S. city/county/metro measures are absent. This qualifies the pilot crosswalks; it does not establish broad geographic coverage or authorize implementation. The read contract should retain independent observation-geography and displayed-boundary vintages, explicit crosswalk method/status, and the display/analysis suitability of each join.

## Final proposed Market Intel map read contract

**Status:** finalized planning proposal, based on the owner's approved directions and pilot decisions. This is not an implemented API specification; code, schema, deployment and WeWeb changes retain separate authorization gates.

### Scope and architecture

- Use a lightweight map-view manifest followed by independently fetched data layers. A slow or failing layer must not block other layers.
- The InvestScape API is the intended read/orchestration boundary. New member reads must enforce authentication and authorization; reviewed E60-E66 calculator routes do not establish that such protections already exist.
- Each layer represents a named metric and explicit dimensions. The system must not silently merge incompatible measures or change the geographic level of an observation.
- This endpoint returns feature identifiers and version metadata, not every polygon or map tile. Boundary geometry/tile delivery remains a separate provider contract.
- Research search/list/detail stays a separate, member-only, visibility-filtered read. Market Intel may compose approved Research references. Rights and publication rules remain owned by Research.
- Portfolio overlays are outside these aggregate layer reads. They require a separate authenticated, owner-scoped read path.

### Proposed requests

These are provisional paths, not existing routes.

1. Map manifest:
   GET /v1/market-intel/map/views?geographyId={id}&geographyLevel={level}&boundaryVersion={version}&layerId={id}&periodStart={date}&periodEnd={date}
2. Viewport layer read:
   GET /v1/market-intel/map/views/{viewId}/layers/{layerId}/features?bbox={west,south,east,north}&cursor={opaque}

The manifest request identifies a stable geography ID and level, one or more layer IDs, optional date range, and optional requested boundary version. If period or boundary version is omitted, the response states which defaults were applied. The viewport bounding box uses WGS84 longitude/latitude order and is clipped to the selected geography. The server documents a maximum page size. A cursor is opaque, caller-bound, and bound to the view, layer, period and boundary version.

The manifest returns a short-lived/correlation-only viewId, requestId, contractVersion, selected geography, chosen boundary source/version/CRS, data asOf, warnings, and a descriptor/status per requested layer. The viewId is not a durable saved project.

### Layer response

Each feature row returns:

- Stable featureId, boundary source/dataset/version, and display geography identity (ID, name, level, parent, country).
- Observations, coverage metadata, warnings, request/view/layer IDs, contract version and asOf.
- Pagination fields hasMore and nextCursor, separate from coverage status.

Each observation returns:

| Group | Fields |
|---|---|
| Identity | observationId, metricId, metric-definition and methodology references |
| Measure | value, valueStatus (available/suppressed/missing), unit, explicit currencyCode when relevant, dimensions |
| Period | periodStart, periodEnd, frequency, releasedAt/effectiveAt when known; unknown dates remain unknown |
| Geography | sourceGeographyId, sourceGeographyLevel and sourceGeographyVintage separately from matched featureId and display boundaryVersion |
| Crosswalk | method, status, source/target keys, rule/reference ID, coverage if known, limitation text |
| Provenance | source ID/name, citation/source URL, methodology URL, retrieval date, source flags and revision status |
| Uncertainty | sampleSize, marginOfError, confidenceLevel, plus a status for unavailable or suppressed values |
| Quality | quality label, comparability result/issues, and warnings; do not invent confidence scores |

Source citations, source rights, and user-facing attribution are distinct fields. Return them only as allowed by item-specific terms. Internal license notes do not grant redistribution rights.

### Crosswalk statuses and pilot behavior

Each observation preserves its source geography and vintage even after it is matched to a display feature.

| Status | Meaning |
|---|---|
| exact_key_same_vintage | Direct key match and matching vintages |
| official_alias_same_vintage | Documented official alias/alternative code; vintages agree |
| stable_code_vintage_differs | Stable code/name maps across vintages, but identical footprint is not established |
| partial_or_approximate | Documented partial or approximate relationship; never portray as exact |
| unsupported | No approved mapping; do not render the observation on that feature |

Pilot application:

| Pilot geography | Supported initial evidence | Required disclosure |
|---|---|---|
| Arizona/Texas state | ACS statewide values to the official state display features GEOID 04/48 | Uploaded ACS CSVs retain state names but not GEO_ID; include explicit FIPS/GEOID in normalized data |
| Toronto/Vancouver CMA | 2021 CMA population and QRS observations via CMAUID/official alternative codes 535/933 | CMA boundary DGUID strings differ from table DGUIDs; join through the documented alternative-code crosswalk, not raw DGUID equality |
| Toronto/Vancouver city/CSD | 2025 municipal population via exact 2021 CSD DGUID | Label as municipality/city; never relabel CMA observations as city measures |
| Toronto/Vancouver CMHC CMA | 2011-vintage observations may map to 2021 CMA features via stable code/name | Set status stable_code_vintage_differs; visibly disclose both vintages |
| Country | No validated country geometry or metric join in the pilot | Mark unavailable or omit |
| Arizona/Texas metro/city/county | No selected verified boundary/metric join | Mark unavailable or omit |
| Toronto/Vancouver local areas | Outside initial levels; overlaps and key/vintage questions remain | Exclude from analytic joins pending qualification |

Eligibility is metric-specific. A CMA observation is not promoted to city/CSD, county or neighbourhood by clipping or relabeling a polygon.

### Coverage, pagination and errors

Layer coverage states:

- available: qualifying data is returned for the requested coverage.
- no_data: successful request, but no qualifying observation exists for the selected metric/geography/period.
- partial: some requested features or periods have data and some do not; return counts or a clear coverage description when available.
- unavailable: requested geography, layer, period or detail is unsupported or temporarily unavailable.
- error: this layer failed in a multi-layer manifest; other layers may still succeed.

Pagination is separate. A successful page uses hasMore and an opaque nextCursor. A failed direct layer request returns a typed non-2xx error object with code, safe message and requestId; codes distinguish invalid input, authentication/authorization, unsupported request, upstream unavailability and internal failure. Authorization errors must not disclose whether another user's private resource exists. A valid empty result stays a successful response with no_data.

### Comparisons and AI

For geographic comparisons, provide the AI with both geography IDs/levels, boundary versions, crosswalk statuses, metric definitions, units/currency, dimensions, periods/frequency, provenance, uncertainty, quality, missing coverage and all comparability warnings. Reuse E60 comparability checks where their inputs apply.

Do not silently rescale, convert currency, interpolate periods or aggregate incompatible observations. If a transformation is separately approved, disclose method, inputs, assumptions and provenance. If the evidence does not support a direct comparison, state that plainly. This contract provides descriptive evidence; it does not rank locations, score opportunities, or recommend investments.

The AI sees only source-cleared records authorized for the signed-in member. Quantitative map reads do not include Research article text. Separately authorized Research results may contribute only the item's approved summary or link, with its attribution and rights limits.

### Storage, freshness and geometry delivery

- Evaluate existing Supabase Postgres first as a possible canonical observation store. This does not assert that a suitable catalog schema exists or authorize schema changes.
- Record verified refresh cadence, target, alert threshold, retrieval time, source revision and retention policy per source. Preserve revisions only where source terms allow.
- Keep canonical ingestion and provider credentials server-side; WeWeb is a consumer/presentation client.
- Select geometry/tile provider, simplification, viewport caching and export rules through a separate delivery review. Metric storage does not imply that geometry or tiles belong in the same store.

### Future implementation-review acceptance checks

- Every layer has a metric definition, source, allowed geography, dimensions, unit, freshness and retention rule.
- Every feature has a stable ID and explicit boundary source/version/CRS.
- Observation geography and display boundary vintages remain separately visible.
- Alias and cross-vintage matches disclose method/status; unsupported joins are omitted.
- CMA measures stay on CMA features; city measures stay on municipal features.
- Empty, partial, unavailable, pagination, layer failure and request failure are distinguishable.
- A failed layer does not suppress successful independent layers.
- AI context contains source, period, geography, uncertainty, crosswalk and comparability caveats.
- Research visibility and rights are enforced through its separate member-only read path.
- Authentication, authorization, storage, source terms, request limits and map-provider terms are reviewed before implementation.

**Gate outcome:** the proposed read contract is finalized for planning. Pilot coverage remains bounded: no country-level join, no US city/metro/county join, no persistent observation-catalog owner selected, and no production geometry/tile service selected. Implementation, schema changes, deployment and WeWeb edits remain separately gated.

## Backend and Supabase storage readiness review (read-only, 2026-10-08)

### Current Dev project evidence

The Supabase project list identified Investscape-Dev as active/healthy in ca-central-1, PostgreSQL 17.6.1.166. This was the only InvestScape project inspected; no Relationship OS project was queried.

The read-only table inventory for schemas public and investscape returned five tables, all in investscape:

| Existing table | RLS | Current role-policy pattern | Market catalog fit |
|---|---:|---|---|
| deals | enabled | owner_id matched to auth.uid() for user CRUD | User-owned records; not a shared source catalog |
| dev_studio_projects | enabled | owner_id matched to auth.uid() for user CRUD | Saved user projects; keep separate from published observations |
| portfolios | enabled | owner_id matched to auth.uid() for user CRUD | User-owned portfolio records; not a shared source catalog |
| user_profiles | enabled | owner_id matched to auth.uid() for user CRUD | Personal profile |
| translations | enabled | all-row read; inserts/updates/deletes denied by policy | Shared app text, not a data catalog |

No dedicated source registry, published-observation catalog, metric registry, geography/crosswalk registry, ingestion status/history, or Research publication store appeared in that inventory. The table list exposed column metadata and row counts only; no saved-project or personal-data payloads were read.

The connector reported no migration entries. Because tables exist despite that empty list, this does not prove the database has never had migrations; it means a source-controlled schema baseline/migration history was not established by this review. Reconcile the actual project migration history and repo migration source before any DDL is proposed.

### Access boundary findings

- RLS is enabled on all five inventoried tables. Existing user-owned tables use auth.uid() = owner_id policies. The translations table is readable under its policy and denies writes.
- Metadata showed an anon SELECT grant on dev_studio_projects as well as an owner-only RLS policy. No anonymous or cross-account read test was performed in this phase. New catalog grants and policies cannot be inferred from existing tables.
- The SQL session could not read pgrst.db_schemas or an authenticator-role override. The prior acceptance record says investscape was exposed in the Supabase API settings; this review did not independently refresh that dashboard setting.
- Supabase's Data API uses both database grants and RLS policies. A later market catalog must deliberately decide whether it is directly exposed to app roles or available only through the server API. The finalized map contract chooses the API as the intended member read/orchestration boundary.
- Do not expose service-role credentials in WeWeb. The reviewed server API auth middleware is feature-flagged: with its auth flag disabled, requests pass through; if enabled without a verifier, requests fail closed with 503; if enabled and configured, it requires a verified session. The staging environment flag/verifier state was not inspected here.

Official Supabase reference: https://supabase.com/docs/guides/api/securing-your-api explains the separate roles of grants and RLS, and recommends minimum grants plus RLS for exposed tables.

### API fit

At API branch feat/native-full-api-adapter, HEAD 2cec0ab519513a34aabbad909c4f24b1472d385c, the route registry mounts 18 E60-E66 calculation/normalization routes. E65 accepts regional, city and neighbourhood metric inputs and normalizes them; E66 builds neighbourhood snapshots/benchmarks. The handlers consume request inputs and engine functions; they do not read a canonical published observation catalog or provide viewport/pagination map features. Thus the new read contract needs a separate catalog/query service even though it can reuse E60 comparability, E61 geography wrappers, E62 trend math, E64 quality assessment and E67 visualization helpers.

The current API source has a configurable auth guard, but the guard is not sufficient evidence that staging has it enabled or that the desired member authorization is in force. Existing route behavior, current staging configuration and the proposed map read must be reviewed together before any endpoint is exposed. The API README also does not reflect the current E60-E66 route integration; treat source at the pinned branch HEAD and Doc 74 as the stronger evidence until docs are reconciled.

### Storage recommendation and decision status

**Supabase remains the first candidate to evaluate, not a selected or implementation-ready store.** Its PostgreSQL project is healthy and the contract's normalized tabular observations are a reasonable relational-data workload to evaluate there. The present schema is user/product data plus translations, not a market catalog.

If later approved after architecture review:

- Supabase Postgres is the leading candidate for structured metric observations, metric/source metadata, geography keys/crosswalk records, publication state and revision lineage.
- Railway API is the intended authenticated query/aggregation boundary, enforcing per-member access and returning the finalized layer contract. It should not depend on client-side direct table reads as the authorization boundary.
- A scheduled ingestion/refresh worker and its ownership are not selected. Source cadence, source terms, version history and failure/retry behavior must be defined per provider before choosing where those jobs run.
- Large boundary geometry and vector tiles remain a separately qualified object-storage/tile-provider concern. Do not store/cache provider tiles until provider terms allow it.
- Avoid choosing partitioning, PostGIS, indexes, retention/archival design or a target user count from assumptions. First inventory expected observations per metric/geography/period, refresh rates, viewport request rates, compare/query shapes, geographic size and source-specific data rights; then benchmark representative reads and writes in an isolated test environment.

### Readiness gates before a proposed schema or API implementation

1. **Partially resolved:** the API source of truth for the existing InvestScape core tables is identified in `investscape-api` at `2cec0ab519513a34aabbad909c4f24b1472d385c`: `src/lighthouse/persistence/migrations/0008_investscape_core_schema.sql`, `0009_investscape_core_schema_fixes.sql`, and `0010_investscape_core_schema_part2.sql`. The same pinned source includes `migrate.ts`, which orders SQL files by filename and records checksums in `lighthouse.schema_migrations`. The Supabase connector's empty migrations list does not establish that no app migration files exist. Whether the connected Dev database has these migrations applied remains unverified; its ledger is in the shared `lighthouse` schema and was not inspected under the Relationship OS separation guard. This does not establish a Market Intel catalog schema or migration baseline.
2. Read back the current Data API exposed-schema configuration through the authorized project settings surface.
3. Inspect the deploy-time API auth flag and verifier configuration without exposing secrets; verify staging behavior with approved test accounts before enabling map reads. A current read-only Railway inventory confirmed the auth-flag, issuer, JWKS URL and audience variable names in the isolated staging environment, but its connection redacted all values, so the effective setting remains unverified.
4. Define catalog access posture: server-only versus direct Data API, minimum grants, RLS behavior, source visibility, and separation from owner-private saved projects.
5. Confirm source volume, cadence, history, retention/rights, query patterns and boundary/geometry delivery ownership to finish the Supabase-versus-other-store assessment.

**Phase outcome:** first-pass Supabase evaluation and storage/service responsibility mapping are complete. Supabase is plausible for normalized market observations, but no catalog exists in the inspected schemas. The existing product-schema migration source is identified, while its live application state, current Data API exposed schemas, and staging auth configuration remain unverified. A Market Intel catalog baseline has not been designed. The next phase is to resolve the remaining access and workload evidence gates; a logical data model should follow those checks. No SQL, schema, API route, service, deployment, or WeWeb change was made.

## Next-phase gate review — migration source lineage (read-only, 2026-10-08)

**Verified repository evidence:** the API branch at `2cec0ab519513a34aabbad909c4f24b1472d385c` contains the three core-schema migration files referenced by Doc 73 and the application runner. The runner reads `.sql` files in filename order, applies each transactionally, and tracks filename plus checksum in `lighthouse.schema_migrations`; it rejects edits to previously applied migrations. This establishes where the existing product-table definitions and execution logic are versioned.

**Boundary and limit:** the runner's ledger is under `lighthouse`, which Doc 73 identifies as the cross-product schema. No migration was run and no `lighthouse` database objects were queried. Therefore the repo source is verified, but the exact set/checksums applied to Investscape-Dev, and whether the project is aligned with that source, remain unverified. This review also does not prove the API migration runner was used for the production of the five currently visible `investscape` tables.

**Gate status:** source-controlled migration location — **identified**; live migration ledger alignment — **unverified / intentionally not inspected**; Market Intel catalog schema and migration — **not present in the inventoried public/investscape tables and not proposed**. The next practical read-only evidence item is the current Data API exposed-schema setting and staging auth configuration. Any access to the shared migration ledger requires a separately scoped review that respects the Relationship OS boundary.

## Storage and service responsibility matrix (read-only planning, 2026-10-08)

| Concern | Candidate responsibility | Current status and boundary |
|---|---|---|
| Canonical quantitative observations | Supabase Postgres, subject to architecture approval | Candidate only. No market observation catalog exists in the inspected Dev table inventory. Store provider values with source, metric, geography, period, units, retrieval/version lineage, quality and publication state. |
| Catalog and geography metadata | Same relational store is a candidate | Source, metric, boundary-vintage and crosswalk registries are not present in the inventory. Do not design DDL until migration source of truth, access posture and volume/query evidence are known. |
| Member map reads and comparisons | InvestScape API on isolated Railway staging is the intended server boundary | Existing E60-E66 routes are calculation/normalization inputs, not catalog-backed viewport/pagination reads. Staging auth enablement and verified identity configuration remain unconfirmed. |
| Ingestion and refresh | A separately owned scheduled worker/service | Not selected. Choose only after source cadence, rights, retries, revision retention and operational ownership are defined. Keep provider credentials server-side. |
| Boundaries, tiles and geocoding | Qualified boundary source plus separately selected tile/geocoding delivery | Not selected. Current staging Railway service has no volume or bucket. Do not assume metric tables should store geometry or provider tiles. |
| Client map and ribbon navigation | WeWeb presentation and interaction layer | Client sends bounded requests and renders returned layers, states and overlays; it is not the canonical data store and must not hold privileged provider credentials. |
| Research items | Separate Research catalog and authorization/read path | No Research catalog was found. Market Intel may consume only approved member-visible summaries or links and must preserve Research rights/visibility decisions. Do not combine article text with quantitative observation storage. |
| Personal portfolio overlay | Owner-scoped Portfolio records exposed through their authorized read path | Keep private user assets separate from shared market observations. Any map overlay must enforce owner scope and avoid turning personal holdings into a shared layer. |

### Evidence gates before architecture or implementation

1. **Migration alignment:** source-controlled migrations for the existing product tables are identified above. The live ledger remains intentionally uninspected, so applied-state alignment is unknown; no Market Intel schema is proposed.
2. **Exposed schemas:** read the current Data API exposed-schema setting and grants from the authenticated project settings. The dashboard session redirected to sign-in during this review, so the setting was not independently verified. The prior handoff's report that `investscape` was exposed remains user/session-reported evidence, not a fresh verification.
3. **Staging identity:** Railway's current isolated-staging inventory confirms names for the engine-auth flag, issuer, JWKS URL and audience variables, but returned no values. Effective authentication mode and verifier readiness remain unverified; validate the member boundary in isolated staging with approved test accounts.
4. **Data access posture:** decide server-only catalog access versus direct Data API access, minimum grants/RLS, publication visibility, audit access, and separation from user-owned drafts.
5. **Workload and terms:** estimate observations by metric/geography/period, refresh rate, request and comparison shapes, geometry size, retention limits and source/provider terms; use these to benchmark storage, indexing, caching and tile delivery.
6. **Operational ownership:** assign ingestion monitoring, stale-data alerts, source corrections, withdrawal handling, geometry/provider support and incident response.

**Outcome:** responsibilities are now mapped at the proposal level. Supabase is a candidate for normalized quantitative records, Railway API is the intended authenticated read boundary, and WeWeb is the client renderer. None is authorized as an implementation decision. The next phase is to resolve the exposed-schema, staging-auth, access-posture, workload/terms and operational-ownership gates before any logical data model review. No project settings were changed; no schema, service, route, deployment or WeWeb change was made.
