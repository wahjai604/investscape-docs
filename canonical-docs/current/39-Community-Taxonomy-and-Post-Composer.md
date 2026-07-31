# InvestScape — Community Taxonomy & Post Composer (Doc 39)

## Part A — Taxonomy: Industry as a parallel category, not an inversion

**Decision recommended (and prompted below):** add **Industry Boards** as a third top-level sidebar category — Residential, Commercial, Industrial, Recreational, Farm/Agricultural — alongside Market Boards (geographic) and Topic Boards. This is the BiggerPockets pattern: local forums and asset-class forums run side by side; neither nests inside the other.

**Why not industry-first nesting:** a cross-cutting taxonomy nested strictly either way fragments one audience or the other (geography-first fragments the "industrial everywhere" user; industry-first fragments the "everything in Metro Vancouver" user). Parallel categories let a discussion be entered from whichever door fits.

**Empty-board rule (governs when children get created):** boards split into children only when a parent's volume justifies it — never preemptively. Ten busy boards beat forty thin ones; a pre-fragmented young forum looks dead. The existing self-referencing `Board` schema and the directory tree already support children under any parent (geographic parents can grow industry children, industry parents can grow regional children like "Commercial → West Coast") — the constraint is editorial discipline, not schema.

### Prompt A — Industry Boards category

```
Add a third board category to Community's left sidebar: "Industry Boards,"
positioned between "Market Boards" and "Topic Boards."

1. Seed it with five boards: Residential, Commercial, Industrial,
   Recreational, Farm & Agricultural — each with a plausible member count.
2. These are top-level boards (asset-class-wide discussion across all
   geographies), NOT children of any geographic board. The existing
   Metro Vancouver → Residential/Commercial/Recreational children stay
   as-is — those are Metro Vancouver's own sub-boards and are a different
   thing from these industry-wide boards.
3. The Board Directory modal gets a matching "Industry" section in its
   tree, same Follow/Following toggles, included in search. Give
   "Commercial" one child board ("West Coast") to demonstrate an industry
   parent can also grow regional children.
4. Same followed-boards sidebar behavior as the other two categories,
   with its own "Browse all boards →" link.
5. All new labels in the i18n dictionary, all four languages.

Screenshot the sidebar with all three categories visible and the
directory showing the Industry section expanded.
```

## Part B — Post composer modal

**What changes:** the always-visible bottom bar (tag row + one-line input + Post) is replaced by a single **"+ Start a discussion"** button. Clicking it opens a composer modal containing everything post creation needs — which also fixes a real gap: the current inline box has no title field, yet every post displayed has a title.

**Composer contents:**
- Title input (required)
- Body editor with a minimal formatting toolbar: **bold, italic, underline, bulleted list, numbered list, link** — deliberately no highlight/text-color for v1 (dark-theme readability + every format feature is a rendering surface). Autocorrect via native browser spellcheck.
- The tag multi-select chips (moved here from the board page)
- **Attach deal snapshot** — a paperclip/attach button that opens a picker of *the user's own deals* (this is the frozen-JSON `DealSnapshot` from the locked schema — NOT a file-from-disk chooser). No arbitrary file uploads: v1 attachments are deal snapshots only, consistent with the no-native-file-storage architecture and avoiding a moderation/PII surface. Images deferred until there's a moderation plan.
- Post / Cancel

**Note for the real Bubble/Route-2 build (not the prototype):** user-formatted body content must be sanitized before rendering (XSS). Logged here so it rides into the port checklist.

### Prompt B — Composer modal

```
Replace Community's bottom compose bar (the tag chips row + one-line
input + Post button) with a single "+ Start a discussion" button, and
build the composer as a modal:

1. Clicking "+ Start a discussion" opens a modal over the board with:
   - A "Title" input (required — the demo posts all have titles, and the
     old inline box had no way to enter one).
   - A body text area with a small formatting toolbar: bold, italic,
     underline, bulleted list, numbered list, and insert-link. Enable
     native browser spellcheck on the field. Do NOT add text
     highlight/color options.
   - The tag multi-select chips (the same 8 tags), moved into the modal —
     remove the always-visible "TAG THIS POST" row from the board page.
   - An "Attach deal snapshot" button (paperclip icon + label). Clicking
     it opens a small picker listing the user's demo deals (e.g. "1120
     Eighth Ave.", "142 Maple Grove Ave.") — selecting one attaches it,
     shown as a compact chip with the deal name and a 🔒, removable with
     an ×. This is a deal-snapshot picker, NOT a file upload — no
     file-from-disk chooser, no drag-and-drop of files.
   - "Post" (primary) and "Cancel" buttons. Post adds the new post to the
     top of the board with its title, tags, and snapshot chip rendered
     the same way existing demo posts are.
2. Formatting applied in the editor should actually render in the posted
   result (bold shows bold, lists show as lists).
3. All new labels/placeholder text in the i18n dictionary, all four
   languages.

Demonstrate: open the composer, write a titled post with some bold text
and a list, select two tags, attach a deal snapshot, post it, and
screenshot both the filled-in composer and the resulting post on the
board. Also screenshot the board page showing the compose bar is gone and
only the "+ Start a discussion" button remains.
```

---
*End of Doc 39 · Extends: 36 (board hierarchy), 38 (directory build) · Precedent: BiggerPockets parallel local/topical taxonomy; Reddit/Discourse composer patterns*
