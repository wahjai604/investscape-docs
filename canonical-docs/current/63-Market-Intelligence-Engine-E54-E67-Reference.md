# InvestScape — Doc 63: Market Intelligence & Statistical Risk Engine (E54–E67) Reference

**Lighthouse Research Ltd. · 14 August 2026**
**Companion to Doc 62 (API Hardening Gap Report and Market Intelligence Contract), which this doc's E-numbers were proposed against.**

**Update, same day:** §3's table and §0's commit reference below were extended after the original E54–E67 pass to cover a Phase 2 scaffold-completeness fix (regression/back-testing/portfolio-covariance interfaces added at commit `880b6dd`). §1's numbering rule is unchanged and still applies to the new contracts — see §3.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-market-intelligence-engine
**Commit documented (E54–E67, §2):** `4c945f2c1bc9173f5ac8094fbae6aed2a6663d59` (`4c945f2`), branch `master`.
**Commit documented (Phase 2 scaffold additions, §3):** `880b6dd30d4beb7b412ba03c08af0c9819094c58` (`880b6dd`), branch `master` — pushed and confirmed present on `origin/master` at time of writing.

Every export listed below was verified directly against the relevant commit's source (`grep`'d for `export function`/`export const` in each file, not copied from a prior spec or plan) before this doc was written or updated.

## 1. Numbering convention

One E-number per cohesive **file**, matching the existing E19/E29/E45-style convention across `investscape-calc-engine`/`investscape-economic-engine` — not one E-number per exported function. `statistical-risk/types.ts` and `market-intelligence/domain.ts` are **not numbered**: they're types-only support files, matching the existing convention of not numbering `common.types.ts`/similar pure-support files elsewhere in the codebase. `statistical-risk/phase2-contracts.ts` and `market-intelligence/phase2-contracts.ts` are **not numbered** either — both are interfaces only; their `run*()` functions throw immediately rather than compute anything (`"Phase 2 not implemented..."`), so they're listed in §3 as reserved rather than assigned real E-numbers for unimplemented code.

E54 continues directly from E53 (the last tax-engine number, `investscape-tax-engine`), per the append-only convention Doc 56 established for `investscape-docs` itself and extended here to engine numbering.

## 2. E54–E67

| E# | File | Capability | Key exports |
|---|---|---|---|
| E54 | `statistical-risk/descriptive.ts` | Descriptive Statistics | `mean`, `median`, `min`, `max`, `range`, `quantile` (R-7), `percentileRank`, `quartiles` |
| E55 | `statistical-risk/dispersion.ts` | Dispersion & Variability | `variance`, `standardDeviation`, `coefficientOfVariation` |
| E56 | `statistical-risk/growth.ts` | Growth & Trend Math | `periodChange`, `cagr`, `rollingMean`, `rollingGrowth`, `indexSeries` |
| E57 | `statistical-risk/outliers.ts` | Outlier Detection | `zScore`, `zScores`, `iqrBounds`, `detectOutliersByIQR` |
| E58 | `statistical-risk/correlation.ts` | Correlation | `pearsonCorrelation` |
| E59 | `statistical-risk/weighted.ts` | Weighted Mean | `weightedMean` |
| E60 | `market-intelligence/comparability.ts` | Comparability Validation | `checkComparability`, `checkSeriesComparability` |
| E61 | `market-intelligence/geography.ts` | Geography Reconciliation | `wrapRegionGeography`, `wrapCityGeography`, `wrapNeighborhoodGeography`, `unwrapEconomicEngineGeography`, `countryCodeForRegionId` |
| E62 | `market-intelligence/trends.ts` | Market Trend Analysis | `sortByPeriod`, `periodOverPeriodSeries`, `cagrOverSeries`, `rollingMeanOverSeries`, `rollingGrowthOverSeries`, `indexedObservationSeries` |
| E63 | `market-intelligence/benchmarking.ts` | Benchmark Comparison | `benchmarkSubject` |
| E64 | `market-intelligence/data-quality.ts` | Data Quality Assessment | `assessDataQuality`, `sourceTypeToProvenanceSource` (also exports the constants `NOT_ENOUGH_DATA_ISSUE_CODE`, `DEFAULT_DATA_QUALITY_WEIGHTS`) |
| E65 | `market-intelligence/economic-engine-adapters.ts` | Economic Engine Data Adapter | `fetchRegionObservations`, `fetchCityObservations`, `fetchNeighborhoodObservations`, `freshnessScoreFor` |
| E66 | `market-intelligence/service.ts` | Neighborhood Snapshot / Orchestration Service | `buildNeighborhoodSnapshot`, `benchmarkNeighborhoodMetric` |
| E67 | `visualization/apex-adapter.ts` | MI Visualization Adapter | `buildChartMetadata`, `trendToLineChart`, `forecastToRangeArea`, `distributionToBoxPlot`, `outcomesToHistogram`, `relationshipToScatter`, `sensitivityToHeatmap`, `benchmarkToBar`, `scenariosToMultiSeriesLine`, `geographyToChoropleth`, `concentrationToTreemap` |

