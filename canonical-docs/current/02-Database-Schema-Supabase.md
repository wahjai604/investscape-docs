# InvestScape — Database Schema (Supabase/Postgres) — Doc 02

**Supersedes `02-Bubble-Database-Schema.md`.** Same tables, same relationships, same field list as the Bubble version — this is a mechanical re-derivation onto Postgres, not a redesign. Nothing in the underlying data model changes; what changes is *where each rule lives*: Option Sets become native Postgres enums, Bubble Privacy Rules become Row-Level Security policies, and "written by the `calc-deal-metrics` workflow" becomes "written by the calc-engine service" throughout.

**The stack this schema is built for:** Supabase (PostgreSQL + Auth + Storage) is the database layer described in this document. WeWeb is the front-end that reads and writes it — WeWeb performs no calculation of its own; every table below is either populated by the user through WeWeb's forms or written by the separate calc-engine service (Doc 03 Stage 3). Where the Bubble version said "open Bubble → Data tab," this version means "open the Supabase SQL Editor"; where it said "the page displays this field," read "the WeWeb collection binds to this column."

**Companion documents, same numbering as before:** Addendum A (Development Studio, already re-derived as `02-Database-Schema-Addendum-A-DevStudio-Supabase.md`) and Addendum B (PortfolioSnapshot — still pending its own Supabase rewrite; see that document's own header once updated). `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` adds a `currency` column to `properties` after this base table exists — build this doc first, then apply Doc 15's `ALTER TABLE`.

**How to use:** Supabase SQL Editor, in this order: enums → auth/profile extension → tables → RLS → verify. Estimated time: roughly the same order of magnitude as the Bubble version's "45–60 minutes of clicking" — most of this is now written SQL instead of form-filling, which is slower to type but faster to review, diff, and re-run.

---

## 1. ENUMS (create these first)

```sql
CREATE TYPE country AS ENUM ('Canada', 'USA');
CREATE TYPE loan_type AS ENUM ('Amortizing', 'Interest-Only');
CREATE TYPE term_type AS ENUM ('Fixed Rate', 'Variable Rate');
CREATE TYPE property_type AS ENUM ('Condo/Apartment', 'Townhouse', 'Detached House', 'Duplex', 'Multi-Family', 'Commercial', 'Land');
CREATE TYPE deal_status AS ENUM ('Analyzing', 'Watching', 'Offer Made', 'Under Contract', 'Owned', 'Passed');
CREATE TYPE subscription_tier AS ENUM ('Free', 'Pro', 'Team', 'Enterprise');
CREATE TYPE grade AS ENUM ('A', 'B', 'C', 'D', 'F');
```

**Lookup tables for the two color-bearing enums** — same pattern Addendum A already established, kept consistent here rather than reaching for a Bubble-style "extra attribute" that Postgres enums don't have:

```sql
CREATE TABLE deal_status_meta (
  status deal_status PRIMARY KEY,
  color text NOT NULL
);

CREATE TABLE subscription_tier_meta (
  tier subscription_tier PRIMARY KEY,
  monthly_price numeric NOT NULL          -- 0, 29, 79, 0 — Team stays parked per Doc 12 §3.4, unpriced until decided
);

CREATE TABLE grade_meta (
  grade grade PRIMARY KEY,
  color text NOT NULL
);
```

Why enums plus a small lookup table for the ones that carry a color or price, rather than a text field: enums are free to query, enforce consistency at the database level (a typo can't silently create a sixth `deal_status`), and are the direct Postgres equivalent of the Option Sets this schema used before — the lookup tables exist only because Postgres enums, unlike Bubble Option Sets, don't carry their own extra attributes.

---

## 2. TABLES

### `profiles` (extends Supabase's built-in `auth.users` — do not create a separate user table)

Supabase's `auth.users` table is managed by the auth system and shouldn't be altered directly. The convention is a `profiles` table with a matching `id`, kept in sync by a trigger on user creation:

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company text,
  role text,                              -- investor / realtor / broker / developer — free text at MVP, same as before
  tier subscription_tier NOT NULL DEFAULT 'Free',
  country country NOT NULL DEFAULT 'Canada',
  stripe_customer_id text,                -- Phase: billing
  onboarding_complete boolean NOT NULL DEFAULT false
);

-- Auto-create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### `properties` (the physical asset)

```sql
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address text,
  city text,
  province_state text,
  country country NOT NULL DEFAULT 'Canada',
  postal_zip text,
  property_type property_type,
  bedrooms numeric,
  bathrooms numeric,
  square_feet numeric,
  year_built numeric,
  parcel_number text,                     -- from the Evaluator sheet's original field
  photo_url text,                         -- Supabase Storage URL, not an uploaded binary column
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

`currency` is deliberately not listed here — it's added by `15-Currency-Multi-Jurisdiction-Schema-Supabase.md` via `ALTER TABLE` once this table exists, together with the trigger that derives it from `country` on insert. Build in that order.

### `deals` (one analysis scenario for a property — a property can have many deals, e.g. "550k offer" vs. "530k offer")

```sql
CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name text,                              -- e.g. "Offer #1"
  status deal_status NOT NULL DEFAULT 'Analyzing',
  ai_narrative text,                      -- Claude API output, written by the calc-engine service
  grade grade,                            -- E20 — screening signal only, never a recommendation; see Doc 12 §1.3
  created_at timestamptz NOT NULL DEFAULT now()
);
```

> **Why a separate `deals` layer:** unchanged reasoning from the original — this is the Evaluator sheet's "Offer #1" tab concept generalized. Scenario comparison ("what if I offer 20k less?") stays a headline feature with zero extra schema work, because each scenario is just another row in this table pointing at the same property.

### `deal_inputs` (everything the user types — mirrors Template v2)

```sql
CREATE TABLE deal_inputs (
  deal_id uuid PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
  purchase_price numeric,
  down_payment_pct numeric NOT NULL DEFAULT 0.20,
  second_mortgage numeric NOT NULL DEFAULT 0,
  buying_cost_pct numeric NOT NULL DEFAULT 0.01,
  initial_improvements numeric NOT NULL DEFAULT 0,
  first_time_buyer boolean NOT NULL DEFAULT false,   -- PTT exemption note
  interest_rate numeric,
  loan_type loan_type NOT NULL DEFAULT 'Amortizing',
  total_period_years numeric NOT NULL DEFAULT 25,
  term_period_years numeric NOT NULL DEFAULT 5,
  term_type term_type NOT NULL DEFAULT 'Fixed Rate',
  monthly_rent numeric,
  other_income_monthly numeric NOT NULL DEFAULT 0,
  vacancy_months numeric NOT NULL DEFAULT 1,
  property_tax_annual numeric,
  strata_fee_monthly numeric NOT NULL DEFAULT 0,
  insurance_pct numeric NOT NULL DEFAULT 0.025,
  property_mgmt_pct numeric NOT NULL DEFAULT 0,
  repairs_pct numeric NOT NULL DEFAULT 0.02,
  other_pct numeric NOT NULL DEFAULT 0.025,
  year1_improvements numeric NOT NULL DEFAULT 0
);
```

Field-for-field identical to the Bubble version, including the Template v2 defaults — this table's contents haven't changed, only its location. `deal_id` as the primary key (rather than a separate `id` plus a unique foreign key) enforces the one-to-one relationship to `deals` at the schema level, which Bubble's field-linking couldn't do on its own.

### `deal_metrics` (computed only — the client never writes this table directly)

```sql
CREATE TABLE deal_metrics (
  deal_id uuid PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
  ptt numeric,
  buying_costs numeric,
  down_payment numeric,
  loan_amount numeric,
  ltv numeric,
  initial_cash_invested numeric,
  monthly_payment numeric,
  gross_rent_annual numeric,
  vacancy_loss_annual numeric,
  operating_income_monthly numeric,
  operating_income_annual numeric,
  insurance_monthly numeric,
  property_mgmt_monthly numeric,
  property_tax_monthly numeric,
  repairs_monthly numeric,
  other_monthly numeric,
  operating_expenses_monthly numeric,
  operating_expenses_annual numeric,
  noi_monthly numeric,
  noi_annual numeric,
  cash_flow_monthly numeric,
  cash_flow_annual numeric,
  break_even_loan numeric,
  break_even_loan_pct numeric,
  break_even_down_payment numeric,
  break_even_down_pct numeric,
  cap_rate_price numeric,
  cap_rate_all_in numeric,
  cash_on_cash numeric,
  dscr numeric,
  grm numeric,
  operating_expense_ratio numeric,
  break_even_ratio numeric,
  price_per_sqft numeric,
  one_percent_rule_pass boolean,
  calc_version text,                      -- the calc-engine's git commit SHA that produced this row — see Doc 54 §6 item 4
  last_calculated timestamptz
);
```

Same field list as the Bubble version, with one addition: `calc_version`. This didn't exist in the original schema because Bubble had no equivalent concept — there was no single artifact whose identity could be stamped onto a row. The calc engine is version-controlled source code, so every response it returns can carry the commit SHA that produced it, making any historical figure exactly reproducible. This directly answers a question the E&O broker brief already asks (04-EO-Insurance-Broker-Brief.pdf, §A) about whether a disputed number from years prior can be reconstructed — with this column, it can.

**Single-writer principle, unchanged and now easier to enforce:** the calc-engine service is the only process that writes to this table. WeWeb reads it and never writes it. This was a policy in the Bubble version (the workflow was the only writer); here it can be enforced directly — grant `UPDATE`/`INSERT` on this table only to the service role the calc engine authenticates as, and give the client role `SELECT` only (see §3).

### `subscriptions` (Phase: billing)

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'Free',
  stripe_subscription_id text,
  status text,                            -- active / past_due / canceled
  current_period_end timestamptz
);
```

