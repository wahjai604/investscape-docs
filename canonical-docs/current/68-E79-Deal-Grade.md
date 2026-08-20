# InvestScape — Doc 68: E79 — Deal Grade

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E79 was built directly as part of Batch F (Phase 2b: Financing & Deal Quality engines). This doc registers the engine, verifies its exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E79):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file — not copied from the build prompt.

## 1. Numbering convention

One E-number per cohesive file: E79 is `investscape-calc-engine/src/E79-deal-grade.ts`, with supporting types in `src/types/E79-deal-grade.types.ts`. Consistent with existing convention — no E-number assigned to types-only support files.

E79 continues directly from E78 (Financing Table) — append-only per Doc 56 R1.

## 2. E79: Deal Grade

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E79 | `investscape-calc-engine` | `src/E79-deal-grade.ts` | Multi-metric quality scoring for investment deals — combines cap rate, cash-on-cash return, DSCR, and IRR into a five-bracket letter grade (A/B+/B/B-/C) with flagged issues and recommendations | `calculateDealGrade` |

## 3. Problem statement

Cap rate alone does not answer "is this a good deal?" Investors need to weigh multiple signals:
- **Cap rate** (unlevered yield): how well the property's NOI performs on the full purchase price, independent of financing.
- **Cash-on-cash return** (levered yield): how much cash the investor pockets in year 1 relative to their actual equity out-of-pocket, post-debt service.
- **DSCR** (debt-service coverage): does the property's NOI cover the loan payment with a safety cushion? Below 1.20, lenders may reject it entirely.
- **IRR** (full-cycle return): what's the blended return (cash flow + appreciation/exit proceeds) over the hold period?

E79 scores each metric on a 0-25 scale (four 25-point brackets), averages them proportionally (excluding null/insufficient-data metrics), and assigns a grade. It mirrors E25 (Lender Scorecard)'s scoring architecture — both are weighted-metric-to-bracket-to-label patterns — but answer different questions: E25 asks "will a lender approve this?" (bankability); E79 asks "is this a wise investment?" (deal quality).

## 4. Sourced conventions

**Four-metric weighting:** Equal 25-point weight per metric (cap rate, cash-on-cash, DSCR, IRR). No industry consensus exists for combining these signals into a single score — this 25-point-per-metric model is transparent and auditable, allowing investors to see exactly which metric(s) are pulling the grade up or down. See §6 (Data Contracts) for the exact threshold constants (CAP_RATE_STRONG_THRESHOLD, DSCR_SOLID_THRESHOLD, etc.).

**Five-bracket grading:**
- **A:** 80–100 points (strong across all four metrics)
- **B+:** 65–79 points (solid, minor gaps)
- **B:** 50–64 points (acceptable, meaningful trade-offs)
- **B-:** 35–49 points (weak in one or more signals, risk management needed)
- **C:** Below 35 (deal does not meet investment-quality bar)

