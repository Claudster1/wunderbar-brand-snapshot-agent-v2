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
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#021859",
    fontWeight: 600,
  },
  block: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F5F7FB",
    borderRadius: 6,
  },
  header: {
    paddingBottom: 16,
    borderBottom: "2px solid #021859",
    marginBottom: 24,
  },
  title: { fontSize: 28, color: "#021859", marginBottom: 4 },
  listItem: { marginBottom: 6 },
});

export function BlueprintPlusDocument({ data }: { data: any }) {
  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Brand Blueprint+™</Text>
          <Text>The advanced strategic foundation for scalable brand growth.</Text>
        </View>

        <Text>Hello {data.userName},</Text>
        <Text style={{ marginTop: 12 }}>
          Your Brand Blueprint+™ synthesizes deeper customer insights, narrative frameworks,
          positioning strategy, and execution plans into a single, actionable system designed for
          clarity, alignment, and growth.
        </Text>
      </Page>

      {/* PAGE 2 — BRAND STORY FRAMEWORK */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Brand Story Framework</Text>
        <View style={styles.block}>
          <Text>{data?.brandStory?.long}</Text>
        </View>

        <Text style={styles.sectionTitle}>Elevator Pitch</Text>
        <View style={styles.block}>
          <Text>{data?.brandStory?.short}</Text>
        </View>
      </Page>

      {/* PAGE 3 — POSITIONING PLATFORM */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Positioning Statement</Text>
        <View style={styles.block}>
          <Text>{data?.positioning?.statement}</Text>
        </View>

        <Text style={styles.sectionTitle}>Differentiation Matrix</Text>
        {data?.positioning?.differentiators?.map((d: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{d.name}</Text>
            <Text>{d.detail}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 4 — CUSTOMER JOURNEY */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Customer Journey Map</Text>
        {data?.journey?.map((stage: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{stage.stage}</Text>
            <Text>Goal: {stage.goal}</Text>
            <Text>Emotion: {stage.emotion}</Text>
            <Text>Opportunities: {stage.opportunities}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 5 — CONTENT STRATEGY */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>12-Month Content Roadmap</Text>
        {data?.contentRoadmap?.map((m: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{m.month}</Text>
            <Text>{m.theme}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 6 — VISUAL DIRECTION */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Visual Direction</Text>
        {data?.visualDirection?.map((v: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{v.category}</Text>
            <Text>{v.description}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 7 — PERSONALITY + DECISION FILTERS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Brand Personality</Text>
        <View style={styles.block}>
          <Text>{data?.personality}</Text>
        </View>

        <Text style={styles.sectionTitle}>Decision Filters</Text>
        {data?.decisionFilters?.map((f: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text>• {f}</Text>
          </View>
        ))}
      </Page>

      {/* PAGE 8 — PROMPTS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>AI Prompt Library — Extended</Text>
        {data?.aiPrompts?.map((p: any, idx: number) => (
          <View key={idx} style={styles.block}>
            <Text style={{ fontWeight: 600 }}>{p.name}</Text>
            <Text>{p.prompt}</Text>
          </View>
        ))}
      </Page>

      {/* ADDITIONAL PAGES auto-expand */}
      {data?.additionalSections?.map((section: any, idx: number) => (
        <Page key={idx} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.block}>
            <Text>{section.content}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}


