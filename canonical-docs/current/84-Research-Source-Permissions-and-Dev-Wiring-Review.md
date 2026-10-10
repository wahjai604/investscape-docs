# 84 — Research Source Permissions and Dev Wiring Review

**Date:** 2026-10-09 UTC. **Scope:** bounded source evidence and read-only non-secret platform metadata; source/review changes only.

Research review commit: [f937880170fb1fb500290d7e1fd4a675b53523b4](https://github.com/wahjai604/investscape-api/commit/f937880170fb1fb500290d7e1fd4a675b53523b4), branch `review/research-catalog-2026-10-09`. This follows Doc 83's foundation and records the owner's free-member access clarification. Live map acceptance remains deferred.

## Source selection and manual permissions

Eight review candidates from six publishers are recorded in `docs/review/research/initial-catalog.review.json`. The four Statistics Canada/Bank of Canada text-link proposals have current publisher terms evidence; CMHC and Metro Vancouver retain item-specific review gaps; the BC planning page/general copyright evidence is incomplete; US Census copyright policy retrieval is unresolved. The source-permissions JSON records exact official URLs and conditions.

All candidates remain rights-unknown, unapproved and unpublished. Approved catalog remains empty. No full article bodies, assets, scraped summaries or automated ingestion are included. AI stays off. Eric remains accountable for manual source selection and per-item rights/editorial approval. A public URL or verified publisher licence does not itself complete that approval.

Known publication days are supported without timezone shifts. Month-only evidence remains a private raw month label with a null public publication date. Geographic tags are qualitative relevance, not verified map/statistical boundaries. Internal review/clearance caps must not be represented as publisher licence expiry.

## Access decision

Active permanent signed-in free and paid members, including paid-to-free downgrades, receive Research browsing access without a billing entitlement gate. Anonymous, inactive and suspended accounts are denied. Editorial authority requires a separate explicit server-owned audited grant. Future staff permissions remain explicit; Community moderation is separate. This policy is recorded, while its live authority implementation remains unbound. Occupational user-profile roles and user-editable metadata cannot grant editorial access.

## Dev evidence and concrete proposal

| Component | Evidence/date | Result | Remaining uncertainty |
|---|---|---|---|
| Supabase Investscape-Dev, `hwhkgrwikczwztfnsjir` | Fresh project and scoped catalog metadata, Oct 9 | ACTIVE_HEALTHY; PostgreSQL 17.6; Research schema/three proposed roles absent | Database selection, current recovery and effective permission review |
| Scoped default ACL catalog | Fresh metadata, Oct 9 | No matching inspected entries | Does not establish all effective grants or role paths |
| WeWeb Investscape Dev, `4a0173ad-346d-4d29-a9b9-0201e5af6d78` | Fresh project/page search, Oct 9 | Accessible; no Research page found | Installed host/component and exact hosted origin |
| Railway Native Full Staging | Fresh environment metadata, Oct 9 | Existing staging service remains on `feat/native-full-api-adapter`; latest successful deployment Oct 4 | Not a Research host; environment label production does not establish launched production |
| Auth/session/editor origin | Historical reported Oct 9 evidence, carried from map checkpoints | Same Dev Auth ref and public session capabilities reported | Installed version/full host contract, hosted origin and actual Research API JWT acceptance |
| Backup | Historical owner screenshot report | Scheduled physical backup 11:16:52Z, before later map provisioning | Appropriate current recovery reference and no verified rehearsal |
| Dedicated Research entrypoint | Source inspection | Absent; router stays unmounted/default-off | Dedicated host implementation and explicit bindings |

Proposed, not selected/provisioned: separate `research_private` schema in Investscape-Dev, scoped reader/writer pools, no browser Data API, plus an isolated **InvestScape Research Dev / development / research-api-dev** Railway host. The full IDs, exact inspected scope and unresolved facts are in `dev-storage-wiring.review.json`. No environment values, connection strings or identities were inspected; no application/user tables were queried. This review does not establish a Relationship OS shared transaction domain.

Do not deploy the generic current entrypoint as a Research-only host: it also serves calculation/Lighthouse routes. Preserve the existing Quick/Full service, original HTML and unrelated checkouts.

## Verification and pending work

Typecheck/build passed. Full suite: 642 tests, 640 passed, zero failures, two existing E85 skips. Research tests: 18 passed. Actual Vue synthetic browser: 21 checks passed, including the Vancouver timezone calendar-day case. Eight strict candidate commands validated and all eight denied publication. These are offline checks, not live member/API or installed WeWeb acceptance.

Next: owner review of the four clear text-link proposals and Dev database target; implement dedicated default-off host and explicit access-authority contract; then prepare current scoped recovery/provisioning and runtime bindings. Held publishers need not block a smaller initial catalog. No database provisioning, source staging/publication, credentials/identity bindings, deployment, WeWeb publication or map activation occurred.
