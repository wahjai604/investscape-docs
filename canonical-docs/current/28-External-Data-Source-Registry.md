# InvestScape — External Data Source Registry (Doc 28)

**Version 1.1 · July 17, 2026** *(v1.1: "Neighbourhood Intel" name and psychographics deferral locked; map rendering + tile licensing added)*
**Status: Working registry. Licensing facts marked "verified Jul 2026" were checked against source terms on that date; re-verify before each build phase — API terms change frequently.**

---

## Purpose

Single canonical registry of every external data source considered for InvestScape: market data, mortgage/rate data, news syndication, assessment values, and the neighbourhood data layer. Each entry carries a licensing status so this doc doubles as the source-data agenda for the pre-launch legal consultations (tech/SaaS lawyer).

**Status column key:**
- **CORE** — free, cleanly licensed, build on it
- **LATER** — real value, deferred to a later phase or revenue stage
- **LEGAL CHECK** — usable only after licence verification or written permission
- **LINK-OUT** — cite/link only; never embed or republish
- **SKIP** — ruled out for now

---

## 1 · Canada — Market, Mortgage & Rate Data

| Source | What it provides | Access | Cost | Status |
|---|---|---|---|---|
| Bank of Canada Valet API | Policy rate, bond yields, FX, selected mortgage rate series | REST API, JSON/CSV, no key required | Free | **CORE** — powers CA side of ticker |
| CMHC Housing Market Info Portal | Rents, vacancy, starts, completions, absorption — national down to neighbourhood zones | Free portal + downloadable tables; no official public REST API (unofficial R wrapper `mountainMath/cmhc` exists). Use governed by CMHC data licence agreement | Free | **CORE** — scheduled table imports, not live API |
| Statistics Canada Web Data Service | New Housing Price Index, building permits, CPI, population, labour force | REST API, open government licence | Free | **CORE** |
| CREA National Stats / MLS® HPI | Benchmark resale prices, monthly national releases; HPI downloadable as .xlsx | Download free. **Terms (verified Jul 2026): content is for private, non-commercial use; any commercial use forbidden without CREA's prior written authority; must not be published/displayed in analyses, graphs, or charts without written consent** | Free to download; commercial licence = ask CREA | **LEGAL CHECK** — do not embed. Request licence or link out |
| Teranet–National Bank HPI | Monthly repeat-sales house price index (currently in v2 ticker mockup) | Free download from housepriceindex.ca | Free download; commercial display terms unverified | **LEGAL CHECK** — verify before wiring into ticker |
| Rentals.ca National Rent Report | Monthly asking rents by city | Free monthly report, no API | Free | **LINK-OUT** — editorial citation in Market News only |
| Municipal open data portals (Vancouver, Surrey, Toronto, Calgary, Edmonton…) | Building permits, zoning, development applications | JSON APIs, open licences | Free | **CORE (later)** — Dev Studio context data |

## 2 · Canada — News & RSS

| Source | Focus | Access | Cost | Status |
|---|---|---|---|---|
| Canadian Mortgage Trends | Mortgage industry news, rate commentary | RSS | Free | **CORE** — top CA mortgage feed |
| Better Dwelling | Data-driven housing news | RSS | Free | **CORE** — label editorial slant (often bearish) |
| Storeys | RE + development news | RSS | Free | **CORE** — fits developer persona |
| REM (Real Estate Magazine) | Industry news for realtors | RSS | Free | **CORE** — fits realtor persona |
| CBC Business / Global News housing tags | Mainstream coverage | RSS | Free | Selective |
| CMHC newsroom & market insights | Reports, outlooks | Free | Free | **CORE** — safe to summarize with attribution |

## 3 · US — Market, Mortgage & Rate Data

