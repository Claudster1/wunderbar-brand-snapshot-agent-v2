// src/pdf/components/PrimaryPillarSection.tsx
// PDF component for Primary Focus Area section

import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface PrimaryPillarSectionProps {
  pillar: string;
  insight: string;
}

const styles = StyleSheet.create({
  h2: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 600,
  },
  h3: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  body: {
    fontSize: 11,
    lineHeight: 1.5,
  },
});

export function PrimaryPillarSection({
  pillar,
  insight,
}: PrimaryPillarSectionProps) {
  return (
    <View>
      <Text style={styles.h2}>Primary Focus Area</Text>
      <Text style={styles.h3}>{pillar}</Text>

      <Text style={styles.body}>{insight}</Text>
    </View>
  );
}
