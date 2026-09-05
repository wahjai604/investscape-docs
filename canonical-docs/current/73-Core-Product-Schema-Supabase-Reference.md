# InvestScape Core Product Schema — Supabase Reference (Doc 73)

**Status:** Live. Schema created and RLS-verified against the real `Investscape-Dev` Supabase project, 2026-09-04. **Reachable from PostgREST as of 2026-09-05** — the Exposed Schemas dashboard setting is now enabled and live-verified (see "Known gap" below, kept for the record with its resolution noted inline). **A real WeWeb project now exists and a real signup/login has been proven end-to-end (2026-09-05)** — see the new "WeWeb reachability" section below for the `public`-schema view layer this required.

## WeWeb reachability: public-schema views (added 2026-09-05)

WeWeb's Supabase data-source plugin only lists tables from the `public` schema in its collection picker, regardless of the Exposed Schemas setting above — a separate, documented WeWeb limitation. Migration `0012_public_schema_views_for_weweb.sql` adds one thin pass-through view per table in `public` (`public.deals`, `public.dev_studio_projects`, `public.portfolios`, `public.user_profiles`, `public.translations`), each created `WITH (security_invoker = true)`. This is required on Postgres 15+ (project runs 17.6): without it, a view silently runs with the *view owner's* privileges when reading the base table, which can bypass RLS entirely for every querying role — a well-known Postgres/Supabase footgun, not a hypothetical concern. Grants on each view mirror its base table exactly. Re-verified live through the views (not just the base tables): cross-user isolation holds, `anon` still denied on per-owner tables, `translations` still read-open/write-closed.

Separately: WeWeb's own "Connect Supabase" button uses OAuth at the Supabase *organization* level, not per-project — since this org (`Lighthouse Research`) also contains the separate `relationship-os` project, that flow was avoided in favor of WeWeb's classic Plugins UI "Custom" connection mode (plain Project URL + keys, scoped to one project only, no OAuth grant). Not a schema change, but recorded here since it's the reason WeWeb connects the way it does.

**Purpose:** Reference for the `investscape` Postgres schema — InvestScape's own product data (deals, dev studio projects, portfolios, user profiles, i18n dictionary). This is a *separate* schema from `lighthouse.*` (the Relationship OS cross-product integration schema, documented in `investscape-api`'s own migration files, not here) — different trust model, different purpose. `lighthouse.*` is service-role-only; `investscape.*` is per-user via `auth.uid()`, since these are personal records WeWeb reads/writes directly.

Full narrative and verification detail lives in the vault, not duplicated here in full:
- `00 Projects/Investscape Phase 2 (WeWeb+Supabase)/RLS Verification (2026-09-04).md`
- `00 Projects/Investscape Phase 2 (WeWeb+Supabase)/WeWeb Setup Pack (2026-09-04).md`
- `00 Projects/Investscape Rebuild/ACTIVE WORK TRACKER (Aug 30 2026).md`, §11 and §6

Source of truth for exact column definitions: `investscape-api/src/lighthouse/persistence/migrations/0008_investscape_core_schema.sql`, `0009_investscape_core_schema_fixes.sql`, `0010_investscape_core_schema_part2.sql`. (The migrations live under the `lighthouse/` persistence path for shared tooling reasons — the migration runner, TLS/CA handling, etc. — despite `investscape.*` being conceptually separate from the Lighthouse integration.)

---

## Tables

### `investscape.deals`
Deal Analyzer saves. Previously `localStorage` only.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK `auth.users(id)` | RLS predicate |
| `address` | text | |
| `payload` | jsonb | **Not the deal object itself** — the client's saved-entry wrapper `{ id, name, deal: {...}, extra: {...}, createdAt, updatedAt }`. `address`/`country`/`assetType` live at `payload.deal.*`, not top-level in the JSON. |
| `asset_type` | text | Promoted from `payload.deal.assetType` (e.g. `'multifamily-2-4'`) |
| `country` | text | Promoted from `payload.deal.country` |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Soft-delete |

**Correction history:** the first pass (`0008`) guessed columns `property_type`/`property_country`/`asset_category` before checking the real client code. None of those field names exist. `0009` corrected this after reading `blankNewDeal()`/`syncActiveDealToList()` in `investscape-v2-remastered.html` directly.

### `investscape.dev_studio_projects`
Dev Studio saves. Previously `localStorage` only.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK `auth.users(id)` | |
| `name`, `subtitle` | text | |
| `payload` | jsonb | Full project object: `inputs`, `scenarios`, `waterfall`, `stages`, etc. |
| `province_state` | text | Promoted from `payload.inputs.provinceState`. **There is no `country` field on a dev studio project at all** — only a province/state. |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | Soft-delete |

### `investscape.portfolios`
Deal/project membership grouping. Verified against `state.portfolio.properties[]`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK `auth.users(id)` | |
| `name`, `category`, `address` | text | |
| `deal_status` | text | |
| `included_in_totals`, `inclusion_manually_set` | boolean | |
| `payload` | jsonb | |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | |

