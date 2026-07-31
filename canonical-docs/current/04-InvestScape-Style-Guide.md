# InvestScape / EstateLens — Style Guide v1.0 (extracted from investscape-ecosystem.html)

**How to use:** Bubble → Styles tab → Style variables. Create each variable below and paste the hex/rgba values. Then build the named Styles in section 4. The HTML file defines **both a dark and a light theme** — build the dark theme for MVP (it matches the financial-terminal brand direction and your React prototype); the light tokens are documented here so a future light mode is a variable swap, not a redesign.

---

## 1. Color variables — DARK THEME (MVP)

| Bubble variable name | Value | Role |
|---|---|---|
| `bg` | `#0E1117` | App background |
| `bg-elevated` | `#141821` | Sidebar / nav / raised surfaces |
| `bg-card` | `#171B26` | Cards, panels, tables |
| `accent` | `#D9B04A` | Gold — primary actions, active nav, highlights |
| `accent-soft` | `rgba(217,176,74,0.14)` | Gold tint backgrounds (badges, hovers) |
| `text-primary` | `#F7F5EF` | Warm off-white body text (also the logo "white") |
| `text-secondary` | `#F7F5EF` at 60–70% opacity | Labels, secondary copy |
| `border` | `rgba(255,255,255,0.08)` | Default hairlines |
| `border-strong` | `rgba(255,255,255,0.16)` | Emphasized dividers, input borders |
| `green` | `#4ADE80` | Positive cash flow, gains |
| `green-soft` | `rgba(74,222,128,0.12)` | Positive badge background |
| `red` | `#F87171` | Negative cash flow, losses |
| `red-soft` | `rgba(248,113,113,0.12)` | Negative badge background |
| `blue` | `#7DD3FC` | Informational accents, links, chart series 2 |
| `shadow` | `0 24px 60px rgba(0,0,0,0.4)` | Card shadow (use sparingly on dark) |

**Logo/brand extras found in the file:** gold gradient range `#C9A227 → #EACD7C → #F6E1A0` (lens ring / halo glow), navy mark surface `#12233B`. Use the gradient only for the logo mark and hero moments — UI gold stays flat `#D9B04A`.

### Background-color decision — CONFIRMED
**Decided: Path B — Deep Navy.** `bg` is now `#0C1B2E`-range app-wide (not the as-built near-black `#0E1117`) — warmer, closer to the "trust/finance" feel of the React prototype. Because everything runs through Style Variables, this is a 3-field swap (`bg`, and re-check contrast on `bg-elevated`/`bg-card` against it) rather than a redesign. The gold accent, text, and semantic colors (green/red/blue) are unaffected. Apply this before Stage 1 of the Bubble build; the HTML mockups still show the old near-black `#0E1117` as-built and don't need to be regenerated for this — just don't treat them as the color source of truth anymore going forward.

## 2. Light theme tokens (documented for future — do not build now)

`bg #F5F6F8` · `bg-elevated/card #FFFFFF` · `accent #A8791A` · `accent-soft rgba(168,121,26,0.09)` · text `#12233B`-range slate · `border rgba(15,23,42,0.08)` · strong `rgba(15,23,42,0.15)` · `green #16A34A` · `red #DC2626` · `blue #0284C7` · shadow `0 24px 50px rgba(15,23,42,0.08)`.

## 3. Typography

| Font | Role | Bubble setup |
|---|---|---|
| **Fraunces** (serif) | Headlines, hero numbers, brand voice | Settings → General → add Google Font "Fraunces" |
| **Inter** (sans) | Body, UI labels, nav, forms | Google Font "Inter" |
| **DM Mono** (mono) | All financial figures, KPI values, tables, tickers | Google Font "DM Mono" |

Rule of thumb: **if it's a number the user might act on, it's DM Mono.** This is the signature of the financial-terminal aesthetic and improves scanability of aligned figures.

Suggested scale: H1 32–40px Fraunces · H2 24px Fraunces · Section label ("eyebrow") 11px Inter uppercase letter-spaced 0.08em, text-secondary · Body 15px Inter · KPI number 28px DM Mono · Table figures 14px DM Mono.

## 4. Named Styles to create in Bubble

| Style name | Recipe |
|---|---|
| `Card` | bg-card fill, 1px `border`, radius 14px, padding 20–24px |
| `KPI Number` | DM Mono 28px, text-primary; conditional: green when value ≥ 0, red when < 0 |
| `Stat Label` | the eyebrow style above |
| `Primary Button` | accent fill, `#0E1117` text (dark text on gold — key brand move), radius 10px, semibold Inter |
| `Ghost Button` | transparent fill, 1px border-strong, text-primary; hover: accent-soft fill |
| `Input Dark` | bg-elevated fill, 1px border-strong, radius 10px, Inter 15px, focus border accent |
| `Badge Positive / Negative` | green-soft / red-soft fill, green / red text, radius 999px, DM Mono 12px |
| `Grade Badge` | 48px circle, Fraunces bold, color from Grade option set attribute |

## 5. Component inventory in the HTML worth replicating (maps to build checklist stages)

- **App nav with brand word + links + search + avatar** → Stage 4 AppShell
- **KPI stat blocks (stat-label + mono value)** → Stage 7 KPI row
- **Watchlist rows (name + mono figure + change badge)** → Stage 8 properties list
- **Property table cells (address + sub-line + figures)** → Stage 8
- **Article rows with thumb + meta** → Research module, Phase 2 (do not build now)
- **Ticker rows** → Market Intelligence, Phase 2

## 6. Brand-quiet-faith note

The spiritual layer stays in the geometry of the logo mark (the twin pillars / praying-hands silhouette and the light beam) — never in UI copy or iconography. In practice: the mark appears at sidebar top and login page only; the beam motif may reappear once as a subtle divider gradient on the login page. Restraint is the design principle.
