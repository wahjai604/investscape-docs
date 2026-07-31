# InvestScape — Internationalization & Language System (Doc 13)

**Prompted by:** Claude Design prototype screenshots showing the language switcher translating only the ribbon nav — table headers, card labels, and buttons stay English. Confirms the gap is real, not cosmetic.

---

## 1. Scope — what translates, what never does

This distinction has to be explicit before any translation work starts, or it gets guessed inconsistently page by page.

| Category | Translates? | Why |
|---|---|---|
| UI chrome — nav, buttons, table headers, card labels, tooltips, modal copy, empty states, wizard steps | **Yes** | this is the actual gap in the screenshot |
| Legal/disclaimer text (footer, ToS, grade-badge disclaimer from Doc 12 §1.3) | **Yes, but human-translated and stored as fixed strings — never machine-translated on the fly** | a disclaimer mistranslated by an LLM is itself a liability risk; this text needs the same rigor as the English original, not best-effort AI output |
| AI narrative (Claude API output) | **Yes, via a prompt parameter** — see §4 | different mechanism from static UI text — it's generated per-request, not stored |
| User-entered data (property names, addresses, notes, deal labels) | **No** | it's the user's own words; translating "142 Maple Grove Ave." would be actively wrong |
| Imported file names | **No** | you already correctly identified this — a filename is the filename |
| Formula names / financial terminology in the Library (Doc 06) | **Translate the plain-English explanation; keep the formula notation itself universal** | `WACC = (D/V × Rd...)` is the same symbol set in every language; the explanation text under it is what needs translating |

---

## 2. Schema

### New option set: `Language`
Options: English, French, Chinese (Traditional), Chinese (Simplified) — extendable later without touching existing rows.

### New fields on `User`
| Field | Type | Default | Notes |
|---|---|---|---|
| PreferredLanguage | Language | English | the active display language |
| EnabledLanguages | list of Language | `[English, French]` for Canada, `[English]` otherwise | see §5 — this is the *personal shortlist* shown in the globe dropdown, not the full master list |

### Implementation mechanism — check Bubble's native language feature first
Bubble has a built-in app-text translation system (define each static string once, provide per-language versions, and the page renders the version matching the user's set language) — this is very likely the right tool for the UI-chrome layer in §1, rather than hand-building a custom `Translation` data type. **I haven't verified the current specifics of this feature against Bubble's own docs, so confirm the exact mechanics there before committing to it as the build approach** — if it turns out to have real limitations (e.g. with dynamic pluralization or the AI narrative case in §4), the fallback is a custom `Translation` data type (Key, EnglishText, FrenchText, ChineseTraditionalText, ChineseSimplifiedText) referenced everywhere a static string appears — more build effort, full control.

---

## 3. Global Settings → Language page

Matches the pattern you described almost exactly:

1. Full master list of supported languages, each as a checkbox — "Show this in my language switcher."
2. **Canada gets English and French as the pre-checked defaults**, not just English — see §6 for why this isn't arbitrary.
3. "Save" writes the checked set into `User.EnabledLanguages`.
4. The globe-icon dropdown (top ribbon) then only lists the user's `EnabledLanguages`, not the full master list — keeps it personal and short, exactly the decluttering you described, instead of scrolling a long list every time.

**One ambiguity in your ask worth resolving explicitly before this gets built** — "add their own language" could mean two very different things:
- **(A) Curated show/hide** — pick which of the *already-translated* languages appear in their personal dropdown. This is what §3 above specs, and it's a straightforward checkbox-list feature.
- **(B) Contribute a new translation** — let a user submit InvestScape in a language you haven't translated yet (say, Punjabi or Tagalog), which is a much bigger feature: a contribution workflow, a review/approval step (mistranslated legal text is a real risk here too), and ongoing maintenance every time you add a new UI string.

**My recommendation: build (A) now, treat (B) as a real Phase 2 idea worth keeping, not a rejection.** (B) is a legitimate community-style feature that could actually fit your platform's Community-module DNA well later — but it needs its own design pass (moderation, legal review of contributed disclaimer text, versioning as the app evolves) and shouldn't get bundled into this pass by assumption. Flag which one you meant and I'll adjust if it's (B).

---

## 4. The AI narrative layer needs its own fix — this isn't just a UI-text problem

Doc 05's Claude API prompt template currently has no language parameter. The narrative is generated per-request, not stored as static app text, so Bubble's language feature (§2) won't touch it at all — it needs an explicit addition to the system prompt: *"Respond in [User's PreferredLanguage]"* passed as a variable into every narrative call. Cheap to add now while Doc 05 is still a template; easy to forget once the prompt is treated as "done" and stops getting revisited.

**Do not let the AI translate the disclaimer or any fixed legal copy inline** — per §1, that text is a separate, human-translated, fixed string appended after the AI's response, never generated by the model itself in any language.

---

## 5. Default language logic

- On signup: if `User.Country = Canada`, `EnabledLanguages` defaults to `[English, French]`; otherwise `[English]` only.
- `PreferredLanguage` itself defaults to English regardless of country, unless you want to detect browser locale (`fr-CA`) and default to French automatically for Quebec-presenting browsers — worth deciding, but not essential for MVP; a Canadian user can just flip the globe dropdown once.

---

## 6. Why French isn't just "a nice-to-have fourth language" — worth a specific question to your SaaS lawyer

English and French are Canada's official languages, and **Quebec's Charter of the French Language (commonly referenced as Bill 96) has real requirements around French-language availability for consumer-facing software and commercial communication with Quebec residents.** I'm not certain of the exact current threshold or whether it applies to a SaaS product at your stage — that's precisely the kind of question worth putting in front of the SaaS lawyer or the real-estate regulatory counsel among your four pending consultations, rather than guessing. If it does apply, that reframes French from "one of four nice options" to "a compliance requirement for any Quebec-resident users" — which would also argue for building EN/FR translation coverage *before* the Chinese variants, not alongside them as equal priority.

---

## 7. Recommended build order

1. **Now (fix in the active Claude Design session):** paste the prompt addition below to stop the prototype from showing a half-translated state — cheap, and stops the visual inconsistency from becoming the reference every later screen gets built against.
2. **Before Bubble build:** confirm Bubble's native language feature scope (§2), and get the Quebec question (§6) answered — it affects sequencing.
3. **Bubble build, Phase 1:** UI chrome + disclaimer in English and French only, using whichever mechanism §2 settles on.
4. **Phase 1.5:** AI narrative language parameter (§4) — small, but easy to forget since Doc 05 will otherwise look "finished."
5. **Phase 2:** Chinese Traditional/Simplified UI coverage, and reconsider option (B) from §3 as a real feature, not this pass's scope.

---

## Claude Design prompt addition — paste into the active session now

```
The language switcher (globe icon, top ribbon) currently only translates the
top navigation labels — table column headers, card labels ("TOTAL VALUE",
"CATEGORY", "CASH FLOW / MO", etc.), buttons, and filter pills stay in
English when another language is selected. Fix this: when a language is
selected from the globe dropdown, every piece of interface chrome on the
page should translate — nav, page titles, card labels, table headers,
button text, filter pills, tooltips — everything except: (1) user-entered
data like property names/addresses (e.g. "142 Maple Grove Ave." stays as
typed), and (2) imported file names. Keep the same visual layout and sizing;
only the text content changes per language.
```

---
*End of Doc 13 · Prompted by: Claude Design prototype screenshots (language switcher) · Related: 04 (Style Guide), 05 (Claude API Prompt Template), 08 (Pricing & Packaging — Canada/US market scope), 12 (Pre-Port Advisory Review)*
