import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 10,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
});

export function BlueprintPlusCTA() {
  return (
    <View>
      <Text style={styles.h2}>Going Further</Text>

      <Text style={styles.body}>
        Blueprint+™ builds on this foundation with deeper audience segmentation,
        campaign-level prompts, and advanced activation layers.
      </Text>

      <Text style={styles.body}>
        When you’re ready to expand, Blueprint+™ is designed to plug directly
        into this system — without starting over.
      </Text>
    </View>
  );
}
