# InvestScape i18n & Multi-Jurisdiction Architecture: A Route 2 Decision Brief

## TL;DR
- **Yes — the hardcoded flat-dict-per-language pattern is a recognized anti-pattern for a production SaaS, and it should be replaced in Route 2** with an established i18n framework (recommended: **i18next / react-i18next**) that loads externalized JSON translation files, ideally via a translation-management service (Locize, Lokalise, Crowdin, or SimpleLocalize) so non-engineers can add/update languages without a code deploy.
- **The "frozen translation" bug is a textbook data-modeling error**: category/type/status values (loan type, deal status, property category) must be stored as stable, language-independent **keys/enums** and resolved to display labels at render time — never stored pre-translated. This is the standard i18n principle and directly fixes the bug.
- **Two things are genuinely bigger lifts and should be scoped separately**: (1) **RTL support** for Persian/Farsi is a layout-system change (mirroring, logical CSS properties, icon/chart flipping), not just another translation file — budget it as a distinct project; and (2) **multi-jurisdiction rules** should move to a **"rules as data" / jurisdiction-keyed configuration** model (config tables or a rules engine like GoRules/ZEN, json-rules-engine, or DMN) instead of per-country if/else. Locale formatting itself is largely a solved problem via the browser-native **Intl API** (including Indian lakh/crore via `en-IN`).

## Key Findings

1. **Hardcoded strings in code are the canonical i18n anti-pattern.** Every authoritative i18n source treats "text baked into the application bundle" as the fundamental problem i18n frameworks exist to solve. The founder's flat-dict pattern is a reasonable *MVP shortcut* for 4 curated languages, but it fails exactly where the founder wants to go: adding a language requires a developer, a build, and a deploy, and translators cannot contribute.

2. **The modern React standard is i18next/react-i18next with externalized JSON, delivered at runtime.** react-i18next is the most widely recommended default; react-intl/FormatJS and LinguiJS are viable alternatives. The decisive capability for InvestScape is **runtime/CDN delivery** (via i18next-http-backend or a TMS backend like i18next-locize-backend), which lets translations update *without redeploying the app* and lets non-engineers contribute.

3. **"Store keys, not translated values" is the confirmed standard principle** — explicitly endorsed by the W3C Internationalization Working Group, which states enum values "should not be considered 'natural language strings'" and that it is "a best practice to define values in a locale-neutral way and wrap that with display strings."

4. **Decoupling display language from jurisdiction is standard multi-tenant/i18n practice**, and the regulatory rule sets should be modeled as **data (jurisdiction-scoped config tables or a rules engine)**, not code branches. Real-world tax/payroll/mortgage platforms (Symmetry, Oracle E-Business Tax, Dynamics 365 Tax Engine) do exactly this, keying rules by country/region with effective dates and audit trails.

5. **The Intl API is the correct, browser-native tool for locale formatting in 2025-2026** and has excellent support across all modern browsers. It handles Indian lakh/crore grouping (`en-IN` → `1,23,456`), decimal-comma locales (`de-DE`), currency symbol placement, and compact notation natively.

## Details

### Q1 — Is the flat-dict pattern an anti-pattern, and what's the 2025-2026 best practice?

**Verdict: Yes, it is a recognized anti-pattern for a scaling SaaS, though acceptable as a throwaway MVP tactic.** The core failure is captured well by the ActiveLoc i18n guide: "When text is 'hard-coded' directly into the source code, it cannot be easily translated... would require a code change, a new build, and a new deployment. This is not a scalable approach for a multilingual application." The solution universally recommended is to **externalize all user-facing strings into resource files** (JSON) managed outside the code.

**Recommended architecture for the React (Route 2) stack:**
- **Library:** `i18next` + `react-i18next`. This is the most-recommended default in 2025-2026 write-ups (Lokalise, Contentful, Locize). It supports namespaces, lazy loading, pluralization, interpolation, language detection, and SSR. react-intl/FormatJS is the alternative if the team standardizes on ICU MessageFormat; LinguiJS is a compile-time-extraction alternative with good type safety and smaller runtime.
- **File structure:** one JSON file per language (optionally per namespace), e.g. `locales/en/translation.json`, `locales/fr/translation.json`, `locales/es/translation.json`.
- **Runtime delivery so non-engineers can add languages without a deploy:** two options — (a) `i18next-http-backend` serving JSON from your own server/API; or (b) `i18next-locize-backend` pointing at a TMS (Locize) that delivers via CDN. With the CDN approach, "there are no locale files in your repository at all. A translation fix published in the editor is live without a commit, a build, or a redeploy." A TMS also gives translators an editing UI, AI pre-translation, version control, and — importantly for InvestScape — Locize specifically supports **per-customer/tenant translation overrides**.
- **Tooling to migrate off the flat dict:** `i18next-cli` can statically scan the codebase, wrap hardcoded strings in `t()` calls, generate keys, and produce the initial locale files — meaningfully reducing the migration cost from the current hand-rolled dict.

