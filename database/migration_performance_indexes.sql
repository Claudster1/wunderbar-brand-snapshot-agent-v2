-- Performance indexes for common query patterns
-- Run this migration against your Supabase database

-- ─── Composite index for history queries (email + date sort) ───
-- Used by /api/history and getUserSnapshots when filtered by email
-- Covers: WHERE user_email = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_snapshot_reports_email_created
  ON brand_snapshot_reports (user_email, created_at DESC)
  WHERE user_email IS NOT NULL;

-- NOTE: brand_snapshot_purchases table index skipped — table not yet created.
-- Add this index once the purchases table is set up:
-- CREATE INDEX IF NOT EXISTS idx_purchases_report_id
--   ON brand_snapshot_purchases (report_id)
--   WHERE report_id IS NOT NULL;

-- NOTE: benchmark_data table index skipped — table not yet created.
-- Add this index once the benchmark_data table is set up:
-- CREATE INDEX IF NOT EXISTS idx_benchmark_industry_audience
--   ON benchmark_data (industry, audience_type)
--   WHERE industry IS NOT NULL;

-- NOTE: voc_responses table index skipped — table not yet created.
-- Add this index once the voc_responses table is set up:
-- CREATE INDEX IF NOT EXISTS idx_voc_responses_survey_created
--   ON voc_responses (survey_id, created_at DESC);
