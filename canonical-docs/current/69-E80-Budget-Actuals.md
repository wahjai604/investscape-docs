# InvestScape — Doc 69: E80 — Budget Actuals

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E80 was built directly as part of Batch F (Phase 2b: Financing & Deal Quality engines). This doc registers the engine, verifies its exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E80):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file — not copied from the build prompt.

## 1. Numbering convention

One E-number per cohesive file: E80 is `investscape-calc-engine/src/E80-budget-actuals.ts`, with supporting types in `src/types/E80-budget-actuals.types.ts`. Consistent with existing convention — no E-number assigned to types-only support files.

E80 continues directly from E79 (Deal Grade) — append-only per Doc 56 R1.

## 2. E80: Budget Actuals

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E80 | `investscape-calc-engine` | `src/E80-budget-actuals.ts` | Line-item development budget variance tracking — evaluates each line item's budgeted vs. actual vs. committed spend and computes category and total rollup with contingency-drawn flagging | `evaluateBudgetLineItem`, `calculateBudgetRollup` |

## 3. Problem statement

Development budgets are not static. Contractors invoice progress, change orders shift estimates, contingencies are drawn down, and scope inevitably creeps. Project managers need per-line and category visibility:

1. **Per-line tracking:** budgeted amount, actual spend, committed (obligated but not yet invoiced), variance from budget, amount left to complete, and overage amount (if already over budget).
2. **Category subtotals:** group lines by "Hard Costs" / "Soft Costs" / "Financing" / etc. (no fixed enum; real budgets vary by jurisdiction and project type).
3. **Contingency drawn:** a flag per line item marks it as contingency; rollup calculates total contingency budgeted and total contingency spent, expressed as a percentage.
4. **Overall budget status:** is the full project on track, under, or over budget, accounting for all three dimensions (actual + committed + remaining)?

E80 is not a reforecast engine — it does not recompute line-item budgets based on risk assessments or construction progress. It evaluates variance against fixed line items, surfaces variance magnitude and direction clearly, and leaves forecasting and re-budgeting decisions to the project manager.

## 4. Sourced conventions

**Three-way spend accounting:**
- **Budgeted amount:** the original (or most recently revised) line-item budget.
- **Actual amount:** invoiced and paid (real historical spend).
- **Committed amount:** contractually obligated but not yet invoiced (e.g., an executed subcontract not yet drawn, a purchase order issued but goods not delivered).
- **To complete:** budgeted − actual − committed, floored at 0 (never negative; see overageAmount for overspend).
- **Overage:** when actual + committed exceeds budgeted, the amount over — expressed as a positive number so "under $0" and "over $0" are never confused.

**Variance thresholds:** A line item's variance is labeled "on_track" when within a dynamic threshold (either 5% of budgeted amount, or a minimum-floor absolute amount for small budgets). "Under" budget (positive variance) and "over" budget (negative variance) are tracked separately.

**Contingency flagging:** A boolean flag per line (`isContingencyLine`) marks contingency items explicitly. No keyword matching against line descriptions — too fragile. When contingency-flagged lines are present, rollup computes contingencyDrawnPercent = Σ actualAmount / Σ budgetedAmount across all contingency items. null when no contingency lines exist or their combined budgeted amount is 0 (nothing to divide by).

## 5. When to use E80

**UI Integration:** Dev Studio Budget tab — displays per-line variance table, category subtotals, and overall rollup with a "Contingency drawn %" badge.

**Workflow:** E80 is called with a line-item array (typically fetched from a database or imported from a budget spreadsheet). As construction progresses, actual and committed amounts are updated, and rollup is recalculated on demand (e.g., monthly or weekly during construction).

**Upstream dependencies:** None. E80 is a standalone evaluation of input data; it does not call other engines or derive figures from upstream calculations.

## 6. Data contracts (TypeScript types)

### Input: `BudgetLineItem`

