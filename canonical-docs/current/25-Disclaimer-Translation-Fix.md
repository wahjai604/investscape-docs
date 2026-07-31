# InvestScape — Disclaimer Translation Fix (Doc 25)

**This was flagged during mobile testing and should have been folded into Doc 21 — it wasn't. Closing that gap now.**

```
The reusable disclaimer component ("For informational purposes only. Not
financial, legal, or tax advice.") — the one that appears consistently on
Portfolio, Deal page, Dev Studio Overview, Import Review, and Full Proforma
Review — is not in the i18n dictionary. Switching to French or Chinese
leaves it in English while everything around it translates.

This is a shared component used across multiple pages, which is likely why
it fell through the earlier page-by-page translation sweep (each page's
sweep probably assumed the disclaimer was "someone else's" text since it's
not unique to any one page).

Please add it to the dictionary and confirm it translates everywhere it
appears — screenshot at least two of its locations (e.g. Deal page and
Dev Studio Overview) in French to confirm both instances picked up the
fix, not just one.
```

---
*End of Doc 25 · Closes a gap that should have been part of: 21-Cross-Batch-Fix-Round.md*
