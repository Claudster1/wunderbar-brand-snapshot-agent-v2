-- migration_crm_events.sql
-- Unified CRM event stream for holistic inbound/outbound/web activity views.

CREATE TABLE IF NOT EXISTS crm_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- crm_inquiry | crm_task | crm_activity | analytics_event | manual
  source_event_id TEXT NOT NULL, -- stable source-side ID
  event_type TEXT NOT NULL, -- inquiry_created | task_created | task_completed | page_view | ...
  direction TEXT NOT NULL DEFAULT 'neutral'
    CHECK (direction IN ('inbound', 'outbound', 'neutral')),
  channel TEXT NOT NULL DEFAULT 'unknown', -- form | phone | email | web | workflow | ...
  contact_id UUID,
  inquiry_id UUID,
  owner TEXT,
  account_key TEXT, -- usually company_name or email domain
  user_email TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_event_id)
);

DO $$
BEGIN
  IF to_regclass('public.crm_contacts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.crm_events DROP CONSTRAINT IF EXISTS crm_events_contact_id_fkey';
    EXECUTE 'ALTER TABLE public.crm_events
      ADD CONSTRAINT crm_events_contact_id_fkey
      FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE SET NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.crm_inquiries') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.crm_events DROP CONSTRAINT IF EXISTS crm_events_inquiry_id_fkey';
    EXECUTE 'ALTER TABLE public.crm_events
      ADD CONSTRAINT crm_events_inquiry_id_fkey
      FOREIGN KEY (inquiry_id) REFERENCES public.crm_inquiries(id) ON DELETE SET NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_crm_events_occurred_at_desc
  ON crm_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_events_direction_occurred_at
  ON crm_events (direction, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_events_channel_occurred_at
  ON crm_events (channel, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_events_contact
  ON crm_events (contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_inquiry
  ON crm_events (inquiry_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_owner
  ON crm_events (owner);
CREATE INDEX IF NOT EXISTS idx_crm_events_user_email
  ON crm_events (LOWER(user_email));
CREATE INDEX IF NOT EXISTS idx_crm_events_account_key
  ON crm_events (LOWER(account_key));

DO $$
BEGIN
  IF to_regprocedure('update_crm_updated_at_column()') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_crm_events_updated_at ON crm_events;
    CREATE TRIGGER trg_crm_events_updated_at
      BEFORE UPDATE ON crm_events
      FOR EACH ROW
      EXECUTE FUNCTION update_crm_updated_at_column();
  END IF;
END $$;

ALTER TABLE crm_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to crm_events" ON crm_events;
CREATE POLICY "Service role full access to crm_events"
  ON crm_events
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

COMMENT ON TABLE crm_events IS 'Unified activity stream for inbound, outbound, and web behavior.';
