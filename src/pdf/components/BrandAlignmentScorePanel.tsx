// src/pdf/components/BrandAlignmentScorePanel.tsx
// Combined WunderBrand Score™ panel with gauge + score range legend for PDF reports
// Mirrors the website's wd-gauge-panel layout

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ScoreGauge } from "./ScoreGauge";
import { ScoreRangeLegend } from "./ScoreRangeLegend";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#07B0F2",
    borderRadius: 8,
    padding: 20,
    gap: 24,
    marginBottom: pdfTheme.spacing.md,
  },
  gaugeContainer: {
    width: 130,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    textAlign: "center",
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 9,
    color: "#5a6c8a",
    textAlign: "center",
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
  },
});

interface BrandAlignmentScorePanelProps {
  score: number; // 0-100
  size?: number;
}

export function BrandAlignmentScorePanel({
  score,
  size = 120,
}: BrandAlignmentScorePanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.gaugeContainer}>
        <ScoreGauge score={score} size={size} emphasis="primary" />
        <Text style={styles.scoreText}>{Math.round(score)}</Text>
        <Text style={styles.scoreLabel}>out of 100</Text>
      </View>
      <View style={styles.legendContainer}>
        <ScoreRangeLegend score={score} />
      </View>
    </View>
  );
}
