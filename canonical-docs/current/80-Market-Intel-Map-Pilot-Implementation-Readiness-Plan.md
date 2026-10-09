# Market Intel Map Pilot — Implementation-Readiness Plan (Doc 80)

**Date:** 2026-10-08, America/Vancouver.  
**Status:** completed documentation/readiness deliverable; proposed implementation scope, not an implemented map or an implementation authorization.  
**Owner:** Eric Tse. InvestScape launches first; Relationship OS integration is a separate track.  
**Parent contract:** [Doc 79](79-Market-Intel-Map-Read-Contract-and-Storage-Readiness.md).  
**Machine-readable companion:** [pilot registry and source-derived planning samples](../../data-templates/market-intel-map-pilot-registry-planning-2026-10-08.json).

## 1. Approved decisions and execution boundary

| Decision | Owner-approved baseline | Application to this pilot |
|---|---|---|
| Read composition | Map manifest followed by independent layer reads | A failing layer leaves other permitted layers usable |
| Geography | Country, province/state and metro/CMA first; only qualified boundaries and joins | Enable Toronto/Vancouver CMA and Arizona/Texas state when their individual release gates pass; country and Canadian province coverage are absent |
| Research | Separate rights-controlled reads; member-only initially | Separate panel; no article body in quantitative responses; Eric Tse is the accountable editorial owner |
| Coverage | available, no_data, partial, unavailable, error; pagination separate | Preserve reported zero, suppression, missing data, restrictions and transport failures distinctly |
| Storage | API read boundary; evaluate existing Supabase first | Store, writer identity, schema and geometry delivery remain unselected implementation details |

The four-geography cohort, source-specific freshness/retention and Eric's Research role are settled owner decisions. Proposed layer IDs, UI behavior, route/file names and request limits below make the work reviewable; they are not claims about existing implementation.

This phase creates documentation and planning samples and updates the existing docs branch. It does not create database objects, implement endpoints, enable auth, execute ingestion, purchase a provider, edit/publish WeWeb, deploy, release E85 or connect Relationship OS.

## 2. Evidence checkpoint

| Evidence | Classification and date | What it establishes |
|---|---|---|
| API feature branch at 2cec0ab519513a34aabbad909c4f24b1472d385c | Source freshly read in the Oct 8 handoff | Calculation/normalization seams, configurable session verification and externally configured backend persistence; no general published map catalog |
| Railway isolated staging metadata | Freshly verified Oct 8 | Project 227cdcb9-8e2c-4cf2-8e96-805454eccf56; service 0a9b03d7-9de1-4cf0-b793-f83454465a40; environment d1a3a868-f1a1-4662-80a4-22a8a5aa20d2; latest successful deployment c0f1658f-481b-4579-a297-4ba02963436e; connected feature branch |
| Deployment commit | Historical reported evidence in Doc 78, Oct 4 UTC | Doc 78 associates that same deployment ID with 2cec0ab; current safe metadata does not independently return a commit |
| Native WeWeb save definitions | Freshly read Oct 8; configuration only | Editor-only Quick/Full input drafts write directly to Supabase Data API in hwhkgrwikczwztfnsjir; they do not establish the future map catalog writer |
| Native Workspace page | Freshly read Oct 8 | Unpublished page 0638fef4-2a31-489a-b7a8-bde95c384ce6 has Workspace/Quick/Full navigation. Search for Market/Workspace returned no separate Market Intel page; no existing native map mount is established |
| Uploaded statistical rows and metadata | Freshly read during this phase | Exact selected dimensions, values, geography keys, source symbols and dataset-level caveats; no fresh online publisher release check |
| Boundary files/manifests | Retained Oct 7–8 assistant-run evidence; byte hashes rechecked for registry | Selected CMA and state display fixtures; prior validity/overlap results are not recalculated here |
| Source rights, live exposure, prior probes | Historical recorded review in Doc 79 | Conditional rights evidence and access gaps; no new HTTP/login/SQL probe in this phase |

