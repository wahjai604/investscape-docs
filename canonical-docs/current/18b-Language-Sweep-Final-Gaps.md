# InvestScape — Language Sweep: Final Gaps (Doc 18b)

**Three of the four flagged gaps are real and should be fixed. The fourth (article/post titles) is correct as-is — see note at the bottom, don't change it.**

```
Three remaining translation gaps to fix:

1. "Budget drawn X%" on Development Studio Hub project cards — translate
   the label ("Budget drawn") the same way other card labels were handled;
   the percentage number itself doesn't need translation.

2. The compact project sub-line under "Under consideration" cards (e.g.
   "Mixed-Use · Quick · BC — Vancouver · edited 2d ago") — this is a mixed
   string, handle each part differently:
   - "Mixed-Use" and "Quick" are the same DevProjectType/DetailLevel
     option labels already translated elsewhere as pills — translate them
     here too, using the same dictionary entries for consistency.
   - "edited 2d ago" is a relative timestamp — translate this pattern
     (e.g. French: "modifié il y a 2 j").
   - "BC — Vancouver" is a location name and should stay in English/as
     entered, exactly like property addresses elsewhere never translate.
     Do not translate this part.

3. Default checklist items in Workspace (e.g. "Title search complete,"
   "Comparable sales pulled (last 6 months)," "Insurance quote requested,"
   "Lender pre-approval on file") — these are the system-provided starter
   checklist, so translate them the same as other chrome labels.

   IMPORTANT — before doing this, check: can a user add their own custom
   checklist item as free text (beyond the default starter set)? If yes,
   make sure only the default/seeded items translate — any custom item a
   user typed themselves should stay exactly as they wrote it, same rule
   as notes and property names never auto-translating. If the current
   data doesn't distinguish "default item" from "user-added item," don't
   guess — just fix the default items visible in the current demo data
   and flag back that this distinction needs to exist before real user
   data is involved.

DO NOT change individual article titles (Research) or discussion post
titles (Community) — those are real authored/user-generated content, not
app chrome, and should stay in their original language exactly as written.
This was flagged as a "gap" in the last pass but it's actually correct
behavior — please leave it as-is.

After fixing the three items above, take one French screenshot of the
Development Studio Hub page (showing both "Budget drawn" and the
considerDefs sub-line) and one of the Workspace checklist, so I can
confirm both visually.
```

---
*End of Doc 18b · Closes: the language-sweep gaps reported after Doc 18's Fix Prompt D*
