# InvestScape — Import, Export & Storage Architecture (Doc 10)

**Companion to Doc 02 (Schema), Doc 02 Addendum A (Development Studio), Doc 03 (Build Checklist) and its Addendum B (ApexCharts Wiring), Doc 05 (Claude API Prompt Template), and Doc 08 (Pricing & Packaging).** This document locks in three decisions: where AI-populated import launches, how file storage is scoped, and four export packages (one already named, three new) on top of the existing tiers. It also issues one correction to Doc 02 Addendum A — flagged explicitly in §2, not left to coexist silently.

**Stage numbering note:** stages below are prefixed `I` (Import) and `S` (Storage) to avoid collision with Doc 03's numeric STAGE 1–10 and Doc 03 Addendum B's `E` (chart) stages. They're a separate sequence, not a continuation.

---

## 0. Governing principle — read this before building anything below

Every other AI surface in this platform interprets; it never computes. Doc 05's system prompt is explicit that the engine computes and AI narrates from a payload it cannot alter — and that line is doing real work in your Angel and VC decks as the answer to "isn't this investment advice?"

Import is the first feature where AI output could plausibly reach a field the formula engine reads. That means it's the first feature that could quietly break that promise if built carelessly. The rule for everything below:

> **AI extraction always writes to a draft/staging record first. A human explicitly confirms before anything reaches a live `DevProject`, `BudgetLine`, `UnitSale`, `Parcel`, `Property`, or `DealInputs` record. No exceptions, and no "confidence is high enough to skip review" shortcut later.**

This is what keeps "the engine computes, AI never touches the math" true in the sentence you'd actually say to an investor — AI drafts data entry, the user owns and approves every number, the engine still computes all of it.

---

## 1. New option sets

| Option Set | Options | Notes |
|---|---|---|
| `ImportBatchStatus` | Pending Review, Confirmed, Discarded | drives the review screen and the confirm workflow |
| `ImportSourceType` | Draw Report, Full Proforma, CSV Bulk | which Stage build (§3) produced this batch |
| `StorageProvider` | Google Drive, Dropbox | extendable later (OneDrive, Box) without touching existing rows |

## 2. New data types

### `ImportBatch` (belongs to DevProject or Deal — the draft layer)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link, optional) | set for Dev Studio imports |
| Deal | Deal | (link, optional) | set for Deal Analyzer imports |
| SourceType | ImportSourceType | — | |
| SourceFileRef | ProjectFileRef | (link) | never a raw file field — see below |
| ExtractedJSON | text | — | AI's draft output; same frozen-blob pattern as `Scenario.SnapshotJSON` — never live-referenced |
| Status | ImportBatchStatus | Pending Review | |
| ConfidenceFlags | text | — | comma-separated field names the model flagged as low-confidence, surfaced as a highlight on the review screen — don't let the model silently guess on an ambiguous field |
| ReviewedBy | User | (link) | who confirmed or discarded |
| ReviewedDate | date | — | |

### `ProjectFileRef` (belongs to DevProject or Deal)
| Field | Type | Default | Notes |
|---|---|---|---|
| DevProject | DevProject | (link, optional) | |
| Deal | Deal | (link, optional) | |
| Provider | StorageProvider | — | |
| ConnectedStorageAccount | ConnectedStorageAccount | (link) | whose connection this file was picked through |
| ExternalFileID | text | — | Drive fileId or Dropbox path |
| ExternalViewLink | text | — | this is what every "Open" button points to now |
| FileName | text | — | cached at pick-time, so the file row can render without a live API call |
| FileSizeBytes | number | — | cached, same reason |
| AIReadStatus | text | Not Read | "AI-ingested" / "Ingestion failed" / "Stored only" — matches the pills already in the Files tab mockup |

