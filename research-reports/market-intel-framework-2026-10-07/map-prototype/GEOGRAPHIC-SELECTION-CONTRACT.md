# Geographic selection contract v0.1

Unpublished prototype policy, 2026-10-07. Not a production module contract.

1. Canonical ID = authority + geography type + source vintage + source identifier. StatCan CSD and CMA remain separate. Census states use GEOID and 2025 vintage. Municipal local-area IDs are fixture-scoped, not invented statutory IDs: Toronto AREA_SHORT_CODE; Vancouver versioned source-name key plus retained name. Never join on unqualified display names.
2. Map click tests all candidate polygons in the active boundary family. Exactly one match selects it; multiple matches show an ambiguity chooser with all candidate IDs; zero matches leaves selection unchanged and explains no match. Shared edges count as ambiguous. No arbitrary first match, snapping or automatic geometry repair. Keyboard list selection is equivalent to explicitly choosing a candidate.
3. Render-only simplified municipal geometries are distinct from canonical acquisition geometry. Analytical joins are not performed in this prototype. Overlap areas and precision caveats remain disclosed; simplification is not an overlap repair.
4. City, CMA, neighbourhood and state cannot substitute for one another. Missing data stays missing. Country/currency/period/definition incompatibilities prevent automatic numeric ranking. No recommendation or investment score generated.
5. Cross-module navigation preserves camera, geography, filters, visible layers and comparison choices; removes the hidden map instance. Navigating is not transferring data into another module or overwriting a deal.
6. Portfolio layer is opt-in, mock owner-scoped, and cleared immediately when mock account changes. Exact/approximate/unmapped are distinguished. No private holding appears in a Research response or export. This mock demonstrates behavior, not production RLS/auth verification.
7. Controlled content: original neutral background, permitted government boundary overlays with attribution, original synthetic metrics and research; no commercial basemap tiles/geocoding. Community card publishing/export not implemented. Research detail is approved/published/audience/rights filtered in the fixture server, including direct detail requests.

Outstanding production decisions: definitive local-area keys, accepted analytic overlap/tolerance policy, full same-vintage coverage/crosswalk review, Research editorial/audience approval, basemap/geocoder procurement and export rights. Prototype no-match/multi-match handling requires no claim of a clean partition.
