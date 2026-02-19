// Executive Summary — 2-4 page standalone document
// For: Leadership, stakeholders, board members

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
  h1: { fontSize: 22, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 10 },
  h2: { fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 6, marginTop: 16 },
  h3: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.55, marginBottom: 6 },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 10 },
  card: { backgroundColor: "#F8FAFC", borderRadius: 6, padding: 12, marginBottom: 8, border: "1 solid #E5E7EB" },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: `3 solid ${pdfTheme.colors.blue}` },
  scoreBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: pdfTheme.colors.blue, justifyContent: "center", alignItems: "center", marginRight: 12 },
  scoreNum: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col5: { width: "20%", paddingRight: 4 },
  pillarBar: { height: 6, borderRadius: 3, marginTop: 3, marginBottom: 8 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

const pillarLabels: Record<string, string> = { positioning: "Positioning", messaging: "Messaging", visibility: "Visibility", credibility: "Credibility", conversion: "Conversion" };

function getScoreColor(score: number) {
  if (score >= 16) return "#22C55E";
  if (score >= 12) return "#FACC15";
  return "#EF4444";
}

interface Props { data: BlueprintEngineOutput; brandName: string; userName?: string }

export function ExecutiveSummaryDocument({ data, brandName, userName }: Props) {
  const d = data;
  const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Executive Summary</Text>
        <Text style={s.coverSub}>{brandName} — WunderBrand Blueprint™</Text>
        <View style={{ marginTop: 30 }}>
          {userName && <Text style={s.coverMeta}>Prepared for {userName}</Text>}
          <Text style={s.coverMeta}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        </View>
        <Text style={{ ...s.coverMeta, marginTop: 40, fontSize: 8 }}>CONFIDENTIAL</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Executive Summary — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>Brand Health at a Glance</Text>
        <View style={s.scoreRow}>
          <View style={s.scoreBadge}><Text style={s.scoreNum}>{d.executiveSummary?.brandAlignmentScore}</Text></View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy }}>WunderBrand Score™</Text>
            <Text style={s.small}>{d.executiveSummary?.industryBenchmark}</Text>
          </View>
        </View>

        <Text style={s.body}>{d.executiveSummary?.synthesis}</Text>
        <Text style={s.body}>{d.executiveSummary?.diagnosis}</Text>

        <Text style={s.h2}>Pillar Scores</Text>
        <View style={s.row}>
          {pillars.map((key) => {
            const score = d.pillarDeepDives?.[key]?.score || 0;
            return (
              <View key={key} style={s.col5}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: pdfTheme.colors.navy }}>{pillarLabels[key]}</Text>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: getScoreColor(score) }}>{score}</Text>
                <View style={{ ...s.pillarBar, backgroundColor: "#E5E7EB" }}>
                  <View style={{ ...s.pillarBar, width: `${(score / 20) * 100}%`, backgroundColor: getScoreColor(score), position: "absolute", top: 0, left: 0 }} />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.h2}>Priority Focus Areas</Text>
        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Primary</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 }}>{d.executiveSummary?.primaryFocusArea}</Text>
              <Text style={s.body}>{d.priorityDiagnosis?.primary?.whyFocus}</Text>
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.card}>
              <Text style={s.label}>Secondary</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 }}>{d.executiveSummary?.secondaryFocusArea}</Text>
              <Text style={s.body}>{d.priorityDiagnosis?.secondary?.whyFocus}</Text>
            </View>
          </View>
        </View>

        <Text style={s.h2}>Brand Archetype</Text>
        <View style={s.card}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy }}>
            {d.brandArchetypeSystem?.primary?.name} / {d.brandArchetypeSystem?.secondary?.name}
          </Text>
          <Text style={s.body}>{d.brandArchetypeSystem?.howTheyWorkTogether}</Text>
        </View>

        <Text style={s.h2}>Brand Foundation</Text>
        <Text style={s.label}>Mission</Text>
        <Text style={s.body}>{d.brandFoundation?.mission}</Text>
        <Text style={s.label}>Vision</Text>
        <Text style={s.body}>{d.brandFoundation?.vision}</Text>
        <Text style={s.label}>Positioning</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandFoundation?.positioningStatement}</Text></View>

        <Text style={s.h2}>Top 3 Strategic Actions</Text>
        {d.strategicActionPlan?.slice(0, 3).map((a, i) => (
          <View key={i} style={s.card}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy }}>{i + 1}. {a.action}</Text>
            <Text style={s.body}>{a.outcome}</Text>
            <Text style={s.small}>Pillar: {a.pillar} | Priority: {a.priority}</Text>
          </View>
        ))}

        <Text style={s.h2}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStory?.elevatorPitch}</Text></View>

        <View style={{ marginTop: 16, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 6 }}>
          <Text style={s.small}>This is a summary of your complete WunderBrand Blueprint™. The full report includes 42 strategic sections covering messaging, audience personas, competitive positioning, channel strategies, AI prompts, and implementation roadmaps.</Text>
        </View>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
