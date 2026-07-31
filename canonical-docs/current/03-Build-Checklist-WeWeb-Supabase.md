# InvestScape — WeWeb + Supabase Phase 1 Build Checklist — Doc 03

**Supersedes `03-Bubble-Build-Checklist.md`.** Same ten stages, same order, same underlying goal — a private-beta-ready build in a handful of focused weekends. What changed is the tool each stage uses: Bubble's single editor is replaced by three separate places to work (Supabase for data and the calc engine, WeWeb for the interface), and several stages that existed only to work around Bubble's specific limitations (no set-based database operations, no code export, Workload Unit metering) are shorter here because those limitations don't exist in the new stack.

**Format, unchanged:** each stage is what to build, in enough detail to execute without re-deriving the decision. Work top to bottom; each stage assumes the previous is done. Estimated total: still 3–5 focused weekends, redistributed — less time spent on Bubble-specific plugin workarounds (Stage 3's old Toolbox JS action, the tax-bracket loop), more time on the calc-engine service, since that's now real code rather than a chain of Bubble workflow actions.

**Three places, not one:**
- **Supabase** — the database (Doc 02, Doc 02 Addendum A/B), Row-Level Security, and the `pg_cron` scheduled jobs. Work happens in the Supabase SQL Editor and dashboard.
- **Calc-engine service** — a standalone TypeScript service holding every financial formula (Doc 01) and the deal-grading rubric (E20). Deliberately not part of the database and not part of the interface — Doc 03 Stage 3 established this separation from the start, and Doc 52 §2 confirms it's what makes Route 2 (the eventual React rebuild) a frontend swap rather than a backend rewrite. Work happens in a code editor and a private git repository.
- **WeWeb** — the interface. Reads from Supabase directly for plain data; calls the calc-engine for anything requiring calculation. Performs no financial computation of its own. Work happens in the WeWeb visual editor.

> **Note on WeWeb's own AI features:** same caution as the old note about Bubble's AI, adapted — WeWeb's editor and AI-assisted generation update frequently, and generated components may need hand-adjustment against the schema. Never let a generation step create its own data source or invent field names; point it at the tables Doc 02 already defines and reject anything that proposes a new one.

---

## STAGE 0 — Project creation (30 min)

1. **Supabase:** supabase.com → **New project**. Choose the database region deliberately here, not by default — per `01-SaaS-Technology-Lawyer-Brief.pdf`, region is effectively permanent once chosen, and this decision should be settled with counsel before this step, not during it.
2. Note the project URL and anon/public API key (Settings → API) — WeWeb needs both. Note the service role key separately and never expose it to WeWeb or any client-side context; it's for the calc-engine service and scheduled jobs only.
3. **WeWeb:** weweb.io → **New project** → **Start from scratch** (not a template). Add the Supabase plugin/data source in WeWeb's data sources panel, using the project URL and anon key from step 2.
4. **Calc-engine repo:** create a private git repository (matches the trade-secret posture `01-SaaS-Technology-Lawyer-Brief.pdf` recommends for the grading rubric specifically). `npm init` a TypeScript project. This is the one piece of Stage 0 with no Bubble equivalent at all — Bubble's editor was the only "project" that existed; this stack has three.

## STAGE 1 — Style tokens (1–2 hrs)

WeWeb: Design system panel → enter every token from `04-InvestScape-Style-Guide.md` (colors, then fonts) as WeWeb design variables. Then create named text/component styles for: `H1 Serif`, `Body`, `Mono Data`, `KPI Number`, `Card`, `Primary Button`, `Ghost Button`, `Input Dark` — same eight styles as before, same rule: every element attaches to one of these, never styled individually. WeWeb's design-variable system is a closer fit for this discipline than Bubble's was, since variables are referenced rather than copy-pasted per element.

## STAGE 2 — Database (1 hr)

Supabase SQL Editor: run `02-Database-Schema-Supabase.md` in order — enums → lookup tables → `profiles` trigger → tables → RLS. Then run `02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md`. Then `15-Currency-Multi-Jurisdiction-Schema-Supabase.md`'s `ALTER TABLE` for the `currency` column. Then Table Editor → `properties` → insert 1 test row by hand using the Template v2 example values ($550,000 / 27.5% / 4.54% / $3,000 rent / $2,281.85 tax / $550 strata), plus a matching `deals` and `deal_inputs` row.

This stage is meaningfully shorter than the Bubble version's "45–60 minutes of clicking" description implied for the schema doc it pointed at — running SQL is faster than form-filling once the SQL is already written, which it is.

## STAGE 3 — The calc-engine service (the heart — 1 weekend)

The single biggest structural change from the old checklist. The old Stage 3 built one Bubble backend workflow inside the same app as everything else. This stage builds a **separate, standalone service.**

1. In the calc-engine repository (Stage 0): implement `01-Formula-Engine-Specification.md` Part A as ordinary TypeScript functions — no Toolbox plugin, no JS-inside-a-workflow-action workaround. The exponent math that needed a "Server script / Run javascript" escape hatch in Bubble is just... TypeScript, here.
2. Expose an HTTP endpoint (`POST /calc-deal-metrics`, body: the `deal_inputs` row) that runs the formulas and writes the result to `deal_metrics` using the Supabase service role key (bypasses RLS by design — see Doc 02 §3's note on why the client role has no write policy on this table at all).
3. Stamp `deal_metrics.calc_version` with the running service's git commit SHA on every write — this is the column Doc 02 added that didn't exist in the Bubble schema; wiring it up is a Stage 3 task now, not an afterthought.
4. Deploy the service. Two real options, both valid — **decide which one before building further, and re-check Doc 52 §3 (item 4.2) if you choose the second:**
   - **A small always-on server** (a low-cost box or a platform like Railway/Render/Fly.io). No execution-time limit to worry about; closest in spirit to "a backend workflow that always exists."
   - **Supabase Edge Functions (Deno).** Convenient, colocated with the database, but has an execution-time limit per invocation. Doc 52 flagged this specifically for the Dev Studio convergence loop (a 6-pass iterative construction-loan resolution across `budget_lines` and `draw_months`) — check the platform's current limit against that worst-case case size (796 Main St. scale) before committing to Edge Functions as the deployment target. This wasn't a concern under Bubble because Bubble workflows don't have this kind of hard timeout in the same way; it's a genuinely new thing to verify, not a carried-over caution.
5. **Test:** call the endpoint manually (curl or a REST client) against the Stage 2 test row. Check every value against the ✔ figures in the spec. Do not proceed until all match to the cent — this bar hasn't moved.

## STAGE 4 — App shell in WeWeb (half day)

WeWeb: create a **reusable component** `AppShell` — left sidebar (logo mark, nav: Dashboard · Properties · Analyzer · Markets [disabled] · Research [disabled] · Settings), top bar (search box placeholder, avatar menu with Log out). Style per the Stage 1 tokens. The disabled items still show the roadmap to beta users — same retention reasoning as before, unchanged by the platform switch.

WeWeb's component model is closer to how this was already being thought about (a "reusable element") than Bubble's was, so this stage should be closer to direct translation than most others. Dark-theme spec, unchanged: 240px fixed sidebar, background `#12233b`, border-right `rgba(255,255,255,0.08)`, Inter font `#f7f5ef` at 70% opacity for inactive nav items, active state gold `#d9b04a`. Top bar 64px with a search input and a user avatar dropdown containing "Log out."

## STAGE 5 — Auth pages (half day)

Pages: `login`, `signup` (or one combined page with a toggle). WeWeb's Supabase plugin includes built-in auth actions (`Supabase Sign Up`, `Supabase Sign In`) — no separate plugin needed, same "no plugin needed" situation as the Bubble version, different specific mechanism. On signup, also write `country` (dropdown, default Canada) to the new `profiles` row — recall from Doc 02 that `profiles` is created automatically by the database trigger on user creation, so this is an *update* to the row-that-already-exists, not a create step, which is a small but real difference from the Bubble version's flow. Redirect to `dashboard`. Add "reset password" using Supabase Auth's built-in flow (`resetPasswordForEmail`).

## STAGE 6 — Property Intake Wizard, page `property-new` (1 weekend)

A 4-step wizard replicating the Template v2 entry flow — unchanged in content from the Bubble version, since this was never a Bubble-specific design. One page, 4 sections shown/hidden by a WeWeb page variable `step`.

- **Step 1 — Property:** Address, City, Province/State, Country, PropertyType, Beds, Baths, SquareFeet, YearBuilt, Photo (optional — uploads to Supabase Storage, returns a URL, matches `properties.photo_url` from Doc 02).
- **Step 2 — Purchase:** PurchasePrice, DownPaymentPct (slider + input), BuyingCostPct, InitialImprovements, FirstTimeBuyer toggle (show only when Country = Canada).
- **Step 3 — Financing:** InterestRate, LoanType, TotalPeriodYears, TermPeriodYears, TermType.
- **Step 4 — Income & Expenses:** MonthlyRent, OtherIncomeMonthly, VacancyMonths, PropertyTaxAnnual, StrataFeeMonthly, then a collapsible "Advanced assumptions" section with the four % fields pre-filled with defaults (2.5 / 0 / 2 / 2.5).
- **Submit workflow (WeWeb):** insert into `properties` → insert into `deals` (linking the new property) → insert into `deal_inputs` (linking the new deal) → **call the calc-engine's `POST /calc-deal-metrics` endpoint** with the new deal's inputs → navigate to page `deal` with the new deal's ID.

The last two steps are the real difference from Bubble's version. Where the old flow was "Create Property → Create DealInputs → Create empty DealMetrics → Create Deal → Schedule API workflow `calc-deal-metrics`" — all client-triggered Bubble actions in the same app — this flow calls out to the separate calc-engine service. There's no "empty DealMetrics" creation step needed either, since the calc engine's insert-or-update on `deal_metrics` handles that in one write rather than requiring a placeholder row first.

## STAGE 7 — Deal Analyzer results, page `deal` (1 weekend)

WeWeb page bound to a single `deals` row (plus its joined `deal_inputs` and `deal_metrics`) via a Supabase collection query. Layout mirroring the React prototype / InvestScape HTML — unchanged content from the Bubble version, since this was always a UX decision, not a platform one:

- **KPI card row** (Mono Data style): Cash Flow /mo (green/red by sign), Cash-on-Cash, Cap Rate (all-in), DSCR, Monthly Payment.
- **Break-Even panel:** the sentence format from the spec ("To break even you'd need…") — still the wow moment, still deserves visual weight.
- **Income/Expense table:** monthly + annual columns, matching Template v2's Rent Analysis layout.
- **Scorecard badge:** big letter grade, colored per `grade_meta` (Doc 02 §1). Per the securities lawyer brief (`02-Securities-Lawyer-Brief.pdf`, §A), this is the single highest-scrutiny element on this page — build the disclaimer treatment for it deliberately, not as an afterthought once counsel responds.
- **AI Narrative section:** placeholder text for now — "AI analysis coming in beta" (wired in Stage 9).
- **Edit inputs button** → reopens the wizard pre-filled with the existing `deal_inputs` row; every save re-calls the calc-engine endpoint.
- Footer on this page (and every metrics surface): *"For informational purposes only. Not financial, legal, or investment advice."* — same disclaimer component referenced in all four legal briefs; build it once as a reusable WeWeb component so wording changes propagate everywhere, per the SaaS lawyer brief's own recommendation.

## STAGE 8 — Dashboard + Properties list (2–3 days)

- `dashboard`: WeWeb collection list bound to the current user's `deals` (RLS already scopes this to `auth.uid()` — no extra filter needed in the query beyond what Doc 02 §3's policies already enforce), card layout (address, grade badge, cash flow, status) + "New Analysis" button + summary stats row (total properties analyzed, average cash-on-cash — a simple aggregate query, same "simple enough not to need an Edge Function" reasoning as Doc 02 Addendum B §5's equity-growth query).
- `properties`: table view with a status filter (the watchlist pattern from the InvestScape HTML) bound to the `deal_status` enum from Doc 02 §1.

## STAGE 9 — Claude API narrative (2–3 days)

1. In the calc-engine service (not WeWeb, not a Bubble API Connector): add an Anthropic API call as a step after the metrics calculation. The API key lives in the calc-engine's server-side environment variables — this is the corrected location per Doc 52 §3 (item 4.4); the principle (never client-exposed) is unchanged from the original Bubble plan, only its location moved.
2. Body: model + a prompt template that injects the `deal_metrics` JSON. This should follow `05-Claude-API-Narrative-Prompt-Template.md` once that document has its own Supabase/calc-engine rewrite (next in the Doc 55 repair order after this one) — it remains its own dedicated deliverable, same reasoning as before: it's the product's core differentiator and deserves dedicated care, not a rushed inline prompt.
3. Call it server-side as the final step of the same `/calc-deal-metrics` endpoint from Stage 3; write the response text to `deals.ai_narrative`.
4. Cost control: only regenerate the narrative when inputs actually change (compare against the previous `calc_version` or a hash of the inputs — a cheap check now that `deal_metrics` carries a version column), and gate regeneration count by tier later.

## STAGE 10 — Private beta hardening (before any real users)

- [ ] RLS test with two accounts, run both through WeWeb itself and directly against the Supabase client (per Doc 02 §3's expanded test note) — not an incognito-window test anymore, but the same goal: user #2 must see zero of user #1's data.
- [ ] WeWeb: set the project to password-protected preview or invite-only signup (Supabase Auth can disable public sign-ups entirely via a dashboard toggle) for the private beta gate.
- [ ] Terms of Service + Privacy Policy pages linked in footer, checkbox at signup (from the legal consultation briefs — confirm final wording with the SaaS/technology lawyer before this box ships).
- [ ] Re-verify all formulas against the FCAC calculator + Template v2 — unchanged bar, now checked against the calc-engine service directly rather than a Bubble backend workflow.
- [ ] Test on real mobile width (an actual ~375px phone screen, not just a preview pane) — per Doc 53's confirmation that Doc 09's original recommendation (don't trust the responsive preview alone) still applies regardless of platform; Portfolio's holdings table and Dev Studio's Quick Proforma remain the two densest surfaces most likely to break first.
- [ ] Confirm the WeWeb plan tier removes any "Built with WeWeb" badge, if applicable to the chosen plan.
- [ ] Set up the custom domain via Cloudflare — unchanged from the original plan; this was never Bubble-specific.
- [ ] **New item, no Bubble equivalent:** confirm Supabase's automated daily backups / point-in-time recovery are enabled on the project's plan tier before any real user data exists (Doc 52 §3, item 4.3) — this is the closest equivalent to a "don't lose everything" check, and unlike the old checklist, it isn't implicit in the platform; it has to be turned on.
- [ ] **New item:** confirm the property/deal delete flow routes through a single Postgres function (RPC) that writes the deletion log before deleting, rather than exposing a raw table delete anywhere in WeWeb — per Doc 53 §1's discipline point on cascade deletes now being automatic at the database level, which is an upgrade but removes the built-in friction that made it hard to accidentally skip the confirmation step under the old manual Bubble workflow.

**Deliberately NOT in Phase 1, unchanged:** Stripe (charge only when beta proves retention), Rentcast/FRED market data beyond what Doc 28 already scopes as free-tier v1, news feeds, portfolio aggregation beyond what Doc 02 Addendum B already provides, team seats. Each becomes its own stage later on the same schema — that principle never depended on which platform was underneath it.

---

## What changed, for anyone diffing this against the Bubble version

Same convention as Doc 02's own §5, for the same reason — this is the most-cited build document in the registry, and anyone touching it later shouldn't have to read all ten stages to find out what actually moved.

- **One editor → three places to work.** The single biggest structural change. Nothing in Stages 4–8's actual UX content changed; what changed is that "build the page" now means WeWeb specifically, and "build the calculation" now means the calc-engine repository specifically, not a shared canvas.
- **Stage 3 stopped being a workaround-shaped stage.** The old Stage 3 existed partly to route around Bubble's lack of a real JS runtime (the Toolbox "Run javascript" escape hatch) and partly around Workload Unit metering. Neither constraint exists in a real TypeScript service — this stage is now closer to normal backend engineering than to Bubble-specific plumbing.
- **Deployment is now a real decision, not implicit.** Bubble had one hosting model. The calc engine now has a genuine choice (always-on server vs. Edge Function) with a real tradeoff (Doc 52 §3 item 4.2) that didn't exist before — flagged explicitly in Stage 3 rather than assumed away.
- **RLS replaces Privacy Rules as the access-control mechanism** — see Doc 02 §3 for why this is a stricter change, not a renamed one. Stage 10's test item reflects that.
- **Two new Stage 10 items with no Bubble equivalent:** backup/PITR configuration, and the single-path-delete discipline point Doc 53 surfaced as a consequence of cascade deletes becoming automatic. Both are things the old platform handled implicitly (in the delete case) or that were never flagged as configurable (in the backup case) — the new stack does the underlying job better but requires a deliberate step to actually turn on.

---
*End of Doc 03 (WeWeb + Supabase revision) · Supersedes: 03-Bubble-Build-Checklist.md · Parent references: 02-Database-Schema-Supabase.md, 02-Database-Schema-Addendum-B-PortfolioSnapshot-Supabase.md, 01-Formula-Engine-Specification.md (pending its own revision), 04-InvestScape-Style-Guide.md, 05-Claude-API-Narrative-Prompt-Template.md (pending its own revision) · Confirmed against: 52-Route2-Simplification-Post-Pivot.md, 53-WeWeb-Supabase-Integration-Audit.md · Still pending in the Doc 55 repair order: 03 Addendum A (TaxBracketTable), 03 Addendum B (ApexCharts Wiring — Doc 53 §5 flags this one specifically as needing a build spike, not just a doc rewrite, before Stage E1 is trusted)*
