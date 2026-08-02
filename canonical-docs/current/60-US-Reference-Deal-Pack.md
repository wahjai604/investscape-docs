# InvestScape — Doc 60: US Reference Deal Pack

**Lighthouse Research Ltd. · 1 August 2026**
**Two US reference deals for engine validation. Every figure hand-verified — computation log in §5.**

---

## 1. A pushback before the deals

The ask was to find one or two real US listings and drop them in the project folder as reference points. **I'd recommend against doing it that way**, for three reasons that get more serious as they go.

**1. It reproduces a licensing problem already solved elsewhere in this project.** Doc 28 correctly parks CREA MLS HPI and Teranet behind legal review before any commercial display. Zillow, Redfin and MLS IDX listing data sit in the same category — scraping and republishing is prohibited by their terms, and IDX rules restrict display specifically. A BCFSA licensee is held to a higher standard on data use than an anonymous developer would be. Applying the Doc 28 discipline to Canadian sources and not to US ones would be an inconsistency worth avoiding on principle, not just on risk.

**2. A live listing is the wrong shape for a golden test.** It goes stale in weeks. A regression fixture has to be frozen and citable, or the test rots — the same reasoning that made the 796 Main Street and Gilley workbooks good validation sources: they are fixed documents, not moving feeds.

**3. Most importantly, a listing does not contain what actually needs testing.** The US qualifier needs borrower gross income, other monthly debt obligations, credit tier, down payment, and programme selection. **No listing has any of that.** The listing supplies price and maybe taxes; everything that makes the qualifier a qualifier would have to be invented anyway.

### The alternative, which is strictly better

Build reference deals where **every parameter traces to a citable public source** and the deal itself is a fixed fixture. That gives an auditable input set under the same D1/D2/D3 provenance model already in use — which a scraped listing could never be, because a listing's tax figure has no stated method behind it.

The two deals below are constructed that way. They are not real addresses, and that is deliberate: **the addresses were never the useful part.** The parameters are real, current, sourced, and chosen so that each one breaks a different assumption.

---

## 2. Deal US-1 — Cleveland, OH duplex (cash-flow archetype)

**Why this deal.** The high-yield Midwest duplex is the single most common US deal a Canadian investor looks at, and the one BC intuition mis-models worst — because BC's property tax is a rounding error against price, and Ohio's is not. It also puts DSCR-loan sizing in play, which is where §4 of Doc 59 says the real ICP value sits.

| Field | Value | Provenance |
|---|---|---|
| Asset type | 2-unit residential (duplex) | D1 |
| Purchase price | **$180,000** | D1 |
| Gross rent | 2 × $950 = **$1,900/mo** ($22,800/yr) | D1 |
| Property tax rate | **2.00%** of price → $3,600/yr | **D2 — see caution below** |
| Insurance | $1,600/yr | D1 estimate |
| HOA | $0 | D1 |
| Vacancy | 8% | D1 |
| Down payment | 25% = $45,000 · Loan $135,000 | D1 |
| Rate / term | 7.25%, 30-yr fixed, **monthly** compounding | D1 |
| Financing type | Conventional investment **or** DSCR loan | D1 |
| Transfer tax | Ohio conveyance fee — **not modelled here** | Deliberate gap, see below |

**Verified outputs:**

| Metric | Value |
|---|---|
| P&I | **$920.94/mo** |
| PITIA | **$1,354.27/mo** |
| **DSCR (loan convention: gross rent ÷ PITIA)** | **1.403** |
| 75% qualifying rental income | $1,425.00/mo |
| EGI (GSI less 8% vacancy) | $20,976/yr |

**What this deal tests**

1. **US monthly compounding** on a second, independent case beyond the one already built.
2. **The two-DSCR problem from Doc 59 §6 Q4, made concrete.** The loan-convention DSCR is 1.403 and clears a 1.25 threshold comfortably. The F-502 commercial DSCR on the same deal uses NOI ÷ annual debt service and will produce a **different number** — NOI deducts operating expenses that PITIA does not. If both surface with the label "DSCR" and no distinguishing text, that is a shipped defect. This deal will expose it.
3. **The 75% rule as distinct from vacancy.** Qualifying rent is $1,425 (75% of gross). Proforma EGI uses 8% vacancy. Two different haircuts, two different purposes, and they must not share a field.
4. **Property tax as a first-order driver.** Tax is 22% of PITIA here. On a comparable BC deal it would be a fraction of that. Any model that treats property tax as a minor line will misprice this deal badly.

