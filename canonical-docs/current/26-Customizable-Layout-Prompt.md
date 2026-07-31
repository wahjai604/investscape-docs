# InvestScape — Customizable Layout System: Prompt (Doc 26)

**Implements Doc 24. One prompt, but read the note at the bottom before running it — this is the same "instruction says 'everywhere' but only the visible page gets fixed" trap that hit the language sweep and the chart reactivity check earlier, so the prompt is deliberately over-explicit about scope.**

```
Extend the existing "Customize" toggle (currently only works on Portfolio's
top KPI cards) to work the same way on FIVE pages total — Portfolio, the
Deal page, Development Studio's project workspace (Overview tab), Research,
and Market Intel. Do NOT limit this to Portfolio or to whichever page is
easiest to test first — all five need to work identically.

For each of these five pages, the customizable widgets are:
- Portfolio: the KPI cards (already working — keep as-is, just make sure
  it still works after this change)
- Deal page: Deal snapshot panel, Income waterfall chart, Amortization
  chart, AI takeaway panel
- Dev Studio Overview: the KPI cards, the cost breakdown donut, the draw
  S-curve chart, the breakeven ladder
- Research: Today's Numbers panel, Top Contributors panel, Trending Tags
  panel
- Market Intel: AI Morning Brief, the market/city cards, Watchlist Movers
  panel, Data Sources panel

Do NOT add this to Community, Library, or Workspace — those are
feed/list-style pages, not dashboards, and don't need widget reordering.

Behavior, same on all five pages:

1. Flipping "Customize" ON enters layout-edit mode for whichever of the
   five pages is currently open.
2. Each widget in edit mode shows an eye icon (toggle visibility on/off)
   and reorder controls. Try drag-and-drop reordering first if it's
   straightforward to implement reliably; if it's fiddly, fall back to
   simple up/down arrow buttons per widget instead — either is fine, but
   whichever you use should work the same way on all five pages.
3. A "Save Layout" button appears in edit mode. Clicking it persists that
   page's widget order/visibility and exits edit mode.
4. A "Reset to default" link/button reverts that page to its original
   shipped order and visibility.
5. Each of the five pages remembers ITS OWN layout independently — hiding
   a widget or reordering things on Research shouldn't affect Portfolio's
   layout, and vice versa.

After implementing, demonstrate this on THREE different pages, not just
one — e.g. hide a widget and reorder two others on Portfolio, save, then
do the same on Research, save, then do the same on the Deal page, save.
Screenshot each page's result after saving, and then reload/revisit each
of those three pages to confirm the saved layout actually persisted rather
than reverting to default. Report which pages you tested and whether the
persistence held on each one.
```

**Why the "test three pages, not one" instruction is there:** the language sweep initially only translated the page that was on screen despite the instruction saying "every page." The chart reactivity check only tested the Dev Studio donut until explicitly asked to check Portfolio too. Being explicit up front about testing multiple pages, not just accepting a report about one, is meant to catch that failure mode before it happens again rather than after.

---
*End of Doc 26 · Implements: 24-Customizable-Layout-System.md*