### `ConnectedStorageAccount` (belongs to User)
| Field | Type | Default | Notes |
|---|---|---|---|
| User | User | (link) | |
| Provider | StorageProvider | — | |
| AccountLabel | text | — | e.g. the connected email — needed once a user has both providers connected |
| ConnectedDate | date | — | |
| IsActive | yes/no | yes | set false on disconnect; don't delete the row, existing `ProjectFileRef` rows still need it for display |

*OAuth tokens live in Bubble's API Connector credential storage (OAuth2 User-Agent Flow), never as a plain-text field on this or any data type.*

**Correction to Doc 02 Addendum A §2:** that document's line — *"Reuse existing, no new type needed: file repository..."* — assumed InvestScape-hosted file storage. It's superseded by `ProjectFileRef` above. The Files-tab UI already mocked up (Deal Analyzer's "Deal Files," Dev Studio's Files tab) doesn't change visually — same file rows, same AI-read pills, same dropzone copy — but "Open" and "Download" now deep-link to the file's Drive/Dropbox location instead of serving a Bubble-hosted copy. Bubble's native `file` field type is not used for user-uploaded deal documents anywhere in the platform going forward.

---

## 3. Import — three stages, build in this order

Same "simplest first, validate the pattern" sequencing as the ApexCharts stages in Doc 03 Addendum B.

### Stage I1 — Draw Report → Actuals (build first)
Already anticipated in the Dev Studio Files mockup copy ("Draw reports feed Actuals"). Smallest possible version of the review-and-confirm pattern — one document, one small field group (`BudgetLine.ActualToDate` per line).

1. User picks a file via their connected Drive/Dropbox (Stage S1 must exist first). This alone only creates a `ProjectFileRef` with `AIReadStatus = Not Read` — picking a file is not the same action as importing it, and shouldn't be. Automatically running extraction on every attached PDF would waste Claude API calls on files that were never meant to be extracted (an appraisal, an IM, a geotech report) and quietly violates §0's "no automatic shortcut" rule by treating attachment as implicit consent to extract.
2. A distinct, explicit per-file action — shown only on eligible file types (PDF/XLS/DOCX, not images) — is what actually triggers extraction. Something like a small "Extract Data" action on the file row, separate from the existing automatic narrative-only reading (the "✓ read by AI — 2 units below market" pattern already in the mockup, which stays automatic since it never touches a field). Clicking it is what sends the file to the Claude API and creates the `ImportBatch`.
3. Backend workflow sends file content + a Draw-Report-specific extraction prompt to the Claude API. Output: JSON matching the `ActualToDate` shape, written to a new `ImportBatch` (SourceType = Draw Report).
4. Review screen: BudgetLine rows, current Actual vs. extracted Actual side by side, each editable, with a link out to `ExternalViewLink` to check the source PDF.
5. "Confirm Import" writes the (possibly edited) values to the real `BudgetLine` rows, sets `ImportBatch.Status = Confirmed`.

**Re-extraction is allowed and creates a new `ImportBatch` — it never reopens or overwrites the old one.** A file can legitimately get reissued (a corrected Draw Report #4, a v2 of a proforma), and the file row's action should reflect that rather than treating "already imported" as a dead end. Once a file has at least one `Confirmed` `ImportBatch`, its row action relabels from "Extract Data" to "Re-extract" — same trigger, but clicking it starts a fresh extraction pass and a new `ImportBatch` row, leaving the previously-confirmed `BudgetLine` values untouched until the new pass is also confirmed. This is the same §0 principle applied to a second pass: nothing live changes until a human confirms again, no matter how many times a file gets re-run.

The file row should also surface `ImportBatch.ReviewedDate` once one exists — this field already existed in §2, it just wasn't specified as something the UI displays. It's a different date than the file's own upload/source date (which stays as-is on the row's meta line) — one says when the document arrived, the other says when someone last confirmed data from it.

This proves the whole pattern — provider file pick, extraction, review, confirm — on the smallest possible surface before Stage I3 generalizes it.

### Stage I2 — CSV bulk-import (Portfolio / Deal Analyzer)
No AI needed — this is Bubble's native CSV path, not an extraction problem.

