# InvestScape — Master To-Do Triage & Execution Plan (Doc 55)

**Renumbered from Doc 28 on 31 July 2026** — Doc 28 was a numbering collision with `28-External-Data-Source-Registry.md`; that file retains the Doc 28 designation. See Doc 54 §3 (Engine Reconciliation) for the flag that surfaced this, and the docs-backup MANIFEST.md for the renumbering decision. Any earlier reference elsewhere in the doc set to "Doc 28" meaning this Master To-Do Triage Plan should now be read as Doc 55.

**Source:** Eric's full-ecosystem review list (global + per-tab + final notes). Every item is triaged into one of five buckets: already done/decided, ready-to-prompt now, needs Eric's decision first, Claude-side advisory deliverable, or legal-gated. Prompts follow the same one-at-a-time discipline as Docs 16–27.

---

## PART 0 — Three catches surfaced by this review

1. **Portfolio disclaimer (your Portfolio item 1) — confirmed, and it's Doc 25's miss.** The earlier grep found the disclaimer in five locations; Doc 25's fix explicitly listed only four ("Deal page, Dev Studio Overview, Import Review, Full Proforma Review"). Portfolio was skipped. → Prompt H.
2. **"✓ VERIFIED PRO" badge still in the Community prototype contradicts the decided removal** (legal liability — "Verified" implies vetting that never happened; replaced by a contribution-earned label). Your Market News item 3 is the same decision arriving from the product side. → Prompt I.
3. **README was stale** (listed through Doc 16) — refreshed as part of this consolidation through Doc 28.

---

## PART 1 — Direct answers (no build needed)

**G3 · Dedicated print button — recommendation: don't build it.** Browser-print of a dark-themed, fixed-layout dashboard produces bad output (dark backgrounds, clipped panels), and the export system already designed (PDF / Excel / CSV / branded report, Doc 10) is the professional-tool answer — Bloomberg/ARGUS users export reports; they don't Ctrl-P the terminal. The lender-facing export template (Doc 15 §7) is your "print" story. Cheap optional add: a print stylesheet that forces light-on-white if someone does hit Ctrl-P. **Decision 1: accept this, or want dedicated print icons anyway?**

**G5 · Can the backend absorb future languages? Yes — by design, with one caveat.** The i18n dictionary means a new language = a new dict column; `countNoun`/`NOUN_FORMS` handles per-language pluralization; the fr-CA work proved number/currency formatting is per-language switchable; Doc 13 §2 already maps this onto Bubble's native app-text system for the real build. The caveat: **right-to-left languages (Arabic, Hebrew) need layout mirroring, not just text swap** — that's a real project when it comes, not a dict column. Everything currently planned (European + CJK languages) slots in cleanly.

**G6 · Multi-country currency? Already architected.** Doc 15's `Currency` option set and `FXRate` pair table were explicitly built extendable — a new country = new jurisdiction row + currency option + FX pair + tax tables (`TaxBracketTable` already jurisdiction-scoped). One future refinement noted there: decimal-places metadata per currency (JPY has 0) — trivial to add when a zero-decimal currency arrives.

**P2 · MLS number auto-populate — great feature, genuinely legal-gated, and you have an unusual advantage.** MLS data isn't public-domain: in Canada it's CREA-controlled (the DDF program licenses feeds through member realtors/brokerages; scraping realtor.ca violates its terms), and in the US it's per-MLS licensing (IDX/RESO rules, aggregators like MLS Grid / Bridge / Trestle). **But you are a licensed realtor — DDF access through your brokerage may be legitimately available to you in a way it isn't to DealCheck or Stessa.** That's a potential real moat, not just a compliance hurdle. **Recommendation: defer the feature until the real-estate regulatory counsel consult; it's now a named question in the legal pack (Part 4A).** Don't build even a demo version that implies live MLS lookup yet.