| Source | What it provides | Access | Cost | Status |
|---|---|---|---|---|
| FRED (already Phase 1) | Freddie Mac PMMS mortgage rates (MORTGAGE30US/15US), treasuries, CPI, Case-Shiller, housing starts — plus Zillow ZHVI series mirrored on FRED | REST API, free key | Free | **CORE — backbone.** Expand series list before adding any vendor |
| Zillow Research Data | ZHVI, ZORI, inventory — state → metro → city → county → ZIP → neighborhood | Free CSV downloads. Terms (verified Jul 2026): free public use for consumers, media, analysts, academics, policymakers; clear attribution to Zillow required. SaaS embedding = grey zone | Free | **LEGAL CHECK for direct embedding; prefer FRED mirrors** |
| Redfin Data Center | Market tracker, price drops, cancellations, investor purchases, Redfin HPI, migration, rental data | Free CSV downloads. Terms (verified Jul 2026): free to use with citation + link to Redfin on first reference | Free | **CORE** — most permissive broker source |
| Realtor.com Research Data | Inventory/listing metric CSVs | Free downloads w/ attribution — confirm current terms | Free | Secondary — verify terms |
| US Census APIs (ACS + Building Permits Survey) | Tract/block-group rents, vacancy, incomes; permits | REST API, free key | Free | **CORE** — US neighbourhood backbone |
| HUD USER APIs | Fair Market Rents, Income Limits | REST API, free token | Free | Useful, low effort |
| Rentcast (staged Phase 2) | Property records, rent estimates, comps — US only | REST API | Small free dev tier; paid usage tiers | **LATER** — as already planned |
| ATTOM / Cotality (CoreLogic) / Regrid | National parcel, assessment, AVM data | Enterprise APIs | Paid $$$ | **LATER** — revenue stage only |

## 4 · US — News & RSS

| Source | Focus | Access | Cost | Status |
|---|---|---|---|---|
| HousingWire | Mortgage + housing industry | RSS; HW+ paywalls some | Free (partial paywall) | **CORE** — headlines/link-out for gated pieces |
| Mortgage News Daily | Daily rates + mortgage news | RSS | Free | **CORE** — don't republish their rate index itself |
| Calculated Risk | Housing/econ analysis | RSS | Free (paid tier extra) | **CORE** |
| BiggerPockets Blog | Investor education | RSS | Free | **CORE** — individual-investor persona |
| NAR Newsroom | Existing-home-sales releases | Web | Free headlines; deep data restricted | **LINK-OUT** |
| Inman / The Real Deal | Industry + market news | Mostly paywalled | Paid | **SKIP / LINK-OUT** |

## 5 · Assessment Values

| Source | Coverage | Cost | Notes (verified Jul 2026 where flagged) | Status |
|---|---|---|---|---|
| BC Assessment | All of BC | **Paid.** Verified: Assessment Search Service $1,000/month for up to 500 searches (internal use only); bulk data licensed per-folio with volume/term pricing | Free one-off lookups on public site; no free API, no republication rights | **SKIP for now** — budget a licence only if assessments become a paid feature |
| City of Vancouver Open Data — Property Tax Report | Vancouver, ~225K properties | Free | Verified: contains BC Assessment + City data; current-year updated weekly; land value, improvement value, total assessed value, tax rates, zoning, legal descriptions; JSON API | **CORE** — the free BC workaround |
| Calgary Open Data | Calgary parcels | Free | Verified: current-year parcel assessments, Socrata SODA API | **CORE** |
| Edmonton Open Data | Edmonton parcels | Free | Verified: current-year + historical assessment datasets, Socrata SODA API — best historical depth | **CORE** |
| Alberta Regional Dashboard | All AB municipalities | Free | Verified: equalized assessments by year/type/municipality, CSV/JSON/XLSX — municipal totals, not parcels | Context only |
| Winnipeg Open Data | Winnipeg parcels | Free | Parcel assessment dataset on city portal | Nice-to-have |
| Ontario (MPAC) | All of Ontario | Paid/licensed | No open parcel-level data; Toronto open data ≠ assessments | **SKIP** — same posture as BCA |
| NYC (PLUTO), Cook County, King County, LA County | Major US counties | Free | Parcel-level assessed values on county open-data portals (Socrata/ArcGIS) | **CORE where covered** — city-by-city |
| National US assessments | All US | Paid (ATTOM etc.) | No free national source — 3,000+ counties | **LATER** — revenue stage |

---

## 6 · Neighbourhood Layer — Canada

*Feeds the Neighbourhood Intel feature (Doc 19 item 3). Backbone = census demographics + CMHC zones + municipal open data.*

