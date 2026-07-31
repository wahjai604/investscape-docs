# Addendum: Bootstrap-Then-Hire Sequencing (Route 1 → 1,000 Paying Customers → Route 2 Team)

*Supplements: "InvestScape MVP Build Path: No-Code, Coded, or Hybrid for a Solo Non-Technical Founder"*

## The clarified goal

Route 1 is meant to be self-funded and lean. The plan is: bootstrap the MVP as cheaply as possible → prove real paying demand (target: 1,000+ customers, or more) → use that revenue to hire a proper team (IT/database, HR, finance) for Route 2, rather than needing outside capital or a large pre-revenue contractor spend.

## How this reframes the original recommendation

The core architecture is unchanged and, if anything, more justified: **build the calculation engine (amortization, XIRR/MIRR/IRR, GDS/TDS stress test, CMHC premium, capital-stack math) once, as a standalone, well-tested API, before anything else.** If a full Route 2 rebuild is already the plan once revenue proves out, the engine is the one component of Route 1 that should NOT be thrown away at that point — everything UI-side will be rebuilt anyway.

What changes is the **spending discipline** during Route 1. The original report's Phase 2 contractor budget ($8k–20k for auth/RLS/billing) assumed a somewhat fuller pre-revenue build-out. Under a strict bootstrap-then-hire plan, that should be pared to the minimum that can't safely be deferred:

### Cannot be deferred (even pre-revenue, even at minimal spend)
- **Security fundamentals**: basic auth, row-level security / multi-tenancy isolation, no client-side-only enforcement of paid-tier gating. A breach involving real customers' financial data is an existential risk regardless of company stage — it doesn't wait for you to have a security budget.
- **Billing correctness**: Stripe/webhook handling, downgrade-to-read-only logic, no double-charging or silent failed-payment states. Billing bugs compound in ways that are expensive and reputationally damaging to unwind later.
- **The engine itself**, for the reason above — it's the only non-disposable Route 1 investment.

**Practical form this should take:** a narrow, fixed-scope contractor engagement — a security/billing review plus the engine build — not an open-ended build-out. This is a materially smaller ask than a full Phase 2.

### Correctly deferred (confirmed, not just assumed)
Full i18n (ship English only), the Community module, Enterprise tier, SOC 2 audit, most external data feeds beyond FRED/Bank of Canada, and any hiring beyond the minimum contractor review above. These were already deferred in the original report; this framing confirms the reasoning holds under a strict bootstrap constraint.

## One number to revisit later, not now

1,000 paying customers is real usage volume, not a rounding error. Once you're closer to that scale, re-check:
- Bubble's Workload-Unit costs at that customer count and calculation volume (per-deal amortization/XIRR runs add up).
- WeWeb + Supabase's usage-based backend costs at the same volume.

Both are usage-metered, so the free/starter-tier assumptions used for MVP-stage cost estimates won't hold at 1,000 active paying users — this is a "revisit when closer" flag, not a reason to change the current plan.

## Net effect on the original recommendation

Unchanged: build the engine first, as a portable API; use WeWeb+Supabase (or Bubble, if truly zero contractor budget) for the front end; validate paid demand before the full build.

Adjusted: keep the pre-revenue contractor spend narrow and fixed-scope (security + billing review, engine build only); treat everything else — including the "hire a team" step — as something 1,000 paying customers funds, not something Route 1 needs to anticipate or build toward itself.
