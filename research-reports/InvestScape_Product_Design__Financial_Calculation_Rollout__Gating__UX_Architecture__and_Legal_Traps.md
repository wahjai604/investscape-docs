# InvestScape Product-Design Research: Financial-Calculation Rollout, Gating, UX Architecture & Legal Traps

## TL;DR
- **Put a small, universally-relevant metric set in the Quick Proforma / Deal Analyzer defaults and hide everything advanced behind an asset-type-aware "advanced metrics" layer plus a "Show all metrics" escape hatch** — this matches how every credible competitor from DealCheck to ARGUS handles complexity, and it directly serves the conversion-at-the-transaction-moment strategy. Do NOT bloat the default input screens; add fields conditionally by asset class and deal type.
- **Gate on depth and output, not on truthful answers to "does it cash-flow?"** Keep a genuinely useful free tier (single cash-flow + break-even analysis, limited saves, watermarked/no PDF export), and gate multi-year projections, full proforma modules, capital-stack/waterfall, unlimited saves, and branded lender/investor PDF exports behind Pro/Enterprise — mirroring DealCheck and BiggerPockets.
- **The largest legal exposure is not gating — it is the appraisal/advice line and the Canadian regulatory-warning features.** The "numbers indicate," analytics-not-appraisal posture is correct and defensible, but the Financing Qualifier (GDS/TDS/stress test), CMHC premium layer, flipping-tax and rent-cap warnings must be framed as educational estimates with dated rule citations and "verify with a licensed professional" language, because as a BCFSA licensee the founder is held to a higher standard and must not stray into mortgage, tax, or legal advice.

## Key Findings

### 1. Complexity belongs behind progressive disclosure, not on the default screen
Every serious tool in this market — from consumer apps to the institutional standard ARGUS — solves "too many numbers" the same way: a simple default surface, then depth revealed on demand. Progressive disclosure (show essentials first, reveal complexity as needed) is the dominant, evidence-backed UX pattern for complex financial software, and is specifically recommended for novice users, complex tasks, and data-dense dashboards.

### 2. Metrics are only meaningful for certain asset classes — group and surface them by asset type
This is the single most important organizing principle for the "options menu" question. The research is unambiguous that metric relevance is asset-class-driven:
- **Cap rate / NOI** are for income properties with 2+ units and commercial; they are effectively meaningless for a single-family rental or a bare-land purchase. GRM is used for all rental types as a quick screen but should not be a final metric.
- **DCF / yield capitalization, band-of-investment cap rate, debt yield, cap-rate spread over bond yield** are commercial/large-multifamily and lender-facing.
- **Residual land value, subdivision development method, cost escalation to construction midpoint, S-curve draws, equity waterfall, peak equity/debt** are development/land only.
- **Cash-on-cash, DSCR, break-even, simple cash flow** are the universal core relevant to almost everyone.

### 3. Competitors stage complexity and package outputs as the paid hook
DealCheck, BiggerPockets, ARGUS and the development tools (Aprao, Lead Developer, ARGUS Developer) all use step-by-step wizards for input and reserve professional PDF/lender-report output as a premium feature.

### 4. Onboarding: wizards, templates, sensible defaults, inline explainers
Proven patterns for first-time users are guided step-by-step flows (one decision per screen), templates, pre-filled sensible defaults, tooltips/contextual help, and gradual reveal of advanced capability.

### 5. Free-tier gating: give away the "aha," gate depth, output and scale
Freemium best practice is to gate value amplifiers, not basic utility, and to surface the upgrade prompt exactly at the moment of a felt limitation.

## Details

### QUESTION 1 — Which new calculations go in Quick vs Full Proforma, and should input screens gain fields?

**Guiding principle: inputs should scale with the question being asked, not with everything the engine can compute.** ARGUS — the institutional standard — is instructive as a cautionary tale here. Its power comes at the cost of a notoriously steep learning curve; reviewers report it "required about 6 weeks of classes" to become proficient, that "the program has a high learning curve due to the number of variable inputs" and "at times it is hard to find where specific inputs go," and that implementation "may take 3–6 months." ARGUS mitigates this with customizable "Views" that hide entire tabs and columns not needed for a given model. The lesson for InvestScape: never show a field a given deal doesn't need.

