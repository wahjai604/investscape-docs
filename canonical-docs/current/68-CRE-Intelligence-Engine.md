# E68 — Commercial Real Estate Cap Rate & Construction Cost Intelligence

**Status:** Phase 1 contract/normalization design
**Engine family:** Commercial Real Estate Intelligence
**Jurisdictions:** Canada and United States
**Primary implementation:** `investscape-market-intelligence-engine/src/cre-intelligence/`

## Why E68

The existing active engine registry uses E60–E66 for Market Intelligence integration endpoints. A repository-wide search found no E67 implementation or registration. E68 is therefore the next available engine number for the Commercial Real Estate Intelligence family.

E68 is intentionally separated as its own domain module rather than mixing commercial real-estate cap-rate and construction-cost methodology into the existing generic statistical/market-intelligence primitives.

## Phase 1 scope

E68 establishes normalized data contracts and deterministic calculation primitives for:

1. Commercial real-estate cap-rate observations.
2. Construction hard-cost observations.
3. Construction soft-cost observations.
4. Construction-cost indexes and escalation.
5. Source provenance, licensing notes, and source-quality inputs.
6. Weighted consensus across independently supplied observations.

E68 does **not** copy or redistribute proprietary brokerage, transaction-database, valuation, or construction-cost datasets. It stores normalized observations and provenance so licensed or public data can be ingested without confusing public availability with redistribution rights.

## Planned source classes

### Canada

- Statistics Canada — Building Construction Price Index and related construction statistics.
- CMHC — housing/development and rental market data.
- CBRE Canada, Colliers Canada, JLL, Cushman & Wakefield, Avison Young and other brokerage research.
- Altus Group — Canadian construction-cost and valuation research where licensing permits use.
- Turner & Townsend and Rider Levett Bucknall — construction cost and escalation research.
- Provincial and municipal open-data sources for development charges, permits, assessments and related inputs.

### United States

- U.S. Census Bureau — construction spending and building activity.
- Bureau of Labor Statistics — Producer Price Index and construction-related price series.
- Federal Reserve/FRED — rates and macro inputs used for contextual analysis.
- HUD, GSA, FHFA and state/local government sources where relevant.
- CBRE, Colliers, JLL, Cushman & Wakefield, Newmark, Marcus & Millichap and other brokerage research.
- RLB, Turner & Townsend and other construction-cost research.

### Proprietary transaction/valuation sources

MSCI/RCA, CoStar, RealPage, ARGUS/Altus and similar sources are treated as premium reference sources. E68 must not reproduce their proprietary records without appropriate rights.

## Core data model

`CREObservation` contains:

- metric: `cap_rate`, `hard_cost`, `soft_cost`, or `construction_index`
- asset class
- normalized geography
- observation period
- point estimate and/or low/high range
- unit and cost basis
- source metadata
- explicit source-quality score
- optional sample size and tags

`CRESource` records source identity, source type, methodology URL, retrieval date and licensing notes.

## Calculation rules

### Weighted consensus

For observations with explicit source-quality scores:

`weightedValue = Σ(value × sourceQuality) / Σ(sourceQuality)`

Source quality is supplied by the caller. E68 must never infer reliability from a publisher's name.

Published low/high ranges are retained rather than collapsing the market into a false point estimate.

### Construction escalation

`escalatedCost = baseCost × (targetIndex / baseIndex)`

This permits a historical hard-cost benchmark to be brought to a current period using an appropriate construction-cost index such as StatsCan BCPI, BLS PPI or RLB, subject to the index's published methodology and coverage.

## Hard vs. soft cost policy

Hard cost and soft cost are separate metrics. E68 must not silently convert an index or contractor-price measure into total development cost.

Soft costs may be represented as:

- absolute cost per SF;
- absolute cost per unit; or
- percentage of hard cost.

The eventual development/pro-forma engine will combine E68 outputs with land, financing, development charges, taxes, contingency and developer-profit assumptions.

## Confidence policy

E68 should expose the underlying observations and source IDs used for any consensus result. Confidence should be derived from explicit data-quality inputs and observation breadth, not from the brand name of a publisher.

## Phase 2 roadmap

- Source adapters for public government APIs/downloads.
- Cap-rate range normalization by asset class, quality, geography and lease characteristics.
- Construction-cost normalization by asset class, building height/type and geography.
- Soft-cost benchmark framework.
- Geographic cost factors and escalation history.
- Source freshness and revision handling.
- API endpoint and schema integration.
- Development residual land-value integration with existing calculation engines.
- Back-testing against known transactions and completed projects.

## Licensing and provenance

All source records must distinguish:

- public/open data;
- public research that is viewable but not necessarily redistributable;
- licensed commercial data;
- user-supplied data; and
- derived calculations.

No GitHub repository's code or dataset is assumed commercially reusable merely because it is publicly visible. A recognized license or explicit permission is required before incorporating third-party code/data into proprietary InvestScape components.

© 2026 Lighthouse Research Ltd. All rights reserved.
