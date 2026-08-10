# InvestScape Engine Reference (E1-E53)

Complete reference for all 52 active calculation engines in the InvestScape ecosystem.

**Organization:** E1-E28 (Financial) | E29-E45 (Economic) | E46-E53 (Tax)
**Note:** E36 excluded pending legal review

---

## Financial Engines (E1-E28)

### E1: Monthly Mortgage Payment
**Purpose:** Calculate monthly debt service on a property mortgage.
**Inputs:** Purchase price, down payment %, annual interest rate, amortization years
**Outputs:** Monthly payment amount, qualifying rate (stress test)
**Use Case:** Mortgage affordability analysis, deal underwriting

### E2: Amortization Schedule
**Purpose:** Generate period-by-period loan balance, principal, and interest paid.
**Inputs:** Loan details (principal, rate, term), country (Canada/US), months
**Outputs:** Amortization table with balance progression
**Use Case:** Detailed mortgage schedules, tax deduction tracking

### E3: Cash Flow Analysis
**Purpose:** Calculate annual NOI (Net Operating Income) and cash flow over hold period.
**Inputs:** Rent, vacancy, expenses, debt service, growth rates
**Outputs:** Yearly cash flow series with gross rent, NOI, net cash flow
**Use Case:** Multi-year rental property projections

### E4: Exit Proceeds
**Purpose:** Calculate property sale price, net proceeds, and full-cycle IRR at exit.
**Inputs:** Sale price method (flat growth or cap rate, via E28), selling costs, loan payoff
**Outputs:** Sale price, net proceeds, remaining loan balance, full-cycle IRR
**Use Case:** Deal exit analysis, hold period profitability

### E5: Returns Calculation (IRR/MIRR/Equity Multiple)
**Purpose:** Calculate financial returns (IRR, MIRR, equity multiple) from cash flow series.
**Inputs:** Cash flow series, equity invested, finance rate, reinvest rate
**Outputs:** IRR, MIRR, equity multiple
**Use Case:** Portfolio performance metrics, deal ranking

### E6: Mortgage Qualification
**Purpose:** Determine if borrower qualifies for mortgage based on GDS/TDS ratios.
**Inputs:** Income, debts, property costs, mortgage details
**Outputs:** GDS ratio, TDS ratio, qualification pass/fail
**Use Case:** Lender qualification checks, borrower eligibility

### E7: CMHC Mortgage Insurance
**Purpose:** Calculate CMHC insurance premium for low-down-payment mortgages.
**Inputs:** Purchase price, down payment %
**Outputs:** Insurance premium amount
**Use Case:** True-up of financing costs for <20% down

### E8: Capital Stack
**Purpose:** Model multi-tranche financing (senior, mezzanine, equity) and weighted average cost.
**Inputs:** Tranches (type, amount, rate), hold period
**Outputs:** Total capital, interest costs, WAC (weighted average cost)
**Use Case:** Complex financing structures, blended cost analysis

### E9: DSCR (Debt Service Coverage Ratio)
**Purpose:** Calculate property's ability to cover debt service from NOI.
**Inputs:** Gross rent, vacancy, operating expenses, debt service
**Outputs:** NOI, DSCR ratio
**Use Case:** Lender risk assessment, refinancing qualification

### E10: Portfolio Rollup
**Purpose:** Aggregate multiple properties into portfolio-level metrics and concentration risk.
**Inputs:** Properties (name, equity, cash flows, values, DSCR)
**Outputs:** Pooled IRR, total equity, cash flow floor, concentration risk
**Use Case:** Multi-property portfolio analysis

### E11: PTT (Property Transfer Tax)
**Purpose:** Calculate property transfer tax based on jurisdiction and property type.
**Inputs:** Purchase price, province, country, FTHB status, property details
**Outputs:** PTT amount
**Use Case:** Acquisition cost accounting

### E12: Break-Even Analysis
**Purpose:** Identify rent level needed to break even on cash flow (accounting or cash).
**Inputs:** Mortgage, rent, expenses, mode (down payment or monthly payment)
**Outputs:** Break-even rent or required down payment
**Use Case:** Minimum rent analysis, deal viability

### E13: Appreciation (Hold Period Equity Gain)
**Purpose:** Calculate equity gain from property appreciation over hold period.
**Inputs:** Purchase price, annual appreciation rate, hold years, remaining loan balance
**Outputs:** Appreciation gain, new total equity
**Use Case:** Equity buildup projections, hold period analysis