**Note on E67 specifically:** `forecastToRangeArea` reshapes a `ForecastResult` (the Phase 2 contract from §3) into a chart view model. The adapter function itself is fully implemented and tested today — it's a pure reshape with no dependency on `runForecast()` actually running — but it can only be exercised against a hand-built `ForecastResult` until Phase 2 exists, since nothing currently produces one.

## 3. Reserved, not yet implemented (Phase 2 — no E-number assigned)

| File | Contents | Status |
|---|---|---|
| `statistical-risk/phase2-contracts.ts` | `MonteCarloRequest`, `ProbabilityResult`, `runMonteCarloSimulation()` | Typed interfaces only. `runMonteCarloSimulation()` throws `"Phase 2 not implemented..."` immediately. |
| `statistical-risk/phase2-contracts.ts` | `PortfolioCovarianceRequest`, `PortfolioCovarianceResult`, `runPortfolioCovarianceAnalysis()` | Typed interfaces only, added at `880b6dd`. Flagged **"PHASE 2+"** in its own doc comment — the master spec's own Phase Scope Matrix marks portfolio covariance/correlation risk one notch further out than the rest of Phase 2. `runPortfolioCovarianceAnalysis()` throws `"Phase 2+ not implemented..."` (distinct message from the other five `run*()` functions, deliberately). Kept generic (`series: Record<string, number[]>`) rather than `MarketObservation`-typed — a documented placement exception, see the file's own doc comment for why. |
| `market-intelligence/phase2-contracts.ts` | `ForecastRequest`, `ForecastPoint`, `ForecastResult`, `runForecast()` | Typed interfaces only. `runForecast()` throws `"Phase 2 not implemented..."` immediately. |
| `market-intelligence/phase2-contracts.ts` | `RegressionRequest`, `RegressionCoefficient`, `ModelDiagnostics`, `RegressionResult`, `runRegression()` | Typed interfaces only, added at `880b6dd`. Closes a scaffold gap a completeness audit found against the master spec's Section 13. The spec gives a category ("regression models") rather than a code block for `ModelDiagnostics` — its field names (`rSquared`, `adjustedRSquared`, `standardError`, `sampleSize`, `coefficients`, `residualDiagnostics`) are a documented judgment call, not a spec transcription (see `docs/README.md` §8 in the source repo). `runRegression()` throws `"Phase 2 not implemented..."` immediately. |
| `market-intelligence/phase2-contracts.ts` | `BacktestRequest`, `BacktestDiagnostics`, `runBacktest()` | Typed interfaces only, added at `880b6dd`. A separate interface from `ModelDiagnostics` since back-testing validates predictions against held-out actuals for either a forecast or a regression fit. MAE/RMSE/MAPE/coverage fields per the parent Master Implementation Blueprint's release-gate language. `runBacktest()` throws `"Phase 2 not implemented..."` immediately. |

E-numbers will be assigned when these are actually implemented, not before — consistent with §1's rule against numbering unimplemented code. This now applies to five reserved contract groups across the two files, not two.

## 4. Not registered behind `investscape-api`

E54–E67 exist only in `investscape-market-intelligence-engine`. `investscape-api` (commit `202c00a`, its most recent hardening pass) has **not** been modified to expose any of them — no new routes, no new dependency on this package. Registration is Modular Prompt 02's job (proposed file/route list: Doc 62 Part 3), and Doc 62 §3.3 already flags that Prompt 02 itself is blocked on two open product decisions (`MIOpportunityMetric<T>`'s `status` and `benchmark` field semantics) before the API-facing envelope can be assembled. See `investscape-api/README.md`'s Scope section for the corresponding one-line pointer.

*End of Doc 63 · Companion: Doc 62*
