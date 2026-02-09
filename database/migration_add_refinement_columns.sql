-- database/migration_add_refinement_columns.sql
-- Migration: Add refinement tracking columns to brand_snapshot_reports
-- Purpose: Support score version history and refinement tracking

-- Add score_history column to track previous scores
ALTER TABLE brand_snapshot_reports
ADD COLUMN IF NOT EXISTS score_history JSONB DEFAULT '[]'::jsonb;

-- Add refinement tracking columns
ALTER TABLE brand_snapshot_reports
ADD COLUMN IF NOT EXISTS last_refined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refinement_count INTEGER DEFAULT 0;

-- Create index on refinement_count for finding refined reports
CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_refinement_count
  ON brand_snapshot_reports (refinement_count)
  WHERE refinement_count > 0;

-- Example score_history format:
-- [
--   {
--     "timestamp": "2026-01-26T12:00:00Z",
--     "brandAlignmentScore": 65,
--     "pillarScores": { "positioning": 12, "messaging": 14, ... },
--     "source": "refinement"
--   }
-- ]
