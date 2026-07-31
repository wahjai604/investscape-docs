# InvestScape — Pre-Port Advisory Review (Doc 12)
### Quality Advisor (Front End + Back End) · COO · CTO — one pass before Claude Design → Figma → Bubble

**Purpose:** catch what's missing *now*, while it's a prompt edit, rather than after it's hardcoded across dozens of Bubble pages. Each item says what it is, why it matters, and the specific cost of doing it late. Severity is my honest read, not a formality — 🔴 = fix before Claude Design, 🟡 = fix during, 🟢 = note it and move on.

---

## PART 1 — FRONT-END / DESIGN QA (goes straight into Claude Design prompting)

Every one of your mockups shows a **happy path with full data**. That's the single biggest structural blind spot, because a real app spends a lot of its life *not* in that state. The four states below don't exist anywhere in six HTML files, and they're brutal to retrofit once every Bubble page is built — each one becomes a per-page conditional you add by hand dozens of times, instead of one component designed once.

### 🔴 1.1 Loading / skeleton states
**What:** What the screen shows while `calc-deal-metrics` runs, while the Claude narrative generates (that's a multi-second API call), while a chart's data aggregates, while FRED data fetches.
**Why now:** Your AI narrative is an async API call — there is *always* a visible gap between "user clicks Re-run" and "text appears." If you don't design that gap, Bubble's default is a blank box or a frozen old value, which reads as broken. Retrofitting means touching every metrics surface and every chart individually.
**Cost of late:** In Bubble this is a "when [thing] is loading" conditional per element — miss it in the design and you're adding it reactively to ~15 surfaces after users report "it looks frozen."

### 🔴 1.2 Error states
**What:** Claude API fails/times out. A calc hits a divide-by-zero (cap rate on a $0 purchase price). FRED is down. An import extraction fails. Network drops mid-save.
**Why now:** Doc 10's whole architecture correctly assumes AI can fail (that's why extraction goes to a draft) — but the *user-facing* failure has no design. "The AI couldn't read this file" and "We couldn't reach the market-data service" are different messages with different recovery actions, and neither exists.
**Cost of late:** Error handling designed after the fact tends to be a generic red toast that says nothing useful. Designed now, it's a reusable component with a message slot and a retry action.

### 🔴 1.3 The scorecard grade badge — design AND liability surface
**What:** The Deal drilldown renders an A/B/C letter grade in a colored badge (`grade-badge`, `.warn`, `.bad`). But per your own notes the grading rubric is *deliberately excluded as a trade secret* — meaning nothing in the schema computes it yet, and there's no disclaimer treatment specific to it.
**Why now — two problems, both cheap now/expensive later:**
1. **Backend gap:** if a grade renders, something computes it. That computation doesn't exist in Doc 01/06. Either it needs specifying, or the badge is showing a hardcoded mockup value that'll ship as fake. Decide before Bubble which.
2. **Liability:** a raw metric ("Cap Rate 4.5%") is a fact. A *letter grade* ("This deal is a B−") is much closer to a recommendation — exactly the "investment advice" line your Angel/VC decks and Doc 10 §0 work hard to stay behind. The grade badge is your single highest advice-liability surface in the whole UI, and it currently has no disclaimer treatment distinct from the generic footer.
**Cost of late:** if the grade ships looking like advice and a user loses money on a "B+" deal, the limitation-of-liability posture you've built everywhere else has a hole exactly where it's most exposed. Far cheaper to design the grade's framing ("a screening signal, not a recommendation") and its own inline disclaimer now.
**Recommendation:** put the specific grade-disclaimer language in front of the E&O broker and the SaaS lawyer among your four consultations — this is the surface they'll care about most.

### 🔴 1.4 Reusable disclaimer component (Doc 09 already flagged; still not built)
**What:** Doc 09 caught that the "informational purposes / not financial advice" footer is absent from every metrics surface. It's in the newest addendum's screens but not as a *design-system component*.
**Why now:** it must appear on Deal, Portfolio, Dev Studio, and every export. If it's a component, it's one build reused everywhere and one edit if legal changes the wording. If it's copy-pasted per page, a wording change means hunting it down across pages and you *will* miss one — and the one you miss is the one in the lawsuit.

