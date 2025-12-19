-- Brand Snapshot Database Schema
-- Complete schema for Brand Snapshot™, Snapshot+™, and Blueprint™ products
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. BRAND SNAPSHOT SESSIONS
-- In-progress Snapshot™ conversation
-- ============================================
CREATE TABLE IF NOT EXISTS brand_snapshot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  conversation_history JSONB,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_sessions_user_id ON brand_snapshot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_sessions_session_id ON brand_snapshot_sessions(session_id);

-- ============================================
-- 3. BRAND SNAPSHOT RESULTS
-- Final free Snapshot™ scoring
-- ============================================
CREATE TABLE IF NOT EXISTS brand_snapshot_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES brand_snapshot_sessions(session_id) ON DELETE SET NULL,
  report_id TEXT UNIQUE NOT NULL,
  brand_alignment_score INTEGER,
  pillar_scores JSONB,
  pillar_insights JSONB,
  summary TEXT,
  overall_interpretation TEXT,
  opportunities_summary TEXT,
  upgrade_cta TEXT,
  snapshot_upsell TEXT,
  weakest_pillar TEXT,
  strengths TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_results_user_id ON brand_snapshot_results(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_results_report_id ON brand_snapshot_results(report_id);

-- ============================================
-- 4. BRAND SNAPSHOT REPORTS (EXISTING)
-- Full structured report
-- ============================================
CREATE TABLE IF NOT EXISTS brand_snapshot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL,
  user_name TEXT,
  email TEXT,
  company TEXT,
  company_name TEXT,
  brand_alignment_score INTEGER,
  pillar_scores JSONB,
  pillar_insights JSONB,
  recommendations JSONB,
  website_notes TEXT,
  summary TEXT,
  overall_interpretation TEXT,
  opportunities_summary TEXT,
  upgrade_cta TEXT,
  snapshot_upsell TEXT,
  weakest_pillar TEXT,
  strengths TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_id ON brand_snapshot_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON brand_snapshot_reports(created_at DESC);

-- ============================================
-- 5. BRAND SNAPSHOT PLUS REPORTS
-- Snapshot+™ deep-dive report
-- ============================================
CREATE TABLE IF NOT EXISTS brand_snapshot_plus_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_id TEXT UNIQUE NOT NULL,
  base_snapshot_report_id TEXT REFERENCES brand_snapshot_reports(report_id) ON DELETE SET NULL,
  
  -- Deeper pillar analysis
  deeper_pillar_analysis JSONB,
  
  -- Competitive observations (from URL scan)
  competitive_observations JSONB,
  
  -- Maturity stage
  maturity_stage TEXT, -- early, developing, established, mature
  
  -- Roadmap recommendations
  roadmap_recommendations JSONB, -- { short_term: [], medium_term: [], long_term: [] }
  
  -- Channel-specific recommendations
  channel_recommendations JSONB, -- { email: [], social: [], website: [], etc. }
  
  -- Prioritization score
  prioritization_score JSONB, -- { pillar: score } for each pillar
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_plus_user_id ON brand_snapshot_plus_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_plus_report_id ON brand_snapshot_plus_reports(report_id);

-- ============================================
-- 6. BRAND BLUEPRINT SESSIONS
-- In-progress Blueprint™
-- ============================================
CREATE TABLE IF NOT EXISTS brand_blueprint_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  conversation_history JSONB,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_user_id ON brand_blueprint_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_sessions_session_id ON brand_blueprint_sessions(session_id);

-- ============================================
-- 7. BRAND BLUEPRINT RESULTS
-- Final Blueprint™ deliverables
-- ============================================
CREATE TABLE IF NOT EXISTS brand_blueprint_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES brand_blueprint_sessions(session_id) ON DELETE SET NULL,
  blueprint_id TEXT UNIQUE NOT NULL,
  
  -- Brand Strategy Core
  brand_strategy_core JSONB,
  
  -- Audience segmentation
  audience_segmentation JSONB,
  
  -- Messaging architecture
  messaging_architecture JSONB,
  
  -- Differentiation map
  differentiation_map JSONB,
  
  -- Content pillars
  content_pillars JSONB,
  
  -- Brand story / narrative
  brand_story TEXT,
  brand_narrative TEXT,
  
  -- Visual direction notes
  visual_direction_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_results_user_id ON brand_blueprint_results(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_results_blueprint_id ON brand_blueprint_results(blueprint_id);

-- ============================================
-- 7b. BRAND BLUEPRINT+ REPORTS
-- Blueprint+™ expanded deliverable (saved output)
-- ============================================
CREATE TABLE IF NOT EXISTS brand_blueprint_plus_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL,
  base_blueprint_id TEXT,

  -- Ownership / retrieval
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,

  -- Normalized content (matches BlueprintPlusDocument shape)
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

CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_user_id ON brand_blueprint_plus_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_report_id ON brand_blueprint_plus_reports(report_id);

-- ============================================
-- 8. USER PURCHASES
-- Plan access + Stripe info
-- ============================================
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Access flags
  has_brand_snapshot_plus BOOLEAN DEFAULT FALSE,
  has_blueprint BOOLEAN DEFAULT FALSE,
  has_blueprint_plus BOOLEAN DEFAULT FALSE,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Purchase metadata
  purchase_date TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_stripe_customer ON user_purchases(stripe_customer_id);

-- ============================================
-- 9. ONBOARDING STATUS
-- Funnel state per user
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  status TEXT DEFAULT 'not_started', 
  -- Possible values:
  -- not_started
  -- snapshot_started
  -- snapshot_completed
  -- snapshot_plus_purchased
  -- blueprint_started
  -- blueprint_completed
  -- blueprint_plus_purchased
  
  -- Status timestamps
  snapshot_started_at TIMESTAMP,
  snapshot_completed_at TIMESTAMP,
  snapshot_plus_purchased_at TIMESTAMP,
  blueprint_started_at TIMESTAMP,
  blueprint_completed_at TIMESTAMP,
  blueprint_plus_purchased_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_status_user_id ON onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_status ON onboarding_status(status);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to tables that need them
CREATE TRIGGER update_brand_snapshot_sessions_updated_at 
  BEFORE UPDATE ON brand_snapshot_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_snapshot_plus_reports_updated_at 
  BEFORE UPDATE ON brand_snapshot_plus_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_blueprint_sessions_updated_at 
  BEFORE UPDATE ON brand_blueprint_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_blueprint_results_updated_at 
  BEFORE UPDATE ON brand_blueprint_results 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_blueprint_plus_reports_updated_at 
  BEFORE UPDATE ON brand_blueprint_plus_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_purchases_updated_at 
  BEFORE UPDATE ON user_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at 
  BEFORE UPDATE ON onboarding_status 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES
-- ============================================
-- 
-- This schema supports:
-- 1. Free Brand Snapshot™ (brand_snapshot_reports)
-- 2. Paid Snapshot+™ upgrade (brand_snapshot_plus_reports)
-- 3. Blueprint™ product (brand_blueprint_sessions, brand_blueprint_results)
-- 4. User management and purchases (users, user_purchases)
-- 5. Funnel tracking (onboarding_status)
--
-- All tables use UUID primary keys for scalability
-- Foreign keys use ON DELETE CASCADE/SET NULL appropriately
-- Indexes created for common query patterns
-- Updated_at triggers automatically maintain timestamps
