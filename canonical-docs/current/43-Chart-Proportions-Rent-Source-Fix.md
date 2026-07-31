# InvestScape — Chart Card Proportions + Rent-Chart Country Matching (Doc 43)

```
Two categories of fix:

1. RENT CHART DATA SOURCE & COUNTRY MATCHING (Deal Analyzer Notes tab,
   and the same chart pattern in Workspace) — this is a data-integrity
   fix, not cosmetic:
   a. Add a small source label to the chart (e.g. "Comps: Canadian rental
      data" or "Comps: US rental data" depending on which dataset is
      shown), placed near the chart title.
   b. Make the data source selection actually keyed to the deal's/
      property's own Country field — a Canadian property must only ever
      show Canadian comparable data, a US property only US data. If the
      current demo data doesn't already vary by property, fix the demo
      data so at least one Canadian-property instance and one US-property
      instance visibly show their correct, different, labeled source.
   c. All new label text in the i18n dictionary, four languages.

2. CHART CARD PROPORTIONS — pure layout/CSS work, no new architecture:
   a. Portfolio: change the "Allocation by category" donut and "Equity
      vs. Debt per holding" bar chart from their current width split to
      roughly 25/75 (donut narrower, bar chart wider) — the bar chart has
      7 data points needing horizontal room, the donut only needs space
      for 5 legend rows.
   b. Dev Studio Overview: shrink the "Cost breakdown" donut's card width,
      and give the "Equity & debt draw — S-curve" chart real vertical
      height (not just width) so it isn't stretched flat — position it
      alongside or below the sensitivity heatmap at matching card
      proportions.
   c. Dev Studio Financing tab: give the "Draw schedule" chart more
      vertical height, same reasoning as the S-curve above.
   d. Leave the Notes tab and Workspace charts' proportions as they are —
      both already read well and can serve as the reference size/aspect
      ratio for the others.

Screenshot: Portfolio's two charts at the new proportions, Dev Studio
Overview's donut+S-curve+heatmap area at new proportions, the Financing
tab chart taller, and one Canadian + one US rent-chart instance showing
different labeled data sources side by side.
```

---
*End of Doc 43 · Follows: Doc 42 (label legibility) · Logged separately: coarse per-widget size presets (Small/Large) as a Doc 24 extension — not prompted here, freeform drag-resize deferred to Route 2*