### E14: Refinance Analysis
**Purpose:** Analyze profitability of refinancing (new rate, amortization, costs).
**Inputs:** Current loan, new rate, amortization, refinance costs, hold period, NOI
**Outputs:** Cash flow impact, breakeven timeline
**Use Case:** Refinance feasibility, rate-drop opportunity analysis

### E15: Scenario Comparison
**Purpose:** Compare multiple deal scenarios (rent growth, expense growth, appreciation, cap rates).
**Inputs:** Base deal parameters, scenario assumptions
**Outputs:** IRR and cash flow for each scenario
**Use Case:** Sensitivity analysis, risk modeling

### E16: BRRRR (Buy-Rehab-Rent-Refinance-Repeat)
**Purpose:** Model cash flow and refinance proceeds after value-add rehabilitation.
**Inputs:** Purchase, rehab cost/timeline, new rent, refinance rate, hold period
**Outputs:** Cash flow during hold, refinance proceeds, residual equity
**Use Case:** Value-add investment strategy analysis

### E17: Holding Period Sensitivity
**Purpose:** Calculate returns for a range of holding periods under scenario assumptions.
**Inputs:** Base deal, growth/appreciation/cap rates
**Outputs:** IRR and cash flow for 1-30 year holding periods
**Use Case:** Optimal hold period identification

### E18: Tax Optimization
**Purpose:** Estimate tax liability on income and capital gains with depreciation deduction.
**Inputs:** Property value, improvement/land split, NOI, cap gains rate, depreciation rate
**Outputs:** Tax liability, after-tax cash flow
**Use Case:** Tax-aware deal analysis (note: consult E46-E53 for precise jurisdictional tax calculations)

### E19: Data Provenance
**Purpose:** Track source and confidence of input data points (user, market, appraised, estimated).
**Inputs:** Property parameters with source metadata
**Outputs:** Confidence-weighted metrics
**Use Case:** Data quality auditing, sensitivity to assumptions

### E20: FX Conversion
**Purpose:** Convert deal metrics between CAD and USD with spot rate and hold-period tracking.
**Inputs:** Deal metrics, currency pair, FX rate, rate source
**Outputs:** Converted metrics in target currency
**Use Case:** Cross-border investing, multi-currency portfolios

### E21: Rental Waterfall
**Purpose:** Model monthly rent collection across multiple units with ramp-up periods.
**Inputs:** Units (rent, vacancy, ramp timeline)
**Outputs:** Month-by-month rental income and occupancy
**Use Case:** Multi-unit property phased absorption, lease-up schedules

### E22: Property Tax
**Purpose:** Estimate annual property tax based on jurisdiction and property type.
**Inputs:** Property value, province/state, property type, construction age
**Outputs:** Annual property tax amount
**Use Case:** Operating expense estimation

### E23: OpEx Benchmark
**Purpose:** Provide industry operating expense benchmark as % of gross rent.
**Inputs:** Property type, gross rent, location tier, management %
**Outputs:** Estimated operating expense
**Use Case:** Feasibility check, conservative budgeting

### E24: Insurance Estimation
**Purpose:** Estimate annual property insurance cost.
**Inputs:** Property value, type, LTV %, building age, insurance history
**Outputs:** Annual insurance premium estimate
**Use Case:** Operating expense estimation

### E25: Lender Scorecard
**Purpose:** Score deal against typical lender criteria (ratios, credit, LTV, property type).
**Inputs:** GDS, TDS, DSCR, LTV, credit score, loan type, property type
**Outputs:** Lender approval likelihood, risk score
**Use Case:** Financing feasibility, refinance readiness

### E26: Amortization Display
**Purpose:** Format amortization schedules for multi-tranche loans with visual formatting.
**Inputs:** Multiple loan tranches with rates/terms
**Outputs:** Structured amortization tables (monthly/annual)
**Use Case:** Investor reports, financing documentation

### E27: Chart Data
**Purpose:** Prepare cash flow and amortization data for visualization (charts/graphs).
**Inputs:** Deal summary, cash flow schedule, amortization display
**Outputs:** Formatted data for charting (e.g., ApexCharts)
**Use Case:** Dashboard visualization, investor presentations

