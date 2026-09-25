# InvestScape ↔ Relationship OS — Round 2 Sync
**Date:** 2026-09-07
**Inbound:** Relationship OS reply (via ChatGPT) to the 2026-09-06 progress update
**Outbound:** InvestScape's verified response, with evidence

This is the second leg of the two-way sync. Section A records what Relationship OS sent back. Section B answers their 12 evidence requests, **verified against the actual code and live production, not from memory**. Section C is the honest blocker list.

---

## A. What Relationship OS reported (2026-09-07)

**Stage 1 producer side: complete and operational**, running v0.16.0. Their gateway suite reran clean on Sep 7: 5/5 service-auth, 7/7 redemption, 6/6 callback, 4/4 launch.

**Stage 1 is NOT end-to-end complete** — they need proof of the matching InvestScape receiver journey (browser lands → submits opaque session + one-time code to InvestScape server → InvestScape redeems against RelOS → binds context to an analysis → posts bounded result-reference callback → RelOS displays it in Relationship 360 → all failure modes fail safe).

**Stages 2-8:** designed foundations, none enabled. Stage 2 (opaque identity linking) is the next coordinated slice after Stage 1 acceptance.

**Authoritative header correction:** the running RelOS implementation uses `x-lighthouse-*`, **not** the `X-Service-*` wording that appears in some of their architecture prose. Canonical signature input:
```
METHOD \n PATH \n TIMESTAMP \n NONCE \n SHA256_RAW_BODY
```

**On our market-data fixes:** RelOS does not ingest or calculate with any InvestScape market data (price, rent, population, cap rate, DOM, absorption, or economic-engine datasets). So the Houston/Austin/Phoenix corrections and the new Dallas/San Antonio/Tucson records require **no migration on their side**.

**One consequential issue they raised:** their callback contract deliberately prevents changing a *completed* result under the same `externalAnalysisId` — identical callbacks are idempotent, but a changed terminal summary returns a conflict. If InvestScape had produced completed analyses off the formerly-wrong metro data, those must be reissued as **new** `externalAnalysisId`s with the old ones marked superseded internally. They want a versioned correction/supersession contract defined jointly before broader release, possibly carrying `supersedesExternalAnalysisId`, `revision`, `correctionReasonCode`, `sourceDataAsOf`, `calculationEngineVersion`.

**They explicitly endorsed the `null` cap-rate decision**, with a condition: if an implied-rent proxy is introduced later it must be *labelled as a proxy* and must never occupy a field presented as an observed market cap rate.

**Representation-Authority Signal:** they have the underlying enforcement (actor, acting capacity, relationship, entitlement, purpose recorded at issuance; representation re-checked at redemption; browser cannot declare its own capacity), but there is **no jointly approved cross-product schema yet**. Their proposed minimum shape:
```json
{
  "operatingContext": "professional_assisted",
  "authority": {
    "type": "relationship_os_professional_assistance",
    "authorityRef": "<opaque, non-enumerable reference>",
    "status": "active",
    "purpose": "property_analysis",
    "permittedActions": ["analyze_property"],
    "effectiveUntil": "<bounded timestamp>",
    "version": 1
  }
}
```
They warn InvestScape must **not** infer representation from occupation, subscription, launch possession, or a relationship identifier.

---

## B. InvestScape's response to the 12 evidence requests

Everything below was verified on 2026-09-07 by reading the code and hitting live production — not recalled.

### 1. Repository, branch, commits
- **Repo:** `investscape-api` — `https://github.com/wahjai604/investscape-api.git`
- **Branch:** `master`
- **HEAD:** `a0e32b6` (vendor bump to economic-engine v0.1.4)
- Receiver implementation lives under `src/lighthouse/`, stages 1-8 in `stage1/`…`stage8/`.

### 2. Test output for the receiver implementation
`npm run test:lighthouse` on 2026-09-07: **441 pass, 0 fail, 0 skipped** (15.2s). This covers stage 1-8 domain, HTTP, service-auth, persistence and policy suites.

### 3. Deployed landing URL — ⚠️ **DOES NOT EXIST YET. This is the blocker.**
There is no browser-facing InvestScape landing route deployed, so **we cannot yet give you a value for `INVESTSCAPE_LAUNCH_BASE_URL`.**

What exists is the *server* endpoint the browser would post to (`POST /v1/lighthouse/launch/redeem`) — not a landing page. The landing page belongs in the frontend, and InvestScape's frontend is still WeWeb in the editor (unpublished), with the legacy HTML prototype as the only other UI surface. Neither is a deployed, addressable landing route.

