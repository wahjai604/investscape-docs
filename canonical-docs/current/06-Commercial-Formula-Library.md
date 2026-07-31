# 06 — Commercial Formula Library
## InvestScape Formula Engine Specification — Commercial Extension
**Lighthouse Research Ltd. · Version 1.0 · July 2026**

---

### Provenance & licensing position

The mathematical formulas in this library are standard commercial real estate finance — mathematical facts, which are not subject to copyright. The methodology coverage was informed by professional course material; however, **every explanation, example, benchmark note, and implementation note in this document is original writing by/for Lighthouse Research Ltd.** No third-party course text is reproduced here. All worked examples use original figures. This document is safe to surface in-product (Library / Learn screens) and to feed the AI narrative layer via RAG.

**Usage in InvestScape:**
- **Library screen** — each entry renders as a Formula Card (name → formula → plain-English → example)
- **AI narrative layer** — entries provide the canonical definitions the Claude API references when interpreting DealMetrics; the AI never computes, per the established boundary
- **Formula Engine** — the `Bubble Implementation` notes map each formula to backend workflow logic
- **Tier mapping** — RES = all tiers · COM = commercial module · DEV = Development Studio (Enterprise)

**Dual-market conventions (apply throughout):**
- Canadian mortgages: semi-annual compounding, not in advance → periodic rate `i = (1 + r/2)^(1/6) − 1` for monthly payments
- US mortgages: monthly compounding → `i = r/12`
- All ratios and returns are market-agnostic; only debt-service math switches by country toggle

---

## Category 1 · Capital & Cost of Capital

### F-101 · Capital Stack
**Formula:** `Total Capital = Equity + Debt`
**Tier:** COM
Every property purchase is funded by some mix of the buyer's own money and borrowed money. The "stack" ordering matters because debt gets paid first — lenders are made whole before equity sees a dollar. InvestScape displays the stack as a horizontal bar on every deal: debt portion, equity portion, 100% total.
**Bubble Implementation:** derived display field — no stored value needed; `Debt = Loan Amount`, `Equity = Initial Cash Invested`.

### F-102 · Weighted Average Cost of Capital (WACC)
**Formula:** `WACC = (D/V × Rd × (1 − Tc)) + (E/V × Re)`
**Variables:** D/V = debt share of value · Rd = interest rate on debt · Tc = corporate tax rate · E/V = equity share of value · Re = required return on equity
**Tier:** COM
The blended "price" of all the money funding a deal. Debt is cheaper than equity (and interest is tax-deductible, hence the (1 − Tc) haircut), so mixing in debt usually lowers the average. WACC matters because it sets the floor: a deal earning less than its WACC is destroying value for its capital providers. In InvestScape, WACC is the default discount rate suggestion for the DCF module when the user hasn't set a required return.
**Worked example (original):** 65% debt at 5.5% interest, 35% equity requiring 11%, corporate tax 27%:
`WACC = 0.65 × 0.055 × 0.73 + 0.35 × 0.11 = 2.61% + 3.85% = 6.46%`
**Bubble Implementation:** computed in the DCF module workflow; Tc is a user-profile setting defaulting to 0 for personal ownership.

### F-103 · Capital Asset Pricing Model (CAPM) — reference form
**Formula:** `Re = Rf + β × (Rm − Rf)`
**Variables:** Rf = risk-free rate · β = asset's sensitivity to market risk · Rm = expected market return
**Tier:** COM (reference only in MVP)
A way to reason about what equity return an investor *should* demand: start from the risk-free rate, then add a premium scaled by how risky the asset is relative to the market. For private real estate, β is not directly observable, so InvestScape treats CAPM as an educational reference rather than a computed metric — it explains *why* required returns exceed bond yields.
**Bubble Implementation:** Library content only; not computed.

---

## Category 2 · Time Value of Money