### 🟡 1.5 Mobile breakpoints — you work mobile-first, the mockups don't
**What:** Doc 09 found breakpoints only collapse at ~860–960px (tablet), not phone width (~375–428px), and your densest, highest-traffic table (Portfolio holdings) has no horizontal-scroll wrapper while a *less* important table in the same file does.
**Why now:** you personally work on mobile and will demo on mobile. A broken holdings table on a 390px screen is the first thing you'll hit and the first thing a mobile beta user hits.
**Cost of late:** responsive behavior retrofitted in Bubble is fiddly per-element work; designed into the Claude Design prototype, it's specified once.
**Add to prompt:** explicitly request phone-width (375–428px) layouts for Portfolio holdings, Dev Studio Quick Proforma, and the Deal statement table, with horizontal-scroll wrappers on any table wider than the viewport.

### 🟡 1.6 Empty states beyond Portfolio
**What:** Doc 09 + the addendum designed the *Portfolio* empty state. Deal Analyzer (no deals yet), Dev Studio (no projects), Community, Library, Research all still start empty for a real Day-1 user and none are drawn.
**Why now:** same logic as 1.1 — every module's zero-state is a screen a real free user sees before they see anything else.

### 🟡 1.7 Accessibility contrast — re-check after the navy change
**What:** You just changed `bg` from near-black `#0E1117` to deep navy `#0C1B2E`. Every foreground color's contrast ratio against the background just changed. `text-secondary` at 60–70% opacity and gold `#D9B04A` on the new navy may now fail WCAG AA (4.5:1 for body text).
**Why now:** contrast is a token-level decision. Fixed now, it's a one-time check of a handful of pairs. Found later, it's a finding in an accessibility audit that forces color changes rippling through every screen — and if you ever pursue any institutional/enterprise customer, they *will* ask about WCAG.
**Add to prompt:** ask Claude Design to verify all text/background pairs meet WCAG AA against `#0C1B2E` and adjust `text-secondary` opacity or the gold shade if any pair fails.

---

## PART 2 — BACK-END / DATABASE QA (close before Bubble schema build)

### 🔴 2.1 Currency is not modeled — and your own mockup already mixes it
**What:** The Portfolio drilldown shows a Burnaby BC property alongside Austin TX and Raleigh NC properties, with a portfolio header reading "Total Value $3.55M." That total is silently adding CAD and USD as if they're the same unit. There is no `Currency` field on `Property` anywhere in the schema.
**Why now — this is the most expensive-to-fix-late item in the whole review:** currency is a field on the most central data type you have, referenced by nearly every formula and every aggregate. Adding it *after* you have live user data means a migration touching every Property, every DealMetrics rollup, and every chart aggregation — plus deciding retroactively what currency existing rows were in. Adding it now is one field + a display rule.
**Why it's not optional:** your entire positioning is dual-market Canada/US. A "Bloomberg Terminal" that adds CAD and USD into one meaningless number is the opposite of the credibility you're selling. This is arguably a *trust-killing* bug for your exact target user.
**Recommendation:** add `Currency` (option set: CAD, USD) to `Property` and `DevProject` now. Portfolio aggregates either (a) group by currency and never cross-sum, or (b) convert to a user-chosen display currency via a stored FX rate (with an "as of" date and a visible "converted at" note — same honesty principle as everything else). (a) is the honest MVP; (b) is a Phase 2 nicety. Either way the *field* must exist before launch.