| Source | What it provides | Access | Cost | Status |
|---|---|---|---|---|
| StatCan Census Profiles (Dissemination Area + Census Tract level) | Population, age, income, household composition, tenure (own vs rent), dwelling type/age/value, immigration, language, education, occupation, commute mode | Bulk downloads + Web Data Service; open government licence | Free | **CORE** — the CA demographic backbone. Note: 2021 data is current until 2026 Census releases begin (2027) |
| CensusMapper / `cancensus` | Convenience API over StatCan census data | API key | Free tier; **verify commercial terms** | LEGAL CHECK — or go direct to StatCan (clean licence) |
| CMHC HMIP neighbourhood zones | Rents + vacancy at neighbourhood-zone level | Table downloads | Free | **CORE** — the CA rent granularity answer |
| Municipal neighbourhood boundary files (Vancouver 22 local areas, Toronto 158 neighbourhoods, Calgary communities, Edmonton neighbourhoods) | Official polygon boundaries + local area profiles | GeoJSON, open data portals | Free | **CORE** — solves the "what is Point Grey" boundary problem in major cities |
| Police open data (VPD GeoDASH, Toronto Police PSDP, Calgary PS, Edmonton PS) | Crime incidents by neighbourhood/community | Open portals, attribution required | Free | **CORE** — neighbourhood-level; StatCan crime data is city-level only |
| Provincial school data (BC FSA results via BC Data Catalogue; Ontario EQAO) | School performance, locations | Open data | Free | **CORE** — raw scores are open |
| Fraser Institute school rankings | Composite school ratings | Proprietary | Free to view | **LINK-OUT only** — proprietary rankings |
| GTFS transit feeds (TransLink, TTC, etc.) | Stops, routes, frequency near a neighbourhood | Open GTFS files | Free | **CORE (later)** — transit-access stats |
| Walk Score API | Walk / Transit / Bike Score, **US + Canada** | REST API. Verified Jul 2026: free tier = 5,000 API calls/day for basic scores with branding requirements; Score Details / Public Transit / Travel Time APIs require paid Professional subscription. Terms prohibit reproducing/storing scores — fetch-and-display, don't warehouse | Free tier / paid Pro | **CORE (basic tier)** — respect no-caching terms |
| Environics Analytics PRIZM | 67-segment psychographic segmentation at postal-code level — THE Canadian psychographics product (powers many realtor tools) | Enterprise licence | Paid $$$ | **LATER** — free single-postal-code lookup tool exists for manual research only |
| Local Logic | Location scores API (powers Realtor.ca neighbourhood insights); Montreal-based | B2B API | Paid, contact sales | **LATER** — the CA-native commercial option if scores become a paid feature |

## 7 · Neighbourhood Layer — US

| Source | What it provides | Access | Cost | Status |
|---|---|---|---|---|
| Census ACS 5-year (tract + block group) | Full demographic suite: income, age, education, tenure, vacancy, commute, household composition | REST API, free key | Free | **CORE** — the US demographic backbone; annual releases |
| Census Geocoder | Address → tract/block group lookup | REST API | Free | **CORE** — plumbing for the crosswalk |
| FBI Crime Data Explorer API | Agency-level crime stats | REST API | Free | Context only — agency level, not neighbourhood |
| City police open data (NYPD, Chicago, LAPD, Seattle, etc.) | Incident-level crime by location | Socrata/ArcGIS portals | Free | **CORE where covered** — fragmented city-by-city |
| NCES / EDGE | School locations, district boundaries; state DOE test scores | Open data | Free | **CORE** — raw data open |
| GreatSchools | School ratings API | Partner licensing (free API discontinued ~2020) | Paid — confirm current terms | **LATER / LEGAL CHECK** |
| Walk Score API | Same as CA row — covers US + Canada | See Section 6 | Free tier / paid Pro | **CORE (basic tier)** |
| OpenStreetMap Overpass API | Amenity/POI data (cafés, parks, groceries, schools…) | Free API | Free — **ODbL licence: share-alike applies to derived databases** | **CORE with LEGAL CHECK** — see architecture note 2 |
| Foursquare Open Source Places | ~100M-POI open dataset, Apache 2.0 licence | Bulk download (Hugging Face/S3) | Free | **CORE** — cleanest licence for *stored* amenity stats |
| Yelp Places API | Business/amenity data + ratings | Verified Jul 2026: free access ended 2024; per-call paid plans only, 30-day trial (5,000 calls) | Paid | **SKIP** |
| Google Places API | Business/amenity data | Usage-based with monthly free allotment. **Terms prohibit caching/storing most Places data** | Effectively paid at scale | **SKIP** — caching prohibition conflicts with pre-computed-stats architecture |
| BLS LAUS / QCEW | County/metro employment + unemployment | REST API | Free | Useful context row |
| IRS SOI Migration Data | County-to-county migration flows | Bulk files | Free | Useful for "who's moving here" narrative |
| Claritas PRIZM Premier / Esri Tapestry | US psychographic segmentation | Enterprise licence | Paid $$$ | **LATER** — the US psychographics products |

