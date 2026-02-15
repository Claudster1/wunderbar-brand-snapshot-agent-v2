-- Migration: Add email verification columns to brand_snapshot_reports
-- Run this in Supabase SQL Editor before deploying.

ALTER TABLE brand_snapshot_reports
  ADD COLUMN IF NOT EXISTS email_verification_code TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Index for quick lookup during verification
CREATE INDEX IF NOT EXISTS idx_reports_email_verification
  ON brand_snapshot_reports (report_id)
  WHERE email_verified = FALSE;

-- Optional: Add behavioral risk score column for analytics
ALTER TABLE brand_snapshot_reports
  ADD COLUMN IF NOT EXISTS behavioral_risk_score INTEGER;

COMMENT ON COLUMN brand_snapshot_reports.email_verification_code IS 'Temporary 6-digit code for email verification. Cleared after successful verification.';
COMMENT ON COLUMN brand_snapshot_reports.email_verification_expires IS 'Expiry timestamp for the verification code (15 minutes from send).';
COMMENT ON COLUMN brand_snapshot_reports.email_verified IS 'Whether the user has verified their email address.';
COMMENT ON COLUMN brand_snapshot_reports.behavioral_risk_score IS 'Bot detection risk score (0-100). Higher = more suspicious.';
