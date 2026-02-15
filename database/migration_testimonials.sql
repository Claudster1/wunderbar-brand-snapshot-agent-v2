-- ═══════════════════════════════════════════════════════════════
-- Testimonials & case-study interest table
-- ═══════════════════════════════════════════════════════════════
--
-- Captures voluntary testimonials from promoters (NPS 9–10)
-- and tracks case-study participation interest.
--
-- Tied to an NPS response via report_id + email.
--
-- SAFE TO RUN: This migration is idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Link back to the report & user
  report_id text NOT NULL,
  user_email text NOT NULL,
  product_tier text NOT NULL CHECK (product_tier IN ('snapshot', 'snapshot_plus', 'blueprint', 'blueprint_plus')),

  -- NPS score at time of testimonial (for context)
  nps_score integer CHECK (nps_score >= 0 AND nps_score <= 10),

  -- Testimonial content
  testimonial text NOT NULL CHECK (char_length(testimonial) <= 5000),

  -- Display attribution (how they'd like to be credited)
  display_name text CHECK (char_length(display_name) <= 200),
  company_name text CHECK (char_length(company_name) <= 200),
  role_title text CHECK (char_length(role_title) <= 200),

  -- Permissions
  permission_to_publish boolean NOT NULL DEFAULT false,
  case_study_interest boolean NOT NULL DEFAULT false,

  -- Moderation status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'featured', 'declined')),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- Enable RLS (service_role bypasses, anon blocked)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_testimonials_status_created
  ON testimonials (status, created_at DESC);

-- Index for looking up testimonials by email
CREATE INDEX IF NOT EXISTS idx_testimonials_email
  ON testimonials (user_email);

-- Index for case study follow-ups
CREATE INDEX IF NOT EXISTS idx_testimonials_case_study
  ON testimonials (case_study_interest, status)
  WHERE case_study_interest = true;

-- Prevent duplicate testimonials per report
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_unique
  ON testimonials (report_id, user_email);
