-- Create support_requests table for Wundy™-collected support tickets
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS support_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  product_name  TEXT NOT NULL CHECK (product_name IN (
    'WunderBrand Snapshot™',
    'WunderBrand Snapshot+™',
    'WunderBrand Blueprint™',
    'WunderBrand Blueprint+™'
  )),
  issue_category TEXT NOT NULL CHECK (issue_category IN (
    'access',
    'download',
    'payment',
    'account'
  )),
  issue_description TEXT,
  purchase_timing TEXT CHECK (purchase_timing IS NULL OR purchase_timing IN ('today', 'yesterday', 'earlier')),
  error_message   TEXT,
  user_notes      TEXT,
  user_id         TEXT,
  stripe_session_id TEXT,
  ac_contact_id   TEXT,
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',
    'in_progress',
    'resolved',
    'closed'
  )),
  source        TEXT NOT NULL DEFAULT 'wundy_chat',
  resolved_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by status and date
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_email ON support_requests (email);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_support_requests_updated_at();

-- Enable Row Level Security
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (server-side only)
CREATE POLICY "Service role has full access to support_requests"
  ON support_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE support_requests IS 'Support requests collected by Wundy™ chat and routed to the support team.';
