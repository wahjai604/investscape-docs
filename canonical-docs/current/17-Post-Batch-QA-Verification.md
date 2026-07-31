# InvestScape — Post-Batch QA Verification (Doc 17)

**Why this needs its own pass:** each of the 7 batches was tested in isolation by design, but they touch overlapping surfaces (the Deal page alone was touched by Batches 1, 2, 4, and 5). The real risk now isn't "did Batch 3 work" — it's whether Batch 6 remembered Batch 5's rules, or whether Batch 7's mobile pass squeezed something Batch 1 or 4 added. **Ask Claude Design to audit and report first, not silently fix** — same principle as everything else in this build: decisions get flagged, not resolved quietly. If it finds something, you decide whether it's a real problem before it gets "fixed" into something else.

---

## Prompt 1 — Per-batch functional check

```
Go through each of the following and confirm it's actually working, not just
present visually. For each item, report PASS, FAIL, or PARTIAL with a short
note — don't fix anything yet, just report.

1. LOADING STATES: trigger a recalculation (edit a Deal input, or click
   "regenerate AI analysis"). Confirm a skeleton placeholder shows during
   the wait, not a blank space or a frozen old value.

2. ERROR STATES: is there a visible way to trigger the error pattern (even
   if simulated), and does it show plain-English text with a retry action
   rather than a raw error or a disruptive modal?

3. EMPTY STATES: confirm Deal Analyzer, Development Studio, Community,
   Library, and Research all show a real empty state (icon + one sentence
   + primary action) — not just Portfolio.

4. DISCLAIMER COMPONENT: confirm the exact same disclaimer text and
   styling appears on every screen that shows a metric, AI narrative, or
   grade — Deal page, Portfolio summary, Dev Studio proforma. Flag any
   screen where the wording or styling differs even slightly.

5. GRADE BADGE: confirm the "Screening Signal" label and the one-line
   explanation are both visible without hovering/tapping anything, and
   that the badge no longer visually dominates the raw metrics beneath it.

6. CHART REACTIVITY: edit a Land/Hard/Soft/Financing cost input and
   confirm the donut chart updates immediately with no page refresh, no
   stacked/duplicate chart renders, and a visible transition. Do the same
   for the Portfolio allocation donut and equity bars.

7. CURRENCY: on the Portfolio page, confirm the Total Value card shows
   per-currency subtotals as the prominent figure and the converted total
   as a visually secondary line with rate/date on hover or tap. Confirm
   every row in the property table has an explicit CA$/US$ prefix, and
   that Cap Rate / Occupancy columns have no currency prefix at all.

8. LANGUAGE SWITCHER: switch to French, then to a Chinese variant.
   Confirm table headers, card labels, buttons, and filter pills all
   translate — not just the top nav. Confirm property addresses and any
   user-entered text do NOT translate.

9. NOTIFICATION BELL: confirm the badge count is accurate, the dropdown
   opens on click with realistic mixed sample notifications, unread rows
   are visually distinct, and "Mark all as read" clears the badge. Confirm
   the Settings page has a matching checkbox list with a Save button.

10. MOBILE: at a 390px-wide viewport, confirm the Portfolio holdings table
    scrolls horizontally within its own container (not the whole page),
    KPI cards stack vertically, and nothing overlaps or gets cut off.

11. CONTRAST: spot-check the muted secondary text color and the gold
    accent against the navy background — do they look legible, not washed
    out?
```

---

## Prompt 2 — Cross-batch conflict check

*This is the part that actually needs a fresh set of eyes — these are specific places where two batches touch the same surface and could quietly disagree.*

```
Check these specific interactions between features built in different
passes, since each was built somewhat independently:

1. On the Deal page, look at the reusable disclaimer (bottom of page) and
   the grade badge's own explanation line ("Based on the metrics below,
   not a recommendation..."). Do these two pieces of text feel redundant
   or contradictory sitting on the same page? Report what you see — don't
   change anything yet.

2. When a chart-linked input is being edited (e.g. typing a new Land Cost
   value), does a loading skeleton flash on the chart during the live
   recompute? It shouldn't — chart reactivity should feel instant, and a
   skeleton flashing on every keystroke would look broken. Confirm the
   loading state only appears for genuinely asynchronous operations (AI
   narrative regeneration), not for the instant client-side chart math.

3. Switch to French, then check the Portfolio Total Value card and the
   property table's currency prefixes. Do dollar figures reformat to
   French-Canadian convention (number then symbol, e.g. "1 234 567 $"),
   or do they stay in the English "$1,234,567" format under French text?
   This is a known gap worth confirming either way.

4. The notification bell and its Settings panel were built after the
   language switcher batch. Switch to French or Chinese and check whether
   the notification dropdown's text and the Settings notification list
   translated too, or whether they were missed since they didn't exist
   yet when the language batch ran. Report which is the case.

5. At the 390px mobile width, check: does the split currency Total Value
   card (per-currency subtotals + converted total) still read clearly
   stacked, or does it get cramped? Does the disclaimer component stay
   fully visible and legible, or does it get pushed off-screen or
   shrunk illegibly? Does the notification dropdown panel position
   sensibly on a small screen, or does it overflow the viewport?

6. On any empty state (Deal Analyzer, Dev Studio, etc.), confirm the
   disclaimer component does NOT show — it shouldn't appear on a page with
   no data/metrics to disclaim about. Flag if it's showing anywhere it
   shouldn't.

Report findings as a simple list: what you checked, what you found, and
whether it looks like a real conflict or is actually fine. Don't fix
anything without confirming first.
```

---

## What to do with the results

Treat anything reported as **FAIL or a real conflict** as a small, separate, scoped prompt of its own — same one-thing-at-a-time discipline as the original 7 batches. Resist the urge to bundle three fixes into one follow-up prompt; that's exactly the shallow-fix risk the batching approach was designed to avoid in the first place.

Anything reported as **PARTIAL or "found but not clearly a problem"** — bring back here and we'll decide together whether it needs a fix before Figma or can ship as a known simplification, same as everything else flagged through this build.

---
*End of Doc 17 · Tests: 16-Master-Claude-Design-Prompt-Pack.md (all 7 batches)*
