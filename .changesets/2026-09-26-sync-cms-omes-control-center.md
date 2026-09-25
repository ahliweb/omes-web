---
bump: minor
type: dependency
impact: public
---

# `apps/cms` synced from `ahliweb/awcms` `0d6c0dfe` — OMES Control Center screens and worker API

`apps/cms` carried the `omes_control` module's domain and application code but none of its admin screens and not the worker endpoints, so `/admin/omes` did not exist in a deployment of this repo. This sync (issue #2) pulls upstream `main` at `0d6c0dfef92c1d1708f21ad2211687cb0f207788`, six commits past the previous sync point `2d29a446`.

- Nine OMES Control Center admin screens under `/admin/omes/`: overview, servers, deployments, operations, jobs, health, backups, audit, and enrollments.
- The OMES host worker API: `POST /api/v1/omes/worker/{enroll,poll,result,heartbeat}`, authenticated by Ed25519 proof of possession and signed request envelopes with replay protection, not by an AWCMS session.
- One new migration, `sql/159_awcms_omes_control_worker_ingestion.sql` — run `bun run db:migrate:cms` before deploying.
- `APP_BUDGET_BYTES` in `apps/cms/scripts/client-asset-budget.ts` rises 259,000 → 263,400 B: upstream's own +4,357 B for these screens, carried per the divergence rule in [`AGENTS.md`](../AGENTS.md).
- Because this repo was created from the template without the subtree's history, a one-time no-change merge of `2d29a446` restores the ancestry the pull needs; `AGENTS.md` now documents that step for the next derived repository.