### E28: Sales Price Appreciation
**Purpose:** Calculate property sale price using flat growth or cap rate method.
**Inputs:** Purchase price & growth rate OR final-year NOI & exit cap rate
**Outputs:** Projected sale price
**Use Case:** Exit analysis (feeds E4), market valuation methods

---

## Economic Engines (E29-E45)

### E29: Regional Macro Context
**Purpose:** Provide macro-economic indicators (GDP, unemployment, inflation) for a region.
**Inputs:** Province/state, analysis date
**Outputs:** Macro metrics (GDP growth, unemployment, inflation)
**Use Case:** Market context, economic sensitivity analysis

### E30: City Market Analysis
**Purpose:** Analyze specific city market (population growth, housing supply, price trends).
**Inputs:** City, province/state, analysis date
**Outputs:** Market growth rate, supply/demand, price trend
**Use Case:** Market selection, investment timing

### E31: Neighborhood Demographics
**Purpose:** Provide demographic data for a neighborhood (population, income, education, diversity).
**Inputs:** Neighborhood, city, country
**Outputs:** Demographic profile with growth trends
**Use Case:** Rental market analysis, neighborhood selection

### E32: Comparable Sales Analysis
**Purpose:** Analyze recent comparable sales to validate property valuation.
**Inputs:** Property details, sale comparables
**Outputs:** Market-based valuation, price/sqft trends
**Use Case:** Appraisal validation, offer strategy

### E33: Rental Comp Engine
**Purpose:** Analyze rental comparables to set rent expectations.
**Inputs:** Property characteristics, comp units in area
**Outputs:** Market rent range, rental trends
**Use Case:** Rent assumption validation, market rent setting

### E34: School Rating Engine
**Purpose:** Provide school ratings and quality metrics for neighborhood.
**Inputs:** Neighborhood, school type, grade level
**Outputs:** School ratings, test scores, quality index
**Use Case:** Family-oriented rental appeal, neighborhood quality

### E35: Walkability & Transit Scorer
**Purpose:** Score neighborhood walkability and transit access.
**Inputs:** Neighborhood, address, transit type
**Outputs:** Walkability score, transit access score
**Use Case:** Renter appeal, neighborhood quality, tenant retention

### E36: Crime & Safety Engine — excluded from active API
**Status:** Implemented in investscape-economic-engine but **not** routed in investscape-api pending legal review.
**Purpose (as implemented):** Score neighborhood crime/safety metrics.
**Use Case:** Not currently available via the public API; do not reference in integration docs as active.

### E37: Market Velocity Analyzer
**Purpose:** Track neighborhood price and sale velocity (days on market, months inventory).
**Inputs:** Neighborhood, time period
**Outputs:** Market velocity (hot/balanced/cold), inventory months
**Use Case:** Timing analysis, buyer/seller power assessment

### E38: Macro-Micro Sensitivity
**Purpose:** Analyze how macro factors (rates, employment) affect micro property cash flows.
**Inputs:** Property cash flows, macro sensitivity assumptions
**Outputs:** Cash flow sensitivity to rate changes, unemployment, etc.
**Use Case:** Risk modeling, stress testing

### E39: Mortgage Rate Forecast
**Purpose:** Project mortgage rate trajectories based on economic forecasts.
**Inputs:** Current rate, forecast period, economic outlook
**Outputs:** Projected mortgage rates (short/medium/long term)
**Use Case:** Refinance timing, rate lock strategy

### E40: Appreciation Probability
**Purpose:** Forecast property appreciation probability based on market fundamentals.
**Inputs:** Neighborhood, historical appreciation, macro factors
**Outputs:** Appreciation likelihood (high/medium/low), expected rate
**Use Case:** Risk-adjusted return modeling

### E41: Market Cycle Indicator
**Purpose:** Identify current position in real estate cycle (early/peak/contraction/recovery).
**Inputs:** Market metrics, price trends, inventory, prices
**Outputs:** Cycle phase, time-in-phase, recovery indicators
**Use Case:** Entry/exit timing, cycle-aware investing

### E42: Neighborhood Investment Score
**Purpose:** Composite score ranking neighborhood investment quality (growth, fundamentals, supply).
**Inputs:** Neighborhood, macro/micro factors, rental trends
**Outputs:** Investment score (0-100), ranking vs. comparable areas
**Use Case:** Market ranking, geographic diversification

