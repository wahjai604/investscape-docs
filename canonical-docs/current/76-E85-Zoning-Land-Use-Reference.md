# InvestScape — Doc 76: E85 Zoning and Land Use Rules Engine Source Reference

**Lighthouse Research Ltd. · 23 September 2026**
**No companion proposal doc.** This doc registers E85's verified source surface for engineers and auditors evaluating its architecture and evidence-governance boundary. It is not a claim that E85 is package-consumable — see §5.

## 0. Source verified

**Repository:** https://github.com/wahjai604/investscape-market-intelligence-engine
**Branch:** `feat/e85-market-intelligence`
**Commit documented:** `ea7b26feac9ff8055de9223c5812a58e25fa5f6a` (`ea7b26f`), confirmed as the live branch tip against `git ls-remote origin refs/heads/feat/e85-market-intelligence`, with a clean working tree at that exact commit, at time of writing.

**Companion repository state, recorded for cross-reference:** this doc's own home repository (investscape-docs) was at `308f4dcca9535c08454a3d48086daf4eeb566d37` on branch `docs/e85-e88-engine-registry` when this revision was written.

Every statement below was verified with `git show <sha>:<path>` and `git ls-tree` against the actual committed blobs at `ea7b26f` — not copied from a milestone summary or the separate, unimplemented pilot-evidence research folder (`e85-pilot-evidence/`, local-only, not part of this repository). **The pilot-evidence folder is not used as implementation evidence anywhere in this doc.**

## 1. Architecture

E85 is a universal core plus jurisdiction-namespaced local adapters and rule packs. Per the module's own header: "E85 has NO direct runtime dependency on E86/E87/E88/calc-engine/economic-engine/tax-engine — every export below is defined fresh in this module."

The core is organized in phases, each exported from `src/zoning-land-use-engine/index.ts`:

- **Phase 3** — type contracts only: jurisdiction/parcel, provenance, evidence/temporal, use taxonomy, rule families, DATA_GAP taxonomy, manual-review taxonomy, qualification, regulatory envelope, result status, override, policy, source-readiness.
- **Phase 4** — deterministic RULE-ONLY MODE evaluation on frozen Phase 3 contracts: `evaluateZoningAndLandUse` (a pure, synchronous, in-memory evaluator over already-normalized `E85RuleRecord[]`; no raw PDF/HTML/API parsing), plus rule-identity, applicability, qualification-derivation, conflict-detection, six family evaluators, envelope-assembly, result-status.
- **Phase 5** — source adapter & registry layer: generic source registry, multi-axis source readiness, structured source-fact contract, normalization findings, normalized rule bundle, generic adapter contract, exact-match adapter resolver, and **two** pilot adapters, both City-of-Vancouver-only: **R1-1** (`adapters/vancouver/r1-1-*.ts`) and **C-2C** (`adapters/vancouver/c-2c-*.ts`). Covers normalization only — acquisition and extraction are explicitly out of scope. (An earlier revision of this doc, sourced against `ae7b839`, stated one pilot adapter; confirmed by `git ls-tree` at `ea7b26f` that `adapters/vancouver/` now contains both R1-1 and C-2C adapter/source/terminology triplets, barrelled together from `adapters/vancouver/index.ts`.)
- **Phase 6** — multi-source rule-pack composition, sitting between Phases 4 and 5; composition roles are descriptive labels conferring no legal hierarchy.
- **Phase 7** — spatial applicability (which instruments are in play at a parcel; never ranks them).
- **Phase 8** — spatial source adapters (how an authoritative GIS layer becomes instruments; acquisition remains outside E85).
- **Phase 9** — decision orchestration, sitting above every other phase: runs 8 → 7 → 6 → 4, adds only materiality (whether an upstream problem bears on this parcel). Ranks no instrument, computes no rule; a clean status is earned against material blockers, never inferred from a successful calculation.
- **Later slices** — `temporal-request-types` and `decision-temporal-materiality-adapter` are exported publicly; the lineage-grouping/selection/decision-impact modules they consume remain unexported.
- **Adapters namespace** — `export * as adapters from "./adapters"`, itself re-exporting `vancouver` and `spatial` sub-namespaces. Jurisdiction-specific normalization lives only under this directory; the core never imports from it.
- **Unexported builders.** `designation-validity-types.ts` (`buildE85DesignationValidity`) and `version-validity-types.ts` (`buildE85VersionValidity`) are absent from `zoning-land-use-engine/index.ts` entirely — confirmed by `grep` against the barrel at `ea7b26f`. Every function documented in §2 below that accepts an `E85DesignationValidity` or `E85VersionValidity` therefore requires its caller to either import these builder modules directly by path (bypassing the barrel) or construct structurally-equivalent objects some other way; neither builder is reachable through the module's own public surface.