**Correction:** the original brief assumed a portfolio property might wrap either an Analyzer deal or a Dev Studio project reference. The real client code only ever nests a full Analyzer `deal` object. No FK to `dev_studio_projects` exists.

### `investscape.user_profiles`
One row per Supabase Auth user. Verified against `state.session.user` and the Settings → Profile tab.

| Column | Type | Notes |
|---|---|---|
| `owner_id` | uuid, PK, FK `auth.users(id)` | |
| `first_name`, `last_name`, `email`, `role`, `country` | text | `role` is a closed client-side enum stored as plain text |
| `created_at`, `updated_at` | timestamptz | |

**Closed 2026-09-05:** `0011_user_profiles_auto_provision.sql` adds a `SECURITY DEFINER` trigger on `auth.users` insert that auto-creates a row here (`owner_id`+`email` only, rest left `NULL` by deliberate scope choice). **Still open:** no InvestScape signup/login UI exists yet, so nothing in the product actually triggers this — it's wired and waiting.

### `investscape.translations`
i18n dictionary. Populated 2026-09-04 from the existing `I18N` object: 5,580 rows, 1,897 keys, `en`/`fr`/`zh-Hant`/`zh-Hans`.

| Column | Type | Notes |
|---|---|---|
| `key`, `lang` | text, composite PK | |
| `value` | text | |
| `created_at`, `updated_at` | timestamptz | |

**Different security posture from the other four tables, deliberately:** this is a shared dictionary, not personal data. `SELECT` is open to both `anon` and `authenticated`; all writes are denied to both roles — **as of `0011_translations_restrictive_write_policies.sql` (2026-09-05), this denial is an explicit `AS RESTRICTIVE` policy on INSERT/UPDATE/DELETE, not grant-only**, closing a defense-in-depth gap flagged in the original RLS verification. Population happens via direct service-role connection (an import script), not through the client.

**Partially closed 2026-09-05:** of the 568 keys with no English row, 361 were resolved by an English-backfill pass walking the real non-`t()` extraction patterns (`TABS`/`SUBTABS`/`GUIDED_BANNER_COPY`/etc. — see the vault's `i18n-export/README.md` "English backfill" section for the full pattern list). 207 remain genuinely unresolved: 150 are methodology-metadata keys with no real English UI string to extract, 57 are orphaned dead keys no longer referenced anywhere in the live app. Neither is a defect; both are named rather than silently dropped.

---

## RLS model

All five tables have RLS enabled. `deals`, `dev_studio_projects`, `portfolios`, `user_profiles` use identical per-owner policies: `SELECT`/`UPDATE`/`DELETE` require `auth.uid() = owner_id`; `INSERT` requires `WITH CHECK (auth.uid() = owner_id)`. `translations` uses `FOR SELECT USING (true)` with no write policy (writes are blocked by grant, not policy — see the RLS Verification note in the vault for why this is a known, accepted defense-in-depth gap rather than a defect).

**This was proven, not assumed** — 2026-09-04, using real throwaway Supabase Auth users and `SET ROLE authenticated` + `request.jwt.claims` to genuinely exercise `auth.uid()`, not just checked via `has_table_privilege`. All assertions passed: cross-user reads, writes, and inserts-on-behalf-of are all refused; `anon` gets nothing on the four per-owner tables. Full methodology and results in the vault's `RLS Verification (2026-09-04).md`. That verification does **not** exercise real GoTrue token issuance or the PostgREST hop — only the database-level policy predicates.

---

## Known gap: not yet reachable from WeWeb — CLOSED 2026-09-05

`investscape` was not on Supabase's Data API "Exposed schemas" allow-list (dashboard location as of 2026-09-05: Project Settings → Integrations → Data API → Exposed schemas — Supabase moved this from the old "API" settings page; no migration can set this). Until added, PostgREST — and therefore WeWeb — could not see these tables at all; requests failed as though the tables didn't exist (`PGRST205`/`PGRST106`).

**Resolved and live-verified 2026-09-05:** `investscape` added to the exposed-schema list. Verified with a real `curl GET .../rest/v1/deals?select=*` using `Accept-Profile: investscape` and the anon/publishable key: response was `42501 permission denied for table deals` (a grant-level denial — `anon` was deliberately never granted table access on the per-owner tables), **not** `PGRST205`/`PGRST106`. That distinction confirms PostgREST now genuinely resolves the schema and table, and that anonymous access is still correctly blocked by design. Remaining blockers to a real WeWeb screen are no WeWeb project and no InvestScape signup/login UI — neither is a database item.

---

## Corrected figure: engine route count

Elsewhere in this doc set and in the vault tracker, the calculation-engine surface has been described as "~76 routes." That figure is wrong — it counts 70 route file declarations across `src/routes/**`, 9 of which (`us-qualifier/`, `us-tax-strategies/`, `syndication-waterfall/`) are never imported by `routes/index.ts` and are dead files, not live routes. The real, measured figure (every route probed) is **52 routers exposing 61 reachable endpoints**. This doc's own README/ENGINE-REFERENCE.md already say "52 active engines" correctly; the "~76" error appears to be vault-tracker-specific.

---

*End of Doc 73 · InvestScape Core Product Schema reference · 2026-09-04.*
