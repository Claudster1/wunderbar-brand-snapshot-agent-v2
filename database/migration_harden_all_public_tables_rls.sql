-- ═══════════════════════════════════════════════════════════════
-- Harden RLS on all public application tables (anon exposure fix)
-- ═══════════════════════════════════════════════════════════════
-- Context:
--   Several tables were created with no RLS, or with policies named
--   "Service role full access…" that used `USING (true)` (applies to ALL
--   roles, including anon). Combined with default PostgREST grants, the
--   public anon key can read/write PII and report content.
--
--   Application data access uses the service_role key server-side, which
--   bypasses RLS — locking anon/authenticated out has no user-facing impact.
--   Shared links, support forms, etc. already go through Next.js API routes.
--
-- This migration (idempotent, safe to re-run):
--   1. ENABLE ROW LEVEL SECURITY on every known public app table (if present)
--   2. REVOKE ALL from anon + authenticated
--   3. DROP every existing policy on those tables
--   4. CREATE a single service_role-only FOR ALL policy
--
-- Also supersedes open policies from:
--   migration_create_blueprint_reports.sql
--   migration_shared_links.sql
--   migration_create_support_requests.sql
--   migration_rls_policies.sql (anon insert on support_requests)
--
-- Run in Supabase SQL Editor. Expect "Success. No rows returned."
--
-- Verify afterwards:
--   SELECT tablename, rowsecurity FROM pg_tables
--     WHERE schemaname = 'public' ORDER BY 1;
--   SELECT tablename, policyname, roles, cmd, qual
--     FROM pg_policies WHERE schemaname = 'public' ORDER BY 1,2;
--   SELECT table_name, grantee, privilege_type
--     FROM information_schema.role_table_grants
--     WHERE table_schema = 'public'
--       AND grantee IN ('anon','authenticated','PUBLIC')
--     ORDER BY 1,2;
-- ═══════════════════════════════════════════════════════════════

BEGIN;

DO $$
DECLARE
  t text;
  pol record;
  tables text[] := ARRAY[
    -- Core schema
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
    -- Feature / commerce
    'brand_snapshots',
    'brand_snapshot_purchases',
    'blueprint_reports',
    'refresh_entitlements',
    'blueprint_enrichment',
    'brand_snapshot_refinements',
    'snapshot_refinement_requests',
    'shared_links',
    'user_brands',
    'brand_team_members',
    'benchmark_data',
    -- Ops / CRM / support
    'support_requests',
    'security_events',
    'analytics_events',
    'session_attribution',
    'session_followups',
    'audit_logs',
    'admin_users',
    'crm_contacts',
    'crm_inquiries',
    'crm_activities',
    'crm_tasks',
    'crm_sync_log',
    'crm_events',
    -- Surveys / content
    'nps_responses',
    'experience_survey_responses',
    'testimonials',
    'voc_surveys',
    'voc_responses',
    'voc_analysis',
    -- Workbook / assets / AI
    'brand_workbook',
    'brand_asset_uploads',
    'ai_usage_events',
    'user_metadata',
    -- Legacy / misspelled enable target (may or may not exist)
    'snapshot_results'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      BEGIN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
      EXCEPTION WHEN undefined_object THEN
        NULL;
      END;
      BEGIN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', t);
      EXCEPTION WHEN undefined_object THEN
        NULL;
      END;
      BEGIN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', t);
      EXCEPTION WHEN undefined_object THEN
        NULL;
      END;

      FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL
           USING ((select auth.role()) = %L)
           WITH CHECK ((select auth.role()) = %L)',
        'Service role full access to ' || t,
        t,
        'service_role',
        'service_role'
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
