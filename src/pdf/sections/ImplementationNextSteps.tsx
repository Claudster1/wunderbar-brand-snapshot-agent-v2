import { Link, Text, View, StyleSheet } from "@react-pdf/renderer";
import { WUNDERBAR_IMPLEMENTATION_PATHS_PDF_URL } from "@/lib/wunderbarExternalUrls";
import { pdfTheme } from "../theme";

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
    color: pdfTheme.colors.navy,
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
    color: pdfTheme.colors.blue,
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

      <Link src={WUNDERBAR_IMPLEMENTATION_PATHS_PDF_URL} style={styles.link}>
        View implementation paths →
      </Link>
    </View>
  );
}
