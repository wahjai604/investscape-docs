# Market Intel Map — Bounded Dev Implementation Scope (Doc 82)

**Date:** 2026-10-08 America/Vancouver / 2026-10-09 UTC.  
**Status:** Concrete integration proposal plus tested offline policy reference; no live implementation, database mutation, deployment, auth configuration or WeWeb publication.  
**Parents:** [Doc 80](80-Market-Intel-Map-Pilot-Implementation-Readiness-Plan.md), [Doc 81](81-Market-Intel-Map-Gates-and-Logical-Catalog-Model.md).

## 1. Direction and freshly closed evidence gaps

Eric's instruction to continue with the recommendations carries forward the private Investscape-Dev catalog and API-only member-read direction. This selects the design target, not existing writer credentials, a deployed membership rule or permission to apply migrations. Use project hwhkgrwikczwztfnsjir. No other product or database is part of this scope.

The cloud Supabase sign-in completed after the owner's hCaptcha handoff. The signed-in Data API settings were read without changing selections. Save and Cancel remained disabled.

| Setting | Fresh Oct 8 local / Oct 9 UTC observation | Implication / limit |
|---|---|---|
| Project | Investscape-Dev, hwhkgrwikczwztfnsjir; dashboard branch main with Production badge | Correct Dev project; badge does not prove InvestScape has launched |
| Exposed schemas | Check icons present for graphql_public, investscape and public | investscape exposure confirmed; keep the proposed new private catalog outside this set |
| Table selector | 1 of 25 tables exposed; selected application object investscape.dev_studio_projects | UI metadata only. Existing public invoker views/grants were read separately in Doc 81; no live save/read/access failure or success is inferred from this selector |
| Functions selector | 0 of 2 functions exposed | UI count; not a complete effective function/SQL/GraphQL bypass audit |
| Automatically expose new tables | Switch aria-checked=false | Fresh control state; do not rely on it alone instead of explicit catalog grants/revokes |
| Extra search path | public, extensions | Proposed catalog must not be added to this path |
| Max rows | 1000 | Existing Data API setting; independent server map limits remain those proposed in Doc 80 |
| Save | Disabled after read-only inspection | No settings edits were made |