The Railway environment name production is not evidence of a released product. The other older production-labelled service is not contacted or selected as this pilot's target. Accepted JWT issuer, authoritative catalog/Lighthouse writer and migration applied-state alignment remain unknown. No shared Relationship OS database transaction domain is established.

## 3. Pilot geography and boundary registry

Canonical IDs below are proposed InvestScape planning identifiers.

| Geography | Proposed ID | Feature key | Boundary fixture | Release condition |
|---|---|---|---|---|
| Toronto CMA | CA-CMA-535 | CMAUID 535 | canada-cma.geojson, official 2021 CMA display geometry | Product-specific geometry rights and delivery checks; preserve distinct table/boundary DGUIDs |
| Vancouver CMA | CA-CMA-933 | CMAUID 933 | Same package | Same conditions |
| Arizona state | US-STATE-04 | GEOID/STATEFP 04, leading zero retained | arizona-texas.geojson, 2025 cartographic geometry | Explicit ACS key crosswalk and resolution of 2025 geometry versus 2020–2024 ACS vintage |
| Texas state | US-STATE-48 | GEOID/STATEFP 48 | Same package | Same conditions |

For U.S. release, the proposed default is a qualified official 2024 state boundary to match the final ACS period year. That file has not been acquired or validated here. The retained 2025 file remains useful as a planning fixture and must carry a vintage warning; it is not silently relabeled 2024. A specifically approved 2025 display exception would need a recorded reason and rights/geometry review.

Canadian population/QRS crosswalks use official alternative CMA codes 535/933, with official_alias_same_vintage. CMHC observations retain their 2011 geography keys and map only through stable_code_vintage_differs, explicitly disclosing that equal code does not prove equal geographic footprint. Such a CMHC layer is an indicative display with limitations, not exact 2021-area analysis. If that display use is not cleared, return unavailable for that metric.

Country, Canadian province, U.S. city/county/metro, city/CSD, neighbourhood, postal/ZIP and custom polygon layers stay outside this pilot. Verified CSD population evidence is retained for later qualification. Do not derive finer-area values by clipping, distributing totals or assigning a CMA/state average to local polygons. The older local-area overlap audit does not qualify neighbourhood point assignment.

## 4. Layer and source registry

Every row below is a candidate layer. **None is published or rights-cleared by this plan.** See the companion registry for exact filters, source hashes, observation samples and crosswalk disclosures.

| Proposed layer | Scope / exact selected measure | Period and unit | Publication limitations |
|---|---|---|---|
| ca-cma-population | StatCan 17-10-0148; Total - gender; All ages | July 1, 2025; persons; preliminary postcensal; 2021 geography | Preserve dataset-level preliminary status even when row STATUS is blank |
| ca-cma-qrs-asking-rent-2br | 46-10-0092; Apartment - 2 bedrooms; Average asking rent | Q2 2026; CAD/month, current dollars; experimental | Listing-derived measure; quality and source rights review |
| ca-cma-qrs-paid-rent-2br | Same table/unit type; Average paid rent | Q2 2026 reported label; moving average of last three quarters; CAD/month; experimental | Preserve the smoothing window; not a quarter-only measure or equivalent to asking rent |
| ca-cma-cmhc-vacancy | 34-10-0130; privately initiated row/apartment structures with 3+ units; weighted average | 2025 annual survey; percent | Metadata-linked exact licence applicability pending; 2011 observation versus 2021 boundary |
| ca-cma-cmhc-rent-2br | 34-10-0133; Apartment structures of three units and over; Two bedroom units | 2025 annual survey; CAD/month | Verified linked licence has conditions to implement; vintage mismatch; not asking rent |
| us-state-acs-population | ACS5 B01003 total | 2020–2024 ACS 5-year period estimate; persons | Preserve ***** as a Census control marker, not numeric MOE zero |
| us-state-acs-household-income | ACS5 B19013 median household income | 2020–2024; USD in 2024 inflation-adjusted dollars | Retain estimate and MOE; do not describe it as Canadian income or a point-year value |
| us-state-acs-gross-rent | ACS5 B25064 median gross rent | 2020–2024; USD/month; renter-occupied units paying cash rent | Retain MOE and gross-rent definition; not equivalent to Canadian asking/paid rent |
| us-state-acs-tenure-counts | ACS5 B25003 Total, Owner occupied, Renter occupied | 2020–2024; occupied housing units | Three categories remain separate observations; no derived ownership-rate estimate/MOE in this pilot |

