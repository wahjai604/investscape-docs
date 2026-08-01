# InvestScape — Doc 51: Portfolio Rollup, Acquisition Wizard & Dual-Cadence Snapshot Prompts

**Three prompts, run sequentially — not bundled.** Paste Prompt 5f, let it finish, screenshot-verify, then Prompt 5g, screenshot-verify, then Prompt 5h. This is the same discipline as Doc 16: mixed-scope prompts get shallow fixes across everything instead of solid fixes on anything. **Order matters here more than usual — 5g's own gating logic explicitly targets "the Portfolio summary KPI card, any future rollup view" (its own words), which means 5g was written assuming 5f's rollup view already exists to gate. Run 5f first, or 5g's gating instruction has nothing to attach to.**

Resolves: the E11 portfolio rollup gap (Doc 54, now fixed at the calc-engine level — see 5f's own note on why the prototype and the engine were never actually the same problem), and the two deferred items logged in Doc 50 (§2 AcquisitionDate gap, §1/§3 PortfolioSnapshot cadence). Reuses the MIRR/XIRR confirm-gate pattern (Stage 1 Prompt 1a) and the Quick/Full Proforma tiered-capture pattern (Doc's 1a.2/1a.4) rather than inventing new UI language.

**How these three prompts interact, stated plainly before running any of them:**
- **5f builds the rollup view itself** — the portfolio-level KPI card and detail panel that 5g's gating logic needs to exist, and that 5h's interim/year-end reports pull their "concentration risk" and "portfolio stress-tested DSCR" content from. Nothing downstream works without this one running first.
- **5g builds the data-completeness gate** — it doesn't touch 5f's rollup UI directly, but it wraps around whatever blended-IRR number 5f's view displays, greying it out per-property until acquisition/hold data exists. If 5f hasn't run, there's no card for 5g's gate to wrap.
- **5h builds the reporting layer on top of both** — its "concentration risk section" and "portfolio stress-tested DSCR" fields are the same numbers 5f's rollup view computes, just formatted for a printable report instead of a live dashboard. 5h's interim report should read as live as 5f's own KPI card, not as a separately computed value — same underlying query, two different presentations. If 5g's gate is active (missing acquisition data), 5h's report should show the same "gated, add assumptions" state 5f/5g already established, not silently show a wrong number.

---

## Prompt 5f — Portfolio Rollup View (concentration risk, blended IRR, stress-tested DSCR floor)

*Unblocks E11 (Doc 54). Builds the actual portfolio-level analysis view that 5g's gating logic and 5h's reports both depend on — this closes the gap Doc 54 found between "the calc engine computes this correctly" and "the prototype has never shown it."*

*Grounded in the calc engine's actual, verified output shape (`portfolio.ts` — `rollupPortfolio()`), not invented field names: `pooledPortfolioIRR` (the true blended IRR, pooled cash-flow method, confirmed correct against an independent hand calculation — not the old per-property-averaged figure), `propertyIRRs` (each property's own IRR, kept for display alongside the pooled figure, never presented as if it were the portfolio number), `totalEquityInvested`, `totalAnnualNetCashFlow`, `portfolioDSCRFloor` (the weakest-covered property's DSCR — the floor, not an average), `totalPortfolioValue`, and `concentrationRisk` (each property's percent of total portfolio value).*

