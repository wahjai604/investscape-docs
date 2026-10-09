# Current-status index — 2026-10-02

The original July backup inventory below is retained as historical evidence, not the current repository count. [Doc 78](canonical-docs/current/78-Phase2-Native-Migration-and-SaaS-Checkpoint.md) records current migration/infrastructure status with explicit verification labels. The registry now includes existing Docs 67–73 and new Doc 78; no numbers were reused. Doc 79 records the Market Intel map read contract, storage/service boundaries, identified existing product-schema migration lineage, and remaining access/workload readiness gates (2026-10-08). Doc 80 adds the four-geography pilot layer/source registry, WeWeb interaction specification, file-level backend proposal, acceptance matrix and launch-gate ledger (2026-10-08); its planning sample is data-templates/market-intel-map-pilot-registry-planning-2026-10-08.json. Doc 79 now includes the sequential readiness/auth worksheet and the recorded owner answers. Docs 53/73 have dated reconciliation notes without rewriting historical findings. README scope/count language is reconciled. Doc 81 adds the read-only gate evidence and conditional logical catalog/access model (2026-10-09), with separate 2024 U.S. boundary planning/qualification artifacts. Doc 82 records the signed-in Data API evidence, exact ACS CC0 link and bounded Dev integration scope, with a standalone offline policy reference and 30 passing synthetic policy tests (2026-10-08 local / 2026-10-09 UTC). Its dated follow-up records the owner-approved manual membership policy and an isolated, unmounted API review candidate: 36 new passing tests; full offline suite 542 passed, 2 skipped, 0 failed, with typecheck/build passing. The next source checkpoint implements the internal manual approval/audit store and private UI catalog reader, with draft DDL exercised only in embedded Postgres: 28 new tests pass; full suite 570 passed, 2 skipped, 0 failed, with typecheck/build passing. The subsequent pilot HTTP/admin checkpoint adds manifest and pinned independent layer APIs plus a manual approval component: 15 new Node tests and 28 rendered browser assertions pass; full suite 585 passed, 2 skipped, 0 failed, with typecheck/build passing. Its code and four synthetic screenshots remain on the isolated API review branch. No live schema, authentication, deployment or release changes belong to this documentation slice.

The Oct 9 Dev provisioning/wiring review is now complete in Doc 82 §10 and the isolated API review package: fresh non-secret platform metadata, separate owner/pool proposals, locally checked read-only metadata SQL, mount-order and WeWeb host-adapter requirements, ordered acceptance gates and unresolved owner statements. No live provisioning or wiring occurred; source-only default-off composition/adapter preparation is next.

The Oct 9 source implementation now completes Doc 82 §11's default-off API composition and packaged WeWeb session/approval wrapper: 20 added Node tests; full suite 605 passed / 2 existing skips, typecheck/build passing; 34 actual Vue browser assertions and 28 standalone UI assertions passed. Two new synthetic screenshots accompany the isolated API review branch. Startup binds no map pools; no live provisioning, appointment, Auth change, deployment, WeWeb component upload/page edit/publication or activation occurred.

The Oct 9 Dev verification now completes Doc 82 §12's bounded catalog metadata and concrete scoped provisioning review package: the private schema and six proposed roles are absent; explicit owner/disabled runtime roles, independent map ledger, candidate hashes and permission assertions are prepared. Six new package tests and 24 existing store tests pass together (30), with typecheck. Upstream legacy session accessors are pinned, while installed-build/effective Auth/origin bindings and the empty Railway patch remain unresolved. Read-only SQL ran; no live mutation, credential binding, appointment, deployment, WeWeb installation or activation occurred.

Doc 82 §13 records the owner's Oct 9 approval of the unchanged disabled-create package, conditional on recovery evidence. Fresh read-only Dev metadata remains consistent. The available recovery point is still unknown: the Supabase connector has no backup-list tool, and a bounded dashboard inspection requires browser-fallback permission. No DDL, backup operation, credential binding, deployment or activation was attempted; no unchanged tests were rerun.

Doc 82 §14 closes the concrete recovery-reference gap from the owner's screenshots: scheduled PHYSICAL backup at 2026-10-09 11:16:52 UTC / 04:16:52 Vancouver, listed with Restore; PITR not enabled. This is visually inspected reported screenshot evidence, not a live backup API verification or restore rehearsal. Fresh Dev metadata still has no map schema/role collisions. Owner approval is retained, SQL bytes unchanged, and the expressly read-only inspection made no database, backup, credential, deployment or activation changes.

Doc 82 §15 records the owner-authorized disabled Dev create on Oct 9 at 15:17:48 UTC / 08:17:48 Vancouver: nine owned forced-RLS tables, six NOLOGIN roles, independent map ledger and tool migration history; fixed managed PostgreSQL 17 effective permissions and empty-store counts passed. Applied receipt and permission evidence are saved on the isolated API review branch. The provisioning phase is complete; installed legacy/Auth/origin verification and scoped wiring remain next. No runtime credentials, real appointments, API deployment, WeWeb publication or map activation occurred. Earlier not-applied paragraphs are retained as dated history.

