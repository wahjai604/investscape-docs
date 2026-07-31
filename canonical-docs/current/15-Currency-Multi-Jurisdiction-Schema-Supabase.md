# InvestScape — Currency & Multi-Jurisdiction Schema (Supabase/Postgres) — Doc 15

**Supersedes the Bubble-based version of Doc 15.** Strictly additive to Doc 02 and its addenda (Supabase revisions). Same Option B design — per-currency subtotals plus a converted grand total with dated-rate disclosure — only the implementation mechanics change.

---

## 1. NEW ENUM

```sql
CREATE TYPE currency AS ENUM ('CAD', 'USD');
-- Extendable later (GBP, AUD, etc.) via ALTER TYPE currency ADD VALUE — no existing rows touched,
-- same non-breaking-extension property the Bubble Option Set had.
```

---

## 2. FIELD ADDITIONS TO EXISTING TABLES

### `properties` — add one column, enforced by trigger (a real upgrade over Bubble's "default value")
```sql
ALTER TABLE properties ADD COLUMN currency currency;

CREATE OR REPLACE FUNCTION set_property_currency() RETURNS trigger AS $$
BEGIN
  IF NEW.currency IS NULL THEN
    NEW.currency := CASE NEW.country WHEN 'Canada' THEN 'CAD' WHEN 'USA' THEN 'USD' END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_property_currency
  BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION set_property_currency();
```
Note on the upgrade this represents: Bubble's version only set this as a form default a user could type over before submit — nothing stopped a client-side bug from saving a mismatched pair. This trigger runs at the database layer regardless of what WeWeb sends, so a Canadian property literally cannot land in the table with `currency` unset. A user can still override it after creation via a normal update (the rare "US property tracked in CAD" case) — the trigger only fires on insert when `currency` wasn't explicitly supplied.

