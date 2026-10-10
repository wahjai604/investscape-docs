# Market Intel Map — Gate Evidence and Logical Catalog Model (Doc 81)

**Evidence date:** 2026-10-09 UTC; continuation of the 2026-10-08 pilot checkpoint.  
**Status:** Read-only evidence review and conditional logical design. No schema, API, auth, WeWeb, deployment, ingestion or publication changes.  
**Parents:** [Doc 79](79-Market-Intel-Map-Read-Contract-and-Storage-Readiness.md), [Doc 80](80-Market-Intel-Map-Pilot-Implementation-Readiness-Plan.md).

## 1. Outcome and evidence boundary

The database candidate is established, but deployed member authentication, membership authority and catalog credentials/access are not established. The model below is concrete enough to review without pretending those gates passed. There is no existing map catalog in the two application schemas inspected. An authoritative writer for a future catalog must be appointed; existing saved-project writes do not appoint one.

The approved four-geography, nine-layer pilot remains inactive. The official 2024 U.S. state archive was acquired during this review; its exact product metadata supplies reuse and display constraints. Source rights are reviewed per product, with conditions separated from unknowns. No Relationship OS service, database, auth project or shared migration ledger is selected.

No business records, users, identities, credentials, environment values, JWTs or endpoint responses were inspected to establish these findings. Supabase reads were bounded project metadata and catalog metadata. Source downloads were public provider files. A dashboard sign-in screen prevented fresh Data API setting inspection. It is not evidence of changed application authentication.

## 2. Authentication and access evidence

| Component | Label / date | Verified fact | Limit / remaining gate |
|---|---|---|---|
| Supabase candidate | Freshly verified / Oct 9 | Investscape-Dev, hwhkgrwikczwztfnsjir, ACTIVE_HEALTHY; project metadata connector | Candidate storage target only; no catalog exists in inspected schemas |
| Application schema objects | Freshly verified / Oct 9 | pg_catalog in public/investscape: five application base tables, RLS enabled; five public views with security_invoker=true | Not a complete database inventory, effective-policy audit or proof of member access |
| Application grants | Freshly verified / Oct 9 | information_schema.role_table_grants: authenticated CRUD grants on saved-project table/view; anon CRUD grants on underlying investscape.dev_studio_projects; no anon grant reported on its public view; anon SELECT on translations | Grants do not bypass RLS and do not establish public access. Do not change these existing grants in this work. Future catalog grants must be designed separately |
| Data API exposed schemas | Unknown / Oct 9 attempt | Dashboard target /integrations/data_api/settings redirected to sign-in | No effective exposed-schema/default-schema finding; cannot claim no alternate Data API access |
| WeWeb Dev Auth project | Historical reported evidence / Oct 8 | Investscape Dev and legacy Auth plugin configured to hwhkgrwikczwztfnsjir | Editor configuration; no valid-member API acceptance verified |
| Native Quick/Full saves | Historical reported evidence / Oct 8 | Editor definitions write input drafts through Supabase Data API dev_studio_projects in that project | Persistence of private user inputs; no relationship to shared catalog publisher authority |
| Native Full staging | Historical reported evidence / Oct 8 | Railway project 227cdcb9-8e2c-4cf2-8e96-805454eccf56, service 0a9b03d7-9de1-4cf0-b793-f83454465a40, environment d1a3a868-f1a1-4662-80a4-22a8a5aa20d2 named production, isolated staging | Environment label does not establish product production; no current deployed values inspected |
| API verifier | Source intention / source commit 2cec0ab519513a34aabbad909c4f24b1472d385c | Full handler uses an asymmetric Supabase verifier; general session source supports configuration/fallback branches; audience default authenticated in source | Neither variable names nor defaults prove effective deployed issuer, audience or absence of fallback |
| Member authorization | Unknown | No canonical InvestScape membership/entitlement authority or revocation behavior established | A valid Supabase authenticated JWT alone is insufficient to prove map entitlement or staff permission |
| Catalog reader/writer | Unknown | No existing map catalog/approved catalog roles in inspected application schemas | Store selection, dedicated read/ingest/publish identities, migration placement and no-bypass review required |

Read-only metadata queries were restricted to pg_class/pg_namespace and role_table_grants for public/investscape. No SQL mutations, auth/users queries, migration queries against the shared Lighthouse ledger, or live acceptance probes were run. No RLS predicate or privilege conclusion is inferred beyond the metadata actually read.

