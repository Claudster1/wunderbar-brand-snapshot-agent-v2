// src/pdf/components/PillarScoreRow.tsx
// Compact pillar score row for Snapshot+ PDF pages

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_SM,
  SUITE_SECTION_ACTIVE_BG,
} from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    borderRadius: SUITE_RADIUS_SM,
    backgroundColor: "#FFFFFF",
  },
  rowEmphasis: {
    backgroundColor: SUITE_SECTION_ACTIVE_BG,
    borderColor: "rgba(7, 176, 242, 0.4)",
  },
  label: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    color: SUITE_NAVY,
    marginBottom: 2,
  },
  score: {
    fontFamily: "Lato",
    fontSize: 9.5,
    fontWeight: 700,
    color: SUITE_ACCENT_BRIGHT,
  },
  scoreMuted: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 600,
    color: SUITE_MUTED,
  },
});

export function PillarScoreRow({
  label,
  score,
  emphasis = false,
}: {
  label: string;
  score: number;
  emphasis?: boolean;
}) {
  const max = score > 20 ? 100 : 20;
  return (
    <View style={[styles.row, emphasis ? styles.rowEmphasis : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={emphasis ? styles.score : styles.scoreMuted}>
        Score: {Math.round(score)}/{max}
      </Text>
    </View>
  );
}
