# InvestScape — Build Checklist Addendum B: Wiring Charts in WeWeb — Doc 03 Addendum B

**Supersedes `03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md`.** Strictly additive to Doc 03. Covers the same 8 approved KPI-to-chart-type pairings, same chart types, same data, same colors — nothing about *what* to chart or *why* changed. What's genuinely open is *how* WeWeb embeds them, and this document says so plainly rather than writing confident steps for a mechanism nobody has actually tried yet.

> **This document carries a real, unresolved question that the Bubble version didn't have.** Doc 53's audit (§5) already flagged this: the Bubble version's mechanism — an HTML element with an embedded `<script>` tag, where Bubble writes live values directly into that inline script at render time via "Insert dynamic data" — is a genuinely Bubble-specific pattern. It is **not yet confirmed** whether WeWeb's equivalent should be the same kind of raw embed, or a proper custom Vue component wrapping ApexCharts that reads data through WeWeb's normal variable-binding system instead. Both are technically possible in WeWeb (its own documentation confirms support for both custom JavaScript actions and custom Vue components), but which one is actually the better fit for *this* platform hasn't been built and checked yet. **Do not treat Stage E0 below as settled.** Treat it as the leading candidate, pending the spike in the "Build order" section at the bottom — which is the first thing to actually do, before Stage E1 or any other stage.

---

## STAGE E0 — The shared embedding pattern — candidate approach, not yet verified

ApexCharts isn't a WeWeb marketplace component — it's a JS library loaded via CDN, embedded through one of WeWeb's two extension mechanisms. This section describes the **custom-embed candidate**; the Vue-component alternative is described immediately after, and the spike at the bottom of this document decides between them before more than one chart gets built either way.

**Candidate A — custom HTML/JS embed (closest translation of the Bubble version):**

1. Add a **Custom HTML/JS component** (WeWeb's embed element) to the page, sized to where the chart goes.
2. Paste this skeleton — every chart below is a variation of this shape, functionally identical to the Bubble version's skeleton:

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
      series: [ /* BOUND TO A WEWEB VARIABLE HERE */ ],
      labels: [ /* BOUND TO A WEWEB VARIABLE HERE */ ]
    };
    var chart = new ApexCharts(el, options);
    chart.render();
    el._chart = chart;
  })();
</script>
```

3. Where the Bubble version used "Insert dynamic data" to write a live value directly into the embedded script's text, this candidate would instead bind the component's exposed props to a WeWeb variable or collection field, and read that variable inside the script. **This is the specific mechanic Doc 53 flags as unconfirmed** — whether WeWeb's custom-code component actually supports reading a bound variable from inside its own inline script the way Bubble's dynamic-data-insertion did, or whether the value has to be passed in some other way (a data attribute, a WeWeb-provided prop). Don't assume; check it in the spike.

**Candidate B — a proper custom Vue component wrapping ApexCharts:**

The cleaner, more WeWeb-native alternative: build a small Vue component that takes `series` and `labels` as props, wraps `apexcharts` internally, and is registered as a reusable WeWeb component. Data flows in through WeWeb's normal prop-binding system rather than through inline script text — closer to how WeWeb is actually meant to be extended, and likely a better long-term fit if it works cleanly, but it's more upfront build effort than Candidate A and hasn't been tried on this project yet either.

**Whichever candidate wins the spike, these two things carry over unchanged, because they're chart-library-level concerns, not platform-specific ones:**

- **The re-render caution.** Whatever triggers a re-render (a bound variable changing) doesn't automatically clear the *previous* chart instance first. Without a `destroy()`-before-recreate guard, chart instances stack on top of each other after a few updates. Keep that guard regardless of which candidate is chosen.
- **The `updateSeries` pattern.** Per Stage 1 Prompt 1a Standard B (and Doc 20's flicker-fix findings, which were derived against a React prototype but apply to any DOM-based chart re-render): prefer `chart.updateSeries()` over destroy-and-recreate where the chart's shape hasn't changed, only its values — this avoids the flicker that a full destroy/recreate cycle causes on every keystroke-driven update. If the eventual WeWeb mechanism makes `updateSeries()` awkward to reach (the same closure-scope problem Doc 20 flagged for Bubble's version), the debounce workaround from Doc 20 — only push a recalculated value after the user pauses for ~300–500ms — applies here too.

**Colors, unchanged:** the palette (`#D9B04A` gold, `#7DD3FC` blue, `#4ADE80` green, `#F87171` red) is pulled directly from Doc 04's style tokens — every chart uses this array unless a specific chart below needs a different mapping (the cost donut does, see E5).

