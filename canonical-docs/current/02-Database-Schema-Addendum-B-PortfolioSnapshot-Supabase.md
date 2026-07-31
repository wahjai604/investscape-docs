# InvestScape — Database Schema Addendum B: PortfolioSnapshot (Supabase/Postgres) — Doc 02 Addendum B

**Supersedes `02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md`.** Strictly additive to Doc 02 (Supabase revision) and Addendum A — same reasoning as before: this is a core-schema addition to the Portfolio module, not Development Studio, and it's needed for Free/Pro tiers too, since any user with more than one snapshot in time benefits from seeing equity grow. Nothing about *why* this table exists has changed; only its mechanism has.

**Naming note:** the table below is named `portfolio_snapshots` (plural, snake_case) because `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` §2–3 already references it under that name and adds an `fx_rate_used` column to it. That document was written assuming this rewrite existed — this is the rewrite. Build this table first, then apply Doc 15's `ALTER TABLE` for the FX column.

**Why per-property, not per-user:** unchanged from the Bubble version. Storing one row per property per period, rather than one pre-summed portfolio total, means the portfolio-wide equity-growth chart comes for free by summing across a user's properties, and a future per-property equity history chart costs nothing extra. Never store the same fact two ways — that principle didn't depend on the platform underneath it, and it still doesn't.

---

## 1. NEW TABLE

### `portfolio_snapshots` (belongs to `properties`)

```sql
CREATE TABLE portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  period_date date NOT NULL,              -- normalized to the 1st of the month at write time, so every
                                           -- user's snapshots line up on the same x-axis categories
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

CREATE INDEX idx_portfolio_snapshots_property_period ON portfolio_snapshots (property_id, period_date);
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
  INSERT INTO portfolio_snapshots (property_id, period_date, property_value, loan_balance, cash_flow_for_period)
  SELECT
    p.id,
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
```

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

**Aggregation, Supabase side:** rather than a Bubble backend workflow (`agg-equity-growth`) writing comma-separated strings for the HTML element to read, this is a single SQL query WeWeb can call directly through Supabase's REST API — no intermediate workflow step required:

```sql
SELECT
  period_date,
  SUM(equity) AS total_equity,
  SUM(loan_balance) AS total_debt
FROM portfolio_snapshots
WHERE property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
GROUP BY period_date
ORDER BY period_date;
```

WeWeb binds the chart's series directly to this query's result set. If the query is reused often enough to be worth naming, wrap it as a Postgres function (`get_equity_growth()`) and call it via RPC — the same "simple enough not to need an Edge Function" reasoning from §2 applies here too, since this is read-only aggregation with no external call.

---

## 6. Status — carried forward from Doc 50, not resolved by this rewrite

Doc 50 already audited this table's design against the 5f build audit and found the *design* was never the gap — the design has existed since the original Bubble addendum. The gap was that the monthly job was never built and scheduled, so the table held zero rows. **That gap is not closed by this document.** This rewrite makes the job schema-ready and gives it a working `pg_cron` definition, but the job still needs to actually be scheduled against a live Supabase project, and it will still take a full month before the first real row exists and a full year before the equity-growth chart has enough history to be useful. Log this the same way Doc 50 did: an implementation gap against an existing spec, not a missing design, and not something a documentation pass alone resolves.

**`Property.AcquisitionDate` — still not built, per Doc 50 §2.** That field belongs on `properties` in base Doc 02, not on this table, and this rewrite doesn't add it — Doc 50 recommended it but marked it not yet built, and that status is unchanged here. Portfolio blended IRR stays blocked on it for the same reason Doc 50 gave: building it without a real acquisition date per property means fabricating an investment date, which this schema is deliberately not designed to do.

---
*End of Doc 02 Addendum B (Supabase revision) · Supersedes: 02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md · Parent: 02-Database-Schema-Supabase.md · Extended by: 15-Currency-Multi-Jurisdiction-Schema-Supabase.md (adds `fx_rate_used`) · Unblocks: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md (Stage E2, itself still pending its own Supabase/WeWeb rewrite per Doc 55) · Status still open per Doc 50 §1–2: job not yet scheduled, `AcquisitionDate` not yet built*
