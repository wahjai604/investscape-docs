# InvestScape — Deferred Items Queue (Doc 19)

**Logged, not designed yet — pick these up after the current QA/testing cycle (Step 3, Doc 17 Prompt 2) is done.**

---

## 1. Workspace checklist: no Add/Delete item UI
**Found while testing the language sweep (Doc 18b, item 3).** The Underwriting Notes checklist currently has no button to add a custom item and no way to delete an item made in error. Right now every item is a default/system-provided one (which is why translating them all was safe with no follow-up needed). When this gets built:
- Needs an "+ Add item" input at the bottom of the checklist, and a delete (trash icon) hover action per row.
- Schema-wise, this likely needs a way to distinguish default/seeded items from user-added ones (an `IsDefault` flag or similar) — worth checking against whatever the current Workspace/checklist schema already has before assuming it needs to be built from scratch.
- Once custom items exist, revisit the translation rule from Doc 18b — default items translate, user-typed custom items should not.

## 2. Rename "Research" → "Market News"
**Rationale (Eric's framing):** the tab isn't only original staff-written research — it's meant to also carry RSS/syndicated feeds from real estate news sources. "Market News" better reflects mixed staff + syndicated content than "Research" does.
**Why deferred, not done now:** this page's translation dictionary was just finished in the last fix pass — better to rename in its own deliberate pass than re-touch freshly-verified translation keys mid-QA-cycle.
**When picked up, also worth deciding:** how syndicated RSS content is sourced/attributed, and whether it goes through the same disclaimer/liability treatment as AI-generated content or needs its own (it's third-party editorial content, a different category from either user data or AI output).

## 3. Rebrand "Market Intel" → "Neighbourhood Details"
**Rationale (Eric's framing):** not just a rename — a genuinely different feature. Users would search/click into a specific neighbourhood (his examples: Point Grey in Vancouver West, Dundarave in West Vancouver, Aldergrove in Langley) and get a summary specific to that neighbourhood, rather than the current page's city/region-level rate data.
**Why deferred:** this is real new scope, not a relabel — needs its own design pass covering:
- A `Neighbourhood` data concept (name, city/region, boundary or centroid, aggregated stats)
- Search/browse UI to find a neighbourhood
- An AI narrative summary per neighbourhood (same interpret-only boundary as everything else — narrative describes pre-computed stats, doesn't invent them)
- **The real open question: where does neighbourhood-level data actually come from?** This is more granular than the city-level rate data currently pulled from FRED/Bank of Canada — likely needs Rentcast (already in your Phase 2 stack) or a municipal open-data source, and that's worth confirming before any UI gets designed around data that may not be available at that resolution.

---
*End of Doc 19 · Pick up after: 17c (chart reactivity check), 17 Prompt 2 (cross-batch conflict check)*
