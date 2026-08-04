-- ═══════════════════════════════════════════════════════════════
-- Fix: brand_snapshot_reports missing columns (PGRST204)
-- ═══════════════════════════════════════════════════════════════
-- Prod was missing columns the app writes on draft create / progress
-- / complete. Symptom: "Draft persistence temporarily unavailable"
-- and Supabase error:
--   Could not find the 'context_coverage' column of
--   'brand_snapshot_reports' in the schema cache
--
-- Run in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.brand_snapshot_reports
  ADD COLUMN IF NOT EXISTS primary_pillar text,
  ADD COLUMN IF NOT EXISTS context_coverage integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS snapshot_stage text DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS last_step text,
  ADD COLUMN IF NOT EXISTS progress jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS has_snapshot_plus boolean DEFAULT false,
  -- Email verification / history filters (OTP path + /api/history)
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verification_code text,
  ADD COLUMN IF NOT EXISTS email_verification_expires timestamptz,
  ADD COLUMN IF NOT EXISTS behavioral_risk_score integer;

-- Constraints only if missing (existing rows may have NULLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_context_coverage_range'
  ) THEN
    ALTER TABLE public.brand_snapshot_reports
      ADD CONSTRAINT check_context_coverage_range
      CHECK (context_coverage IS NULL OR (context_coverage >= 0 AND context_coverage <= 100));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_snapshot_stage
  ON public.brand_snapshot_reports (snapshot_stage);

CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_status
  ON public.brand_snapshot_reports (status);

CREATE INDEX IF NOT EXISTS idx_reports_email_verification
  ON public.brand_snapshot_reports (report_id)
  WHERE email_verified = false;

COMMIT;

-- Reload PostgREST schema cache (Supabase)
NOTIFY pgrst, 'reload schema';