**Recommendation:** In Route 2, adopt react-i18next with JSON translation files. Start with self-hosted `i18next-http-backend` (cheapest), and adopt a TMS (Locize/Lokalise/Crowdin/SimpleLocalize) when you begin recruiting outside translators for Spanish/Hindi/etc. This directly delivers the founder's goal of "add a language by uploading a file, not changing code."

### Q2 — The "frozen translation" bug and the correct data-modeling principle

**Verdict: This is a textbook i18n data-modeling bug, and the founder's instinct is correct.** The principle — store a stable, language-independent **key/enum** for any category/type/status field, and resolve the display label at render time from the active language — is the industry standard.

Authoritative confirmation:
- **W3C Internationalization Working Group** — Addison Phillips, in a GitHub comment on the `w3c/compute-pressure` issue #184 (dated 7 Feb 2023): "Enum values should not be considered 'natural language strings'... it is a best practice to define values in a locale-neutral way and wrap that with display strings (exactly as you go on to suggest)." A related W3C i18n note recommends rendering enum values "code-like" (e.g. `FIRST_MORTGAGE`, `VENDOR_TAKE_BACK`) precisely to signal they are not display text.
- General database practice: store enums/status as stable codes (integer or string identifier), never the human-readable label, so that "you could fetch the integers and translate them on the fly, before displaying them. This will also allow you to use localisation functions and present the information in multiple languages."
- A lookup-table refinement (recommended for InvestScape): store the loan-type key as a column, and optionally back it with a `loan_types` lookup table so the DB is self-documenting and you can attach metadata (ordering, `is_active`, etc.). The display label lives in the i18n translation files keyed by that enum, e.g. `t('loanType.FIRST_MORTGAGE')`.

**Concrete fix for InvestScape:** Change the loan `type` field (and any deal-status/property-category field) from storing `"1st mortgage"`/`"Vendor take-back"` (already-translated display strings) to storing keys like `FIRST_MORTGAGE`/`VENDOR_TAKE_BACK`. The UI resolves `t('loanType.' + record.type)` at render time. Records created in French will then correctly re-render in English when the user switches languages — the bug disappears by construction. **Note:** this requires a one-time data migration to convert existing stored display strings back to keys.

