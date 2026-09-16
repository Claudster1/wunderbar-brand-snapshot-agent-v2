-- ═══════════════════════════════════════════════════════════════
-- Brand assets — logo lookup index + RLS reminder
-- ═══════════════════════════════════════════════════════════════
-- Speeds primary-logo resolution (user_email + tier + category).
-- Bucket brand-assets remains private; only service_role should
-- have storage/table policies (see migration_brand_asset_uploads).
--
-- Run in Supabase SQL Editor after migration_brand_asset_uploads.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

CREATE INDEX IF NOT EXISTS idx_asset_uploads_email_tier_category
  ON brand_asset_uploads (user_email, tier, asset_category);

-- Defensive: ensure bucket stays private if someone flipped it public.
UPDATE storage.buckets
SET public = false
WHERE id = 'brand-assets' AND public IS DISTINCT FROM false;

COMMIT;