1. Publish a downloadable CSV template whose header row matches `Property` + `DealInputs` field names exactly. Bubble's built-in "Upload Data to CSV" workflow action requires exact header matches to auto-map, and free/personal-plan row caps are real — don't undersell this as unlimited on Free tier.

**Correction — this glossed over a real constraint the first time around:** "Upload Data to CSV" creates records of *one* data type per action. It can't natively fan one row out into a linked `Property` + `DealInputs` + `DealMetrics` + `Deal`. The fix is a staging type, same shape as `ImportBatch` — draft first, real records only after processing:

### New data type: `BulkImportRow` (belongs to User — flat, matches the CSV template exactly)
| Field | Type | Notes |
|---|---|---|
| *(all 32 columns from the CSV template)* | matching type per field | same names as `Property`/`DealInputs` for a clean 1:1 map later |
| ImportStatus | text | Pending / Processed / Failed |
| ErrorNote | text | why a row failed, powers the partial-result summary |
| BatchTag | text | a generated ID shared by every row from one upload, so the front end can track this batch's progress specifically |

**Retention: kept, not deleted, for now.** `Processed` and `Failed` rows stay after the batch finishes — a lightweight audit trail of what was actually in a given upload, useful if a number looks wrong weeks later and someone wants to check the source data without having to ask the user to re-upload the same file. Nothing downstream depends on them surviving, so this is a "for now" default, not a locked decision — revisit if row volume ever makes it worth pruning, but that's a real problem to have, not a v1 concern.