### 🔴 2.2 Input validation rules aren't specified
**What:** Nothing stops a user entering a negative purchase price, a 150% down payment, a 12,000% interest rate, or a $0 price that divides-by-zero in the cap-rate formula.
**Why now:** validation rules are part of the schema/field definition. Designed in, they're per-field constraints and a validation-message pattern. Bolted on later, they're scattered across every input workflow, and the gaps are where your formula engine produces garbage numbers (or errors) that undermine the "we're accurate" promise.
**Cost of late:** the first beta user who fat-fingers a number and sees "Cap Rate: Infinity%" or a red Bubble error screen loses trust instantly, and you've now got the differentiator (accuracy) actively working against you.
**Add to prompt (design side):** inline field validation states (error border + message) for the Property intake wizard and Quick Proforma inputs.

### 🔴 2.3 The grade computation (see 1.3) — schema side
Restating for the backend list because it's both: if the grade badge stays, `DealMetrics` needs a `Grade` field and Doc 01 needs the (trade-secret) rubric specified as an internal computation, or the badge is fiction. Don't let a fake grade reach Bubble.

### 🟡 2.4 Cost control / rate limiting on the Claude API
**What:** Doc 03 says "gate regeneration count by Tier later." "Later" is a cost-exposure decision. A free user (or a script) hammering "Re-run Analysis" calls the Claude API every time on your dime.
**Why now:** the *design* needs to accommodate a limit (e.g. "You've used your AI re-runs for today — upgrade for more" state) even if the number is generous. If the UI has no concept of a limit, adding one later feels like a takeaway to users. Bake the *possibility* into the design; tune the number later.
**Cost of late:** an unmetered AI feature is a runaway-cost risk the moment you have any traction or any bad actor, and retrofitting a limit onto a feature users think is unlimited is a PR/UX problem on top of an eng one.

### 🟡 2.5 Support-debuggability
**What:** When a user emails "your cap rate is wrong for my property," how do you see what they entered? `DealInputs` + `DealMetrics` + `LastCalculated` exist (good), but there's no admin view to inspect a user's deal.
**Why now:** cheap to note as a Phase-1.5 admin need; expensive to realize you can't support your first paying customer because you can't see their data without SQL-spelunking the Bubble DB.

### 🟢 2.6 Created/modified audit fields
Bubble gives you `Created Date`/`Modified Date` free on every type — just confirm you're not overriding them and that support can rely on them. Low effort, worth a checkbox.

---

## PART 3 — COO LENS (business viability / operations)

