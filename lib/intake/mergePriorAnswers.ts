/**
 * Merge prior-tier structured answers with newly extracted / fallback answers.
 * Non-empty extracted values win; prior fills gaps (upgrade chain preservation).
 */

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function deepMergeRecords(
  prior: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...prior };

  for (const [key, value] of Object.entries(incoming)) {
    if (isEmpty(value)) continue;

    const existing = out[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      out[key] = deepMergeRecords(existing as Record<string, unknown>, value as Record<string, unknown>);
      continue;
    }
    out[key] = value;
  }

  return out;
}

export function mergePriorWithExtracted(
  prior: Record<string, unknown> | null | undefined,
  extracted: Record<string, unknown>,
): Record<string, unknown> {
  if (!prior || Object.keys(prior).length === 0) return extracted;
  return deepMergeRecords(prior, extracted);
}
