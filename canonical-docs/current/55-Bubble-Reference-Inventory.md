# InvestScape — Bubble → WeWeb/Supabase Documentation Inventory — Doc 55

**Read-only audit, same convention as Docs 17 and 53. Nothing is fixed in this pass — this is the map, so you can decide the order of repair rather than discovering gaps one prompt at a time.**

**Scope:** every `.md` file in the project (74 total). PDF, docx, and pptx sources are covered separately in §5, since they could not be full-text scanned by machine this pass. **Method:** counted literal mentions of "Bubble" per file, then re-scored each file for *Bubble-specific mechanics* (backend workflow, Privacy Rule, Option Set, API Connector, Workload Unit, repeating group, plugin) rather than just the word — a file that mentions Bubble once in a changelog line is a different problem from a file structured around Bubble's own build steps.

**Headline count:** 44 of 74 `.md` files contain at least one Bubble reference. Of those, only **4 files** — Docs 12, 52, 53, and the Bubble-vs-WeWeb research report — actually discuss the pivot. The other 40 were written before the pivot and have not been touched since. **Two of those 40 (Docs 02 and 03) are the database schema and the build checklist — the two most load-bearing documents in the entire registry.**

---

## 1. Already correct — no action needed

These four documents are pivot-aware and don't need touching:

| Doc | Status |
|---|---|
| 12-Pre-Port-Advisory-Review.md | Original review; §4 (items 4.1–4.4) is explicitly superseded by Doc 52, which is filed alongside it. Read the pair together. |
| 52-Route2-Simplification-Post-Pivot.md | The correction document itself. |
| 53-WeWeb-Supabase-Integration-Audit.md | Read-only audit of Docs 11, 13, 24/26/49, 10, 03B against the new stack. |
| InvestScape_on_Bubble...Research_Report.md | Correctly written as historical comparison — "here is why Bubble was rejected in favour of WeWeb+Supabase." Past tense, not a build instruction. No fix needed. |

Also clean: **Docs 15 (Supabase version), 02 Addendum A (Supabase version)** — these are the *replacement* files already sitting in the project next to their stale originals (see §2).

---

## 2. Tier 1 — Structural rewrites needed (the document is built around Bubble's own mechanics, not just naming it)

These aren't find-and-replace jobs. Each one is organized stage-by-stage or field-by-field around how Bubble specifically works, and needs re-deriving against the Supabase/WeWeb/calc-engine architecture the same way Doc 15 and Doc 02 Addendum A already were.

### 🔴 `02-Bubble-Database-Schema.md` — the core schema, no replacement exists
The single most important gap on this list. Doc 02's **Addendum A** got a Supabase-native sibling filed (`02-Database-Schema-Addendum-A-DevStudio-Supabase.md`) — but the **base document**, covering `User`, `Property`, `Deal`, `DealInputs`, `DealMetrics`, `Subscription`, Option Sets, and Privacy Rules, never did. Every later doc that references core field names is quietly depending on this file, and it currently instructs: *"Bubble field names can't be renamed cleanly later without breaking workflows"* and describes Privacy Rules (a Bubble-specific access-control mechanic) where Doc 53 has already established Postgres RLS policies are the real mechanism now. **This should be the first file rewritten.**

### 🔴 `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md`
Same problem, narrower scope. Specifies the monthly snapshot job as a Bubble "Schedule API Workflow" — Doc 52 confirms this is now a `pg_cron` job, and Doc 50 already treats the underlying gap as a Postgres/Supabase concern, but this specific document was never updated to say so.

