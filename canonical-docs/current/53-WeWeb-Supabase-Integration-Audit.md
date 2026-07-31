# InvestScape — WeWeb+Supabase Integration Audit (Read-Only) — Doc 53

**This is a READ-ONLY AUDIT, same convention as Doc 17. Nothing here is fixed or built in this pass — findings only, so you can decide what's worth acting on before anything gets touched.** Scope: every canonical doc still written against Bubble-specific mechanics that Doc 02/03/15's revision pass didn't already cover — Doc 11 (Notifications), Doc 13 (i18n), Doc 24/26/49 (Customizable Layout), Doc 10 (Import/Export/Storage), and Doc 03 Addendum B (ApexCharts Wiring).

Each item is classified: **CLEAN FIT** (maps directly, no real risk), **UPGRADE** (Supabase/Postgres does this better than Bubble did), or **NEEDS VERIFICATION** (a real difference exists, worth checking before you build on the assumption it works like Bubble did).

---

## 1. Doc 11 — Notification System

**CLEAN FIT, one UPGRADE, one new discipline point.**

- The `Notification` table, `NotificationType`/`NotificationOptOuts` pattern, and bell-icon UI are all straightforward CRUD + a dropdown — no Bubble-specific mechanic to lose. Maps directly to a `notifications` table + RLS (owner-only read/write-own-read-state) + a WeWeb collection bound to it.
- **UPGRADE — cascade delete.** Doc 11's original cascade-delete section exists specifically because *"Bubble doesn't cascade deletes automatically; each parent type needs its own cleanup step in the delete workflow."* Doc 02's Supabase revision already uses `ON DELETE CASCADE` foreign keys throughout (Property → Deals → DealInputs/DealMetrics → PortfolioSnapshots, DevProject → all its children). In Postgres, deleting a Property genuinely cascades everything listed in Doc 11's manual cleanup list, automatically, at the database level. That entire manual-steps section becomes dead weight — good news, not a gap.
- **New discipline point this upgrade creates.** Doc 11's UX flow depends on a specific *order*: capture the `DeletionLog` receipt, **then** delete. A real DB-level cascade doesn't know about that ordering — if a WeWeb workflow (or a bug) ever calls a raw delete on a Property without going through the "type DELETE to confirm" modal's workflow first, Postgres will happily cascade-erase everything with no receipt written, no confirmation step honored. Bubble's manual step-by-step deletion workflow was tedious, but that tedium made it harder to accidentally skip a step. **Recommendation, not built:** the delete action should never be exposed as a raw table delete anywhere in WeWeb — route it exclusively through a workflow (or better, a Postgres function called via RPC) that writes `DeletionLog` first and only then performs the delete, so there's one single path to actual erasure, not "the modal path" plus "whatever a client could technically call."

---

## 2. Doc 13 — Internationalization / Language System

**NEEDS VERIFICATION, but the news is better than Doc 13 itself expected.**

Doc 13 §2 explicitly flagged its own uncertainty: *"I haven't verified the current specifics of [Bubble's native language] feature against Bubble's own docs, so confirm the exact mechanics there before committing."* That verification never happened (Bubble build never started), so this isn't a regression — it's a question that was always open, now being answered against a different platform.

**Confirmed via current research:** WeWeb has native multi-language support — a documented "Change language" workflow action, per-element language bindings on text elements, and an integrated Google Translate pass in the editor for first-pass translation. This is a **CLEAN FIT** for Doc 13 §1's UI-chrome translation layer, and arguably better-documented than Bubble's equivalent ever was for this project.

**One real, specific gap surfaced by WeWeb's own user community:** text elements support per-language dynamic binding natively; **buttons do not** — button label text needs to be set by hand per language rather than bound the same way. This is a small, concrete thing to budget for during Stage 4/6 build (nav shell, wizard steps, every CTA button), not a blocker — just don't assume every element type behaves like Doc 13 assumed Bubble's would.

