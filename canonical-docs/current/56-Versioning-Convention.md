# InvestScape — Doc 56 Addendum A: Document Numbering, Collision & Supersession Rules

**Lighthouse Research Ltd. · 1 August 2026**
**Addendum to `56-Versioning-Convention.md`. Strictly additive — no existing convention in the parent document is altered.**

Raised by: Eric, on finding `55-Bubble-Reference-Inventory.md` and `55-Master-ToDo-Triage-Execution-Plan.md` both present locally and in GitHub.

**This is issued as an addendum rather than a new numbered document deliberately** — a document about the numbering problem should not consume a number to exist.

---

## 0. Summary

| # | Finding | Severity |
|---|---|---|
| 1 | **Doc 55 collision** — two different documents share the number | Confirmed. Fix in §2 |
| 2 | **The Doc 28 fix caused it** — this is the second collision, produced by the first repair | Root cause. Rules in §3 |
| 3 | **A second, different problem: supersession pairs** — Docs 15 and 02-Addendum-A each have two live files under one number | Confirmed. Different fix, §5 |
| 4 | **The Claude project folder is a stale, partial mirror of GitHub** | Confirmed. Consequences in §4 |

Items 3 and 4 were not part of the original question and are the more consequential of the four.

---

## 1. What happened, and why it was predictable

The Doc 28 collision (External Data Source Registry vs. Master To-Do Triage Execution Plan) was resolved on 31 July by renumbering the triage plan **28 → 55**, and correcting its three inbound references in Docs 41, 46 and 48.

On 1 August, a new **Bubble Reference Inventory** was created and assigned **55** — because the number was picked by counting from the highest doc *believed* to be in use, and the 28 → 55 renumber had not been recorded anywhere that the next assignment would consult.

**The root cause is not carelessness. It is that document numbers are assigned from memory of the sequence rather than from a registry.** Both collisions have that identical shape. Without a rule change there will be a third, and the most likely trigger is precisely the same one: another renumber that lands somewhere nobody looks.

---

## 2. Resolution of the Doc 55 collision

### Decision

| Number | Document | Action |
|---|---|---|
| **55** | Master To-Do Triage Execution Plan | **Keeps 55.** No change |
| **61** | Bubble Reference Inventory | **Renumber 55 → 61** |
| 56, 57, 58, 59, 60 | unchanged | No change |

### Why the triage plan keeps the number

Not seniority — inbound references.

The triage plan carries at least three known inbound cross-references, in Docs **41, 46 and 48**, each citing its lettered prompts (`Prompt J (Doc 28)`, `Prompt K (Doc 28)`, `Prompt S (Doc 28)`). Those three were already rewritten once, from 28 to 55. Renumbering it again means editing the same three references a **third** time, and each edit is a chance to introduce an error in a document nobody is otherwise touching.

The Bubble Reference Inventory is one day old. Nothing has been written since it was created that could cite it, so its inbound reference count is almost certainly zero.

The rule this expresses, generalised in §3: **when two documents collide, the one that moves is the one with fewer inbound references — not the one created later.** Those usually coincide. When they do not, references win.

### Why 61 and not a gap

The mirror shows no documents at **07, 08, 31, 32, 34, 35, 37, 38, 40, 45**. It is tempting to slot the inventory into one.

**Do not.** A retired number is not a free number. A cross-reference written months ago to "Doc 45" does not error when 45 is reused — it silently points at an unrelated document, and nothing detects it. That is strictly worse than a gap, because a gap is visible and a mis-point is not.

Note also that several of those gaps are probably **not** retired at all — 07 and 08 in particular are likely present in GitHub and merely missing from the stale mirror (see §4). Establish which gaps are genuinely retired before treating any of them as anything.

**Rule: numbering is append-only. Gaps stay gaps, permanently.**

### One question back

Is the Bubble Reference Inventory a **living registry** or a **consumed checklist**? If it is a punch-list of remaining Bubble references to be migrated post-pivot, it closes when the last item clears — in which case it should be **archived on completion rather than renumbered now**, and the collision resolves itself at zero cost. Renumber only if it is intended to persist.

### Commands

Run in `C:\Users\Eric\investscape-docs\canonical-docs\current\`. `git mv` preserves file history; a delete-and-recreate does not.

```bash
git mv 55-Bubble-Reference-Inventory.md 61-Bubble-Reference-Inventory.md

# Update the doc's own internal self-references (title line, footer)
# — open 61-Bubble-Reference-Inventory.md and change "Doc 55" to "Doc 61"

# Confirm nothing else pointed at it as 55:
grep -rn "Doc 55\|Doc-55\|55-Bubble" . --include=*.md

# Every remaining hit should be the Master To-Do Triage Plan. If any hit
# refers to the inventory, fix it in the same commit.

git add -A
git commit -m "Resolve Doc 55 collision: Bubble Reference Inventory renumbered 55 -> 61

Master To-Do Triage Execution Plan retains 55 (three inbound refs in
Docs 41/46/48, already migrated once from 28). Numbering is append-only
per Doc 56 Addendum A; retired numbers are never reused."
```

---

## 3. Rules to prevent a third collision

**R1 · Append-only.** New documents take `highest_existing + 1`. Never a gap, never a retired number, no exceptions.

**R2 · The registry is the source of truth, not memory.** A single `REGISTRY.md` at the root of `canonical-docs/`, one line per document. **Updated in the same commit that creates or renumbers a document** — not afterwards, or it drifts and becomes another thing to reconcile.

**R3 · Renumbering is a three-part operation, always done in one commit.** (a) `git mv` the file; (b) fix the document's own internal self-references; (c) fix every inbound reference. The Doc 55 collision happened because (b) and (c) were done and the registry was not.

**R4 · On collision, the document with fewer inbound references moves.**

**R5 · Addenda extend, they do not consume.** `NN-Addendum-X` is correct. This document is an instance.

**R6 · Pre-commit check.** Run before any commit that adds a document:

```bash
ls *.md | grep -E "^[0-9]" | grep -viE "addendum" \
  | sed 's/^\([0-9]*[a-c]\?\)-.*/\1/' | sort | uniq -d
