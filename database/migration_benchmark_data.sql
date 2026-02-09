-- Benchmark Data Collection
-- Stores anonymized, aggregated scores from every completed assessment.
-- No PII (no email, no name, no company name) — only demographic segments + scores.
-- Used to build proprietary industry benchmarks over time.

CREATE TABLE IF NOT EXISTS benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Scores (the core benchmark data)
  brand_alignment_score INTEGER NOT NULL,
  positioning_score INTEGER NOT NULL DEFAULT 0,
  messaging_score INTEGER NOT NULL DEFAULT 0,
  visibility_score INTEGER NOT NULL DEFAULT 0,
  credibility_score INTEGER NOT NULL DEFAULT 0,
  conversion_score INTEGER NOT NULL DEFAULT 0,
  primary_pillar TEXT,

  -- Segmentation dimensions (anonymized — NO PII)
  industry TEXT,
  audience_type TEXT CHECK (audience_type IN ('B2B', 'B2C', 'both')),
  geographic_scope TEXT CHECK (geographic_scope IN ('local', 'regional', 'national', 'global')),
  revenue_range TEXT CHECK (revenue_range IN ('pre-revenue', 'under_100k', '100k-500k', '500k-1M', '1M-5M', '5M+')),
  team_size TEXT,
  years_in_business TEXT,
  has_brand_guidelines BOOLEAN,
  has_website BOOLEAN,
  previous_brand_work TEXT CHECK (previous_brand_work IN ('none', 'DIY', 'freelancer', 'agency')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast benchmark queries
CREATE INDEX IF NOT EXISTS idx_benchmark_industry ON benchmark_data(industry);
CREATE INDEX IF NOT EXISTS idx_benchmark_audience ON benchmark_data(audience_type);
CREATE INDEX IF NOT EXISTS idx_benchmark_revenue ON benchmark_data(revenue_range);
CREATE INDEX IF NOT EXISTS idx_benchmark_geo ON benchmark_data(geographic_scope);
CREATE INDEX IF NOT EXISTS idx_benchmark_created ON benchmark_data(created_at DESC);

-- Composite index for the most common benchmark query:
-- "What's the average score for B2B companies in [industry] with [revenue_range]?"
CREATE INDEX IF NOT EXISTS idx_benchmark_segment
  ON benchmark_data(industry, audience_type, revenue_range);
