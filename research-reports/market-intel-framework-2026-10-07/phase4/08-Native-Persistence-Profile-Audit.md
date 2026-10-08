> **Superseded authorization interpretation — 2026-10-08 UTC:** Public objects described below as tables or copies are security-invoker views over the same investscape base tables. Their relrowsecurity=false is not evidence of missing underlying row protection. The claimed public-schema authorization gap and resulting remediation recommendation are withdrawn. No schema switch, migration or grant/RLS change is justified by these findings. See 09-View-Resolution-and-Remaining-Acceptance.md for current conclusions. Earlier text is retained as review history, not current guidance.

# Native persistence profile audit
Reviewed 2026-10-08 UTC / 2026-10-07 Vancouver. Current WeWeb definitions inspected; not executed.

## Verified native actions
Project Investscape Dev 4a0173ad-346d-4d29-a9b9-0201e5af6d78.
- Full page d789a8fd-f136-46ed-8ac1-3355db79c635: Save 9f605ff3-c79a-47a0-b5d1-dca4c89911bf; Refresh 40c7e235-d8f3-4b3a-95a1-ed08959c0718; Load db28509b-3760-47e1-8f78-6647d177f7c5.
- Quick page f57615c4-7e3c-4b97-8078-eb575a075f14: Save 413470af-0f10-4316-88ee-2fb444a08352; Refresh a4d597cf-ea2d-47e4-9437-cdb09b38a4f3; Load fc91022d-2d4c-44db-a842-1eb24f1ab6ca.
All six action bodies use the Investscape Dev REST URL /rest/v1/dev_studio_projects. Shared headers contain apikey and Bearer Authorization, with no Accept-Profile or Content-Profile. None explicitly selects investscape. They therefore depend on the current Data API default schema, not the installed WeWeb integration's schema selection. Raw fetch does not inherit integration settings.
All six include /auth/v1/user validation and owner_id filters. Native draft payload discrimination, soft-delete exclusion and version/revision controls are present. These client filters provide useful scoped behavior but cannot replace server row authorization.

## Consequence
The historical Account B saved-list result remains valid for that app path, but its owner filter can produce an empty list even if underlying default-schema tables have no RLS. It cannot resolve direct update denial.
Protected investscape tables and unprotected public copies are separate relations. Current exposed schemas/default remain unverified; this review does not assert which holds the historical saved drafts. Do not redirect writes before determining where those drafts reside.

## Recommended concrete change, pending settings/data-path evidence and authorization
- Explicitly send Accept-Profile: investscape for table GET requests.
- Explicitly send Content-Profile: investscape for table POST/PATCH requests; use corresponding response profile handling supported by the Data API.
- Keep auth/v1/user requests separate from table profile headers.
- Preserve current owner filters, session-change fences, revision/full-baseline predicates, no-op behavior, no automatic retries and response reconciliation.
- Confirm investscape is exposed and contains the intended existing saved drafts before switching. If drafts are in public, prepare a separately authorized preservation/migration plan; never silently start an empty parallel saved-list.
- Address public-table grants/exposure only after dependency inventory. No grant, RLS or schema change is included here.

## Remaining evidence gates
1. Read current Data API exposed schema list and default ordering from Supabase settings. Available connector SQL metadata did not expose this service configuration.
2. Determine current saved-draft storage location through an authorized bounded check; avoid exporting payloads or identifiers to chat.
3. Run controlled A/B direct update denial against one designated disposable draft only after its identity, schema, original revision and restoration procedure are established. No Account B diagnostic was executed here.
4. Verify explicit-schema paths and regress existing concurrency after any separately authorized fix.
The read-only native action trace is complete. Settings, storage location and direct denial remain open. No live changes, publication, or deployment.