**Route 2 portability — Bubble locks app logic, not your data or your spec.** Bubble exports data (CSV) but not workflows/pages/code. Your true Route 2 template already exists and was built deliberately: the canonical MD doc set (schema, formulas, validations, decisions) plus the HTML prototype files are stack-agnostic — a dev team rebuilds from those on Postgres/React without touching Bubble's internals. Action: keep the outputs snapshot versioned and current (README refreshed), export data as CSV when the time comes.

**NI1 · AI Morning Brief placement — recommendation: move it to Market News.** The brief is macro content (rates, cross-border spread, metro-level rents) — that's the news tab's job. Neighbourhood Intel is micro (one neighbourhood at a time). **Decision 2: confirm the move?**

**DA5 + Workspace · The unification model — recommendation:** the Deal page already has a Notes tab; make that tab *be* the deal's Workspace entry (same checklists, notes, AI insights — one data source, viewed in context), and the top-level Workspace becomes the **cross-deal rollup** — "all my notes and checklists across every deal, in one place." Nothing duplicated; Workspace earns its ribbon spot as the aggregator, the Deal page stays self-contained. **Decision 3: confirm this model?** (Full wiring happens inside the Deal Analyzer design pass, Part 3 decision 5.)

**G2 · AI companion voice input — recommendation: out of prototype scope.** Typing in any language: yes — that's the Claude API language parameter already designed (Doc 13 §4). Voice needs speech-to-text infrastructure — a real product feature for the actual build, not a prototype demo. The prototype's static AI text translation, the takeaway carousel, and save-from-bubble-to-takeaways are all promptable now → Prompt P.

---

## PART 2 — BATCH-1 PROMPTS (ready now, run one at a time, in this order)

### Prompt H — Portfolio disclaimer (the missed 5th instance)
```
The reusable disclaimer was translated in a previous fix, but only 4 of its
5 instances were wired to the i18n dictionary — the Portfolio page's
disclaimer (bottom of the main Portfolio view) was missed and still shows
hardcoded English when the language is switched. Wire this 5th instance to
{{ dict.disclaimer }} exactly like the other four. Also do a quick search
for any OTHER remaining instance of the English disclaimer string anywhere
in the codebase, in case there's a 6th somewhere none of us has listed.
Screenshot the Portfolio disclaimer in French to confirm.
```

### Prompt I — Community: remove Verified Pro, add earned Top Contributor
```
Two related changes to Community, reflecting a decided policy change:

1. Remove the "✓ VERIFIED PRO" badge everywhere it appears. It implied
   platform-verified credentials that were never actually checked. A
   user's self-described profession may appear as plain descriptive text
   next to their handle (e.g. "realtor"), never styled as a verification
   badge — no checkmark, no badge chrome, no "verified" language.
2. Add a "Top Contributor" label instead — earned through community
   activity (upvotes/tenure), nothing to do with profession. Show it as a
   small neutral pill next to 1-2 sample users' handles in the demo posts.
3. Move the "Top Contributors" panel (currently on the Research/Market
   News page) into the Community tab's right side — it's a community
   reputation feature, not an editorial one. Populate with the same
   sample users, ranked, with their contribution counts.
4. Make sure all new/changed strings are in the i18n dictionary for all
   four languages, since this touches pages already swept for translation.
Screenshot Community in English and French after the change.
```

### Prompt J — Chart completeness sweep (every page, not just one)
```
Several charts render as bare visuals with no labels, axes, values, or
explanation. Sweep EVERY page — Portfolio, Deal page, Dev Studio (Hub,
Overview, Quick Proforma), Research/Market News, Market Intel/Neighbourhood
Intel, Workspace — and for every chart on each page ensure it has:
1. A visible title (already present on some — verify all).
2. Axis labels or an inline legend where applicable (the Portfolio
   equity-vs-debt bars currently have no property names or value labels;
   the Neighbourhood Intel bottom line-chart has no title, legend, axis
   values, or explanation at all — both are known offenders).
3. Hover/tap tooltips showing the underlying value.
4. A one-line plain-language summary beneath the chart (e.g. "Equity now
   makes up 58% of total portfolio value, up from 52% a year ago") using
   realistic demo data consistent with the numbers already shown.
5. All new strings added to the i18n dictionary, all four languages.
Report page-by-page which charts you touched, and screenshot the Portfolio
equity bars and the Neighbourhood Intel chart before/after.
```

