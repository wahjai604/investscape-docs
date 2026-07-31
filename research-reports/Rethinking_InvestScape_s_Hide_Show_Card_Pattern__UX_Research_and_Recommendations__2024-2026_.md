# Rethinking InvestScape's Hide/Show Card Pattern: UX Research & Recommendations (2024–2026)

## TL;DR
- **Replace the single text-swapping header button ("Show hidden (N)" / "Hide hidden") with a persistent, count-bearing filter control** — the strongest current-practice pattern is a segmented control or filter chip such as **All · Visible · Hidden (3)**, which always shows how many items are hidden and never forces the user to infer state from a label that changes meaning.
- **Keep the per-card eye icon, but make it a state-swapping icon pair (eye ↔ eye-with-slash) in a single neutral color — not a red icon.** This is the dominant convention across Figma, Material, and Ant Design; red should be reserved for destructive/error meaning, and NN/g warns that relying on color alone to signal state is a documented failure mode.
- **Decide whether you mean "hide" (a temporary per-user view filter) or "archive" (a lifecycle state).** Your greyed-out-in-place treatment is a "hide/filter" pattern; competitors overwhelmingly implement this as a view filter with a count, and reserve "archive" for removing items to a separate destination.

## Key Findings

### 1. The header toggle wording is a recognized anti-pattern
Your current control collapses two different pieces of information — *the current state* and *what will happen next* — into one label that changes meaning. NN/g's canonical analysis of this exact problem (the "Mute button," Raluca Budiu, October 18, 2020) concludes that "On–off controls that switch between two different system states need to clearly communicate to users both the current state and the state the system will move to, should the user press that control." A single label like "Hide hidden" fails on both counts: it neither clearly states the current state nor unambiguously states the next action, and it attaches the count inconsistently (the "(N)" appears in one state but not the other).

### 2. A persistent segmented control / filter chip with a count is the recommended replacement
Material Design 3 endorses segmented buttons for exactly this job — its guidance says segmented buttons "help people select options, switch views, or sort elements" — and recommends them for "simple choices between two to five items (for more items or complex choices, use chips)." Filter chips are the recommended alternative and explicitly support a count in the label; Material 3 states filter chips "can be a good alternative to segmented buttons or checkboxes when viewing a list or search results." Baymard's e-commerce research finds that showing result counts and a persistent "applied filters" overview speeds task completion and orients users, yet "28% of sites across our UX benchmarks don't display an overview at all." A persistent "All / Visible / Hidden (3)" control satisfies all of these principles at once: it always shows the count, always shows current state (the selected segment), and states the available action (the unselected segment).

### 3. The eye / eye-slash icon pair is the dominant per-item convention
Figma's documented behavior is the reference implementation: clicking the visibility icon closes the eye — per Figma Learn, "The eye will close and the layer will be hidden in the canvas. It will also appear as inactive (greyed out) in the Layers panel." Ant Design ships a matched `eye` / `eye-invisible` pair; Material and virtually every icon set ship `eye` / `eye-off` (eye-slash). The consistent rule across design systems is that the icon reflects/toggles state while remaining a single neutral color. NN/g's state-switch research explicitly warns against using color (especially red) as the sole state signal.

