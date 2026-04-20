// Executive Summary — 2-4 page standalone document
// For: Leadership, stakeholders, board members

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
  h1: { fontSize: 20, fontWeight: "bold", color: "#021859", marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 6, marginTop: 14 },
  h3: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 10 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bullet: { fontSize: 10, lineHeight: 1.5, marginBottom: 3, paddingLeft: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col5: { width: "20%", paddingRight: 4 },
  pillarBar: { height: 6, borderRadius: 3, marginTop: 3, marginBottom: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 6 },
  chipText: { fontSize: 8, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.6 },
  roadmapCol: { width: "33%", paddingRight: 6 },
  roadmapCard: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 10, border: "1 solid #E2EAF5", minHeight: 150 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

const pillarLabels: Record<string, string> = { positioning: "Positioning", messaging: "Messaging", visibility: "Visibility", credibility: "Credibility", conversion: "Conversion" };

function getScoreColor(score: number) {
  if (score >= 16) return "#22C55E";
  if (score >= 12) return "#FACC15";
  return "#EF4444";
}

function getScoreBand(score: number) {
  if (score >= 16) return "Strong";
  if (score >= 12) return "Emerging";
  return "Needs Attention";
}

function getScoreBandPalette(score: number) {
  if (score >= 16) return { bg: "#DCFCE7", fg: "#166534" };
  if (score >= 12) return { bg: "#FEF9C3", fg: "#854D0E" };
  return { bg: "#FEE2E2", fg: "#991B1B" };
}

function buildNinetyDayPhases(actions: BlueprintEngineOutput["strategicActionPlan"] | undefined) {
  const list = (actions ?? []).filter((item) => typeof item?.action === "string" && item.action.trim().length > 0);
  const fallback = [
    "Align messaging hierarchy across homepage, services pages, and outbound.",
    "Implement proof and trust sequencing on high-intent conversion pages.",
    "Create a repeatable content and channel cadence anchored to core pillars.",
    "Standardize voice and visual guardrails across internal and partner teams.",
    "Launch KPI tracking across visibility, credibility, and conversion moments.",
    "Operationalize a monthly strategy review to prevent brand drift.",
  ];
  const normalized = (list.length > 0 ? list : fallback.map((action) => ({ action } as any))).slice(0, 6);

  return {
    next30: normalized.slice(0, 2),
    next60: normalized.slice(2, 4),
    next90: normalized.slice(4, 6),
  };
}

function truncate(text: string | undefined, maxChars: number) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1).trim()}…`;
}

interface Props { data: BlueprintEngineOutput; brandName: string; userName?: string }

export function ExecutiveSummaryDocument({ data, brandName, userName }: Props) {
  const d = data;
  const palette = d.visualDirection?.colorPalette as Array<{ hex?: string }> | undefined;
  const brandAccent = parseHexAccent(Array.isArray(palette) ? palette.map((entry) => entry?.hex).find(Boolean) : undefined) || pdfTheme.colors.blue;
  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const primaryArchetype = d.brandArchetypeSystem?.primary;
  const secondaryArchetype = d.brandArchetypeSystem?.secondary;
  const primaryIcon = getArchetypeIcon(primaryArchetype?.name || "");
  const secondaryIcon = getArchetypeIcon(secondaryArchetype?.name || "");
  const primaryMeaning = getArchetypeMeaning(primaryArchetype?.name || "");
  const secondaryMeaning = getArchetypeMeaning(secondaryArchetype?.name || "");
  const phases = buildNinetyDayPhases(d.strategicActionPlan);
  const primaryIcp = d.audiencePersonas?.primaryICP;
  const secondaryIcp = d.audiencePersonas?.secondaryICP;
  const personaHighlights = (d.buyerPersonas || []).slice(0, 2);
  const topMessagingPillars = (d.messagingPillars || []).slice(0, 3);
  const proofPoints = (d.messagingSystem?.proofPoints || []).slice(0, 4);
  const topObjections = [
    ...(primaryIcp?.objections || []),
    ...(secondaryIcp?.objections || []),
  ].slice(0, 3);
  const valueProposition =
    d.valuePropositionStatement?.statement ||
    d.messagingSystem?.coreMessage ||
    d.brandFoundation?.differentiationNarrative;

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverTitle}>Executive Summary</Text>
        <Text style={s.coverSub}>{brandName} — WunderBrand Blueprint™</Text>
        <View style={{ width: 76, height: 3, borderRadius: 999, backgroundColor: brandAccent, marginTop: 10, marginBottom: 16 }} />
        <View style={{ marginTop: 26 }}>
          {userName && <Text style={s.coverMeta}>Prepared for {userName}</Text>}
          <Text style={s.coverMeta}>{printedDate}</Text>
        </View>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>CONFIDENTIAL</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Brand Health Snapshot"
        subtitle="Score, pillar performance, and immediate strategic focus."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page}>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Executive Summary — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="Executive Summary" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Brand Health at a Glance</Text>
        <Text style={s.body}>{d.executiveSummary?.industryBenchmark}</Text>
        <Text style={s.body}>{d.executiveSummary?.synthesis}</Text>
        <Text style={s.body}>{d.executiveSummary?.diagnosis}</Text>

        <Text style={s.h2}>Pillar Signal Overview</Text>
        <View style={s.row}>
          {pillars.map((key) => {
            const score = d.pillarDeepDives?.[key]?.score || 0;
            const band = getScoreBand(score);
            const palette = getScoreBandPalette(score);
            return (
              <View key={key} style={s.col5}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: pdfTheme.colors.navy }}>{pillarLabels[key]}</Text>
                <View style={{ ...s.chip, backgroundColor: palette.bg }}>
                  <Text style={{ ...s.chipText, color: palette.fg }}>{band}</Text>
                </View>
                <View style={{ ...s.pillarBar, backgroundColor: "#E5E7EB" }}>
                  <View style={{ ...s.pillarBar, width: `${(score / 20) * 100}%`, backgroundColor: getScoreColor(score), position: "absolute", top: 0, left: 0 }} />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.h2}>Priority Focus Areas</Text>
        <View style={s.row} wrap={false}>
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
        <View style={s.row} wrap={false}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Primary Archetype</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy }}>
                {primaryIcon ? `${primaryIcon} ` : ""}{primaryArchetype?.name}
              </Text>
              <Text style={s.body}>{primaryMeaning || primaryArchetype?.whenAligned}</Text>
              <Text style={s.small}>{primaryArchetype?.riskIfMisused}</Text>
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.card}>
              <Text style={s.label}>Secondary Archetype</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy }}>
                {secondaryIcon ? `${secondaryIcon} ` : ""}{secondaryArchetype?.name}
              </Text>
              <Text style={s.body}>{secondaryMeaning || secondaryArchetype?.whenAligned}</Text>
              <Text style={s.small}>{secondaryArchetype?.riskIfMisused}</Text>
            </View>
          </View>
        </View>
        <Text style={s.body}>{d.brandArchetypeSystem?.howTheyWorkTogether}</Text>

        <Text style={s.h2}>Stakeholder Narrative</Text>
        <Text style={s.label}>Business Context</Text>
        <View style={s.card}>
          <Text style={s.bullet}>• Problem: {d.executiveSummary?.diagnosis}</Text>
          <Text style={s.bullet}>• Opportunity: {d.executiveSummary?.primaryFocusArea}</Text>
          <Text style={s.bullet}>• Strategic intent: {d.priorityDiagnosis?.primary?.whatImproves}</Text>
        </View>

        <Text style={s.label}>Positioning + Value Proposition</Text>
        <View style={s.accentCard}>
          <Text style={s.body}>{d.brandFoundation?.positioningStatement}</Text>
          {valueProposition ? <Text style={s.small}>Value proposition: {valueProposition}</Text> : null}
        </View>

        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.card}>
          <Text style={s.body}>{d.brandStory?.elevatorPitch}</Text>
        </View>

        <Text style={s.label}>Company Description (Boilerplate)</Text>
        <View style={s.card}>
          <Text style={s.body}>
            {truncate(
              d.companyDescription?.shortDescription ||
                d.companyDescription?.oneLiner ||
                d.brandStrategyRollout?.howWeTalkAboutOurselves?.companyDescriptions,
              500,
            )}
          </Text>
        </View>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Priority Actions"
        subtitle="Top strategic moves and leadership-ready messaging."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page}>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Executive Summary — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="Executive Summary" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h2}>ICP + Persona Snapshot</Text>
        <View style={s.row} wrap={false}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Primary ICP</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 }}>
                {primaryIcp?.name || "Primary customer segment"}
              </Text>
              <Text style={s.small}>{truncate(primaryIcp?.summary, 220)}</Text>
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.card}>
              <Text style={s.label}>Secondary ICP</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 }}>
                {secondaryIcp?.name || "Secondary customer segment"}
              </Text>
              <Text style={s.small}>{truncate(secondaryIcp?.summary, 220)}</Text>
            </View>
          </View>
        </View>
        {personaHighlights.length > 0 && (
          <View style={s.card}>
            <Text style={s.label}>Persona Highlights</Text>
            {personaHighlights.map((persona, index) => (
              <Text key={`persona-${index}`} style={s.bullet}>
                • {persona.personaName}: {truncate(persona.messagingAngle, 120)}
              </Text>
            ))}
          </View>
        )}

        <Text style={s.h2}>Messaging Pillars + Proof</Text>
        <View style={s.card}>
          {topMessagingPillars.length > 0 ? (
            topMessagingPillars.map((pillar, index) => (
              <Text key={`pillar-${index}`} style={s.bullet}>
                • {pillar.name}: {truncate(pillar.whatItCommunicates, 120)}
              </Text>
            ))
          ) : (
            <Text style={s.bullet}>• Core message: {truncate(d.messagingSystem?.coreMessage, 140)}</Text>
          )}
        </View>
        <View style={s.card}>
          <Text style={s.label}>Proof Points</Text>
          {proofPoints.length > 0 ? (
            proofPoints.map((proof, index) => (
              <Text key={`proof-${index}`} style={s.bullet}>
                • {truncate(proof, 140)}
              </Text>
            ))
          ) : (
            <Text style={s.bullet}>• Add 2-3 customer outcomes and measurable credibility markers.</Text>
          )}
        </View>
        {topObjections.length > 0 && (
          <View style={s.card}>
            <Text style={s.label}>Top Buyer Objections</Text>
            {topObjections.map((objection, index) => (
              <Text key={`obj-${index}`} style={s.bullet}>
                • {truncate(objection, 120)}
              </Text>
            ))}
          </View>
        )}

        <Text style={s.h2}>Top 3 Strategic Actions</Text>
        {d.strategicActionPlan?.slice(0, 3).map((a, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy }}>{i + 1}. {a.action}</Text>
            <Text style={s.body}>{a.outcome}</Text>
            <Text style={s.small}>Pillar: {a.pillar} | Priority: {a.priority}</Text>
          </View>
        ))}

        <Text style={s.h2}>90-Day Leadership Rollout</Text>
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
            <View style={{ ...s.roadmapCard, paddingRight: 6 }}>
              <Text style={s.label}>Next 90 Days</Text>
              {phases.next90.map((a, i) => (
                <Text key={`90-${i}`} style={s.bullet}>• {a.action}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 6 }} wrap={false}>
          <Text style={s.small}>
            This brief is designed for leadership and stakeholder alignment. For execution details and channel-level buildouts,
            use your full Blueprint report, Workbook, and Activation deliverables.
          </Text>
        </View>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
