# InvestScape — Build Checklist Addendum A: Tax Bracket Table / PTT Engine (Supabase/Calc-Engine) — Doc 03 Addendum A

**Supersedes `03-Bubble-Build-Checklist-Addendum-A-TaxBracketTable.md`.** Strictly additive to Doc 03. Build this once Development Studio's core schema (Doc 02 Addendum A) exists in Supabase. Same priority note as before, unchanged reasoning: this is the one piece worth building first, since every parcel's PTT number depends on it, and it's the one part of the schema populated with real government data from day one rather than test data.

**Where this lives now:** the bracket-summing logic moves from a Bubble backend workflow (with a Toolbox "Run javascript" escape hatch bolted on, because Bubble's native workflow actions don't loop cleanly) into the calc-engine service itself, as an ordinary TypeScript function. There's no escape hatch needed because there's no host platform to escape from — this was always going to be real code; it just used to be real code awkwardly embedded inside a no-code tool.

---

## STAGE D0 — Confirm the two tables exist (5 min)

Already specified in `02-Database-Schema-Addendum-A-DevStudio-Supabase.md` — just confirm both exist in Supabase before continuing:
- `tax_bracket_tables` (`jurisdiction`, `property_class`, `effective_date`, `label`)
- `tax_bracket_rows` (`tax_bracket_table_id`, `bracket_order`, `lower_bound`, `upper_bound`, `rate`)

## STAGE D1 — Populate the BC bracket data by hand (10 min)

Supabase Table Editor (or a one-off `INSERT`) → `tax_bracket_tables` → create one row:

```sql
INSERT INTO tax_bracket_tables (jurisdiction, property_class, effective_date, label)
VALUES ('British Columbia', 'Residential', CURRENT_DATE, 'BC PTT 2026')
RETURNING id;
```

Then insert four `tax_bracket_rows`, linked via the returned `id`:

```sql
INSERT INTO tax_bracket_rows (tax_bracket_table_id, bracket_order, lower_bound, upper_bound, rate) VALUES
  ('<id from above>', 1, 0,       200000,  0.01),
  ('<id from above>', 2, 200000,  2000000, 0.02),
  ('<id from above>', 3, 2000000, 3000000, 0.03),
  ('<id from above>', 4, 3000000, NULL,    0.05);
```

Leave the top row's `upper_bound` as `NULL` — same "and above" signal as before, handled in the calc-engine function below exactly the way it was handled in the old JavaScript.

**Note for later, unchanged:** BC's PTT rates and thresholds change with provincial budgets — already an admin-editable setting by design (`JurisdictionSetting` principle from the project's key learnings). When that happens, don't edit these rows — insert a new `tax_bracket_tables` row with a new `effective_date` and point new parcels at it via the query in Stage D2. Keeping history means old deals still calculate correctly with the rates that applied when they were entered. This reasoning never depended on Bubble; it's a data-modeling principle, not a platform one.

## STAGE D2 — Build the calculation function (20–30 min, shorter than the Bubble version)

This lives in the calc-engine service, as a function called from the same request path as `calc-deal-metrics` (or its own endpoint, `POST /calc-parcel-ptt` — either is fine; keep it consistent with how the rest of Development Studio's per-parcel calculations are exposed once Addendum A's other formulas are wired in).

1. **Fetch the current bracket table**, scoped by jurisdiction and property class, most recent `effective_date` first — this is a plain Supabase query, not a workflow step:
   ```typescript
   const { data: table } = await supabase
     .from('tax_bracket_tables')
     .select('id')
     .eq('jurisdiction', parcel.jurisdiction)
     .eq('property_class', parcel.propertyClass)
     .order('effective_date', { ascending: false })
     .limit(1)
     .single();

   const { data: brackets } = await supabase
     .from('tax_bracket_rows')
     .select('lower_bound, upper_bound, rate')
     .eq('tax_bracket_table_id', table.id)
     .order('bracket_order', { ascending: true });
   ```
