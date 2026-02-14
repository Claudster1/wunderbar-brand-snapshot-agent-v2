-- ═══════════════════════════════════════════════════════════════
-- NPS (Net Promoter Score) responses table
-- ═══════════════════════════════════════════════════════════════
--
-- Stores NPS survey responses from WunderBrand Suite™ users.
-- Each response is tied to a specific report and product tier.
--
-- NPS scoring:
--   Promoters:  9–10
--   Passives:   7–8
--   Detractors: 0–6
--   NPS = % Promoters − % Detractors (range: -100 to +100)
--
-- SAFE TO RUN: This migration is idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.nps_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id text NOT NULL,
  user_email text NOT NULL,
  product_tier text NOT NULL CHECK (product_tier IN ('snapshot', 'snapshot_plus', 'blueprint', 'blueprint_plus')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (service_role bypasses, anon blocked)
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

-- Index for querying NPS by tier over time
CREATE INDEX IF NOT EXISTS idx_nps_tier_created
  ON nps_responses (product_tier, created_at DESC);

-- Index for checking if a user already responded for a report
CREATE INDEX IF NOT EXISTS idx_nps_report_email
  ON nps_responses (report_id, user_email);

-- Prevent duplicate submissions (one NPS per report per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_nps_unique_response
  ON nps_responses (report_id, user_email);