## 2. Temporal-chain evaluators: designation/legal-text identity, applicability, and coincidence

Five functions, verified at `ea7b26f`, form a temporal-chain family. All five are **internal-only**: none is exported from `zoning-land-use-engine/index.ts`, and none is reachable from the package root (see §5). The first four are combined by the fifth (§2.5) into a single orchestrated call.

### 2.1 Designation/legal-text identity correspondence evaluator

`src/zoning-land-use-engine/designation-legal-text-identity-correspondence.ts` exports `evaluateE85DesignationLegalTextIdentityCorrespondence(designation, legalTextIdentity, linkageIdentity)` — a pure, deterministic, jurisdiction-neutral evaluator performing **exact-match, atemporal identity comparison only** (no case-folding, no fuzzy or prefix matching, no normalization).

**Accepted inputs:** a `E85DesignationApplicabilityResult` (nine-kind closed union); a `E85LegalTextIdentityInput` (`{kind: "SELECTED", identity}` or `{kind: "NOT_SELECTED"}`); a caller-supplied `E85LegalIdentity` (`jurisdictionId`, `sourceId`, `sourceVersionId`, `zoneDesignation` — four plain strings; deliberately no date, interval, or validity-state field).

**Ordered outcomes**, checked in this exact sequence:

1. `DESIGNATION_NOT_APPLICABLE_PASSTHROUGH` — the designation result was not one of the two positive-applicability kinds. Checked first, before the legal-text identity is even inspected.
2. `LEGAL_TEXT_NOT_SELECTED_PASSTHROUGH` — the designation was applicable, but no legal-text identity was supplied.
3. One of `JURISDICTION_MISMATCH` / `SOURCE_MISMATCH` / `VERSION_MISMATCH` / `ZONE_MISMATCH` — the most-fundamental mismatched axis is reported, never more than one at a time.
4. `IDENTITY_CORRESPONDENCE_ESTABLISHED` — every compared axis matches exactly.

**Limitation, carried verbatim on every `IDENTITY_CORRESPONDENCE_ESTABLISHED` result:** *"This means ONLY that the supplied designation identity, legal-text identity, and linkage identity correspond exactly under atemporal, exact-match rules. It does NOT mean the linkage itself was legally valid at any date, including the requested AS_OF date; it does NOT mean the parcel was historically zoned under the selected legal text; it does NOT mean legal-text validity and designation validity are temporally aligned; it does NOT authorize rule-pack application; and it does NOT constitute a final zoning determination."*

**This module is internal-only.** It is not exported from `zoning-land-use-engine/index.ts` — absent from the module's own barrel, alongside its siblings `designation-applicability.ts`, `legal-text-applicability.ts`, `designation-legal-text-temporal-coincidence.ts`, `designation-legal-text-correspondence-and-coincidence.ts`, and `designation-legal-text-consistent-pair.ts` (§2.2–§2.5). It is not reachable from the package root either. A caller within this repository could import it directly by path; no external consumer of the published package could reach it even if E85 were otherwise packaged (see §5).

### 2.2 Designation AS_OF applicability evaluator

