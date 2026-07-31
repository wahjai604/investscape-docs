# InvestScape / EstateLens — Formula Engine Specification v1.0

**Purpose:** The single source of truth for every calculation in the platform. Bubble has no spreadsheet cells — every formula below must be explicitly built once as a backend workflow step. This document is a trade-secret asset: keep it private.

**Sources consolidated:** Mortgage and Rent Analysis Template v2 (canonical core) · CAP Rate Worksheet 2.0 · Rental Property Analysis Evaluator · Top 25 Investment Calculations · Thomsett formula library.

**Convention used below:** `Inputs.` = user-entered field on DealInputs. `M.` = computed field on DealMetrics. All % fields are stored as decimals in Bubble (27.5% is stored as 0.275) — Bubble's percent input formatting handles the display.

---

## PART A — The Engine Core (Phase 1 MVP, from Template v2)

Calculations run **in this order** inside one backend workflow (`calc-deal-metrics`), because later steps depend on earlier results.

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
- First-Time Buyer exemption: add a yes/no input `Inputs.FirstTimeBuyer`. If yes AND PurchasePrice under the current BC threshold → PTT = 0. **⚠ The exemption threshold changes with provincial budgets — verify the current figure before launch and store it as an admin-editable setting, not a hard-coded number.**
- The 3% top bracket and the additional 2% over $3M (residential) go beyond what the spreadsheet modeled — include the 3% bracket now, flag the $3M surcharge as a v1.1 item.

**A2. Closing Costs (USA)**
No PTT equivalent nationally; transfer taxes vary by state/county. MVP approach:
```
ClosingCosts_US = PurchasePrice × Inputs.BuyingCostPct   (default 0.02–0.03, user-editable)
```
Jurisdiction tables are a Phase 2+ item (Airtable lookup table by state).

**A3. Buying Costs (both regions)**
```
M.BuyingCosts = PurchasePrice × Inputs.BuyingCostPct    (default 0.01 per Template v2)
```
Covers inspection (~$400), legal (~$1,500–1,700), strata move-in (~$300), moving (~$450), adjustments — per the Template v2 assumption notes.

### Step 2 — Purchase / Cash Structure

```
M.DownPayment        = PurchasePrice × Inputs.DownPaymentPct
M.LoanAmount         = PurchasePrice − M.DownPayment − SecondMortgage(default 0)
M.LTV                = M.LoanAmount ÷ PurchasePrice
M.InitialCashInvested = M.DownPayment + M.BuyingCosts + Inputs.InitialImprovements + M.PTT
```
Verify: 550,000 × 0.275 = 151,250 DP; loan 398,750; LTV 0.725; cash = 151,250 + 5,500 + 0 + 9,000 = **165,750** ✔

### Step 3 — Mortgage Payment (THE critical formula)

**⚠ Country toggle required.** Canadian mortgages compound **semi-annually**; US mortgages compound **monthly**. Using the wrong convention produces payments off by ~$10–15/month on a typical loan — small, but fatal to credibility in a financial tool.

**Effective monthly rate `i`:**
```
Canada:  i = (1 + AnnualRate ÷ 2)^(1/6) − 1
USA:     i = AnnualRate ÷ 12
```

**Payment (amortizing loan):**
```
n = TotalPeriodYears × 12
M.MonthlyPayment = M.LoanAmount × i ÷ (1 − (1 + i)^(−n))
```

**Payment (interest-only loan):**
```
M.MonthlyPayment = M.LoanAmount × i
```

