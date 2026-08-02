# InvestScape — Doc 58: US Jurisdiction Gap Log

**Lighthouse Research Ltd. · 1 August 2026**
**Strictly additive. Read-only audit, report-only convention per Doc 17 — nothing in this document changes any build artifact.**

Parent documents: 54-Engine-Reconciliation, 06-Commercial-Formula-Library + Addendum A, 02-Database-Schema-Addendum-A, 15-Currency-Multi-Jurisdiction-Schema, 28-External-Data-Source-Registry.

**Numbering — resolved.** The caution raised in v1.0 was correct: a collision was confirmed on 1 Aug 2026. Two documents were both numbered 55 (`55-Bubble-Reference-Inventory.md` and `55-Master-ToDo-Triage-Execution-Plan.md`), in GitHub as well as locally. Resolution and prevention rules are in **Doc 56 Addendum A**. Under that resolution 55 remains the Master To-Do Triage Execution Plan, 56 and 57 are unchanged, and **58–60 are correctly assigned** — no renumbering of this document or its companions is required.

**Source-of-truth caution — read before acting on §2.** The audit in this document was run against the Claude project folder, which is now known to be a **stale and partial snapshot** of `investscape-docs`. See Doc 56 Addendum A §4. §2's finding is therefore *provisional* and flagged for re-verification against the GitHub working copy.

---

## 0. Why this document exists

The US financing qualifier is not built, not specced, and not flagged in any numbered inventory. It is not E-anything in the Table A engine list (E1–E25); it has no row, no status, and no owner. It surfaced only because a sequencing question was asked about it directly.

That is the same failure shape as the E10 gap — a real dependency discovered by hitting a wall rather than by reading a register. This document exists so that does not happen a third time.

While writing it, a **second, unlogged US gap was found by inspection** (§2). It was not the thing being looked for.

---

## 1. GAP US-1 — The US financing qualifier

### 1.1 Status

| Attribute | Finding |
|---|---|
| Engine ID | **None.** Not in E1–E25 |
| Claude Design | Absent |
| TypeScript (`investscape-calc-engine`) | Absent |
| Canonical doc coverage | Absent from Doc 06, Doc 06 Addendum A, Doc 02 |
| Blocking? | No. Does not block E8/E9/E10/E11 |
| Design decisions resolved | **Zero** |

### 1.2 Why it is not one engine slot

It is a cross-cutting jurisdiction concern, not a single missing calculation. It lands on four existing rows:

- **E3 — Financing Qualifier.** GDS/TDS/CMHC/OSFI only. The US equivalent is DTI/PMI, which is a structurally different calculation, not the same formula with different constants. Detail in **Doc 59**.
- **E5 — Transfer tax bracket engine.** Canadian by name; the `tax_bracket_tables` schema is already jurisdiction-keyed, so the mechanism carries over. See **GAP US-2** below, which changes the shape of this one materially.
- **E17 — Tax / after-tax cash flow.** Absent for *both* countries. When built, US and Canadian treatment diverge completely — depreciation recapture, different capital-gains treatment, no direct CCA equivalent. Building E17 Canada-first without a US design pass repeats what E9 nearly did with `debtService`.
- **E23 — Take-out / permanent financing.** Construction-to-perm structures differ by country.

### 1.3 Recommended sequencing (confirmed in session, logged here)

1. **E10** — currency-agnostic, unaffected. *(Complete as of this session.)*
2. **US qualifier in Claude Design** — Design-first, and more genuinely so than E8/E9/E10 were. Those three had an externally checkable correct answer to build toward. This one does not: nobody has decided what a US qualifier screen shows, which DTI thresholds to surface, how PMI is explained, or whether a stress-test equivalent is displayed at all. Blocking questions are in **Doc 59 §6**.
3. **Then Code.** Likely a **new file (`qualifying-us.ts`) alongside `qualifying.ts`**, not an extension of it — flagged as a likely direction for Code to verify against the real file, not as a fixed instruction.

### 1.4 Registry action required

Add a row to the Table A engine inventory. Proposed: **E26 — US Financing Qualifier (DTI / PMI / MIP / DSCR-loan sizing)**, status *Not built · Design decisions unresolved*. Appending is preferred to renumbering, which would break every cross-reference in Docs 54 and 57.

---

## 2. GAP US-2 — F-701 has no US branch (found by inspection, 1 Aug 2026)

### 2.1 What was checked and what was found

A July session summary records that F-701 was *"split into a Canada bracket-method and USA flat-rate branch in the formula library,"* with a schema field `Parcel.USTransferTaxPct` added alongside `DevProject.Country`.

Direct inspection of the current doc set:

```
grep -rn "F-701" /mnt/project/*.md
grep -rn "USTransferTaxPct|us_transfer_tax|USA flat" /mnt/project/
```

**Result:** F-701 in `06-Commercial-Formula-Library-Addendum-A` is titled **"BC Property Transfer Tax (Bracket Method)"** and contains only the BC bracket table. There is no US branch. `USTransferTaxPct` returns **zero matches across the entire doc set** — no schema entry in Doc 02, Doc 02 Addendum A, or the Supabase addendum.

