-- Enable RLS on user_brands (Supabase Advisor: table was public without RLS)
--
-- Access pattern in this app: only server-side via SUPABASE_SERVICE_ROLE_KEY
-- (see lib/userBrands.ts, lib/getUserProductAccess.ts). The service role bypasses
-- RLS, so no policies are required for the Next.js API routes to keep working.
--
-- With RLS on and zero policies for `anon` / `authenticated`, direct PostgREST
-- access from the browser using the anon key is denied — which is what you want
-- until/unless you intentionally query this table from the client.
--
-- Run in Supabase SQL Editor (or `supabase db push` if you use CLI migrations).

ALTER TABLE public.user_brands ENABLE ROW LEVEL SECURITY;

-- Optional: explicit lock for documented clarity (Postgres has no "deny all" stmt;
-- absence of policies already denies anon/authenticated for this table.)

-- If you later need client reads (authenticated users, same email as row):
-- CREATE POLICY "user_brands_select_own"
--   ON public.user_brands FOR SELECT TO authenticated
--   USING (lower(auth.jwt() ->> 'email') = lower(user_email));
--
-- For writes from the client, prefer API routes + service role instead of
-- widening INSERT/UPDATE policies unless you have a strong use case.
