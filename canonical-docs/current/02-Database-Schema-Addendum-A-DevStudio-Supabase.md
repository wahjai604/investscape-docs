# InvestScape — Database Schema Addendum A: Development Studio (Supabase/Postgres) — Doc 02 Addendum A

**Supersedes `02-Bubble-Database-Schema-Addendum-A-Development-Studio.md`.** Strictly additive to Doc 02 (Supabase revision) — no existing tables, columns, or enums from that doc are renamed or altered. Enterprise-tier gating carries over unchanged in spirit: nothing here needs to exist before Free/Pro is working, and it's gated both at the RLS layer (§3) and the page layer (WeWeb).

**How to use:** Supabase SQL Editor, same order as Doc 02: enums → lookup tables → tables → RLS. Estimated time: similar order of magnitude to the Bubble version — more of this module is genuinely custom SQL than Doc 02 core was, since there's no Option-Set shortcut for the color-bearing enums.

---

## 1. NEW ENUMS

```sql
CREATE TYPE dev_project_type AS ENUM ('Subdivision', 'Spec Infill', 'Multifamily', 'Mixed Use');
CREATE TYPE detail_level AS ENUM ('Quick Proforma', 'Full Model');
CREATE TYPE unit_system AS ENUM ('Imperial', 'Metric');
CREATE TYPE dev_stage AS ENUM ('Concept', 'Feasibility', 'Financing', 'Construction', 'Sellout/Stabilized');
CREATE TYPE property_class AS ENUM ('Residential', 'Commercial', 'Mixed');
CREATE TYPE acquisition_structure AS ENUM ('Asset Purchase', 'Bare Trust/Share');
CREATE TYPE tenure_type AS ENUM ('Market Sellable', 'Market Rental', 'CMHC Rental', 'Non-Market Rental', 'Density Offset');
CREATE TYPE budget_group AS ENUM ('Land', 'Hard', 'Soft', 'Financing');
CREATE TYPE driver_type AS ENUM ('Fixed $', 'Per Buildable SF', 'Per Sellable SF', 'Per Unit', 'Per Lot', 'Per Metre', 'Per Bulb', 'Per Draw', '% of Hard', '% of Revenue', '% of Land', '% of Loan', '% of Subtotal');
CREATE TYPE loan_rank AS ENUM ('1st', '2nd', 'Mezz', 'DPI');
CREATE TYPE draw_curve AS ENUM ('Straight Line', 'S-Curve');
CREATE TYPE waterfall_variant AS ENUM ('IRR Tranches', 'ROE Hurdles');
CREATE TYPE hurdle_type AS ENUM ('IRR', 'ROE');
```

**Lookup tables for the two color-bearing enums (same pattern as Doc 02 §1):**
```sql
CREATE TABLE dev_stage_meta (
  stage dev_stage PRIMARY KEY,
  color text NOT NULL
);
CREATE TABLE budget_group_meta (
  budget_group budget_group PRIMARY KEY,
  color text NOT NULL           -- feeds the cost donut directly, same as the Bubble version's note
);
```

---

## 2. NEW TABLES

### `dev_projects` (the parent record — one per development deal)
```sql
CREATE TABLE dev_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,                                    -- e.g. "796 Main Street"
  project_type dev_project_type,                -- drives field visibility per Doc 07 §9
  detail_level detail_level NOT NULL DEFAULT 'Quick Proforma',
  unit_system unit_system NOT NULL DEFAULT 'Imperial',
  jurisdiction text,                            -- e.g. "Vancouver, BC" — links to fee/tax tables below
  stage dev_stage NOT NULL DEFAULT 'Concept',
  approval_months numeric,
  construction_months numeric,
  selling_months numeric,
  linked_property_id uuid REFERENCES properties(id),  -- for portfolio graduation into Property/Deal
  created_at timestamptz NOT NULL DEFAULT now()
);
```
`ProjectMonths` (approval + construction + selling) is a display-time sum, not a stored column — computed by the calc-engine service or a generated column if you prefer it queryable:
```sql
ALTER TABLE dev_projects ADD COLUMN project_months numeric
  GENERATED ALWAYS AS (COALESCE(approval_months,0) + COALESCE(construction_months,0) + COALESCE(selling_months,0)) STORED;
```

### `parcels` (belongs to DevProject — unlimited, not the templates' 8–10 cap)
```sql
CREATE TABLE parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  location text,
  lot_size_sf numeric,
  zoning text,
  fsr_multiplier numeric,
  buildable_sf numeric GENERATED ALWAYS AS (lot_size_sf * fsr_multiplier) STORED,
  purchase_price numeric,
  bc_assessment numeric,                        -- Gilley tracks asking vs. assessment
  property_class property_class NOT NULL DEFAULT 'Residential',   -- governs +2%-over-$3M PTT rule
  acquisition_structure acquisition_structure NOT NULL DEFAULT 'Asset Purchase',  -- Bare Trust/Share zeroes PTT — AI narrative flags as legal-advice territory
  ptt numeric,                                  -- calc, F-701, from tax_bracket_tables, never hardcoded — written by calc engine
  land_broker_fee_pct numeric,
  legal_closing_per_lot numeric
);
```

