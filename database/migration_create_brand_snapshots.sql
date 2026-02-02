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