### F-201 · The Five TVM Variables (T-Bar convention)
**Variables:** `N` = number of periods · `I` = periodic interest/discount rate · `PV` = present value (today's dollars) · `PMT` = level payment per period · `FV` = future value
**Tier:** RES/COM/DEV — foundation for everything below
Every financing and investment calculation in InvestScape reduces to these five quantities: know any four, solve the fifth. Cash out of the investor's pocket is negative; cash in is positive. The T-bar (period column beside cash-flow column) is the visual convention InvestScape uses in the DCF module to show a deal's timeline at a glance.

### F-202 · Future Value of a Lump Sum (Compounding)
**Formula:** `FV = PV × (1 + i)^n`
**Tier:** RES/COM/DEV
What today's money grows into when returns are reinvested. Compounding is exponential, not linear — growth accelerates because each period earns returns on prior returns. Used in InvestScape for projected value escalation (rents, expenses, resale price) at user-set growth rates.
**Worked example:** $250,000 at 6% for 10 years → `250,000 × 1.06^10 = $447,712`.

### F-203 · Future Value of an Annuity
**Formula:** `FV = PMT × [((1 + i)^n − 1) ÷ i]`
**Tier:** COM/DEV
What a repeating deposit grows into. Relevant for reserve funds and sinking funds — e.g., how a monthly replacement-reserve contribution accumulates toward a future roof.

### F-204 · Present Value of a Lump Sum (Discounting)
**Formula:** `PV = FV ÷ (1 + i)^n`
**Tier:** RES/COM/DEV
Compounding run backwards: what a future dollar is worth today, given that waiting has a cost. The discount rate is personal — it reflects what the investor could otherwise earn. This single idea powers all of DCF analysis: future cash flows are worth less than face value, and the further out they sit, the steeper the haircut.
**Worked example:** $500,000 receivable in 7 years, discounted at 8% → `500,000 ÷ 1.08^7 = $291,745`.

### F-205 · Present Value of an Annuity
**Formula:** `PV = PMT × [(1 − (1 + i)^−n) ÷ i]`
**Tier:** RES/COM/DEV
Today's value of a stream of level payments. This is also the *loan amount formula in reverse* — a mortgage is nothing more than a lender buying an annuity (the borrower's payments) at a price (the loan) that yields the contract rate. InvestScape's maximum-loan-by-DSCR method (F-504) runs on exactly this.

### F-206 · Loan Payment (rearranged from F-205)
**Formula:** `PMT = Loan × i ÷ (1 − (1 + i)^−n)`
where `i = (1 + r/2)^(1/6) − 1` (Canada, monthly payments) or `i = r/12` (US)
**Tier:** RES/COM/DEV — core engine formula
The level payment that fully amortizes a loan over n periods at periodic rate i. **This is the formula the InvestScape engine already implements with the dual-market compounding toggle** — validated against the Mortgage & Rent Analysis Template v2 base case and pending confirmation against the FCAC calculator.

### F-207 · Rule of 72
**Formula:** `Years to double ≈ 72 ÷ annual return (%)`
**Tier:** RES/COM — Library/AI color only
A mental-math shortcut: money at 6% doubles in about 12 years; at 9%, about 8. Not an engine calculation — but the AI narrative layer may use it to translate growth rates into intuition ("at this appreciation rate, the equity roughly doubles in a decade").

---

## Category 3 · The Cash Flow Model

### F-301 · Four Components of Any Investment
**Structure:** `PV` initial cash invested (negative) · `N` holding period · `PMT` annual cash flow from operations · `FV` net sale proceeds in year N
**Tier:** COM/DEV
Every income-property investment, however complex, is a T-bar with these four entries. InvestScape's DCF module renders precisely this: initial equity out at year 0, operating cash flows years 1 through N−1, and operating cash flow plus sale proceeds in year N. Getting these four numbers right is the whole game — the IRR and NPV that follow are mechanical.

### F-302 · Initial Investment (Equity at Close)
**Formula:** `Initial Investment = Purchase Price − Loan Amount + Acquisition Costs`
**Tier:** RES/COM/DEV
The real cash a buyer parts with at closing — down payment plus transaction costs (transfer taxes, legal, inspections, loan fees). InvestScape's Purchase Info waterfall already computes this; jurisdiction taxes (e.g., BC Property Transfer Tax) come from admin-editable settings.

### F-303 · Net Sale Proceeds (Reversion)
**Formula:** `Sale Proceeds = Projected Sale Price − Cost of Sale − Loan Balance at Sale`
**Tier:** COM/DEV
What the investor actually banks when the property sells: the price, minus selling costs (commission, legal), minus whatever the lender is still owed. The projected sale price itself typically comes from direct capitalization of the following year's NOI (F-405). Loan balance at sale requires an amortization schedule — the engine computes remaining balance at month N as the PV of the remaining payments.
**Bubble Implementation:** `Balance(N) = PMT × (1 − (1+i)^−(n_total − N)) ÷ i`.

