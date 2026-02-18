-- migration_session_followups.sql
-- Stores AI-generated follow-up content from call/session transcripts.
-- Content sits in a review queue until an admin approves or edits it.

CREATE TABLE IF NOT EXISTS session_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact info
  contact_email TEXT NOT NULL,
  contact_name TEXT,

  -- Session type: 'talk_to_expert' or 'activation_session'
  session_type TEXT NOT NULL CHECK (session_type IN ('talk_to_expert', 'activation_session')),

  -- Reference to their report if applicable
  report_id TEXT,
  product_tier TEXT,

  -- Otter.ai transcript
  transcript_text TEXT NOT NULL,
  transcript_summary TEXT,           -- Otter's auto-summary if provided
  transcript_source TEXT DEFAULT 'otter_zapier',  -- 'otter_zapier', 'otter_api', 'manual'

  -- AI-generated follow-up content (editable before approval)
  generated_subject TEXT,            -- Email subject line
  generated_body TEXT,               -- Email body (HTML or plain text)
  generated_action_items JSONB,      -- Structured action items from the call
  generated_next_steps JSONB,        -- Recommended next steps
  generated_product_recommendations JSONB, -- Products/services to recommend

  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'sent', 'rejected', 'draft')),
  reviewed_by TEXT,                   -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,                -- Internal notes from reviewer

  -- Final content (after admin edits — what actually gets sent)
  final_subject TEXT,
  final_body TEXT,

  -- AC tracking
  ac_event_fired BOOLEAN DEFAULT FALSE,
  ac_event_fired_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_followups_email ON session_followups (contact_email);
CREATE INDEX IF NOT EXISTS idx_session_followups_status ON session_followups (status);
CREATE INDEX IF NOT EXISTS idx_session_followups_type ON session_followups (session_type);
CREATE INDEX IF NOT EXISTS idx_session_followups_created ON session_followups (created_at DESC);

-- RLS: Only service role can access (admin-only table)
ALTER TABLE session_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to session_followups"
  ON session_followups
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
