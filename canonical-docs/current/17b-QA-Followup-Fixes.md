# InvestScape — QA Follow-Up Fixes (from Doc 17 Prompt 1 results)

## Fix Prompt A — Empty-state demo toggles not switching the view

```
The "(demo: preview empty state)" toggle links on Deal Analyzer, Community,
and Development Studio Hub are present but clicking them doesn't visibly
switch the screen to its empty-state view — the state variables
(showAnalyzerEmptyDemo, showCommunityEmptyDemo, showDsHubEmptyDemo, or
whatever they're currently named) aren't correctly wired to the toggle
click handler or to the conditional rendering of the empty-state markup.

Please:
1. Fix the click handler → state → conditional render chain for all three
   toggles so clicking each one actually swaps that screen to its empty
   state, and clicking again swaps it back.
2. Also check Research and Library the same way — confirm whether they
   have working empty-state toggles at all, since they weren't tested
   yet. If they don't have an empty state built, flag that back to me
   rather than building it as part of this fix.
3. After fixing, take a screenshot of each of the three (and Research/
   Library if they have the toggle) in both their normal and empty states
   so I can visually confirm the fix worked, rather than just reporting
   that it's fixed.
```

## Fix Prompt B — "7 properties" pill not localized, likely a repeated pattern

```
On the Portfolio page, the "7 properties" pill next to the Recalculate
button doesn't translate when the language is switched to French or
Chinese — it stays as English "7 properties" while everything around it
translates correctly. This is a "count + word" pattern (a number combined
with a hardcoded English noun), which likely repeats in a few other places
in the app, not just this one pill.

Please:
1. Fix this specific instance so it reads correctly in each language —
   including correct pluralization/agreement rules, not just a word swap:
   French needs singular/plural agreement (e.g. "1 propriété" vs.
   "7 propriétés"), Chinese doesn't use a plural marker at all (the number
   alone is grammatically complete, e.g. "7个物业" or similar — don't add
   an artificial plural form).
2. Search the rest of the prototype for the same "number + hardcoded
   English word" pattern — likely candidates: deal counts, notification
   list counts, import batch row counts, unit counts in Dev Studio, or
   anything else showing "X [noun]" — and fix each one the same way.
3. Report back a list of every location you found and fixed, not just the
   one I flagged, so I know the full scope of what changed.
```
