# 19 — Market Intel map server/client/storage responsibility review

Date: 2026-10-08. Read-only architecture proposal for review. It is renderer- and provider-neutral. This note does not verify the current deployment topology or authorize code, schema, storage, or WeWeb changes.

## Proposed responsibility split

| Concern | Proposed responsibility | Why | Verification still required |
|---|---|---|---|
| Provider access and refresh | Server-side source adapters retrieve public/statistical records on a source-appropriate schedule. Validate shape, period, geography key, symbols, units and provenance before making records queryable. | Avoids exposing provider credentials where applicable, prevents every map pan from triggering source acquisition and gives one place to handle refresh/error/suppression states. | Current Railway API route/job inventory, provider access terms, each source's cadence and any key requirements. No Research/news ingestion is included by implication. |
| Canonical source record | Preserve source observation, provider/table ID, source key, source period, retrieval/release date, license/attribution, quality flags and raw-to-normalized mapping. Retain immutable raw extract or equivalent audit reference where terms allow. | Allows corrections, stale-data checks, provenance and repeatable display. | Current approved storage, retention, backup, access and deletion policies. No source dataset is currently approved for storage by this review. |
| Geospatial boundaries | Maintain matching boundary datasets separately from metric observations, keyed by provider geography ID and boundary vintage. Publish generalized render geometries for map scale and preserve authoritative reference geometry/version. | Geometry has its own provenance, versioning, size and update lifecycle. It should not be regenerated per user request. | Verify Canadian DGUID feature matches and U.S. GEOID/state matches against downloaded official boundary files. Confirm redistribution/use terms for each file. |
| Query and response | An authenticated read API returns only the selected market context, requested layer summaries/observations, boundary IDs/geometries or tile references, source metadata, and explicit stale/unavailable/quality states. Apply entitlement and private-record rules before returning data. | Limits payload by selected geography/viewport and makes web/mobile clients consistent. | Existing route registry, auth model, Data API exposure and exact public/private field rules. No endpoint contract implementation occurs here. |
| Client rendering | WeWeb's client owns pan/zoom, active layer toggles, selection/highlight, legend placement/collapse/pin, responsive interaction and accessible map controls. A renderer (MapLibre or Leaflet) paints returned boundaries and overlays. | These are interactive view concerns and should respond without writing user data by default. | Whether either renderer fits the chosen boundary, style, accessibility and volume tests. |
| User map state | Keep temporary view state (viewport, selected geography, open panel and active layers) in client memory/session by default. Persist only an explicit saved view or user preference after scope, retention and privacy decisions. | Avoids creating durable records for every exploratory gesture. | Which existing user/project records may own saved views and preferences. Do not add a table by assumption. |
| Portfolio overlay | Retrieve owner-authorized portfolio/development records through existing backend rules and join them to map only when the user explicitly enables the layer. Never expose the layer in a public shared image by default. | Portfolio points/values are user data and have materially different privacy from public statistics. | Existing portfolio API/data shape, coordinate quality, privacy rules and explicit share/export flow. |
| Research overlay | Request only approved/published Research records and their authorized geographic tags; render source markers/cards as a separate overlay. | Research is qualitative content with publication/rights constraints; it is not a metric value to merge into a choropleth. | Research catalog, editorial publication rules, rights and geography tags remain product decisions. Keep the Research engine independent. |
| Community share/export | Later, create a deliberate user-triggered export/share with preview of included layers, visibility setting and warning/removal of private portfolio values. | A map image can disclose a location or portfolio information even if no raw dataset is shared. | Separate Community/share contract and consent. Not in this pilot. |

## Data-location implications

- **WeWeb:** map page, client interaction and renderer. Do not treat the page as a durable database or run private provider credentials in browser-visible configuration.
- **Railway/API layer:** a plausible place for source acquisition/validation, cache coordination and the read API because InvestScape already has an API deployment path. Its current map routes/jobs were not inspected here; this is an architectural candidate, not a verified current implementation.
- **Supabase/Postgres:** a plausible place for authenticated user-owned saved views or portfolio-associated state if the existing authorization model and capacity fit. Do not assume it should hold every raw provider file, large boundary geometry or vector tile. The current tables and permitted schemas were not reviewed in this pass.
- **Object storage/CDN/vector-tile service:** candidates for immutable source snapshots where licensed, simplified boundaries and generated tiles. Select a provider only after usage terms, update ownership, cache invalidation, latency and cost are evaluated.

The preferred design keeps source ingestion and the client map decoupled: a renderer can change without changing how records are sourced; a source can change without copying ingestion logic into the browser. This is a planning recommendation, not a commitment to Railway, Supabase, a tile vendor, or either renderer.

## Proposed read path (conceptual)

1. A server-side refresh process retrieves one source family according to its published cadence and records provenance/quality metadata.
2. Validation checks geography IDs, dates, units, symbols, duplicate keys, release status and license metadata; invalid rows remain quarantined/unavailable.
3. A read query uses requested market level and viewport/selection to return only relevant metric rows and boundary or tile references.
4. The client draws the map, legend and separately enabled evidence overlays. Selected feature detail displays period, boundary level/vintage, source and quality notices.
5. User-saved map settings or portfolio overlays travel through existing authenticated operations only after owner/access behavior is verified. Public source data and private account data stay distinguishable.
6. A new source release invalidates affected cached values by source/geography/period; it should not erase a user's unrelated saved view or project state.

## Review questions before any implementation gate

1. Which reviewed API service/environment owns read-only map queries and scheduled source refreshes?
2. Which approved existing storage can preserve source metadata/versions without a schema change?
3. Which boundary/tile provider and map style are allowed under their usage/display terms?
4. What is the cache key and invalidation event for source, geography boundary version and metric period?
5. How are stale source data, unavailable/suppressed values, provider timeouts and partial layer errors exposed to the user?
6. How does the API distinguish public evidence from owner-only portfolio records and published versus draft/withdrawn Research?
7. Which map state is ephemeral, which is saved on explicit user action, and how is that reflected in retention/export?
8. What are the measured limits for payload bytes, polygons/features and p95 interactive query latency?

**Disposition:** the user-facing responsibility split is ready for technical review. Exact services, tables, routes, policies, tile providers and cache values remain unresolved. No route, schema, service, WeWeb component/page, deployment or publication was changed.
