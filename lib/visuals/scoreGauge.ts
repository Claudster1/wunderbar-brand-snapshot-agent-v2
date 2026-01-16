// lib/visuals/scoreGauge.ts
// Utility functions for score gauge visualization

export function scoreToColor(score: number): string {
  if (score >= 16) return "#2ECC71"; // green
  if (score >= 12) return "#F1C40F"; // amber
  if (score >= 8) return "#E67E22";  // orange
  return "#E74C3C";                 // red
}

export function scoreToAngle(score: number): number {
  // 0–20 → 0–180 degrees
  return (score / 20) * 180;
}
