-- migration_workbook_finalization.sql
-- Adds finalization tracking to the brand_workbook table.
-- Blueprint tier: editable for 14 days, then finalized (read-only).
-- Blueprint+ tier: always editable (no finalization gate).

ALTER TABLE brand_workbook
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_brand_workbook_finalized
  ON brand_workbook (product_tier, finalized_at)
  WHERE finalized_at IS NULL;