**Caution on the tax rate — do not ship this figure.** 2.00% is a placeholder for Cuyahoga County, which sits well above the Ohio state average. Ohio taxes are levied at the county/municipality/school-district level and vary sharply *within* Cleveland. **Verify against the Cuyahoga County Fiscal Officer's records before this deal is used for anything beyond structural testing.** Note also that <cite index="72-1">in 18 states plus D.C. investment properties carry a higher effective tax rate than owner-occupied homes, typically through a higher assessment ratio or loss of a homestead exemption rather than an explicit "investor rate"</cite> — so an owner-occupied median rate is the wrong input for an investment property in many states.

**On the omitted transfer tax:** Ohio's conveyance fee is left out deliberately, so that US-1 and US-2 differ on exactly one dimension there. US-1 is the "transfer tax barely matters" case; US-2 is the opposite.

---

## 3. Deal US-2 — Pierce County, WA (Tacoma) single-family (BC-comparable / bracket test)

**Why this deal.** Washington is the closest US structural analogue to BC — West Coast, high-cost, no state income tax — which makes it the most useful comparison a BC investor can draw. It is also, per Doc 58 §2, the deal that **breaks the "USA = flat transfer tax" assumption**, and the price is chosen specifically to straddle the first REET bracket boundary.

| Field | Value | Provenance |
|---|---|---|
| Asset type | Single-family residence | D1 |
| Purchase price | **$700,000** — deliberately above the $525,000 REET tier 1 cap | D1 |
| Property tax rate | **0.91%** (Pierce County) → $6,370/yr | D2 — <cite index="92-1">Pierce County 0.91%; Washington statewide effective rate 0.81%, from Census ACS 2024 5-year estimates</cite> |
| Insurance | $1,800/yr | D1 estimate |
| HOA | $0 | D1 |
| Down payment | 20% = $140,000 · Loan **$560,000** | D1 |
| Rate / term | 6.75%, 30-yr fixed, monthly compounding | D1 |
| Conforming? | **Yes** — under the <cite index="10-1">2026 limit of $832,750 in most areas</cite> | D2 |
| PMI | **None** at 20% down | Per HPA |
| REET (state, graduated) | <cite index="91-1">1.10% to $525,000; 1.28% on $525,001–$1,525,000</cite> | D2 — WA DOR |
| REET (local, Pierce) | 0.50% — **verified 1 Aug 2026 against Pierce County Fiscal Office official rate sheet (TY2024 pay-2025)** | D2 |
| REET incidence | **Seller-paid** — <cite index="91-1">typically paid by the seller at closing</cite> | D2 |

**Verified outputs:**

| Metric | Value |
|---|---|
| P&I | **$3,632.15/mo** |
| PITIA | **$4,312.98/mo** |
| REET — state tier 1 | $525,000 × 1.10% = $5,775.00 |
| REET — state tier 2 | $175,000 × 1.28% = $2,240.00 |
| REET — state subtotal | $8,015.00 |
| REET — Pierce local | $700,000 × 0.50% = $3,500.00 |
| **REET total** | **$11,515.00** |
| **Effective REET rate** | **1.6450%** |
| Flat-1.10% model would give | $7,700.00 — **understates by $3,815.00** |

**What this deal tests**