### 🔴 `03-Bubble-Build-Checklist.md`
The entire ten-stage build sequence — app creation, style variables, database, formula engine, nav shell, auth, wizard, results page, dashboard, Claude API narrative, beta hardening — is written as literal Bubble click-paths ("Data tab → Data types," Stage 9's API Connector steps). Doc 03 is referenced by name as the parent document in at least six other files (Addenda A and B, Doc 05, Doc 14). A WeWeb/Supabase-native equivalent needs to exist before those child documents can be trusted at face value.

### 🟡 `03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md`
Chart-wiring steps assume Bubble's HTML element + embedded `<script>` re-run behaviour. Doc 20 (Chart-Flicker-Fix) already partially re-derives the reactivity problem for "this React prototype" but explicitly notes the Bubble-side fix is different and unconfirmed. This addendum is the file that should carry that resolution once decided — right now it doesn't reflect Doc 20's own findings.

### 🟡 `03-Bubble-Build-Checklist-Addendum-A-TaxBracketTable.md`
Specifies a Toolbox "Run javascript" plugin action to loop tax bracket rows — a workaround for the specific fact that Bubble's native workflow actions don't loop cleanly. That constraint doesn't exist in a real TypeScript calc engine; the tax bracket loop is now unremarkable server-side code. Small file, easy fix, but currently describes solving a problem the new stack doesn't have.

### 🟡 `01-Formula-Engine-Specification.md`
States plainly: *"Bubble has no spreadsheet cells — every formula below must be explicitly built once as a backend workflow step."* This is the master formula reference Doc 54's engine-reconciliation audit is checked against, so its authority matters — but its own framing describes a Bubble backend workflow as the implementation target rather than the TypeScript calc engine that is actually being built.

### 🟡 `05-Claude-API-Narrative-Prompt-Template.md`
States the narrative call happens inside Bubble's API Connector as the final step of the `calc-deal-metrics` backend workflow. Doc 52 §3 (item 4.4) already corrected *where the API key lives* (calc-engine environment variables, not Bubble's API Connector) but didn't rewrite this source document itself — so the correction exists in Doc 52's changelog but not in Doc 05 where someone would actually go looking.

### 🟡 `11-Notification-System-Design.md`
References a "Bubble page name" field for deep-linking, and documents a manual per-type cascade-delete cleanup workflow. Doc 53 §1 already found this is now an **upgrade** — Postgres `ON DELETE CASCADE` handles it automatically — and flagged a new discipline point (never expose a raw table delete; route deletes through a function that writes the deletion log first). Doc 11 itself still describes the old manual-steps process as current.

---

## 3. Tier 2 — Surface references (the word "Bubble" appears, but the surrounding content is platform-agnostic or easily localized)

These are lower cost to fix — usually one phrase or one dependency line — because the substance of the document (a UX finding, a formula, a naming decision) doesn't actually depend on Bubble as a mechanism.

