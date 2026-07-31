# InvestScape — Route 2 Simplification (Post-Pivot Update) — Doc 52

**Corrects:** `12-Pre-Port-Advisory-Review.md` §4 (items 4.1–4.4), and the Route 2 narrative in `Executive_Summary.pdf` and the strategy reports. Prompted by: the Route 1 platform pivot (Bubble → WeWeb + Supabase) already implemented in Doc 02, Doc 02 Addenda A/B, Doc 03, and Doc 15.

---

## 1. The old Route 2 narrative — what it assumed

Every prior doc describing Route 2 (the Executive Summary, the Solo Bootstrapped Founder Strategy Report, Doc 12 §4.1) assumed the same shape: **Route 1 runs on Bubble's proprietary database; Route 2 is a full rebuild onto a custom Postgres/React stack, including migrating the data itself.** The Executive Summary's own words: *"Switch Data Source: Gradually stop using Sheets/Airtable as the 'source of truth'... Migrate historical data to your new database."* Doc 12 §4.1 built an entire recommendation around this — field-naming discipline in Bubble *now* as insurance against "archaeology" at migration time, because the destination schema didn't exist yet and would need to be mapped field-by-field from Bubble's naming.

**None of that is true anymore.** Route 1's database *is* Postgres (Supabase). There is no data migration in Route 2 — there's no second database to move data into.

---

## 2. What Route 2 actually is now

**Route 2 = swap the frontend. Keep the database.** WeWeb gets replaced by a custom React app; Supabase stays exactly where it is, serving the same tables, the same RLS policies, the same calc-engine API. A Route 2 "migration" is, in the literal sense, a new frontend pointed at an unchanged backend — not a data migration, not a schema rewrite, not the "trashing business logic" scenario the Executive Summary warned about.

**What actually still needs to happen at Route 2 time, so this isn't overstated as zero-work:**
- Rebuild the UI in React (this was always going to happen regardless of platform — no visual builder, WeWeb included, exports UI you'd want to hand-maintain long-term).
- Decide whether to stay on Supabase's hosted Postgres or migrate to self-hosted Postgres (optional, not required — Supabase's database is standard Postgres; `pg_dump`/`pg_restore` gets you off it in an afternoon if you ever want to, with none of Bubble's "there's no way of exporting your application as code" problem).
- Re-point the calc-engine API's callers from WeWeb's HTTP-request workflow action to whatever React uses (a typed API client) — the calc-engine service itself doesn't change; it was already platform-agnostic by design (Doc 03 Stage 3).
- Re-implement RLS-aware auth flows in React using `@supabase/supabase-js` (a maintained, first-party client library — this is a much smaller lift than re-building auth from scratch).

**What's now permanently done, not deferred:** the schema, the RLS policies, the `pg_cron` jobs, the calc-engine API, and the FX-rate/PortfolioSnapshot machinery all carry forward unchanged into Route 2. This is the concrete payoff of the pivot — Route 2 stopped being "rebuild the backend" and became "rebuild the frontend," which is a smaller, cheaper, lower-risk project than what every prior doc planned for.

---

## 3. Corrections to Doc 12 Part 4

### 4.1 → superseded
Doc 12's original concern — "Bubble field names are your future migration contract; inconsistent naming turns the migration into archaeology" — assumed a field-name *mapping* step between two different systems (Bubble's internal representation → a future Postgres schema). That step no longer exists. Doc 02's Supabase revision already uses consistent `snake_case` naming throughout, because it's real SQL, not a Bubble field list — there's nothing left to "enforce ruthlessly as a migration contract" because the production schema and the eventual Route 2 schema are now **the same schema**, not two schemas that need to agree.

### 4.2 → superseded
The original concern was Bubble Workload Unit capacity on the Dev Studio convergence loop (`for(var k=0;k<6;k++)`, iterative construction-loan circularity resolution). That concern was specific to Bubble's WU-metered backend workflows. The calc-engine API (Doc 03 Stage 3) is a normal server-side Node/TypeScript service — a 6-pass convergence loop across BudgetLines and DrawMonths is unremarkable compute for a real server, not a WU-cost risk. **New, smaller version of the same concern worth keeping:** if the calc-engine is deployed as a Supabase Edge Function (Deno) rather than a longer-running service, check the platform's execution-time limit against the worst-case Dev Studio project size (796 Main St. scale) before relying on it in production — this is a real but much smaller check than the original capacity concern, and it's an infrastructure choice (Edge Function vs. a small always-on server), not an architecture risk.

### 4.3 → revise, don't discard
Same underlying concern (backup/disaster-recovery posture given hard-delete + externalized file storage), different mechanism. Supabase offers automated daily backups and point-in-time recovery on paid plans, same category of feature as Bubble's, different specifics. **Action item, carried forward:** confirm which Supabase plan tier includes PITR, and enable it before real user data exists — same urgency, same "cheap now, impossible to retroactively recover later" reasoning as the original.

### 4.4 → location updated, principle unchanged
The Claude API key now lives in the calc-engine API's server-side environment variables (Doc 03 Stage 9), not Bubble's API Connector. Same principle — never client-exposed, confirmed correct, nothing to change about the rule itself, just where it's enforced.

---

## 4. Correction flagged for `Executive_Summary.pdf` and the strategy reports

`Executive_Summary.pdf` is a source file, not something this pass can edit directly. Flagging its Route 2 description as outdated for whenever it's next revised: the "Switch Data Source... migrate historical data to your new database" language describes a migration that Route 1's architecture (as of this pivot) no longer requires. The Solo Bootstrapped Founder Strategy Report's Route 2 framing should get the same correction — wherever it discusses Route 2 as a future cost/timeline line item, that estimate is now smaller than what's currently written, for the reasons in §2 above.

---
*End of Doc 52 · Corrects: 12-Pre-Port-Advisory-Review.md §4, Executive_Summary.pdf (flagged, not edited) · Depends on: 02-Database-Schema-Supabase.md, 03-Build-Checklist-WeWeb-Supabase.md*
