-- database/migration_snapshot_refinement_requests.sql
-- Migration: Create snapshot_refinement_requests table
-- Purpose: Store refinement requests for snapshot reports

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create snapshot_refinement_requests table
CREATE TABLE IF NOT EXISTS snapshot_refinement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  pillar text NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'open'
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_report_id 
  ON snapshot_refinement_requests (report_id);

CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_status 
  ON snapshot_refinement_requests (status);

CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_pillar 
  ON snapshot_refinement_requests (pillar);

-- Add constraint for status values (optional, but recommended)
ALTER TABLE snapshot_refinement_requests
  ADD CONSTRAINT snapshot_refinement_status_check 
  CHECK (status IN ('open', 'in_progress', 'completed', 'closed'));

-- Add constraint for pillar values (optional, but recommended)
ALTER TABLE snapshot_refinement_requests
  ADD CONSTRAINT snapshot_refinement_pillar_check 
  CHECK (pillar IN ('positioning', 'messaging', 'visibility', 'credibility', 'conversion'));
