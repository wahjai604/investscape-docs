# InvestScape — Database Schema Addendum B: PortfolioSnapshot (Supabase/Postgres) — Doc 02 Addendum B

**Supersedes `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md`.** Strictly additive to Doc 02 (Supabase revision) and Addendum A — same reasoning as before: this is a core-schema addition to the Portfolio module, not Development Studio, and it's needed for Free/Pro tiers too, since any user with more than one snapshot in time benefits from seeing equity grow. Nothing about *why* this table exists has changed; only its mechanism has.

**Naming note:** the table below is named `portfolio_snapshots` (plural, snake_case) because `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` §2–3 already references it under that name and adds an `fx_rate_used` column to it. That document was written assuming this rewrite existed — this is the rewrite. Build this table first, then apply Doc 15's `ALTER TABLE` for the FX column.

**Why per-property, not per-user:** unchanged from the Bubble version. Storing one row per property per period, rather than one pre-summed portfolio total, means the portfolio-wide equity-growth chart comes for free by summing across a user's properties, and a future per-property equity history chart costs nothing extra. Never store the same fact two ways — that principle didn't depend on the platform underneath it, and it still doesn't.

---

## 1. NEW TABLE

### `portfolio_snapshots` (belongs to `properties`)

```sql
CREATE TYPE snapshot_cadence AS ENUM ('monthly', 'annual');

CREATE TABLE portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  snapshot_type snapshot_cadence NOT NULL DEFAULT 'monthly',
                                           -- distinguishes the two parallel jobs (§2) writing to this same
                                           -- table — 'monthly' feeds Stage E2's trend chart, 'annual' feeds
                                           -- Prompt 5h's locked Year-End Record. See §6 for why both exist
                                           -- rather than picking one cadence.
  period_date date NOT NULL,              -- normalized to the 1st of the month (monthly rows) or Dec 31
                                           -- (annual rows) at write time, so every user's snapshots of the
                                           -- same type line up on the same x-axis categories
  property_value numeric,                 -- current estimated value at time of snapshot
  loan_balance numeric,                   -- outstanding balance across all mortgages on this property
                                           -- at time of snapshot
  equity numeric GENERATED ALWAYS AS (property_value - loan_balance) STORED,
                                           -- frozen at write time via a generated column, not recomputed
                                           -- later — a snapshot is a snapshot, same principle as `scenarios`
                                           -- in Addendum A. A generated column is a genuine Postgres upgrade
                                           -- here: Bubble's version needed a workflow step to calculate and
                                           -- store this; Postgres derives and freezes it from the other two
                                           -- values in the same row, automatically, every time.
  cash_flow_for_period numeric,           -- pulled from that period's deal_metrics.cash_flow_monthly at
                                           -- write time — optional now, but costs nothing to capture and
                                           -- unlocks a future "cash flow over time" chart for free
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_snapshots_property_period ON portfolio_snapshots (property_id, snapshot_type, period_date);
```

`fx_rate_used` is deliberately not listed here, for the same reason `properties.currency` isn't in base Doc 02 — it's added by `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` §2 via `ALTER TABLE` once this table exists. Build in that order: this table, then Doc 15's column.

---

## 2. Populating it — Edge Function + `pg_cron`, not a Bubble scheduled workflow

The Bubble version's two-step chain (`snapshot-portfolio` searches all properties, then schedules `snapshot-one-property` once per result) doesn't map onto Postgres as two separate jobs — a single scheduled SQL statement can do the whole fan-out in one pass, since `INSERT ... SELECT` is exactly the "for every property, write one row" operation the old two-workflow chain existed to simulate around Bubble's lack of set-based operations.