| Doc | What's actually there |
|---|---|
| 06-Commercial-Formula-Library.md | Formulas are platform-agnostic; a couple of "built as a Bubble field" asides. |
| 04-InvestScape-Style-Guide.md | Design tokens are platform-agnostic; references Bubble as the build target in passing. |
| 09-UX-Stress-Test-Audit.md | Findings are real UX findings; "before Bubble build starts" phrasing needs updating to WeWeb. |
| 09-UX-Stress-Test-Addendum-Chart-Reactivity.md | Same pattern. |
| 15-Currency-Multi-Jurisdiction-Schema.md | **Superseded by its own Supabase sibling file** (`15-Currency-Multi-Jurisdiction-Schema-Supabase.md`) — this original can likely be retired/archived rather than edited, once you confirm nothing still points to it as authoritative. |
| 13-Internationalization-Language-System.md | Doc 53 §2 already re-verified this against WeWeb's actual language features and found it a clean fit — the source doc itself hasn't been updated to reflect that finding. |
| 30-Tab-Name-Unification.md | One line about a data-migration workflow if `WidgetLayoutItem` rows exist in a "live Bubble app" — conditional and low-stakes since nothing is live yet. |
| 24-Customizable-Layout-System.md | One line hedging on Bubble's native drag-and-drop; Doc 53 §3 flags this as still needing re-verification against WeWeb specifically. |
| 36-Community-Board-Hierarchy-Tag-Legend.md | Passing reference only. |
| 28-External-Data-Source-Registry.md | Describes a Bubble-native searchbox and Toolbox plugin for the map feature; substance (which data sources, what's free) is unaffected. |
| 28-Master-ToDo-Triage-Execution-Plan.md | Task-tracking document; likely just needs its own task list updated to reference the current stack. |
| 50-PortfolioSnapshot-Audit-Correction-AcquisitionDate-Gap.md | Correctly diagnoses a real gap (the snapshot workflow was never built/scheduled) but frames it as a Bubble workflow rather than the `pg_cron` job Doc 52 established. |
| InvestScape-Stage1-Prompts-1a-1b-1c.md | Historical build-prompt record; low priority to touch since it documents what was actually built in Claude Design at the time, which is accurate regardless of platform. |
| 14-Claude-API-Extraction-Prompt-Template.md | One dependency-line reference to Doc 02's old title. |
| 20-Chart-Flicker-Fix-UpdateSeries.md, 12-Pre-Port-Advisory-Review-Addendum-A-Hosting-Deployment-Model.md, dev-studio-proforma-dissection-summary.md, InvestScape_Appraisal_Methodology_Mapping.md, 51-Acquisition-Wizard-Annual-Snapshot-Prompts.md, 22-Responsive-Multi-Monitor-Strategy.md, investscape-mvp-addendum-bootstrap-sequencing.md, README.md, 29-Market-News-Neighbourhood-Intel-Prompts.md, 06-Commercial-Formula-Library-Addendum-A-Development-Formulas.md, InvestScape_Product_Design...Legal_Traps.md, 54-Engine-Reconciliation-ClaudeDesign-vs-CalcEngine.md, 39-Community-Taxonomy-and-Post-Composer.md | One to five passing mentions each; substance unaffected. `README.md`'s two mentions are its own index-table titles for Docs 02 and 03 — will self-correct once those two are renamed. |

---

## 4. Clean — no Bubble reference at all

30 of the 74 `.md` files never mention Bubble and need no action on this axis: this includes all of Docs 33 (glossary), most of the 40s series (Community/customization), the currency Supabase doc, the DevStudio-Supabase addendum, Doc 47 (deal-state leak fix), Doc 54, and the pricing/UX research reports not tied to a specific backend.

---

## 5. Not yet scanned by machine — PDF/DOCX/PPTX sources

`Executive_Summary.pdf`, the three pitch decks (`InvestScape-Pitch-Hire/Angel/VC.pptx`), `InvestScape-Pitch-Playbook.docx`, and `Excerpts_From_MVP_Readiness_C-Level_Audit...docx` could not be full-text extracted in this pass — the copies mounted for direct file access were placeholder stubs rather than the underlying binaries. **Doc 52 §4 already flagged `Executive_Summary.pdf` specifically** ("Switch Data Source... migrate historical data to your new database" — describes a migration Route 2 no longer requires) as outdated but unedited, since it's a source file Doc 52 couldn't touch directly. The same likely applies to the strategy reports' Route 2 sections. **Recommendation:** re-run this inventory's method against those files directly the next time they're opened for an unrelated reason, since they can be read via the project's search tool even though they resisted bulk extraction here.

---

## Recommended repair order

1. **`02-Bubble-Database-Schema.md`** — rewrite as the Supabase-native base schema, matching the style already established by its own Addendum A. Everything downstream cites this file's field names.
2. **`02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md`** — same treatment, smaller scope, and it unblocks a clean read of Doc 50's already-correct finding.
3. **`03-Bubble-Build-Checklist.md`** — rewrite as a WeWeb + Supabase + calc-engine build sequence. This is the biggest single lift on the list but also the most-cited parent document.
4. **Docs 03 Addenda A and B, Doc 01, Doc 05, Doc 11** — Tier 1 stragglers; each is a contained, single-topic fix once Docs 02 and 03 exist in their new form to reference.
5. **Tier 2 sweep** — mostly phrase-level edits; batchable in one pass since none of them require re-deriving logic.
6. **Retire or clearly mark superseded:** `15-Currency-Multi-Jurisdiction-Schema.md` (original, pre-Supabase) once you confirm nothing still cites it over its Supabase sibling.
7. **Re-open the PDF/docx/pptx sources** (§5) with the same method once they're next opened for another reason.

---

*End of Doc 55 · Read-only inventory per Docs 17/53 convention · Covers: 74 `.md` files by direct scan; PDF/docx/pptx flagged but not scanned · Depends on: Docs 12, 52, 53 for what "already corrected" means · Feeds: repair work on Docs 01, 02, 02B, 03, 03A, 03B, 05, 11*
