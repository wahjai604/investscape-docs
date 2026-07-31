# InvestScape: Port-Path, Bubble Platform, XIRR/MIRR, and Multi-Tranche Charting Research Report

**Prepared:** July 29, 2026. Note on currency: Bubble ships an *official, free* Figma-to-Bubble converter (documented at manual.bubble.io), and the wider ecosystem changed materially in 2025–2026 (Figma's Config 2025 launches; Anima's pivot to AI code-gen). Where I could only find older or vendor-marketed sources, I flag it inline.

## TL;DR
- **Port path (Strand 1): Do NOT route HTML → Figma → converter → Bubble. Rebuild by hand in Bubble, using the Claude Design HTML purely as a visual/spec reference.** Every automated path compounds loss, and Bubble's responsive engine (CSS flexbox: Row/Column/Align-to-Parent/Fixed containers) requires a container hierarchy that absolutely-positioned or CSS-grid-heavy HTML does not carry. Bubble's own free Figma converter needs Figma Auto Layout to produce responsive output, so you'd first have to convert HTML→Figma (lossy) and re-apply Auto Layout anyway — negating the automation.
- **Bubble can host the app but not the financial math natively (Strands 2 & 3): the expression composer has no IRR/XIRR/MIRR or any root-finder.** Implement XIRR/MIRR in JavaScript (Toolbox "Run JavaScript" client-side, or a server-side action / external serverless function), Newton-Raphson with bisection fallback, actual/365 day-count to match Excel. Never show a fabricated/placeholder return; use an explicit "Insufficient data to compute" state plus a "for informational purposes only, not investment advice" disclaimer.
- **The staggered multi-tranche amortization chart (Strand 4) is fully achievable in the ApexCharts Bubble plugin** by giving each tranche series its own `{x, y}` points on a numeric x-axis (month number) — each series holds only its live points, so the line naturally starts/ends mid-chart and never snaps to origin. Avoid null-padding (multiple documented ApexCharts null-handling bugs) and avoid `connectNulls`.

---

## STRAND 1 — THE PORT PATH

### Can Bubble import HTML/CSS/JS as native editable elements?
No. Bubble has no facility to ingest raw HTML/CSS/JS and turn it into native, editable Bubble elements (groups, text, inputs, etc.). The options are:

