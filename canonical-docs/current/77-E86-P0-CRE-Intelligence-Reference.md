# InvestScape — Doc 77: E86 P0 CRE Intelligence Narrow Public Surface Reference

**Lighthouse Research Ltd. · 22 September 2026**
**No companion proposal doc.** This doc registers E86-P0's exact, narrow public runtime surface and the allow-list mechanism enforcing it, for engineers planning the deferred `investscape-api` integration (E86-I1a/I1b).

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

**Exactly four runtime functions:**

- `capRateConsensus`
- `weightedConsensus`
- `selectCapRateBenchmark`
- `selectHardCostBenchmark`

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

## 4. Deferred API work — not started

**E86-I1a (vendored-package upgrade into `investscape-api`) and E86-I1b (API route, API-owned Zod validation, allow-list response DTO) are both confirmed not started.** No version bump or tarball-publish artifact exists in this repository (publishing is a downstream step), and no route/schema/DTO work exists here (that work belongs to `investscape-api`, separately confirmed to still vendor a pre-E86 package version with none of this surface present). Neither item should be described as partial, scaffolded, or complete.

## 5. Verification gap

**No consumer-boundary test currently proves deep imports are blocked.** All tests under `__tests__/cre-intelligence/` import directly from `../../src/cre-intelligence/...` (source-relative, internal), not via the package boundary or a package name — including tests that exercise `user-override`, `legacy-migration`, `soft-cost`, and `mapping` directly. The allow-list boundary described in §2 is verified through `package.json` configuration alone, not through an automated test that would catch a future regression in that configuration.

*End of Doc 77 · Companions: Doc 66 (repo-level engine map), Doc 76 (E85)*
