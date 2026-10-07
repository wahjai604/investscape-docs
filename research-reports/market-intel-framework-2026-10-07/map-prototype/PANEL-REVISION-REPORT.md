# Evidence panel revision 2 — 2026-10-07

Requested change: let users put the evidence/legend sidebar on the left or right, collapse it when unused and pin it open.

Implemented in the isolated prototype for both renderers:
- Persistent toolbar with Panel position, Pin/Unpin and Show/Hide controls.
- Desktop left/right grid placement; collapsed panel frees the map's width.
- On phones the expanded panel remains below the map, with the side preference retained for wider layouts.
- Unpinned map interactions collapse the panel after the gesture, unless the interaction selects evidence or opens an ambiguity chooser. Selecting an area reopens it. Keyboard focus returning to the map and Escape from the unpinned panel also collapse it. No hover timer while reading.
- Pin prevents automatic collapse; explicit Hide still works. Pin opens the panel.
- Only side, pin and expanded state saved in browser localStorage. No holdings, Research text or credentials stored there. Preferences survive module navigation and reload.
- ARIA expanded/pressed states, labelled position selector and safe focus restoration on collapse. Map resizes after layout changes while preserving its centre/zoom.

A touch regression found during verification was corrected: pointer-down must not resize the map before the tap's boundary selection resolves. Collapse waits for completion and ignores pointer-generated focus events; deliberate selections keep the panel open.

The earlier comparison report remains the original benchmark checkpoint. This revision's final regression results and screenshots are in evidence/test-results.json and evidence/*.png. These are headless Chromium/emulated touch results, not physical-phone or production tests. No new basemap/provider rights or backend readiness asserted. No WeWeb changes, schema changes, deployment or publication.

To try it on Windows: stop the earlier server with Ctrl+C, extract the revision-2 ZIP into a new folder, enter its map-prototype folder, run node server.mjs, open http://127.0.0.1:4173 and press Ctrl+F5 to replace previously cached prototype assets.

Final assistant-run regression: 45 checks passed (7 API and 38 browser). Both renderer panel tests passed, including placement, collapse, pin, tab return and reload persistence. Twelve current desktop/mobile light/dark screenshots retained; automated serious/critical accessibility violations zero in those views.
