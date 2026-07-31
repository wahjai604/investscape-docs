# InvestScape — Chart Label Legibility: Shared Chip Style (Doc 42)

**Root cause across all five issues below: value labels sit directly on top of busy backgrounds (colored bars, lines, gridlines) with no visual separation.** Rather than patching each chart separately, build ONE reusable label style and apply it everywhere — cheaper, and guarantees consistency instead of five slightly-different fixes.

```
1. ESTABLISH A SHARED "CHART LABEL CHIP" STYLE: a small rounded background
   pill behind any value label that sits on top of a chart element (bar,
   line, gridline) — dark semi-transparent or solid background (whichever
   reads best against the dark theme), consistent padding, consistent
   font size, positioned so it never gets visually cut through by a line
   or blends into a same-color bar. This is the standard financial-
   terminal convention (labels always have their own background over a
   chart) — think Bloomberg-style callouts, not raw SVG text floating in
   space.

2. APPLY IT to all of the following, replacing whatever positioning
   exists now:
   a. Portfolio — Equity vs. Debt per holding: move each bar's % label to
      sit ABOVE its bar (not overlapping/inside it), using the chip style.
   b. Deal Analyzer — Income Waterfall: rebuild this as an actual floating
      waterfall — each bar should start where the previous one ended
      (cumulative), not all sitting on the same baseline — with thin
      connector/step lines between bars showing the running total. Apply
      the label chip to each bar's value. Make sure the y-axis gridlines
      visibly connect to bar heights rather than floating disconnected on
      the left.
   c. Dev Studio Overview — S-curve: reposition the start/mid/end callouts
      so each sits directly at its actual point on the curve with the
      label chip, with enough spacing that they don't overlap each other
      or the axis labels.
   d. Dev Studio Financing — Draw schedule: apply the label chip to the
      start-point value specifically (currently rendering with a line
      visually cutting through the text) and confirm the end-point label
      gets the same treatment for consistency.
   e. Dev Studio Notes tab (confirm this is the "Notes" tab specifically,
      not Timeline — the presale pace chart with the AI Insight callout
      above it): apply the same label chip treatment to its axis
      values/points for consistency with everything else, even though
      this one was already in reasonable shape.

3. ADD AN EQUITY DEFINITION CAPTION: under the "Equity vs. Debt per
   holding" chart title on Portfolio, add a brief one-line explanation:
   "Equity = current property value minus outstanding loan balance."
   Small, muted text, same tone as the Post Tags legend explanations.

All new copy in the i18n dictionary, four languages.

After this pass, take CLOSE-UP zoomed screenshots of all five chart areas
(a-e above) so the label chips and spacing are actually legible in the
screenshot — not full-page screenshots where small text can't be judged.
```

---
*End of Doc 42 · Polish pass on: Doc 41's persistent-label fix*
