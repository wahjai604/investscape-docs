# InvestScape — Doc 54: Engine Reconciliation (Claude Design ↔ TypeScript Calc Engine ↔ External Validation)

**Strictly additive. Read-only audit, report-only convention per Doc 17 — nothing in this document changes any build artifact.**

Parent documents: MVP Readiness C-Level Audit (Tables A, C, D), 01-Formula-Engine-Specification.md, 06-Commercial-Formula-Library.md + Addendum A, 52-Route2-Simplification-Post-Pivot.md, 53-WeWeb-Supabase-Integration-Audit.md.

**Date of this pass:** 31 July 2026
**Calc engine state audited:** commit following "portfolio rollup engine — complete calc engine suite, 33 golden tests passing", repo `github.com/wahjai604/investscape-calc-engine`

---

## 0. The finding that reframes everything else

The Claude Design prototype and the TypeScript calc engine are **two independent implementations of the same specification, sharing zero code.**

Six build sessions in TypeScript did not make the Claude Design prototype more correct, and the Claude Design prototype does not validate the TypeScript engine. They are divergent implementations — the precise drift condition the decided-vs-built discipline exists to prevent.

**The direction of the gap is the opposite of what might be assumed.** The TypeScript engine is currently a *subset* of Claude Design's engine coverage, not a superset. Six engines exist in Claude Design and nowhere in TypeScript (E1 partial, E5, E6, E7, E8, E10). The remaining work is therefore substantially a **port**, not a greenfield build — and it is considerably larger than the six sessions completed so far.

---

## 1. Table A reconciliation — all 25 engines, three columns

Column definitions:

- **Claude Design** — status in the HTML/JS prototype, carried forward from Table A and updated where later build sessions (5c–5f) changed it.
- **TypeScript** — status in `investscape-calc-engine`, as built.
- **Externally validated** — whether the expected value in the test suite was established against an authority *outside* the code that produces it. Self-computed expected values are marked ✗ regardless of whether the test passes.

| # | Engine | Claude Design | TypeScript | Ext. validated |
|---|---|---|---|---|
| E1 | Core metric engine (NOI, cash flow, CoC, cap rate, DSCR, GRM, break-even) | Built & verified (F-401–F-505) | **Partial** — NOI, cash flow, DSCR only. CoC, cap rate, GRM, break-even absent | ✗ |
| E2 | CA semi-annual / US monthly compounding | Built, FCAC-validated, per-tranche (5c) | **Partial** — single-loan only, not per-tranche | ✓ **CA payment vs FCAC**; US vs textbook |
| E3 | Financing Qualifier (GDS/TDS, stress test, max-affordability solver, CMHC premium) | Built (1b) | **Partial** — GDS/TDS ✓, stress test ✓, CMHC ✓; max-affordability solver absent | Partial — CMHC bands arithmetically checkable; GDS/TDS self-derived |
| E4 | Multi-tranche capital stack, weighted cost of debt | Built (1c), VTB/bridge/mezz presets, dual-chair VTB | **Thin** — `amount × rate` simple interest. No amortization, no per-tranche terms, no per-tranche country convention. Blended cost omits tax shield → does not match F-102 | ✗ |
| E5 | PTT / transfer-tax bracket engine | Built, admin-editable | **Absent** | — |
| E6 | Quick Proforma live calc `qp()` | Built, ±0.1% vs Gilley | **Absent** | — |
| E7 | Break-even solver | Built | **Absent** | — |
| E8 | Per-tranche amortization schedule | **Built (5d)** — was ABSENT at audit date | **Absent** — `mortgage.ts` returns a payment, not a schedule. No principal/interest split, no remaining balance | — |
| E9 | Multi-period hold-period cash-flow projection | **Built (5e)** — was ABSENT at audit date | **Built, simplified** — rent/opex compound independently; debt service held flat, no principal/interest decomposition (blocked on E8) | ✗ |
| E10 | Exit / reversion engine (exit cap, selling costs, loan payoff, net proceeds) | **Built (5e)** — was ABSENT at audit date | **Absent as an engine.** `returns.ts` accepts `exitValue` as a raw input. The single largest IRR driver is user-supplied, not computed | — |
| E11 | Portfolio rollup engine | **Unconfirmed** — 5f sequenced but not verified built | **Built, DERIVED-THIN** — see §2. Blended IRR is mathematically incorrect | ✗ |
| E12 | Scenario / sensitivity on acquisition side | Absent | **Absent** | — |
| E13 | Rent roll / unit-level engine (multifamily) | Likely display-only | **Absent** | — |
| E14 | Lease-level engine (recoveries, steps, rollover) | Absent — recommended to stay absent (P4) | **Absent** — correct | — |
| E15 | Refinance / BRRRR | Absent | **Absent** | — |
| E16 | Flip engine | Absent | **Absent** | — |
| E17 | Tax / after-tax cash flow | Absent | **Absent** — every TypeScript return figure is likewise pre-tax and unlabelled (see P5) | — |
| E18 | FX / currency engine with as-of stamping | Schema built (Doc 15), engine unverified | **Absent** | — |
| E19 | Data provenance D1/D2/D3 + as-of stamping + pin/override | Specced, not built | **Absent** — and not yet reflected in any input type signature | — |
| E20 | Grade / scorecard rubric | Unverified — real engine or static unknown | **Absent** | — |
| E21 | Calc-version stamping on outputs/exports | Absent | **Absent — but newly feasible.** See §4 | — |
| E22 | Presale gate (F-712) + full-model gate logic | Prompt written, execution unconfirmed | **Absent** | — |
| E23 | Take-out / permanent financing | Absent | **Absent** | — |
| E24 | Absorption / sales pace | Absent (deferred) | **Absent** (deferred) | — |
| E25 | Quick Proforma: mortgage amount, unit mix | Absent (deferred) | **Absent** (deferred) | — |

