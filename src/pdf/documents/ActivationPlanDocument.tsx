// 90-Day Brand Activation Plan — standalone document
// For: Implementation team, project managers, founders

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import { PdfHeader } from "../components/PdfHeader";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { parseHexAccent } from "@/src/pdf/lib/promptPackDisplay";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";


const s = StyleSheet.create({
  page: { padding: 48, paddingBottom: 92, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 18 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 14 },
  h3: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 10 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  warnCard: { backgroundColor: "#FFFBEB", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: "3 solid #F59E0B", border: "1 solid #FDE68A" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  roadmapCol: { width: "33%", paddingRight: 6 },
  roadmapCard: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 10, border: "1 solid #E2EAF5", minHeight: 170 },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  checkItem: { fontSize: 10, marginBottom: 4, paddingLeft: 4 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

function buildNinetyDayPhases(actions: BlueprintEngineOutput["strategicActionPlan"] | undefined) {
  const list = (actions ?? [])
    .filter((item) => typeof item?.action === "string" && item.action.trim().length > 0)
    .slice(0, 9);
  const fallback = [
    "Align core messaging hierarchy across homepage, service pages, and sales assets.",
    "Front-load trust signals and proof sequence on conversion-critical pages.",
    "Launch a recurring authority content cadence tied to brand pillars.",
    "Map offer-specific CTA paths and reduce friction in high-intent journeys.",
    "Operationalize voice and visual consistency checks for all outbound assets.",
    "Activate monthly KPI review and decision rituals to prevent brand drift.",
  ];
  const normalized = (list.length > 0 ? list : fallback.map((action) => ({ action } as any)));
  const chunk = Math.ceil(normalized.length / 3);

  return {
    next30: normalized.slice(0, chunk),
    next60: normalized.slice(chunk, chunk * 2),
    next90: normalized.slice(chunk * 2),
  };
}

export function ActivationPlanDocument({ data, brandName }: Props) {
  const d = data;
  const palette = d.visualDirection?.colorPalette as Array<{ hex?: string }> | undefined;
  const brandAccent = parseHexAccent(Array.isArray(palette) ? palette.map((entry) => entry?.hex).find(Boolean) : undefined) || pdfTheme.colors.blue;
  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const phases = buildNinetyDayPhases(d.strategicActionPlan);
  const primaryArchetype = d.brandArchetypeSystem?.primary;
  const archetypeIcon = getArchetypeIcon(primaryArchetype?.name || "");
  const archetypeMeaning = getArchetypeMeaning(primaryArchetype?.name || "");

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverTitle}>90-Day Brand Activation Plan</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <View style={{ width: 76, height: 3, borderRadius: 999, backgroundColor: brandAccent, marginTop: 10, marginBottom: 16 }} />
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{printedDate}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>From your WunderBrand Blueprint™</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Action Priorities"
        subtitle="One-page strategy anchor and prioritized execution plan."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>90-Day Activation Plan — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="90-Day Activation Plan" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Brand Strategy One-Pager</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStrategyRollout?.brandStrategyOnePager}</Text></View>
        {d.icpConversionIntelligenceFramework?.overview ? (
          <View style={s.card}>
            <Text style={s.label}>ICP Conversion Intelligence Backbone</Text>
            <Text style={s.small}>{d.icpConversionIntelligenceFramework.overview}</Text>
          </View>
        ) : null}

        <Text style={s.h1}>30 / 60 / 90 Day Deliverables</Text>
        <Text style={s.body}>Phase execution in sequence so each month compounds the previous month&apos;s progress.</Text>
        <View style={s.row} wrap={false}>
          <View style={s.roadmapCol}>
            <View style={s.roadmapCard}>
              <Text style={s.label}>Next 30 Days</Text>
              {phases.next30.map((a, i) => (
                <Text key={`30-${i}`} style={s.bullet}>• {a.action}</Text>
              ))}
            </View>
          </View>
          <View style={s.roadmapCol}>
            <View style={s.roadmapCard}>
              <Text style={s.label}>Next 60 Days</Text>
              {phases.next60.map((a, i) => (
                <Text key={`60-${i}`} style={s.bullet}>• {a.action}</Text>
              ))}
            </View>
          </View>
          <View style={s.roadmapCol}>
            <View style={s.roadmapCard}>
              <Text style={s.label}>Next 90 Days</Text>
              {phases.next90.map((a, i) => (
                <Text key={`90-${i}`} style={s.bullet}>• {a.action}</Text>
              ))}
            </View>
          </View>
        </View>

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
      </Page>

      <SectionDividerPage
        label="Section"
        title="Rollout Messaging"
        subtitle="Approved language, talking points, and communication guardrails."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>90-Day Activation Plan — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="90-Day Activation Plan" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>How We Talk About Ourselves</Text>
        {(primaryArchetype?.name || archetypeMeaning) && (
          <View style={s.accentCard} wrap={false}>
            <Text style={s.label}>Archetype Activation Lens</Text>
            <Text style={s.cardTitle}>
              {archetypeIcon ? `${archetypeIcon} ` : ""}
              {primaryArchetype?.name || "Brand Archetype"}
            </Text>
            <Text style={s.body}>{archetypeMeaning || primaryArchetype?.whenAligned}</Text>
            <Text style={s.small}>{primaryArchetype?.riskIfMisused}</Text>
          </View>
        )}
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
      </Page>

      <SectionDividerPage
        label="Section"
        title="Measurement and Guardrails"
        subtitle="KPI tracking, leading indicators, and brand drift prevention."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>90-Day Activation Plan — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="90-Day Activation Plan" businessName={brandName} date={printedDate} accentHex={brandAccent} />

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
