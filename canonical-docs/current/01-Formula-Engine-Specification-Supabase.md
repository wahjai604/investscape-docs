# InvestScape — Formula Engine Specification — Doc 01

**Supersedes `01-Formula-Engine-Specification.md`.** Same formulas, same verified figures, same test values — the mathematics in this document has not changed and does not need to. What changed is where these formulas run (a standalone TypeScript service instead of a Bubble backend workflow) and, critically, **how much of this specification that service actually implements today.** That second point is not a platform-migration detail — it's the most important thing in this document, and it's stated plainly in §0 below rather than left for someone to discover later.

**This document is a trade-secret asset: keep it private.** Unchanged from the original.

**Sources consolidated, unchanged:** Mortgage and Rent Analysis Template v2 (canonical core) · CAP Rate Worksheet 2.0 · Rental Property Analysis Evaluator · Top 25 Investment Calculations · Thomsett formula library.

**Convention used below:** `inputs.` = a column on `deal_inputs` (Doc 02). `m.` = a column on `deal_metrics` (Doc 02). All % fields are stored as decimals (27.5% is stored as `0.275`) — this was a Bubble percent-input formatting convenience originally; in Postgres it's simply the natural way to store a `numeric` percentage, with formatting handled entirely at display time in WeWeb.

---

## 0. Build status — read this before reading anything else in this document

**This section did not exist in the Bubble-era version, because the question it answers didn't exist yet: under Bubble, "the spec" and "the build" were the same artifact, updated together by hand. They are not the same artifact anymore.** There are now two independent implementations of everything below — the Claude Design HTML/JS prototype, and a real TypeScript service (`investscape-calc-engine`, private GitHub repo) — and Doc 54's engine reconciliation (31 July 2026 pass) found they share zero code and have diverged. Six TypeScript build sessions produced a real, tested, version-controlled foundation, but one that currently covers a *minority* of what this document specifies, and it has no HTTP layer yet, so nothing can call it from WeWeb regardless of coverage.

**Status of this document's own Parts A, B, and C specifically, per Doc 54 Table A:**

| Part | Engine(s) | TypeScript status |
|---|---|---|
| Part A, Step 1 (PTT/closing costs) | E5 | **Absent.** Not yet ported — see Doc 03 Addendum A, which specs this logic for the calc-engine but as of Doc 54's audit date had not yet been implemented in the actual repo. |
| Part A, Step 3 (mortgage payment) | E2 | **Built and externally validated** — the one unambiguous success. Canadian side checked against the FCAC calculator; US side against a published textbook figure. **Scope note:** single-loan only. Doc 02 Addendum A's multi-tranche capital stack (E4) is a separate, much thinner implementation — see below. |
| Part A, Steps 4–6 (rent analysis, net performance, break-even solver) | E1, E7 | **Partial (E1) / Absent (E7).** The TypeScript engine currently computes NOI, cash flow, and DSCR only. Cash-on-cash, cap rate, GRM, and the break-even solver this document treats as the platform's signature differentiator feature are not yet in the TypeScript engine at all. |
| Part B (the 11 derived metrics) | mostly E1 | **Mostly absent**, per the E1 partial-coverage note above — B1 (cap rate), B2 (cash-on-cash), B4 (GRM), B6 (break-even ratio) and others are specified here but not yet built in TypeScript. |
| Part C (grade/scorecard rubric) | E20 | **Absent.** No engine exists yet, in either implementation, per Doc 54 — status was already "unverified, real engine or static unknown" before this reconciliation pass, and the pass found nothing in TypeScript at all. |

**What this means in practice:** treat every formula below as **specified and validated on paper**, not as **currently computed by a running service** unless a line explicitly says otherwise. Where the mortgage payment formula (Step 3) is genuinely built and FCAC-validated, this document says so and that claim can be relied on. Nowhere else in this document should "this is in Doc 01" be read as "this is live."

