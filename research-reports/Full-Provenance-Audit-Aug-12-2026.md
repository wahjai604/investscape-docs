---
title: Full Provenance Audit — investscape-v2-remastered.html (Aug 12, 2026)
status: Complete — informs Megaprompts 9-15
created: 2026-08-12
scope: "All modules: Portfolio, Deal Analyzer, Dev Studio, Market Intel, Research, Community, Library, Notes & Checklists"
related: "[[00 Projects/Investscape - Retired/Lost HTML Reconstruction Megaprompt Plan (DRAFT).md|Lost HTML Reconstruction Megaprompt Plan]]"
---

# Full Provenance Audit — investscape-v2-remastered.html

Run at Eric's request, expanding beyond the original Portfolio/Deal Analyzer/Dev Studio scope to every module, after Megaprompts 5-8, the Workspace fold-in, Portfolio attribution/benchmark cards, and the placeholder→chart pass (git commits `b687609` through `dbd71ca`). Same classification discipline as the original July 2026 MVP Readiness C-Level Audit (`Nexus/Conversations/claude/2026/07/2026-07-24 - MVP Readiness C-Level Audit.md`) — reused deliberately, not reinvented, per that prior research.

## Classification key
| Class | Meaning |
|---|---|
| **LIVE** | Real engine call, recomputes on input change |
| **STATIC** | Hardcoded/demo, honestly labeled as such |
| **GATED** | Visibly incomplete, limitation stated on-screen |
| **DERIVED-THIN** | Computed, but from an assumption thinner than the metric implies — the dangerous one, looks live, isn't |

## Table A — Module-by-module classification

| Module | Classification | Evidence |
|---|---|---|
| Portfolio — Overview | LIVE | Real per-property `runDealPipeline()`, real allocation/equity-debt charts |
| Portfolio — Rollup | LIVE | `rollupPortfolio()` pooled-cashflow IRR (genuinely pooled, not an average of IRRs), plus attribution + benchmark-spread cards (Aug 12 addition), both real |
| Portfolio — Notes & Checklists | LIVE (as state) | Real per-property checklists, localStorage-persisted — content itself is starter/demo checklist items, not connected to a real document/task system |
| Deal Analyzer — Summary/Cash Flow/Financing/Returns/Sensitivity/Tax | LIVE | Full hold-period series → IRR/MIRR/equity multiple. Verified upgrade over the old Bubble prototype, where the July audit found E9 (multi-period projection) totally absent |
| Deal Analyzer — Qualification | LIVE | GDS/TDS + gauge chart, real E6/E7/E9 |
| Deal Analyzer — Offer Comparison | LIVE | Runs 3 offers through the same pipeline as Summary |
| Deal Analyzer — Formula Library | STATIC (labeled) | Reference copy, correctly not claiming to be computed |
| Dev Studio — all 10 tabs | LIVE, one GATED exception | E51/E52 refuses to fake US development-charge output (engine returns nulls for US jurisdiction — caught and labeled, not shipped) |
| Market Intel — Explorer | LIVE | E29/E30, frozen snapshot date |
| Market Intel — Neighborhood Deep-Dive | GATED, correctly | On-screen text states mock dataset covers only 3 US neighborhoods |
| Research | Mixed, honestly split | "Today's Numbers" = LIVE (E29/E39); editorial articles = STATIC, labeled "demo copy" |
| Community | LIVE (persistence layer) | Posting/boards genuinely persist via localStorage; board *content* (seeded threads) not visually distinguished from real user posts once mixed |
| Library | LIVE, strongest artifact in the audit | `fnExists()` cross-checks all 53 engine functions against the actually-loaded bundle at render time — structurally cannot claim a dead function is live |