### Counts — TypeScript calc engine

| Classification | Count | Engines |
|---|---|---|
| Built, externally validated | **1** | E2 (single-loan scope only) |
| Built, self-validated only | **3** | E1 (partial), E3 (partial), E9 (simplified) |
| Built but thin or incorrect | **2** | E4, E11 |
| Absent | **19** | E5–E8, E10, E12–E25 |

**Of 25 engines, the TypeScript calc engine meaningfully covers 5 — one of which returns a wrong number and two of which are simplified below their specification.**

---

## 2. Test-classification correction

The six build sessions described the suite as "golden tests." That claim holds for one file. Corrected classification:

| File | Basis of expected value | Correct classification |
|---|---|---|
| `mortgage.ts` — Canadian | FCAC (Government of Canada) calculator | **Golden test** |
| `mortgage.ts` — US | Published textbook reference figure | Golden test |
| `cmhc.ts` | Trivial arithmetic, independently checkable by hand | Acceptable |
| `qualifying.ts` | Computed by the build agent, then asserted | **Regression test** |
| `cashflow.ts` | Computed by the build agent, then asserted | **Regression test** |
| `returns.ts` | Computed by the build agent, then asserted | **Regression test** |
| `capitalstack.ts` | Computed by the build agent, then asserted | **Regression test** |
| `portfolio.ts` | Computed by the build agent, then asserted | **Regression test** |

A regression test proves the code still behaves as it did yesterday. It does not establish correctness. "33 tests passing" is therefore not equivalent to "33 things verified correct," and the two claims were conflated during the build sessions.

### The one substantive correctness defect found

`portfolio.ts` computes `blendedIRR` as an **equity-weighted average of per-property IRRs.**

This is not portfolio IRR. A true portfolio IRR pools every property's dated cash flows into a single series and solves once. Weighted-averaging IRRs diverges from the true figure whenever hold periods or cash-flow timings differ across properties — i.e. in essentially all real portfolios.

This is textbook **DERIVED-THIN** per Table B: it computes, it recomputes on input change, it passes every click-through, and it is wrong in a way no usability session will catch. Under the standing rule against shipping derived-thin metrics it must be either rebuilt against pooled cash flows or gated with visible limitation text.

### Secondary defects

