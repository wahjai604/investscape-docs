---
title: Legacy Mockup Porting Audit (2026-08-18)
status: Batch E shipped (cross-cutting multi-instance foundation + empty-Portfolio state). Remaining ~35 items across Portfolio/Deal Analyzer/Dev Studio/global still untriaged — see "Batch E" section below.
created: 2026-08-18
target_file: "C:\\Users\\Eric\\Investscape-Retired-Reconstruction\\investscape-v2-remastered.html"
source_files: "investscape-v2-shell.html, investscape-v2-unified.html, investscape-v2-unified-addendum.html, investscape-analyzer-suite.html, investscape-devstudio-drilldown.html, investscape-portfolio-drilldown.html, investscape-ecosystem.html, investscape-v3-unified-WORKING.html, InvestScape-logic.js — all in C:\\Users\\Eric\\Investscape-Retired-Reconstruction\\"
parent: "[[00 Projects/Investscape Rebuild/Investscape Rebuild Project Description.md|Investscape Rebuild]]"
related: "[[00 Projects/Investscape Rebuild/Ribbon Module UX Audit (v2-remastered).md|Ribbon Module UX Audit]], [[00 Projects/Investscape Rebuild/Deal Analyzer Module UX Audit (planned).md|Deal Analyzer Module UX Audit (planned)]]"
---

# Legacy Mockup Porting Audit — 2026-08-18

Eric asked, after the Portfolio module's UX audit closed out Batch D: "since you mentioned you didn't look at the original v2 mockups carefully, can you re-examine each one and see if everything was ported over to v2-remastered.html properly?" Six parallel research passes (one per legacy file or small group of related files) each did a grounded, evidence-based feature inventory of an old mockup against the current master file — every finding below cites specific evidence (quoted strings, line context) from the actual files, not assumption. No code was changed as part of this audit — research only.

**Read this doc as a gap inventory, not a to-do list.** This is an old, pre-MVP prototype with a large surface area — many "missing" items below are earlier concept-stage ideas that may or may not still be the right call for a solo-bootstrapped build. Triage/prioritization decisions are Eric's to make, not assumed here.

## How to read severity
- **❌ Missing entirely** — confirmed absent via direct search, not just "different"
- **⚠️ Ported but different/simplified** — exists, but materially thinner or reworked
- **✅ Confirmed ported** — not itemized in depth here; full detail lives in each source agent's raw output if needed

---

## Cross-cutting theme: no multi-project / multi-session data model

The single biggest structural finding, showing up independently across **three separate audits** (Deal Analyzer, Development Studio, and the earlier-logged Deal Analyzer gaps):

- **Development Studio has no "Projects Hub."** The old mockup (`investscape-devstudio-drilldown.html`) modeled a full pipeline: a projects list with thumbnails, a 5-stage pipeline (Concept → Feasibility → Financing → Construction → Sellout), an eye-toggle to hide dead deals, an "Under Consideration" quick-proforma list, and a "Graduate to Portfolio" action. Remastered's Development Studio is **hardcoded to one project** (`DEVSTUDIO_PROJECT_NAME = '796 Main Street'`). None of the hub/pipeline UI exists.
- **Deal Analyzer has no equivalent multi-deal concept either** — already logged in [[00 Projects/Investscape Rebuild/Deal Analyzer Module UX Audit (planned).md|Deal Analyzer Module UX Audit (planned)]] finding #2 ("+New doesn't create anything — everything is one static, singleton screen"). This audit reconfirms it independently from the `analyzer-suite.html` comparison.
- **A genuinely empty Portfolio is unreachable.** `investscape-v2-unified-addendum.html`'s dedicated empty-state screen ("Your portfolio starts here," + Add Your First Property / Try a Sample Deal) was never ported — `screenPortfolio()` has no zero-property branch, and the seed data always ships a fixed 7-property demo portfolio. The `.empty-wrap`/`.ew-icon` CSS classes still exist in the stylesheet but are never referenced by any markup — dead CSS confirming this was dropped, not just deprioritized.

**These three findings are really one finding**, worth deciding as a package: the whole app currently assumes "exactly one of everything" (one deal, one dev project, a portfolio that's never empty). Introducing real multi-instance support (or deciding it's out of scope for this MVP phase) is a data-model decision bigger than any individual UI fix in this doc.

---

## Portfolio module