Uploaded ACS 1-year files remain separate, inactive inputs. They are not interchangeable with the selected 5-year files. The 5-year duplicate B25003 export is resolved explicitly in the registry by the selected filename/hash. No general-purpose all-geography ingestion is authorized.

The source-derived planning sample contains 22 observations: 10 Canadian CMA rows and 12 U.S. state rows. These demonstrate selected filters and metadata, not live publication, comprehensive history, rights clearance or a persistent catalog. Blank values/symbols must remain distinct from zero. MOE raw text, numeric amount where valid and special-marker status travel together.

Per-source freshness records must distinguish observation frequency, release-check schedule, retrieval date and effective/revision dates. Verified publisher schedules and numerical stale thresholds remain unset. Snapshot retention is conditional on terms and cost review; no perpetual retention promise or automated refresh is created.

## 5. WeWeb Market Intel interaction specification

**Proposed mount:** an unpublished Market Intel page/panel within Investscape Dev, reachable from the native shared navigation. The exact native page ID, route and component mount must be inventoried before an authorized edit; the HTML prototype's tab is not proof of a native WeWeb page. Preserve Quick/Full workflows and the user's six visual-theme choices where supported by the established design system.

| Interaction | Proposed behavior | Evidence shown to the member |
|---|---|---|
| Open Market Intel | Show geography selector, layer selector, period label, map area and evidence panel. Initial selection Vancouver CMA and population is a proposed UI default | If boundary/data release gates remain open, show unavailable with an explanation; never replace with synthetic values |
| Select geography | Explicit Toronto CMA, Vancouver CMA, Arizona state, Texas state options; fit qualified display geometry | Geography level and boundary vintage; country/province expansion unavailable in this pilot |
| Select layer | One quantitative fill active at a time; clear the old fill before switching; fetch independent layer state | Exact measure, unit/currency, covered universe, period and quality flags |
| Pan/zoom | Request only the selected geography/qualified feature set; cancel obsolete requests | Zoom changes presentation, not statistical geography or data resolution |
| Hover/focus/select feature | Show concise metric tooltip; selection opens evidence details. Provide keyboard-operable feature selection through the accompanying list | Value plus MOE/status, geography level, period and source; mismatch warnings stay visible |
| Inspect evidence | Show source/table link, attribution, definitions, source key, observation geography vintage, boundary vintage, crosswalk and retrieved/revision dates | Unknown stays unknown; internal licence/audit notes are not public attribution |
| Compare | Select at most two supported geographies; fetch their independent views/layers; align only defensible definitions | Toronto/Vancouver same-source comparisons may qualify; Canada CMA versus U.S. state is context_only with reasons. Rent methods/currencies/windows remain separate |
| Research | Independently loading member-only references panel through its own approved-content read | Approved summary or link, publisher, date, rights/withdrawal state; no quantitative endpoint article body |
| Failure/retry | Retry the failed layer only. An older approved revision can be used only with explicit revision/freshness disclosure under the approved source policy | Loading, no_data, partial, unavailable and error remain separate; missing/suppressed polygons receive a neutral nonnumeric treatment |
| Phone and accessibility | Map above collapsible controls/evidence; provide equivalent tabular/list evidence; accessible names, keyboard navigation, visible focus and light/dark readability | No essential caveat available only through hover or colour |

Map fill defaults to a single selected feature outline/evidence value; this four-feature pilot is too small to justify invented percentile classes or opportunity colours. Any multi-feature colour scale uses only same-definition, same-unit, same-period qualified values and states its domain; exclude unavailable/suppressed values. No cross-border income/rent choropleth scale, interpolation, neighbourhood heatmap or investment score is proposed.

