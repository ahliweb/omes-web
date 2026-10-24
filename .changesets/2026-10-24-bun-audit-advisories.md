---
bump: patch
type: dependency
impact: internal
---

# Clear the bun audit advisories on main

`bun audit --audit-level=low` reported 30 advisories (1 critical, 11 high) on `main`, which failed the `Check (toko)` "Dependency audit" step on every PR. `bun audit fix` raised eleven transitive packages inside their existing declared ranges, rewriting only `bun.lock` (issue #25).

- devalue 5.9.3, fast-uri 3.1.9, http-cache-semantics 4.3.0, launch-editor 2.14.2, sharp 0.35.5, shell-quote 1.11.0, smol-toml 1.9.0, source-map-js 1.2.2, undici 8.12.2, vite 8.3.3, zod 4.6.6.
- No `package.json` change, no `overrides`, and nothing under `apps/cms/` is edited: every bump resolves through the existing ranges.
