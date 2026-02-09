-- Voice of Customer (VOC) Brand Perception Survey
-- Allows report owners to collect customer feedback that enriches their report.

-- Survey metadata (linked to a report)
CREATE TABLE IF NOT EXISTS voc_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  survey_token TEXT UNIQUE NOT NULL,  -- Short unique token for the shareable link
  max_responses INTEGER DEFAULT 25,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_generated_at TIMESTAMPTZ,   -- When the VOC analysis was generated
  CONSTRAINT fk_report FOREIGN KEY (report_id) REFERENCES brand_snapshot_reports(report_id)
);

-- Individual survey responses (anonymous — no PII from respondents)
CREATE TABLE IF NOT EXISTS voc_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES voc_surveys(id) ON DELETE CASCADE,
  -- Structured responses
  three_words TEXT[] NOT NULL,                 -- "What 3 words describe [Business]?"
  differentiator TEXT,                         -- "What does [Business] do better than alternatives?"
  discovery_channel TEXT,                      -- "How did you first hear about [Business]?"
  friend_description TEXT,                     -- "What would you tell a friend about [Business]?"
  improvement TEXT,                            -- "What's one thing [Business] could improve?"
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),  -- Net Promoter Score (0-10)
  choose_reason TEXT,                          -- "What made you choose [Business] over others?"
  elevator_description TEXT,                   -- "How would you describe [Business] to someone who's never heard of it?"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOC analysis results (AI-generated, stored on the survey)
CREATE TABLE IF NOT EXISTS voc_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID UNIQUE NOT NULL REFERENCES voc_surveys(id) ON DELETE CASCADE,
  response_count INTEGER NOT NULL,
  nps_score NUMERIC(4,1),                     -- Average NPS
  nps_category TEXT,                           -- "Promoter-heavy", "Mixed", "Detractor-heavy"
  top_words TEXT[],                            -- Most frequent words from three_words responses
  perception_summary TEXT,                     -- AI summary of how customers perceive the brand
  alignment_gaps JSONB,                        -- {pillar: gap_description} — where internal vs external differs
  strengths_customers_see TEXT[],              -- Things customers love (that owner may not have highlighted)
  blind_spots TEXT[],                          -- Things customers want improved
  discovery_channels JSONB,                    -- {channel: count} — how customers actually find them
  raw_analysis JSONB,                          -- Full AI analysis output
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voc_survey_report ON voc_surveys(report_id);
CREATE INDEX IF NOT EXISTS idx_voc_survey_token ON voc_surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_voc_responses_survey ON voc_responses(survey_id);
