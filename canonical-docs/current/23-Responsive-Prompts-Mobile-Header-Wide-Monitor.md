# InvestScape — Responsive Strategy: Scoped Prompts (Doc 23)

**Run these two, in this order.**

---

## Prompt 1 — Mobile header redesign (hamburger nav + visible notifications)

```
Redesign the header for viewports under 640px wide. Currently the 8
primary nav tabs overflow horizontally with no good way to navigate them
on a phone, and the notification bell is hidden entirely below 640px
(showNotifBtn: !isMobile) — meaning mobile users can't access notifications
at all.

Please:

1. Below 640px, replace the horizontal tab row with a hamburger menu icon
   (top-left, before or near the logo). Tapping it opens a full-height
   drawer/panel listing all 8 primary tabs (Portfolio, Deal Analyzer,
   Development Studio, Research, Market Intel, Community, Library,
   Workspace) as a vertical list. Tapping a tab navigates there and closes
   the drawer.
2. Keep the search icon, globe (language) icon, notification bell, and
   avatar visible in the header at all times, even at the smallest phone
   width — these should never move into the hamburger drawer.
3. Remove the `showNotifBtn: !isMobile` condition so the bell is visible
   and functional on mobile — same dropdown behavior as desktop, just
   confirm the dropdown panel itself positions sensibly and doesn't
   overflow a 375-390px viewport when opened.
4. This applies to every page in the app except Development Studio's Full
   Proforma view (see the next prompt for how that one behaves on mobile)
   — Quick Proforma and every other page should use this new mobile header
   normally.

After implementing, screenshot the mobile header in both its closed state
and with the hamburger drawer open, plus the notification dropdown open on
a 390px viewport, so I can confirm all three visually.
```

---

## Prompt 2 — Dev Studio Full Proforma: phone message + wide-monitor layout

```
Development Studio's Full Proforma view (the detailed workspace with
budget tables, charts, and scenario data — not Quick Proforma, which stays
fully usable on phone) needs two changes:

1. PHONE (below 640px): instead of trying to render the full workspace,
   show a simple centered message: an icon, "Development Studio's full
   workspace needs a larger screen," and a short line underneath —
   "Try Quick Proforma for a phone-friendly version" with a button/link
   that takes them to the Quick Proforma entry point for the same project
   type. Don't attempt to render the budget tables, charts, or scenario
   panels at this width at all.

2. WIDE DESKTOP (above ~1920px): currently the layout likely stretches
   content edge-to-edge or leaves large empty margins on an ultrawide
   monitor. Instead, constrain the main content to a reasonable max-width,
   and use any reclaimed horizontal space to show panels side-by-side
   rather than stacked — specifically, the budget line-item table and its
   corresponding cost donut chart should sit next to each other in a
   two-column layout at this width, rather than one above the other. Below
   ~1920px, keep the current stacked layout as-is — this only applies at
   wide-monitor sizes.

After implementing, screenshot: (a) the phone-width redirect message, and
(b) the Full Proforma view at a simulated wide/ultrawide width showing the
side-by-side budget table + donut layout, so I can confirm both.
```

---
*End of Doc 23 · Implements: 22-Responsive-Multi-Monitor-Strategy.md §2, §3*