### Prompt K — Country content filter (CA / US / Both)
```
Add a country filter control — three options: Canada, USA, Both (default
Both) — to four pages: Portfolio, Development Studio Hub, Market News
(Research), and Neighbourhood Intel (Market Intel). Small segmented
control near each page's title area, consistent placement across all four.
1. Filtering hides/shows content tagged to each country: properties by
   their country, dev projects by jurisdiction, news items and market
   cards by their market. Tag the existing demo content accordingly.
2. Portfolio totals recompute for the filtered set (per-currency subtotal
   rules from the earlier currency work still apply — filtering to one
   country naturally leaves a single-currency view).
3. Each page remembers its own filter selection (persist like the widget
   layouts), independent per page.
4. i18n: the control's labels in all four languages.
Demonstrate on two pages (Portfolio and Market News), screenshot each in
both a filtered and Both state, and confirm the persisted choice survives
a reload.
```

### Prompt L — Import banner contextual placement
```
The "import awaiting review" inline banner currently appears only on
Portfolio. Fix the placement rule: the banner should appear on whichever
page owns the import's content type — Portfolio imports banner on
Portfolio, Development Studio imports banner on the Dev Studio Hub — and
anywhere the relevant import/bulk-import button lives. The notification
bell entry stays global as-is. Add a demo Dev Studio import in
pending-review state so the Dev Studio banner is visible, and screenshot
both pages showing their own banners.
```

### Prompt M — Deal archive/delete UI (implements the already-designed spec)
```
Add archive and permanent-delete to the Deal page, following the exact
already-decided pattern:
1. An "Archive" action (kebab/overflow menu on the deal header). Archived
   deals disappear from default lists; a "Show archived" toggle reveals
   them, fully intact, with an "Unarchive" action. Low-friction, reversible.
2. "Delete permanently" is reachable ONLY from the archived state, and
   opens a confirmation modal: headline "This can't be undone.", body
   explaining it permanently removes the deal and everything under it —
   no backup, no recovery — and that anything already shared to Community
   as a snapshot is unaffected (those are frozen copies). The user must
   type DELETE (exact match) to enable the red "Delete Permanently" button.
3. On confirm: the deal disappears, and a notification appears in the
   bell ("[Deal name] was permanently deleted") as the user's receipt.
4. All strings in the i18n dictionary, four languages.
Demonstrate the full flow on a demo deal: archive → show archived →
delete → type DELETE → confirm → gone + notification. Screenshot each step.
```

### Prompt N — Deal page thumbnail
```
The Portfolio table shows a photo thumbnail per property, but the Deal
page header has none. Add a property photo to the Deal page header (left
of the address block, similar treatment to Portfolio's thumbnails but
larger — think listing-card scale), using the same demo images. If a deal
has no photo, show a neutral placeholder with an upload affordance
(non-functional demo button is fine). Screenshot the header with a photo
and with the placeholder state.
```

### Prompt O — Auth screens with language selector
```
Create simple sign-in and create-account screens for the prototype (they
don't exist yet): email + password fields, the InvestScape logo, dark
navy styling consistent with the app, and — the key addition — a language
selector (globe + dropdown, same four languages) visible on BOTH screens.
Selecting a language immediately translates the auth screen itself, and
carries through as the account's default language after "signing in"
(wire it to the same language state the in-app switcher uses). Keep these
screens minimal — this is about the language flow, not building real auth.
Screenshot the sign-in screen in English and French.
```