### `tenure_components` (belongs to DevProject — multifamily/mixed-use only)
```sql
CREATE TABLE tenure_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  tenure tenure_type,
  far_share numeric,                            -- must reconcile to site FAR across all components — app-layer check
  sf numeric,
  unit_count numeric,
  rent_psf_monthly numeric,
  expense_ratio numeric,
  cap_rate numeric,
  component_value numeric                       -- calc, F-708 — written by calc engine
);
```

### `unit_sales` (belongs to DevProject — the sellable unit list)
```sql
CREATE TABLE unit_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  suite_no text,
  strata_lot text,
  unit_type text,
  size_sf numeric,
  sales_price numeric,                          -- entered net of GST
  price_psf numeric GENERATED ALWAYS AS (CASE WHEN size_sf > 0 THEN sales_price / size_sf ELSE NULL END) STORED,
  view text,
  floor_premium numeric NOT NULL DEFAULT 0,
  commission_rate numeric,                      -- single input driving both up-front and closing halves (F-705)
  commission_amount numeric                     -- calc — written by calc engine
);
```

### `budget_lines` (belongs to DevProject — every cost line in the model)
```sql
CREATE TABLE budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  budget_group budget_group NOT NULL,
  subgroup text,                                -- e.g. "Design", "Permits & Fees", "Third-Party Consultants"
  label text,                                   -- e.g. "Architectural Fees"
  driver_type driver_type,
  driver_rate numeric,                          -- the $/SF, %, or per-unit rate
  driver_basis numeric,                         -- the SF/unit/lot count it multiplies against
  amount numeric,                               -- calc — written by calc engine
  is_contingency boolean NOT NULL DEFAULT false -- contingency lines compute off their OWN group subtotal, never the grand total — app-layer rule, not enforceable in SQL alone
);
```

### `municipal_fee_schedules` (admin-only — jurisdiction-scoped fee rates)
```sql
CREATE TABLE municipal_fee_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction text NOT NULL,
  fee_name text NOT NULL,                       -- e.g. "Development Cost Levy — Market Residential"
  driver_type driver_type,                      -- reuses the same taxonomy
  rate numeric NOT NULL,
  effective_date date NOT NULL                  -- fees change; keep history, never overwrite a past row
);
```

### `tax_bracket_tables` (admin-only — the PTT/land-transfer-tax engine)
```sql
CREATE TABLE tax_bracket_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction text NOT NULL,                   -- e.g. "British Columbia"
  property_class property_class NOT NULL,       -- governs which bracket table applies
  effective_date date NOT NULL,
  label text                                    -- e.g. "BC PTT 2026"
);
```

### `tax_bracket_rows` (belongs to tax_bracket_tables — one row per bracket)
```sql
CREATE TABLE tax_bracket_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_bracket_table_id uuid NOT NULL REFERENCES tax_bracket_tables(id) ON DELETE CASCADE,
  bracket_order integer NOT NULL,               -- 1, 2, 3, 4...
  lower_bound numeric NOT NULL,
  upper_bound numeric,                          -- null = "and above"
  rate numeric NOT NULL                         -- as a decimal, e.g. 0.02
);
```

### `loan_facilities` (belongs to DevProject — one row per facility)
```sql
CREATE TABLE loan_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  rank loan_rank,
  amount numeric,
  base_rate numeric,
  spread numeric,
  term_months numeric,
  commitment_fee_pct numeric,
  broker_fee_pct numeric,
  avg_outstanding_factor numeric NOT NULL DEFAULT 0.60,  -- computed from draw_months when present, else this editable default
  first_draw_amount numeric,
  draw_curve draw_curve NOT NULL DEFAULT 'Straight Line',  -- S-curve already visualized in v2-unified
  interest_reserve numeric,                     -- calc, F-702 — written by calc engine
  net_advance numeric,                          -- calc, F-704 — written by calc engine
  loan_psf numeric,                             -- calc, ÷ gross buildable — written by calc engine
  ltc numeric,                                  -- calc, cumulative loans ÷ total project cost
  ltv numeric                                   -- calc, cumulative loans ÷ gross revenue — label explicitly
                                                 -- "loan-to-end-value" in the UI, not loan-to-appraised-value, per Doc 07 §11
);
```

### `draw_months` (belongs to loan_facilities)
```sql
CREATE TABLE draw_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_facility_id uuid NOT NULL REFERENCES loan_facilities(id) ON DELETE CASCADE,
  month_index integer NOT NULL,
  advance numeric NOT NULL,
  cumulative numeric                            -- running total, feeds the S-curve chart — calc engine or a window function view
);
```

### `waterfall_specs` (belongs to DevProject — one per project; presented as "Partner Split Calculator")
```sql
CREATE TABLE waterfall_specs (
  dev_project_id uuid PRIMARY KEY REFERENCES dev_projects(id) ON DELETE CASCADE,
  variant waterfall_variant,
  pref_rate numeric,
  compounding boolean NOT NULL DEFAULT true
);
```

