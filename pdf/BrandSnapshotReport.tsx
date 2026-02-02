// pdf/BrandSnapshotReport.tsx

import React from "react";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

/* ------------------------------------------------------
   FONTS
--------------------------------------------------------- */
Font.register({
  family: "HelveticaNeue",
  src: "https://fonts.gstatic.com/s/helveticaneue/v1/HelveticaNeue.ttf",
});

/* ------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "HelveticaNeue",
    color: "#0C1526",
    fontSize: 11,
  },

  h1: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 8,
    color: "#021859",
  },
  h2: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 24,
    marginBottom: 8,
    color: "#021859",
  },
  h3: {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 6,
    color: "#021859",
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.45,
    marginBottom: 8,
  },

  scoreBox: {
    border: "1pt solid #E0E3EA",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#F7FAFF",
  },

  scoreNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: "#021859",
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#677388",
  },

  pillarRow: {
    marginBottom: 12,
  },

  table: {
    width: "auto",
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E0E3EA",
    borderRadius: 4,
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    width: "25%",
    borderRight: "1pt solid #E0E3EA",
    backgroundColor: "#F2F4F9",
    padding: 6,
    fontSize: 10,
    fontWeight: 700,
  },
  tableCol: {
    width: "25%",
    padding: 6,
    borderRight: "1pt solid #E0E3EA",
    fontSize: 10,
  },

  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: "1pt solid #CCC",
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#7C8CA5",
    textAlign: "center",
  },

  ctaBox: {
    border: "1pt solid #D7E3FF",
    borderRadius: 10,
    padding: 20,
    marginTop: 26,
    backgroundColor: "#F5F8FF",
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#021859",
    marginBottom: 10,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 1.4,
  },
});

/* ------------------------------------------------------
   TYPES
--------------------------------------------------------- */

interface BrandSnapshotReportProps {
  reportId?: string;
  name?: string;
  businessName?: string;
  website?: string;
  brandAlignmentScore: number;
  scoreLabel?: string;
  summary?: string | null;
  opportunitiesSummary?: string | null;
  upgradeCta?: string | null;
  pillars: {
    positioning?: number;
    messaging?: number;
    visibility?: number;
    credibility?: number;
    conversion?: number;
  };
  insights: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
    [key: string]: string | undefined;
  };
  recommendations: Array<{
    title: string;
    description: string;
  }>;
  persona: {
    summary: string;
  };
  archetype: {
    summary: string;
  };
  brandPillars: Array<{
    name: string;
    description: string;
  }>;
  colorSystem: Array<{
    name: string;
    hex: string;
    role: string;
    meaning: string;
  }>;
}

/* ------------------------------------------------------
   DOCUMENT TEMPLATE
--------------------------------------------------------- */