**This is the single thing standing between us and the Stage 1 acceptance run you're asking for.** See §C.

### 4. Implemented redemption and callback paths
- **Inbound (browser → InvestScape):** `POST /v1/lighthouse/launch/redeem`
- **Outbound (InvestScape → RelOS redemption):** `REDEMPTION_PATH = "/v1/investscape/launch-sessions/redeem"`, resolved against `RELATIONSHIP_OS_BASE_URL`. **Please confirm this path is correct on your side** — it was derived from your implementation, not your prose, but you didn't restate it in this reply.
- **Callback schema:** `investscape-result-reference.v1` — matches your stated contract exactly. Ack parsing accepts `investscape-result-reference-ack.v1` and tolerates extra fields.

### 5. Browser never logs or persists the one-time code — ✅ confirmed, with tests
Enforced and covered by name:
- `the one-time code is sent in the body and never in the URL`
- `a binding never carries the one-time code`
- `an ambiguous outcome never carries the code`
- `the shared secret is never transmitted`

### 6. HMAC headers and canonicalization — ✅ **already correct, no change needed**
InvestScape already implements `x-lighthouse-*`. We hit this exact discrepancy during the build and resolved it the same way you just confirmed — by following your *implementation* over your *documentation*. The source file carries a standing note:

> ⚠️ CONTRACT DEFECT TO RAISE WITH RELATIONSHIP OS — `INVESTSCAPE_LAUNCH_GATEWAY_V0.1.md` documents these headers as `X-Service-*`. No such header is read anywhere in the Relationship OS implementation. An implementer following the document produces a request that fails authentication with no diagnostic.

Your reply resolves that open question. **Please correct the architecture doc** so the next implementer doesn't hit it.

Implemented exactly:
- Headers: `x-lighthouse-service` / `-key-id` / `-timestamp` / `-nonce` / `-signature`
- Canonical: `METHOD\npath\ntimestamp\nnonce\nsha256(rawBody).hex`
- Signature: HMAC-SHA256, lowercase hex, 64 chars; nonce ≥32 hex; timestamp integer Unix **seconds**; skew ±300s; `timingSafeEqual` comparison; durable nonce store for replay.

### 7. Secret/key-ID ownership and rotation — ✅ initial issuance done, rotation plan still open
**Correction to an earlier draft of this doc:** initial key exchange already happened, on 2026-09-02, with Eric's explicit authorization — two independent 32-byte secrets (per the "no bidirectional HMAC secret" review finding), mirrored on both sides:

| Direction | Key ID | Role |
|---|---|---|
| Relationship OS → InvestScape | `ros-to-is-202609-a` | InvestScape verifies inbound |
| InvestScape → Relationship OS | `is-to-ros-202609-a` | InvestScape signs outbound |

Written to `investscape-api/.env` and `relationship-os/.env.lighthouse-investscape`, both gitignored, verified absent from `git status` at the time. Key material itself was never put in a chat transcript, only key IDs and fingerprints.

`keyId → secret` map is loaded from server secret storage and never from a request; unknown key ID is deliberately indistinguishable from signature mismatch to the caller. The verifier selects a secret *by key ID*, so a `_NEXT_` pair can coexist during rotation — that mechanism exists but **no rotation has actually happened yet, and no cadence is defined.** That's the genuinely open piece: how often, whose responsibility to initiate, and whether staging gets its own separate pair from production (recommend yes).

### 8. Redacted end-to-end trace — ❌ cannot produce yet
Blocked by #3 (no landing route) and by production state: `POST /v1/lighthouse/launch/redeem` in production currently returns
```
HTTP 503  {"state":"unavailable","reason":"persistence_not_configured"}
```
The subsystem is deliberately *mounted but disabled* — `LIGHTHOUSE_FF_STAGE1_LAUNCH_RECEIVER` defaults false, and Railway has no `DATABASE_URL` wired for the lighthouse schema. Mounting-while-disabled is intentional (a 503 is an honest "exists, switched off"; a 404 is indistinguishable from a typo).

### 9. Failure-test evidence — ✅ present
Covered by name: wrong code vs unknown session indistinguishable; expired → 410 non-retryable; consumed → 409 never offers retry; revoked → 403; service-auth failure neutral to user but alerts operator; timeout → ambiguous and does **not** retry; 200 with unparseable body → ambiguous not success; 200 failing schema → ambiguous, never partially applied; missing config fails closed and never calls out; plaintext HTTP destination refused; concurrent landings create exactly one analysis; binding idempotent on `launchSessionId`.