---

## 3. ROW-LEVEL SECURITY

This replaces the Bubble version's Privacy Rules section entirely — it isn't a mechanical translation of the same steps, because RLS is a genuinely different (and stricter) mechanism. A Bubble Privacy Rule is enforced by the Bubble runtime whenever a page requests data through the normal client. Postgres RLS is enforced by the database itself, for every query, from any caller, including a service that bypasses the application layer entirely — there's no equivalent to a Bubble backend workflow "running with elevated permissions" unless you explicitly grant that via `SECURITY DEFINER` or the service role key.

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: a user can read and update only their own row
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- properties: owner-only, full access
CREATE POLICY "own_properties" ON properties FOR ALL USING (auth.uid() = user_id);

-- deals / deal_inputs: owner-only, one join deeper — RLS composes through the subquery automatically
CREATE POLICY "own_deals" ON deals FOR ALL USING (
  property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
);
CREATE POLICY "own_deal_inputs" ON deal_inputs FOR ALL USING (
  deal_id IN (SELECT id FROM deals WHERE property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()))
);

-- deal_metrics: owner can READ; only the calc-engine's service role can WRITE
CREATE POLICY "own_deal_metrics_read" ON deal_metrics FOR SELECT USING (
  deal_id IN (SELECT id FROM deals WHERE property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()))
);
-- No INSERT/UPDATE policy for the authenticated client role at all — the calc-engine service
-- connects using the Supabase service role key, which bypasses RLS by design. This is the
-- single-writer principle enforced at the database level, not just by convention.