**No DERIVED-THIN findings this pass.** The honesty-labeling discipline followed since Megaprompt 5 (Dev Studio Files tab, E43 CAD-only note, Ontario PTT gap, Neighborhood Intel's 3-city caveat) is what prevents it.

## Table B — Gaps, ranked by severity

**Status note (2026-08-18):** two Low items below are confirmed resolved by the separate, ongoing [[00 Projects/Investscape Rebuild/Ribbon Module UX Audit (v2-remastered).md|Ribbon Module UX Audit]] pass on `investscape-v2-remastered.html` — marked inline rather than removed, to keep this audit's original record intact. The remaining items (asset-type conditioning, tier gating, multi-tranche financing, flip engine, provenance stamping) are Deal Analyzer/Dev Studio structural gaps that the Ribbon audit hasn't touched — those modules have their own audit queued next ([[00 Projects/Investscape Rebuild/Deal Analyzer Module UX Audit (planned).md|Deal Analyzer Module UX Audit (planned)]]), and a full re-pass of this table is planned once that and a matching Dev Studio pass are done, rather than re-grading it piecemeal now.

| Gap | Severity | Why |
|---|---|---|
| **No asset-type conditioning in Deal Analyzer** | High | Frontend UX/UI Master Spec (`80-FRONTEND-UX-UI-ARCHITECTURE-MASTER-SPEC-August-3-2026`) calls asset-aware field/metric gating "the best decision in the product... the specific thing ARGUS gets wrong." Every deal here is underwritten with the same residential-shaped inputs regardless of type. Largest gap between locked spec and built state. **Still open** — unaddressed by the Ribbon Module UX Audit; carries forward to the Deal Analyzer Module UX Audit. |
| **Zero tier gating in Deal Analyzer or Market Intel** | High (revenue-model risk) | Master Spec Section 4 isn't implemented outside Dev Studio (Enterprise-gated) and the 5-property Free cap. Sensitivity and Tax tabs, both specced Pro-locked, are fully open regardless of tier. Nothing to upgrade for currently, beyond more properties and Dev Studio. **Still open.** |
| No multi-tranche financing in Deal Analyzer | Medium | Dev Studio has it (E2 tranche schedule); Deal Analyzer is single-loan only. Master Spec calls multi-tranche a Pro-tier Deal Analyzer differentiator. **Still open.** |
| ~~Portfolio Avg DSCR is an unweighted simple average~~ | Low-medium | ✅ **Resolved** — Portfolio Overview's Avg DSCR now weights by each property's home-currency value (`derived.reduce((s,p)=>s+p.dscr*p.propertyValueInHome,0)/totalValueHome`), fixed as part of the Ribbon audit's Batch B (#6), and now explicitly labeled "weighted average" on-screen with a pointer to Rollup's separate DSCR-floor (weakest holding) figure so the two aren't confused. |
| No dedicated flip engine (E16) | Low | BRRRR/Refinance (E15) resolved and wired in Strategy tab; flip/holding-cost-over-rehab still absent, lower priority now. **Still open.** |
| No app-wide calc-version/provenance stamping | Low | E19 wired in exactly one place (Costs tab), not app-wide. Matters before a real export/report feature ships. **Still open** — and now has a concrete related finding: the Ribbon audit's #22 confirmed Export (PDF/Excel/CSV/branded report) is entirely missing from `investscape-v2-remastered.html`, so provenance stamping and a real export feature are likely worth sequencing together. |
| ~~Community seeded threads vs. real posts not visually distinguished~~ | Low | ✅ **Resolved** — every seeded/demo thread in `state.community.posts` now carries an explicit `seeded:true` flag that `paintBoard()` reads to visually distinguish it from a real user post. (Found already resolved in code during the 2026-08-18 Ribbon audit session — not entirely clear from history whether this shipped as part of the Ribbon audit's earlier batches or predates it; noting it as done either way.) |

## Table C — Executive pushbacks, ranked

1. **Asset-type conditioning is the real headline finding.** Everything built across Megaprompts 5-8 is real and good, but built on top of residential-shaped underwriting throughout. First thing a commercial/development-focused investor hits in Deal Analyzer (as opposed to Dev Studio, which already handles development).
2. **Tier-gating absence means the pricing model has no product enforcement.** Master Spec's $29 Pro / $199 Enterprise tiers were "reasoned, not tested" per the July audit's P6 — now compounded by there being almost nothing in Deal Analyzer to gate someone into paying for.
3. **Everything the July audit flagged as a true MVP blocker (E8 amortization, E9 hold-period projection, E10 exit engine) is resolved.** The load-bearing finding from that audit — "the display layer is ahead of the calculation layer" — no longer holds. Calculation layer has caught up and in places (cross-border tax, real per-property Notes, Portfolio attribution) gone past what was specced.
4. **No external user has touched this build.** Unchanged from the July audit's P2. Everything above, including this audit, is self-assessed.

## Bottom line

Calculation-complete and honesty-disciplined in a way the prior prototype wasn't at the same stage. Two decisions matter most for what comes next: whether Deal Analyzer needs asset-type conditioning before a beta user with a commercial deal shows up, and whether it's time to wire real tier gating so the pricing model has something to enforce. See the corrected-sequence section of [[00 Projects/Investscape - Retired/Lost HTML Reconstruction Megaprompt Plan (DRAFT).md|the main plan doc]] for how these were sequenced into Megaprompts 9+.

**Update 2026-08-18:** Table B's two Low-severity items are now resolved (see inline strikethroughs above), confirmed during the [[00 Projects/Investscape Rebuild/Ribbon Module UX Audit (v2-remastered).md|Ribbon Module UX Audit]]'s Batch D work. This audit's core finding — that asset-type conditioning and tier gating are the two decisions that matter most — is unchanged and still fully open; neither has been touched by any UX audit work done since Aug 12. A full re-pass of Tables A/B/C against the current build is planned once both the Deal Analyzer and Development Studio module audits (queued after the Ribbon audit closes out its own remaining Portfolio-module items) are complete, so this doc gets re-graded once rather than incrementally across three separate passes.
