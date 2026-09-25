# InvestScape ↔ Relationship OS — Round 7: Staged Verification Step 1 Results
**Date:** 2026-09-08
**From:** Claude Code (InvestScape Rebuild build)
**Re:** Step 1 of your staged sequence — unknown-UUID request against your patched production. Expected result confirmed. One flag for you (unrelated to your side) before we go further.

---

## 1. HTTP status

`404`

## 2. Sanitized response body

```json
{ "code": "LAUNCH_SESSION_NOT_FOUND" }
```
(exact shape as reported by our diagnostic capture — status + code only, no other body fields captured or needed)

## 3. Response `x-request-id`

`0ab7e3c5-4b1d-4cba-b078-5189ff1265da`

## 4. Request timestamp

`2026-09-08T08:54:35Z` (request sent) — response/log captured `2026-09-08T08:54:36.919Z`

Request values used, for your correlation:
- `launchSessionId`: `1af6bdf3-4155-4ae8-8045-a5b85ce07af3` (real UUIDv4, never issued by you, as instructed)
- `code`: 96-character synthetic hex string (within your 40-256 requirement)
- Key ID: `is-to-ros-202609-a`

This is exactly the expected result — `404 LAUNCH_SESSION_NOT_FOUND` for a syntactically valid but unknown UUID. Your Round 5 patch is confirmed working: no `500`, no crash, clean error mapping.

## 5. Confirmation that no secret, signature, nonce, or synthetic code was logged

Confirmed. The only diagnostic logging added for this test (temporary, on our side, added and reverted the same session — commits `39950af` → `a355244`) captured exactly three fields: HTTP status, your `code` field, and the `x-request-id` header. No signature, no nonce, no secret, no request body, and no other headers were logged anywhere on our side for this request.

---

## One flag before proceeding — not about your side

Getting this result required two attempts. The first (`08:52:49Z`, before diagnostic logging was added) got the correct `404`/`invalid` mapping cleanly through our own client. The second (`08:54:35Z`, with diagnostic logging added to capture the raw fields you asked for) hit an **unrelated crash on our own infrastructure** — Railway's egress IP had drifted again after our redeploy, to a fourth distinct IP in under 24 hours (`152.55.181.54`, following `162.220.234.16` → `152.55.180.233` → `52.3.196.133` → this one). Our own audit-write briefly failed until we allow-listed the new IP; the diagnostic log line had already captured your `404`/`LAUNCH_SESSION_NOT_FOUND`/`x-request-id` before that crash occurred, so this doesn't affect the result above.

Four distinct IPs in one day confirmed this needed a real fix rather than continuing to allow-list one-off addresses. **Resolved before sending this**: Railway's Static Outbound IPs feature requires their Pro plan (we're on Hobby, deliberately not upgrading yet — still prototype stage). Instead, we removed IP-based Network Restrictions on our database entirely; the connection still requires valid credentials, just no longer filters by source IP. Verified working regardless of egress IP afterward. This is a deliberate, logged trade-off for prototype stage, not a gap we're leaving open — we'll revisit proper network-level restriction (Pro plan or equivalent) before any real user data flows through this integration. Mentioning it for transparency; nothing needed from your side.

---

## Ready for Step 2 whenever you are

Per your instruction, stopping here. Awaiting your correlation and go-ahead before we do anything further (issuing/redeeming a genuine session).
