# InvestScape — Doc 66: Engine-to-Repo Map

**Lighthouse Research Ltd. · 15 August 2026**
**No companion proposal doc.** This doc exists to resolve a real point of confusion: GitHub hosts 6 code/doc repositories, but there are now 7 logical "engine" families (E-number blocks), because engines stopped mapping 1:1 to repos the moment Market Intelligence got its own dedicated repo, while every engine family built since (US Tax Strategies, Syndication Waterfall, US Qualifier) intentionally folded into an existing domain repo instead — per the standing architecture decision to keep 4 domain repos and not spin up a new repo per engine.

## 1. The map

Every row below was verified directly against each repo's real files (`ls src/E*.ts` or equivalent), not transcribed from a prior doc or prompt — see §2 for the verification detail per repo.

| # | Engine | E-numbers | Repo |
|---|---|---|---|
| 1 | Calc Engine (core) | E1–E28 | `investscape-calc-engine` |
| 2 | Economic Engine | E29–E45 | `investscape-economic-engine` |
| 3 | Tax Engine | E46–E53 | `investscape-tax-engine` |
| 4 | Market Intelligence Engine | E54–E67 | `investscape-market-intelligence-engine` |
| 5 | US Tax Strategies | E68–E70 | `investscape-tax-engine` |
| 6 | Syndication Waterfall | E71–E72 | `investscape-calc-engine` |
| 7 | US Qualifier Engine | E73–E77 | `investscape-calc-engine` |
| 8 | Financing & Deal Quality | E78–E82 | `investscape-calc-engine` |
| 9 | E9 Extensions (Cap Rate, Cash-on-Cash) | E9+ | `investscape-calc-engine` |

**Repos group by functional domain, not by engine.** An engine family can span multiple E-number blocks within the same repo (`investscape-calc-engine` alone houses three separate families: #1, #6, #7), and a repo can house multiple engine families that were never contiguous with each other (`investscape-tax-engine` houses #3 and #5, split by the #4 block that landed in between on the flat cross-repo sequence). Contiguity in the E-number sequence does **not** imply contiguity in repo — see #4 sitting between #3 and #5 despite living in a third repo entirely.

**This doc is the single source of truth for "which repo has which engine" going forward.** `REGISTRY.md` and future docs should link here rather than re-deriving the mapping from scratch each time.

## 2. Verification detail

- **Row 1 (E1–E28):** `investscape-calc-engine/src/E{1..28}-*.ts` all present; no gaps, no numbers above 28 until row 6.
- **Row 2 (E29–E45):** `investscape-economic-engine/src/E{29..45}-*.ts` all present.
- **Row 3 (E46–E53):** `investscape-tax-engine/src/E{46..53}-*.ts` all present.
- **Row 4 (E54–E67):** `investscape-market-intelligence-engine` does not use the flat `src/E{n}-*.ts` file-naming convention the other three repos use — its files are organized under `src/statistical-risk/` and `src/market-intelligence/` by topic, with the E-number-to-file mapping documented explicitly in Doc 63 §2 (verified there against commit `4c945f2`, re-confirmed current here).
- **Row 5 (E68–E70):** `investscape-tax-engine/src/E{68,69,70}-*.ts`, verified in Doc 64 §2 against commit `3886a9c`.
- **Row 6 (E71–E72):** `investscape-calc-engine/src/E{71,72}-*.ts`, verified in Doc 64 §2 against commit `502ff78`.
- **Row 7 (E73–E77):** `investscape-calc-engine/src/E{73..77}-*.ts`, verified in Doc 65 §2 against commit `a642bd5`.
- **Row 8 (E78–E82):** `investscape-calc-engine/src/E{78..82}-*.ts`, verified in Doc 67–71 §2 against Batch F completion (2026-08-20).
- **Row 9 (E9 Extensions):** `calculateCapRate()` and `calculateCashOnCash()` added to `investscape-calc-engine/src/E9-dscr.ts` (Batch F completion); not separately numbered as they extend existing E9 rather than constitute a new engine.

## 3. Doc 56 R6 collision check (this doc's own numbering)

```bash
$ git pull origin master   # re-pulled first
Already up to date.
$ ls *.md | grep -E "^[0-9]" | grep -viE "addendum" | sed 's/^\([0-9]*[a-c]\?\)-.*/\1/' | sort | uniq -d
(no output — clean)
```
Highest existing document immediately before this one was written: `65` (Doc 65, same night). No duplicate root numbers found. `66` claimed for this doc — confirmed sequential, not assumed, since Doc 65 landed minutes earlier in the same working session.

*End of Doc 66 · Companions: none*