export const BrandSnapshotReport = ({
  reportId,
  name,
  businessName,
  website,
  brandAlignmentScore,
  scoreLabel,
  summary,
  opportunitiesSummary,
  upgradeCta,
  pillars,
  insights,
  recommendations,
  persona,
  archetype,
  brandPillars,
  colorSystem,
}: BrandSnapshotReportProps) => (
  <Document>
    {/* ========================= PAGE 1 ========================= */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>Your Brand Snapshot™ Report</Text>
      {businessName ? (
        <Text style={styles.paragraph}>
          Prepared for {businessName}. This report is tailored to your answers
          — your score and recommendations are specific to your brand.
        </Text>
      ) : (
        <Text style={styles.paragraph}>
          This report summarizes your current brand foundation — how clearly,
          confidently, and consistently your business shows up in the market.
        </Text>
      )}

      {/* SCORE */}
      <View style={styles.scoreBox}>
        <Text style={styles.scoreNumber}>{brandAlignmentScore}</Text>
        <Text style={styles.scoreLabel}>Brand Alignment Score™</Text>
        <Text style={styles.paragraph}>{scoreLabel}</Text>
      </View>

      {summary ? (
        <>
          <Text style={styles.h2}>Summary</Text>
          <Text style={styles.paragraph}>{summary}</Text>
        </>
      ) : null}
      {opportunitiesSummary ? (
        <>
          <Text style={styles.h2}>Opportunities</Text>
          <Text style={styles.paragraph}>{opportunitiesSummary}</Text>
        </>
      ) : null}

      <Text style={styles.h2}>How Your Score Breaks Down</Text>

      {Object.entries(pillars).map(([pillar, score]) => {
        const pillarKey = pillar as keyof typeof insights;
        const insight = insights[pillarKey] || "No insight available.";
        return (
          <View style={styles.pillarRow} key={pillar}>
            <Text style={styles.h3}>
              {pillar.charAt(0).toUpperCase() + pillar.slice(1)} — {score}/20
            </Text>
            <Text style={styles.paragraph}>{insight}</Text>
          </View>
        );
      })}

      <View style={styles.footer}>
        Brand Snapshot™ and Brand Alignment Score™ are trademarks of Wunderbar
        Digital.
      </View>
    </Page>

    {/* ========================= PAGE 2 — RECOMMENDATIONS ========================= */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Your Priority Recommendations</Text>
      <Text style={[styles.paragraph, { marginBottom: 14 }]}>
        These recommendations are tailored to your snapshot and are designed to
        build credibility and improve your brand alignment.
      </Text>

      {recommendations.map((item, index) => (
        <View key={index}>
          <Text style={styles.h3}>{item.title}</Text>
          <Text style={styles.paragraph}>{item.description}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        © {new Date().getFullYear()} Wunderbar Digital
      </View>
    </Page>

    {/* ========================= PAGE 3 — BRAND FOUNDATIONS ========================= */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Your Brand Persona & Archetype</Text>

      <Text style={styles.h3}>Brand Persona</Text>
      <Text style={styles.paragraph}>{persona.summary}</Text>

      <Text style={styles.h3}>Archetype</Text>
      <Text style={styles.paragraph}>{archetype.summary}</Text>

      <Text style={styles.h2}>Brand Pillars</Text>

      {brandPillars.map((p, i) => (
        <View key={i}>
          <Text style={styles.h3}>{p.name}</Text>
          <Text style={styles.paragraph}>{p.description}</Text>
        </View>
      ))}

      <View style={styles.footer}>Wunderbar Digital</View>
    </Page>

    {/* ========================= PAGE 4 — COLOR SYSTEM ========================= */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Your Recommended Color System</Text>

      {/* Table header */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Color Name</Text>
          <Text style={styles.tableColHeader}>Hex</Text>
          <Text style={styles.tableColHeader}>Role</Text>
          <Text style={styles.tableColHeader}>Meaning</Text>
        </View>

        {colorSystem.map((c, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.tableCol}>{c.name}</Text>
            <View style={[styles.tableCol, { flexDirection: "row", gap: 6 }]}>
              <View style={[styles.colorSwatch, { backgroundColor: c.hex }]} />
              <Text>{c.hex}</Text>
            </View>
            <Text style={styles.tableCol}>{c.role}</Text>
            <Text style={styles.tableCol}>{c.meaning}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>Brand Snapshot™ Report</View>
    </Page>

    {/* ========================= PAGE 5 — SNAPSHOT+ CTA ========================= */}
    <Page size="A4" style={styles.page}>
      <View style={styles.ctaBox}>
        <Text style={styles.ctaTitle}>Continue Your Brand Transformation</Text>
        {upgradeCta ? (
          <Text style={styles.ctaText}>{upgradeCta}</Text>
        ) : (
          <>
            <Text style={styles.ctaText}>
              Get a full strategic brand analysis, custom positioning
              recommendations, and a roadmap tailored to your goals — all built
              from your Brand Snapshot™ data.
            </Text>
            <Text style={styles.ctaText}>
              Your report already uncovered the gaps. Snapshot+™ shows you
              exactly how to close them.
            </Text>
          </>
        )}
        <Text style={styles.ctaText}>
          Snapshot+™ includes expanded pillar breakdowns, actionable next steps,
          and credibility-building recommendations you can implement right away.
        </Text>
      </View>

      <View style={styles.footer}>Wunderbar Digital — Snapshot+™</View>
    </Page>
  </Document>
);