### 4. "Hide" vs "Archive" are different mental models
Across tools, "archive" means *move the item out to a separate place* (Trello's archive, accessible from a board menu; Linear/GitLab archived filters; Airtable/Notion archive views built on a checkbox + filtered view). "Hide" means *temporarily remove from the current view*, usually via a filter. Your pattern — item stays in place, greyed out, labeled "Hidden," toggle to reveal — is a hide/filter pattern, not an archive pattern. Naming and iconography should match that.

## Details

### The microcopy problem, precisely
NN/g (Budiu, "State-Switch Controls") identifies two bits of information a state control must convey: (1) the current state, and (2) what pressing it will do. Her safest recommendation is **two UI elements** — a state indicator plus a switch-state action — or a combined control (like Zoom's mic button) where an icon shows state and a label shows the action. "Hide hidden" violates this: it is a verb-object where the object ("hidden") is also the current state, so the label reads as nearly tautological, and the count is inconsistently attached.

NN/g's "Toggle-Switch Guidelines" reinforce that toggle labels "should describe what the control will do when the switch is on; they should not be neutral or ambiguous," and advise keeping labels short and direct, front-loading keywords. The W3C's ARIA Authoring Practices bug tracker went further for the specific case of toggle *buttons*, resolving to add guidance that "toggle button labels shouldn't change when pressed" — a direct argument against your text-swapping approach for a button (as opposed to a labeled switch).

### Why a segmented control / chip beats a text-swapping button
- **Material Design 3** positions segmented buttons for selecting options / switching views / sorting, capped at 2–5 segments (use chips beyond that).
- **Mobbin's** component guidance: segmented controls are "best when users need to choose between a small number of mutually exclusive options (e.g., 'list view' vs. 'grid view')" and "ideal when changes happen instantly based on user selection, like switching tabs or filters."
- **UX Movement** argues segmented/toggle buttons make options 100% visible (vs. a dropdown or a hidden state), reducing clicks and cognitive load — "toggle buttons only require one click compared to two clicks for drop down lists."
- **Material filter chips** can carry a number; Material's guidance notes numbers in a filter chip preview "how many items they may encounter when the filter chip is selected," best kept to 1–3 digits (recommended for totals under ~100).
- **Caveat from real practice:** A Cursor community bug report documents users disliking it when a standalone "Include Archived" *toggle* was folded into a status filter, because they lost the ability to see archived + active together. Lesson: whichever control you pick, keep the default ("Visible") and an "All" option both reachable — don't trap users in a single mode.

### Count display: the evidence
- **Baymard** ("Filtering UX: Display 'Applied Filters' in an Overview"): "our large-scale usability testing reveals that overviews of applied filters speed up product finding and help orient users, but 28% of sites don't provide them." Match counts next to filter options also help users set expectations and avoid dead ends.
- **NN/g** (Katie Sherwin, "User Intent Affects Filter Design," 2016): "Often, facets also show the number of elements available under each filter, and thus help users avoid zero-search results."
- Implication for InvestScape: the count belongs *on the persistent control itself* (e.g., "Hidden (3)"), visible whether or not hidden cards are currently shown — not only appearing after you toggle.

### How competitors and adjacent tools actually do it
- **Figma (layers panel):** the eye icon toggles per-layer visibility; hidden layers appear greyed-out/inactive in the panel and disappear from canvas. This is the closest analog to InvestScape's card treatment and validates the "greyed-out + eye-slash" approach.
- **Trello:** cards are *archived* (not hidden in place); archived cards live behind the board's three-dot menu → "Archived items," where you can view, search, and restore them with a click. No in-place greying.
- **Notion / Airtable:** no native per-record "hide"; the idiomatic pattern is a checkbox property + a filtered "Archive" view alongside a "Working" view (filter = "Archived is not checked"). Visibility is a view-level filter, not a per-card toggle.
- **Asana / Todoist:** completed items are hidden/shown via a Display/Filter control (Asana's "Incomplete" quick filter; Todoist's "Completed tasks" toggle under Display). Long-running user requests for a persistent, *saveable* show/hide toggle are evidence that a durable, always-visible control is what people actually want.
- **Linear / GitLab:** archived issues are surfaced via an "include archived" filter; GitLab explicitly shipped "a visual toggle for including archived."
- **Real estate tools:** **Stessa** marks a property **Sold**, which tags it and "is excluded from portfolio and property dashboards" while preserving all historical data — a status/lifecycle model rather than an eye-toggle. **CREXi's** "My Listings" dashboard filters by status (Draft/Active/Sold) and uses a green-arrow / red-X quick action to keep a listing active or remove it from the marketplace. Both are status-filter patterns, not per-card hide toggles, reinforcing that in the real-estate domain "hide" usually maps to a status filter with counts.

### Icon conventions in depth
- **Direction of the pair:** The long-standing debate (from password fields) is whether the icon should show *current state* or *next action*. There is no absolute standard, but the modern, most-common convention shows *current state*: eye-open = currently visible; eye-slash = currently hidden. Facebook and most current apps do this. For a card that is visible, show an open eye (click to hide); once hidden and greyed out, show an eye-slash. Consistency and a clear text/accessible affordance matter more than which philosophy you choose. (Note: Google flipped its password-field eye direction at one point, which is precisely the kind of inconsistency to avoid internally.)
- **Color:** Keep one neutral color across both states. NN/g's WebEx case is the cautionary tale — the author recounts that "even though the microphone was crossed in both states, the red color of the icon was meant to signal that the button was active and I was muted… In my panic, I was completely oblivious at the change in the icon color!" Red was overloaded (also used for the "Leave" button) and failed as a state signal. Reserve red for destructive/error semantics. Signal "hidden" via the eye-slash glyph + the greyed card + the "Hidden" label + the count — not via a red icon.
- **Accessibility:** Don't rely on color or icon alone (WCAG 1.4.1 — "Color is not used as the only means of conveying meaning"). Your greyed card + "Hidden" text label already satisfies this; additionally ensure the eye control has an accessible name that states the action ("Hide this deal" / "Show this deal"), meets non-text contrast ≥3:1, and has an adequate target size (≥24×24 CSS px, ideally 44×44).

## Recommendations

**Stage 1 — Fix the header control (highest impact, low effort).**
Replace "Show hidden (N)" / "Hide hidden" with a persistent segmented control:
`[ All ] [ Visible ] [ Hidden (3) ]` — or, if you only need two states, a filter chip **"Hidden (3)"** that is off by default and, when selected, reveals hidden cards.
- The count lives on the control at all times and updates live.
- The selected segment shows current state; the unselected segments state the available actions.
- Default to "Visible." Keep "All" reachable so users can see visible + hidden together (avoids the Cursor mistake).

**Stage 2 — Standardize the per-card eye icon.**
- Use a single neutral-colored eye / eye-slash pair reflecting current state (open = visible, slash = hidden).
- Keep the greyed-card + "Hidden" label treatment (it is the Figma-validated pattern).
- Give the icon a stateful accessible label ("Hide this deal" when visible; "Show this deal" when hidden).
- Remove any red coloring used to mean "hidden."

**Stage 3 — Resolve the hide-vs-archive semantics.**
- If hidden cards are a *temporary personal view preference*, keep calling it "Hide" and treat it purely as a per-user view filter (as above).
- If hiding is meant to be a *lifecycle action* (dead deals, passed opportunities), consider a proper "Archive" that moves cards to a separate "Archived (N)" view — mirroring Trello/Linear/Stessa's "Sold" — rather than greying them in place.

**Benchmarks / thresholds that would change these recommendations:**
- If the number of view states grows beyond ~5 (e.g., All / Visible / Hidden / Archived / Sold / Flagged), abandon the segmented control for a dropdown or a set of filter chips (per Material's 2–5 rule).
- If per-user hiding proves rare in analytics (e.g., under ~5% of sessions), demote the control to a menu item to reduce toolbar clutter.
- If usability testing shows users want visible + hidden simultaneously as the norm, make "All" (not "Visible") the default.

## Caveats
- **No single mandated standard exists** for the eye-icon direction or for hide-vs-archive naming; multiple reputable design systems (Material 2 vs 3, Apple HIG, Ant Design) coexist without a binding rule, so internal consistency is the deciding factor.
- **Some sources are practitioner blogs and vendor design-system pages** (Eleken, UX Movement, Mobbin, Setproduct) rather than peer-reviewed research; where it matters, they are corroborated here by primary guidance from NN/g, Material Design, Baymard, and Figma's own documentation.
- **Material Design 3 is evolving:** its newer "Material 3 Expressive" update reportedly deprecates the classic "segmented button" in favor of a "connected button group." The functional guidance (2–5 mutually exclusive options, single-select for view switching) is unchanged, but component naming in M3 is in flux — verify the current component name in your design system before building.
- **Competitor specifics** for several niche real-estate/analysis tools (ARGUS, DealCheck, REI/BiggerPockets, Bloomberg Terminal portfolio views) were not directly documented in accessible public UX materials; conclusions about the real-estate category therefore lean on Stessa and CREXi, which are well-documented, supplemented by the general SaaS/kanban patterns above.