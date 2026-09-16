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
  let trimmed = line.trim();
  if (!trimmed.includes(":")) return null;

  // `- **Subject:** value` / `**Preheader:** value` (colon inside bold)
  const boldLabelInside = trimmed.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
  if (boldLabelInside?.[1] && boldLabelInside[2]) {
    return [{ label: boldLabelInside[1].trim(), value: boldLabelInside[2].trim() }];
  }
  // `**Subject**: value` (colon outside bold)
  const boldLabelOutside = trimmed.match(/^\*\*([^*]+?)\*\*:\s*(.+)$/);
  if (boldLabelOutside?.[1] && boldLabelOutside[2]) {
    return [{ label: boldLabelOutside[1].trim(), value: boldLabelOutside[2].trim() }];
  }

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