### 🔴 3.1 Analytics instrumentation from day one — not Phase 2
**What:** Hotjar is parked in Phase 2. But basic *event tracking* — which features get used, where users drop off in the wizard, how many reach the "aha" of a completed deal analysis — needs to be in the private beta from the first user.
**Why now:** the entire point of your beta (per the Angel deck: "prove retention, monthly usage on live portfolios — the real signal") is *learning*. A beta with no instrumentation gives you vibes, not data. You'll be making the Route-2 build decision on anecdote.
**Why it's a design consideration:** some events need UI hooks (e.g. distinguishing "viewed sample deal" from "created real deal"). Cheap to plan now, annoying to retrofit.
**Recommendation:** even a lightweight tool (PostHog has a free tier and does product analytics + session replay, covering both the event-tracking gap and Hotjar's role) wired in before beta. This is your single highest-leverage COO decision on this list.

### 🔴 3.2 The activation "aha moment" isn't defined as a metric
**What:** "Try a Sample Deal" exists as a button. But what's the *one action* that means a user "got it"? Completing a real deal analysis? Seeing their first grade? Adding a property?
**Why now:** you can't design an onboarding flow to drive toward an activation moment you haven't named, and you can't measure conversion against it (see 3.1). This defines what the empty states (1.6) should push toward.
**Recommendation:** name it explicitly — my suggestion, given the product: **"user runs one full Deal Analysis and sees the grade + AI narrative."** That's your product in one moment. Design every empty state and the sample-deal flow to funnel there.

### 🟡 3.3 The four legal/insurance consultations — still unscheduled, now with more surface
**What:** SaaS lawyer, securities lawyer, real estate regulatory counsel, E&O broker. Still not booked. This review just *added* to what they need to look at: the grade badge (1.3), the hard-delete/PIPEDA erasure question (Doc 11), the Drive/Dropbox data-flow (Doc 10), and the Partner Split Calculator's securities framing (F-709).
**Why now:** E&O insurance is your own stated non-negotiable pre-launch gate, and these have lead times measured in weeks. This is the item most likely to actually delay launch, and it's the one nobody's started. As COO, I'd book the E&O broker and the SaaS lawyer *this month* — the others can follow.
**Cost of late:** you finish the build, then wait 3–6 weeks for insurance you could have started in parallel.

### 🟡 3.4 Pricing sanity-check against the competitive set
**What:** Pro at $29/mo sits right at DealCheck's range; Enterprise at $199/mo undercuts ARGUS/PropertyMetrics massively (which is the point). That's defensible, but the $29→$199 gap is a 6.9× jump with nothing between, and your Team tier ($79) is parked.
**Why note it now:** the Choose-Plan screen is being designed right now. A developer who isn't ready for $199 but has outgrown $29 has nowhere to go and may churn rather than jump 7×. Not saying add a tier — saying decide *consciously* whether that gap is a feature (forces commitment) or a leak (loses the middle), because the plan screen is about to harden.

---

## PART 4 — CTO LENS (architecture / technical)

### 🔴 4.1 Route 1 → Route 2 migration depends on field-naming discipline *now*
**What:** Your Executive Summary explicitly plans a future port from Bubble (Route 1) to a custom stack (Route 2, Postgres/React). The doc's own warning: a consistent schema is what lets you avoid "trashing business logic" in that move.
**Why now:** your Bubble field names *are* your future migration contract. If Bubble uses `PurchasePrice` and your eventual Postgres schema expects `purchase_price`, that's a mechanical mapping — fine. But if naming is *inconsistent* within Bubble (some camelCase, some spaces, some abbreviations), the migration becomes archaeology. Doc 03A's naming conventions exist — the CTO action is to *enforce* them ruthlessly as the schema addenda get built in Bubble, treating every field name as if you'll grep for it in a migration script someday.
**Cost of late:** inconsistent naming discovered at migration time turns a scripted port into a manual, error-prone remap of every field — exactly the "trashing business logic" the Executive Summary warns against.

### 🟡 4.2 Bubble capacity on the Dev Studio iterative calcs
**What:** The Quick Proforma resolves construction-loan circularity with an iterative loop (the `for(var k=0;k<6;k++)` in the mockup). In Bubble backend workflows, iterative recalculation across many BudgetLines, DrawMonths, and a 6-pass convergence loop is real compute against your "four capacity commandments."
**Why now:** this is the heaviest computation in your whole platform, and it's Enterprise-tier (your paying customers). If it's slow or hits capacity limits under real project sizes, it's slow for exactly the users paying $199.
**Recommendation:** when you build the Dev Studio calc engine, benchmark it against the largest realistic project (the 796 Main St. scale — 100+ units, dozens of budget lines) early, not after launch. Consider whether the convergence loop belongs in a single JS action (Toolbox) rather than chained Bubble workflow steps — one JS call is far cheaper than six workflow passes.

### 🟡 4.3 Backup / disaster-recovery posture
**What:** You made two decisions that change your backup exposure: hard delete now genuinely erases (Doc 11), and you avoided native file storage (Doc 10, files live in users' own Drive/Dropbox). Good decisions — but they mean your Bubble DB is your single source of truth for everything *except* files, with no undo on delete.
**Why now:** Bubble has its own backup features (on paid plans) — the CTO action is to confirm which plan tier gives you point-in-time restore, and turn it on before real user data exists. Cheap now, impossible to retroactively recover data you didn't back up.

### 🟢 4.4 API key security — already correct
Doc 05 keeps the Claude API key server-side in Bubble's API Connector, never client-exposed. Noting it here only to confirm it's right and shouldn't change.

---

## PART 5 — COMPETITIVE REALITY CHECK (COO + CTO together)

Your own competitive analysis draws the honest line: *"If the MVP is another rental property calculator, viability is relatively low. If it provides AI-generated underwriting, scoring, scenario analysis, visual dashboards, and portfolio impact — viability is significantly stronger."*

**Where you genuinely win right now:**
- **The dual-market (CA/US) formula engine, validated to the cent** against government calculators and real workbooks. DealCheck and Stessa don't do rigorous Canadian semi-annual compounding or BC PTT brackets. This is a real, defensible moat for the Canadian investor specifically — and it's *built and validated*, not aspirational.
- **Development Studio.** Nothing in your "easy but shallow" competitor set (DealCheck, Stessa, Mashvisor) touches construction proforma / LP-GP waterfalls / sources & uses. That's ARGUS territory, and ARGUS is "expensive and intimidating." A consumer-grade Dev Studio is a genuinely open lane.
- **Founder-market fit.** Realtor + manager + developer in one person is real and uncopyable quickly.

**Where the strategy is thinner than the decks imply — my honest CTO/COO read:**
- **"AI-assisted underwriting" is your headline differentiator, but your AI only *interprets* — it never computes or advises.** That boundary is 100% correct for liability (and I'd never tell you to weaken it). But be clear-eyed: it means your AI moat is *narrative quality and trust*, not proprietary intelligence. DealCheck can bolt a GPT wrapper onto their numbers next quarter and claim "AI insights" too. The competitive analysis lists exactly this threat ("AI added by incumbents").
- **The defensibility that actually lasts is the combination, not any single piece:** validated dual-market engine + Dev Studio depth + portfolio intelligence + the trust posture, all under consumer-grade UX. No single competitor has all four. But each individual piece is copyable. Your moat is *integration speed and founder credibility*, not any one feature — which means **time-to-trust with real Canadian investors is the whole game.** Every week the four legal consultations (3.3) sit unbooked is a week of that lead not being banked.

**The one strategic question this review can't answer for you:** is the wedge the *Canadian dual-market rigor* (go deep on the market incumbents underserve) or the *Dev Studio* (go where no consumer tool competes)? Both are real; doing both at launch is a lot of surface for a solo, no-code, pre-revenue build. If I had to advise as COO: **lead with the Canadian rigor to win trust cheaply, and hold Dev Studio as the Enterprise upsell that proves you're not just another calculator** — which is, encouragingly, close to what your tier structure already does. The build sequence should mirror that: nail Portfolio + Deal Analyzer for the Canadian investor first, let Dev Studio be the thing that makes them believe the ceiling is high.

---

## PRIORITIZED PUNCH LIST (what to actually do, in order)

**Before you prompt Claude Design (add to the prompt):**
1. Loading/skeleton states (1.1)
2. Error states (1.2)
3. Grade badge as a screening-signal-not-advice treatment + its own disclaimer (1.3)
4. Disclaimer as a reusable component (1.4)
5. Phone-width layouts + table scroll wrappers (1.5)
6. WCAG contrast re-check against the new navy (1.7)

**Before you build the Bubble schema:**
7. Add `Currency` to Property/DevProject (2.1) — highest-leverage backend fix
8. Specify input validation rules + design their error states (2.2)
9. Resolve the grade computation or remove the badge (2.3 / 1.3)

**This month, in parallel with everything (COO):**
10. Book the E&O broker + SaaS lawyer (3.3)
11. Wire product analytics before the first beta user (3.1) + name your activation moment (3.2)

**Note and carry (don't block on):**
12. Route-2 naming discipline as you build (4.1); Dev Studio capacity benchmark (4.2); Bubble backup tier (4.3); AI-rerun rate limit concept in the UI (2.4); the $29→$199 gap decision (3.4)

---
*End of Doc 12 · Advisory review · References: Docs 01–11 + addenda, all six HTML mockups, Competitive Analysis, Executive Summary, Angel/VC/Hire pitch decks*
