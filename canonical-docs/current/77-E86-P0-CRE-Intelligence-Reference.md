# InvestScape — Doc 77: E86 P0 CRE Intelligence Narrow Public Surface Reference

**Lighthouse Research Ltd. · 22 September 2026**
**No companion proposal doc.** This doc registers E86-P0's exact, narrow public runtime surface and the allow-list mechanism enforcing it. The `investscape-api` integration (E86-I1a/I1b) it originally described as deferred is now complete — see §4a, added 22 September 2026.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-market-intelligence-engine
**Branch:** `feat/e85-market-intelligence`
**Commit documented:** `ae7b8397a5504d74ff161b93404435367f6bdc05` (`ae7b839`) — same repository, branch, and commit as Doc 76.

Every statement below was verified with `git show <sha>:<path>` against the actual committed blobs.

## 1. Public surface

The package root, `src/index.ts`, re-exports exactly:

```ts
export * as creIntelligence from "./cre-intelligence/public";
```

— never `./cre-intelligence/index` (the broad internal barrel). `src/cre-intelligence/public.ts` is, per its own doc comment, *"the ONLY E86 entry point published outside this repository."*

**As of package v0.3.0 (see §4a below), five runtime functions** (four at the commit `ae7b839` documented in §0–§3, plus `getCapRateBenchmark` added since):

- `capRateConsensus`
- `weightedConsensus`
- `selectCapRateBenchmark`
- `selectHardCostBenchmark`
- `getCapRateBenchmark` (added in v0.3.0 — see §4a)

**Exactly eight public types:**

- `CREObservation`, `CRECitedObservation`, `ConsensusResult`, `CREDataStatus`, `CREDataGap`, `CRECitation` (from `./types`)
- `BenchmarkIdentity`, `CREBenchmarkResponse` (from `./benchmark-types`)

## 2. Allow-list mechanics

Two independent layers, both verified against `package.json` at this commit:

1. **The `"exports"` field declares only `"."`** — no subpath exports are declared. This blocks deep-import resolution (e.g. `@pkg/dist/cre-intelligence/qualification`) for any resolver honoring the `exports` map, regardless of what files are physically present in the published tarball.
2. **The `"files"` allow-list** ships only: `dist/index.{js,d.ts}`, `dist/statistical-risk/**`, `dist/market-intelligence/**`, `dist/visualization/**`, `dist/types/**`, and from `dist/cre-intelligence/`: `public`, `consensus`, `benchmark-selection`, `qualification`, `mapping`, `types`, `benchmark-types`, and the data files `cap-rate-benchmark-mapping`, `cap-rates-us`, `cap-rates-ca`.

**`qualification.ts` and `mapping.ts` are packaged as runtime dependencies but are not public exports.** They are shipped in `files` because `benchmark-selection.ts` imports from both at runtime (`qualifyCapRateObservation` from `./qualification`; `observationId` from `./data/cap-rate-benchmark-mapping`) — not because either is part of the intended public surface. The `"exports"` map's `"."`-only declaration, not the `files` list, is what actually prevents a consumer from importing them directly.

## 3. Broad internal barrel — remains non-consumer-facing

`src/cre-intelligence/index.ts` exports a much wider surface — `types`, `consensus`, `normalize`, `source-registry`, `mapping`, `qualification`, `data/cap-rates-us`, `data/cap-rates-ca`, `data/cap-rate-benchmark-mapping`, `data/construction-costs-us`, `benchmark-types`, `benchmark-selection`, `user-override`, `legacy-migration`, `soft-cost`, `ingestion` — but this barrel itself is never re-exported from the package root, so none of it reaches an external consumer of the published package.

## 4a. E86-I1a/I1b completion — added 22 September 2026

**E86-I1a and E86-I1b are both complete.** This section documents that work; §0–§3 and §5 above describe the state at commit `ae7b839` and are otherwise left as originally written.

**Implementation facts (read directly from source in both repos):**

