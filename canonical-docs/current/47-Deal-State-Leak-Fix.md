# InvestScape — Fix Deal Detail State Leaking Across Tabs (Doc 47)

```
There's a bug where a previously-viewed deal's detail content (specifically
the "no-photo" placeholder deal used to test the photo feature) keeps
rendering when navigating to other tabs — its blank/empty fields show up
persistently, with the actual correct tab content rendering below it
rather than replacing it.

Please diagnose the root cause first, before making a UI change:
1. Find whatever state variable controls "which deal is currently being
   viewed" (e.g. selectedDeal/activeDeal) and check whether it's actually
   being cleared/reset when the user navigates away from Deal Analyzer to
   a different tab.
2. Check whether the deal-detail view has a proper conditional guard so
   it only renders when Deal Analyzer is the active tab AND a deal is
   actually selected — not whenever that state variable happens to still
   hold a stale value from a previous visit.
3. Fix the actual bug so navigating away from a deal's detail view fully
   clears it — no leftover/stale rendering should appear on any other
   tab.

Keep the Deal Analyzer drilldown as a full page (not a modal/pop-up) —
this matches how Development Studio's project workspace already works
(also a data-dense, multi-tab detail view built as a full page), and
converting only this one to a modal would be an inconsistent pattern for
the same kind of content elsewhere in the app.

After fixing, test specifically: open the no-photo demo deal, then
navigate to Portfolio, Dev Studio, and two other tabs in sequence, and
confirm the stale deal content does not appear on any of them. Screenshot
each tab clean, with no leftover deal content bleeding through.
```

---
*End of Doc 47 · Fixes a bug found while testing Prompt N (deal thumbnail)*
