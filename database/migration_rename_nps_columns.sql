-- ═══════════════════════════════════════════════════════════════
-- Rename nps_score / nps_category columns across related tables
-- to align with "WunderBrand Experience Score™" branding.
--
-- Affected tables:
--   testimonials:   nps_score → experience_score
--   voc_responses:  nps_score → experience_score
--   voc_analysis:   nps_score → experience_score,
--                   nps_category → experience_category
--
-- SAFE TO RUN: Uses IF EXISTS / column existence checks.
-- Run AFTER migration_rename_nps_to_experience.sql.
-- ═══════════════════════════════════════════════════════════════

-- testimonials.nps_score → experience_score
ALTER TABLE IF EXISTS public.testimonials
  RENAME COLUMN nps_score TO experience_score;

-- voc_responses.nps_score → experience_score
ALTER TABLE IF EXISTS public.voc_responses
  RENAME COLUMN nps_score TO experience_score;

-- voc_analysis.nps_score → experience_score
ALTER TABLE IF EXISTS public.voc_analysis
  RENAME COLUMN nps_score TO experience_score;

-- voc_analysis.nps_category → experience_category
ALTER TABLE IF EXISTS public.voc_analysis
  RENAME COLUMN nps_category TO experience_category;