### E43: Portfolio Geographic Diversification
**Purpose:** Analyze geographic concentration risk across portfolio properties.
**Inputs:** Portfolio (properties with locations)
**Outputs:** Geographic concentration %, diversification score
**Use Case:** Risk management, geographic rebalancing

### E44: Currency Risk Exposure
**Purpose:** Model FX risk on cross-border investments (CAD/USD exposure).
**Inputs:** Portfolio with CAD/USD properties, FX rate, holding period
**Outputs:** FX exposure %, currency risk metrics
**Use Case:** Cross-border portfolio management

### E45: Scenario Batch Processor
**Purpose:** Run multiple economic scenarios across a portfolio in one operation.
**Inputs:** Portfolio, economic scenarios (rate, unemployment, growth variations)
**Outputs:** Portfolio results for each scenario
**Use Case:** Monte Carlo analysis, risk modeling

---

## Tax Engines (E46-E53)

### E46: Tax Aggregation
**Purpose:** Aggregate rental income, deductions, and losses across multiple properties.
**Inputs:** Multiple properties with income/expense data
**Outputs:** Consolidated tax summary (gross income, total deductions, net taxable income)
**Use Case:** Year-end tax planning, multi-property tax reporting

### E47: Personal Income Tax
**Purpose:** Calculate federal and state/provincial income tax on rental income.
**Inputs:** Taxable income, jurisdiction (country, state/province), filing status
**Outputs:** Tax bracket, tax liability, effective rate
**Use Case:** After-tax cash flow analysis, tax liability estimation

### E48: Depreciation & Recapture
**Purpose:** Calculate CCA (Canada) or MACRS (US) depreciation and recapture on property sale.
**Inputs:** Property type, purchase price, improvement value, hold years
**Outputs:** Annual depreciation, cumulative CCA/MACRS, recapture on sale
**Use Case:** Tax deduction tracking, sale tax liability

### E49: Mortgage Interest Deduction
**Purpose:** Track deductible mortgage interest by period (separate from principal).
**Inputs:** Loan schedule, country jurisdiction
**Outputs:** Annual deductible interest, principal vs. interest split
**Use Case:** Tax deduction tracking, rental income reporting

### E50: Operating Expense Deduction
**Purpose:** Classify expenses as deductible (e.g., repairs, insurance, property tax) vs. capitalized.
**Inputs:** Expense items with amounts
**Outputs:** Deductible expenses, capitalized items, tax guidance
**Use Case:** Tax return preparation, deduction tracking

### E51: Developer Profit & Tax
**Purpose:** Calculate taxable profit on development projects and development tax liability.
**Inputs:** Development cost, revenue, construction period, tax status
**Outputs:** Taxable profit, development tax, after-tax profit
**Use Case:** Development project profitability, tax planning

### E52: GST/HST & Development Charges
**Purpose:** Calculate GST/HST on property transactions and development charges (Canada-only).
**Inputs:** Property value, province, property type, development scope
**Outputs:** GST/HST amount, development charges
**Use Case:** Canadian transaction costs, development feasibility

### E53: Passive Activity Loss (PAL)
**Purpose:** Apply US passive activity loss limitations on rental property income.
**Inputs:** Rental income/losses, real estate professional status
**Outputs:** Deductible PAL, carryforward losses
**Use Case:** US tax return preparation, passive loss strategy

---

## Engine Selection Guide

**For Initial Deal Analysis:** E1–E10, E12–E17
**For Market Research:** E29–E35, E37, E39–E42
**For Financing:** E1, E6–E9, E14, E25
**For Tax Planning:** E18, E46–E53
**For Portfolio Management:** E10, E20, E43–E45

---

## Integration Notes

- Engines are numbered E1–E53. E36 (Crime & Safety) is implemented in investscape-economic-engine but excluded from the active API surface pending legal review — 52 of 53 numbered engines are active.
- API routes expose all 52 active engines via REST endpoints (see `investscape-api/src/routes/index.ts`).
- Schemas validated via Zod in investscape-api.
- Engines live in their source repositories: investscape-calc-engine (E1–E28), investscape-economic-engine (E29–E45), investscape-tax-engine (E46–E53).

---

© 2026 Lighthouse Research Ltd. All rights reserved.