### 10. Do any completed analyses need superseding? — ✅ **No. None exist.**
Stage 1 has never been enabled in any environment, and production has no lighthouse persistence configured. Zero launch sessions have been redeemed, zero analyses bound, zero callbacks posted. **The corrected Houston/Austin/Phoenix data never reached a completed analysis**, so there is nothing to supersede. Your correction/supersession contract is still worth defining — but as forward-looking design, not remediation.

### 11. Representation-Authority Signal — ✅ **strong independent convergence**
InvestScape already models this in `src/lighthouse/domain/operatingContext.ts`, and it lines up with your proposal closely enough to be encouraging — both sides arrived at the same shape independently.

| Your proposal | InvestScape's existing model |
|---|---|
| `operatingContext: "professional_assisted"` | `OperatingContextKind` includes exactly `professional_assisted` |
| `authority.status: "active"` | denial reasons `AUTHORITY_NOT_ACTIVE`, `AUTHORITY_EXPIRED` |
| `authority.effectiveUntil` | `expiresAt` |
| `authority.permittedActions` | `scopes` (empty = nothing permitted) |
| `authority.authorityRef` (opaque) | `relationshipRef` + `authority: AuditAuthority` |
| "browser cannot declare its own capacity" | **Invariant 1**, stated verbatim in the source |

Our source comment, independently written:
> Invariant 1: the browser NEVER establishes the operating context. A request may *request* a context; only the server resolves one, and only by finding a current authority record. Occupation, subscription tier, URL, a remembered selector, or a client label are never inputs.

Naming is the main delta (`scopes` vs `permittedActions`, `expiresAt` vs `effectiveUntil`). InvestScape also carries `personal`, `delegated_client`, and a reserved-but-hard-disabled `organization` kind. **Proposal: adopt your field names on the wire, keep ours internal, and treat the wire contract as v1.**

### 12. Market Intelligence route parity before removing the demo path — ✅ agreed, and already our position
This matches a requirement logged on our side yesterday. Nothing will be swapped until real-route coverage, error states, loading states and output parity are proven. Noting honestly: the MI `E60-E66` routes are mounted in production but **not yet wired to serve economic-engine data**, so parity work hasn't started.

### On CORS
Agreed — explicit, never wildcarded. Currently allowlists only the WeWeb editor origin; the published domain gets added immediately before publishing, not preemptively.

---

## C. The honest blocker list

1. **No deployed browser landing route** (their #3). Everything else on the receiver side is built and tested; this is the missing piece. It needs a decision: WeWeb page, a minimal server-rendered route in `investscape-api`, or something else.
2. **Lighthouse persistence not configured in production** — no `DATABASE_URL` for the lighthouse schema on Railway. Migrations 0003-0007 exist and have been applied to the `Investscape-Dev` Supabase project, but production has nothing.
3. **Stage 1 feature flag off** by default in every environment.
4. **Key rotation plan undefined** for staging/production.
5. **Redemption path unconfirmed** — we send to `/v1/investscape/launch-sessions/redeem`; please confirm.

Items 1-3 are all required for the staging acceptance run RelOS is waiting on. None are blocked on Relationship OS.

---

## D. Roadmap items to fold into the InvestScape tracker

Per their §5, all accepted:
- Stage 1 awaits a **cross-product staging acceptance run**, not more RelOS producer development.
- Stage 2 opaque identity-linking is the next coordinated slice after Stage 1 acceptance.
- Add a **versioned analysis correction/supersession mechanism** before relying on mutable market datasets.
- Add `sourceDataAsOf`, engine version, and display-safe provenance metadata to future result contracts. *(Note: this dovetails with the 2026-09-06 source-field UI-leak bug — provenance needs a real home in the contract, not an improvised string.)*
- Define Representation-Authority Signal v1 jointly; keep distinct from delegated authority.
- Keep Stage 3 subscriptions, Stage 4 sharing, unified billing sync, and Stage 8 delegation disabled.
- Do not replace the MI demo path until real-route parity is proven.
- Prescott Valley, cap rate, DOM and absorption must keep displaying honest unavailable/proxy states rather than synthesized values.
- *(FYI only)* RelOS removed their malware-scanner service due to a 1GB Railway RAM limit; no InvestScape impact.
