// app/lib/pdf/BrandSnapshotReport.tsx
// Premium, consulting-style PDF layout for Brand Snapshot™

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ------- BRAND FONTS -------- //
Font.register({
  family: "HelveticaNeue",
  fonts: [
    { src: "/fonts/HelveticaNeue-Regular.ttf" },
    { src: "/fonts/HelveticaNeue-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/HelveticaNeue-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "HelveticaNeue",
    fontSize: 12,
    color: "#0C1526",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 12,
    color: "#021859",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 8,
    color: "#021859",
    fontWeight: 600,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  scoreBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F2F7FF",
    borderLeft: "4px solid #07B0F2",
  },
  pillarBlock: {
    padding: 12,
    border: "1px solid #E1E5EE",
    borderRadius: 6,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 10,
    color: "#667085",
    textAlign: "center",
  },
});

type ReportPillar = { name: string; insight: string };
type BrandSnapshotPdfReport = {
  score: number | string;
  scoreLabel: string;
  pillars: ReportPillar[];
  recommendations: string;
};

export const BrandSnapshotReport = ({
  report,
}: {
  report: BrandSnapshotPdfReport;
}) => {
  const { score, scoreLabel, pillars, recommendations } = report;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* COVER */}
        <Text style={styles.title}>Your Brand Snapshot™ Report</Text>
        <Text style={styles.paragraph}>
          A personalized analysis of how confidently and consistently your brand
          shows up today — and where meaningful refinements can elevate clarity,
          trust, and growth.
        </Text>

        <View style={styles.scoreBox}>
          <Text style={{ fontSize: 20, fontWeight: 700 }}>{score}</Text>
          <Text>{scoreLabel}</Text>
        </View>

        {/* PILLARS */}
        <Text style={styles.sectionTitle}>Five Pillar Performance</Text>
        {pillars.map((p) => (
          <View style={styles.pillarBlock} key={p.name}>
            <Text style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</Text>
            <Text>{p.insight}</Text>
          </View>
        ))}

        {/* RECOMMENDATIONS */}
        <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
        <Text style={styles.paragraph}>{recommendations}</Text>

        <Text style={styles.footer}>
          Powered by Wunderbar Digital · © {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
};


