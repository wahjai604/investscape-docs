# InvestScape — Doc 67: E78 — Financing Table

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E78 was built directly as part of Batch F (Phase 2b: Financing & Deal Quality engines). This doc registers the engine, verifies its exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E78):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file — not copied from the build prompt.

## 1. Numbering convention

One E-number per cohesive file: E78 is `investscape-calc-engine/src/E78-financing-table.ts`, with supporting types in `src/types/E78-financing-table.types.ts`. Consistent with existing convention — no E-number assigned to types-only support files.

E78 continues directly from E77 (the last US Qualifier Engine number, Doc 65) — append-only per Doc 56 R1.

## 2. E78: Financing Table

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E78 | `investscape-calc-engine` | `src/E78-financing-table.ts` | Multi-facility capital stack scheduling — period-by-period balance and interest tracking across senior debt, mezzanine, presale deposits, and equity tranches | `calculateFinancingTable` |

## 3. Problem statement

Real-world acquisitions and developments carry multiple simultaneous financing facilities: senior mortgages, mezzanine loans, presale deposits, and equity contributions. Each facility has its own draw schedule, amortization period, and interest accrual pattern. Investors need to see:

1. **Per-facility summaries:** commitment fee, net advance, interest reserve amount, period-by-period interest depletion from reserve.
2. **Combined timeline:** period-by-period outstanding balance across all facilities, as a series suitable for stacked-area charting.
3. **Capital stack context:** the same E8 (Capital Stack) calculation that sized each facility's net advance.

E78 orchestrates this without duplicating E8's tranche logic — it reuses E8's `calculateCapitalStack()` and layering rules, then adds the temporal dimension (periods × balance/interest tracking) and charting-ready output.

## 4. Sourced conventions

**Tranche types and ordering:** E78 inherits E8's four-tranche precedent and ordering (senior debt → mezzanine → presale deposit → equity). Each tranche's amortization schedule is computed fresh via E2 (Amortization) for its specified `amortizationYears`, or via a distinct presale-deposit draw/bullet schedule for presale facilities.

**Period-by-period layout:** 
- **Senior and mezzanine tranches:** run their full amortization schedule (amortizationYears × 12 months). If that schedule is shorter than the requested `months` parameter, balances pad with $0.
- **Presale deposits:** use the requested `months` directly as their bullet-repayment month; they have no amortizationYears of their own (see E2 documentation).
- **Equity facilities:** carry no schedule; they are listed in FacilitySummary but omitted from combinedSeries (no balance to track).

**Interest reserve depletion:** Each facility's interest reserve is drawn down monthly by accrued interest. Once depleted, `reserveDepleted: true` signals the depletion event and persists thereafter. The reserve's purpose is to cover expected interest before the property's own cash flow can (typical in early construction/stabilization phases).

## 5. When to use E78

**UI Integration:** Dev Studio Financing tab — displays per-facility summaries and a stacked-area chart of combined balances over the project timeline.

**Workflow:** E78 is called after E8 (capital stack is sized) and requires explicit `months` parameter representing the entire project timeline (construction + stabilization + hold). 

**Upstream dependencies:** 
- E8 (Capital Stack) — for tranche sizing, commitment fees, net advances
- E2 (Amortization) — for debt amortization schedules

## 6. Data contracts (TypeScript types)

### Input: `FinancingTableInput`

```typescript
export interface FinancingFacility extends Tranche {
  id: string;
}

export interface FinancingTableInput {
  facilities: FinancingFacility[];
  taxRate?: number;
  /**
   * Number of months the combined timeline covers. Amortizing facilities
   * (senior_debt/mezzanine) run their own amortizationYears*12 schedule and
   * are padded with a $0 balance beyond payoff if that's shorter than
   * months; presale_deposit facilities use this as their bullet
   * repaymentMonth, since they have no amortizationYears of their own.
   */
  months: number;
}
```

### Output: `FinancingTableResult`

```typescript
export interface FacilitySummary {
  id: string;
  type: TrancheType;
  amount: number;
  commitmentFeeAmount: number;
  netAdvance: number;
  interestReserveAmount: number;
  /** Empty when interestReserveAmount is 0/omitted — nothing to draw down. */
  interestReserveSchedule: FacilityInterestReserveRow[];
}

export interface CombinedPeriodRow {
  period: number;
  /** This period's outstanding balance per facility id — the series a stacked area/line chart plots directly. Equity facilities are omitted (they carry no balance/schedule). */
  balancesByFacility: Record<string, number>;
  totalOutstanding: number;
}

export interface FinancingTableResult {
  capitalStack: CapitalStackResult;
  facilities: FacilitySummary[];
  /** Period-by-period ($ y-axis, period x-axis) combined series across every non-equity facility. */
  combinedSeries: CombinedPeriodRow[];
}
```

## 7. Golden tests excerpt

E78's test suite verifies:

1. **Multi-tranche orchestration:** senior + mezzanine + presale deposit + equity all co-exist; senior and mezzanine amortize as expected; equity carries no schedule.
2. **Interest reserve depletion:** reserve balance decreases each period; `reserveDepleted` flag triggers once reserve hits $0 and persists.
3. **Months padding:** when amortization schedule is shorter than `months`, trailing rows show $0 balance.
4. **Chart-ready output:** `combinedSeries` sums all non-equity facility balances per period and is directly plottable as a series.
5. **Capital stack reuse:** E78's `capitalStack` output matches E8's calculation exactly (no re-derivation of commitment fees or net advances).

## 8. Integration notes

**Dev Studio Financing tab:**
- Displays `facilities` array as a per-facility summary table (ID, Type, Amount, Net Advance, Interest Reserve).
- Plots `combinedSeries` as a stacked-area chart (balance over time) with facility-id legend.
- Draws `FacilityInterestReserveRow` schedule on demand (typically hidden until user clicks "Facility Details").

**Upstream callers:**
- E78 is called after E8 (capital stack is finalized).
- No downstream engines depend on E78's output directly; it exists for UI charting and financial transparency.

*End of Doc 67 · Companions: none*