1. **The HTML element** — a native element into which you paste HTML/CSS/JS. Bubble renders it, but it remains an opaque block, not editable Bubble elements. You *can* inject Bubble dynamic data into it (insert dynamic expressions into the element's code), and it is commonly used to embed third-party widgets. Key limits reported by the community:
   - **CSS bleed in both directions**: page CSS can affect the embedded HTML and vice-versa, unless you isolate it in an iframe. (Bubble forum: "iFrame height, CSS Conflicts – Showing custom HTML in Bubble.")
   - **Iframe isolation costs**: an iframe fixes CSS bleed but introduces height/scroll sizing problems and the usual sandboxing constraints; many external sites disable framing (e.g., google.com won't render). Sandbox attributes (allow-downloads, allow-popups, allow-same-origin) must be managed manually.
   - **Design-tab invisibility**: iframe/HTML content often does not render in the Bubble editor's Design tab, only at run-time/preview, which slows iterative design.
   - **Responsiveness**: HTML-element content does not participate in Bubble's responsive engine; you own its responsive behavior entirely in your own CSS.
   - **Passing data in/out**: possible but manual — inject dynamic Bubble values into the code, and use the Toolbox "JavaScript to Bubble" element to send values from the embedded JS back into Bubble workflows.
2. **Custom code in the page header / "Page HTML Header"** — for `<script>`/`<style>` includes and libraries. Global, not element-level.
3. **Plugins** — e.g., the Toolbox plugin's "Run JavaScript" action and "JavaScript to Bubble" element for two-way data flow; dedicated iframe plugins (DigitalEye "Advanced <iframe>") for sandbox control.
4. **Bubble's AI/import features (2026)**: Bubble's only first-party design-import path is the **Figma converter** (below). There is no "paste HTML, get native Bubble elements" feature as of mid-2026.

**Implication for InvestScape:** the HTML element is fine for a *self-contained embedded widget* (e.g., dropping the ApexCharts amortization chart in as a custom HTML/JS block if you want maximum control), but it is the wrong vehicle for the whole app UI. The app chrome, wizard, tables, and navigation should be native Bubble elements.

### What Bubble's responsive engine structurally requires
Bubble's current ("new") responsive engine is built on **CSS Flexbox**, with four container layout types: **Row, Column, Align-to-Parent, and Fixed** (official docs: Responsive Properties; Containers). Structure and rules:
- **Everything is nested containers.** Elements live inside Row/Column containers that dictate flow. There is no free-floating absolute positioning in responsive containers except via the **Align-to-Parent** container (which lets you "pin" children to positions) and **Fixed** containers.
- **Sizing is min/max width & height plus "Fit width/height to content" and stretch.** Per the official Responsive Properties doc: Min width = "smallest width the element should be allowed to get"; Max width blank = "infinite… as wide as the parent container"; "Child elements will always try to grow to their max width, unless restricted." In a **Row**, vertical sizing is controlled by a "Vertical stretch" alignment toggle rather than "Fit height," which is a well-known source of confusion.
- **Gap spacing** (row-gap/column-gap) is set on the container, mirroring flexbox `gap`.
- **Collapse when hidden** removes an invisible element from layout flow (flexbox), freeing space.
- **Breakpoints**: presets at roughly mobile portrait (~320px), mobile landscape (~480px), tablet (~768px), laptop (~1024px); layout/visibility/order can be overridden per breakpoint. Layout/visibility changes are client-side and consume **zero workload units**.

**What ports cleanly vs. badly:**
- **Ports cleanly:** HTML that is already a clean, nested flexbox layout with rows and columns, driven by min/max sizing and gaps — this maps almost 1:1 to Bubble Row/Column containers. This is exactly what Figma **Auto Layout** produces, and (not coincidentally) what Bubble's converter needs.
- **Ports badly:** **absolutely-positioned** layouts and **CSS Grid** layouts. Bubble has no true CSS-Grid container; grid layouts must be rebuilt as nested Rows/Columns (or approximated with a Repeating Group for uniform grids). Absolute positioning must be re-expressed via Align-to-Parent or restructured into flow. Heavy use of `position:absolute`, `z-index` stacking, `transform`, or grid-template areas will not survive any automated conversion and must be re-thought structurally.

### Figma-to-Bubble converters — what they actually produce
- **Bubble's own free Figma converter** (official: manual.bubble.io "Importing from Figma"; landing bubble.io/figma-to-bubble). Workflow: Figma plugin ("Figma to Bubble.io Converter," a.k.a. Deezign) → Chrome extension → paste into the Bubble editor. Bubble markets it as producing "responsive, pixel-accurate Bubble elements." Documented constraints, verbatim:
  - **"Bubble supports Figma files with up to 1,000 elements."**
  - **"For best results, use Auto Layout."** "The converter works best with Figma elements that use Auto Layout… Fixed layout designs will still convert, but the plugin will translate them based on the available Figma properties." (I.e., non-Auto-Layout ⇒ fixed/less-responsive output.)
  - **"Figma doesn't have element definitions for buttons, inputs, multiline inputs, and dropdowns"** — these come in as generic shapes/text and must be re-created as functional Bubble input elements via the plugin's Buttons/input tab.
  - This is the honest crux: the converter's *responsiveness* is only as good as the Auto Layout in the source Figma. It does **not** manufacture a good container hierarchy from a fixed layout.
- **Anima**: Anima is now primarily a **Figma/design → code (HTML/React/Vue)** and AI-vibe-code tool. Anima's own site describes it as "Trusted by 1.8 Million humans and leading AI agents" and positions itself as "Figma's #1 partner in codegen" (Config 2025 sponsor materials cite "over 1.4 million Figma users"; a company blog cites "1.7 million installs"). It is **not** a Figma-to-Bubble-native-elements tool. Independent reviews (Capterra, Product Hunt 2026) praise time savings but repeatedly flag: steep free→paid pricing gap, and **code output needing cleanup for complex grid layouts** and "layout misinterpretations." So Anima is irrelevant to a Bubble-native target except as an HTML generator.
- **"Buddy"**: "Buddy" **is** a live 2026 product — but it is **Anima's Figma AI *design agent*, not a Figma-to-Bubble converter**. Per Anima's blog: "Anima Agent is a new Figma plugin… We call it Buddy because it is built to work like a real design partner." There is **no** Figma-to-Bubble-native-elements tool marketed as "Buddy." The actively promoted third-party Figma→Bubble converters are **Framify.io** (auto-layout-based) and **Deezign** (which *is* Bubble's official converter engine). Builder.io's **Visual Copilot** and **Convertify** target code/other design tools, not Bubble-native elements. **Do not build a plan around a "Buddy" Bubble converter — it does not exist.**
- **General fidelity reality (stated plainly):** all vendor "pixel-perfect / production-ready, no rebuilding" claims are marketing. The consistent independent/community signal is: auto-layout designs convert *reasonably*; anything else degrades; interactive elements (buttons/inputs/dropdowns) always need manual re-creation; complex/grid/absolute layouts need restructuring. Fidelity claims from converter vendors should be treated as unverified.

### Is there a viable HTML → Figma direction, and how lossy?
Yes — **html.to.design** (by ‹div›RIOTS) is the most established; it has a dedicated **"Import HTML/CSS code" tab** that turns pasted HTML/CSS (including AI-generated code from tools like Claude) into "fully editable Figma layers." Competing plugins exist (JESSE, HTMLtoFigma, Web to Figma, html.tomake.design). **Lossiness:** these produce Figma *frames/layers* that visually match, but they do **not** reliably reconstruct **Figma Auto Layout** — they tend to import structure closer to fixed/absolute frames. That is the fatal problem for the Bubble chain: Bubble's converter needs Auto Layout to yield responsive output, but the HTML→Figma step generally does not give you clean Auto Layout, so you'd manually re-apply Auto Layout across the whole design before the Figma→Bubble step.

### Compounded loss: HTML → Figma → converter → Bubble vs. HTML → manual Bubble rebuild
The automated chain has **three lossy hops**, each stripping or mangling structure:
1. **HTML → Figma** (html.to.design): visual match, but loses/does-not-create Auto Layout; grid/absolute structure imported as fixed frames.
2. **Manual Auto-Layout repair in Figma**: you must re-impose Auto Layout everywhere to make the next step responsive — this is essentially a full re-layout, done in a tool that isn't your production target.
3. **Figma → Bubble** (Bubble converter): ≤1,000 elements; buttons/inputs/dropdowns not recognized and re-created by hand; fixed-layout fallbacks where Auto Layout is imperfect.

By the time you finish, you have manually rebuilt the layout logic twice (once in Figma as Auto Layout, once fixing the Bubble output) — **more** total work than a single clean rebuild, and you carry a Figma file you don't otherwise need as a maintenance burden.

**Recommendation (opinionated):** **Rebuild directly in Bubble, hand-built with the Claude Design HTML as the visual specification.** Reasons: (a) the source of truth is HTML, not native Figma, so you never get the "free" Auto Layout the Bubble converter rewards; (b) InvestScape's value is in data/logic/charts, and its UI is structured (wizard, tables, dashboard) — exactly the layouts you want as clean native Row/Column containers for responsiveness and low WU; (c) a hand rebuild forces you to make correct container/min-max decisions once, in the tool you ship in.

**Under what conditions would the Figma path be worth it?** Only if **all** of these hold: your design already lives as native Figma with disciplined Auto Layout (it doesn't — it's HTML from Claude); the design is largely static/marketing-style (not interactive forms); it's under ~1,000 elements; and you have no in-house Bubble layout skill. None of these apply to InvestScape, so the Figma path is not worth it.

### Historical context: why "Figma → Bubble" became the standard path
Before Bubble shipped its own converter, Figma was the de-facto design tool for no-code teams, and third-party converters (and design-handoff via Figma Dev Mode) were the only bridge — so "design in Figma, hand off to Bubble" became the received wisdom. **What changed:** (1) Bubble released its **official free Figma converter** (Auto-Layout-based), formalizing the Figma path as first-party; and (2) AI design tools (Claude Design, Figma Make/Sites, v0, Bolt) now emit **HTML** directly, inverting the pipeline — the source of truth is increasingly code, not Figma files. Some 2026 secondary sources even (incorrectly) claim "there is no official Figma-to-Bubble plugin," which is now out of date — Bubble's converter exists. The old rationale (Figma as sole design source) no longer holds when your design originates as HTML.

---

## STRAND 2 — WHAT BUBBLE NEEDS ON THE DATA & LOGIC SIDE

### Database: data types, fields, option sets, lists, privacy
- **Data types & fields** (official: "Data types and fields"): you define custom data types (tables) with fields; field types include text, number, yes/no, date, geographic address, file/image, and **references to other data types** (relationships), plus **lists** (multi-value) of any of these.
- **Option sets vs. data types** (official: "Option sets"). Use **option sets** for *static, non-sensitive* enumerations (statuses, categories, tranche-type labels like "1st Mortgage / VTB / Bridge / Mezzanine") — they're loaded as JSON into the client at page load, filtered/sorted **client-side** with no database lookups, so they're fast and cost no WU after load. Critical caveats, verbatim: option sets are **"stored as plain text… easily accessible"** and **"Privacy rules do not affect Option Sets"** — never store confidential data in them; and "very large option sets can slow down your app's load time, since the entire set is included in the source code." Use **data types** for anything user-generated, numerous, dynamic, or sensitive (deals, cash-flow events, users) — these live server-side and are governed by privacy rules.
- **Lists vs. joined (satellite) data types — performance.** This is a key schema decision for InvestScape's cash-flow arrays. Official/enterprise guidance is consistent: **avoid large list fields.** When a Thing loads, **the entire contents of a list field are downloaded to the browser** regardless of privacy rules, and **"lists should only be used to store non-private information."** Airdev's best-practices wiki: "Fields of type 'list' that could have more than 100 items (bad performance). Instead, create a data type that links to the original data type." Bubble lists are also hard-capped at **10,000 items** (official Operators doc: "lists are limited to 10,000 items"). **Therefore:** model each dated cash-flow event / amortization row as its own record in a **satellite "CashFlowEvent" data type** linked to the Deal — not as parallel list fields on the Deal. This gives you privacy-rule control, avoids the download-everything penalty, and lets you query with constraints.
- **Privacy rules** (official: "Protecting data with privacy rules"): server-side row- and field-level access control, applied as an extra constraint before other search conditions, so forbidden data never leaves the server. They apply to **searches** ("Find this in searches"), not to items fetched via a list field — reinforcing the satellite-data-type recommendation for any sensitive figures.

### CSV / bulk import (official: "Importing data (CSV)" and "Data tab")
- **Format**: UTF-8 CSV; first row must be a header row whose names match your Bubble fields. Delimiters can be comma, tab, or pipe (useful when text contains commas).
- **The data type and its fields must be defined in the app before importing**; you map columns → fields during import. Identically-named fields auto-map.
- **Dates**: dates must be in a Bubble-recognized format; **date ranges** use the special bracketed comma-separated form (e.g., `[date1, date2]`, first date before second); durations/intervals can be expressed in **milliseconds** (86,400,000 = 24h). For programmatic date generation, the community pattern converts to Unix-epoch milliseconds (`(date − 1970-01-01) × 86,400,000`).
- **Lists on import**: optionally wrap in `[ ]` and separate items by the delimiter (note Bubble's own quirk: it *exports* lists as `x , y , z` but *imports* them as `[x , y , z]`).
- **Row limits / cost**: import runs as a queued background/scheduled process; large files can sit at 0% while queued. There is a documented practical ceiling — **end-user file uploads on the Starter plan are limited (community reports ~100 rows)**, and very large imports frequently fail/stall (forum reports of validation stopping at fixed low counts). It's a Beta feature ("some limitations may exist"). For seeding market/deal data, chunk large files or use a third-party pipe (EasyCSV, Flatfile, CSVBox) via the Data API. File-size cap when attaching in App Data is 50 MB (5 GB via the file uploader element).

### Date/time handling (official: "Time, dates and time zones"; "Operators and comparisons")
- **Storage**: Bubble stores date fields as absolute timestamps; **by default it displays/adjusts them in the *user's browser* time zone.** This is the single biggest XIRR trap: the *same* stored instant renders as a different calendar date for users in different zones, and day-count in XIRR is date-sensitive.
- **Timezone override**: Settings → General exposes **timezone override controls** (app-level and page-level) to force a fixed zone — essential for a financial engine so that "closing date" means the same day for everyone. You can also pass `timezone_string` in API requests. **Recommendation: enable timezone override and compute XIRR in a fixed zone (or in pure date-only terms).**
- **Date range field type** and the **":formatted as"** operator (once formatted, a date becomes text and can't be further manipulated as a date). Available date tooling includes date-range generation, "rounded down to month/day," and range-contains checks.
- **Operators**: the expression composer has add/subtract intervals, rounding, range operations, and comparisons — but **no financial/root-finding functions**.

### Bubble's calculation limits — and how to implement XIRR/MIRR
- **Natively available math**: `+ − × ÷`, rounding, min/max, basic aggregations (sum/average/count via groupings), and simple exponentiation/text math via the expression composer. **Not available natively:** iterative solvers, root-finding, `IRR`/`XIRR`/`MIRR`, or any loop/recursion within a single expression. There is no native way to run a Newton-Raphson iteration in the composer.
- **Three implementation routes:**
  1. **Toolbox "Run JavaScript" (client-side) + "JavaScript to Bubble" element.** Write the XIRR/MIRR solver in JS, run it in the browser, return the result via the JS-to-Bubble element. **Pros:** free plugin, **zero server WU for the computation itself** (it runs on the client), instant, easy to debug in the browser console. **Cons:** runs client-side (result must be sent back/stored deliberately; sequencing needs the JavaScriptToBubble event to avoid race conditions); logic is visible to the client.
  2. **Server-side action via the Bubble Plugin Editor** (or Toolbox "Server Script"). Runs the solver server-side. **Pros:** logic hidden, result available directly in backend workflows, good for batch/scheduled recompute. **Cons:** **consumes WU** (server processing), harder to debug (Server Logs), plugin-editor overhead.
  3. **External serverless function (AWS Lambda / Cloudflare Workers / etc.) via the API Connector.** **Pros:** full control, testable/versioned outside Bubble, offloads compute cost from Bubble's WU meter to your own (often cheaper) infra, hidden logic. **Cons:** network latency, an extra service to run/secure, API-call WU on each call (the call itself, not the math, is metered).
  - **Verdict for InvestScape:** implement the XIRR/MIRR engine **once in JavaScript** and run it **client-side via Toolbox** for the interactive wizard (free, instant, no WU), with the *option* to also expose it as a server-side/serverless endpoint for batch recompute or if you need the logic hidden. Client-side is the pragmatic default because the wizard is inherently interactive and per-deal.

### Workload Units (WU) — 2026 model and cost implications
- **Model** (Bubble official pricing; corroborated by multiple 2026 secondary guides): WUs meter *server-side* work — every DB query, workflow step, API call, and server process. **Client-side interactions (layout, visibility, most UI math, and client-side JS via Toolbox) consume zero WU.** Bubble's official Pricing & Workload FAQ states: **"If you do not have a workload tier subscription, then the overage rate is $0.30 per 1,000 workload units."** Web plans (annual-billing rates, per Goodspeed's 2026 breakdown): **"Web plans range from free to $349/month (Starter: $29, Growth: $119, Team: $349)… Paid plans include Workload Units from 175,000 WUs (Starter) to 500,000 WUs (Team)."** Directional consumption from 2026 guides: simple page load/basic fetch ≈ 0.5–2 WU; complex search/list operation ≈ 10–50 WU; bulk backend workflow/heavy API/file processing ≈ 20–100+ WU. **Flag:** exact per-plan WU allotments are Bubble's to set and change; verify against bubble.io/pricing before budgeting.
- **What burns WU for a financial engine:** (a) **recursive/scheduled workflows** that write many rows (e.g., writing a 300-row amortization schedule to the DB row-by-row is expensive); (b) **nested "Do a search for" inside repeating groups** (the single most-cited WU killer); (c) large list operations server-side.
- **Cost-minimizing architecture for the per-deal engine:**
  - Compute amortization schedules and multi-period cash-flow projections **client-side in JavaScript** (Toolbox), and only **persist summary results** (XIRR, equity multiple, per-tranche schedule) — ideally as a compact JSON/text or a modest set of CashFlowEvent rows — rather than recomputing via server workflows.
  - Avoid writing 300 individual rows per recompute; if you must store the schedule, store it as one serialized field or batch-create sparingly.
  - Keep chart data assembly client-side.
  - This keeps the heavy per-deal math essentially **free** on the WU meter, with WU spent only on the modest reads/writes of deal inputs and saved outputs.

### Charting in Bubble — ApexCharts and multi-series ranges
- **ApexCharts plugins exist and are active.** The most prominent is the community **"Beautiful Customizable Charts and Graphs (ApexCharts.js)"** plugin (long-maintained, versioned to 5.x+ in the forum showcase), plus **Zeroqode's "Apex Chart – 54 Charts & Graphs"** and an **"APEX-CHARTS + CONFIG BUILDER"** plugin. Bubble also ships a **first-party Chart element** plugin, described by community users as "extremely reliable, supported by Bubble, and very fast on page load," but "not that good looking." ApexCharts and Chart.js are the good-looking open-source options.
- **Can they render multi-series lines where each series has different start/end points on a shared x-axis?** **Yes** — this is an ApexCharts data-shaping question, not a plugin limitation, provided the plugin lets you pass per-series `{x, y}` data (the ApexCharts and config-builder plugins do; some simplified plugin UIs that force a single shared category array do not). See Strand 4 for the exact method. If a given plugin's element UI is too rigid, the fallback is to render ApexCharts yourself in a Bubble **HTML element** with a `<script>` block — full control at the cost of not being a native element.

---

## STRAND 3 — XIRR / MIRR: CORRECT IMPLEMENTATION AND ERROR-PROOF UX

### Definitions, formulas, and day-count conventions
- **IRR (period-indexed).** The rate *r* solving `Σ Cₜ / (1+r)ᵗ = 0` for equally-spaced periods *t = 0,1,2,…* (annual, monthly, etc.). Assumes uniform period length.
- **XIRR (date-based, actual/365 — Excel convention).** For dated cash flows *Cᵢ* on dates *tᵢ* with reference date *t₀* (usually the first date):
  `Σᵢ Cᵢ / (1 + r)^((tᵢ − t₀)/365) = 0`.
  The exponent uses **actual calendar days / 365** (Excel's XIRR uses a 365-day-year actual/365 basis). Transcendental — no closed form; solve numerically. Newton-Raphson iteration: `r_{k+1} = r_k − f(r_k)/f′(r_k)`, where `f′(r) = Σ Cᵢ·(−Δᵢ)·(1+r)^(−Δᵢ−1)` and `Δᵢ = (tᵢ − t₀)/365`. Excel brackets the root by doubling guesses up and down, then applies Newton's method to the target precision (Microsoft's documented algorithm).
- **MIRR (needs two rates).** `MIRR = ( FV(positive flows, reinvest_rate) / −PV(negative flows, finance_rate) )^(1/n) − 1`, where *n* = number of periods. `finance_rate` = cost of borrowing applied to outflows; `reinvest_rate` = rate at which inflows are reinvested. Excel: `MIRR(values, finance_rate, reinvest_rate)`. When `reinvest_rate = IRR`, MIRR = IRR; typically reinvest_rate < IRR, so MIRR < IRR (a more conservative, usually more realistic figure). Wikipedia worked example: flows −1000/−4000/+5000/+2000 give IRR ≈ 25.48% but MIRR (finance 10%, reinvest 12%) ≈ 17.91% — a large, decision-relevant gap.

### The complete list of ways XIRR fails or misleads
1. **No sign change**: needs **at least one negative and one positive** cash flow; all-same-sign ⇒ no solution (Excel `#NUM!`).
2. **Sign-convention errors**: outflows must be negative, inflows positive; flipping a sign silently produces a wrong-but-plausible number.
3. **Unordered / duplicate / same-day dates**: Excel requires a valid date set; duplicate or out-of-order dates and mixed formats cause errors or wrong day-counts. Two flows on the same date should be netted.
4. **Non-convergence of Newton-Raphson**: a poor start or ill-behaved *f* diverges or oscillates; if `f′(r)=0` you hit division-by-zero. A naive implementation can return a garbage value or throw.
5. **Multiple or no real roots**: when signs alternate more than once (e.g., capital call → distribution → capital call), Descartes' rule allows multiple IRRs; XIRR returns only the first root it converges to, which may not be the economically meaningful one. Deep/large negative interim flows can yield no real root.
6. **Sensitivity to initial guess**: different guesses can converge to different roots in multi-root cases; Excel defaults to 10% and lets you pass a guess.
7. **Excel vs. naive implementations differ**: Excel uses actual/365 with bracketing-then-Newton and specific tolerance; naive code using actual/365.25, a different reference date, or no bracketing can disagree materially. Be internally consistent and test against Excel/known cases.

**MIRR-specific misuse**: the answer is only as good as the two assumed rates; because MIRR **forces** a reinvestment assumption, quoting a single MIRR without disclosing finance/reinvest rates is misleading. It also assumes 100% of inflows are reinvested at the reinvest rate, which is often unrealistic. MIRR (like IRR) can't rank projects of different size. Presenting MIRR as "the" return without the rate assumptions is the most common error.

### How established tools handle date-based cash-flow entry to prevent error
- **Excel / Google Sheets XIRR**: two parallel ranges (values, dates); returns `#NUM!`/`#VALUE!` on sign or date problems; optional guess argument. Minimal guard-rails — the user owns validation.
- **Argus Enterprise** (the CRE standard): structured, screen-based input rather than free cash-flow lists — **rent roll, lease, expense, and market-leasing-assumption screens** with explicit dates ("Available Date," lease start/expiry, analysis start/end). Argus derives cash flows from these structured inputs, so users rarely hand-key raw dated flows. Excel-based Argus-style models include a **"FIX EVERYTHING" validation pass** that scans for and auto-corrects errors (e.g., negative cash-flow flags) and reports anything it can't fix. The pattern: **capture economic events with dates in structured forms; derive the cash-flow vector; validate before computing.**
- The common thread across professional tools: **guided, structured, date-stamped event entry + a validation/error-check step before any return metric is shown.**

### Best-practice UX for complex financial input (multi-step wizard)
Synthesis of NN/g, Baymard, Luke Wroblewski's inline-validation study, and progressive-disclosure literature:
- **Progressive disclosure / staged wizard**: break the flow into logically grouped steps (e.g., Deal basics → Acquisition & financing → Tranche schedule → Cash-flow events → Review), one mental model per step. NN/g: keep steps short; show progress ("Step 2 of 5"); allow back-navigation without data loss.
- **Prevent invalid states rather than error-messaging after the fact** ("progressive enabling"): keep "Next" disabled until the current step is valid; constrain inputs so bad values can't be entered (e.g., cap a transfer at available balance — NN/g's SoFi example). For XIRR this means: enforce date pickers (no free-text dates), require at least one outflow and one inflow before enabling the compute step, disallow duplicate dates (or auto-net them), and constrain sign by using labeled "Investment (out)" vs. "Distribution/Return (in)" fields rather than a raw signed number.
- **Inline, per-step validation**: Luke Wroblewski's classic inline-validation study (A List Apart, 2009) found that the best-performing inline-validation form produced "a 22% increase in success rates, 22% decrease in errors made, 31% increase in satisfaction rating, [and] 42% decrease in completion times." Validate as the user leaves each field; show the error *at the field*, specific and actionable ("Add a final positive value — a sale or refinance — to compute a return"). NN/g caution: don't fire errors before the user has typed.
- **When to block vs. warn**: **block progression** on hard mathematical prerequisites (no sign change, invalid/duplicate dates, missing dates) — because the metric is literally uncomputable. **Warn (non-blocking)** on soft/statistical concerns (e.g., multiple sign changes ⇒ "multiple-IRR risk; interpret with care," or an implausibly high XIRR from a very short horizon).
- **Review step** before compute, summarizing every dated flow and its sign.

### Displaying a return metric that cannot yet be computed
**Best practice, stated plainly: never show a fabricated placeholder/default number (e.g., "0%", "12%", or a dummy value) for an uncomputable return.** In financial UX this is actively harmful — users anchor on displayed numbers. The accepted pattern is an **explicit, honest empty/blocked state**: e.g., "IRR — not available: add at least one investment and one return with dates," or "Insufficient data to compute." This mirrors Excel's own behavior (returns an explicit error, not a number) and professional tools' "error flag" states (Argus). A greyed metric card with a short reason and a link back to the missing input is the right pattern. Showing a number "with a disclaimer" is **not** acceptable where the number is meaningless; a disclaimer does not cure a fabricated figure.

### Canadian / US regulatory & liability considerations for displaying projected returns
- **Framing matters legally.** Presenting *projected* IRR/equity-multiple to investors edges toward securities-adjacent representation. Standard mitigations (well-established in US practice):
  - **"For informational purposes only; not investment advice; not an offer or solicitation"** framing on every returns view.
  - **"Projections are hypothetical, based on user inputs and assumptions, and are not a guarantee of future results; actual results may vary materially."** This is analogous to the SEC's mutual-fund requirement — per SEC/Investor.gov, "the SEC requires funds to tell investors that a fund's past performance does not necessarily predict future results" (see also the SEC Office of Investor Education and Advocacy "Investor Bulletin: Performance Claims").
  - The SEC's classic guidance on projections (per archived analysis of liability for forward-looking real-estate projections): (1) the party making a projection should have a **reasonable basis** for it; (2) it should be **presented in an appropriate format**; (3) accompanying disclosures should help the reader **understand the basis for and limitations of** the projection. Additional liability-limiting methods it lists: disclaimers, outside review, separating property-level returns from investor-level returns (which vary by tax position), and presenting **ranges/alternative outcomes** rather than a single point estimate.
  - **US SEC Marketing Rule** context: **hypothetical performance** (which model-driven projections resemble) should not be broadcast to a broad retail audience without ensuring relevance to the recipient and providing sufficient risk/limitation detail; many advisers treat model outputs as advertisements subject to the rule.
  - **Canada**: securities regulation is provincial (CSA/OSC etc.); the analogous expectations are fair, not-misleading presentation, prominent risk disclosure, and avoiding anything that constitutes "advice" or a "recommendation" absent registration. (I could not retrieve a Canada-specific primary source in this pass — **flag for legal review by Canadian securities counsel**.)
- **Bottom line:** InvestScape should (a) label all outputs as user-driven, hypothetical, informational-only, not advice; (b) show assumption inputs (finance/reinvest rates for MIRR, exit assumptions) alongside outputs; (c) prefer **ranges/sensitivities** over single figures where feasible; (d) get jurisdiction-specific sign-off (US securities counsel and Canadian securities counsel) before launch. **This is a flag, not legal advice.**

---

## STRAND 4 — MULTI-TRANCHE AMORTIZATION CHART RENDERING (ApexCharts)

### Rendering series with independent start/end on a shared x-axis
**Use the `{x, y}` paired-object data format on a numeric x-axis (month number), with each tranche series containing ONLY its own live points.** ApexCharts positions points by their absolute x value, not by array index, so a series whose data starts at `{x:18,…}` and ends at `{x:60,…}` draws a line that begins at month 18 and ends at month 60 — **it never snaps back to origin, because there is no point at x=0 in that series.** This is also the format ApexCharts officially recommends: per apexcharts.com/docs/series/, the XY paired format is "Recommended as it is compatible with all charts" and "the recommended format for axis charts for ease of use"; for numeric x you must set `xaxis.type: 'numeric'`.

Concrete config:
```javascript
const options = {
  chart: { type: 'line', height: 420, animations: { enabled: false } },
  xaxis: { type: 'numeric', min: 0, max: 300, tickAmount: 10, title: { text: 'Month' } },
  stroke: { curve: 'straight', width: 2 },     // straight avoids monotoneCubic null bugs
  markers: { size: 0 },
  series: [
    { name: '1st Mortgage', data: [ {x:0,y:1000000}, /* … */ {x:300,y:0} ] },
    { name: 'VTB',          data: [ {x:0,y:250000},  /* … */ {x:120,y:0} ] },
    { name: 'Bridge',       data: [ {x:18,y:500000}, /* … */ {x:60,y:0} ] },
    { name: 'Mezzanine',    data: [ {x:36,y:300000}, /* … */ {x:96,y:0} ] }
  ]
};
```
Set `xaxis.min:0`/`max:300` explicitly so the axis always spans the full project even though no single tranche covers it all (docs: "min — the lowest number… drawing beyond this number will be clipped off").

**Null padding vs. XY format, connectNulls:** Do **not** use a flat array padded with `null` across the shared timeline. `stroke.connectNulls` (a boolean; default `false`, meaning nulls break the line) is the only lever there, and both settings are wrong here: `true` bridges across the tranche's dead months (drawing where the tranche doesn't exist), and `false` with a leading null triggers a documented **disappearing-stroke bug**. Notably, `connectNulls` is **not even listed in the current official stroke reference** despite working — treat its behavior as confirmed-by-use, not by docs. The XY-per-series approach has no nulls, so none of this applies.

**Datetime vs numeric x-axis:** both position by absolute value and both support non-overlapping series; use **numeric** since your axis is month numbers (docs explicitly: "don't forget to set `xaxis.type: 'numeric'` as the X values contain numbers"). Use `datetime` only if you switch to real calendar dates. Avoid `type:'category'` (aligns by shared index ⇒ forces null-padding).

**Documented null-handling bugs to avoid (all triggered by null-padding, not by the XY approach):**
- react-apexcharts **#591** — "Series stroke line disappearing when first value is null" (on a datetime axis, a series whose earliest value is null loses its stroke). Maintainer says not reproducible on `apexcharts@4.3.0`, but a later user still reports it — **ambiguous on current versions**.
- **#4602** — with `connectNulls:true`, x-axis annotations anchored on a null datapoint don't render (reporter migrated to Chart.js).
- **#4112** — regression where nulls that should leave a gap were filled in, specifically with `monotoneCubic`; use `curve:'straight'`.
- **#1282 / #1498 / #1767** — isolated points between nulls not shown / phantom nulls leaking onto the axis / a stray vertical white line / messy null animation. Mitigations: `curve:'straight'`, `animations.enabled:false`.

### Origination / maturity markers (annotations)
Use **x-axis annotations** (vertical line for a single event; range rectangle to band a tranche's active window) and optionally **point annotations** for a labeled marker at a specific (x,y):
```javascript
annotations: {
  xaxis: [
    { x: 18, x2: 60, fillColor: '#B3F7CA', opacity: 0.15, label: { text: 'Bridge window' } },
    { x: 18, borderColor: '#00E396', label: { text: 'Bridge orig.' } },
    { x: 60, borderColor: '#FF4560', label: { text: 'Bridge maturity' } }
  ]
}
```
(Docs: an x-axis annotation "is a vertical line… drawn on the x value"; adding `x2` draws a shaded region from x to x2.) Runtime control via `addXaxisAnnotation`, `removeAnnotation(id)`, `clearAnnotations()`. **Gotcha (#4602):** don't anchor an annotation exactly on a null month — a non-issue with the XY-per-series approach.

### Distinguishing staggered series & handling a line that ends mid-chart
- **Direct labeling** at each line's live end beats a legend for staggered series, because a legend can't convey *where* a line lives. Label each line at its right-most point with the tranche name (and optionally its maturity month).
- **Colour + dash pattern** together (not colour alone) to survive colour-blindness and dark backgrounds: e.g., 1st Mortgage solid, VTB dashed, Bridge dotted, Mezzanine dash-dot (`stroke.dashArray: [0, 6, 2, 8]`).
- **Mark origination and maturity** with the annotations above so a line that stops at month 60 reads as "matured," not "data missing." A small end-cap marker + "matured" label removes the mid-chart-ending confusion.

### Stacked/area companion view of total outstanding debt
**Yes — a stacked area chart of total outstanding debt is a valuable companion, but keep it as a separate view, not merged with the per-tranche lines.** Tradeoffs:
- **Pro:** a stacked area (tranches stacked) instantly shows **total leverage over time** and each tranche's contribution to the total balance — useful for LTV/exposure and refinancing-cliff storytelling.
- **Con:** stacked areas make it hard to read any single tranche's *own* balance (each band's baseline shifts with the bands below it), and staggered start/end makes the stack's shape jump when a tranche originates or matures. So: use the **overlaid line chart as the primary** ("what each tranche owes"), and the **stacked area as a secondary** ("total debt outstanding / total exposure"). Don't try to do both in one chart.

### Accessibility & readability for 4+ overlapping series on a dark background
- **Don't rely on colour alone**: pair each series with a distinct **dash pattern** and **direct label**; ensure ~3:1 contrast of each line against the dark background and sufficient contrast between adjacent series colours.
- **Dark-theme tooltip** (`tooltip.theme:'dark'`) and a **shared/crosshair tooltip** so overlapping values are readable at a given month; consider `tooltip.shared:true` with clear series names.
- **Reduce clutter**: `markers.size:0` on dense lines (markers only at origination/maturity), thin gridlines, and generous line width (2px).
- **Provide a data table / CSV export** as a text alternative for screen-reader and analytical users (also useful for auditability of the projection).
- Keep the palette to ≤5–6 clearly distinct hues; beyond that, lean harder on dashes + direct labels.

---

## RECOMMENDATIONS

### Port path (Strand 1) — decision
**Hand-rebuild the UI directly in Bubble, using the Claude Design HTML as a pixel-accurate visual spec (open it side-by-side; extract exact hex/spacing/typography via browser DevTools).** Do not adopt any HTML→Figma→converter→Bubble chain. Staged plan:
1. **Now:** Lock the Bubble app on the **new (flexbox) responsive engine**. Establish a page-level Column container and a shared component library (reusable elements/styles) that mirrors the HTML's design tokens.
2. **Translate structure, not pixels:** For each HTML screen, identify rows vs. columns and rebuild as nested Row/Column containers with min/max widths and gaps. Convert any CSS-grid or absolutely-positioned regions into nested Rows/Columns (or Repeating Groups for uniform grids) and Align-to-Parent where pinning is needed.
3. **Only if** you later acquire a *native Figma* design with disciplined Auto Layout under ~1,000 elements would you reconsider Bubble's official converter — and even then, expect to re-create all buttons/inputs/dropdowns by hand.
- **Benchmark that would change this:** if a future automated converter demonstrably emits correct nested Row/Column hierarchy with min/max settings from raw HTML (not just fixed frames), re-evaluate. None does today.

### XIRR wizard — concrete recommended architecture (Strand 3)
1. **Data model**: `Deal` (inputs + saved outputs) → one-to-many `CashFlowEvent` **satellite data type** (`date`, `amount` signed, `type` option-set: Investment/Distribution/Refi/Sale, `tranche` reference). **Never** store the cash-flow vector as a list field on Deal (privacy + download-everything + 10k-item issues). Tranche types = **option set** (fast, static labels).
2. **Timezone**: enable Bubble's **timezone override** app-wide; treat all cash-flow dates as date-only in a fixed zone so day-counts are stable across users.
3. **Wizard flow** (staged, progressive-disclosure): Deal basics → Financing & tranches → Dated cash-flow events → Review → Results. Enforce **date pickers only**, **labeled sign** (in/out fields, not raw signs), **auto-net same-day flows**, **block "Compute"** until ≥1 outflow and ≥1 inflow with valid, unique, ordered dates. Inline per-field validation; block on hard math prerequisites, warn (non-blocking) on multiple sign changes / very short horizons.
4. **Compute engine**: XIRR/MIRR in **JavaScript via Toolbox "Run JavaScript"** (client-side, zero WU, instant), returning via "JavaScript to Bubble." Newton-Raphson with a **bisection/Brent fallback** and bounded guesses; **actual/365** to match Excel; validate sign-change precondition first; on multi-root, return the root and flag the ambiguity. Optionally mirror the engine as a serverless endpoint for batch recompute. Persist only summary outputs.
5. **Results display**: metric cards for XIRR, MIRR (with **finance & reinvest rates shown**), equity multiple. **Uncomputable ⇒ explicit "Not available — add …" state, never a placeholder number.** Prefer **ranges/sensitivities** over single points. Persistent **"Informational only · hypothetical · not investment advice"** disclaimer.
6. **Charts**: ApexCharts (community ApexCharts plugin or self-hosted in an HTML element) — per-tranche overlaid **line chart** (XY numeric, per-series live points, straight curve, annotations for orig/maturity, direct labels + dash patterns) as primary; **stacked-area total-debt** chart as secondary.

---

## CAVEATS & UNCERTAINTIES
- **Converter fidelity claims are vendor marketing** and unverified; treat "pixel-perfect / production-ready, no rebuild" skeptically. The only official, load-bearing facts are Bubble's own (≤1,000 elements; Auto Layout required for best results; buttons/inputs/dropdowns not recognized).
- **"Buddy"** is Anima's Figma AI *design agent* ("built to work like a real design partner"), **not** a Figma-to-Bubble converter. No Buddy-branded Bubble converter exists. Live Figma→Bubble options are Framify.io and Bubble's own Deezign-based converter.
- **WU allotments and plan prices** (Starter $29 / ~175k WU, Growth $119, Team $349 / ~500k WU; overage $0.30/1,000 WU) are set by Bubble and change; verify at bubble.io/pricing.
- **CSV import limits** are partly Beta and plan-dependent; large seed loads should be chunked or piped via the Data API.
- **ApexCharts `connectNulls`** works but is undocumented in the current stroke reference; the null-first disappearing-stroke bug (#591) has ambiguous status on current versions. The XY-per-series approach sidesteps all of this.
- **Regulatory/liability** points are general and US-centric; **Canadian securities specifics were not sourced in this pass** — obtain jurisdiction-specific legal review (US + Canadian securities counsel) before displaying projected returns to investors. Nothing here is legal advice.
- Excel's exact XIRR internals (tolerance, bracketing) are documented by Microsoft at a high level; secondary sources debate secant-vs-Newton details across Excel versions — implement your own solver and **test against Excel and known cases** rather than assuming bit-identical results.