Basemap/geocoder/export provider is not chosen. A neutral background with qualified original overlays is the planning fallback, conditional on geometry rights. No commercial provider tiles, geocoding calls, tile cache or screenshot/export rights are implied. Renderer comparison fixtures in scratch are prior prototypes, not a production renderer selection. Portfolio overlays and Community exports are deferred from the first quantitative pilot.

## 6. Concrete backend work proposal

Names below are proposed new files, not files already present. The branch, role and schema decisions must be checked immediately before an authorized implementation.

| Slice | Proposed artifact/change | Dependency and ownership |
|---|---|---|
| Contract and validation | API src/market-intel/map/types.ts and requestValidation.ts; request/response fields from Doc 79 | API/security implementation role; finalized metric/source registry |
| Member route | src/market-intel/map/router.ts; proposed Doc 79 manifest and feature-read paths | Verified issuer/audience/signature/expiry plus member entitlement authority; fail closed; independent of existing calculation routes |
| Authorized read service | src/market-intel/map/catalogRead.ts and publicationPolicy.ts | Confirmed catalog store/read role; only active published, rights-cleared revisions; no direct client bypass |
| Source qualification | src/market-intel/map/sourceAdapters/statcan.ts and acs.ts | Exact dimensions, scale, annotations, quality inheritance and source checksums; staged parse without publication |
| Crosswalk and comparison | src/market-intel/map/geography.ts and comparisonContext.ts | Versioned feature/source key mappings and E60 comparability adaptation where applicable; preserve definitions/vintages |
| Geometry delivery | Separate qualified geometry manifest and delivery adapter | Product-specific licence, file/vintage choice, benchmark and hosting/cost decision; not repeated polygons in every observation response |
| Operational ingestion | Separately selected worker/job; staged revision and promotion/withdrawal runbook | Rights/freshness/retention owners and a confirmed restricted write path; no scheduler selected here |
| Native client | Market Intel navigation/mount, selectors, layer state, evidence and comparison panel in WeWeb | Verified page inventory, available authenticated read routes, qualified geometry and regression checks |

Existing E60–E66 calculation routes continue their current role; E67 remains rendering support; E86 remains a separately qualified CRE benchmark adapter opportunity. This proposal does not turn any of them into a source catalog. Quick's client adapter and Full's stateless staging calculator remain separate from map retrieval and persistence.

**Logical data requirements for later review, not DDL:** source/metric definitions; boundary versions; explicit crosswalks; observation dimensions/period/quality; immutable parsed revisions; publication/rights status; refresh history. Published reads resolve one approved revision consistently. Do not reuse owner-private dev_studio_projects as a shared observation table. Do not assume the shared lighthouse migration runner/ledger is the correct home for a new catalog. Schema names, indexes, PostGIS, migrations and grants are deferred until writer/access/migration evidence permits a bounded logical model review.

**Proposed initial request bounds:** one selected geography per manifest; maximum nine configured pilot layers; maximum two independently requested geographies in the comparison UI; default feature-page size 100 and maximum 250; reject malformed/inverted/out-of-range boxes. These are design defaults, not measured throughput or latency claims. General antimeridian queries are unsupported initially; do not silently expand them to a world query. Authorization, source revision and geometry version bind the cursor. Reauthorize every page/cache hit. Publication withdrawal invalidates cursors/caches; fail rather than silently switching revisions mid-page.

Database reads use a narrowly scoped published-read role; ingestion and promotion/withdrawal need separate restricted writes. Cache only cleared shared aggregates after authorization; private Portfolio responses remain separately owner-scoped and cannot enter a shared cache. Verifier/JWKS failure returns a safe service-unavailable error without catalog access. JWT role alone does not establish membership or staff authority.

## 7. Acceptance matrix for the later authorized implementation

