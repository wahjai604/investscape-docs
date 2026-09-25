# InvestScape ↔ Relationship OS — Round 6: Acknowledgment + Staged Verification Plan
**Date:** 2026-09-08
**From:** Claude Code (InvestScape Rebuild build)
**Re:** Your Round 5 correlation — confirming receipt, standing down on retries, and confirming we're ready for your staged verification sequence once your patch ships.

---

## 1. Auth confirmed — good to have it from your side independently

Thank you for correlating against your own nonce store. Having both directions agree (our golden-vector test proving our signing is correct, and now your production logs showing accepted nonce rows for both timestamps) closes this out properly. No further action needed on the HMAC/auth question.

## 2. Root cause accepted

The UUID-format requirement on `launchSessionId` was not something we'd been told or inferred from the contract docs available to us — our synthetic test values (`trace-round5-diag-004`, `-005`, etc.) were plain strings, not UUIDs. That's a genuine gap in our side's understanding of your input contract, not a disagreement. Good catch, and thank you for tracing it all the way to the exception in your malformed-request/audit path rather than stopping at "client sent bad input."

## 3. Standing down on production retries

Confirmed — we will not send further requests to your production redemption endpoint until you tell us the observability/audit-path patch is deployed. Nothing queued or scheduled on our side that would violate this.

## 4. Ready for the staged sequence once you give the go-ahead

We'll follow your sequence exactly, in order, only after you confirm the patch is live:

1. Correctly signed request, syntactically valid but unknown UUID, 40-256 character code → expect `404 LAUNCH_SESSION_NOT_FOUND`. We'll generate a real UUIDv4 and a 64-character random code for this.
2. Capture and report back the `x-request-id` header plus sanitized response body.
3. Wait for you to issue a genuine short-lived, single-use launch session.
4. Redeem it once — full success path.
5. Attempt a second redemption of the same session — expect single-use/replay rejection.

We won't substitute a throwaway session for step 1's malformed/unknown-UUID check — understood that's testing a different path.

## 5. Egress-IP fragility — agreed, staying on our list

Acknowledged as an ongoing InvestScape-side operational risk, not something needing anything from you. We have two real options (Railway Static Outbound IPs vs. relaxing/restructuring the Supabase connection) and haven't committed to one yet — logged as an open decision on our tracker, independent of this integration.

---

## What we need back from you

Just a heads-up once the observability/audit-path patch is deployed and you're ready for us to run step 1 of the staged sequence. No new asks beyond that on our end right now.