### Prompt P — AI text i18n + takeaway carousel + save-to-takeaways
```
Three related changes to the AI features:
1. The AI companion bubble's static demo text, and the "AI takeaway" /
   "AI Insight" demo paragraph content, are hardcoded English — move them
   into the i18n dictionary so they translate with the language switcher.
   (In the real product the AI generates responses in the user's language;
   for the prototype, translated static demo text represents that.)
2. Make the AI takeaway box a small carousel: 2-3 sample takeaway comments
   per location, with left/right arrows and dot indicators to move
   between them.
3. In the AI companion bubble, add a small "Save to takeaways" action on
   an AI response — clicking it adds that response as a new card in the
   nearest AI takeaway carousel (demo behavior), with a brief "Saved"
   confirmation.
All new strings in all four languages. Screenshot the carousel with
arrows visible, and the bubble's save action, in French.
```

### Prompt Q — Tab renames: Market News + Neighbourhood Intel
```
Two nav renames, previously deferred and now unblocked:
1. "Research" becomes "Market News" — nav tab, page title, and every
   reference to the old name, in all four languages.
2. "Market Intel" becomes "Neighbourhood Intel" — same treatment, all
   four languages.
Page CONTENT stays as-is for both (deeper feature changes are queued
separately) — this is only the naming layer. Check the hamburger drawer,
the Global Settings references, and any deep links or empty states that
mention the old names. Screenshot the nav (desktop + mobile drawer open)
in English and French.
```

### Prompt R — Market News editorial layout (featured row)
```
Restructure Market News (formerly Research) with an editorial hierarchy:
1. A "Featured" top row: 1-2 larger article cards from "Lighthouse
   Research" (the platform's own publications) — visually distinct
   (larger card, small "Lighthouse Research" publisher tag).
2. Below it, the general market-news feed as it exists today (the
   syndicated/desk items), unchanged.
3. The Top Contributors panel should already be gone from this page
   (moved to Community in an earlier fix this batch) — verify it is, and
   that the right column reflows cleanly without it.
All new strings in four languages. Screenshot in English and French.
```

### Prompt S — Library card detail view
```
Make every Library formula card clickable: clicking opens a detail
overlay/panel showing the formula notation (stays universal/untranslated),
a plain-language explanation, a worked example with realistic numbers, and
the card's existing tier/category tags. Add a close action and keyboard
escape. Confirm ALL cards across every filter category open a detail view
— not just the first few — and that explanation text (not the formula
notation itself) is in the i18n dictionary for all four languages.
Screenshot one open detail card in English and one in French.
```