### `dev_projects` — add one column, app-set (no trigger — `jurisdiction` is free text, not a strict enum, so automatic derivation isn't reliable the way `country` is)
```sql
ALTER TABLE dev_projects ADD COLUMN currency currency;
```
Same cascade logic as Property in spirit (WeWeb's DevProject-creation workflow sets this from the jurisdiction picker), just not database-enforced — carried over as a known asymmetry from the Bubble version, not a new gap introduced by the pivot.

**Deliberately not added:** a `currency` column on `deal_inputs`, `deal_metrics`, `budget_lines`, `unit_sales`, etc. — unchanged reasoning: those all belong to a `properties` or `dev_projects` row that already has one currency; repeating the field creates a place for it to silently disagree with its parent. A display needing currency looks up the chain (`deals → properties → currency`).

### `portfolio_snapshots.fx_rate_used` — already added
This column was already included in the Doc 02 Addendum B Supabase revision (`fx_rate_used numeric`) — no additional migration needed here. Same purpose as originally specified: the CAD/USD rate applied when a snapshot converted a USD property into the portfolio's display total, frozen at snapshot time.

---

## 3. NEW TABLE

### `fx_rates` (admin/system-managed reference data — not user data)
```sql
CREATE TABLE fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,              -- e.g. "USD/CAD"
  rate numeric NOT NULL,
  as_of_date date NOT NULL,
  source text NOT NULL              -- e.g. "Bank of Canada Valet API" or "FRED"
);

ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON fx_rates FOR SELECT USING (true);
-- No client INSERT/UPDATE policy — only the fetch-fx-rate Edge Function's service-role key writes here.
```

**Population — Supabase Edge Function + `pg_cron`, same family as `snapshot-portfolio` from Doc 02 Addendum B:**
```sql
SELECT cron.schedule(
  'fetch-fx-rate-daily',
  '0 6 * * *',   -- once a day, 06:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/fetch-fx-rate',
    headers := jsonb_build_object('Authorization', 'Bearer <service-role-key>')
  );
  $$
);
```
Edge Function `fetch-fx-rate` pulls the daily rate from the Bank of Canada Valet API (free, no key required) or FRED (already in the stack) and inserts one new `fx_rates` row. **Never overwrite a past row** — the history is what makes `portfolio_snapshots.fx_rate_used` meaningful months later, and what lets a lender-facing export cite the exact rate used on the exact date, same audit-trail logic as everything else in this platform.

---

## 4. Cascade logic — currency follows jurisdiction, it's never an independent choice

Unchanged reasoning from the original, now with §2's trigger doing the enforcement for Property specifically: `Country = Canada → Currency = CAD`, `Country = USA → Currency = USD`. This is a default set once at creation, not a live-linked calculation — a user can still override it in the rare case they need to (e.g. a Canadian citizen who genuinely wants a US property tracked in CAD). The default removes the contradictory-state problem for the 99% case without taking away control, and for Property it's now impossible to accidentally skip.

**Loan currency = property currency, always, at MVP.** Cross-border financing (CAD loan against a USD property) is a real but rare scenario — flagged, not built. Revisit only if a real user actually needs it.

---

## 5. Portfolio aggregation — the actual fix for the mixed-total bug

The Portfolio "Total Value" card stays two numbers, not one silently-wrong one:

```
Total Value
CA$ 4,020,000 · US$ 1,562,000
≈ CA$ 6,158,940 total (converted at 1 USD = 1.394 CAD, Jul 15 2026, Bank of Canada)
```

**Supabase implementation — a SQL function instead of a Bubble backend workflow** (this one's simple enough not to need a separate Edge Function; a Postgres function callable directly from WeWeb via RPC is the cleaner fit):

```sql
CREATE OR REPLACE FUNCTION get_portfolio_totals(p_user_id uuid)
RETURNS TABLE (cad_subtotal numeric, usd_subtotal numeric, converted_total numeric, fx_rate numeric, fx_as_of date, fx_source text)
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with the function owner's privileges so it can read fx_rates regardless of caller's RLS grants
AS $$
DECLARE
  v_home_currency currency;
  v_rate numeric;
  v_as_of date;
  v_source text;
  v_cad numeric;
  v_usd numeric;
BEGIN
  SELECT country INTO v_home_currency FROM profiles WHERE id = p_user_id;  -- home currency = user's Country-implied currency, same as the Bubble version's rule

  SELECT COALESCE(SUM(purchase_price), 0) INTO v_cad
    FROM properties p JOIN deal_inputs di ON di.deal_id = (SELECT id FROM deals WHERE deals.property_id = p.id ORDER BY created_at DESC LIMIT 1)
    WHERE p.user_id = p_user_id AND p.currency = 'CAD';

  SELECT COALESCE(SUM(purchase_price), 0) INTO v_usd
    FROM properties p JOIN deal_inputs di ON di.deal_id = (SELECT id FROM deals WHERE deals.property_id = p.id ORDER BY created_at DESC LIMIT 1)
    WHERE p.user_id = p_user_id AND p.currency = 'USD';

  SELECT rate, as_of_date, source INTO v_rate, v_as_of, v_source
    FROM fx_rates WHERE pair = 'USD/CAD' ORDER BY as_of_date DESC LIMIT 1;

  RETURN QUERY SELECT v_cad, v_usd,
    CASE WHEN v_home_currency = 'Canada' THEN v_cad + (v_usd * v_rate) ELSE v_usd + (v_cad / v_rate) END,
    v_rate, v_as_of, v_source;
END;
$$;
```
WeWeb calls this via a Supabase RPC action bound to the Portfolio page. Every KPI card that's a pure ratio (cap rate, cash-on-cash, occupancy %) needs **no currency treatment at all** — ratios are currency-agnostic, unchanged from the original note.

**Which currency is the "home" one for the converted total?** Unchanged: the user's own `Country`-implied currency (Canada → convert everything into CAD; USA → convert everything into USD).

---

## 6. Display convention — when to show currency prefixes

Unchanged from the original, not a Bubble-specific concern:

- **Single-currency context** (a Deal page, a Dev Studio project, a Property drilldown): one currency badge near the page title ("All figures in CAD"), plain `$` everywhere else.
- **Mixed context** (Portfolio table, cross-deal comparisons, any export): every dollar figure gets an explicit `CA$` / `US$` prefix, never a bare `$`.
- **French-Canadian formatting note (ties to Doc 13):** fr-CA formats currency as `1 234 567 $` — symbol after the number, space thousands-separators. Still a locale/number-formatting concern for whoever builds the language switcher, unaffected by the platform pivot.

---

## 7. Export / lender-facing report convention

Unchanged: per-asset figures in native currency; one selectable "Report Currency" at export time (defaults to home currency per §5, overridable — e.g. for a US-lender application); footnote on every export: *"Converted at 1 USD = [rate] CAD, [source], as of [date]. Figures are user-entered and unaudited. This report is an analysis tool output, not a certified accounting or appraisal document."*

---

## Claude Design prompt — fix the mixed-currency total in the active prototype

*Unchanged from the original — this prompt targets the HTML/JS prototype layer, which is platform-agnostic regardless of what's behind it in production.*

```
The Portfolio page's "Total Value" KPI card currently sums all properties
into one dollar figure regardless of currency (e.g. a Burnaby, BC property
and an Austin, TX property both get added into one "$" total as if they're
the same currency). Fix this:

1. Split the Total Value card into two lines: per-currency subtotals first
   (e.g. "CA$4,020,000 · US$1,562,000"), then a converted grand total below
   in smaller text (e.g. "≈ CA$6,158,940 total"), with a small info icon
   next to it. Hovering or tapping the info icon shows: "Converted at 1 USD
   = 1.394 CAD, Bank of Canada, Jul 15 2026."
2. In the property table, every Value and Cash Flow/Mo cell should show an
   explicit currency prefix — "CA$" or "US$" — never a bare "$", since this
   table mixes both currencies.
3. Ratio-based columns (Cap Rate, Occupancy) need no currency treatment —
   leave those exactly as they are.
4. Use DM Mono for all figures, matching the existing style, and keep the
   converted-total line visually secondary (smaller, text-secondary color)
   to the per-currency subtotals, which stay primary/prominent — the
   subtotals are the honest number, the conversion is a convenience.
```

---
*End of Doc 15 (Supabase revision) · Supersedes: Bubble-based Doc 15 · Depends on: 02-Database-Schema-Supabase.md, 02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md · Related: 08 (Pricing/Packaging), 12 (Pre-Port Advisory Review §2.1), 13 (Language System — fr-CA currency formatting)*
