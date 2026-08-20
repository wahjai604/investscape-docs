# InvestScape — Doc 72: E9 Extensions — Cap Rate, Cash-on-Cash

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E9 extensions were added as part of Batch F (Phase 2b: Financing & Deal Quality engines). Unlike E78–E82, these are not separately numbered; they extend the existing E9 (DSCR) engine with two new functions. This doc registers the extensions, verifies their exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E9 Extensions):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file (`src/E9-dscr.ts`) — not copied from the build prompt.

## 1. Numbering and naming convention

E9 (DSCR) was the first commercial real estate analysis engine, computing NOI and debt-service coverage ratio for income-property qualification. With Batch F, two new functions are added to the same file:

- `calculateCapRate()` — the unlevered yield
- `calculateCashOnCash()` — the levered cash return

These are not assigned new E-numbers (E83, E84) because they are tightly integrated with E9's existing NOI calculation and are best understood as complementary yield metrics, not separate engines. No E-number is assigned until an addition becomes large enough (multiple functions, distinct types file, independent caller pattern) to warrant its own module. Here, both fit naturally in the existing `src/E9-dscr.ts` file alongside `calculateDSCR()`.

## 2. E9 Extensions

| Engine | File | Capability | New exports |
|---|---|---|---|
| E9 (extended) | `investscape-calc-engine/src/E9-dscr.ts` | Unlevered cap rate and levered cash-on-cash returns — complementary metrics to the existing DSCR calculation | `calculateCapRate`, `calculateCashOnCash` |

**Pre-existing E9 exports (unchanged):**
- `calculateNOI()` — computes NOI from gross rent, vacancy, and operating expenses (itemized or aggregate).
- `calculateDSCR()` — computes NOI / annual debt service.
- `evaluateDSCR()` — wraps calculateDSCR and compareS against lender minimums (1.20).

## 3. Problem statement

DSCR answers "does this property's income cover the loan?" — a lender's question. Investors need to answer their own:

- **Cap rate** ("Cap Rate"): NOI / purchase price — the unlevered return on the full purchase price, independent of financing. A 5% cap rate means you're paying $20 in purchase price for every $1 in annual NOI, regardless of how you finance it. Common for comparing unlevered property yields across deals.

- **Cash-on-cash return** ("CoC"): first-year net cash flow / equity invested — the levered return on the investor's actual out-of-pocket equity. If you invest $100k of your own money and pocket $8k in year-1 cash flow (after debt service), that's 8% cash-on-cash. This is what LPs care about most: "What do I earn on my $100k investment in year 1?"

Both are independent metrics:
- Cap rate is pure property performance (NOI ÷ price). Financing doesn't change it.
- Cash-on-cash is financing-dependent (how much debt reduces your out-of-pocket equity, and what you keep after debt service). Same property, different financing → different CoC.

E9's existing DSCR covers the lender's concern (debt serviceability). These two new functions cover the investor's primary concern (yield on capital deployed).

## 4. Sourced conventions

**Cap rate:** 
- Formula: NOI / purchase price (unlevered)
- **Convention:** cap rate is expressed as a percentage (0.05 = 5%). However, like DSCR, it is returned as a decimal ratio for programmatic use; the UI is responsible for formatting (× 100 for display).
- **Edge cases:** when purchase price is 0, cap rate is undefined (infinite return on $0 price). Callers should handle division by zero explicitly; E9 does not guard or floor this. Cap rate can be negative if NOI is negative (property is losing money).

