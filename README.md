🇬🇧 English (source) · 🇮🇩 [Bahasa Indonesia](README.id.md)

[![CI](https://github.com/ahliweb/awcms-one/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ahliweb/awcms-one/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE) [![runtime](https://img.shields.io/badge/runtime-Bun-blue?logo=bun&logoColor=white)](https://bun.sh)

# awcms-one

**OMES** is a deployment created from the [awcms-one](https://github.com/ahliweb/awcms-one) template — Bun, Astro, and PostgreSQL under row-level security. Its build profile is `landing` and its canonical domain is `omes.ahlikoding.com` (see [`docs/template.md`](docs/template.md)).

## Where this sits in the AWCMS family

| | |
| --- | --- |
| **This repo** | `ahliweb/awcms-one` — a Bun monorepo: one commerce/news backend (`apps/cms`), one public storefront (`apps/storefront`), one shared DTO contract (`packages/kontrak`) |
| **Backend / system of record** | `apps/cms`, in this repo — `ahliweb/awcms` embedded whole via `git subtree`, preserving upstream history |
| **Model repo** | [`ahliweb/media-lenterakalteng`](https://github.com/ahliweb/media-lenterakalteng) — the workspace layout, audit gates, changeset convention, and governance-document structure in this repo are adapted from it |

## Why `apps/cms` embeds `awcms` whole

The commerce module this platform needs cannot stand on its own — it depends on `awcms` shared infrastructure that has no standalone package: `withTenant` (RLS tenant context), `authorizeInTransaction` (RBAC/ABAC), `appendDomainEvent` (outbox), `recordAuditEvent`, `_shared/module-contract` (`defineModule`), `getDatabaseClient`, the SQL migration runner, and `_shared/api-response`. So `awcms` is embedded whole, via `git subtree`, rather than depended on as a package — see [`AGENTS.md`](AGENTS.md#the-subtree-embed) for the sync mechanics and the one rule that protects them.

## Use this as a template

This repository was created from the [`ahliweb/awcms-one`](https://github.com/ahliweb/awcms-one) template using its own `bun run template:init` — see that repository's [`docs/template.md`](https://github.com/ahliweb/awcms-one/blob/main/docs/template.md) for the walkthrough and [ADR-0018](https://github.com/ahliweb/awcms-one/blob/main/docs/adr/0018-awcms-one-is-a-template-with-build-profiles-and-an-idempotent-init.md) for the design decisions behind it.

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/status.md`](docs/status.md) | The current-state reference: what exists by surface, what does not yet — start here for "what is actually here today" |
| [`AGENTS.md`](AGENTS.md) | This repo's working contract — read before doing anything else, human or agent |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Setup, workflow, branch/commit conventions, Definition of Done |
| [`SECURITY.md`](SECURITY.md) | How to report a vulnerability, and this repo's attack surface today |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Roles, decision flow, releases |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Expected conduct |
| [`SUPPORT.md`](SUPPORT.md) | Where a question or a bug report goes |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history, folded from changesets — the increment-by-increment history this README no longer carries |
| [`.changesets/README.md`](.changesets/README.md) | How to write a change note |
| [`knowledge/README.md`](knowledge/README.md) | The federated Graphify + Obsidian knowledge-graph workflow |
| [`docs/README.md`](docs/README.md) | Architecture, schema, API, CMS, routing, SEO, accessibility, responsive, UI/UX, testing, deployment, workflow, and template reference, plus [`docs/adr/`](docs/adr/README.md) |

## Running locally

```bash
cp .env.example .env
bun install
bun test               # the root gate suite — see "Gates" below
```

This repo is **Bun-only**: Bun is both the runtime and the package manager, its version is pinned in `packageManager`/`engines.bun`, and `bun.lock` is the only lockfile.

| Command | Purpose |
| --- | --- |
| `bun install` | Resolves the whole workspace |
| `bun test` | The root gate suite. `bunfig.toml` excludes `apps/cms/**` — that suite is ~500 files and needs a live PostgreSQL; it runs under its own gate, `bun run check:cms` |
| `bun run check:lockfile` | Proves `bun.lock` actually belongs to this repo's `package.json`, for the root and every workspace member |
| `bun run check:cms` | `apps/cms`'s own full gate chain (53 steps — lint, docs, inventories, spec, gates, typecheck, its own tests, its own build) |
| `bun run db:up` / `db:down` / `db:reset` | Starts/stops/resets the disposable local `postgres:18.4` (`compose.yaml`) |
| `bun run db:migrate:cms` | Runs `apps/cms`'s migrations against `DATABASE_URL` — see `apps/cms/.env.example` |
| `bun run db:seed:cms` | Seeds the `borneojek-mart` tenant, catalog, marketing surfaces, and sample orders through `apps/cms`'s own public API — see [`docs/deployment.md`](docs/deployment.md) |
| `bun run deploy:preflight` | Fail-closed production preflight — storefront build-env shape, then delegates to `apps/cms`'s own `commerce:deploy:preflight` — see [`docs/deployment.md`](docs/deployment.md) and ADR-0019 |
| `bun run release` | Cuts a tagged release from the waiting changesets — see [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| `dev` / `build` / `check` / `serve` | Delegate into `apps/storefront` — `bun run build` type-checks, fetches the catalog/marketing/news content from `apps/cms` at build time, and bakes static output including the derived CSP; `bun run serve` runs the built `apps/storefront/server/penyaji.mjs`. All three build-time commands honour `SITE_PROFILE` (`toko` default) — see [`docs/deployment.md`](docs/deployment.md) |
| `bun run template:init` | Idempotent brand/profile initialisation for a derived repository — see [`docs/template.md`](docs/template.md) |

## Architecture at a glance

```
apps/
├── cms/                     ahliweb/awcms, embedded via git subtree with full history — the
│                             commerce/news backend and system of record, carrying the one
│                             commerce module (catalog, marketing, orders, customer accounts,
│                             affiliates, external-provider integrations — see docs/status.md)
│                             plus the anonymous and bearer-secured /api/v1/commerce/storefront/*
│                             API and the public webhook intake route
└── storefront/              the public Astro storefront — output: "static" throughout, built
                              per SITE_PROFILE; cart/checkout and the account surface call
                              apps/cms's storefront API directly from the browser (ADR-0007,
                              ADR-0016)
packages/
├── config/                  shared tsconfig preset
├── gerbang/                 this workspace's audit gates, as a package
└── kontrak/                 the type-only DTO contract apps/storefront imports from apps/cms,
                              plus its import-direction gate
tools/                       cross-workspace scripts: release, lockfile check, docs i18n stamp,
                              knowledge-graph update/combine/export, seed data, template:init
tests/                       the root-level gate tests (docs, changesets, toolchain, scripts,
                              import direction)
docs/                        architecture, schema, API, CMS, routing, SEO, accessibility,
                              responsive, UI/UX, testing, deployment, workflow, and template
                              reference, plus docs/adr/ and docs/status.md
knowledge/                   the federated Graphify + Obsidian knowledge-graph workflow
.claude/skills/               awcms-one-storefront, awcms-one-commerce, awcms-one-template —
                              how-to guides for adding a storefront page, a commerce
                              table/endpoint, or starting a new app from this template
.changesets/, .github/       stay at the repo root — decisions about the whole repo
```

A live, provisioned PostgreSQL exists for local development and CI (`compose.yaml`, `bun run db:up`/`db:migrate:cms`/`db:seed:cms`, the `check-cms` CI job), and a real production topology exists too (`compose.production.yaml`, a fail-closed `bun run deploy:preflight`, ADR-0019) — see [`docs/deployment.md`](docs/deployment.md) for both sequences, [`docs/arsitektur.md`](docs/arsitektur.md) for the full topology and trust-tier design, and [`docs/status.md`](docs/status.md) for what exists today, by surface, and what does not yet.

## Gates

`bun test` plus four `audit:*` scripts run unconditionally on every push, needing no build, network, or `apps/cms`. The `Check` job is a **matrix over the three build profiles** — `Check (toko)`, `Check (berita)`, `Check (landing)` — each leg type-checking and profile-smoke-testing `apps/storefront` under its own `SITE_PROFILE`; the root tests and `audit:*` scripts run once, on the `toko` leg. A second CI job, `check-cms`, runs `apps/cms`'s own full gate chain plus its DB-gated integration suite against a real, ephemeral PostgreSQL — see [`docs/alur-kerja-pengembangan.md`](docs/alur-kerja-pengembangan.md). **`Check (toko)`, `Check (berita)`, `Check (landing)`, and `check-cms` are all required status checks on `main`.** A fourth workflow, `.github/workflows/template-init-smoke.yml`, matrices `bun run template:init` over the three profiles into a temporary copy of the repo, plus a `root-suite` leg that runs the full derived-repository test suite once; **all four of its legs are required status checks too.** So is a fifth, `.github/workflows/e2e.yml` — a Playwright matrix over the same three profiles (checkout, the ad popup, axe-core accessibility, a responsive/overflow check); **all three `e2e` legs became required status checks in issue #215**, after its post-introduction run history showed no e2e failure.

| Gate | What it catches |
| --- | --- |
| `bun run audit:dokumen` | Dead relative links in markdown; an ADR index incomplete in either direction or carrying a duplicate row; a file path named in backticks that does not exist in this repo; an `ADR-NNNN` citation that resolves to nothing; a spelled-out number that disagrees with the set it claims to count |
| `bun run audit:rilis` | The waiting `.changesets/` backlog crossing its bound — 20 files or 14 days old |
| `bun run audit:translation` | An Indonesian mirror (`<name>.id.md`) whose recorded source hash no longer matches its English source, or a governance document with no mirror at all |
| `bun run audit:graf` (alias: `knowledge:check`) | The root knowledge-graph corpus (graphify-out/) describing itself honestly, including that the corpus has not drifted more than `MAX_STALE_FILES` (40) files from the tree it describes — see [`knowledge/README.md`](knowledge/README.md) |
| `bun test` | The root gate test suite — `tests/*.test.mjs` — plus `apps/storefront`'s own unit/build-smoke/route tests |
| `check-cms` (CI job) | `apps/cms`'s own ~53-step `bun run check` chain, then its `tests/integration/` suite against a real, migrated PostgreSQL |

`.github/workflows/codeql.yml` (GitHub's CodeQL `security-extended` analysis, plus a weekly schedule) also runs on every push and PR; its job-status context, `Analyze (javascript-typescript)`, became a required status check in issue #214 — see `docs/alur-kerja-pengembangan.md`'s "CI: a fifth, now-required workflow — `codeql`" for why that context rather than the sibling `CodeQL` code-scanning-results check. Two more workflows run on every push but are **not** required status checks: `.github/workflows/images.yml` (publishes `apps/cms`'s `runtime`/`jobs` images to GHCR with SBOM and provenance, on a version tag or dispatch), and `.github/workflows/release.yml` (publishes a GitHub Release from a pushed version tag's `CHANGELOG.md` section). See `template-init-smoke.yml`'s own comment for the promotion path a workflow follows once it has run green for a while, and [`docs/README.md`](docs/README.md) for the full documentation index.

## Language

English at the bare path is the authoritative source; Indonesian at `<name>.id.md` is the mirror, and it records the hash of the English it was translated from. `bun run audit:translation` fails when a mirror goes stale. This document's mirror is [`README.id.md`](README.id.md).

This repository's own code (`packages/gerbang/`, `tools/`, `tests/`) is written in English throughout — identifiers, comments, and gate messages alike. `apps/cms` carries its own, separate convention as `ahliweb/awcms`'s embedded code; this repository does not govern or change it.

## Licence

[MIT](LICENSE) for the code in this repo. `apps/cms` carries `ahliweb/awcms`'s own licence and copyright notices as part of its embedded history; see that workspace's own `LICENSE`.
