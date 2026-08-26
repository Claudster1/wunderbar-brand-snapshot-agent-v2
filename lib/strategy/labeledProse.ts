export type LabeledPart = { label: string; value: string };

/**
 * Field labels at line start or after whitespace (e.g. "Stage:", "Why ask:",
 * "Voice Attributes:", "Primary Archetype:") — supports title-case multi-word labels.
 * Requires an initial capital so bare mid-sentence "word:" is ignored.
 */
const LABEL_SPLIT =
  /(?:^|\s)([A-Z][A-Za-z0-9/&+\-]*(?:\s+[A-Za-z][A-Za-z0-9/&+\-]*){0,5}):\s+/g;

/** Split one line into one or more Label → value fields (supports smashed multi-label lines). */
export function splitLabeledParts(line: string): LabeledPart[] | null {
  const trimmed = line.trim();
  if (!trimmed.includes(":")) return null;

  const matches = [...trimmed.matchAll(LABEL_SPLIT)];
  if (matches.length === 0) return null;

  const parts: LabeledPart[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const label = (m[1] || "").trim();
    if (!label || label.length > 48) continue;
    const valueStart = (m.index ?? 0) + m[0].length;
    const valueEnd = i + 1 < matches.length ? (matches[i + 1]!.index ?? trimmed.length) : trimmed.length;
    const value = trimmed.slice(valueStart, valueEnd).trim();
    if (!value) continue;
    parts.push({ label, value });
  }
  return parts.length > 0 ? parts : null;
}
