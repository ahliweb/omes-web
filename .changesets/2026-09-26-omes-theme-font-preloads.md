---
bump: patch
type: fix
impact: public
---

# `landing` build stops preloading fonts the OMES theme never renders

`BaseLayout.astro` preloaded the base type system's Plus Jakarta Sans (400/600) and Lora (500) faces unconditionally, even on a `landing` build — where the OMES theme (`data-tema="omes"`) sets `--font-sans`/`--font-mono` to Public Sans/JetBrains Mono instead and never renders either base family at all. Every OMES visitor downloaded three unused woff2 files at high (preload) priority, and the fonts the theme actually renders above the fold weren't preloaded — the opposite of what a preload hint is for.

- The preload list now follows `SITE_PROFILE`: `toko`/`berita` are unaffected (still Plus Jakarta Sans 400/600, Lora 500 — the built `<head>` is byte-identical to before this change), and `landing` now preloads Public Sans 400/600 (the header's utility bar/nav, rendered on every page) and JetBrains Mono 600 (the home page hero's status chip) instead.
- A new test (`apps/storefront/tests/base-layout-font-preload.test.ts`) builds the `landing` profile and asserts every preloaded font URL is a face the OMES theme's own `--font-sans`/`--font-mono` tokens name, and that neither Plus Jakarta Sans nor Lora is ever preloaded on `landing`; a second case proves `toko`/`berita` keep preloading the base theme's own fonts, unchanged.
