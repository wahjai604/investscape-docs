# InvestScape — Nav Restructure + Full-Page Language Sweep (Doc 18)

**Run these two, in this order, before Step 3 and Doc 17 Prompt 2.**

---

## Fix Prompt C — Consolidate nav utility items + add scroll affordance

```
The top ribbon nav is overflowing — it currently holds 11 items (Portfolio,
Deal Analyzer, Development Studio, Research, Market Intel, Community,
Library, Workspace, Alerts, Reports, Project Settings), and there's no
visible way to scroll it (no arrows, no gradient fade, no visible
scrollbar) — a user would only discover it scrolls by accident.

Please:

1. Move "Alerts", "Reports", and "Project Settings" out of the top ribbon
   entirely. Instead, clicking the avatar (top-right, "Eric L.") opens a
   dropdown with: Profile, Global Settings, Log out. Clicking "Global
   Settings" opens a settings page with a left-side section list
   containing: Notifications, Alerts, Reports, Project Settings, Language
   & Region, Connected Accounts. Each section shows its existing content
   in the main panel when selected — this is a reorganization of where
   these three already-built sections live, not a request to redesign
   their content.

2. After removing those three from the ribbon, check whether the
   remaining 8 primary tabs (Portfolio, Deal Analyzer, Development Studio,
   Research, Market Intel, Community, Library, Workspace) still overflow
   the ribbon at a typical desktop width (~1440–1920px). If they do, or
   at any narrower width, add a visible scroll affordance: either small
   left/right chevron arrows at each edge of the nav that appear when
   there's more content to scroll to, or a subtle gradient fade at the
   edge indicating more items exist. Either should work with mouse click,
   trackpad/mouse scroll, and touch swipe — not just keyboard arrows.

3. Confirm the avatar dropdown's existing language switcher (globe icon)
   still works exactly as before — this fix only reorganizes Alerts/
   Reports/Project Settings, it shouldn't change how language switching
   works.
```

---

## Fix Prompt D — Full-page language translation sweep

*Batch 5's original fix apparently only translated the page that was visible at the time (Portfolio) rather than every page in the app. This prompt explicitly lists every page so nothing gets missed again.*

```
The language switcher currently only translates the top nav and the
Portfolio page's content — every other page still shows full English
content even when French or another language is selected. Fix this by
translating the page-level content (not just nav/chrome, which already
works) on EVERY one of these pages, matching the same rule as before:
translate interface chrome and labels, never user-entered data, never
imported file names.

Go through each page below specifically and confirm its content
translates, not just its nav tab label:

1. DEAL ANALYZER (deal detail view): "Overview/Deal Files/Notes" tabs,
   "Deal Status" stepper labels (Prospect/Under Contract/Owned), "Mark as
   Owned" button and its explanation text, category pills (Multi-Family/
   Residential/etc.), "Income waterfall — annual" chart title, "Deal
   snapshot" panel and its row labels (Cap rate, DSCR at quote, Leverage
   state, Modules active), "AI takeaway" label (the AI-generated text
   itself is a separate mechanism — see note below).

2. DEVELOPMENT STUDIO HUB: project card labels (ROC, PROFIT, TOTAL COST,
   LOTS, UNITS), status text ("Full model", "Quick proforma", "Complete",
   "Actuals reconciled", "Budget drawn X%"), "Open workspace" links,
   "+ New Project" button, "Under consideration — quick proformas being
   weighed" section header, project type pills (Mixed-Use, Multi-Family,
   Subdivision, Spec-Infill).

3. RESEARCH: "Today's Numbers" panel and its row labels, "Top
   Contributors" panel, "Trending Tags" panel, article card metadata
   ("min read", comment/rating counts), category pills (AI Analysis, Rate
   Forecast, Risk Watch).

4. MARKET INTEL: "AI Morning Brief" label, city/market card labels (Median
   price, Median rent, Est. market cap), "Watchlist Movers" panel, "Data
   Sources" panel and source names' surrounding labels, timeframe toggles
   (1Y/3Y/etc.).

5. COMMUNITY: "Market Boards" / "Topic Boards" section headers, board
   names stay as-is (proper nouns), member counts' surrounding text, post
   type tags (BULL/BEAR/Q), "Verified Pro" badge, "Deal attached" tag,
   the discussion input placeholder text, "Post" button.

6. LIBRARY: filter pills (All, Cost of Capital, Time Value of Money, Cash
   Flow Model, Performance, Leverage), formula card tags (Core engine,
   All tiers, Commercial, AI narrative, Loan Sizing card) — the formula
   notation itself (e.g. "R = I ÷ V") stays universal and untranslated,
   only the surrounding explanation text and tags translate.

7. WORKSPACE: "My Notes" panel, the rollup summary text, checklist item
   labels, "AI Insight:" label, chart timeframe toggles (1M/1Y/5Y), legend
   labels (Est. Rent Trend, Market Median).

IMPORTANT — do not translate the AI-generated narrative text itself (e.g.
the "AI takeaway" or "AI Insight" paragraph content) using the same static
translation mechanism as the UI labels above. That's a separate, existing
concern (the AI narrative needs a language parameter passed to the
generation itself, not a translation of its English output) — just make
sure the LABEL ("AI takeaway", "AI Insight:") translates even though the
paragraph content next to it may still need separate handling.

After fixing, switch to French and take one screenshot of each of the
seven pages above so I can confirm every one actually translated, not just
report that it's done.
```

---

## Recommended order from here

1. Fix Prompt C (nav restructure)
2. Fix Prompt D (full-page language sweep)
3. Step 3 — chart reactivity standalone check (Doc 17c)
4. Doc 17 Prompt 2 — cross-batch conflict check

Running Prompt 2 before D would have just re-confirmed the same known gap in more detail without new information — better to fix the actual scope problem first, then let Prompt 2 test real cross-batch interactions on a version of the app where translation is actually complete.

---
*End of Doc 18 · Precedes: 17c-Chart-Reactivity-Standalone-Check.md, 17-Post-Batch-QA-Verification.md (Prompt 2)*
