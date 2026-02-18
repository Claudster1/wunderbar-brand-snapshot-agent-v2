-- migration_brand_standards_data.sql
-- Adds a JSONB column to brand_workbook for storing rich brand standards content
-- that doesn't warrant individual columns (logo guidelines, color palettes,
-- writing guidelines, sample executions, governance templates, etc.)
--
-- This data is pulled from the Blueprint+ report on workbook creation and
-- powers the restructured Brand Standards Guide PDF export.

BEGIN;

ALTER TABLE brand_workbook
  ADD COLUMN IF NOT EXISTS brand_standards_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN brand_workbook.brand_standards_data IS
  'Rich structured brand standards data from Blueprint+ report: brand_story, mission_vision_values, color_palette, logo_guidelines, typography, layout_guidelines, writing_guidelines, sample_executions, imagery_direction, governance_template';

COMMIT;
