# InvestScape dashboard layout choice decision — 2026-10-06

**Status:** Approved product/design direction for future native WeWeb implementation. This is a planning reference, not production UI or a request to publish.

## Decision

Offer six dashboard layout choices in the eventual WeWeb application. The original remastered layout remains the default.

1. Original v2-remastered layout, horizontal main and sub-ribbons — default.
2. Gold ribbon text and matching primary buttons — horizontal.
3. Gold ribbon text and matching primary buttons — left sidebar.
4. Silver ribbon text and matching primary buttons — horizontal.
5. Silver ribbon text and matching primary buttons — left sidebar.
6. Original v2-remastered colors and typography with main and sub-ribbons in a left sidebar.

The approved gold is `#E6B800`; the approved silver is `#ABABA8`. In colored sidebar layouts, the selected sub-menu label uses the matching color and font weight 700. Main ribbon labels use semi-bold 600. The original top header keeps its normal light/dark theme colors.

## Delivery sequence and boundaries

1. Port and complete the original v2-remastered behavior in native WeWeb first.
2. After the original WeWeb experience passes its functional and parity gates, build the five alternative presentations as native WeWeb layouts.
3. Let the user select a layout, with original v2-remastered selected by default.

The standalone HTMLs are visual references only; do not embed them wholesale into WeWeb. Layout variants must preserve calculation behavior, field meanings, disclosure text, provenance, and handoff behavior. Store any preference using an existing approved user-preference path; coordinate with the backend owner before proposing schema changes. This decision does not authorize schema changes, deployment, or publication.

## Source and preview evidence

The frozen source reference is the post-A9/A10 `investscape-v2-remastered.html` working-tree baseline:

- SHA-256: `84cf6e13043fe392e8c4a9f82e37ba90ec68b86f948c8f91082bcc9810193c83`
- 17,520 CRLF lines; zero bare LF.

Five generated full-page design copies and their archive were checked by removing the marked additive CSS/side-rail code and comparing the result byte-for-byte with that source baseline. This validates source preservation, not visual/browser acceptance. The full-page previews have not received WeWeb acceptance or a WCAG conformance audit.

The local review archive was `InvestScape-Final-Layout-Choices.zip`, 3,037,944 bytes, SHA-256 `8e8780f1a1a7bd55fac4a9f0945065485678d77b75e6b49f68401b6d54c6d`. The archive hash is recorded for identity and does not mean the ZIP is stored in this repository.

| Layout preview file | SHA-256 | Main nav weight | Active sidebar sub-menu |
|---|---|---:|---|
| `investscape-gold-text-buttons-bold-horizontal.html` | `3d2346d8c769a05200c89eb276586fd6567cd4ace3171937f0ebb20961ca4a5c` | 600 | — |
| `investscape-gold-text-buttons-bold-sidebar.html` | `3bcbd4ace14d13bcee5e0819c4fdc1bbb2841b7889702ea4786c1a866dbc0421` | 600 | #E6B800, 700 |
| `investscape-silver-text-buttons-bold-horizontal.html` | `33671c221575dbe0e4f47fa39d0034b3c236e049b0347c2b5fcbf90b19175412` | 600 | — |
| `investscape-silver-text-buttons-bold-sidebar.html` | `d28d2b85d174729c0e1268214daf72943ed81106f7a6cb0021dafdda96a497cf` | 600 | #ABABA8, 700 |
| `investscape-v2-remastered-sidebar.html` | `ec98e3c5532fbb8c825c53d88070c0382d5ea169db2d50ff6e5af7b5229eb250` | Original | Original |

The “bold” substrings in four preview filenames are retained from the selected filenames; the chosen main ribbon text weight is 600. The sidebar collapses to horizontal navigation at widths of 900px or narrower.
