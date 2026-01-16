// src/pdf/components/ContextGapsSection.tsx
// PDF component for Context Gaps section

import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface ContextGapsSectionProps {
  gaps: string[];
}

const styles = StyleSheet.create({
  h3: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600,
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
  },
});

export function ContextGapsSection({ gaps }: ContextGapsSectionProps) {
  return (
    <View>
      <Text style={styles.h3}>What We Could Go Deeper On</Text>
      {gaps.map((g) => (
        <Text key={g} style={styles.listItem}>• {g}</Text>
      ))}
    </View>
  );
}
