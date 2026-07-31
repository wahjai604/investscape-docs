# InvestScape — Doc 50: PortfolioSnapshot Audit Correction & AcquisitionDate Gap

**Strictly additive.** Corrects one finding in the 5f build audit and logs one confirmed schema gap. Parent documents: 02-Bubble-Database-Schema.md, 02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md, 19-Deferred-Items-Queue.md.

---

## 1. Correction to 5f audit finding #1

The 5f audit stated: *"No 'PortfolioSnapshot' schema doc exists in the project (searched by name and equivalents) — nothing to report on beyond that it isn't present."*

**This is incorrect.** `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md` exists and is fully specced:

- `PortfolioSnapshot` (belongs to Property): `PeriodDate`, `PropertyValue`, `LoanBalance`, `Equity` (frozen at write time — same principle as `Scenario` in Addendum A), `CashFlowForPeriod`
- A monthly scheduled backend workflow chain — `snapshot-portfolio` (searches all Properties) → `snapshot-one-property` (writes one row per Property per period)
- Feeds directly into ApexCharts Stage E2 (Portfolio: Equity Growth, stacked Equity vs. Debt)
- Later extended by Doc 15 (§2) with `FXRateUsed` on `PortfolioSnapshot`, for the CAD/USD conversion case

**What the audit got right, for the correct underlying reason:** no *populated* historical data exists. Not because the mechanism was never designed, but because the `snapshot-portfolio` backend workflow was never built and scheduled in Bubble — so the table has zero rows. This is an implementation gap against an existing spec, not a missing design.

**Effect on the audit's "blocked" items:**

- *Benchmark spread over time / attribution* — the audit's "minimal proposal (not built)" duplicates Addendum B almost field-for-field. No new design work is needed here. Action is: build and schedule `snapshot-portfolio` per the existing spec, let it accumulate monthly rows, revisit trend/attribution views once real snapshots exist. Still correctly blocked on data, not on spec.
- *Portfolio blended IRR* — audit's finding holds. See §2.

---

## 2. Confirmed gap: `Property.AcquisitionDate`

Checked directly against Doc 02 (`Property`, `DealInputs`) and Addendum B (`PortfolioSnapshot`): **no acquisition-date field exists anywhere on the owned-property side of the schema.**

- The "Owned 2021" / "Owned 2022" text visible in `investscape-portfolio-drilldown.html` is decorative mockup copy — not bound to any field.
- `PortfolioSnapshot` is Property-scoped (§1 above), so an `AcquisitionDate` field belongs on `Property` itself, not on `Deal`/`DealInputs` — it needs to be available to both the IRR engine and any future acquisition-cohort snapshot analysis.
- Deal Analyzer's IRR/MIRR machinery currently relies on hold-period and acquisition-date fields that exist only on prospect `Deal`/`DealInputs` records, not on owned `Property` records. This is why portfolio blended IRR is not buildable honestly today — building it now would mean fabricating an investment date and hold horizon per owned property.

**Recommended field addition (not yet built):**

| Field | Type | Default | Notes |
|---|---|---|---|
| `AcquisitionDate` | date | — | set once, at the point a Property transitions to `Owned` status; required input, not backfilled/inferred |

Once present, this single field unblocks: portfolio blended IRR, acquisition-cohort views, and any future "years held" display — without needing a second parallel field anywhere else.

---

## 3. Status

Both items are logged as deferred build work, not resolved in this doc:

- [ ] Build + schedule `snapshot-portfolio` / `snapshot-one-property` backend workflows per Addendum B
- [ ] Add `Property.AcquisitionDate` field; wire into `Owned`-status transition workflow
- [ ] Re-open portfolio blended IRR and benchmark/attribution once both of the above have accumulated real data

No code, schema, or copy changes were made as part of this doc — audit correction and gap logging only.

---
*End of Doc 50 · Corrects: 5f build audit (this session) · Parent docs: 02, 02-Addendum-B, 15, 19*