Doc 82 §16 records sequential Auth/origin verification and blocked Dev wiring preparation: fresh WeWeb connection metadata and Railway exact staging API domain/deployed commit/1-of-1 running topology, with installed legacy/effective Auth/signing/rendered-origin facts still unknown and WeWeb follow-up reads unavailable. Source-only existing-client bridge adds 11 synthetic tests; final full suite 624 total / 622 passed / 2 existing skips, typecheck/build passing. Wiring defaults remain off/null and no database/platform configuration, credentials, appointment, deployment, WeWeb publication or map activation occurred.

Doc 82 §17 records the owner-approved read-only UI follow-up: WeWeb confirms the installed legacy Supabase Auth plugin and configured Investscape-Dev target; Publications shows no publications yet. Installed release/accessor, rendered app origin and active signing algorithm remain unknown. Supabase dashboard sign-in selected ChatGPT; automatic approval review blocked the separate OpenAI authentication destination. Evidence is saved, wiring stays disabled, and no source/runtime/database/platform configuration, deployment or activation changed.


Doc 82 §18 records verified signed-in Supabase access after owner-approved/completed ChatGPT sign-in. Current signing metadata is ECC (P-256), documented ES256, matching the source verifier algorithm allowlist; legacy HS256 is listed as previous. Installed WeWeb build/accessor, app origin and real-session acceptance remain unknown. A dashboard/connector health discrepancy is retained without endpoint probes. Wiring remains disabled; no configuration, database, deployment or activation changed.


---

# InvestScape Docs Backup — Manifest

**Generated:** 31 July 2026, as part of Doc 54 Step 3 (second private GitHub repo for docs/prototype).
**This is a read-only inventory pass — report-only convention per Doc 17. Nothing was silently fixed or renamed; four issues are flagged below for Eric's decision.**

---

## Folder structure

```
investscape-docs-backup/
├── MANIFEST.md                          ← this file
├── README-ORIGINAL-STALE.md             ← the project's existing README, unedited (see Flag 4)
├── canonical-docs/
│   ├── current/                         ← 57 files — the numbered Doc 01–54 registry
│   └── superseded/                      ← 2 files — Bubble-era versions explicitly replaced by a Supabase rewrite
├── research-reports/                    ← 15 files — strategy/research reports, not part of the numbered registry
├── html-prototypes/
│   ├── current/                         ← 4 files — the active Claude Design prototype set
│   └── retired/                         ← 2 files — superseded per the 15 July consolidation pass
└── data-templates/                      ← 2 files — CSV import templates
```

**Total: 82 files** (57 + 2 + 15 + 4 + 2 + 2, plus this manifest and the stale README).

---

## Flag 1 — RESOLVED: "Doc 28" collision renumbered

**Decision (31 July 2026):** `28-External-Data-Source-Registry.md` keeps the Doc 28 designation. `28-Master-ToDo-Triage-Execution-Plan.md` is renumbered to **Doc 55** and renamed `55-Master-ToDo-Triage-Execution-Plan.md`.

**Cross-reference audit performed before closing this out.** Every "Doc 28" mention across the doc set was checked individually to determine which of the two documents it actually meant:

| File | Meant | Action |
|---|---|---|
| `12-Pre-Port-Advisory-Review-Addendum-A-Hosting-Deployment-Model.md` | External Data Source Registry (CMHC/StatCan/CREA data, §10 legal agenda) | None — already correct |
| `29-Market-News-Neighbourhood-Intel-Prompts.md` | External Data Source Registry (municipal data, NewsAPI licensing, §10 flags) | None — already correct |
| `41-Chart-Values-Persistent-Labels.md` | Master To-Do Triage Plan ("Prompt J") | **Fixed** — now cites Doc 55 |
| `46-Country-Filter-Fix-Verification.md` | Master To-Do Triage Plan ("Prompt K") | **Fixed** — now cites Doc 55 |
| `48-Library-Card-Detail-Prompt-S-Updated.md` | Master To-Do Triage Plan ("Prompt S") | **Fixed** — now cites Doc 55 |
| `55-Master-ToDo-Triage-Execution-Plan.md` (its own opening + closing self-reference) | Itself | **Fixed** — both updated to Doc 55, with a note explaining the renumbering |

**The tell** that distinguished the two groups: the Master To-Do Triage Plan sequenced its work as lettered "Prompts" (H through S) — any "Doc 28" reference alongside a Prompt letter meant the triage plan, not the data registry.

**Left unchanged, on purpose:** two lines inside Doc 55 itself (near line 13 and line 272) say things like "refreshed... through Doc 28" — these describe the historical fact that the doc set went up to number 28 at the time that sentence was written. That's accurate period detail, not a broken cross-reference, so it was left alone rather than rewritten into anachronism.