### `waterfall_deductions` (belongs to waterfall_specs — pre-distribution deductions)
```sql
CREATE TABLE waterfall_deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES waterfall_specs(dev_project_id) ON DELETE CASCADE,
  label text,                                   -- e.g. "Warranty Reserve", "Deposit Financing Cost", "GP Bonus"
  amount numeric                                -- calc where conditional, e.g. GP bonus IF ROC > 15% — calc engine
);
```

### `waterfall_tiers` (belongs to waterfall_specs — ordered tranches/hurdles)
```sql
CREATE TABLE waterfall_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES waterfall_specs(dev_project_id) ON DELETE CASCADE,
  tier_order integer NOT NULL,
  hurdle_type hurdle_type,
  hurdle_value numeric,                         -- e.g. 0.19 for a 19% IRR cap
  lp_share numeric,
  gp_share numeric
);
```

### `scenarios` (belongs to DevProject — frozen snapshots, never live links)
```sql
CREATE TABLE scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_project_id uuid NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
  label text,                                   -- e.g. "v15"
  created_at timestamptz NOT NULL DEFAULT now(),
  snapshot_json jsonb NOT NULL                  -- frozen JSON of every input + output at save time — NEVER a live
                                                 -- reference; direct fix for the #REF! breakage in the source templates.
                                                 -- jsonb (not text) is a genuine Postgres upgrade here: queryable/indexable
                                                 -- if you ever need to search across scenario history.
);
```

**Reuse existing, no new table needed:** file repository (Supabase Storage), AI narrative payload storage, export records — same as the Bubble version's note.

---

## 3. ROW-LEVEL SECURITY — Enterprise-tier gating built into the policy itself

Unlike Bubble (which needed both a Privacy Rule and a separate page-level tier check), Postgres RLS can enforce ownership *and* tier in one policy — this is the DB-level version of "belt-and-suspenders costs nothing," except here it's actually one belt, not two:

```sql
ALTER TABLE dev_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE waterfall_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE waterfall_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waterfall_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- dev_projects: owner AND Enterprise tier
CREATE POLICY "owner_enterprise" ON dev_projects FOR ALL USING (
  auth.uid() = user_id
  AND (SELECT tier FROM profiles WHERE profiles.id = auth.uid()) = 'Enterprise'
);

-- Everything else keyed off dev_project_id/its chain — same "owner + Enterprise" check, one join deeper
CREATE POLICY "owner_enterprise" ON parcels FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)  -- dev_projects' own RLS already filtered to owner+Enterprise;
                                                     -- Postgres RLS composes automatically through the subquery
);
CREATE POLICY "owner_enterprise" ON tenure_components FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON unit_sales FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON budget_lines FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON loan_facilities FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON draw_months FOR ALL USING (
  loan_facility_id IN (SELECT id FROM loan_facilities)
);
CREATE POLICY "owner_enterprise" ON waterfall_specs FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON waterfall_deductions FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON waterfall_tiers FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);
CREATE POLICY "owner_enterprise" ON scenarios FOR ALL USING (
  dev_project_id IN (SELECT id FROM dev_projects)
);

-- Admin reference data: public read, no client write (only service role / a future is_admin flag)
ALTER TABLE municipal_fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_bracket_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_bracket_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON municipal_fee_schedules FOR SELECT USING (true);
CREATE POLICY "public_read" ON tax_bracket_tables FOR SELECT USING (true);
CREATE POLICY "public_read" ON tax_bracket_rows FOR SELECT USING (true);
-- No INSERT/UPDATE policy for any client role — edit these directly in Supabase's Table Editor
-- for now, same "not worth an admin UI until more than one jurisdiction" call as the Bubble version.
```

Still gate at the WeWeb page layer too, same reasoning as the original: RLS stops data leaks, but a non-Enterprise user shouldn't even see a Dev Studio nav item or land on a page that immediately renders empty.

---

## 4. RELATIONSHIP DIAGRAM — addition to Doc 02 §4

```
dev_projects ──< parcels
             ──< tenure_components
             ──< unit_sales
             ──< budget_lines
             ──< loan_facilities ──< draw_months
             ──1 waterfall_specs ──< waterfall_deductions
                                  └──< waterfall_tiers
             ──< scenarios
             ──1 linked_property_id → properties(id)

tax_bracket_tables ──< tax_bracket_rows   (admin, jurisdiction-scoped, referenced by parcels.ptt calc)
municipal_fee_schedules                    (admin, jurisdiction-scoped, referenced by budget_lines)
```

---

## 5. Build note — unchanged priority

Build `tax_bracket_tables` + `tax_bracket_rows` first. Every parcel's PTT calculation depends on it, and it's the one piece of this schema populated with real government data from day one rather than test data.

---
*End of Doc 02 Addendum A (Supabase revision) · Supersedes: 02-Bubble-Database-Schema-Addendum-A-Development-Studio.md · Parent: 02-Database-Schema-Supabase.md · Companion: 07-Development-Proforma-Field-Map.md*