2. Front end: File Uploader → "Upload Data to CSV," pointed at `BulkImportRow` — not `Property`. Since every column lives flat on one type, this is exactly what Bubble's native tool is built for.
3. Kick off processing: "Schedule API Workflow on a List," over `Search for BulkImportRows where Creator = Current User and BatchTag = [this batch] and ImportStatus = Pending` — one backend workflow instance per row.
4. The backend workflow (`process-bulk-import-row`) per row: validate required fields (Address, PurchasePrice, MonthlyRent at minimum) — if missing, set `ImportStatus = Failed` with an `ErrorNote` and stop. If valid: Create `Property` → Create `DealInputs` → Create empty `DealMetrics` → Create `Deal` linking all three (same shape as the Stage 6 wizard's submit workflow) → set `ImportStatus = Processed` → schedule `calc-deal-metrics` on the new Deal immediately, rather than waiting for the whole batch to finish.
5. Front end: since scheduled backend workflows run asynchronously, the page doesn't automatically know when a batch is done. A "Do every 2 seconds" custom event, checking `Search for BulkImportRows where BatchTag = [this batch], :count` of `Processed` + `Failed` against the total, is what drives the modal's "12 of 12 imported" / "10 of 12 imported — 2 had issues" result state already built in the mockup — stop the repeating event once every row has resolved one way or the other.
4. If exact-header-matching proves too rigid in beta feedback, a column-mapping layer (a couple of third-party tools plug into Bubble's Data API for exactly this) is the upgrade path — don't build custom mapping UI yourself for v1.

**Gate: Pro+.** Free tier's realistic user has one property; bulk import solves a Pro-tier problem.

### Stage I3 — Full Dev Studio extraction (BudgetLine / UnitSale / Parcel)
The generalized version of Stage I1, and the one that needs the most care.

1. User picks a proforma file (Excel or PDF) via their connected Drive/Dropbox.
2. Backend workflow sends file content to the Claude API with an extraction-specific system prompt — **a new prompt, separate from Doc 05's narrative prompt, already written: see Doc 14.** Don't reuse or extend the narrative prompt for this. Extraction and narration are different jobs with different failure modes; conflating them risks the narrative prompt's "never invent data" discipline getting diluted by extraction instructions, or extraction inheriting narration's softer, hedged tone when it should be returning strict typed JSON.
3. Output: JSON shaped to `Parcel` / `TenureComponent` / `UnitSale` / `BudgetLine` fields, written to `ImportBatch.ExtractedJSON`. Ambiguous fields (e.g. a budget line that could be Hard or Soft) go in `ConfidenceFlags` rather than getting silently guessed.
4. Review screen — this is the real build effort, and it needs more structure than Stage I1's flat table, since the extraction output spans four tables of very different scale (one `Parcel` object vs. potentially 50+ `BudgetLine`s and 75+ `UnitSale`s — 796 Main Street's own dissection has exactly that many of each).

**Tabbed, matching a subset of the Full Model's own tabs** — not all ten, just the three that actually receive extracted data:
- **Land & Site tab** → `Parcel` review. Single record, same field-by-field editable layout as Stage I1's table, just one row's worth of fields instead of several.
- **Revenue tab** → `TenureComponent` + `UnitSale` review.
- **Budget tab** → `BudgetLine` review.

**Large arrays default to a rollup, not row-by-row** — this isn't a shortcut around reviewing, it's what makes reviewing 50+ lines actually feasible instead of technically-required-but-practically-skipped. Doc 07 §5.3 already established a normalization convention for exactly this (unit rolls condensed to UnitType / Count / AvgSizeSF / AvgSalesPrice elsewhere in the product) — the review screen reuses it: `UnitSale` defaults to that rollup with an "show individual suites" expand; `BudgetLine` defaults to grouped-by-Group-and-Subgroup with a subtotal per group, expandable to individual lines.

**Confidence flags get their own navigation, not just inline color.** A "5 fields need review" counter, persistent above the tab strip (not per-tab, since a user on Land & Site needs to know Budget has flags waiting too) with a "Next" jump control cycling through all five in sequence, wrapping back to the first after the last. Jumping to a flag that's behind a collapsed section — Revenue's individual-suite expand, Budget's two-level Group/Subgroup expand — auto-opens whatever's collapsed around it, not just a scroll to a spot that isn't visible yet. This is a navigation aid, not a resolved/unresolved tracker — it doesn't decrement as flags get viewed, since that would need its own new piece of state this document hasn't specified and isn't needed for what the counter is actually for.

**Resolved: one Confirm across all three tabs, plus a per-tab "reviewed" checkmark that's purely cosmetic.** The checkmark is session state only — not a new field on `ImportBatch`, nothing persisted, reset if the screen is reopened later. It exists to answer the feeling of "I'm done with this part," not to gate anything: "Confirm Import" writes everything to live records regardless of which tabs are checked off, the same non-blocking philosophy as everywhere else in this document. This gets the reassurance of visible progress without any of per-tab-confirm's real costs — no change to `ImportBatch.Status` staying a single field, no change to how the ribbon badge or Dashboard banner count pending imports, and no risk of an Overview or Returns tab reading half-real numbers mid-review, since nothing is real until the one Confirm at the end.
5. "Confirm Import" writes to the real `Parcel` / `TenureComponent` / `UnitSale` / `BudgetLine` records — same single-writer principle as every other create workflow in the schema.

**Gate: Enterprise** (Development Studio already is — no new gating decision needed).

**Do not build:** blueprint, floor-plan, or photo data extraction. Nothing in the schema is derived from an image. Keep photos and drawings as `ProjectFileRef` rows with `AIReadStatus = Stored only`, exactly as the current mockup already treats the site-photo file.

### 3.4 — Pending-import awareness (resolves the blocking-vs-dismissible question)

**Decided: dismissible, not blocking.** A user can leave a review mid-way with nothing lost — the architecture already guarantees this without new schema. `ImportBatch` rows are created server-side the moment extraction completes, before the user ever reaches the review screen, and `SourceFileRef` points at a file that never left the user's own Drive/Dropbox in the first place. There's no "the system loses the file" failure mode to design around — the file was never in a browser tab to begin with. What's needed is purely a *surfacing* problem: making sure the user notices an abandoned `ImportBatch` exists, since the data being safe doesn't help if nobody remembers it's there.

Two pieces, no new data types:

- **Ribbon badge (global, persistent).** A small count badge near the avatar/notification area, top-right of the ribbon — same reusable element that already appears on every page, so this is one build, everywhere. Live query: `Search ImportBatch where Creator = Current User and Status = Pending Review, :count`. Zero pending → badge doesn't render. This is the ambient version — visible but not interruptive.
- **Dashboard resume banner (once per return).** When a user with pending batches lands on Dashboard, a banner: *"You have [N] import(s) awaiting review — your file is safe, nothing is lost."* Two actions: **Continue Review** (opens the oldest pending `ImportBatch`) and **Discard** (sets `Status = Discarded`, no confirmation dialog needed since nothing was written to a live record yet — discarding an unconfirmed draft is inherently low-stakes). This is the active version — surfaces once on return rather than nagging on every navigation.

The reassurance copy ("your file is safe, nothing is lost") is deliberate, not filler — it answers the concern directly even though the concern was never actually a risk given how the architecture works.

### 3.5 — Which pipeline does "Extract Data" actually trigger?

This wasn't a real question until just now — Stage I1 (Draw Report → Actuals) and Stage I3 (Full Proforma → four tables) share one button, "Extract Data," and nothing has ever specified which of the two it should run for a given file. Testing Stage I3 exposed the gap: Claude Design picked an IM file and routed it to the full-proforma flow with no stated rule for why that file and not another, or why that pipeline and not Draw Report extraction.

**Resolution: route on `DevProject.Stage`, not on the file itself.** A Draw Report is structurally a construction-phase document — it only exists because there's an active `LoanFacility` with draws being tracked, which only happens once a project is actually under construction. A full proforma extraction is what happens when a project is being set up in the first place, before there's a budget baseline to compare actuals against. So:
- `DevProject.Stage` = Concept, Feasibility, or Financing → "Extract Data" runs Stage I3 (Full Proforma).
- `DevProject.Stage` = Construction → "Extract Data" runs Stage I1 (Draw Report → Actuals).
- `DevProject.Stage` = Sellout/Stabilized → **Full Proforma (confirmed, not just a placeholder default).** There's no ongoing draw activity left at this stage — draws fund construction progress payments, and construction is already finished by the time a project reaches Sellout/Stabilized. What actually shows up here is closer to a final reconciliation: an as-built cost true-up against the original Development Budget, or a stabilized operating proforma for a rental component's real achieved rents and expenses. Both are whole-project restatements, the same shape as Full Proforma extraction, not an incremental single-field update like a draw report.

This reuses a field that already governs other parts of the product instead of inventing new per-file logic or asking the user to choose every time. The edge case it doesn't cleanly cover — a Construction-stage project wanting to re-run a full proforma extraction, not just log a draw report's actuals — isn't worth solving now; if it comes up, an explicit two-option menu on the button is the fallback, not a v1 requirement.

---

## 4. Storage — Google Drive / Dropbox connect (Stage S1, build before Stage I1)

No native file storage. `ProjectFileRef` rows are references, not blobs.

**Connect flow:**
1. Settings page: "Connect Google Drive" / "Connect Dropbox" → OAuth2 User-Agent Flow via the API Connector — same general shape as the existing Anthropic API connector setup (Doc 05 §1): a cloud console project, an OAuth Client ID, an authorized redirect URI pointing at your Bubble app. Prebuilt marketplace plugins exist for both providers if you'd rather not hand-roll the OAuth dance.
2. On success, create a `ConnectedStorageAccount` row.
3. Every dropzone across the platform (Deal Files, Dev Studio Files tab) opens that provider's file picker instead of a native upload dialog. Picking a file creates a `ProjectFileRef` — the file itself never leaves the user's own Drive or Dropbox.

**What this changes about the existing Files tab mockup:** visually, nothing — same rows, same pills, same dropzone copy. Mechanically, "Open" deep-links out instead of serving a Bubble-hosted file, and "Download all" as a zip bundle goes away — redundant once every file already lives in storage you don't own.

**Why this instead of the originally-floated 10GB–1TB+ tiered ladder:** the ladder is buildable — Cloudflare R2 makes raw storage cost trivial — but it commits you to backup, versioning, and recovery expectations, and a support surface, before a single user has hit a limit worth solving. Connect-your-own-Drive gets the "my docs live with my deal" workflow benefit immediately, at a fraction of the engineering cost, with the compliance footprint of *reading* a file transiently for extraction rather than *storing* it as a system of record. Revisit native storage only if usage data shows real demand for it (e.g. users without any Drive/Dropbox account, or explicitly wanting InvestScape as the canonical copy) — don't pre-build the ladder for that now.

**Privacy note — this extends an existing item, it doesn't add a new one:** requesting Drive/Dropbox read-scope OAuth, and transmitting file content to the Claude API for extraction, are new data flows worth naming explicitly to the privacy/SaaS lawyer among the four pre-launch legal consultations already on your list.

---

## 5. Export — four packages, existing tiers, two additions

Two additions to what's already built, unchanged in gating logic:

- **Multi-project / portfolio export** (every deal or every DevProject at once, not one at a time) — Pro+ for Deal Analyzer/Portfolio, Enterprise for Development Studio's project set. Reuses the existing Pro/Enterprise export gate; scope growth on a permission that already exists, not a new one.
- **Archived, read-only deals stay exportable** after a Pro→Free downgrade. Less a new feature than a correctness fix: the downgrade rule already promises data is never deleted, only made read-only — a user who can't export their own read-only data has a broken version of that promise. Confirm the export button isn't hidden by whatever condition currently hides the edit controls on downgraded deals.

No new export *formats*, and no bespoke third-party integrations pre-launch — CSV/Excel already covers the "move this elsewhere" case completely. What follows instead is four concrete **packages** — "lender package" was already a named Enterprise line item with no defined contents; the other three give it, and two real needs, actual shape.

**On mechanism — print vs. PDF isn't really a choice you have to make.** Build one well-formatted, print-styled report page per package below (a `@media print` stylesheet is enough; Bubble has no strong native PDF generator, and the plugin ecosystem for one is real but a v1-unnecessary cost). The browser's native print dialog gives both outcomes for free — "Print" sends it to a physical printer, "Save as PDF" is a destination in that same dialog on every modern OS and browser. You don't need to build two things. A dedicated PDF plugin (DocuPotion is built specifically for Bubble and can render any page — including one the current viewer wouldn't otherwise see — as a paginated PDF with running headers and proper page breaks) is worth adding later specifically for the "full branded report pack," where cover pages and pixel-perfect pagination earn their keep. Don't reach for that plugin for v1; the print-stylesheet path covers every package below.

