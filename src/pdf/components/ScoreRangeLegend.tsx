// src/pdf/components/ScoreRangeLegend.tsx
// Score range legend for PDF reports — color swatches, ranges, labels, active band highlight

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const SCORE_RANGES = [
  { min: 80, max: 100, color: "#34c759", label: "Strong alignment" },
  { min: 60, max: 79, color: "#8bc34a", label: "Moderate alignment" },
  { min: 40, max: 59, color: "#ffcc00", label: "Partial alignment" },
  { min: 20, max: 39, color: "#ff9500", label: "Weak alignment" },
  { min: 0, max: 19, color: "#ff3b30", label: "Low alignment" },
] as const;

function getActiveRange(score: number) {
  return SCORE_RANGES.find((r) => score >= r.min && score <= r.max) ?? SCORE_RANGES[4];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 8,
    fontWeight: 700,
    color: "#07B0F2",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E6EAF2",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowActive: {
    backgroundColor: "rgba(139, 195, 74, 0.1)",
    borderRadius: 3,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
  },
  range: {
    fontSize: 9,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    width: 36,
  },
  label: {
    fontSize: 9,
    color: "#404040",
    flex: 1,
  },
  labelActive: {
    fontWeight: 700,
    color: pdfTheme.colors.navy,
  },
  indicator: {
    fontSize: 8,
    fontWeight: 700,
    color: "#8bc34a",
    marginLeft: 4,
  },
});

interface ScoreRangeLegendProps {
  score: number; // 0-100
}

export function ScoreRangeLegend({ score }: ScoreRangeLegendProps) {
  const activeRange = getActiveRange(score);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score Ranges</Text>
      {SCORE_RANGES.map((range, i) => {
        const isActive = range === activeRange;
        const isLast = i === SCORE_RANGES.length - 1;

        return (
          <View
            key={range.min}
            style={[
              styles.row,
              ...(isLast ? [styles.rowLast] : []),
              ...(isActive ? [styles.rowActive] : []),
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: range.color }]} />
            <Text style={[styles.range, ...(isActive ? [styles.labelActive] : [])]}>
              {range.min}–{range.max}
            </Text>
            <Text style={[styles.label, ...(isActive ? [styles.labelActive] : [])]}>
              {range.label}
            </Text>
            {isActive && (
              <Text style={styles.indicator}>← {Math.round(score)}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
