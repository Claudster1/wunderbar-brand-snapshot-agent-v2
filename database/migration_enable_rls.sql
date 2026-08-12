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
--
-- For a full harden (revoke grants + service-role policies + drop open
-- USING(true) policies), also run:
--   migration_harden_all_public_tables_rls.sql
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users',
    'brand_snapshot_sessions',
    'brand_snapshot_results',
    'brand_snapshot_reports',
    'brand_snapshot_plus_reports',
    'brand_blueprint_sessions',
    'brand_blueprint_results',
    'brand_blueprint_plus_reports',
    'user_purchases',
    'onboarding_status',
    'brand_snapshots',
    'brand_snapshot_purchases',
    'blueprint_reports',
    'analytics_events',
    'audit_logs',
    'brand_team_members',
    'benchmark_data',
    'support_requests',
    'shared_links',
    'user_brands',
    'security_events',
    'session_attribution',
    'session_followups',
    'refresh_entitlements',
    'blueprint_enrichment',
    'brand_snapshot_refinements',
    'snapshot_refinement_requests',
    'nps_responses',
    'experience_survey_responses',
    'testimonials',
    'voc_surveys',
    'voc_responses',
    'voc_analysis',
    'brand_workbook',
    'brand_asset_uploads',
    'ai_usage_events',
    'admin_users',
    'crm_contacts',
    'crm_inquiries',
    'crm_activities',
    'crm_tasks',
    'crm_sync_log',
    'crm_events',
    -- legacy misspelled name from older migrations (skip if absent)
    'snapshot_results'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Fix: analytics_daily_summary view (SECURITY DEFINER → INVOKER)
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'analytics_daily_summary'
  ) THEN
    EXECUTE 'ALTER VIEW public.analytics_daily_summary SET (security_invoker = on)';
  END IF;
END $$;
