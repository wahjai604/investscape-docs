# InvestScape — Doc 76: E85 Zoning and Land Use Rules Engine Source Reference

**Lighthouse Research Ltd. · 22 September 2026**
**No companion proposal doc.** This doc registers E85's verified source surface for engineers and auditors evaluating its architecture and evidence-governance boundary. It is not a claim that E85 is package-consumable — see §5.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-market-intelligence-engine
**Branch:** `feat/e85-market-intelligence`
**Commit documented:** `ae7b8397a5504d74ff161b93404435367f6bdc05` (`ae7b839`), confirmed the live branch tip against `git ls-remote origin refs/heads/feat/e85-market-intelligence` at time of writing.

Every statement below was verified with `git show <sha>:<path>` and `git ls-tree` against the actual committed blobs — not copied from a milestone summary or the separate, unimplemented pilot-evidence research folder (`e85-pilot-evidence/`, local-only, not part of this repository). **The pilot-evidence folder is not used as implementation evidence anywhere in this doc.**

## 1. Architecture

E85 is a universal core plus jurisdiction-namespaced local adapters and rule packs. Per the module's own header: "E85 has NO direct runtime dependency on E86/E87/E88/calc-engine/economic-engine/tax-engine — every export below is defined fresh in this module."

The core is organized in phases, each exported from `src/zoning-land-use-engine/index.ts`:

- **Phase 3** — type contracts only: jurisdiction/parcel, provenance, evidence/temporal, use taxonomy, rule families, DATA_GAP taxonomy, manual-review taxonomy, qualification, regulatory envelope, result status, override, policy, source-readiness.
- **Phase 4** — deterministic RULE-ONLY MODE evaluation on frozen Phase 3 contracts: `evaluateZoningAndLandUse` (a pure, synchronous, in-memory evaluator over already-normalized `E85RuleRecord[]`; no raw PDF/HTML/API parsing), plus rule-identity, applicability, qualification-derivation, conflict-detection, six family evaluators, envelope-assembly, result-status.
- **Phase 5** — source adapter & registry layer: generic source registry, multi-axis source readiness, structured source-fact contract, normalization findings, normalized rule bundle, generic adapter contract, exact-match adapter resolver, and one pilot City-of-Vancouver R1-1 adapter. Covers normalization only — acquisition and extraction are explicitly out of scope.
- **Phase 6** — multi-source rule-pack composition, sitting between Phases 4 and 5; composition roles are descriptive labels conferring no legal hierarchy.
- **Phase 7** — spatial applicability (which instruments are in play at a parcel; never ranks them).
- **Phase 8** — spatial source adapters (how an authoritative GIS layer becomes instruments; acquisition remains outside E85).
- **Phase 9** — decision orchestration, sitting above every other phase: runs 8 → 7 → 6 → 4, adds only materiality (whether an upstream problem bears on this parcel). Ranks no instrument, computes no rule; a clean status is earned against material blockers, never inferred from a successful calculation.
- **Later slices** — `temporal-request-types` and `decision-temporal-materiality-adapter` are exported publicly; the lineage-grouping/selection/decision-impact modules they consume remain unexported.
- **Adapters namespace** — `export * as adapters from "./adapters"`, itself re-exporting `vancouver` and `spatial` sub-namespaces. Jurisdiction-specific normalization lives only under this directory; the core never imports from it.

## 2. Designation/legal-text identity correspondence evaluator

`src/zoning-land-use-engine/designation-legal-text-identity-correspondence.ts` exports `evaluateE85DesignationLegalTextIdentityCorrespondence(designation, legalTextIdentity, linkageIdentity)` — a pure, deterministic, jurisdiction-neutral evaluator performing **exact-match, atemporal identity comparison only** (no case-folding, no fuzzy or prefix matching, no normalization).

**Accepted inputs:** a `E85DesignationApplicabilityResult` (nine-kind closed union); a `E85LegalTextIdentityInput` (`{kind: "SELECTED", identity}` or `{kind: "NOT_SELECTED"}`); a caller-supplied `E85LegalIdentity` (`jurisdictionId`, `sourceId`, `sourceVersionId`, `zoneDesignation` — four plain strings; deliberately no date, interval, or validity-state field).

**Ordered outcomes**, checked in this exact sequence:

1. `DESIGNATION_NOT_APPLICABLE_PASSTHROUGH` — the designation result was not one of the two positive-applicability kinds. Checked first, before the legal-text identity is even inspected.
2. `LEGAL_TEXT_NOT_SELECTED_PASSTHROUGH` — the designation was applicable, but no legal-text identity was supplied.
3. One of `JURISDICTION_MISMATCH` / `SOURCE_MISMATCH` / `VERSION_MISMATCH` / `ZONE_MISMATCH` — the most-fundamental mismatched axis is reported, never more than one at a time.
4. `IDENTITY_CORRESPONDENCE_ESTABLISHED` — every compared axis matches exactly.

**Limitation, carried verbatim on every `IDENTITY_CORRESPONDENCE_ESTABLISHED` result:** *"This means ONLY that the supplied designation identity, legal-text identity, and linkage identity correspond exactly under atemporal, exact-match rules. It does NOT mean the linkage itself was legally valid at any date, including the requested AS_OF date; it does NOT mean the parcel was historically zoned under the selected legal text; it does NOT mean legal-text validity and designation validity are temporally aligned; it does NOT authorize rule-pack application; and it does NOT constitute a final zoning determination."*

**This module is internal-only.** It is not exported from `zoning-land-use-engine/index.ts` — absent from the module's own barrel, alongside its sibling `designation-applicability.ts` and several temporal-pipeline modules. It is not reachable from the package root either. A caller within this repository could import it directly by path; no external consumer of the published package could reach it even if E85 were otherwise packaged (see §5).

## 3. Explicit non-claims

Confirmed by direct source inspection, not inferred:

- **No real-source promotion.** The correspondence evaluator never asserts that any real source (R1-1, C-2C, or otherwise) is current law.
- **No legal-linkage temporal validity.** Exact identity correspondence is explicitly not temporal alignment — see the limitation text in §2.
- **No rule-pack authorization.** The evaluator's own header states it does not authorize rule-pack application.
- **No comprehensive spatial-temporal alignment.** Phase 9 (decision orchestration) adds materiality only — it ranks no instrument, computes no rule, and a clean status is never inferred from a successful calculation rather than earned against material blockers.

## 4. Cross-engine dependency

E85 has no direct runtime dependency on E86, E87, E88, or the calculation, economic, or tax engines — confirmed verbatim from the module's own header comment.

## 5. Packaging status

**E85 has no package-consumable public surface at this commit.** `src/index.ts` (the package root) does not export `zoning-land-use-engine` in any form, and `package.json`'s `files` allow-list contains zero `zoning-land-use-engine` paths. Everything described in §1–§4 exists in source and is exercised by this repository's own tests, but none of it is reachable by an external consumer of the published npm package at this commit.

*End of Doc 76 · Companions: Doc 66 (repo-level engine map), Doc 77 (E86-P0)*
