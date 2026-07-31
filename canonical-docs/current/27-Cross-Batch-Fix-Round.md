# InvestScape — Reconcile Ultrawide Layout with Widget Customization (Doc 27)

**The ultrawide side-by-side pairing (Development Budget table + Cost Donut) was reverted while implementing widget customization, since the two approaches structurally conflicted. This reconciles them using the half-width `Size` concept from Doc 24's schema, rather than picking one feature over the other.**

```
On Development Studio's Overview tab, two widgets — the Development Budget
table and the Cost Donut chart — should default to half-width instead of
full-width, and sit side-by-side when both are visible and adjacent in
order, ONLY at ultrawide viewport widths (roughly 1920px+). Below that
width, both render full-width and stacked, same as every other widget.

This needs to work WITH the customization system built in the last pass,
not as a separate special case:
1. These two widgets keep their normal drag/arrow reorder and eye-icon
   hide controls — a user can still reorder or hide either one like any
   other widget.
2. If a user reorders things so the table and donut are no longer
   adjacent to each other, they should just render full-width in their
   new positions (the side-by-side pairing is a default convenience at
   this width, not a locked constraint the user can't break).
3. If a user hides one of the two, the other should render full-width
   in its position, not leave an empty half-width gap.
4. This default (half-width, paired) should be part of each of these two
   widgets' DEFAULT layout — not something that needs to be manually set
   up, and it should survive "Reset to default" the same way the rest of
   the default order does.

After implementing, verify: (a) at a normal/simulated desktop width, both
widgets render full-width stacked as they did right after the customize
feature was built, (b) at a simulated ultrawide width, they pair up
side-by-side when adjacent and both visible, (c) reordering or hiding one
of them behaves as described in points 2-3 above, and (d) Reset to default
brings back the paired half-width state. Screenshot each of these four
checks.

Also — while you're in this code path — quickly re-verify the Dev Studio
donut's live chart-reactivity fix (updateSeries, no flicker) still works
correctly after this layout restructuring, since its container's position
in the page just changed. A quick check is enough, not a full re-test.
```

---
*End of Doc 27 · Reconciles: 23-Responsive-Prompts-Mobile-Header-Wide-Monitor.md Prompt 2 with 26-Customizable-Layout-Prompt.md*
