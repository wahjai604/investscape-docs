> **Superseded authorization interpretation — 2026-10-08 UTC:** Public objects described below as tables or copies are security-invoker views over the same investscape base tables. Their relrowsecurity=false is not evidence of missing underlying row protection. The claimed public-schema authorization gap and resulting remediation recommendation are withdrawn. No schema switch, migration or grant/RLS change is justified by these findings. See 09-View-Resolution-and-Remaining-Acceptance.md for current conclusions. Earlier text is retained as review history, not current guidance.

# Phase 4 — live inventory and adapter mapping
Reviewed 2026-10-08 UTC. Read-only service/catalog inspection; no user records, credentials, API writes, schema changes, deployment, or WeWeb edits.

## Scope correction (follow-up)
The findings below about RLS/grants apply to the public schema only. The custom investscape schema has RLS enabled and owner policies on its private tables; see 07-Schema-Authorization-Followup.md. The active native save path/default Data API schema remains unverified. Do not interpret the public-schema inventory as proof that Quick/Full lacks database ownership protection.

## Current evidence
- Railway: InvestScape Native Full Staging, service native-full-staging-api, online; successful active deployment c0f1658f-481b-4579-a297-4ba02963436e at API commit 2cec0ab519513a34aabbad909c4f24b1472d385c. One running replica; no reported issues/recent failures in the default eight-hour window. Environment is named production inside this isolated staging project; this is not evidence of a production release. A staged patch with zero reported changes remains pending; it was not applied.
- Supabase: Investscape-Dev, project hwhkgrwikczwztfnsjir. Public relations found: deals, dev_studio_projects, portfolios, translations, user_profiles. All have RLS disabled. No public-schema policies found. Authenticated role has SELECT/INSERT/UPDATE/DELETE grants on deals, dev_studio_projects, portfolios and user_profiles; translations has anon and authenticated SELECT. PostGIS is not installed.
- This establishes absent database row protection for those roles. Data API schema exposure, additional middleware controls, direct account-B denial and actual exploitability remain unverified. Do not claim a demonstrated leak or that earlier list isolation proves database protection.
- WeWeb: Investscape Dev project 4a0173ad-346d-4d29-a9b9-0201e5af6d78. Targeted page search returned Full Development Studio and Quick Deal Analyzer, both drafts sharing InvestScape Shared Header. No Market/Research/Portfolio matching page was returned by this targeted search; this is not exhaustive component/workflow inventory. Page descriptions can be stale and do not override historical persistence acceptance.
- API source evidence is pinned to 2cec0ab. Runtime health does not verify every route, source license or data provider.

## Concrete adapter mapping
| Proposed operation | Existing seam | Required mapping / gate |
|---|---|---|
| geography.search / map.boundaries | E61 region/city/neighborhood wrapping; GeographyRef | No reviewed search/viewport boundary seam. Map official canonical IDs through an explicit reviewed crosswalk; wrapping names/IDs does not establish boundary matching. |
| market.observations | E65 input adapters; MarketObservation schema | Preserve metricId, value, unit, periodStart/End, frequency, geography and source. Source fields include sourceId/name/type, optional methodologyUrl/licenseNotes/retrievedAt. Add approved-source/rights selection and publication revision outside the legacy calculation contract. Unknown values must not be coerced to zero: existing schema requires numeric value. Unknown dates remain unknown in the new read response. |
| neighborhood snapshot | E66 buildNeighborhoodSnapshotInputSchema | Existing body: input { neighborhoodId, neighborhoodName, cityId, coordinates {lat,lng}, optional asOfDate }, optional now. Boundary centroid is not an authorized substitute for a genuine point observation. Add read envelope as a separate proposed adapter; no route implementation. |
| geographic.compare | E60 comparability; E63 benchmark; E66 neighborhood benchmark | E66 accepts subjectInput, peerInputs, metricId, optional now. Feed compatible observations and disclose geographic/period/definition limits; no new investment recommendation score. Exact engine response mapping still needs review. |
| research.search/detail | No Research router in reviewed registry; no public Research catalog table found | Approved catalog, editorial ownership, rights and audience filtering still required. No embedding/full-text shortcut for unknown or link-only rights. Other schemas/storage not inventoried. |
| portfolio.map | portfolios metadata; E10 caller-supplied portfolio calculation | Columns include owner_id, address, category, deal_status, inclusion flags and payload; no typed coordinate columns found. JSON payload contents were not read. Calculation is not authorized holdings retrieval. Default overlay off; gate on resolved owner authorization and approved location model. |
| Dev Studio / Deal Analyzer links | dev_studio_projects / deals metadata and native draft pages | Retain scoped navigation intent. Do not infer payload schemas, cross-module write permission or reliable address-to-coordinate mapping from table names. |
| ai.evidence.read | Proposed common read contract | Apply each module's authorization and source rights before AI retrieval. Private-table database gate also applies to AI, exports and caches. No live all-module AI endpoint verified. |

## Priorities and remaining bounded work
1. Read-only authorization follow-up: confirm Data API exposed schemas and effective role access, then trace current API/WeWeb saved-record ownership enforcement. Do not target another account's record or mutate permissions. Existing app-list isolation remains historical acceptance only.
2. Complete exact engine result mappings, relevant saved-record API seams and WeWeb component/workflow inventory using sanitized metadata.
3. Finalize a reviewable remediation proposal and acceptance cases for the database authorization gap. Applying grants/RLS/migrations requires explicit schema authorization.
4. Continue public quantitative/boundary design and Research editorial decisions independently. Private holdings/AI access cannot be cleared by the mock prototype's tests.
5. Provider rights, boundary ambiguity/crosswalks, approved Research catalog/editorial responsibility/audience, live request budgets and actual mobile/load evidence remain open.

No Relationship OS content was inspected. This report is a scoped inventory, not full security audit, implementation or release clearance.
