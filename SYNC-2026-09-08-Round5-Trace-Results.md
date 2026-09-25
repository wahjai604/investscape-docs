# InvestScape ↔ Relationship OS — Round 5: Stage 1 Production Trace Results
**Date:** 2026-09-08
**From:** Claude Code (InvestScape Rebuild build)
**Re:** Your confirmation that Relationship OS production was corrected/redeployed (`INVESTSCAPE_SERVICE_SHARED_SECRET` installed, matching our existing `LIGHTHOUSE_SVC_OUTBOUND_SECRET`). We reran the same signed redemption request from Round 4 against your production endpoint. New result below — no longer an auth rejection, but a different, concrete finding.

---

## 1. HTTP response status and sanitized response body

Two independent samples, each confirmed live via our own temporary redacted diagnostic log (status + error code only — no headers, no body, no secret material — added, used, then reverted the same session; commits `51067b4` → `5dd9a4f`):

```
Sample 1 — 2026-09-08T07:06:24Z
[stage1-diag] redemption non-ok response: status=500 code=INTERNAL_SERVER_ERROR

Sample 2 — 2026-09-08T07:16:08Z
[stage1-diag] redemption non-ok response: status=500 code=INTERNAL_SERVER_ERROR
```

Both requests were correctly signed, well-formed, sent to your production endpoint, and returned identically.

## 2. Whether HMAC authentication succeeded

**Yes — this is the headline change from Round 4.** Round 4 returned `401`/`403`, which our client maps to `SERVICE_AUTH_FAILED` (auth rejected before your server evaluated the request body). This trace returns `500` with `code:"INTERNAL_SERVER_ERROR"` — a different status class entirely, and our client's status-to-state mapping treats `5xx` as a server-side fault, not an auth failure. **We read this as your server accepting our signature and failing afterward**, not rejecting the request at the auth layer. We cannot independently confirm this from the client side alone (we don't have visibility into whether your server's auth middleware runs before or after the code that's erroring) — flagging it as our best read of the evidence, not a certainty.

## 3. Whether the launch session was redeemed successfully

No. Both attempts used a synthetic `launchSessionId`/`code` pair that was never issued by your system (`trace-round5-diag-004`, `trace-round5-diag-005`, plus two earlier untagged samples in this same session — `trace-round5-synthetic-001`, `trace-round5-live-002`/`003`). No real session exists to redeem. The `500` occurred before any indication of session-lookup succeeding or failing, so we can't tell whether your server got as far as checking session validity.

## 4. Request and audit correlation IDs

None available to report. Our client's `500`-mapping path does not carry a correlation ID in either direction — your response body's `code` field was the only structured content we captured, and it was `INTERNAL_SERVER_ERROR`, not a correlation/trace ID. If your server logs one internally for this error class, that would be the fastest way to find the matching event.

Our own side's request IDs (Railway edge, not RelOS's), for your reference if useful:
- Sample 1: `-K4dYN8AQI-uc_vtH4GxDA` (07:06:21 UTC — first attempt after diagnostic deploy; this one also hit an unrelated infra crash on our own audit-write, see §7)
- Sample 2: `vNiUnM0vSzyq_AFKPvyhXg` (07:16:08 UTC — clean sample, no crash)

## 5. Timestamp and observed clock difference, if available

No clock-skew signal available. A `401`/`403` with a skew-specific error would have told us something about clock drift; a `500` doesn't. Our own clock at request time (both samples) was NTP-synced UTC via standard OS time sync — no reason to suspect drift on our side, but we have no way to observe yours from here.

## 6. Whether nonce/replay protection was recorded

Unknown from the client side. A `500` gives no signal either way — we can't tell whether your server got far enough to check/record the nonce before failing, or failed earlier in the pipeline.

## 7. Any remaining contract mismatch, including exact field or header names

None identified — no change from what Round 3/4 already confirmed (headers, canonicalization, `launch_session`/`code` param names, redemption path). Nothing about this result points at a contract mismatch; a `500 INTERNAL_SERVER_ERROR` reads as an implementation-level fault, not a spec disagreement.

One unrelated thing surfaced on **our own side** mid-trace, not a contract issue but worth disclosing for completeness: our first post-deploy attempt (`-K4dYN8AQI-uc_vtH4GxDA`) got your `500` correctly, then crashed a second time on our own infrastructure — Railway's egress IP had changed after our redeploy (from `162.220.234.16`, allow-listed after Round 4, to a new `152.55.180.233`), so our own audit-write to our own database failed. We allow-listed the new IP in our Supabase project and reran the trace cleanly (Sample 2). This confirms the fragility we flagged in Round 4 §2 — Railway's default egress IP is not guaranteed stable across redeploys — and is purely an InvestScape-side operational risk, unrelated to your `500`.

## 8. If successful, the resulting InvestScape landing route and whether `launch_session`/`code` were handled as expected

Not applicable — redemption did not succeed.

## 9. If unsuccessful, the precise sanitized error code and the next evidence needed from Relationship OS

**Error code:** `500` / `INTERNAL_SERVER_ERROR`, reproduced twice, from a well-formed, correctly-signed request to `POST {RELATIONSHIP_OS_BASE_URL}/v1/investscape/launch-sessions/redeem`.

**What we need from you:**
1. Your server-side log/trace for a `500 INTERNAL_SERVER_ERROR` on `/v1/investscape/launch-sessions/redeem` around **2026-09-08T07:06:24Z** and **2026-09-08T07:16:08Z** — the actual exception/stack trace behind that generic code.
2. Confirmation of whether your auth middleware runs before or after the code that's failing (i.e., did our signature actually verify, or is this error masking an auth-layer problem with a generic 500 instead of a 401/403?).
3. Whether a synthetic/unknown `launchSessionId` against a freshly-redeployed environment could itself be triggering this (e.g., a lookup against a table/row that doesn't exist yet in your redeployed instance) — if so, a real (even single-use, throwaway) session ID from your side would let us confirm a clean success path exists at all before you dig further into the 500 itself.

---

## What changed since Round 4 — summary for the record

- Round 4 (2026-09-07): `401`/`403` → `SERVICE_AUTH_FAILED`. Asked whether `is-to-ros-202609-a` was active in your production verification store.
- You corrected/redeployed Relationship OS production, installing `INVESTSCAPE_SERVICE_SHARED_SECRET` (matching our existing outbound secret, no rotation).
- Round 5 (2026-09-08): `500`/`INTERNAL_SERVER_ERROR`, reproduced twice. Auth rejection is no longer occurring; a different, server-side fault is now the blocker.

No secret values appear anywhere in this document — only key IDs (not secret) and sanitized status/error codes, per your original evidence-handling instruction.
