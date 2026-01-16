-- database/migration_add_snapshot_progress_columns.sql
-- Migration: Add progress tracking columns to brand_snapshot_reports
-- Purpose: Support save/resume functionality and progress tracking

ALTER TABLE brand_snapshot_reports
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS last_step TEXT,
ADD COLUMN IF NOT EXISTS progress JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_status 
  ON brand_snapshot_reports (status);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_brand_snapshot_reports_updated_at 
  ON brand_snapshot_reports (updated_at DESC);