### Overview / holdings table
- ❌ **Per-property visibility (eye) toggle** — the old shell let a user hide an individual property from views/totals while keeping it in data. Remastered only has a KPI-card hide toggle (from Batch B's #7), not a per-holding one.
- ❌ **Custom category label creation** ("+ New label" on the filter bar) — no equivalent UI found.
- ⚠️ **KPI card customize mode lost drag-to-reorder** — the mockup used real HTML5 drag-and-drop with a lock-layout toggle; remastered uses up/down-arrow buttons instead (shipped in Batch B's #7). Functionally equivalent (cards ARE reorderable), just a different interaction pattern — flagging in case pixel/interaction parity with the original design was expected.
- ❌ **Deal status lifecycle** (Prospect → Under Contract → Owned stepper) and its category picker at the point of adding a holding — replaced by the single-step "+ Add to Portfolio" promote button (#22/#23 work). No visual status tracking exists anywhere in Portfolio.

### Property Detail (drilldown)
Already-confirmed-ported baseline (Purchase Info waterfall, Mortgage card, Break-Even panel, Income/Expense statement) is solid and in most cases upgraded to real engine calls. Gaps:
- ❌ **No per-property Cap Rate / Cash-on-Cash** anywhere on the Property Detail page — only a portfolio-level *blended* cap rate exists (Batch B's #6 card), and Cash-on-Cash exists only inside Offer Comparison, not on a saved holding's own page.
- ❌ **Deal grade badge** (A/B+/B−/C circular badge) — no equivalent element or computed grade anywhere.
- ❌ **"AI Deal Narrative" callout** — a plain-language computed summary of the deal (e.g. "positive cash flow, X months to break-even") — no equivalent.
- ❌ **Occupancy KPI** — zero hits anywhere in the file; dropped entirely, no replacement.
- ⚠️ **Expense line items collapsed** — the mockup itemized Insurance / Property Management / Property Taxes / Repairs & Maintenance / Strata-HOA / Other as six separate rows. Remastered stores and shows a single lump `annualOperatingExpenses` figure — a real loss of visibility into what's driving expenses, not just cosmetic.
- ❌ **Trend sparkline column** on the holdings table — replaced with Category/Country/DSCR columns (arguably more useful, but the visual trend indicator is gone).

### Pricing / tiers (from the addendum)
- ⚠️ **Plan-card feature bullet lists trimmed** across all three tiers — pricing $ amounts match the old mockup exactly, but Free dropped 2 bullets, Pro dropped 2, Enterprise dropped 1. The underlying features (PDF export, full statement PDF, branded report pack) still exist functionally (shipped in #22) — they're just no longer *advertised* on the pricing cards, which under-sells each tier versus the original design intent.
- ⚠️ **Free-tier pill lost its distinct grey styling** — Free now renders with the same gold pill as Pro on the ribbon, no visual tier distinction.

---

## Deal Analyzer module

- ❌ **The entire "Analysis Modules" toggle system** — the old mockup's core Deal Analyzer concept was a `.module-bar` of clickable module chips (Cash-Flow Statement, Income Approach/Cap Rate, Quick Screen, Break-Even, a locked "Long-Term Projection · Pro") that a user could add/remove per deal, plus an AI module-suggestion banner and a "Module Roadmap" status sidebar. **None of this exists.** Remastered replaced it with a fixed, always-present list of 9 sub-tabs. This is a genuinely different information architecture, not a simplified version of the same one — worth a real product decision on whether the modular/toggleable concept should come back, or whether the fixed-tabs approach is the intended final design.
- ❌ **Deal Grade badge** — same missing concept as Property Detail's, confirmed independently here too.
- ❌ **Itemized Improvements Budget** (Paint/Flooring/Appliances/Roof capitalized into asset cost) and **per-unit rent roll** (Unit 1-4 monthly rent summing to a subtotal) — both collapsed into single aggregate fields (`purchasePrice`, `grossAnnualRent`) in the current data model.
- ⚠️ **Offer Comparison is thinner** — old version had 18 rows (itemized income/expenses, OER, LTV, Total Initial Investment, Cash-on-Cash); remastered shows 6 (Purchase Price, Cap Rate, Monthly Cash Flow, DSCR, IRR, Equity Multiple). Also missing "+ Add Offer" and "Export Comparison" actions — the comparison is a fixed 3-hardcoded-demo-offer table.
- ❌ **"Go/No-Go" one-line verdict callout** (from the v3/logic.js line) — a single glanceable traffic-light sentence ("Green light: strong metrics" / "Yellow: review assumptions" / "Red flag: DSCR below 1.0"). Replaced by itemized pass/fail rows + the AI chat assistant — not necessarily worse, but if a single at-a-glance verdict sentence was the intended UX, it's gone.

---

## Development Studio module

Beyond the missing Projects Hub (see cross-cutting theme above), within the single-project workspace:

- ❌ **Budget vs. Actuals tracking** — no Actual/Committed/To-complete/Δ columns, no "contingency drawn %" badge, no detailed line-item budget table (no itemized rows like "General requirements," "DCLs," "Warranty + HPO"). Current Budget tab is 4 aggregate buckets via one donut chart only.
- ❌ **Multi-facility financing table + presale deposit financing** — old mockup modeled 1st mortgage / 2nd mortgage / DPI facility (rate/term/LTC/LTV/interest reserve/commit fee) plus a separate presale-deposit-financing card. Remastered models a single generic senior loan only.
- ❌ **Sources ≡ Uses statement** — appeared on two screens in the old mockup (Overview and Returns), zero matches anywhere in remastered.
- ❌ **KPI normalization toggle** ($ / per unit / per sellable SF / per buildable SF) — absent.
- ❌ **Milestone rail + milestone register table** — a visual timeline with done/now states and a "drives" column tying milestones to cost/fee triggers. Only the ApexGantt construction-sub-phase chart survives; the higher-level Approvals/Presales/Construction/Sellout phase view is gone.
- ⚠️ **Waterfall variant toggle lost** — old mockup let a user switch between "IRR tranches" and "ROE hurdles" waterfall models; remastered has one model only (arguably more sophisticated math, but no variant choice).
- ⚠️ **Land & Site tab thinned significantly** — multi-parcel assembly table, Asset-purchase vs. Bare-trust acquisition toggle, bracket-by-bracket PTT breakdown, and a full massing/tenure/hard-cost-buildup card are all gone; only basic site/FAR/efficiency inputs and one collapsed PTT total remain.
- ⚠️ **Breakeven metric is mismatched** — the old Risk tab modeled a units-sold breakeven ladder (residual LTV per sales-threshold) appropriate for a for-sale development. Remastered's Breakeven card reuses the *rental-deal* cash-flow break-even formula instead — the wrong metric shape for a build-to-sell project, not just a simplification.
- ⚠️ **Scenario comparison thinner** — old version had a full 10-row per-line-item variance table; remastered shows per-scenario cards with margin/profit and one "vs. current profit" delta only.

Confirmed genuinely well-ported/upgraded: ApexGantt and ApexTree are both real (not just referenced), the LP/GP waterfall math (E71/E72) is real and arguably more rigorous than the mockup, BC PTT bracket logic is real, and the Files tab is honestly labeled as a UI concept with no backend — consistent with this build's stated honesty discipline.

---

## Ribbon shell / global features

- ❌ **Deal Files / AI-readable file room** — the old shell's per-deal document repository (upload dropzone, "✓ read by AI — 2 units below market" annotations, download-all) is entirely absent as a *working* feature. Note: this session's #19 work (Notes & Checklist custom items) added a *metadata-only* per-property file list as a smaller, honestly-scoped step in this direction — not the full AI-read concept, but a real partial start worth knowing about when this gets prioritized.
- ❌ **AI Morning Brief** callout on Market Intel (rate/rent movement summary) — zero matches.
- ✅ Confirmed genuinely solid/upgraded: ribbon/nav structure, i18n system (far exceeds the old shallow nav-only dictionary), Community (real persisted posts vs. static mockup), Library (60+ real engine entries vs. 6 static cards), user profile menu, tier gating, disclaimer system, AI bubble panel structure.
- ⚠️ **AI bubble mic/voice input is a confirmed disabled stub** — the old mockups show it as a live toggle; remastered explicitly disables it with a "not wired in this build" tooltip. Honest, but worth knowing it was never real, not a regression.

---

## Secondary/superseded files — confirmed clean, no action needed
`investscape-ecosystem.html`, `investscape-v3-unified-WORKING.html`, and `InvestScape-logic.js` were all audited and found **fully superseded** — every feature/formula in them maps to an equal-or-better equivalent already in remastered. No gaps found in this group beyond the "Go/No-Go" verdict line already listed under Deal Analyzer above.

---

## Batch E — shipped 2026-08-18 (the cross-cutting foundation)

Eric asked to integrate everything found in this audit. Given the size (~40 items, several genuinely large builds, some possibly-abandoned old designs rather than bugs), scoped it the same way the rest of this session has worked: two real decisions confirmed first (build real multi-instance support now; keep the fixed Deal Analyzer tabs rather than reviving the old Analysis Modules toggle system), then shipped the one foundational piece that several other findings were downstream of, rather than attempting all ~40 items in one uncontrolled pass.

**Real multi-deal support (Deal Analyzer):**
- New `state.analyzer.deals[]` — a real saved-deal list, each entry `{id, name, deal, extra, createdAt, updatedAt}`. `state.analyzer.deal`/`extra` remain the single always-live "active" scratch object every existing input handler/calc call already reads (no 100+-reference refactor) — `activeDealId` points at which saved entry (if any) that scratch object currently represents.
- New **"My Deals"** sub-tab (front of Deal Analyzer's tab list) — lists every saved deal with a real computed IRR/DSCR per row (`runDealPipeline()`, not cached), `+ New Deal`, click-to-open, delete.
- Editing auto-syncs back into the matching saved-deal entry on every recompute (`syncActiveDealToList()`, called from `paintAnalyzer()`) — no separate save button, since this is in-screen editing of your own saved deal, not a cross-module write like #22/#23's linked sessions.
- **This also finally fixes the persistence gap the #23 audit flagged** — `state.analyzer.deal` was never in `saveLS()`'s payload before; a refresh silently lost it. Now genuinely persisted via whichever saved deal is active.
- The three existing linked-session modes (#22/#23: editing an existing Portfolio property, a DevStudio conversion queue, a plain add-property flow) all now explicitly clear `activeDealId` at their entry points, so none of them accidentally overwrite an unrelated saved deal.

**Real multi-project support (Development Studio), same pattern:**
- New `state.devstudio.projects[]`, `activeProjectId`, `currentProjectName`/`currentProjectSubtitle` (replacing the old hardcoded `DEVSTUDIO_PROJECT_NAME` constant, now a live-reading function). New **"My Projects"** sub-tab, same list/create/open/delete/auto-sync/persist pattern, using `devstudioCompute(overrideInputs)` (already parametrized) to show real TDC/margin per project without needing to swap global state to preview a row.
- Seeded with the pre-existing single demo deal/project as each list's first entry, so neither list is empty on first load and the prior single-instance demo experience is preserved exactly.

**"+New" is now real:** `chooseIntent()`'s "Analyze a Deal" and "Plan a Development" cards now call `createNewDeal()`/`createNewProject()` before navigating — genuinely creates a new, separate, named, saved instance instead of just navigating to whatever was already sitting in the shared scratch object. Directly resolves [[00 Projects/Investscape Rebuild/Deal Analyzer Module UX Audit (planned).md|Deal Analyzer Module UX Audit (planned)]]'s finding #2 and half of finding #1.

**Real empty-Portfolio state:** ported `investscape-v2-unified-addendum.html`'s "Your portfolio starts here" screen (previously dead CSS, never wired to any real zero-property branch — seed data always shipped 7 demo properties, so this literally couldn't render). Added a genuine **"Remove from Portfolio"** action on Property Detail (`removePropertyFromPortfolio()`, native `confirm()` gate, no undo mechanism exists in this build so this is honest about being permanent) — this is also what makes the empty state reachable at all now, not dead code again. Empty state applies uniformly across all three Portfolio sub-tabs (Overview/Analytics/Notes all mean nothing at zero holdings), with "+ Add Your First Property" (reuses #22's flow) and "Try a Sample Deal →" (jumps to Deal Analyzer) actions.

Syntax-checked clean (`node --check`), CSS brace-balanced (321/321). Not yet click-tested live — this is the most structurally involved change of the whole session (new list sub-tabs, a new persistence shape, a genuinely destructive delete action); recommend testing the full loop (create a deal → save → refresh → confirm it's still there → delete a property → confirm empty state renders → add one back) before trusting it fully.

**Deliberately not attempted in this pass** — the remaining ~35 items below (deal grade badges, AI narrative, itemized budgets, Budget-vs-Actuals, Sources≡Uses, milestone rails, etc.) are each their own real scope decision or feature build, not something to guess through in bulk. Suggested next step below still applies to those.

## Suggested next step
This doc is long on purpose — it's meant to be a complete inventory, not a pre-filtered list. Recommend the same triage approach used for the rest of this audit series: go through it together, mark each item Won't Do / Someday / Now, and only the "Now" items get scoped into real mini-specs.
