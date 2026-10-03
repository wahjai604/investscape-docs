# Phase 2 native migration and SaaS integration checkpoint — Doc 78

**As of:** 2026-10-02 America/Vancouver (inspections ran 2026-10-03 UTC).
**Scope:** documentation reconciliation. This document does not enable a route, grant permissions, deploy an engine, publish WeWeb or certify financial correctness.
**Base:** investscape-docs `docs/e85-e88-engine-registry` at `fe73f3be81e91f0e99721113e08610f4f8631ffa`.

## Evidence vocabulary

- **Verified inspection:** current source, package, deployment or database metadata inspected through connectors.
- **Verified execution:** calculations/tests executed during this review.
- **User-reported:** Eric's Claude Code report; local Git commits were not inspected through the Windows filesystem.
- **Saved configuration:** WeWeb readback confirms configuration; does not establish browser behavior.
- **Proposed:** future work, with no implementation or release implied.

These labels govern the current checkpoint. Earlier numbered documents retain historical findings; a previous successful integration does not establish today's connection or release state.

## 1. Product architecture and present connections

| Layer | Current evidence | Remaining integration |
|---|---|---|
| GitHub API | Remote master equals deployed `e2a5ddf216a029ec7fc1f4e0d36dc848375bd53f` | New development adapter is not yet installed |
| Railway | InvestScape API successful production deployment `37ff669a-1863-4ceb-a61a-b1f30014d75e` (2026-09-28) | Route-specific authenticated Full integration and fresh endpoint acceptance |
| WeWeb | Native Workspace and Quick drafts exist, unpublished, English | Full page, authenticated saving and other modules pending |
| Supabase | Existing Investscape-Dev database and core product schema present; direct MCP read-only inspection succeeds | WeWeb Supabase integration installed but connection list empty / not ready |
| Quick runtime | Exact `0.9.0-p2-5a` artifact embedded in reusable WeWeb workflow | This is not an externally hosted script; upgrade deliberately |
| Full runtime | Node adapter implementation reported, no consumer wiring | Corrected package review/checkpoint then API delivery |

Railway hosts the API and its installed engine packages. Supabase stores application data; WeWeb renders native pages. No separate Railway service per engine and no duplicate database project are required by this checkpoint.

Identifiers (not credentials):
- Railway project `63465754-e0f1-4823-9f72-6d0d599196d8`, service `cd42d681-3ad5-4c23-ae15-a965b8ebd17b`, production environment `4723958f-8a01-4cdf-94e6-d67c7888bb0d`.
- API: https://investscape-api-production.up.railway.app
- WeWeb Investscape Dev `4a0173ad-346d-4d29-a9b9-0201e5af6d78`.
- Workspace page `0638fef4-2a31-489a-b7a8-bde95c384ce6`; Quick page `f57615c4-7e3c-4b97-8078-eb575a075f14`.
- Supabase Investscape-Dev `hwhkgrwikczwztfnsjir`, Lighthouse Research organization, ca-central-1, ACTIVE_HEALTHY, PostgreSQL 17.6.1.166 at inspection.

## 2. Source checkpoint and calculation parity

Canonical source remains Eric's local `investscape-v2-remastered.html` in Investscape-Retired-Reconstruction, not a stale September prototype copied into this repository.

Working-tree reference SHA-256:
`84cf6e13043fe392e8c4a9f82e37ba90ec68b86f948c8f91082bcc9810193c83`.
17,520 CRLF lines, zero bare LF. Index/checkout line endings may differ; use the documented parity normalization and narrow attributes.

User-reported local commits (not pushed; live remote reachability not established):
- `3e75227201ecdc7002a5ed5ab6bc78e274e3ffba`: A9/A10 and reconciled source docs.
- `34dc2db8417ccae2a68b854e1e7faba0e7996494`: raw shared calculation extraction.
- `914bddcab209ab7e994e5e71cd51aaf4b3e088ba`: parity line endings.
- `9f392d4c6701ec9cd280ddc9a5e8b1562bb1acaa`: validated Quick adapter and deterministic parity clock.
- `2ec7277ef4f6616a767b70599a44ddd30ed5c337`: reproducible Quick browser delivery.

Raw Quick, Full, RLV, staged, tax, handoff and E85 validator slices were extracted with strict parity. Adapter validation is new policy, not parity with malformed prototype inputs. No formula corrections are implied.

Reference bundle fingerprints identify content only; release versions UNKNOWN:
- calc `b6891022981e8c1b45036bb429750e1aaf161692790e1287d165af4c9aea60b6`
- economic `6d0ddf8e5a2d10d7fc840f4311aa4c16a96bce850b661c06e0be358527b7a202`
- tax `706a8ac6ca7b52595e4cfe9dcaabe3946228a8fe9a12e710222f35f82fab81da`

