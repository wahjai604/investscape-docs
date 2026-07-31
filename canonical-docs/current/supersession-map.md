# Bubble → Supabase/WeWeb Supersession Map — Tier 1 Batch

**Purpose:** one commit at the end of Tier 1, not one per file. This table is what gets handed to Claude Code when the batch is ready — old filename, new filename, and what to do with the old one.

**Convention:** the new file is a full rewrite, not a diff. It supersedes the old file entirely. "Retire" means delete from active reference (keep in git history, obviously); "keep" means the old file still has independent value and should stay alongside the new one.

| # | Old file (repo, stale) | New file (rewrite) | Action on old file | Status |
|---|---|---|---|---|
| 1 | `02-Bubble-Database-Schema.md` | `02-Database-Schema-Supabase.md` | Retire | ✅ Done |
| 2 | `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md` | `02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md` | Retire | ✅ Done |
| 3 | `03-Bubble-Build-Checklist.md` | `03-Build-Checklist-WeWeb-Supabase.md` | Retire | ✅ Done |
| 4 | `03-Bubble-Build-Checklist-Addendum-A-TaxBracketTable.md` | `03-Build-Checklist-Addendum-A-TaxBracketTable-Supabase.md` | Retire | ✅ Done |
| 5 | `03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md` | `03-Build-Checklist-Addendum-B-ChartWiring-WeWeb.md` | Retire | ✅ Done — ⚠️ carries one open decision, see note below |
| 6 | `01-Formula-Engine-Specification.md` | `01-Formula-Engine-Specification-Supabase.md` | Retire | ✅ Done — ⚠️ major finding, see note below |
| 7 | `05-Claude-API-Narrative-Prompt-Template.md` | `05-Claude-API-Narrative-Prompt-Template-Supabase.md` | Retire | ✅ Done — build status unaudited, see note below |
| 8 | `11-Notification-System-Design.md` | `11-Notification-System-Design-Supabase.md` | Retire | ✅ Done — Tier 1 complete |

**Not in this batch — already correct, no action needed** (per Doc 55 §1):- `02-Database-Schema-Addendum-A-DevStudio-Supabase.md` — already the Supabase-native version, filed correctly
- `12-Pre-Port-Advisory-Review.md` + `52-Route2-Simplification-Post-Pivot.md` — read as a pair, both current
- `53-WeWeb-Supabase-Integration-Audit.md` — current
- `InvestScape_on_Bubble...Research_Report.md` — correctly historical, no fix needed
- `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` — already current (note: its predecessor `15-Currency-Multi-Jurisdiction-Schema.md` is Tier 2, not Tier 1 — separate small pass)

**Tier 2 (phrase-level, batchable separately, not tracked row-by-row here)** — see Doc 55 §3 for the full list. Recommend a second, smaller supersession map once Tier 1 is committed, since Tier 2 files mostly don't need a new filename at all — likely in-place edits to the existing file rather than a superseding rewrite.

---

## Note on row 7 — build status is honestly "unaudited," not "confirmed absent"

`05-Claude-API-Narrative-Prompt-Template-Supabase.md` carries the same prompt content as the original, byte-for-byte identical on the trade-secret system prompt text — verified directly, not assumed. What's different is the framing of its build status: **Doc 54's audit never examined the narrative layer at all** — its scope was eight calc-engine files (mortgage, portfolio, cash-flow, returns, capital-stack, qualifying, CMHC) plus the missing HTTP layer. So this document doesn't claim the narrative call is "absent" the way Doc 01 could confidently say the grade rubric (E20) is absent — it says the calling mechanism is *unaudited*, and separately notes that Doc 54 did confirm no HTTP endpoints exist yet for anything in the calc engine, which means whatever the state of this prompt's code, nothing can currently call it from WeWeb regardless. Also flagged: this document's example output references a deal grade, but Doc 01 already established that no grading engine exists in either implementation yet — so wiring this up before the grade exists means a deliberate placeholder decision, not an oversight to discover later.

## Note on row 6 — this one surfaced a bigger finding than a word-swap, now partially resolved

While rewriting `01-Formula-Engine-Specification.md`, cross-checking it against `54-Engine-Reconciliation-ClaudeDesign-vs-CalcEngine.md` surfaced something more important than platform language: a real TypeScript calc-engine repository already exists (`investscape-calc-engine`, private GitHub, 6 build sessions, 33 tests), but per Doc 54's original audit it implemented only 5 of the 25 engines this specification describes, one of those 5 (`portfolio.ts`'s blended IRR) returned a mathematically incorrect result, and only one formula in the entire spec (the mortgage payment calculation) was both built and independently verified against an outside authority.

