-- Brand Snapshot Refinements Table
-- Allows users to request adjustments to their Snapshot+™ reports

CREATE TABLE IF NOT EXISTS public.brand_snapshot_refinements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  snapshot_report_id text NOT NULL, -- References brand_snapshot_reports.report_id
  user_email text NOT NULL,

  pillar text NOT NULL CHECK (
    pillar IN ('positioning','messaging','visibility','credibility','conversion')
  ),

  additional_context text NOT NULL,
  supporting_urls text[],

  refined_insight jsonb,
  refined_recommendations jsonb,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed')),

  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_refinements_snapshot
  ON public.brand_snapshot_refinements(snapshot_report_id);

CREATE INDEX IF NOT EXISTS idx_refinements_user
  ON public.brand_snapshot_refinements(user_email);