### Full adapter acceptance state

P2-6B.2 is **user-reported implemented, uncommitted and unwired**: 27 files / 832 checks including actual Edge execution, 104 Full adapter checks. Independent P2-6B.2 review on 2026-10-03 verified ZIP SHA-256 `f5368fe5f50b879613ab38c430ce979e68a6cae134e1f4747549fa86a7b8e373`, all manifest entries, baseline/build checks and 27 passing test files: 828 executed checks here, with four actual-browser checks skipped because Edge/Chrome is unavailable. The 104 Full adapter checks pass. Compared with P2-6B.1, only full-adapter.js, its test and the contract spec changed (plus manifest). Reference HTML, raw calculations and goldens are unchanged.

Independent P2-6B.1 ZIP review: baseline/build and 27 files pass; 825 executed checks here, four actual-browser checks skipped. Review found a non-enumerable non-finite required stack metric could still return ok. P2-6B.2's reviewed code and synthetic tests close that gap using direct finiteness checks and duplicate issue removal. This accepts the corrective review package for a local checkpoint; it does not establish browser Full behavior, deployment or financial correctness.

P2-6C runtime delivery review on 2026-10-03: ZIP `fa6e05c3111b2637b3ef823f4ee4ec7889e94b2ced9234f64f99bc0c7097bf05` has 64 manifest entries, all independently verified. Runtime tarball SHA-256 `0d1f079e121dd16093a08c50b3a025447efed2b9caa420918e2c4ff38502208d` contains exactly 13 files, all byte-identical to the reviewed package. Raw baseline adapter results equal source results without JSON conversion. Exported logs record one sequential run: 27 files / 832 checks with no browser checks skipped; this is reviewed log evidence, not a new Edge run here. Source checkpoint `175587843b0aca4ef0d1c9f54ec112962ab24a79` is reported local and unpushed. One earlier parity-clock-pin failure remains unexplained, not resolved.

Full contract wraps only devstudioCompute; RLV, staged and tax remain separate operations. Proposed/adopted policy includes exact enum scope BC/ON/US, explicit additive-facility amounts, finite inputs, conditional activation and a versioned 600-month resource limit. Status includes partial with per-section availability. No currency conversion, financial audit or tax-law verification is claimed.

## 3. Native Quick evidence

Verified screenshots show valid baseline results, input edit immediately clears previous metrics, manual Calculate recomputes, invalid text withholds results, dark mode and demonstrated 400px phone layout.

The retrieved actual WeWeb submission log for land 1,100,000 returned total cost 3,300,000, return on cost 0.36363636363636365 and simple annualised return 0.16774841624228443 without action errors. This is bounded acceptance, not a comprehensive browser matrix.

Quick uses six raw decimal text inputs, whole-percent inputs and fractional return outputs. Inputs have no currency symbol/grouping; results have grouping. There is no currency selector, authenticated saving or Quick-to-Full project creation yet.

Navigation repair is saved configuration only: session draft `a3ec9f3f-8fea-4d3d-927c-e63e7017e54e`, persistent revision/result, six guarded edit workflows and page-load native restoration `dba47908-987b-43e2-88e3-e68febce903e`. Preview roundtrip acceptance remains pending. No reload persistence is promised.

## 4. Railway engine delivery

The deployed API commit installs vendored archives:
- calc 1.0.0
- economic 0.1.6
- tax 1.0.0
- market-intelligence 0.3.0

Archive package labels are not embedded reference release lineage. The calc archive SHA-512 matches its package-lock integrity. It exports all five functions Full needs: calculateCapitalStack, calculateFinancingTable, calculateBudgetRollup, calculateSourcesUses, calculateAcquisitionStructure.

**Verified execution:** both packaged calc UMD and ESM builds match all 249 existing Full golden cases at tolerance 0. Their UMD LF-normalized script hash is `8617fcb05b31e15ab9da46cc85cc50da179b93319f1eedf01c7f4b65d66a5c47`, different from the reference script; no byte-identity or all-engine lineage claim.

Individual HTTP route completeness is separate from package completeness: the inspected E78 financing-table router returns a not-yet-implemented stub. The new Full operation should call imported calc functions through the shared adapter, not fan out to existing engine HTTP routes.

Deployment startup logs: CORS allowlist one origin; engine auth flag disabled; session verifier unconfigured; rate 600/min; E85 zoning disabled. These are startup observations, not new live endpoint/security acceptance. Railway configuration reports checkSuites false: a master push may deploy without waiting for CI; keep integration off connected master until validated.

## 5. Existing Supabase data