- **`capitalstack.ts` blended cost of capital** omits the `(1 − Tc)` tax shield on debt specified in F-102. The figure it returns is a weighted average rate, not WACC, and should not be labelled WACC.
- **`portfolio.ts` DSCR floor** returns the minimum observed DSCR. Table A specifies a *stress-tested* DSCR floor. These are different metrics; the current one should not carry the stress-tested label.
- **Concentration risk** is implemented as percentage-of-value only. Attribution and blended benchmark spread — two of the four attributes that distinguish a terminal from a dashboard — are absent.

---

## 3. Engineering gaps flagged as non-deferrable in the strategy report

| Item | Status | Note |
|---|---|---|
| Zod input validation | **Absent** | Explicitly listed as "cannot defer" |
| Decimal.js for exact-cent math | **Absent** | Raw IEEE-754 floats throughout a money engine |
| fast-check property-based tests | **Absent** | The invariant layer (balance reaches zero, principal sums to loan) is untested |
| XIRR | **Absent** | Dated/irregular cash flows unsupported |
| Newton–Raphson + bisection/Brent fallback | **Absent** | IRR/MIRR come straight from `@formulajs/formulajs` with no convergence fallback — the exact robustness gap the library research flagged. Non-convergent streams fail silently |
| HTTP layer | **Absent** | No endpoints exist |
| Deployment | **Absent** | Local + private GitHub only. Unreachable from any front end |
| Auth, rate limiting, API versioning | **Absent** | |
| Request/response contract | **Absent** | WeWeb has nothing to build against |

---

## 4. Table D reconciliation — pushbacks, updated

| # | Pushback | Status at 31 Jul 2026 |
|---|---|---|
| P1 | Buddy → Figma → Bubble pipeline never tested end-to-end | **Superseded in form, live in substance.** Per Doc 52/53 the route is now Claude Design HTML → **WeWeb + Supabase**. WeWeb cannot import hand-written HTML either — the UI gets rebuilt in its editor regardless. P1 should be restated as: *the Claude Design → WeWeb rebuild has never been spiked on a single page.* Same unvalidated-transfer risk, different tool |
| P2 | Zero external users | **Unchanged.** Doc 09's three-persona test remains written and unrun |
| P3 | Four legal consults unscheduled | **Unchanged.** Multi-week lead times continue to compound |
| P4 | "Commercial" underwritten with residential-shaped math | **Unchanged** — and now also true of the TypeScript engine, which has no lease-level modelling |
| P5 | Every return figure is pre-tax, nothing says so | **Unchanged, and now doubled.** Applies to the TypeScript engine as well. Still the cheapest fix on the list |
| P6 | Pricing set with zero customer conversations | **Unchanged** |
| P7 | Eight nav modules, one builder, no launch date | **Unchanged** — Workspace tab removal is a partial concession |
| P8 | Five-company framing dangerous as a build spec | **Unchanged** |
| P9 | No version control on prototype/doc set | **Partially resolved.** The calc engine is now under git + private GitHub. The 50+ canonical docs and the HTML prototype files remain unversioned. This is the cheapest remaining win on the entire list — a second private repo, one afternoon |

---

## 5. Table C reconciliation — module-level effect

| Module | Effect of the calc engine work | Net change |
|---|---|---|
| Portfolio (macro) | E11 now exists in TypeScript but with an incorrect blended IRR and no attribution or benchmark spread | **No improvement to the terminal claim.** Still a dashboard |
| Portfolio (micro) | Blocked on E8, which remains absent in TypeScript | Unchanged |
| Deal Analyzer | E9 exists in simplified form; E8 and E10 absent, so time-weighted metrics still rest on a partial time dimension | **Marginal.** The original finding — time-weighted return metrics without a full time dimension underneath — still holds in TypeScript |
| Dev Studio | **Zero TypeScript coverage.** F-701 → F-711 entirely absent: budget rollup, contingency-on-own-subtotal, ROC, developer profit, interest reserve, sources-and-uses integrity, construction-loan convergence | **Widest divergence in the product.** The most thoroughly validated module (against 796 Main St. and Gilley) has no engine outside Claude Design |
| Neighbourhood Intel | Not calc-engine work | Unchanged |
| Community | Not calc-engine work | Unchanged |

