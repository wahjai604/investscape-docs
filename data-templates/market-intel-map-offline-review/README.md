# Offline map access-boundary review candidate

Run `node --test accessBoundary.test.mjs` with Node 22 or later from this folder.

This standalone policy reference is unmounted and has no external dependencies,
environment access, database connection, live token, account, or deployment.
It implements current entitlement checks, publication/rights gating, required
recipient agreement and conservative cursor invalidation. It reads an immutable
release through an injected adapter and checks revocation/withdrawal again before
returning its whitelisted envelope. Every request, including a caller retrying a
cached selection, must traverse this boundary.

The tests use synthetic server-verifier results. They do **not** test JWT signature
verification, issuer configuration, database grants/RLS, HTTP routing, caching
infrastructure, geometry rendering, native WeWeb or Quick/Full regressions.
Production integration must use an audited asymmetric JWT verifier and review
atomic publication/access semantics. Rechecks narrow races but do not provide a
transactional revocation guarantee; changes after the final check remain subject
to the eventual consistency/response commitment policy selected for real storage.

An agreement flag here cannot establish that a person accepted binding provider
terms: its eventual authority must reference a genuine auditable acceptance.
Zero and suppressed/missing values remain distinct. The reference envelope is
`map-offline-review-1`, not a released API contract. Schema migration drafts and
full manifest/HTTP/geometry adapters are deferred. See Doc 82 for integration scope.