`src/zoning-land-use-engine/designation-applicability.ts` exports `evaluateE85DesignationApplicability(designationValidity, resolvedRequest)` — a pure, deterministic evaluator answering only "is this already-validated `E85DesignationValidity` applicable at the requested AS_OF date?"

**Request-mode convention:** `ABSENT` and `CURRENT` are never resolved to a concrete date and never defaulted to "today" (no machine clock is read anywhere in the file); both deterministically produce `DESIGNATION_APPLICABILITY_NOT_EVALUABLE`. Only `AS_OF` is ever evaluated.

**Observation-only safety rule:** a designation whose start authority is `OPEN_OBSERVATION_ASSERTION` never establishes legal applicability, regardless of how the requested AS_OF date relates to the observation date — it always resolves to `DESIGNATION_OBSERVATION_ONLY_NOT_LEGALLY_DATED`, never to a positive applicability outcome.

**Closed-boundary convention:** inclusive on both ends (`effectiveFrom <= asOfDate <= effectiveTo`), matching the identical convention in `designation-validity-types.ts`.

Out of scope, per the module's own header: temporalizing legal-linkage, aligning a designation against `E85VersionValidity`/legal-text validity, rule-pack consultation, materiality/gap/DATA_GAP vocabulary, and inferring continuity from repeated observations.

### 2.3 Legal-text-version AS_OF applicability evaluator

`src/zoning-land-use-engine/legal-text-applicability.ts` exports `evaluateE85LegalTextApplicability(versionValidity, resolvedRequest)` — structurally mirrors §2.2 but operates on `E85VersionValidity` instead of `E85DesignationValidity`. Same request-mode convention (`ABSENT`/`CURRENT` → `LEGAL_TEXT_APPLICABILITY_NOT_EVALUABLE`, no machine clock read) and the same inclusive-on-both-ends closed-boundary convention.

**CONFLICTING_END convention:** an AS_OF date preceding a known `effectiveFrom` is still determinate ("not yet started") even when the end is disputed; an AS_OF date at or after `effectiveFrom` resolves to `LEGAL_TEXT_END_CONFLICT` — the module never guesses which disputed end date controls.

**CONDITIONAL_PARTIAL_TERMINATION convention:** always resolves to `LEGAL_TEXT_PARTIAL_TERMINATION_INDETERMINATE` regardless of AS_OF; the module never infers whether a partial-termination clause behaves as an end date or a non-temporal scope change.

Every positive-coverage outcome carries a mandatory `.limitation` string, modeled on §2.1's `IDENTITY_CORRESPONDENCE_ESTABLISHED.limitation` house style: interval coverage at the supplied AS_OF date does not establish enactment, legal effect, property applicability, identity correspondence, historical continuity, rule-pack authorization, or a final determination.

### 2.4 Designation/legal-text temporal coincidence evaluator

`src/zoning-land-use-engine/designation-legal-text-temporal-coincidence.ts` exports `evaluateE85DesignationLegalTextTemporalCoincidence(designation, legalText, asOf)` — a pure evaluator asking only whether two already-computed applicability *results* (§2.2's and §2.3's output types, never the underlying validity intervals) both report positive coverage at a caller-asserted date. It never recomputes applicability and never imports `E85DesignationValidity`/`E85VersionValidity`.

Every one of the 9 designation-result kinds and 9 legal-text-result kinds is classified in its own named `switch` case with a compile-time `never`-typed exhaustiveness check, mirroring the pattern in §2.1/§2.2/§2.3.

Outcome vocabulary, in check order: `NOT_EVALUABLE` (either/both side's request-mode passthrough), `INDETERMINATE` (either/both side's evidentiary-conflict kind), `BOTH_CLOSED_APPLICABLE` / `MIXED_CLOSED_AND_OPEN_END_APPLICABLE` / `BOTH_OPEN_END_APPLICABLE` (both sides positive, distinguished by open-end hedging), `NOT_COINCIDENT` (otherwise). Every variant carries both source `.kind` values unchanged — no outcome collapses to a boolean.

