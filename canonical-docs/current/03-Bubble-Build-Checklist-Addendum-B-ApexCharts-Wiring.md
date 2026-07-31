# InvestScape — Build Checklist Addendum B: Wiring ApexCharts

**Strictly additive to Document 03.** Covers the 8 approved KPI-to-chart-type pairings. Build the shared pattern in Stage E0 once, then repeat the per-chart stages (E1–E8) wherever each screen needs them.

---

## STAGE E0 — The shared embedding pattern (build this once, ~45 min)

ApexCharts isn't a Bubble plugin-marketplace install — it's a JS library you load via CDN inside an **HTML element**, the same mechanism Doc 03 already uses for the Toolbox/JS math in Stage 3. This keeps everything under one true source (your Bubble formula engine), not a second calculation engine.

1. Drag an **HTML element** onto the page, sized to where the chart goes.
2. Paste this skeleton — every chart below is a variation of this shape:

```html
<div id="chart-[unique-name]"></div>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
  (function() {
    var el = document.querySelector("#chart-[unique-name]");
    if (el._chart) { el._chart.destroy(); }   // prevents duplicate renders on data refresh — see caution below
    var options = {
      chart: { type: "donut", background: "transparent", fontFamily: "DM Mono, monospace" },
      colors: ["#D9B04A", "#7DD3FC", "#4ADE80", "#F87171"],
      theme: { mode: "dark" },
      series: [ /* INSERT DYNAMIC DATA HERE */ ],
      labels: [ /* INSERT DYNAMIC DATA HERE */ ]
    };
    var chart = new ApexCharts(el, options);
    chart.render();
    el._chart = chart;
  })();
</script>
```

3. Where you see `/* INSERT DYNAMIC DATA HERE */`, click into the HTML element's text and use Bubble's **Insert dynamic data** button to pull from the page's Deal, DevProject, or repeating group source — Bubble writes the live value directly into the HTML text at render time, same as inserting dynamic data into any text element.

**The re-render caution:** Bubble's HTML element re-runs its embedded `<script>` block every time the dynamic data inside it changes (e.g., the user edits an input and the bound Deal updates) — but it doesn't automatically clear the *previous* chart first. Without the `el._chart.destroy()` guard in the skeleton above, you'll get chart instances stacking on top of each other after a few edits. Always keep that destroy-then-recreate guard.

**Colors:** the palette in the skeleton (`#D9B04A` gold, `#7DD3FC` blue, `#4ADE80` green, `#F87171` red) is pulled directly from Doc 04's style variables — every chart uses this same array unless a specific chart below needs a different mapping (the cost donut does, see E5).

**Font:** `fontFamily: "DM Mono, monospace"` on every chart — this is the one visual rule that must never be skipped, per Doc 04's "if it's a number the user might act on, it's DM Mono" principle. Chart labels and tooltips are numbers the user acts on.

---

## STAGE E1 — Portfolio: Asset Allocation (Donut)

**Data:** Current User's Properties, grouped by PropertyType, summed by current value.
**Config additions to the E0 skeleton:**
```javascript
chart: { type: "donut", ... },
series: [/* list of summed values per PropertyType, from a Bubble "Group by" search or a backend workflow that pre-aggregates into a text field */],
labels: [/* list of PropertyType option set display names */]
```
**Bubble step:** since ApexCharts wants a plain array, the easiest path is a backend workflow (`agg-portfolio-allocation`, same pattern as `calc-deal-metrics`) that writes a comma-separated values string and a comma-separated labels string onto the User record, then the HTML element reads those two text fields via Insert Dynamic Data and the JS does one `.split(",")` before handing arrays to ApexCharts.

## STAGE E2 — Portfolio: Equity Growth (Stacked Bar)

**Data:** monthly/quarterly snapshots of Equity per property, summed across the portfolio.
**Config:**
```javascript
chart: { type: "bar", stacked: true, ... },
series: [{ name: "Equity", data: [/* values per period */] }],
xaxis: { categories: [/* period labels e.g. 'Q1 2026', 'Q2 2026' */] }
```
**Note:** this needs a `PortfolioSnapshot` data type (period, total value, total equity) written by a scheduled backend workflow — not in your current schema. Flag this as a small schema addition if you want historical equity growth rather than a single current-state bar.

## STAGE E3 — Deal Analyzer: Income Waterfall

