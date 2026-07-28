-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Run this migration against your Supabase database.
-- These policies ensure that:
--   1. The anon key (client-side) can only read reports by report_id (not enumerate all)
--   2. Only the service_role key (server-side) can insert/update/delete
--   3. Support requests are write-only from anon, read-only from service_role
-- ============================================

-- ─── brand_snapshot_reports ───

-- Enable RLS on the table (if not already enabled)
ALTER TABLE brand_snapshot_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow read by report_id" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Allow service_role full access" ON brand_snapshot_reports;
DROP POLICY IF EXISTS "Deny anon write" ON brand_snapshot_reports;

-- NOTE: An earlier version of this migration created a SELECT policy with
-- `USING (true)`, which does NOT scope reads to a report_id — it exposes every
-- row to any role holding the anon SELECT grant. Reports are read exclusively
-- through server-side routes using the service_role key, so no anon SELECT
-- policy (or grant) is created here. See migration_harden_report_pii_rls.sql.
DROP POLICY IF EXISTS "Allow read by report_id" ON brand_snapshot_reports;
REVOKE SELECT ON brand_snapshot_reports FROM anon;

-- Service role has full access (server-side operations)
CREATE POLICY "Allow service_role full access"
  ON brand_snapshot_reports
  FOR ALL
  USING (auth.role() = 'service_role');

-- Anon users cannot insert, update, or delete directly
-- (All writes go through server-side API routes using the service_role key)
CREATE POLICY "Deny anon insert"
  ON brand_snapshot_reports
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Deny anon update"
  ON brand_snapshot_reports
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Deny anon delete"
  ON brand_snapshot_reports
  FOR DELETE
  USING (auth.role() = 'service_role');


-- ─── support_requests (if not already configured) ───

ALTER TABLE IF EXISTS support_requests ENABLE ROW LEVEL SECURITY;

-- Anon can insert support requests (from Wundy™ chat)
DROP POLICY IF EXISTS "Allow anon insert support" ON support_requests;
CREATE POLICY "Allow anon insert support"
  ON support_requests
  FOR INSERT
  WITH CHECK (true);

-- Only service_role can read support requests
DROP POLICY IF EXISTS "Allow service_role read support" ON support_requests;
CREATE POLICY "Allow service_role read support"
  ON support_requests
  FOR SELECT
  USING (auth.role() = 'service_role');


-- ─── Verify RLS is enabled ───
-- Run this to check:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
