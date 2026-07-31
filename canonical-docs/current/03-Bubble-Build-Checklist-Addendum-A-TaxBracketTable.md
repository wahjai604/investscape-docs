# InvestScape — Build Checklist Addendum A: TaxBracketTable / PTT Engine

**Strictly additive to Document 03.** Build this once Development Studio's core schema (Addendum A to Doc 02) exists. This is the one piece worth building first, since every Parcel's PTT number depends on it and it's real government data rather than test data.

---

## STAGE D0 — Create the two data types (15 min)

Already specified in Doc 02 Addendum A — just confirm both exist before continuing:
- `TaxBracketTable` (Jurisdiction, PropertyClass, EffectiveDate, Label)
- `TaxBracketRow` (TaxBracketTable link, Order, LowerBound, UpperBound, Rate)

## STAGE D1 — Populate the BC bracket data by hand (10 min)

Data tab → App data → `TaxBracketTable` → create new row:
- Jurisdiction: `British Columbia`
- PropertyClass: `Residential`
- EffectiveDate: today's date
- Label: `BC PTT 2026`

Then create four `TaxBracketRow` records, each linked to that TaxBracketTable row:

| Order | LowerBound | UpperBound | Rate |
|---|---|---|---|
| 1 | 0 | 200000 | 0.01 |
| 2 | 200000 | 2000000 | 0.02 |
| 3 | 2000000 | 3000000 | 0.03 |
| 4 | 3000000 | *(leave blank)* | 0.05 |

Leave the top row's UpperBound empty — that's your "and above" signal, handled in the workflow below.

**Note for later:** BC's PTT rates and thresholds change with provincial budgets (already flagged in your notes as an admin-editable setting). When that happens, don't edit these rows — create a new `TaxBracketTable` with a new `EffectiveDate` and point new Parcels at it. Keeping history means old deals still calculate correctly with the rates that applied when they were entered.

## STAGE D2 — Build the calculation workflow (30–45 min)

This is a **backend workflow** (same pattern as `calc-deal-metrics` from Doc 03 Stage 3), because it needs to loop through bracket rows and sum, which is easier server-side.

1. Backend workflows page → New API workflow: `calc-parcel-ptt`
2. Parameter: `parcel` (type Parcel)
3. Steps:
   - **Step 1:** "Get data" — search `TaxBracketTable` where Jurisdiction = Parcel's DevProject's Jurisdiction and PropertyClass = Parcel's PropertyClass, sorted by EffectiveDate descending, item #1 (this gets you the *current* table even after future rate changes create new tables).
   - **Step 2:** "Get data" — search `TaxBracketRow` where TaxBracketTable = Step 1's result, sorted by Order ascending.
   - **Step 3:** Use a **Toolbox "Run javascript"** action (same plugin you already installed in Stage 0) to loop the bracket rows and sum. This is the one place JS is genuinely simpler than chained Bubble math — a bracket calculation is a loop with a conditional, and Bubble's native workflow actions don't loop cleanly.

   The JavaScript itself (paste into the Run Javascript action — this is standard bracket-tax arithmetic, not proprietary):
   ```javascript
   const value = properties.parcel_value;
   const brackets = properties.bracket_rows; // list of {lower, upper, rate}
   let ptt = 0;
   for (const b of brackets) {
     const upper = b.upper === null ? value : Math.min(b.upper, value);
     const taxable = Math.max(0, upper - b.lower);
     ptt += taxable * b.rate;
     if (value <= b.upper || b.upper === null) break;
   }
   return ptt;
   ```
   - **Step 4:** "Make changes to Parcel" — if AcquisitionStructure = Bare Trust/Share, set PTT = 0; otherwise set PTT = Step 3's result.

4. **Schedule this workflow** to run whenever a Parcel is created or its PurchasePrice/PropertyClass/AcquisitionStructure changes — same trigger pattern as `calc-deal-metrics`.

## STAGE D3 — Test against the validated figure (10 min)

Create one test Parcel: PurchasePrice = $22,000,000, PropertyClass = Residential, AcquisitionStructure = Asset Purchase. Run `calc-parcel-ptt` manually from the editor.

**Expected result: $1,018,000.** This is the exact figure validated against the 796 Main Street workbook in the Doc 06 Addendum A formula validation — do not proceed to wiring this into the Land & Site tab until this test passes to the dollar.

Then flip AcquisitionStructure to Bare Trust/Share on the same test row and re-run — expected result: $0, with the AI narrative layer (per Doc 05's template) surfacing a note that this structure carries legal-advice implications your platform doesn't provide.

## STAGE D4 — Wire into the Land & Site tab UI

Once the above passes, the Parcel's PTT field just displays — no further logic needed in the front end. Show it as its own line item under each parcel, and roll it into the parcel's "all-in land cost" (price + PTT + legal/closing) per Doc 07 §5.1.

---
*End of Addendum A · Parent document: 03-Bubble-Build-Checklist.md · Depends on: 02-Bubble-Database-Schema-Addendum-A, 06-Commercial-Formula-Library-Addendum-A (F-701)*
