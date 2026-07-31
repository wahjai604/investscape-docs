# InvestScape — S-Curve Consistency + Real Floating Waterfall (Doc 44)

```
Two specific fixes:

1. DEV STUDIO OVERVIEW S-CURVE — make it match the Financing tab's
   "Draw schedule — 1st mortgage" chart exactly, since that one is already
   correct. Specifically:
   a. Add the same left-side y-axis scale (evenly spaced dollar gridline
      labels from $0 up to the max draw amount), same style as the
      Financing tab.
   b. Remove any stray/disconnected value label that isn't actually tied
      to a real point on the curve — every chip should sit exactly at a
      real data point (start, a midpoint, end), nothing floating without
      a corresponding point.
   c. Make sure the curve's own data range actually uses the taller
      viewBox — if the box is 220 tall, the curve should visually rise
      through most of that height, not stay flattened in a thin band
      near the bottom with empty space above it.

2. INCOME WATERFALL (Deal Analyzer, "Income waterfall — annual") — this
   still renders as 5 independent bars from a shared $0 baseline, not a
   real waterfall. Rebuild it as an actual floating/cumulative waterfall:
   a. Gross income starts at $0 and rises to its value.
   b. Op. expenses floats DOWN from the top of Gross income's bar (not
      from $0) — its top edge = Gross income, its bottom edge = Gross
      income minus Op. expenses.
   c. NOI's bar sits at the height Op. expenses left off at (this is the
      running total after expenses).
   d. Debt service floats down from NOI's level the same way Op. expenses
      did.
   e. Cash flow is the final running total, from $0 up to its value (or
      floating from wherever Debt service left off, whichever is
      mathematically correct for gross rent → cash flow).
   f. Add a thin dotted/dashed connector line between the top of each bar
      and the start of the next, so the eye can follow the cascade — this
      is the visual signature that makes a waterfall read as a waterfall
      rather than a bar chart.
   g. Keep the existing value chips on each bar, just repositioned to sit
      on the now-floating bars correctly.

After both fixes, screenshot the Dev Studio Overview S-curve (confirming
it now has the axis scale and uses its height properly) and the Income
Waterfall (confirming the cascading/floating structure with connector
lines is visually obvious, not just individual bars).
```

---
*End of Doc 44 · Corrects: an inconsistency between two similar charts, and an unbuilt requirement from Doc 42*