### 5.1 Investor Statement (existing — Free/Pro/Enterprise, as already built)
One-page summary (Free) up to the full statement PDF (Pro+). No change.

### 5.2 Lender Package (existing Enterprise line item — now defined)
**Audience:** your construction/development lender. Also covers CMHC-insured multi-unit deals (MLI Select and similar) — those route through a CMHC-*approved* lender, not directly to CMHC, so mechanically it's still a lender submission. Worth knowing: MLI Select specifically also requires an energy-modeling attestation from an NRCan-certified advisor and affordability/accessibility commitment documentation — pieces InvestScape doesn't generate and shouldn't try to. Those show up as separate `ProjectFileRef` attachments the developer adds alongside the package, not fields this platform computes.

**Contents:** more than "export the proforma." A real lender package is an assembled bundle — cover page, the computed proforma (budget, sources & uses, returns), supporting schedules (unit mix, breakeven, sensitivity), *plus* whichever `ProjectFileRef` attachments the user chooses to include (appraisal, geotech, IM). Build the picker as a checklist over the project's existing Files tab — "include in package" per file — rather than a separate upload step.

**Format:** print-styled PDF, per the mechanism note above.

**Gate:** Enterprise (unchanged).

### 5.3 Investor / LP Package (new)
**Audience:** equity partners and LPs — a real, distinct audience your schema already models. `WaterfallSpec` / `WaterfallTier` exist specifically to compute LP/GP splits; nobody's been able to export the thing that structure was built for.

