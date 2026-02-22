-- Migration: Multi-brand support
-- Adds user_brands table and brand_name columns to purchase/report tables
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. USER BRANDS TABLE
-- Tracks all brands a user manages
-- ============================================
CREATE TABLE IF NOT EXISTS user_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  
  -- The brand's latest overall score (updated on each report)
  latest_score INTEGER,
  latest_report_id TEXT,
  latest_report_tier TEXT, -- snapshot, snapshot_plus, blueprint, blueprint_plus
  
  -- Purchase tracking per brand
  has_snapshot_plus BOOLEAN DEFAULT FALSE,
  has_blueprint BOOLEAN DEFAULT FALSE,
  has_blueprint_plus BOOLEAN DEFAULT FALSE,
  
  report_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uq_user_brand UNIQUE (user_email, brand_name)
);

CREATE INDEX IF NOT EXISTS idx_user_brands_email ON user_brands(user_email);
CREATE INDEX IF NOT EXISTS idx_user_brands_name ON user_brands(brand_name);

-- Trigger for updated_at
CREATE TRIGGER update_user_brands_updated_at
  BEFORE UPDATE ON user_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADD brand_name TO EXISTING TABLES
-- Links reports and purchases to specific brands
-- ============================================

-- Add brand_name to brand_snapshot_reports (may already have company_name, but brand_name is the canonical field)
ALTER TABLE brand_snapshot_reports
  ADD COLUMN IF NOT EXISTS brand_name TEXT;

-- Add brand_name to brand_snapshot_plus_reports  
ALTER TABLE brand_snapshot_plus_reports
  ADD COLUMN IF NOT EXISTS brand_name TEXT;

-- Add brand_name to brand_snapshot_purchases (per-purchase brand tracking)
ALTER TABLE brand_snapshot_purchases
  ADD COLUMN IF NOT EXISTS brand_name TEXT;

-- Add brand_name to refresh_entitlements if not present
ALTER TABLE refresh_entitlements
  ADD COLUMN IF NOT EXISTS brand_name TEXT;

-- ============================================
-- 3. BACKFILL brand_name FROM EXISTING DATA
-- Populate brand_name from company_name where available
-- ============================================

-- Backfill brand_snapshot_reports
UPDATE brand_snapshot_reports
SET brand_name = COALESCE(company_name, company, 'Unknown')
WHERE brand_name IS NULL;

-- Backfill brand_snapshot_plus_reports from full_report JSON
UPDATE brand_snapshot_plus_reports
SET brand_name = COALESCE(
  full_report->>'businessName',
  full_report->>'company_name',
  user_name,
  'Unknown'
)
WHERE brand_name IS NULL AND full_report IS NOT NULL;

-- ============================================
-- 4. AUTO-POPULATE user_brands FROM EXISTING REPORTS
-- Creates brand entries for all existing report data
-- ============================================

INSERT INTO user_brands (user_email, brand_name, latest_score, report_count)
SELECT 
  user_email,
  COALESCE(brand_name, company_name, 'Unknown') as brand_name,
  MAX(brand_alignment_score) as latest_score,
  COUNT(*) as report_count
FROM brand_snapshot_reports
WHERE user_email IS NOT NULL
GROUP BY user_email, COALESCE(brand_name, company_name, 'Unknown')
ON CONFLICT (user_email, brand_name) DO UPDATE
SET 
  latest_score = EXCLUDED.latest_score,
  report_count = EXCLUDED.report_count,
  updated_at = NOW();

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_snapshot_reports_brand_name ON brand_snapshot_reports(brand_name);
CREATE INDEX IF NOT EXISTS idx_snapshot_plus_reports_brand_name ON brand_snapshot_plus_reports(brand_name);