-- subscriptions: owner can read; all writes happen via the calc-engine/webhook service, never client-side
CREATE POLICY "own_subscription_read" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

**Test:** same test as the Bubble version, adapted — sign in as a second test user (a second row in `auth.users`) and confirm a `SELECT * FROM properties` through the client library returns zero rows belonging to user #1. Run this both from WeWeb itself (log in as user #2 in the actual app and confirm the dashboard shows nothing of user #1's) and directly against the Supabase client outside WeWeb, since RLS is enforced by the database regardless of which client asks — a bug here would leak data through any future client too, not just WeWeb. This is exactly the kind of check worth scripting as an automated test, since RLS bugs are exactly what Doc 12's "informational purposes only" posture depends on nobody being able to see another user's financial data.

---

## 4. RELATIONSHIP DIAGRAM

```
auth.users ──1 profiles
auth.users ──< properties ──< deals ──1 deal_inputs
                                    └──1 deal_metrics
auth.users ──1 subscriptions
```
(`──<` = one-to-many, `──1` = one-to-one — unchanged notation from the Bubble version)

Development Studio's tables (`dev_projects` and everything beneath it) attach to this diagram via `dev_projects.linked_property_id → properties.id` — see Addendum A §4 for the full extended diagram.

---

## 5. What changed, for anyone diffing this against the Bubble version

Kept a short list here deliberately, since Doc 61's inventory flagged this file as the most-cited parent document in the registry — anything that touches it should be able to see at a glance what actually moved versus what's cosmetic.

- **Option Sets → native enums.** No behavior change; enums are still free to query and still enforce a fixed set of values.
- **Privacy Rules → Row-Level Security.** A real change, not just a renamed feature — RLS is enforced by the database for every caller, including anything that bypasses the application layer. Genuinely stricter, not just relocated.
- **`User` (extend Bubble's built-in type) → `profiles` (extends `auth.users` via a trigger).** Same purpose, different mechanic — Postgres/Supabase separates authentication identity from application-level profile data by convention; this schema follows that convention rather than fighting it.
- **"Written by the `calc-deal-metrics` backend workflow" → "written by the calc-engine service."** Same single-writer principle, same table, different process — the calc engine (Doc 03 Stage 3, now a standalone TypeScript service) is the only thing with write access to `deal_metrics`, enforced here via RLS/service-role separation rather than by Bubble workflow convention alone.
- **New column: `deal_metrics.calc_version`.** Did not exist in the Bubble version because there was no equivalent artifact to version. Now there is — see the note under `deal_metrics` above.
- **Field names: PascalCase → snake_case.** Cosmetic, but worth stating plainly: Doc 52 §3 (correcting Doc 12 §4.1) already noted that this removes the naming-discipline risk the original review worried about, since there's no longer a translation step between "how Bubble stores it" and "how the eventual Route 2 schema would store it" — this schema *is* the Route 2 schema.
- **Bubble pages → WeWeb collections.** The Bubble version's pages read and wrote data through Bubble's own data-binding layer. WeWeb binds to this schema the same way any Postgres client would — through Supabase's auto-generated REST/JS API for reads and simple writes, and through calls to the calc-engine service for anything requiring calculation. WeWeb holds no schema of its own to keep in sync with this one; it reads whatever this document defines directly.

---
*End of Doc 02 (Supabase revision) · Supersedes: 02-Bubble-Database-Schema.md · Companion: 02-Database-Schema-Addendum-A-DevStudio-Supabase.md (Development Studio, already revised), 02-Bubble-Database-Schema-Addendum-B-PortfolioSnapshot.md (pending its own revision — next in the Doc 55 repair order), 15-Currency-Multi-Jurisdiction-Schema-Supabase.md (adds `currency` to `properties`) · Referenced by: Doc 01 (Formula Engine), Doc 03 (Build Checklist), Doc 05 (Claude API Narrative), Doc 11 (Notifications), Doc 54 (Engine Reconciliation)*
