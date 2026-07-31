# 06 — Commercial Formula Library
## Addendum A · Development & Construction Formulas
**Lighthouse Research Ltd. · Addendum to Version 1.0 · July 2026**

Strictly additive to Document 06. No prior entries renamed or altered. New tier: **DEV** (Development Studio, Enterprise). Sourced from Document 07's field map and validated cell-by-cell against the 796 Main Street and Gilley source workbooks (see validation log at the end of this addendum).

---

## Category 7 · Development & Construction

### F-701 · BC Property Transfer Tax (Bracket Method)
**Formula:** `PTT = Σ (bracket_amount × bracket_rate)` across the jurisdiction's bracket table
```
Bracket 1: first $200,000            × 1%
Bracket 2: $200,000 – $2,000,000     × 2%
Bracket 3: $2,000,000 – $3,000,000   × 3%
Bracket 4: above $3,000,000          × 5%
```
**Tier:** DEV
Never hardcoded — one admin-editable bracket table (rates *and* thresholds) per jurisdiction, extending the already-locked PTT-threshold-as-setting principle. A `property_class` flag per parcel governs the extra 2% above $3M, which legally applies only to residential-class land. An `acquisition_structure` toggle (asset | bare_trust/share) can zero PTT for share-purchase structures — the AI narrative flags this as legal-advice territory, never advises it.
**Worked example (validated):** $22,000,000 land value → `200,000×1% + 1,800,000×2% + 1,000,000×3% + 19,000,000×5% = $1,018,000`. Matches the 796 Main Street bracket calculation exactly.

### F-702 · Construction Interest Reserve (Average-Outstanding-Balance Method)
**Formula:** `Interest Reserve = Loan × avg_outstanding_factor × (term_months/12) × (base_rate + spread)`
**Tier:** DEV
The factor is computed from the draw schedule when one exists (average cumulative balance ÷ loan amount); otherwise it's an editable assumption defaulting to 0.60. All three source templates use this same mechanic with different factor derivations — 796 derives it from an actual monthly draw curve, Gilley enters it directly as a stated input.
**Worked example (validated):** $60,000,000 loan × 0.641304 factor × (24/12 years) × 4.2% rate = **$3,232,174** — reproduces the 796 Main Street 1st mortgage interest budget exactly.
**Bubble Implementation:** factor computed from `DrawMonth` records when present (Σ cumulative balance ÷ n months ÷ loan amount); otherwise pulled from `LoanFacility.avg_outstanding_factor`.

### F-703 · Time-Weighted Land/Construction Interest (Quick Proforma fallback)
**Formulas:**
```
Land Interest    = LandCost × LTC × rate × ((approval_m + construction_m + selling_m/2) / 12)
Construction Interest = (Hard + Soft) × LTC × 0.5 × rate × ((construction_m + selling_m/2) / 12)
```
**Tier:** DEV
Used only when no draw schedule exists — the Quick Proforma's simplified stand-in for F-702. The 0.5 factor is itself a simplification of the average-outstanding-balance principle in F-702, hardcoded rather than computed.

### F-704 · Net Advance
**Formula:** `Net Advance = Loan − Interest Reserve − Commitment Fee − Broker Fee`
**Tier:** DEV
The cash actually available to the borrower after the lender nets its reserves and fees off the top.
**Worked example (validated):** $60,000,000 − $3,232,174 − $600,000 − $300,000 = **$55,867,826** — exact match to source.

### F-705 · Effective Gross Revenue (Development)
**Formula:** `EGR = Gross sales + other income − closing-half commissions ± GST adjustments`
**Tier:** DEV
The development-model counterpart to F-401's operating NOI waterfall, but for a one-time sellout rather than recurring income. Commission is split: half booked up-front as a soft cost, half deducted here at closing — both halves reference a single `commission_rate` input so they can never drift apart.
**Worked example (validated):** Gross sales $87,490,800 + $0 other income (already netted) − commission savings $153,355 − closing commissions $1,298,955 = **$86,345,200** — exact match to the 796 Main Street Effective Gross Revenue line.

### F-706 · Total Development Budget
**Formula:** `Total Budget = Land + Hard + Soft + Financing`; contingencies computed as a % of their own group subtotal (never of the grand total)
**Tier:** DEV
**Worked examples (both validated):**
- 796: $23,354,491 + $37,700,229 + $9,533,927 + $4,411,548 = **$75,000,196**
- Gilley: $9,408,000 + $25,794,001 + $8,549,236 (financing folded into soft) = **$43,751,237**

