import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  header: {
    fontSize: 14,
    fontWeight: 600,
    color: "#021859",
    marginBottom: 8,
  },
  body: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: "#374151",
  },
  link: {
    marginTop: 10,
    fontSize: 10.5,
    color: "#07B0F2",
  },
});

export function ImplementationNextSteps() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>From clarity to execution</Text>

      <Text style={styles.body}>
        This Snapshot+™ is designed to stand on its own. If you’d like support
        turning these insights into execution, Wunderbar Digital works with
        select teams to implement brand, marketing, and AI strategies aligned
        to the priorities identified here.
      </Text>

      <Text style={styles.link}>View implementation paths →</Text>
    </View>
  );
}
