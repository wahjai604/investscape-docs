# Phase 4 — schema-specific authorization follow-up
Reviewed 2026-10-08 UTC (2026-10-07 Vancouver). Metadata and source review only. No authenticated diagnostic was run; no record read or mutation was attempted.

## Correction to the prior finding
The preceding inventory inspected public only. It must not be generalized to the custom investscape schema or the active Quick/Full storage path. There are two sets of similarly named tables.

| Schema | Relations | Database authorization evidence |
|---|---|---|
| public | deals, dev_studio_projects, portfolios, user_profiles, translations | RLS disabled; no policies. Authenticated CRUD grants on private tables. |
| investscape | Same five names | RLS enabled. Private tables have SELECT/DELETE USING auth.uid() = owner_id, INSERT WITH CHECK auth.uid() = owner_id, and UPDATE both USING and WITH CHECK. |
Both schemas grant USAGE to anon and authenticated. In investscape, authenticated has CRUD on private tables; dev_studio_projects additionally has anon CRUD grants, constrained by its owner policies. Policies apply to PUBLIC (all roles), not just the authenticated role. This is not unconditional access: ownership still applies for roles subject to RLS. Privileged bypass roles and functions need separate inspection before release.
Translations has an intentional read-all policy and false write policies in investscape.

## Access-path evidence
- Pinned API tree 2cec0ab contains stateless Full calculation and helper asset delivery. Reviewed Full plan expressly separates calculation from future saved-project authorization. No InvestScape saved-record route identified by filename/path discovery. Unrelated Lighthouse persistence files were excluded.
- Current WeWeb Full initialization restores navigation inputs only when stored ownerId matches the current auth user; otherwise clears them, invalidates prior result and advances page generation. This is client-side clearing, not database authorization.
- Existing editor-only diagnostic functions create/reload/isolate a fixed disposable row through /rest/v1/dev_studio_projects with Bearer session and publishable key. Reviewed diagnostic definitions do not send Accept-Profile or Content-Profile. Therefore they request the server's default schema, whose current identity has not been verified.
- The Account B diagnostic contains a same-value PATCH attempt but was NOT executed in this review. Its existence does not establish the missing direct update-denial acceptance.
- The Full page semantic includes workflow references but not the save-button action bodies. Exact current native Quick/Full save/list profile selection remains unresolved; diagnostic definitions are not a substitute.
- No pgrst.db_schemas or pgrst.db_extra_search_path settings were returned by the scoped pg_db_role_setting query. Settings may be held by service configuration, so this does not establish exposed schemas or default schema. Historical investscape exposure acceptance remains historical evidence.

## Concrete remediation proposal, conditional on final path evidence
1. Adopt schema-qualified access as an explicit requirement for all new private map/AI adapters. Use investscape owner-protected relations as the candidate seam; do not select public copies by table name alone.
2. Establish current Data API exposed schemas/default from the service settings and inspect native save/list/load action bodies. If any private operation defaults to public, propose an explicit profile correction with before/after evidence before applying it.
3. Determine whether public copies serve any required InvestScape path. If unused, propose revoking client-role access or unexposing the schema, retaining intentional public translations access where required. If used, migrate consumers deliberately or add reviewed owner policies. Do not delete/move tables or enable a blanket policy without dependency review.
4. Keep current custom-schema owner checks. Review effective grants, privileged functions/views, owner reassignment, soft deletion and payload revision semantics before map integration. Do not change grants solely because anon grants exist: verify the policy and consumer contract.
5. Portfolio overlay remains default-off and unimplemented until an owner-scoped read path, approved coordinate model, identity-switch clearing and direct denial tests are supplied. This gate does not imply the custom schema lacks RLS.

## Required acceptance evidence for a future authorized fix
- Profile-selection assertions for all reads and writes; server authorization derives user identity, never trusts caller ownerId.
- Account A own read/write succeeds; Account B read and direct update of A's disposable record are denied; attempted owner reassignment denied; signed-out access denied.
- No tests target real private records. Record revision/hash preserved before/after denied actions; run only under separately authorized controlled disposable test scope.
- App list isolation, database policy inspection and direct update denial remain distinct evidence.
- Existing Quick/Full optimistic concurrency and revision conflict behavior preserved.
- Map/AI/export responses contain only authorized data and clear on identity changes.

Read-only follow-up confirmed custom-schema protection and narrowed the public-schema concern. Current Data API exposure/default, exact native save profile and direct denial remain open. No live remediation is authorized or applied by this report.
