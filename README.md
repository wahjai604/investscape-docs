# InvestScape Documentation

**Repository:** https://github.com/wahjai604/investscape-docs
**License:** Proprietary (Closed-Source) — see [LICENSE](LICENSE)
**Copyright:** © 2026 Lighthouse Research Ltd.

## Purpose

Reference documentation for the InvestScape engines: formula specifications, schema documents, and research reports. This repo is markdown/reference material — there is no application code here.

## Scope

Documentation currently covers the engines implemented in [investscape-calc-engine](https://github.com/wahjai604/investscape-calc-engine) (E1–E28) and [investscape-economic-engine](https://github.com/wahjai604/investscape-economic-engine) (E29–E45). A separate repo, `investscape-tax-engine` (E46–E53), exists but is not yet cross-referenced from this documentation set.

## Structure

- `canonical-docs/current/` — current reference documents (numbered, ~62 files)
- `canonical-docs/superseded/` — documents superseded by newer versions
- `research-reports/` — supporting research
- `html-prototypes/current/` and `html-prototypes/retired/` — prototype UI references
- `data-templates/` — CSV templates
- `MANIFEST.md` — index and audit trail of documentation changes; check this file for the current known-issues list before citing a specific numbered doc

## How to Use This Repo

Numbered documents under `canonical-docs/current/` are the authoritative reference for a given topic. If a document appears in both `canonical-docs/current/` and `canonical-docs/superseded/`, the `current/` version governs. Consult `MANIFEST.md` for renumbering history and any flagged inconsistencies before relying on a specific document number.

## Related Repositories

- [investscape-calc-engine](https://github.com/wahjai604/investscape-calc-engine) — financial calculation engines, E1–E27
- [investscape-economic-engine](https://github.com/wahjai604/investscape-economic-engine) — economic data engines, E29–E45
- [investscape-api](https://github.com/wahjai604/investscape-api) — HTTP API wrapping both engines

## License & Disclaimer

This documentation is closed-source proprietary content. Authorized users only.

For legal disclaimers, see [DISCLAIMER.md](DISCLAIMER.md).

---

© 2026 Lighthouse Research Ltd. All rights reserved.
