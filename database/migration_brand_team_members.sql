-- database/migration_brand_team_members.sql
-- Migration: Create brand_team_members table
-- Purpose: Store team member relationships for brand accounts

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create brand_team_members table
CREATE TABLE IF NOT EXISTS brand_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email text NOT NULL,
  member_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_brand_team_members_owner_email 
  ON brand_team_members (owner_email);

CREATE INDEX IF NOT EXISTS idx_brand_team_members_member_email 
  ON brand_team_members (member_email);

-- Create unique constraint to prevent duplicate team member relationships
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_team_members_unique 
  ON brand_team_members (owner_email, member_email);

ALTER TABLE brand_team_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE brand_team_members FROM anon;
REVOKE ALL ON TABLE brand_team_members FROM authenticated;
DROP POLICY IF EXISTS "Service role full access to brand_team_members" ON brand_team_members;
CREATE POLICY "Service role full access to brand_team_members"
  ON brand_team_members FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
