# InvestScape / EstateLens — Bubble Phase 1 Build Checklist

**Format:** Each stage = what to click + copy-paste text. Work top to bottom; each stage assumes the previous is done. Estimated total: 3–5 focused weekends for a first-time Bubble builder.

> **Note on Bubble's AI:** Bubble's editor and AI features update frequently — buttons may be named slightly differently than described. The prompts below work in Bubble's AI page generation; if a generated page fights you, it's often faster to build that section manually using the schema doc. Never let the AI create data types — if it proposes new ones, reject and point it at your existing types.

---

## STAGE 0 — App creation (30 min)

1. bubble.io → **Create an app** → choose **Start from scratch / Blank** (not a template). If the flow forces the AI describe-your-app step, keep the description minimal: *"A blank app. I will define my own database."*
2. Name it your working name (app name is changeable; the domain comes later via Cloudflare).
3. Settings → General: confirm latest Bubble version + new responsive engine.
4. Settings → Collaboration: nothing needed (solo).
5. Plugins tab → Install: **Toolbox** (free — needed for the mortgage math), **API Connector** (by Bubble — needed for Claude API later).

## STAGE 1 — Style Variables (1–2 hrs)

Styles tab → Style variables. Enter every token from **04-Style-Guide.md** (colors, then fonts). Then create named Styles for: `H1 Serif`, `Body`, `Mono Data`, `KPI Number`, `Card`, `Primary Button`, `Ghost Button`, `Input Dark`. Every future element gets attached to one of these styles — never style elements individually.

## STAGE 2 — Database (1 hr)

Follow **02-Bubble-Database-Schema.md** exactly: Option Sets → Data types → fields → Privacy rules. Then Data → App data → create 1 test Property + Deal + DealInputs row by hand using the Template v2 example values ($550,000 / 27.5% / 4.54% / $3,000 rent / $2,281.85 tax / $550 strata).

## STAGE 3 — The Formula Engine (the heart — 1 weekend)

1. Backend workflows page (enable "API workflows" in Settings → API if hidden).
2. New API workflow: `calc-deal-metrics`, parameter: `inputs` (type DealInputs).
3. Add a **Server script / Run javascript** action (Toolbox) implementing Part A of **01-Formula-Engine-Specification.md** — the spec contains the exact JS for the payment math. Alternatively chain "Make changes to DealMetrics" actions using Bubble expressions for the simpler arithmetic and reserve JS for the exponent math.
4. Final action: "Make changes to DealMetrics" writing every output + `LastCalculated = Current date/time`.
5. **Test:** run manually on your test row (backend workflows can be triggered from the editor). Check every value against the ✔ figures in the spec. Do not proceed until all match to the cent.

## STAGE 4 — Reusable navigation shell (half day)

Create a **Reusable element** `AppShell`: left sidebar (logo mark, nav: Dashboard · Properties · Analyzer · Markets [disabled] · Research [disabled] · Settings), top bar (search box placeholder, avatar menu with Log out). Style per style guide. The disabled items show the roadmap to beta users — good retention psychology.

**AI prompt if using Bubble AI:**
> "Create a reusable element: a dark-theme app shell with a 240px fixed left sidebar (background #12233b, border-right rgba(255,255,255,0.08)) containing a logo area and vertical nav links (Dashboard, Properties, Analyzer, Markets, Research, Settings) in Inter font #f7f5ef at 70% opacity, active state gold #d9b04a. Top bar 64px with a search input and a user avatar dropdown containing 'Log out'. Do not create any new data types."

## STAGE 5 — Auth pages (half day)

Pages: `login`, `signup` (or one combined page with a toggle). Bubble's built-in "Sign the user up" / "Log the user in" actions — no plugin needed. On signup also set `Country` (dropdown, default Canada) and redirect to `dashboard`. Add "reset password" using Bubble's built-in flow.

## STAGE 6 — Property Intake Wizard, page `property-new` (1 weekend)

A 4-step wizard replicating the Template v2 entry flow. Use one page with 4 Groups shown/hidden by a custom state `step`.

