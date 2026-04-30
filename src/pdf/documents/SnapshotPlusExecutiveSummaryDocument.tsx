import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { BrandSnapshotPlusReport } from "@/src/pdf/BrandSnapshotPlusPDF";
import { pdfTheme } from "@/src/pdf/theme";
import { DisclaimerPage } from "@/src/pdf/components/DisclaimerPage";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#1F2937",
    lineHeight: 1.6,
  },
  h1: { fontSize: 22, fontWeight: 700, color: "#021859", marginBottom: 8 },
  h2: { fontSize: 12, fontWeight: 700, color: "#021859", marginTop: 14, marginBottom: 6 },
  body: { fontSize: 10.5, marginBottom: 6 },
  small: { fontSize: 9, color: "#6B7280", marginBottom: 4 },
  card: {
    border: "1 solid #E5E7EB",
    borderLeft: `3 solid ${pdfTheme.colors.blue}`,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#F8FBFF",
  },
  bullet: { fontSize: 10, marginBottom: 3 },
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
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const roadmap30 = splitPoints(report.roadmap_30);
  const roadmap60 = splitPoints(report.roadmap_60);
  const roadmap90 = splitPoints(report.roadmap_90);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Snapshot+ Executive Summary</Text>
        <Text style={s.small}>
          {report.businessName} | Prepared for {report.userName || "Leadership"} | {reportDate}
        </Text>

        <Text style={s.h2}>Brand Health Overview</Text>
        <View style={s.card}>
          <Text style={s.body}>Brand alignment score: {report.brandAlignmentScore}/100</Text>
          {report.brandOpportunities ? <Text style={s.body}>{report.brandOpportunities}</Text> : null}
          {report.revenueImpactStatement ? <Text style={s.body}>{report.revenueImpactStatement}</Text> : null}
        </View>

        <Text style={s.h2}>Strategic Focus</Text>
        <View style={s.card}>
          {report.messagingGaps ? <Text style={s.bullet}>- Messaging: {report.messagingGaps}</Text> : null}
          {report.visibilityPlan ? <Text style={s.bullet}>- Visibility: {report.visibilityPlan}</Text> : null}
          {report.competitiveVulnerabilitySignal ? (
            <Text style={s.bullet}>- Competitive: {report.competitiveVulnerabilitySignal}</Text>
          ) : null}
          {report.marketingSpendAuditSignal ? (
            <Text style={s.bullet}>- Spend efficiency: {report.marketingSpendAuditSignal}</Text>
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
          {roadmap30.length ? roadmap30.map((item, i) => <Text key={`r30-${i}`} style={s.bullet}>- {item}</Text>) : <Text style={s.bullet}>- Finalize messaging hierarchy and primary CTA sequence.</Text>}
          <Text style={{ ...s.body, marginTop: 6 }}>Next 60 days</Text>
          {roadmap60.length ? roadmap60.map((item, i) => <Text key={`r60-${i}`} style={s.bullet}>- {item}</Text>) : <Text style={s.bullet}>- Launch channel-aligned content across top priority surfaces.</Text>}
          <Text style={{ ...s.body, marginTop: 6 }}>Next 90 days</Text>
          {roadmap90.length ? roadmap90.map((item, i) => <Text key={`r90-${i}`} style={s.bullet}>- {item}</Text>) : <Text style={s.bullet}>- Review performance and optimize based on conversion data.</Text>}
        </View>

        <Text style={s.footer}>WunderBrand Snapshot+ Executive Summary</Text>
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}
