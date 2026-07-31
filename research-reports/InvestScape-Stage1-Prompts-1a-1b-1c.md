# InvestScape — Stage 1 Build Prompts (1a · 1b · 1c)

*Integrated set for the financial-calculation rollout. Run in order, verify each before the next. These build/extend the functional Claude Design HTML/JS prototype; the production formula engine (Doc 01) and gating enforcement are rebuilt as Bubble backend workflows after Buddy transfer. Stage 2 (funnel instrumentation, reverse-trial A/B) is post-launch on live Bubble; Stage 3 (Postgres/React entitlements, portfolio dashboards, scenario comparison, rules-as-data regulatory layer) is Route 2.*

---

## SHARED STANDARDS — apply to all three prompts

Each prompt below references these by letter instead of repeating them.

**A · Scoping discipline.** Touch only the items listed in the prompt. At the end of each build, enumerate every module *not* in scope (Portfolio, Market News, Neighbourhood Intel, Community, Library shell, Workspace, and any Deal Analyzer / Dev Studio surface not named) and confirm each remains unchanged. Precise, narrow changes verified afterward — never broad undirected edits.

**B · Visual & system consistency.** Dark-navy default `#0C1B2E`; typography Fraunces / Inter / DM Mono; gold accents. All charts use ApexCharts with the `updateSeries` pattern — never destroy/recreate (prevents flicker). Mobile rules unchanged: hamburger below 640px, notification bell always visible; Dev Studio Full Proforma is tablet/desktop only and phone must redirect to Quick Proforma. Dark/light toggle stays deferred to Phase 2.

**C · AI-narrative & framing (hard rule).** The AI narrative interprets platform-computed numbers only — it never calculates, never invents market data. Use "the numbers indicate" / "based on the assumptions you entered" framing exclusively; never "the property is worth X" or "you should." A persistent, plain-language *not-an-appraisal / not-advice* disclaimer appears on every valuation-adjacent output and every export. Present multiple approaches side by side with visible assumptions; never auto-reconcile into a single value.

**D · Rules-as-data (no hard-coded regulatory constants).** Every rate, threshold, and bracket is an admin-editable setting carrying an effective date — extending the BC PTT-bracket precedent. This covers stress-test rate, GDS/TDS limits, CMHC premium bands, flipping-tax schedule, rent-cap %, estimate-class ± bands, and default reserve $/unit. Outputs driven by these settings show "indicative — lender/CRA rules vary."

**E · Localization.** Every new user-facing string ships in all four languages — English, fr-CA, zh-Hant, zh-Hans — sourced from / added to Doc 33 (Financial Terminology Glossary). Sweep **shared components explicitly** (headers, nav, notification strings, tooltips, disclaimer text); do not rely on page-by-page passes, which have repeatedly missed shared elements.

**F · Canonical-doc registration.** Nothing stays in conversation state. Each new formula is registered in Doc 06 with the next available F-ID, its formula, plain-language explanation, and an original worked example. New schema is registered in Doc 02 (and the relevant addendum). Admin tables follow the Doc 03 Addendum-A (TaxBracketTable) pattern. Data-source licensing notes go to the Doc 28 registry.

**G · Tier tagging & gating scaffolding.** Tag every metric and module Free / Pro / Enterprise. Locked items render with a lock affordance and fire a contextual upgrade prompt at the moment of friction (asset-type switch into a paid class, opening a locked metric group, attempting a branded PDF export). Always expose the "Show all metrics" escape hatch. In Claude Design, gating is a *visual state only*; enforcement is rebuilt in Bubble. Free = single-year cash-flow + break-even on the basic rental model, capped saves, no branded export; Pro = full Deal Analyzer across asset types, multi-year projections, advanced metric groups, Financing Qualifier, branded export; Enterprise = Dev Studio Full Proforma, portfolio analytics, multi-property/investor reporting.

**H · Verification protocol (decided-vs-built — the primary quality gate).** After building, do **not** report a vague "done." For every changed surface: state the specific variable/function names touched, exact DOM findings (element IDs and the values they render), and the async-wait method used for any animation/chart check. Screenshot each changed surface. Self-reported fixes that can't be shown in the DOM are treated as not done.

---

## PROMPT 1a — Metric-engine riders + display architecture
*No new data model. Extends existing engines and the display layer. This is the heaviest UX prompt; if it runs long, execute in the sub-sections below as separately verified passes rather than one undirected sweep.*

