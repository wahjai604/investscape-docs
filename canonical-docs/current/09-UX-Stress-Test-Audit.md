# InvestScape — Pre-Launch UX Stress-Test & Usability Audit (Doc 09)

**Companion to Doc 03, Stage 10.** This document is a heuristic review of the five HTML mockups as they exist today, not a substitute for watching real users. Use the test script in Section 5 to get the second, more important kind of evidence.

**Files reviewed:** `investscape-v2-unified.html`, `investscape-v2-shell.html`, `investscape-ecosystem.html`, `investscape-portfolio-drilldown.html`, `investscape-devstudio-drilldown-1.html`

**What these files actually are:** four of the five are static concept galleries — scrollable pages of labeled, annotated frames, closer to a design portfolio than a working app. `investscape-portfolio-drilldown.html` is the exception: it has a real two-screen flow (holdings table → click a row → Deal Statement → back button). That file is your best candidate for any click-through test this week; the others show *what things look like*, not *what it's like to use them in sequence*.

---

## 1. Structural gaps (affect every tier, every module)

| Gap | Evidence | Why it matters |
|---|---|---|
| No empty / zero-state screens | Zero matches across all five files for empty-state, "no properties," "get started," "add your first," "welcome" | Every screen is pre-populated with sample data. A real Day-1 free user with zero properties has never been designed for — you don't know what they'll see. |
| No signup / plan-selection screen | Zero matches for signup, plan-picker, "start free," "choose plan" across all files | The single most important conversion moment in your funnel has no mockup. Login exists (clean, simple — good); the step before it and the step where someone picks Free/Pro/Enterprise doesn't. |
| Free tier never visually rendered | `ribbonHTML(active, tier)` is only ever invoked with `data-tier="Pro"` (7 frames) or `"Enterprise"` (1 frame, Dev Studio) | You can't fully answer "does this make sense for a free user" yet — that view hasn't been drawn. |
| Liability disclaimer absent from visuals | Zero matches for "informational purposes," "not financial," "not investment advice" across all files, including inside the `narrative()` function that generates AI copy | Doc 03 Stage 7 and Doc 05 both require this on every metrics surface. The AI-generated *text* is well-hedged; the *screen footer* that's supposed to carry the fixed disclaimer just isn't there yet. Cheap fix, real liability gap until it's added. |

---

## 2. Module-by-module read

### Research / Market Intel / Community — your assessment holds, with one caveat
Familiar patterns (article feed, ticker strip, forum boards) that most users, including non-experts, have muscle memory for. Caveat: raw terms like **DSCR, Case-Shiller, Teranet HPI, cap-rate compression** appear in headlines and ticker labels with no support. Easy interaction, not-fully-easy comprehension — the UI pattern is intuitive, the content still assumes some fluency.

### Deal Analyzer — the best-scaffolded of the three "hard" modules
The Deal Statement screen mirrors a spreadsheet (+ / − / = operators, Monthly/Annual columns) that your target user likely already trusts. KPI cards carry a plain-language formula under the number (e.g., "NOI ÷ Purchase Price," "Year-1, pre-tax"). Gap: no benchmark context — a first-timer sees "Cap Rate 4.5%" with the formula but no sense of whether that's good, average, or bad in their market.

### Portfolio — fine when populated, undesigned when empty
The holdings table itself (categories, visibility toggles, even-split rule) is well thought through. It has simply never been tested or drawn with zero rows, which is exactly the state every free user starts in.

### Development Studio — correctly gated, internally dense
The Enterprise lock on the nav tab is real and architecturally sound (parameterized, not hardcoded — good engineering instinct even in a mockup). Inside, the Quick Proforma's 16 inputs are mostly plain-English, but **FAR, $/BSF, "withdrawal factor,"** and the auto-populated **DCC** / **HPO** fee chips carry zero inline explanation. Fine if every Enterprise buyer is an experienced developer (matches your own founder-market fit); riskier for someone doing their first 2-lot subdivision — one of your own three archetypes. The Quick → Full Model expansion ("nothing re-entered") is a genuinely strong pattern worth keeping exactly as designed.

### Library — has the fix for #4, underused
A **Glossary** link exists, but only inside the Library tab's own sub-nav (`investscape-v2-shell.html`, in the Formula Library section). It isn't surfaced as contextual help (hover tooltip, inline "?") on the screens where the jargon actually appears — Deal Analyzer results, Dev Studio inputs. You already have the content asset (the 20-term glossary in Doc 06); it just isn't wired to the places that need it.

---

## 3. Mobile — flagged separately since you work mobile-first

