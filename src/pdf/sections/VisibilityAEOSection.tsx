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
  callout: {
    backgroundColor: "#F5F7FB",
    padding: 14,
    borderRadius: 6,
    marginVertical: 12,
  },
});

export function VisibilityAEOSection({ brandName }: { brandName: string }) {
  return (
    <View>
      <Text style={styles.h2}>Visibility & AEO Strategy</Text>

      <Text style={styles.body}>
        Visibility today isn’t just about search engines — it’s about how
        clearly AI systems understand and recommend {brandName}.
      </Text>

      <View style={styles.callout}>
        <Text style={styles.body}>
          Blueprint™ includes structured guidance to help your brand surface in
          AI-driven discovery environments like ChatGPT and Perplexity.
        </Text>
      </View>

      <Text style={styles.body}>
        This includes content structure, entity clarity, and narrative
        consistency — all designed to improve both SEO and AEO outcomes.
      </Text>
    </View>
  );
}
