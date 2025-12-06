-- Brand Snapshot Reports Database Schema
-- Run this in Supabase SQL Editor

-- Brand Snapshot Reports Database Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS brand_snapshot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL,
  user_name TEXT,
  email TEXT,
  company TEXT,
  brand_alignment_score INTEGER,
  pillar_scores JSONB,
  pillar_insights JSONB,
  recommendations JSONB,
  website_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on report_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_report_id ON brand_snapshot_reports(report_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_created_at ON brand_snapshot_reports(created_at DESC);

