-- ============================================
-- AI USAGE EVENTS
-- Append-only log of LLM calls for cost / P&L
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  use_case text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,

  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  estimated_cost_usd numeric(12, 6),

  report_id text,
  user_email text,
  session_id text,
  product_tier text,

  latency_ms integer,
  was_fallback boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_use_case ON public.ai_usage_events (use_case, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON public.ai_usage_events (provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_report ON public.ai_usage_events (report_id)
  WHERE report_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_usage_tier ON public.ai_usage_events (product_tier, created_at DESC)
  WHERE product_tier IS NOT NULL;

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

-- Service role / backend only (no anon policies)
DROP POLICY IF EXISTS "Service role full access ai_usage_events" ON public.ai_usage_events;
CREATE POLICY "Service role full access ai_usage_events"
  ON public.ai_usage_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
