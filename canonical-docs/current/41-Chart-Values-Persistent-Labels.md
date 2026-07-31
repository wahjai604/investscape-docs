# InvestScape — Chart Values Must Be Persistently Visible, Not Hover-Only (Doc 41)

**Context:** Prompt J's fix added tooltips and summary sentences, but several charts still show no readable numbers without hovering — and a plain screenshot proves it, since hover state can't be captured in one. The standard to match is your own existing donut charts (Portfolio allocation, Dev Studio cost breakdown), which already show permanent, always-visible values in their legend ("Residential · 19%") with no interaction required. Every chart below needs to meet that same bar.

**Also: two claims in the last report don't match the screenshots.** The Income Waterfall (Deal page) and the Overview S-curve (Dev Studio) were reported as "already had titles and inline value legends" — the actual screenshots show bare colored shapes with no values or axis at all. Re-verify these two specifically rather than trusting the earlier assessment.

```
Add PERSISTENT, always-visible value labels to the following charts —
not tooltips, not hover-only, but numbers a user can read directly off
the chart in a plain screenshot with no interaction:

1. PORTFOLIO — Equity vs. Debt per holding (stacked bars): add a visible
   dollar value (or %) label on or directly above each bar segment,
   and the property address/name under each bar's x-axis position, so a
   user can read "Unit 1804: $X equity / $Y debt" without hovering.

2. DEAL PAGE — Income Waterfall: this currently has NO values at all —
   re-check it directly, it is not already done. Add a dollar value
   label on or above each of the 5 bars (Gross Rent, Vacancy, Op. Ex,
   NOI, Debt Service, Cash Flow), plus a value axis on the left so the
   bar heights are readable against real numbers, not just relative size.

3. DEV STUDIO OVERVIEW — Equity & debt draw S-curve: this currently has
   NO axis values or callouts — re-check it directly, it is not already
   done. Add a visible y-axis with dollar values, and label the start,
   midpoint, and end points of the curve with their actual draw amounts.

4. WORKSPACE — Rent trend chart (all 3 property instances): add a visible
   y-axis with dollar values (not just the relative line shape), so a
   user can read the actual estimated rent at a glance, not just whether
   it's trending up or down.

5. DEVELOPMENT STUDIO — "Financing" tab and "Timeline" tab: these were not
   covered in the last pass at all. Sweep both tabs for any chart/visual
   (draw schedules per facility, timeline/Gantt milestones, or anything
   else chart-like) and apply the same standard: visible title, visible
   values/axis, no hover required to read the core numbers.

Keep the existing tooltips and summary sentences — those stay, this adds
the persistent labels on top of them, it doesn't replace them. All new
label text in the i18n dictionary, four languages.

After this pass, take CLOSE-UP/ZOOMED screenshots (not full-page) of each
of the 5 items above, so the actual visible numbers are legible in the
screenshot itself — this is the only way to confirm a persistent label
is genuinely there versus assuming it from a description.
```

---
*End of Doc 41 · Corrects false claims + extends: Prompt J (Doc 55, renumbered from Doc 28 — see Doc 55's own header note)*
