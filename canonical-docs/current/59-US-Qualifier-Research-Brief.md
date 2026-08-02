# InvestScape — Doc 59: US Financing Qualifier — Research Brief & Blocking Questions

**Lighthouse Research Ltd. · 1 August 2026**
**Research input for the US qualifier Design pass. Report-only — decides nothing.**

**Why this document exists.** Eric is BCFSA-licensed in British Columbia only, holds no US licence, and has no US lending experience to draw on. Every figure below is researched, dated, and sourced. **None of it is founder domain knowledge, and none of it should be treated with the confidence the Canadian side carries** — the Canadian mortgage engine was validated to an exact match against the FCAC calculator; nothing here has an equivalent authority check yet. Read §7 before building.

---

## 1. The headline finding: there is no US stress test

This is the single most important structural fact, and it inverts the assumption that the US qualifier is the Canadian one with different numbers.

Canada's B-20 stress test is a **hard, universal, government-imposed qualifying overlay**: qualify the payment at the greater of contract rate + 2% or the floor.

The US had something loosely analogous — a hard 43% DTI ceiling inside the Qualified Mortgage definition — **and removed it.** <cite index="27-1">The December 2020 CFPB final rule replaced the strict 43% debt-to-income ratio basis for General QM with a loan-price analysis tied to APR limits, and removed Appendix Q</cite>. <cite index="30-1">The 43% DTI requirement was replaced with requirements based on mortgage pricing reflecting borrower credit quality; the CFPB concluded that although a loan's price is not a direct measure of ability to repay, it is an effective indirect measure</cite>. Mandatory compliance landed 1 July 2021.

What replaced it is a **lender-side legal-safe-harbour test, not a borrower-facing affordability test**: <cite index="26-1">a first-lien loan is a safe-harbour QM if its APR exceeds the average prime offer rate for a comparable transaction by less than 1.50%</cite>, with <cite index="27-1">the rebuttable-presumption band running from 1.5 up to 2.25 percentage points over APOR</cite>.

**Design consequence.** The APR-vs-APOR test is not a number a borrower can be shown as a pass/fail on their own affordability. It is a compliance category applied to a priced loan offer. **Do not build a "US stress test" card.** Whatever occupies that visual slot on the Canadian screen must be filled with something else, or left empty with an explanation. This is a product decision, not a math port — see §6 Q1.

---

## 2. DTI — structure and thresholds

**Structure.** Two ratios, closely analogous to GDS/TDS but not identical in composition:

- **Front-end (housing) ratio** = PITIA ÷ gross monthly income. **PITIA** = Principal, Interest, Taxes, Insurance, **Association dues (HOA)**.
- **Back-end (total) ratio** = PITIA + all other monthly debt obligations ÷ gross monthly income.

**Composition difference vs Canada — this matters and is easy to get wrong.** Canadian GDS includes a **heating estimate** and **50% of condo/strata fees**. US PITIA includes **100% of HOA dues** and **no heating line at all**. Reusing the Canadian GDS input set with relabelled thresholds would carry a heat estimate the US ratio does not use and halve an HOA figure the US ratio counts in full.

**Thresholds by programme (mid-2026):**

| Programme | Front-end | Back-end | Notes |
|---|---|---|---|
| Conventional — manual underwriting | — | **36%**, to **45%** with credit/reserves | <cite index="13-1">Fannie Mae's maximum total DTI for manually underwritten loans is 36% of stable monthly income, exceedable to 45% where the borrower meets the credit-score and reserve requirements in the Eligibility Matrix</cite> |
| Conventional — automated (DU/LPA) | — | **50%** | <cite index="13-1">For loan casefiles underwritten through Desktop Underwriter, the maximum allowable DTI ratio is 50%</cite> |
| FHA | 31% | 43% | <cite index="11-1">The FHA guideline pairs a 31% front-end with a 43% back-end; in practice the automated system approves well above that when reserves and credit support it</cite> |
| VA | — | 41% published | <cite index="11-1">VA is the outlier — its real gate is the residual income test, which measures dollars left after every obligation</cite> |

