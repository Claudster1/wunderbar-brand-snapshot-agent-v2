// Competitive Intelligence Brief — standalone document
// For: Sales team, business development, leadership
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import type { BlueprintEngineOutput } from "../types/blueprintReport";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: { padding: 42, paddingBottom: 66, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 18 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 14 },
  h3: { fontSize: 11, fontWeight: "bold", color: "#021859", marginBottom: 3, marginTop: 8 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: "#0D5BD7", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 3, marginTop: 9 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  warnCard: { backgroundColor: "#FFFBEB", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: "3 solid #F59E0B", border: "1 solid #FDE68A" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  footer: { position: "absolute", bottom: 18, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function CompetitiveIntelDocument({ data, brandName }: Props) {
  const d = data;
  const salesRef = d.salesConversationGuide?.conversion_intelligence_reference;
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Competitive Intelligence Brief</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>CONFIDENTIAL — For sales & leadership</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Positioning and Trade-Offs"
        subtitle="Competitive landscape, strategic whitespace, and decision trade-offs."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Competitive Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Positioning Map */}
        <Text style={s.h1}>Competitive Positioning Map</Text>
        <View style={s.card}>
          <Text style={s.h3}>Axis 1: {d.competitivePositioning?.positioningAxis1?.label}</Text>
          <Text style={s.small}>{d.competitivePositioning?.positioningAxis1?.lowEnd} ←→ {d.competitivePositioning?.positioningAxis1?.highEnd}</Text>
          <Text style={s.h3}>Axis 2: {d.competitivePositioning?.positioningAxis2?.label}</Text>
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

        {/* Strategic Trade-Offs */}
        <Text style={s.h1}>Strategic Trade-Offs</Text>
        {d.strategicTradeOffs?.map((t, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{t.decision}</Text>
            <View style={s.row}>
              <View style={s.col2}>
                <Text style={s.h3}>{t.optionA?.label}</Text>
                {t.optionA?.pros?.map((p, j) => <Text key={j} style={s.bullet}>+ {p}</Text>)}
                {t.optionA?.cons?.map((c, j) => <Text key={j} style={{ ...s.bullet, color: "#64748B" }}>- {c}</Text>)}
              </View>
              <View style={s.col2}>
                <Text style={s.h3}>{t.optionB?.label}</Text>
                {t.optionB?.pros?.map((p, j) => <Text key={j} style={s.bullet}>+ {p}</Text>)}
                {t.optionB?.cons?.map((c, j) => <Text key={j} style={{ ...s.bullet, color: "#64748B" }}>- {c}</Text>)}
              </View>
            </View>
            <View style={s.accentCard}><Text style={s.body}>{t.recommendation}</Text></View>
            <Text style={s.small}>Revisit when: {t.revisitWhen}</Text>
          </View>
        ))}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Value and Pricing"
        subtitle="Price positioning language and objection reframing."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Competitive Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Value & Pricing */}
        <Text style={s.h1}>Value & Pricing Communication</Text>
        <Text style={s.label}>Pricing Positioning</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.valuePricingFramework?.pricingPositioningStatement}</Text></View>
        <Text style={s.label}>Value Narrative</Text>
        <Text style={s.body}>{d.valuePricingFramework?.valueNarrative}</Text>
        <Text style={s.h2}>Price Objection Responses</Text>
        {d.valuePricingFramework?.priceObjectionResponses?.map((obj, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{obj.objection}"</Text>
            <Text style={s.label}>Reframe</Text>
            <Text style={s.body}>{obj.reframe}</Text>
            <Text style={s.label}>Say This</Text>
            <Text style={{ ...s.body, fontStyle: "italic" }}>"{obj.exampleResponse}"</Text>
          </View>
        ))}
        <Text style={s.label}>Website Pricing Language</Text>
        <Text style={s.body}>{d.valuePricingFramework?.whyUsAtThisPrice}</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Sales Conversation Guide"
        subtitle="Discovery, objection handling, and closing language."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Competitive Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Sales Conversation Guide */}
        <Text style={s.h1}>Sales Conversation Guide</Text>
        {salesRef ? (
          <View style={s.accentCard} wrap={false}>
            <Text style={s.small}>
              Linked ICP Conversion Intelligence reference: {salesRef.icpTier} | {salesRef.funnelStage} | {salesRef.matrixCell}
            </Text>
          </View>
        ) : null}
        <Text style={s.label}>Opening Framework</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.salesConversationGuide?.openingFramework}</Text></View>
        <Text style={s.h2}>Discovery Questions</Text>
        {d.salesConversationGuide?.discoveryQuestions?.map((q, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{q.question}"</Text>
            <Text style={s.body}>{q.whyThisQuestion}</Text>
            <Text style={s.small}>Listen for: {q.listenFor}</Text>
          </View>
        ))}
        <Text style={s.h2}>Objection Handling</Text>
        {d.salesConversationGuide?.objectionHandlingPlaybook?.map((obj, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>"{obj.objection}"</Text>
            <Text style={s.body}>{obj.response}</Text>
            <Text style={s.small}>Pillar: {obj.pillarConnection}</Text>
          </View>
        ))}
        <Text style={s.label}>Closing Language</Text>
        <Text style={s.body}>{d.salesConversationGuide?.closingLanguage}</Text>

        {/* Positioning for context */}
        <Text style={s.h1}>Quick Reference</Text>
        <Text style={s.label}>Positioning Statement</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandFoundation?.positioningStatement}</Text></View>
        <Text style={s.label}>Differentiation</Text>
        <Text style={s.body}>{d.brandFoundation?.differentiationNarrative}</Text>
        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStory?.elevatorPitch}</Text></View>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
