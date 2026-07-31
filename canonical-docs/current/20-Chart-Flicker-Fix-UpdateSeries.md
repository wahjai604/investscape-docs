# InvestScape — Chart Flicker Fix: updateSeries() Instead of Destroy+Recreate (Doc 20)

**Root cause confirmed:** `renderChart()` calls `.destroy()` (synchronous, removes DOM immediately) then constructs a new ApexCharts instance and calls `.render()` (async, returns a Promise) on every single keystroke. The gap between those two is a real empty frame, and it compounds on rapid typing into a visible strobe.

```
Fix the chart flicker on the Donut prototype (and anywhere else this same
destroy-and-recreate-on-every-keystroke pattern was used):

1. Construct the ApexCharts instance ONCE, when the component first mounts
   (or the element first appears) — not inside the input's change handler.
2. On every input change, instead of destroy() + new ApexCharts() + render(),
   call the existing chart instance's updateSeries() method with the new
   data (and updateOptions() if labels/colors also need to change). This
   updates the chart in place with its own built-in transition animation —
   no gap, no flicker, and it should look smoother than the original
   destroy/recreate approach even looked when it worked correctly.
3. Only call .destroy() when the component actually unmounts / the chart
   is being removed from the page entirely — never as part of a normal
   data update.
4. Re-run the same rapid-typing test from before (type several digits in a
   row into one input) and confirm there's no visible blank frame, no
   partial arc, no flicker — the chart should appear to update smoothly
   and continuously as you type.
5. Also check the Portfolio allocation donut and equity bars — confirm
   whether they were actually converted to use ApexCharts with this same
   pattern, or whether they're still the original SVG/React-state-driven
   charts from before. Report which is the case; if they're still SVG-
   driven, they're a separate, later task, not part of this fix.
```

**Why this matters for the real Bubble build too, not just the prototype:** Doc 03 Addendum B's original skeleton specified destroy-before-recreate specifically *for Bubble's HTML element*, where the whole embedded `<script>` block re-runs on every bound dynamic-data change — that's a different mechanism than this React prototype, and `updateSeries()` isn't as straightforward to reach from a re-injected script whose previous closures are gone. The likely right fix on the Bubble side is different: **debounce how often the underlying dynamic data actually changes** — e.g., only push a recalculated value into the HTML element after the user pauses typing for ~300–500ms, rather than on every keystroke. Check whether Bubble has a native debounced input-change trigger; if not, a workaround using Bubble's Pause/Reset-style workflow elements can approximate one. This is worth folding into Doc 03 Addendum B as a note once confirmed — the flicker risk is real in both places, but the fix isn't identical in both places.

---
*End of Doc 20 · Found via: 17c-Chart-Reactivity-Standalone-Check.md · Feeds back into: 03-Bubble-Build-Checklist-Addendum-B-ApexCharts-Wiring.md*
