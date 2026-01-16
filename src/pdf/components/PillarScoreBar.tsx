// src/pdf/components/PillarScoreBar.tsx
// Reusable pillar score bar component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const barHeight = 8;

const styles = StyleSheet.create({
  container: {
    marginBottom: pdfTheme.spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: pdfTheme.spacing.xs,
  },
  label: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.sm,
    color: pdfTheme.colors.midnight,
  },
  barBackground: {
    height: barHeight,
    backgroundColor: pdfTheme.colors.gray,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: barHeight,
    backgroundColor: pdfTheme.colors.blue,
    borderRadius: 4,
  },
});

export const PillarScoreBar = ({
  label,
  score,
}: {
  label: string;
  score: number;
}) => {
  const percentage = Math.min(Math.max(score * 5, 0), 100); // 0–20 → 0–100%
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}>{score}/20</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};