**Partial-data handling:** If any of the four metrics is null (insufficient data — e.g., no reliable cap rate because NOI isn't known yet), that metric is excluded from both the numerator and denominator. The score is rescaled proportionally over however many metrics had usable data. The `fullyScored` flag signals whether the grade is based on all four metrics (true) or fewer (false), so the UI can warn "partial data — score may improve as more is entered."

**Flagged issues and recommendations:** E79 surfaces qualitative red flags ("DSCR below lender minimum") and actionable recommendations ("increase equity contribution to improve debt service coverage"), formatted for UI display.

## 5. When to use E79

**UI Integration:** Deal Analyzer Summary tab — displays the overall grade, metric breakdown, flagged issues, and recommendations. Also used in Property Detail Summary (for owned/stabilized properties, graded on real trailing figures).

**Workflow:** E79 is called after cap rate, cash-on-cash, DSCR, and IRR have all been computed. For a deal-in-progress (not yet owned), those are typically projections; for a stabilized property, those are real trailing figures.

**Upstream dependencies:** 
- E9 (DSCR, Cap Rate, Cash-on-Cash) — for cap rate, cash-on-cash, DSCR
- E5 (Returns) — for IRR
- E25 (Lender Scorecard) — architectural precedent only (shared MetricEvaluation pattern)

## 6. Data contracts (TypeScript types)

### Input: `DealGradeInput`

```typescript
export interface DealGradeInput {
  /** NOI / purchasePrice, from calculateCapRate(). null when there's no reliable NOI/purchasePrice pair to compute it from — NOT 0, which is a real (terrible) cap rate, not "unknown". */
  capRate: number | null;
  /** firstYearNetCashFlow / equityInvested, from calculateCashOnCash(). null when insufficient data (e.g. equity invested isn't known yet). */
  cashOnCash: number | null;
  /** NOI / annualDebtService, from calculateDSCR()/evaluateDSCR() — same figure E25-lender-scorecard.ts uses for bankability, here treated as one signal among four for deal *quality*, not a standalone score. null when insufficient data. */
  dscr: number | null;
  /** Full-cycle IRR, from calculateIRR(). null when there's no multi-year cash-flow-plus-exit projection to run it against. Callers must normalize calculateIRR()'s NaN-on-no-solution result to null themselves — NaN should never reach this function. */
  irr: number | null;
}
```

### Output: `DealGradeResult`

```typescript
export type DealGrade = "A" | "B+" | "B" | "B-" | "C";

export interface DealGradeMetricBreakdown {
  label: string;
  valueText: string;
  /** 0-25 (see the CAP_RATE / CASH_ON_CASH / DSCR / IRR threshold constants in utils/constants.ts). null when this metric had insufficient data — excluded from both the numerator and denominator of overallScore, never counted as a 0. */
  score: number | null;
}

export interface DealGradeScoreBreakdown {
  capRate: DealGradeMetricBreakdown;
  cashOnCash: DealGradeMetricBreakdown;
  dscr: DealGradeMetricBreakdown;
  irr: DealGradeMetricBreakdown;
}

export interface DealGradeResult {
  /** 0-100, rescaled proportionally over however many metrics had usable data (same "exclude, don't zero-weight" precedent E25-lender-scorecard.ts's US branch already sets for its missing GDS slot). */
  overallScore: number;
  grade: DealGrade;
  scoreBreakdown: DealGradeScoreBreakdown;
  /** False once any metric was null (insufficient data) — signals to the UI that overallScore is a partial-data rescale, not a full 4-metric score. */
  fullyScored: boolean;
  flaggedIssues: string[];
  recommendations: string[];
  summary: string;
}
```

## 7. Golden tests excerpt

E79's test suite verifies:

1. **Threshold-to-score mapping:** each of the four metrics (cap rate, cash-on-cash, DSCR, IRR) correctly maps to its 0-25 point score across strong/solid/weak/poor threshold brackets.
2. **Grade assignment:** 0-25 → C, 25-35 → B-, 35-50 → B, 50-65 → B+, 65-80 → A (adjusted for partial data).
3. **Partial data handling:** when one metric is null, the score is rescaled over the remaining three; `fullyScored` is false.
4. **Issue flagging:** DSCR < 1.20 surfaces a "below lender minimum" issue; cap rate below 3% flags "weak cash yield"; etc.
5. **Summary text:** a human-readable summary is generated (e.g., "Strong deal with solid metrics across the board" vs. "Weak performer, only consider if you can negotiate better terms").

## 8. Integration notes

**Deal Analyzer Summary tab:**
- Displays the overall grade prominently (large letter, color-coded: A=green, B+=blue, B=yellow, B-=orange, C=red).
- Shows scoreBreakdown as a four-cell grid or bar chart (cap rate / cash-on-cash / DSCR / IRR, each with label + value + 0-25 score).
- Lists flaggedIssues and recommendations as collapsible sections.
- Shows `fullyScored` as a "Data Completeness" indicator (100% when true, percentage when false).

**Property Detail Summary:**
- For saved properties with trailing-twelve-month figures, E79 re-grades the property using real (not projected) cap rate, cash-on-cash, DSCR, and IRR.

*End of Doc 68 · Companions: none*