**Data:** Gross Rent → Vacancy Loss → Operating Expenses → NOI → Debt Service → Cash Flow, from `DealMetrics`.
**Config:**
```javascript
chart: { type: "bar", ... }, // ApexCharts has no native "waterfall" type — built as a stacked bar with an invisible "base" series
series: [
  { name: "base", data: [/* invisible offset values, computed in the backend workflow */] },
  { name: "value", data: [/* the actual visible bar segments */] }
],
xaxis: { categories: ["Gross Rent","Vacancy","Op. Ex","NOI","Debt Service","Cash Flow"] }
```
**Bubble step:** the invisible-base-series waterfall trick needs the running-total math done once in `calc-deal-metrics` (Doc 03 Stage 3) and written to a small set of fields (`WaterfallBase1..6`, `WaterfallValue1..6`) — cheaper to compute there than in JS, keeping the "engine computes, chart only displays" boundary intact.

## STAGE E4 — Deal Analyzer: Amortization Curve

**Data:** monthly Principal vs. Interest split over the loan term.
**Config:**
```javascript
chart: { type: "area", stacked: true, ... },
series: [
  { name: "Principal", data: [/* monthly principal portion */] },
  { name: "Interest", data: [/* monthly interest portion */] }
],
xaxis: { categories: [/* month numbers or dates */] }
```
**Bubble step:** this needs a full amortization schedule, not just the single `PMT` value already in `DealMetrics`. Cheapest build: a backend workflow that loops `TotalPeriodYears × 12` times (Toolbox "Schedule API Workflow on a list" or a recursive backend workflow) writing each month's split — do this only when the user opens the amortization chart (on-demand), not on every `calc-deal-metrics` run, to avoid needless compute.

## STAGE E5 — Development Studio Overview: Cost Donut

**Data:** `BudgetLine.Amount` summed by `Group` (Land/Hard/Soft/Financing).
**Config:**
```javascript
chart: { type: "donut", ... },
colors: [/* pull each BudgetGroup option set's Color attribute — Doc 02 Addendum A already added this attribute for exactly this purpose */],
series: [/* summed amount per group */],
labels: ["Land","Hard","Soft","Financing"]
```
**This is the one chart that does NOT use the shared E0 palette** — it uses the `BudgetGroup` option set's own `Color` field (set when you built the option set in Doc 02 Addendum A §1), so the donut's colors always match any other place in the UI that shows a Land/Hard/Soft/Financing badge or pill.

## STAGE E6 — Development Studio Financing: Draw S-Curve

**Data:** `DrawMonth.Cumulative`, ordered by `MonthIndex`, one series per `LoanFacility`.
**Config:**
```javascript
chart: { type: "line", curve: "smooth", ... },
series: [{ name: "[Facility Rank]", data: [/* Cumulative values in MonthIndex order */] }],
xaxis: { categories: [/* MonthIndex list */] }
```
**Bubble step:** use a repeating group's list-of-numbers, converted to a comma-separated field the same way as E1 — this is the pattern you'll reuse most often, worth turning into a small reusable "list to CSV string" backend workflow since at least four of these eight charts need it.

## STAGE E7 — Development Studio Risk: Sensitivity Heatmap

**Data:** the price × hard-cost grid already confirmed as the right primary view (Doc 07 §5.9) — margin-on-cost at each combination.
**Config:**
```javascript
chart: { type: "heatmap", ... },
series: [/* one series per hard-cost delta row, each containing an array of {x: price_label, y: margin_value} */],
plotOptions: { heatmap: { colorScale: { ranges: [
  { from: -100, to: 0, color: "#F87171", name: "Below target" },
  { from: 0, to: 15, color: "#D9B04A", name: "At target" },
  { from: 15, to: 100, color: "#4ADE80", name: "Above target" }
]}}}
```
**Bubble step:** this grid must be precomputed in a backend workflow (loop sale-price deltas × hard-cost deltas, run F-707's ROC formula at each combination) — this is real compute, not display, so it lives in the engine layer, not client-side JS.

## STAGE E8 — Development Studio Risk: Breakeven Ladder

**Data:** the units-sold thresholds from F-710 (per Doc 06 Addendum A) — units sold %, outstanding balance, residual LTV at each threshold.
**Config:**
```javascript
chart: { type: "bar", horizontal: true, ... },
series: [{ name: "Outstanding Balance", data: [/* balance at each threshold */] }],
xaxis: { categories: [/* threshold labels, e.g. '1st facility retired', '2nd facility retired' */] }
```

---

## Build order recommendation

Build **E5 (cost donut)** first — it's the simplest (static per-project data, no time series, no precompute loop) and gives you a working end-to-end proof that the HTML-element-plus-CDN pattern works inside your actual Bubble app before you invest in the more compute-heavy ones (E7 heatmap, E4 amortization curve).

---
*End of Addendum B · Parent document: 03-Bubble-Build-Checklist.md · Depends on: 04-InvestScape-Style-Guide.md (colors/fonts), 02-Bubble-Database-Schema-Addendum-A (BudgetGroup.Color, DrawMonth), 06-Commercial-Formula-Library-Addendum-A (F-706, F-710)*
