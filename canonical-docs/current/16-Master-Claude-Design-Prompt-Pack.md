# InvestScape — Master Claude Design Prompt Pack (Doc 16)
### Everything queued for the prototype, sequenced for one pre-Figma pass

**How to use this:** don't paste all seven batches into Claude Design in one message. Large, mixed-scope prompts tend to produce shallow fixes across everything rather than solid fixes on anything — the model spreads its attention across every instruction instead of doing each one well. Paste **one batch at a time**, let it finish, look at the result, then move to the next. The order below is deliberate: structural states first (they affect the most surfaces), then specific known bugs, then polish.

---

## Batch 1 — System states (loading, error, empty, disclaimer)
*Addresses Doc 12 §1.1, 1.2, 1.4, 1.6. This is the biggest structural gap — every other batch touches individual features, this one touches every screen.*

```
The prototype currently only shows the "happy path" with full data loaded.
Add four missing system states as reusable patterns, applied consistently
across Portfolio, Deal Analyzer, and Development Studio:

1. LOADING STATE: whenever a metric, chart, or AI narrative would be
   recalculating (e.g. after editing a deal input, or regenerating the AI
   analysis), show a skeleton placeholder — a subtly pulsing gray/navy
   block in the shape of the content that's loading (a chart-shaped
   skeleton for charts, a few lines of skeleton text for the AI narrative
   paragraph, a skeleton number for a KPI card). Never show a blank space
   or a frozen stale value while something is recalculating.

2. ERROR STATE: design a reusable inline error pattern for when something
   fails — e.g. "We couldn't reach the AI analysis service. [Try again]"
   or "We couldn't calculate this — check that Purchase Price isn't zero."
   Use a small warning icon, one line of plain-English explanation (never
   a raw error code), and a "Try again" action where relevant. Show this
   in place of the content that failed, not as a disruptive full-screen
   modal.

3. EMPTY STATES for Deal Analyzer, Development Studio, Community, Library,
   and Research (Portfolio's empty state already exists — match its tone
   and visual style for these). Each should have: a simple icon or
   illustration, one sentence explaining what this section is for, and one
   clear primary action (e.g. Deal Analyzer empty state: "No deals yet —
   analyze your first property" button).

4. DISCLAIMER COMPONENT: create one reusable disclaimer element — small
   text, low visual weight but always legible, reading something like "For
   informational purposes only. Not financial, legal, or tax advice." —
   and place it consistently at the bottom of every screen that shows a
   computed metric, an AI narrative, or a grade (Deal page, Portfolio
   summary, Dev Studio proforma, any export/report view). It should look
   identical everywhere it appears — this is a single component reused,
   not custom copy per page.
```

---

## Batch 2 — Grade badge: reframe as a screening signal, not advice
*Addresses Doc 12 §1.3 — your highest liability surface in the current UI.*

```
The Deal page shows a letter-grade badge (A/B/C/etc.) in a colored pill.
Right now it reads like a recommendation. Reframe it:

1. Add a small label directly above or beside the badge: "Screening
   Signal" in small caps, muted color — so the badge itself is visually
   subordinate to that framing, not the other way around.
2. Add a one-line explanation directly under the badge, always visible
   (not hidden behind a tooltip): "Based on the metrics below, not a
   recommendation to buy or pass."
3. Keep the badge's color coding (green/gold/red family) but reduce its
   visual dominance slightly relative to the raw metrics beneath it (cap
   rate, cash-on-cash, DSCR) — the numbers should feel like the primary
   content, the grade like a summary label on top of them, not the star
   of the page.
```

---

## Batch 3 — Chart-to-data reactivity
*Addresses the gap confirmed earlier: the Dev Studio donut already does this correctly, Portfolio's donut/bars don't. Full prompt from the UX Stress-Test Addendum (Doc 09 Addendum):*

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

Behavior:
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

Then apply this same live-recompute pattern to the Portfolio allocation
donut and equity-vs-debt bars on the main Portfolio page — those are
currently static and should update the same way if the underlying property
data changes.
```

---

## Batch 4 — Currency: fix the mixed-total bug
*Addresses the Portfolio drilldown silently summing CAD + USD into one number.*

```
The Portfolio page's "Total Value" KPI card currently sums all properties
into one dollar figure regardless of currency (e.g. a Burnaby, BC property
and an Austin, TX property both get added into one "$" total as if they're
the same currency). Fix this:

1. Split the Total Value card into two lines: per-currency subtotals first
   (e.g. "CA$4,020,000 · US$1,562,000"), then a converted grand total below
   in smaller text (e.g. "≈ CA$6,158,940 total"), with a small info icon
   next to it. Hovering or tapping the info icon shows: "Converted at 1 USD
   = 1.394 CAD, Bank of Canada, Jul 15 2026."
2. In the property table, every Value and Cash Flow/Mo cell should show an
   explicit currency prefix — "CA$" or "US$" — never a bare "$", since this
   table mixes both currencies.
3. Ratio-based columns (Cap Rate, Occupancy) need no currency treatment —
   leave those exactly as they are.
4. Use DM Mono for all figures, matching the existing style, and keep the
   converted-total line visually secondary (smaller, text-secondary color)
   to the per-currency subtotals, which stay primary/prominent — the
   subtotals are the honest number, the conversion is a convenience.
```

---

## Batch 5 — Language switcher: translate the whole shell, not just the nav
*Addresses the screenshot showing table headers/labels staying English while the nav translated.*

```
The language switcher (globe icon, top ribbon) currently only translates
the top navigation labels — table column headers, card labels ("TOTAL VALUE",
"CATEGORY", "CASH FLOW / MO", etc.), buttons, and filter pills stay in
English when another language is selected. Fix this: when a language is
selected from the globe dropdown, every piece of interface chrome on the
page should translate — nav, page titles, card labels, table headers,
button text, filter pills, tooltips — everything except: (1) user-entered
data like property names/addresses (e.g. "142 Maple Grove Ave." stays as
typed), and (2) imported file names. Keep the same visual layout and sizing;
only the text content changes per language.
```

---

## Batch 6 — Notification bell: make it functional
*Addresses the bell icon currently sitting as a static, unwired element.*

```
The bell icon in the top ribbon is currently just a static icon with no
behavior. Make it functional:

1. Add a small badge (gold dot with a number) on the bell when there are
   unread notifications — no badge at all when the count is zero.
2. Clicking the bell opens a dropdown panel below it, showing the 5–10 most
   recent notifications as a simple list. Each row: a small icon indicating
   type, a one-line title (e.g. "Draw Report #4 awaiting review"), a
   relative timestamp ("2h ago"), and unread rows marked with a small gold
   dot on the left edge.
3. Add a "Mark all as read" link at the bottom of the panel.
4. Populate it with realistic sample notifications covering a few types:
   a pending import awaiting review, an item that was archived, and a
   system message — so the pattern is visible with mixed content, not just
   one repeated row.
5. Add a matching "Notifications" section to the Global Settings page
   (reachable from the avatar dropdown): one row per notification type,
   each with a checkbox labeled "Notify me" and a short plain-English
   description of when it fires. Include a "Save" button at the bottom.
```

---

## Batch 7 — Mobile breakpoints and contrast pass
*Addresses Doc 12 §1.5 and §1.7. Do this last — it's a pass over everything the earlier batches touched, so it should come after those are settled.*

```
Two passes over the whole prototype:

1. MOBILE: add phone-width layouts (375–428px viewport) for the Portfolio
   holdings table, the Dev Studio Quick Proforma, and the Deal Analyzer
   statement table. Any table wider than the viewport should scroll
   horizontally within its own container rather than breaking the page
   layout or forcing the whole page to scroll sideways. Stack KPI cards
   vertically at phone width instead of the current horizontal row.

2. CONTRAST: the app background was recently changed to deep navy
   (#0C1B2E). Check every text color used against that background —
   especially the muted "text-secondary" gray and the gold accent
   (#D9B04A) — and confirm each meets at least a 4.5:1 contrast ratio for
   body text (WCAG AA). Adjust opacity or shade slightly on any pairing
   that falls short, keeping the overall palette recognizable.
```

---

## Recommended sequencing

Run **Batch 1 first, always** — it's the widest-reaching and everything after it should render inside those states correctly. Batches 2–6 can go in any order based on what you want to see working next; I'd suggest 4 (currency) and 5 (language) together since you already have the exact bugs on screen to compare against. Save **Batch 7 for last** — it's a review pass over the cumulative result, not a new feature, so running it early just means re-running it again after everything else changes.

---
*End of Doc 16 · Consolidates: 09-UX-Stress-Test-Addendum-Chart-Reactivity, 11-Notification-System-Design, 13-Internationalization-Language-System, 15-Currency-Multi-Jurisdiction-Schema, 12-Pre-Port-Advisory-Review §1*