> **⚠ Correction to v1.0 — this finding is PROVISIONAL, not verified.**
> v1.0 of this document presented the above as verified by inspection. That overstated it. The grep ran against the **Claude project folder**, which was subsequently confirmed to be a stale, partial mirror of `investscape-docs` — it still carries the pre-fix Doc 28 collision, and it holds Bubble-era filenames for six of the eight documents the Tier 1 migration rewrote. It is therefore entirely possible the F-701 US branch **does** exist in the GitHub working copy and is simply absent from the mirror.
>
> **Required before acting:** re-run both greps against `C:\Users\Eric\investscape-docs\canonical-docs\current\`. Only that result settles it.
>
> Retaining the claim as "verified" would have been exactly the decided-vs-built drift this document was written to catch — flagged here rather than quietly amended.

**Provisional finding:** the US transfer-tax branch may not exist in the canonical formula library. If confirmed absent, it was either decided in conversation and never written down, or written and silently dropped in a later consolidation pass. Both are drift; the second is the more concerning. **§2.2 below is unaffected either way** — it concerns whether the recalled *design* is correct, not whether the branch was written, and it holds regardless of the grep result.

### 2.2 The recalled design would have been wrong anyway

Independently of whether the branch was ever written, **"USA = flat rate" is not correct**, on two separate axes.

**Axis 1 — structure. Several states use graduated brackets, exactly like BC PTT.** Washington State is the cleanest counter-example: <cite index="89-1">sales of real property in Washington have been subject to a graduated state REET rate structure since 1 January 2020, replacing the previous flat state rate</cite>. <cite index="91-1">The tiers run 1.10% up to $525,000, 1.28% on $525,001–$1,525,000, 2.75% on $1,525,001–$3,025,000, and 3.00% above $3,025,000, with local rates added on top — King and Snohomish counties at 0.50%, Pierce at 0.25%</cite>. <cite index="94-1">DOR adjusts the price thresholds every four years, and timberland and agricultural land are excluded from the graduated scale at a flat 1.28%</cite> — a property-class carve-out structurally identical to the residential-class flag F-701 already implements for BC's 2%-above-$3M band.

A flat `USTransferTaxPct` cannot express this. The **existing BC bracket mechanism can** — `tax_bracket_tables` is already jurisdiction-keyed. This is more rows, not a new engine.

**Axis 2 — incidence, and this is the more serious one.** In BC, PTT is **buyer-paid** (grantee); it is a closing cost and part of the buyer's total acquisition cost. In Washington, REET is typically paid by the seller at closing (grantor). US incidence varies by state and by local custom, and is sometimes negotiable.

The consequence is not a rate error. It is a **line-item-on-the-wrong-side error**:

- A **seller-paid** transfer tax added to **buyer acquisition cost** (as if the buyer paid it) overstates basis and understates return. This is a sign error.
- The same amount belongs in **selling costs at exit — inside E10**, which was built this session with a 7% selling-cost assumption. Whether that 7% is intended as blended commission only, or commission plus transfer tax, is currently unstated. On a $700,000 Washington sale, REET plus local is roughly $11,515 — large enough to matter and large enough to double-count.
- **Contrast with BC:** If both jurisdictions defaulted to the same side (buyer pays both PTT and REET), the mistake would be a constant error in the comparative analysis. But they don't — BC is buyer-paid, WA is seller-paid — so the mistake in one direction but not the other introduces a comparative bias. A deal analysed side-by-side should not make different incidence assumptions for what is structurally the same line item.

### 2.3 Actions

| # | Action | Where |
|---|---|---|
| 1 | Do **not** build a flat `USTransferTaxPct` field | Doc 02 |
| 2 | Extend `tax_bracket_tables` with US state rows; add a `payable_by` (buyer \| seller \| negotiated) column | Doc 02 / Doc 02 Addendum A |
| 3 | Rename F-701 to a jurisdiction-neutral title; register the BC table and the WA table as two instances of one bracket method | Doc 06 Addendum A |
| 4 | State explicitly what E10's 7% selling-cost figure covers, and route seller-paid transfer tax to exit rather than acquisition | E10 / Doc 57 |
| 5 | Treat `payable_by` as **D2 (admin-maintained)** — it is a legal-custom value that varies by state and changes | Doc 28 provenance model |

---

## 3. GAP US-3 — Redfin Data Center granularity (verify, do not assume)

Doc 28 lists **Redfin CSVs** in the zero-cost v1 data stack. Two things have changed since that was written and one is unresolved.

**Confirmed:** <cite index="78-1">Redfin Data Center still provides free housing market data downloads as of early 2026; the Rocket Companies acquisition, completed July 2025, did not change the pricing model</cite>. Redfin now operates as a Rocket subsidiary. <cite index="80-1">The Data Center was rebuilt in 2026 with a unified data pipeline, seasonally adjusted data as the default, and new metrics including price drops, purchase cancellations, and delistings</cite>.

**Unresolved:** a public user report following the rebuild claims **county-level data was removed, leaving metro-level only**. This is a single unverified comment, not a Redfin statement, and the download page renders its dataset options client-side so it could not be confirmed by fetch. **Do not treat this as fact.** It needs one hands-on check — open the Downloads hub, pull one dataset, and inspect the `Region Type` column.

If true, it degrades Neighbourhood Intel's US side specifically, since metro-level granularity cannot support a neighbourhood claim. Log the answer either way.

---

## 4. Open items carried forward

| # | Item | Owner | Blocking |
|---|---|---|---|
| 1 | Confirm Doc 55–57 numbering before committing 58–60 | Eric | Yes — commit blocker |
| 2 | Add E26 row to Table A | Doc 54 / 57 update | No |
| 3 | Answer Doc 59 §6 blocking questions before any US qualifier Design prompt | Eric | Yes — for US qualifier only |
| 4 | F-701 jurisdiction-neutral rewrite + `payable_by` | Doc 06 Addendum A / Doc 02 | No |
| 5 | State E10's selling-cost composition | E10 | No — but cheap, do it early |
| 6 | Verify Redfin county-level availability | Eric, 5 min | No |

---

*End of Doc 58 · v1.0 · Companions: Doc 59 (US qualifier research brief), Doc 60 (US reference deal pack)*
