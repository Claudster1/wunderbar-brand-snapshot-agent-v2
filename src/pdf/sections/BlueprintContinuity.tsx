import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 10,
  },
  h3: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  callout: {
    backgroundColor: "#F5F7FB",
    padding: 14,
    borderRadius: 6,
    marginVertical: 12,
  },
});

export function BlueprintContinuity({
  primaryPillar,
}: {
  primaryPillar: string;
}) {
  return (
    <View>
      <Text style={styles.h2}>How This Builds on Snapshot+™</Text>

      <Text style={styles.body}>
        Snapshot+™ surfaced where clarity mattered most. Blueprint™ builds on
        those insights by turning them into usable structure.
      </Text>

      <View style={styles.callout}>
        <Text style={styles.h3}>Primary Focus Area</Text>
        <Text style={styles.body}>
          {primaryPillar} emerged as your strongest opportunity for alignment
          and momentum. This Blueprint™ is anchored around that insight.
        </Text>
      </View>
    </View>
  );
}
