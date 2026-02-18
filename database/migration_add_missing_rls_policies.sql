-- ═══════════════════════════════════════════════════════════════
-- Add RLS policies to tables that have RLS enabled but no policies
-- ═══════════════════════════════════════════════════════════════
-- These tables are accessed exclusively through API routes using
-- the service_role key (which bypasses RLS). Adding service-role
-- policies documents the intended access pattern and clears
-- the rls_enabled_no_policy linter suggestion.
--
-- Run in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- 1. analytics_events (admin-only, written by API routes)
CREATE POLICY "Service role full access to analytics_events"
  ON public.analytics_events
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 2. audit_logs (admin-only, internal logging)
CREATE POLICY "Service role full access to audit_logs"
  ON public.audit_logs
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 3. brand_snapshot_reports (read/write via API routes)
CREATE POLICY "Service role full access to brand_snapshot_reports"
  ON public.brand_snapshot_reports
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 4. brand_snapshots (read/write via API routes)
CREATE POLICY "Service role full access to brand_snapshots"
  ON public.brand_snapshots
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 5. onboarding_status (read/write via API routes)
CREATE POLICY "Service role full access to onboarding_status"
  ON public.onboarding_status
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 6. snapshot_results (read/write via API routes)
CREATE POLICY "Service role full access to snapshot_results"
  ON public.snapshot_results
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 7. user_purchases (read/write via API routes)
CREATE POLICY "Service role full access to user_purchases"
  ON public.user_purchases
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- 8. users (read/write via API routes)
CREATE POLICY "Service role full access to users"
  ON public.users
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

COMMIT;
