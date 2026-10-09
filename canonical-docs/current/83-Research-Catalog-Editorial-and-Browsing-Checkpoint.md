# Research catalog, manual editorial workflow and browsing — 2026-10-09

## Outcome and scope

The owner deferred live map testing/activation and authorized continuing Research independently: approved catalog/manual editorial workflow, followed by read-only browsing. Research source is now implemented and verified offline. No live Research item is approved or published; content rights and runtime bindings remain pending.

- API source: `wahjai604/investscape-api`, isolated branch `review/research-catalog-2026-10-09`, commit `d8ca45071781a06a8aecd8686ad16f391d112b01`.
- [Editorial workflow and implementation guide](https://github.com/wahjai604/investscape-api/blob/d8ca45071781a06a8aecd8686ad16f391d112b01/docs/review/research/README.md).
- [Candidate intake template](https://github.com/wahjai604/investscape-api/blob/d8ca45071781a06a8aecd8686ad16f391d112b01/docs/review/research/candidate-template.json).
- [Disabled runtime review](https://github.com/wahjai604/investscape-api/blob/d8ca45071781a06a8aecd8686ad16f391d112b01/docs/review/research/runtime-review.json).

## Controlling decisions

Document 79's owner answers, recorded 2026-10-08 and freshly reread 2026-10-09, establish member-only Research and Eric Tse as accountable editorial/rights owner. Only rights-cleared summaries or source links may be served. Research is independent of quantitative storage and map approvals. Search/detail enforce the same visibility/rights boundary; future AI retrieval must also enforce per-item AI permission. Older exact D-R-1–D-R-3 text was not recovered here; no blanket closure of those older gates is claimed.

## Built and verified as source

| Component | Behavior |
|---|---|
| Catalog contract | Strict metadata/rights fields, nullable unknown dates, attribution, summary/link-only, review and rights expiry; no article-body field |
| Private store proposal | Five forced-RLS tables; separate unprivileged NOLOGIN owner/reader/writer roles; reader cannot see drafts/evidence/audit; audit append-only for writer |
| Manual editorial operations | Stage, inspect exact stored revision, approve, publish and withdraw; stale revision/state rejection; publication and audit atomic |
| Corrections/withdrawals | Prior active item remains while a correction is staged; withdrawal removes the entire active item and preserves audit |
| Member reads | Bounded search, geography/topic filters, pagination and direct detail; no draft/withdrawn/expired-rights/overdue-review content; opaque unavailable responses |
| API composition | Independent permanent-member JWT verification plus fresh server-owned access authority; read/editor default off; no startup mount or shared credential discovery |
| WeWeb source component | Read-only list/detail/source links; escaped text; no direct database or storage path; default-off/editor-mode denial; session/account-change clearing |
| Visible snapshots | Cleared after at most 30 seconds or earlier validity expiry, on host invalidation/session expiry or hidden tab; no instantaneous cross-browser push claim |

## Assistant-run verification

Fresh final source checks on 2026-10-09: typecheck/build passed. Full API suite: 640 tests, 638 passed, zero failures, two existing E85 evidence-dependent skips. The 16 Research tests cover real synthetic signed JWTs, reader/writer database permissions, rights/publication boundaries, revision conflicts, rollback, withdrawal, request limits and client invalidation. Actual Vue SFC/style compile and synthetic Chromium rendering: 20 checks passed, including light/dark widths 320/390/768/1100. No actual installed-WeWeb/member/runtime acceptance is implied. All 22 API paths were read back exactly at the saved commit; change scope is confined to new Research source/UI/review files.

## Pending before Dev activation

1. Initial source list and per-item usage/AI rights evidence. The approved catalog is empty; synthetic fixtures do not establish content clearance.
2. Select authoritative Research database/schema and review the scoped provisioning/recovery package. `catalog-schema.review.sql` has run only in disposable local PostgreSQL; it is not a live Supabase migration.
3. Bind permanent-member access and Eric's editor identity through a server-owned policy; future staff grants must be explicit and audited. No real identity binding or role assignment was performed.
4. Verify separate API host, hosted app/API/editor origins, actual JWT/key and installed session-host compatibility, scoped connection/TLS and effective permissions. No Quick/Full database URL or map authority is assumed.
5. Eventual authorized deployment and WeWeb component registration/placement/publication, followed by real member/editor and withdrawal/snapshot acceptance. Runtime review remains default off and not ready to deploy/activate.

No Supabase mutation, Railway deployment, WeWeb publication, live article ingestion, E85 release, map activation, original HTML edit or Relationship OS/unrelated work change occurred. Map verification remains deferred, not completed.
