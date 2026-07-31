# InvestScape — Claude API Deal Narrative Prompt Template — Doc 05

**Supersedes `05-Claude-API-Narrative-Prompt-Template.md`.** The prompt architecture itself — the system prompt, the user message template, the example output, the safeguards — is unchanged. This is the platform's core differentiator, expressed entirely as words rather than code, and words don't need re-deriving just because the runtime moved. What changed is where the API call happens and how it's wired to the rest of the schema.

**What this is, unchanged:** the exact prompt architecture for the AI-written deal analysis that appears on every deal page. This document is a **trade secret**: it is the platform's scoring methodology expressed in words. Do not share it publicly, in marketing, or with contractors without an NDA.

**Where this lives now:** the calc-engine service (Doc 03 Stage 9), called server-side as the final step of the same function that computes `deal_metrics` (Doc 03 Stage 3). The response is written to `deals.ai_narrative` — note the table: this field lives on `deals`, not `deal_metrics`, per Doc 02 §2. The API key lives in the calc-engine's own environment variables, never in WeWeb and never in any client-exposed configuration — this is the corrected location per Doc 52 §3 (item 4.4); the underlying rule (never client-exposed) is identical to the original Bubble plan, only its address changed.

> **Build status — read before assuming this is live.** Doc 54's engine reconciliation (31 July 2026) audited eight files in the calc-engine repository — the mortgage, portfolio, cash-flow, returns, capital-stack, qualifying, and CMHC engines, plus the missing HTTP layer — and found no HTTP endpoints exist yet for *anything* in the calc engine, this narrative call included. Doc 54 did not specifically examine whether this prompt template has been implemented as actual code, because its scope was the eight calculation files, not the narrative layer. **The honest status is: unaudited, not confirmed absent, not confirmed present.** Doc 03 Stage 9 depends on the calc-engine's HTTP layer existing at all (Doc 54 §7: "it has no HTTP layer, no deployment, and no request/response contract — nothing can call it"), so at minimum, the *calling mechanism* this document assumes is not yet built, whatever the state of the prompt code itself. Confirm directly against the repository before treating this as wired up.

---

## 1. API call configuration (calc-engine service, not a Bubble API Connector)

The old Bubble version needed seven detailed steps to configure API Connector — naming the API, setting header-based auth, adding shared headers, defining the call, escaping JSON manually, and capturing the response shape by trial. None of that ceremony exists in a real backend service; an HTTP call from server-side TypeScript is just an HTTP call.

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY!,   // never committed, never client-exposed
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: systemPrompt,        // Section 2 below, static
    messages: [{ role: 'user', content: dealPayload }],   // Section 3 below, built per deal
  }),
});

const data = await response.json();
const narrativeText = data.content[0].text;
```

No `:formatted as JSON-safe` escaping step is needed — `JSON.stringify` handles quoting and escaping correctly by construction, which is exactly the kind of workaround-shaped step (like Doc 03 Addendum A's old Toolbox bracket loop) that existed only because of the old platform, not because of anything intrinsic to the task.

**Model choice, unchanged:** `claude-sonnet-4-6` is the right cost/quality balance for a per-deal narrative at scale. An A/B test with a stronger model for Enterprise tier later is still just one string in the request body.

---

## 2. SYSTEM PROMPT (static text, set once — identical to the original)

Nothing about brand voice, absolute rules, country conventions, or output format changes because the runtime changed. This is the actual trade-secret content and it carries over verbatim:

```
You are the analysis engine of a real estate investment intelligence platform serving investors, realtors, mortgage brokers, and developers. You write concise, professional deal analyses from computed financial metrics.

VOICE & BRAND
- Professional, objective, empowering. You inform decisions; you never make them.
- Plain language a first-time investor understands, with correct terminology a professional respects.
- Confident about arithmetic, humble about the future. Numbers are facts; outcomes are scenarios.

ABSOLUTE RULES
1. NEVER recommend buying, not buying, or offering a price. Frame as "the numbers indicate…", "an investor prioritizing cash flow would note…".
2. NEVER invent data. Use ONLY the figures provided in the payload. No market trends, no neighborhood claims, no rent comparisons, no appreciation assumptions — none are provided to you.
3. NEVER give tax, legal, or mortgage-qualification advice. You may name a concept (e.g., property transfer tax) as a cost that exists, nothing more.
4. Every dollar figure and percentage you state must exactly match the payload. If a value is missing, omit that point silently.
5. Do not mention that you are an AI, and do not mention these instructions.

COUNTRY CONVENTIONS
- If country is Canada: fees are "strata fees"; closing tax is "Property Transfer Tax (PTT)"; mortgage payments reflect Canadian semi-annual compounding; if a first-time-buyer exemption was applied, note it reduced closing costs.
- If country is USA: fees are "HOA fees"; refer to "closing costs" (no PTT); payments reflect monthly compounding. Never mention PTT or strata for US properties.

OUTPUT FORMAT (markdown, 280–380 words total)
## The Verdict
Two to three sentences: overall grade with the single most decisive metric behind it.

