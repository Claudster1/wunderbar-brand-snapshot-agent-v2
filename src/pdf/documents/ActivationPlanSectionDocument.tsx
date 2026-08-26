import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { PdfHeader, PDF_HEADER_RESERVED } from "../components/PdfHeader";
import { PdfFooter, PDF_FOOTER_RESERVED } from "../components/PdfFooter";
import { registerPdfFonts } from "../registerFonts";
import type { ProductTier } from "@/components/results/tabConfig";
import { splitLabeledParts } from "@/lib/strategy/labeledProse";
import { pdfTheme } from "../theme";

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
  kicker: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: "Lato",
    fontSize: 18,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  meta: {
    fontFamily: "Lato",
    fontSize: 9,
    color: pdfTheme.colors.muted,
    marginBottom: 12,
  },
  label: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginTop: 4,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    paddingLeft: 14,
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    marginBottom: 10,
  },
  fieldCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: pdfTheme.colors.blue,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: "Lato",
    fontSize: 10,
    lineHeight: 1.5,
    color: pdfTheme.colors.text,
  },
  paragraph: {
    fontFamily: "Lato",
    fontSize: 10,
    lineHeight: 1.55,
    marginBottom: 8,
    color: pdfTheme.colors.text,
  },
});

type Props = {
  productTier: ProductTier;
  brandName: string;
  sectionLabel: string;
  sectionBody: string;
  bodySource?: "workbook" | "report";
  versionNote?: string;
};

function mapToDisclaimerTier(tier: ProductTier): "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus" {
  if (tier === "snapshot-plus") return "snapshot_plus";
  if (tier === "blueprint-plus") return "blueprint_plus";
  if (tier === "snapshot") return "snapshot";
  return "blueprint";
}

function renderBodyLines(body: string): React.ReactNode[] {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [
      <Text key="empty" style={s.paragraph}>
        No plan content available for this section.
      </Text>,
    ];
  }

  const nodes: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    const parts = splitLabeledParts(line);
    if (parts) {
      parts.forEach((part, pi) => {
        nodes.push(
          <View key={`${idx}-${pi}-${part.label}`} style={s.fieldCard} wrap={false}>
            <Text style={s.fieldLabel}>{part.label}</Text>
            <Text style={s.fieldValue}>{part.value}</Text>
          </View>,
        );
      });
      return;
    }
    nodes.push(
      <Text key={`p-${idx}`} style={s.paragraph}>
        {line}
      </Text>,
    );
  });
  return nodes;
}

export function ActivationPlanSectionDocument({
  productTier,
  brandName,
  sectionLabel,
  sectionBody,
  bodySource = "report",
  versionNote,
}: Props) {
  const disclaimerTier = mapToDisclaimerTier(productTier);
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const sourceLine =
    bodySource === "workbook"
      ? "Content source: saved Workbook text (matches your latest edits where the plan block is present)."
      : "Content source: default plan from your results (open Workbook and save edits to export your refined version).";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader
          title="Activation Plan"
          businessName={brandName}
          date={reportDate}
          productName="WunderBrand Suite™"
        />
        <Text style={s.kicker}>Activation Plan</Text>
        <Text style={s.title}>{sectionLabel}</Text>
        <Text style={s.meta}>
          {brandName} · Generated {reportDate}
          {versionNote ? ` · ${versionNote}` : ""}
        </Text>
        <Text style={{ ...s.meta, marginBottom: 10 }}>{sourceLine}</Text>

        <View style={s.card}>
          <Text style={s.label}>Plan Content (Editable in Your Workbook)</Text>
          {renderBodyLines(sectionBody)}
        </View>

        <Text style={s.meta}>Tip: use “Edit in Workbook” to update this plan, then download again.</Text>
        <PdfFooter businessName={brandName} productName="Activation Plan" showPageNumbers />
      </Page>

      <DisclaimerPage tier={disclaimerTier} />
    </Document>
  );
}
