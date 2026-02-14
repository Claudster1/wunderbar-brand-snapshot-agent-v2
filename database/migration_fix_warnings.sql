-- ═══════════════════════════════════════════════════════════════
-- Fix Supabase linter warnings
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Fix mutable search_path on 5 functions
-- ───────────────────────────────────────────────────────────────
-- Without a fixed search_path, a malicious user could create
-- objects in a different schema that shadow the intended tables,
-- potentially tricking the function into operating on wrong data.
-- Setting search_path to '' (empty) forces fully qualified names
-- and prevents search_path hijacking.
-- ───────────────────────────────────────────────────────────────

ALTER FUNCTION public.enforce_lowercase_email() SET search_path = '';
ALTER FUNCTION public.soft_delete(table_name text, row_id uuid) SET search_path = '';
ALTER FUNCTION public.record_audit() SET search_path = '';
ALTER FUNCTION public.log_event(event_name text, email text, data jsonb) SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';

-- ───────────────────────────────────────────────────────────────
-- 2. Fix overly permissive RLS INSERT policies
-- ───────────────────────────────────────────────────────────────
-- These policies use WITH CHECK (true), which allows anyone
-- (including the anon role) to insert any data. Since all inserts
-- go through our API routes using the service_role key (which
-- bypasses RLS), we don't need permissive anon INSERT policies.
--
-- Fix: Drop the permissive policies. The service_role key will
-- continue to work without any policies in place.
-- ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "public_insert_bspr" ON public.brand_snapshot_plus_reports;
DROP POLICY IF EXISTS "allow_insert_from_anon" ON public.brand_snapshots;