---

## 6. What the six sessions did accomplish

Stated plainly so the corrections above are not read as dismissal:

1. **The Stage-1 checkpoint from the founder strategy report is cleared.** The stated test was: build one engine end-to-end, tested, deployed-capable, understood. The Canadian mortgage engine is FCAC-validated to the cent and its correctness is provable against an external authority. That checkpoint said *continue building rather than concede to a contractor* — and the evidence supports continuing.
2. **A real, portable, version-controlled TypeScript foundation exists** where none did before. It survives any front-end decision, per the architectural principle that has held across every prior doc.
3. **A working method is established** — install, write, test, verify against authority, commit, push — that scales to the remaining 19 engines.
4. **E21 became feasible.** Calc-version stamping was listed ABSENT with no path. With git in place, the commit SHA *is* a calc version. Stamping every engine response with the SHA that produced it is now a small implementation task rather than a design problem. This is a genuine new capability, not a reframing.
5. **The FCAC finding has product value beyond the test.** Template v2's `=-PMT((B31/12),(B28*12),B26,0,1)` is wrong twice over for Canadian mortgages — US-style `rate/12` compounding *and* annuity-due timing. Most circulating real-estate spreadsheets carry the same defect. This is a demonstrable, defensible accuracy claim.

---

## 7. Direct answer to the question asked

**Has every engine required by the audit been built in Claude Design and in the TypeScript calc engine?**

No.

- **Claude Design:** the E8 → E9 → E10 blocker chain identified as the only true MVP blocker **has been cleared** (5c, 5d, 5e). E11 remains unconfirmed. E12–E25 remain substantially as Table A described them.
- **TypeScript:** 5 of 25 engines are meaningfully covered, 1 externally validated, 1 returning a mathematically incorrect result, 2 simplified below specification.

**Is it ready to connect to Route 1 (WeWeb) or Route 2?**

No. Not for engine-coverage reasons and not primarily for them either — it has no HTTP layer, no deployment, and no request/response contract. Nothing can call it. That gap is closable in a single focused session; the engine-coverage gap is not.

---

## 8. Recommended sequencing

Ordered by expected value, not by build appetite.

| Step | Action | Rationale |
|---|---|---|
| 1 | **Gate or rebuild `portfolio.ts` blended IRR** | A known-wrong number is worse than a missing one and violates a standing rule |
| 2 | **Re-derive the five regression-test files against external references** | Cheaper now than after they have dependents. Excel, published amortization tables, and hand-computation are all acceptable authorities |
| 3 | **Second private repo for the 50+ canonical docs and HTML prototype** | P9's remaining half. One afternoon, permanently removes the one-bad-overwrite risk |
| 4 | **Claude Design → WeWeb single-page spike** | Restated P1. Still the highest-expected-value hour available, and it gates the entire front-end plan |
| 5 | **Book the four legal consults** | P3. Zero build hours, multi-week lead times, compounding |
| 6 | **E8 in TypeScript** (per-tranche amortization schedule) | Unblocks principal/interest decomposition in E9 and remaining-balance in E10 |
| 7 | **E10 in TypeScript** (exit/reversion as a computed engine) | Removes the largest IRR driver from being a raw user input |
| 8 | **Zod + Decimal.js + fast-check retrofit** | Do it at ~7 engines, not at 20 |
| 9 | **HTTP layer, contract, deployment** | Only meaningful once the engines behind it are trustworthy |
| 10 | **Dev Studio F-701 → F-711 port** | Largest single block of remaining work. Enterprise-tier, smallest segment — sequence accordingly |

Steps 1–3 are corrections and hygiene and should precede new engine work. Steps 4–5 run in parallel and consume no build hours.

---

*End of Doc 54 · Read-only audit, report-only convention per Doc 17 · Covers: Table A (E1–E25), Table C (modules), Table D (P1–P9) against `investscape-calc-engine` as at 31 Jul 2026 · Does not cover: Table B provenance matrix (requires a live prototype pass, not a code read)*
