# InvestScape — Project Snapshot (2026-07-16)

Everything in `/html-mockups` and `/project-docs` as of this date, in one download.

## html-mockups/ (6 files)

| File | What it is |
|---|---|
| `investscape-ecosystem.html` | Login screen (canonical source), Portfolio, Research, Workspace concepts |
| `investscape-v2-shell.html` | Earlier pass — Categories/customization, Deal file room, Formula Library, Bullboards |
| `investscape-v2-unified.html` | **Master shell** — all 8 rooms (Portfolio, Deal Analyzer, Dev Studio, Research, Market Intel, Community, Library, Workspace) under one nav |
| `investscape-portfolio-drilldown.html` | Portfolio → Deal Statement click-through — the one file with a real 2-screen flow |
| `investscape-devstudio-drilldown-1.html` | Full Development Studio detail — Quick Proforma, 10-tab cockpit, budget, waterfall, Gantt |
| `investscape-v2-unified-addendum.html` | **Newest** — Sign Up, Choose Plan, empty Portfolio (Free tier), the Enterprise upgrade wall, downgrade/read-only state, disclaimer component |

**For Claude Design:** upload `investscape-v2-unified.html`, `investscape-v2-unified-addendum.html`, `investscape-portfolio-drilldown.html`, `investscape-devstudio-drilldown-1.html`, and `investscape-ecosystem.html`. Skip `investscape-v2-shell.html` — its Community and Library screens were superseded by the unified shell, and uploading both risks Claude Design absorbing two competing versions of the same screen.

## project-docs/ (25 files)

The full canonical set as it stands today — Docs 01 through 16, plus addenda:

| Doc | What it is |
|---|---|
| 01 | Formula Engine Specification |
| 01 Addendum A | FCAC validation of the CA semi-annual compounding formula (confirmed exact match) |
| 02 | Bubble Database Schema |
| 02 Addendum A | Development Studio schema (DevProject, Parcel, BudgetLine, LoanFacility, WaterfallSpec, etc.) |
| 02 Addendum B | PortfolioSnapshot (per-Property, unblocks the equity-growth chart) |
| 03 | Bubble Build Checklist |
| 03 Addendum A | TaxBracketTable / PTT engine — step-by-step build |
| 03 Addendum B | ApexCharts wiring — all 8 approved chart/KPI pairings |
| 04 | Style Guide (deep navy background confirmed) |
| 05 | Claude API Prompt Template |
| 06 | Commercial Formula Library |
| 06 Addendum A | Development/construction formulas — validated exactly against 796 Main St. and Gilley |
| 07 | Development Proforma Field Map |
| 08 | Pricing and Packaging |
| 09 | UX Stress-Test Audit |
| 09 Addendum | Chart-to-data reactivity requirement + Claude Design prompt |
| 10 | Import/Export/Storage Architecture |
| 11 | Notification System Design (archive-default, confirmed hard-delete) |
| 12 | Pre-Port Advisory Review — QA/COO/CTO pass, prioritized punch list |
| 13 | Internationalization/Language System |
| 14 | Claude API Extraction Prompt Template |
| 15 | Currency & Multi-Jurisdiction Schema |
| 16 | **Master Claude Design Prompt Pack** — every queued front-end fix, sequenced into 7 batches |

**Before porting to Figma:** work through Doc 16 first, one batch at a time (it explicitly recommends against pasting all batches into Claude Design at once — see its sequencing note). Doc 12 is the fuller QA/COO/CTO reasoning behind most of Doc 16's batches, if you want the "why" behind any fix.

## Note

This is a point-in-time snapshot. If you keep working in this project afterward, re-download for a current copy rather than assuming this one stays in sync.
