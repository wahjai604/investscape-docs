# InvestScape — Community: Board Hierarchy & Post-Type Tag Legend (Doc 36)

---

## PART A — Board Hierarchy / Directory

Synthesizes the three competitor patterns discussed: Reddit's personalized-shortlist sidebar, Discord's collapsible parent/child tree, Stockhouse's search-first necessity at scale.

### Schema

**New data type: `Board`** (self-referencing, so it scales to any depth without new fields)
| Field | Type | Notes |
|---|---|---|
| Name | text | e.g. "Metro Vancouver," "Residential" |
| ParentBoard | Board (self-link) | empty = top-level board |
| BoardType | option set: Geographic, Topic | matches your existing Market Boards / Topic Boards split |
| MemberCount | number | |
| Description | text | shown in the directory, not the sidebar |

**New field on `User`:** `FollowedBoards` (list of Board) — drives the sidebar's personalized shortlist, same mechanism as `EnabledLanguages`.

### Sidebar (unchanged from a user's perspective, just capped)
Shows the user's `FollowedBoards`, capped at ~5–8, most-active-first if not manually reordered. A "Browse all boards →" link sits below both the Market Boards and Topic Boards sections once the full list exceeds what fits — this replaces trying to fit a growing list into a fixed sidebar.

### Directory page (new)
- Search bar at the top — type a city, region, or topic, jump straight there. This is the Stockhouse lesson: once boards number in the hundreds, search beats browsing.
- Below the search: the tree, parent boards collapsed by default with a chevron to expand into children (e.g. "Metro Vancouver" expands to reveal "Residential," "Commercial," "Recreational" as sub-boards) — the Discord pattern.
- Each board row has a "Follow" toggle, which adds/removes it from the sidebar shortlist immediately.

### Build note
No urgency — only 10 demo boards exist today. The value of specifying this now is that `Board`'s self-referencing parent link costs nothing to build in from day one, versus retrofitting a flat list into a hierarchy after real boards and real follow-relationships already exist.

---

## PART B — Post-Type Tag Legend & Formalized Tag System

### New option set: `PostTag` (formalizes what's currently ad-hoc styling)

**Schema note:** `Post` gets a `Tags` field as a **list of PostTag** (multi-select), not a single value — a post can carry more than one (e.g. DD + Success Story together, as you described). `Deal Attached` stays a separate, automatic system indicator (added when a snapshot is actually attached, not something a user picks from the tag list) — it's a fact about the post, not a subjective label, so it doesn't belong in the same multi-select as the others.

| Tag | Color | Meaning |
|---|---|---|
| BULL | Green | A bullish take — the poster thinks this trend/deal/market is a positive sign |
| BEAR | Red | A bearish take — the poster sees a warning sign or downside risk |
| Q | Blue | A question — the poster is asking for input, not making a claim |
| DD | Purple | "Due Diligence" — a deep, researched analysis post (comps pulled, numbers shown), not just a quick take |
| News | Slate blue | Sharing an external article or news item for discussion |
| Scam Alert | Bright red/orange, high-visibility | Warning about a specific fraud pattern (wire fraud, title fraud, rental scams) — deliberately styled differently from BEAR so it reads as a safety warning, not market pessimism |
| Meetup | Teal | Announcing an in-person or virtual investor meetup |
| Success Story | Small trophy icon, gold-adjacent but visually distinct from the Top Contributor pill | A completed deal or win being shared |

**Not a post tag — stays separate:** `Top Contributor` is a *user* reputation label (Doc 35), shown next to a person's handle, not something attached to an individual post. `Deal Attached 🔒` is automatic, as noted above. Both are visually distinct from the `PostTag` pills so the three categories (post-type, user reputation, automatic fact) never get confused with each other.

**Display when a post has multiple tags:** show them as separate pills side by side (e.g. `DD` `Success Story`), same visual weight, no primary/secondary hierarchy between them — the poster chose both intentionally.

### The legend UI
A small "**?**" info icon next to the Top Contributors panel header (or near the board list). Clicking/tapping opens a compact popover — not a full modal, this doesn't need to interrupt — listing each active tag with its color swatch and one-line meaning, matching the table above. Closes the exact gap you flagged: a new user seeing "BULL," "Q," "BEAR" for the first time currently has to guess.

---

## Claude Design prompt — full tag system, multi-select, and legend

```
Build out the Community post-tag system with all eight tags, multi-select
support, and an explanatory legend.

1. Add all eight post tags: BULL (green), BEAR (red), Q (blue), DD
   (purple), News (slate blue), Scam Alert (bright red/orange, distinctly
   more urgent-looking than BEAR), Meetup (teal), Success Story (small
   trophy icon rather than pill styling, gold-adjacent but visually
   distinct from the existing Top Contributor pill).

2. MULTI-SELECT: when composing a post, let the user pick MORE THAN ONE
   tag (a chip/checkbox picker above or below the text input — clicking
   multiple tags selects all of them, not just the last one clicked).

3. MULTI-TAG DISPLAY: where a post has more than one tag, show them as
   separate pills side by side, same visual weight, no hierarchy between
   them (e.g. a post tagged both DD and Success Story shows both pills
   next to each other).

4. Add 2-3 new demo posts to Metro Vancouver's board using some of the new
   tags — include at least one post with TWO tags at once (e.g. DD +
   Success Story) to demonstrate the multi-tag display working.

5. LEGEND: add a small "?" info icon next to the "Top Contributors" panel
   header. Clicking/tapping it opens a compact popover listing all eight
   tags with their color/icon and a one-line plain-English meaning (see
   the table in this doc), plus one line clarifying that "Top Contributor"
   (next to a person's name) and "Deal Attached" (automatic, not a chosen
   tag) are different from the tags above.

All tag names, meanings, and legend text go in the i18n dictionary, all
four languages.

Screenshot: the tag picker with multiple tags selected during compose,
a post showing two tags together, and the legend popover open in English
and French.
```

---
*End of Doc 36 · Board hierarchy (Part A) is a design reference for the eventual Bubble build, not yet prompted · Legend (Part B) is prompt-ready now*
