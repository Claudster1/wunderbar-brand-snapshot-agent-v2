// src/pdf/components/ScoreRangeLegend.tsx
// Score range legend — matches results MainGauge labels

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { SUITE_MUTED, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const SCORE_RANGES = [
  { min: 80, max: 100, color: "#22C55E", label: "Strong" },
  { min: 60, max: 79, color: "#4ADE80", label: "Good" },
  { min: 40, max: 59, color: "#EAB308", label: "Fair" },
  { min: 20, max: 39, color: "#F97316", label: "Weak" },
  { min: 0, max: 19, color: "#EF4444", label: "Critical" },
] as const;

function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getActiveRange(score: number) {
  return SCORE_RANGES.find((r) => score >= r.min && score <= r.max) ?? SCORE_RANGES[4];
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginBottom: 3,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    width: 52,
  },
  range: {
    fontFamily: "Lato",
    fontSize: 10,
    color: SUITE_MUTED,
  },
});

interface ScoreRangeLegendProps {
  score: number;
}

export function ScoreRangeLegend({ score }: ScoreRangeLegendProps) {
  const activeRange = getActiveRange(score);

  return (
    <View style={styles.container}>
      {SCORE_RANGES.map((range) => {
        const isActive = range === activeRange;
        return (
          <View
            key={range.min}
            style={[
              styles.row,
              isActive
                ? {
                    backgroundColor: withAlpha(range.color, 0.1),
                    borderWidth: 1.5,
                    borderColor: withAlpha(range.color, 0.35),
                  }
                : {},
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: range.color }]} />
            <Text style={[styles.label, { color: isActive ? range.color : SUITE_MUTED }]}>
              {range.label}
            </Text>
            <Text style={[styles.range, isActive ? { color: SUITE_NAVY, fontWeight: 700 } : {}]}>
              {range.min}–{range.max}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
