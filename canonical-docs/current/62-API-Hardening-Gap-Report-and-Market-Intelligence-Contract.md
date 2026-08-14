# InvestScape — Doc 62: API Hardening Gap Report & Market Intelligence Shared Contract

**Lighthouse Research Ltd. · 14 August 2026**
**Closes out Modular Prompt 01, steps 3–5 (gap report + MI contract). Part 3 is a proposal for Modular Prompt 02 to execute later — nothing in Part 3 is implemented by this document.**

**Repos audited, at these commits:**

| Repo | Branch | SHA | Note |
|---|---|---|---|
| investscape-api | master | `202c00a` | Phase 1 hardening already committed here; checkpoint tag `checkpoint-pre-phase1-hardening` at `dfb43e0` |
| investscape-calc-engine | master | `db21b34` | — |
| investscape-economic-engine | master | `c8bcae4` | — |
| investscape-tax-engine | master | `1c48971` | — |
| investscape-docs | master | `c6c0ef8` | this doc's parent commit |

**Method:** direct source inspection (route files, type files, package.json manifests) plus a small number of read-only verification commands (`tsc --noEmit` in `investscape-economic-engine`, live smoke-test evidence already gathered while verifying Phase 1). No engine math, no route files, and no already-hardened middleware were modified to produce this report — see §0 note on scope.

---

## 0. Summary

| § | Topic | Current state | Gap? | Severity |
|---|---|---|---|---|
| 2.1 | API integration tests | None for the HTTP layer; 53 test files exist across the 3 engine libs | Yes | Medium |
| 2.2 | Auth/authz | None on any of 54 endpoints | Yes | High (once deployed beyond localhost) |
| 2.3 | CORS policy | `cors()` with no options → `Access-Control-Allow-Origin: *` | Yes | Medium (High once auth exists) |
| 2.4 | Rate limiting | None | Yes | Medium |
| 2.5 | Request IDs / logging | Boot-time `console.log` only; Phase 1 added `console.error` on failures, no correlation ID | Yes | Low–Medium |
| 2.6 | Versioning strategy | No `/v1` prefix; engine package versions inconsistent (1.0.0 / 1.0.0 / 0.1.0) | Yes | Medium |
| 2.7 | Error envelope | Phase 1 fixed the *unhandled*-error and 404 paths; 3 incompatible shapes still coexist | Partially addressed, not closed | Medium |
| 2.8 | Entitlement enforcement | README + tax-engine header both assert "S1+ / S1–S3" tier gating; zero code enforces it anywhere | Yes | High (business-risk, not just technical) |
| 2.9 | Health/capabilities endpoint | `/health` returns `{status:"ok"}` only | Yes | Low–Medium |
| 2.10 | Engine/version metadata | Never surfaced through any response | Yes | Low–Medium |
| 2.11 | Shared provenance/confidence fields | Two incompatible vocabularies exist; no shared package unifies them | Yes | Medium–High (specifically blocks a clean MI contract) |
| 2.12 | Dependency DAG documentation | README's claimed DAG doesn't match reality — see finding below | Yes (docs defect) | Low, but informs Part 2 heavily |