**Two things to internalise.** First, **conventional lending has no front-end ratio at all** — only the back-end. A two-ratio display copied from GDS/TDS would show an empty or invented box on the most common US loan type. Second, the binding number is usually the **automated underwriting system finding, not the published guideline** — and <cite index="16-1">if new debt is disclosed during origination and pushes recalculated DTI past 45% manual / 50% DU, the loan becomes ineligible for delivery to Fannie Mae</cite>. Lender overlays can also sit stricter than agency maximums.

**Conforming loan limit.** <cite index="10-1">As of 2026 the maximum conforming single-family Fannie Mae loan limit is $832,750 in most of the country</cite>, higher in designated high-cost areas. Above it, a loan is jumbo, with different underwriting entirely. **D2, admin-maintained** — FHFA resets it annually.

---

## 3. Mortgage insurance — PMI and MIP are not one thing, and neither is CMHC

The Canadian side has one mechanism (CMHC/Sagen/Canada Guaranty premium, LTV-banded, capitalised). The US has **two mechanisms with different cancellation law**, and this is where a naive port does the most damage — because the Canadian premium is a one-time capitalised cost while one US variant is a lifetime recurring cost.

### 3.1 PMI — conventional loans

Required above 80% LTV. <cite index="10-1">Conventional PMI typically costs between $30 and $70 per $100,000 borrowed, depending on down payment, credit score and loan amount</cite>.

Cancellation is governed by the **Homeowners Protection Act of 1998**, and the rules are precise:

- <cite index="43-1">The borrower may request cancellation once the LTV ratio reaches 80%, and PMI automatically terminates at 78% LTV</cite>.
- <cite index="44-1">Automatic termination occurs on the date the principal balance is first *scheduled* to reach 78% of the original value per the amortisation schedule, regardless of the actual outstanding balance, provided the loan is current</cite>.
- <cite index="49-1">Alternatively the servicer must cancel at the midpoint of the amortisation schedule — 15 years on a 30-year loan — even if the balance has not reached 78%</cite>.

**Note the mechanism**: automatic termination keys off the **original value and the scheduled amortisation**, not current market value or actual prepayments. A model that cancels PMI when *current* LTV hits 78% via appreciation will cancel it too early. Borrower-requested cancellation at 80% is the route that responds to paydown, and <cite index="47-1">it requires a written request, a good payment history, and may require showing the current value has not declined and that equity is not subject to a subordinate lien</cite>.

This is a **direct hook into E8**, the amortisation schedule engine built this session. PMI termination dates are computable from the existing schedule. That is a genuine reuse opportunity, not a new engine.

### 3.2 MIP — FHA loans

Structurally different and materially worse for the borrower.

- **Upfront:** <cite index="18-1">the upfront MIP rate is 1.75% of the base loan amount</cite>, payable at closing or financed into the balance.
- **Annual:** <cite index="18-1">annual MIP ranges from 0.15% to 0.75% depending on loan amount and LTV; most borrowers pay 0.55%</cite>. <cite index="25-1">The annual premium is charged against the average outstanding loan balance and varies with loan amount, down payment size and term</cite>.
- **Duration — the critical one:** <cite index="20-1">if the down payment is 10% or more, annual MIP is removed after 11 years; if less than 10%, MIP is paid for the life of the loan, or until the loan is paid off or refinanced</cite>.

**"Life of loan" has no Canadian analogue and no PMI analogue.** A single mortgage-insurance object modelled on CMHC's capitalised one-time premium cannot represent a recurring charge that never terminates. If the qualifier is going to show FHA at all, this needs its own treatment.

---

## 4. The investor track — where InvestScape's actual ICP sits

The consumer-owner-occupier path above is the mortgage-broker segment. For the individual-investor and realtor segments, two US-specific mechanics matter more.

### 4.1 The 75% rental income rule

<cite index="55-1">When current lease agreements or market rents on Form 1007 or 1025 are used, the lender calculates rental income by multiplying gross monthly rent by 75%; the remaining 25% is treated as absorbed by vacancy losses and ongoing maintenance</cite>. <cite index="50-1">This is Fannie Mae B3-3.1-08 / Freddie Mac 5306.1</cite>.

