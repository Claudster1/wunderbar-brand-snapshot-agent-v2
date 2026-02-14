-- ═══════════════════════════════════════════════════════════════
-- Enable Row Level Security (RLS) on all public tables
-- ═══════════════════════════════════════════════════════════════
--
-- WHY: Without RLS, anyone with the public anon key can read/write
-- all data directly via PostgREST, bypassing API route protections.
--
-- HOW THIS WORKS:
--   1. Enable RLS on each table (blocks all access by default)
--   2. The service_role key (used by our API routes) bypasses RLS
--      automatically — so server-side code continues to work unchanged.
--   3. No anon policies are created — this means the public anon key
--      has ZERO access to these tables, which is correct for our
--      architecture (all data access goes through API routes).
--
-- SAFE TO RUN: This migration is idempotent. Running it multiple
-- times has no effect on tables where RLS is already enabled.
-- ═══════════════════════════════════════════════════════════════

-- 1. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. brand_snapshot_reports
ALTER TABLE public.brand_snapshot_reports ENABLE ROW LEVEL SECURITY;

-- 3. snapshot_results
ALTER TABLE public.snapshot_results ENABLE ROW LEVEL SECURITY;

-- 4. user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- 5. analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 6. onboarding_status
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;

-- 7. audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════
-- Fix: analytics_daily_summary view (SECURITY DEFINER → INVOKER)
-- ═══════════════════════════════════════════════════════════════
--
-- The view is currently SECURITY DEFINER, meaning it runs with the
-- permissions of the view creator (typically a superuser) regardless
-- of who queries it. This bypasses RLS on the underlying tables.
--
-- Changing to SECURITY INVOKER ensures the view respects the
-- permissions and RLS policies of the querying user.
-- ═══════════════════════════════════════════════════════════════

ALTER VIEW public.analytics_daily_summary SET (security_invoker = on);