## Flag 2 — Bubble/Supabase pairs are correctly superseded, not duplicated

```
canonical-docs/superseded/02-Bubble-Database-Schema-Addendum-A-Development-Studio.md
canonical-docs/current/02-Database-Schema-Addendum-A-DevStudio-Supabase.md
    → this file's own header states: "Supersedes 02-Bubble-Database-Schema-Addendum-A-Development-Studio.md"

canonical-docs/superseded/15-Currency-Multi-Jurisdiction-Schema.md
canonical-docs/current/15-Currency-Multi-Jurisdiction-Schema-Supabase.md
    → this file's own header states: "Supersedes the Bubble-based version of Doc 15"
```

These were sorted into `current/` vs `superseded/` based on each newer file's own explicit self-declaration — nothing was inferred or guessed. Both are retained since the Bubble versions still have historical/reference value, but the Supabase versions are the ones to build from.

## Flag 3 — Doc 02's *base* schema may be missing a Supabase revision

`52-Route2-Simplification-Post-Pivot.md` refers to **"Doc 02's Supabase revision"** as though it already exists — but only the original Bubble-native `02-Bubble-Database-Schema.md` was found in the project. Its Development Studio *addendum* (Flag 2, above) got rewritten for Supabase; the base schema apparently didn't, or that file exists somewhere not currently uploaded to this project. **Worth confirming before it's needed for the WeWeb + Supabase rebuild** — if it doesn't exist yet, that's a real gap, not just a missing upload.

## Flag 4 — The project README is stale

`README-ORIGINAL-STALE.md` (kept in this backup unedited) is dated 16 July 2026 and describes "25 files" and "Docs 01 through 16" — the project has since grown to 57 numbered files through Doc 54. The README's own closing note already anticipates this ("this is a point-in-time snapshot... re-download for a current copy"). **Not rewritten here** — that's a content decision for Eric, not a packaging one — but it should not be relied on as an accurate index going forward.

---

## What was NOT included in this backup

The following project files were left out because they're source reference materials (spreadsheets, PDFs, pitch decks, scanned proformas) rather than canonical documentation or active prototypes — they can be added to a `reference-materials/` folder later if you want them version-controlled too:

- All `.xlsx` / `.xls` files (CAP Rate Worksheet, Mortgage templates, 796 Main Street analysis, etc.)
- All `.pdf` files (Executive Summary, competitive analysis, pitch playbook, appraisal manual, etc.)
- All `.pptx` / `.docx` pitch deck and Word files
- `33FinancialTerminologyGlossary.pdf` (the PDF export of `33-Financial-Terminology-Glossary.md`, which *is* included)

---

*End of manifest. Next step per Doc 54 Step 3: unzip this into a local folder, `git init`, create a private GitHub repo, and push — same process already used for `investscape-calc-engine`.*


Doc 82 §19 records one installed, manually invoked Dev session-capability diagnostic: public getSession/auth events, stable read, cleanup and exact editor origin verified; result NO_SESSION, so ordinary app-member compatibility remains pending. Supabase current health metadata now agrees. Installed release and hosted app origin remain unexposed; ten focused synthetic tests passed. No publication, database mutation, deployment or map activation occurred.

Doc 82 §20 records the owner's approved existing Dev app member sign-in and one unchanged diagnostic rerun: CAPABILITIES_CONFIRMED, explicitly non-anonymous/unexpired session, stable client/read and subscription cleanup. Full host/JWT/API acceptance and exact hosted/candidate origins remain pending. No account creation, publication, deployment, map activation or configuration/schema change occurred.

Doc 82 §21 records the concrete Dev map wiring review: 14 catalog permission assertions pass; six roles remain NOLOGIN, nine private tables retain forced RLS and inspected shared paths are denied. A new isolated Railway map project is proposed; current source lacks a dedicated map entrypoint/scoped pool constructor. Hosted origin, runtime TLS/JWT/connection and private admin acceptance remain pending. Old empty Railway patch discrepancy persists in status/health; no live mutation/deployment/publication/activation occurred.

Doc 83 records Research source commit d8ca45071781a06a8aecd8686ad16f391d112b01: private catalog/store proposal, manual stage/inspect/approve/publish/withdraw, independent default-off read/editor API and WeWeb browsing component. Final checks: 638 passed, 2 existing skips; 20 synthetic Vue browser checks. Approved catalog empty; source rights, live storage/access/host bindings and publication remain pending. Live map testing is owner-deferred. No live mutation/deployment/activation/publication occurred.

Doc 84 records Research source/permissions and bounded Dev wiring review at API commit f937880170fb1fb500290d7e1fd4a675b53523b4: eight review-only candidates, free/paid/downgraded member policy without billing gate, fresh scoped schema/role absence and isolated Dev storage/host proposal. Known-day display fixed; 640 tests passed, two existing skips, 21 synthetic browser checks. Manual rights approval, live access/origins/recovery/connections remain pending. No live mutation/deployment/publication/activation occurred.