```
Add a Portfolio Rollup view — the portfolio-level analysis that currently
doesn't exist anywhere in the prototype, distinct from the existing
per-property holdings table.

LOCATION: a new section on the Portfolio page, above the existing
holdings table, OR a dedicated sub-tab ("Overview" vs. "Holdings") if
that reads cleaner — use your judgment on layout, but the rollup content
below must be the first thing a user sees when they land on Portfolio,
not something they scroll past the table to find.

CONTENT — four KPI cards in a row, matching the existing KPI card style
from Deal Analyzer:

1. BLENDED PORTFOLIO IRR. The headline number. Label it exactly
   "Blended IRR" with a small info icon; the tooltip/expander explains:
   "Calculated by pooling every property's cash flows into one combined
   stream and solving IRR once — not by averaging each property's
   individual IRR, which would overweight smaller, faster-turning
   properties and understate the portfolio's true return." This
   explanation matters: a previous version of this calculation
   incorrectly averaged individual IRRs, and the distinction is worth
   surfacing to a sophisticated user, not hiding as an implementation
   detail.

2. TOTAL EQUITY INVESTED. Simple sum across all properties, mono-font
   dollar figure, no calculation nuance to explain.

3. PORTFOLIO DSCR FLOOR. Label it "Weakest Coverage" with the DSCR
   number, and name which property it belongs to directly beneath the
   number in small text (e.g. "142 Maple Grove Ave — 1.15"). This is
   deliberately the floor, not an average — a portfolio-wide average DSCR
   would hide a single at-risk property; showing the floor surfaces it.

4. TOTAL PORTFOLIO VALUE. Simple sum, matching the existing per-currency
   subtotal + converted grand total treatment already used elsewhere for
   multi-currency portfolios.

BELOW THE KPI ROW — two more elements:

5. CONCENTRATION RISK panel: a horizontal stacked bar (or a simple
   donut, match whichever existing chart pattern reads cleaner at a
   glance) showing each property's percentage of total portfolio value.
   Label each segment with the property address (abbreviated) and its
   percentage. If any single property exceeds 40% of total portfolio
   value, add a small warning pill next to that segment: "Concentrated"
   — this is a real risk signal, not decoration.

6. PER-PROPERTY IRR TABLE (collapsed by default under "Show individual
   property returns"): each property's own IRR listed separately from
   the blended figure at the top, so a user can see both the portfolio
   number and how each property contributes to it without the two being
   confused for each other.

DISCLAIMER: standard reusable disclaimer component at the bottom of this
whole section, same as every other computed-metric surface.

GATING PLACEHOLDER (do not build the actual gate here — that's Prompt
5g, run next): for now, if any property in the portfolio is missing an
acquisition date, show the Blended IRR card in a simple "—" placeholder
state with the text "Add acquisition dates to calculate blended IRR"
underneath. Prompt 5g will replace this placeholder with the real
per-property gating pattern; this prompt just needs to not crash or show
a wrong number in the interim.

Do not touch Deal Analyzer, Dev Studio, or the existing per-property
holdings table below this new section — this prompt is additive only.
Localize all new copy in all four languages.
```

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

GATING — reuse the MIRR/XIRR pattern exactly, and replace Prompt 5f's
placeholder gate with the real one:

