// src/pdf/components/PillarSectionPDF.tsx
// PDF pillar section component with progressive disclosure

import { Text, View, StyleSheet } from "@react-pdf/renderer";

export function PillarSectionPDF({
  pillarKey,
  pillar,
  isPrimary,
}: {
  pillarKey: string;
  pillar: any;
  isPrimary: boolean;
}) {
  return (
    <View style={[styles.card, ...(isPrimary ? [styles.primary] : [])]}>
      <Text style={styles.title}>
        {pillarKey.toUpperCase()}
        {isPrimary && " — Primary Focus Area"}
      </Text>

      <Text style={styles.summary}>{pillar.summary}</Text>

      {isPrimary ? (
        <Text style={styles.expanded}>{pillar.expandedInsight}</Text>
      ) : (
        <Text style={styles.micro}>
          Why this matters: {pillar.whyItMatters}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
  },
  primary: {
    borderColor: "#000",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  summary: {
    fontSize: 11,
    marginBottom: 4,
  },
  expanded: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  micro: {
    fontSize: 10,
    color: "#555",
  },
});