**Quick Proforma (developer side) — keep it a screening tool.** It should answer "is this site worth a full model?" Include only:
- Land/acquisition cost, a single blended construction cost (with a cost-escalation-to-midpoint toggle as an optional field), soft-cost %, contingency %, a simple financing assumption, gross sellout/stabilized value, and **residual land value** as the headline output.
- Estimate-class label (e.g., Class D/Order-of-Magnitude → Class A) as a required dropdown so the output honestly signals its own reliability.
- Development margin / profit, simple project IRR, and a single go/no-go.
- Keep S-curve, multi-tranche capital stack, equity waterfall, GST/HST recovery timing, peak equity/debt, MIRR/XIRR OUT of Quick — these belong in Full.

**Full Proforma (developer side) — where the heavy machinery lives:**
- S-curve construction-draw modeling; cost escalation to construction midpoint; contingency splits (hard vs soft); budget lines by cost code.
- Multi-tranche capital stack with vendor-take-back / assumable / bridge / mezzanine presets; peak equity and peak debt; equity waterfall.
- GST/HST handling (input tax credits and net tax on sales); DCF/NPV; project + equity IRR, MIRR, XIRR, equity multiple; residual land value with hurdle-rate solve.
- Subdivision development method for lot deals (absorption, phasing, lot-price escalation).

This mirrors ARGUS Developer's own six-step workflow (build pro forma → residual land value → run scenarios → budget monitoring → reforecast → report) and Lead Developer's model, which pairs S-curve distributions, customizable cost codes, flexible capital stacks, and residual-land-value hurdle solving — and notably "explains what each metric means."

**Deal Analyzer input screens — add fields conditionally by asset type and deal strategy, not globally.** DealCheck's model is the proven template: a step-by-step wizard, import/prefill where possible, then "configure dozens of parameters," with property type switchable between rental / BRRRR / flip / multi-family / commercial. Concretely:
- **Base fields (all):** price, financing, closing costs, gross rent, operating expenses, vacancy. Outputs: cash flow, cap rate (where relevant), cash-on-cash, DSCR, break-even.
- **Multi-family (small + 25/50/100-unit):** reveal a rent-roll/per-unit grid, GRM, band-of-investment cap rate, debt yield, replacement reserves, cap-rate spread over benchmark bond yield.
- **Commercial (office/retail/industrial):** reveal lease-level entry (this is exactly where ARGUS invests its complexity — lease-by-lease rent roll with steps, recoveries, market leasing assumptions), DCF/yield capitalization, debt yield, replacement reserves.
- **Bare land / development site:** route to Dev Studio; suppress cap rate/NOI/GRM entirely.
- **Financing Qualifier fields (GDS/TDS, stress-test qualifying rate, CMHC premium):** surface for residential/owner-occupier-adjacent flows and the mortgage-broker segment.

**Verdict:** Yes, revise input screens — but by making them *conditional and asset-aware*, adding fields only when the selected asset class/strategy needs them. Adding fields globally would reproduce ARGUS's overwhelm problem, which is the opposite of InvestScape's positioning.

### QUESTION 2 — Options/settings menu for non-mainstream metrics vs "Show all metrics"?

**Recommendation: do both, layered.** The research strongly supports a three-tier reveal:
1. **Always-on core set** (asset-appropriate): cash flow, cap rate/NOI where relevant, cash-on-cash, DSCR, break-even.
2. **Grouped, toggleable advanced sets** with plain-language explainers — this is the "options menu." Group metrics into labeled bundles (e.g., "Lender/Underwriting metrics: debt yield, DSCR, cap-rate spread"; "Return-over-time metrics: IRR, MIRR, XIRR, equity multiple"; "Valuation lenses: GRM, band-of-investment cap rate, DCF"). For each group, explain what it is, why the metrics belong together, what it's used for, and why it may or may not be relevant to the property at hand.
3. **"Show all metrics"** escape hatch for the curious power user who wants every angle.

