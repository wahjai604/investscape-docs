# Phase 4 — capability and evidence matrix

Design-only review, 2026-10-07 Vancouver. Phase 3 prototype implementation authorization does not authorize live module implementation, schemas or deployment. Relationship OS excluded.

Pinned API tree: wahjai604/investscape-api, feat/native-full-api-adapter, 2cec0ab519513a34aabbad909c4f24b1472d385c. Docs starting head: 7ef07c2682933d5bb40ceef8c782bd0633bc0eb8 on docs/geographic-evidence-framework-2026-10-07. Four files read at exact API commit, not default branch.

| Capability | Assistant-verified evidence this pass | Integration disposition |
| --- | --- | --- |
| Main API registry | src/routes/index.ts mounts E60–E66 Market Intel and named E86 CRE route | Reusable calculation seam; mounting is not live data or deployment evidence |
| Snapshot/benchmark orchestration | src/routes/market-intelligence/E66-service.ts exposes POST neighborhood-snapshot and benchmark-neighborhood-metric using validated inputs and engine functions | Adapter candidate; source freshness, geographic coverage and installed engine provenance still need reconciliation |
| Geography reconciliation | src/routes/market-intelligence/E61-geography.ts wraps/unwraps region/city/neighbourhood identifiers | Not a boundary/viewport/vector-tile service; requires explicit canonical-to-engine ID mapping |
| Portfolio calculation | src/routes/E10-portfolio.ts POST /calculate/portfolio calls rollupPortfolio with caller-supplied properties | Not authorized stored-holdings retrieval; do not infer persistence or geographic positions |
| Research | No Research router in the reviewed main registry | Proposed read service; approved catalog, editorial owner, audience and item rights remain blockers |
| Map client | Phase 3 revision 2 source and prior assistant-run 45 checks | Working isolated fixture prototype; no live WeWeb component or backend integration demonstrated |
| Auth/storage/RLS | Official Supabase JWT, RLS and Storage docs reviewed | Live project configuration, signing mode, holdings schema, grants and policies not queried in this pass |
| Railway staging | Earlier isolated staging success recorded in handoff at 2cec0ab | Historical evidence only; no current deployment/configuration/runtime inspection |
| WeWeb shell | User reports revision 2 local preview works after restart | User-reported Windows result; not WeWeb draft integration or physical-mobile acceptance |

Do not convert earlier prototype timing, mocked owner isolation or route presence into production capacity, RLS or data-feed readiness. No new runtime tests run in Phase 4.
Canonical registry remains E85 Zoning, E86 CRE foundation, E87 Cap Rate, E88 Construction Cost. Existing file E86-cap-rate-benchmark is an existing route name, not permission to renumber engines. E85 release remains gated; E87/E88 not declared live-ready here.

Primary references: GitHub file URLs at pinned commit; Supabase docs https://supabase.com/docs/guides/auth/jwts , https://supabase.com/docs/guides/database/postgres/row-level-security , https://supabase.com/docs/guides/storage/security/access-control . No account secrets retrieved or included.
