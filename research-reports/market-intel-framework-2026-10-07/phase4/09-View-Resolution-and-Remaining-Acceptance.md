# View resolution and remaining acceptance
Reviewed 2026-10-08 UTC / 2026-10-07 Vancouver. Assistant-verified live catalog and aggregate-only inspection. No payloads, owner identities or tokens exported. No writes or authenticated A/B requests executed.

## Corrected current architecture
| Object family | public | investscape |
|---|---|---|
| dev_studio_projects, portfolios, deals, user_profiles, translations | relkind=v; security_invoker=true; SELECT projections from corresponding investscape relation | relkind=r; RLS enabled; private tables have owner predicates for SELECT/INSERT/UPDATE/DELETE |
These are views and underlying tables, not separate stored copies. PostgreSQL security-invoker views use the caller's permissions and underlying-table RLS. Ordinary anon/authenticated access remains subject to base-table ownership policies; privileged bypass roles require separate treatment.
The earlier public relrowsecurity=false finding was misinterpreted because relation kind and view options were not checked first. The prior security-gap conclusion is withdrawn; this is an assistant review error, not a database change.

## Draft residence
An aggregate-only query found 2 Quick and 1 Full native drafts through public.dev_studio_projects and the same counts through investscape.dev_studio_projects. View definitions establish that physical storage is investscape.dev_studio_projects. Counts alone do not prove individual historical revision identities; no private inputs were read. There is no evidence requiring migration to preserve drafts when selecting between these two paths.

## Native request target
All six native Quick/Full save/refresh/load definitions request /rest/v1/dev_studio_projects without explicit profile headers. This means they rely on the current default schema. If public is default, they use the security-invoker compatibility view; if investscape is default, they reach the base table. Both reviewed paths lead to the same storage and ordinary-role row protection.
Current exposed/default schemas remain unresolved by available connector configuration tools or scoped SQL settings metadata. Do not assert a fresh settings verification from historical acceptance.

## Gates and decision
- Existing reviewed ownership design has database protection. Do not revoke view grants or redirect workflows simply to correct the earlier mistaken finding.
- Explicit profiles may be a future contract preference, but are not a demonstrated security fix and require dependency/compatibility verification before changes.
- Historical Account B list isolation is retained as app-path evidence. Direct B update denial remains untested.
- No Account B session is available to this connector review. Management SQL can bypass RLS; a management-role write is not a valid substitute for an authenticated Account B HTTP test.
- Required controlled test: verify B identity privately, target one designated A-owned disposable draft in the established schema, record its pre-test revision/state privately, issue one bounded same-value PATCH by ID without client owner/revision filters, require zero affected rows or explicit authorization denial, then independently verify A's original state. Do not use real private investment records. This is a test procedure, not executed evidence.
- Current settings verification and authenticated A/B testing require an interactive Supabase/WeWeb browser path or suitable authenticated connector capability. Browser fallback needs approval under the browser tool rules; no credentials should be sent in chat.

## GitHub status
This report and prominent superseding notices in reports 06–08 are committed on docs/geographic-evidence-framework-2026-10-07. Historical commits remain intact. This acceptance phase is partially complete: storage and view protection resolved; live service exposure/default and direct B denial open.
No schema, grants, API implementation, WeWeb workflows, deployment or publication changed. Map/private-overlay acceptance remains pending direct authenticated tests, not a demonstrated absent-RLS defect.