Verified metadata in `investscape`: deals, dev_studio_projects, portfolios, user_profiles and translations; all RLS enabled. Per-owner tables have auth.uid/owner_id predicates and update USING/WITH CHECK. Inspection did not read personal payload rows or rerun cross-user tests.

Follow-up verified metadata confirms five public views (deals, dev_studio_projects, portfolios, user_profiles, translations), all security_invoker=true; public has no base tables. Authenticated CRUD grants exist on the four owned tables and their views; anon has no CRUD grant on owned objects and can SELECT translations. Both roles have schema USAGE. Policy roles listed as public are not by themselves an exposure finding: grants and owner predicates jointly govern access.

Doc 73's earlier endpoint/signup/login evidence remains historical, not rerun. Current Data API exposed-schema configuration and live authenticated behavior remain unverified. Reconcile auth provider and migration source before schema changes; current WeWeb connection absence does not prove removed data or views.

Reuse existing owner/payload structures. Do not create duplicate generic projects tables. Snapshot storage and optimistic save revisions are proposed and require a deliberate JSON contract. NaN/Infinity, undefined and -0 must not silently change meaning during HTTP or JSONB serialization.

## 6. Engine readiness and preserved gates

Canonical numbering: E85 zoning; E86 CRE data foundation; E87 cap-rate; E88 construction costs; E68–E70 tax engines.

At market-engine branch `feat/e85-market-intelligence`, `b279e22d71019009439803d928aeadf7e6b92ddc`:
- E86 benchmark source and deployed cap-rate API seam exist; persistent observation store/scheduler and additional ingestion adapters remain.
- E87 and E88 implementation/test sources exist, but their folders are excluded from package.json's shipping allow-list and root exports. Installing market package 0.3.0 does not establish their availability.
- Current root source exports zoningLandUse, while the shipping allow-list omits its public implementation dependency. Clean npm pack/install/import smoke tests are required before upgrade; this is not proof the earlier deployed artifact is broken.
- Statistical Risk v1 exists. Monte Carlo, probability thresholds, portfolio covariance, forecasting, regression and back-testing phase2 run functions throw not implemented.
- E85 remains NOT_RELEASED, AS_OF DISABLED, synthetic public-2 preview only, mandatory packReadiness; no live zoning route. Vancouver reuse/evidence questions remain. Regulatory area m² must not populate construction area/cost assumptions silently.

Preserve Quick/Full differing revenue/margin bases and single-phase financing-inclusive versus staged financing-excluded RLV. Preserve disclosures around fixed 5% commission, 0.20/0.27 capital-stack rates, 0.5-ha E82 parcels, E51 arithmetic/after-tax withholding, E52 assumptions and BC-only acquisition support.

## 7. Execution ownership and next gates

| Slice | Boundary | Completion gate |
|---|---|---|
| Full adapter checkpoint | reconstruction repository only | corrected ZIP review, explicit-path commit |
| API Full integration | isolated branch/worktree; existing calc archive | authenticated route tests, JSON contract, staging acceptance |
| Supabase/WeWeb connection | existing Investscape project only | correct connection/auth provider, owner A/B tests, saves/reloads/concurrency |
| E87/E88 packaging | market-engine package only | pack/import smoke checks, explicit public DTO review; no E85 release |
| Advanced Risk design | separate bounded methodology slices | data basis, diagnostics, seeds/limits before implementations |
| Native shell/Quick | current drafts | navigation acceptance, accessibility/responsive/i18n follow-up |

Relationship OS, its infrastructure and unrelated session changes are outside these slices. No API deploy, schema mutation, engine release or WeWeb publish was performed by this reconciliation. Research ingestion/reuse and Community authentication/database/moderation remain separate functional systems.

## 8. Source references

- API deployed commit: package.json, package-lock.json, vendor/, src/routes/index.ts, src/http/engineGuards.ts.
- Market engine b279e22: package.json, src/index.ts, src/statistical-risk/phase2-contracts.ts, src/market-intelligence/phase2-contracts.ts, docs/E86-phase8-production-monitoring-refresh.md, docs/E87-phase7-production-hardening.md, src/construction-cost-engine/index.ts.
- Reconstruction current local documents: QUICK-FULL-DEVELOPMENT-FIELD-MAP.md, E85-PUBLIC-2-PREVIEW-RECONCILIATION.md, DEVELOPMENT-UI-IMPLEMENTATION-PLAN.md, WEWEB-CALCULATION-INTEGRATION-DESIGN.md, WEWEB-MIGRATION-PARITY-SPEC.md, WEWEB-QUICK-NATIVE-BINDING-SPEC.md, WEWEB-FULL-ADAPTER-CONTRACT-SPEC.md.
- Related current docs: 53, 66, 73, 74, 75, 76, 77. Historical material is retained; Doc 78 governs this checkpoint's migration/integration status only.
