-- migration_create_blueprint_reports.sql
-- Creates the blueprint_reports table referenced by API routes and alter migrations.
-- This table stores generated Blueprint/Blueprint+ report data with structured fields.
-- Run BEFORE migration_add_columns_and_constraints.sql and migration_fix_linter_warnings_v2.sql.

CREATE TABLE IF NOT EXISTS blueprint_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  company_name TEXT,
  tier TEXT DEFAULT 'blueprint',
  report_data JSONB,
  pillar_scores JSONB,
  brand_alignment_score INT,
  brand_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_reports_user_email ON blueprint_reports (user_email);
CREATE INDEX IF NOT EXISTS idx_blueprint_reports_report_id ON blueprint_reports (report_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_reports_company ON blueprint_reports (company_name);
CREATE INDEX IF NOT EXISTS idx_blueprint_reports_created ON blueprint_reports (created_at DESC);

ALTER TABLE blueprint_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to blueprint_reports"
  ON blueprint_reports FOR ALL
  USING (true)
  WITH CHECK (true);
