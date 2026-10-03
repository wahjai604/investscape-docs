# InvestScape Documentation

**Repository:** https://github.com/wahjai604/investscape-docs
**License:** Proprietary (Closed-Source) — see [LICENSE](LICENSE)
**Copyright:** © 2026 Lighthouse Research Ltd.

## Purpose

Reference documentation for the InvestScape engines: formula specifications, schema documents, and research reports. This repo is markdown/reference material — there is no application code here.

## Current migration checkpoint

See [Doc 78 — Phase 2 native migration and SaaS integration checkpoint](canonical-docs/current/78-Phase2-Native-Migration-and-SaaS-Checkpoint.md) for the 2026-10-02 verified/reported status, pending integration gates and repository boundaries. Native WeWeb Workspace/Quick drafts exist; authenticated saving and Full API integration are pending. This documentation is not a production-readiness claim.

## Scope

The historical core covers 52 engines across three repositories. Later financial, tax and market-intelligence references are also present; numbering, package exports, API routes and release readiness are distinct and must not be counted interchangeably:
- [investscape-calc-engine](https://github.com/wahjai604/investscape-calc-engine) — Financial engines (E1–E28)
- [investscape-economic-engine](https://github.com/wahjai604/investscape-economic-engine) — Economic engines (E29–E45)
- [investscape-tax-engine](https://github.com/wahjai604/investscape-tax-engine) — Tax engines (E46–E53)

Note: E36 excluded pending legal review.

For a comprehensive reference of what each engine does, see [ENGINE-REFERENCE.md](ENGINE-REFERENCE.md).

## Structure

- `canonical-docs/current/` — numbered reference documents; see `canonical-docs/REGISTRY.md` and dated status notes
- `canonical-docs/superseded/` — documents superseded by newer versions
- `research-reports/` — supporting research
- `html-prototypes/current/` and `html-prototypes/retired/` — prototype UI references
- `data-templates/` — CSV templates
- `MANIFEST.md` — index and audit trail of documentation changes; check this file for the current known-issues list before citing a specific numbered doc

## How to Use This Repo

Numbered documents under `canonical-docs/current/` are the authoritative reference for a given topic. If a document appears in both `canonical-docs/current/` and `canonical-docs/superseded/`, the `current/` version governs. Consult `MANIFEST.md` for renumbering history and any flagged inconsistencies before relying on a specific document number.

## Related Repositories

- [investscape-calc-engine](https://github.com/wahjai604/investscape-calc-engine) — financial calculation engines, E1–E28
- [investscape-economic-engine](https://github.com/wahjai604/investscape-economic-engine) — economic data engines, E29–E45
- [investscape-tax-engine](https://github.com/wahjai604/investscape-tax-engine) — tax calculation engines, E46–E53
- [investscape-api](https://github.com/wahjai604/investscape-api) — deployed HTTP API with vendored engine packages; current deployment and surface boundaries are in Doc 78

- [investscape-market-intelligence-engine](https://github.com/wahjai604/investscape-market-intelligence-engine) — statistical risk, Market Intel and E85–E88 source; not all modules are packaged or exposed
- [investscape-retired-reconstruction](https://github.com/wahjai604/investscape-retired-reconstruction) — canonical migration reference and extracted shared development calculations; local checkpoints may be ahead of GitHub

## License & Disclaimer

This documentation is closed-source proprietary content. Authorized users only.

For legal disclaimers, see [DISCLAIMER.md](DISCLAIMER.md).

---

© 2026 Lighthouse Research Ltd. All rights reserved.