### 2.5 Designation/legal-text correspondence-and-coincidence pairing wrapper and consistent-pair orchestrator

`src/zoning-land-use-engine/designation-legal-text-correspondence-and-coincidence.ts` exports `pairE85DesignationLegalTextCorrespondenceAndCoincidence(correspondence, coincidence)` — a flat, non-discriminated pairing of a §2.1 correspondence result and a §2.4 coincidence result. It produces no `kind` field and no synthesized status; both inputs are carried through unchanged. `.limitation` is attached only when `correspondence.kind === "IDENTITY_CORRESPONDENCE_ESTABLISHED"` OR `coincidence.kind` is one of the three positive coincidence kinds.

`src/zoning-land-use-engine/designation-legal-text-consistent-pair.ts` exports `evaluateE85DesignationLegalTextConsistentPair(input)` — a pure orchestrator that threads one already-built input bundle through all five functions above (§2.2, §2.3, §2.1, and, when an explicit AS_OF date is present, §2.4 and this section's pairing wrapper), unmodified. It performs no construction of validity/identity objects, no raw date comparison, and no lookup of its own.

**Decision A (no short-circuit on mismatch):** `designation`, `legalText`, and `correspondence` are always computed; when an explicit AS_OF date is present, `coincidence` and `pair` are also always computed, regardless of `correspondence.kind` — even a mismatch kind never suppresses the temporal calls.

**Decision B (no invented date):** an `asOfDate` is extracted only when `resolvedRequest.kind === "RESOLVED" && resolvedRequest.request.mode === "AS_OF"`. When the resolved request is `ABSENT` or `CURRENT`, neither temporal function is called, `Date.now()`/a machine date/`"unknown"` is never substituted, and `coincidence`/`pair` are simply omitted (undefined, never null-filled or error-valued).

`.limitation` is always present on this orchestrator's result (unlike §2.5's own optional `.limitation`) — a base limitation plus, when temporal calls were omitted, a second sentence explaining the omission was due to an absent AS_OF date, never an error.

## 3. Explicit non-claims

Confirmed by direct source inspection, not inferred:

- **No real-source promotion.** The correspondence evaluator never asserts that any real source (R1-1, C-2C, or otherwise) is current law.
- **No legal-linkage temporal validity.** Exact identity correspondence is explicitly not temporal alignment — see the limitation text in §2.
- **No rule-pack authorization.** The evaluator's own header states it does not authorize rule-pack application.
- **No comprehensive spatial-temporal alignment.** Phase 9 (decision orchestration) adds materiality only — it ranks no instrument, computes no rule, and a clean status is never inferred from a successful calculation rather than earned against material blockers.

### 3.1 Temporal trust boundaries (§2.2–§2.5)

Confirmed by direct source inspection of the four new modules at `ea7b26f`:

1. **Caller-asserted `asOf`, unverified.** §2.4's `evaluateE85DesignationLegalTextTemporalCoincidence` receives an explicit `asOf: string` argument and *assumes, but cannot verify*, that both supplied applicability results (§2.2, §2.3) were themselves computed against that same date. Roughly half the variants on each side carry no embedded date field at all, so the module never reads or compares an embedded date for that purpose and never calls `Date.now()`/`new Date()`. This is documented, not enforced.
2. **No cross-record verification in the pairing wrapper.** §2.5's `pairE85DesignationLegalTextCorrespondenceAndCoincidence` cannot verify that the supplied `correspondence` and `coincidence` results refer to the same underlying designation record, legal-text/linkage entry, or as-of date — that is solely the calling code's responsibility.
3. **No cross-record verification in the orchestrator.** §2.5's `evaluateE85DesignationLegalTextConsistentPair` guarantees consistency only among its own five/three invocations over one shared input bundle — a mechanical, construction-guaranteed fact about that single call. It cannot and does not verify that the caller originally assembled the designation validity, legal-text identity, linkage identity, version validity, or resolved temporal request from the same real-world records.
4. **No machine clock anywhere in the chain.** None of §2.2–§2.5 reads a machine clock at any point; every date used is either caller-supplied (`asOf`) or already embedded in an already-validated/already-resolved input object. `ABSENT`/`CURRENT` temporal-request modes are never defaulted to "today" — they deterministically short-circuit to a dedicated not-evaluable/omitted outcome instead.