- Template v2 check: $398,750 @ 4.54%, 25 yr → sheet shows $2,217.06. Canadian semi-annual compounding gives ≈$2,214; US monthly gives ≈$2,225. The sheet is closest to (but not exactly) the Canadian convention. **Action item: when building, test the Bubble output against an official calculator (e.g., FCAC's mortgage calculator) rather than against the spreadsheet, and treat the verified calculator as ground truth.**
- Note the sheet's own inconsistency: its assumption note says "4.99% TD Bank" but the input cell uses 4.54% — the rate is just an input, no logic issue.
- **Bubble implementation:** exponent-heavy math is cleanest in the free **Toolbox plugin → "Expression" element** (or a server-side "Run javascript" action), e.g.:
```javascript
// Canada
var i = Math.pow(1 + rate/2, 1/6) - 1;
// USA: var i = rate/12;
var n = years * 12;
var pmt = loan * i / (1 - Math.pow(1 + i, -n));
```

### Step 4 — Rent Analysis

```
M.GrossRentAnnual      = MonthlyRent × 12
M.VacancyLossAnnual    = MonthlyRent × Inputs.VacancyMonths        (Template v2 style: months vacant, 0–12)
M.OperatingIncomeAnnual = M.GrossRentAnnual − M.VacancyLossAnnual
M.OperatingIncomeMonthly = M.OperatingIncomeAnnual ÷ 12
```

**Operating expenses** (Template v2 percentages are **% of gross rental income**, monthly basis):
```
M.Insurance        = MonthlyRent × Inputs.InsurancePct        (default 0.025)
M.PropertyMgmt     = MonthlyRent × Inputs.PropertyMgmtPct     (default 0)
M.PropertyTaxMonthly = Inputs.PropertyTaxAnnual ÷ 12
M.RepairsMaint     = MonthlyRent × Inputs.RepairsPct          (default 0.02)
M.StrataFee        = Inputs.StrataFeeMonthly                  (direct)
M.OtherMisc        = MonthlyRent × Inputs.OtherPct            (default 0.025)
M.OperatingExpensesMonthly = sum of the above
M.OperatingExpensesAnnual  = M.OperatingExpensesMonthly × 12
```
Verify: 75 + 0 + 190.15 + 60 + 550 + 75 = **$950.15/mo → $11,401.85/yr** ✔

### Step 5 — Net Performance

```
M.NOI_Monthly   = M.OperatingIncomeMonthly − M.OperatingExpensesMonthly
M.NOI_Annual    = M.NOI_Monthly × 12
M.CashFlowMonthly = M.NOI_Monthly − M.MonthlyPayment − (Inputs.Year1Improvements ÷ 12)
M.CashFlowAnnual  = M.CashFlowMonthly × 12
```
Verify: 2,049.85 − 2,217.06 = **−$167.21/mo** ✔ (negative cash flow shown in red)

### Step 6 — Break-Even Solver (differentiator feature)

Solves: *what loan amount makes monthly payment exactly equal NOI (cash flow = 0)?*

Closed-form — no iteration needed:
```
M.BreakEvenLoan       = M.NOI_Monthly × (1 − (1 + i)^(−n)) ÷ i
M.BreakEvenLoanPct    = M.BreakEvenLoan ÷ PurchasePrice
M.BreakEvenDownPayment = PurchasePrice − M.BreakEvenLoan
M.BreakEvenDownPct    = 1 − M.BreakEvenLoanPct
```
Verify: at 4.54%/25yr, NOI $2,049.85/mo → loan ≈ **$368,676**, DP ≈ **$281,324 (43.3%)** ✔ (matches Template v2's break-even panel)

Display as: *"To break even on this property, you'd need a down payment of $281,324 (43.3%) — $130,074 more than your planned $151,250."*

---

## PART B — Formula Engine v2 (Phase 1.5 — same inputs, more metrics)

These add **zero new user-entry fields** for most metrics — they derive from Part A results. Sourced from CAP Rate Worksheet 2.0, Rental Property Analysis Evaluator, Top 25 list.

| # | Metric | Formula | Notes |
|---|--------|---------|-------|
| B1 | Cap Rate | `NOI_Annual ÷ TotalAssetCost` | CAP Worksheet 2.0 uses **Total Asset Cost** (price + PTT + legal + improvements), not just purchase price. Offer both: "Cap Rate (Price)" and "Cap Rate (All-In Cost)" — the all-in version is more honest and a differentiator. Verify: 41,720 ÷ 1,019,500 = **4.09%** ✔ |
| B2 | Cash-on-Cash Return | `CashFlowAnnual ÷ InitialCashInvested` | The single most-quoted metric by investors |
| B3 | DSCR | `NOI_Annual ÷ (MonthlyPayment × 12)` | Lenders want ≥ 1.2; flag in scorecard |
| B4 | GRM | `PurchasePrice ÷ GrossRentAnnual` | Quick screening ratio |
| B5 | Operating Expense Ratio | `OperatingExpensesAnnual ÷ OperatingIncomeAnnual` | From Evaluator sheet |
| B6 | Break-Even Ratio | `(OperatingExpensesAnnual + DebtServiceAnnual) ÷ GrossRentAnnual` | Lender screening: < 85% good |
| B7 | Price per Sq Ft | `PurchasePrice ÷ SquareFeet` | Needs `Property.SquareFeet` field |
| B8 | Vacancy Rate | `VacancyMonths ÷ 12` | Display form of existing input |
| B9 | Multi-unit rent roll | `Σ Unit rents` | CAP Worksheet supports 4 units. MVP: single rent figure; Phase 2: a `Unit` sub-table under Property |
| B10 | ROE (year 1) | `(NOI_Annual − DebtServiceAnnual) ÷ DownPayment` | |
| B11 | 1% Rule flag | `MonthlyRent ≥ 0.01 × PurchasePrice` | Pass/fail badge |

**Deferred to Phase 2+ (need multi-year projection engine):** NPV, IRR, Average Annual Return, Appreciation Rate, after-tax metrics (CFAT, CoCRAT — tax modeling is jurisdiction-heavy and raises the advice-liability bar; keep out of MVP). Your React prototype's 10-year projection tab is the blueprint when the time comes.

---

## PART C — Deal Scorecard (AI layer input)

The letter-grade scorecard (from your React prototype concept) is computed from Part A+B, then passed with all DealMetrics into the Claude API prompt for the narrative. Suggested MVP rubric (admin-tunable later):

| Signal | Weight | Grade bands |
|---|---|---|
| Cash Flow (monthly) | 30% | A: >$300 · B: $0–300 · C: −$200–0 · D/F below |
| Cash-on-Cash | 25% | A: >8% · B: 5–8% · C: 2–5% · D/F below |
| Cap Rate (all-in) | 20% | A: >6% · B: 4.5–6% · C: 3–4.5% · D/F below |
| DSCR | 15% | A: >1.4 · B: 1.2–1.4 · C: 1.0–1.2 · D/F below |
| Break-Even DP gap | 10% | A: planned DP ≥ break-even · scaled below |

**Compliance note:** the scorecard and AI narrative must always render with the "informational purposes only — not financial advice" disclaimer already on your legal checklist.

---

## Implementation rules

1. **One backend workflow** `calc-deal-metrics` (parameter: a DealInputs record) computes Parts A→B→C in order and writes every result to the linked DealMetrics record. Trigger it on create and on every edit of DealInputs.
2. **Never compute metrics live on page elements.** Stored results = consistent numbers everywhere, instant page loads, and a clean payload for the Claude API.
3. **Round only at display time.** Store full precision; format on screen (currency 2dp, percentages 1–2dp).
4. **Test harness:** re-enter the Template v2 example ($550,000 / 27.5% / 4.54%) and confirm every ✔ value above before building anything else on top.
