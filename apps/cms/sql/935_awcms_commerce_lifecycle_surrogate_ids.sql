-- ahliweb/omes-web#17 (upstream sync of 25 October 2026) — give the four
-- `commerce` tables that lacked one a surrogate `id`, so the `data_lifecycle`
-- generic purge engine can retire their rows.
--
-- `data_lifecycle`'s generic purge pass (`archive-purge-job.ts`,
-- `runGenericPurgePass`) deletes in bounded batches with
-- `DELETE FROM <table> WHERE id IN (SELECT id FROM <table> WHERE tenant = $1
-- AND cursor < $2 ... LIMIT n)`: it requires an `id` column. Four `commerce`
-- descriptors declare `executionMode: "generic"` over tables that have none —
-- `awcms_commerce_store_settings` (primary key `tenant_id`) and the three
-- derived sales-report tables of sql/933 (composite primary keys) — so every
-- purge pass for them failed with `42703 undefined_column`. The failure was
-- isolated per descriptor (upstream issue #1040) and logged as
-- `data_lifecycle.descriptor_failed`, which kept the rest of the run alive
-- but meant those four were never purged; upstream's
-- `idempotency-keys-retention` integration test, which asserts an empty
-- `descriptorFailures`, makes the gap visible.
--
-- The column is additive: a volatile `DEFAULT gen_random_uuid()` backfills
-- every existing row (these tables are tiny: one row per tenant for settings,
-- a few per trading day for the sales aggregates), the existing primary keys
-- and every `ON CONFLICT (...)` target stay as they are, and a unique index
-- makes the new column usable as a subquery key. RLS (ENABLE + FORCE) and
-- grants are table-level and so cover the new column unchanged. Forward-only
-- like every other migration here; no earlier migration file is touched.

ALTER TABLE awcms_commerce_store_settings
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS awcms_commerce_store_settings_id_key
  ON awcms_commerce_store_settings (id);

ALTER TABLE awcms_commerce_sales_daily
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS awcms_commerce_sales_daily_id_key
  ON awcms_commerce_sales_daily (id);

ALTER TABLE awcms_commerce_sales_by_product
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS awcms_commerce_sales_by_product_id_key
  ON awcms_commerce_sales_by_product (id);

ALTER TABLE awcms_commerce_sales_by_category
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS awcms_commerce_sales_by_category_id_key
  ON awcms_commerce_sales_by_category (id);
