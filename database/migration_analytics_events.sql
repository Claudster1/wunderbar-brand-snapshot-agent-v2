-- ============================================
-- ANALYTICS EVENTS TABLE
-- First-party event log for product analytics
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identity
  event_name TEXT NOT NULL,                -- e.g. SNAPSHOT_STARTED, UPGRADE_CLICKED
  event_category TEXT DEFAULT 'product',   -- product, engagement, conversion, system

  -- Session / user linkage
  session_id TEXT,                          -- brand_snapshot_sessions.session_id if available
  report_id TEXT,                           -- brand_snapshot_reports.report_id if available
  user_email TEXT,                          -- email if known at event time
  anonymous_id TEXT,                        -- localStorage-based anonymous ID

  -- Attribution (denormalized from session_attribution for fast queries)
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  is_ai_referral BOOLEAN DEFAULT FALSE,
  ai_source TEXT,                           -- chatgpt, perplexity, gemini, claude, copilot

  -- A/B testing
  ab_variant TEXT,                          -- e.g. "A" or "B"
  ab_test_id TEXT,                          -- e.g. "upgrade_cta_v2"

  -- Arbitrary metadata
  meta JSONB DEFAULT '{}',

  -- Client info
  page_path TEXT,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_report ON analytics_events(report_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ai ON analytics_events(is_ai_referral) WHERE is_ai_referral = TRUE;
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ab ON analytics_events(ab_test_id, ab_variant);


-- ============================================
-- SESSION ATTRIBUTION TABLE
-- Captures referrer, UTM, and AI source on first visit
-- ============================================
CREATE TABLE IF NOT EXISTS session_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Anonymous visitor identity (persisted in localStorage)
  anonymous_id TEXT NOT NULL,

  -- Referrer
  referrer TEXT,
  referrer_domain TEXT,

  -- AI source detection
  is_ai_referral BOOLEAN DEFAULT FALSE,
  ai_source TEXT,                           -- chatgpt, perplexity, gemini, claude, copilot

  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Landing page
  landing_page TEXT,

  -- User linkage (filled in when email is captured)
  user_email TEXT,
  report_id TEXT,

  -- Device info
  user_agent TEXT,
  screen_width INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_attribution_anon ON session_attribution(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_session_attribution_email ON session_attribution(user_email);
CREATE INDEX IF NOT EXISTS idx_session_attribution_ai ON session_attribution(is_ai_referral) WHERE is_ai_referral = TRUE;
CREATE INDEX IF NOT EXISTS idx_session_attribution_created ON session_attribution(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_attribution_utm ON session_attribution(utm_source, utm_medium);

-- updated_at trigger
CREATE TRIGGER update_session_attribution_updated_at
  BEFORE UPDATE ON session_attribution
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
