# Bounded Account B direct denial acceptance
2026-10-08 UTC / 2026-10-07 Vancouver. Investscape Dev only.

## Evidence and result
User executed existing editor-only diagnostic workflows in their normal browser. Assistant inspected supplied screenshots and independently queried bounded disposable-record metadata; assistant did not execute the browser requests.
- Fixed disposable diagnostic was absent at preflight. No pass was accepted against an absent target.
- User ran Persistence create disposable under Account A. Assistant verified exactly one matching marker/name row, revision 1, and owner fingerprint matching the existing diagnostic Account A guard. No owner identifier or credentials are recorded here.
- Before-state fingerprint: md5(row_to_json(record)::text) = 0792acce774d6e6197658ec797cbff88. This is a bounded equality fingerprint, not a cryptographic artifact integrity claim.
- User switched to Account B and ran Persistence Account B isolation.
- Screenshot image(20261008-012323).png shows status accountBIsolationRequestsPassed, differentAccount true, readHttpStatus 200, readRowCount 0, updateHttpStatus 200, updateRowCount 0.
- Reviewed workflow validates session through auth/v1/user, checks a different account against Account A's fingerprint, reads by fixed ID and attempts same-value name PATCH by ID alone, without owner/revision filters. It uses the same unprofiled dev_studio_projects REST path as native persistence.
- Assistant post-test verification: row exists, diagnostic identity matches, revision 1 and state hash 0792acce774d6e6197658ec797cbff88 unchanged.
Conclusion: bounded cross-owner direct read and update denial passed for this disposable record through the default REST path. HTTP 200 with zero affected rows is expected here; it is not a successful update. This does not establish blanket authorization correctness for every table, field, privileged function or future adapter.

## Data API settings screenshot
Assistant inspected user-supplied image(20261008-010458).png. Investscape-Dev UI displays checked graphql_public, investscape and public; automatic new-table exposure off; extra search path public, extensions; max rows 1000.
This verifies displayed selections only. The screenshot does not independently prove saved settings, service default schema or ordering. Dropdown alphabetical display is not default-schema evidence.
Successful user-run diagnostic create/read and B requests establish the unprofiled endpoint is operational and reaches the same disposable storage in investscape.dev_studio_projects. Its explicit default schema name remains unverified; public security-invoker view and investscape base table both resolve to that storage with owner RLS. No profile switch or remediation is justified by the earlier withdrawn gap finding.

## Phase disposition
- Physical draft storage and invoker-view protection: verified.
- Default native-path direct B read/update denial: bounded acceptance passed, user-run browser result plus assistant database preservation verification.
- Displayed Data API exposure selections: screenshot-verified; live default name and saved configuration list not independently verified.
- No production release, schema/grant/RLS change, API implementation, workflow edit or WeWeb publication.
- One synthetic revision-1 diagnostic record was created by the user and remains retained. Existing native drafts were not targeted. Cleanup not performed.
The remaining default-schema label/configuration evidence is a documentation follow-up, not evidence of a discovered access failure. Future map/portfolio/AI adapters still require their own authorization and privacy acceptance.
