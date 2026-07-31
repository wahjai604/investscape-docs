# InvestScape — Cross-Batch Fix Round (Doc 21)

**Run these three, then the mobile check at the bottom (report-only, not a fix yet).**

---

## Fix Prompt E — Reword the grade-badge disclaimer, don't delete it

```
The Deal page has two disclaimer-style lines that currently read as
redundant: the grade badge's line ("Based on the metrics below, not a
recommendation to buy or pass") and the page-bottom general disclaimer
("For informational purposes only. Not financial, legal, or tax advice.").

These are intentionally two different things, not a duplicate — keep both,
but reword the grade-badge line so it doesn't echo the general disclaimer's
phrasing. It should stay specific to the badge (what a "screening signal"
means, that it's not telling the user to buy or pass) without repeating
"informational purposes" or "not advice" language that's already covered
by the general footer below it. Something like: "A screening signal based
on the metrics below — not a recommendation." Keep it short, keep it
visually subordinate to the badge as before, just remove the wording
overlap with the general disclaimer.
```

---

## Fix Prompt F — French-Canadian currency formatting

```
Currency figures currently use `.toLocaleString('en-US')` with a prefixed
"CA$"/"US$"/"$" regardless of the selected language — so switching to
French leaves every dollar amount in English format (e.g. "CA$1,234,567")
instead of French-Canadian convention.

Fix `money0`, `moneyCcy`, and the Total Value card's inline formatting so
that when the language is French:
- Use space as the thousands separator instead of commas (e.g. "1 234 567"
  not "1,234,567").
- Put the currency symbol AFTER the number, with a space before it, and
  use "$ CA" / "$ US" as the suffix instead of a "CA$"/"US$" prefix — e.g.
  "1 234 567 $ CA" instead of "CA$1,234,567". This keeps the CAD/USD
  distinction that mixed-currency views need (per the earlier currency
  work), just in French word order instead of English.
- Ratio/percentage figures (cap rate, occupancy, ROC) don't need this
  treatment — only actual currency amounts.

Chinese and other non-French languages can keep the current "CA$"/"US$"
prefix format as-is — this fix is specifically for French/fr-CA
convention, not a general locale-formatting overhaul.

After fixing, switch to French and screenshot the Portfolio Total Value
card and the property table to confirm the new format is applied
consistently across both.
```

---

## Fix Prompt G — Translate the notification bell and its Settings panel

```
The notification bell dropdown and its matching Settings section were
built after the main translation pass and were never added to the i18n
dictionary — confirmed missing: the "Notifications" header, "Mark all as
read," "You're all caught up," the Settings panel's "Notifications" title,
and "Choose what shows up in the bell dropdown."

Please do a full sweep of BOTH the bell dropdown and the Settings
notification section — not just the five strings listed above, since
there may be more (e.g. individual notification type descriptions in
Settings, timestamp formatting like "2h ago," any empty-state text in the
dropdown itself). Add every hardcoded string you find to the existing i18n
dictionary and wire it in, matching the same pattern used for the rest of
the app.

After fixing, switch to French and screenshot both the open bell dropdown
and the Settings notification section to confirm everything translated.
```

---

## Then — complete the mobile check (report only, no fix yet)

```
Complete the 390px mobile-width check that wasn't finished last pass:

1. At a 390px viewport, check the Portfolio Total Value card (with its
   per-currency subtotals and converted total) — does it stay clearly
   readable stacked at this width, or does it get cramped/overlapping?
2. Check the disclaimer component at this width — does it stay fully
   visible and legible, or does it get cut off or shrunk illegibly?
3. Check the notification dropdown panel at this width — does it position
   sensibly on a small screen, or does it overflow the viewport edges?

Report PASS/FAIL/PARTIAL for each with a short description — don't fix
anything yet, just report what you observe, same as the original testing
pass.
```

---
*End of Doc 21 · Resolves: 17-Post-Batch-QA-Verification.md Prompt 2, findings 1, 3, 4, 5*
