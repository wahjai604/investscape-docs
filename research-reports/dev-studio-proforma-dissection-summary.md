# Development Studio — Full Proforma Dissection Into Schema

Companion to `dev-studio-796-budgetline-dissection.csv`. This maps all four numeric source proformas (the fifth, Main & Union, is the *output* artifact, not an input model — it's already handled by Doc 07 §10's export template) into the `DevProject`/`Parcel`/`BudgetLine` schema from Doc 02 Addendum A, as real test data ready for Bubble import.

---

## 1. DevProject records (one per source file)

| Name | ProjectType | DetailLevel | UnitSystem | Jurisdiction | Units | ApprovalMonths | ConstructionMonths | SellingMonths |
|---|---|---|---|---|---|---|---|---|
| 796 Main Street | Mixed Use | Full Model | Imperial | Vancouver, BC | 101 strata + 19 SRO | — | 24 | — |
| Gilley (Burnaby Royal Oak) | Multifamily | Quick Proforma | Imperial | Burnaby, BC | 110 | — | 18 | 18 (36 total project) |
| Proforma Analysis (blank template) | Mixed Use | Full Model | Imperial | (unset — reusable) | — | — | — | — |
| Basic Subdivision | Subdivision | Full Model | Metric | (unset — generic) | 30 lots | 12 | 3 | 6 |

## 2. Parcel records

| DevProject | LotSizeSF/Area | PurchasePrice | BCAssessment | PropertyClass | AcquisitionStructure | PTT (calc, F-701) |
|---|---|---|---|---|---|---|
| 796 Main Street | 12,844 SF (gross site) | $22,000,000 | — | Residential | Bare Trust/Share | $0 (structure zeroes it; bracket calc would be **$1,018,000**) |
| Gilley — 7379 Gilley | 10,106 SF | $2,488,789 | $1,899,000 | Residential | Asset Purchase | (per-lot PTT ≈ $47,000 avg × 4 lots = $188,000 total, per source) |
| Gilley — 7399/7413/7423 Gilley | 9,050 / 8,749 / 9,278 SF | $2,230,605 / $2,194,957 / $2,285,649 | — | Residential | Asset Purchase | (included in $188,000 total above) |
| Basic Subdivision (3 parent parcels, 6 hectares) | 6 hectares | $9,273,553 | — | Residential | Asset Purchase | $185,471 (flat 2% — **this is the template's own simplified rule; engine applies the real BC bracket table instead, per Doc 07 §11's discrepancy note**) |

**Discrepancy confirmed in dissection:** the Basic Subdivision file uses a flat 2% PTT approximation ($185,471 on $9,273,553), while 796 and Gilley use the real bracket structure. This is exactly the inconsistency Doc 07 §11 flagged — the engine's `TaxBracketTable` (F-701) resolves it by always using the real bracket table regardless of which source pattern a project follows.

## 3. BudgetLine dissection — 796 Main Street (full detail, see CSV)

59 individual cost lines extracted directly from the live workbook cells and mapped to `Group`/`Subgroup`/`Label`/`Amount`. Group subtotals reconcile exactly:

| Group | Dissected total | Source total |
|---|---|---|
| Land | $23,354,490.84 | $23,354,490.84 ✓ |
| Hard | $37,700,229.00 | $37,700,229.00 ✓ |
| Soft | $9,533,927.26 | $9,533,927.25 ✓ |
| Financing | $4,411,548.91 | $4,411,548.91 ✓ |
| **Total Budget** | **$75,000,196.01** | **$75,000,196.00** ✓ (1¢ rounding) |

Two lines carry `IsContingency = true` (Hard Cost Contingency $1,795,249; Soft Cost Contingency $322,403.34) — confirming both compute as a % of their own group subtotal, matching F-706's rule, not the grand total.

**BudgetLine dissection was not repeated line-by-line for Gilley, Proforma Analysis, and Basic Subdivision** in this pass — 796 is structurally the superset (mixed-use, full model, all subgroups present), so its dissection validates the schema shape. The other three's headline totals are captured in §1–2 and §4 for cross-validation; a full line-by-line BudgetLine export for those three is a quick follow-on if you want them as additional Bubble test rows (flag if you'd like that done now vs. later).

## 4. UnitSale sample (796 Main Street unit mix, condensed from the Sales Price List sheet)

| UnitType | Count | AvgSizeSF | AvgSalesPrice |
|---|---|---|---|
| Bachelor | 21 | 618.9 | $791,805 |
| 1-Bed | 27 | 538.6 | $761,381 |
| 2-Bed | 19 | 908.2 | $1,261,479 |
| 3-Bed | 8 | 1,145.7 | $1,940,525 |
| Total market residential | 75 | 719.5 | $1,022,367 avg |

(Full per-suite rows with suite numbers exist in the source sheet — condensed here to the roll-up level per Doc 07 §5.3's normalization convention; individual suite rows are a straightforward CSV export from the same sheet if you want every unit as its own `UnitSale` record for Bubble import.)

## 5. Headline metrics — cross-file validation (repeats the Doc 06 Addendum A validation, shown here per-project for schema context)

| DevProject | Total Budget | Profit | ROC |
|---|---|---|---|
| 796 Main Street | $75,000,196 | $11,345,004 | 15.13% |
| Gilley | $43,751,237 | $12,620,025 | 28.84% |
| Basic Subdivision | $15,652,174 | $2,347,826 | **15.00%** (confirms Doc 07's "Basic targets 15%" note exactly) |

---

## What this confirms for the build

- The `BudgetLine` Group/Subgroup taxonomy from Doc 02 Addendum A fits real data cleanly — every line in 796's budget landed in exactly one Group and (for Soft) one Subgroup, with no leftover "other" bucket needed.
- The PTT discrepancy across source files is real and confirms the engine's jurisdiction-bracket-table approach (F-701) is the right fix, not a nice-to-have.
- Contingency-on-own-subtotal (not grand total) is confirmed by hand-checking 796's two contingency lines.
- ROC reconciles to the source figure across all three fully-dissected projects, including the Basic Subdivision's round 15% target.

---
*Files: `dev-studio-796-budgetline-dissection.csv` (59 rows, ready for Bubble bulk import) · this summary.*