---

## Category 4 · Investment Performance Measures

### F-401 · Net Operating Income (NOI) — the income waterfall
**Formula:**
```
  Potential Rental Income (PRI)
+ Other income subject to vacancy
− Vacancy & credit losses
= Effective Rental Income (ERI)
+ Other income not subject to vacancy
= Gross Operating Income (GOI)
− Operating Expenses
= Net Operating Income (NOI)
```
**Excluded from operating expenses:** debt service · depreciation · capital expenditures · owner's income taxes · replacement reserves
**Tier:** RES/COM/DEV — the single most important number in the platform
NOI is what the building itself earns in a year, before any financing or tax effects — which makes it comparable across buyers and across financing structures. The exclusion list matters as much as the waterfall: a seller's "NOI" that quietly includes reserves or excludes management is the most common source of overstated asking cap rates. InvestScape's AI narrative explicitly flags when user inputs blur these lines (e.g., reserves entered as an operating expense).
**Distinction from the residential module:** the Template v2 residential statement treats vacancy as months-vacant and percentage expenses of gross; the commercial waterfall splits *two kinds of other income* (vacancy-affected vs. not — e.g., laundry vs. cell-tower lease) and formalizes the ERI/GOI intermediate lines. Same skeleton, finer joints.
**Worked example (original):** 12 units averaging $1,650/mo → PRI $237,600; parking income $9,600 (vacancy-affected); vacancy 4% → ERI `(237,600 + 9,600) × 0.96 = $237,312`; rooftop antenna lease $6,000 (not vacancy-affected) → GOI $243,312; operating expenses $84,000 → **NOI $159,312**.

### F-402 · Cash Flow from Operations
**Formula:** `Cash Flow = NOI − Annual Debt Service`
**Tier:** RES/COM/DEV
The owner's actual pocket money after the lender is paid. This is the "PMT" line of the cash flow model and the number most small investors feel month to month. Already implemented in the residential engine.

### F-403 · Cash-on-Cash Return (CoC)
**Formula:** `CoC = Annual Cash Flow ÷ Initial Equity Investment`
**Tier:** RES/COM/DEV
The year-one yield on the cash the investor actually put in. Because it sits after debt service, CoC is exquisitely sensitive to financing terms — the same building shows a different CoC at every loan quote. Useful as a first-year screen; misleading as a whole-deal verdict because it ignores appreciation, principal paydown, and sale.
**Canonical definition note:** InvestScape defines the numerator as *cash flow after debt service* and the denominator as *total initial cash invested (down payment + closing + initial improvements)*. The legacy Rental Property Evaluator's label implied NOI ÷ down payment — that definition is **rejected** for the engine; flagged in the reconciliation log.

### F-404 · Capitalization Rate — the IRV triangle
**Formulas:** `R = I ÷ V` · `V = I ÷ R` · `I = V × R`
**Variables:** I = NOI · R = cap rate · V = value or price
**Tier:** RES/COM/DEV — core engine formula
One relationship, three uses: measure a deal's unleveraged yield (R), price a building from its income (V), or infer what income a price implies (I). The engine exposes all three rearrangements; the UI picks the one matching what the user knows.
**Two cap rates, one deal — a deliberate InvestScape distinction:** the *market cap rate* (NOI ÷ purchase price) and the *yield-on-cost* (NOI ÷ total asset cost including transfer tax, legal, and capitalized improvements — the CAP Rate Worksheet lineage). Both are displayed and labeled; conflating them is a classic analytical error the AI narrative guards against.

### F-405 · Direct Capitalization (valuation)
**Formula:** `Market Value = Stabilized NOI ÷ Market Cap Rate of comparables`
**Tier:** COM/DEV
The commercial world's core pricing shortcut: take one year of *stabilized* NOI (market rents, market vacancy — not the current owner's quirks) and divide by the cap rate that similar buildings actually traded at. Also how InvestScape projects resale value: apply an exit cap rate to the year-after-sale NOI. The exit cap assumption dominates DCF results and gets its own sensitivity control in the UI.