This pattern is directly modeled on how leading tools handle optional/advanced toggling: settings menus with enable/disable, drag-and-drop metric selection, and per-metric definitions. DealCheck ships "a built-in real estate glossary with formulas for every analysis metric we calculate" and lets users "customize performance metrics that matter to me." ARGUS uses saved "Views" to toggle whole blocks of complexity on and off, and its more approachable development competitors explicitly explain each metric's meaning rather than just outputting numbers.

**Asset-type-driven relevance must be visible, not just filtered.** Because a metric like cap rate is meaningless for a single-family home but central to a 100-unit building, the explainer text should say so — e.g., a greyed cap rate on an SFH with "Cap rate is most useful for 2+ unit and commercial properties; for single-family homes, cash-on-cash and comparable sales are more informative." This teaches while it filters, reinforcing the "analytics that educate" brand and lowering the risk of a user misapplying a metric.

### QUESTION 3 — How competitors display and use data

**ARGUS Enterprise (institutional standard, now folding into the cloud "ARGUS Intelligence Platform").** Input is tab-based and property-level, with nested sub-tabs (Property → Description/Location/Additional/Area Measures/Ground Leases; then Market → inflation, general vacancy, credit loss, market leasing; then Expenses; then a lease-by-lease Rent Roll). Workflow order is property setup → market assumptions → expenses → tenant/rent roll → reports. It supports DCF, capitalization, and traditional valuation methods, produces "40+ standard and configurable" reports (Cash Flow, Present Value, Lease Summary, Lease Audit, Data Review), and its dashboards show NOI, cash flow and IRR charts with up to five scenarios compared side by side. Complexity is progressively hidden via user-defined Views, not a beginner mode. Recurring UX criticisms — no undo button, manual-save risk, hard-to-locate inputs, "clunky"/"outdated" interface, heavy reliance on Excel export for waterfalls — are exactly the gaps a modern, guided tool can exploit. (Recency: product structure current to 2025-26; cloud migration ongoing.)

**ARGUS Developer.** Six-step workflow: build pro forma with configurable timeline stages → residual land value → run/compare scenarios → budget monitoring → reforecast → 60+ reports. Costs entered by structured cost categories (acquisition, construction with cost distribution, infrastructure with phases, professional fees, marketing/letting/disposal, arrangement and development-management fees). S-curve cost distribution is built in; it models flexible debt/equity/JV structures and profit waterfalls, with a KPI dashboard for IRR/feasibility and sensitivity across cost/revenue/timing/interest-rate variables. Practitioner caveat: the waterfall functionality is widely criticized and users often export to Excel. Altus itself contrasts Developer's "more rigid approach … suitable for multi-stage projects with complex funding structures" against EstateMaster's flexible spreadsheet UI — a useful design fork for InvestScape's Quick (guided/rigid) vs Full (flexible) split.

**DealCheck (prosumer benchmark).** Trusted by over 350,000 real estate investors and agents per its own site and app listings ("Trusted by over 350,000 real estate investors and agents"). Step-by-step wizard or public-records/MLS import; "dozens of parameters"; calculates cap rate, cash-on-cash, ROI, ROE, IRR, GRM, DCR/DSCR, LTV, rent-to-value, break-even. Per-property interactive online report + one-click branded PDF for lenders/partners; property comparison; purchase-criteria screening. Focused on per-property deal analysis, not portfolio dashboards.

**BiggerPockets calculators.** Clean guided input; outputs cash flow, cash-on-cash, cap rate, DCR, and 30-year pro-forma with charts/graphs; explicit "basic calculations or … more in-depth advanced analysis." Lender/partner-ready printable PDF reports are a Pro feature.

**Data/portfolio tools.** PropStream is filter/list and lead-gen oriented with heat maps and property reports (financial analysis is basic); Stessa is an automated portfolio/cash-flow dashboard (ledger-derived); RealData / PropertyMetrics / A.CRE serve deep DCF and lease-level commercial modeling; Aprao and Lead Developer are cloud development-proforma tools with residual land value, sensitivity and waterfalls. Canadian-specific analysis tooling is thin — mostly single-purpose calculators (WOWA, Ratehub, nesto for stress test/CMHC) rather than integrated investor platforms — which is precisely InvestScape's opening.

