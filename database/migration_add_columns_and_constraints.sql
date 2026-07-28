-- ===========================================
-- Migration: Add columns, constraints, and indexes
-- Description: Ensures necessary columns exist, adds email constraints,
--              creates indexes, and sets up proper access controls
-- ===========================================

-- ===========================================
-- 1. Ensure necessary columns exist
-- ===========================================

ALTER TABLE public.brand_snapshot_reports
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS pillar_scores JSONB,
  ADD COLUMN IF NOT EXISTS pillar_insights JSONB,
  ADD COLUMN IF NOT EXISTS recommendations JSONB,
  ADD COLUMN IF NOT EXISTS website_notes TEXT,
  ADD COLUMN IF NOT EXISTS full_report JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.brand_snapshot_plus_reports
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS pillar_scores JSONB,
  ADD COLUMN IF NOT EXISTS pillar_insights JSONB,
  ADD COLUMN IF NOT EXISTS recommendations JSONB,
  ADD COLUMN IF NOT EXISTS website_notes TEXT,
  ADD COLUMN IF NOT EXISTS full_report JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.blueprint_reports
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS pillar_scores JSONB,
  ADD COLUMN IF NOT EXISTS pillar_insights JSONB,
  ADD COLUMN IF NOT EXISTS recommendations JSONB,
  ADD COLUMN IF NOT EXISTS website_notes TEXT,
  ADD COLUMN IF NOT EXISTS full_report JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- ===========================================
-- 2. Backfill emails to lowercase
-- ===========================================

UPDATE public.brand_snapshot_reports
SET user_email = LOWER(user_email)
WHERE user_email IS NOT NULL;

UPDATE public.brand_snapshot_plus_reports
SET user_email = LOWER(user_email)
WHERE user_email IS NOT NULL;

UPDATE public.blueprint_reports
SET user_email = LOWER(user_email)
WHERE user_email IS NOT NULL;

-- ===========================================
-- 3. Add updated_at defaults and NOT NULL
-- ===========================================

ALTER TABLE public.brand_snapshot_reports
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.brand_snapshot_plus_reports
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.blueprint_reports
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

-- ===========================================
-- 4. Add CHECK constraints for lowercase emails
--    (safe: only added if missing)
-- ===========================================

DO $$
BEGIN
  -- WunderBrand Snapshot™
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_snapshot_email_lowercase'
  ) THEN
    ALTER TABLE public.brand_snapshot_reports
      ADD CONSTRAINT chk_snapshot_email_lowercase
      CHECK (user_email = LOWER(user_email));
  END IF;

  -- Snapshot+
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_snapshot_plus_email_lowercase'
  ) THEN
    ALTER TABLE public.brand_snapshot_plus_reports
      ADD CONSTRAINT chk_snapshot_plus_email_lowercase
      CHECK (user_email = LOWER(user_email));
  END IF;

  -- Blueprint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_blueprint_email_lowercase'
  ) THEN
    ALTER TABLE public.blueprint_reports
      ADD CONSTRAINT chk_blueprint_email_lowercase
      CHECK (user_email = LOWER(user_email));
  END IF;
END$$;

-- ===========================================
-- 5. Helpful indexes
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_snapshot_user_email
  ON public.brand_snapshot_reports (user_email);

CREATE INDEX IF NOT EXISTS idx_snapshot_plus_user_email
  ON public.brand_snapshot_plus_reports (user_email);

CREATE INDEX IF NOT EXISTS idx_blueprint_user_email
  ON public.blueprint_reports (user_email);

-- ===========================================
-- 6. Report access
--    All report reads go through server-side API routes using the
--    service_role key (which bypasses RLS). Do NOT grant the public anon
--    role SELECT on report tables — combined with a permissive RLS policy
--    it exposes every row (user_email, full_report). See
--    migration_harden_report_pii_rls.sql.
-- ===========================================

-- (Intentionally no GRANT SELECT ... TO anon on report tables.)