**Preconditions.** The residential + commercial engines already compute NOI (F-401), cash flow (F-402), cash-on-cash (F-403), cap rate market vs yield-on-cost (F-404), DSCR (F-502), loan sizing LTV/DSCR with binding-constraint display (F-503/504), leverage state (F-505), IRR/NPV, GRM, and the break-even solver. The Dev Studio Full Proforma already computes the budget table, cost donut, S-curve equity/debt draw, and the margin-on-cost sensitivity heatmap. Do not rebuild these — extend them.

### 1a.1 · Formula riders (assign next-available F-IDs per Standard F)

Add each as a computed metric and a Library Formula Card:

- **Debt yield.** `Debt Yield = NOI ÷ Loan Amount`. Surface as a third loan-sizing constraint beside LTV and DSCR (typical lender floor 8–10%, admin-editable). Its value is that it ignores rate and amortization, so cheap long-amortization debt can't flatter it — name that in the plain-language card.
- **Return decomposition.** Per year and cumulative over the hold: `Cash-flow return` = annual pre-tax cash flow; `Principal paydown` = reduction in loan balance over the year; `Appreciation` = change in value at the user-set growth rate; `Total return $` = sum; `Total return %` = sum ÷ equity. Render as a stacked contribution. This is the honest counterweight to year-1 cash-on-cash (which F-403's own note flags as misleading alone).
- **Equity multiple.** `Equity Multiple = Total Distributions (all cash flows + net sale proceeds) ÷ Total Equity Invested`. Display beside IRR with a one-line contrast: IRR is time-weighted, equity multiple is absolute and ignores timing. *(Confirm this isn't already in the Doc 06 reconciliation log before adding — the top-25 doc recommended it; verify it wasn't quietly implemented.)*
- **MIRR.** `MIRR = (FV of positive cash flows at the reinvestment rate ÷ PV of negative cash flows at the finance rate)^(1/n) − 1`. User sets reinvestment and finance rates (defaults editable). Explain it corrects IRR's assumption that interim cash reinvests at the IRR itself.
- **XIRR.** IRR on actually-dated (irregular) cash flows, numeric solve. Use wherever flows aren't strictly annual; flag multiple-sign-change streams as F-409/410 already do.
- **Cap-rate spread over benchmark.** `Spread (bps) = (Deal Cap Rate − Benchmark Yield) × 10,000`. Benchmark = Government of Canada 10-yr (Bank of Canada Valet, already integrated) for CA deals; 10-yr Treasury (FRED, already integrated) for US deals. Auto-display on every deal — institutional context at zero incremental data cost. A thin or negative spread signals rich pricing versus the risk-free rate.
- **Replacement reserves.** Below-NOI line, default `Reserves = Units × ReservePerUnitYr` ($/unit/yr, admin-editable default). State the convention explicitly (capital item, not an operating expense); the AI already flags reserves mis-entered as OpEx — give them a proper home.
- **Band-of-investment cap rate** (from the appraisal Stage 1 set). `Ro = (M × Rm) + ((1 − M) × Re)`, where M = LTV, Rm = mortgage constant (annual debt service ÷ loan, already computed), Re = equity dividend rate. This is the marquee "derive a cap rate without comparable sales" feature.

Development-side riders (Dev Studio):

- **Cost escalation to construction midpoint.** `Escalated Hard Cost = Base Hard Cost × (1 + annual escalation rate)^(build-duration-years ÷ 2)`. Escalate to the midpoint of the build (standard QS practice). Expose as an optional toggle in both Quick and Full.
- **Contingency split.** Replace the single blended contingency with two lines — **Design contingency** (% of hard + soft, higher at early estimate classes) and **Construction contingency** (% of hard). Defaults keyed to the estimate-class dropdown below.
- **Estimate-class label.** Required dropdown: Class D (order-of-magnitude) → C → B → A (pre-tender), each carrying a ± precision band (AACE-style ranges as admin-editable defaults). Display the band so the proforma states its own reliability.
- **Peak equity / peak debt.** Derive from the existing S-curve draw model — `Peak Debt = max(cumulative debt draw − cumulative repayment)`, `Peak Equity = max(cumulative equity contributed)`. Display-only KPI cards; no new inputs.
- **GST self-supply case (build-to-rent).** Add a third case to the GST/HST toggle: (1) sell-new — GST collected on sale, construction-cost ITCs recoverable; (2) resale/exempt; (3) **build-to-rent self-supply** — builder self-assesses GST on fair market value at completion (deemed sale to self), then exempt rental. Model the completion-date cash event. Library explainer + "verify with a tax professional."
- **Blended-rate display (hook only).** If a deal still carries a single mortgage, wire the display slot for a weighted-average rate but leave the multi-tranche engine to Prompt 1c. Note the dependency in the code comment.

### 1a.2 · Quick vs Full Proforma placement (Dev Studio)

- **Quick Proforma stays a screening tool** — answers "is this site worth a full model?" Fields: land/acquisition, single blended construction cost (+ midpoint-escalation toggle), soft-cost %, contingency %, simple financing assumption, gross sellout / stabilized value, estimate-class dropdown. Outputs: **residual land value** (headline — "what can I pay for the land?"), development margin/profit, a simple project IRR, and a single go/no-go. Keep S-curve, capital stack, waterfall, GST recovery timing, peak equity/debt, MIRR/XIRR, and the subdivision method **out** of Quick.
- **Full Proforma carries the heavy machinery** — S-curve, contingency split, cost codes, GST/HST handling, peak equity/debt, DCF/NPV, project + equity IRR, MIRR/XIRR, equity multiple, residual land value with hurdle-rate solve, and (added in later prompts) the capital stack and equity waterfall.

### 1a.3 · Deal Analyzer conditional asset-aware fields

Add an **asset-type selector** that drives which fields and metrics appear. Never show a field the selected class doesn't need (this is the discipline that keeps InvestScape from reproducing ARGUS's overwhelm). Base fields always present: price, financing, closing costs, gross rent, operating expenses, vacancy. Reveal by type per the matrix in 1a.4.

