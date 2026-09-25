# InvestScape ↔ Relationship OS — Round 3 Sync
**Date:** 2026-09-07
**From:** Claude Code (InvestScape Rebuild build)
**Re:** Your Round 2 reply — landing route is now built and live; here's what's left before your Stage 1 staging acceptance run can actually happen.

---

## 1. `INVESTSCAPE_LAUNCH_BASE_URL` — here's the real value

```
https://investscape-api-production.up.railway.app
```

Route: `GET /relationship-os/launch` — confirmed live in production today (2026-09-07), verified via direct HTTP request, `200` with the correct `Content-Type: text/html`.

What it does: reads `launch_session` and `code` from the query string, scrubs both from the address bar via `history.replaceState()` **before any async work** (never touches localStorage/sessionStorage/console), then `POST`s `{launchSessionId, code}` to `/v1/lighthouse/launch/redeem` at the same origin. Renders one of the 7 states your `mapRedemptionFailure` already defines (`loading`/`invalid`/`expired`/`consumed`/`unavailable`/`error`/`success`) — we built to your existing contract, not the other way around.

One implementation note in case it matters for your redirect construction: we expect the URL shape `{base}/relationship-os/launch?launch_session={id}&code={code}`, i.e. `launch_session` (with underscore), not `launchSession` or `launch-session`. Flag it if your producer names the param differently.

Right now this route will show `unavailable` for every real link, honestly — see §3, everything on our side is configured except `RELATIONSHIP_OS_BASE_URL`, which is the one thing left blocking a real end-to-end attempt.

---

## 2. Confirm our outbound redemption path

We call `POST {RELATIONSHIP_OS_BASE_URL}/v1/investscape/launch-sessions/redeem`. This was derived from your implementation during the original build, not restated in your last reply — **please confirm this is still correct**, or send the actual path if it's changed since.

---

## 3. What's left before your acceptance run — split by who unblocks it

We audited exactly what's still missing, and split it by whether it needs your input or is purely ours to configure:

**Correction to an earlier draft of this doc:** we initially wrote this section as if HMAC key exchange were still an open question. It isn't — it was already done, on 2026-09-02, before this whole sync thread started. Two independent 32-byte secrets (`ros-to-is-202609-a` for your calls to us, `is-to-ros-202609-a` for our calls to you), mirrored into both sides' gitignored env files at the time, with Eric's explicit authorization. We just hadn't re-checked that history before drafting this doc. Sorry for the noise if you'd already started planning around "how do we exchange a key" — that part's done.

### 3a. Ours alone — done, confirmed live 2026-09-07
- **`DATABASE_URL`** for the lighthouse Postgres schema — set. Not new infrastructure: migrations 0001-0007 (lighthouse) already live in the same Supabase project (`Investscape-Dev`) that backs the live `investscape.*` schema WeWeb uses today.
- **`LIGHTHOUSE_FF_STAGE1_LAUNCH_RECEIVER=true`** — set.
- **Real 2026-09-02 HMAC key material now actually in Railway.** Turned out the variables that were already there were `.env.example`'s literal placeholder text (`is-to-ros-YYYYMM-a`, not the real `is-to-ros-202609-a`) — a human on our side copied the real values from the local `.env` directly into Railway.

Confirmed via the live production boot log:
```
🔒 lighthouse: mounted · persistence=postgres · sessions=unconfigured · enabled flags=lighthouse.stage1_launch_receiver
```
`persistence=postgres` and the flag being listed both confirm this took effect — not just that variables were saved. The `/v1/lighthouse/launch/redeem` endpoint currently still answers `503 {"state":"unavailable"}` for any real request, which is correct and expected: that's the redemption client's `unconfigured` outcome, because `RELATIONSHIP_OS_BASE_URL` (§3b) is the one thing still missing. Once that's set, this should be a live, working outbound call using keys already in place.

### 3b. Needs coordination with you — this is now the entire remaining gate
- **`RELATIONSHIP_OS_BASE_URL`** — your production (or staging, if that's what this acceptance run targets) base URL for us to call. Still genuinely unset on our side.
- **A formal rotation cadence for the existing key pair.** The mechanism supports it (`_NEXT_` variants, cut over, retire old) but no rotation has actually happened since the initial 2026-09-02 issuance, and there's no defined cadence or ownership for who initiates it. Also want to confirm: does your side want staging and production to use separate key pairs from what's already issued? We'd recommend yes, so a staging leak can't touch production — but that means issuing a second pair, which needs the same kind of explicit authorization the first one got.

We don't have direct Railway/Supabase dashboard access on our side automation-wise — 3a needed a human on our team to actually click it, but is done now. 3b is the only thing left standing between us and your acceptance run.

---

## 4. Everything else from your Round 2 reply — no open questions, just confirming receipt

- HMAC header/canonicalization: confirmed already matching (`x-lighthouse-*`) — no change needed on our side. Please correct `INVESTSCAPE_LAUNCH_GATEWAY_V0.1.md`'s `X-Service-*` wording so the next implementer doesn't hit what we hit.
- Superseding: confirmed nothing needs it — zero completed analyses exist anywhere (Stage 1 has never been enabled). Happy to design the versioned correction/supersession contract jointly whenever you want to start — not urgent given the above.
- Representation-Authority: agreed on adopting your field names (`operatingContext`/`authority`/`permittedActions`/`effectiveUntil`) on the wire contract, keeping our internal naming (`scopes`/`expiresAt`) as an implementation detail behind it.
- `null` cap rate + proxy labeling requirement: agreed, already how we built it.
- MI demo-path parity requirement: agreed, matches what we'd already decided independently.
- CORS: agreed, staying explicit, will add WeWeb's published domain only once WeWeb is actually published.

---

## 5. What we need back from you

1. Confirm or correct the redemption path (§2).
2. Confirm the `launch_session`/`code` query param names (§1).
3. Whether staging and production should get separate key pairs from the existing 2026-09-02 issuance, and who owns initiating a rotation cadence going forward.
4. `RELATIONSHIP_OS_BASE_URL` for whichever environment this acceptance run targets.

Once 3b is settled, we can run the actual end-to-end trace your Round 2 reply asked for (issuance through Relationship 360 callback display) and send it back.
