# Cross-module navigation and transfer

Status: planned contracts; existing buttons not verified in this pass.

## Main ribbon and return context
Map belongs beneath the main ribbon in Market Intel. Users can jump to Research, Deal Analyzer, Dev Studio, My Portfolio, Community or other available modules. Actual ribbon inventory remains to verify. Preserve compact Market Intel session state and origin record ID on navigation; reload rechecks permissions/freshness.
Links use canonical IDs, not personal record payloads in URLs. Missing/deleted/unauthorized records show neutral unavailable. Draft analysis inputs/results survive navigation according to their existing contracts.

## Proposed links
Research -> Market Intel geography plus evidence reference; reverse -> approved detail.
Deal Analyzer/Dev Studio -> Market Intel linked geography and source record reference.
Market Intel -> Deal Analyzer/Dev Studio opens destination or reviewable transfer preview.
Portfolio -> Market Intel owner overlay/selected holding; reverse -> authorized holding or linked analysis.
Market Intel -> Community prepares an optional share preview; no automatic post.

## Transfers are distinct from navigation
Explicit user selection and confirmation apply per transfer. Include originating observation/item IDs, definition, unit/currency, period, boundary version, source and retrieval/review dates; destination applicability and field mapping must be approved.
Never silently overwrite assumptions, results or saved revisions. Validate scope (jurisdiction, asset, area basis, rent definition) and invoke existing result-invalidation/concurrency rules when implementation is authorized. No mass fan-out or automated AI writes.
Future write actions, rankings/scoring and G4 transfer implementation remain deferred. AI read access across modules does not authorize editing or posting.
