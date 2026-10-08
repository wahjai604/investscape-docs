# Phase 4 — proposed read contracts v0.1

All operations below are design-only operation names, NOT existing URLs or implemented routes. Request validation and authorization occur before filtering, paging, aggregation or cache lookup. Final endpoint paths, numeric caps and persistence require a separately authorized implementation proposal.

## Common request and envelope

Request fields: contractVersion, requestId, canonicalGeographyIds (typed authority/type/vintage/source ID), viewport {west,south,east,north}, zoom, requestedLayers, observationPeriod, metricIds, cursor, pageSize. No caller-supplied owner ID accepted as identity. Antimeridian handling and supported bounds explicitly validated; no silent swapping/clamping. Bound page/geometry/area/metric counts before implementation. Geographic type/vintage mismatches return a validation or explicit comparability result, not a guessed join.

Response: contractVersion, requestId, generatedAt, snapshot {publicationGeneration, boundaryVersion, metricRevision, evidenceRevision}, status (ok/empty/partial/unavailable), perLayerStatus, items, nextCursor (opaque or null), notices. One truly consistent snapshot or explicit revisionVector/consistency= mixed; do not claim atomic consistency for independently read layers. Units, definitions, observation dates and publication/review dates remain distinct. Unknown is null with a reason; no synthetic fallback in live mode.

| Proposed operation | Output | Critical rule |
| --- | --- | --- |
| geography.search | Typed IDs, names, parent/context relationships, supported display/analysis versions | Text labels do not authorize crosswalks; CSD/CMA/state/local area distinct |
| map.boundaries | Geometry or authorized asset references, bounds, source ID/version, attribution, simplification profile, displayOnly | Only cleared artifacts; direct asset access enforces the same audience/rights restrictions |
| market.observations | Metric ID, value/null, unit, currency, period, geographic ID/vintage, definition/method/source, observed/derived/estimated label, uncertainty and freshness | Zero differs from missing; source-engine result can be fixture/stale/unavailable, not automatically a live observation |
| research.search | Approved published summaries or link-only metadata, exact/wider geographic match type, source/author/rights/audience, dates/freshness, nextCursor | Filter approval/publication/rights/audience before pagination; no hidden items, audit IDs, hidden totals or snippets |
| research.detail | Same authorized fields, permitted summary or original-source link | Recheck direct detail access against current generation. Draft/withdrawn/withheld/inaccessible/missing indistinguishable unavailable response |
| portfolio.map | Owner-authorized investment/development IDs, permitted display labels, exact/approximate/unmapped location and appropriate minimized fields | Session-derived identity, no arbitrary owner parameter, no financial details by default; absent location remains unmapped |
| geographic.compare | Side-by-side observations, approved evidence, comparable/limited/not-comparable per metric and reasons | Percentage change only compatible definitions; FX conversion is not affordability; per-person/household denominators and formulas disclosed |
| ai.evidence.read | Authorized response fields, citations, revision vector, comparability warnings, coverage/missingness | Same underlying authorization/rights as UI. No privileged AI retrieval path or automatic investment score |

## Research rights and matching

summary-permitted: only permitted curated summary, not full source text unless separately licensed. link-only: no summary/full text/snippet/embedding-derived substitute. withheld/unknown rights: no member payload until resolved. Publication audience unresolved: live public mode remains disabled; member delivery also waits for catalog/editorial approval. Primary/secondary/Lighthouse evidence labelled; overlap/dedup by canonical source and item/version, not fabricated independent corroboration. Exact geographic evidence and wider provincial/state/country context remain separate and labelled; no statewide item pretends to be city-specific. Arizona/Texas local markets remain unselected.

## Error/state contract

| Situation | Proposed HTTP/response treatment |
| --- | --- |
| Valid search with no approved matches | 200 empty items, null cursor, explicit empty state |
| Next page | 200 bounded items and cursor tied to filter/snapshot/audience; reject expired or incompatible cursor rather than blend generations |
| Hidden/missing/withdrawn detail | 404 generic unavailable, no existence leakage |
| No valid session | 401; clear private UI/cache and stop private reads |
| Known caller lacks operation-level permission | 403; hidden individual records still generic 404 |
| Invalid bounds/IDs/request/cursor | 400 sanitized validation error |
| Request/workload cap reached | 429/explicit bounded-limit state; Retry-After only where established |
| Dependency unavailable | 503/partial per-layer state; never masquerade as empty or retain stale sensitive layer |
| Original publisher link unverified/broken | Distinct linkStatus=unknown/broken/available with checkedAt; app availability does not prove link health |

Cursor and cache revision invalidation must preserve direct-access denial on withdrawal. Signed asset links expire and are not instantly retractable solely by a metadata update; choose mediated/private delivery where immediate revocation is required. No unlimited lifetime promised. Do not expose internal provider errors, credentials or stack traces.

AI cross-module read operations require separate module capability mapping to real authorized sources. Map/evidence envelope is one input to the InvestScape-wide assistant, not implementation of the assistant. Comparisons are explanatory and cite source/geography/period limitations. AI cannot silently write a deal, transfer inputs, publish Community content or bypass source rights. No article ingestion, embeddings or AI model call implemented.
