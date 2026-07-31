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
