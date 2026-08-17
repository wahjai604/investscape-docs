---
title: Deal Analyzer Module UX Audit (planned)
status: Logged, not started — queued as the next large audit pass after Ribbon Module UX Audit's Batch D
created: 2026-08-18
target_file: "C:\\Users\\Eric\\Investscape-Retired-Reconstruction\\investscape-v2-remastered.html"
parent: "[[00 Projects/Investscape Rebuild/Ribbon Module UX Audit (v2-remastered).md|Ribbon Module UX Audit (v2-remastered)]]"
related: "[[00 Projects/Investscape Rebuild/Legacy Mockup Porting Audit (2026-08-18).md|Legacy Mockup Porting Audit (2026-08-18)]] — independently reconfirms finding #2 (no multi-project data model) from a fresh comparison against investscape-analyzer-suite.html, and adds several new findings (missing Analysis Modules toggle system, Deal Grade badge, itemized asset-cost/rent-roll inputs, thinner Offer Comparison)."
---

# Deal Analyzer Module UX Audit — planned

Findings surfaced while testing #23 (Deal Analyzer ⇄ Portfolio ⇄ Development Studio linking) on 2026-08-18. Not fixed yet — logged here for a dedicated audit pass, same treatment as the Ribbon Module UX Audit (research → grounded findings → scoping questions → implement).

## 1. No way to add a fresh Deal Analyzer session to Portfolio as a new holding
**Confirmed:** typing into Deal Analyzer's fields does update `state.analyzer.deal` live in-memory (input/change handlers write directly into it and call `paintAnalyzer()`), so every number you see is real and current — that part works. But `state.analyzer.deal` is **not included in `saveLS()`'s payload at all** (verified — `saveLS()` only persists `community`, `notes`, `preferences`, `kpiPrefs`, `session`, `intelCriteria`, `portfolioSnapshots`, `showNativeCurrency`). A page refresh loses any Analyzer edits entirely, unlike Portfolio changes.

More importantly: the "Add to Portfolio" button built for #23 only appears when `state.analyzer.creatingNewHoldingLabel` is set — i.e. only reachable via the Development Studio → "Convert to rental holding(s)" queue. A user who opens Deal Analyzer directly (via "+New" or just landing on the default seeded deal) and builds out a completely new property has **no button anywhere to add it to Portfolio as an 8th holding.** This is the gap the user flagged directly.

**Scope for the next pass:** extend the same explicit-save linked-session pattern already built for #23 to a third mode — a plain "new, unlinked" Analyzer session should also get an "Add to Portfolio" action, not just DevStudio-originated ones. Needs a decision on whether starting fresh in Analyzer should immediately behave as "pending new holding" mode by default, or require some explicit "I want to add this to my Portfolio" opt-in first (so idle exploration/what-if sessions don't get an unwanted button hanging around).

## 2. "+New" doesn't create anything — everything is one static, singleton screen
**Confirmed:** `state.analyzer.deal` is a single object (one deal at a time), `state.devstudio.inputs` is a single object (one project at a time) — there's no concept of multiple named/saved projects, no per-session title, nothing "+New" actually instantiates. Clicking "+New" just navigates to a screen with whatever's already sitting in that single shared deal/project object; it doesn't create a new, separate, nameable entity.
**Scope:** this is a real data-model question — does Deal Analyzer/DevStudio need to support multiple saved/named scratch deals or projects (a "my deals" list), or is a single in-progress scratch deal the intended model and "+New" just needs to *reset* it (with a confirmation if there are unsaved changes) rather than doing nothing? Needs a product decision before implementation.

## 3. Guided / Professional mode links do nothing
**Confirmed, needs re-verification in a live browser** — flagged by the user as doing nothing when clicked. Not yet traced to specific code in this session; needs investigation into `state.preferences.guidanceMode` and where "Guided"/"Professional" selection is supposed to change behavior (the onboarding intent modal sets `guidanceMode`, but whether anything downstream actually reads and acts on it needs checking).

## 4. No "Research this market in Market Intel" link from Deal Analyzer
**Confirmed:** Development Studio's Overview tab has a real working `ds-to-intel` button (`routeDevStudioToIntel`) that cross-navigates to Market Intel. Deal Analyzer has no equivalent button anywhere, despite being just as relevant a place to want market context on a specific deal's location.
**Scope:** add an equivalent "Research this market in Market Intel" entry point to Deal Analyzer, presumably reusing the same `routeDevStudioToIntel`-style prefill logic (region/city from the deal's address/country) rather than building parallel logic.

## 5. No linking back from Market Intel into Deal Analyzer or Development Studio
**Confirmed by absence** (not yet exhaustively re-verified this session, but consistent with #4's one-directional finding) — Market Intel has no "start analyzing a deal here" or "start a developer proforma here" entry point once a user has found a promising market/city/neighborhood. The only "start a new project" entry point in the whole app is the top-ribbon "+New" intent modal.
**Scope, stated by the user as the guiding principle for this whole audit pass:** navigation between Deal Analyzer / Development Studio / Market Intel should be able to start dynamically from *any* of the three, not just flow one-way from "+New" or from DevStudio→Intel. Needs a real cross-navigation map: from each of the three screens, what are the sensible "jump to X with this context pre-filled" actions, in both directions.

---

## Suggested approach when this pass starts
Same method as the Ribbon Module UX Audit: research the actual current code/data model first (don't assume), present grounded findings with file:line references, ask scoping questions for anything genuinely ambiguous or decision-dependent (data model changes especially — items #1 and #2 both hinge on a real "how many deals/projects can exist at once" product decision), then implement in reviewable batches.
