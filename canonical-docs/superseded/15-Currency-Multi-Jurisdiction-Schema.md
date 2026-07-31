# InvestScape — Currency & Multi-Jurisdiction Schema (Doc 15)

**Strictly additive to Document 02 and its addenda.** Implements Option B from the currency discussion: per-currency subtotals *plus* a converted grand total with dated-rate disclosure. Closes the gap Doc 12 §2.1 flagged and the portfolio-drilldown screenshot confirmed.

---

## 1. NEW OPTION SET

### `Currency`
Options: **CAD, USD** — extendable later (GBP, AUD, etc.) without touching existing rows, same pattern as every other option set in this schema.

---

## 2. FIELD ADDITIONS TO EXISTING TYPES

### `Property` — add one field
| Field | Type | Default | Notes |
|---|---|---|---|
| Currency | Currency | (set from Country at creation — see §4) | drives every monetary field under this Property and its Deals |

### `DevProject` — add one field
| Field | Type | Default | Notes |
|---|---|---|---|
| Currency | Currency | (set from Jurisdiction at creation — see §4) | same cascade logic as Property |

**Deliberately not added:** a `Currency` field on `DealInputs`, `DealMetrics`, `BudgetLine`, `UnitSale`, etc. Those all belong to a `Property` or `DevProject` that already has one currency — repeating the field on every child record is redundant and creates a place for it to silently disagree with its parent. If a display needs the currency, it looks up the chain: `Deal → Property → Currency`.

### `PortfolioSnapshot` — add one field
| Field | Type | Default | Notes |
|---|---|---|---|
| FXRateUsed | number | — | the CAD/USD rate applied when this snapshot converted a USD property into the portfolio's display total, frozen at snapshot time — same principle as Equity being frozen, not live-recomputed |

---

## 3. NEW DATA TYPE

### `FXRate` (admin/system-managed reference data — not user data)
| Field | Type | Default | Notes |
|---|---|---|---|
| Pair | text | — | e.g. "USD/CAD" |
| Rate | number | — | |
| AsOfDate | date | — | |
| Source | text | — | e.g. "Bank of Canada Valet API" or "FRED" |

**Population:** a small scheduled backend workflow (`fetch-fx-rate`, same pattern as `snapshot-portfolio`) pulls the daily rate once a day from the Bank of Canada Valet API (free, no key required) or FRED (already in your stack) and writes one new `FXRate` row. Never overwrite a past row — the history is what makes `PortfolioSnapshot.FXRateUsed` meaningful months later, and what lets a lender-facing export cite the exact rate used on the exact date, same audit-trail logic as everything else in this platform.

---

## 4. Cascade logic — currency follows jurisdiction, it's never an independent choice

At `Property` creation: if `Country = Canada` → `Currency = CAD`; if `Country = USA` → `Currency = USD`. Same at `DevProject` creation, keyed off `Jurisdiction` instead. This is a default set once at creation, not a live-linked calculation — a user can override it in the rare case they need to (e.g., a Canadian citizen who genuinely wants a US property tracked in CAD for personal reasons), but the default removes the contradictory-state problem (US property somehow in CAD) for the 99% case without taking away control.

**Loan currency = property currency, always, at MVP.** Cross-border financing (CAD loan against a USD property) is a real but rare scenario — flagged here explicitly as a known simplification, not built. Revisit only if a real user actually needs it.

---

## 5. Portfolio aggregation — the actual fix for the mixed-total bug

The Portfolio "Total Value" card becomes two numbers, not one silently-wrong one:

```
Total Value
CA$ 4,020,000 · US$ 1,562,000
≈ CA$ 6,158,940 total (converted at 1 USD = 1.394 CAD, Jul 15 2026, Bank of Canada)
```

**Bubble step:** a backend workflow (`agg-portfolio-value`, same family as `agg-equity-growth`) does two things: (1) `Sum of PropertyValue where Property's Currency = CAD` and `= USD` separately — the honest per-currency subtotals — and (2) looks up the current `FXRate` row (`Search FXRate sorted by AsOfDate descending, item #1`), converts the USD subtotal into CAD, adds it to the CAD subtotal, and writes both the converted total and the rate/date used into text fields the page displays. Every KPI card that's a pure ratio (cap rate, cash-on-cash, occupancy %) needs **no currency treatment at all** — ratios are currency-agnostic, so this only touches the absolute-dollar cards.

**Which currency is the "home" one for the converted total?** Default to the User's own `Country`-implied currency (Canada → convert everything into CAD; USA → convert everything into USD) — matches how a Canadian investor actually thinks about their net worth, and mirrors what §7's export needs too.

---

## 6. Display convention — when to show currency prefixes

- **Single-currency context** (a Deal page, a Dev Studio project, a Property drilldown): one currency badge near the page title ("All figures in CAD"), plain `$` everywhere else. No per-field labeling — it's redundant noise inside a context that's already single-currency.
- **Mixed context** (Portfolio table, cross-deal comparisons, any export): every dollar figure gets an explicit `CA$` / `US$` prefix, never a bare `$` — bare `$` is genuinely ambiguous specifically because you operate in both markets.
- **French-Canadian formatting note (ties to Doc 13):** fr-CA formats currency as `1 234 567 $` — symbol after the number, space thousands-separators — not `$1,234,567`. This is a locale/number-formatting concern, not just a translation-text one; flag it to whoever builds the Doc 13 language switcher so it's handled alongside the string translations, not forgotten as a separate pass.

---

## 7. Export / lender-facing report convention

Per-asset figures in native currency; one selectable "Report Currency" at export time (defaults to the user's home currency per §5, but a user applying to a US lender should be able to flip it to USD for that specific export); footnote on every export: *"Converted at 1 USD = [rate] CAD, [source], as of [date]. Figures are user-entered and unaudited. This report is an analysis tool output, not a certified accounting or appraisal document."* That last line does real work — it's the "accountant-friendly, not GAAP-compliant" boundary from the earlier discussion, stated plainly on the one document most likely to leave your platform and land on a banker's desk.

---

## Claude Design prompt — fix the mixed-currency total in the active prototype

```
The Portfolio page's "Total Value" KPI card currently sums all properties
into one dollar figure regardless of currency (e.g. a Burnaby, BC property
and an Austin, TX property both get added into one "$" total as if they're
the same currency). Fix this:

1. Split the Total Value card into two lines: per-currency subtotals first
   (e.g. "CA$4,020,000 · US$1,562,000"), then a converted grand total below
   in smaller text (e.g. "≈ CA$6,158,940 total"), with a small info icon
   next to it. Hovering or tapping the info icon shows: "Converted at 1 USD
   = 1.394 CAD, Bank of Canada, Jul 15 2026."
2. In the property table, every Value and Cash Flow/Mo cell should show an
   explicit currency prefix — "CA$" or "US$" — never a bare "$", since this
   table mixes both currencies.
3. Ratio-based columns (Cap Rate, Occupancy) need no currency treatment —
   leave those exactly as they are.
4. Use DM Mono for all figures, matching the existing style, and keep the
   converted-total line visually secondary (smaller, text-secondary color)
   to the per-currency subtotals, which stay primary/prominent — the
   subtotals are the honest number, the conversion is a convenience.
```

---
*End of Doc 15 · Depends on: 02-Bubble-Database-Schema.md (Property, DevProject), 02-Addendum-B (PortfolioSnapshot) · Related: 08 (Pricing/Packaging — Canada/US scope), 12 (Pre-Port Advisory Review §2.1), 13 (Language System — fr-CA currency formatting)*
