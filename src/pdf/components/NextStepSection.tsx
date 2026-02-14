// src/pdf/components/NextStepSection.tsx
// PDF component for Next Step section

import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  h3: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 600,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.5,
  },
});

export function NextStepSection() {
  return (
    <View>
      <Text style={styles.h3}>Your Strategic Next Step</Text>
      <Text style={styles.body}>
        Your WunderBrand Snapshot™ revealed where clarity can be strengthened.
        WunderBrand Blueprint™ turns that insight into a complete system.
      </Text>
    </View>
  );
}
