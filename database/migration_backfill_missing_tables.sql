-- ═══════════════════════════════════════════════════════════════
-- Backfill missing feature tables (production DB was partially migrated)
-- ═══════════════════════════════════════════════════════════════
-- Context:
--   A table-inventory audit of the production DB showed ~11 feature tables
--   referenced by application code were never created (the DB was set up from a
--   partial migration run). This script creates all of them in one pass.
--
-- Design:
--   * Idempotent + safe to re-run: CREATE TABLE/INDEX IF NOT EXISTS, guarded
--     triggers/policies, and final-state column names (no create-then-rename).
--   * Security-hardened by default: every new table gets RLS enabled, anon
--     grants revoked, and a service-role-only policy — the same posture as
--     migration_harden_report_pii_rls.sql (all reads/writes are server-side via
--     the service_role key, which bypasses RLS).
--   * Ordered HIGH-impact first so the most important tables land even if a
--     later statement needs attention.
--
-- Run once in the Supabase SQL Editor (Run). Expect "Success. No rows returned."
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ── Prerequisites ──
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared updated_at trigger fn (normally created in schema.sql; ensure present)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- 1. refresh_entitlements  (HIGH — purchase fulfillment + refresh gating)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.refresh_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  product_tier TEXT NOT NULL,            -- snapshot_plus | blueprint | blueprint_plus
  purchase_id UUID,                      -- FK-in-spirit to brand_snapshot_purchases.id
  brand_name TEXT NOT NULL,
  window_start TIMESTAMP NOT NULL DEFAULT NOW(),
  window_end TIMESTAMP NOT NULL,
  max_free_refreshes INTEGER NOT NULL DEFAULT 0,
  refreshes_used INTEGER NOT NULL DEFAULT 0,
  paid_refresh_price INTEGER DEFAULT 0,  -- cents
  reminder_60_day_sent BOOLEAN DEFAULT FALSE,
  reminder_30_day_sent BOOLEAN DEFAULT FALSE,
  reminder_7_day_sent BOOLEAN DEFAULT FALSE,
  expiry_notice_sent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',          -- active | expired | upgraded
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_email ON public.refresh_entitlements(user_email);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_tier ON public.refresh_entitlements(product_tier);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_status ON public.refresh_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_window_end ON public.refresh_entitlements(window_end);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_brand ON public.refresh_entitlements(user_email, brand_name);
DROP TRIGGER IF EXISTS update_refresh_entitlements_updated_at ON public.refresh_entitlements;
CREATE TRIGGER update_refresh_entitlements_updated_at
  BEFORE UPDATE ON public.refresh_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.refresh_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.refresh_entitlements FROM anon;
DROP POLICY IF EXISTS "Service role full access to refresh_entitlements" ON public.refresh_entitlements;
CREATE POLICY "Service role full access to refresh_entitlements"
  ON public.refresh_entitlements FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 2. brand_blueprint_plus_reports  (HIGH — Blueprint+ report storage)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.brand_blueprint_plus_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL,
  base_blueprint_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
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
CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_user_id ON public.brand_blueprint_plus_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_plus_reports_report_id ON public.brand_blueprint_plus_reports(report_id);
DROP TRIGGER IF EXISTS update_brand_blueprint_plus_reports_updated_at ON public.brand_blueprint_plus_reports;
CREATE TRIGGER update_brand_blueprint_plus_reports_updated_at
  BEFORE UPDATE ON public.brand_blueprint_plus_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.brand_blueprint_plus_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.brand_blueprint_plus_reports FROM anon;
DROP POLICY IF EXISTS "Service role full access to brand_blueprint_plus_reports" ON public.brand_blueprint_plus_reports;
CREATE POLICY "Service role full access to brand_blueprint_plus_reports"
  ON public.brand_blueprint_plus_reports FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 3. blueprint_enrichment
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.blueprint_enrichment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.blueprint_enrichment ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blueprint_enrichment FROM anon;
DROP POLICY IF EXISTS "Service role full access to blueprint_enrichment" ON public.blueprint_enrichment;
CREATE POLICY "Service role full access to blueprint_enrichment"
  ON public.blueprint_enrichment FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 4. brand_snapshot_refinements
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.brand_snapshot_refinements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_report_id text NOT NULL,
  user_email text NOT NULL,
  pillar text NOT NULL CHECK (
    pillar IN ('positioning','messaging','visibility','credibility','conversion')
  ),
  additional_context text NOT NULL,
  supporting_urls text[],
  refined_insight jsonb,
  refined_recommendations jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_refinements_snapshot ON public.brand_snapshot_refinements(snapshot_report_id);
