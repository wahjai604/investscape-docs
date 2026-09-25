# InvestScape ↔ Relationship OS — Progress Update for ChatGPT
**From:** Claude Code (InvestScape Rebuild build)
**Date:** 2026-09-06
**Purpose:** Two-way status sync. This covers what changed on the InvestScape side since the last handoff, what's now live in production, and what's still open — so ChatGPT/Relationship OS can update their side and hand back anything Claude needs to pick up next.

---

## 1. Full-Stack Wiring Checkpoint — CONFIRMED LIVE

All four layers of the InvestScape Phase 2 stack were checked end-to-end today and are live with no drift:

| Layer | Status | Notes |
|---|---|---|
| **Supabase** | ✅ Live | `investscape` schema reachable via REST. RLS/grant security verified correctly locked down — anon role hitting `investscape.deals` returns `42501 permission denied` (grant-level block, not just RLS), confirming the schema is exposed correctly without leaking data. |
| **Railway** (`investscape-api`) | ✅ Live | Auto-deploys on push via webhook, live within ~15-30s. Verified via polling `curl` against the production `/v1/calculate/city-market` endpoint after every push today. |
| **`investscape-api`** | ✅ Live | CORS still correctly scoped to WeWeb's real origin (not wildcarded). Vendors 4 internal engines (`calc-engine`, `economic-engine` v0.1.4, `market-intelligence-engine` v0.1.1, `tax-engine`) via `file:` tarballs. |
| **WeWeb editor** | ✅ Reachable | No changes needed today; groundwork from the Sep 5 kickoff still holds. |

**Outstanding from this wiring check:** WeWeb's published-site domain still needs to be added to `CORS_ALLOWED_ORIGINS` once it's actually published (currently only the editor origin is allowlisted).

---

## 2. Data-Integrity Fixes Shipped Today (AZ/TX Market Data)

Found and fixed a real bug while auditing the economic engine's city-market data: **Houston/Austin/Phoenix records had fabricated `medianHousePrice`/`medianRent`/`priceChange12m`/`rentChange12m` figures, falsely cited as sourced from Federal Reserve FRED + Zillow at `confidence: 'high'`.** Austin's price was overstated by ~47% against real data.

Fix process (repeated 3x today as more of the record got verified — v0.1.1 → v0.1.2 → v0.1.3 of `@investscape/economic-engine`):

