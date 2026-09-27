---
bump: patch
type: fix
impact: internal
---

# Sync apps/cms subtree to awcms e48bd84f — fixes the Arsitektur PIN.json read failure

Pulled `ahliweb/awcms` `main` (`4a7416ac` → `e48bd84f`) into `apps/cms`, carrying in
awcms#838: `apps/cms/Dockerfile.production`'s `runtime` stage now also copies
`apps/cms/src/modules/omes-control/contracts`, `apps/cms/sql`, `apps/cms/openapi`, and
`apps/cms/asyncapi` — directories the app reads from disk at request time via
`process.cwd()`-relative paths, never bundled into `dist/`.

This closes the PIN.json follow-up recorded against the production `omes-cms`
deployment's 2026-09-27 redeploy runbook: `/admin/omes/arsitektur` returning `200` but
failing to load its own capability data (`ENOENT` on
`apps/cms/src/modules/omes-control/contracts/v1/PIN.json` inside the running
container) on `omes-cms.ahlikoding.com`. Also fixes the same class of defect in
`openapi_documented`/`asyncapi_documented`/`migrations_applied` module health signals,
which previously reported `fail` in every production container of this app for the
same reason.

- `APP_BUDGET_BYTES` unchanged at 274,833 B — upstream's own asset budget did not move
  (this is a Dockerfile/backend fix, no client asset changed).
- Adds `apps/cms/tests/dockerfile-runtime-disk-reads.test.ts`, asserting every
  directory `apps/cms`'s runtime code reads from disk is copied into the `runtime`
  Docker stage.

Refs ahliweb/omes#246.