### 1a.4 · Three-tier metric reveal, grouping, and asset relevance

**Tier 1 — always-on core** (asset-appropriate): cash flow, cap rate *where relevant*, cash-on-cash, DSCR, break-even.

**Tier 2 — grouped advanced sets** (the "options menu"), each collapsible with a plain-language explainer covering *what it is, why these metrics group together, what it's used for, and when it is / isn't relevant*:
- **Lender / Underwriting** — DSCR, debt yield, cap-rate spread, break-even.
- **Return-over-time** — IRR, MIRR, XIRR, equity multiple, return decomposition.
- **Valuation lenses** — GRM, band-of-investment cap rate, DCF / yield capitalization, market cap vs yield-on-cost.
- **Development / land** — residual land value, subdivision method, peak equity/debt, cost escalation, contingency split, estimate class.

**Tier 3 — "Show all metrics"** escape hatch for the power user who wants every angle.

**Asset relevance is visible, not just filtered** — greyed-out metrics carry an explainer rather than vanishing:

| Asset type | Reveal / emphasis | Grey-out with explainer |
|---|---|---|
| Single-family rental | cash-on-cash, cash flow, break-even, GRM (screen) | cap rate / NOI ("most useful for 2+ unit and commercial; for SFH, cash-on-cash and comparable sales are more informative") |
| Small multifamily (2–24) | + cap rate, NOI, GRM, band-of-investment, replacement reserves | — |
| Large multifamily (25–100) | + rent-roll / per-unit grid, debt yield, cap-rate spread, DCF | — |
| Commercial (office/retail/industrial) | + lease-level entry, DCF / yield capitalization, debt yield, replacement reserves | — |
| Bare land / development site | route to Dev Studio | suppress cap rate / NOI / GRM entirely |

### 1a.5 · Simple-mode default + lightweight onboarding

Default every Deal Analyzer and Dev Studio session to **Simple mode**; Full is one click away. Pre-fill sensible editable defaults (vacancy %, management %, closing-cost %, reserve $/unit). Every metric links to its Library glossary Formula Card. Inline tooltips on each field and metric. *(A full guided first-run wizard is scoped separately — not built here.)*

### 1a.6 · Regulatory warnings (analytics, never advice — Standards C, D)