Source: signed-in [project Data API settings](https://supabase.com/dashboard/project/hwhkgrwikczwztfnsjir/integrations/data_api/settings). No table data, users, auth secrets or environment values were read. Existing exposure is not changed or hardened in this task, since it supports unrelated existing application paths.

### 1.1 Exact ACS rights evidence

The official [2024 ACS catalog metadata](https://api.census.gov/data/2024/acs/acs5.json) identifies dataset https://api.census.gov/data/id/ACSDT5Y2024, ACS 5-Year Detailed Tables, with a CC0 1.0 licence link. The [CC0 legal code](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en) permits worldwide copyright reuse/commercial use to the extent of the provider's rights, with a fallback licence and exclusions for trademarks, patents and other parties' rights. This establishes copyright reuse evidence for selected official detailed-table aggregates B01003/B19013/B25064/B25003. It does not clear unrelated third-party content or provider marks.

The new [rights evidence record](../../data-templates/market-intel-acs-2024-rights-evidence.json) pins the provider metadata hash and exact dataset/licence reference. Keep Census attribution as InvestScape's evidence policy; keep estimate period, definitions, units/price basis and MOE/control markers. The catalog metadata vintage does not replace the selected uploads' 2020–2024 five-year estimate window. All pilot layers remain inactive; no copyright finding by itself publishes data.

This supersedes the prior inability to establish ACS reuse terms in Doc 81. CMHC recipient agreement/attribution and legacy vacancy-link applicability remain conditional; no full-text Research, basemap tiles or geocoder clearance is implied.

## 2. Proposed first implementation slice — isolated, offline and disabled

Prepare an isolated candidate branch/review copy from investscape-api feat/native-full-api-adapter at the freshly pinned commit 2cec0ab519513a34aabbad909c4f24b1472d385c. Do not write to the Railway-connected branch, merge, deploy or modify existing dirty checkouts. Check applicable AGENTS instructions and source preservation before edits.

| Proposed change | Concrete behavior | Scope boundary |
|---|---|---|
| src/market-intel/map/auth.ts | Dedicated verifier configuration; explicit expected issuer/audience; asymmetric keys; require exp and verified subject; reject anonymous/dev identities; no fallback | Reuse audited verification primitive where appropriate; do not change shared Lighthouse or Full verifier behavior |
| src/market-intel/map/memberAccess.ts | Resolve server-controlled active map-read entitlement by verified issuer/subject; fail closed if provider unavailable; no user_metadata/email-based self-assignment | Dependency interface plus synthetic offline test provider first; no real member/staff assignments |
| src/market-intel/map/contracts.ts | Strict manifest/layer read contracts, bounds and state/evidence envelopes from Doc 79 | Do not treat auth failure as no_data or turn unavailable into synthetic observations |
| src/market-intel/map/publicationPolicy.ts | Approved release/rights/generation checks; current withdrawal wins over prior snapshot/cursor/cache | No source refresh or promotion job runs |
| src/market-intel/map/catalogRead.ts | Reader interface for approved aggregate releases; separate immutable source and geometry references | Offline adapter first; no reuse of dev_studio_projects for catalog data |
| src/routes/market-intelligence/map.ts | Independent member manifest/layer routers using the above gate; never inherit general engine-auth no-op posture | Construct and exercise in a test app; no startup/router registration in first slice |
| New focused tests beside those modules | Real locally generated asymmetric test signatures plus synthetic principals/entitlements/releases; offline HTTP tests | No exported real JWTs, logins, deployed endpoints or database records |
| Catalog migration/access review files | Draft private schema/table/key/role layout from Doc 81 plus isolated history placement and privilege matrix | Draft only; no applied SQL, role credentials, existing grant edits or shared Lighthouse migration ledger |

The first slice proves the standalone boundary with offline dependencies. It does not claim effective deployed issuer or actual database privileges. Production wiring, database role provisioning, real membership administration and WeWeb mounting remain later explicit scopes.

Fresh source references: [Full route](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/routes/development/full.ts), [session primitive](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/lighthouse/auth/session.ts), [startup](https://github.com/wahjai604/investscape-api/blob/2cec0ab519513a34aabbad909c4f24b1472d385c/src/index.ts). The existing general /v1 engine guard can be disabled; independent map checks are therefore required. Full already constructs its own asymmetric verifier and checks expiry. These are source findings, not deployed configuration evidence.

## 3. Recommended initial authority policy for review

Use Investscape-Dev Auth as the intended standalone Dev issuer; audience authenticated. This is a design target, not a claim about Railway's current effective accepted issuer. Do not inspect raw Railway variable values to establish it. Obtain the allowed non-secret operator statement before configuring or testing staged member acceptance.

Recommend manually provisioned, server-controlled map_read entitlement for the sole operator during the Dev pilot, with expiry/revocation and audited changes. A signed-in account has no implicit map/staff entitlement. No real subject or account is appointed in this proposal. Before later real use, select the canonical membership store and establish an audited provisioning method. Only a separately authorized administrator grants staff capabilities; ingestion and publishing do not grant access-administration authority.

Keep catalog_reader, catalog_ingester, catalog_publisher and catalog_migrator capabilities distinct. Actual scoped database login/role support and grants require review/provisioning; do not silently replace them with a broad service-role credential. Enforce private catalog isolation across REST, GraphQL, SQL, functions and geometry delivery, rather than relying on a schema label.

## 4. Offline acceptance for the proposed slice

| Case | Required result |
|---|---|
| Missing/malformed/bad-signature/wrong-issuer/wrong-audience/expired/no-exp JWT; none/HS256/dev token | Reject before entitlement/catalog access; static errors without token/identity leakage |
| Supported valid asymmetric signature + current entitlement | Read only selected approved release; no account identifiers in member response |
| Valid signature without entitlement; revoked/expired membership; user-editable membership claim | Deny; no catalog call |
| Verifier/entitlement dependency outage or missing config | Unavailable, never fallback identity or no_data |
| Unpublished/rights-restricted layer; raw source evidence; unknown source use | Withhold value/geometry; maintain independent allowed layer state |
| Withdrawal after cursor/cache creation | Refuse affected page/cache hit; no silently changed release |
| Boundary hash/version mismatch | Refuse delivery; do not draw a different geometry |
| Invalid geography/layer/filter/bbox; unsupported antimeridian; too-large page | Strict bounded rejection under Doc 80 |
| Available zero, no observation, suppression, preliminary, experimental and ACS MOE markers | Preserve distinctions; never coerce absent/suppressed/MOE marker to zero |
| Existing source paths | Quick/Full, shared Lighthouse, E85 and current engines unchanged; relevant regression/type/build checks pass |

The full matrix above is proposed, not a claim that every case ran. The accompanying standalone [offline policy reference](../../data-templates/market-intel-map-offline-review/README.md) passed 30 synthetic policy tests using Node v24.19.0: authentication-result validation, authority denial/outages, source-use/terms gates, repeated authorization, mid-read withdrawal/revocation, release pins, artifact mismatch, and value/status distinctions. It uses injected verifier results, so no real JWT signature verification, HTTP integration, database, cache infrastructure, Quick/Full regression or WeWeb acceptance is claimed. Its internal envelope is map-offline-review-1. Database no-bypass verification requires a later isolated disposable/local database with actual roles and Postgres permission tests. Do not claim it from a mocked repository. Geometry performance and rendered WeWeb acceptance remain later gates.

## 5. Separate later live actions and their evidence

Before applying catalog DDL to Investscape-Dev: review exact migration statements, role grants/revokes, isolated baseline/history, backup/recovery and effects on existing saves. Do not run the shared Lighthouse migration command. New catalog tables do not belong to the Quick/Full 'reuse existing table' instruction; Quick/Full retain dev_studio_projects unchanged.

Before staged wiring: establish the effective accepted non-secret Auth project/issuer/audience, canonical real membership authority, scoped catalog runtime credentials and backend environment isolation. No raw environment export, connection string or JWT is needed in the evidence handoff. The unknown cross-product transaction domain remains outside this independent map task.

Before any live source/geometry release: implement source notices, required CMHC recipient agreement, qualified revisions/crosswalks, controlled geometry delivery/scale limits and withdrawal procedures. Unqualified source layers remain unavailable. Before WeWeb publication or production rollout, review actual acceptance and performance evidence and request that specific approval.

## 6. Concrete next integration boundary

The offline reference was prepared within the continuing review work. It resides only in the documentation review artifacts, with no runtime import or mount. Its dependency interface requires a server-owned cryptographic verifier adapter; the existing shared session primitive does not return every metadata field that the reference validates, so it cannot be substituted without an explicit adapter review. Real issuer acceptance remains unknown.

Next, integrate the reviewed boundary into an isolated API candidate and extend it to the actual contract/HTTP adapters, with draft catalog migrations and scoped-role verification in a disposable local database. Live Supabase DDL/role provisioning, real member assignments, authentication configuration and Railway/WeWeb activation remain separately pending. Before those actions, review the concrete changes and confirm the Dev membership/publisher policy. No staff appointment or deployed-authority claim is invented from the sole-operator context.

This checkpoint updates Doc 81 with fresh settings and exact ACS rights evidence, adds this implementation scope, preserves the rights evidence record, and includes the offline reference source/tests/README. Earlier unknowns remain historically visible with a dated superseding note. Preserve every unrelated repository file and original fixture.
