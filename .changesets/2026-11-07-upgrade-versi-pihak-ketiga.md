---
bump: patch
type: dependency
impact: internal
---

# Upgrade third-party versions (Bun 1.4.4, PostgreSQL 18.6)

Raises Bun to `1.4.4` in every root-owned pin (`packageManager`, `engines.bun`, every `bun-version` in the root workflows, and `apps/storefront/Dockerfile`), PostgreSQL to `18.6` (`compose*.yaml`, `docker/backup/Dockerfile`, the CI service and the docs that name it), and moves `@astrojs/check` to `^0.9.12` in `apps/storefront`. GitHub Actions `actions/upload-artifact` (v7.0.2), `docker/login-action` (v4.8.0) and `github/codeql-action` (v4.39.3) move to the newest release in their major, SHA pins kept.

- `astro`, `@astrojs/node`, `@playwright/test` and `@types/bun` are **held**: their versions in `bun.lock` are shared with `apps/cms`, which is upstream-owned, so raising them would change what `apps/cms` resolves. They move with the next subtree sync.
- `apps/cms/package.json` keeps its own `packageManager` (`bun@1.4.2`), a documented divergence.
- `typescript` 7 is a major jump and is not taken.
- `@axe-core/playwright` is held at `~4.13.0`: 4.14.0 (axe-core 4.14) reports new `label-content-name-mismatch` findings in a sibling AWCMS-One product's a11y scan that 4.13.0 does not, and the e2e axe gate here is not run locally.
