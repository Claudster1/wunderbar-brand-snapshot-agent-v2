import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { BrandSnapshotPlusReport } from "@/src/pdf/BrandSnapshotPlusPDF";
import { pdfTheme } from "@/src/pdf/theme";
import { DisclaimerPage } from "@/src/pdf/components/DisclaimerPage";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
    lineHeight: 1.55,
  },
  h1: { fontSize: 21, fontWeight: 700, color: "#021859", marginBottom: 8 },
  h2: { fontSize: 12, fontWeight: 700, color: "#021859", marginTop: 12, marginBottom: 6 },
  body: { fontSize: 10, marginBottom: 6 },
  meta: { fontSize: 9, color: "#6B7280", marginBottom: 10 },
  promptCard: {
    border: "1 solid #E5E7EB",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#F8FBFF",
    borderLeft: `3 solid ${pdfTheme.colors.blue}`,
  },
  promptLabel: { fontSize: 9, fontWeight: 700, color: pdfTheme.colors.blue, marginBottom: 4 },
  promptText: { fontSize: 10, color: "#0F172A" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

function normalizePrompt(item: string | { name?: string; prompt?: string }): { name: string; prompt: string } {
  if (typeof item === "string") {
    return { name: "Prompt", prompt: item };
  }
  const name = typeof item.name === "string" && item.name.trim().length > 0 ? item.name : "Prompt";
  const prompt = typeof item.prompt === "string" && item.prompt.trim().length > 0 ? item.prompt : name;
  return { name, prompt };
}

export function SnapshotPlusPromptGuideDocument({
  report,
}: {
  report: BrandSnapshotPlusReport;
}) {
  const prompts = (report.aiPrompts || []).map(normalizePrompt).slice(0, 20);
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Snapshot+ Prompt Guide</Text>
        <Text style={s.meta}>
          {report.businessName} | {reportDate}
        </Text>
        <Text style={s.body}>
          Use these prompts to turn your Snapshot+ strategy into channel-ready drafts. Start with top-priority
          gaps and refine outputs in Workbook before publishing.
        </Text>

        <Text style={s.h2}>How to use this guide</Text>
        <View style={s.promptCard}>
          <Text style={s.promptText}>1) Select one objective (positioning, messaging, visibility, conversion).</Text>
          <Text style={s.promptText}>2) Run one prompt at a time with your latest report context.</Text>
          <Text style={s.promptText}>3) Save best outputs to Workbook and regenerate final deliverables.</Text>
        </View>

        <Text style={s.h2}>Prompt Library</Text>
        {prompts.length > 0 ? (
          prompts.map((item, index) => (
            <View key={`${item.name}-${index}`} style={s.promptCard} wrap={false}>
              <Text style={s.promptLabel}>
                {index + 1}. {item.name}
              </Text>
              <Text style={s.promptText}>{item.prompt}</Text>
            </View>
          ))
        ) : (
          <View style={s.promptCard}>
            <Text style={s.promptText}>
              Prompt pack is not available yet for this report. Regenerate your Snapshot+ report to include prompts.
            </Text>
          </View>
        )}

        <Text style={s.footer}>WunderBrand Snapshot+ Prompt Guide</Text>
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}