**Note on scope:** this report evaluates `investscape-api` and the three engine libraries it wraps. It does not re-audit calculation correctness inside the engines (that was Doc 54's job) and does not touch `investscape-docs`' own numbering/versioning apparatus beyond adding this entry to `REGISTRY.md` per Doc 56's R2/R3.

---

## Part 1 — Gap Report

### 2.1 API integration tests

**Current state:** `investscape-api`'s own README says it plainly: *"No automated test suite currently exists in this repo (`npm test` has no script)."* Confirmed — `package.json` has no `test` script. By contrast, all three engine libraries do have Jest suites:

| Repo | Test files (`*.test.ts`) |
|---|---|
| investscape-calc-engine | 27 |
| investscape-economic-engine | 18 |
| investscape-tax-engine | 8 |

So calculation correctness has real coverage; the HTTP layer (routing, validation wiring, error-shape behavior, the new Phase 1 middleware) has none beyond the manual smoke tests run during Phase 1.

**Gap. Severity: Medium.** Nothing is currently broken, but every future change to routing/middleware (including Modular Prompt 02) will be verified by hand again unless this exists.

**Recommended fix:** `supertest` + Jest in `investscape-api`, covering: one representative route per engine family (financial/economic/tax), the Zod-failure 400 path, the new 404 handler, the new centralized error handler, and `/health`. Not done here — out of scope for this closeout.

---

### 2.2 Auth/authz

**Current state:** unchanged since Phase 1 — no authentication or authorization on any of the 54 endpoints. `investscape-api/README.md` states this explicitly: *"No authentication is currently implemented on any endpoint. All routes are open."*

**Gap. Severity: High** the moment this API is reachable from anywhere other than localhost; **not urgent** while it stays local-only.

**Recommended fix:** deferred by design — this was explicitly scoped out of Modular Prompt 01 Phase 1 and requires a product decision (API key vs. bearer/JWT vs. Supabase Auth session, given the WeWeb + Supabase migration target named in the orchestrator's product principles). Not decided here.

---

### 2.3 CORS policy

**Current state:** `investscape-api/src/index.ts` calls `app.use(cors())` with no configuration. Empirically confirmed during Phase 1 verification: `GET /health` returned `Access-Control-Allow-Origin: *`. This is the `cors` package's documented default when no `origin` option is passed — it reflects/allows every origin.

**Gap. Severity: Medium today, High once §2.2 (auth) lands** — an open-CORS + credentialed-auth combination is a standard misconfiguration; today it's low-risk only because there's nothing behind it worth protecting yet (no auth, no PII, deterministic calculators).

**Recommended fix:** an explicit origin allowlist, but the allowlist can't be written correctly until it's known what will call this API in production (WeWeb app domain? a future mobile client?). Deferred, same as §2.2.

---

### 2.4 Rate limiting

**Current state:** none. No `express-rate-limit` or equivalent in `package.json`. Phase 1 added an explicit `express.json({ limit: "100kb" })` body-size cap (previously implicit at Express's ~100KB default), which bounds payload size but does nothing about request *frequency*.

**Gap. Severity: Medium.** The engines are synchronous, in-process CPU work (no I/O), so a burst of requests degrades the single Node process directly — a real, if modest, DoS surface with the API currently open to the internet-equivalent of "anyone who has the URL."

**Recommended fix:** `express-rate-limit` (in-process) or a gateway-level limiter if this ends up behind a reverse proxy/CDN — the choice depends on the deployment model, which per the orchestrator's principles is deliberately not locked in yet (WeWeb + Supabase future, current prototype stage). Deferred.

---

### 2.5 Request IDs / logging

**Current state:** `src/index.ts` logs four lines at boot (`console.log`). Phase 1's new `errorHandler.ts` adds `console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}:`, err)` on failure paths only. There is no per-request access log (success or failure), no request-ID generation, and no correlation between a client-visible error and the corresponding server log line beyond method+path (which isn't unique under concurrent requests).

**Gap. Severity: Low–Medium.** Doesn't block anything today; becomes a real operability problem the moment there's more than one concurrent caller and something needs debugging in production, or once Market Intelligence adds slower, multi-engine composite calls where knowing *which* request produced *which* log line matters more.

**Recommended fix:** a request-ID middleware (generate or pass through `X-Request-Id`) plus structured request logging (`pino-http` or similar), with the ID echoed in both the log line and the error envelope's response body — natural to bundle with the error-envelope consolidation in §2.7.

---

### 2.6 Versioning strategy

**Current state:** two separate things are both unversioned:

1. **The HTTP contract itself** — no `/v1` prefix, no `Accept-Version` header, no version negotiation of any kind. Every route is mounted at a bare path (`/calculate/mortgage`, etc.) directly off the app root (`investscape-api/src/index.ts` → `app.use(router)`).
2. **The underlying engine packages** — `investscape-calc-engine` and `investscape-tax-engine` are both `1.0.0`; `investscape-economic-engine` is `0.1.0` (still pre-1.0 by its own package.json). None of these version numbers are surfaced anywhere in an API response (see §2.10).

Note: `investscape-docs`' own Doc 56 governs *document* versioning/numbering — a different, already-solved problem from *API contract* versioning, which has no equivalent convention.

**Gap. Severity: Medium.** Not urgent while the only consumer is the local prototype UX being actively co-developed with this API. Becomes expensive to retrofit the moment a real client (WeWeb frontend, or Market Intelligence itself as a new consumer) starts depending on today's exact response shapes — retrofitting a version prefix after callers exist means either a breaking change or permanent dual-routing.

**Recommended fix:** adopt a `/v1` prefix now, before §2.2/§2.3 and before Market Intelligence registration land — this is the single cheapest moment to do it, since no external client exists yet to break. Not done in this pass (would touch `routes/index.ts`'s mount point for all 54 routes — a real, if mechanical, change that needs its own authorized batch per the change-control rules, not folded into a docs-only closeout).

---

### 2.7 Error envelope — Phase 1 addressed part of this, not all of it

**Current state, precisely:** Phase 1 (commit `202c00a`) added a centralized error handler and a 404 handler. It did **not** touch any of the 54 route files. The result is that **three different, mutually incompatible error response shapes coexist in production today**:

| Path | Shape | Evidence |
|---|---|---|
| **Zod validation failure** (all 54 routes, always) | `{ "error": { "fieldErrors": {...}, "formErrors": [...] } }` | e.g. `investscape-api/src/routes/E1-mortgage.ts`: `res.status(400).json({ error: parseResult.error.flatten() })` |
| **Locally-caught engine/domain error** (21 of 54 routes — all economic + tax routes, plus `E7-cmhc.ts`) | `{ "error": "raw engine error message as a string" }` | e.g. `investscape-api/src/routes/E29-regional-macro-context.ts`: `res.status(400).json({ error: (error as Error).message })` |
| **Uncaught exception / malformed JSON / unknown route** (new in Phase 1) | `{ "error": { "message": "...", "detail"?: "..." } }` (500/400) or `{ "error": { "message": "Not found", "path": "..." } }` (404) | `investscape-api/src/middleware/errorHandler.ts`, `notFound.ts` |

All three are internally consistent on their own path, and Phase 1 correctly did not touch the first two — that was explicit scope (don't refactor unrelated route code). But a consumer (a frontend, or Market Intelligence) writing one generic "handle any InvestScape API error" function cannot do so today: `error` is sometimes an object with `fieldErrors`/`formErrors`, sometimes a bare string, sometimes an object with `message`/`detail`.

**Verdict: partially addressed, not closed.** The Phase 1 shape (`{error:{message, ...}}`) is the newest, most structured, and the right one to standardize on — but standardizing on it means editing the 21 routes that currently return raw strings, which is explicitly **not** authorized in this closeout (those are "unrelated route files" per this prompt's own constraint).

**Gap. Severity: Medium.** Doesn't break anything today (nothing currently depends on a uniform shape). Will directly bite the first real frontend integration or Market Intelligence's own error handling if not resolved before those depend on it.

**Recommended fix (for a future authorized batch, not this one):** retrofit the 21 locally-caught routes to `res.status(400).json({ error: { message: (error as Error).message } })` — a small, mechanical, one-line change per file, and leave the Zod-failure shape alone (it's a different, legitimately richer shape for a different purpose — field-level validation detail vs. a single message).

---

### 2.8 Entitlement enforcement

**Current state:** two documents in this codebase assert a tiered-access model exists, and no code anywhere enforces it:

- `investscape-api/README.md`: *"Usage requires a valid InvestScape tier (S1–S3)."*
- `investscape-tax-engine/src/taxTypes.ts` header: *"Use is restricted to licensed InvestScape subscribers (S1+). Unauthorized copying, distribution, or use is prohibited."*

Searched `investscape-api`, `investscape-calc-engine`, `investscape-economic-engine`, and `investscape-tax-engine` for any tier/license-key check, middleware, or field — none found. No request schema in `investscape-api/src/validation/*.ts` carries a tier or API-key field. No canonical doc in `investscape-docs/canonical-docs/current/` was found in this pass defining what S1/S2/S3 actually gate (flagging this as an open question rather than inventing semantics).

**Gap. Severity: High** — this is a business-risk gap, not just a technical one. The header text reads as a claim already made to (at minimum) future contributors/licensees per `investscape-tax-engine`'s CONTRIBUTING-equivalent framing; today it is aspirational, not enforced.

**Recommended fix:** blocked on a product decision (what do S1/S2/S3 actually gate — request volume? which engines? both?) before any enforcement code can be written correctly. Flag for the same product-decision pass as §2.2 (auth), since entitlement enforcement is naturally layered on top of authentication, not separate from it.

---

### 2.9 Health/capabilities endpoint

**Current state:** `GET /health` returns exactly `{"status":"ok"}` (`investscape-api/src/index.ts`). No engine inventory, no per-engine-family health, no build metadata.

**Gap. Severity: Low–Medium.** Fine for a liveness check today. Becomes more valuable once 4 engines + auth + entitlement are all live and something needs to answer "what's actually mounted and what version" — including the orchestrator's own **ADMINISTRATION MODE** requirement, which needs a reliable way to know what's available to simulate.

**Recommended fix:** extend `/health` into a small capabilities payload — engine families mounted, route count per family, and (once §2.10 is fixed) each engine package's version. Natural to build alongside Market Intelligence registration (Part 3), since that's the next time the mounted-engine list changes.

---

### 2.10 Engine/version metadata

**Current state:** confirmed no response from any of the 54 routes carries which engine or which version of it produced the result. The three engine packages do have real version numbers (`investscape-calc-engine` 1.0.0, `investscape-tax-engine` 1.0.0, `investscape-economic-engine` 0.1.0) but nothing in `investscape-api` reads or forwards them.

**Gap. Severity: Low–Medium** on its own; **directly blocks** the `engineVersion` field discussed in Part 2 below, since there is currently nothing at the API layer to source that value from.

**Recommended fix:** stamp engine package versions into the `/health` capabilities response from §2.9 as the first step; threading `engineVersion` into individual response envelopes is a larger, separate decision (see Part 2, §3.2).

---

### 2.11 Shared provenance/confidence fields — the central finding

This is the one the Market Intelligence contract in Part 2 depends on most, so it's covered in full here.

**Two incompatible provenance/confidence vocabularies already exist in this codebase**, built independently, with no shared type unifying them:

**Vocabulary A — `investscape-calc-engine`, E19 (Data Provenance), publicly exported today** via `src/index.ts`'s `export * from "./types"` → `types/index.ts` → `types/E19-data-provenance.types.ts`:

```ts
export type ProvenanceSource = "user_input" | "market_data" | "appraised" | "estimated" | "calculated";

export interface ProvenanceEntry {
  value: number;
  source: ProvenanceSource;
  confidence: number;        // 0.0-1.0
  lastUpdatedDate: string;   // ISO 8601
}

export type ConfidenceLabel = "High" | "Moderate" | "Low" | "Uncertain";

export interface TrackedField {
  fieldName: string;
  value: number;
  source: string;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  qualityScore: number;
  ageInDays: number;
}
```

This is genuinely **per-field**: every tracked input gets its own source, numeric confidence, derived label, quality score, and age. It is already a public export of `@investscape/calc-engine` — importable today, by anything, with no new work.

**Vocabulary B — `investscape-economic-engine`, used identically across `RegionMetrics`, `CityMetrics`, and `NeighborhoodMetrics`** (`src/types/region.types.ts`, `city.types.ts`, `neighborhood.types.ts`):

```ts
source: string;
confidence: 'high' | 'medium' | 'low';
```

This is applied to the **whole response bundle** (15–24 fields per type), not per field — one confidence label covers, e.g., population, median rent, days-on-market, and walk score together, regardless of whether they're equally reliable. Backed by `utils/constants.ts`:

```ts
export const CONFIDENCE_LEVELS = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as const;
export const DATA_FRESHNESS_TTL = { RATES: 7d, COMPS: 30d, DEMOGRAPHICS: 90d, MACRO: 14d } as const;
```

`DATA_FRESHNESS_TTL` is a real, if coarse, "period/freshness" concept — but it's category-level (four buckets), not per-field, and not exposed as staleness in any response; it appears to exist for the engine's own internal use.

**Neither vocabulary is shared.** `investscape-economic-engine`'s `package.json` has no `dependencies` entry for `@investscape/calc-engine` at all — it does not import Vocabulary A. It independently reinvented a strictly weaker version of the same concept.

**Gap. Severity: Medium–High, specifically for Market Intelligence.** MI's entire value proposition (ranking/discovery across many candidate geographies) needs a genuinely comparable confidence signal to sort and present. A 3-level per-bundle string can't distinguish "the rent number is solid but the school rating is a guess" — which matters a great deal once MI is synthesizing across E29–E45 outputs to rank opportunities. This is addressed directly in Part 2, §3.2.

---

### 2.12 Dependency DAG documentation defect (bonus finding)

`investscape-api/README.md` states: *"Dependency direction is a clean DAG: `investscape-api` → `investscape-economic-engine` → `investscape-calc-engine`, and `investscape-api` → `investscape-tax-engine`; no circular dependencies."*

This is **not what the code does.** `investscape-economic-engine/package.json` has no `dependencies` key referencing `@investscape/calc-engine`. Confirmed by inspection and by a clean `npx tsc --noEmit` run inside `investscape-economic-engine` standalone (no error resolving anything from `calc-engine`, because nothing in the compiled source path actually imports it as a package — see below).

The explanation is in the code itself — `investscape-economic-engine/src/E45-scenario-batch-processor.ts`, lines 28–41, verbatim:

> *"the original spec for this engine assumes it can call a pre-existing 'E1-E28' financial calc engine (a package named `@investscape/calc-engine`, declared in package.json but not actually published or present anywhere in this repo or on the npm registry). Per explicit direction, this engine instead implements minimal but correct versions of the needed financial math directly (mortgage payment and amortization for both Canadian semi-annual and US monthly compounding, NOI/cash flow, exit proceeds, and IRR via bisection), consistent with how E42-E44 are self-contained formula engines with no external dependency."*

So: **E42–E45 deliberately reimplement a subset of calc-engine's E1–E5 math independently**, by explicit past decision, at a time when `calc-engine` apparently wasn't available as a real dependency yet. It is now (it's a real, tested, sibling package with a working `file:` dependency pattern already proven in `investscape-api`). This duplication was reasonable when it was made and is **not being flagged as something to fix here** — no engine math is being touched in this closeout, per this prompt's own constraint — but it is exactly the failure mode Part 2's contract is designed to prevent Market Intelligence from repeating now that the excuse ("the package doesn't really exist") no longer applies.

**Gap. Severity: Low** (documentation accuracy) **but high relevance** to Part 2's design.

---

## Part 2 — Minimum Shared Contract for Market Intelligence (Engine #4)

### 3.1 The architectural boundary Market Intelligence must respect

`investscape-economic-engine` (E29–E45) already owns raw/normalized per-geography market data: regional macro context, city market analysis, neighborhood demographics, comparable sales, rental comps, school ratings, walkability/transit, market velocity, mortgage-rate forecasts, and (E42) a composite neighborhood investment score synthesizing several of the above. All 16 non-excluded engines (E36 held back pending legal review) are already exposed through `investscape-api`.

Per the orchestrator's own stated intent for Engine #4 (*"Find Investment Opportunities → Market Intelligence map + discovery wizard"*), MI's job is **discovery**: given a search area or criteria, rank/score/interpret candidate geographies (and potentially listings), synthesizing across E29–E45 and possibly E1–E28 (deal feasibility) and E46–E53 (tax feasibility). That is a different shape of problem from what E29–E35 do (return one typed metrics bundle for one known geography) — it's closer to what **E42 already does** (aggregate several inputs into a composite score with a factor breakdown, grade, recommendation, risk level, and completeness accounting), just generalized to rank *many* candidates instead of scoring *one*.

**The concrete rule, stated plainly:** Market Intelligence must depend on `@investscape/economic-engine` (and `@investscape/calc-engine` where deal-level math is needed) as real npm dependencies — the same `file:` pattern `investscape-api` already uses for all three existing engines — and call `regionalMacroContext`, `cityMarketAnalysis`, `neighborhoodDemographics`, `comparableSalesAnalysis`, `rentalCompEngine`, `schoolRatingEngine`, `walkabilityTransitScorer`, `marketVelocityAnalyzer`, `neighborhoodInvestmentScore`, etc. directly. It must **not** re-derive cap rates, demographics, walkability, or any other metric E29–E45 already computes. §2.12 documents the one place in this codebase where that rule was already broken (E45 reimplementing E1–E5's math) — that was made under different constraints and is not being relitigated here, but it is the reason this rule is being stated explicitly now rather than left implicit.

### 3.2 Reconciling `AnalysisMetric<T>` against what actually exists

The conceptual envelope named in the prompt (`id, engineId, domain, label, value, unit, status, interpretation, benchmark, confidence, geography, period, provenance, assumptions, methodologyRef, engineVersion, warnings, visualizationHints`) does not match any single existing type in this codebase. Field-by-field reconciliation:

| Field | Exists today? | Where | Verdict |
|---|---|---|---|
| `id` | No | — | **New.** Needed because MI emits a *list* of ranked results; existing engines return one bundle per call, so nothing needed a metric-level id before. |
| `engineId` | Yes, informally | The `E{number}` convention used throughout code, comments, README, and docs (`E29`, `E42`, etc.) | **Adopt**, typed against the existing `E${number}` string convention rather than inventing a new id scheme. |
| `domain` | Partially | Implicit in economic-engine's three type files (`RegionMetrics`/`CityMetrics`/`NeighborhoodMetrics`) | **Adopt** as `'region' \| 'city' \| 'neighborhood'`, extended only if MI genuinely needs `'property'` or `'portfolio'` — don't invent categories the existing hierarchy doesn't have evidence for. |
| `label` | No | Economic-engine fields are typed properties (`gdpGrowth: number`), not labeled metric objects | **New**, MI-only — needed specifically because MI must genericize across heterogeneous source fields for display; existing typed-bundle consumers don't need this (TypeScript field names already serve that role for them). |
| `value` / `unit` | Partially | Every numeric field in Region/City/NeighborhoodMetrics *is* a value; `unit` is a comment (`// Annual %`), never a real field | **Adopt for MI's own output only.** Do **not** retrofit `unit` onto economic-engine's 40+ existing numeric fields — that's a breaking change to a shipped, tested package with zero evidence it's needed there. |
| `status` | No direct precedent | Closest analogs: E42's `grade: 'A'-'F'` and `riskLevel: 'low'\|'moderate'\|'high'` | **Adopt, but the exact enum needs a product decision** — model it after E42's precedent rather than an unspecified generic status. **Open decision for Prompt 02**, not resolved here. |
| `interpretation` | Yes, under different names | E42's `rationale` (per-factor) and `recommendation` (composite); calc-engine E19's `summary` | **Adopt**, but check MI's own already-approved master prompt for whether it already commits to the word `interpretation` — if so keep it; if not, prefer reusing `rationale`/`recommendation` to avoid a fourth near-synonym. |
| `benchmark` | No | Not found anywhere in calc-engine, economic-engine, or tax-engine | **Genuinely new.** Needs a product definition (benchmark against city median? historical trailing average? peer neighborhoods?) before Prompt 02 can implement it — flagged, not decided. |
| `confidence` | Yes — see §2.11 | Two incompatible versions exist | **Adopt calc-engine's `ConfidenceLabel` (4-level) + numeric `confidence: number` (0–1) from Vocabulary A, not economic-engine's 3-level string.** It's richer, already publicly exported, and importing it creates no new problematic coupling (calc-engine has no dependencies of its own). Do not invent a third vocabulary. |
| `geography` | Yes | `regionId`/`cityId`/`neighborhoodId` + `{lat, lng}` coordinates, identical shape reused across all three economic-engine metric types | **Adopt the existing id/name/coordinates shape exactly**, so an MI result can be joined back to the exact economic-engine query that produced it — don't invent a new free-form geography bag. |
| `period` | Yes, partially | `asOfDate: Date` (all three economic-engine types) + category-level `DATA_FRESHNESS_TTL` (7/14/30/90-day bands) | **Adopt `asOfDate` naming** for consistency; consider surfacing the existing TTL bands as a `stalenessBand` rather than reinventing freshness math. |
| `provenance` | Yes — see §2.11 | calc-engine's `TrackedField`/`ProvenanceEntry`/`ProvenanceSource`, far richer than economic-engine's flat `source: string` | **Adopt calc-engine's per-field provenance shape**, same reasoning as `confidence`. |
| `assumptions` | Yes, under different names | E42's `missingInputs: string[]` / `completenessScore`; calc-engine's `recommendedActions: string[]` | **Adopt**, modeled on these two existing "what's missing/assumed" patterns rather than a new shape. |
| `methodologyRef` | No | No engine currently links to a methodology document | **New.** Recommend pointing at this codebase's own real, git-tracked methodology doc set (`investscape-docs`, e.g. `"Doc 33"` or `"E42"`) rather than a free-form string — the infrastructure to make this a real, checkable reference already exists. |
| `engineVersion` | No | Blocked on §2.10 | **New, sequenced after §2.10's fix** (health/capabilities endpoint stamping package versions) — nothing to source this value from until that lands. |
| `warnings` | Yes, under different names | calc-engine's `recommendedActions`; E42's `missingInputs` | **Adopt, but pick one vocabulary** — don't ship a fourth near-synonym alongside `recommendedActions`/`missingInputs`/`assumptions`. |
| `visualizationHints` | No | E27 (`generateChartData`) produces literal chart-ready arrays (`BarChartData`/`LineChartData`), not generic rendering hints, and is calc-engine-specific | **Genuinely new, and premature.** Per the orchestrator's own locked execution order, UX redesign happens only *after* all four engines are established — recommend deferring this field until the actual MI map/visualization component exists and its real needs are known, rather than guessing a shape now. |

### 3.3 Net recommendation

**Do not** adopt `AnalysisMetric<T>` as a literal universal envelope retrofitted onto the 54 existing endpoints' response shapes. That would be exactly the "invent a replacement architecture without evidence" move the orchestrator's locked execution order prohibits, and it would be a breaking change to three shipped, independently-tested packages with no product evidence they need it.

**Instead:** define a new type — call it `MIOpportunityMetric<T>` pending whatever name MI's own already-approved master prompt uses — that lives **only** in the new Market Intelligence package. It is a synthesis, not an invention:

- `engineId`, `domain`, `geography`, `period` — reuse economic-engine's existing conventions.
- `confidence`, `provenance` — reuse calc-engine's existing, richer, already-exported vocabulary (not economic-engine's).
- `assumptions`/`warnings` — reuse the existing `missingInputs`/`recommendedActions` pattern under one chosen name.
- `methodologyRef` — point at `investscape-docs`' real registry.
- `id`, `label`, `value`, `unit`, `status`, `interpretation`, `benchmark`, `visualizationHints`, `engineVersion` — genuinely new fields, scoped to MI's own output, several with open product decisions flagged above rather than guessed at here.

This satisfies the prompt's requirement directly: it is concretely defined against real field names and types in this repo, not a copy-paste of the conceptual envelope.

---

## Part 3 — Proposed Modular Prompt 02 file/route list (proposal only — nothing below is implemented)

### New repository: `investscape-market-intelligence-engine`

Sibling to the other three engine repos, same `file:` dependency pattern already proven in `investscape-api`.

| File | Purpose |
|---|---|
| `package.json` | `name: "@investscape/market-intelligence-engine"`; `dependencies`: `@investscape/economic-engine` and `@investscape/calc-engine` via `file:../investscape-economic-engine` / `file:../investscape-calc-engine` (real dependencies this time — not E45's abandoned-and-reimplemented pattern from §2.12) |
| `src/types/opportunity.types.ts` | `MIOpportunityMetric<T>` per §3.3; `MIConfidence` (re-exported/aliased from `@investscape/calc-engine`'s `ConfidenceLabel`/`ProvenanceSource`, not reinvented); `MIGeography` (re-exported from economic-engine's existing id/name/coordinates shape) |
| `src/index.ts` | Public export surface, same convention as the other three engines |
| *(MI's own internal engines, E-numbers, and business logic)* | Out of scope for this list — governed by MI's own separately-approved master prompt, not this document. This list covers only the **integration seam** with `investscape-api` and the existing engines. |

### `investscape-api` additions (additive only — no existing route touched)

| File | Purpose |
|---|---|
| `src/routes/market-intelligence/*.ts` | One file per MI endpoint, following the existing Zod-validate → try/catch → respond pattern used by the 21 economic/tax routes today — but using the **new** Phase 1 error envelope (`{error:{message}}`) from the start, since this will be the first genuinely new route family added since Phase 1 landed |
| `src/validation/market-intelligence-schemas.ts` | New Zod schemas, following `economic-schemas.ts`/`tax-schemas.ts` conventions |
| `src/routes/index.ts` | Additive edit: import and `router.use()` the new MI routers alongside the existing 54 |
| `src/index.ts` | Additive edit: extend the boot-time `console.log` summary and (per §2.9's recommended fix, if it has landed by then) the `/health` capabilities payload to include MI |

### `investscape-docs` additions

| File | Purpose |
|---|---|
| `canonical-docs/current/63-*.md` (next append-only number at time of writing) | Documents MI's exposed routes, mirroring `investscape-api/README.md`'s own endpoint-table style |
| `canonical-docs/REGISTRY.md` | New row added in the same commit, per Doc 56 R2/R3 |

### Explicit non-goals for Modular Prompt 02 (guardrails carried forward from this report)

- Do not modify `investscape-economic-engine` or `investscape-calc-engine`'s existing exported types or function signatures — additive exports only, if MI needs something not yet exported.
- Do not change route paths or response shapes for any of the 54 existing `investscape-api` endpoints.
- Do not implement §2.2 (auth), §2.3 (CORS allowlist), or §2.4 (rate limiting) as part of MI registration — those remain separately gated, product-decision-blocked items per this report.
- Do not retrofit the §2.7 error-envelope fix onto the 21 already-existing locally-caught routes as a side effect of adding MI's routes — that's a separate, explicitly scoped batch if and when authorized.

---

## Completion

- **Files changed by this closeout:** this document (`62-API-Hardening-Gap-Report-and-Market-Intelligence-Contract.md`) and `REGISTRY.md`, both in `investscape-docs`. Docs-only, as expected — no code in `investscape-api`, `investscape-calc-engine`, `investscape-economic-engine`, or `investscape-tax-engine` was modified.
- **No engine math and no already-hardened middleware files were touched.** `errorHandler.ts`, `notFound.ts`, and `src/index.ts` in `investscape-api` remain exactly as committed at `202c00a`.
- **Referenced checkpoint/commit IDs:** `investscape-api` commit `202c00a` (Phase 1 hardening), checkpoint tag `checkpoint-pre-phase1-hardening` at `dfb43e0`.

*End of Doc 62.*