- **Rent-increase-cap guardrail.** Warn when modeled rent growth on *occupied* units exceeds the provincial cap; distinguish turnover growth (uncapped) from in-place growth (capped). Provincial cap is an admin-editable table (BC 2026 ≈ 2.3%, but must be a setting, dated, source-linked).
- **Flipping-tax flags** (warnings only, keyed to hold period — never computed tax, never eligibility rulings): federal anti-flipping (<365-day hold → gain taxed as business income, in force since Jan 1 2023) and the BC home flipping tax (20% of net taxable income within 365 days, declining to 0% by 730 days, effective Jan 1 2025, not federally harmonized/deductible). SVT / EHT / UHT available as optional user-asserted line items. Each warning: "as of [date], verify with a tax professional," with a primary-source link.

### 1a.7 · Acceptance criteria (representative — apply Standard H throughout)

- Switching asset type re-renders the field set and metric groups without a full page reload; confirm by naming the toggled element IDs and the fields shown/hidden for each of the five types.
- Each new metric renders a numeric value for a known test deal that matches a hand calculation to the stated precision; report the value found in the DOM node, not a summary.
- All new charts use `updateSeries` — demonstrate by triggering an input change and confirming no destroy/recreate flicker, stating the async-wait method used.
- Every new string appears in all four languages including in shared components; show the notification/disclaimer strings specifically.
- Persistent not-an-appraisal/not-advice disclaimer is present on every new output surface and export.

### 1a.8 · Canonical-doc updates

Register each new formula in Doc 06 (next F-IDs, with worked examples); update the Doc 06 reconciliation log; update Doc 33 for new terms across four languages; update the Dev Studio schema addendum (Doc 02 Addendum-A) for the estimate-class field and contingency-split lines; log tier tags. Confirm equity-multiple wasn't already implemented before claiming it as new.

---

## PROMPT 1b — Financing Qualifier + CMHC insured-mortgage layer
*New borrower data model + policy-sensitive admin tables with a live-currency dependency. Isolated so every regulatory value gets its own focused verification against a primary source at build time.*

**Preconditions.** The payment engine already handles CA semi-annual / US monthly compounding (FCAC-validated). Reuse it — do not fork the payment math.

### 1b.1 · New data model — borrower inputs

Add borrower fields required for GDS/TDS: gross annual income, other monthly debt obligations, heating estimate, condo/strata fees. Register in Doc 02.

### 1b.2 · Financing Qualifier

- **GDS** = (Mortgage P&I + Property Tax + Heat + 50% of condo/strata fees) ÷ Gross Annual Income.
- **TDS** = (GDS costs + other monthly debt obligations × 12) ÷ Gross Annual Income.
- Insured thresholds default 39% / 44%, admin-editable (Standard D).
- **Stress-test qualifying rate** = greater of (contract rate + 2%) or the floor. Floor ≈ 5.25% as of mid-2026 — admin-editable, and **verify current with OSFI at build**. Qualify the payment at this rate, not the contract rate.
- **Max-affordability solver** (reuse existing payment math): given income, other debts, down payment, qualifying rate, amortization, and tax/heat estimates, solve for the maximum mortgage where GDS ≤ 39% and TDS ≤ 44% (binding = the lesser), then max price = mortgage + down payment. This is the "what price can this borrower carry?" feature for the broker/realtor segments.

### 1b.3 · CMHC premium layer (admin table — Standard D)

