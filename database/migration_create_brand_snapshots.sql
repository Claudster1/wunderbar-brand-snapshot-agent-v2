create table if not exists brand_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  brand_name text not null,
  brand_alignment_score int,
  primary_pillar text,
  stage text,
  status text default 'complete',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE brand_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE brand_snapshots FROM anon;
REVOKE ALL ON TABLE brand_snapshots FROM authenticated;
DROP POLICY IF EXISTS "Service role full access to brand_snapshots" ON brand_snapshots;
CREATE POLICY "Service role full access to brand_snapshots"
  ON brand_snapshots FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