```

Any output is a collision. Empty output is clean. This exact command found both live collisions in seconds.

**R7 · A `superseded/` subdirectory.** Retired versions move there, they do not sit alongside current ones. See §5.

### Registry format

```markdown
# InvestScape Canonical Document Registry
Append-only. Retired numbers are never reused. Doc 56 Addendum A.

| # | Document | Status | Superseded by |
|---|---|---|---|
| 15 | Currency & Multi-Jurisdiction Schema (Supabase) | Current | — |
| 15 | Currency & Multi-Jurisdiction Schema (Bubble) | **Superseded** | 15-Supabase |
| 28 | External Data Source Registry | Current | — |
| 45 | — | **Never assigned** | — |
| 55 | Master To-Do Triage Execution Plan | Current — was Doc 28 | — |
| 61 | Bubble Reference Inventory | Current — was Doc 55 | — |
```

Generate the first draft from the real working copy rather than from the stale mirror:

```bash
cd C:\Users\Eric\investscape-docs\canonical-docs\current
ls *.md | sort -V | awk -F'-' '{n=$1; $1=""; sub(/\.md$/,""); gsub(/-/," "); printf "| %s |%s | Current | — |\n", n, $0}'
```

Then hand-correct the superseded and renumbered rows — those cannot be inferred from filenames.

---

## 4. The stale mirror — the finding with the widest consequences

The Claude project folder is **not** a current copy of `investscape-docs`. Confirmed by two independent signals:

1. It still contains **both** Doc 28 files, so it predates the 31 July renumber. Docs 41, 46 and 48 in the mirror still cite `Doc 28`, not the corrected `Doc 55`.
2. The Tier 1 migration rewrote eight documents (01, 02, 02-Addendum-B, 03, 03-Addendum-A, 03-Addendum-B, 05, 11) under new filenames. Only **two** Supabase-suffixed files are present. The rest appear under their original Bubble-era filenames.

**Consequence: every audit run against the project folder is provisional until re-run against the working copy.** That specifically includes the F-701 finding in Doc 58 §2, which has been downgraded from "verified by inspection" to "provisional, pending re-verification" in the updated Doc 58 accompanying this addendum. The finding may well hold. It has not been established against the real source.

**Action: re-upload the current `canonical-docs/current/` contents to the Claude project, replacing what is there.** Until that happens, treat doc-set audits as indicative rather than conclusive — which defeats most of their purpose.

---

## 5. The second problem: supersession pairs are not collisions

Two documents in the mirror have **two live files under one number**, where the newer explicitly retires the older:

| Number | Current | Superseded, still present |
|---|---|---|
| 15 | `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` — *"Supersedes the Bubble-based version of Doc 15"* | `15-Currency-Multi-Jurisdiction-Schema.md` |
| 02-Add-A | `02-Database-Schema-Addendum-A-DevStudio-Supabase.md` — *"Supersedes `02-Bubble-Database-Schema-Addendum-A-Development-Studio`"* | `02-Bubble-Database-Schema-Addendum-A-Development-Studio.md` |

**These must not be renumbered.** They are the same document at two versions, which is correct behaviour. The defect is only that the retired version is still sitting in the current directory, where a search hits both and nothing marks which is live except a sentence in the header.

The risk is concrete and matches a known failure mode: a search for the currency schema returns the Bubble version, which specifies Bubble mechanics that no longer apply post-pivot — and a build proceeds against a superseded spec. That is display-layer-ahead-of-calculation-layer drift wearing different clothes.

**Fix:**

```bash
mkdir -p ../superseded
git mv 15-Currency-Multi-Jurisdiction-Schema.md ../superseded/
git mv 02-Bubble-Database-Schema-Addendum-A-Development-Studio.md ../superseded/
```

**Then check the other six.** If the Tier 1 migration rewrote eight documents under new filenames, six more retired originals may still be sitting in `current/`. The mirror cannot answer this; the working copy can:

```bash
grep -riE "supersed|replaces the|rewritten" --include=*.md . | grep -i "doc"
```

Every hit names a document that should have a retired twin in `superseded/`. Any twin still in `current/` is the same latent defect.

---

## 6. Checklist

| # | Action | Where | Blocking |
|---|---|---|---|
| 1 | Confirm whether the Bubble Reference Inventory persists or gets archived on completion | Eric | Decides #2 |
| 2 | `git mv` 55 → 61, fix self-references, verify no inbound refs | working copy | — |
| 3 | Create `REGISTRY.md`, hand-correct superseded/renumbered rows | working copy | — |
| 4 | Move the two known superseded files to `superseded/` | working copy | — |
| 5 | Run the supersession grep; move any of the other six found | working copy | — |
| 6 | Re-upload `canonical-docs/current/` to the Claude project | Eric | **Yes** — blocks reliable auditing |
| 7 | Re-run the F-701 grep against the working copy; update Doc 58 §2 with the real result | working copy | Blocks GAP US-2 |
| 8 | Adopt R1–R7 in the parent Doc 56 | Doc 56 | — |

Items 6 and 7 are the ones that matter. The rest is filing.

---

*End of Doc 56 · v1.0 · Parent: 56-Versioning-Convention.md · Companions: Docs 58, 59, 60*
