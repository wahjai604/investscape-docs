# Phase 4 — sequential implementation and acceptance plan

Phase 4 completes the integration design, not the live implementation. Follow these bounded work packages in order after required decisions/authorization. No new E number assigned to the map UI or a replica worker.

| Order | Work package | Entry gate | Completion evidence |
| --- | --- | --- | --- |
| 1 | Read-only live inventory | Available InvestScape-specific connector/account access | Pin API deployment/source/package versions, WeWeb ribbon/component state, actual holding/project locations, Supabase auth/grants/RLS/storage configuration; avoid dumping row data or secrets |
| 2 | Finalize adapter mappings and logical records | Inventory plus geography/provenance decisions | Canonical-to-E61 IDs, E66 output fields/freshness, existing holdings read source, Research catalog/owner/audience/rights; explicit unavailable gaps |
| 3 | Prepare isolated read-service candidate | Explicit API implementation authorization; safe source cohort | Authenticated read adapters, bounded queries, filtered Research list/detail, direct-denial and revision rules. No new persistence inferred from calculation routes |
| 4 | Prepare any necessary schema/storage proposal | Demonstrated need and separately authorized schema scope | Reviewed migration/policy/asset-delivery proposal with rollback and isolation; only then apply under explicit authorization. Reuse dev_studio_projects only for suitable authorized development records, not arbitrary Research/Portfolio storage |
| 5 | Build unpublished WeWeb integration | Explicit Investscape Dev draft-edit authorization and selected renderer/provider plan | Main-ribbon component, accessible evidence panel, cancellation and identity clearing, real permitted payloads with fixtures disabled in live mode |
| 6 | Isolated staging deployment/integration tests | Explicit staging deployment authorization; candidate source reviewed | Commit/package/config pin; auth, owner isolation, publication lifecycle and end-to-end evidence; no repeat deployment without outcome verification |
| 7 | Capacity/provider/device review | Real payloads, coverage and workload assumptions | Viewport loading and cache/queue behavior, DB pooling, p95/p99 and failure rates, GPU/phone/WAN benchmarks and provider quota/rights fit |
| 8 | Release review | All required evidence and explicit production/publication approval | Concrete reviewed release and rollback plan; production deployment/WeWeb publication remain separate final actions |

## Acceptance ledger (all future unless stated)

- GEO: typed ID/vintage roundtrip; city vs CMA; ambiguous shared edges/overlaps; no match; polygon holes; no inferred parcel/zoning precision; same-vintage crosswalk/coverage when analytical joins required.
- QNT: zero/missing and observed/derived/estimated; units/definition/source/date; stale/unavailable engine coverage; no fixture substituted as observed. Comparable growth, currency/FX caveats and denominator/period disclosure.
- RES: approved only across list/detail/assets/AI; draft/withdrawn/unknown rights unavailable; link-only text absent; audience transitions; pagination generation invalidation; empty/error/broken-link states distinct; audit preserved internally.
- PVT: owner A/B direct read-denial including guessed IDs, viewport queries, private assets, view/function paths and caches; expired/invalid session; account-switch late response; exact/approx/unmapped; default off. Prototype mock isolation does not close this gate. Prior Quick/Full Account B update denial remains unverified and separate.
- NAV: ribbon return preserves permitted UI state; side/pin/expanded preferences; hidden map teardown; no background activity; no silent module transfer or project overwrite.
- AI: UI-equivalent permission and item rights; cited periods/geographies/definitions; missing/conflicting evidence; mixed snapshots disclosed; withdrawal and account-change context clearing; no automatic writes or scores.
- UX: 320/390/desktop light/dark, keyboard/focus/reader/touch; real-device verification and humane failure/retry feedback.
- OPS: bounded request sizes/rates, worker backpressure and durable claims, shared-cache invalidation, DB connection limits, provider restrictions, sanitized telemetry. Numeric production budgets must be decided from evidence, not copied from loopback prototype.

Phase 3 assistant-run 45 checks validate the isolated revision-2 prototype only. User reports local Windows preview working after restart; exact prior failure cause unknown. Neither constitutes live WeWeb/API/Supabase end-to-end acceptance.

## Decisions still needed

Named editorial/rights owner; approved source items and permitted audience; actual Portfolio persistence source/location fields; canonical local-area IDs and overlap/crosswalk policy; provider/geocoder and Community-export rights; auth revocation expectation and publication-revocation bound; workload/SLO/cost targets; actual staging and draft integration permissions when implementation is ready. No passwords/tokens requested in chat.

Independent progress: Market Intel quantitative browsing can expose honest unavailable Research status; Research may launch standalone search only when its own gates close. Community is not required for either. E85, E87/E88 readiness and broader engine work remain separately gated. Quick/Full acceptance and cleanup work in other threads are not modified by these deliverables.
