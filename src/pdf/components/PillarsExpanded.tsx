// src/pdf/components/PillarsExpanded.tsx
// Expanded pillar insights component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#021859",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  insight: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#0C1526",
    marginBottom: 12,
  },
});

export function PillarsExpanded({
  primary,
  insights,
}: {
  primary: string;
  insights: Record<string, string>;
}) {
  const primaryInsight = insights[primary];

  return (
    <View style={styles.container}>
      <Text style={styles.pillarTitle}>{primary}</Text>
      {primaryInsight && (
        <Text style={styles.insight}>{primaryInsight}</Text>
      )}
    </View>
  );
}
