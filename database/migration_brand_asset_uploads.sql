-- ═══════════════════════════════════════════════════════════════
-- Brand Asset Uploads — Storage bucket + tracking table
-- ═══════════════════════════════════════════════════════════════
-- Allows Blueprint™ and Blueprint+™ users to upload current
-- marketing assets (decks, collateral, emails, images) for
-- AI-powered brand consistency analysis.
--
-- Tier limits:
--   Blueprint™:  up to 3 assets (images, PDFs)
--   Blueprint+™: up to 10 assets (images, PDFs, PPTX, DOCX)
--
-- Run in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────
-- 1. Storage bucket (private)
-- ───────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  false,
  20971520, -- 20 MB per file
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: service role handles all uploads/downloads
CREATE POLICY "Service role full access to brand-assets"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'brand-assets' AND (select auth.role()) = 'service_role')
  WITH CHECK (bucket_id = 'brand-assets' AND (select auth.role()) = 'service_role');

-- ───────────────────────────────────────────────────────────────
-- 2. Tracking table
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_asset_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  session_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('blueprint', 'blueprint-plus')),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  asset_category TEXT DEFAULT 'other',
  analysis JSONB,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brand_asset_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to brand_asset_uploads"
  ON brand_asset_uploads
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE INDEX IF NOT EXISTS idx_asset_uploads_email
  ON brand_asset_uploads (user_email);
CREATE INDEX IF NOT EXISTS idx_asset_uploads_session
  ON brand_asset_uploads (session_id);
CREATE INDEX IF NOT EXISTS idx_asset_uploads_tier
  ON brand_asset_uploads (tier);

COMMIT;