Two traps worth surfacing in the UI: <cite index="52-1">first-time landlords can only use rental income to offset that property's own mortgage payment, not to increase overall qualifying income</cite>, and <cite index="52-1">rental losses from investment properties increase debt obligations and reduce borrowing capacity</cite>.

Note the 25% haircut is an **underwriting convention, not an operating assumption**. It is not the same number as the vacancy rate in the proforma, and must not be wired to the same field. Showing both without distinguishing them will confuse users who see two different "vacancy" figures.

### 4.2 Investment property pricing and DSCR loans

<cite index="50-1">Agency Loan-Level Price Adjustments on non-owner-occupied loans scale with LTV and credit score — at 75% LTV and 740 FICO the LLPA stack adds roughly 2.125 to 3.375 points in fee, translating to roughly 0.5% to 0.875% higher rate than the same borrower's primary residence. Six months of PITI in reserves per financed investment property is typical.</cite>

**DSCR loans** are the non-QM investor product with no direct Canadian retail equivalent, and they matter because they bypass the DTI question entirely:

- <cite index="34-1">Qualification is based on the property's rental income rather than personal finances: DSCR = gross monthly rent ÷ total monthly debt obligations (PITIA). Typical requirements are a 620+ credit score, 20–25% down, 3–12 months of reserves, and a minimum DSCR of 1.0, with 1.25 or higher unlocking the best terms</cite>.
- <cite index="37-1">No personal income documentation, no employment verification, no personal DTI calculation; most programmes allow vesting in an LLC</cite>.
- <cite index="41-1">Rates run roughly 0.5% to 1.5% above conventional</cite>, and <cite index="40-1">most carry prepayment penalties, commonly a 5-year step-down</cite>.

**This is the highest-value US feature for InvestScape's ICP**, and it is closer to existing capability than the consumer qualifier is — the platform already computes DSCR (F-502). The gap is that F-502 uses **NOI ÷ annual debt service** (the commercial convention), while DSCR-loan underwriting uses **gross rent ÷ PITIA**. Same name, different numerator and denominator. Displaying one and labelling it the other would be a real error. See §6 Q4.

---

## 5. Canada ↔ US structural comparison

| Dimension | Canada (built) | United States (not built) |
|---|---|---|
| Ratio names | GDS / TDS | Front-end / Back-end DTI |
| Housing-cost composition | P&I + property tax + **heat** + **50%** condo fees | PITIA — P&I + tax + insurance + **100%** HOA. No heat line |
| Front-end ratio on the main product | Yes (GDS) | **No** — conventional uses back-end only |
| Insured thresholds | 39% / 44% | 45% manual / **50% automated** (conventional); 31%/43% FHA |
| Stress test | **Yes** — greater of contract + 2% or floor | **None.** Replaced 2021 by lender-side APR-vs-APOR safe harbour |
| Mortgage insurance | CMHC/Sagen/CG, LTV-banded, one-time, capitalised | **Two systems**: PMI (cancellable at 80%/78%) and FHA MIP (upfront 1.75% + annual, **life-of-loan under 10% down**) |
| MI cancellation | Runs to end of amortisation | Statutory: HPA 80% request / 78% automatic / midpoint backstop |
| Compounding | Semi-annual *(FCAC-validated)* | Monthly *(built)* |
| Rental income offset | Lender-specific, commonly 50–80% | **75%**, agency-standard |
| Transfer tax | BC PTT, bracket, **buyer-paid** | State-by-state; **some graduated (WA), some none (TX)**, incidence varies — see Doc 58 §2 |
| Investor no-income product | Rare | **DSCR loans** — mainstream, 20–25% down, DSCR ≥ 1.0 |
| Underwriting authority | OSFI B-20 + CMHC | Fannie/Freddie Selling Guides, FHA/HUD, VA, CFPB Reg Z |

---

## 6. Blocking questions — answer before any Design prompt is written

These are product decisions. None has a correct answer derivable from the research.

