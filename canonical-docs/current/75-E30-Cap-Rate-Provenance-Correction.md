# InvestScape — Doc 75: E30 Cap Rate Provenance Correction

**Lighthouse Research Ltd. · 22 September 2026**
**No companion proposal doc.** This doc registers a source-integrity correction to E30 (City-Level Market Analysis, already mapped under Doc 66 Row 2's E29–E45 Economic Engine range) — it is not a new engine registration.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-economic-engine
**Branch:** `fix/e30-unsourced-cap-rates`
**Commit documented:** `23a56915212936f09e0d2443782b6b021c1d7764` (`23a5691`) — final of three commits on this branch, superseding the two intermediate commits.

## 1. What changed

All 29 city-level cap-rate distributions in E30 were audited and nulled, because the sources their `source` field cited do not publish commercial cap-rate figures:

- 19 US metros tagged `FRED, Zillow` — FRED publishes interest rates and housing statistics; Zillow publishes residential ZHVI/ZORI. Neither publishes a commercial cap rate.
- 10 Canadian cities tagged `CREA, CMHC` — CREA publishes residential MLS statistics; CMHC publishes housing starts/rental data. Neither publishes a commercial cap rate.

By the final commit, 29 of 29 city records had been checked; zero remain with unsupported provenance.

## 2. Evidence boundary

**No replacement values were invented.** Every nulled field was set to `null`, not to an estimated, interpolated, or placeholder figure.

**Nulling does not imply temporal validity.** A `null` cap rate states only that no supported value exists — it does not assert that a value did or did not exist at some earlier date, and it carries no effective-date claim of its own.

**Sourced replacement benchmarks, where they exist, belong to a different engine and were not written back to E30.** The commit messages reference real, cited cap-rate figures for some of the same cities (e.g., Cushman & Wakefield Canada figures) as living in E68/`market-intelligence-engine` (`docs/E68-cap-rate-data-coverage.md`) — deliberately kept out of E30's own file, preserving E30's independent audit trail rather than merging the two engines' provenance records.

**The E68 coverage document is referenced by E30's commit messages, not independently verified in this doc.** This doc does not confirm that `market-intelligence-engine docs/E68-cap-rate-data-coverage.md` exists or is current — it records only what the E30 commit messages themselves state.

## 3. Prohibited claims

Do not describe any nulled field as temporary or as pending a future replacement — the null is the correct, permanent state for a field with no supported source, not a placeholder awaiting a fix.

*End of Doc 75 · Companions: none*
