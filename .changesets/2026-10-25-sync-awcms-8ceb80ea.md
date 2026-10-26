---
bump: minor
type: dependency
impact: internal
---

# Sync `apps/cms` from `ahliweb/awcms` `8ceb80ea` (164 upstream commits)

Pulls upstream `main` `8e9bce0c` → `8ceb80ea` (25 October 2026, omes-web issue #17) into the `apps/cms` subtree with a merge commit. The embed is otherwise unchanged in shape; the sync adds capability and tightens security, and a handful of upstream gates required fixes inside this repo's own `commerce` module.

**Migrations.** 63 new upstream files (`sql/168`–`sql/315`: inventory, tax, procurement, HR workforce / commission / attendance, booking, generic WhatsApp and Telegram delivery, Mission Control replay indexes, workflow/idempotency/MFA/credential-column hardening) plus this repo's `sql/935` (a surrogate `id` on `awcms_commerce_store_settings` and the three `awcms_commerce_sales_*` tables so the generic lifecycle purge can retire their rows; before it, those four descriptors failed every purge pass with `42703`). No already-applied migration or checksum changed; `commerce` still owns `901`–`999`, next is `936`. Forward-only: the rollback is the previous image plus a restore of the pre-migration backup.

**Operator steps** (full checklist in `docs/deployment.md`): set `IDEMPOTENCY_HMAC_SECRET` (required in production, fail closed — without it POS sales, the storefront checkout and the admin payment/commission/campaign actions are refused); run `db:migrate:cms`; on host `docker run` deployments reinstall `ops/run-job.sh` with `awcms-jobs.env-global` and `awcms-jobs.env-scoped` from the same release as the image (the runner refuses on drift); refresh the crontab (52 jobs). Optional new variables (`PUSH_AUTH_SECRET_ENCRYPTION_KEYS`, `WHATSAPP_*`, `TELEGRAM_*`, `PWA_*`, database capacity/pool, tax/inventory/payroll) are all inert unless set.

**Fixes inside `commerce` demanded by new upstream gates.** Expected-to-fail statements run in `tx.savepoint(...)` (the runtime image is Bun 1.4.4, where a swallowed failed statement turns the commit into `ERR_POSTGRES_COMMIT_ROLLED_BACK`); idempotency calls pass an explicit actor (records are now per-actor, so a different POS cashier reusing a key gets their own sale instead of a `409`); admin screens use `ConfirmDialog`, translated stacked-table labels, focusable named scroll regions and `admin-status-pill`; the orders CSV export neutralises formula-leading cells; `MODULE_CONTRACT_VERSION` is `4.7.0` here (the local dimensional-projection change was `4.2.0` before upstream took `4.2.0`–`4.6.0`); the per-job secret classification covers the `commerce` secrets; `APP_BUDGET_BYTES` is 380,942. `AGENTS.md`'s "Last sync" row and "Known local divergences" list are brought current (they still named `0d6c0dfe`).
