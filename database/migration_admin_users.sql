-- migration_admin_users.sql
-- Adds an explicit admin role table mapped to Supabase auth users.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to admin_users" ON public.admin_users;
CREATE POLICY "Service role full access to admin_users"
  ON public.admin_users
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

COMMENT ON TABLE public.admin_users IS 'Supabase-authenticated users allowed to access /admin surfaces.';
