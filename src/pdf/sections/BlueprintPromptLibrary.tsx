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
});

export function BlueprintPromptLibrary() {
  return (
    <View>
      <Text style={styles.h2}>Your Brand Prompt Library</Text>

      <Text style={styles.body}>
        These prompts are generated directly from your Blueprint™ — not
        templates, not generic examples.
      </Text>

      <Text style={styles.h3}>Positioning Prompts</Text>
      <Text style={styles.body}>
        • Explain our brand clearly to a first-time visitor{"\n"}• Position us
        against a common alternative{"\n"}• Describe our value in one sentence
      </Text>

      <Text style={styles.h3}>Messaging Prompts</Text>
      <Text style={styles.body}>
        • Rewrite this copy in our brand voice{"\n"}• Generate a homepage
        headline{"\n"}• Align this message across channels
      </Text>

      <Text style={styles.h3}>Visibility & AEO Prompts</Text>
      <Text style={styles.body}>
        • Generate an AI-readable brand summary{"\n"}• Structure content for
        answer engines{"\n"}• Clarify brand entities for AI discovery
      </Text>
    </View>
  );
}