All cases below are **not executed in this planning phase**. Registry/document validation is recorded separately in section 10. Synthetic execution fixtures must be clearly labelled and must not appear as published market observations.

| ID | Case | Required evidence/result |
|---|---|---|
| GEO-01 | Canadian alternate code versus different DGUID strings | Correct 535/933 feature; both original DGUIDs retained; documented alias method |
| GEO-02 | CMHC 2011 observation on 2021 display | Vintage warning or unavailable; never exact-match label |
| GEO-03 | ACS state name and leading-zero code | Explicit qualified 04/48 crosswalk; name-only ad hoc join rejected |
| GEO-04 | 2025 geometry for 2020–2024 ACS | Block release pending 2024 qualification or recorded approved display exception |
| GEO-05 | Country/CSD/neighbourhood or finer-area request | Unsupported/unavailable; no fabricated or downscaled values |
| SRC-01 | Population blank row flag plus preliminary dataset note | Preliminary postcensal and July 1 context retained |
| SRC-02 | Asking versus paid rent | Separate IDs/universes; paid three-quarter averaging disclosed |
| SRC-03 | ACS estimate, +/-MOE and ***** | Correct numeric MOE where supplied; special marker preserved, never zero |
| SRC-04 | Zero, blank, suppressed and source/API failure | Distinct observation status and layer coverage; no low-value paint for missing data |
| SRC-05 | Dimensions, units/scalars, duplicates and revision | Select only approved dimensions; prevent double count; retain hash/revision lineage |
| READ-01 | Empty and partial result | Successful no_data/partial with coverage; pagination not mistaken for missing coverage |
| READ-02 | Publication changes between pages | Pinned revision or explicit expired-cursor result; no skipping/duplication/mixed revisions |
| READ-03 | One layer fails and old requests finish late | Other layers usable; stale completion cannot replace the current selection |
| AUTH-01 | Missing/malformed/expired/bad-signature/wrong-issuer/audience token | 401 before read; safe error, no token or data leakage |
| AUTH-02 | Missing verifier/key-fetch failure; identity without entitlement | Fail closed; 503 for unavailable verification, 403 for confirmed missing permission |
| AUTH-03 | Direct database/view/function path, cached response or reused cursor | No bypass of server-only policy or expansion of caller visibility |
| RIGHTS-01 | Unknown/withheld/link-only or withdrawn item | No restricted value/text sent to UI, AI, list/detail or cache; permitted link metadata only |
| PRIVATE-01 | Account B requests Account A Portfolio | No private disclosure including cached response; portfolio optional scope remains separately gated |
| CMP-01 | Canadian CMA versus U.S. state and different rent windows/currencies | context_only/not_comparable with period/definition/geography reasons; no ranking/currency conversion |
| AI-01 | Evidence input and source failure | Same authorized metadata as UI; MOE/status/vintage/source preserved; no inferred neighbourhood values |
| UI-01 | Keyboard, phone widths 320/390/430, desktop, light/dark | Named controls, focus, accessible evidence alternative, legible disclosures, no horizontal overflow |
| PERF-01 | Cold/warm geometry, repeated pan/select and concurrent member reads | Record payload bytes, fetch/parse/render times, query latency, cancellation, memory and cost; choose limits from results |
| REG-01 | Existing Quick/Full users and saving | Existing calculator/session/save behavior preserved; meaningful regression results recorded before any deployment |
| OPS-01 | Failed refresh, definition change, correction/withdrawal | Last approved dated snapshot or explicit unavailable; quarantine unreviewed change; withdrawal restricts affected reads/caches |

## 8. Gate ledger and operational accountability