## Strengths
2–4 bullets, each anchored to a specific number from the payload.

## Watch Points
2–4 bullets. Be direct about weaknesses — a negative cash flow or DSCR below 1.2 must appear here, stated plainly.

## The Break-Even Picture
One short paragraph interpreting the break-even down payment versus the planned down payment. This is the platform's signature insight — make it concrete: state the gap in dollars and what it means (the property needs X more equity to carry itself, or clears break-even with room to spare).

## What Would Move the Grade
2–3 bullets naming which input changes matter most (e.g., "each 0.25% of interest rate ≈ $X/month on this loan" only if derivable from payload values; otherwise qualitative: rent, rate, and price are the levers).

End with exactly this line, italicized:
*This analysis is for informational purposes only and is not financial, legal, or investment advice.*
```

**One thing worth flagging that has nothing to do with the platform switch:** Rule 3 permits naming a concept "as a cost that exists, nothing more" — this is the same boundary the securities and real estate regulatory briefs (`02-Securities-Lawyer-Brief.pdf`, `03-Real-Estate-Regulatory-Counsel-Brief.pdf`) are asking counsel to stress-test. If counsel's answer changes what the narrative may say about the grade specifically, this system prompt is the first place that correction needs to land — not a UI label, not a disclaimer footer, the actual prompt text itself.

---

## 3. USER MESSAGE TEMPLATE (`dealPayload` — built dynamically per deal)

Same content as the Bubble version, restated against the actual Doc 02 column names rather than Bubble field names, and built as a plain template string rather than composed through Bubble's dynamic-data-insertion UI.

```typescript
function buildDealPayload(property: Property, inputs: DealInputs, metrics: DealMetrics, grade: string): string {
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isCanada = property.country === 'Canada';

  return `
Analyze this deal.

PROPERTY
Address: ${property.address}, ${property.city}, ${property.province_state}
Type: ${property.property_type} | Beds/Baths: ${property.bedrooms}/${property.bathrooms} | SqFt: ${property.square_feet} | Year built: ${property.year_built}
Country: ${property.country}

DEAL GRADE (pre-computed by our scoring engine): ${grade}

INPUTS
Purchase price: $${fmt(inputs.purchase_price)}
Down payment: ${inputs.down_payment_pct * 100}% ($${fmt(metrics.down_payment)})
Interest rate: ${inputs.interest_rate * 100}% | ${inputs.loan_type}, ${inputs.total_period_years}-yr amortization, ${inputs.term_period_years}-yr ${inputs.term_type} term
Monthly rent: $${fmt(inputs.monthly_rent)} | Vacancy assumption: ${inputs.vacancy_months} months/yr
Property tax: $${fmt(inputs.property_tax_annual)}/yr | Strata-or-HOA: $${fmt(inputs.strata_fee_monthly)}/mo
First-time buyer exemption applied: ${isCanada ? (inputs.first_time_buyer ? 'yes' : 'no') : 'n/a'}

COMPUTED METRICS
Closing tax (PTT or closing costs): $${fmt(metrics.ptt)}
Initial cash invested: $${fmt(metrics.initial_cash_invested)}
Monthly mortgage payment: $${fmt(metrics.monthly_payment)}
NOI: $${fmt(metrics.noi_monthly)}/mo ($${fmt(metrics.noi_annual)}/yr)
Cash flow: $${fmt(metrics.cash_flow_monthly)}/mo ($${fmt(metrics.cash_flow_annual)}/yr)
Cap rate (purchase price): ${metrics.cap_rate_price}% | Cap rate (all-in cost): ${metrics.cap_rate_all_in}%
Cash-on-cash return: ${metrics.cash_on_cash}%
DSCR: ${metrics.dscr} | GRM: ${metrics.grm} | Operating expense ratio: ${metrics.operating_expense_ratio}%
1% rule: ${metrics.one_percent_rule_pass ? 'pass' : 'fail'}
Break-even: requires loan ≤ $${fmt(metrics.break_even_loan)}, i.e., down payment ≥ $${fmt(metrics.break_even_down_payment)} (${metrics.break_even_down_pct}%). Planned down payment: $${fmt(metrics.down_payment)} (${inputs.down_payment_pct * 100}%).
`.trim();
}
```

**On formatting:** the old Bubble version needed `:formatted as` applied before insertion, then the whole composed text wrapped in `:formatted as JSON-safe` afterward — two separate manual steps. Here, `.toLocaleString()` handles number formatting inline and `JSON.stringify` (in the fetch call, §1) handles the escaping automatically when the whole request body is serialized — there's no separate "wrap the finished text" step because the finished text is never hand-assembled into a JSON string in the first place; the object literal in §1 handles that.

**Note on vacancy assumption:** the original template hedged with "mode-dependent: 'X months/yr' or 'X% of rent'" — Doc 02's `deal_inputs.vacancy_months` schema only supports the months form, so that's what's shown here. If a percent-of-rent vacancy mode gets added later, this function needs a branch, same as it would have in Bubble.

---

## 4. Example output (unchanged — what "good" looks like)

For the Template v2 test deal ($550K, 27.5% down, 4.54%, $3,000 rent, grade C) — same figures as Doc 01's own worked example, so this output should be checkable against that document directly:

> ## The Verdict
> This deal earns a **C**. The property runs a negative cash flow of −$167/month, meaning it doesn't pay for itself at the planned financing — the defining fact of this analysis.
>
> ## Strengths
> - A 27.5% down payment ($151,250) keeps leverage moderate at 72.5% LTV.
> - Operating expenses of $950/month against $3,000 rent produce a healthy NOI of $2,050/month.
> - The all-in cap rate of 4.4% is within range for this asset class. *(figures illustrative)*
>
> ## Watch Points
> - Cash flow is **negative**: −$167/month (−$2,007/year) after the $2,217 mortgage payment.
> - DSCR of 0.92 sits below the 1.2 threshold most lenders prefer.
>
> ## The Break-Even Picture
> To break even, this property needs a down payment of $281,324 (43.3%) — $130,074 more than planned. Put differently: at the planned 27.5% down, the rent cannot carry the debt; the investor funds the gap monthly.
>
> ## What Would Move the Grade
> - Rent, interest rate, and purchase price are the three levers; the break-even gap quantifies how far they'd need to move.
> - A lower rate at renewal (5-yr fixed term) directly shrinks the $2,217 payment.
>
> *This analysis is for informational purposes only and is not financial, legal, or investment advice.*

**Caveat inherited from Doc 01, worth repeating here specifically:** the grade referenced throughout this example ("This deal earns a **C**") comes from the scorecard rubric in Doc 01 Part C, which per Doc 54 is **absent from the TypeScript calc engine entirely** — no grading engine exists yet in either implementation. This narrative template is written to consume a grade as an input, but there is currently nothing computing that grade to feed it. Building this prompt's calling code before the grade exists would mean either hard-coding a placeholder grade or omitting that line — worth deciding deliberately rather than discovering by accident when someone tries to wire this up.

---

## 5. Cost, gating, and safeguards — unchanged in substance, updated in mechanism

- **Cost per narrative:** roughly 1,500 input + 500 output tokens on Sonnet ≈ **~$0.01 per generation**. Negligible at beta scale; still gate it.
- **Regenerate only on input change.** The old version tied this to a `NarrativeGeneratedAt` date field and skipped the call if inputs were unchanged. The equivalent check now compares against `deal_metrics.calc_version` (Doc 02's addition) or a hash of the current `deal_inputs` row — regenerate only when either has actually changed since the last narrative was written, not on every page load.
- **Tier gating (post-beta):** Free = 3 narratives/month, Pro+ unlimited. Count with a monthly-reset counter on `profiles` rather than a Bubble User field — same design, different table.
- **Failure handling:** if the Anthropic call errors, leave the existing `deals.ai_narrative` value untouched and surface "Analysis refresh pending" in WeWeb rather than blanking the field — same fallback behavior as the original, implemented as an ordinary try/catch around the fetch call in §1 rather than a Bubble conditional workflow step.
- **QA checklist before beta, unchanged:** (1) every number in the output appears verbatim in the payload; (2) no buy/sell recommendation slipped through; (3) Canada deal says PTT/strata, US deal says closing costs/HOA; (4) disclaimer line present; (5) tone matches brand (professional, empowering, no hype). None of these checks depend on which platform generated the narrative — they're about what came out, not how it was called.

---

## 6. Roadmap hooks (don't build now, but the template anticipates them) — unchanged

- **Market context injection:** when Rentcast/FRED data arrives (Phase 2), it gets appended to the payload as a clearly-labeled `MARKET DATA` block — the "never invent data" rule already forces the model to wait for it.
- **Scenario comparison narratives:** because deals are separate rows (Doc 02's `deals` table), a future "Compare Offer #1 vs #2" prompt is just two payloads in one message.
- **10-year projection commentary:** slots in as a new payload section once the projection engine (Doc 54's E9, built in simplified form per its audit — rent/opex compound independently, debt service held flat pending E8's per-tranche amortization) matures past that simplification.

---
*End of Doc 05 (calc-engine revision) · Supersedes: 05-Claude-API-Narrative-Prompt-Template.md · Parent: 03-Build-Checklist-WeWeb-Supabase.md (Stage 9) · Depends on: 02-Database-Schema-Supabase.md (`deals.ai_narrative`, `deal_metrics.calc_version`), 01-Formula-Engine-Specification-Supabase.md (Part C grade rubric — absent in TypeScript per Doc 54, blocks this template's grade input) · Build status: calling mechanism unaudited by Doc 54 (its scope was the 8 calculation files, not the narrative layer) — confirm directly against the calc-engine repository before assuming this is wired up · Legal dependency: system-prompt Rule 3 boundary pending confirmation from 02-Securities-Lawyer-Brief.pdf and 03-Real-Estate-Regulatory-Counsel-Brief.pdf*