**Cross-cutting display lessons:** (a) wizard-style staged input everywhere; (b) computed metrics presented as scannable KPI cards + supporting tables; (c) charts for cash flow, equity/loan balance over time, sources/uses, and IRR; (d) the packaged, branded investor/lender PDF is universally the premium output and the natural paywall.

### QUESTION 4 — First-time-user ease of use / onboarding

Proven patterns, all directly applicable:
- **Default/simple mode first.** Ship a "Quick" or "Simple" analysis as the default landing experience; keep "Full" one click away. This is the single highest-leverage decision for not overwhelming a first-timer.
- **Guided step-by-step wizard, one decision per screen**, with save/resume and non-linear navigation (a user who abandons mid-flow must return without losing work — a specific, well-documented wizard requirement).
- **Templates and sensible pre-filled defaults** (vacancy %, management %, closing-cost %, reserve %) so a blank screen never confronts the user; DealCheck lets users save reusable templates.
- **Inline tooltips/explainers and a metric glossary with formulas** (DealCheck's glossary is the benchmark). ARGUS's weakness — "there is no hint on how to inputting data" and reviewers wishing for a searchable help button — is the exact gap to fill.
- **Contextual/adaptive disclosure**: reveal advanced fields when the user's asset type or prior input implies they're needed (à la Google Docs surfacing table controls only inside a table).
- **A first-run checklist and one "aha" completion** (a completed first analysis with a clear cash-flows / does-not-cash-flow verdict) before any paywall.

### QUESTION 5 — Free vs paid gating

**Freemium math and rules of thumb.** Typical B2B SaaS freemium converts 2–5% of free users to paid; consumer-facing tools often lower. The governing rule from the research: "give away enough to be genuinely useful, gate the features that matter most once users are reliant," gate "value amplifiers, not basic utility," and surface the upgrade prompt "when the user is actively experiencing a limitation that matters to them." Most conversions occur within 30 days of signup or within 7 days of hitting a meaningful limit.

**How comparable products draw the line:**
- **DealCheck:** free "Starter" is a forever-free plan capped at 15 saved properties with limited features and no PDF export ("The free plan enables you to save up to 15 properties at a time, while the paid version allows you to store up to 200 properties"); Plus (paid) unlocks unlimited property types, PDF reports and imports; Pro adds comps and custom branding. Reviewers note the free tier is "not a production tool" — useful to try the interface, but the analysis limit, lack of BRRRR, and no PDF export push serious users to pay.
- **BiggerPockets:** free membership includes calculators limited to 5 reports; Pro unlocks unlimited analyses and lender-ready PDF exports and custom branding.

**Recommended InvestScape gating (aligned to "convert at the transaction-analysis moment"):**
- **Free:** the simple cash-flow + break-even analysis on a basic rental model (the "does it cash-flow?" job-to-be-done), plus ungated Community, Library, Market News. Cap saved analyses (e.g., 3–5), single-year only, no branded PDF export (view-only or watermarked). This is genuinely useful and delivers the aha.
- **Pro ($29/mo):** full Deal Analyzer across all asset types, multi-year projections, the advanced/grouped metrics, Financing Qualifier, Neighbourhood Intel depth, unlimited saves, and branded PDF export.
- **Enterprise ($199/mo):** Dev Studio Full Proforma (S-curve, capital stack, waterfall, subdivision method), portfolio-level analytics, and multi-property/investor reporting.
- **Trigger the upgrade prompt contextually** — when a free user switches asset type to multi-family/commercial, opens a locked advanced-metric group, or tries to export a lender PDF. Consider a time-boxed "reverse trial" (14–21 days of full access on signup) since reverse trials convert at 4–6% ("good") to 8–12% ("great") and let users feel the premium value before dropping to free.

### Cross-cutting: pros, cons, pushbacks, and legal/regulatory traps

**Pros of the layered/asset-aware approach:** matches proven competitor patterns; protects the first-timer while satisfying the power user; makes the paywall feel like a door to more value rather than a lock; and turns metric relevance into teaching moments that reinforce the analytics brand.

**Cons / pushbacks to anticipate:**
- **Power users may resent any gating of "just numbers."** Mitigate by keeping the honest cash-flow answer free and gating depth/output, not truth.
- **Hidden metrics can feel like dark patterns** if discovery is poor. The research warns users "never [want] to feel as though they're being tricked into thinking there isn't functionality available." Mitigate with visible "Advanced" and "Show all metrics" affordances and lock icons that clearly signal paid features.
- **Over-gating kills activation.** If the free tier can't answer "does it cash flow?", you lose the aha and the funnel.
- **Complexity creep** — adding all these calculations risks becoming ARGUS. Discipline via Quick-vs-Full and conditional fields is the antidote.

**Legal / regulatory traps (highest-priority section):**
- **Appraisal vs analytics line.** The "the numbers indicate," explicitly-not-an-appraisal posture is correct and matches how every real-estate calculator disclaims (e.g., "calculator outputs are estimates — not professional advice"; results are "illustrative estimates based on the inputs you provide"). Keep AI strictly interpreting platform-computed numbers and never inventing data. Reinforce with persistent, plain disclaimers on every output and export.
- **BC licensee obligations (BCFSA/RESA).** As a BCFSA-licensed real estate professional, the founder is held to a higher standard and must not give mortgage, tax, financial-planning, or legal advice — in BC these are explicitly outside a realtor's lane. The Financing Qualifier, CMHC premium layer, and tax warnings must therefore be framed as educational estimates, not advice, with "consult a licensed mortgage broker / tax professional / lawyer" language. Because RESA disclosure rules can require also warning consumers of risks when an exemption/limitation applies, build disclosure language deliberately and consistently.
- **Canadian regulatory-warning features must be dated and sourced, because the rules change and are jurisdiction-specific:**
  - **OSFI B-20 stress test:** qualify at the minimum qualifying rate (MQR), defined by OSFI as "the greater of the mortgage contract rate plus 2% or 5.25%," with GDS ≤ 39% and TDS ≤ 44% (insured). OSFI confirmed in early 2026 the stress test is unchanged, per Canadian Mortgage Professional: OSFI is "leaving the mortgage stress test unchanged, keeping that qualification rule at its current level of 5.25% or two points above a borrower's contract rate, whichever is higher."
  - **CMHC insured-mortgage premiums:** range from 0.60% to 4.00% of the mortgage by LTV — per Ratehub.ca (updated Feb 14, 2025), "5% down (resulting in a 95% LTV ratio), the insurance premium is 4.00% of the total mortgage amount," 3.10% at 10% down, and 2.80% at 15% down (85% LTV). **Note the exact 15%-down figure should be verified against CMHC's official premium schedule (Ratehub states 2.80%).** Insurable price cap raised to $1.5M (Dec 15, 2024). Per CMHC's official premium page, "an amortization period beyond 25 years is subject to a 0.20% surcharge," and "some provinces (currently Ontario, Quebec and Saskatchewan) apply provincial sales tax to the mortgage loan insurance premium. The sales tax can't be added to the loan amount."
  - **BC home flipping tax (effective Jan 1, 2025, under the Residential Property (Short-Term Holding) Profit Tax Act):** per the Province of BC, "the tax rate is 20 percent of net taxable income earned from a taxable property disposed of within 365 days, and the rate gradually decreases over the next 365 days. At 730 days, the tax no longer applies." It is "separate and distinct from the federal property flipping rules and is not harmonized or administered with the federal or B.C. income tax." The federal anti-flipping rule took effect Jan 1, 2023 (property owned <365 days → gain taxed as business income). Warnings should note both regimes and that the BC tax is not federally deductible.
  - **BC rent-increase cap:** per the Government of BC (Aug 26, 2025 news release), the Province is tying "the annual allowable rent increase to inflation at 2.3% in 2026, down from 3% in 2025," confirmed on the RTB page: "The 2026 rent increase limit for residential tenancies is 2.3%." Province-wide, with strict notice-timing rules.
  - Present each as "as of [date], verify current rules" with a link to the primary source, and never as definitive tax/legal advice.
- **Accessibility & disclosure.** Because these are "Your Money or Your Life" (YMYL) financial tools, hold outputs to high accuracy/transparency standards: explicit no-advice disclosure on every calculator, clear methodology, an error-reporting path, and accessible (WCAG-aware) UI for the disclaimers and metric explainers so disclosures are actually perceivable.

## Recommendations (staged, with thresholds)

**Stage 1 — Ship now (Bubble MVP, Route 1):**
1. Default every Deal Analyzer and Dev Studio session to a **Quick/Simple mode**; make Full one click away.
2. Implement **conditional, asset-type-aware input fields** — never show a field the selected asset class/strategy doesn't need. Wire the always-on core metric set (cash flow, cap rate where relevant, cash-on-cash, DSCR, break-even).
3. Build the **three-tier metric reveal**: core → grouped advanced toggles with plain-language "what/why/when-relevant" explainers → "Show all metrics." Grey-out-with-explanation for metrics irrelevant to the asset type.
4. Ship the **free-tier line**: free = single-year cash-flow + break-even, 3–5 saves, no branded export; Pro/Enterprise as specified. Trigger contextual upgrade prompts at asset-type switch, locked-metric click, and PDF-export attempt.
5. Ship **onboarding scaffolding**: guided wizard with save/resume, sensible pre-filled defaults, templates, inline tooltips, and a metric glossary with formulas.
6. Ship **legal scaffolding**: persistent not-an-appraisal/not-advice disclaimers on every output and export; dated, primary-source-linked framing on all Canadian regulatory-warning features; "consult a licensed professional" language on the Financing Qualifier, CMHC and tax modules.

**Stage 2 — After first cohort (instrument and tune):**
7. Instrument the funnel: track upgrade velocity, which gate converts, and activation (share of new users who complete one analysis). **Threshold:** if free→paid conversion < 2.5% but activation is healthy, the gate is mis-placed (loosen output/depth gating or move a low-value paid feature into free); if activation itself is low, the free tier is under-delivering the aha (add capability to free).
8. A/B test a **14–21 day reverse trial** (full access on signup, then drop to free). **Threshold:** adopt permanently if it lifts conversion toward the 4–8% reverse-trial band without inflating support load.

**Stage 3 — Route 2 (Postgres/React):**
9. Port the metric-grouping and conditional-field logic into a proper entitlements/feature-flag system; add portfolio dashboards (the gap DealCheck leaves open) and side-by-side scenario comparison (ARGUS's strength) as Enterprise differentiators.
10. Formalize a **rules-as-data layer** for the Canadian regulatory figures (stress-test rate, CMHC bands, flipping-tax schedule, rent cap) so numbers update centrally with effective dates — critical for both accuracy and legal defensibility.

## Caveats
- **Competitor UIs change; specifics are dated.** DealCheck, BiggerPockets and ARGUS details reflect 2025–2026 sources; ARGUS Enterprise is mid-migration into the cloud "ARGUS Intelligence Platform," and several structural details derive from third-party mirrors of official manuals for somewhat older desktop versions. Re-verify before copying any specific screen.
- **Vendor marketing vs reality:** claims like ARGUS's "sleek, interactive dashboards" and "drag-and-drop" come from marketing; independent reviews consistently call the interface clunky. Weigh accordingly.
- **Conversion benchmarks are ranges, not guarantees** (2–5% typical freemium; 4–12% reverse trial). Your niche, Canadian-plus-US, prosumer audience may differ; treat the thresholds above as starting hypotheses to instrument, not targets.
- **One numeric discrepancy to resolve at build time:** sources agree CMHC premiums span 0.60%–4.00%, with 4.00% at 5% down and 3.10% at 10% down, but the 15%-down figure appears as both ~2.40% and 2.80% across secondary sources; use CMHC's official premium schedule as the authoritative source.
- **This is product/UX research, not legal advice.** The regulatory figures are current to mid-2026 per the cited sources but change; the founder should have the disclaimer language and the licensee-obligation boundaries reviewed by a lawyer and confirmed against current BCFSA guidance before launch. Regulatory figures require primary-source confirmation at build time — especially the annually-set BC rent cap and any CMHC/OSFI changes.