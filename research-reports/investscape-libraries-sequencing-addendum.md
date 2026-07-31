# Addendum: Open-Source Financial Libraries, Claude Design vs. API Sequencing, and Long-Beta Confirmation

*Supplements: "InvestScape: A Decision-Grade Strategy Report for a Solo, Bootstrapped Founder" and the demand-sizing addendum.*

## 1. Existing open-source financial math libraries — what to reuse, what to build

**The core question:** given how much code already exists on GitHub/npm, why reinvent IRR/XIRR/amortization from scratch?

**Answer: reuse the commodity math, build the differentiated math.** The landscape as researched:

- **`@formulajs/formulajs`** — MIT-licensed, actively maintained (published within the last month, 89 dependent projects as of research), implements most Excel-compatible functions including PMT, NPV, IRR, and MIRR. This is the strongest available foundation for the generic root-finding math — genuinely current, not abandoned. **Recommended starting point.**
- **`financejs`** — the most commonly cited JS finance library (IRR, XIRR, NPV, amortization), but last published ~9 years ago. A derivative package explicitly named "accurate-financejs" states in its own README: *"Note: XIRR doesn't work yet."* Treat as a correctness red flag, not just a staleness one.
- **`xirr`** and **`node-irr`** — small, single-purpose XIRR solvers via Newton-Raphson, 3–6 years stale. The `xirr` package's own docs warn that non-convergent cases require manually tuning the initial guess — i.e., no automatic bisection/Brent fallback, which is exactly the robustness gap flagged in the earlier "MIRR/XIRR correct implementation" research.
- **HyperFormula** — a full headless spreadsheet engine (actively maintained, TypeScript, GPL/commercial dual license). Overkill as a dependency just for financial functions, but worth knowing it exists as a general formula-engine option.

**What does NOT exist anywhere, open or paid:** Canadian semi-annual mortgage compounding conversion, GDS/TDS stress-test qualification logic, CMHC premium-band calculation, multi-tranche capital-stack modeling, and portfolio-level rollup analytics (concentration risk, attribution, blended benchmark spread, stress-tested DSCR floor). These are regulatory- and domain-specific enough that no one has packaged them as a library. **This is also, not coincidentally, InvestScape's actual differentiated value.**

**Practical recommendation:** use `@formulajs/formulajs` (or extract just the relevant functions) as the tested foundation for generic financial math (NPV, IRR, MIRR, PMT), rather than implementing Newton-Raphson from scratch. This meaningfully shrinks the "learn numerical methods from zero" burden identified in the main strategy report. But regardless of which library underlies it, **write golden tests against Excel and authoritative Canadian mortgage calculators for every function you use** — no existing library has been tested against Canadian semi-annual compounding edge cases, so "maintained" does not mean "validated for your use case." The custom Canadian/US dual-jurisdiction wrapper, the CMHC/GDS-TDS logic, and the capital-stack/portfolio engines remain fully custom builds — nobody has done this part, so budget the learning and build time accordingly.

## 2. Claude Design (vibe-coded UI) vs. the tested API — build in parallel, not in sequence

**The question:** finish vibe-coding all remaining engines in Claude Design first as a full showcase/blueprint, then convert to the tested API — or switch to the API now?

**Recommendation: run both tracks in parallel, and keep their roles strictly separate.**

- **Keep building in Claude Design** for UI/UX — screens, fields, layout, workflow. This is genuinely valuable as a blueprint to model the API's input/output shape from, and it's cheap and fast. No reason to stop.
- **Start the tested API now, on at least the mortgage/amortization engine, rather than waiting until every engine is vibe-coded first.** The risk in "finish all the vibe-coded math, then convert" is that the longer untested JavaScript sits there looking correct, the more it invites the illusion-of-competence trap already flagged in the AI-coding-evidence research: you (and anyone shown the demo) start trusting numbers that were never verified against a golden test. Waiting to start the real build maximizes the window during which unverified math is in front of real users and real investor conversations — which now include people who have already expressed investment interest.

**The working rule going forward:** every vibe-coded engine in Claude Design is a UI mockup with illustrative math only, exactly as required by the demo-labelling guidance in the earlier addendum, until it is replaced by verified logic from the tested API. "More than half way there" on the UI is real, bankable progress; it is not progress on the part that has to be provably correct. Do not treat Claude Design's embedded calculation logic as a source to port — treat it only as a spec for what fields, outputs, and interactions the API needs to support.

## 3. WeWeb + Supabase, confirmed, with a long-beta adjustment

The WeWeb + Supabase path (established in the main strategy report) remains correct for a bootstrapped, roughly year-long beta with pre-paying customers willing to wait. Two adjustments specific to a longer beta window:

- **BC consumer-protection refund exposure scales with the wait, not against it.** A future-performance contract lets a customer cancel and demand a full refund within 15 days if delivery doesn't match what was represented. Over a full year, set explicit milestone dates, communicate proactively, and continue treating pre-sale revenue as a refundable liability throughout the beta — not just at the point of sale.
- **This is a natural, well-scoped trial project for the meetup developer, if that partnership proceeds.** "Design and deploy the Supabase schema and row-level security for the beta" is exactly the kind of defined, milestone-testable deliverable recommended in the co-founder-vetting section of the main report — it plays to an actual database professional's core strength without requiring any equity decision up front.

## Net effect on prior recommendations

Nothing here overturns the core architecture (portable, well-tested calculation API + thin front-end client on WeWeb+Supabase). It sharpens two things: (1) the calculation engine's generic math doesn't need to be built from zero — a maintained library (`@formulajs/formulajs`) can carry the commodity IRR/NPV/PMT math, while the Canadian/US compounding, CMHC, GDS/TDS, capital-stack, and portfolio logic remain genuinely custom and are the real product; and (2) the tested API build should start now, in parallel with continued Claude Design work, rather than waiting for the vibe-coded showcase to be "finished" first.