- Premium bands by LTV (span ≈ 0.60%–4.00%: 4.00% at 5% down / 95% LTV, 3.10% at 10% down; **verify the 15%-down figure against CMHC's official schedule — secondary sources disagree (2.40% vs 2.80%)**). Premium is capitalized into the loan (raising loan balance and payment).
- Amortization surcharge +0.20% for amortizations beyond 25 years.
- Minimum-down tiers (5% on the portion to $500K, 10% on $500K–$1.5M) and the insured price cap ($1.5M as of Dec 15 2024).
- Provincial PST on the premium (currently ON / QC / SK) is payable at closing and **cannot** be financed — feed it into initial-cash-invested, not the loan.

### 1b.4 · Framing & legal (Standard C)

Every Qualifier and CMHC output is framed as an educational estimate, not advice: "indicative — lender rules and eligibility vary; consult a licensed mortgage broker." Dated, primary-source-linked figures throughout. This keeps the feature on the analytics side of the mortgage-broking line — critical given the founder's BCFSA licensee status.

### 1b.5 · Tier & acceptance

Tier: Pro (Standard G). Acceptance per Standard H — confirm GDS/TDS and the max-price solver against a worked example and an official calculator; confirm every regulatory constant is admin-editable (no hard-coding) by locating each in the settings table; confirm PST-on-premium hits cash-in and not the loan. Register the CMHC and stress-test tables following the Doc 03 Addendum-A pattern; add source-currency notes to the Doc 28 registry.

---

## PROMPT 1c — Multi-tranche capital stack + alternative-financing presets
*New per-deal financing-tranche schema + add/remove UI. Brings Dev Studio's existing stack concept (1st mortgage + mezzanine/DPI + equity) to the acquisition side, where the Deal Analyzer is currently single-mortgage.*

### 1c.1 · New schema — FinancingTranche

Per deal, 1..n tranches, each with: type, rate, amortization, term, interest-only flag, lien position, and optional balloon at term. Register in Doc 02 (single-writer principle — one workflow writes computed tranche fields).

### 1c.2 · Capital-stack engine

- **Weighted cost of debt** = Σ(tranche balance × tranche rate) ÷ Σ(tranche balance).
- **Total debt service** = Σ tranche debt service (respect interest-only vs amortizing per tranche).
- Feed the existing metrics: DSCR (NOI ÷ total debt service), leverage state (weighted cost of debt vs unlevered yield, F-505), cash-on-cash, and cash-in (price − Σ tranche proceeds + costs). Replace the 1a blended-rate display hook with the real figure.

### 1c.3 · Alternative-financing presets

Each is a preset configuration of the stack, not a bespoke calculator:
- **Vendor take-back** — seller-carried 2nd, typically below-market, often interest-only with a balloon at term.
- **Assumable mortgage** — low-rate assumed 1st + market-rate top-up 2nd, blended (high value in a high-rate era).
- **Bridge financing** — short-term interest-only covering the purchase-to-sale/refi gap (the missing piece for BRRRR/flip mechanics).
- **Mezzanine / 2nd mortgage** — already in Dev Studio; expose on acquisitions.

### 1c.4 · Dual-chair VTB view

- **Buyer side:** VTB as a 2nd tranche → less cash in, blended rate, cash-on-cash effect, and a balloon-refinance flag at term.
- **Vendor side** (the "should I offer a VTB?" question): carried-note yield vs cash proceeds reinvested at a user-set rate, with a plain 2nd-position risk note. No computed recommendation — this is the analytics-not-advice line.

### 1c.5 · Exclusions (Library-only, cautionary — do not make them look easy)

Rent-to-own / lease-option and subject-to structures: cautionary Library entries at most. Both carry consumer-protection scrutiny, and subject-to collides with due-on-sale clauses in Canada — a tool that makes them frictionless invites reliance liability.

### 1c.6 · Legal — two bright lines (Standard C)

- **Model, don't broker.** No lender marketplace, no "private lenders near you," no arranging financing — that's mortgage-broking (BCFSA-regulated). Model only structures the user is contemplating for their own deal.
- **Model, don't match.** No investor-to-deal matching or capital solicitation — that's the securities line already flagged for the partner waterfall (Doc 29A §2.1). Any preferred-equity/promote tranche stays a calculator.

### 1c.7 · Tier & acceptance

Tier: Pro (acquisition stack); the Dev-side stack remains Enterprise. Acceptance per Standard H — add/remove tranche re-computes the weighted cost of debt and all dependent metrics without page reload (name the recompute function and the DOM values before/after); confirm each preset populates the correct tranche fields; confirm the vendor-side view shows note-yield vs reinvestment with no recommendation language. Update Doc 02 schema and the Doc 06 leverage entries; add the presets to Doc 33 across four languages.

---

## Sequencing & what comes next

1. **1a → verify → 1b → verify → 1c → verify.** Each prompt is independently screenshot-verified against Standard H before the next begins.
2. **Prompt T (streamline / consolidate)** — after: external-data-source confirmations (Doc 28 licensing, especially CREA/Teranet LEGAL-CHECK items), Doc 33 glossary finalization, and the legal-advisor / professional-association / government consults. Expect further updates before the Buddy → Figma → Bubble transfer.
3. **SR&ED submission** — final step. Will require its own research pass (current eligibility rules, how experimental-development / SaaS work qualifies, and CRA application mechanics) when reached.

**Open decision before running 1a:** fold the full guided onboarding wizard into 1a, or spec it as a separate Prompt 1d so 1a stays lean. The lightweight onboarding pieces (defaults, tooltips, glossary links) are already in 1a §1a.5 regardless.