### 3.2 Legal limitations carried by the temporal-chain functions

Every positive outcome across §2.1–§2.5 carries a `.limitation` string (mandatory on §2.1's `IDENTITY_CORRESPONDENCE_ESTABLISHED`, §2.3's positive-coverage variants, §2.4's three positive-coincidence variants, and always-present on §2.5's orchestrator result; conditionally present on §2.5's pairing wrapper). Collectively, and verbatim in substance across all five modules, these limitations state that a positive result does **not**: establish legal effect; establish enactment; establish that a designation or legal text is applicable to any particular property; establish identity correspondence (where not itself the subject of the result); establish historical continuity; authorize rule-pack application; or constitute a final zoning or planning determination. No module in this chain overrides or narrows this list for any outcome kind.

## 4. Cross-engine dependency

E85 has no direct runtime dependency on E86, E87, E88, or the calculation, economic, or tax engines — confirmed verbatim from the module's own header comment.

## 5. Packaging status

**E85 has no package-consumable public surface at this commit.** `src/index.ts` (the package root) does not export `zoning-land-use-engine` in any form, and `package.json`'s `files` allow-list contains zero `zoning-land-use-engine` paths. Everything described in §1–§4 exists in source and is exercised by this repository's own tests, but none of it is reachable by an external consumer of the published npm package at this commit. Confirmed unchanged at `ea7b26f` versus the prior `ae7b839` snapshot.

## 6. Unresolved prerequisites before any public exposure

Confirmed absent or unresolved by direct source inspection at `ea7b26f` — none of the following exists in this repository today, and none is implied by anything in §1–§5:

1. **No barrel export path.** None of the five temporal-chain functions (§2.1–§2.5) is exported from `zoning-land-use-engine/index.ts`; reaching any of them requires an internal, by-path import that no external consumer can perform.
2. **No package-root export.** `src/index.ts` does not export `zoning-land-use-engine` in any form (§5); adding the barrel exports in (1) alone would not make these functions package-consumable.
3. **No builder export path.** `buildE85DesignationValidity` and `buildE85VersionValidity` are themselves unexported (§1); every §2.2–§2.5 caller currently depends on an internal, by-path import of two builder modules that have no public entry point of their own.
4. **No cross-record verification mechanism.** §3.1 documents four unenforced trust boundaries (caller-asserted `asOf`, no same-record verification in the pairing wrapper, no same-record verification in the orchestrator, no machine-clock fallback). None of these is backed by a runtime check; a public API surface would need either enforcement or an explicit, externally-documented contract shifting that burden onto callers.
5. **No legal review of record.** The `.limitation` text in §3.2 is engineering-authored disclaimer language, not reviewed or approved by counsel for external distribution; nothing in this repository indicates such a review has occurred.
6. **Two pilot jurisdictions only.** Coverage is limited to City-of-Vancouver R1-1 and C-2C (§1); no cross-jurisdiction generalization has been demonstrated, so no claim of jurisdiction-general readiness would be supportable at this commit.
7. **No versioned, published API contract.** No `package.json` version bump, changelog entry, or deprecation/stability policy exists for any symbol named in §2 — there is nothing yet for an external consumer to depend on that this repository has committed to keeping stable.

This section is a list of gaps, not a roadmap or a commitment to close them; it records what is verified absent, not what is planned.

*End of Doc 76 · Companions: Doc 66 (repo-level engine map), Doc 77 (E86-P0)*
