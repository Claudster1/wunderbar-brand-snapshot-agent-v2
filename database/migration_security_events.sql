-- Security events audit log
-- Stores security-relevant events for monitoring, alerting, and investigation.
-- Run this migration in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  report_id TEXT,
  email TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by event type and time (dashboard/alerting)
CREATE INDEX IF NOT EXISTS idx_security_events_type_time
  ON security_events (event_type, created_at DESC);

-- Index for IP-based lookups (investigating abuse)
CREATE INDEX IF NOT EXISTS idx_security_events_ip
  ON security_events (ip_address, created_at DESC)
  WHERE ip_address IS NOT NULL;

-- Auto-delete events older than 90 days (keep table lean)
-- Run this as a Supabase cron job (Database → Extensions → pg_cron):
-- SELECT cron.schedule('cleanup-security-events', '0 3 * * *',
--   $$DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );

-- Row-level security: only service role can read/write
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- No public access
CREATE POLICY "No public access" ON security_events
  FOR ALL USING (false);

COMMENT ON TABLE security_events IS 'Audit log for security events (Turnstile failures, lockouts, blocked requests, etc.)';