**Contents:** narrower than the lender package on cost detail (an LP generally cares less about individual hard-cost line items than a construction lender does), wider on returns detail — the waterfall itself, IRR/ROE by tier, equity multiple, the capital stack. Skip `BudgetLine`-level granularity by default; surface `WaterfallTier` output and headline returns instead.

**Format:** same print-styled mechanism as 5.2.

**Gate:** Enterprise, same as the rest of Dev Studio.

### 5.4 Statistical Summary — planning / development-application submission (new)
**Audience:** the municipality — planning department, for a development permit, rezoning, or building permit application. A fundamentally different counterparty than a lender: the city isn't extending credit, it's a regulator (and, in CAC-negotiation contexts, effectively a counterparty negotiating against your margin). That changes what belongs in this package.

**Contents — non-financial by default, and this matters:** `Parcel` already carries exactly what a planning department's "Project Statistics" exhibit typically asks for — LotSizeSF, Zoning, FSRMultiplier, BuildableSF — plus `TenureComponent`'s unit counts and mix. None of it requires a dollar figure, and no new schema is needed; this package is a *view* on data you already capture. Your own 796 Main Street budget data has a literal `Community Amenity Contribution Charges` line — CACs get negotiated against a city's read of a project's financial viability, so a default export that hands the city your full margin picture works against you in exactly the scenario where this package gets used most. Keep `BudgetLine` and `WaterfallTier` data out of it by default. If a specific rezoning process genuinely calls for a viability disclosure — some CAC negotiations do — that's a deliberate, case-by-case choice the developer makes, not something a default export button should decide for them.