**Cash-on-cash:**
- Formula: first-year net cash flow / equity invested
- **Net cash flow:** gross rent − vacancy − operating expenses − debt service (the actual cash left after all expenses, including loan payments).
- **Equity invested:** purchase price − debt (the investor's out-of-pocket capital; what they actually funded from their pocket).
- **Convention:** cash-on-cash is returned as a decimal ratio (0.08 = 8%). The UI formats for display.
- **Edge cases:** when equity is 0 (fully financed, no money down), cash-on-cash is undefined (infinite return on $0 equity). Callers must handle this; E9 does not guard. Negative cash-on-cash is possible (property doesn't generate enough cash to cover debt service; investor is cash-flow-negative in year 1).

**Relationship to DSCR:**
- DSCR (NOI / debt service) answers: "Is NOI enough to cover the debt payment?" (lender's question).
- Cap rate answers: "What yield am I getting on the full property price?" (investor's unlevered analysis).
- Cash-on-cash answers: "What yield am I getting on my actual equity out-of-pocket?" (investor's levered analysis).

A deal can have strong DSCR (passes lender approval) but weak cash-on-cash (poor investor return due to high financing costs). E79 (Deal Grade) weights all three to assess overall deal quality.

## 5. When to use E9 extensions

**Cap rate:** 
- Used to compare property yields across different deals before financing.
- Commonly displayed in property comparison tables and market-analysis tools.
- Independent of capital structure; useful for understanding pure property performance.
- Often used in early analysis when financing terms aren't yet finalized.

**Cash-on-cash:**
- Used to assess investor return after financing is structured.
- Primary metric for LP/limited-partner communication ("What's my year-1 cash return on the $100k I'm investing?").
- Typically displayed in deal summaries and investor presentations.
- Depends on both property performance and capital structure; changes when debt terms change.

**UI Integration:**
- **Property Detail Summary:** displays cap rate (unlevered) and cash-on-cash (levered) alongside DSCR.
- **Deal Analyzer:** uses both as inputs to E79 (Deal Grade) weighting.
- **Portfolio Dashboard:** may display cap rate across all properties for market benchmarking.

**Upstream dependencies:**
- E9 extensions depend on NOI (computed by calculateNOI() within E9 or supplied by caller).
- No downstream engines depend directly on E9 extensions; they are terminal metrics (endpoints for investor analysis, not inputs to other calculations).

## 6. Data contracts (TypeScript types)

No new type definitions. E9 extensions use simple scalar inputs and outputs:

```typescript
/** NOI / purchasePrice — the unlevered return a buyer earns on the full purchase price, independent of financing. */
export function calculateCapRate(noi: number, purchasePrice: number): number {
  return noi / purchasePrice;
}

/** First-year net cash flow / equity invested — the levered cash return on the investor's actual out-of-pocket equity. */
export function calculateCashOnCash(firstYearNetCashFlow: number, equityInvested: number): number {
  return firstYearNetCashFlow / equityInvested;
}
```

### Inputs (scalar):

| Parameter | Type | Notes |
|---|---|---|
| `noi` (Cap Rate) | number | Net Operating Income (annual). Can be computed by `calculateNOI()` or supplied from other sources. |
| `purchasePrice` (Cap Rate) | number | Total property acquisition cost. |
| `firstYearNetCashFlow` (Cash-on-Cash) | number | Gross rent − vacancy − operating expenses − annual debt service. The actual cash remaining in year 1. |
| `equityInvested` (Cash-on-Cash) | number | Purchase price − total debt financing. The investor's out-of-pocket equity contribution. |

### Outputs (scalar):

| Return | Type | Notes |
|---|---|---|
| `calculateCapRate()` | number | Decimal ratio (0.05 = 5%). Undefined when purchasePrice=0. Can be negative if NOI is negative. |
| `calculateCashOnCash()` | number | Decimal ratio (0.08 = 8%). Undefined when equityInvested=0. Can be negative if cash flow is insufficient to cover debt. |

## 7. Golden tests excerpt

E9 extensions' test suite verifies:

1. **Cap rate calculation:** NOI / purchasePrice computed correctly across positive, negative, and edge-case values.
   - Example: NOI=$50,000, purchasePrice=$1,000,000 → cap rate = 0.05 (5%).
   - Example: NOI=$100,000, purchasePrice=$1,000,000 → cap rate = 0.10 (10%).
   - Example: NOI=−$10,000 (negative), purchasePrice=$1,000,000 → cap rate = −0.01 (−1%, property is losing money).

2. **Cash-on-cash calculation:** firstYearNetCashFlow / equityInvested computed correctly.
   - Example: firstYearNetCashFlow=$8,000, equityInvested=$100,000 → CoC = 0.08 (8%).
   - Example: firstYearNetCashFlow=−$5,000 (insufficient to cover debt), equityInvested=$100,000 → CoC = −0.05 (−5%, cash-flow-negative).

3. **Interaction with NOI:** when NOI is computed via `calculateNOI()`, cap rate and cash-on-cash correctly use the resulting NOI.

4. **No guards:** neither function guards against division by zero (purchasePrice=0 or equityInvested=0). Callers are responsible for validation.

## 8. Integration notes

**Property Detail Summary:**
- Displays cap rate (unlevered) and cash-on-cash (levered) as separate KPIs.
- Often color-coded: green (strong yield), yellow (moderate), red (weak).
- Includes a brief explanation: "Cap rate: unlevered yield on the property" vs. "Cash-on-cash: your year-1 cash return on equity invested."

**Deal Analyzer Summary:**
- E79 (Deal Grade) uses both cap rate and cash-on-cash as input metrics (each scored 0-25 points) in its overall grading algorithm.

**Portfolio Dashboard:**
- May display cap-rate distribution across all properties (to assess portfolio diversification and market positioning).

**Investor Presentations / LP Communications:**
- Cash-on-cash is the headline metric ("You'll earn 8% cash-on-cash in year 1").
- Cap rate is supporting detail (unlevered context).

*End of Doc 72 · Companions: Doc 79 (E79 — Deal Grade, which consumes E9 cap rate and cash-on-cash as inputs)*
