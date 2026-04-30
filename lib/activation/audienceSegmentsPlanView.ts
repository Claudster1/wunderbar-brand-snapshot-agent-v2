/**
 * Detects when we have enough Blueprint+ audience / ICP JSON to render the structured
 * Audience Segments activation panel (vs. plain section.body only).
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function nonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function hasIcpRenderablePanels(icp: Record<string, unknown>): boolean {
  const overview = typeof icp.overview === "string" && icp.overview.trim().length > 0;
  if (overview) return true;
  const keys = [
    "conversionProfile",
    "contentTypeConversionMatrix",
    "behavioralSignalLibrary",
    "multiTouchConversionSequence",
    "channelLevelConversionMechanics",
    "hookTypePerformance",
  ] as const;
  for (const k of keys) {
    if (nonEmptyArray(icp[k])) return true;
  }
  return false;
}

function hasAudienceDefPanels(audienceDef: Record<string, unknown>): boolean {
  for (const key of ["primaryICP", "secondaryICP"] as const) {
    const b = asRecord(audienceDef[key]);
    if (b && (typeof b.summary === "string" || typeof b.icpLabel === "string" || typeof b.name === "string"))
      return true;
  }
  return nonEmptyArray(audienceDef.additionalICPs);
}

function hasPersonaSegPanels(personaSeg: Record<string, unknown>): boolean {
  if (typeof personaSeg.segmentationStrategy === "string" && personaSeg.segmentationStrategy.trim()) return true;
  return nonEmptyArray(personaSeg.segments);
}

/** True when structured panel should replace plain body for Audience Segments plan. */
export function audienceSegmentsContextHasRenderablePanels(
  icp: unknown,
  personaSeg: unknown,
  audienceDef: unknown,
): boolean {
  const icpR = asRecord(icp);
  if (icpR && hasIcpRenderablePanels(icpR)) return true;
  const ad = asRecord(audienceDef);
  if (ad && hasAudienceDefPanels(ad)) return true;
  const ps = asRecord(personaSeg);
  if (ps && hasPersonaSegPanels(ps)) return true;
  return false;
}
