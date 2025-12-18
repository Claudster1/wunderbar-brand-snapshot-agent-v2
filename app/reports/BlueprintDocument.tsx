import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [{ src: "https://fonts.gstatic.com/s/inter/v12/UcCO3H6mNWsBAg.ttf" }],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#0C1526",
  },
  header: {
    borderBottom: "2px solid #021859",
    paddingBottom: 12,
    marginBottom: 24,
  },
  title: { fontSize: 26, color: "#021859", marginBottom: 4 },
  sectionTitle: {
    fontSize: 18,
    color: "#021859",
    marginBottom: 10,
    marginTop: 20,
  },
  block: {
    padding: 12,
    marginTop: 8,
    backgroundColor: "#F5F7FB",
    borderRadius: 6,
  },
  row: {
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
});

export function BlueprintDocument({ data }: { data: any }) {
  const {
    userName,
    brandEssence,
    brandPromise,
    differentiation,
    archetype,
    persona,
    toneOfVoice,
    messagingPillars,
    colorPalette,
    aiPrompts,
  } = data;

  return (
    <Document>
      {/* PAGE 1 — Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Brand Blueprint™</Text>
          <Text>A strategic foundation for your brand's growth</Text>
        </View>

        <Text>Hello {userName},</Text>
        <Text style={{ marginTop: 12 }}>
          Your Brand Blueprint™ translates your brand’s essence, language, and visual direction into
          a unified and actionable system.
        </Text>
      </Page>

      {/* PAGE 2 — Brand Essence */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Brand Essence</Text>
        <View style={styles.block}>
          <Text>{brandEssence}</Text>
        </View>

        <Text style={styles.sectionTitle}>Brand Promise</Text>
        <View style={styles.block}>
          <Text>{brandPromise}</Text>
        </View>

        <Text style={styles.sectionTitle}>Differentiation</Text>
        <View style={styles.block}>
          <Text>{differentiation}</Text>
        </View>
      </Page>

      {/* PAGE 3 — Persona + Archetype */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Brand Persona</Text>
        <View style={styles.block}>
          <Text>{persona?.summary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Brand Archetype</Text>
        <View style={styles.block}>
          <Text>{archetype?.summary}</Text>
        </View>
      </Page>

      {/* PAGE 4 — Tone of Voice */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Tone of Voice</Text>
        {toneOfVoice?.map((tone: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{tone.name}</Text>
            <Text>{tone.detail}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 5 — Messaging Pillars */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Messaging Pillars</Text>
        {messagingPillars?.map((pillar: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{pillar.title}</Text>
            <Text>{pillar.detail}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 6 — Color Palette */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Recommended Color Palette</Text>
        {colorPalette?.map((c: any, idx: number) => (
          <View key={idx} style={styles.colorRow}>
            <Text>{c.name}</Text>
            <Text>{c.meaning}</Text>
            <Text>{c.hex}</Text>
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: c.hex,
                border: "1px solid #000",
              }}
            />
          </View>
        ))}
      </Page>

      {/* PAGE 7 — AI Prompts */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>AI Prompt Library</Text>
        {aiPrompts?.map((p: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{p.name}</Text>
            <Text>{p.prompt}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 8 — Final Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Next Steps</Text>
        <View style={styles.block}>
          <Text>
            Your Brand Blueprint™ sets the foundation for consistent messaging, aligned marketing,
            and scalable brand growth. Use it as your core reference for all creative and
            communication decisions.
          </Text>
        </View>
      </Page>
    </Document>
  );
}


