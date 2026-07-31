# InvestScape — Responsive & Multi-Monitor Strategy (Doc 22)

**Grounded in competitor research:** ARGUS Enterprise (desktop-only, no mobile, no Safari support, accepted steep learning curve for professional depth) vs. Bloomberg Terminal (Launchpad — detachable panels across 2–6 physical monitors, standard on trading desks) vs. DealCheck/Stessa (real mobile apps, built for the on-the-go individual landlord). InvestScape spans both personas across its own tiers, so the strategy splits by module rather than applying one rule app-wide.

---

## 1. Module tiering — confirmed policy

| Module | Phone (< 640px) | Tablet/Desktop |
|---|---|---|
| Portfolio | Full support | Full support |
| Deal Analyzer | Full support | Full support |
| Community | Full support | Full support |
| Research (Market News) | Full support | Full support |
| Market Intel | Full support | Full support |
| Notifications | Full support (currently hidden — being fixed) | Full support |
| Library | Full support | Full support |
| Workspace (checklists) | Full support | Full support |
| **Development Studio — Quick Proforma** | Full support | Full support |
| **Development Studio — Full Proforma** | **Not supported — redirect message** | Full support, with wide-monitor optimization (§3) |

**Rationale:** everything in the top group matches the DealCheck/Stessa persona — an individual investor checking numbers on the go is a normal, expected use case, and most of this was already built and tested at 390px in earlier QA rounds. Full Proforma matches the ARGUS persona — a developer doing deep work with a construction budget table, sensitivity heatmap, and draw schedule simultaneously. Cramming that into a phone screen produces a worse experience than being honest that it needs a bigger screen, the same trade-off ARGUS's own market has accepted for decades.

---

## 2. Phone header fix (unchanged from earlier discussion — still needed)

This module split doesn't remove the need for the mobile-header redesign already agreed on: nav collapses to a hamburger/drawer below 640px, bell and avatar stay visible in the header, notifications get un-hidden on mobile. That fix covers the entire "full support" module list above — it was never really about Dev Studio.

---

## 3. Wide-monitor layout (cheap, do now)

At resolutions above ~1920px, constrain Dev Studio's Full Proforma to a sensible max-width rather than letting content stretch edge-to-edge on a 2560 or 3440px ultrawide monitor. Use the reclaimed space for side-by-side panels — e.g. the budget line-item table next to its cost donut, rather than stacked — matching how Bloomberg Launchpad users tile panels rather than leaving empty margin. This is a standard responsive technique, no new architecture needed.

---

## 4. True multi-monitor pop-out — real feature, deferred

Detaching a panel into its own browser window (e.g. Deal charts on a second physical monitor, synced live with the main window) is the direct Bloomberg Launchpad pattern, and it's technically achievable on the web: `window.open()` for the second window, state synced via the BroadcastChannel API or polling the backend. But it's custom JS beyond what native Bubble offers — comparable in kind to the PTT bracket calculation and the ApexCharts wiring, both of which needed the same HTML-element-plus-JS escape hatch.

**Recommendation: defer this past the current Figma/Bubble port.** It's a genuine Enterprise-tier differentiator worth building deliberately — likely a Route 2 (custom stack) feature given the complexity of keeping two browser windows in sync reliably — not something to bolt onto the MVP build. Logged here so it isn't lost, not scoped further right now.

---

## 5. What's actually ready to prompt now

Sections 2 and 3 are concrete and buildable today. Section 4 is intentionally not turned into a prompt yet — it needs its own design pass once you're further along, not a quick Claude Design iteration. The two prompts below cover everything that's actually ready.

---
*End of Doc 22 · Precedes: two Claude Design prompts below · Related: 12-Pre-Port-Advisory-Review.md §1.5 (mobile breakpoints), 21-Cross-Batch-Fix-Round.md (mobile header discussion)*
