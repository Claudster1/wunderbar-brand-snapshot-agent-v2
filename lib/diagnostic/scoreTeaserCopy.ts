/** Payload for Zillow-style score teaser + email unlock (matches `/api/snapshot` teaser fields). */
export type ScoreTeaserPayload = {
  reportId: string;
  redirectUrl: string;
  brandAlignmentScore: number;
  pillarScores: Record<string, number>;
  primaryPillar?: string | null;
};

/** Pillar keys aligned with WunderBrand Score™ breakdown. */
export type TeaserPillarKey = "positioning" | "messaging" | "visibility" | "credibility" | "conversion";

const PILLAR_LABEL: Record<TeaserPillarKey, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

export function labelPillar(key: string): string {
  const k = key as TeaserPillarKey;
  return PILLAR_LABEL[k] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function getStrongestAndWeakestPillars(
  pillarScores: Record<string, number>,
): { strongest: { key: string; score: number }; weakest: { key: string; score: number } } {
  const entries = Object.entries(pillarScores).filter(([, v]) => typeof v === "number" && Number.isFinite(v)) as [
    string,
    number,
  ][];
  if (entries.length === 0) {
    return { strongest: { key: "positioning", score: 0 }, weakest: { key: "positioning", score: 0 } };
  }
  let strongest = entries[0];
  let weakest = entries[0];
  for (const e of entries) {
    if (e[1] > strongest[1]) strongest = e;
    if (e[1] < weakest[1]) weakest = e;
  }
  return { strongest: { key: strongest[0], score: strongest[1] }, weakest: { key: weakest[0], score: weakest[1] } };
}

/** Out-of-20 pillar band for teaser line (not clinical — marketing copy). */
export function pillarStrengthBand(scoreOutOf20: number): string {
  if (scoreOutOf20 >= 16) return "strong";
  if (scoreOutOf20 >= 12) return "solid";
  if (scoreOutOf20 >= 8) return "mixed";
  return "your biggest lift opportunity";
}

/** Overall /100 band for headline energy. */
export function overallScoreBand(score: number): string {
  if (score >= 75) return "Strong";
  if (score >= 60) return "Solid";
  if (score >= 45) return "Developing";
  return "Foundational";
}
