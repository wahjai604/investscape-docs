# InvestScape — Claude API Extraction Prompt Template (Doc 14)

**Companion to Doc 10 §3 Stage I3, Doc 02 Addendum A (schema), and Doc 05 (Claude API Narrative Prompt Template — deliberately not reused here).** This is Stage I3's foundation, and the reason it's the first thing built rather than the review screen: the review screen just displays whatever this prompt produces, so getting the extraction contract right comes first. Doc 10 already named the reason these can't share a prompt — extraction and narration are different jobs with different failure modes, and conflating them risks the narrative prompt's "never invent data" discipline getting diluted, or extraction inheriting narration's softer tone when it needs to return strict typed JSON.

---

## 1. System prompt (paste into the API Connector call for `process-proforma-extraction`)

```
You are a data extraction engine for InvestScape's Development Studio. Your only job is to read an uploaded real estate development proforma (Excel or PDF) and extract values that are explicitly present in the source document into a fixed JSON schema.

You do not calculate, estimate, advise, or interpret. You do not compute derived values — the platform's own formula engine computes those separately, and any derived value you output would be discarded. If a field is not explicitly stated in the source document, omit it or set it to null. Never fabricate a plausible-sounding number to fill a gap.

If a value is ambiguous — split across conflicting sheets, illegible, or unclear which category it belongs to — do not guess. List it in confidence_flags with a short reason instead.

Output strict JSON only. No markdown code fences, no commentary before or after, no explanation of your reasoning inside the JSON itself. If the document contains nothing extractable for a given table, return an empty array for it rather than omitting the key.
```

## 2. Output JSON schema

Field names match Doc 02 Addendum A exactly — this isn't a paraphrase, it's copy-ready for the `ImportBatch.ExtractedJSON` field.

```json
{
  "parcel": {
    "Location": "string or null",
    "LotSizeSF": "number or null",
    "Zoning": "string or null",
    "FSRMultiplier": "number or null",
    "PurchasePrice": "number or null",
    "BCAssessment": "number or null",
    "PropertyClass": "Residential | Commercial | Mixed | null",
    "AcquisitionStructure": "Asset Purchase | Bare Trust/Share | null",
    "LandBrokerFeePct": "number or null",
    "LegalClosingPerLot": "number or null"
  },
  "tenure_components": [
    {
      "Tenure": "Market Sellable | Market Rental | CMHC Rental | Non-Market Rental | Density Offset",
      "FARShare": "number or null",
      "SF": "number or null",
      "UnitCount": "number or null",
      "RentPSFMonthly": "number or null",
      "ExpenseRatio": "number or null",
      "CapRate": "number or null"
    }
  ],
  "unit_sales": [
    {
      "SuiteNo": "string or null",
      "StrataLot": "string or null",
      "UnitType": "string or null",
      "SizeSF": "number or null",
      "SalesPrice": "number or null",
      "View": "string or null",
      "FloorPremium": "number or null",
      "CommissionRate": "number or null"
    }
  ],
  "budget_lines": [
    {
      "Group": "Land | Hard | Soft | Financing",
      "Subgroup": "string",
      "Label": "string",
      "Amount": "number",
      "IsContingency": "boolean"
    }
  ],
  "confidence_flags": [
    { "field": "string, e.g. budget_lines[12].Group", "reason": "string, short and specific" }
  ]
}
```

**Deliberately excluded from this schema — never ask the model to produce these:** `BuildableSF`, `PTT` on Parcel; `ComponentValue` on TenureComponent; `PricePSF`, `CommissionAmount` on UnitSale. All four are marked `(calc)` in Doc 02 Addendum A — the formula engine computes them from the fields above. If the model extracted them anyway, whatever it produced would be AI-computed math sitting in the same JSON as AI-extracted facts, with no visual distinction on the review screen between "this is what the document said" and "this is what the model calculated." That's the exact failure mode Doc 10 §0 exists to prevent. Even though a document might display these calculated values too (e.g. a proforma showing its own PTT figure), don't extract them — the platform recalculates independently, and a stray extracted PTT sitting next to the engine's own PTT invites confusion about which one is authoritative. There's only ever one authoritative number: the one the engine computes.

## 3. Confidence flagging — what actually belongs there

Flag, don't guess, when:
- A budget line's Group (Land/Hard/Soft/Financing) isn't obvious from its label or the sheet it came from.
- A number appears differently across two sheets in the same workbook (e.g. a purchase price stated in both a summary tab and a detail tab that don't match).
- A value is present but the unit is unclear (is this SF gross or net buildable? PSF monthly or annual?).
- OCR or table-extraction confidence is inherently low — a scanned or image-based PDF where digits could be misread.

Don't flag: a field that's simply absent from the document. That's a null, not a low-confidence guess — there's nothing to be uncertain about if the source never mentioned it.

## 4. Worked example — using 796 Main Street as the reference case

796 Main Street is the validated source data from `dev-studio-proforma-dissection-summary.md` and `dev-studio-796-budgetline-dissection.csv` — useful here because the correct output is already known, so it's a real test case, not a hypothetical.

A correct `parcel` extraction from that file's Property Purchase Info sheet:
```json
{
  "Location": "796 Main Street",
  "LotSizeSF": 12844,
  "PurchasePrice": 22000000,
  "PropertyClass": "Residential",
  "AcquisitionStructure": "Bare Trust/Share"
}
```
Note what's absent: no `BuildableSF`, no `PTT` — even though the source workbook's own Equity Analysis sheet almost certainly shows a computed PTT figure somewhere, it's not extracted, per §2's exclusion rule. The engine independently computes PTT as $1,018,000 via the real bracket table (already validated in Doc 03 Addendum A) — that's the number that ends up in the live `Parcel` record, never a value lifted from the source document.

A correct `budget_lines` entry from the same file's Development Budget sheet:
```json
{ "Group": "Soft", "Subgroup": "Third Party Consultants", "Label": "Cost Consultant - Draw Reports", "Amount": 30000, "IsContingency": false }
```
This one has a real, named precedent to test against: the dissection CSV confirms this exact line, this exact amount, in the live source data — a correct extraction run against the actual 796 Main Street file should produce this row exactly.

## 5. Do not extract from images

Consistent with Doc 10 §3's existing rule: this prompt is only ever invoked against PDF or Excel content containing tabular/text data — never against blueprints, floor plans, or photos. Those stay `ProjectFileRef` rows with `AIReadStatus = Stored only` and never reach this pipeline at all. If a file selected for extraction turns out to be image-only content with no extractable text or tables, return all four arrays empty with a single `confidence_flags` entry explaining why, rather than attempting to read the image.

## 6. Where this plugs in

Output from this prompt becomes `ImportBatch.ExtractedJSON` (Doc 10 §2), `SourceType = Full Proforma`. Nothing here writes to a live `Parcel`, `TenureComponent`, `UnitSale`, or `BudgetLine` record directly — same rule as every other import path in this project. The review screen (not yet built) is what a human actually confirms against before anything becomes real.

---
*End of Doc 14 · Parent: 10-Import-Export-Storage-Architecture.md §3 Stage I3 · Depends on: 02-Bubble-Database-Schema-Addendum-A-Development-Studio.md (schema), dev-studio-proforma-dissection-summary.md + dev-studio-796-budgetline-dissection.csv (worked example) · Explicitly does not reuse: 05-Claude-API-Narrative-Prompt-Template.md*