| Gate | Current disposition | Concrete evidence to close it |
|---|---|---|
| Catalog database and authoritative writer | Open; existing Supabase is first candidate | Non-secret project/store reference and authorized read/ingestion/publication roles; live InvestScape-only migration baseline |
| Member authentication | Open; variable names and source expectations are insufficient | Effective non-secret accepted Auth project/issuer/audience statement and separately authorized staged acceptance |
| Data API and alternate access | Open; current default/exposed schemas not freshly verified | Authenticated settings/read-path evidence and concrete no-bypass role/view/function review |
| Statistical rights | Conditional/open by source | Exact licence applicability and implemented attribution/use/export/AI restrictions; vacancy link specifically unresolved |
| Geometry delivery | Open; candidate display fixtures exist | Qualified 2024 U.S. vintage or approved exception, exact delivered-file rights, provider/delivery/cost and benchmark evidence |
| Performance | Source sizes measured; service targets unmeasured | Representative selected-layer tests plus wider rollout forecast; source row count is not catalog size |
| Operations | Research owner assigned; sole operator context established | Record Eric's accepted interim data/security/ingestion/incident duties, escalation channel and source-specific review thresholds before live jobs |

Eric is explicitly the Research editorial owner and has stated he is the sole current operator. As a proposed operating default he would hold the other interim responsibilities; this plan does not fabricate staff appointments or claim he already accepted every operational assignment. Staff access later requires named roles, least permissions and audited actions. Automated assistance can perform authorized tasks but is not the accountable owner.

A rights-restricted metric may remain unavailable while cleared unrelated metrics proceed. Unknown member access, writer authority or read bypass is a prerequisite for serving any member catalog. The unknown Relationship OS transaction domain blocks cross-product integration, not the independent descriptive map pilot; do not make integration a prerequisite for InvestScape launch.

## 9. Bounded implementation order after authorization

1. Close non-secret staging identity, candidate writer/migration and safe access-path evidence; resolve the active source and boundary subset. Keep uncleared layers unavailable.
2. Review one concrete logical catalog/access model and migration placement against that verified target, together with auth remediation and exact implementation scope.
3. Implement and verify the standalone server/member read boundary in an isolated branch/test environment. Qualify a small staged source revision; promote only cleared records through the approved process.
4. Deliver qualified geometry; implement the unpublished native Market Intel mount and independent reads. Preserve source evidence and empty/failure states.
5. Run the acceptance matrix, relevant Quick/Full regressions and geometry/query benchmarks; record results. Request separately scoped staging deployment approval when the reviewed change is concrete. Publication and production remain independent decisions.

This documentation execution closes the five requested planning deliverables; it does not claim the launch gates passed. The immediate next work is the targeted gate evidence and concrete logical/access model, followed by a bounded Dev implementation authorization. No further repetition of the five settled owner decisions is needed.

## 10. Documentation validation and provenance

The planning registry is generated from the uploaded files, preserving exact row labels/dimensions and raw symbols. Validation checks selected row cardinality, explicit feature/crosswalk keys, source/boundary SHA-256 against retained evidence, JSON structure, relative document links, owner-answer completion and absence of active/published layers. These are planning-artifact checks, not route, auth, geometry validity, performance or browser acceptance tests. The validation run passed: four unique geography IDs, nine unique inactive layers, 22 unique source-derived samples, source/boundary hash matches, resolved observation references, inherited preliminary status, paid-rent smoothing, retained ACS control/MOE markers and six recorded owner answers. Remote commit/file verification is the remaining documentation check at this point.

GitHub checkpoint scope is exactly Doc 79, this new Doc 80, the companion planning registry and MANIFEST.md on docs/phase2-saas-reconciliation-2026-10-02. Base HEAD was freshly pinned to d19a1260d069acddc2db92125d938a6bb2ea9b61. Use a fast-forward update with an expected-head lease; if it moves, reconcile first. Verify every changed remote file by Git blob identity and bytes, and verify only these four paths changed.

Technical source references: [API session verification](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/lighthouse/auth/session.ts), [Full handler](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/routes/development/full.ts), [Postgres configuration seam](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/lighthouse/persistence/pgClient.ts), [Doc 78 historical staging checkpoint](78-Phase2-Native-Migration-and-SaaS-Checkpoint.md). Publisher/table and product-specific licence references are retained in Doc 79 and the registry; source rights remain conditional as described above.
