-- Rename nps_responses table to experience_survey_responses
-- and update indexes to match new naming convention.
-- SAFE TO RUN: Uses IF EXISTS checks.

ALTER TABLE IF EXISTS public.nps_responses RENAME TO experience_survey_responses;

-- Rename indexes
ALTER INDEX IF EXISTS idx_nps_tier_created RENAME TO idx_experience_tier_created;
ALTER INDEX IF EXISTS idx_nps_report_email RENAME TO idx_experience_report_email;
ALTER INDEX IF EXISTS idx_nps_unique_response RENAME TO idx_experience_unique_response;
