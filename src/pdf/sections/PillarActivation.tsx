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
  divider: {
    height: 1,
    backgroundColor: "#E0E3EA",
    marginVertical: 24,
  },
});

export function PillarActivation({
  pillarName,
  snapshotInsight,
  blueprintActivation,
}: {
  pillarName: string;
  snapshotInsight: string;
  blueprintActivation: string;
}) {
  return (
    <View>
      <Text style={styles.h2}>{pillarName}</Text>

      <Text style={styles.h3}>What Snapshot+™ Revealed</Text>
      <Text style={styles.body}>{snapshotInsight}</Text>

      <Text style={styles.h3}>How Blueprint™ Activates This</Text>
      <Text style={styles.body}>{blueprintActivation}</Text>

      <View style={styles.divider} />
    </View>
  );
}