References: [Supabase project](https://supabase.com/dashboard/project/hwhkgrwikczwztfnsjir), [Data API settings target](https://supabase.com/dashboard/project/hwhkgrwikczwztfnsjir/integrations/data_api/settings), [API session source](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/lighthouse/auth/session.ts), [Full handler](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/routes/development/full.ts).

Current primary guidance checked Oct 9: [Supabase changelog](https://supabase.com/changelog), [Data API security](https://supabase.com/docs/guides/api/securing-your-api), [JWT documentation](https://supabase.com/docs/guides/auth/jwts). Grants and RLS are separate controls; RLS does not govern function execution privileges. An invoker view does not independently prove safe exposure. Private schema placement alone is insufficient without actual exposure, grants, function and role review.

## 3. Recommended authority design — proposal, not deployed fact

Recommend evaluating a new private InvestScape-only catalog schema in Investscape-Dev first. The schema name market_intel_catalog is provisional. Keep it outside Data API exposed schemas, separate from owner-private dev_studio_projects, and use an InvestScape-only migration history after its baseline is established. Do not reuse the shared lighthouse.schema_migrations ledger by assumption.

The API is the only member catalog read boundary. Verify signatures through the selected issuer's documented key mechanism with explicit issuer, audience, expiry and supported algorithm checks. Fail closed on missing configuration; the map module must not inherit an unconfigured/development identity fallback. Key/verifier outage must produce unavailable rather than skipping authentication. No cross-project issuer or user-editable metadata grants membership.

After token verification, resolve a current map-read entitlement from a server-controlled InvestScape authority keyed by verified issuer and subject. Its source of truth remains to be chosen. Recheck authorization on every request/page/cache hit, including geometry delivery; establish revocation behavior and maximum authorization-cache age before release. Authentication and membership failures must be distinct from a layer with no data. Relationship OS is not required to provide this authority for InvestScape launch.

| Proposed principal | Logical capability | Explicit restriction |
|---|---|---|
| Member | API reads cleared published shared aggregates and geometry | No direct catalog Data API, SQL, ingestion, promotion, staff assignment or unpublished evidence access |
| catalog_reader | Read approved catalog projections for API | No writes, raw restricted artifacts, user projects, staff grants or unrestricted base-table access |
| catalog_ingester | Append source retrieval/revision records and quarantined observations | Cannot publish, change rights clearance, assign staff roles or overwrite approved revisions |
| catalog_publisher | Approve/promote/withdraw qualified releases and append audit events | No staff-role assignment or broad unrelated application/database access |
| catalog_migrator | Approved isolated catalog DDL during maintenance | No runtime/member use; migration placement and baseline require verification first |
| Access administrator | Manage server-controlled memberships/staff grants with audited actions | Separate permission from catalog publishing; no user self-assignment |

These are capability names, not claims that PostgreSQL roles or credentials have been created. The implementation must demonstrate effective grants and constraints; broad service-role credentials are not a substitute for least privilege. If an existing integration cannot support scoped runtime roles, record and review that limitation before selecting it. No elevated credential belongs in WeWeb.

Eric is the sole operator and Research editorial owner. Recommend a documented initial operator assignment, with ingestion and publishing actions distinguished in audit even if one person holds both capabilities. Do not claim independent human review exists in a one-person operation. Staff later receive explicit named grants with audit, expiry/revocation and a separate access-admin permission. No appointments or account identifiers are made here.

## 4. Source and boundary qualification

| Selected product | Evidence / rights result | Remaining condition or uncertainty |
|---|---|---|
| StatCan population 17-10-0148; QRS 46-10-0092 | Fresh current Statistics Canada Open Licence reviewed Oct 9; reuse/value-added distribution is permitted subject to its terms | Product attribution, accuracy and no endorsement/reidentification; preserve preliminary/experimental status and QRS paid-rent smoothing. Actual display/export notices unimplemented |
| CMHC vacancy, StatCan 34-10-0130 | Retained exact table metadata footnote 2 identifies CMHC Licence Agreement for Use of Data, with an older link that fails; current official same-named CMHC agreement verified Oct 9, covering CMHC data/tables | Current replacement applicability is a reasoned interpretation, not a verified redirect. Record any separately communicated limitations; preserve provider rights and fulfill recipient agreement/attribution before release |
| CMHC rent, StatCan 34-10-0133 | Retained metadata footnote 2 links the official HMIP agreement; linked text freshly reviewed Oct 9 | Conditional reuse includes recipient agreement, acknowledgment and withdrawal obligations; article/full-text permissions are not inferred |
| StatCan 2021 CMA service boundaries | Historical verified service metadata and OGL-Canada v2.0 linkage from earlier boundary review | Selected service geometry only; preserve notices, distinct table/boundary identifiers and display limitations; no parcel precision claim |
| Census 2024 state 1:500,000 archive | Fresh archive acquired Oct 9. Embedded cb_2024_us_state_500k.shp.iso.xml explicitly permits product/publication use with Census source acknowledgment | Display at 1:500,000 or smaller scale; no area/perimeter analysis, address geocoding or precise geographic relationship claims; renderer enforcement, delivery and benchmarks pending |
| ACS 2020–2024 selected tables | Historical selected uploads/definitions/MOE reviewed; official cartographic file rights are not ACS observation rights | General Census copyright URL could not be retrieved in this review. Exact ACS reuse evidence still required for Canadian member distribution/exports; keep U.S. observations inactive until established |

Rights findings are conditional product review, not approval to publish. Required provider notices belong in eventual evidence panels and exports; link current terms where applicable. CMHC redistribution requires recipients to agree to its terms, so terms acceptance must be designed into member access and any redistribution/export path before CMHC layers are served. Withdrawal needs an operational suppression mechanism. Provider trademarks/logos must not be used without the required permission. Full-text Research, paid data, basemap tiles, geocoding and third-party imagery are outside this clearance.

Fresh source references: [StatCan licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence), [CMHC current agreement](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/cmhc-licence-agreement-use-of-data), [CMHC linked HMIP agreement](https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions), [vacancy table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013001), [rent table](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301), [Census cartographic product page](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html), [exact 2024 archive](https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_state_500k.zip).

### 4.1 Boundary replacement and validation

The new companion [2024 planning subset](../../data-templates/market-intel-us-2024-state-boundaries-planning.geojson) and [qualification record](../../data-templates/market-intel-us-2024-boundary-qualification.json) preserve Arizona GEOID 04 and Texas GEOID 48. The original 2025 fixture and the Oct 8 registry are preserved as historical planning evidence; they are not relabeled or silently overwritten.

The qualification record is authoritative for checks actually run, source archive/metadata/subset hashes, transform and limits. The selected two features passed unique-key, non-empty, individual-validity and pairwise positive-area-overlap checks (zero overlaps). The 353,494-byte EPSG:4326 subset was transformed from EPSG:4269 with always_xy and no repair/simplification. No full national topology or browser performance result is claimed. This model selects 2024 as the proposed U.S. display vintage; matching the ACS final period year does not prove exact historical footprint equivalence. No polygon-based redistribution of statistics, financial calculation or parcel analysis is authorized.

## 5. Concrete logical catalog model

These are logical entities/fields and integrity rules, not DDL, a selected physical database or permission to create tables. IDs below name concepts; exact storage types/indexes remain for the bounded implementation review.

| Entity / logical key | Required fields / relationships | Integrity rule |
|---|---|---|
| SourceProduct / source_product_id | Provider, product/table/API reference, canonical URL, owner, licence reference, terms evidence date, attribution template, allowed uses, refresh cadence | Product-specific rights; a provider-level label cannot silently clear a different product |
| SourceRevision / source_revision_id | SourceProduct FK, retrieval timestamp, provider release date, content hash, parser version, definition version, artifact reference, row counts, quarantine status | Immutable source-derived version; same product/hash/parser/definition re-import is idempotent; corrections create a new revision |
| MetricDefinition / metric_version_id | Stable metric ID + definition version, SourceProduct FK, statistic, unit/currency/price basis, universe, exact source dimensions, time basis/smoothing, comparability class | Definition changes create a version; asking/paid/gross rent and survey universes remain distinct |
| Geography / geography_id | Country, level, provider namespace/code, display name; parent relationship where supported by evidence | Stable UI identity is separate from versioned observation/boundary identity; no name-only joins |
| GeographyVersion / geography_version_id | Geography FK, provider geography key, vintage, namespace, evidence reference | Preserve the original provider identifier; unknown effective date remains unknown |
| BoundaryVersion / boundary_version_id | GeographyVersion FK, source revision/product, geometry artifact hash/reference, CRS, scale limits, validation reference, rights clearance reference | Immutable display artifact; no observation value embedded in polygons; distinct from observation geography version |
| GeographyCrosswalk / crosswalk_id | From observation GeographyVersion FK to display GeographyVersion FK, relationship type, evidence, qualifications, review date | Explicit same-version identity or reviewed code/vintage association; never infer equal footprints from stable code |
| Observation / observation_id | SourceRevision + MetricDefinition + GeographyVersion FKs, period start/end/reference label, full exact dimensions and dimension hash, numeric value nullable, raw value/status/MOE marker, nullable numeric MOE, quality flags, source row key | Unique revision/metric/geography/period/dimensions. Zero differs from null/suppressed/absent; MOE markers never become zero. Preserve source quality and units |
| RightsClearance / clearance_id | Product/revision/boundary scope, allowed UI/export/AI uses, required notices/agreement version, reviewer action, evidence/date, conditional/cleared/restricted status | No inheritance across products by default; applies to the exact artifacts and uses being published |
| LayerDefinition / layer_version_id | Stable layer ID, allowed geography levels, metric versions, legend/unit rules, required geometry, response contract version | Manifest and independent layer reads use the same selected version; metadata-only layer may define explicit non-map presentation |
| CatalogRelease / release_id | LayerVersion FK, selected immutable source revisions/observations, BoundaryVersion/Crosswalk FKs, RightsClearance FKs, qualification result, created date | Complete release set before promotion; no mutable latest pointers inside the immutable release content |
| PublicationHead / layer_id + geography_id | Current approved release_id or no publication; monotonically increasing generation; effective/withdrawn date and reason | Single atomic promotion for a layer/geography. Current control overrides historical snapshot/cache/cursor availability |
| RefreshRun / refresh_run_id | Product, fetch/parse/validation stages, candidate revision IDs, counts/hash, outcome/error category, last good revision | Failed refresh cannot replace approved data; no secrets or raw user identities in diagnostic payloads |
| CatalogAuditEvent / event_id | Actor authority reference, capability/action, target IDs, before/after generation, reason, timestamp, evidence reference | Append-only application audit; actor identifiers protected internally, not returned to members. Retention and administrative enforcement reviewed before implementation |

MemberEntitlement and StaffGrant are access-authority concepts separate from catalog observations. They require a server-controlled issuer/subject key, capability, active/expiry/revocation fields and audited assignment. The authority may use an established InvestScape store if verified; this document does not invent a business subscription policy or assume a user_profiles row is authoritative.

### 5.1 Example joins from actual pilot evidence

| Case | Observation identity | Display identity | Explicit association / restriction |
|---|---|---|---|
| Toronto population | 2021S0503535; July 1, 2025; Total - gender / All ages; preliminary | CMAUID 535; 2021S050535535; official 2021 service | Provider namespace-format association must preserve both keys and its evidence |
| Vancouver CMHC rent | 2011S0503933; annual 2025; Apartment structures of three units and over / Two bedroom units | CMAUID 933; 2021S050559933 | stable_code_vintage_differs; display association does not assert identical footprints |
| Arizona ACS income | GEO_ID 0400000US04; 2020–2024 estimate in 2024 inflation-adjusted USD; MOE retained | GEOID 04; 2024 display boundary | State-code association plus period and geometry-vintage disclosure; no financial ranking/conversion |

Do not downscale CMA/state observations to neighbourhoods or infer neighbourhood measurements from display coverage. Cross-border displays remain context_only under Doc 80, with geography/window/universe/currency reasons visible. ACS tenure counts remain counts; no new ratio metric is silently derived.

### 5.2 Publication, reads and withdrawal

Ingest into quarantine; validate row dimensions, definitions, identifiers, units, source quality, geometry association and rights; create an immutable candidate release; approve it with recorded authority; atomically change PublicationHead. The API reads only the selected approved release and current rights/access control. No candidate becomes published merely because parsing succeeded.

Manifest returns the approved per-layer release/generation identifiers and separate layer states. Independent layer reads bind their release, geography, boundary/crosswalk version, filter, contract version and publication generation to a signed/opaque cursor. Reauthorize each request. A request may retrieve a still-authorized pinned release consistently, but withdrawal/current rights restriction wins over its previous approval: reject rather than silently switch pages to a newer release. Cache entries must be invalidated/suppressed by current publication and rights generations. Boundaries are delivered through the same member gate or an authorized delivery mechanism; publicly permanent links are not an acceptable member-only assumption.

No_data means a cleared supported selection has no observation, not that auth failed, rights are unknown, a source is suppressed, or an operational fetch failed. Keep suppression/quality flags in evidence. Unavailable is appropriate for an uncleared/unpublished layer. Failed refresh can retain the last approved dated snapshot with an explicit freshness warning, unless its rights or publication were withdrawn.

Promotion must be transactionally atomic within the selected catalog store; no shared InvestScape/Relationship OS transaction domain is assumed. Content-addressed geometry may be hosted separately after selection, but its artifact/version references must be stable before release promotion. A geometry/hash mismatch must fail qualification/read delivery rather than display another file.

## 6. Review findings and remaining closure

The logical model addresses independent layer reads, source/definition versions, immutable corrections, code/vintage crosswalks, zero/null/MOE distinctions, product-specific rights, atomic publication and withdrawal. It separates member entitlement from staff authority and shared aggregates from private Quick/Full input saves. It is eligible for owner/implementation review; it is not approved physical design or launch readiness.

| Gate | Exact non-secret fact or decision still needed | Why it remains open |
|---|---|---|
| Effective member Auth | Operator statement: accepted Auth project name/ref, issuer origin and audience for isolated staging; confirm map auth has no dev/unconfigured bypass | Source expectations and WeWeb configuration cannot prove deployed acceptance; no secret/env export needed |
| Member entitlement | Operator decision: canonical InvestScape membership authority, active member rule and revocation policy | authenticated role is not membership; subscription/staff policies cannot be invented |
| Catalog ownership | Operator decision: select Investscape-Dev private catalog or name another store; assign accountable operator and scoped read/ingest/publish/migration authority | Candidate existing project is verified, future writer is not appointed |
| Effective access/migration baseline | Signed-in read-only Data API exposure/settings plus scoped roles/functions/RLS and InvestScape-only migration baseline review | Dashboard blocked by sign-in; no catalog/roles exist to verify yet. No migration application authorized |
| ACS/source use | Exact official ACS reuse terms applicable to selected observations; any provider-specific communicated limits; implement required source notices and CMHC recipient terms | Boundary permissions cannot clear observations; source terms are obligations, not a publication toggle |
| Geometry delivery | Select member-controlled delivery, enforce display scale and run representative benchmarks | Qualified input fixture does not select hosting or establish performance |

Live implementation is separately pending. After the operator authority decisions and remaining evidence are recorded, prepare a bounded Dev implementation scope with explicit auth changes, isolated catalog migrations, ingestion/publishing capabilities and acceptance cases. Any staging deployment/publication requires its own reviewed authorization. Unclear per-source rights may keep those individual layers unavailable while qualified unrelated layers proceed; unresolved member auth/catalog bypass blocks every member catalog read.

## 7. Checkpoint verification

This documentation checkpoint includes this Doc 81, a dated forward link in Doc 80, the manifest index, the new 2024 planning geometry and its qualification record. It preserves Doc 79, the Oct 8 registry, all original source uploads, the 2025 fixtures and unrelated checkouts. Checks cover fixture hashes/keys/validity/selected-feature overlap, artifact JSON and relative document links, and exact remote Git blob/file identity. These are artifact checks; no runtime auth, API, WeWeb, deployment, publication or performance tests are claimed.

## 8. Superseding evidence checkpoint — Oct 8 local / Oct 9 UTC

[Doc 82](82-Market-Intel-Map-Dev-Implementation-Scope.md) records the completed cloud sign-in and freshly verified Data API settings: investscape/public/graphql_public exposed, automatic new-table exposure off, extra search path public/extensions, max rows 1000. No setting changed. Earlier sign-in-blocked statements in this document are historical, superseded for those specific settings. They do not establish future catalog roles or no-bypass behavior.

The exact official 2024 ACS detailed-table catalog now supplies a CC0 licence link for ACSDT5Y2024. Its rights evidence record closes the earlier ACS aggregate copyright-reuse evidence gap; required source quality/disclosures and publication review remain. No data was activated. The private Investscape-Dev catalog/API-only-read recommendation is the carried-forward design direction following Eric's instruction to keep going; real membership policy, role provisioning and deployed issuer acceptance remain unresolved.

A separate offline policy reference and 30 passing synthetic policy tests accompany Doc 82. This is not a deployed API or cryptographic JWT acceptance check. See its README for the storage race, adapter and runtime limitations. No existing API source, schema, auth setting, membership or deployment was changed.
