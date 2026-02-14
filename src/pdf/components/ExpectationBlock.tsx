// src/pdf/components/ExpectationBlock.tsx
// PDF component explaining how the Snapshot+ report was generated

import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 12,
    borderTop: '1pt solid #E0E3EA',
  },
  heading: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    color: '#021859',
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
  },
});

export function ExpectationBlock() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        About this report
      </Text>

      <Text style={styles.body}>
        This Snapshot+™ report is based on the information you provided during
        the WunderBrand Snapshot™. Insights reflect current brand signals and patterns.
        Additional context can be added over time to deepen recommendations.
      </Text>
    </View>
  );
}
