import type { NormalizedBrandImageryDirection, NormalizedImagerySample } from "./brandImageryNormalize";
import { normalizeBrandImageryDirection } from "./brandImageryNormalize";

/** Parsed from `workbook.custom_sections.mood_board_image_samples`. */
export function moodBoardSamplesFromCustomSections(customSections: unknown): NormalizedImagerySample[] {
  if (!customSections || typeof customSections !== "object" || Array.isArray(customSections)) return [];
  const raw = (customSections as Record<string, unknown>).mood_board_image_samples;
  if (!Array.isArray(raw)) return [];
  const n = normalizeBrandImageryDirection({ moodBoardImageSamples: raw });
  return n?.mood_board_image_samples ?? [];
}

/**
 * When the customer saves reference image URLs in the workbook, those override report thumbnails
 * for the Brand Standards mood board (and exports). Textual mood descriptors still come from the report.
 */
export function mergeWorkbookMoodIntoDiagnostic(
  diagnosticData: Record<string, unknown>,
  customSections: Record<string, unknown>,
): Record<string, unknown> {
  const wbSamples = moodBoardSamplesFromCustomSections(customSections);
  if (wbSamples.length === 0) return diagnosticData;

  const rawImagery = diagnosticData.brand_imagery_direction ?? diagnosticData.brandImageryDirection;
  const baseNorm = normalizeBrandImageryDirection(rawImagery);
  const merged: NormalizedBrandImageryDirection = {
    ...(baseNorm ?? {}),
    mood_board_image_samples: wbSamples,
  };

  return {
    ...diagnosticData,
    brandImageryDirection: merged,
    brand_imagery_direction: merged,
  };
}
