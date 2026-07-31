# InvestScape — Library Card Detail View: Updated Prompt S (Doc 48)

```
Make every Library formula card clickable: clicking opens a detail
overlay/panel showing the formula notation (stays universal/untranslated),
a plain-language explanation, a worked example, and the card's existing
tier/category tags. Add a close action and keyboard escape.

WORKED EXAMPLES — use real, already-validated numbers, not invented
placeholders. Pull from the 796 Main Street and Gilley project figures
already validated to the cent against their source workbooks (Doc 06
Addendum A) wherever a card's formula matches one of those computed
values — e.g. the Cap Rate, DSCR, NOI, ROC, Interest Reserve, and PTT
cards should each use the corresponding real figure from those two
projects rather than a fresh made-up number. This keeps the Library
internally consistent with the rest of the app instead of introducing
numbers that don't tie to anything else in the prototype. For any formula
that doesn't have a matching validated figure available, a clearly
realistic placeholder is fine — just don't invent one where a real,
already-computed value exists.

VERIFICATION — before reporting this done, actually click through every
single card in every filter category (All, Cost of Capital, Time Value of
Money, Cash Flow Model, Performance, Leverage) and confirm each one opens
its detail view correctly. Report the exact count checked against the
exact total (e.g. "confirmed 12 of 12 cards open correctly across all 5
categories") — not a general statement that cards work, and not just the
first few checked as a stand-in for the rest.

All explanation/example text (not the formula notation itself) goes in
the i18n dictionary, four languages.

Screenshot one open detail card in English and one in French.
```

---
*End of Doc 48 · Updated version of Prompt S (Doc 55, renumbered from Doc 28 — see Doc 55's own header note), folding in validated-numbers and full-count verification requirements*
