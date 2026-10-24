# UI/UX redesign — OMES public site (October 2026)

Reference-only design proposal for the `landing` build profile of this
deployment (`omes.ahlikoding.com`): the OMES product site. It builds on what
[`docs/ui-ux.md`](../../docs/ui-ux.md) already records — the OMES theme tokens
in `apps/storefront/src/styles/global.css`, the self-hosted Public Sans and
JetBrains Mono, the measured contrast table, Indonesian-only copy, the
"static illustration, never a screenshot" rule for the Control Center — and
follows [`docs/responsif.md`](../../docs/responsif.md) and
[`docs/aksesibilitas.md`](../../docs/aksesibilitas.md). UI copy is Indonesian.

**Not implemented.** These pages render example content only and call nothing.
Capability, platform, module and command data come from `ahliweb/omes`
(`README.md`, `modules/*/module.sh`, `profiles/*.profile`); the Control Center
panel is a labelled illustration with example hosts.

## How to view

```bash
python3 -m http.server 8080   # from the repository root
# then open http://localhost:8080/design/redesain-ui-ux-2026-10/WebHome.dc.html
```

Serve the repository root: the OMES boards load this repo's own fonts from
`apps/storefront/public/fonts/` by relative path. [`support.js`](support.js)
is a byte-identical copy of the vendor runtime in `ahliweb/omes`
`ui/control-center/support.js`; it loads React from unpkg, so viewing needs
network access. [`canvas.json`](canvas.json) records the artboard layout.

## Contents

| File                                       | Screen                                                                                                                                                                                         | Interactive                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| [`Main.dc.html`](Main.dc.html)             | 00 · Analysis of the AWCMS family (awcms, awcms-one, omes, awcms-astro), shared with the other repositories                                                                                    | no                           |
| [`PolaData.dc.html`](PolaData.dc.html)     | Data-page pattern shared by the family: which search and paging each page function gets                                                                                                        | no                           |
| [`WebHome.dc.html`](WebHome.dc.html)       | Home: hero with a quick-start terminal (profile server/desktop/hermes, channel stable/rc/edge/dev), lifecycle, authority layers, capabilities, Control Center illustration, platforms, roadmap | profile, channel, copy       |
| [`WebModules.dc.html`](WebModules.dc.html) | Proposed `/modul` route: the 13 modules and 11 CLI commands, search, profile and scope filters, detail panel with dependencies and install command, no paging                                  | tabs, search, filters, row   |
| [`WebPages.dc.html`](WebPages.dc.html)     | Shared routes: static CMS page with table of contents, contact (only channels that exist), 404                                                                                                 | no                           |
| [`WebMobile.dc.html`](WebMobile.dc.html)   | 360 px views of home, the open menu and `/modul`, with the responsive and touch rules they keep                                                                                                | no                           |
| [`WebSpec.dc.html`](WebSpec.dc.html)       | Per-route spec (search, filters, order, paging) for every route the profile builds, plus UI findings with severity and a fix for each                                                          | tabs, search, filter, paging |

## Findings from reading the code

The spec board lists ten; the ones a reviewer should look at first:

- **Brand mark.** `apps/storefront/public/favicon.svg` (also the manifest icon)
  is still the BjekMart mark — an emerald "B" labelled "BjekMart".
  [`assets/favicon-omes.svg`](assets/favicon-omes.svg) is a proposed OMES mark
  built from the theme's own cyan and green.
- **Copy that drifted from OMES.** The home page says the install command and
  Hermes Agent cover "both profiles"; OMES now ships three (`server`,
  `desktop`, `hermes`), and `profiles/desktop.profile` leaves Hermes optional.
- **English in rendered output.** The Control Center illustration's sidebar
  (Overview, Hosts, Modules, Backups) breaks the "no English copy" rule in
  `docs/ui-ux.md`.
- **Version chip.** "Pre-alpha · v0.4.0" does not say that `v0.4.0` is the
  stable channel while the OMES README reports version 0.6.0.

## Proposals that need a decision

- A new `/modul` route for the `landing` profile. It would need a row in the
  profile matrix of [`docs/template.md`](../../docs/template.md), an entry in
  the `static-routes` sitemap source, and a build-time read of the OMES module
  metadata rather than a hand-copied list.
- The home page's single-card contact section merges into the closing call to
  action; `/kontak` keeps the full page.
- Status in the illustration uses the family's icon-plus-colour vocabulary
  (Sehat ●, Perhatian ▲, Tak diketahui ?) instead of colour-only dots.

## Assets used

| Asset                       | Source                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Public Sans, JetBrains Mono | [`apps/storefront/public/fonts/`](../../apps/storefront/public/fonts/LICENSE-OFL.txt) (OMES boards)             |
| Public Sans, JetBrains Mono | Google Fonts link on the two shared analysis boards only, which were drawn with `ahliweb/awcms`' variable fonts |
| OMES mark (proposal)        | [`assets/favicon-omes.svg`](assets/favicon-omes.svg)                                                            |

The other screens of the same canvas live in their own repositories under
`design/redesain-ui-ux-2026-10/`: `ahliweb/awcms`, `ahliweb/awcms-one`,
`ahliweb/omes` (the Control Center inside AWCMS) and `ahliweb/awcms-astro`.