CREATE INDEX IF NOT EXISTS idx_refinements_user ON public.brand_snapshot_refinements(user_email);
ALTER TABLE public.brand_snapshot_refinements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.brand_snapshot_refinements FROM anon;
DROP POLICY IF EXISTS "Service role full access to brand_snapshot_refinements" ON public.brand_snapshot_refinements;
CREATE POLICY "Service role full access to brand_snapshot_refinements"
  ON public.brand_snapshot_refinements FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 5. snapshot_refinement_requests  (CHECK constraints inlined for re-run safety)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.snapshot_refinement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  pillar text NOT NULL CHECK (pillar IN ('positioning','messaging','visibility','credibility','conversion')),
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','closed'))
);
CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_report_id ON public.snapshot_refinement_requests (report_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_status ON public.snapshot_refinement_requests (status);
CREATE INDEX IF NOT EXISTS idx_snapshot_refinement_pillar ON public.snapshot_refinement_requests (pillar);
ALTER TABLE public.snapshot_refinement_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.snapshot_refinement_requests FROM anon;
DROP POLICY IF EXISTS "Service role full access to snapshot_refinement_requests" ON public.snapshot_refinement_requests;
CREATE POLICY "Service role full access to snapshot_refinement_requests"
  ON public.snapshot_refinement_requests FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 6. support_requests
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.support_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  product_name  TEXT NOT NULL CHECK (product_name IN (
    'WunderBrand Snapshot™','WunderBrand Snapshot+™','WunderBrand Blueprint™','WunderBrand Blueprint+™'
  )),
  issue_category TEXT NOT NULL CHECK (issue_category IN ('access','download','payment','account')),
  issue_description TEXT,
  purchase_timing TEXT CHECK (purchase_timing IS NULL OR purchase_timing IN ('today','yesterday','earlier')),
  error_message   TEXT,
  user_notes      TEXT,
  user_id         TEXT,
  stripe_session_id TEXT,
  ac_contact_id   TEXT,
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved','closed')),
  source        TEXT NOT NULL DEFAULT 'wundy_chat',
  resolved_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_email ON public.support_requests (email);
DROP TRIGGER IF EXISTS trigger_support_requests_updated_at ON public.support_requests;
CREATE TRIGGER trigger_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_requests FROM anon;
DROP POLICY IF EXISTS "Service role has full access to support_requests" ON public.support_requests;
DROP POLICY IF EXISTS "Service role full access to support_requests" ON public.support_requests;
CREATE POLICY "Service role full access to support_requests"
  ON public.support_requests FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 7. security_events
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  report_id TEXT,
  email TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_events_type_time ON public.security_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.security_events (ip_address, created_at DESC) WHERE ip_address IS NOT NULL;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_events FROM anon;
DROP POLICY IF EXISTS "No public access" ON public.security_events;
DROP POLICY IF EXISTS "Service role full access to security_events" ON public.security_events;
CREATE POLICY "Service role full access to security_events"
  ON public.security_events FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 8. session_attribution
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.session_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT NOT NULL,
  referrer TEXT,
  referrer_domain TEXT,
  is_ai_referral BOOLEAN DEFAULT FALSE,
  ai_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT,
  user_email TEXT,
  report_id TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_attribution_anon ON public.session_attribution(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_session_attribution_email ON public.session_attribution(user_email);
CREATE INDEX IF NOT EXISTS idx_session_attribution_ai ON public.session_attribution(is_ai_referral) WHERE is_ai_referral = TRUE;
CREATE INDEX IF NOT EXISTS idx_session_attribution_created ON public.session_attribution(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_attribution_utm ON public.session_attribution(utm_source, utm_medium);
DROP TRIGGER IF EXISTS update_session_attribution_updated_at ON public.session_attribution;
CREATE TRIGGER update_session_attribution_updated_at
  BEFORE UPDATE ON public.session_attribution
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.session_attribution ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.session_attribution FROM anon;
DROP POLICY IF EXISTS "Service role full access to session_attribution" ON public.session_attribution;
CREATE POLICY "Service role full access to session_attribution"
  ON public.session_attribution FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 9. experience_survey_responses  (final-state name; code upserts on report_id,user_email)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.experience_survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id text NOT NULL,
  user_email text NOT NULL,
  product_tier text NOT NULL CHECK (product_tier IN ('snapshot','snapshot_plus','blueprint','blueprint_plus')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  reason text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_experience_tier_created ON public.experience_survey_responses (product_tier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_report_email ON public.experience_survey_responses (report_id, user_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_experience_unique_response ON public.experience_survey_responses (report_id, user_email);
ALTER TABLE public.experience_survey_responses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.experience_survey_responses FROM anon;
DROP POLICY IF EXISTS "Service role full access to experience_survey_responses" ON public.experience_survey_responses;
CREATE POLICY "Service role full access to experience_survey_responses"
  ON public.experience_survey_responses FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 10. testimonials  (final-state: experience_score instead of nps_score)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id text NOT NULL,
  user_email text NOT NULL,
  product_tier text NOT NULL CHECK (product_tier IN ('snapshot','snapshot_plus','blueprint','blueprint_plus')),
  experience_score integer CHECK (experience_score >= 0 AND experience_score <= 10),
  testimonial text NOT NULL CHECK (char_length(testimonial) <= 5000),
  display_name text CHECK (char_length(display_name) <= 200),
  company_name text CHECK (char_length(company_name) <= 200),
  role_title text CHECK (char_length(role_title) <= 200),
  permission_to_publish boolean NOT NULL DEFAULT false,
  case_study_interest boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','featured','declined')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_testimonials_status_created ON public.testimonials (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_email ON public.testimonials (user_email);
CREATE INDEX IF NOT EXISTS idx_testimonials_case_study ON public.testimonials (case_study_interest, status) WHERE case_study_interest = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_unique ON public.testimonials (report_id, user_email);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.testimonials FROM anon;
DROP POLICY IF EXISTS "Service role full access to testimonials" ON public.testimonials;
CREATE POLICY "Service role full access to testimonials"
  ON public.testimonials FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 11. Voice-of-Customer: voc_surveys / voc_responses / voc_analysis
--     (voc_surveys FK to brand_snapshot_reports omitted to avoid a hard
--      dependency on a unique constraint; report_id is still stored + indexed)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.voc_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  survey_token TEXT UNIQUE NOT NULL,
  max_responses INTEGER DEFAULT 25,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_generated_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS public.voc_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.voc_surveys(id) ON DELETE CASCADE,
  three_words TEXT[] NOT NULL,
  differentiator TEXT,
  discovery_channel TEXT,
  friend_description TEXT,
  improvement TEXT,
  experience_score INTEGER CHECK (experience_score BETWEEN 0 AND 10),
  choose_reason TEXT,
  elevator_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.voc_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID UNIQUE NOT NULL REFERENCES public.voc_surveys(id) ON DELETE CASCADE,
  response_count INTEGER NOT NULL,
  experience_score NUMERIC(4,1),
  experience_category TEXT,
  top_words TEXT[],
  perception_summary TEXT,
  alignment_gaps JSONB,
  strengths_customers_see TEXT[],
  blind_spots TEXT[],
  discovery_channels JSONB,
  raw_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voc_survey_report ON public.voc_surveys(report_id);
CREATE INDEX IF NOT EXISTS idx_voc_survey_token ON public.voc_surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_voc_responses_survey ON public.voc_responses(survey_id);

ALTER TABLE public.voc_surveys   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voc_analysis  ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.voc_surveys   FROM anon;
REVOKE ALL ON public.voc_responses FROM anon;
REVOKE ALL ON public.voc_analysis  FROM anon;
DROP POLICY IF EXISTS "Service role full access to voc_surveys" ON public.voc_surveys;
CREATE POLICY "Service role full access to voc_surveys"
  ON public.voc_surveys FOR ALL
  USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');
DROP POLICY IF EXISTS "Service role full access to voc_responses" ON public.voc_responses;
CREATE POLICY "Service role full access to voc_responses"
  ON public.voc_responses FOR ALL
  USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');
DROP POLICY IF EXISTS "Service role full access to voc_analysis" ON public.voc_analysis;
CREATE POLICY "Service role full access to voc_analysis"
  ON public.voc_analysis FOR ALL
  USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

COMMIT;