2. **Sum the brackets.** This is the exact same arithmetic as the old Toolbox JS action — bracket-tax math doesn't change when the runtime does. The only difference is where it runs:
   ```typescript
   function calcPTT(value: number, brackets: { lower_bound: number; upper_bound: number | null; rate: number }[]): number {
     let ptt = 0;
     for (const b of brackets) {
       const upper = b.upper_bound === null ? value : Math.min(b.upper_bound, value);
       const taxable = Math.max(0, upper - b.lower_bound);
       ptt += taxable * b.rate;
       if (b.upper_bound === null || value <= b.upper_bound) break;
     }
     return ptt;
   }
   ```
3. **Apply the Bare Trust/Share override:** if `parcel.acquisition_structure === 'Bare Trust/Share'`, set `ptt = 0`; otherwise `ptt = calcPTT(...)`. Same rule as before — this override existed because bare-trust acquisitions can legitimately zero out PTT exposure, not because the tax math changes.
4. **Write the result** to `parcels.ptt` using the calc-engine's service-role Supabase client (same single-writer pattern as every other calc-written column in this schema — see Doc 02 §3's note on why the client role never gets write access to computed columns).
5. **Trigger:** call this whenever a parcel is created or its `purchase_price` / `property_class` / `acquisition_structure` changes — same trigger *intent* as the Bubble version's "schedule this workflow" step, but now it's just: WeWeb calls the calc-engine's endpoint after any of those fields change, the same way Doc 03 Stage 6's wizard calls `/calc-deal-metrics` after submit. No separate scheduling mechanism needed, because there's no workflow-scheduling concept distinct from "call the endpoint" in this stack.

## STAGE D3 — Test against the validated figure (10 min)

Unchanged from the Bubble version — this test doesn't care which platform computed the number, only whether the number is right.

Create one test parcel: `purchase_price = 22,000,000`, `property_class = Residential`, `acquisition_structure = Asset Purchase`. Call the calc-engine's PTT function directly (or through its endpoint) against that test row.

**Expected result: $1,018,000.** Still the exact figure validated against the 796 Main Street workbook in the Doc 06 Addendum A formula validation. Do not proceed to wiring this into the Land & Site tab until this test passes to the dollar — that bar hasn't moved and shouldn't.

Then flip `acquisition_structure` to `Bare Trust/Share` on the same test parcel and re-run — expected result: `$0`, with the AI narrative layer (per `05-Claude-API-Narrative-Prompt-Template.md`, once its own Supabase/calc-engine rewrite is complete) surfacing a note that this structure carries legal-advice implications the platform doesn't provide. That narrative call now happens from inside the calc-engine service itself (Doc 03 Stage 9), not a Bubble API Connector.

## STAGE D4 — Wire into the Land & Site tab UI

Unchanged in substance. Once Stage D3 passes, the parcel's `ptt` value just displays in WeWeb — bound directly to the `parcels.ptt` column via a Supabase collection query, no further logic needed in the front end. Show it as its own line item under each parcel, and roll it into the parcel's "all-in land cost" (price + PTT + legal/closing) per Doc 07 §5.1.

---

## What changed, briefly

This addendum is small enough that a full "what changed" section would repeat itself, so the short version: the bracket-lookup query and the bracket-summing loop both moved from Bubble (a "Get data" search plus a bolted-on JS escape hatch) into the calc-engine service (a plain query plus a plain function) — same math, same test bar, same admin-editable-history principle for future rate changes, different and simpler runtime underneath.

---
*End of Doc 03 Addendum A (Supabase/calc-engine revision) · Supersedes: 03-Bubble-Build-Checklist-Addendum-A-TaxBracketTable.md · Parent: 03-Build-Checklist-WeWeb-Supabase.md · Depends on: 02-Database-Schema-Addendum-A-DevStudio-Supabase.md, 06-Commercial-Formula-Library-Addendum-A (F-701)*