Distinguish two separate cases (both sources agree these are different problems):
- **Enumerated/system values** (loan type, status, category) → store keys, translate via UI i18n files. This is InvestScape's bug.
- **Free-form user-generated content** (e.g. a user's own note/description) → if it ever needs to be multilingual, that uses a *different* pattern: a per-locale column, a separate translations table, or a JSON column. This is not InvestScape's current bug but is worth knowing for later.

### Q3 — What RTL (Persian/Farsi) really takes, and is it a bigger lift than adding Spanish?

**Verdict: Yes — RTL is a materially larger engineering lift than adding another LTR language, but Tailwind makes it very tractable if built in deliberately.** Adding Spanish is "just" a new translation file. Adding Persian is a *layout-direction* change affecting the whole UI. (For scale: Flowbite's RTL docs estimate "over 500 million people that use RTL languages," so the market case is real.)

What RTL requires:
- **Set direction at the root:** `dir="rtl"` on `<html>` (or a wrapper), toggled when the user selects an RTL language. Per aiwithmo's Arabic/English React guide, this alone "gets you about 60% of the way to an Arabic-ready app and gives you a false sense of being done. The other 40% is layout that mirrors correctly, icons that flip..."
- **Logical CSS properties instead of physical ones** — this is the single biggest change. Use `margin-inline-start`/`-end`, `padding-inline-start`/`-end`, `inset-inline-start`/`-end`, and `text-align: start/end` instead of left/right. As the same guide puts it, "the words 'left' and 'right' are bugs" in an internationalized layout.
- **Icon and directional-element mirroring:** back/forward arrows, chevrons, progress bars, breadcrumbs must flip (e.g. `rtl:rotate-180` or `transform: scaleX(-1)`); non-directional icons (logos, clocks, stars) must **not** flip.
- **Charts, tables, and financial layouts** need axis/column-order mirroring — relevant for InvestScape's analysis dashboards; this is bespoke per-component work.
- **Mixed LTR-in-RTL text** (e.g. Latin numbers/currency codes inside Persian text) needs `<bdi>` / `dir="auto"` handling on free-form inputs.
- **Typography:** Persian/Arabic scripts often need a larger font size and different fonts for readability.

**Tailwind CSS support (relevant because it's already a project constraint):** Tailwind has had first-class RTL support since **v3.3**. Its official v3.3 release blog states: "Simplified RTL support with logical properties... Using new utilities like `ms-3` and `me-3`, you can style the start and end of an element so that your styles automatically adapt in RTL, instead of writing code like `ltr:ml-3 rtl:mr-3`." **Tailwind CSS v4** provides logical-property utilities more comprehensively. Component libraries built on Tailwind (Flowbite, FlyonUI, Untitled UI) ship RTL support out of the box using these logical properties (Flowbite notes it requires "Tailwind CSS v3.3.0 or higher"). So the *framework* supports RTL well; the *lift* is auditing and converting existing physical-direction classes and testing every screen with real Persian content.

**Effort estimate:** aiwithmo warns that "retrofitting it onto a finished LTR app takes longer than rebuilding the layout layer from scratch." **Strong recommendation: adopt logical properties as the default convention now** (during the Route 2 rebuild, before the UI grows), even if Persian ships later. That converts RTL from an expensive retrofit into a near-free capability. Treat RTL as a distinct, separately-scoped work item — not lumped in with "add another language."

### Q4 — Decoupling display language from jurisdiction, and managing N rule sets without if/else

**Verdict: These are two orthogonal axes and must be modeled separately.** "What language do I read the UI in?" (user/session preference) is completely independent of "which country's regulatory rules apply to *this deal*?" (a property of the record). A French-speaking user analyzing a US property should get French UI + US calculation rules. InvestScape already has a `country` field on records — that is the correct home for jurisdiction; language belongs on the user/session. **Do not conflate them** (a common failure is deriving rules from locale, e.g. assuming `fr` ⇒ Canada).

**For the rule sets themselves, the recommended pattern is "rules as data" / jurisdiction-scoped configuration rather than hardcoded per-country branches.** As the codebase grows past 2 countries toward UK/India/Asia/LatAm, `if (country === 'CA') {...} else if (country === 'US') {...}` becomes unmaintainable — the classic "if-else chaos" / "switch statement smell." Options, from lightest to heaviest:

- **Jurisdiction configuration tables (recommended starting point):** a `jurisdictions` table (or config files) keyed by country/region, storing parameters like compounding convention (`SEMI_ANNUAL_NOT_IN_ADVANCE` vs `MONTHLY`), CMHC premium bands, stress-test rule reference, land-transfer-tax brackets, and rent-increase caps — **with effective-date columns and an audit trail**. This is exactly how payroll/tax engines work. Symmetry's Tax Engine (which "powers payroll tax compliance for leading platforms including Gusto, Deel, ADP, Paychex, Wave, and Salsa" and covers "over 7,400 taxing jurisdictions") describes the infrastructure as "a tax rules database covering all 50 US states, Puerto Rico, US territories, and Canada — typically 7,000+ distinct taxes, each with its own ID, formula, and effective dates." Oracle E-Business Tax similarly lets you "create rules that reflect the regulations of a tax authority... As tax authority regulations change over time, you can update both the rule values and the rule processes themselves." Microsoft Dynamics 365's Tax Engine separates a "Configuration" source (static jurisdiction rules) from a "User data" source (runtime values), with effective-date columns for versioning.
- **Strategy pattern for the *logic* that can't be pure data** (e.g. the actual compounding formula): one calculator class/module per jurisdiction implementing a common interface, selected at runtime by the record's country. This "allows us to vary the algorithm independently from clients that use it" and means adding a jurisdiction is "simply create another class... no need to modify the existing code" (Open/Closed Principle).
- **A dedicated rules engine when logic gets genuinely complex/declarative:**
  - **json-rules-engine** (npm, CacheControl) — lightweight; rules expressed as JSON so they "can easily be converted to JSON and persisted to a database." Good fit for a JS/TS stack.
  - **GoRules / ZEN Engine** — open-source (Rust core, Node/Python/Go bindings) evaluating JSON **decision tables**; its docs note the spreadsheet-like interface "facilitates easy modification and addition of rules, enabling business users to contribute to decision logic without delving into intricate code" — and its own examples key on `country: "US"`.
  - **DMN decision tables (Camunda)** or **Drools** — heavier, JVM-oriented BRMS. Camunda notes "business analysts can model the rules that lead to a decision in easy to read tables, and those tables can be executed directly by a decision engine... it even allows rapid changes in production." Likely overkill for InvestScape's stage, but the enterprise end of the same spectrum.

Real-estate-specific validation: Fundmore argues the best support for Canada's OSFI B-20 stress test comes from "an embedded, configurable underwriting engine—not from a spreadsheet or a standalone calculator... using lender-defined rules," confirming the config-driven approach in the mortgage domain. (The OSFI minimum qualifying rate itself — the greater of the contract rate + 2% or the OSFI floor — is a good example of a jurisdiction-specific parameter that changes over time and therefore belongs in a dated config row, not in code.)

**Recommendation:** For Route 2, use **jurisdiction config tables + the strategy pattern** for the handful of formulas that are truly algorithmic (compounding). Defer a full rules engine (GoRules/json-rules-engine) until the number/complexity of jurisdictions justifies it. Always attach **effective dates** to rule values (tax brackets and stress-test rates change over time) and keep an audit trail of which rule version produced a given calculation.

### Q5 — Locale-aware number/currency/date formatting

**Verdict: Use the browser-native JavaScript Intl API (`Intl.NumberFormat`, `Intl.DateTimeFormat`). It is the standard 2025-2026 recommendation and browser support is excellent — do not hand-roll per-locale logic.**

- **Number/decimal/grouping:** `Intl.NumberFormat` handles decimal-comma locales (`de-DE` → `123.456,789`), Western thousands grouping, and — critically for the founder's India plans — the **Indian lakh/crore 2-2-3 grouping** natively: `new Intl.NumberFormat('en-IN').format(123456.789)` → `1,23,456.789`, and with currency, `₹12,34,567.89`. Chinese numbering can use numbering-system extensions. This means the founder does **not** need to hand-roll lakh/crore logic — a common misconception.
- **Currency:** `style: 'currency'` handles symbol placement per locale (`$1.50` vs `1,50 €`), correct rounding, minor-unit rules (JPY has none), and accounting-style negatives.
- **Compact notation** (`notation: 'compact'`) produces locale-aware short forms for dashboards (`1.23M`, German `1,23 Mio.`) — directly relevant to InvestScape's "1,5 M$" vs "$1.5M" requirement.
- **Dates:** `Intl.DateTimeFormat` resolves MM/DD/YYYY vs DD.MM.YYYY vs `2025年6月27日` ambiguity by locale.
- **Browser support:** The Smashing Magazine guide "The Power Of The Intl API" (8 Aug 2025), by Fuqiao Xue (who leads the W3C's Internationalization Activity), positions Intl as the native replacement for heavy libraries — "modern JavaScript offers the Intl API — a powerful, native way to handle i18n" — and confirms that all major browsers (Chrome, Firefox, Safari, Edge) fully support the core functionality without polyfills for the vast majority of users.

**Two important nuances:**
1. **Formatting locale is a third axis, distinct from both UI language and jurisdiction.** A user might want French UI but US-dollar formatting for a US property. Pass an explicit, full locale (e.g. `fr-CA`, `en-IN`, `de-DE`) — not just `fr` — because region drives formatting. Currency (`USD`/`CAD`/`INR`/`GBP`) should generally be driven by the *property's jurisdiction*, while grouping/separators can follow the *user's* locale preference; make this an explicit product decision.
2. The founder's existing partial per-language formatting should be **replaced by Intl**, not extended — the Chinese 萬/10,000-grouping and French decimal-comma cases are exactly what Intl exists to handle correctly. react-i18next also integrates with Intl for in-string formatting.

## Recommendations

**Stage 1 — Route 2 foundation (do these first, in the rebuild):**
1. Adopt **react-i18next with externalized JSON translation files**; migrate the 4 existing dicts using `i18next-cli` to auto-extract. Start with self-hosted `i18next-http-backend`.
2. **Refactor all category/type/status fields to store enum keys** (`FIRST_MORTGAGE`, `VENDOR_TAKE_BACK`, deal statuses, property categories); resolve labels via `t()` at render time. Run the one-time migration to convert existing pre-translated values back to keys. *This kills the frozen-translation bug permanently.*
3. **Replace all hand-rolled number/currency/date formatting with the Intl API**, passing full locale codes. Verify `en-IN` lakh/crore and `de/fr` decimal-comma output.
4. **Adopt CSS logical properties (Tailwind `ms-/me-/ps-/pe-/start-/end-`) as the default convention now**, even though Persian ships later. Ban physical `left/right` utilities in code review. This is near-free during a rebuild and saves an expensive RTL retrofit later.
5. **Separate the three axes explicitly in the data model:** UI language (user/session), formatting locale (user preference, possibly per-property currency), and jurisdiction (record's `country` field). Do not derive one from another.

**Stage 2 — When you add the first new LTR language (Spanish) or recruit outside translators:**
6. Adopt a **TMS** (Locize, Lokalise, Crowdin, or SimpleLocalize) with CDN delivery so translators add/update languages **without a code deploy**. Locize is the most native fit for i18next and supports per-tenant overrides.

**Stage 3 — When jurisdiction count grows beyond CA/US (UK, India, Asia, LatAm):**
7. Move regulatory parameters into **jurisdiction-scoped config tables with effective dates + audit trail**; use the **strategy pattern** for the few truly algorithmic pieces (compounding conventions). Adopt a rules engine (**json-rules-engine** or **GoRules/ZEN**) only when rule complexity/volume justifies it.

**Stage 4 — When you commit to Persian/Farsi (or another RTL language):**
8. Scope RTL as a **dedicated project**: root `dir` toggling, icon/chart/table mirroring audit, Persian typography/fonts, `<bdi>`/`dir="auto"` for mixed content, and full-screen testing with real Persian content. Because of Stage-1 logical properties, this becomes primarily a mirroring-and-testing exercise rather than a CSS rewrite.

**Thresholds that change the plan:**
- If you never exceed ~5 curated languages and never recruit outside translators, you could *defer* the TMS (Stage 2) and keep JSON files in-repo.
- If jurisdiction count stays at 2 (CA/US), a light strategy-pattern + config approach suffices; **don't** adopt a heavyweight rules engine (Drools/Camunda) prematurely — that's over-engineering at your stage.
- If an RTL language becomes a near-term priority, pull Stage-1 item #4 to the very front — retrofitting RTL after the UI is built is the expensive path.

## Caveats
- **Vendor sources:** Several jurisdiction-rules examples (Symmetry, Fundmore, Cybrid, and Locize/Lokalise TMS claims) are vendor marketing. Their *architectural patterns* are sound and corroborated by neutral sources (W3C, MDN, general design-pattern literature), but treat specific product claims as promotional, not independent benchmarks. (Note: an earlier draft listed Paycor among Symmetry's customers; Symmetry's own page names Gusto, Deel, ADP, Paychex, Wave, and Salsa.)
- **Intl edge cases:** While Intl support is excellent, historically some engines lagged on Indian `en-IN` grouping and on less-common numbering systems; validate output for your exact target locales (especially Chinese 萬-grouping and any RTL-locale digit shaping) rather than assuming. Also, Intl formats but does not *translate* currency names or units into arbitrary languages beyond its CLDR data — verify Persian/Hindi output specifically.
- **Migration risk on the enum refactor:** Converting existing stored display strings back to keys requires a careful data migration (mapping every historical French/Chinese stored value back to its canonical key). Budget for it and validate that no ambiguous values exist before migrating.
- **RTL effort is real but bounded:** the "bigger lift" caveat applies mainly if RTL is retrofitted; adopting logical properties up front substantially de-risks it. The remaining irreducible work is mirroring charts/tables and Persian typography.
- **Rules-engine choice is stack-dependent:** Drools/Camunda are JVM-centric; for a Node/React + Postgres stack, json-rules-engine or GoRules/ZEN are the more natural fits. Don't adopt one before the jurisdiction complexity warrants it.