# Claude Design Brief — Import Review Pass

**Companion to Doc 10 §6.1.** Paste-ready prompt for the next Claude Design session. Upload `investscape-devstudio-drilldown-1.html` alongside this brief — it owns the Files tab this pass extends, and its styling (dark terminal aesthetic, Fraunces/Inter/DM Mono, gold accents, near-black background, existing pill and file-row components) is the baseline for everything below. Don't upload `investscape-v2-unified.html` or `investscape-ecosystem.html` for this pass — neither owns the surface being edited, and mixing in shells that only loosely touch it risks blending in conventions from screens this pass isn't touching.

Do not create any new data types in any of the five pieces below. Everything maps to Doc 10 §1–2 (`ImportBatch`, `ProjectFileRef`, `ConnectedStorageAccount`) or existing types (`BudgetLine`, `User`). If a screen seems to need a field that isn't in Doc 10, flag it rather than inventing one.

---

## Piece 1 — Settings → Connected Accounts

New ground; none of the existing mockups have a Settings frame. Build a simple settings page with a "Connected Accounts" section:
- Two rows, one per provider: Google Drive, Dropbox.
- Disconnected state: provider icon + name + a gold "Connect" button.
- Connected state: provider icon + name + the connected account's email + a ghost "Disconnect" button + a small green "Connected" pill.
- Keep the rest of the page mostly empty/placeholder — this pass only needs the Connected Accounts section to exist, not a full settings page.

## Piece 2 — Dev Studio Files tab, provider-picker state

Take the existing Files tab from the Development Studio drilldown (the "Deal file repository" card with file rows and a dropzone). Modify:
- The dropzone copy changes from "Drop files or click to upload — PDF, XLS, DOCX, images" to "Choose from Google Drive or Dropbox" with the two provider icons.
- Clicking it opens a modal: a simple two-tab or two-button chooser ("Google Drive" / "Dropbox"), each leading to a placeholder file list (a few sample rows with icons and names is enough — this doesn't need to simulate a real Drive browser).
- Existing file rows keep their current look (icon, name, meta line, AI-read pill) but the trailing action changes from a download icon to an external-link icon, signaling "opens in Drive/Dropbox" rather than "downloads from us."

## Piece 3 — Draw Report Import Review (new screen)

This is the one genuinely new screen. Two-column layout:
- **Left column (~40% width):** a document preview panel. Show a placeholder PDF page (a plain light rectangle with a few gray lines suggesting text is enough — no real content needed) inside a card labeled "Draw Report #4.pdf" at the top, with a small "Open in Drive ↗" link.
- **Right column (~60% width):** a card titled "Draw Report #4 — Review Extracted Actuals," containing a table with columns: **Budget Line** / **Current Actual** / **Extracted Actual** (editable input) / **Flag**. Populate with 6–8 sample rows mixing Hard and Soft groups (e.g. "General Requirements," "Hard Cost Contingency," "Architectural Fees," "Project Management"). Flag two rows as low-confidence — a subtle amber left-border on the row plus a small flag icon with a tooltip-style note like "Ambiguous — check source." Nothing pre-checked or pre-approved.
- Above the table, a status line in the smaller meta-text style already used elsewhere: "Extracted from Draw Report #4.pdf · Uploads feed interpretation only until confirmed." Keep this line — it's load-bearing copy, not filler.
- Bottom of the right column: two buttons — a ghost "Discard" and a primary gold "Confirm Import." No blocking modal, no "are you sure" on Discard — discarding an unconfirmed draft is low-stakes by design.

## Piece 4 — Files tab, post-import state

Same Files tab card as Piece 2. Confirm the Draw Report #4 row now shows an "Actuals imported ✓" pill (this pill already exists in the current mockup — just confirm it still renders correctly given the row's trailing action has changed per Piece 2) plus a small timestamp, e.g. "Imported just now."

## Piece 5 — Ribbon badge + Dashboard resume banner

- **Ribbon (global, every page):** near the avatar/profile icon at the top right, add a small notification badge — a dot or a small numbered circle (e.g. "1") in gold or a soft red, whichever reads better against the existing ribbon. No dropdown needed for this pass, just the badge itself.
- **Dashboard:** add a banner state near the top of the page, above the existing content — a card or bar reading: **"You have 1 import awaiting review — your file is safe, nothing is lost."** Two actions inline: a gold "Continue Review" button (routes to Piece 3's screen) and a ghost "Discard" button. Style it so it reads as informative, not alarming — this is good news dressed as a nudge, not an error state.

---

**Build order note for this session:** ask for Pieces 1, 2, and 5 first in one request (they're small, mostly variations on existing components), then Piece 3 as its own focused request since it's the only genuinely new screen, then Piece 4 as a quick confirmation pass over Piece 2's frame. Don't ask for all five in a single giant prompt — smaller, sequential requests within the session hold style consistency better than one massive one, and it's the same reason the original Dev Studio drilldown got built as its own dedicated pass rather than crammed into the unified shell.

---
*Companion to Doc 10 §6.1 · Not part of the numbered project-docs set — this is a build input, not documentation of record.*
