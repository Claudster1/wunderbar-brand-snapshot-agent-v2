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
function resolveVisualSystemMode(customSections: Record<string, unknown>): "existing" | "optimize" | "refresh" | undefined {
  const raw = customSections?.visual_system_mode;
  return raw === "existing" || raw === "optimize" || raw === "refresh" ? raw : undefined;
}

export function mergeWorkbookMoodIntoDiagnostic(
  diagnosticData: Record<string, unknown>,
  customSections: Record<string, unknown>,
): Record<string, unknown> {
  const visualSystemMode = resolveVisualSystemMode(customSections);
  const wbSamples = moodBoardSamplesFromCustomSections(customSections);

  const base: Record<string, unknown> =
    visualSystemMode !== undefined
      ? { ...diagnosticData, visualSystemMode, visual_system_mode: visualSystemMode }
      : { ...diagnosticData };

  if (wbSamples.length === 0) {
    return visualSystemMode !== undefined ? base : diagnosticData;
  }

  const rawImagery = base["brand_imagery_direction"] ?? base["brandImageryDirection"];
  const baseNorm = normalizeBrandImageryDirection(rawImagery);
  const merged: NormalizedBrandImageryDirection = {
    ...(baseNorm ?? {}),
    mood_board_image_samples: wbSamples,
  };

  return {
    ...base,
    brandImageryDirection: merged,
    brand_imagery_direction: merged,
  };
}
