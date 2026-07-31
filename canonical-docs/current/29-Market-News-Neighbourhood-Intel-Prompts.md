# InvestScape — Market News & Neighbourhood Intel: Redesign Prompts (Doc 29)

**Resolves Doc 19 items 2 and 3, now that both have a documented data foundation (Doc 28) to design against.** Two separate, self-contained Claude Design prompts — paste **one at a time**, in separate sessions, same one-thing-at-a-time discipline as Doc 16. They're independent of each other and can run in either order.

Both prompts assume the current v2 unified shell (dark navy `#0C1B2E`, `bg-card #171B26`, gold `#D9B04A`, Fraunces/Inter/DM Mono, existing `.pill`/`.card`/`.badge` styles) — reuse those tokens exactly, don't reinvent them.

---

## Prompt A — Market News (renamed from Research)

**What this addresses:** Doc 19 item 2's rename and its open question (how syndicated RSS content is sourced/attributed vs. staff content); the "Data Sources" pill fix already flagged in Doc 28 (drop NewsAPI, it's not commercially usable free); the stale `✓ PRO` badge in the Top Contributors panel, which the Verified Pro removal (recent decision) makes incorrect wherever it still appears; and Doc 12/16's loading/error/empty-state discipline applied to a genuinely async, multi-source feed for the first time.

**Proposed pattern, flagged as pending legal confirmation:** syndicated content displays as headline + short snippet + source attribution + external link — never full article text. This is the safe default from Doc 28 §10 item 4, not yet confirmed by the SaaS lawyer. The prompt below builds toward that pattern; don't let it harden into "final" until legal signs off.

```
Rename the "Research" tab to "Market News" throughout the nav and page
header. This page now carries two distinct kinds of content, and they
need to look visibly different from each other — a user should be able
to tell at a glance which is which without reading the byline closely:

1. STAFF RESEARCH — original analysis written by InvestScape's research
   desk (the existing feature-card treatment: large thumbnail, "AI
   Analysis" or similar pill, headline, teaser paragraph, InvestScape
   Research Desk byline, read time, rating). Keep this mostly as-is.

2. SYNDICATED MARKET NEWS — headlines pulled from external real estate
   and mortgage news sources (Canadian Mortgage Trends, Better Dwelling,
   Storeys, HousingWire, Calculated Risk, and similar — you don't need
   the exact list, just design for "external source, various logos/
   names"). Each syndicated item shows: a small source name/logo, a
   category pill (e.g. "Mortgage & Rates", "Development", "CA Market",
   "US Market"), the headline, a SHORT one-to-two-line snippet (not the
   full article), a relative timestamp ("4h ago"), and a clearly visible
   "Read on [Source Name] →" link that would open the original article
   on an external site. Do not design this as if InvestScape is hosting
   the full article — it's explicitly a headline-and-link-out pattern,
   visually closer to a curated link list than a blog post.

Add a filter/chip row above the feed letting users narrow by category:
"All", "InvestScape Research", "Mortgage & Rates", "CA Market", "US
Market", "Development" — chips look like the existing filter-chip style
already used on Portfolio.

Add THREE missing system states to this page, matching the loading/
error/empty pattern already used elsewhere in the app (subtle pulsing
skeleton blocks in the shape of the content, a small inline warning icon
+ one plain-English line + "Try again" for errors, never a raw error
code):
- LOADING: skeleton cards while the news feed is fetching (this feed
  pulls from multiple external sources, so it's meaningfully async).
- ERROR: if the feed fails to load, show "We couldn't load the latest
  market news right now. [Try again]" in place of the feed, not a modal.
- EMPTY (edge case): if a category filter returns zero results, show a
  brief "No stories in this category right now — try All" message
  instead of a blank feed area.

Fix the existing "Top Contributors" sidebar panel: it currently shows a
"✓ PRO" badge next to a contributor name. Replace this with a "Top
Contributor" pill styled as an achievement/reputation badge (not a
verification checkmark) — it should visually read as "earned through
activity," not "professionally verified." Do not use a checkmark icon
for this, to avoid it looking like a credential confirmation.

Update the sidebar "Data Sources" panel (if present on this page) to
show "RSS" instead of "NewsAPI · RSS" as the news-sourcing pill.

Add the standard disclaimer component at the bottom of the page, but
give the syndicated section its own small note distinct from the AI/
analysis disclaimer — something like "Syndicated headlines are provided
by third-party sources; InvestScape does not independently verify their
content" — visually lighter-weight than the main disclaimer, placed near
the syndicated feed section rather than only at the page bottom.
```

---

## Prompt B — Neighbourhood Intel (renamed from Market Intel)

**What this addresses:** Doc 19 item 3's full scope — the genuinely new feature, not a rename — using the data foundation Doc 28 just locked: municipal boundary files, StatCan/Census demographics, CMHC/ACS rent data, Walk Score, and the map architecture note (Leaflet + CDN pattern, dark basemap, v1 = type-ahead + display-only boundary highlight, click-to-select deferred).

**This one is a genuine interactive prototype, not a static mockup** — same reasoning as the ApexCharts donut demo in Doc 09's addendum: building a small working version now, with Leaflet loaded live via CDN, is how you confirm the search→highlight→stats-panel reactivity pattern actually behaves the way Bubble will need it to, before anyone touches Figma. Use real neighbourhood names (Point Grey, Dundarave, Kitsilano) as seed data since those are Eric's own reference points.

