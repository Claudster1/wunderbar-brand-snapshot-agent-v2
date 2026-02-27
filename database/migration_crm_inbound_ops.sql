-- migration_crm_inbound_ops.sql
-- CRM-lite Phase 1 foundation for inbound operations:
-- contacts, inquiries, activity log, tasks, and sync log.

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  company_name TEXT,
  lifecycle_stage TEXT NOT NULL DEFAULT 'lead'
    CHECK (lifecycle_stage IN ('lead', 'qualified', 'customer', 'inactive')),
  primary_source TEXT,
  ac_contact_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_email_unique
  ON crm_contacts (LOWER(email))
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts (phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created ON crm_contacts (created_at DESC);

CREATE TABLE IF NOT EXISTS crm_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  source TEXT NOT NULL
    CHECK (source IN ('connect_form', 'quo_call', 'quo_voicemail', 'manual')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT,
  message TEXT,
  transcript TEXT,
  external_ref TEXT,
  owner TEXT,
  channel_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_inquiries_source_external_ref
  ON crm_inquiries (source, external_ref)
  WHERE external_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_inquiries_status_created
  ON crm_inquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_inquiries_contact ON crm_inquiries (contact_id);

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES crm_inquiries(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  body TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_inquiry_created
  ON crm_activities (inquiry_id, created_at DESC);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES crm_inquiries(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'done', 'cancelled')),
  due_at TIMESTAMPTZ,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_status_due
  ON crm_tasks (status, due_at NULLS LAST);

CREATE TABLE IF NOT EXISTS crm_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'activecampaign',
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('outbound', 'inbound')),
  status TEXT NOT NULL
    CHECK (status IN ('success', 'failed')),
  event_type TEXT NOT NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  inquiry_id UUID REFERENCES crm_inquiries(id) ON DELETE SET NULL,
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_sync_log_provider_created
  ON crm_sync_log (provider, created_at DESC);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_crm_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_contacts_updated_at ON crm_contacts;
CREATE TRIGGER trg_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at_column();

DROP TRIGGER IF EXISTS trg_crm_inquiries_updated_at ON crm_inquiries;
CREATE TRIGGER trg_crm_inquiries_updated_at
  BEFORE UPDATE ON crm_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at_column();

DROP TRIGGER IF EXISTS trg_crm_tasks_updated_at ON crm_tasks;
CREATE TRIGGER trg_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at_column();

-- Row-level security
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to crm_contacts" ON crm_contacts;
CREATE POLICY "Service role full access to crm_contacts"
  ON crm_contacts
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to crm_inquiries" ON crm_inquiries;
CREATE POLICY "Service role full access to crm_inquiries"
  ON crm_inquiries
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to crm_activities" ON crm_activities;
CREATE POLICY "Service role full access to crm_activities"
  ON crm_activities
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to crm_tasks" ON crm_tasks;
CREATE POLICY "Service role full access to crm_tasks"
  ON crm_tasks
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role full access to crm_sync_log" ON crm_sync_log;
CREATE POLICY "Service role full access to crm_sync_log"
  ON crm_sync_log
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

COMMENT ON TABLE crm_contacts IS 'CRM-lite contacts for inbound calls and inquiries.';
COMMENT ON TABLE crm_inquiries IS 'Inbound lead/inquiry inbox records across channels.';
COMMENT ON TABLE crm_activities IS 'Timeline entries attached to CRM inquiries.';
COMMENT ON TABLE crm_tasks IS 'Follow-up tasks for inbound lead handling.';
COMMENT ON TABLE crm_sync_log IS 'External sync audit log (ActiveCampaign, etc.).';
