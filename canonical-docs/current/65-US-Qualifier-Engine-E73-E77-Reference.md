# InvestScape — Doc 65: US Qualifier Engine (E73–E77) Reference

**Lighthouse Research Ltd. · 15 August 2026**
**No companion proposal doc.** Same pattern as Doc 64: E73–E77 were built directly from a modular build prompt (itself grounded in Doc 59's US Qualifier Research Brief), not from a prior gap-analysis pass. This doc registers the E-numbers that build actually claimed, verified against the pushed source — not copied from the prompt that requested the work.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E73–E77):** `a642bd530743304e1b77a0e2ba55df9de1fedd10` (`a642bd5`), branch `master`. Confirmed identical to `origin/master` at time of writing.

Every export listed below was verified with `grep -n "^export "` against the actual file at that commit.

## 1. Numbering convention

Same rule as Doc 63 §1 and Doc 64 §1: one E-number per cohesive file, not per exported function — E73 has three exported functions, E74 and E75 each have two, E76 has two, under their respective single E-numbers.

Types-only support files are not numbered, consistent with `investscape-calc-engine`'s usual per-file `.types.ts` pattern: `src/types/E73-us-qualifying.types.ts` through `E77-qualifying-rental-income-us.types.ts` are support files.

**E-number correction, noted for the record:** the source master spec document originally drafted this engine family as "E68+". By the time it was built, E68–E72 had already been claimed same-night by two other builds (Doc 64: E68–E70 in `investscape-tax-engine`, E71–E72 in `investscape-calc-engine`). The build was renumbered to **E73** before any code was written — verified as genuinely free at that time by checking this repo's own highest existing number (E72) and Doc 64's registration, the same "verified next-free, not assumed" discipline as every prior doc in this sequence. E73 continues directly from E72 — append-only per Doc 56 R1.

This doc's own number was independently re-verified via the real Doc 56 R6 pre-commit collision check immediately before writing it (see §3 below) — `65` was confirmed the first available slot, with `origin/master` re-pulled first to rule out a same-night collision with another session.

## 2. E73–E77

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E73 | `investscape-calc-engine` | `src/E73-us-qualifying.ts` | US mortgage qualifying — DTI stress tiers (manual/compensating/automated), conforming loan limit flag | `calculateUSDTITier`, `checkConformingLoanLimit`, `qualifyForUSMortgage` |
| E74 | `investscape-calc-engine` | `src/E74-fha-mip.ts` | FHA Mortgage Insurance Premium — upfront + term×LTV×conforming-limit-surcharge annual rate, 11-year removal eligibility | `calculateFHAAnnualMIPRate`, `calculateFHAMIP` |
| E75 | `investscape-calc-engine` | `src/E75-conventional-pmi.ts` | Conventional PMI — LTV+credit-score-driven rate, real $0 below 80% LTV | `calculatePMIRate`, `calculateConventionalPMI` |
| E76 | `investscape-calc-engine` | `src/E76-dscr-loan-sizing.ts` | Loan-convention DSCR (gross rent ÷ PITIA) — deliberately distinct in every name from E9's commercial DSCR (NOI ÷ annual debt service) | `calculateLoanConventionDSCR`, `evaluateLoanConventionDSCR` |
| E77 | `investscape-calc-engine` | `src/E77-qualifying-rental-income-us.ts` | Fannie Mae 75% qualifying-rental-income rule — lease-based path only, refuses to compute without a signed lease | `calculateQualifyingRentalIncomeUS` |

Sourced conventions, defaults, and citations for these five engines — including which figures are directly cited vs. composed/derived — live in `investscape-calc-engine/docs/US-QUALIFIER-SOURCES.md`, not duplicated here.

## 3. Doc 56 R6 collision check (this doc's own numbering)

```bash
$ git pull origin master   # re-pulled first, to rule out a same-night collision
Already up to date.
$ ls *.md | grep -E "^[0-9]" | grep -viE "addendum" | sed 's/^\([0-9]*[a-c]\?\)-.*/\1/' | sort | uniq -d
(no output — clean)
```
Highest existing document at time of writing: `64`. No duplicate root numbers found. `65` claimed for this doc.

## 4. Not registered behind `investscape-api`

As of commit `a642bd5`, `investscape-api` has not been modified to expose any of E73–E77 — see Doc 66 (Engine-to-Repo Map) for the current cross-repo picture, and the same-night follow-up prompt for dormant route scaffolding covering this gap.

*End of Doc 65 · Companions: none (see §0)*
