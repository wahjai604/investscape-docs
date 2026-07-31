# InvestScape — Chart Reactivity Standalone Check (Step 3)

**Run this after Fix Prompts A and B, before Doc 17 Prompt 2.** This wasn't exercised in the last testing pass — confirming it works on its own first, so the cross-batch conflict check (which assumes reactivity already works) tests the right thing.

```
Run through these checks and report PASS, FAIL, or PARTIAL for each —
don't fix anything yet, just report what you observe.

1. On the standalone Donut prototype (or wherever the Land/Hard/Soft/
   Financing cost inputs live), change the "Land Cost" input value.
   Confirm: the donut chart's segments and the centered total both update
   immediately, with no page refresh and no submit button needed.

2. Change a second input (e.g. "Hard Construction Cost") right after the
   first, without waiting. Confirm the chart doesn't show multiple
   overlapping/stacked chart instances — it should cleanly show only the
   current state, meaning the destroy-before-recreate guard is working.

3. On the Portfolio page, do the same test against whatever drives the
   allocation donut and the equity-vs-debt bars (e.g. editing a property's
   value or category, if that's exposed, or triggering whatever the
   underlying data source is). Confirm both charts update live the same
   way the standalone Donut prototype does.

4. Watch closely during a rapid sequence of edits (type several digits in
   a row into one input). Confirm there's no visible flicker, no chart
   briefly disappearing, and no skeleton/loading placeholder appearing
   during this — chart reactivity should feel instant, not asynchronous.

Report each of the four as PASS/FAIL/PARTIAL with a one-line note. If
anything fails, describe exactly what you saw (e.g. "chart didn't update
at all," "old segments stayed visible under the new ones," "brief flash of
loading skeleton before the chart updated") so the fix can be scoped
precisely rather than guessed at.
```
