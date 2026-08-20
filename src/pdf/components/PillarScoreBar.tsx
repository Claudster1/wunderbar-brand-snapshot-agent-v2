// src/pdf/components/PillarScoreBar.tsx
// Matches results PillarMeter scoring colors (solid fill — react-pdf can't do CSS gradients reliably)

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const TRACK = "#E2E8F0";
const GREEN = "#22C55E";
const GOOD_GREEN = "#4ADE80";
const YELLOW = "#EAB308";
const ORANGE = "#F97316";
const RED_S = "#EF4444";

function scoreColor(percent: number): string {
  if (percent >= 80) return GREEN;
  if (percent >= 60) return GOOD_GREEN;
  if (percent >= 40) return YELLOW;
  if (percent >= 20) return ORANGE;
  return RED_S;
}

/**
 * Normalize pillar scores to the UI scale (0–20).
 * Legacy/API values sometimes arrive as 0–100.
 */
export function normalizePillarToTwenty(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 20) return Math.max(0, Math.min(20, Math.round(score / 5)));
  return Math.max(0, Math.min(20, Math.round(score)));
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 5,
  },
  label: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_NAVY,
  },
  score: {
    fontFamily: "Lato",
    fontSize: 13,
    fontWeight: 700,
  },
  scoreMax: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    color: SUITE_MUTED,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: TRACK,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SUITE_BORDER,
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});

export const PillarScoreBar = ({
  label,
  score,
  maxScore = 20,
}: {
  label: string;
  score: number;
  maxScore?: number;
}) => {
  const value =
    maxScore === 20 ? normalizePillarToTwenty(score) : Math.max(0, Math.min(maxScore, Math.round(score)));
  const percent = Math.max(0, Math.min(100, (value / maxScore) * 100));
  const color = scoreColor(percent);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.score, { color }]}>
          {value}
          <Text style={styles.scoreMax}>/{maxScore}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        {percent > 0 ? (
          <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
        ) : null}
      </View>
    </View>
  );
};
