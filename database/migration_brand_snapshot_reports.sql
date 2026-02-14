-- database/migration_brand_snapshot_reports.sql
-- Migration: Create brand_snapshot_reports table
-- Purpose: Store WunderBrand Snapshot™ report data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create brand_snapshot_reports table
CREATE TABLE IF NOT EXISTS brand_snapshot_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  brand_name text NOT NULL,
  brand_alignment_score integer NOT NULL,
  pillar_scores jsonb NOT NULL,
  primary_pillar text NOT NULL,
  context_coverage integer NOT NULL,
  snapshot_stage text NOT NULL, -- e.g. "completed", "in_progress"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_user_email 
  ON brand_snapshot_reports (user_email);

CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_created_at 
  ON brand_snapshot_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_snapshot_stage 
  ON brand_snapshot_reports (snapshot_stage);

-- Add check constraint for context_coverage (0-100)
ALTER TABLE brand_snapshot_reports
  ADD CONSTRAINT check_context_coverage_range 
  CHECK (context_coverage >= 0 AND context_coverage <= 100);

-- Add check constraint for brand_alignment_score (0-100)
ALTER TABLE brand_snapshot_reports
  ADD CONSTRAINT check_brand_alignment_score_range 
  CHECK (brand_alignment_score >= 0 AND brand_alignment_score <= 100);