On the Blended IRR card in the Portfolio Rollup view built in Prompt 5f
(replace that prompt's simple "—" placeholder), if Hold Period or
Appreciation Assumption is missing on ANY property being rolled up, show
the same greyed/gated card pattern already used for MIRR — short reason
text ("Add hold period and appreciation assumptions for all properties to
see blended IRR") and a link that opens the wizard for whichever property
is missing data. A single property missing data should gate the
portfolio-level number, not silently exclude that property from the
average. This same gate should also apply everywhere else the blended IRR
number might appear later (e.g. Prompt 5h's reports) — build it once here
as the canonical gated state, not per-surface.

Do NOT gate Acquisition Date itself behind anything — it's the one
mandatory field and should never show a "missing" empty state once
entered; it just quietly exists as a fact on the property.

Localize all wizard copy, the disclaimer, and the "MISSING DATA" badge in
all four languages (EN / fr-CA / zh-Hant / zh-Hans), matching the existing
localization pattern.
```

---

## Prompt 5h — Annual Portfolio Snapshot & Year-End Record

*Prototypes both cadences side by side — the annual Year-End Record (this prompt's original scope) plus a monthly trend view, per project preference to see both in Claude Design before deciding what carries into the TypeScript calc engine. See Doc 02 Addendum B §6 for the dual-cadence schema this depends on. Run only after 5f and 5g are both verified — this prompt's report views pull their numbers directly from 5f's rollup view and need 5g's "MISSING DATA" gating to already exist so the report can honestly reflect a gated state rather than showing a wrong number.*

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

2. Contents: reuse the exact numbers from Prompt 5f's Portfolio Rollup
   view — portfolio total value (per-currency subtotals + converted grand
   total, matching the existing currency treatment), total equity,
   concentration risk section, and portfolio DSCR floor — plus a
   per-property table (address, value, equity, cash flow). This report is
   a different presentation of the same live numbers 5f's KPI cards show,
   not a separately computed value — if 5f's Blended IRR card is in Prompt
   5g's gated state when this report is generated, show that same gated
   state here too ("Blended IRR — add acquisition/hold data to calculate"),
   never a stale or silently-omitted number. Include the standard
   disclaimer component at the bottom, same as every other computed-metric
   surface.

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

MONTHLY TREND VIEW (separate from both of the above — this is the
other cadence, added so both can be compared side by side in this
prototype):

8. Add a third section, "Equity Trend," below the Historical Records
   panel. This is a line or area chart plotting portfolio total equity
   over time, one point per month, using the same monthly-snapshot data
   Stage E2's chart already specs (Doc 02 Addendum B §5) — reuse that
   chart's config and styling rather than inventing a new chart type.

9. Unlike the interim report and the Year-End Record, this view has no
   "generate" action and no locked state — it simply renders whatever
   monthly snapshot data exists, live, the same always-current
   treatment as 5f's KPI cards. If fewer than 2 months of data exist,
   show a simple empty state: "Your equity trend will build up here as
   monthly snapshots accumulate."

10. Add a one-line explainer above this section, distinguishing it
    from the two views above it: "Updates monthly to show your
    portfolio's trajectory — unlike your Year-End Records, this view
    always reflects where things stand right now."

Do not touch Deal Analyzer, Dev Studio, or the MIRR/XIRR gating from
Prompt 5g — this prompt is scoped to the Portfolio tab's reporting
surface only. Localize all new copy in all four languages.
```

---

## Schema/backend note (not a Claude Design prompt — flag for the WeWeb/Supabase build pass)

Once all three prototype passes above are verified, three backend items follow from this session that live outside Claude Design:

1. **Portfolio Rollup view (Prompt 5f) — no new schema needed, only wiring.** The calc engine's `rollupPortfolio()` function (`portfolio.ts`) already returns every field this prompt's UI needs (`pooledPortfolioIRR`, `propertyIRRs`, `totalEquityInvested`, `totalAnnualNetCashFlow`, `portfolioDSCRFloor`, `totalPortfolioValue`, `concentrationRisk`) — this was confirmed fixed and independently re-verified (see Doc 01 §0's update note). The WeWeb build task is calling this function and binding its output to the KPI cards 5f specs, not building new calculation logic. Per Doc 54 §7, the calc engine currently has no HTTP layer — that needs to exist before this prompt's real build (not the Claude Design prototype) can call it.
2. **`properties` schema addition** (per Doc 50 §2, unblocked by Prompt 5g): `acquisition_date` (date, required at Owned transition), `hold_period_assumption_years` (number, optional), `appreciation_assumption_pct_annual` (number, optional).
3. **`portfolio_snapshots` cadence — resolved as "build both."** `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md` originally specced a *monthly* scheduled workflow; this session's decision wanted annual instead. Rather than pick one, `02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md` §6 now runs both as separate `pg_cron` jobs (`snapshot-portfolio-monthly` and `snapshot-portfolio-annual`) writing to the same table, distinguished by a new `snapshot_type` column. Monthly feeds Stage E2's trend chart; annual feeds this document's own Prompt 5h below. Per project preference, both get built out in Claude Design first — see Prompt 5h's own note — before either is committed to the calc engine. **Note: this item is unaffected by adding Prompt 5f** — 5f's rollup view reads live from `deal_metrics`/`properties` via the calc engine, not from `portfolio_snapshots`.

---
*End of Doc 51 · Resolves: E11 portfolio rollup gap (Prompt 5f, per Doc 54), Doc 50 §2 (AcquisitionDate, Prompt 5g), Doc 50 §1/§3 (PortfolioSnapshot cadence, Prompt 5h — resolved as dual-cadence per `02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md` §6, both monthly and annual jobs built side by side in Claude Design before either is committed to the calc engine) · Reuses: Stage 1 Prompt 1a (MIRR/XIRR gate pattern), Doc 02 Addendum A (Scenario frozen-snapshot principle), Doc 02 Addendum B §5 (Stage E2 chart config, reused for the monthly trend view) · Next: run Prompt 5h in Claude Design, compare both cadences against real (or simulated) data, then decide what — one, the other, or both — carries into the TypeScript calc engine*
