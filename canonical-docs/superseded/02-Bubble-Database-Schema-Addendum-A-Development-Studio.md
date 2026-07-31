# InvestScape — Bubble Database Schema Addendum A: Development Studio (Build Reference)

**Strictly additive to Document 02.** No existing data types, fields, or option sets are renamed or altered. Build these after your core schema is in place — Development Studio is Enterprise-tier, so nothing here needs to exist before your Free/Pro build is working.

**How to use:** same as Doc 02 — Data tab → Option sets first, then Data types, then Privacy rules. Estimated build time: ~90–120 minutes (this module has more types than the core schema).

---

## 1. NEW OPTION SETS (create these first)

| Option Set | Options | Extra attribute |
|---|---|---|
| `DevProjectType` | Subdivision, Spec Infill, Multifamily, Mixed Use | — |
| `DetailLevel` | Quick Proforma, Full Model | — |
| `UnitSystem` | Imperial, Metric | — |
| `DevStage` | Concept, Feasibility, Financing, Construction, Sellout/Stabilized | add `Color` (text) for the stage pill |
| `PropertyClass` | Residential, Commercial, Mixed | — (drives the PTT +2%-over-$3M rule) |
| `AcquisitionStructure` | Asset Purchase, Bare Trust/Share | — |
| `TenureType` | Market Sellable, Market Rental, CMHC Rental, Non-Market Rental, Density Offset | — |
| `BudgetGroup` | Land, Hard, Soft, Financing | add `Color` (text) — feeds the cost donut directly |
| `DriverType` | Fixed $, Per Buildable SF, Per Sellable SF, Per Unit, Per Lot, Per Metre, Per Bulb, Per Draw, % of Hard, % of Revenue, % of Land, % of Loan, % of Subtotal | — |
| `LoanRank` | 1st, 2nd, Mezz, DPI | — |
| `DrawCurve` | Straight Line, S-Curve | — |
| `WaterfallVariant` | IRR Tranches, ROE Hurdles | — |
| `HurdleType` | IRR, ROE | — |

---

## 2. NEW DATA TYPES

### `DevProject` (the parent record — one per development deal)
| Field | Type | Default | Notes |
|---|---|---|---|
| Name | text | — | e.g. "796 Main Street" |
| ProjectType | DevProjectType | — | drives field visibility per Doc 07 §9 |
| DetailLevel | DetailLevel | Quick Proforma | flips to Full Model on "Expand" |
| UnitSystem | UnitSystem | Imperial | aligns with US-market toggle — labels/conversions switch, no field duplication |
| Jurisdiction | text | — | e.g. "Vancouver, BC" — links to fee/tax tables below |
| Stage | DevStage | Concept | |
| ApprovalMonths | number | — | |
| ConstructionMonths | number | — | |
| SellingMonths | number | — | |
| ProjectMonths | number | (calc) | approval + construction + selling |
| LinkedProperty | Property | — | link, for portfolio graduation into the existing Property/Deal model |
| Creator | (built-in) | — | |

### `Parcel` (belongs to DevProject — supports unlimited, not the templates' 8–10 cap)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Location | text | — | |
| LotSizeSF | number | — | |
| Zoning | text | — | |
| FSRMultiplier | number | — | |
| BuildableSF | number | (calc) | = LotSizeSF × FSRMultiplier |
| PurchasePrice | number | — | |
| BCAssessment | number | — | Gilley tracks asking vs. assessment |
| PropertyClass | PropertyClass | Residential | governs the +2%-over-$3M PTT rule |
| AcquisitionStructure | AcquisitionStructure | Asset Purchase | Bare Trust/Share zeroes PTT — AI narrative flags as legal-advice territory |
| PTT | number | (calc, F-701) | from TaxBracketTable, never hardcoded |
| LandBrokerFeePct | number | — | |
| LegalClosingPerLot | number | — | |

### `TenureComponent` (belongs to DevProject — multifamily/mixed_use only)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Tenure | TenureType | — | |
| FARShare | number | — | must reconcile to site FAR across all components |
| SF | number | — | |
| UnitCount | number | — | |
| RentPSFMonthly | number | — | |
| ExpenseRatio | number | — | |
| CapRate | number | — | |
| ComponentValue | number | (calc, F-708) | |

### `UnitSale` (belongs to DevProject — the sellable unit list)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| SuiteNo | text | — | |
| StrataLot | text | — | |
| UnitType | text | — | |
| SizeSF | number | — | |
| SalesPrice | number | — | entered net of GST |
| PricePSF | number | (calc) | |
| View | text | — | |
| FloorPremium | number | 0 | |
| CommissionRate | number | — | single input driving both the up-front and closing halves (F-705) |
| CommissionAmount | number | (calc) | |

### `BudgetLine` (belongs to DevProject — every cost line in the model)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Group | BudgetGroup | — | Land / Hard / Soft / Financing |
| Subgroup | text | — | e.g. "Design", "Permits & Fees", "Third-Party Consultants" |
| Label | text | — | e.g. "Architectural Fees" |
| DriverType | DriverType | — | |
| DriverRate | number | — | the $/SF, %, or per-unit rate |
| DriverBasis | number | — | the SF/unit/lot count it multiplies against |
| Amount | number | (calc) | |
| IsContingency | yes/no | no | contingency lines compute off their **own group subtotal**, never the grand total |

### `MunicipalFeeSchedule` (admin-only — jurisdiction-scoped fee rates)
| Field | Type | Default | Notes |
|---|---|---|---|
| Jurisdiction | text | — | |
| FeeName | text | — | e.g. "Development Cost Levy — Market Residential" |
| DriverType | DriverType | — | reuses the same taxonomy |
| Rate | number | — | |
| EffectiveDate | date | — | fees change; keep a history, don't overwrite |

