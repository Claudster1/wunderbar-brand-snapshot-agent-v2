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

-- Shared trigger function for auto-updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_brands_updated_at ON user_brands;
CREATE TRIGGER update_user_brands_updated_at
  BEFORE UPDATE ON user_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADD brand_name TO EXISTING TABLES (safe — skips if table missing)
-- ============================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_reports') THEN
    ALTER TABLE brand_snapshot_reports ADD COLUMN IF NOT EXISTS brand_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_plus_reports') THEN
    ALTER TABLE brand_snapshot_plus_reports ADD COLUMN IF NOT EXISTS brand_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_purchases') THEN
    ALTER TABLE brand_snapshot_purchases ADD COLUMN IF NOT EXISTS brand_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refresh_entitlements') THEN
    ALTER TABLE refresh_entitlements ADD COLUMN IF NOT EXISTS brand_name TEXT;
  END IF;
END $$;

-- ============================================
-- 3. BACKFILL brand_name FROM EXISTING DATA (safe — skips if table missing)
-- ============================================

DO $$
DECLARE
  has_company_name BOOLEAN;
  has_company BOOLEAN;
  has_user_name BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_reports') THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_snapshot_reports' AND column_name = 'company_name') INTO has_company_name;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_snapshot_reports' AND column_name = 'company') INTO has_company;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_snapshot_reports' AND column_name = 'user_name') INTO has_user_name;

    IF has_company_name THEN
      EXECUTE 'UPDATE brand_snapshot_reports SET brand_name = COALESCE(company_name, ''Unknown'') WHERE brand_name IS NULL';
    ELSIF has_company THEN
      EXECUTE 'UPDATE brand_snapshot_reports SET brand_name = COALESCE(company, ''Unknown'') WHERE brand_name IS NULL';
    ELSIF has_user_name THEN
      EXECUTE 'UPDATE brand_snapshot_reports SET brand_name = COALESCE(user_name, ''Unknown'') WHERE brand_name IS NULL';
    ELSE
      UPDATE brand_snapshot_reports SET brand_name = 'Unknown' WHERE brand_name IS NULL;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_plus_reports') THEN
    UPDATE brand_snapshot_plus_reports
    SET brand_name = COALESCE(
      full_report->>'businessName',
      full_report->>'company_name',
      user_name,
      'Unknown'
    )
    WHERE brand_name IS NULL AND full_report IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- 4. AUTO-POPULATE user_brands FROM EXISTING REPORTS (safe — skips if table missing)
-- ============================================

DO $$
DECLARE
  has_company_name BOOLEAN;
  has_company BOOLEAN;
  fallback_expr TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_reports') THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_snapshot_reports' AND column_name = 'company_name') INTO has_company_name;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_snapshot_reports' AND column_name = 'company') INTO has_company;

    IF has_company_name THEN
      fallback_expr := 'COALESCE(brand_name, company_name, ''Unknown'')';
    ELSIF has_company THEN
      fallback_expr := 'COALESCE(brand_name, company, ''Unknown'')';
    ELSE
      fallback_expr := 'COALESCE(brand_name, ''Unknown'')';
    END IF;

    EXECUTE format(
      'INSERT INTO user_brands (user_email, brand_name, latest_score, report_count)
       SELECT user_email,
              %s as brand_name,
              MAX(brand_alignment_score) as latest_score,
              COUNT(*) as report_count
       FROM brand_snapshot_reports
       WHERE user_email IS NOT NULL
       GROUP BY user_email, %s
       ON CONFLICT (user_email, brand_name) DO UPDATE
       SET latest_score = EXCLUDED.latest_score,
           report_count = EXCLUDED.report_count,
           updated_at = NOW()',
      fallback_expr, fallback_expr
    );
  END IF;
END $$;

-- ============================================
-- 5. INDEXES FOR PERFORMANCE (safe — skips if table missing)
-- ============================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_reports') THEN
    CREATE INDEX IF NOT EXISTS idx_snapshot_reports_brand_name ON brand_snapshot_reports(brand_name);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_snapshot_plus_reports') THEN
    CREATE INDEX IF NOT EXISTS idx_snapshot_plus_reports_brand_name ON brand_snapshot_plus_reports(brand_name);
  END IF;
END $$;