### F-707 · Developer Profit & Return on Cost (ROC)
**Formulas:** `Developer Profit = EGR − Total Budget` · `ROC = Profit ÷ Total Budget`
**Tier:** DEV — the merchant-developer headline metric; the GP bonus in the waterfall (F-709) triggers off ROC > 15%
**Worked examples (both validated):**
- 796: $86,345,200 − $75,000,196 = **$11,345,004** profit; ROC = **15.13%**
- Gilley: $56,371,262 − $43,751,237 = **$12,620,025** profit; ROC = **28.84%**

### F-708 · Rental Component Valuation (Income Capitalization)
**Formula:** `Component Value = (rent_psf_mo × 12 × SF × (1 − expense_ratio)) ÷ cap_rate`
**Tier:** DEV
Where Doc 06's cap-rate machinery (F-404) plugs into a mixed-tenure development: each rental tenure block (market rental, CMHC rental, non-market) is valued as its own mini income property, then summed into total revenue alongside the sellable-unit sales list.
**Worked example (validated):** Gilley's CMHC Rental component — $2.18/SF/mo × 12 × 13,906 SF × (1 − expense assumption) capitalized at 5% cap → **$3,629,581** total, reconciling to the source file's revenue table.

### F-709 · Waterfall / Partner Split — Two Variants
**Variant A — IRR tranches:** Class A preferred return compounded `((1 + pref_rate)^years − 1) × equity` (6% p.a. in source) → Tranche 1: 60 LP / 40 GP up to a 19% Class A IRR cap → Tranche 2 (above 19%): 25 / 75.
**Variant B — ROE hurdles:** 10% pref (compounded) → 75/25 to a 12% ROE hurdle → 50/50 to 15% → 25/75 residual.
**Tier:** DEV
Both variants render as the **Partner Split Calculator** — presented as analysis of a structure the user already has, never as syndication/offering tooling (securities-counsel framing question remains open on Eric's consultation list). Pre-distribution deductions (warranty reserve, deposit-financing cost, conditional GP bonus) are netted before either variant runs.
**Labeling caution:** the source templates' "IRR" is `(1 + multiple)^(1/years) − 1` — a geometric annualization, not a dated-cash-flow IRR. The engine labels this **"simple annualized return"** and offers true XIRR when a dated cash-flow timeline exists, consistent with the platform's honest-numbers principle (same treatment as F-409's caution).

### F-710 · Breakeven Ladder
**Formula (per threshold):** cumulative sale proceeds × `pct_applied_to_loan` (default 95%, a lender-holdback assumption) retire each facility in rank order; outputs units sold & %, remaining units, value/avg-SF/avg-price of sold and unsold units, outstanding balance, loan PSF of unsold, and **residual LTV**.
**Tier:** DEV
Answers "how many units must sell before the construction loan is fully repaid" — the risk-side complement to ROC. Already visualized as the breakeven ladder in the v2-unified mockup; this formula supplies its exact math.

### F-711 · Sources & Uses Integrity Check
**Rule:** `Σ Sources ≡ Σ Uses`; borrower equity is always the plug (`Equity = Total Uses − Total Debt`), never an independently entered figure.
**Tier:** DEV
A built-in integrity check, not just a display convention — the UI surfaces a matched-total badge, and any mismatch signals a formula or data-entry error upstream. Guards against the `#REF!` breakage found in the source templates' Breakeven and Comparison sheets.

---

## Validation log — both source-file headline sets reproduce exactly

| Metric | 796 Main Street | Gilley |
|---|---|---|
| Total Budget | $75,000,196 (target: $75.0M) ✓ | $43,751,237 (target: $43.75M) ✓ |
| Developer Profit | $11,345,004 ✓ | $12,620,025 ✓ |
| ROC | 15.1266% (target: 15.13%) ✓ | 28.844% (target: 28.84%) ✓ |
| Interest reserve factor | 0.641304 (target: 0.641) ✓ | 0.65 (stated input, matches) ✓ |
| PTT on $22M | $1,018,000 (target: $1.018M) ✓ | n/a |
| Annual ROI on equity | n/a | 32.05% ✓ |

All figures pulled directly from the live formula cells in the source workbook (796) and the source document (Gilley) — not re-derived from summary text. Every formula in this addendum is confirmed, not provisional.

---

## Engine reconciliation log — additions

8. **Development contingencies** computed as % of their *own group subtotal* (hard contingency off hard subtotal, soft off soft subtotal) — never off the grand total. (F-706)
9. **Scenarios are frozen JSON snapshots**, never live references — the source templates' `#REF!` breakage in Breakeven and Comparison is the cautionary precedent. (F-710/711, Doc 07 §5.10)
10. **Waterfall IRR relabeled** "simple annualized return"; true XIRR computed when dated cash flows exist. (F-709)

---
*End of Addendum A · Parent document: 06-Commercial-Formula-Library.md · Companion: 07-Development-Proforma-Field-Map.md*
