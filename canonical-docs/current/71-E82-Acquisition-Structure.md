# InvestScape — Doc 71: E82 — Acquisition Structure

**Lighthouse Research Ltd. · 20 August 2026**
**No companion proposal doc.** E82 was built directly as part of Batch F (Phase 2b: Financing & Deal Quality engines). This doc registers the engine, verifies its exports against source, and documents sourced conventions.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E82):** Batch F completion (2026-08-20), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file — not copied from the build prompt.

## 1. Numbering convention

One E-number per cohesive file: E82 is `investscape-calc-engine/src/E82-acquisition-structure.ts`, with supporting types in `src/types/E82-acquisition-structure.types.ts`. Consistent with existing convention — no E-number assigned to types-only support files.

E82 continues directly from E81 (Sources ≡ Uses) — append-only per Doc 56 R1.

## 2. E82: Acquisition Structure

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E82 | `investscape-calc-engine` | `src/E82-acquisition-structure.ts` | Multi-parcel assemblies and bare-trust PTT triggering — allocates Property Transfer Tax per parcel based on legal acquisition structure (asset purchase vs. bare trust), per-parcel FMV/price tracking, and combined-transaction bracketing | `calculateAcquisitionStructure` |

## 3. Problem statement

Multi-parcel land assemblies present two modeling challenges:

**1. Combined vs. per-parcel bracketing (BC only):**
BC's Property Transfer Tax applies to individual transfers (registered title changes). When a developer assembles multiple parcels in a single transaction (same buyer, same closing date, or within the six-month combined-transaction window), BC PTT brackets are applied once to the *combined* purchase price and FMV, not separately per parcel. This produces a different tax burden than if each parcel were transferred independently.

E11 (Provincial Transfer Tax) handles single-parcel PTT correctly, but it doesn't know about assemblies. E82 wraps E11's logic: it accepts a multi-parcel assembly, calls E11 once with combined figures, then allocates the resulting PTT back to each parcel proportionally by its share of the combined purchase price.

