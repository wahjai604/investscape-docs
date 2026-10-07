# Portfolio map overlay contract

Status: accepted feature scope, implementation deferred.

Opt-in personal overlay distinguishes investments and developments with legend. Filter by owner portfolio, property type and status. Selecting holding opens permitted summary/Portfolio detail and linked Deal Analyzer/Dev Studio.
Reuse existing records where appropriate; schema proposal follows current payload audit. Do not invent duplicate project stores.

Only owner-authorized records enter map/API/cache responses; RLS-enabled metadata alone is not authorization proof. Test owner A/B, direct detail, viewport, comparison, cluster aggregates and account-switch clearing. Other users' holdings must not leak through counts or bounds.
Exact vs approximate location and matching confidence are explicit. Do not infer precise address from city-level information. Unmapped holdings remain in list; user correction is a future authorized write.
Keep personal holdings distinct from public market metrics and Research. Personal ownership is not an investment recommendation.
No Portfolio location/value/debt/owner labels in Community shares by default. User opt-in field selection plus audience/access checks and final preview are required in a separately implemented sharing contract. Never embed hidden fields in exported image metadata or URL.