---

## 8 · Psychographics — the honest position

There is **no free public psychographic dataset** in either country. True psychographics (values, attitudes, lifestyle segmentation) is a commercial product category: Environics PRIZM (CA), Claritas PRIZM Premier and Esri Tapestry (US), Local Logic scores (CA-native B2B). All enterprise-priced.

**v1 path (free):** build the neighbourhood profile from census demographics + CMHC/ACS housing data + amenity density + walkability, then let the Claude narrative layer describe the *measured* character of the area — e.g. renter share, median age bands, commute mode mix, amenity counts.

**Hard guardrail (extends the interpret-only rule):** the narrative describes pre-computed stats only. It must not infer lifestyle, attitudes, or "type of people" claims from demographics — that's both an overclaim (the exact failure mode the AI layer architecture exists to prevent) and a stereotyping risk. "62% of households rent and the median commute is 24 minutes by transit" — yes. "This is a young hipster neighbourhood" — never. If psychographic segments are ever wanted as a product feature, they get licensed (PRIZM/Tapestry) and displayed as attributed third-party data, not generated.

---

## 9 · Architecture Notes

**1. "Neighbourhood" is not a statistics unit — a crosswalk is required.**
Point Grey, Dundarave, and Aldergrove don't exist in census geography. The `Neighbourhood` type (Doc 19 item 3) needs: name, city/region, boundary polygon **or** a list of member census geographies (DAs/tracts in CA, tracts/block groups in US). Where cities publish official neighbourhood boundaries (Vancouver, Toronto, Calgary, Edmonton, most large US cities), use those polygons and assign census units by containment. Elsewhere, the crosswalk is a curated mapping — seed the launch cities manually, admin-editable like `JurisdictionSetting`.

**2. Storage rights decide the amenity source.**
The platform pre-computes and stores `NeighbourhoodStats` (single-writer, like every computed type). That rules sources in or out by their *caching* terms, not their price: Google Places prohibits storing data (out); Walk Score prohibits reproducing scores (fetch-and-display only, never warehoused); OSM's ODbL share-alike may attach to a stored derived database (lawyer question); Foursquare OS Places is Apache 2.0 (clean to store). Census, CMHC, StatCan, municipal open data: all clean to store.

**3. `NeighbourhoodStats` is a computed type.**
Aggregation happens at import time from the member census units — never at page load, never by the AI. The narrative payload gets the finished stats, same contract as DealMetrics.

**4. Update cadence expectations.**
CA census: 5-yearly (2021 current; 2026 Census releases begin 2027). US ACS: annual. CMHC rental survey: annual (October, published ~January). Crime portals: typically weekly–monthly. Set refresh schedules per source; show "data as of" on the Neighbourhood Intel page — same honesty-flag discipline as the equity-growth chart.