1. **v0.1.1** — Replaced fabricated price/rent/appreciation figures with real, live-verified data from Zillow's public ZHVI (price) and ZORI (rent) research CSVs (free, no key required). Downgraded `confidence` from `'high'` to `'medium'`. Fixed 5 test assertions that had hardcoded the old fake numbers (one test's whole premise flipped — Austin was previously asserted as "fastest-appreciating," real data shows a -5.2% decline).
2. **v0.1.2** — Self-caught bug: my first fix put the internal audit note directly into the `source` field, which is rendered verbatim in the UI's "SOURCE" KPI card — so dev/audit text was leaking to end users. Caught via a live screenshot. Fixed by reverting to a clean citation string; audit detail now lives only in code comments. Logged as a standing process lesson: *provenance/audit detail belongs in code comments or a dedicated non-rendered metadata field, never inline in a field a UI template prints verbatim.*
3. **v0.1.3** — Replaced `population` fields with real Census ACS 2023 1-year estimates (required registering a free Census API key, `api.census.gov/data/key_signup.html`, activated today after a several-minute propagation delay on Census's end): Houston 7,510,252 (was 7,066,000), Austin 2,473,275 (was 2,327,000), Phoenix 5,070,110 (was 5,028,000).

Each fix was propagated through the full chain: `investscape-economic-engine` source → `npm run build` → `npm pack` → vendored into `investscape-api`'s `vendor/` dir → `npm ci` → pushed → verified live on Railway via polling curl. The standalone HTML prototype (`investscape-v2-remastered.html`) has this same engine **inlined as a UMD bundle**, separate from the npm package — each fix required a second re-splice into that file too. All 9 commits (3 per repo × 3 repos) are pushed to `origin/master`.

**Current source strategy going forward:** Census/BLS for demographics, Zillow (with attribution) for price/rent, until a better licensed feed is justified.

### 2b. Follow-up (2026-09-06/07) — 3 more metros built, cap rate/DOM/absorption researched

Turns out Dallas/Tucson/San Antonio/Prescott Valley weren't a fabricated-data risk like Houston/Austin/Phoenix were — they simply had **no records at all** in the engine, despite being named in the pilot metro list. Confirmed by checking the source file directly before doing anything.

- **Added real records for Dallas, San Antonio, and Tucson** (`@investscape/economic-engine` v0.1.4): real Zillow ZHVI/ZORI price+rent, real Census ACS 2023 population, `confidence: 'medium'`, `capRateDistribution` set to `null` (the type's own documented convention for unverified markets) rather than inventing numbers. Propagated through all 3 repos and confirmed live in Railway production the same way as the earlier fixes.
- **Prescott Valley-Prescott, AZ deliberately left unbuilt.** Checked directly against Zillow's metro-level ZHVI/ZORI files (895 US metros) — it isn't covered at all, too small for their metro research feed. Real Census population exists (249,081) but there's nothing to pair it with yet. Left as an explicit comment in the source rather than faked.
- **Researched free sources for cap rate, days-on-market, and absorption rate** across all metros (not just AZ/TX):
  - **Cap rate: confirmed dead end.** No free metro-level source exists anywhere — CoStar/Reis/MSCI own this space. Even NAR's "free" commercial dashboard just repackages CoStar-licensed data into static PDFs, not a CSV/API. The only viable path is an in-house proxy (implied gross rent multiplier from the ZHVI/ZORI data already on hand) — not a real cap rate, and not built yet.
  - **Days-on-market and absorption/months-of-supply: real free sources exist**, just not pulled in yet. Redfin's Data Center has both at metro level, but the public files are the full historical weekly series across all US regions (300MB+ gzipped) — needs a targeted streaming-extract approach rather than a blind download. FRED also has a documented per-CBSA `MEDDAYONMARxxxxx` DOM series, but requires registering a free API key first, same friction as the Census key.
  - Decision: stop here for now, log the answer, revisit with a proper build pass later rather than rush it.

**Still open / not yet sourced:** cap rate (proxy-only option identified, true cap rate has no free source at all); days-on-market and absorption rate (free sources identified, not yet pulled in — needs either a FRED key or a Redfin streaming-extract script); Prescott Valley price/rent (no free source exists); sub-metro granularity not started.

---

## 3. New Requirement Logged (Not Yet Built)

Added an explicit requirement to the Flow & Module Depth Audit: **all 4 engines (calc, tax, economic, market-intelligence) need to be fully wired and active across every tab on the main ribbon — especially Market Intelligence.** Today's confirmation: `investscape-api` (with real MI routes, `E60-E66`) is now live in production, which means an earlier decision to leave Market Intelligence on a demo-inlined stand-in dataset needs to be re-checked — it may no longer be the right call now that the real backend exists. This is flagged as open work, not yet actioned.

---

## 4. Vault Housekeeping (FYI, no action needed on your side)

Retired the Aug 30 tracker and stood up a fresh **`ACTIVE WORK TRACKER (Sep 6 2026)`** on the InvestScape Rebuild side, with 4 fully-closed docs archived to a `completed/` subfolder. Purely organizational — flagging only so file paths referenced in any prior handoff docs are known to have moved under `completed/` if you go looking for them later.

---

## 5. What We Need Back From ChatGPT / Relationship OS

To close the loop on this two-way sync, it would help to get back:

1. Current status of the **Relationship OS ↔ InvestScape integration handoff** (last known state: handoff doc existed as of Aug 28 — is anything blocking on that side, or is it still waiting on InvestScape's Phase 2 build to reach a certain point?).
2. Anything Relationship OS needs from the data-integrity fixes above (e.g., if any Relationship OS-side logic consumes Houston/Austin/Phoenix/Dallas/San Antonio/Tucson market data — the first 3 were previously wrong and are now corrected, the latter 3 are newly available as of this update).
3. Any updates on the **Representation-Authority Signal requirement** (logged 2026-09-06 on the InvestScape side) — is there a corresponding contract/expectation on the Relationship OS side we should be aware of?

---

## 6. Quick Reference — Live Endpoints & Versions

- API: `https://investscape-api-production.up.railway.app`
- `@investscape/economic-engine`: v0.1.4 (adds Dallas/San Antonio/Tucson; Houston/Austin/Phoenix from v0.1.1-0.1.3)
- `@investscape/market-intelligence-engine`: v0.1.1
- `@investscape/calc-engine`, `@investscape/tax-engine`: v1.0.0
