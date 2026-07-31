# InvestScape — Bubble Database Schema Addendum B: PortfolioSnapshot (Build Reference)

**Strictly additive to Document 02 and Addendum A.** This is a core-schema addition (Portfolio module), not Development Studio — unlike Addendum A, this one is needed for Free/Pro tiers too, since every user with more than one snapshot in time benefits from seeing equity grow.

**Why per-Property, not per-User:** storing one row per Property per period (rather than one pre-summed portfolio total) means you get the portfolio-wide equity-growth chart for free by summing across a user's properties, *and* a future per-property equity history chart costs nothing extra. Never store the same fact two ways.

---

## 1. NEW DATA TYPE

### `PortfolioSnapshot` (belongs to Property)
| Field | Type | Default | Notes |
|---|---|---|---|
| Property | Property | (link) | |
| PeriodDate | date | — | normalize to the 1st of the month at write time, so every user's snapshots line up on the same x-axis categories |
| PropertyValue | number | — | current estimated value at time of snapshot |
| LoanBalance | number | — | outstanding balance across all mortgages on this property at time of snapshot |
| Equity | number | (calc) | = PropertyValue − LoanBalance, written at snapshot time (not live-computed later — a snapshot is a snapshot, same frozen principle as `Scenario` in Doc 02 Addendum A) |
| CashFlowForPeriod | number | — | pulled from that period's `DealMetrics.CashFlowMonthly` at write time — optional now, but costs nothing to capture and unlocks a future "cash flow over time" chart for free |

---

## 2. Populating it — backend workflow

New backend workflow: `snapshot-portfolio` (same naming pattern as `calc-deal-metrics`, `calc-parcel-ptt`).

1. **Trigger:** Bubble's recurring "Schedule API Workflow" set to run monthly (Backend workflows → this workflow → check "This workflow can be scheduled" → set recurring event on the 1st of each month).
2. **Step 1 — Search:** all Property records (all users — this is a scheduled workflow, not user-triggered, so it runs against everyone at once).
3. **Step 2 — Schedule API workflow on a list:** run a second, smaller backend workflow `snapshot-one-property` once per Property found in Step 1.
4. Inside `snapshot-one-property`:
   - Get that Property's most recent linked `Deal` → its `DealMetrics`
   - Create a new `PortfolioSnapshot`: Property = current property, PeriodDate = first of current month, PropertyValue = (current purchase price + any manual value-update field, if you've added one — otherwise PurchasePrice as the placeholder until a value-update feature exists), LoanBalance = `DealMetrics.LoanAmount` minus principal paid to date (if you're not yet tracking amortization payoff month-by-month, LoanAmount is an acceptable placeholder for MVP — flag this as a known simplification, not a bug), Equity = PropertyValue − LoanBalance, CashFlowForPeriod = `DealMetrics.CashFlowMonthly`.

**Known MVP simplification:** until property values are updated by the user or an external data feed (Rentcast, Phase 2), `PropertyValue` will read the same as `PurchasePrice` every month, meaning Equity will only change as the loan amortizes, not from market appreciation. This is honest and fine for MVP — the AI narrative layer should not claim market-driven equity growth from this data until a real value-update mechanism exists. Add a "last value update" indicator in the UI if this becomes confusing to users.

---

## 3. PRIVACY RULES — addition

`PortfolioSnapshot`:
- Rule: `When This PortfolioSnapshot's Property's Creator is Current User` → ✔ View all fields, ✔ Find in searches
- Everyone else: uncheck everything
- No client-side write access — only the scheduled backend workflow creates these rows

---

## 4. RELATIONSHIP DIAGRAM — addition to Doc 02 §4

```
Property ──< PortfolioSnapshot
```

---

## 5. Feeds directly into ApexCharts Stage E2

With this in place, Stage E2 of Doc 03 Addendum B (Portfolio: Equity Growth) now has real data to chart. Revised config — **stack Equity against LoanBalance**, not a single Equity series, so the bar shows the capital-stack composition changing over time (echoing the same debt/equity stack visual as Doc 06's F-101):

```javascript
chart: { type: "bar", stacked: true, ... },
series: [
  { name: "Equity", data: [/* summed Equity across the User's properties, grouped by PeriodDate */] },
  { name: "Debt", data: [/* summed LoanBalance across the User's properties, grouped by PeriodDate */] }
],
xaxis: { categories: [/* PeriodDate list, e.g. 'Jan 2026', 'Feb 2026'... */] }
```

**Bubble step:** same aggregation pattern as the other list-to-CSV-string charts — a small backend workflow (`agg-equity-growth`) that searches the User's `PortfolioSnapshot`s grouped by `PeriodDate`, sums `Equity` and `LoanBalance` per period, and writes two comma-separated strings the HTML element reads via Insert Dynamic Data.

---
*End of Addendum B · Parent document: 02-Bubble-Database-Schema.md · Unblocks: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md (Stage E2)*