- Viewport meta tags: present in all five files. Good baseline.
- Breakpoints: exist in all five files, but only collapse multi-column grids at ~860–960px (tablet width), not phone width (~375–428px).
- `.holdings-table` (Portfolio — your highest-traffic screen) has **no** horizontal-scroll wrapper. `.ticker-strip` (Market Intel) in the *same file* does (`overflow-x:auto`). Same build, inconsistent treatment, and it's the denser of the two tables that's missing it.
- Recommendation: when you hit Stage 10's "test on mobile width" checkbox, don't rely on Bubble's responsive preview pane alone — check Portfolio's holdings table and Dev Studio's Quick Proforma on an actual ~375px phone screen. Those are your two densest data surfaces and the two most likely to break first.

---

## 4. Nav scope — a silent change worth making conscious

Doc 03 Stage 4's original shell: **6 items**, 2 deliberately disabled (Markets, Research) — "shows the roadmap to beta users, good retention psychology." Current unified shell: **8 fully-live top-level destinations** (Portfolio, Deal Analyzer, Development Studio, Research, Market Intel, Community, Library, Workspace), all equal weight from frame one.

Not necessarily wrong — a Bloomberg-Terminal positioning can wear complexity as a feature for Pro/Enterprise users. But it's a real reversal of an earlier, deliberate progressive-disclosure decision, and it happened without being called out as a decision. Worth a conscious yes/no: does a brand-new free user see all 8 rooms immediately, or do some stay dimmed/teased until they've completed a first action (matching the retention logic you already wrote once)?

---

## 5. A usability test you can run this week — before touching Bubble

This is the test that actually answers your question. Heuristic review (Sections 1–4) catches structural gaps; only this catches comprehension and hesitation. Recruit 5–8 people: 2–3 total beginners to real estate investing, 2–3 landlords/investors with some experience, 1–2 developers if you can get them. Screen-share, don't guide, watch where they pause.

**Persona A — First-time free user** (use `investscape-portfolio-drilldown.html`, the one file with a real flow)
- Task: "You just signed up. Find out if the property at [address] is a good deal."
- Watch for: do they know where to click first; do they understand Cap Rate / Cash-on-Cash without prompting; do they notice (or need) the AI narrative.

**Persona B — Pro-tier active investor**
- Task: "You want to compare offering $550K vs $530K on the same property. Show me how you'd do that."
- Watch for: whether the Deal/scenario concept is discoverable without you explaining it first.

**Persona C — Enterprise developer**
- Task: "You're evaluating a 4-lot assembly for a rezoning play. Get to a return-on-cost number."
- Watch for: whether Quick Proforma's jargon (FAR, withdrawal factor) causes a stall even for someone with real development background, or only for adjacent-but-less-experienced users.

Score each task simply: completed unaided / completed with a hint / gave up. That's your real answer to "is this intuitive."

---

## 6. Extending Doc 03 Stage 10 for usability, not just technical hardening

Your existing Stage 10 checklist (privacy-rule test, password-gated beta, ToS/Privacy Policy, formula re-verification, mobile-width test, custom domain) is the right technical/legal gate. Add:

- [ ] Run Section 5's 3-persona test on the live private beta (not just the HTML), 5–8 real invitees
- [ ] Turn on Hotjar (already in your Phase 2 stack — worth pulling forward for the beta window specifically) to catch rage-clicks and dead-end scrolling you won't see on a call
- [ ] Confirm the disclaimer footer renders on every metrics surface (Deal, Portfolio, Dev Studio) — not just that the AI copy is hedged
- [ ] Confirm a zero-property account renders *something intentional*, not a blank/broken-looking dashboard
- [ ] Confirm the Free-tier view of Dev Studio's nav lock actually does something when clicked (upgrade prompt vs. dead link)

---

## 7. Priority punch list

**Fix before Bubble build starts** (cheap now, expensive to retrofit across dozens of Bubble pages later):
1. Design the empty/zero state for Portfolio and Dashboard
2. Design the signup → plan-selection screen
3. Add the disclaimer footer to the design system itself (one component, reused everywhere)
4. Decide, on purpose, whether nav stays at 8 live items or reverts to progressive disclosure

**Fix during Bubble build** (fine to resolve as you go):
5. Wire Glossary terms as inline tooltips on Deal Analyzer and Dev Studio Quick Proforma
6. Extend the holdings-table's mobile treatment to match the ticker-strip's overflow handling

**Resolve from real beta feedback, not guesswork:**
7. Whether Quick Proforma needs more scaffolding for less-experienced Enterprise users, or whether your actual buyers are experienced enough that it's a non-issue