**Run order: H → I → J → K → L → M → N → O → P → Q → R → S.** Q before R (rename before restructuring the renamed page's layout). Same rules as always: one prompt at a time, itemized reports, screenshots where asked, no "Done" without evidence.

### Prompt T — Code consolidation pass (run LAST, after everything else in this doc)
```
Do a cleanup/optimization pass over the whole prototype codebase — with
one hard rule: NO behavior changes. This is refactoring only.
1. Remove dead code: unused renderVals (e.g. dsBudgetPairCols was noted
   as unused), stale state flags, orphaned template fragments, leftover
   references from removed features (old Project Settings links, the
   removed Verified Pro badge, the pre-updateSeries chart code).
2. Deduplicate: repeated style strings into shared constants, repeated
   dict-lookup patterns into helpers, the money/count formatting helpers
   consolidated to single definitions.
3. Sanity-check the i18n dictionary for orphaned keys (defined but never
   used) and duplicated entries.
4. Note (don't fix) anything structurally inefficient that's better
   addressed in the real Bubble/Route-2 build rather than the prototype.
After the pass, verify these key flows still work exactly as before and
screenshot each: language switch to French on Portfolio, the notification
dropdown, Customize reorder+save on one page, the Dev Studio mobile
redirect, and the Quick Proforma donut updating on input. Report what was
removed/consolidated and the before/after approximate line count.
```

---

## PART 3 — NEEDS ERIC'S DECISION (answer with "1: yes/no…")

1. **Print:** accept export-first (no dedicated print icons, optional print stylesheet)?
2. **AI Morning Brief** moves to Market News?
3. **Workspace model:** Deal Notes tab = the deal's workspace entry; top-level Workspace = cross-deal rollup?
4. **Deal status regression:** allow backward moves + a "Lost / Fell through" status (with optional reason) rather than only forward movement? (My rec: yes — deals genuinely fall through, and pretending status only moves forward forces users to delete real history.)
5. **Deal Analyzer full revamp (your DA1):** proceed as its own design doc first (Doc 29 — covering stage explanations, value entry, MLS-placeholder handling, Workspace wiring per decision 3, and the Deal-vs-Workspace explainer), then prompts — same design-before-prompt pattern as Docs 22→23 and 24→26?
6. **MLS:** confirm deferral until the regulatory-counsel consult (feature designed but not built or demoed until then)?
7. **Voice input for the AI companion:** confirm out of prototype scope (product-build feature later)?

## PART 4 — CLAUDE-SIDE DELIVERABLES (no Claude Design involved — say the word and I produce them)

A. **Legal consultation question pack** (single consolidated doc/PDF): SaaS ToS + limitation-of-liability structure, grade-badge framing, PIPEDA erasure + DeletionLog retention, Quebec Charter of the French Language applicability, MLS/DDF data licensing (with your realtor status noted), Drive/Dropbox data-flow, Partner Split Calculator securities framing, arbitration/class-action waiver, "analysis tool not accounting records" positioning, syndicated-news content liability (Market News RSS).
B. **E&O + AI-rider insurance question pack**: coverage scope for AI-interpreted outputs, the grade badge specifically, dual-market (CA/US users) coverage, claims examples in proptech/fintech SaaS, rider cost drivers, exclusions to watch.
C. **Formula coverage audit**: Library's cards vs Doc 06 (44) + Doc 06A (11) vs the source proforma/commercial-analysis files — anything taught in the sources but missing from the library. (Scorecard rubric stays excluded as trade secret.)
D. **Dev Studio ↔ Portfolio ↔ Deal Analyzer cross-pollination analysis** (your DS1): what each has that the others should inherit, with competitor comparison per screen, reasons, and pushbacks.
E. **Full competitive per-screen sweep** (your final-notes item): every tab vs DealCheck/Stessa/Mashvisor/Northspyre/ARGUS — what's missing, what's moat.
F. **C-suite review simulation** (CEO/COO/CTO/CFO "meeting minutes" on the finished prototype) — best done *after* Batch 1 lands so it reviews the real current state.
G. **Investor/employee/developer perspectives** (Angel, VC, prospective hire, multinational developer) — same timing as F.
H. **README/consolidation refresh** — done in this pass (updated through Doc 28).

**Suggested order: A and B first** (they gate the consultations with real lead times and don't depend on design work), then C, then D+E together, then F+G after Batch 1 completes.

## PART 5 — Schema deltas created by this batch (so the canonical docs and Bubble/Route 2 stay in sync)

- `User` (or per-page preference store): country content filter per page (CA/US/Both) — same persistence family as `WidgetLayoutItem`.
- `Deal`: photo — recommendation: reuse the linked Property's photo, no new field (confirm in Doc 29).
- `DealStatus`: add "Lost" (pending decision 4).
- `ArchivedDate` on Deal: already specced in Doc 11 — Prompt M implements existing spec, no delta.
- AI takeaways: if save-to-takeaways becomes a real product feature, a small `AITakeaway` type (Deal link, text, CreatedDate, source) — prototype-only for now; flag for Doc 29.

---
*End of Doc 55 (renumbered from Doc 28) · Supersedes Doc 19's queue (absorbed: checklist add/delete → Doc 29 scope; tab renames → Prompt Q; neighbourhood lookup feature → still deferred pending data sourcing; Verified/Assumption input tagging → still deferred, listed for Doc 29 consideration).*