```
Build an interactive prototype for InvestScape's "Neighbourhood Intel"
page (renamed from "Market Intel"), demonstrating a map-driven
neighbourhood lookup above the existing KPI/ticker layout.

Style: reuse the existing dark terminal tokens exactly — background
#0C1B2E, cards #171B26, gold accent #D9B04A, text #F7F5EF, borders
rgba(255,255,255,0.08), Fraunces for headings, Inter for body, DM Mono
for every number. The map's basemap should be a DARK tile style so it
matches the surrounding UI, not a bright default map — use a free dark
basemap like Carto's "Dark Matter" tiles via CDN
(https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png)
with small attribution text "© OpenStreetMap contributors © CARTO" in
the map's corner, matching the app's existing small-print styling.

Layout, top to bottom:

1. A NEW map card, full-width, positioned above the existing KPI/ticker
   row. Load Leaflet.js via CDN (https://unpkg.com/leaflet@1.9.4/dist/
   leaflet.js and its CSS). Above the map, a type-ahead search input
   ("Search a neighbourhood — try Point Grey, Dundarave, Kitsilano…").

2. Seed THREE example neighbourhoods with a simple approximate polygon
   each (rough rectangles are fine, this is a prototype, not real GIS
   data): Point Grey (Vancouver), Dundarave (West Vancouver), Kitsilano
   (Vancouver). As the user types, show matching suggestions below the
   input; selecting one should: pan/zoom the map to that neighbourhood,
   draw its polygon outline in gold (#D9B04A) with a subtle fill, and
   populate the stats panel below (step 3) with that neighbourhood's
   data. Before drawing a new selection, clear/remove the previous
   polygon layer first — don't stack multiple outlines on the map.

   IMPORTANT — v1 scope: the map is SEARCH-DRIVEN ONLY for now. Do NOT
   make the polygons clickable/selectable directly on the map yet — draw
   them as visible but non-interactive shapes. This is a deliberate
   phase boundary, not an oversight.

3. Below the map, a stats panel for the selected neighbourhood, using
   the existing KPI-card and card styling: median home price, median
   rent, a Walk Score-style badge (0-100, colored by range), population,
   percent renter vs. owner households, median age, and a simple bar or
   donut showing commute mode split (drive/transit/walk/other) — use
   plausible illustrative numbers. Each stat card shows a small "as of
   [date]" note in text-3 gray, same honesty-flag pattern used elsewhere
   in the app for data currency.

4. An AI narrative panel below the stats, styled like the existing "AI
   Morning Brief" callout. Write the placeholder copy so it ONLY
   describes the numbers shown above — e.g. "62% of households in this
   area rent, with a median commute of 24 minutes by transit" — and does
   NOT characterize the neighbourhood's lifestyle, vibe, or "type of
   people" (no phrases like "young professional area" or "family-
   friendly vibe"). This placeholder copy should model the tone the real
   AI narrative will need to follow, not just fill space.

5. Before any neighbourhood is searched/selected, the map should default
   to a city-wide view (e.g. centered on Vancouver) with the search box
   prominent and a light prompt like "Search a neighbourhood to see its
   local stats" where the stats panel would otherwise be — this is the
   page's empty state.

Add loading and error states for the stats panel specifically (not just
the map): a brief skeleton-card state while a neighbourhood's stats
"load" after selection (simulate a short delay), and an error state
("We couldn't load stats for this area yet — try another neighbourhood")
for a neighbourhood name typed that doesn't match the seed data.

Keep the existing ticker strip (CA 5-yr Fixed, BoC Overnight, US 30-yr
Fixed, 10-yr Treasury, CA CPI, Teranet HPI) above everything, and keep
the existing "Watchlist Movers" and "Data Sources" sidebar cards below
the new map/stats section rather than removing them — this page is
gaining a section, not being replaced.

Add one line of small italic text at the bottom: "Prototype: verifies
neighbourhood search → map highlight → stats panel reactivity for
InvestScape Neighbourhood Intel."
```

---

## Notes for after both prompts run

- **PageID naming — locked (Jul 17, 2026):** internal identifiers now track the new display names. See Doc 30 for the full rename — `Research` → `MarketNews`, `MarketIntel` → `NeighbourhoodIntel`, plus every affected `WidgetId`.
- **New WidgetId:** the map card registers as `neighbourhoodIntel.map` in the Doc 24 widget registry, consistent with the existing `pageId.widgetName` convention.
- **Teranet HPI ticker cell:** still carries the Doc 28 §10 legal-check flag (commercial display terms unverified). Left in both prompts as-is since removing it isn't this pass's job — just don't let it get treated as cleared because it survived a redesign.
- **Click-to-select on the map:** intentionally out of scope in Prompt B (Doc 28 architecture note 5). Once boundary-polygon interactivity and the JS-to-Bubble event bridge are validated, that becomes its own follow-up prompt — same "don't bundle" discipline as everything else in this build.

---
*End of Doc 29 · Implements: 19-Deferred-Items-Queue.md items 2 & 3 · Data foundation: 28-External-Data-Source-Registry.md · Style tokens: 04-InvestScape-Style-Guide.md · Pattern precedent: 09-UX-Stress-Test-Addendum-Chart-Reactivity.md (reactive prototype approach), 16-Master-Claude-Design-Prompt-Pack.md (system-states discipline)*
