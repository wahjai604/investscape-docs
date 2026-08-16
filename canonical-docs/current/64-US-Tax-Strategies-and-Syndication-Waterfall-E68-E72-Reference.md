# InvestScape — Doc 64: US Tax Strategies & Syndication Waterfall (E68–E72) Reference

**Lighthouse Research Ltd. · 15 August 2026**
**No companion proposal doc.** Unlike Doc 63 (proposed against Doc 62), E68–E72 were built directly from two same-night modular prompts, not from a prior gap-analysis pass. This doc's role is the same as Doc 63's: register the E-numbers these two commits actually claimed, verified against the pushed source.

## 0. Source verified

Two repositories, two commits, both confirmed present on `origin/master` at time of writing (`git rev-parse origin/master HEAD` returned identical hashes in both repos).

**Repository 1:** https://github.com/wahjai604/investscape-tax-engine
**Commit documented (E68–E70):** `3886a9cdd6e3f81c295185890b383d24b590d08a` (`3886a9c`), branch `master`.

**Repository 2:** https://github.com/wahjai604/investscape-calc-engine
**Commit documented (E71–E72):** `502ff7891a3adced386b087f485654cd715d1b68` (`502ff78`), branch `master`.

Every export listed below was verified with `grep -n "^export "` against the actual file at the commit above — not copied from the modular prompt that requested the work.

## 1. Numbering convention

Same rule as Doc 63 §1: one E-number per cohesive file, not per exported function — E72 has two exported functions (`calculateGrossedUpCatchUpTarget`, `calculateGPCatchUpForPeriod`) under a single E-number, same as several of E54–E67's rows.

Types-only support files are not numbered, consistent with the existing convention: `investscape-tax-engine/src/taxTypes.ts` (shared across E46–E53 and now E68–E70 too) and `investscape-calc-engine/src/types/E71-syndication-waterfall.types.ts` / `E72-gp-catchup.types.ts` (that repo's usual per-file `.types.ts` pattern) are all support files, not separately numbered.

E68 continues directly from E67 (the last Market Intelligence Engine number, Doc 63) — append-only per Doc 56 R1, verified clean via the Doc 56 R6 pre-commit collision check before this doc was written (see Doc 56 §3).

**This is the first doc in the sequence to span two repositories at once.** E68–E70 landed in `investscape-tax-engine` (extending its existing E46–E53 numbering) and E71–E72 landed in `investscape-calc-engine` (extending its existing E1–E28 numbering) — both drawing from the same flat, cross-repo E-number sequence. The table below adds a Repo column for that reason; Doc 63's single-repo table didn't need one.

## 2. E68–E72

| E# | Repo | File | Capability | Key exports |
|---|---|---|---|---|
| E68 | `investscape-tax-engine` | `src/E68-section-1031-exchange.ts` | Section 1031 Like-Kind Exchange (US only) | `section1031Exchange` |
| E69 | `investscape-tax-engine` | `src/E69-cost-segregation.ts` | Cost Segregation (US only) | `costSegregation` |
| E70 | `investscape-tax-engine` | `src/E70-opportunity-zones.ts` | Opportunity Zones — legacy (OZ 1.0) and permanent (OZ 2.0) regimes, both explicit (US only) | `opportunityZones` |
| E71 | `investscape-calc-engine` | `src/E71-syndication-waterfall.ts` | Syndication (LP/GP) Distribution Waterfall — American/deal-by-deal only | `calculateSyndicationWaterfall` |
| E72 | `investscape-calc-engine` | `src/E72-gp-catchup.ts` | GP Catch-Up — isolated grossed-up formula (highest-bug-risk provision in the domain) | `calculateGrossedUpCatchUpTarget`, `calculateGPCatchUpForPeriod` |

Sourced conventions, defaults, and citations for these five engines live in each repo's own docs, not duplicated here: `investscape-tax-engine/docs/US-TAX-STRATEGIES-SOURCES.md` (E68–E70) and `investscape-calc-engine/docs/SYNDICATION-WATERFALL-SOURCES.md` (E71–E72).

## 3. Not registered behind `investscape-api`

As of commit `3886a9c` / `502ff78`, `investscape-api` has not been modified to expose any of E68–E72 — no new routes, no new dependency on either package. This section will be revisited if a later same-night pass adds dormant (unregistered) route scaffolding for these engines, following the same "built but not wired into the active router" pattern Doc 63 §4 documents for E54–E67 — see that section for the precedent this would follow, and Doc 62 §3.3 for the open product decisions blocking full registration.

*End of Doc 64 · Companions: none (see §0)*