### F-406 · Value Sensitivity to NOI ($1 of NOI)
**Formula:** `Value of $1 NOI change = 1 ÷ Cap Rate`
**Tier:** COM/DEV
The multiplier hiding inside every cap rate: at a 4% cap, each additional dollar of NOI adds $25 of value; at 8%, only $12.50. This is why expense recovery and small rent bumps matter so much in low-cap markets — and why the AI narrative quantifies value impact whenever a user changes an income assumption ("raising laundry income $1,200/yr implies ≈ $30,000 of value at your 4% cap").

### F-407 · Gross Rent Multiplier (GRM)
**Formula:** `GRM = Price ÷ Gross Annual Rental Income`
**Tier:** RES/COM
The crudest screen in the toolkit — how many years of gross rent the price represents. Ignores expenses entirely, so it only works for comparing *similar* buildings in the *same* market. InvestScape includes it in the Quick Screen module because brokers quote it constantly; the AI narrative pairs it with a caution when expense profiles differ.

### F-408 · Operating Expense Ratio (OER)
**Formula:** `OER = Operating Expenses ÷ Gross Operating Income`
**Tier:** RES/COM/DEV
The share of every income dollar consumed by running the building. Trend matters more than level: a rising OER with flat rents is an early-warning indicator. Already implemented in the Quick Screen module.

### F-409 · Internal Rate of Return (IRR)
**Definition:** the discount rate at which the present value of all future cash flows (operations + sale) exactly equals the initial investment — equivalently, the rate making NPV = 0.
**Formula (solved numerically):** `0 = −PV₀ + Σ [CFₜ ÷ (1 + IRR)ᵗ]`
**Decision rule:** acceptable when IRR ≥ investor's required rate of return.
**Tier:** COM/DEV
The whole-deal yield: one number that accounts for every dollar in and out, *and when it moved*. Two properties with identical totals but different timing produce different IRRs — money that arrives sooner is worth more. IRR has no closed-form solution; the engine solves it iteratively.
**Bubble Implementation:** Newton–Raphson or bisection in a server-side workflow (or API Connector to a calculation endpoint); seed guess = CoC + 5%; cap at 200 iterations; flag non-convergence and multiple-sign-change cash flows (which can produce multiple IRRs) to the user.

### F-410 · Net Present Value (NPV)
**Formula:** `NPV = Σ [CFₜ ÷ (1 + r)ᵗ] − Initial Investment`, r = investor's required return
**Decision rules:** NPV > 0 → deal beats the required return · NPV = 0 → exactly meets it · NPV < 0 → falls short
**Tier:** COM/DEV
IRR's complement: instead of asking "what rate does this deal earn," NPV asks "at *my* rate, is this deal worth more than it costs — and by how many dollars?" NPV is the better ranking tool when comparing deals of different sizes, because it speaks in dollars rather than percentages. The Offer Comparison screen surfaces both.

---

## Category 5 · Financial Leverage

### F-501 · Loan-to-Value Ratio (LTV)
**Formulas:** `LTV = Loan ÷ Price (or Value)` · `Loan = Price × LTV`
**Tier:** RES/COM/DEV
The borrowed share of the purchase. Lenders cap it; investors push it. Already implemented.

### F-502 · Debt Service Coverage Ratio (DSCR)
**Formulas:** `DSCR = NOI ÷ Annual Debt Service` · `Max ADS = NOI ÷ required DSCR`
**Tier:** COM/DEV — and worth surfacing in RES
The lender's stress question: how many times over does the building's income cover the mortgage? A DSCR of 1.25 means income exceeds debt service by 25% — the standard commercial floor, though it varies by asset class and lender. Below 1.0 the property cannot carry its own loan. InvestScape shows DSCR on every leveraged deal and the AI narrative flags anything under 1.20 as lender-sensitive.

### F-503 · Maximum Loan — LTV Method
**Formula:** `Max Loan = Price (or appraised value) × maximum LTV`
**Tier:** COM/DEV