```typescript
export interface BudgetLineItem {
  /** Free-form grouping, e.g. "Hard Costs" / "Soft Costs" / "Financing" — not a fixed enum, since the real budget groups vary by jurisdiction and project type. */
  category: string;
  description: string;
  budgetedAmount: number;
  actualAmount: number;
  /** Contractually obligated but not yet spent (e.g. an executed subcontract not yet invoiced). */
  committedAmount: number;
  /**
   * Explicit opt-in flag for calculateBudgetRollup()'s contingencyDrawnPercent.
   * Deliberately a real per-line flag rather than inferring "is this a
   * contingency line" from category text — a keyword match against
   * "contingency" would silently miscategorize a line whose label doesn't
   * happen to contain that word, or over-match one that mentions it in
   * passing. undefined/false = not a contingency line.
   */
  isContingencyLine?: boolean;
}
```

### Output: `BudgetRollupResult`

```typescript
export interface BudgetLineItemEvaluation extends BudgetLineItem {
  /**
   * budgetedAmount - actualAmount - committedAmount, floored at 0 — the
   * amount still available to spend at this line's currently budgeted
   * level. Never negative; see overageAmount for how far over budgeted
   * this line already is once actual + committed exceed it.
   */
  toCompleteAmount: number;
  /**
   * budgetedAmount - actualAmount - committedAmount when that figure is
   * negative, expressed as a positive dollar amount (0 when not over).
   * Surfaced explicitly rather than letting toCompleteAmount's floor
   * silently absorb an over-budget/over-committed line into "$0 left",
   * which would look identical to a line that's exactly used up its
   * budget with nothing overspent.
   */
  overageAmount: number;
  /** budgetedAmount - actualAmount. Positive = under budget so far; negative = over. Does NOT factor in committedAmount — see overageAmount for that (a line can be "under" on variance while still over-committed). */
  variance: number;
  varianceLabel: BudgetVarianceLabel;
}

export interface BudgetRollupResult {
  lineItems: BudgetLineItemEvaluation[];
  totalBudgeted: number;
  totalActual: number;
  totalCommitted: number;
  totalToComplete: number;
  totalOverage: number;
  /** totalBudgeted - totalActual, graded with the same on_track/over/under bracket evaluateBudgetLineItem() uses per line. */
  totalVariance: number;
  overallVarianceLabel: BudgetVarianceLabel;
  /**
   * Σ actualAmount ÷ Σ budgetedAmount across every line item with
   * isContingencyLine === true — the old mockup's "Contingency drawn %"
   * badge. null when there are no contingency line items at all, or their
   * combined budgetedAmount is 0 (nothing to divide by) — insufficient
   * data, not a silently-reported 0%.
   */
  contingencyDrawnPercent: number | null;
  categorySubtotals: BudgetCategorySubtotal[];
}

export interface BudgetCategorySubtotal {
  category: string;
  totalBudgeted: number;
  totalActual: number;
  totalCommitted: number;
  totalToComplete: number;
  totalOverage: number;
}
```

## 7. Golden tests excerpt

E80's test suite verifies:

1. **Per-line evaluation:** budgeted/actual/committed inputs correctly compute toCompleteAmount, overageAmount, variance, and varianceLabel.
2. **Variance threshold:** lines within 5% (or minimum-floor) are "on_track"; larger discrepancies are "over" or "under".
3. **Rollup aggregation:** category subtotals and overall totals sum correctly across all line items.
4. **Contingency calculation:** lines marked `isContingencyLine: true` are summed separately; contingencyDrawnPercent = actual÷budgeted for contingency lines only. Null when no contingency lines exist or budgeted is 0.
5. **Three-way accounting:** toCompleteAmount + actualAmount + committedAmount = budgetedAmount (when toCompleteAmount ≥ 0); when over-budget, overageAmount captures the overspend (not silently folded into a "$0 left" corner case).

## 8. Integration notes

**Dev Studio Budget tab:**
- **Per-line table:** displays category, description, budgeted, actual, committed, variance (with color coding: green=under, red=over, yellow=on_track), to-complete, and overage.
- **Category subtotals:** groups lines by category; each category row shows totals for that category.
- **Overall summary:** shows project-wide totals, overall variance label, and contingency-drawn percentage badge (e.g., "Contingency 35% drawn").
- **Drill-down:** user can click a category to expand/collapse its line items.

**Data updates:** as invoices are recorded and committed amounts change, the budget table is recalculated; no manual forecast adjustment needed.

*End of Doc 69 · Companions: none*
