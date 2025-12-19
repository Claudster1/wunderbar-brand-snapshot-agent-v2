-- Add Brand Blueprint+™ reports table
-- Run this in Supabase SQL Editor (or via migration tooling)

CREATE TABLE IF NOT EXISTS brand_blueprint_plus_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Public share/report identifier (used in URLs)
  report_id TEXT UNIQUE NOT NULL,

  -- Optional linkage (if you have an internal Blueprint id)
  base_blueprint_id TEXT,

  -- Ownership / retrieval
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,

  -- Core content (stored both normalized + full JSON for flexibility)
  brand_story JSONB,
  positioning JSONB,
  journey JSONB,
  content_roadmap JSONB,
  visual_direction JSONB,
  personality TEXT,
  decision_filters JSONB,
  ai_prompts JSONB,
  additional_sections JSONB,

  full_report JSONB,
  pdf_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_user_id
  ON brand_blueprint_plus_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_report_id
  ON brand_blueprint_plus_reports(report_id);

-- Ensure update_updated_at_column() exists (created in schema.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_brand_blueprint_plus_reports_updated_at'
  ) THEN
    CREATE TRIGGER update_brand_blueprint_plus_reports_updated_at
      BEFORE UPDATE ON brand_blueprint_plus_reports
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS recommendation (optional but strongly recommended if you enable login):
-- ALTER TABLE brand_blueprint_plus_reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "blueprint_plus_owner_read"
--   ON brand_blueprint_plus_reports
--   FOR SELECT
--   USING (auth.uid() = user_id);
-- CREATE POLICY "blueprint_plus_owner_update"
--   ON brand_blueprint_plus_reports
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);



