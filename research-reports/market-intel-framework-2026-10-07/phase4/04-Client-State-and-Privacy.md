# Phase 4 — client state and privacy design

Main-ribbon map remains beneath the persistent shell. Research supplies governed evidence to Market Intel; Community remains independent. Dev Studio/Deal Analyzer/My Portfolio buttons are navigation until a separately approved transfer contract is invoked.

## State classes

- Local UI preference: renderer preference (provisional), sidebar side/pin/expanded, theme. Prototype currently persists sidebar fields only. Future account preference persistence is a separate choice; do not imply current cloud syncing.
- Navigation state in memory: camera, selected typed geography, enabled evidence layers, filters and comparison tray. Preserve on ribbon return. Viewport resizing preserves centre/zoom; explicit Fit selected refits.
- Sensitive state: holdings coordinates/labels, private selected object, derived comparison and AI context containing private inputs. Clear synchronously before requests on logout, account change, permission downgrade or auth failure; cancel pending responses and remove map sources/markers/popups.
- Server revision state: publicationGeneration and per-layer revision vector. Do not persist private responses in browser storage, service-worker caches or URL query strings.

Request lifecycle: increment caller/session and query generation; abort superseded request; response must match identity epoch, query fingerprint and accepted publication generation before painting. Aborting alone is insufficient because a late response can still arrive. Hidden modules dispose/pause the map and private subscriptions; no unnecessary background polling. On return reauthorize private reads and reconcile publication generation before showing retained evidence.

Unpinned sidebar collapses after returning to map use; explicit geographic selection/ambiguity opens evidence. Pin suppresses auto-collapse. Manual hide still works; focus moves to available toolbar instead of a hidden control. Phones stack panel below map. Keyboard list and Fit/Zoom remain alternatives to map pointer interaction. Reduced motion, contrast, focus order, touch targets, screen-reader announcements and physical phone tests required for real integration; automated axe alone is insufficient.

## Private Portfolio overlay

Default off; never implied by geography browsing. Owner-only investments and developments; approximate coordinates identified and exact locations only when user is entitled to those records. Unmapped holdings shown in list rather than geocoded guesses. Overlapping polygon matches expose ambiguity; no invented neighbourhood assignment. No owner property in map query serves as authorization. RLS and API ownership tests cover direct requests, queries, views/functions, cached responses and assets, not only the saved-draft list.

Community sharing is separate: explicit action, audience/preview/privacy review and confirmed post. Private Portfolio and sensitive AI context excluded by default. No screenshot/export implemented in this phase; providers' stored-export rights remain unresolved. A visual screenshot can still reveal locations and labels even when identifiers are omitted. Sidebar placement does not establish export consent.

AI reads the same governed evidence; stored conversation context needs identity scoping and rights/revision invalidation. Cross-module navigation carries only explicit safe context. Input transfer requires user review, provenance, receiving-module validation and no silent overwrite; no production transfer behavior added here.