**Font, unchanged:** `fontFamily: "DM Mono, monospace"` on every chart — the one visual rule that must never be skipped, per Doc 04's "if it's a number the user might act on, it's DM Mono" principle. Chart labels and tooltips are numbers the user acts on.

---

## STAGE E1 — Portfolio: Asset Allocation (Donut)

**Data:** the current user's properties, grouped by `property_type`, summed by current value.
**Config additions to the E0 skeleton:**
```javascript
chart: { type: "donut", ... },
series: [/* summed value per property_type */],
labels: [/* property_type enum display labels */]
```
**Supabase step — this is now a query, not a workflow:**
```sql
SELECT property_type, SUM(purchase_price) AS total_value
FROM properties
WHERE user_id = auth.uid()
GROUP BY property_type;
```
WeWeb calls this directly (as a Supabase collection query or wrapped as an RPC function, same "simple enough not to need an Edge Function" reasoning used throughout Doc 02/02B) and binds the result to the chart. No comma-separated-string intermediate step is needed — the old Bubble version's `.split(",")` workaround existed only because Bubble's backend workflows couldn't easily hand a repeating group a real array; a Supabase query returns one directly.

**This is the chart to spike first — see "Build order," below.** It's the smallest, already-specced example, and Doc 53 recommends it specifically as the one to prove the embedding mechanism against before committing further.

## STAGE E2 — Portfolio: Equity Growth (Stacked Bar)

**Data:** monthly snapshots of equity per property, summed across the portfolio.
**Config:**
```javascript
chart: { type: "bar", stacked: true, ... },
series: [
  { name: "Equity", data: [/* summed equity per period */] },
  { name: "Debt", data: [/* summed loan_balance per period */] }
],
xaxis: { categories: [/* period_date list */] }
```
**Supabase step:** this table now exists — `02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md` built exactly this. The aggregation query is already written there (§5); this stage just binds the chart to it. The old addendum's note — *"this needs a `PortfolioSnapshot` data type, not in your current schema, flag as a small addition"* — is resolved, not just relocated: the table exists, is schema-ready, and the only remaining gap is the `pg_cron` job actually running long enough to accumulate real history (see Doc 02 Addendum B §6's status note — that gap is still open and this rewrite doesn't close it).

## STAGE E3 — Deal Analyzer: Income Waterfall

**Data:** Gross Rent → Vacancy Loss → Operating Expenses → NOI → Debt Service → Cash Flow, from `deal_metrics`.
**Config:**
```javascript
chart: { type: "bar", ... }, // ApexCharts has no native "waterfall" type — built as a stacked bar with an invisible "base" series
series: [
  { name: "base", data: [/* invisible offset values */] },
  { name: "value", data: [/* the actual visible bar segments */] }
],
xaxis: { categories: ["Gross Rent","Vacancy","Op. Ex","NOI","Debt Service","Cash Flow"] }
```
**Calc-engine step:** the invisible-base-series running-total math still belongs in the calc-engine service, computed once as part of the same `/calc-deal-metrics` call (Doc 03 Stage 3) and written to `deal_metrics` — this keeps the "engine computes, chart only displays" boundary intact, unchanged from the Bubble version's own reasoning. Add the six base/value pairs as additional `deal_metrics` columns (or a single `jsonb` column holding the waterfall array, which is arguably the better fit here — see Doc 02 Addendum A's `scenarios.snapshot_json` for the precedent of using `jsonb` for a small structured blob rather than proliferating individual columns).

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
**Calc-engine step:** per the project's own build history, this schedule already exists — the per-tranche amortization engine was built (session 5d, per the real per-tranche amortization schedule and return decomposition work already completed). This stage is narrower than the old addendum implied: it's binding an existing calc-engine output to a chart, not building the amortization math from scratch. Same on-demand-not-every-run guidance as before — compute the full schedule when the user opens this specific chart, not on every metrics recalculation, to avoid needless work on a schedule that can run hundreds of rows for a 25-year term.

## STAGE E5 — Development Studio Overview: Cost Donut

**Data:** `budget_lines.amount` summed by `budget_group` (Land/Hard/Soft/Financing).
**Config:**
```javascript
chart: { type: "donut", ... },
colors: [/* pull each budget_group's color from budget_group_meta */],
series: [/* summed amount per group */],
labels: ["Land","Hard","Soft","Financing"]
```
**This is still the one chart that does NOT use the shared E0 palette** — it uses `budget_group_meta.color` (Doc 02 Addendum A §1's lookup table, the direct Postgres equivalent of the old Option Set's `Color` attribute), so the donut's colors always match any other place in the UI showing a Land/Hard/Soft/Financing badge or pill. Same reasoning as before, same table design, different underlying mechanism.

