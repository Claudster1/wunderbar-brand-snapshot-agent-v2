export type ParsedJourneyStage = {
  key: string;
  /** Display label for eyebrows (e.g. Closed/Won → "Closed / won") */
  label: string;
  narrative: string;
};

const STAGE_SPLIT_RE = /(?:^|[\r\n])(Aware|Consider|Decide|Commit|Closed\/Won)\s*:\s*/gi;

export function formatJourneyStageLabel(key: string): string {
  if (/^closed\/won$/i.test(key)) return "Closed / won";
  return key;
}

/** Short line for the map row — full narrative lives under the eyebrow blocks below. */
export function summarizeJourneyTile(narrative: string, maxLen = 118): string {
  const oneLine = narrative.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  const cut = oneLine.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 48 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Detects blueprint/workbook-style journey copy: repeated `Stage: narrative` segments.
 * Returns null if fewer than two stages match (fall back to plain body + generic map).
 */
export function parseBuyerJourneyStages(raw: string): ParsedJourneyStage[] | null {
  const t = raw.trim();
  if (!t) return null;

  const re = new RegExp(STAGE_SPLIT_RE.source, "gi");
  const matches = [...t.matchAll(re)];
  if (matches.length < 2) return null;

  const stages: ParsedJourneyStage[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const key = m[1];
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : t.length;
    let narrative = t.slice(start, end).trim();
    narrative = narrative.replace(/\s*[\r\n]+\s*/g, " ").replace(/\s+/g, " ");
    if (!narrative) continue;
    stages.push({
      key,
      label: formatJourneyStageLabel(key),
      narrative,
    });
  }

  return stages.length >= 2 ? stages : null;
}
