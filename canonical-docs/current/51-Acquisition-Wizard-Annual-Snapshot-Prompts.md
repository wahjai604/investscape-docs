# InvestScape — Doc 51: Acquisition Wizard + Annual PortfolioSnapshot Prompts

**Two prompts, run sequentially — not bundled.** Paste Prompt 5g, let it finish, screenshot-verify, then move to Prompt 5h. This is the same discipline as Doc 16: mixed-scope prompts get shallow fixes across everything instead of solid fixes on anything.

Resolves the two deferred items logged in Doc 50 (§2 AcquisitionDate gap, §1/§3 PortfolioSnapshot cadence). Reuses the MIRR/XIRR confirm-gate pattern (Stage 1 Prompt 1a) and the Quick/Full Proforma tiered-capture pattern (Doc's 1a.2/1a.4) rather than inventing new UI language.

---

## Prompt 5g — Acquisition & Hold Assumptions Wizard

*Unblocks `Property.AcquisitionDate` (Doc 50 §2). Tiered capture — user chooses how much to fill in now.*

```
Add a new wizard for capturing acquisition and hold data on owned
properties, and gate portfolio IRR behind it the same way MIRR/XIRR are
already gated behind their rate assumptions.

WIZARD STRUCTURE — three steps, only the first is mandatory:

1. REQUIRED — Acquisition Date. A single date picker: "When did you
   acquire this property?" This is the only field that must be filled to
   close the wizard. Nothing else in the app should require it.

2. OPTIONAL, collapsed by default — Hold Period Assumption. "How long do
   you plan to hold this property?" A number input in years, with a short
   explainer: "Used to project blended portfolio IRR. You can change this
   anytime." Include a "Skip for now" link that closes just this step
   without losing Step 1's data.

3. OPTIONAL, collapsed by default — Appreciation Assumption. "What annual
   appreciation rate should we assume?" A percentage input, same
   "Skip for now" pattern. Directly under the input, add the same class of
   disclaimer already used elsewhere for user-set return assumptions:
   "This is an assumption you set, not a market forecast or guarantee."

Steps 2 and 3 can be filled, skipped, or left for later independently of
each other — don't force sequential completion.

TRIGGER POINTS (both, not just one):

A. Auto-launch: whenever a property/deal's status changes to "Owned",
   open this wizard automatically as a modal, defaulting to today's date
   pre-filled in Step 1 (user can change it).

B. Manual backfill: on the Portfolio holdings table, any property missing
   an Acquisition Date shows a small badge — reuse the existing
   "READ-ONLY" badge's visual weight and placement but with different
   copy: "MISSING DATA" in the same style. Clicking the badge or the row's
   overflow menu opens the same wizard, pre-filled with whatever partial
   data already exists (e.g. if Hold Period was set previously but not
   Appreciation, show Step 2 already filled and Step 3 still open).

GATING — reuse the MIRR/XIRR pattern exactly:

Wherever portfolio blended IRR would render (Portfolio summary KPI card,
any future rollup view), if Hold Period or Appreciation Assumption is
missing on ANY property being rolled up, show the same greyed/gated card
pattern already used for MIRR — short reason text ("Add hold period and
appreciation assumptions for all properties to see blended IRR") and a
link that opens the wizard for whichever property is missing data. A
single property missing data should gate the portfolio-level number, not
silently exclude that property from the average.

Do NOT gate Acquisition Date itself behind anything — it's the one
mandatory field and should never show a "missing" empty state once
entered; it just quietly exists as a fact on the property.

Localize all wizard copy, the disclaimer, and the "MISSING DATA" badge in
all four languages (EN / fr-CA / zh-Hant / zh-Hans), matching the existing
localization pattern.
```

---

## Prompt 5h — Annual Portfolio Snapshot & Year-End Record

*Prototypes the annual (not monthly) cadence and the interim-vs-locked report distinction from Doc 50 §1. Run only after 5g is verified — the "MISSING DATA" state from 5g should already exist so this prompt's report views can honestly reflect it.*

```
Add an annual portfolio reporting feature with two distinct states: an
always-available interim report, and a once-a-year locked official
record.

INTERIM REPORT (available anytime):

1. On the Portfolio page, add a "Download Report" action near the
   existing Recalculate control. Clicking it generates a print-styled,
   single-page report view (use a print stylesheet / window.print()
   pattern rather than a real PDF library — this is a prototype) titled
   "Portfolio Report — As of [today's date]".

2. Contents: portfolio total value (per-currency subtotals + converted
   grand total, matching the existing currency treatment), total equity,
   concentration risk section, portfolio stress-tested DSCR, and a
   per-property table (address, value, equity, cash flow). Include the
   standard disclaimer component at the bottom, same as every other
   computed-metric surface.

3. This report is always labeled "Interim — As of [date]" in a visible
   small-caps tag near the title, and is never saved anywhere — it's
   generated fresh from live data every time, same underlying numbers as
   whatever the page currently shows.

YEAR-END RECORD (locks once a year, Jan 1–Dec 31 cycle):

4. Add a "Historical Records" panel/tab within Portfolio, empty by
   default with a simple empty state ("Your year-end records will appear
   here starting January 1").

5. Simulate the year-end lock with a small dev-only toggle in the
   prototype (e.g. "Simulate: Dec 31 close" button, clearly marked as a
   testing aid, not part of the real product) that generates one Year-End
   Record: same content as the interim report, but labeled "Official
   Year-End Record — [Year]" with a small lock icon, and added as a row
   in the Historical Records panel. Once created, a Year-End Record is
   read-only and cannot be regenerated or edited — it's the frozen
   version of that year, same principle already used for Scenario
   snapshots in Dev Studio.

6. Each row in Historical Records shows: year, portfolio total value,
   total equity, and a "Download" action that reopens that year's locked
   report exactly as it was generated. List newest year first.

7. Add a one-line explainer above the Historical Records panel: "Each
   year's record is frozen once created and won't change even as your
   portfolio does — a permanent reference point for the following year."

Do not touch Deal Analyzer, Dev Studio, or the MIRR/XIRR gating from
Prompt 5g — this prompt is scoped to the Portfolio tab's reporting
surface only. Localize all new copy in all four languages.
```

---

## Schema/backend note (not a Claude Design prompt — flag for the Bubble build pass)

Once both prototype passes above are verified, two backend items follow from this session that live outside Claude Design:

1. **`Property` schema addition** (per Doc 50 §2): `AcquisitionDate` (date, required at Owned transition), `HoldPeriodAssumptionYears` (number, optional), `AppreciationAssumptionPctAnnual` (number, optional).
2. **`PortfolioSnapshot` cadence revision**: `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md` currently specs a *monthly* scheduled workflow (`snapshot-portfolio`) and Stage E2's ApexCharts categories assume monthly buckets ('Jan 2026', 'Feb 2026'...). Per this session's decision, cadence changes to **annual (calendar year, locks at Dec 31)** — the scheduled workflow trigger, the `PeriodDate` normalization, and the Stage E2 chart categories (year labels, not month labels) all need updating to match. This is a revision to Addendum B, not a new doc — recommend a short Addendum C once the prototype pass above is verified and stable.

---
*End of Doc 51 · Resolves: Doc 50 §2 (AcquisitionDate), Doc 50 §1/§3 (PortfolioSnapshot cadence) · Reuses: Stage 1 Prompt 1a (MIRR/XIRR gate pattern), Doc 02 Addendum A (Scenario frozen-snapshot principle) · Follow-up: Addendum C to 02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md*
