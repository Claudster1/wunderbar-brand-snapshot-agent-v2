// Complete WunderBrand Blueprint™ Report — Master Document
// Renders all engine sections organized into 6 parts.
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Link } from "@react-pdf/renderer";
import { pdfTheme, colors } from "../theme";
import {
  ILLUSTRATION_AFTER,
  ILLUSTRATION_BEFORE,
  SEMANTIC_DONT,
  SEMANTIC_DO,
  EXAMPLE_CALLOUT,
} from "../reportVisualTokens";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { normalizePromptItemForPdf } from "@/src/pdf/lib/promptPackDisplay";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";


const s = StyleSheet.create({
  page: { padding: 42, paddingBottom: 92, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  coverPage: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  coverLogo: { width: 120, marginBottom: 40, opacity: 0.9 },
  coverTitle: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 32 },
  coverMeta: { fontSize: 10, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 4 },

  tocPage: { padding: 42, paddingBottom: 92, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A" },
  tocTitle: { fontSize: 24, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 24 },
  tocPart: { fontSize: 13, fontWeight: "bold", color: pdfTheme.colors.navy, marginTop: 16, marginBottom: 6 },
  tocItem: { fontSize: 10, color: "#4B5563", paddingLeft: 12, marginBottom: 3, lineHeight: 1.6 },

  partDivider: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  partNumber: { fontSize: 14, color: pdfTheme.colors.aqua, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 },
  partTitle: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 8 },
  partDesc: { fontSize: 11, color: "#FFFFFF", textAlign: "center", opacity: 0.7, maxWidth: 400 },

  h1: { fontSize: 20, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 20 },
  h2: { fontSize: 14, fontWeight: "bold", color: "#021859", marginBottom: 6, marginTop: 15 },
  h3: { fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4, marginTop: 14 },
  h4: { fontSize: 10, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: "#0D5BD7", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 3, marginTop: 10 },

  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  warnCard: { backgroundColor: "#FFFBEB", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: "3 solid #F59E0B", border: "1 solid #FDE68A" },

  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  scoreBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: pdfTheme.colors.blue, justifyContent: "center", alignItems: "center", marginRight: 10 },
  scoreNum: { fontSize: 14, fontWeight: "bold", color: "#FFFFFF" },
  scoreLabel: { fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy },

  row: { flexDirection: "row", marginBottom: 4 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 8 },

  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  swatch: { width: 20, height: 20, borderRadius: 4, marginRight: 6, border: "1 solid #E5E7EB" },
  swatchRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },

  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },

  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, marginBottom: 3 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },

  table: { marginBottom: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", borderBottom: "1 solid #E5E7EB", paddingVertical: 4, paddingHorizontal: 6 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #F3F4F6", paddingVertical: 4, paddingHorizontal: 6 },
  tableCell: { fontSize: 9, lineHeight: 1.4 },
  tableCellBold: { fontSize: 9, fontWeight: "bold", lineHeight: 1.4 },
});

function Footer({ brandName }: { brandName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>WunderBrand Blueprint™ — {brandName}</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return <>{items?.map((item, i) => <Text key={i} style={s.bullet}>• {item}</Text>)}</>;
}

type ProseBlock = { type: "paragraph"; text: string } | { type: "ul"; items: string[] } | { type: "ol"; items: string[] };

function parseProseBlocks(raw: string): ProseBlock[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: ProseBlock[] = [];
  let para: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  const ulPattern = /^\s*[-*•]\s+(.+)$/;
  const olPattern = /^\s*\d+[.)]\s+(.+)$/;

  const flushPara = () => {
    const text = para.join("\n").trim();
    if (text) out.push({ type: "paragraph", text });
    para = [];
  };
  const flushList = () => {
    if (listKind && listItems.length > 0) {
      out.push(listKind === "ul" ? { type: "ul", items: [...listItems] } : { type: "ol", items: [...listItems] });
    }
    listKind = null;
    listItems = [];
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushList();
      flushPara();
      continue;
    }
    const ul = line.match(ulPattern);
    if (ul?.[1]) {
      flushPara();
      if (listKind && listKind !== "ul") flushList();
      listKind = "ul";
      listItems.push(ul[1].trim());
      continue;
    }
    const ol = line.match(olPattern);
    if (ol?.[1]) {
      flushPara();
      if (listKind && listKind !== "ol") flushList();
      listKind = "ol";
      listItems.push(ol[1].trim());
      continue;
    }
    flushList();
    para.push(line.trimEnd());
  }
  flushList();
  flushPara();
  return out;
}

function BodyRichText({ text }: { text: unknown }) {
  const value = typeof text === "string" ? text.trim() : "";
  if (!value) return null;
  const blocks = parseProseBlocks(value);
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "paragraph") return <Text key={`p-${i}`} style={s.body}>{block.text}</Text>;
        if (block.type === "ul") return <Bullets key={`ul-${i}`} items={block.items} />;
        return <Bullets key={`ol-${i}`} items={block.items.map((item, idx) => `${idx + 1}. ${item}`)} />;
      })}
    </>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <View style={s.tagsRow}>
      {items?.map((t, i) => <View key={i} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
    </View>
  );
}

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
  userName?: string;
}

