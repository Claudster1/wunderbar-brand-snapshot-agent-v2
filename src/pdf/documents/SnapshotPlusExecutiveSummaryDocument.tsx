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
    fontSize: 10.5,
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
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: { fontFamily: "Lato", fontSize: 10.5, marginBottom: 6, color: pdfTheme.colors.text },
  small: { fontFamily: "Lato", fontSize: 9, color: pdfTheme.colors.muted, marginBottom: 4 },
  card: {
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    borderRadius: 12,
    padding: 12,
    paddingLeft: 14,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  bullet: { fontFamily: "Lato", fontSize: 10, marginBottom: 3, color: pdfTheme.colors.text },
});

function splitPoints(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/[•\n;]+/g)
    .map((x) => x.replace(/^\d+[\).\-\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function SnapshotPlusExecutiveSummaryDocument({
  report,
}: {
  report: BrandSnapshotPlusReport;
}) {
  const brandName = report.businessName || "Your Brand";
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const roadmap30 = splitPoints(report.roadmap_30);
  const roadmap60 = splitPoints(report.roadmap_60);
  const roadmap90 = splitPoints(report.roadmap_90);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader
          title="Executive Summary"
          businessName={brandName}
          date={reportDate}
          productName="WunderBrand Snapshot+™"
        />
        <Text style={s.h1}>Snapshot+ Executive Summary</Text>
        <Text style={s.small}>
          {brandName} · Prepared for {report.userName || "Leadership"} · {reportDate}
        </Text>

        <Text style={s.h2}>Brand Health Overview</Text>
        <View style={s.card}>
          <Text style={s.body}>Brand alignment score: {report.brandAlignmentScore}/100</Text>
          {report.brandOpportunities ? <Text style={s.body}>{report.brandOpportunities}</Text> : null}
          {report.revenueImpactStatement ? <Text style={s.body}>{report.revenueImpactStatement}</Text> : null}
        </View>

        <Text style={s.h2}>Strategic Focus</Text>
        <View style={s.card}>
          {report.messagingGaps ? <Text style={s.bullet}>• Messaging: {report.messagingGaps}</Text> : null}
          {report.visibilityPlan ? <Text style={s.bullet}>• Visibility: {report.visibilityPlan}</Text> : null}
          {report.competitiveVulnerabilitySignal ? (
            <Text style={s.bullet}>• Competitive: {report.competitiveVulnerabilitySignal}</Text>
          ) : null}
          {report.marketingSpendAuditSignal ? (
            <Text style={s.bullet}>• Spend efficiency: {report.marketingSpendAuditSignal}</Text>
          ) : null}
        </View>

        <Text style={s.h2}>Positioning + Voice</Text>
        <View style={s.card}>
          {report.valuePropositionStatement?.statement ? (
            <Text style={s.body}>{report.valuePropositionStatement.statement}</Text>
          ) : null}
          {report.voiceToneGuide?.voiceSummary ? <Text style={s.body}>{report.voiceToneGuide.voiceSummary}</Text> : null}
        </View>

        <Text style={s.h2}>90-Day Priority Sequence</Text>
        <View style={s.card}>
          <Text style={s.body}>Next 30 days</Text>
          {roadmap30.length ? roadmap30.map((item, i) => <Text key={`r30-${i}`} style={s.bullet}>• {item}</Text>) : <Text style={s.bullet}>• Finalize messaging hierarchy and primary CTA sequence.</Text>}
          <Text style={{ ...s.body, marginTop: 6 }}>Next 60 days</Text>
          {roadmap60.length ? roadmap60.map((item, i) => <Text key={`r60-${i}`} style={s.bullet}>• {item}</Text>) : <Text style={s.bullet}>• Launch channel-aligned content across top priority surfaces.</Text>}
          <Text style={{ ...s.body, marginTop: 6 }}>Next 90 days</Text>
          {roadmap90.length ? roadmap90.map((item, i) => <Text key={`r90-${i}`} style={s.bullet}>• {item}</Text>) : <Text style={s.bullet}>• Review performance and optimize based on conversion data.</Text>}
        </View>
        <PdfFooter businessName={brandName} productName="WunderBrand Snapshot+™" showPageNumbers />
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}
