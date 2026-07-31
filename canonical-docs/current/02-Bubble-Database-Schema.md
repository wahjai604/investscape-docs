# InvestScape / EstateLens — Bubble Database Schema v1.0 (Build Reference)

**How to use:** Open Bubble → **Data** tab → **Data types**. Create each type below, then add fields exactly as named (Bubble field names can't be renamed cleanly later without breaking workflows — copy these names verbatim). Then create Option Sets, then set Privacy rules. Total build time: ~45–60 minutes of clicking.

---

## 1. OPTION SETS (create these FIRST — Data tab → Option sets)

| Option Set | Options | Extra attribute |
|---|---|---|
| `Country` | Canada, USA | — |
| `LoanType` | Amortizing, Interest-Only | — |
| `TermType` | Fixed Rate, Variable Rate | — |
| `PropertyType` | Condo/Apartment, Townhouse, Detached House, Duplex, Multi-Family, Commercial, Land | — |
| `DealStatus` | Analyzing, Watching, Offer Made, Under Contract, Owned, Passed | add attribute `Color` (text) for badge styling |
| `SubscriptionTier` | Free, Pro, Team, Enterprise | add attribute `MonthlyPrice` (number): 0, 29, 79, 0 |
| `Grade` | A, B, C, D, F | add attribute `Color` (text) |

Why Option Sets and not text fields: they're free to query (no DB hit), enforce consistency, and are the Bubble equivalent of enums from your original architecture docs.

---

## 2. DATA TYPES

### `User` (extend Bubble's built-in User — do not create a new type)
| Field | Type | Default |
|---|---|---|
| FullName | text | — |
| Company | text | — |
| Role | text | (investor / realtor / broker / developer — free text at MVP) |
| Tier | SubscriptionTier | Free |
| Country | Country | Canada |
| StripeCustomerID | text | — (Phase: billing) |
| OnboardingComplete | yes/no | no |

### `Property` (the physical asset)
| Field | Type | Default |
|---|---|---|
| Address | text | — |
| City | text | — |
| ProvinceState | text | — |
| Country | Country | Canada |
| PostalZip | text | — |
| PropertyType | PropertyType | — |
| Bedrooms | number | — |
| Bathrooms | number | — |
| SquareFeet | number | — |
| YearBuilt | number | — |
| ParcelNumber | text | — (from Evaluator sheet) |
| Photo | image | — |
| Notes | text | — |

### `Deal` (one analysis scenario for a property — a Property can have many Deals, e.g. "550k offer" vs "530k offer")
| Field | Type | Default |
|---|---|---|
| Property | Property | (link) |
| Name | text | e.g. "Offer #1" |
| Status | DealStatus | Analyzing |
| Inputs | DealInputs | (link) |
| Metrics | DealMetrics | (link) |
| AINarrative | text | — (Claude API output) |
| Grade | Grade | — |

> **Why a separate Deal layer:** this is your Evaluator sheet's "Offer #1" tab concept generalized — scenario comparison ("what if I offer 20k less?") becomes a headline feature with zero extra schema work.

### `DealInputs` (everything the user types — mirrors Template v2)
| Field | Type | Default | Template v2 source |
|---|---|---|---|
| PurchasePrice | number | — | Purchase Price |
| DownPaymentPct | number | 0.20 | Down Payment % |
| SecondMortgage | number | 0 | (-) Second Mortgage |
| BuyingCostPct | number | 0.01 | Buying Cost % |
| InitialImprovements | number | 0 | Initial Improvements** |
| FirstTimeBuyer | yes/no | no | PTT exemption note |
| InterestRate | number | — | Interest Rate*** |
| LoanType | LoanType | Amortizing | Loan Type |
| TotalPeriodYears | number | 25 | Total Period (Years) |
| TermPeriodYears | number | 5 | Term Period (Years) |
| TermType | TermType | Fixed Rate | Term Type |
| MonthlyRent | number | — | Monthly Rental Income |
| OtherIncomeMonthly | number | 0 | (Evaluator: "Other Income") |
| VacancyMonths | number | 1 | Vacancy Loss**** |
| PropertyTaxAnnual | number | — | Property Taxes |
| StrataFeeMonthly | number | 0 | Strata Fee |
| InsurancePct | number | 0.025 | Insurance [2.5%] |
| PropertyMgmtPct | number | 0 | Property Management***** |
| RepairsPct | number | 0.02 | Repairs & Maintenance [2%] |
| OtherPct | number | 0.025 | Other and Misc [2.5%] |
| Year1Improvements | number | 0 | Year 1 Improvements |

### `DealMetrics` (computed only — users never edit; written by `calc-deal-metrics` workflow)
PTT, BuyingCosts, DownPayment, LoanAmount, LTV, InitialCashInvested, MonthlyPayment, GrossRentAnnual, VacancyLossAnnual, OperatingIncomeMonthly/Annual, InsuranceMonthly, PropertyMgmtMonthly, PropertyTaxMonthly, RepairsMonthly, OtherMonthly, OperatingExpensesMonthly/Annual, NOI_Monthly/Annual, CashFlowMonthly/Annual, BreakEvenLoan, BreakEvenLoanPct, BreakEvenDownPayment, BreakEvenDownPct, CapRatePrice, CapRateAllIn, CashOnCash, DSCR, GRM, OperatingExpenseRatio, BreakEvenRatio, PricePerSqFt, OnePercentRulePass (yes/no), LastCalculated (date). All `number` unless noted.

### `Subscription` (Phase: billing)
| Field | Type |
|---|---|
| User | User |
| Tier | SubscriptionTier |
| StripeSubscriptionID | text |
| Status | text (active / past_due / canceled) |
| CurrentPeriodEnd | date |

---

## 3. PRIVACY RULES (Data tab → Privacy — do this the same day, before building pages)

For **Property, Deal, DealInputs, DealMetrics**:
- Rule: `When This [Type]'s Creator is Current User` → ✔ View all fields, ✔ Find in searches, ✔ Auto-bind
- **Everyone else / not logged in:** uncheck everything.

For **User**: default rule already restricts; additionally allow "Everyone" to see only FullName (needed later for community features — or leave fully locked for MVP).

For **Subscription**: Creator-only view; all writes happen via backend workflows triggered by Stripe webhooks (never client-side).

**Test:** open your app in an incognito window logged in as a second test user — you should see zero properties from user #1.

---

## 4. RELATIONSHIP DIAGRAM

```
User ──< Property ──< Deal ──1 DealInputs
                        └───1 DealMetrics
User ──1 Subscription
```
(`──<` = one-to-many, `──1` = one-to-one)