```sql
SELECT cron.schedule(
  'snapshot-portfolio-monthly',
  '0 6 1 * *',      -- 06:00 UTC on the 1st of every month
  $$
  INSERT INTO portfolio_snapshots (property_id, snapshot_type, period_date, property_value, loan_balance, cash_flow_for_period)
  SELECT
    p.id,
    'monthly',
    date_trunc('month', now())::date,
    -- current estimated value — see "known MVP simplification" below for what this actually
    -- resolves to today
    COALESCE(p.manual_value_update, di.purchase_price),
    -- outstanding loan balance — see the same simplification note; this is LoanAmount as a
    -- placeholder until amortization payoff tracking exists
    dm.loan_amount,
    dm.cash_flow_monthly
  FROM properties p
  JOIN deals d ON d.property_id = p.id
  JOIN deal_inputs di ON di.deal_id = d.id
  JOIN deal_metrics dm ON dm.deal_id = d.id
  WHERE d.id = (
    -- most recent deal per property, same "most recent linked Deal" rule as the Bubble version
    SELECT id FROM deals WHERE property_id = p.id ORDER BY created_at DESC LIMIT 1
  );
  $$
);

SELECT cron.schedule(
  'snapshot-portfolio-annual',
  '0 7 31 12 *',    -- 07:00 UTC on Dec 31 every year — an hour after the monthly job, so if both fire
                     -- on the same calendar day they don't race each other for the same connection slot
  $$
  INSERT INTO portfolio_snapshots (property_id, snapshot_type, period_date, property_value, loan_balance, cash_flow_for_period)
  SELECT
    p.id,
    'annual',
    make_date(EXTRACT(year FROM now())::int, 12, 31),
    COALESCE(p.manual_value_update, di.purchase_price),
    dm.loan_amount,
    dm.cash_flow_monthly
  FROM properties p
  JOIN deals d ON d.property_id = p.id
  JOIN deal_inputs di ON di.deal_id = d.id
  JOIN deal_metrics dm ON dm.deal_id = d.id
  WHERE d.id = (
    SELECT id FROM deals WHERE property_id = p.id ORDER BY created_at DESC LIMIT 1
  );
  $$
);
```

