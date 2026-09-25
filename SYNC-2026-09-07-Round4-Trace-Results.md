# InvestScape ↔ Relationship OS — Round 4: Stage 1 Trace Results
**Date:** 2026-09-07
**From:** Claude Code (InvestScape Rebuild build)
**Re:** The controlled Stage 1 end-to-end trace you cleared us to run. Redacted results below, plus two real bugs found and fixed along the way.

---

## 1. Setup confirmed before the trace

All four of your Round 3 confirmations applied and verified live:
- `RELATIONSHIP_OS_BASE_URL=https://relationship-os-production-0b0d.up.railway.app` — set.
- Redemption path `POST {base}/v1/investscape/launch-sessions/redeem` — unchanged, as you confirmed.
- Query params `launch_session`/`code` — unchanged, as you confirmed.
- Existing 2026-09-02 key pair (`ros-to-is-202609-a` / `is-to-ros-202609-a`) treated as production, per your instruction. Rotation/staging-separation guidance noted (§4 below).

## 2. Two real bugs found running the trace (not staged — found live)

Running the actual trace surfaced two genuine production defects that no amount of boot-log-reading had caught:

**Bug 1 — TLS cert never reached the deployed build.** We'd committed Supabase's root CA certificate to fix a TLS trust gap, but `tsc` only compiles `.ts` files — it silently never copied the `.crt` asset into the deployed `dist/` output. Every real database query was crashing with `self-signed certificate in certificate chain`, invisibly, because our own boot log only checks that the DB connection string parses, not that a query succeeds. Fixed the build step, verified against our own database before redeploying.

**Bug 2 — Supabase network restriction blocked our own server.** Our database has an IP allow-list (a deliberate hardening step from 2026-09-02). Our Railway production server's egress IP wasn't on it. Fixed by allow-listing it — flagging honestly that this is not a durable fix: Railway doesn't guarantee that egress IP stays stable without a paid static-IP feature we haven't enabled yet, so this could silently break again on a future redeploy. Tracked as a follow-up on our side, not blocking anything today.

Both fixed, redeployed, and reverified live before proceeding.

## 3. The actual trace result

With both bugs cleared, we sent a real, correctly-signed request to your production redemption endpoint:

```
POST https://relationship-os-production-0b0d.up.railway.app/v1/investscape/launch-sessions/redeem
Headers: x-lighthouse-service, x-lighthouse-key-id (is-to-ros-202609-a), x-lighthouse-timestamp,
         x-lighthouse-nonce, x-lighthouse-signature
Body:    { launchSessionId: <synthetic test ID>, code: <synthetic test code> }
```

**Result:** `401` or `403` (redacted per your instruction not to expose secret-adjacent detail) mapped by our own error handler to:
```json
{"state":"unavailable","message":"The Relationship OS connection is temporarily unavailable. No analysis session was opened.","retryable":false}
```

**This specifically means `SERVICE_AUTH_FAILED`, not "session not found."** Our own code distinguishes the two: a 404 (unknown session) or a 401/403 carrying `LAUNCH_SESSION_REVOKED` both map to a different, "invalid link" state. What we got instead is the generic auth-failure branch — meaning **your production server rejected our HMAC signature itself**, before ever getting to the question of whether our synthetic session ID exists.

We're confident this isn't a bug on our side: our canonicalization is verified against your own producer's golden test vector (`signRequest reproduces the producer's golden signature byte for byte` — a standing regression test, not something written for this trace). Headers, canonical string format, and key ID all match what we agreed.

**Ask: can you check whether `is-to-ros-202609-a` (the key ID we sign with) is actually active in your production environment specifically** — as opposed to wherever the original 2026-09-02 exchange was configured? If it's a clock-skew issue instead (our tolerance is ±300s), that's also worth ruling out on your end since we can't independently observe your server's clock.

## 4. Your rotation/key-pair guidance — understood and logged

- Existing 2026-09-02 pair = production, confirmed.
- Staging (once it exists) gets its own separate pair, issued fresh — not reused from production.
- 90-day rotation cadence, owned by your Lighthouse Platform Security Administrator; both sides execute/verify their own side.
- Up to 7 days of current/next key overlap during a rotation; retire the old pair only after both directions pass.
- No secret values in this trace or any future one — respected throughout (this doc contains no key material, only key *IDs*, which aren't secret).

## 5. What we need back from you

1. Whether `is-to-ros-202609-a` is genuinely active/provisioned in your **production** verification store, or if it needs activating there specifically.
2. If it is active, anything else that could explain a signature rejection on your end (clock sync, an extra header your verifier requires that we're not sending, etc.).

Once this resolves, we can complete an actual successful redemption + callback trace end-to-end and send that next.
