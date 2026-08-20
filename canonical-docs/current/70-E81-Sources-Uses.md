# InvestScape — Doc 70: E81 — Sources ≡ Uses

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E81 was built directly as part of Batch F (Phase 2b: Financing & Deal Quality engines). This doc registers the engine, verifies its exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E81):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file — not copied from the build prompt.

## 1. Numbering convention

One E-number per cohesive file: E81 is `investscape-calc-engine/src/E81-sources-uses.ts`, with supporting types in `src/types/E81-sources-uses.types.ts`. Consistent with existing convention — no E-number assigned to types-only support files.

E81 continues directly from E80 (Budget Actuals) — append-only per Doc 56 R1.

## 2. E81: Sources ≡ Uses

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E81 | `investscape-calc-engine` | `src/E81-sources-uses.ts` | Cash reconciliation — assembles financing sources (debt + equity), development uses (land + hard/soft costs + financing costs + contingency), and validates they balance within tolerance | `calculateSourcesUses` |

## 3. Problem statement

A real estate deal must account for every dollar: where it comes from (sources) and where it goes (uses). Any gap signals an error in modeling (missing financing, underestimated costs) or a genuine shortfall/surplus (deal is underfunded or over-capitalized).

**Sources side:**
- Debt facilities (senior mortgage, mezzanine, presale deposits) — each facility's `amount` is its contribution.
- Sponsor equity (LP/GP out-of-pocket or retained earnings from prior deals).

**Uses side:**
- Land acquisition cost.
- Hard costs (construction labor, materials, equipment).
- Soft costs (architect, engineering, permitting, insurance).
- Financing costs (commitment fees, interest reserves).
- Contingency reserve.

E81 sums sources, sums uses, and compares. If they differ by more than $0.01 (tolerance), it flags the issue and the direction (shortfall or surplus). It does not reforecast or adjust figures — that's the deal underwriter's role — but it makes the reconciliation transparent.

## 4. Sourced conventions

**Financing cost derivation:** E81 reuses E8 (Capital Stack)'s calculation of commitment fees and interest reserves. If E78 (Financing Table) is available, `facilities` includes both the facility amounts and their computed financing costs. If E78 isn't available yet, callers can pass `facilities: []` and supply `uses.financingCosts` explicitly — this flags the integration point without silently computing financing costs from incomplete data.

**$0.01 tolerance:** Under real-world conditions (rounding, currency conversion, floating-point arithmetic), sources and uses may differ by pennies. A $0.01 tolerance is standard in real estate models. If `|delta| > $0.01`, the result flags it as unbalanced and names the issue ("$0.47 shortfall" or "$1.23 surplus").

**Six-month combined-transaction window (BC only):** When E82 (Acquisition Structure) supplies multi-parcel assemblies, E81 must be aware that BC's Property Transfer Tax treats multiple parcels in the same transaction differently from separate transactions. E81 assumes all `facilities` and parcels belong to the same taxable transaction; see E82's documentation for the rules and edge cases.

## 5. When to use E81

**UI Integration:** Dev Studio Overview tab — displays a reconciliation summary (Sources total, Uses total, Delta, Balanced Y/N, Issues list).

**Workflow:** E81 is called after:
- E8 (capital stack sized) or E78 (financing table ready)
- All hard costs, soft costs, and contingency are entered
- Land acquisition cost and equity contribution are finalized

E81 acts as a validation checkpoint: if unbalanced, the deal model is incomplete and needs adjustment before proceeding to other analyses.

**Upstream dependencies:**
- E8 (Capital Stack) — for financing cost calculation (via calculateCapitalStack)
- E78 (Financing Table) — for per-facility amounts (optional; callers can provide facilities array directly or pass empty array and supply financing costs explicitly)

## 6. Data contracts (TypeScript types)

### Input: `SourcesUsesInput`

```typescript
export interface SourcesUsesUsesInput {
  landAcquisitionCost: number;
  hardCosts: number;
  softCosts: number;
  contingency: number;
  /**
   * Optional — when omitted, financing costs are derived from `facilities`
   * (Σ interestReserveAmount + Σ commitmentFeeAmount, via
   * calculateCapitalStack() from E8-capitalstack.ts, the same computation
   * E78-financing-table.ts's per-facility summaries already use) so
   * callers don't have to duplicate that math. Supply this explicitly only
   * when the financing-table integration (E78) isn't available to a given
   * caller yet.
   */
  financingCosts?: number;
}

export interface SourcesUsesInput {
  uses: SourcesUsesUsesInput;
  /**
   * Reuses E78-financing-table.ts's FinancingFacility (a Tranche + id) —
   * each facility's own `amount` is its Sources contribution, and
   * interestReserveAmount/commitmentFeePercent drive the Uses-side
   * "financing costs" figure when uses.financingCosts is omitted. If the
   * E78 integration hasn't landed in a given caller yet, pass `[]` here and
   * set uses.financingCosts explicitly instead — that's the flagged
   * integration point for a later pass, not a silent gap.
   */
  facilities: FinancingFacility[];
  /**
   * LP/sponsor equity not already represented as an "equity"-type facility
   * in `facilities`. Added on top of whatever `facilities` contribute —
   * not a duplicate of any equity-type facility's amount, so don't model
   * the same equity check both ways.
   */
  sponsorEquityAmount: number;
}
```

### Output: `SourcesUsesResult`

```typescript
export interface SourcesBreakdown {
  facilities: SourcesUsesLineItem[];  // [{ label: facility.id, amount }, ...]
  sponsorEquity: number;
  total: number;
}

export interface UsesBreakdown {
  landAcquisitionCost: number;
  hardCosts: number;
  softCosts: number;
  financingCosts: number;
  contingency: number;
  total: number;
}

export interface SourcesUsesResult {
  sources: SourcesBreakdown;
  uses: UsesBreakdown;
  /** sources.total - uses.total. 0 (within SOURCES_USES_BALANCE_TOLERANCE) when balanced; never rounded or forced to 0 otherwise. */
  delta: number;
  /** True only when |delta| is within SOURCES_USES_BALANCE_TOLERANCE — a real reconciliation check, not a display rounding. */
  balanced: boolean;
  /** Empty when balanced. Otherwise names the exact shortfall/surplus and its direction — never silently absorbed into either total. */
  issues: string[];
}
```

## 7. Golden tests excerpt

E81's test suite verifies:

1. **Sources aggregation:** debt facilities summed correctly; sponsor equity added separately (not double-counted if already in facilities as equity-type tranche).
2. **Uses aggregation:** land + hard + soft + financing costs + contingency all summed correctly.
3. **Delta calculation:** |sources.total - uses.total| computed precisely; never rounded.
4. **Tolerance check:** delta within $0.01 → balanced=true, issues=[]; delta outside → balanced=false, issues=["$X.XX shortfall"/"$X.XX surplus"].
5. **Financing cost reuse:** when facilities are provided and uses.financingCosts is omitted, E8's calculateCapitalStack is called and financing costs are derived from commitment fees + interest reserves (no duplication of that formula).

## 8. Integration notes

**Dev Studio Overview tab:**
- **Reconciliation panel:** displays Sources and Uses each as a breakdown (list of line items + total).
- **Delta indicator:** shows the delta amount and whether balanced (green checkmark / red X).
- **Issues list:** if unbalanced, displays the exact shortfall or surplus.
- **Drill-down:** user can click to see detailed line-item breakdown for each section.

**Workflow trigger:** if unbalanced, the UI typically prevents proceeding to deal-closing or funding stages until E81 confirms balance. This is a guard against incomplete deal models.

*End of Doc 70 · Companions: none*
