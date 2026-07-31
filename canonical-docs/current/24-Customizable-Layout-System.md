# InvestScape — Customizable Layout System (Doc 24)

**Extends "Customize" from Portfolio-only to every dashboard-style page.** Deliberately architected so it also becomes the foundation for the deferred multi-monitor pop-out (Doc 22 §4) — a self-contained, positionable widget is the same building block whether it's being reordered on one screen or eventually popped into a second window.

---

## 1. Scoping — not literally every screen

"Customize" makes sense on dashboard-style pages (a collection of independent cards/panels/charts). It doesn't make sense on inherently linear content — a chronological feed or a document doesn't have "cards to rearrange."

| Page | Customizable? |
|---|---|
| Portfolio | Yes (already partially built — extend the same mechanism) |
| Deal Analyzer (deal detail) | Yes — Deal snapshot panel, Income waterfall, Amortization chart, AI takeaway |
| Development Studio — project workspace (Full Proforma) | Yes — KPI cards, cost donut, draw S-curve, breakeven ladder |
| Research | Yes — Today's Numbers, Top Contributors, Trending Tags |
| Market Intel | Yes — AI Morning Brief, market cards, Watchlist Movers, Data Sources |
| Community | **Yes (added later — see note)** — right-rail panels only: Top Contributors, Post Tags legend |
| Library | **No** — a browsable card grid with filters, not independent panels |
| Workspace | **No** — checklists/notes are inherently ordered content, not independent widgets |

**Why Community was added after this doc was first written:** at the time, Community was a single post feed — genuinely not dashboard-like. It has since grown (Docs 35–40) into a page with several independent right-rail panels (Top Contributors, Post Tags legend) alongside the board sidebar and the feed. That's the same "independent panels a user might reorder or hide" shape as the other customizable pages. The board sidebar (Market/Industry/Topic categories) and the main feed itself stay OUT of scope — those are navigation and content, not widgets. Only the two right-rail panels are reorderable/hideable.

**Confirm this split before building** — it's a real scoping call, not an obvious default, and it's cheaper to agree now than to build "Customize" onto a feed page and have it feel pointless.

---

## 2. Schema

### New option set: `PageID`
Options: Portfolio, DealAnalyzer, DevStudioWorkspace, Research, MarketIntel — matches the scoped list above exactly, extendable later if the scope changes.

### New data type: `WidgetLayoutItem` (belongs to User)
| Field | Type | Default | Notes |
|---|---|---|---|
| User | User | (link) | |
| Page | PageID | — | |
| WidgetId | text | — | a stable identifier defined at build time, e.g. `portfolio.totalValue`, `dealAnalyzer.incomeWaterfall` — see §3 |
| Order | number | — | position within the page |
| IsVisible | yes/no | yes | hidden widgets stay in the data, just don't render |
| Size | text | — | optional, e.g. "half"/"full" width, only if the layout needs variable widget sizing |

**Only override rows get stored — no row exists until a user actually changes something.** Each page ships with a hardcoded default order/visibility in the front end; `WidgetLayoutItem` rows are read on page load and merged over that default, same "don't store what doesn't need storing" principle as `EnabledLanguages` defaulting without a row for every user. This keeps the common case (nobody's customized anything) free of empty database rows.

---

## 3. The widget-registry principle — this is what makes future multi-monitor cheap

Every customizable card/chart/panel needs a **stable `WidgetId`** and needs to be built as a self-contained unit — its own data binding, not logic hardcoded into a fixed page layout. Concretely: today, "Portfolio's Total Value card" might be built as a chunk of markup wired directly into the Portfolio page. Under this system, it becomes a named, independent component (`portfolio.totalValue`) that the page renders in whatever position `WidgetLayoutItem` says, and that — later, in Route 2 — could just as easily render inside its own popped-out browser window instead of inline on the page. Building it this way now costs a bit more structure upfront; building it as ad-hoc inline markup now and needing "popability" later means rebuilding each widget from scratch. Worth doing right the first time given the multi-monitor roadmap already exists.

---

## 4. Interaction model

1. The existing "Customize" toggle (already on the ribbon) expands its scope — flipping it ON enters layout-edit mode for **whichever customizable page is currently open**, not just Portfolio.
2. In edit mode, each widget shows: an eye icon (toggle visibility) and reorder controls.
3. **On reorder controls — check Bubble's native drag-and-drop support on repeating groups before committing to true drag-and-drop.** If it's reliable, use it — it's the more polished interaction. If it's fiddly or unreliable in practice, fall back to simple "move up / move down" arrow buttons per widget, which is less elegant but much easier to build correctly in a no-code tool and just as functional.
4. A "Save Layout" button appears while in edit mode — writes/updates the `WidgetLayoutItem` rows, then exits edit mode.
5. A "Reset to default" link/button clears any override rows for that page, reverting to the shipped default order.

---

## 5. What's NOT in this doc

True multi-monitor pop-out itself stays deferred per Doc 22 §4 — this doc only makes sure today's work doesn't make that harder later. No pop-out interaction is being built now.

---
*End of Doc 24 · Extends: existing Portfolio "Customize" toggle · Sets up: 22-Responsive-Multi-Monitor-Strategy.md §4 (deferred multi-monitor)*
