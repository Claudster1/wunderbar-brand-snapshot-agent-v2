// Overall Brand Alignment Score (0–100) rating label for report hero

export function getOverallScoreRating(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Developing";
  return "Needs focus";
}