**2. Asset purchase vs. bare trust (BC only):**
BC PTT applies only to *registered legal-title transfers*. In a bare-trust structure, legal title is registered to a bare trustee while the buyer holds beneficial ownership (typically by owning the trustee entity's shares). Acquiring beneficial interest does not trigger a legal-title transfer, and BC PTT does not apply until the trustee's shares (or beneficial interest) are eventually sold.

In a traditional asset purchase, legal title transfers directly to the buyer — PTT is triggered immediately.

E82 models both structures: it computes the "full PTT burden" (what would be owed if structured as asset purchase) for reference, then signals whether PTT is currently triggered based on the chosen acquisition structure.

## 4. Sourced conventions

**Multi-parcel combined-transaction rule (BC):**
Per BC's Property Transfer Tax Act, when multiple parcels are acquired by the same buyer within a six-month period as part of a single economic transaction, the transaction is treated as a combined transfer for PTT purposes. The brackets are applied once to the combined value, not to each parcel independently.

**Source:** BC Finance Ministry guidance on PTT for assemblies (e.g., development land purchased over a few months but combined for tax purposes).

**Asset purchase vs. bare trust (BC):**
- **Asset purchase:** buyer's legal title registers directly. PTT is triggered immediately on the registered transfer.
- **Bare trust:** buyer's beneficial interest is held while legal title is registered to a bare trustee. No legal-title transfer is registered, so no PTT-triggering event occurs. PTT becomes due only if/when the trustee's shares or the beneficial interest are sold.

**Source:** BC case law and Property Transfer Tax Act §1 (applies only to "transfer of land" — interpreted as registered legal-title change, not beneficial-interest changes).

**Per-parcel allocation (informational):**
E82 allocates the combined PTT back to each parcel by its proportional share of the assembly's purchase price. This is informational only — BC assesses PTT once on the combined transaction, not independently per parcel. The per-parcel allocation allows the UI to show tax burden by parcel for transparency, but does not re-bracket or modify the total.

## 5. When to use E82

**UI Integration:** Dev Studio Land tab (BC only, non-US projects) — displays multi-parcel summary, combined PTT calculation, per-parcel allocation, and acquisition-structure choice with explanation of tax impact.

**Workflow:** E82 is called after:
- All parcels are entered (ID, purchase price, FMV, property size, secondary-building flag).
- Buyer details are finalized (country=Canada/US, province, FTHB status, principal residence flag).
- Acquisition structure is chosen (asset purchase or bare trust).

E82 does not trigger deal closure; it's a reference calculation. If bare trust is chosen, it flags "no PTT currently triggered" to remind the deal team of the deferred-tax implication.

**Upstream dependencies:**
- E11 (Provincial Transfer Tax) — for combined PTT calculation via calculatePTT(), called unmodified with summed parcel figures.
- E82 is a standalone caller of E11; no other engines depend on E82's output.

**Geography:** E82 is designed for BC (Canada) acquisitions. For US parcels, acquisitionStructure is ignored (asset purchase is universal; no bare-trust PTT deferral exists in US real estate law). For non-BC Canadian provinces, acquisition structure impact may differ — see §6 for input/output specification of the country/province flags.

## 6. Data contracts (TypeScript types)

### Input: `AcquisitionStructureInput`

```typescript
export interface AssemblyParcel {
  id: string;
  purchasePrice: number;
  fmv: number;
  propertySize_hectares: number;
  hasSecondaryBuilding: boolean;
}

/**
 * asset_purchase: legal title to every parcel registers directly to the
 * buyer — the ordinary case calculatePTT() (E11) already models.
 *
 * bare_trust: legal title is registered to a bare trustee while the buyer
 * holds beneficial ownership (typically by owning the trustee entity's
 * shares); acquiring that beneficial interest does not register a transfer
 * of legal title, and BC's PTT applies only to registered legal-title
 * transfers — see calculateAcquisitionStructure()'s doc comment for the
 * full sourced explanation.
 */
export type AcquisitionStructure = "asset_purchase" | "bare_trust";

export interface AcquisitionStructureInput {
  /**
   * All parcels here are assumed to belong to the SAME taxable transaction
   * (same buyer, one deal or a series of related transfers within BC's
   * six-month combined-transaction window) — see
   * calculateAcquisitionStructure()'s combinedCalculationNote. Parcels that
   * are actually unrelated transfers to different buyers, or outside that
   * window, should be run through calculatePTT() separately instead of
   * being assembled here.
   */
  parcels: AssemblyParcel[];
  country: "Canada" | "US";
  province: string;
  acquisitionStructure: AcquisitionStructure;
  /** Applied to the assembly as a whole (one buyer, one taxable transaction) — not per parcel. */
  isFTHB: boolean;
  isPrincipalResidence: boolean;
}
```

### Output: `AcquisitionStructureResult`

```typescript
export interface ParcelPTTAllocation {
  id: string;
  purchasePrice: number;
  fmv: number;
  /**
   * This parcel's proportional share of `combined.ptt_amount`, allocated
   * by its share of the assembly's combined purchase price. Informational
   * only — BC assesses PTT once on the combined transaction (see
   * `combined` and combinedCalculationNote), not independently per parcel;
   * this is NOT a re-bracketed per-parcel calculation. null when
   * combined.ptt_amount is null (no calculable PTT — non-BC/US) or the
   * assembly's combined purchase price is 0.
   */
  allocatedPTT: number | null;
}

export interface AcquisitionStructureResult {
  parcels: ParcelPTTAllocation[];
  /**
   * The real BC PTT calculation (via calculatePTT() from E11, unmodified)
   * for this assembly: general/FTHB brackets applied once to the combined
   * purchase price/FMV of every parcel — the "as if legal title transferred
   * directly" reference figure. NOT adjusted for acquisitionStructure; see
   * pttCurrentlyTriggered for whether it's actually payable now.
   */
  combined: PTTResult;
  combinedPurchasePrice: number;
  combinedFMV: number;
  acquisitionStructure: AcquisitionStructure;
  /**
   * Whether combined.ptt_amount is actually payable now, given
   * acquisitionStructure. False for "bare_trust" — no legal-title transfer
   * is registered, so no PTT-triggering event has occurred yet. True for
   * "asset_purchase".
   */
  pttCurrentlyTriggered: boolean;
  /** Explains the combined-vs-per-parcel bracket rule for a multi-parcel assembly, and cites its source. */
  combinedCalculationNote: string;
  /** Explains why/whether PTT is triggered under the chosen acquisitionStructure, and cites its source. */
  acquisitionStructureNote: string;
}
```

## 7. Golden tests excerpt

E82's test suite verifies:

1. **Multi-parcel aggregation:** purchase price, FMV, secondary buildings, property size all summed correctly across parcels.
2. **Combined PTT calculation:** E11's calculatePTT() is called once with combined figures (not per-parcel); result matches E11's bracket logic.
3. **Per-parcel allocation:** each parcel's allocatedPTT = combined.ptt_amount × (parcel.purchasePrice / assembly.combinedPurchasePrice). Null when combined.ptt_amount is null or combined purchase price is 0.
4. **Asset purchase:** `pttCurrentlyTriggered=true`, combined PTT is payable immediately.
5. **Bare trust:** `pttCurrentlyTriggered=false`, combined PTT is deferred (payable only if shares/beneficial interest are later sold).
6. **Non-BC/US:** combined.ptt_amount is null (no calculable PTT); allocatedPTT is null for all parcels; UI should not display PTT figures.

## 8. Integration notes

**Dev Studio Land tab (BC only):**
- **Parcel list:** displays each parcel (ID, purchase price, FMV, property size, secondary building flag).
- **Combined totals:** sums across all parcels.
- **Combined PTT:** displays the E11 result for the assembly (bracket, rate, total PTT if asset purchase).
- **Per-parcel allocation:** optional drill-down showing each parcel's proportional share of combined PTT (for transparency; not re-bracketed).
- **Acquisition structure selector:** radio buttons or dropdown (Asset Purchase / Bare Trust) with explanatory text:
  - **Asset Purchase:** "PTT is payable on closing. Legal title transfers to buyer. Tax is due immediately."
  - **Bare Trust:** "No PTT is payable now. Legal title is held by bare trustee; buyer owns beneficial interest via trustee entity. PTT becomes due only if trustee entity shares are later sold."
- **pttCurrentlyTriggered indicator:** green checkmark (PTT payable) or orange warning ("PTT deferred — becomes payable if beneficial interest is sold").

**US-only and non-BC-Canada projects:** E82's acquisition structure input is ignored; combined PTT is computed and per-parcel allocation shown, but `pttCurrentlyTriggered` is always true (asset purchase is the only US real-estate acquisition structure that exists in this model). Bare-trust option is not presented to users in US or non-BC workflows.

*End of Doc 71 · Companions: none*