**Format:** same print-styled mechanism as 5.2 — though some municipalities want their own form filled in a specific layout rather than "any PDF with the right numbers." Not a v1 problem; if it comes up, the `MunicipalFeeSchedule` / `TaxBracketTable` pattern (admin-editable, jurisdiction-scoped, effective-dated) is the right shape to copy for a per-jurisdiction template later. One jurisdiction doesn't justify building that yet.

**Gate:** Enterprise, since it's sourced from Dev Studio's `Parcel` / `TenureComponent`.

### Not a new package: cost consultants, accountants
Third-party consultants who already show up as `BudgetLine` items in your own source data — cost consultants reviewing the initial budget or checking draws, accountants doing year-end reconciliation — are already served by the existing Pro+/Enterprise Excel/CSV export. A Budget-vs-Actual view is a filter on data that's already exportable, not a new package.

---

## 6. Claude Design build sequencing

Same discipline as the Development Studio drilldown: a dedicated file, not another addendum pass on top of `investscape-v2-unified.html`. Suggested: `investscape-import-export-drilldown.html`, built and reviewed in this order:

1. **Stage S1** (Drive/Dropbox connect) **+ Stage I1** (Draw Report → Actuals review screen) — smallest, proves the whole pattern end to end. Detailed brief in §6.1.
2. **Stage I2** (CSV bulk-import) — no AI, mostly a template-download-and-upload flow, low design risk.
3. **Stage I3** (full proforma extraction review screen) — the big one; do it last, once the Stage I1 review-screen pattern is proven and just needs generalizing to more fields.
4. **§5.2–5.4 export packages** — moderate effort; can fold into whichever pass has room, but not before Stage I1 exists, since the Lender Package's file-picker (§5.2) assumes `ProjectFileRef` is already wired.

### 6.1 — The immediate next pass, in detail (Stage S1 + I1)

