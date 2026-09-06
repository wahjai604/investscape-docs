# InvestScape — Doc 74: Market Intelligence API Routes

**Lighthouse Research Ltd. · 6 September 2026**
**Executes investscape-docs Doc 62 Part 3 ("Modular Prompt 02") — registers `@investscape/market-intelligence-engine` (E54–E67) behind `investscape-api`. Companion: Doc 62, Doc 63.**

## 0. What this doc covers

Doc 62 closed out the gap report and proposed a file/route list for a later batch (Part 3). This doc documents that batch as executed: `MIOpportunityMetric<T>` (the shared type contract), and the new `/v1/calculate/market-intelligence/*` routes that make `@investscape/market-intelligence-engine`'s E54–E67 math reachable over HTTP.

**Non-goals, unchanged from Doc 62 Part 3:** no auth, no CORS allowlist, no rate limiting, no retrofit of the §2.7 error-envelope fix onto the 21 pre-existing locally-caught routes, and no real `MarketObservation` data behind any of this — MI's own math has zero real market data wired up. This is the integration seam only.

## 1. `MIOpportunityMetric<T>`

Defined in `investscape-market-intelligence-engine/src/types/opportunity.types.ts`, exported from the package root as `opportunityTypes`. Per Doc 62 §3.3, this is a synthesis against real field names in this codebase, not the literal `AnalysisMetric<T>` envelope originally proposed. Two product decisions, made outside this doc and implemented here:

- **`status`**: `MIStatus = NeighborhoodInvestmentScoreOutput["grade"]` — an alias (via indexed access) of E42 (`neighborhoodInvestmentScore`, `investscape-economic-engine`)'s existing `'A'|'B'|'C'|'D'|'F'` grade. `NeighborhoodInvestmentScoreOutput` is now an additive type export from `investscape-economic-engine`'s package root (it previously was not).
- **`benchmark`**: `MIBenchmark = MIPeerCohortBenchmark`, `{ benchmarkType: 'peer_cohort'; cohortMedian: number; percentileRank: number; cohortSize: number; cohortLabel: string }`. `percentileRank` is a 0–1 fraction, matching this package's own `percentileRank()` (`statistical-risk/descriptive.ts`), not a 0–100 scale.

`MIConfidence` aliases calc-engine's `ConfidenceLabel`; `MIGeography` aliases MI's own `GeographyRef` (`market-intelligence/domain.ts`), which is itself the existing wrapper/superset of economic-engine's regionId/cityId/neighborhoodId + `{lat,lng}` shape. `provenance` reuses calc-engine's `ProvenanceEntry[]`. `warnings` reuses the existing missingInputs/recommendedActions string-array pattern under one name. `engineVersion` is optional and unpopulated — blocked on Doc 62 §2.10's health/capabilities endpoint, which does not exist yet.

## 2. Routes

All routes are mounted under `/v1` (same as every other engine family) and use the `{ error: { message } }` envelope for both the Zod-validation-failure and locally-caught-error paths — the same convention already used by `src/routes/us-qualifier/*`, not the older raw-string/`.flatten()` shapes used by the 21 pre-existing economic/tax routes (Doc 62 §2.7; those are not retrofitted).

| Method | Path | Engine | Calls |
|---|---|---|---|
| POST | `/v1/calculate/market-intelligence/comparability` | E60 | `checkComparability` |
| POST | `/v1/calculate/market-intelligence/series-comparability` | E60 | `checkSeriesComparability` |
| POST | `/v1/calculate/market-intelligence/wrap-region-geography` | E61 | `wrapRegionGeography` |
| POST | `/v1/calculate/market-intelligence/wrap-city-geography` | E61 | `wrapCityGeography` |
| POST | `/v1/calculate/market-intelligence/wrap-neighborhood-geography` | E61 | `wrapNeighborhoodGeography` |
| POST | `/v1/calculate/market-intelligence/unwrap-geography` | E61 | `unwrapEconomicEngineGeography` |
| POST | `/v1/calculate/market-intelligence/country-code-for-region` | E61 | `countryCodeForRegionId` |
| POST | `/v1/calculate/market-intelligence/period-over-period` | E62 | `periodOverPeriodSeries` |
| POST | `/v1/calculate/market-intelligence/cagr-over-series` | E62 | `cagrOverSeries` |
| POST | `/v1/calculate/market-intelligence/rolling-mean` | E62 | `rollingMeanOverSeries` |
| POST | `/v1/calculate/market-intelligence/rolling-growth` | E62 | `rollingGrowthOverSeries` |
| POST | `/v1/calculate/market-intelligence/indexed-series` | E62 | `indexedObservationSeries` |
| POST | `/v1/calculate/market-intelligence/benchmark-subject` | E63 | `benchmarkSubject` |
| POST | `/v1/calculate/market-intelligence/data-quality` | E64 | `assessDataQuality` |
| POST | `/v1/calculate/market-intelligence/region-observations` | E65 | `fetchRegionObservations` |
| POST | `/v1/calculate/market-intelligence/city-observations` | E65 | `fetchCityObservations` |
| POST | `/v1/calculate/market-intelligence/neighborhood-observations` | E65 | `fetchNeighborhoodObservations` |
| POST | `/v1/calculate/market-intelligence/neighborhood-snapshot` | E66 | `buildNeighborhoodSnapshot` |
| POST | `/v1/calculate/market-intelligence/benchmark-neighborhood-metric` | E66 | `benchmarkNeighborhoodMetric` |

**18 routes.** E67 (`visualization/apex-adapter.ts`, chart view-model reshaping) is not registered here — it's a rendering helper, not a discovery/ranking endpoint, and Doc 62 §3.2 flags `visualizationHints` as premature pending a real consuming UI. `phase2-contracts.ts` in both `statistical-risk/` and `market-intelligence/` is not registered — every function in it throws immediately (not implemented), consistent with Doc 63 §1's rule against numbering/exposing unimplemented code.

## 3. Validation

`investscape-api/src/validation/market-intelligence-schemas.ts` — Zod schemas following `economic-schemas.ts`/`tax-schemas.ts`/`schemas.ts` conventions. `DataQualityInputs`'s five 0–1 fields (`completeness`, `freshness`, `sampleAdequacy`, `geographicFit`, `segmentSimilarity`, `sourceReliability`) are all `z.number().min(0).max(1)`, matching this codebase's `*Percent`-field convention even though none of these field names end in "Percent" — the underlying package's own doc comments specify the 0–1 range directly. `percentileRank` is likewise `z.number().min(0).max(1)` per §1 above, not `z.number().min(0).max(100)`.

## 4. What did not change

No existing route, path, or response shape among the 54 pre-existing `investscape-api` endpoints changed. No exported type or function signature in `investscape-calc-engine` or `investscape-tax-engine` changed. `investscape-economic-engine` gained exactly one additive export (`NeighborhoodInvestmentScoreOutput`, from its existing `E42-neighborhood-investment-score.ts`) — no existing export was modified.

*End of Doc 74 · Companions: Doc 62, Doc 63*
