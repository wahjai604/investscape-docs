# InvestScape — UX Stress-Test Addendum: Chart-to-Data Reactivity

**Strictly additive to Document 09.** New gap, not previously flagged in the original audit.

---

## The gap

Doc 09's audit covered structural gaps (empty states, signup flow, disclaimer footer) but never explicitly tested **whether charts stay linked to the data that feeds them.** Checking the five mockups against this specifically:

| File | Reactive? | Evidence |
|---|---|---|
| `investscape-devstudio-drilldown-1.html` (Quick Proforma donut) | ✅ Yes | `document.addEventListener('input', ...)` triggers `qp()`, which recomputes the whole model and redraws the donut's `stroke-dasharray`/`transform` on every keystroke |
| `investscape-portfolio-drilldown.html` (Deal Statement figures) | ✅ Yes | Figures recompute in-page from Template v2 arithmetic, per its own footer note |
| `investscape-v2-unified.html` / `ecosystem.html` (Portfolio allocation donut, equity bars) | ❌ No | Hand-drawn static SVG with sample values baked in — no input listener, nothing to react to |

**Why this matters for the Bubble build, not just the mockups:** Doc 03 Addendum B's ApexCharts wiring already includes the destroy-before-recreate guard needed for reactivity to work technically — but that guide never states *reactivity is a requirement*, only how to avoid the stacking-render bug *if* you build it reactively. Worth making explicit before Bubble build starts: **every chart tied to a Deal, DevProject, or Portfolio must visibly update when its underlying inputs change, with no manual refresh.** This is a design requirement, not just a technical capability — e.g., editing a Deal's rent assumption should visibly move the income waterfall (E3) before the user navigates away, the same way the Quick Proforma donut already behaves.

**Add to the priority punch list (Doc 09 §7), "Fix before Bubble build starts":**
8. Confirm every ApexCharts instance in Doc 03 Addendum B is wired to its data source's live value, not a one-time page-load snapshot — test by editing an input and watching the chart redraw without a page refresh.

---

## A Claude Design prompt to prototype this

Since this is easiest to verify by seeing it work, rather than just reading a spec, here's a ready-to-paste prompt for Claude Design that builds a small working demo of the exact pattern — matching your actual style guide and one of your real charts (the cost donut, since it's your simplest per Doc 03 Addendum B's build order).

```
Build a single-page interactive prototype demonstrating a live, data-linked
ApexCharts donut chart for a real estate development budget tool called
InvestScape.

Style:
- Dark terminal aesthetic. Background #0C1B2E (deep navy), cards #171B26,
  gold accent #D9B04A, text #F7F5EF, borders rgba(255,255,255,0.08).
- Fonts: "Fraunces" for headings, "Inter" for body/labels, "DM Mono" for
  every number (load all three from Google Fonts).
- Donut chart colors: Land #D9B04A (gold), Hard #7DD3FC (blue),
  Soft #4ADE80 (green), Financing #F87171 (red) — use ApexCharts via CDN
  (https://cdn.jsdelivr.net/npm/apexcharts), chart type "donut", dark theme,
  font family "DM Mono, monospace".

Layout:
- Left panel: four number inputs labeled "Land Cost", "Hard Construction
  Cost", "Soft Costs", "Financing Costs" — prefilled with 23354491,
  37700229, 9533927, 4411549 (a real validated example budget).
- Right panel: the donut chart, with a centered total ("Total Budget: $X")
  that also updates live, formatted as currency.

Behavior (this is the important part):
- The donut chart must update in real time as the user types in any input
  field — no submit button, no page refresh. Recompute the series values
  and re-render the chart on every keystroke.
- Before creating a new chart instance, destroy the previous one first
  (store the chart instance on the DOM element and call .destroy() if it
  exists) so edits don't stack multiple chart renders on top of each other.
- Add a subtle transition/animation on the donut segments so the change
  is visually obvious, not just an instant snap.
- Below the chart, show each segment's live % of total (e.g. "Land — 31.1%")
  updating in the same DM Mono font as the dollar figures.

Add one line of small italic text at the bottom: "Prototype: verifies
chart-to-input reactivity pattern for InvestScape Development Studio."
```

This prompt intentionally uses your real validated 796 Main Street numbers as the starting values, your real color/font tokens from Doc 04, and the exact destroy-before-recreate guard from Doc 03 Addendum B — so what comes back is a working reference you can literally watch behave the way Bubble needs to, before you build the real thing there.

---
*End of addendum · Parent document: 09-UX-Stress-Test-Audit.md · Related: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md*