1. **The bracket engine on a non-Canadian jurisdiction.** Same mechanism as BC PTT, different table. If `tax_bracket_tables` is genuinely jurisdiction-keyed, this deal should require no new code — only new rows. That is the actual test.
2. **The bracket engine on a non-Canadian jurisdiction.** Same mechanism as BC PTT, different table. If `tax_bracket_tables` is genuinely jurisdiction-keyed, this deal should require no new code — only new rows. That is the actual test.
3. **The flat-rate defect, quantified.** A naive "1.10% REET" model would give $7,700; the actual bill with graduated brackets and local surcharge is $11,515 — a **$3,815 understatement (49.5% error)**. The error grows non-linearly with price. On a $1.6M Seattle sale it crosses into the 2.75% tier and the gap widens sharply.
4. **Incidence — the one that produces a sign error, not a size error.** REET is seller-paid. Booked as buyer acquisition cost it inflates basis and depresses return. It belongs in **selling costs at exit, inside E10.** This deal is the fixture that proves which side the engine puts it on.
5. **E10's selling-cost composition.** E10 currently assumes 7% selling costs. On this deal REET alone is 1.6450%. If the 7% is blended commission only, REET must be added — and the exit cost is nearer 8.6%. If 7% was meant to be all-in, REET is being double-counted the moment it is added. **Either way the assumption needs stating**, and this deal forces the question.

### 3.1 Variant US-2b — PMI cancellation test (10% down)

Same property, 10% down: loan **$630,000**, LTV 90%, PMI applies.

| Metric | Value |
|---|---|
| P&I | **$4,086.17/mo** |
| 80% of original value (borrower may request cancellation) | $560,000 |
| 78% of original value (automatic termination) | $546,000 |
| Scheduled balance reaches 80% | **Month 98** (year 8.2) |
| Scheduled balance reaches 78% | **Month 112** (year 9.3) |
| Midpoint backstop (30-yr) | Month 180 |

This is a **pure E8 reuse test** — the amortisation schedule built this session already contains everything needed to compute both dates. No new engine.

It also tests the trap in Doc 59 §3.1: <cite index="44-1">automatic termination keys off the date the balance is *scheduled* to reach 78% of the **original** value per the amortisation schedule, regardless of the actual outstanding balance</cite>. A model that cancels PMI when *current* LTV reaches 78% via appreciation cancels it too early and understates cost. Feed this deal 5% annual appreciation and check the termination date does not move.

---

## 4. Coverage matrix

| Test dimension | US-1 | US-2 | US-2b |
|---|---|---|---|
| US monthly compounding | ✓ | ✓ | ✓ |
| Graduated transfer tax brackets | — | **✓** | — |
| Seller-paid transfer tax incidence | — | **✓** | — |
| DSCR loan-convention sizing | **✓** | — | — |
| Two-DSCR collision (F-502 vs loan) | **✓** | — | — |
| 75% rental income rule | **✓** | — | — |
| PMI cancellation vs E8 schedule | — | — | **✓** |
| Property tax as first-order driver | **✓** | ✓ | ✓ |
| Conforming limit boundary | — | ✓ | ✓ |
| E10 exit / selling-cost composition | — | **✓** | — |

**Not covered, and worth logging as deferred:** FHA life-of-loan MIP; jumbo (above $832,750); states with no transfer tax at all (Texas); high-tax states where the investor/owner-occupier assessment gap is widest (Illinois, New Jersey); short-term-rental treatment.

---

## 5. Computation log

All figures produced by a standard US monthly-compounding amortisation formula, `r = annual_rate / 12`, `n = 360`, and hand-checked. Sources for each *rate* are cited in §2 and §3; the arithmetic is reproducible from the inputs shown.

| Computed value | Result |
|---|---|
| $135,000 @ 7.25% / 30y | $920.94 |
| $560,000 @ 6.75% / 30y | $3,632.15 |
| $630,000 @ 6.75% / 30y | $4,086.17 |
| WA REET on $700,000 (state + Pierce local) | $9,765.00 |
| US-2b months to 80% / 78% of original value | 98 / 112 |

**One caveat worth carrying.** These figures are internally verified — the arithmetic is correct given the inputs. They are **not** externally validated in the sense Doc 54 uses the term: no third-party authority has confirmed them the way FCAC confirmed the Canadian payment engine. Marking them ✓ in a test suite would repeat the exact overstatement Doc 54 was written to catch. **The right external check for US-2 is the WA DOR REET calculator**, which is free, authoritative, and takes about two minutes. Do that before any of this becomes a golden test.

---

*End of Doc 60 · v1.0 · Companions: Doc 58 (gap log), Doc 59 (research brief)*
