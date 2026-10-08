# Phase 4 — system responsibilities and scaling

Proposed architecture, not provisioned services or an approved schema.

| System | Work performed | What is stored / served |
| --- | --- | --- |
| Railway API | Verify caller identity and current module permissions; authorize each read; normalize query; assemble bounded map/evidence responses | Stateless request coordination; no user-specific results in shared public cache |
| Railway background worker, separately provisioned later | Acquire permitted sources, validate provenance, reconcile IDs, preprocess geometry and publish approved immutable versions | Durable job state belongs in an authorized store; worker local disk is not the canonical durable archive |
| Supabase Postgres | Governed geography/provenance/metric/evidence metadata and existing authorized project/holding records where suitable | Logical records, ownership and publication lifecycle. Exact tables/columns/extensions not designed or changed here |
| Private Supabase Storage or other approved object store | Retain permitted originals, derived display artifacts and review provenance | Separate private/internal from genuinely public approved artifacts. Public buckets are not access-controlled per object through download RLS |
| WeWeb client | Ribbon/navigation state; selected geography; layer switches; sidebar position/pin; cancellation; accessible panels and map rendering | UI preferences can be local; private evidence/holdings stay in memory and clear on identity/permission change |
| Licensed tile/geocoding provider | Basemap delivery; address matching if separately approved | Provider-defined caching, coordinate retention and export rights; neither Railway nor Supabase automatically grants those rights |

Proposal: use the existing API as the single authorization boundary for Research and holdings reads. Prefer caller-scoped DB access when supported; if privileged credentials are required server-side, enforce explicit ownership/permission checks and review bypass risks. Exposing a schema, granting access and row authorization are distinct. Review views/functions/grants as well as tables. Never send secret/service-role credentials to WeWeb. Do not use editable user_metadata for authorization. Choose JWT validation through the supported existing verifier; signing mode and revocation policy require operational evidence, not invented JWKS assumptions.

## Workload separation

Engines are logical reusable code, not a single occupied machine. Multiple API replicas can call the same code concurrently. Long ingestion/geometry jobs run in worker queues so user browsing does not wait for source collection. Do not create duplicate engine numbers for user cohorts. Stateless API replicas plus durable shared versions/jobs allow horizontal scaling; per-process caches cannot be correctness authorities.

Clients request viewport/zoom/layers and chosen geographic IDs. Server applies bounded filters and sends simplified display geometry or approved tiles suitable to zoom. Canonical analysis geometry remains separate. Shared geometry/approved observation caches key on dataset/version/query scope; holdings are caller-scoped, preferably no-store. Broad/global downloads and ingestion on every map pan are excluded. Include geometry simplification error/scale metadata and avoid using render geometry for property-area calculations.

No arbitrary throughput claim for 100,000 users: define concurrent active users, pan/selection rates, payload size, coverage, cache hit rates, worker arrival rates and provider quotas before load modelling. Select response/queue/timeout and payload limits from measurements; numeric budgets remain unset. Inspect Railway and Supabase plan limits/current deployment before choosing replicas, connection pools or job delivery semantics. Do not scale by opening an unbounded database connection per map/engine call.

Rights withdrawal is an authorization/publication event, not just cache TTL expiry. Separate immutable internal audit versions from member-visible snapshots. Publication generation must gate serving cached member content; revoke client-visible entries and recompute AI responses when an evidence revision is withdrawn. Publicly downloaded content cannot be recalled—public publication policy must acknowledge this before public access is enabled. Provider basemap cache remains distinct from InvestScape evidence cache.