- **Engine package, `investscape-market-intelligence-engine`, commit `a754679d5734d662cd4a582dbd3056129a2839ae`** (`feat(e86): add getCapRateBenchmark public lookup, bump to 0.3.0`): bumps `package.json` version to `0.3.0` and adds `export { getCapRateBenchmark } from "./benchmark-lookup";` to `src/cre-intelligence/public.ts` — the same root-only, allow-listed public surface described in §1–§3, unchanged in shape. `getCapRateBenchmark(identity, asOf?)` is a thin country-dispatch wrapper (US vs. Canadian cap-rate observation pool selected by `identity.country`) that delegates to the existing `selectCapRateBenchmark`. No raw pools, registries, ingestion, or licensing metadata are newly exposed; no deep-import path was added. The package root now re-exports exactly five runtime functions (the four in §1, plus `getCapRateBenchmark`); the eight public types in §1 are unchanged.
- **API vendor upgrade, `investscape-api`, commit `3576b2927610ff820492d9d4c809396278ed8d8e`** (`chore(deps): upgrade @investscape/market-intelligence-engine to 0.3.0`): replaces the vendored `vendor/investscape-market-intelligence-engine-0.2.0.tgz` with `-0.3.0.tgz` and bumps `package.json`/`package-lock.json` accordingly. This resolves the "still vendors a pre-E86 package version" gap noted in the original §4.
- **API endpoint, `investscape-api`, commit `8b18a41e2e72d489f006b6c319e1f61030c943f5`** (`feat(E86): add POST /v1/market-intelligence/cre/cap-rate-benchmark`): adds route `POST /v1/market-intelligence/cre/cap-rate-benchmark` at `src/routes/market-intelligence/E86-cap-rate-benchmark.ts`, wired into `src/routes/index.ts`.
  - **Request validation** is API-owned Zod, defined in `src/validation/market-intelligence-schemas.ts` as `capRateBenchmarkRequestSchema`: `z.strictObject({ identity: capRateBenchmarkIdentitySchema, asOf: z.string().datetime().optional() })`, where `capRateBenchmarkIdentitySchema` is itself a `z.strictObject(...)` mirroring the engine's `BenchmarkIdentity` shape. `z.strictObject` is applied at both the request root and the nested `identity` object, so unknown keys at either level are rejected, not silently dropped.
  - **Response** is an explicit allow-list DTO built field-by-field in the route handler: `status`, `identity`, optional `publisherRange`, optional `publisherValue`, optional `derivedBenchmark` (narrowed to `value`, `unit`, `derivationMethod` only), optional `qualification`, `warnings`, and optional `dataGap` (narrowed to `reason`, `lastResearchDate` only). Provenance/citation details, source URLs/locators, `mappedLegacyKey`, `dataGap.sourcesInvestigated`, and `derivedBenchmark.provenance`/`derivedBenchmark.sourceSupplied` are all excluded by construction — the handler never spreads the engine's raw result object.
  - **`DATA_GAP` is a normal HTTP 200 response**, not an error: the route calls `res.json(...)` (default 200) whether `result.status` is a resolved benchmark or `"DATA_GAP"`, and returns no substitute or fabricated value in the gap case — `publisherRange`, `publisherValue`, and `derivedBenchmark` are simply omitted, leaving only `status`, `identity`, `warnings`, and `dataGap.{reason,lastResearchDate}`.
  - **Invalid requests and unexpected exceptions both return the API's standard HTTP 400 error envelope**, `{ error: { message } }`: a failed `safeParse` short-circuits to `res.status(400).json({ error: { message: <joined Zod issues> } })`, and anything thrown by `creIntelligence.getCapRateBenchmark` inside the try block is caught and returned the same way.
  - The endpoint does not ingest, refresh, validate source licensing, or persist anything, and makes no guarantee of currentness, completeness, source validity, valuation accuracy, or legal/tax applicability — it is informational only and does not imply an appraisal, investment, legal, or tax conclusion. (This limitation list restates the source-data caveats already implicit in the engine's DATA_GAP/qualification model; it is not a new restriction introduced by the API layer.)

**Audit/test evidence (confirmed by reading the route's own test file, not by an independently rerun test suite in this pass):** `src/routes/market-intelligence/E86-cap-rate-benchmark.test.ts` (added in the same endpoint commit) contains a test, `"Miami/multifamily lookup returns 200 DATA_GAP with no fabricated benchmark"`, that posts a request expected to hit a data gap and asserts `status === 200`, `json.status === "DATA_GAP"`, and that `publisherRange`, `publisherValue`, and `derivedBenchmark` are all `undefined`. A separate test, `"malformed request (invalid enum) returns 400"`, asserts the 400 envelope on invalid input. These are the test file's own assertions, read directly from the diff — this pass did not execute the suite.

**E86-I1a/I1b are no longer deferred.** The "not started" and "deferred" language in the original §4 below described the state as of commit `ae7b839` (15–22 August verification window) and is retained as a historical record of that snapshot; as of 22 September 2026 both items are complete per the above.

## 4. Deferred API work — historical, as of commit `ae7b839` (superseded — see §4a)

**E86-I1a (vendored-package upgrade into `investscape-api`) and E86-I1b (API route, API-owned Zod validation, allow-list response DTO) were, as of commit `ae7b839`, confirmed not started.** No version bump or tarball-publish artifact existed in this repository at that commit (publishing is a downstream step), and no route/schema/DTO work existed in `investscape-api` at that time (that repo separately confirmed to still vendor a pre-E86 package version with none of this surface present). **This is now historical — see §4a for the completed work as of 22 September 2026.**

## 5. Verification gap

**No consumer-boundary test currently proves deep imports are blocked.** All tests under `__tests__/cre-intelligence/` import directly from `../../src/cre-intelligence/...` (source-relative, internal), not via the package boundary or a package name — including tests that exercise `user-override`, `legacy-migration`, `soft-cost`, and `mapping` directly. The allow-list boundary described in §2 is verified through `package.json` configuration alone, not through an automated test that would catch a future regression in that configuration.

*End of Doc 77 · Companions: Doc 66 (repo-level engine map), Doc 76 (E85)*
