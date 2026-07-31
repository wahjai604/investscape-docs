# InvestScape — Tab Name Unification (Doc 30)

**Locks the decision from Doc 29: front-end display names and internal identifiers both change together, everywhere.** This closes Doc 19 items 2 & 3's naming half, extends Doc 24's schema, and gives Claude Design a fix prompt to apply the rename to the mockup's nav and i18n dictionary — the same "just finished, don't re-touch mid-cycle, rename in its own deliberate pass" moment Doc 19 flagged is now.

**Rename map:**

| Old | New |
|---|---|
| Research (tab) | Market News |
| Market Intel (tab) | Neighbourhood Intel |

---

## 1. Doc 24 — `PageID` option set (supersedes Doc 24 §2)

| Old value | New value |
|---|---|
| `Research` | `MarketNews` |
| `MarketIntel` | `NeighbourhoodIntel` |

No other `PageID` values change. Update Doc 24's table in §1 and the option set in §2 on its next full-doc pass.

## 2. `WidgetId` renames (supersedes Doc 24 §3 / Doc 26's widget list)

| Old `WidgetId` | New `WidgetId` |
|---|---|
| `research.todaysNumbers` | `marketNews.todaysNumbers` |
| `research.topContributors` | `marketNews.topContributors` |
| `research.trendingTags` | `marketNews.trendingTags` |
| `marketIntel.aiMorningBrief` | `neighbourhoodIntel.aiMorningBrief` |
| `marketIntel.marketCards` | `neighbourhoodIntel.marketCards` |
| `marketIntel.watchlistMovers` | `neighbourhoodIntel.watchlistMovers` |
| `marketIntel.dataSources` | `neighbourhoodIntel.dataSources` |
| *(new, from Doc 29)* | `neighbourhoodIntel.map` |

**If any `WidgetLayoutItem` rows already exist in a live Bubble app under the old `WidgetId` strings, this is a data migration, not just a doc edit** — a scheduled backend workflow to rewrite existing rows' `WidgetId` values, same discipline as any other schema rename in this project. If nothing's been built in Bubble yet, this is free — just build with the new names from the start.

## 3. i18n dictionary — keys and values (all four languages)

The mockup's `I18N` object (`investscape-v2-unified-addendum.html`) currently uses `research` and `intel` as both the object keys and the nav labels. Rename the keys to match the new `PageID` convention, and update the display value in every language:

| Language | Old key: value | New key: value |
|---|---|---|
| English | `research: 'Research'` | `marketNews: 'Market News'` |
| English | `intel: 'Market Intel'` | `neighbourhoodIntel: 'Neighbourhood Intel'` |
| French | `research: 'Recherche'` | `marketNews: 'Actualités du marché'` |
| French | `intel: 'Veille de marché'` | `neighbourhoodIntel: 'Infos quartier'` |
| Chinese (Trad.) | `research: '研究'` | `marketNews: '市場新聞'` |
| Chinese (Trad.) | `intel: '市場情報'` | `neighbourhoodIntel: '社區情報'` |
| Chinese (Simp.) | `research: '研究'` | `marketNews: '市场新闻'` |
| Chinese (Simp.) | `intel: '市场情报'` | `neighbourhoodIntel: '社区情报'` |

**One nice side effect:** the Chinese translations already used 情報/情报 ("intel/intelligence") as the suffix for "Market Intel" — so "Neighbourhood Intel" keeps that exact suffix and just swaps the "market" root for "community/neighbourhood." The brand-level word "Intel" survives the rename in Chinese even though the English swaps to a different word. French doesn't have as clean an equivalent, so "Infos quartier" is a reasonable compact rendering, not a precise linguistic match.

**Flag, not a blocker:** these French and Chinese renderings are my best-effort translations, not the human-reviewed originals Doc 13 §1 requires for disclaimer text. Nav labels are lower-stakes than legal copy, but worth a quick native-speaker sanity check before this ships, same general care — just not the "never machine-translate" hard rule that applies specifically to the disclaimer.

## 4. Claude Design fix prompt — apply the rename to the mockup

```
Two small, precise renames to the nav and translation dictionary — this
touches the i18n system that was just finished, so be exact and don't
change anything else nearby.

1. In the top ribbon nav, rename the "Research" tab to "Market News", and
   the "Market Intel" tab to "Neighbourhood Intel". Update the page
   header/title on each of those two pages to match (wherever the page
   currently displays "Research" or "Market Intel" as its own heading, not
   just in the nav).

2. In the i18n translation dictionary, rename the two affected keys and
   update their values in all four languages exactly as follows — keep
   every other key and value in the dictionary unchanged:

   English:    research → marketNews = "Market News"
               intel → neighbourhoodIntel = "Neighbourhood Intel"
   French:     marketNews = "Actualités du marché"
               neighbourhoodIntel = "Infos quartier"
   Chinese (Traditional): marketNews = "市場新聞"
                          neighbourhoodIntel = "社區情報"
   Chinese (Simplified):  marketNews = "市场新闻"
                          neighbourhoodIntel = "社区情报"

Do NOT touch the "Community", "Library", or "Workspace" keys/labels — only
these two are renaming.

After making the change, switch through all three non-English languages
(French, Chinese Traditional, Chinese Simplified) and take one screenshot
of the nav in each, confirming both renamed tabs display the correct new
text and no other nav label shifted or broke.
```

---

## 5. What this does and doesn't touch

- **Does not require re-running Doc 18's Fix Prompt D or Doc 18b** — this is a two-key rename inside an already-working translation system, not new translation coverage. Scope stays small on purpose.
- **Does not change Prompts A or B in Doc 29** — both already use the new display names throughout; this doc is what makes the internal plumbing match what those prompts assume.
- **Doc 19 items 2 & 3, Doc 24, and Doc 26** each have a stale reference to the old names sitting in them — fold this rename into each on its next full-doc pass, per standing document discipline. Nothing needs fixing in them today; this doc is the authoritative record until that happens.

---
*End of Doc 30 · Supersedes naming in: 24-Customizable-Layout-System.md §2–3, 26-Customizable-Layout-Prompt.md (widget list), 19-Deferred-Items-Queue.md items 2 & 3 · Implements: 29-Market-News-Neighbourhood-Intel-Prompts.md*