**No longer the recommended first build** — see "Build order," below. It was the old addendum's recommended starting point because it was the simplest chart to prove the Bubble embedding pattern against. Doc 53 recommends E1 instead for the WeWeb spike, since E1 is now the smaller, cleaner example (a single Supabase query, no lookup-table color mapping to also verify at the same time).

## STAGE E6 — Development Studio Financing: Draw S-Curve

**Data:** `draw_months.cumulative`, ordered by `month_index`, one series per `loan_facilities` row.
**Config:**
```javascript
chart: { type: "line", curve: "smooth", ... },
series: [{ name: "[Facility Rank]", data: [/* cumulative values in month_index order */] }],
xaxis: { categories: [/* month_index list */] }
```
**Supabase step:** a plain query ordered by `month_index`, same shape as E1's — no intermediate CSV-string conversion needed, for the same reason noted there. The old addendum's note about this being "the pattern you'll reuse most often, worth a small reusable backend workflow" is moot in this stack: every chart needing an array from Supabase gets one directly from the query itself, so there's no repeated CSV-conversion step to consolidate into a shared workflow in the first place.

## STAGE E7 — Development Studio Risk: Sensitivity Heatmap

**Data:** the price × hard-cost grid (Doc 07 §5.9) — margin-on-cost at each combination.
**Config:**
```javascript
chart: { type: "heatmap", ... },
series: [/* one series per hard-cost delta row, each an array of {x: price_label, y: margin_value} */],
plotOptions: { heatmap: { colorScale: { ranges: [
  { from: -100, to: 0, color: "#F87171", name: "Below target" },
  { from: 0, to: 15, color: "#D9B04A", name: "At target" },
  { from: 15, to: 100, color: "#4ADE80", name: "Above target" }
]}}}
```
**Calc-engine step, unchanged in principle:** this grid must be precomputed server-side (loop sale-price deltas × hard-cost deltas, run F-707's ROC formula at each combination) — real compute, not display, so it lives in the calc-engine, not client-side JS. The only change from the Bubble version is that "server-side" now means the calc-engine service rather than a Bubble backend workflow; the reasoning for keeping it there at all is unchanged.

## STAGE E8 — Development Studio Risk: Breakeven Ladder

**Data:** the units-sold thresholds from F-710 (Doc 06 Addendum A) — units sold %, outstanding balance, residual LTV at each threshold.
**Config:**
```javascript
chart: { type: "bar", horizontal: true, ... },
series: [{ name: "Outstanding Balance", data: [/* balance at each threshold */] }],
xaxis: { categories: [/* threshold labels, e.g. '1st facility retired', '2nd facility retired' */] }
```
No platform-specific step here in either version — this was always calc-engine output bound to a chart with no intermediate aggregation step.

---

## Build order — the spike comes first, not chart-by-chart

**This is the one section that genuinely changed, not just translated.** The old addendum recommended building E5 first, reasoning that it was the simplest chart and would prove the Bubble HTML-element pattern worked before investing in the compute-heavy ones. That reasoning doesn't carry over cleanly, because the open question in this stack isn't "does the pattern work at all" (Bubble's HTML element was a known, previously-used mechanism) — it's "which of two real candidates is the right one" (per Doc 53 §5, genuinely unconfirmed either way).

**Recommended order:**
1. **Spike E1 first** (Portfolio Asset Allocation donut), per Doc 53's own recommendation — it's the smallest already-specced example, its data comes from a single plain query with no lookup-table color mapping to complicate the comparison, and proving Candidate A vs. Candidate B against it is cheap to redo if the first choice turns out wrong.
2. **Decide between Candidate A (custom HTML/JS embed) and Candidate B (custom Vue component)** based on what the spike actually shows — which one WeWeb supports more cleanly, which one handles the `destroy()`/`updateSeries()` guards more naturally, which one is less fragile across WeWeb editor updates.
3. **Only then build E2–E8** using the winning candidate, in whatever order suits the surrounding page work (Doc 03's own stage order is a reasonable default — E2/E3/E4 alongside Stages 7–8, E5–E8 once Development Studio's own build phase starts).

---
*End of Doc 03 Addendum B (WeWeb revision — pending build spike per Doc 53 §5) · Supersedes: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md · Parent: 03-Build-Checklist-WeWeb-Supabase.md · Depends on: 04-InvestScape-Style-Guide.md (colors/fonts), 02-Database-Schema-Addendum-A-DevStudio-Supabase.md (`budget_group_meta.color`, `draw_months`), 02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md (E2's data source), 06-Commercial-Formula-Library-Addendum-A (F-706, F-710) · Unresolved pending the Stage E1 spike: which embedding candidate WeWeb actually supports better — see Doc 53 §5*