**Unaffected by the pivot, still open regardless of platform:** the Quebec/Bill 96 legal question (§6), the AI-narrative language-parameter fix (§4 — now lives in the calc-engine service's Claude API call, same fix, different file), and the human-translated-not-machine-translated rule for legal/disclaimer text (§1 — a process rule, not a platform mechanic).

---

## 3. Doc 24 / 26 / 49 — Customizable Layout System

**CLEAN FIT.**

`WidgetLayoutItem` (page, widget ID, order, visibility, size) is a plain CRUD table with no Bubble-specific mechanic baked in — maps directly to a `widget_layout_items` table + RLS. The "only override rows get stored, defaults live in the front end" principle carries over unchanged and is if anything more natural in a component-based frontend like WeWeb (or React later) than it was in Bubble.

**One item to re-verify in practice, same as Doc 24 originally flagged for Bubble:** Doc 24 §4 hedged on drag-and-drop ("check Bubble's native drag-and-drop support... if it's fiddly, fall back to up/down arrows"). WeWeb has its own drag-and-drop component support, but this needs the same practical check, not an assumption it's automatically reliable — carry the same fallback plan (arrow buttons) forward rather than assuming the hedge is resolved just because the platform changed.

---

## 4. Doc 10 — Import / Export / Storage Architecture

**CLEAN FIT — genuinely low risk regardless of platform.**

Doc 10's core architecture decision was to route file storage through the user's own Google Drive/Dropbox rather than native platform file storage — this was already platform-agnostic by design, since it talks to Google/Dropbox's own APIs, not Bubble's file-handling internals. WeWeb's own Supabase integration additionally makes Supabase Storage available if you ever want a native-storage fallback (e.g. for property photos, which Doc 02 already modeled as a URL column rather than a Bubble-native image field) — this is an option Bubble genuinely didn't offer as cleanly, but it's additive, not something the existing Drive/Dropbox architecture depends on.

Deal Analyzer/Dev Studio extraction workflows (I1–I3), the `ImportBatch` review-screen patterns, and the Claude API extraction prompt template (Doc 14) are all data-shape and UX decisions, not Bubble mechanics — nothing here to re-audit.

---

## 5. Doc 03 Addendum B — ApexCharts Wiring

**NEEDS VERIFICATION — one real mechanical difference, not yet confirmed.**

The Bubble version's entire approach was: drop an HTML element on the page, paste a `<script>` block loading ApexCharts from CDN, and use Bubble's "Insert dynamic data" to write live values directly into that embedded script's text at render time. This is a genuinely Bubble-specific mechanism (Bubble's dynamic-data-insertion-into-HTML-element pattern).

**What needs checking before Stage E1 gets rebuilt in WeWeb:** whether WeWeb's custom-code/embed component supports the same "write dynamic data into an inline script tag" pattern, or whether the cleaner WeWeb-native approach is a proper custom Vue component wrapping ApexCharts and reading data via WeWeb's normal variable-binding system (which the earlier research already confirmed WeWeb supports — "custom JavaScript actions and custom Vue components"). The `destroy()`-before-recreate guard (Stage E0's core caution against stacked chart renders) and the `updateSeries` pattern (Stage 1 Prompt 1a Standard B — never destroy/recreate, prevents flicker) are chart-library-level concerns, not Bubble-specific, so those carry over unchanged regardless of which embedding mechanism WeWeb ends up using.

**Recommendation, not built:** treat this as a small Stage-4-adjacent spike — build one chart (the Portfolio allocation donut is the smallest, already-specced example) in WeWeb using a custom Vue component before committing the whole ApexCharts wiring doc to that approach, the same "verify the mechanism before writing 8 chart stages against it" discipline Doc 03 Addendum B itself used when it first confirmed the Bubble HTML-element approach.

---

## Summary table

| Doc | Classification | Action needed |
|---|---|---|
| 11 — Notifications | Upgrade + 1 discipline point | Route deletes through one workflow/RPC path only (not built, recommended) |
| 13 — i18n | Needs verification, better news than expected | Budget manual per-language button labels during build; Quebec/legal question still open |
| 24/26/49 — Customizable Layout | Clean fit | Re-verify WeWeb drag-and-drop in practice, same hedge as before |
| 10 — Import/Export/Storage | Clean fit | None |
| 03 Addendum B — ApexCharts | Needs verification | Spike one chart in WeWeb before committing the full wiring doc |

Nothing found in this pass rises to the level of blocking the current build sequence — the two "needs verification" items (i18n button labels, ApexCharts embedding mechanism) are both small, checkable within a single build stage rather than requiring new research.

---
*End of Doc 53 · Read-only audit, report-only convention per Doc 17 · Covers: 10, 11, 13, 24/26/49, 03 Addendum B · Does not cover: Doc 33 (glossary — content, not mechanics), Community taxonomy docs (36/39 — content/UX, not platform-mechanic-dependent)*