**Update, confirmed since Doc 54's original pass:** E11 (portfolio rollup, `portfolio.ts`) is outside this document's own Part A/B/C scope — it's a Portfolio-module engine, not a per-deal formula — but it was flagged in Doc 54 as the one *built-but-mathematically-wrong* engine in the whole platform, and it's worth correcting the record here since this document cited that finding. **The blended IRR defect has been fixed and independently re-verified, not just reported fixed.** `portfolio.ts` now pools every property's actual cash flow series period-by-period (`poolPortfolioCashFlows`) and solves IRR once on the combined stream (`rollupPortfolio` → `pooledPortfolioIRR`), rather than averaging pre-computed per-property IRRs. The fix was checked against a 3-property test case with different hold periods (5/3/4 years) and different equity — every individual IRR, the pooled series itself, the true pooled IRR (14.997%), and the naive weighted-average IRR it's compared against (15.537%) were independently reconstructed from raw inputs and confirmed correct, not taken on the strength of the test suite reporting green. This is now the second formula in the platform (after Step 3's mortgage payment) that can be described as both built and independently verified, rather than merely specified or self-regression-tested. Doc 54's recommended sequencing (§8, step 1) is complete; step 2 (re-deriving the remaining regression-test files against external references) remains open.

**Additional gaps Doc 54 found that apply across all of Part A/B**, worth carrying in mind while reading the formulas below: no `Decimal.js` — the engine currently does exact-cent money math with raw IEEE-754 floats, which is a real defect in a financial tool, not a style preference; no input validation (Zod) at the boundary; and every return figure the engine produces is pre-tax with nothing in the output labeling it as such (Doc 54's pushback P5, "the cheapest fix on the list" — worth doing before this spec's B10/B11-adjacent metrics get built, not after).

---

## PART A — The Engine Core (Phase 1 MVP, from Template v2)

Calculations run **in this order** inside the calc-engine's deal-metrics function, because later steps depend on earlier results. Same ordering constraint as the Bubble version — a single backend workflow enforced this before by construction; a single TypeScript function enforces it now for the same reason, not a new one.

### Step 1 — Closing Costs (region-aware)

**A1. Property Transfer Tax (Canada / BC)**
```
IF PurchasePrice <= 200,000:
    PTT = PurchasePrice × 0.01
ELSE IF PurchasePrice <= 2,000,000:
    PTT = 2,000 + (PurchasePrice − 200,000) × 0.02
ELSE:
    PTT = 2,000 + 36,000 + (PurchasePrice − 2,000,000) × 0.03
```
- Verify example from Template v2: $550,000 → 2,000 + 350,000×0.02 = 2,000 + 7,000 = **$9,000** ✔ (matches sheet)
- First-time buyer exemption: `inputs.first_time_buyer` (boolean, Doc 02). If true AND purchase price under the current BC threshold → PTT = 0. **⚠ The exemption threshold changes with provincial budgets — verify the current figure before launch and store it in `tax_bracket_tables` (Doc 02 Addendum A) as admin-editable data, not a hard-coded number.** This is the same table Doc 03 Addendum A already specs the calc-engine function against — build that function to implement this exact bracket logic, not a second, separate one.
- The 3% top bracket and the additional 2% over $3M (residential) go beyond what the spreadsheet modeled — include the 3% bracket now (already reflected in `tax_bracket_tables`' four-row seed data per Doc 03 Addendum A), flag the $3M surcharge as a v1.1 item, unchanged from the original.

**Per Doc 54, this bracket logic (E5) is specified in detail — Doc 03 Addendum A gives the exact calc-engine function — but had not yet been implemented in the actual repo as of the 31 July 2026 reconciliation pass.** This is the clearest example in this document of "specified, not built": the spec is arguably more finished than any other piece of Part A, and it's still absent from the running service.

**A2. Closing Costs (USA)**
No PTT equivalent nationally; transfer taxes vary by state/county. MVP approach, unchanged:
```
closing_costs_us = purchase_price × inputs.buying_cost_pct   (default 0.02–0.03, user-editable)
```
Jurisdiction tables remain a Phase 2+ item.

**A3. Buying Costs (both regions)**
```
m.buying_costs = purchase_price × inputs.buying_cost_pct    (default 0.01 per Template v2)
```
Covers inspection (~$400), legal (~$1,500–1,700), strata move-in (~$300), moving (~$450), adjustments — per the Template v2 assumption notes, unchanged.

### Step 2 — Purchase / Cash Structure

```
m.down_payment          = purchase_price × inputs.down_payment_pct
m.loan_amount            = purchase_price − m.down_payment − inputs.second_mortgage (default 0)
m.ltv                    = m.loan_amount ÷ purchase_price
m.initial_cash_invested  = m.down_payment + m.buying_costs + inputs.initial_improvements + m.ptt
```
Verify: 550,000 × 0.275 = 151,250 DP; loan 398,750; LTV 0.725; cash = 151,250 + 5,500 + 0 + 9,000 = **165,750** ✔

### Step 3 — Mortgage Payment (THE critical formula) — built, externally validated

**⚠ Country toggle required.** Canadian mortgages compound **semi-annually**; US mortgages compound **monthly**. Using the wrong convention produces payments off by ~$10–15/month on a typical loan — small, but fatal to credibility in a financial tool. Unchanged reasoning from the original, and now backed by a genuinely useful finding: per Doc 54 §6 item 5, Template v2's own mortgage formula is wrong twice over for Canadian mortgages (US-style monthly compounding *and* annuity-due timing), and most circulating real-estate spreadsheets carry the same defect. Getting this right is a demonstrable, defensible accuracy claim for the platform, not just an internal correctness bar.

**Effective monthly rate `i`:**
```
Canada:  i = (1 + AnnualRate ÷ 2)^(1/6) − 1
USA:     i = AnnualRate ÷ 12
```

**Payment (amortizing loan):**
```
n = total_period_years × 12
m.monthly_payment = m.loan_amount × i ÷ (1 − (1 + i)^(−n))
```

**Payment (interest-only loan):**
```
m.monthly_payment = m.loan_amount × i
```

- Template v2 check: $398,750 @ 4.54%, 25 yr → sheet shows $2,217.06. Canadian semi-annual compounding gives ≈$2,214; US monthly gives ≈$2,225. **Treat the FCAC calculator as ground truth, not the spreadsheet** — this instruction from the original document has now actually been carried out: per Doc 54 Table A (E2), the Canadian side of this formula is built in the TypeScript calc engine and checked against the FCAC calculator, and the US side is checked against a published textbook reference figure. This is the one formula in this entire document that can currently be described as both built and independently verified, not just specified.
- Note the sheet's own inconsistency, unchanged: its assumption note says "4.99% TD Bank" but the input cell uses 4.54% — the rate is just an input, no logic issue.
- **Calc-engine implementation:** ordinary TypeScript, no plugin or escape hatch needed — the exponent math that required Bubble's Toolbox "Expression" element or a "Run javascript" action is simply:
```typescript
// Canada
const i = Math.pow(1 + rate / 2, 1 / 6) - 1;
// USA: const i = rate / 12;
const n = years * 12;
const pmt = (loan * i) / (1 - Math.pow(1 + i, -n));
```

**Scope caveat, not present in the original document because the gap didn't exist yet:** this validated formula covers a **single loan.** Doc 02 Addendum A's multi-tranche capital stack (E4 — VTB/bridge/mezzanine presets, weighted cost of debt) is a separate engine, and per Doc 54 it is currently built as simple `amount × rate` interest with no amortization, no per-tranche terms, and no per-tranche country convention — it does not yet reuse this validated Step 3 formula per tranche, and its blended cost figure does not match Doc 06's F-102 (WACC) as specified. Don't assume E2's validation extends to E4 just because they're both "mortgage math" — verify each tranche in a multi-tranche stack is actually running this Step 3 logic before trusting a blended figure from it.

### Step 4 — Rent Analysis

```
m.gross_rent_annual       = monthly_rent × 12
m.vacancy_loss_annual     = monthly_rent × inputs.vacancy_months        (Template v2 style: months vacant, 0–12)
m.operating_income_annual = m.gross_rent_annual − m.vacancy_loss_annual
m.operating_income_monthly = m.operating_income_annual ÷ 12
```

**Operating expenses** (Template v2 percentages are **% of gross rental income**, monthly basis):
```
m.insurance_monthly         = monthly_rent × inputs.insurance_pct        (default 0.025)
m.property_mgmt_monthly     = monthly_rent × inputs.property_mgmt_pct    (default 0)
m.property_tax_monthly      = inputs.property_tax_annual ÷ 12
m.repairs_monthly            = monthly_rent × inputs.repairs_pct          (default 0.02)
m.strata_fee_monthly         = inputs.strata_fee_monthly                  (direct)
m.other_monthly               = monthly_rent × inputs.other_pct            (default 0.025)
m.operating_expenses_monthly = sum of the above
m.operating_expenses_annual  = m.operating_expenses_monthly × 12
```
Verify: 75 + 0 + 190.15 + 60 + 550 + 75 = **$950.15/mo → $11,401.85/yr** ✔

### Step 5 — Net Performance

```
m.noi_monthly       = m.operating_income_monthly − m.operating_expenses_monthly
m.noi_annual        = m.noi_monthly × 12
m.cash_flow_monthly = m.noi_monthly − m.monthly_payment − (inputs.year1_improvements ÷ 12)
m.cash_flow_annual  = m.cash_flow_monthly × 12
```
Verify: 2,049.85 − 2,217.06 = **−$167.21/mo** ✔ (negative cash flow shown in red)

**Per Doc 54 Table A (E1):** NOI and cash flow are the two pieces of this step actually built in the TypeScript calc engine today, alongside DSCR from Part B below — but every test asserting these figures is a **regression test** (Doc 54 §2), not a golden test: the expected values were computed by the same build process that produced the code, then asserted against it. That proves the code hasn't silently changed since yesterday. It does not prove these formulas are correct against an outside authority, the way Step 3's mortgage payment is. Worth closing per Doc 54 §8 step 2 — re-deriving these five regression-test files (including this one) against an external reference (hand computation, a published example) before more of the platform comes to depend on them.

### Step 6 — Break-Even Solver (differentiator feature) — specified, not yet built in TypeScript

Solves: *what loan amount makes monthly payment exactly equal NOI (cash flow = 0)?*

Closed-form — no iteration needed:
```
m.break_even_loan         = m.noi_monthly × (1 − (1 + i)^(−n)) ÷ i
m.break_even_loan_pct     = m.break_even_loan ÷ purchase_price
m.break_even_down_payment = purchase_price − m.break_even_loan
m.break_even_down_pct     = 1 − m.break_even_loan_pct
```
Verify: at 4.54%/25yr, NOI $2,049.85/mo → loan ≈ **$368,676**, DP ≈ **$281,324 (43.3%)** ✔ (matches Template v2's break-even panel)

Display as: *"To break even on this property, you'd need a down payment of $281,324 (43.3%) — $130,074 more than your planned $151,250."*

**Per Doc 54 Table A (E7):** this engine is built in the Claude Design prototype but **absent from the TypeScript calc engine entirely.** This document calls it a "differentiator feature" — it's worth being direct that the differentiator currently exists only in the prototype, not in the service that would need to actually serve it in production.

---

## PART B — Formula Engine v2 (Phase 1.5 — same inputs, more metrics)

These add **zero new user-entry fields** for most metrics — they derive from Part A results. Sourced from CAP Rate Worksheet 2.0, Rental Property Analysis Evaluator, Top 25 list. Unchanged from the original in content; status column added because, per Doc 54, most of these are not yet built in TypeScript regardless of how simple the derivation is.

| # | Metric | Formula | Notes | TypeScript status (Doc 54) |
|---|--------|---------|-------|---|
| B1 | Cap Rate | `noi_annual ÷ total_asset_cost` | CAP Worksheet 2.0 uses **total asset cost** (price + PTT + legal + improvements), not just purchase price. Offer both: "Cap Rate (Price)" and "Cap Rate (All-In Cost)." Verify: 41,720 ÷ 1,019,500 = **4.09%** ✔ | Absent |
| B2 | Cash-on-Cash Return | `cash_flow_annual ÷ initial_cash_invested` | The single most-quoted metric by investors | Absent |
| B3 | DSCR | `noi_annual ÷ (monthly_payment × 12)` | Lenders want ≥ 1.2; flag in scorecard | **Built** (regression-tested, not externally validated — see Step 5's note above) |
| B4 | GRM | `purchase_price ÷ gross_rent_annual` | Quick screening ratio | Absent |
| B5 | Operating Expense Ratio | `operating_expenses_annual ÷ operating_income_annual` | From Evaluator sheet | Absent |
| B6 | Break-Even Ratio | `(operating_expenses_annual + debt_service_annual) ÷ gross_rent_annual` | Lender screening: < 85% good | Absent |
| B7 | Price per Sq Ft | `purchase_price ÷ square_feet` | Needs `properties.square_feet` — already in Doc 02 | Absent |
| B8 | Vacancy Rate | `vacancy_months ÷ 12` | Display form of existing input | Absent (trivial, but not yet wired) |
| B9 | Multi-unit rent roll | `Σ Unit rents` | CAP Worksheet supports 4 units. MVP: single rent figure; Phase 2: a unit-level table under `properties` | Absent (E13, deferred) |
| B10 | ROE (year 1) | `(noi_annual − debt_service_annual) ÷ down_payment` | | Absent |
| B11 | 1% Rule flag | `monthly_rent ≥ 0.01 × purchase_price` | Pass/fail badge | Absent |

**Deferred to Phase 2+ (need multi-year projection engine), unchanged:** NPV, IRR, Average Annual Return, Appreciation Rate, after-tax metrics (CFAT, CoCRAT — tax modeling is jurisdiction-heavy and raises the advice-liability bar; keep out of MVP). The React prototype's 10-year projection tab is still the blueprint when the time comes. **Update per Doc 54:** IRR and MIRR do now exist in the TypeScript engine (`returns.ts`, part of E9), but come directly from the `@formulajs/formulajs` library with no convergence fallback (no Newton–Raphson, no bisection/Brent backup) — non-convergent cash-flow streams fail silently. XIRR (dated/irregular cash flows) is absent entirely. Treat "IRR exists in the engine" and "IRR is production-ready" as two different claims until this gap closes.

---

## PART C — Deal Scorecard (AI layer input) — absent in both implementations

The letter-grade scorecard (from the React prototype concept) is computed from Part A+B, then passed with all `deal_metrics` into the Claude API prompt for the narrative. Suggested MVP rubric (admin-tunable later), unchanged from the original:

| Signal | Weight | Grade bands |
|---|---|---|
| Cash Flow (monthly) | 30% | A: >$300 · B: $0–300 · C: −$200–0 · D/F below |
| Cash-on-Cash | 25% | A: >8% · B: 5–8% · C: 2–5% · D/F below |
| Cap Rate (all-in) | 20% | A: >6% · B: 4.5–6% · C: 3–4.5% · D/F below |
| DSCR | 15% | A: >1.4 · B: 1.2–1.4 · C: 1.0–1.2 · D/F below |
| Break-Even DP gap | 10% | A: planned DP ≥ break-even · scaled below |

**Per Doc 54 (E20):** this rubric was already flagged as "unverified — real engine or static unknown" before this reconciliation pass, and the pass confirmed it — no scorecard engine exists in TypeScript at all. Given how much legal and underwriting-liability weight this single feature carries (per the securities lawyer brief, `02-Securities-Lawyer-Brief.pdf` §A, this is flagged as the highest-scrutiny element in the entire product), that absence is worth treating as a priority gap, not a routine one. **Reminder from the project's own trade-secret posture:** when this rubric is built, per `01-SaaS-Technology-Lawyer-Brief.pdf` it belongs entirely inside the calc-engine service, never shipped to WeWeb or any browser-visible code — the same reasoning already applied to `parcels.ptt` in Doc 03 Addendum A applies here with even more legal weight behind it.

**Compliance note, unchanged:** the scorecard and AI narrative must always render with the "informational purposes only — not financial advice" disclaimer already established as a reusable WeWeb component (Doc 03 Stage 7).

---

## Implementation rules

1. **One calc-engine function** (parameter: a `deal_inputs` row) computes Parts A→B→C in order and writes every result to the linked `deal_metrics` row, stamped with `calc_version` (Doc 02's addition — see Doc 03 Stage 3 item 3). Same ordering and single-writer discipline as the original Bubble workflow, enforced now by the service's own code path plus RLS rather than by there being only one workflow that could touch the table.
2. **Never compute metrics live on a WeWeb page.** Stored results = consistent numbers everywhere, instant page loads, and a clean payload for the Claude API. Unchanged principle, still enforced by the same mechanism (single writer to `deal_metrics`) described in Doc 02 §3.
3. **Round only at display time.** Store full precision; format on screen (currency 2dp, percentages 1–2dp). **Caveat added per Doc 54 §3:** "full precision" currently means raw IEEE-754 floating point, not exact decimal arithmetic — a real defect in a money-handling engine, flagged as "cannot defer" in Doc 54's gap list. This should be closed with `Decimal.js` (or equivalent) before, not after, more engines get built on top of float-based `deal_metrics` values.
4. **Test harness, unchanged bar, corrected classification:** re-enter the Template v2 example ($550,000 / 27.5% / 4.54%) and confirm every ✔ value above. Per Doc 54 §2, be precise about what "passing" means here — a regression test proves today's code matches yesterday's assertion; only a formula checked against an outside authority (the FCAC calculator, a published table, an independent hand calculation) is actually verified. Don't let "the test suite is green" stand in for "the numbers are right" — the two are different claims, and conflating them is the specific mistake Doc 54 found and corrected.

---

## What changed, briefly

Same convention as Docs 02 and 03's own summaries. Two kinds of change happened to this document, and they're different in kind, worth keeping separate:

- **Platform-mechanical changes** (Bubble → TypeScript): field names to snake_case, the Toolbox/JS escape hatch became just... TypeScript, "backend workflow" became "calc-engine function." Cosmetic, in the same sense Doc 02's PascalCase→snake_case change was cosmetic.
- **Reality changes, not platform changes:** the addition of §0 and the per-formula status notes throughout. These exist because a real, independently-auditable implementation now exists (`investscape-calc-engine`) and Doc 54 checked this specification against it directly. That audit found most of Parts A/B/C are specified but not yet built, one formula (Step 3's mortgage payment) is both built and genuinely externally validated, and one built engine elsewhere in the platform (Doc 02 Addendum A's multi-tranche stack) doesn't yet reuse Step 3's validated logic per tranche. None of this would have been visible from a pure Bubble-to-Supabase word-swap — it only surfaced because Doc 54 read the actual repository. This document's job going forward is to keep reflecting that gap honestly as it closes, not to describe the target state as though it were the current one.

---
*End of Doc 01 (Supabase/calc-engine revision) · Supersedes: 01-Formula-Engine-Specification.md · Companion: 06-Commercial-Formula-Library.md (fuller commercial formulas, F-101–F-505, pending its own Tier 2 rewrite per Doc 55), 03-Build-Checklist-WeWeb-Supabase.md (Stage 3), 03-Build-Checklist-Addendum-A-TaxBracketTable-Supabase.md (E5's calc-engine function) · Build status confirmed against: 54-Engine-Reconciliation-ClaudeDesign-vs-CalcEngine.md (31 Jul 2026 pass) · Status update since that pass: E11's blended IRR defect fixed and independently re-verified (see note above) · Next status check due whenever Doc 54's recommended sequencing (its §8) advances the calc-engine's coverage further — re-audit this document's §0 table and the E11 note at that point rather than assuming either is still current*
