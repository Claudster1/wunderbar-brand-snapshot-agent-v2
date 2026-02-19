// Digital Marketing Strategy — standalone document
// For: Marketing manager, digital team

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
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, marginBottom: 3 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function DigitalStrategyDocument({ data, brandName }: Props) {
  const d = data;
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Digital Marketing Strategy</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 30 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 40, fontSize: 8 }}>From your WunderBrand Blueprint™</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Digital Marketing Strategy — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Customer Journey */}
        <Text style={s.h1}>Customer Journey Map</Text>
        <Text style={s.body}>{d.customerJourneyMap?.overview}</Text>
        {d.customerJourneyMap?.stages?.map((stage, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{stage.stage}</Text>
            <Text style={s.h3}>Customer Mindset</Text>
            <Text style={s.body}>{stage.customerMindset}</Text>
            <Text style={s.h3}>Key Questions</Text>
            {stage.keyQuestions?.map((q, j) => <Text key={j} style={s.bullet}>• {q}</Text>)}
            <Text style={s.h3}>Touchpoints</Text>
            <View style={s.tagsRow}>{stage.touchpoints?.map((t, j) => <View key={j} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}</View>
            <Text style={s.h3}>Messaging Focus</Text>
            <Text style={s.body}>{stage.messagingFocus}</Text>
            <Text style={s.small}>Conversion Trigger: {stage.conversionTrigger} | KPI: {stage.kpiToTrack}</Text>
          </View>
        ))}

        {/* SEO */}
        <Text style={s.h1}>SEO & Keyword Strategy</Text>
        <Text style={s.body}>{d.seoStrategy?.overview}</Text>
        <Text style={s.h2}>Primary Keywords</Text>
        {d.seoStrategy?.primaryKeywords?.map((kw, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{kw.keyword}</Text>
              <View style={s.tagsRow}><View style={s.tag}><Text style={s.tagText}>{kw.intent}</Text></View><View style={s.tag}><Text style={s.tagText}>{kw.difficulty}</Text></View></View>
            </View>
            <Text style={s.body}>{kw.contentAngle}</Text>
            <Text style={s.small}>Content Pillar: {kw.pillarConnection}</Text>
          </View>
        ))}
        <Text style={s.h2}>Long-Tail Opportunities</Text>
        {d.seoStrategy?.longTailOpportunities?.map((lt, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{lt.keyword}</Text>
            <Text style={s.body}>{lt.contentRecommendation}</Text>
          </View>
        ))}
        <Text style={s.label}>Technical Priorities</Text>
        {d.seoStrategy?.technicalPriorities?.map((t, i) => <Text key={i} style={s.bullet}>• {t}</Text>)}
        <View style={s.accentCard}><Text style={s.body}>{d.seoStrategy?.contentSEOPlaybook}</Text></View>

        {/* AEO */}
        <Text style={s.h1}>AEO & AI Search Strategy</Text>
        <Text style={s.body}>{d.aeoStrategy?.overview}</Text>
        <Text style={s.h2}>Entity Optimization</Text>
        <Text style={s.body}>{d.aeoStrategy?.entityOptimization?.currentEntityStatus}</Text>
        {d.aeoStrategy?.entityOptimization?.entityBuildingActions?.map((a, i) => <Text key={i} style={s.bullet}>• {a}</Text>)}
        <Text style={s.h2}>Content for AI Citation</Text>
        <Text style={s.body}>{d.aeoStrategy?.contentForAICitation?.strategy}</Text>
        {d.aeoStrategy?.contentForAICitation?.formatRecommendations?.map((r, i) => <Text key={i} style={s.bullet}>• {r}</Text>)}
        <Text style={s.h2}>Priority FAQs</Text>
        {d.aeoStrategy?.faqStrategy?.priorityFAQs?.map((faq, i) => <Text key={i} style={s.bullet}>• {faq}</Text>)}

        {/* Email */}
        <Text style={s.h1}>Email Marketing Framework</Text>
        <Text style={s.body}>{d.emailMarketingFramework?.overview}</Text>
        <Text style={s.h2}>Welcome Sequence</Text>
        <Text style={s.body}>{d.emailMarketingFramework?.welcomeSequence?.description}</Text>
        {d.emailMarketingFramework?.welcomeSequence?.emails?.map((e, i) => (
          <View key={i} style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.cardTitle}>{e.subject}</Text>
              <View style={s.tag}><Text style={s.tagText}>{e.timing}</Text></View>
            </View>
            <Text style={s.body}>{e.keyMessage}</Text>
            <Text style={s.small}>{e.purpose}</Text>
          </View>
        ))}
        <Text style={s.label}>Subject Line Formulas</Text>
        {d.emailMarketingFramework?.subjectLineFormulas?.map((f, i) => <Text key={i} style={s.bullet}>• {f}</Text>)}
        <Text style={s.small}>Recommended cadence: {d.emailMarketingFramework?.sendCadence}</Text>
        <Text style={s.label}>Segmentation Strategy</Text>
        <Text style={s.body}>{d.emailMarketingFramework?.segmentationStrategy}</Text>

        {/* Social */}
        <Text style={s.h1}>Social Media Strategy</Text>
        <Text style={s.body}>{d.socialMediaStrategy?.overview}</Text>
        {d.socialMediaStrategy?.platforms?.map((p, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{p.platform}</Text>
            <Text style={s.body}>{p.whyThisPlatform}</Text>
            <Text style={s.h3}>Audience</Text>
            <Text style={s.body}>{p.audienceOnPlatform}</Text>
            <Text style={s.h3}>Content Strategy</Text>
            <Text style={s.body}>{p.contentStrategy}</Text>
            <Text style={s.h3}>Example Posts</Text>
            {p.examplePosts?.map((post, j) => <Text key={j} style={s.bullet}>• {post}</Text>)}
            <Text style={s.small}>Frequency: {p.postingFrequency} | Mix: {p.contentMix} | KPI: {p.kpiToTrack}</Text>
          </View>
        ))}
        {d.socialMediaStrategy?.platformsToAvoid?.platforms?.length > 0 && (
          <>
            <Text style={s.label}>Platforms to Deprioritize</Text>
            {d.socialMediaStrategy.platformsToAvoid.platforms.map((p, i) => <Text key={i} style={s.bullet}>• {p}</Text>)}
            <Text style={s.small}>{d.socialMediaStrategy.platformsToAvoid.reasoning}</Text>
          </>
        )}

        {/* Conversion */}
        <Text style={s.h1}>Conversion Strategy</Text>
        <Text style={s.label}>How Trust Is Built</Text>
        <Text style={s.body}>{d.conversionStrategy?.howTrustIsBuilt}</Text>
        <Text style={s.label}>How Clarity Drives Action</Text>
        <Text style={s.body}>{d.conversionStrategy?.howClarityDrivesAction}</Text>
        <Text style={s.h2}>CTA Hierarchy</Text>
        {d.conversionStrategy?.ctaHierarchy?.map((cta, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{cta.level}</Text>
            <Text style={s.body}>{cta.action}</Text>
            <Text style={s.small}>{cta.context}</Text>
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
