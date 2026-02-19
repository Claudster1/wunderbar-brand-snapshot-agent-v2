// 90-Day Brand Activation Plan — standalone document
// For: Implementation team, project managers, founders

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
  h3: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.55, marginBottom: 6 },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 10 },
  card: { backgroundColor: "#F8FAFC", borderRadius: 6, padding: 12, marginBottom: 8, border: "1 solid #E5E7EB" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: `3 solid ${pdfTheme.colors.blue}` },
  warnCard: { backgroundColor: "#FFFBEB", borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: "3 solid #F59E0B" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  checkItem: { fontSize: 10, marginBottom: 4, paddingLeft: 4 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function ActivationPlanDocument({ data, brandName }: Props) {
  const d = data;
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>90-Day Brand Activation Plan</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 30 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 40, fontSize: 8 }}>From your WunderBrand Blueprint™</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>90-Day Activation Plan — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>Brand Strategy One-Pager</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStrategyRollout?.brandStrategyOnePager}</Text></View>

        <Text style={s.h1}>Strategic Action Plan</Text>
        <Text style={s.body}>These are your top 5 strategic actions, prioritized by impact and effort. Execute in order.</Text>
        {d.strategicActionPlan?.map((a, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{i + 1}. {a.action}</Text>
              <View style={s.tag}><Text style={s.tagText}>{a.pillar}</Text></View>
            </View>
            <Text style={s.body}>{a.why}</Text>
            <Text style={s.label}>How To</Text>
            {a.howTo?.map((step, j) => <Text key={j} style={s.bullet}>• {step}</Text>)}
            <Text style={s.label}>Expected Outcome</Text>
            <Text style={s.body}>{a.outcome}</Text>
            <View style={s.row}>
              <View style={s.col3}><Text style={s.small}>Effort: {a.effort}</Text></View>
              <View style={s.col3}><Text style={s.small}>Impact: {a.impact}</Text></View>
              <View style={s.col3}><Text style={s.small}>Priority: {a.priority}</Text></View>
            </View>
          </View>
        ))}

        <Text style={s.h1}>How We Talk About Ourselves</Text>
        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStrategyRollout?.howWeTalkAboutOurselves?.elevatorPitch}</Text></View>
        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.cardTitle}>Approved Language</Text>
              {d.brandStrategyRollout?.howWeTalkAboutOurselves?.approvedLanguage?.map((l, i) => <Text key={i} style={s.bullet}>✓ {l}</Text>)}
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.warnCard}>
              <Text style={s.cardTitle}>Phrases to Avoid</Text>
              {d.brandStrategyRollout?.howWeTalkAboutOurselves?.phrasesToAvoid?.map((p, i) => <Text key={i} style={s.bullet}>✕ {p}</Text>)}
            </View>
          </View>
        </View>

        <Text style={s.h1}>Internal Rollout Talking Points</Text>
        <Text style={s.body}>Use these when presenting the brand strategy to your team.</Text>
        {d.brandStrategyRollout?.internalRolloutTalkingPoints?.map((tp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{tp.topic}</Text>
            <Text style={s.body}>{tp.whatToSay}</Text>
            <Text style={s.small}>Reference: {tp.whatToReference}</Text>
          </View>
        ))}

        <Text style={s.h1}>Measurement & KPIs</Text>
        <Text style={s.body}>{d.measurementFramework?.overview}</Text>
        <Text style={s.h2}>Leading Indicators (First 30-60 Days)</Text>
        {d.measurementFramework?.leadingIndicators?.map((li, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{li.indicator}</Text>
            <Text style={s.body}>{li.whatItMeans}</Text>
            <Text style={s.small}>Timeframe: {li.timeframe}</Text>
          </View>
        ))}
        <Text style={s.h2}>Key KPIs to Track</Text>
        {d.measurementFramework?.perSectionKPIs?.slice(0, 6).map((kpi, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{kpi.kpi}</Text>
            <Text style={s.body}>{kpi.recommendation}</Text>
            <Text style={s.small}>Target: {kpi.target} | Section: {kpi.section}</Text>
          </View>
        ))}

        <Text style={s.h1}>Execution Guardrails</Text>
        <Text style={s.label}>What to Maintain</Text>
        <Text style={s.body}>{d.executionGuardrails?.whatToMaintain}</Text>
        <Text style={s.label}>What to Avoid</Text>
        <View style={s.warnCard}><Text style={s.body}>{d.executionGuardrails?.whatToAvoid}</Text></View>
        <Text style={s.label}>Drift Indicators</Text>
        <Text style={s.body}>{d.executionGuardrails?.driftIndicators}</Text>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