**Update:** the `portfolio.ts` blended-IRR defect has since been fixed and independently re-verified — not just reported fixed by Claude Code, but re-derived from scratch. Every property's individual IRR, the pooled cash flow series, the true pooled portfolio IRR (14.997%), and the naive weighted-average IRR it's compared against (15.537%) were reconstructed from the raw test inputs and confirmed to match, using an independent calculation rather than trusting the test suite's own report. This closes step 1 of Doc 54's recommended sequencing (§8). Step 2 (re-deriving the remaining regression-test files — `qualifying.ts`, `cashflow.ts`, `returns.ts`, `capitalstack.ts` — against external references) remains open, and 19 of the 25 engines Doc 54 catalogued are still absent from TypeScript regardless of this fix. Doc 01's new §0 reflects this precisely — the E11 fix is called out separately from the Part A/B/C status table, since portfolio rollup sits outside this document's own per-deal formula scope.

If Claude Code is pointed at Doc 01 to build against, §0 is still load-bearing for everything except the E11 note — most of the specification remains a target to build toward, not a description of what currently runs.

## Note on row 5 — one thing Claude Code should NOT treat as settled

`03-Build-Checklist-Addendum-B-ChartWiring-WeWeb.md` documents chart wiring, but per Doc 53 §5 it explicitly does **not** resolve which of two mechanisms WeWeb should use to embed ApexCharts (a custom HTML/JS embed vs. a custom Vue component). That decision needs a real build spike, not another documentation pass. If Claude Code is asked to implement Development Studio or Portfolio charts, flag this open question rather than picking a mechanism silently.

---

## Note on row 8 — the discipline point is the actual deliverable here

`11-Notification-System-Design-Supabase.md` verified, exhaustively, that every child relationship the old document's manual cascade-delete list named by hand (`Property → Deal(s) → DealInputs/DealMetrics → PortfolioSnapshot`, `DevProject → Parcel/TenureComponent/UnitSale/BudgetLine/LoanFacility→DrawMonth/WaterfallSpec→WaterfallDeduction/WaterfallTier/Scenario`) is genuinely covered by `ON DELETE CASCADE` across Docs 02, 02-Addendum-A, and 02-Addendum-B — checked table-by-table, not assumed from Doc 53's summary. That entire manual-steps section is now obsolete, which is real good news.

But per Doc 53 §1, the upgrade removes a safety habit the old tedium provided for free: Bubble's step-by-step deletion workflow made it hard to *accidentally* skip writing the `DeletionLog` receipt before deleting. A database-level cascade has no concept of that ordering. The rewrite closes this with a hard rule, not a suggestion: hard delete is only ever performed through a `SECURITY DEFINER` Postgres function (`delete_property_permanently` and siblings) that writes the receipt first, and the client role gets **no DELETE grant at all** on `properties`, `deals`, or `dev_projects` — so a raw delete isn't just discouraged, it's impossible for anything except the vetted function to perform. If Claude Code implements deletion for any of these tables, this is the one constraint worth checking wasn't quietly bypassed.

One design refinement surfaced during the rewrite that the original never had reason to consider: `deletion_log.user_id` is deliberately a plain column, not a cascading foreign key to `auth.users` — because a user's own deletion history is exactly the kind of record that should survive even if their account is later deleted, and Bubble never had an automatic cascade that could have swept it away by accident in the first place.

---

## All eight Tier 1 files complete — ready for the single batch commit

## Commit message draft (fill in once all rows are ✅)```
Rewrite core schema and build docs for WeWeb + Supabase stack

Supersedes Bubble-era Docs 01, 02, 02-Addendum-B, 03, 03-Addendum-A,
03-Addendum-B, 05, 11 per the pivot documented in Docs 12/52/53 and
inventoried in Doc 55. No changes to underlying data model, formulas,
or UX decisions — mechanical re-derivation onto Postgres/WeWeb only.

See 55-Bubble-Reference-Inventory.md for full audit and remaining
Tier 2 (phrase-level) cleanup still pending.
```

---
*Living document — updated after each Tier 1 file is completed. Final version handed off with the full batch.*