**5. Map rendering & tiles (Neighbourhood Intel map card).**
- **Bubble build:** Leaflet.js via the HTML element + CDN pattern — the exact escape hatch already validated by ApexCharts (Doc 03B), with the same destroy/guard discipline plus `map.invalidateSize()` on container resize (the map card lives inside the Doc 24 Customize system, so it inherits the chart-reactivity class of problems from Docs 20/17c/27 — budget accordingly).
- **Widget registry:** the map is a new `WidgetId` (`neighbourhoodIntel.map`) in the Doc 24 registry — self-contained per the widget principle, which also keeps it Route 2 pop-out-ready.
- **Interaction phasing:** v1 = type-ahead neighbourhood search (native Bubble searchbox on `Neighbourhood`) + **display-only** map highlighting the selected boundary polygon. Click-to-select on the map = later phase — it requires boundary polygons rendered as an interactive layer *and* a JS-to-Bubble event bridge (Toolbox plugin), a pattern not yet validated in this build.
- **Tiles:** do **not** use openstreetmap.org's own tile servers in production (their usage policy is for light/community use). Free-tier commercial options with dark basemaps matching the terminal aesthetic: **Carto Dark Matter**, **Stadia Alidade Smooth Dark**, or **MapTiler** free tier — all require attribution (provider + OpenStreetMap contributors).
- **Route 2 port:** the data contract (Neighbourhood → NeighbourhoodStats + GeoJSON boundaries + tile provider) is stack-agnostic. In the custom stack, the shell swaps to react-leaflet, or upgrades to MapLibre GL vector tiles for smoother pan/zoom and hover states; data, boundaries, and tiles carry over unchanged.

---

## 10 · Legal Consultation Agenda (source-data items)

1. **CREA MLS® HPI** — written consent required for any commercial display. Decide: request licence, or exclude and use Teranet/StatCan NHPI instead.
2. **Teranet–NBC HPI** — verify commercial display terms (currently in the v2 ticker mockup).
3. **Zillow Research data** — confirm whether "public use" framing covers SaaS embedding, or rely on FRED mirrors.
4. **RSS syndication pattern** — confirm headline + short snippet + attribution + link-out as the standing rule (answers Doc 19 item 2's open question). Full-text republication never.
5. **OSM ODbL share-alike** — does storing derived amenity aggregates trigger share-alike? If murky, use Foursquare OS Places (Apache 2.0) instead.
6. **Walk Score branding + no-storage terms** — confirm the fetch-and-display integration pattern complies.
7. **School ratings** — raw government scores are open; proprietary rankings (Fraser Institute, GreatSchools) are link-out or licensed only.
8. **Map tiles** — confirm the chosen basemap's free tier permits commercial SaaS use and the required attribution format (OSM's own tile servers are not for production use).

## 11 · The $0 v1 Stack (summary)

**Market/rates:** FRED (expanded series) + BoC Valet + StatCan WDS + CMHC imports + Redfin CSVs
**News:** direct RSS from Section 2 + Section 4 CORE feeds, aggregated via Make (staged Phase 2). **Not NewsAPI** — verified Jul 2026: free tier is development-only, production tier $449/month, and terms prohibit republishing article content anyway. If an aggregator API is ever wanted: Mediastack (from ~$11/mo) or NewsData.io (free tier explicitly permits commercial use).
**Assessments:** Vancouver + Calgary + Edmonton open data (parcel-level, free). BCA/MPAC licences deferred.
**Neighbourhood:** StatCan census + CMHC zones (CA), ACS + city portals (US), municipal boundaries, police open data, Walk Score basic tier, Foursquare OS Places.

Total recurring cost: **$0.**

---

## Decision Log

| Decision | Status |
|---|---|
| v2 mockup Data Sources pill changes "NewsAPI · RSS" → "RSS" | **Locked** (this doc) |
| Safe v1 ticker = BoC + FRED series only, pending CREA/Teranet licence answers | **Locked** (this doc) |
| RSS display pattern = headline + snippet + attribution + link-out | Proposed — confirm with SaaS lawyer (agenda item 4) |
| Tab rename: "Market Intel" → **"Neighbourhood Intel"** (supersedes Doc 19 item 3's working name "Neighbourhood Details") | **Locked (Jul 17, 2026)** — update Doc 19 item 3 when picked up; rename still executes in its own deliberate pass since it touches translation dictionaries |
| Psychographics = deferred licensed feature (**Route 2+**); v1 ships demographic profiles + stat-bound narrative | **Locked (Jul 17, 2026)** |

*End of Doc 28 · v1.0*