- **Step 1 — Property:** Address, City, Province/State, Country, PropertyType, Beds, Baths, SquareFeet, YearBuilt, Photo (optional).
- **Step 2 — Purchase:** PurchasePrice, DownPaymentPct (slider + input), BuyingCostPct, InitialImprovements, FirstTimeBuyer toggle (show only when Country = Canada).
- **Step 3 — Financing:** InterestRate, LoanType, TotalPeriodYears, TermPeriodYears, TermType.
- **Step 4 — Income & Expenses:** MonthlyRent, OtherIncomeMonthly, VacancyMonths, PropertyTaxAnnual, StrataFeeMonthly, then a collapsible "Advanced assumptions" group with the four % fields pre-filled with defaults (2.5 / 0 / 2 / 2.5).
- **Submit workflow:** Create Property → Create DealInputs → Create DealMetrics (empty) → Create Deal linking all three → Schedule API workflow `calc-deal-metrics` → Go to page `deal` with the new Deal.

**AI prompt:**
> "On page property-new, create a 4-step wizard using my existing data types Property, Deal, DealInputs, DealMetrics — do not create new data types. Dark card layout centered, max width 720px, using my existing styles. Step navigation with a progress indicator. [paste the four step field lists above]. Percentage inputs formatted as percent. On final submit: create Property, DealInputs, empty DealMetrics, then a Deal linking them, schedule API workflow calc-deal-metrics, then navigate to page deal."

## STAGE 7 — Deal Analyzer results, page `deal` (1 weekend)

Page type: Deal. Layout mirroring your React prototype / InvestScape HTML:
- **KPI card row** (Mono Data style): Cash Flow /mo (green/red by sign), Cash-on-Cash, Cap Rate (all-in), DSCR, Monthly Payment.
- **Break-Even panel:** the sentence format from the spec ("To break even you'd need…") — this is the wow moment; give it visual weight.
- **Income/Expense table:** monthly + annual columns, matching Template v2's Rent Analysis layout.
- **Scorecard badge:** big letter grade (Grade option set color).
- **AI Narrative group:** placeholder text for now — "AI analysis coming in beta" (wired in Stage 9).
- **Edit inputs button** → reopens the wizard pre-filled (auto-binding or a duplicate edit page); every save re-schedules `calc-deal-metrics`.
- Footer on this page (and every metrics surface): *"For informational purposes only. Not financial, legal, or investment advice."*

## STAGE 8 — Dashboard + Properties list (2–3 days)

- `dashboard`: repeating group of Current User's Deals (card: address, grade badge, cash flow, status) + "New Analysis" button + summary stats row (total properties analyzed, avg cash-on-cash).
- `properties`: table view with DealStatus filter tabs (the watchlist pattern from the InvestScape HTML).

## STAGE 9 — Claude API narrative (2–3 days)

1. API Connector → new API "Anthropic" → POST `https://api.anthropic.com/v1/messages`, headers `x-api-key` (Private key — never put the key in page workflows), `anthropic-version`, `content-type: application/json`.
2. Body: model + a prompt template that injects the DealMetrics JSON. (I'll draft the full prompt template as its own deliverable — it's your core differentiator and deserves dedicated care.)
3. Call it server-side at the end of `calc-deal-metrics`; write the response text to `Deal.AINarrative`.
4. Cost control: only regenerate narrative when inputs change, and gate regeneration count by Tier later.

## STAGE 10 — Private beta hardening (before any real users)

- [ ] Privacy-rule test with two accounts (incognito test from schema doc)
- [ ] Settings → General: set app to require password (private beta gate) or invite-only signup list
- [ ] Terms of Service + Privacy Policy pages linked in footer, checkbox at signup (from your legal checklist)
- [ ] Re-verify all formulas against the FCAC calculator + Template v2
- [ ] Test on mobile width (Bubble responsive preview)
- [ ] Turn off Bubble's default "built on Bubble" banner (paid plan setting)
- [ ] Set up the custom domain via Cloudflare

**Deliberately NOT in Phase 1:** Stripe (charge only when beta proves retention), Rentcast/FRED market data, news feeds, portfolio aggregation, team seats. Each becomes its own stage later on the same schema.