### F-504 · Maximum Loan — DSCR Method
**Procedure:**
1. `Max ADS = NOI ÷ minimum DSCR`
2. `Max periodic payment = Max ADS ÷ payments per year`
3. `Max Loan = PV of that payment stream` at the contract rate and amortization (F-205)
**Tier:** COM/DEV
The income-side constraint on borrowing: start from what the building can afford to pay, then ask what loan those payments support. 
**Lender's rule:** the loan offered is the **lesser** of the LTV method and the DSCR method. In strong markets with compressed cap rates, DSCR usually binds — buyers discover they can't borrow "the full 70%" because the income can't carry it. InvestScape's Loan Sizing card runs both methods side by side and labels which one binds.
**Worked example (original):** value $1,800,000, NOI $81,000, max LTV 65%, min DSCR 1.25, rate 5.2% (CA semi-annual), 25-yr amortization, monthly payments.
LTV method: `1,800,000 × 0.65 = $1,170,000`.
DSCR method: max ADS `81,000 ÷ 1.25 = $64,800` → monthly `$5,400` → periodic rate `i = (1.026)^(1/6) − 1 = 0.004287` → `Max Loan = 5,400 × (1 − 1.004287^−300) ÷ 0.004287 ≈ $910,600`.
**Loan granted ≈ $910,600 — DSCR binds.**

### F-505 · Leverage State (Positive / Negative / Neutral)
**Test:** compare the **unlevered yield** (`NOI ÷ Value`) against the **cost of debt**.
`Equity Yield = Equity Cash Flow ÷ Equity Invested` · `Cost of Debt = Debt Service ÷ Loan` (interest-only case) or the loan's effective rate
- **Positive leverage:** cost of debt < unlevered yield → borrowing *raises* the return on equity; more debt, higher equity yield
- **Negative leverage:** cost of debt > unlevered yield → borrowing *drags* equity returns below the unlevered yield; more debt makes it worse
- **Neutral:** equal → leverage changes risk, not return
**Tier:** COM/DEV — and the single most valuable commercial concept to surface in RES
This is the mathematics behind "cheap debt makes deals": a 10% building financed at 5% concentrates the spread onto a smaller equity base. It cuts both ways — the same arithmetic that turns 10% into 22% on the way up turns it into 5% when rates exceed yields. InvestScape computes the leverage state on every financed deal and the AI narrative names it explicitly ("this deal carries negative leverage at the quoted rate — the mortgage is earning more than the equity is").
**Worked example (original):** value $900,000, NOI $54,000 (6.0% unlevered). Interest-only debt of $600,000 at 4.5% costs $27,000/yr → equity cash flow $27,000 on $300,000 equity = **9.0% equity yield → positive leverage**. Same deal at a 7.5% rate: debt costs $45,000 → equity cash flow $9,000 on $300,000 = **3.0% → negative leverage**.

---

## Category 6 · Supporting Definitions (Glossary layer)

Standard acronyms surfaced as hover-tooltips throughout the app: **ADS** annual debt service · **CAPM** capital asset pricing model · **CoC** cash-on-cash · **DCF** discounted cash flow · **DSCR** debt service coverage ratio · **ERI** effective rental income · **GOI** gross operating income · **GRM** gross rent multiplier · **IRR** internal rate of return · **LTV** loan-to-value · **NOI** net operating income · **NPV** net present value · **OER** operating expense ratio · **PRI** potential rental income · **TVM** time value of money · **WACC** weighted average cost of capital.

---

## Engine reconciliation log (decisions locked by this document)

1. **CoC definition** — cash flow after debt service ÷ total initial cash invested. Legacy Evaluator's implied NOI-÷-down-payment definition rejected. (F-403)
2. **Two cap rates displayed** — market cap (NOI ÷ price) and yield-on-cost (NOI ÷ total asset cost); never conflated. (F-404)
3. **Commercial NOI waterfall** adds ERI/GOI intermediate lines and dual other-income treatment; residential statement remains the simplified Template v2 form. Both feed the same DealMetrics fields. (F-401)
4. **Loan sizing** — always compute both LTV and DSCR methods; grant = lesser; display which binds. (F-503/504)
5. **Leverage state** computed on every financed deal; feeds AI narrative vocabulary. (F-505)
6. **IRR/NPV** — server-side numeric solve; flag multiple-sign-change cash flows. (F-409/410)
7. **Compounding** — CA semi-annual / US monthly toggle applies to F-206, F-303, F-504.

## AI narrative layer notes

When interpreting DealMetrics, the Claude API prompt template may reference any entry above by ID. Framing rules unchanged: "the numbers indicate…", no advice, no invented market data, disclaimers per template 05. New vocabulary unlocked by this library: *leverage state, binding constraint (LTV vs DSCR), stabilized NOI, exit cap sensitivity, value-per-dollar-of-NOI.*

---
*End of document 06 · Next: Library screen renders these as Formula Cards; Development Studio (doc 07, planned) will extend with construction proforma mathematics from the five developer templates.*