export function CompleteBlueprintDocument({ data, brandName, userName }: Props) {
  const d = data;
  const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const pillarLabels: Record<string, string> = { positioning: "Positioning", messaging: "Messaging", visibility: "Visibility", credibility: "Credibility", conversion: "Conversion" };

  return (
    <Document>
      {/* ═══ COVER ═══ */}
      <Page size="A4" style={s.coverPage}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.coverLogo} />
        <Text style={s.coverTitle}>WunderBrand Blueprint™</Text>
        <Text style={s.coverSubtitle}>Your Complete Brand Operating System</Text>
        <View style={{ marginTop: 30 }}>
          <Text style={s.coverMeta}>Prepared for {brandName}</Text>
          {userName && <Text style={s.coverMeta}>Requested by {userName}</Text>}
          <Text style={s.coverMeta}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        </View>
        <Text style={{ ...s.coverMeta, marginTop: 44, fontSize: 8 }}>CONFIDENTIAL — For internal use only</Text>
      </Page>

      {/* ═══ TABLE OF CONTENTS ═══ */}
      <Page size="A4" style={s.tocPage}>
        <Text style={s.tocTitle}>What's Inside</Text>

        <Text style={s.tocPart}>Part I — Diagnostic & Insights</Text>
        <Text style={s.tocItem}>Executive Summary & WunderBrand Score™</Text>
        <Text style={s.tocItem}>Priority Diagnosis</Text>
        <Text style={s.tocItem}>Pillar Deep Dives (5 pillars)</Text>
        <Text style={s.tocItem}>Strategic Alignment Overview</Text>
        <Text style={s.tocItem}>Brand Archetype System</Text>
        <Text style={s.tocItem}>Strategic Action Plan</Text>

        <Text style={s.tocPart}>Part II — Brand Foundation</Text>
        <Text style={s.tocItem}>Value Proposition Statement</Text>
        <Text style={s.tocItem}>Brand Foundation (Mission, Vision, Brand Values)</Text>
        <Text style={s.tocItem}>Voice & Tone Guide</Text>
        <Text style={s.tocItem}>Brand Story & Origin Narrative</Text>
        <Text style={s.tocItem}>Brand Persona & Communication Style</Text>
        <Text style={s.tocItem}>Audience Personas & ICPs</Text>
        <Text style={s.tocItem}>Buyer Personas</Text>

        <Text style={s.tocPart}>Part III — Messaging & Content</Text>
        <Text style={s.tocItem}>Messaging System</Text>
        <Text style={s.tocItem}>Messaging Pillars</Text>
        <Text style={s.tocItem}>Content Pillars</Text>
        <Text style={s.tocItem}>Tagline Recommendations</Text>
        <Text style={s.tocItem}>Company Descriptions & Boilerplate</Text>

        <Text style={s.tocPart}>Part IV — Strategy & Channels</Text>
        <Text style={s.tocItem}>Competitive Positioning Map</Text>
        <Text style={s.tocItem}>Customer Journey Map</Text>
        <Text style={s.tocItem}>SEO & Keyword Strategy</Text>
        <Text style={s.tocItem}>AEO & AI Search Strategy</Text>
        <Text style={s.tocItem}>Email Marketing Strategy</Text>
        <Text style={s.tocItem}>Social Media Platform Strategy</Text>
        <Text style={s.tocItem}>Conversion Strategy</Text>
        <Text style={s.tocItem}>Credibility & Trust Signal Strategy</Text>
        <Text style={s.tocItem}>Website Copy Direction</Text>
        <Text style={s.tocItem}>Value & Pricing Communication</Text>
        <Text style={s.tocItem}>Sales Conversation Guide</Text>

        <Text style={s.tocPart}>Part V — Implementation & Action Plan</Text>
        <Text style={s.tocItem}>90-Day Brand Strategy Rollout</Text>
        <Text style={s.tocItem}>Brand Consistency Checklist</Text>
        <Text style={s.tocItem}>Measurement & KPI Framework</Text>
        <Text style={s.tocItem}>Brand Health Scorecard</Text>
        <Text style={s.tocItem}>SWOT Analysis</Text>
        <Text style={s.tocItem}>Brand Rules & Terminology Guide</Text>
        <Text style={s.tocItem}>Visual Direction & Brand Imagery</Text>

        <Text style={s.tocPart}>Part VI — AI Prompt Library</Text>
        <Text style={s.tocItem}>Foundational Prompt Pack (8 prompts)</Text>
        <Text style={s.tocItem}>Execution Prompt Pack (8 prompts)</Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PART I — DIAGNOSTIC & INSIGHTS
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part I</Text>
        <Text style={s.partTitle}>Diagnostic & Insights</Text>
        <Text style={s.partDesc}>Where {brandName} stands today — scored, analyzed, and benchmarked.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Executive Summary"
        subtitle="Brand score, benchmark context, and immediate focus areas."
      />

      {/* Executive Summary */}
      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Executive Summary</Text>

        <View style={s.scoreRow}>
          <View style={s.scoreBadge}><Text style={s.scoreNum}>{d.executiveSummary?.brandAlignmentScore}</Text></View>
          <View>
            <Text style={s.scoreLabel}>WunderBrand Score™</Text>
            <Text style={s.small}>{d.executiveSummary?.industryBenchmark}</Text>
          </View>
        </View>

        <Text style={s.body}>{d.executiveSummary?.synthesis}</Text>
        <Text style={s.body}>{d.executiveSummary?.diagnosis}</Text>

        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Primary Focus</Text>
              <Text style={{ ...s.body, fontWeight: "bold" }}>{d.executiveSummary?.primaryFocusArea}</Text>
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Secondary Focus</Text>
              <Text style={{ ...s.body, fontWeight: "bold" }}>{d.executiveSummary?.secondaryFocusArea}</Text>
            </View>
          </View>
        </View>

        {/* Priority Diagnosis */}
        <Text style={s.h2}>Priority Diagnosis</Text>
        <View style={s.card}>
          <Text style={s.cardTitle}>Primary: {d.executiveSummary?.primaryFocusArea}</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.primary?.whyFocus}</Text>
          <Text style={s.label}>Downstream Issues</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.primary?.downstreamIssues}</Text>
          <Text style={s.label}>What Improves</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.primary?.whatImproves}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Secondary: {d.executiveSummary?.secondaryFocusArea}</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.secondary?.whyFocus}</Text>
          <Text style={s.label}>Downstream Issues</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.secondary?.downstreamIssues}</Text>
          <Text style={s.label}>What Improves</Text>
          <Text style={s.body}>{d.priorityDiagnosis?.secondary?.whatImproves}</Text>
        </View>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Pillar Deep Dives"
        subtitle="Detailed diagnostics for positioning, messaging, visibility, credibility, and conversion."
      />

      {/* Pillar Deep Dives */}
      {pillars.map((key) => {
        const p = d.pillarDeepDives?.[key];
        if (!p) return null;
        return (
          <Page key={key} size="A4" style={s.page} wrap>
            <Footer brandName={brandName} />
            <View style={s.scoreRow}>
              <View style={s.scoreBadge}><Text style={s.scoreNum}>{p.score}</Text></View>
              <Text style={s.h1}>{pillarLabels[key]}</Text>
            </View>

            <Text style={s.body}>{p.interpretation}</Text>

            <Text style={s.label}>What's Happening Now</Text>
            <Text style={s.body}>{p.whatsHappeningNow}</Text>

            <Text style={s.label}>Why It Matters Commercially</Text>
            <Text style={s.body}>{p.whyItMattersCommercially}</Text>

            <Text style={s.label}>Industry Context</Text>
            <Text style={s.body}>{p.industryContext}</Text>

            <Text style={s.label}>Financial Impact</Text>
            <View style={s.warnCard}><Text style={s.body}>{p.financialImpact}</Text></View>

            <Text style={s.label}>Risk of Inaction</Text>
            <View style={s.warnCard}><Text style={s.body}>{p.riskOfInaction}</Text></View>

            <Text style={s.label}>Before / After</Text>
            <View style={s.row}>
              <View style={s.col2}>
                <View
                  style={{
                    ...s.card,
                    borderLeft: `3 solid ${ILLUSTRATION_BEFORE.border}`,
                    backgroundColor: ILLUSTRATION_BEFORE.bg,
                  }}
                >
                  <Text style={{ ...s.h4, color: ILLUSTRATION_BEFORE.label }}>Before</Text>
                  <Text style={s.body}>{p.concreteExample?.before}</Text>
                </View>
              </View>
              <View style={s.col2}>
                <View
                  style={{
                    ...s.card,
                    borderLeft: `3 solid ${ILLUSTRATION_AFTER.border}`,
                    backgroundColor: ILLUSTRATION_AFTER.bg,
                  }}
                >
                  <Text style={{ ...s.h4, color: ILLUSTRATION_AFTER.label }}>After</Text>
                  <Text style={s.body}>{p.concreteExample?.after}</Text>
                </View>
              </View>
            </View>

            <Text style={s.label}>Strategic Recommendation</Text>
            <View style={s.accentCard}><Text style={s.body}>{p.strategicRecommendation}</Text></View>

            <Text style={s.label}>Success Looks Like</Text>
            <Text style={s.body}>{p.successLooksLike}</Text>
          </Page>
        );
      })}

      <SectionDividerPage
        label="Section"
        title="Strategic Alignment"
        subtitle="Cross-pillar conflicts, archetype guidance, and system-level recommendations."
      />

      {/* Strategic Alignment + Archetype + Action Plan */}
      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Strategic Alignment</Text>
        <Text style={s.body}>{d.strategicAlignment?.summary}</Text>
        {d.strategicAlignment?.reinforcements?.length > 0 && (
          <>
            <Text style={s.label}>Reinforcements</Text>
            {d.strategicAlignment.reinforcements.map((r, i) => (
              <View key={i} style={s.card}><Text style={s.cardTitle}>{r.pillars}</Text><Text style={s.body}>{r.insight}</Text></View>
            ))}
          </>
        )}
        {d.strategicAlignment?.conflicts?.length > 0 && (
          <>
            <Text style={s.label}>Conflicts</Text>
            {d.strategicAlignment.conflicts.map((c, i) => (
              <View key={i} style={s.warnCard}><Text style={s.cardTitle}>{c.pillars}</Text><Text style={s.body}>{c.insight}</Text></View>
            ))}
          </>
        )}
        <Text style={s.label}>System Recommendation</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.strategicAlignment?.systemRecommendation}</Text></View>

        <Text style={s.h1}>Brand Archetype System</Text>
        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.label}>Primary Archetype</Text>
              <Text style={s.cardTitle}>{d.brandArchetypeSystem?.primary?.name}</Text>
              <Text style={s.body}>{d.brandArchetypeSystem?.primary?.whenAligned}</Text>
              <Text style={s.label}>Risk if Misused</Text>
              <Text style={s.small}>{d.brandArchetypeSystem?.primary?.riskIfMisused}</Text>
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.card}>
              <Text style={s.label}>Secondary Archetype</Text>
              <Text style={s.cardTitle}>{d.brandArchetypeSystem?.secondary?.name}</Text>
              <Text style={s.body}>{d.brandArchetypeSystem?.secondary?.whenAligned}</Text>
              <Text style={s.label}>Risk if Misused</Text>
              <Text style={s.small}>{d.brandArchetypeSystem?.secondary?.riskIfMisused}</Text>
            </View>
          </View>
        </View>
        <Text style={s.body}>{d.brandArchetypeSystem?.howTheyWorkTogether}</Text>

        <Text style={s.h1}>Strategic Action Plan</Text>
        {d.strategicActionPlan?.map((a, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{i + 1}. {a.action}</Text>
              <View style={s.tag}><Text style={s.tagText}>{a.pillar}</Text></View>
            </View>
            <Text style={s.body}>{a.why}</Text>
            <Text style={s.label}>How To</Text>
            <Bullets items={a.howTo} />
            <View style={s.row}>
              <View style={s.col3}><Text style={s.small}>Effort: {a.effort}</Text></View>
              <View style={s.col3}><Text style={s.small}>Impact: {a.impact}</Text></View>
              <View style={s.col3}><Text style={s.small}>Priority: {a.priority}</Text></View>
            </View>
          </View>
        ))}
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PART II — BRAND FOUNDATION
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part II</Text>
        <Text style={s.partTitle}>Brand Foundation</Text>
        <Text style={s.partDesc}>Who {brandName} is at its core — purpose, story, persona, and audience.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Brand Foundation"
        subtitle="Mission, vision, values, story, and positioning core."
      />

      {/* Value Proposition Statement */}
      {d.valuePropositionStatement?.statement && (
        <Page size="A4" style={s.page} wrap>
          <Footer brandName={brandName} />
          <Text style={s.h1}>Value Proposition Statement</Text>
          <View style={s.accentCard}>
            <Text style={{ ...s.body, fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy }}>
              {d.valuePropositionStatement.statement}
            </Text>
          </View>
          <Text style={s.label}>Where to Use It</Text>
          <Text style={s.body}>{d.valuePropositionStatement.whereToUseIt}</Text>
          <Text style={s.label}>Why This Works</Text>
          <Text style={s.body}>{d.valuePropositionStatement.whyThisWorks}</Text>
        </Page>
      )}

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Brand Foundation</Text>

        <Text style={s.label}>Mission</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandFoundation?.mission}</Text></View>

        <Text style={s.label}>Vision</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandFoundation?.vision}</Text></View>

        <Text style={s.label}>Brand Purpose</Text>
        <Text style={s.body}>{d.brandFoundation?.brandPurpose}</Text>

        <Text style={s.label}>Brand Promise</Text>
        <Text style={s.body}>{d.brandFoundation?.brandPromise}</Text>

        <Text style={s.label}>Positioning Statement</Text>
        <View style={s.card}><Text style={s.body}>{d.brandFoundation?.positioningStatement}</Text></View>

        <Text style={s.label}>Differentiation Narrative</Text>
        <Text style={s.body}>{d.brandFoundation?.differentiationNarrative}</Text>

        <Text style={s.h2}>Brand Values</Text>
        {(d.brandFoundation?.brandValues ?? d.brandFoundation?.values)?.map((v, i) => {
          const bv = v as { name: string; description: string; inAction?: string; whyItMatters?: string };
          return (
            <View key={i} style={s.card} wrap={false}>
              <Text style={s.cardTitle}>{bv.name}</Text>
              <Text style={s.body}>{bv.description}</Text>
              {bv.inAction ? (
                <View style={{ marginTop: 6 }}><Text style={s.h4}>In Action</Text><Text style={s.body}>{bv.inAction}</Text></View>
              ) : null}
              {bv.whyItMatters ? (
                <View style={{ marginTop: 6 }}><Text style={s.h4}>Why It Matters</Text><Text style={s.body}>{bv.whyItMatters}</Text></View>
              ) : null}
            </View>
          );
        })}

        <Text style={s.h1}>Brand Story</Text>
        <Text style={{ ...s.h3, fontStyle: "italic", color: "#4B5563" }}>{d.brandStory?.headline}</Text>
        <Text style={s.body}>{d.brandStory?.narrative}</Text>

        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStory?.elevatorPitch}</Text></View>

        <Text style={s.label}>Founder Story</Text>
        <Text style={s.body}>{d.brandStory?.founderStory}</Text>
      </Page>

      {/* Voice & Tone Guide */}
      {d.voiceToneGuide && (
        <>
        <SectionDividerPage
          label="Section"
          title="Voice and Tone Guide"
          subtitle="Language standards to keep brand expression consistent across channels."
        />
        <Page size="A4" style={s.page} wrap>
          <Footer brandName={brandName} />
          <Text style={s.h1}>Voice & Tone Guide</Text>
          <Text style={s.body}>{d.voiceToneGuide.voiceSummary}</Text>

          {d.voiceToneGuide.voiceTraits?.map((vt, i) => (
            <View key={i} style={s.card} wrap={false}>
              <Text style={s.cardTitle}>{vt.trait}</Text>
              <Text style={s.body}>{vt.whatItMeans}</Text>
              <Text style={{ ...s.small, fontWeight: 700, color: EXAMPLE_CALLOUT.labelColor, marginTop: 4 }}>
                {EXAMPLE_CALLOUT.labelPrefix}
              </Text>
              <Text style={{ ...s.body, fontStyle: "italic", color: EXAMPLE_CALLOUT.bodyColor }}>{vt.example}</Text>
            </View>
          ))}

          <Text style={s.h2}>Tone by Channel</Text>
          <Text style={s.label}>Website & Marketing</Text>
          <Text style={s.body}>{d.voiceToneGuide.toneVariations?.websiteAndMarketing}</Text>
          <Text style={s.label}>Social Media</Text>
          <Text style={s.body}>{d.voiceToneGuide.toneVariations?.socialMedia}</Text>
          <Text style={s.label}>Email & Sales</Text>
          <Text style={s.body}>{d.voiceToneGuide.toneVariations?.emailAndSales}</Text>

          {d.voiceToneGuide.phrasesToUse?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={s.h3}>Phrases to Use</Text>
              {d.voiceToneGuide.phrasesToUse.map((p, i) => (
                <Text key={i} style={{ ...s.body, color: SEMANTIC_DO.label }}>✓ {p}</Text>
              ))}
            </View>
          )}

          {d.voiceToneGuide.phrasesToAvoid?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={s.h3}>Phrases to Avoid</Text>
              {d.voiceToneGuide.phrasesToAvoid.map((p, i) => (
                <Text key={i} style={{ ...s.body, color: SEMANTIC_DONT.label }}>✗ {p}</Text>
              ))}
            </View>
          )}

          {d.voiceToneGuide.aiPromptInstruction && (
            <View style={{ marginTop: 12 }}>
              <Text style={s.h3}>AI Prompt Instruction</Text>
              <View style={s.accentCard}>
                <Text style={s.body}>{d.voiceToneGuide.aiPromptInstruction}</Text>
              </View>
            </View>
          )}
        </Page>
        </>
      )}

      {/* Brand Persona */}
      <SectionDividerPage
        label="Section"
        title="Brand Persona"
        subtitle="Identity, behavior, and channel-ready communication examples."
      />
      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Brand Persona</Text>
        <Text style={s.body}>{d.brandPersona?.personaSummary}</Text>

        <Text style={s.label}>Core Identity</Text>
        <View style={s.card}>
          <Text style={s.h4}>Who You Are</Text>
          <Text style={s.body}>{d.brandPersona?.coreIdentity?.whoYouAre}</Text>
          <Text style={s.h4}>What You Stand For</Text>
          <Text style={s.body}>{d.brandPersona?.coreIdentity?.whatYouStandFor}</Text>
          <Text style={s.h4}>How You Show Up</Text>
          <Text style={s.body}>{d.brandPersona?.coreIdentity?.howYouShowUp}</Text>
        </View>

        <Text style={s.label}>Communication Style</Text>
        <View style={s.row}>
          <View style={s.col3}><View style={s.card}><Text style={s.h4}>Tone</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.tone}</Text></View></View>
          <View style={s.col3}><View style={s.card}><Text style={s.h4}>Pace</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.pace}</Text></View></View>
          <View style={s.col3}><View style={s.card}><Text style={s.h4}>Energy</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.energy}</Text></View></View>
        </View>

        <Text style={s.h2}>Messaging Examples</Text>
        {(["headlines", "ctaButtons", "socialPosts"] as const).map((cat) => (
          <View key={cat} style={s.row}>
            <View style={s.col2}>
              <View
                style={{
                  ...s.card,
                  borderLeft: `3 solid ${SEMANTIC_DO.border}`,
                  backgroundColor: SEMANTIC_DO.bg,
                }}
              >
                <Text style={{ ...s.h4, color: SEMANTIC_DO.label }}>
                  {cat === "ctaButtons" ? "CTA Buttons" : cat === "socialPosts" ? "Social Posts" : "Headlines"} — Do this
                </Text>
                <Bullets items={d.brandPersona?.messagingExamples?.[cat]?.use || []} />
              </View>
            </View>
            <View style={s.col2}>
              <View
                style={{
                  ...s.card,
                  borderLeft: `3 solid ${SEMANTIC_DONT.border}`,
                  backgroundColor: SEMANTIC_DONT.bg,
                }}
              >
                <Text style={{ ...s.h4, color: SEMANTIC_DONT.label }}>
                  {cat === "ctaButtons" ? "CTA Buttons" : cat === "socialPosts" ? "Social Posts" : "Headlines"} — Not this
                </Text>
                <Bullets items={d.brandPersona?.messagingExamples?.[cat]?.avoid || []} />
              </View>
            </View>
          </View>
        ))}
      </Page>

      {/* Audience & ICPs */}
      <SectionDividerPage
        label="Section"
        title="Audience and Buyer Personas"
        subtitle="Labeled ICPs (segments) and buyer personas (people inside each segment)."
      />
      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Ideal Customer Profiles</Text>
        <View style={{ ...s.warnCard, marginBottom: 12 }}>
          <Text style={s.body}>
            <Text style={{ fontWeight: 700 }}>ICP vs. personas: </Text>
            An ideal customer profile (ICP) describes a strategic segment — who you prioritize (e.g. company
            size, industry, or consumer cohort). Buyer personas are named individuals inside that segment who
            discover, evaluate, and buy. Every persona&apos;s &quot;ICP alignment&quot; tag must match exactly
            one ICP label in this section.
          </Text>
        </View>

        {(["primaryICP", "secondaryICP"] as const).map((icpKey) => {
          const icp = d.audiencePersonas?.[icpKey];
          if (!icp) return null;
          const defaultLabel =
            icpKey === "primaryICP" ? "Primary ICP — best-fit segment" : "Secondary ICP — adjacent or expansion segment";
          return (
            <View key={icpKey} style={s.card} wrap={false}>
              <Text style={s.label}>{icp.icpLabel?.trim() || defaultLabel}</Text>
              <Text style={s.cardTitle}>{icp.name}</Text>
              <Text style={s.body}>{icp.summary}</Text>
              <View style={s.row}>
                <View style={s.col2}><Text style={s.h4}>Demographics</Text><Text style={s.body}>{icp.demographics}</Text></View>
                <View style={s.col2}><Text style={s.h4}>Psychographics</Text><Text style={s.body}>{icp.psychographics}</Text></View>
              </View>
              <Text style={s.h4}>Pain Points</Text>
              <Bullets items={icp.painPoints || []} />
              <Text style={s.h4}>Goals</Text>
              <Text style={s.body}>{icp.goals}</Text>
              <Text style={s.h4}>Buying Journey</Text>
              <Text style={s.body}>{icp.buyingJourney}</Text>
              <Text style={s.h4}>Language They Use</Text>
              <Text style={{ ...s.body, fontStyle: "italic" }}>{icp.languageTheyUse}</Text>
              <Text style={s.h4}>Where to Be Findable</Text>
              <Text style={s.body}>{icp.whereToBeFindable}</Text>
            </View>
          );
        })}

        {(d.audiencePersonas?.additionalICPs || []).map((icp, idx) => (
          <View key={`additional-icp-${idx}`} style={s.card} wrap={false}>
            <Text style={s.label}>{icp.icpLabel?.trim() || `Additional ICP ${idx + 1}`}</Text>
            <Text style={s.cardTitle}>{icp.name}</Text>
            <Text style={s.body}>{icp.summary}</Text>
            <View style={s.row}>
              <View style={s.col2}>
                <Text style={s.h4}>Demographics</Text>
                <Text style={s.body}>{icp.demographics}</Text>
              </View>
              <View style={s.col2}>
                <Text style={s.h4}>Psychographics</Text>
                <Text style={s.body}>{icp.psychographics}</Text>
              </View>
            </View>
            <Text style={s.h4}>Pain Points</Text>
            <Bullets items={icp.painPoints || []} />
            <Text style={s.h4}>Goals</Text>
            <Text style={s.body}>{icp.goals}</Text>
            <Text style={s.h4}>Buying Journey</Text>
            <Text style={s.body}>{icp.buyingJourney}</Text>
            <Text style={s.h4}>Language They Use</Text>
            <Text style={{ ...s.body, fontStyle: "italic" }}>{icp.languageTheyUse}</Text>
            <Text style={s.h4}>Where to Be Findable</Text>
            <Text style={s.body}>{icp.whereToBeFindable}</Text>
          </View>
        ))}

        {d.audiencePersonas?.audienceTransitionPlan && (
          <>
            <Text style={s.h2}>Audience Transition Plan</Text>
            <View style={s.warnCard}>
              <Text style={s.body}>{d.audiencePersonas.audienceTransitionPlan.gapDiagnosis}</Text>
              <Text style={s.label}>Repositioning Steps</Text>
              <Bullets items={d.audiencePersonas.audienceTransitionPlan.repositioningSteps || []} />
            </View>
          </>
        )}

        <Text style={s.h1}>Buyer Personas</Text>
        <Text style={{ ...s.body, marginBottom: 10, color: "#4B5563" }}>
          Tags show which ICP this persona belongs to — use the same wording as the ICP labels above.
        </Text>
        {d.buyerPersonas?.map((bp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{bp.personaName}</Text>
              <View style={s.tag}><Text style={s.tagText}>ICP: {bp.icpAlignment}</Text></View>
            </View>
            <Text style={s.small}>{bp.role}</Text>
            <Text style={s.h4}>Core Frustration</Text>
            <Text style={s.body}>{bp.coreFrustration}</Text>
            <Text style={s.h4}>Messaging Angle</Text>
            <View style={s.accentCard}><Text style={s.body}>{bp.messagingAngle}</Text></View>
            <View style={s.row}>
              <View style={s.col2}><Text style={s.h4}>Sample Headline</Text><Text style={{ ...s.body, fontStyle: "italic" }}>"{bp.sampleHeadline}"</Text></View>
              <View style={s.col2}><Text style={s.h4}>Sample CTA</Text><Text style={{ ...s.body, fontStyle: "italic" }}>"{bp.sampleCTA}"</Text></View>
            </View>
          </View>
        ))}
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PART III — MESSAGING & CONTENT
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part III</Text>
        <Text style={s.partTitle}>Messaging & Content</Text>
        <Text style={s.partDesc}>What {brandName} says, how it says it, and the content system behind it.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Messaging System"
        subtitle="Core narrative, proof architecture, and channel message structure."
      />

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Messaging System</Text>
        <Text style={s.label}>Core Message</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.messagingSystem?.coreMessage}</Text></View>
        <Text style={s.label}>Supporting Messages</Text>
        <Bullets items={d.messagingSystem?.supportingMessages || []} />
        <Text style={s.label}>Proof Points</Text>
        <Bullets items={d.messagingSystem?.proofPoints || []} />
        <Text style={s.label}>What Not to Say</Text>
        {d.messagingSystem?.whatNotToSay?.map((item, i) => (
          <Text key={i} style={{ ...s.bullet, color: SEMANTIC_DONT.label }}>✕ {item}</Text>
        ))}

        <Text style={s.h1}>Messaging Pillars</Text>
        {d.messagingPillars?.map((mp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{mp.name}</Text>
            <Text style={s.body}>{mp.whatItCommunicates}</Text>
            <Text style={s.label}>Why It Matters</Text>
            <Text style={s.body}>{mp.whyItMatters}</Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: EXAMPLE_CALLOUT.labelColor,
                marginBottom: 3,
                marginTop: 10,
              }}
            >
              {EXAMPLE_CALLOUT.labelPrefix}
            </Text>
            <Text style={{ ...s.body, fontStyle: "italic", color: EXAMPLE_CALLOUT.bodyColor }}>"{mp.exampleMessage}"</Text>
            <Text style={s.label}>Channel Examples</Text>
            <View style={s.row}>
              <View style={s.col3}><Text style={s.h4}>Website</Text><Text style={s.small}>{mp.channelExamples?.website}</Text></View>
              <View style={s.col3}><Text style={s.h4}>Social</Text><Text style={s.small}>{mp.channelExamples?.social}</Text></View>
              <View style={s.col3}><Text style={s.h4}>Email</Text><Text style={s.small}>{mp.channelExamples?.email}</Text></View>
            </View>
          </View>
        ))}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Content and Taglines"
        subtitle="Content pillars, narrative themes, and approved tagline options."
      />

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Messaging Pillars</Text>
        <Text style={s.body}>Use this section for content planning and campaign briefing.</Text>
        <Text style={s.h1}>Content Pillars</Text>
        {d.contentPillars?.map((cp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{cp.name}</Text>
            <Text style={s.body}>{cp.description}</Text>
            <Text style={s.h4}>Example Topics</Text>
            <Bullets items={cp.exampleTopics || []} />
            <Text style={s.h4}>Suggested Formats</Text>
            <Tags items={cp.suggestedFormats || []} />
            <Text style={s.small}>Reinforces: {cp.messagingPillarConnection}</Text>
          </View>
        ))}

        <Text style={s.h1}>Tagline Recommendations</Text>
        {d.taglineRecommendations?.map((t, i) => (
          <View key={i} style={s.accentCard} wrap={false}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 }}>"{t.tagline}"</Text>
            <Text style={s.body}>{t.rationale}</Text>
            <Text style={s.small}>Best used on: {t.bestUsedOn} | Tone: {t.tone}</Text>
          </View>
        ))}

        <Text style={s.h1}>Company Descriptions</Text>
        <Text style={s.label}>One-Liner</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.companyDescription?.oneLiner}</Text></View>
        <Text style={s.label}>Short Description</Text>
        <Text style={s.body}>{d.companyDescription?.shortDescription}</Text>
        <Text style={s.label}>Full Boilerplate</Text>
        <Text style={s.body}>{d.companyDescription?.fullBoilerplate}</Text>
        <Text style={s.label}>Proposal Intro</Text>
        <Text style={s.body}>{d.companyDescription?.proposalIntro}</Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PART IV — STRATEGY & CHANNELS
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part IV</Text>
        <Text style={s.partTitle}>Strategy & Channels</Text>
        <Text style={s.partDesc}>How {brandName} competes, reaches its audience, and converts.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Competitive Positioning"
        subtitle="Market map, trade-offs, whitespace, and category strategy."
      />

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>Competitive Positioning</Text>
        <View style={s.card}>
          <Text style={s.h4}>Axis 1: {d.competitivePositioning?.positioningAxis1?.label}</Text>
          <Text style={s.small}>{d.competitivePositioning?.positioningAxis1?.lowEnd} ←→ {d.competitivePositioning?.positioningAxis1?.highEnd}</Text>
          <Text style={s.h4}>Axis 2: {d.competitivePositioning?.positioningAxis2?.label}</Text>
          <Text style={s.small}>{d.competitivePositioning?.positioningAxis2?.lowEnd} ←→ {d.competitivePositioning?.positioningAxis2?.highEnd}</Text>
        </View>
        {d.competitivePositioning?.players?.map((p, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{p.name}</Text>
            <Text style={s.small}>Position: {p.position?.x} / {p.position?.y}</Text>
            <Text style={s.body}>{p.narrative}</Text>
          </View>
        ))}
        <Text style={s.label}>Strategic Whitespace</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.competitivePositioning?.strategicWhitespace}</Text></View>
        <Text style={s.label}>Differentiation Summary</Text>
        <Text style={s.body}>{d.competitivePositioning?.differentiationSummary}</Text>
        <Text style={s.label}>Vulnerabilities</Text>
        <View style={s.warnCard}><Text style={s.body}>{d.competitivePositioning?.vulnerabilities}</Text></View>

        <Text style={s.h1}>Strategic Trade-Offs</Text>
        {d.strategicTradeOffs?.map((t, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{t.decision}</Text>
            <View style={s.row}>
              <View style={s.col2}>
                <Text style={s.h4}>{t.optionA?.label}</Text>
                <Bullets items={t.optionA?.pros?.map(p => `+ ${p}`) || []} />
                <Bullets items={t.optionA?.cons?.map(c => `- ${c}`) || []} />
              </View>
              <View style={s.col2}>
                <Text style={s.h4}>{t.optionB?.label}</Text>
                <Bullets items={t.optionB?.pros?.map(p => `+ ${p}`) || []} />
                <Bullets items={t.optionB?.cons?.map(c => `- ${c}`) || []} />
              </View>
            </View>
            <View style={s.accentCard}><Text style={s.body}>{t.recommendation}</Text></View>
            <Text style={s.small}>Revisit when: {t.revisitWhen}</Text>
          </View>
        ))}

        {/* Customer Journey */}
        <Text style={s.h1}>Customer Journey Map</Text>
        <BodyRichText text={d.customerJourneyMap?.overview} />
        {d.customerJourneyMap?.stages?.map((stage, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{stage.stage}</Text>
            <Text style={s.h4}>Customer Mindset</Text>
            <BodyRichText text={stage.customerMindset} />
            <Text style={s.h4}>Key Questions</Text>
            <Bullets items={stage.keyQuestions || []} />
            <Text style={s.h4}>Touchpoints</Text>
            <Tags items={stage.touchpoints || []} />
            <Text style={s.h4}>Messaging Focus</Text>
            <BodyRichText text={stage.messagingFocus} />
            <Text style={s.small}>Conversion Trigger: {stage.conversionTrigger} | KPI: {stage.kpiToTrack}</Text>
          </View>
        ))}
      </Page>

      {/* SEO, AEO, Email, Social, Conversion, Pricing, Sales */}
      <SectionDividerPage
        label="Section"
        title="Channel and Conversion Strategy"
        subtitle="Search, email, social, conversion, pricing, and sales execution guidance."
      />
      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>SEO & Keyword Strategy</Text>
        <BodyRichText text={d.seoStrategy?.overview} />
        <Text style={s.h3}>Primary Keywords</Text>
        {d.seoStrategy?.primaryKeywords?.map((kw, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{kw.keyword}</Text>
              <View style={s.tagsRow}><View style={s.tag}><Text style={s.tagText}>{kw.intent}</Text></View><View style={s.tag}><Text style={s.tagText}>{kw.difficulty}</Text></View></View>
            </View>
            <BodyRichText text={kw.contentAngle} />
            <Text style={s.small}>Pillar: {kw.pillarConnection}</Text>
          </View>
        ))}
        <Text style={s.h3}>Long-Tail Opportunities</Text>
        {d.seoStrategy?.longTailOpportunities?.map((lt, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{lt.keyword}</Text>
            <BodyRichText text={lt.contentRecommendation} />
          </View>
        ))}
        <Text style={s.label}>Technical Priorities</Text>
        <Bullets items={d.seoStrategy?.technicalPriorities || []} />
        <Text style={s.label}>Content SEO Playbook</Text>
        <View style={s.accentCard}><BodyRichText text={d.seoStrategy?.contentSEOPlaybook} /></View>

        <Text style={s.h1}>AEO & AI Search Strategy</Text>
        <BodyRichText text={d.aeoStrategy?.overview} />
        <Text style={s.h3}>Entity Optimization</Text>
        <BodyRichText text={d.aeoStrategy?.entityOptimization?.currentEntityStatus} />
        <Bullets items={d.aeoStrategy?.entityOptimization?.entityBuildingActions || []} />
        <Text style={s.h3}>Content for AI Citation</Text>
        <BodyRichText text={d.aeoStrategy?.contentForAICitation?.strategy} />
        <Bullets items={d.aeoStrategy?.contentForAICitation?.formatRecommendations || []} />
        <Text style={s.h3}>Priority FAQs</Text>
        <Bullets items={d.aeoStrategy?.faqStrategy?.priorityFAQs || []} />

        <Text style={s.h1}>Email Marketing Strategy</Text>
        <BodyRichText text={d.emailMarketingFramework?.overview} />
        <Text style={s.h3}>Welcome Sequence</Text>
        {d.emailMarketingFramework?.welcomeSequence?.emails?.map((e, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{e.subject}</Text>
              <View style={s.tag}><Text style={s.tagText}>{e.timing}</Text></View>
            </View>
            <BodyRichText text={e.keyMessage} />
            <Text style={s.small}>{e.purpose}</Text>
          </View>
        ))}
        <Text style={s.label}>Subject Line Formulas</Text>
        <Bullets items={d.emailMarketingFramework?.subjectLineFormulas || []} />
        <Text style={s.small}>Send Cadence: {d.emailMarketingFramework?.sendCadence}</Text>

        <Text style={s.h1}>Social Media Strategy</Text>
        <BodyRichText text={d.socialMediaStrategy?.overview} />
        {d.socialMediaStrategy?.platforms?.map((p, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{p.platform}</Text>
            <BodyRichText text={p.whyThisPlatform} />
            <Text style={s.h4}>Content Strategy</Text>
            <BodyRichText text={p.contentStrategy} />
            <Text style={s.h4}>Example Posts</Text>
            <Bullets items={p.examplePosts || []} />
            {p.exampleImagePrompts && p.exampleImagePrompts.length > 0 ? (
              <>
                <Text style={s.h4}>Image Prompts</Text>
                <Bullets items={p.exampleImagePrompts} />
              </>
            ) : null}
            {p.exampleVideoPrompts && p.exampleVideoPrompts.length > 0 ? (
              <>
                <Text style={s.h4}>Video Prompts</Text>
                <Bullets items={p.exampleVideoPrompts} />
              </>
            ) : null}
            <Text style={s.small}>Frequency: {p.postingFrequency} | Mix: {p.contentMix} | KPI: {p.kpiToTrack}</Text>
          </View>
        ))}

        <Text style={s.h1}>Conversion Strategy</Text>
        <Text style={s.label}>How Trust Is Built</Text>
        <BodyRichText text={d.conversionStrategy?.howTrustIsBuilt} />
        <Text style={s.label}>How Clarity Drives Action</Text>
        <BodyRichText text={d.conversionStrategy?.howClarityDrivesAction} />
        <Text style={s.h3}>CTA Hierarchy</Text>
        {d.conversionStrategy?.ctaHierarchy?.map((cta, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{cta.level}</Text>
            <BodyRichText text={cta.action} />
            <Text style={s.small}>{cta.context}</Text>
          </View>
        ))}

        {/* Credibility & Trust Signal Strategy */}
        {d.credibilityStrategy && (
          <>
            <Text style={s.h1}>Credibility & Trust Signal Strategy</Text>
            <BodyRichText text={d.credibilityStrategy.overview} />

            <Text style={s.h2}>Proof Points to Create</Text>
            {d.credibilityStrategy.proofPointsToCreate?.map((pp, i) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{pp.proofPoint}</Text>
                <Text style={s.small}>Type: {pp.type} | Priority: {pp.priority}</Text>
                <BodyRichText text={pp.howToGet} />
                <Text style={s.small}>Display: {pp.whereToDisplay}</Text>
              </View>
            ))}

            <Text style={s.h2}>Testimonial Strategy</Text>
            <Text style={s.label}>Who to Ask</Text>
            <BodyRichText text={d.credibilityStrategy.testimonialStrategy?.whoToAsk} />
            <Text style={s.label}>How to Ask</Text>
            <BodyRichText text={d.credibilityStrategy.testimonialStrategy?.howToAsk} />
            <Text style={s.label}>What to Capture</Text>
            <BodyRichText text={d.credibilityStrategy.testimonialStrategy?.whatToCapture} />
            <Text style={s.label}>Where to Place</Text>
            <BodyRichText text={d.credibilityStrategy.testimonialStrategy?.whereToPlace} />

            <Text style={s.h2}>Authority Signals</Text>
            {d.credibilityStrategy.authoritySignals?.map((as_, i) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{as_.signal}</Text>
                <BodyRichText text={as_.impact} />
                <Text style={s.small}>Timeline: {as_.timeline}</Text>
              </View>
            ))}

            {d.credibilityStrategy.trustGaps && (
              <>
                <Text style={s.h2}>Trust Gaps</Text>
                <View style={s.accentCard}><BodyRichText text={d.credibilityStrategy.trustGaps} /></View>
              </>
            )}
          </>
        )}

        {/* Website Copy Direction */}
        {d.websiteCopyDirection && (
          <>
            <Text style={s.h1}>Website Copy Direction</Text>
            <BodyRichText text={d.websiteCopyDirection.overview} />

            <Text style={s.h2}>Homepage</Text>
            <Text style={s.label}>Hero Headline</Text>
            <View style={s.accentCard}><Text style={{ ...s.body, fontSize: 14, fontWeight: "bold" }}>{d.websiteCopyDirection.homepage?.heroHeadline}</Text></View>
            <Text style={s.label}>Hero Subheadline</Text>
            <BodyRichText text={d.websiteCopyDirection.homepage?.heroSubheadline} />
            <Text style={s.label}>CTA Button</Text>
            <View style={s.card}><BodyRichText text={d.websiteCopyDirection.homepage?.heroCtaButton} /></View>
            <Text style={s.label}>Value Proposition Section</Text>
            <BodyRichText text={d.websiteCopyDirection.homepage?.valuePropSection} />
            <Text style={s.label}>Social Proof Placement</Text>
            <BodyRichText text={d.websiteCopyDirection.homepage?.socialProofPlacement} />

            <Text style={s.h2}>About Page</Text>
            <Text style={s.label}>Opening Hook</Text>
            <View style={s.accentCard}><BodyRichText text={d.websiteCopyDirection.aboutPage?.openingHook} /></View>
            <Text style={s.label}>Story Framework</Text>
            <BodyRichText text={d.websiteCopyDirection.aboutPage?.storyFramework} />
            <Text style={s.label}>Team Positioning</Text>
            <BodyRichText text={d.websiteCopyDirection.aboutPage?.teamPositioning} />

            <Text style={s.h2}>Services Page</Text>
            <Text style={s.label}>Page Structure</Text>
            <BodyRichText text={d.websiteCopyDirection.servicesPage?.pageStructure} />
            <Text style={s.label}>Service Framework</Text>
            <BodyRichText text={d.websiteCopyDirection.servicesPage?.serviceFramework} />
            <Text style={s.label}>Pricing Language</Text>
            <BodyRichText text={d.websiteCopyDirection.servicesPage?.pricingLanguage} />

            {d.websiteCopyDirection.copyPrinciples?.length > 0 && (
              <>
                <Text style={s.h2}>Copy Principles</Text>
                {d.websiteCopyDirection.copyPrinciples.map((cp, i) => (
                  <View key={i} style={s.card} wrap={false}>
                    <Text style={s.cardTitle}>{cp.principle}</Text>
                    <BodyRichText text={cp.example} />
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <Text style={s.h1}>Value & Pricing Communication</Text>
        <Text style={s.label}>Pricing Positioning</Text>
        <View style={s.accentCard}><BodyRichText text={d.valuePricingFramework?.pricingPositioningStatement} /></View>
        <Text style={s.label}>Value Narrative</Text>
        <BodyRichText text={d.valuePricingFramework?.valueNarrative} />
        <Text style={s.h3}>Price Objection Responses</Text>
        {d.valuePricingFramework?.priceObjectionResponses?.map((obj, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{obj.objection}"</Text>
            <Text style={s.label}>Reframe</Text>
            <BodyRichText text={obj.reframe} />
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: EXAMPLE_CALLOUT.labelColor,
                marginBottom: 3,
                marginTop: 8,
              }}
            >
              Example response
            </Text>
            <Text style={{ ...s.body, fontStyle: "italic", color: EXAMPLE_CALLOUT.bodyColor }}>"{obj.exampleResponse}"</Text>
          </View>
        ))}

        <Text style={s.h1}>Sales Conversation Guide</Text>
        <Text style={s.label}>Opening Framework</Text>
        <View style={s.accentCard}><BodyRichText text={d.salesConversationGuide?.openingFramework} /></View>
        <Text style={s.h3}>Discovery Questions</Text>
        {d.salesConversationGuide?.discoveryQuestions?.map((q, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{q.question}"</Text>
            <BodyRichText text={q.whyThisQuestion} />
            <Text style={s.small}>Listen for: {q.listenFor}</Text>
          </View>
        ))}
        <Text style={s.h3}>Objection Handling</Text>
        {d.salesConversationGuide?.objectionHandlingPlaybook?.map((obj, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{obj.objection}"</Text>
            <BodyRichText text={obj.response} />
            <Text style={s.small}>Pillar: {obj.pillarConnection}</Text>
          </View>
        ))}
        <Text style={s.label}>Closing Language</Text>
        <BodyRichText text={d.salesConversationGuide?.closingLanguage} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PART V — IMPLEMENTATION
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part V</Text>
        <Text style={s.partTitle}>Implementation</Text>
        <Text style={s.partDesc}>How to roll out, measure, and protect {brandName}'s brand strategy.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Rollout and Governance"
        subtitle="Operational rollout, consistency controls, and team alignment."
      />

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>90-Day Brand Strategy Rollout</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStrategyRollout?.brandStrategyOnePager}</Text></View>

        <Text style={s.h2}>How We Talk About Ourselves</Text>
        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStrategyRollout?.howWeTalkAboutOurselves?.elevatorPitch}</Text></View>
        <Text style={s.label}>Approved Language</Text>
        <Bullets items={d.brandStrategyRollout?.howWeTalkAboutOurselves?.approvedLanguage || []} />
        <Text style={s.label}>Phrases to Avoid</Text>
        {d.brandStrategyRollout?.howWeTalkAboutOurselves?.phrasesToAvoid?.map((p, i) => (
          <Text key={i} style={{ ...s.bullet, color: SEMANTIC_DONT.label }}>✕ {p}</Text>
        ))}

        <Text style={s.h2}>Internal Rollout Talking Points</Text>
        {d.brandStrategyRollout?.internalRolloutTalkingPoints?.map((tp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{tp.topic}</Text>
            <Text style={s.body}>{tp.whatToSay}</Text>
            <Text style={s.small}>Reference: {tp.whatToReference}</Text>
          </View>
        ))}

        <Text style={s.h1}>Brand Consistency Checklist</Text>
        <Text style={s.body}>{d.brandConsistencyChecklist?.overview}</Text>
        {d.brandConsistencyChecklist?.prePublishChecklist?.map((cat, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{cat.category}</Text>
            {cat.checkItems?.map((ci, j) => (
              <View key={j} style={{ marginBottom: 4 }}>
                <Text style={s.body}>☐ {ci.item}</Text>
                <Text style={s.small}>{ci.rationale}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={s.h3}>What Never Changes</Text>
        {d.brandConsistencyChecklist?.whatNeverChanges?.map((item, i) => (
          <View key={i} style={{ ...s.card, borderLeft: `3 solid ${pdfTheme.colors.blue}` }} wrap={false}>
            <Text style={s.cardTitle}>{item.element}</Text>
            <Text style={s.body}>{item.why}</Text>
          </View>
        ))}
        <Text style={s.h3}>What Can Evolve</Text>
        {d.brandConsistencyChecklist?.whatCanEvolve?.map((item, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{item.element}</Text>
            <Text style={s.body}>Boundaries: {item.boundaries}</Text>
          </View>
        ))}

        <Text style={s.h1}>Measurement & KPI Framework</Text>
        <Text style={s.body}>{d.measurementFramework?.overview}</Text>
        <Text style={s.h3}>KPIs by Section</Text>
        {d.measurementFramework?.perSectionKPIs?.map((kpi, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{kpi.kpi}</Text>
              <View style={s.tag}><Text style={s.tagText}>{kpi.section}</Text></View>
            </View>
            <Text style={s.body}>{kpi.recommendation}</Text>
            <Text style={s.small}>Target: {kpi.target}</Text>
          </View>
        ))}
        <Text style={s.h3}>Leading Indicators</Text>
        {d.measurementFramework?.leadingIndicators?.map((li, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{li.indicator}</Text>
            <Text style={s.body}>{li.whatItMeans}</Text>
            <Text style={s.small}>Timeframe: {li.timeframe}</Text>
          </View>
        ))}

        {/* Brand Health Scorecard */}
        {d.brandHealthScorecard && (
          <>
            <Text style={s.h1}>Brand Health Scorecard</Text>
            <Text style={s.body}>{d.brandHealthScorecard.overview}</Text>
            <Text style={s.h3}>Scorecard Dimensions</Text>
            {d.brandHealthScorecard.scorecardDimensions?.map((dim: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{dim.dimension}</Text>
                <Text style={s.body}>Current: {dim.currentState}</Text>
                <Text style={s.body}>Target (90 days): {dim.targetState}</Text>
                <Text style={s.small}>Metric: {dim.keyMetric} | Frequency: {dim.frequency}</Text>
              </View>
            ))}
          </>
        )}

        {/* SWOT Analysis */}
        {d.swotAnalysis && (
          <>
            <Text style={s.h1}>SWOT Analysis</Text>
            <Text style={s.body}>{d.swotAnalysis.overview}</Text>
            <Text style={s.h3}>Strengths</Text>
            {d.swotAnalysis.strengths?.map((s2: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{s2.item}</Text>
                <Text style={s.body}>{s2.evidence}</Text>
                <Text style={s.small}>Leverage: {s2.leverage}</Text>
              </View>
            ))}
            <Text style={s.h3}>Weaknesses</Text>
            {d.swotAnalysis.weaknesses?.map((w: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{w.item}</Text>
                <Text style={s.body}>{w.evidence}</Text>
                <Text style={s.small}>Mitigation: {w.mitigation}</Text>
              </View>
            ))}
            <Text style={s.h3}>Opportunities</Text>
            {d.swotAnalysis.opportunities?.map((o: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{o.item}</Text>
                <Text style={s.body}>{o.context}</Text>
                <Text style={s.small}>Action: {o.action}</Text>
              </View>
            ))}
            <Text style={s.h3}>Threats</Text>
            {d.swotAnalysis.threats?.map((t: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{t.item}</Text>
                <Text style={s.small}>Likelihood: {t.likelihood} | Impact: {t.impact}</Text>
                <Text style={s.body}>{t.contingency}</Text>
              </View>
            ))}
            <Text style={s.body}>{d.swotAnalysis.strategicImplications}</Text>
          </>
        )}

        {/* Brand Rules & Terminology Guide */}
        {d.brandGlossary && (
          <>
            <Text style={s.h1}>Brand Rules & Terminology Guide</Text>
            <Text style={s.body}>{d.brandGlossary.overview}</Text>
            <Text style={s.h3}>Preferred Terms</Text>
            {d.brandGlossary.termsToUse?.map((term: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>Use: {term.term}</Text>
                <Text style={s.body}>Instead of: {term.insteadOf}</Text>
                <Text style={s.small}>{term.context}</Text>
              </View>
            ))}
            <Text style={s.h3}>Phrases to Avoid</Text>
            {d.brandGlossary.phrasesToAvoid?.map((p: any, i: number) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{p.phrase}</Text>
                <Text style={s.body}>{p.why}</Text>
                <Text style={s.small}>Instead: {p.alternative}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={s.h1}>Visual Direction & Imagery</Text>
        <Text style={s.h3}>Color Palette</Text>
        {d.visualDirection?.colorPalette?.map((c, i) => (
          <View key={i} style={s.swatchRow}>
            <View style={{ ...s.swatch, backgroundColor: c.hex }} />
            <View>
              <Text style={s.cardTitle}>{c.name}</Text>
              <Text style={s.small}>{c.hex} | RGB: {c.rgb} | CMYK: {c.cmyk}</Text>
              <Text style={s.small}>{c.usage}</Text>
            </View>
          </View>
        ))}
        <Text style={s.label}>Typography Tone</Text>
        <Text style={s.body}>{d.visualDirection?.typographyTone}</Text>

        <Text style={s.h3}>Photography Direction</Text>
        <Text style={s.body}>{d.brandImageryDirection?.photographyStyleDirection}</Text>
        <Text style={s.h4}>Do this</Text>
        <Bullets items={d.brandImageryDirection?.subjectMatterGuidance?.show || []} />
        <Text style={s.h4}>Not this</Text>
        <Bullets items={d.brandImageryDirection?.subjectMatterGuidance?.avoid || []} />
      </Page>

      <SectionDividerPage
        label="Section"
        title="Performance and Risk Review"
        subtitle="KPI tracking, brand health scorecard, SWOT, and terminology controls."
      />

      {/* ═══════════════════════════════════════════════════════════
          PART VI — AI PROMPT LIBRARY
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.partDivider}>
        <Text style={s.partNumber}>Part VI</Text>
        <Text style={s.partTitle}>AI Prompt Library</Text>
        <Text style={s.partDesc}>16 custom AI prompts built from {brandName}'s brand strategy — ready to paste.</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Prompt Packs"
        subtitle="Foundational and execution prompts for consistent, on-brand output."
      />

      <Page size="A4" style={s.page} wrap>
        <Footer brandName={brandName} />
        <Text style={s.h1}>{d.foundationalPromptPack?.packName || "Foundational Prompt Pack"}</Text>
        <Text style={s.body}>{d.foundationalPromptPack?.description}</Text>
        {d.foundationalPromptPack?.prompts?.map((p, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
            </View>
            <Text style={s.body}>{p.instruction}</Text>
            <View style={s.accentCard}><Text style={{ ...s.body, fontFamily: "Courier" }}>{p.prompt}</Text></View>
            <Text style={s.small}>{p.whyItMatters}</Text>
          </View>
        ))}

        <Text style={s.h1}>{d.executionPromptPack?.packName || "Execution Prompt Pack"}</Text>
        <Text style={s.body}>{d.executionPromptPack?.description}</Text>
        {d.executionPromptPack?.prompts?.map((p, i) => {
          const n = normalizePromptItemForPdf(p, {});
          return (
            <View key={i} style={s.card} wrap={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={s.cardTitle}>{n.title}</Text>
                <View style={s.tag}>
                  <Text style={s.tagText}>{n.category}</Text>
                </View>
              </View>
              {n.instructionBlock ? <Text style={s.body}>{n.instructionBlock}</Text> : null}
              <View style={s.accentCard}>
                <Text style={{ ...s.body, fontFamily: "Courier" }}>{n.copyBlock}</Text>
              </View>
              {n.whyItMatters ? <Text style={s.small}>{n.whyItMatters}</Text> : null}
            </View>
          );
        })}
      </Page>

      {/* ═══ DISCLAIMER ═══ */}
      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
