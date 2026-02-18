-- ═══════════════════════════════════════════════════════════════
-- Fix Supabase Database Linter Warnings (v2)
-- ═══════════════════════════════════════════════════════════════
-- Resolves:
--   • auth_rls_initplan      – 9 policies using bare auth.<fn>()
--   • multiple_permissive    – duplicate SELECT policy on bspr
--   • duplicate_index        – identical indexes on bspr
--
-- Run in Supabase SQL Editor as a single transaction.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────
-- 1. auth_rls_initplan: brand_snapshot_plus_reports
--    Policies: snapshot_plus_read_own, snapshot_plus_insert
--    Fix: wrap auth.jwt() in (select ...) for plan-time eval
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "snapshot_plus_read_own" ON public.brand_snapshot_plus_reports;
DROP POLICY IF EXISTS "snapshot_plus_insert"   ON public.brand_snapshot_plus_reports;

CREATE POLICY "snapshot_plus_read_own"
  ON public.brand_snapshot_plus_reports
  FOR SELECT
  TO authenticated
  USING (user_email = (select auth.jwt() ->> 'email'::text));

CREATE POLICY "snapshot_plus_insert"
  ON public.brand_snapshot_plus_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (select auth.jwt() ->> 'email'::text));

-- ───────────────────────────────────────────────────────────────
-- 2. auth_rls_initplan: blueprint_reports
--    Policies: blueprint_read_own, blueprint_insert
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "blueprint_read_own" ON public.blueprint_reports;
DROP POLICY IF EXISTS "blueprint_insert"   ON public.blueprint_reports;

CREATE POLICY "blueprint_read_own"
  ON public.blueprint_reports
  FOR SELECT
  TO authenticated
  USING (user_email = (select auth.jwt() ->> 'email'::text));

CREATE POLICY "blueprint_insert"
  ON public.blueprint_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (select auth.jwt() ->> 'email'::text));

-- ───────────────────────────────────────────────────────────────
-- 3. auth_rls_initplan: user_metadata
--    Policies: metadata_read_own, metadata_insert, metadata_update_own
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "metadata_read_own"   ON public.user_metadata;
DROP POLICY IF EXISTS "metadata_insert"     ON public.user_metadata;
DROP POLICY IF EXISTS "metadata_update_own" ON public.user_metadata;

CREATE POLICY "metadata_read_own"
  ON public.user_metadata
  FOR SELECT
  TO authenticated
  USING (user_email = (select auth.jwt() ->> 'email'::text));

CREATE POLICY "metadata_insert"
  ON public.user_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (select auth.jwt() ->> 'email'::text));

CREATE POLICY "metadata_update_own"
  ON public.user_metadata
  FOR UPDATE
  TO authenticated
  USING (user_email = (select auth.jwt() ->> 'email'::text))
  WITH CHECK (user_email = (select auth.jwt() ->> 'email'::text));

-- ───────────────────────────────────────────────────────────────
-- 4. auth_rls_initplan: session_followups
--    Policy: "Service role full access to session_followups"
--    Fix: wrap auth.role() in (select ...)
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service role full access to session_followups"
  ON public.session_followups;

CREATE POLICY "Service role full access to session_followups"
  ON public.session_followups
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ───────────────────────────────────────────────────────────────
-- 5. auth_rls_initplan: brand_workbook
--    Policy: "Service role full access to brand_workbook"
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Service role full access to brand_workbook"
  ON public.brand_workbook;

CREATE POLICY "Service role full access to brand_workbook"
  ON public.brand_workbook
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ───────────────────────────────────────────────────────────────
-- 6. multiple_permissive_policies: brand_snapshot_plus_reports
--    Two permissive SELECT policies for authenticated:
--      {no_select_bspr, snapshot_plus_read_own}
--    Fix: drop the redundant one (no_select_bspr)
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "no_select_bspr" ON public.brand_snapshot_plus_reports;

-- ───────────────────────────────────────────────────────────────
-- 7. duplicate_index: brand_snapshot_plus_reports
--    Identical indexes: idx_bspr_email, idx_snapshot_plus_email
--    Fix: drop one, keep idx_snapshot_plus_email (matches naming)
-- ───────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS public.idx_bspr_email;

COMMIT;
