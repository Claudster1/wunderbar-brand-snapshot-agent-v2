// AI Prompt Library — standalone document
// For: Anyone using AI tools (ChatGPT, Claude, etc.) for the brand

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import type { BlueprintEngineOutput } from "../types/blueprintReport";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.55 },
  cover: { padding: 40, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 20, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 10, marginTop: 20 },
  h2: { fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 6, marginTop: 16 },
  body: { fontSize: 10, lineHeight: 1.55, marginBottom: 6 },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 8 },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  promptCard: { backgroundColor: "#F8FAFC", borderRadius: 6, padding: 14, marginBottom: 10, border: "1 solid #E5E7EB" },
  promptBlock: { backgroundColor: "#EFF6FF", borderRadius: 4, padding: 10, marginBottom: 6, borderLeft: `3 solid ${pdfTheme.colors.blue}` },
  promptText: { fontSize: 9, lineHeight: 1.5, fontFamily: "Courier" },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
  intro: { backgroundColor: "#F0FDF4", borderRadius: 6, padding: 14, marginBottom: 16, borderLeft: "3 solid #22C55E" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function PromptLibraryDocument({ data, brandName }: Props) {
  const d = data;
  const allPrompts = [
    ...(d.foundationalPromptPack?.prompts || []),
    ...(d.executionPromptPack?.prompts || []),
  ];
  const categories = [...new Set(allPrompts.map(p => p.category))];

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>AI Prompt Library</Text>
        <Text style={s.coverSub}>{brandName} — {allPrompts.length} Custom Prompts</Text>
        <Text style={{ ...s.coverMeta, marginTop: 30 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 40, fontSize: 8 }}>Built from your WunderBrand Blueprint™</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>How to Use These Prompts</Text>
        <View style={s.intro}>
          <Text style={s.body}>These {allPrompts.length} prompts are generated directly from {brandName}'s brand strategy — not templates. Each one is calibrated to your positioning, voice, archetype, and audience.</Text>
          <Text style={s.body}>Copy any prompt and paste it into ChatGPT, Claude, Gemini, or any AI writing tool. The outputs will be aligned with your brand from the start.</Text>
        </View>

        <Text style={s.h1}>{d.foundationalPromptPack?.packName || "Foundational Prompts"}</Text>
        <Text style={s.body}>{d.foundationalPromptPack?.description}</Text>
        {d.foundationalPromptPack?.prompts?.map((p, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
            </View>
            <Text style={s.body}>{p.instruction}</Text>
            <View style={s.promptBlock}><Text style={s.promptText}>{p.prompt}</Text></View>
            <Text style={s.small}>{p.whyItMatters}</Text>
          </View>
        ))}

        <Text style={s.h1}>{d.executionPromptPack?.packName || "Execution Prompts"}</Text>
        <Text style={s.body}>{d.executionPromptPack?.description}</Text>
        {d.executionPromptPack?.prompts?.map((p, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
            </View>
            <Text style={s.body}>{p.instruction}</Text>
            <View style={s.promptBlock}><Text style={s.promptText}>{p.prompt}</Text></View>
            <Text style={s.small}>{p.whyItMatters}</Text>
          </View>
        ))}

        <Text style={s.h2}>Prompts by Category</Text>
        {categories.map((cat) => (
          <View key={cat} style={{ marginBottom: 6 }}>
            <Text style={s.label}>{cat}</Text>
            {allPrompts.filter(p => p.category === cat).map((p, i) => (
              <Text key={i} style={s.body}>• {p.title}</Text>
            ))}
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
