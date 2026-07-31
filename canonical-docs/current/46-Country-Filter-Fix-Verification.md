# InvestScape — Country Filter: Fix + Missing Verifications (Doc 46)

```
One fix and two verifications for the Canada/USA/Both country filter:

1. FIX: the featured Market News article "Why Sun Belt cap rates are
   decoupling from national trends" (and its two adjacent side cards, if
   they're similarly single-market) currently shows in ALL THREE filter
   states, including Canada-only. Sun Belt is a US-specific region — this
   content should be tagged US Market and disappear when filtered to
   Canada, same as the other US-tagged headlines below it already do.
   Re-check the two side cards ("What another Fed hold means for DSCR
   lending in Q4" and "Coastal insurance premiums") too — if either is
   genuinely single-market content rather than general cross-border rate
   commentary, tag and filter it the same way.

2. VERIFY PER-PAGE INDEPENDENCE (this was asked for in the original spec
   but never explicitly demonstrated): set Portfolio's filter to Canada
   and Development Studio Hub's filter to USA — two DIFFERENT values on
   two different pages. Navigate away from both and back. Confirm each
   page still shows its own independently-set filter, not both pages
   silently matching whichever was set most recently. If they turn out to
   share one global value instead of four independent ones, fix that —
   each page needs its own stored filter state.

3. VERIFY RELOAD PERSISTENCE (also asked for originally, not yet shown):
   set any page's filter to Canada or USA, actually reload the page, and
   confirm the filter is still set to that value after reload rather than
   resetting to "Both."

Report and screenshot all three: the Sun Belt article correctly hidden
under a Canada filter, the two pages showing independent filter values
side by side, and one page's filter surviving an actual reload.
```

---
*End of Doc 46 · Closes out: Prompt K (Doc 55, renumbered from Doc 28 — see Doc 55's own header note)*
