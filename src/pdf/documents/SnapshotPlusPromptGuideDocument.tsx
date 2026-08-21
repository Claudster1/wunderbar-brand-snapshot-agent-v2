import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { BrandSnapshotPlusReport } from "@/src/pdf/BrandSnapshotPlusPDF";
import { pdfTheme } from "@/src/pdf/theme";
import { DisclaimerPage } from "@/src/pdf/components/DisclaimerPage";
import { PdfHeader, PDF_HEADER_RESERVED } from "@/src/pdf/components/PdfHeader";
import { PdfFooter, PDF_FOOTER_RESERVED } from "@/src/pdf/components/PdfFooter";
import { registerPdfFonts } from "@/src/pdf/registerFonts";

registerPdfFonts();

const s = StyleSheet.create({
  page: {
    paddingTop: PDF_HEADER_RESERVED + 8,
    paddingBottom: PDF_FOOTER_RESERVED + 8,
    paddingHorizontal: 36,
    fontFamily: "Lato",
    fontSize: 10,
    color: pdfTheme.colors.text,
    lineHeight: 1.55,
    backgroundColor: "#F5F5F7",
  },
  h1: {
    fontFamily: "Lato",
    fontSize: 18,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: { fontFamily: "Lato", fontSize: 10, marginBottom: 6, color: pdfTheme.colors.text },
  meta: { fontFamily: "Lato", fontSize: 9, color: pdfTheme.colors.muted, marginBottom: 10 },
  promptCard: {
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 14,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
  },
  promptLabel: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  promptText: { fontFamily: "Lato", fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.5 },
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
  const brandName = report.businessName || "Your Brand";
  const prompts = (report.aiPrompts || []).map(normalizePrompt).slice(0, 20);
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader
          title="Prompt Guide"
          businessName={brandName}
          date={reportDate}
          productName="WunderBrand Snapshot+™"
        />
        <Text style={s.h1}>Snapshot+ Prompt Guide</Text>
        <Text style={s.meta}>
          {brandName} · {reportDate}
        </Text>
        <Text style={s.body}>
          Use these prompts to turn your Snapshot+ strategy into channel-ready drafts. Start with top-priority
          gaps and refine outputs in Workbook before publishing.
        </Text>

        <Text style={s.h2}>How to Use This Guide</Text>
        <View style={s.promptCard}>
          <Text style={s.promptText}>1) Select one objective (positioning, messaging, visibility, conversion).</Text>
          <Text style={s.promptText}>2) Run one prompt at a time with your latest results context.</Text>
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
              Prompt pack is not available yet for this document. Regenerate your Snapshot+ to include prompts.
            </Text>
          </View>
        )}
        <PdfFooter businessName={brandName} productName="WunderBrand Snapshot+™" showPageNumbers />
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}
