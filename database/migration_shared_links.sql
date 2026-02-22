-- migration_shared_links.sql
-- Shareable links for reports and deliverables (time-limited, token-based)

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

-- Service role bypass (used by API routes)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access to shared_links') THEN
    CREATE POLICY "Service role full access to shared_links"
      ON shared_links FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- JWT-authenticated users can manage their own links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own shared links') THEN
    CREATE POLICY "Users can manage their own shared links"
      ON shared_links
      FOR ALL
      USING (created_by = current_setting('request.jwt.claims', true)::json->>'email');
  END IF;
END $$;

-- Public read for valid (non-revoked, non-expired) links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read valid shared links by token') THEN
    CREATE POLICY "Anyone can read valid shared links by token"
      ON shared_links
      FOR SELECT
      USING (
        NOT is_revoked
        AND expires_at > now()
        AND (max_access_count IS NULL OR access_count < max_access_count)
      );
  END IF;
END $$;
