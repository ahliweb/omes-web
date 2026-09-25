---
bump: minor
type: content
impact: public
---

# OMES theme, self-hosted Public Sans/JetBrains Mono, and the OMES home page

The `landing` build profile (`omes.ahlikoding.com`) now carries a custom, dark-first OMES
theme instead of the template's default light/dark BjekMart palette, and its home page
presents the actual OMES product (`ahliweb/omes`) rather than the generic
pages-and-contact placeholder `template:init` scaffolds.

- A new theme, scoped to `[data-tema="omes"]` (set on `<html>` only when
  `SITE_PROFILE=landing`) so `toko`/`berita` are completely unaffected — same
  theming mechanism (CSS custom properties), no parallel system.
- Public Sans and JetBrains Mono, self-hosted the same way the existing four
  families are (same-origin `/fonts/*.woff2`, SIL OFL, no Google Fonts, no
  new CSP origin).
- The home page: a hero with a "Pre-alpha v0.4.0" status chip, the
  Bootstrap→Check→Diff→Apply→Verify→Rollback lifecycle strip, a capabilities
  grid, a labelled Control Center preview illustration, a labelled Hermes
  orchestration illustration, the supported-platforms table, and an install
  section with the real, pinned `v0.4.0` bootstrap command — every claim
  grounded in `ahliweb/omes`'s own `README.md`.
- Fixed a real, pre-existing defect affecting every build profile: the
  primary header nav (and its own mobile toggle) was invisible above the
  720px breakpoint on every current browser engine, because a closed
  `<details>` element hides its non-`<summary>` content regardless of an
  author `display` override. A small `matchMedia`-driven script restores the
  desktop nav without changing the mobile no-JS disclosure behaviour at all.
