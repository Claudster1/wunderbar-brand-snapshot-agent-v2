// src/pdf/components/ContextCoverageMeter.tsx
// PDF version of context coverage meter

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: "#4A5568",
  },
  percent: {
    fontSize: 10,
    color: "#4A5568",
    fontWeight: 600,
  },
  track: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    backgroundColor: pdfTheme.colors.blue,
    borderRadius: 3,
  },
  hint: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
});

interface ContextCoverageMeterProps {
  percent: number;
}

export function ContextCoverageMeter({ percent }: ContextCoverageMeterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Context Coverage</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      {percent < 80 && (
        <Text style={styles.hint}>
          Deeper inputs unlock sharper insights in Snapshot+™
        </Text>
      )}
    </View>
  );
}
