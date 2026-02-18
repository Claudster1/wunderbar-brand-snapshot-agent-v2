-- migration_brand_workbook.sql
-- Stores editable brand outputs for Blueprint+ customers.
-- Auto-populated from diagnostic results, then editable by the customer.
-- Powers the /workbook page and Brand Standards Guide PDF export.

CREATE TABLE IF NOT EXISTS brand_workbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Link to diagnostic report
  report_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  business_name TEXT,
  product_tier TEXT NOT NULL DEFAULT 'blueprint_plus',

  -- Brand Positioning
  positioning_statement TEXT,
  unique_value_proposition TEXT,
  competitive_differentiation TEXT,

  -- Elevator Pitches
  elevator_pitch_30s TEXT,
  elevator_pitch_60s TEXT,
  elevator_pitch_email TEXT,

  -- Messaging Pillars (array of { title, description, proof_points[] })
  messaging_pillars JSONB DEFAULT '[]'::jsonb,

  -- Brand Voice & Tone
  brand_voice_attributes JSONB DEFAULT '[]'::jsonb,   -- e.g. ["confident", "approachable", "strategic"]
  tone_guidelines TEXT,                                 -- Written guidelines
  voice_dos JSONB DEFAULT '[]'::jsonb,                 -- Array of "do" examples
  voice_donts JSONB DEFAULT '[]'::jsonb,               -- Array of "don't" examples
  sample_rewrites JSONB DEFAULT '[]'::jsonb,           -- { before, after } pairs

  -- Audience Profiles
  primary_audience JSONB,      -- { description, pain_points[], decision_triggers[], demographics }
  secondary_audience JSONB,    -- same structure

  -- Key Differentiators (array of { differentiator, competitive_advantage, proof })
  key_differentiators JSONB DEFAULT '[]'::jsonb,

  -- Brand Archetype
  brand_archetype TEXT,
  archetype_description TEXT,
  archetype_application TEXT,

  -- Pillar Scores (snapshot from diagnostic)
  brand_alignment_score INTEGER,
  pillar_scores JSONB,
  primary_pillar TEXT,

  -- Custom sections added by the customer
  custom_sections JSONB DEFAULT '[]'::jsonb,  -- { id, title, content }

  -- Export tracking
  last_exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_workbook_report ON brand_workbook (report_id);
CREATE INDEX IF NOT EXISTS idx_brand_workbook_email ON brand_workbook (email);

-- RLS
ALTER TABLE brand_workbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to brand_workbook"
  ON brand_workbook
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
