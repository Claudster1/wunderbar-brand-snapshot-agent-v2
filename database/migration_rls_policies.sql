-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Run this migration against your Supabase database.
--
-- Posture: service_role only for application tables.
-- Anon/authenticated have no table policies or grants.
-- All reads/writes go through server-side API routes with the service_role key.
--
-- See also: migration_harden_report_pii_rls.sql,
--           migration_harden_all_public_tables_rls.sql
-- ============================================

-- ─── brand_snapshot_reports ───

ALTER TABLE brand_snapshot_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read by report_id" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Allow service_role full access" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Deny anon write" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Deny anon insert" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Deny anon update" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Deny anon delete" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Service role full access to brand_snapshot_reports" ON brand_snapshot_reports;

REVOKE ALL ON TABLE brand_snapshot_reports FROM anon;
REVOKE ALL ON TABLE brand_snapshot_reports FROM authenticated;

CREATE POLICY "Service role full access to brand_snapshot_reports"
  ON brand_snapshot_reports
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ─── support_requests (service_role only — inserts via API, not anon PostgREST) ───

ALTER TABLE IF EXISTS support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert support" ON support_requests;
DROP POLICY IF EXISTS "Allow service_role read support" ON support_requests;
DROP POLICY IF EXISTS "Service role has full access to support_requests" ON support_requests;
DROP POLICY IF EXISTS "Service role full access to support_requests" ON support_requests;

REVOKE ALL ON TABLE support_requests FROM anon;
REVOKE ALL ON TABLE support_requests FROM authenticated;

CREATE POLICY "Service role full access to support_requests"
  ON support_requests
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ─── Verify RLS is enabled ───
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
