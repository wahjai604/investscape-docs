# InvestScape — Extend Customize to Community (Doc 49)

**Extends the customizable layout system (Doc 24/26) to a 6th page.** Community was originally excluded as "just a feed," but it's since grown two independent right-rail panels (Top Contributors, Post Tags legend) that fit the same reorder/hide pattern already working on Portfolio, Deal Analyzer, Dev Studio, Research, and Market Intel.

```
Extend the existing "Customize" toggle to Community, following the exact
same pattern already built on the other five pages — don't invent a new
mechanism, reuse the one that works.

SCOPE — only these two widgets are customizable on Community:
- Top Contributors panel
- Post Tags legend panel

OUT OF SCOPE — do not make these customizable:
- The board sidebar (Market Boards / Industry Boards / Topic Boards) —
  this is navigation, not a widget
- The main discussion feed itself — this is content, not a widget

Behavior, matching the other five pages exactly:
1. Flipping "Customize" ON while on Community enters edit mode for these
   two right-rail panels only.
2. Each shows an eye icon (hide/show) and reorder controls (drag or
   up/down arrows, whichever pattern is already used elsewhere).
3. "Save Layout" persists the order/visibility for Community
   independently of the other five pages' saved layouts.
4. "Reset to default" reverts to Top Contributors above Post Tags
   (current default order), both visible.

Demonstrate: hide the Post Tags legend, save, reload, confirm it stays
hidden and Top Contributors is unaffected. Then reset to default and
confirm both panels return. Screenshot each step.
```

---
*End of Doc 49 · Extends: 24-Customizable-Layout-System.md, 26-Customizable-Layout-Prompt.md*
