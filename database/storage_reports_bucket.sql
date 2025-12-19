-- Supabase Storage setup: PDF reports bucket + RLS policies
--
-- Creates a private bucket `reports` and policies so users can only
-- read/write objects inside their own folder.
--
-- Expected object key format:
--   {user_id}/{product}/{report_id}.pdf
-- Examples:
--   9d2b.../snapshot/abc123.pdf
--   9d2b.../snapshot-plus/def456.pdf
--   9d2b.../blueprint/ghi789.pdf
--   9d2b.../blueprint-plus/jkl012.pdf
--
-- Notes:
-- - Run in Supabase SQL Editor.
-- - Service role uploads/downloads bypass RLS (recommended for server-side PDF generation).
-- - Client-side access should be authenticated; these policies assume auth users.

-- 1) Create bucket (private)
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- 2) Enable RLS on objects table (usually already enabled, but safe)
alter table storage.objects enable row level security;

-- 3) Helper predicate: object must be in `reports` bucket AND under /{auth.uid()}/...
-- Supabase provides storage.foldername(name) -> text[] for path segments.

-- Read own PDFs
drop policy if exists "reports_read_own" on storage.objects;
create policy "reports_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Upload own PDFs
drop policy if exists "reports_insert_own" on storage.objects;
create policy "reports_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Update (overwrite/move) own PDFs
drop policy if exists "reports_update_own" on storage.objects;
create policy "reports_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete own PDFs
drop policy if exists "reports_delete_own" on storage.objects;
create policy "reports_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);


