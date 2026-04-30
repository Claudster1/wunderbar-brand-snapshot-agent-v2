/**
 * Pulls named competitors from Blueprint / Blueprint+ `competitivePositioning.players`
 * for Strategy tab and related surfaces.
 */

export type CompetitiveLandscapePlayer = {
  name: string;
  narrative: string;
};

const MAX_PLAYERS = 12;

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function extractCompetitiveLandscapePlayers(
  diagnostic: Record<string, unknown>,
): CompetitiveLandscapePlayer[] {
  const cp = diagnostic.competitivePositioning;
  if (!cp || typeof cp !== "object" || Array.isArray(cp)) return [];
  const players = (cp as { players?: unknown }).players;
  if (!Array.isArray(players)) return [];

  const out: CompetitiveLandscapePlayer[] = [];
  for (const raw of players.slice(0, MAX_PLAYERS)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const r = raw as Record<string, unknown>;
    const name = asStr(r.name);
    if (!name) continue;
    const narrative = asStr(r.narrative);
    out.push({ name, narrative });
  }
  return out;
}
