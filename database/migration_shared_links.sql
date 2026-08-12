-- migration_shared_links.sql
-- Shareable links for reports and deliverables (time-limited, token-based)
--
-- Security: service_role only. Token resolution happens in Next.js (RSC/API)
-- with the service role key — do NOT grant anon SELECT (enumerates all valid links).

CREATE TABLE IF NOT EXISTS shared_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  report_id TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'report',
  tier TEXT NOT NULL DEFAULT 'snapshot',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  access_count INT DEFAULT 0,
  max_access_count INT DEFAULT NULL,
  is_revoked BOOLEAN DEFAULT false,
  label TEXT
);

CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links (token);
CREATE INDEX IF NOT EXISTS idx_shared_links_created_by ON shared_links (created_by);
CREATE INDEX IF NOT EXISTS idx_shared_links_report_id ON shared_links (report_id);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE shared_links FROM anon;
REVOKE ALL ON TABLE shared_links FROM authenticated;

DROP POLICY IF EXISTS "Service role full access to shared_links" ON shared_links;
DROP POLICY IF EXISTS "Users can manage their own shared links" ON shared_links;
DROP POLICY IF EXISTS "Anyone can read valid shared links by token" ON shared_links;

CREATE POLICY "Service role full access to shared_links"
  ON shared_links FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