**Q1 — The empty stress-test slot.** The Canadian qualifier's most prominent element has no US counterpart. Options: (a) leave the slot empty with an explainer that the US has no equivalent — honest, educational, on-brand; (b) offer an optional user-driven "what if rates rise 2%" sensitivity, clearly labelled as InvestScape's own tool and **not** a regulatory requirement; (c) show the APR-vs-APOR band as lender-side context only. **(b) carries the most liability risk** — a self-invented affordability test displayed where a regulatory one sits in the other market invites the inference that it is official. Recommendation is (a), optionally with (b) explicitly labelled a sensitivity, never a "test."

**Q2 — How many US programmes?** Conventional only, or conventional + FHA + VA? Each adds a distinct threshold set and a distinct MI mechanism. FHA in particular drags in life-of-loan MIP, which needs its own model. **Recommendation: conventional only for v1**, since it is the investor-relevant path; log FHA/VA as deferred.

**Q3 — Automated or manual thresholds as the default?** 45% manual vs 50% DU is a 5-point swing on the headline number a user sees. Showing 50% is realistic; showing 45% is conservative. Showing both needs a plain-language explanation of what DU is, to an audience that has never heard of it.

**Q4 — Two DSCRs, one name.** F-502 computes NOI ÷ ADS. DSCR-loan underwriting uses gross rent ÷ PITIA. Same label, different calculation, both legitimate in their own context. Options: rename one, show both side by side with an explainer, or scope DSCR-loan sizing to the US qualifier screen only. This is a **Doc 33 glossary item** in all four languages, not just a UI question.

**Q5 — Does the US qualifier surface DSCR-loan sizing at all in v1?** It is arguably higher ICP value than the consumer DTI path, and reuses more of what exists. But it is a second module, not a variant of the first.

**Q6 — What is the D2 admin surface?** At minimum: DTI thresholds by programme, conforming loan limit, PMI rate table, FHA UFMIP and annual MIP bands, the 75% rental factor, and the HPA cancellation constants. Every one changes on its own schedule with a different authority. Confirm the same admin-editable pattern as `JurisdictionSetting`, and confirm **who** checks them and how often.

---

## 7. Confidence, sourcing and the validation gap

**No figure in this document has an FCAC-equivalent authority check.** Rates and thresholds were gathered from a mix of primary sources (Fannie Mae Selling Guide, CFPB, NCUA, HUD/FHA) and secondary aggregators. Primary sources are cited where used and should be re-verified at build time.

**Secondary sources disagree materially, and it is worth seeing how badly.** On New Jersey's effective property-tax rate, sources retrieved on the same day gave 1.675%, 1.89%, 2.11%, 2.21%, 2.23% and 2.42% — a spread of more than 40% between the low and high figure, all citing "Tax Foundation" or "Census ACS." **This is the case for the D3 discipline in Doc 28 applied to US regulatory constants too.** Anything displayed to a user must come from the primary source, not an aggregator that cites one.

**Verify at build against these, not against this document:**

| Value | Authority |
|---|---|
| DTI maximums, rental-income treatment | Fannie Mae Selling Guide B3-6-02, B3-3.1-08 |
| Conforming loan limit | FHFA annual announcement |
| PMI cancellation mechanics | 12 U.S.C. §§ 4901–4910 (HPA) |
| FHA UFMIP / annual MIP bands | Current HUD Mortgagee Letter |
| QM / APR-vs-APOR thresholds | CFPB Reg Z 12 CFR 1026.43(e) |
| State transfer tax rates and incidence | State DOR (e.g. WA DOR REET page) |

**Legal-exposure note.** A US financing qualifier displaying DTI outcomes and mortgage-insurance costs to US users is squarely inside the "is this mortgage advice?" question already on the agenda for the SaaS lawyer and the real estate regulatory counsel. It is arguably a **larger** exposure than the Canadian qualifier, because there is no BCFSA-equivalent licence backing any of it and the founder has no US licence in any state. Add to the Doc 29A question pack before build, not after.

---

*End of Doc 59 · v1.0 · Research date 1 August 2026 · Companions: Doc 58 (gap log), Doc 60 (reference deal pack)*
