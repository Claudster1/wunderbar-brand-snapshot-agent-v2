-- ═══════════════════════════════════════════════════════════════
-- Harden RLS / grants on report & purchase tables (PII exposure fix)
-- ═══════════════════════════════════════════════════════════════
-- Context:
--   `migration_rls_policies.sql` created a SELECT policy on
--   brand_snapshot_reports with `USING (true)`, and
--   `migration_add_columns_and_constraints.sql` ran
--   `GRANT SELECT ON brand_snapshot_reports TO anon`.
--
--   RLS `USING (true)` does NOT scope reads to a specific report_id — it
--   exposes EVERY row (user_email, full_report, scores) to any client
--   holding the public anon key. The "unguessable UUID" comment does not
--   apply because PostgREST can enumerate all rows once SELECT is granted.
--
--   Every application read path uses the service_role key (server-side),
--   which bypasses RLS, so removing anon access has NO user-facing impact.
--
-- Also enables RLS on PII tables that were created without it:
--   brand_snapshot_purchases (Stripe IDs + emails)
--   brand_blueprint_plus_reports (paid report content + emails)
--
-- Idempotent: safe to re-run. Run in Supabase SQL Editor.
--
-- Resilient: every table's statements are guarded with an IF EXISTS check, so
-- this migration applies RLS wherever a table is present and silently skips any
-- table that has not been created in this database (e.g. brand_snapshot_purchases
-- on projects where migration_brand_snapshot_purchases.sql was never run). This
-- prevents a single missing table from rolling back the whole transaction.
--
-- Verify afterwards:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--     WHERE table_name='brand_snapshot_reports';
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. brand_snapshot_reports: remove public/anon read access (critical PII fix) ───

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'brand_snapshot_reports'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow read by report_id" ON public.brand_snapshot_reports';
    EXECUTE 'REVOKE ALL ON public.brand_snapshot_reports FROM anon';
    EXECUTE 'ALTER TABLE public.brand_snapshot_reports ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access to brand_snapshot_reports" ON public.brand_snapshot_reports';
    EXECUTE 'CREATE POLICY "Service role full access to brand_snapshot_reports"
      ON public.brand_snapshot_reports
      FOR ALL
      USING ((select auth.role()) = ''service_role'')
      WITH CHECK ((select auth.role()) = ''service_role'')';
  END IF;
END $$;

-- ─── 2. brand_snapshot_purchases: enable RLS (service-role only) ───

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'brand_snapshot_purchases'
  ) THEN
    EXECUTE 'ALTER TABLE public.brand_snapshot_purchases ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.brand_snapshot_purchases FROM anon';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access to brand_snapshot_purchases" ON public.brand_snapshot_purchases';
    EXECUTE 'CREATE POLICY "Service role full access to brand_snapshot_purchases"
      ON public.brand_snapshot_purchases
      FOR ALL
      USING ((select auth.role()) = ''service_role'')
      WITH CHECK ((select auth.role()) = ''service_role'')';
  END IF;
END $$;

-- ─── 3. brand_blueprint_plus_reports: enable RLS (service-role only) ───
-- (RLS was left commented-out in migration_add_brand_blueprint_plus_reports.sql)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'brand_blueprint_plus_reports'
  ) THEN
    EXECUTE 'ALTER TABLE public.brand_blueprint_plus_reports ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON public.brand_blueprint_plus_reports FROM anon';
    EXECUTE 'DROP POLICY IF EXISTS "Service role full access to brand_blueprint_plus_reports" ON public.brand_blueprint_plus_reports';
    EXECUTE 'CREATE POLICY "Service role full access to brand_blueprint_plus_reports"
      ON public.brand_blueprint_plus_reports
      FOR ALL
      USING ((select auth.role()) = ''service_role'')
      WITH CHECK ((select auth.role()) = ''service_role'')';
  END IF;
END $$;

COMMIT;