### `TaxBracketTable` (admin-only — the PTT/land-transfer-tax engine, see build steps in §5 below)
| Field | Type | Default | Notes |
|---|---|---|---|
| Jurisdiction | text | — | e.g. "British Columbia" |
| PropertyClass | PropertyClass | — | governs which bracket table applies |
| EffectiveDate | date | — | |
| Label | text | — | e.g. "BC PTT 2026" |

### `TaxBracketRow` (belongs to TaxBracketTable — one row per bracket)
| Field | Type | Default | Notes |
|---|---|---|---|
| TaxBracketTable | TaxBracketTable | (link) | |
| Order | number | — | 1, 2, 3, 4... |
| LowerBound | number | — | |
| UpperBound | number | — | leave blank for "and above" |
| Rate | number | — | as a decimal, e.g. 0.02 |

### `LoanFacility` (belongs to DevProject — one row per facility)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Rank | LoanRank | — | |
| Amount | number | — | |
| BaseRate | number | — | |
| Spread | number | — | |
| TermMonths | number | — | |
| CommitmentFeePct | number | — | |
| BrokerFeePct | number | — | |
| AvgOutstandingFactor | number | 0.60 | computed from DrawMonth records when present, else this editable default |
| FirstDrawAmount | number | — | |
| DrawCurve | DrawCurve | Straight Line | S-curve already visualized in v2-unified |
| InterestReserve | number | (calc, F-702) | |
| NetAdvance | number | (calc, F-704) | |
| LoanPSF | number | (calc) | ÷ gross buildable |
| LTC | number | (calc) | cumulative loans ÷ total project cost |
| LTV | number | (calc) | cumulative loans ÷ gross revenue — **label explicitly as loan-to-end-value**, not loan-to-appraised-value, per Doc 07 §11 |

### `DrawMonth` (belongs to LoanFacility)
| Field | Type | Default | Notes |
|---|---|---|---|
| LoanFacility | LoanFacility | (link) | |
| MonthIndex | number | — | |
| Advance | number | — | |
| Cumulative | number | (calc) | running total — feeds the S-curve chart |

### `WaterfallSpec` (belongs to DevProject — one per project; presented as "Partner Split Calculator")
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Variant | WaterfallVariant | — | |
| PrefRate | number | — | |
| Compounding | yes/no | yes | |

### `WaterfallDeduction` (belongs to WaterfallSpec — pre-distribution deductions)
| Field | Type | Default | Notes |
|---|---|---|---|
| WaterfallSpec | WaterfallSpec | (link) | |
| Label | text | — | e.g. "Warranty Reserve", "Deposit Financing Cost", "GP Bonus" |
| Amount | number | (calc where conditional, e.g. GP bonus IF ROC > 15%) | |

### `WaterfallTier` (belongs to WaterfallSpec — ordered tranches/hurdles)
| Field | Type | Default | Notes |
|---|---|---|---|
| WaterfallSpec | WaterfallSpec | (link) | |
| Order | number | — | |
| HurdleType | HurdleType | — | |
| HurdleValue | number | — | e.g. 0.19 for a 19% IRR cap |
| LPShare | number | — | |
| GPShare | number | — | |

### `Scenario` (belongs to DevProject — frozen snapshots, never live links)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link) | |
| Label | text | — | e.g. "v15" |
| CreatedDate | date | (auto) | |
| SnapshotJSON | text | — | frozen JSON of every input + output at save time — **never a live reference**, this is the direct fix for the `#REF!` breakage found in the source templates |

**Reuse existing, no new type needed:** file repository, AI narrative payload storage, export records — all already in your core schema.

---

## 3. PRIVACY RULES — additions

For **DevProject, Parcel, TenureComponent, UnitSale, BudgetLine, LoanFacility, DrawMonth, WaterfallSpec, WaterfallDeduction, WaterfallTier, Scenario**:
- Rule: `When This [Type]'s DevProject's Creator is Current User` → ✔ View all fields, ✔ Find in searches, ✔ Auto-bind
- Everyone else: uncheck everything
- Additionally gate all of the above behind `Current User's Tier is Enterprise` — Development Studio is Enterprise-only, so this should be checked at the page level too, not just data privacy, but belt-and-suspenders here costs nothing

For **MunicipalFeeSchedule, TaxBracketTable, TaxBracketRow**:
- These are admin-managed reference data, not user data. Rule: `Everyone` → ✔ View all fields (read-only), no write access from client
- Only your admin account (or a future `IsAdmin` flag on User, matching your existing RBAC note) can edit these — do that editing from the Bubble Data tab directly for now rather than building an in-app admin UI; it's not worth the build time until you have more than one jurisdiction

---

## 4. RELATIONSHIP DIAGRAM — addition to Doc 02 §4

```
DevProject ──< Parcel
           ──< TenureComponent
           ──< UnitSale
           ──< BudgetLine
           ──< LoanFacility ──< DrawMonth
           ──1 WaterfallSpec ──< WaterfallDeduction
                              └──< WaterfallTier
           ──< Scenario
           ──1 LinkedProperty (existing Property type)

TaxBracketTable ──< TaxBracketRow   (admin, jurisdiction-scoped, referenced by Parcel.PTT calc)
MunicipalFeeSchedule                (admin, jurisdiction-scoped, referenced by BudgetLine)
```

---

## 5. Build note — do this type first

Build **TaxBracketTable + TaxBracketRow** before anything else in this addendum. Every Parcel's PTT calculation depends on it, and it's the one piece of this schema you'll populate with real government data on day one rather than test data. Step-by-step build instructions for this specific piece follow in the companion note below (item 2 of your task list).

---
*End of Addendum A · Parent document: 02-Bubble-Database-Schema.md · Companion: 07-Development-Proforma-Field-Map.md*