**Upload to Claude Design:** `investscape-devstudio-drilldown-1.html` (it owns the Files tab you're extending) and this document. Don't upload `investscape-v2-unified.html` or `investscape-ecosystem.html` for this pass — neither owns the Files tab, and per your own README's caution about Claude Design absorbing two competing versions of a screen, handing it shells that only loosely touch the surface you're editing risks it blending in conventions from screens you're not asking it to touch.

**What to ask for — five pieces:**

1. **Settings → Connected Accounts.** New ground — none of the existing mockups have a Settings frame yet. "Connect Google Drive" / "Connect Dropbox" buttons; connected state shows the account email and a Disconnect action. Keep it minimal — two buttons and a status row is enough for this pass.
2. **Files tab, provider-picker state.** Take the existing Dev Studio Files tab frame and change the dropzone's behavior: instead of a generic upload target, it opens a provider file-picker modal (whichever of Drive/Dropbox is connected, both if both are). The file-row list barely changes visually; "Open" now reads as an external-link affordance — a small icon swap is enough signal, don't over-design it.
3. **Draw Report review screen — the new one.** Two-column layout: left column (~40% width) a document preview panel showing a placeholder PDF page; right column (~60%) a table titled "Draw Report #4 — Review Extracted Actuals" with columns Budget Line / Current Actual / Extracted Actual (editable) / Flag. Low-confidence rows get a subtle visual flag, not a blocking error state. A single "Confirm Import" button at the bottom — no blocking state, per §3.4 this screen is dismissible.
4. **Files tab, post-import state.** The Draw Report row shows an "Actuals imported ✓" pill with a timestamp — this pill already exists in the current mockup for Draw Report #4; just confirm it still reads correctly now that "Open" behaves differently.
5. **Ribbon badge + Dashboard resume banner (§3.4).** The global ribbon gets a small count badge near the avatar, top-right. Dashboard gets a banner state: "You have 1 import awaiting review — your file is safe, nothing is lost," with Continue Review / Discard actions.

The full paste-ready prompt for all five is in `claude-design-brief-import-review-pass.md` (companion to this document — a prompt is a tool input, not documentation, so it's kept separate rather than embedded here).

**A prompt you can paste directly into Claude Design** for all five pieces above lives in the companion file — see `claude-design-brief-import-review-pass.md`. It carries the same "do not create new data types" discipline you already use in Bubble AI prompts (Doc 03), so the visual mockup doesn't invent field names that drift from what §2 of this document specifies.

---

## 7. Open items — resolved

- ~~Blocking vs. dismissible review~~ — **Resolved: dismissible.** See §3.4 — ribbon badge + Dashboard resume banner, no blocking state needed.
- ~~Free tier import~~ — **Resolved.** Bulk import (Stage I2) and Dev Studio extraction (Stage I1/I3) stay Pro+/Enterprise as scoped — a single free property doesn't benefit from bulk anything. Free tier's "taste" of AI reading a file is already covered by the existing narrative-only Deal Files reading (unrelated to `ImportBatch` — it never touches a field, so it was never gated by this document's principle in §0 and needs no new decision).
- ~~Verified Pro badge affecting import provenance~~ — **Superseded.** The badge concept itself is being reworked (see conversation — the word "Verified" implies platform vetting that doesn't happen, and the fix under discussion is a contribution/reputation badge decoupled from any professional-credential claim). Once that's settled, whether import provenance shows anywhere in Community becomes moot either way — a frozen `DealSnapshot` doesn't currently carry an `ImportBatch` reference and doesn't need one added on the strength of a badge that may not exist in its current form. **This decision doesn't live in Doc 10** — it's a Community/onboarding question, not Import/Export/Storage. Worth its own record once confirmed; flagging here only so it isn't lost.

Two new items surfaced by §5, still open:

---

*End of Doc 10 · Parent documents: 02 (Schema), 02 Addendum A (Development Studio), 03 (Build Checklist), 03 Addendum B (ApexCharts Wiring), 05 (Claude API Prompt Template), 08 (Pricing & Packaging) · Companion: 09 (UX Stress-Test Audit)*