Same query shape, deliberately — the only differences are the cron schedule, the literal `snapshot_type` value, and how `period_date` is computed (month-start vs. year-end). Keeping the two jobs structurally identical means a future fix to one (e.g., swapping in a real `manual_value_update` column, or wiring in Doc 5d's per-tranche amortized balance instead of the placeholder `loan_amount`) is a mechanical copy to the other, not a second independent bug to track down.

This runs as a single scheduled SQL statement rather than an Edge Function, because the whole operation is a set-based `INSERT ... SELECT` with no external API call and no calc-engine involvement — it's arithmetic Postgres can do in one pass (`equity` derives itself via the generated column), which is exactly the kind of "simple enough not to need an Edge Function" case Doc 15 §3 already established as the dividing line for this stack. Compare Doc 15's own `fetch-fx-rate` job, which *is* an Edge Function, because it calls an external API (Bank of Canada Valet) that SQL alone can't reach.

**`p.manual_value_update`** doesn't exist yet in Doc 02's `properties` table — it's referenced here as the intended future column for a user- or feed-driven value update (Phase 2, e.g. Rentcast). Until it's built, `COALESCE` falls through to `purchase_price`, which is the same placeholder behavior the Bubble version described.

**Known MVP simplification — unchanged from the Bubble version, still true here:** until property values are updated by the user or an external data feed, `property_value` will read the same as `purchase_price` every month, meaning `equity` will only change as the loan amortizes, not from market appreciation. This is honest and fine for MVP. The AI narrative layer must not claim market-driven equity growth from this data until a real value-update mechanism exists — same guardrail as before, still enforced at the calc-engine/narrative layer since the schema itself can't distinguish "real update" from "placeholder" on its own.

**Loan balance is the same known simplification too:** `dm.loan_amount` is the original loan amount, not the amortized balance net of principal paid to date. Doc 5d's per-tranche amortization engine can supply a true running balance once it's wired to this job — flagged here as the same "known simplification, not a bug" the original addendum called out, not silently fixed by the platform switch.

---

## 3. ROW-LEVEL SECURITY — addition to Doc 02 §3

```sql
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_portfolio_snapshots_read" ON portfolio_snapshots FOR SELECT USING (
  property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
);
-- No INSERT/UPDATE/DELETE policy for the authenticated client role — only the scheduled
-- pg_cron job (running with database owner privileges, not through PostgREST/RLS at all)
-- writes these rows. This is the same single-writer principle as deal_metrics in Doc 02 §2,
-- enforced the same way: by the absence of a client-facing write policy, not by convention.
```

---

## 4. RELATIONSHIP DIAGRAM — addition to Doc 02 §4

```
properties ──< portfolio_snapshots
```

---

## 5. Feeds directly into ApexCharts Stage E2

With this in place, Stage E2 of Doc 03 Addendum B (Portfolio: Equity Growth) has real data to chart, same as before. Revised config — **stack Equity against LoanBalance**, not a single Equity series, so the bar shows the capital-stack composition changing over time (echoing the same debt/equity stack visual as Doc 06's F-101):

```javascript
chart: { type: "bar", stacked: true, ... },
series: [
  { name: "Equity", data: [/* summed equity across the user's properties, grouped by period_date */] },
  { name: "Debt", data: [/* summed loan_balance across the user's properties, grouped by period_date */] }
],
xaxis: { categories: [/* period_date list, e.g. 'Jan 2026', 'Feb 2026'... */] }
```

**Aggregation, Supabase side:** rather than a Bubble backend workflow (`agg-equity-growth`) writing comma-separated strings for the HTML element to read, this is a single SQL query WeWeb can call directly through Supabase's REST API — no intermediate workflow step required. **Now that this table holds two cadences, every query against it must filter by `snapshot_type` — omitting it would silently mix monthly and annual rows into the same chart:**

```sql
-- Monthly trend chart (Stage E2, above)
SELECT
  period_date,
  SUM(equity) AS total_equity,
  SUM(loan_balance) AS total_debt
FROM portfolio_snapshots
WHERE property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  AND snapshot_type = 'monthly'
GROUP BY period_date
ORDER BY period_date;

-- Annual Year-End Records (Prompt 5h) — same shape, different filter and grain
SELECT
  period_date,
  SUM(equity) AS total_equity,
  SUM(loan_balance) AS total_debt,
  SUM(property_value) AS total_value
FROM portfolio_snapshots
WHERE property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  AND snapshot_type = 'annual'
GROUP BY period_date
ORDER BY period_date DESC;   -- newest year first, matching Prompt 5h's Historical Records list order
```

WeWeb binds each chart/list to its respective query's result set. If either query is reused often enough to be worth naming, wrap it as a Postgres function (`get_equity_growth()` for monthly, `get_year_end_records()` for annual) and call it via RPC — the same "simple enough not to need an Edge Function" reasoning from §2 applies here too, since both are read-only aggregation with no external call.

---

## 6. Status — carried forward from Doc 50, not resolved by this rewrite

**Cadence discrepancy — resolved as "build both," not "pick one."** `51-Acquisition-Wizard-Annual-Snapshot-Prompts.md` recorded a session decision to change this table's cadence from monthly to annual, made without cross-checking this document's already-specced monthly `pg_cron` job. Rather than resolve that by silently picking a side, the decision is: **run both cadences as two separate scheduled jobs against the same `portfolio_snapshots` table**, since they serve genuinely different purposes and neither one supersedes the other:

- **Monthly** (`snapshot-portfolio-monthly`, as already specced in §2 below) — feeds Stage E2's equity-growth chart with enough resolution to show real month-to-month movement, and is the finer-grained data a Portfolio Rollup-style view (Prompt 5f) could eventually chart if a trend view gets added there.
- **Annual** (a second job, `snapshot-portfolio-annual`, locking at Dec 31 calendar year-end) — feeds Prompt 5h's Year-End Record specifically: a small number of permanent, frozen, once-a-year reference points a user can look back on, distinct from a continuously-updating chart.

Both write to the same `portfolio_snapshots` table (§1 below), distinguished by a new `snapshot_type` column (`'monthly'` or `'annual'`) so a single table serves both use cases without duplicating schema. This is a deliberate build-both approach: Doc 03 Addendum B and Prompt 5f are both getting a Claude Design pass before any decision about which one (or both) actually ships to Route 2 — see the note at the end of this section on how that decision gets made.

**Status of the underlying gap Doc 50 originally found, unchanged by this resolution:** neither job has been deployed against a live Supabase project yet. This rewrite makes both schema-ready with working `pg_cron` definitions, but until at least one is actually scheduled, `portfolio_snapshots` still holds zero rows regardless of which cadence(s) are chosen. A monthly job needs a full month before its first real row exists and a full year before the equity-growth chart has enough history to be useful; an annual job needs a full year before its first Year-End Record exists at all. Log this the same way Doc 50 did: an implementation gap against an existing spec, not a missing design.

**How the "which one ships" decision actually gets made:** per project preference, both cadences get built out in Claude Design first — visible, clickable, testable — before either is committed to the TypeScript calc engine. Once both are in front of a real prototype (Prompt 5h, extended to show both a monthly trend view and the annual Year-End Record side by side), the decision about whether Route 2 needs one, the other, or both gets made from what that prototype actually shows, not from documentation alone.

**`Property.AcquisitionDate` — still not built, per Doc 50 §2.** That field belongs on `properties` in base Doc 02, not on this table, and this rewrite doesn't add it — Doc 50 recommended it but marked it not yet built, and that status is unchanged here. Portfolio blended IRR stays blocked on it for the same reason Doc 50 gave: building it without a real acquisition date per property means fabricating an investment date, which this schema is deliberately not designed to do.

---
*End of Doc 02 Addendum B (Supabase revision) · Supersedes: 02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md · Parent: 02-Database-Schema-Supabase.md · Extended by: 15-Currency-Multi-Jurisdiction-Schema-Supabase.md (adds `fx_rate_used`) · Unblocks: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md (Stage E2, itself still pending its own Supabase/WeWeb rewrite per Doc 55) · Status still open per Doc 50 §1–2: job not yet scheduled, `AcquisitionDate` not yet built*
