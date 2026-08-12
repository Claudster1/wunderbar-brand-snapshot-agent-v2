-- ═══════════════════════════════════════════════════════════════
-- Harden storage buckets + analytics view (sensitive data)
-- ═══════════════════════════════════════════════════════════════
-- Complements migration_harden_all_public_tables_rls.sql.
-- Run in Supabase SQL Editor after table harden.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- Ensure report PDF bucket exists and is PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-snapshot-reports', 'brand-snapshot-reports', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop open storage policies on these buckets; service_role bypasses RLS
DO $$
DECLARE
  pol record;
  buckets text[] := ARRAY['reports', 'brand-snapshot-reports', 'brand-assets'];
  b text;
BEGIN
  FOREACH b IN ARRAY buckets LOOP
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND (
          qual::text ILIKE '%' || b || '%'
          OR with_check::text ILIKE '%' || b || '%'
        )
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
  END LOOP;
END $$;

-- Service-role-only policies for report/asset objects
DROP POLICY IF EXISTS "Service role full access to reports bucket" ON storage.objects;
CREATE POLICY "Service role full access to reports bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'reports' AND (select auth.role()) = 'service_role')
  WITH CHECK (bucket_id = 'reports' AND (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to brand-snapshot-reports bucket" ON storage.objects;
CREATE POLICY "Service role full access to brand-snapshot-reports bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'brand-snapshot-reports' AND (select auth.role()) = 'service_role')
  WITH CHECK (bucket_id = 'brand-snapshot-reports' AND (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to brand-assets bucket" ON storage.objects;
CREATE POLICY "Service role full access to brand-assets bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'brand-assets' AND (select auth.role()) = 'service_role')
  WITH CHECK (bucket_id = 'brand-assets' AND (select auth.role()) = 'service_role');

-- Analytics view: no anon/authenticated access
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'analytics_daily_summary'
  ) THEN
    EXECUTE 'ALTER VIEW public.analytics_daily_summary SET (security_invoker = on)';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_daily_summary FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_daily_summary FROM authenticated';
    EXECUTE 'REVOKE ALL ON TABLE public.analytics_daily_summary FROM PUBLIC';
  END IF;
END $$;

COMMIT;
