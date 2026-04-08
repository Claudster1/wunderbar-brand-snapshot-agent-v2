// Digital Marketing Strategy — standalone document
// For: Marketing manager, digital team

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
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, marginBottom: 3 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  footer: { position: "absolute", bottom: 18, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

function formatRef(ref?: BlueprintEngineOutput["emailMarketingFramework"]["conversion_intelligence_reference"]): string {
  if (!ref) return "Reference not set";
  return `${ref.icpTier} | ${ref.funnelStage} | ${ref.matrixCell}`;
}

export function DigitalStrategyDocument({ data, brandName }: Props) {
  const d = data;
  const contentRef = d.contentCalendarFramework?.conversion_intelligence_reference;
  const emailRef = d.emailMarketingFramework?.conversion_intelligence_reference;
  const paidRef = d.paidMediaStrategy?.conversion_intelligence_reference;
  const socialRef = d.socialMediaStrategy?.conversion_intelligence_reference;
  const thoughtRef = d.thoughtLeadershipStrategy?.conversion_intelligence_reference;
  const spendContext =
    d.spendRecommendationContext && typeof d.spendRecommendationContext === "object"
      ? d.spendRecommendationContext
      : undefined;
  const spendAllocation = Array.isArray(spendContext?.budgetConstrainedPlan?.allocation)
    ? spendContext?.budgetConstrainedPlan?.allocation
    : [];
  const spendPhases = Array.isArray(spendContext?.growthRoadmap?.phases)
    ? spendContext?.growthRoadmap?.phases
    : [];
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Digital Marketing Strategy</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>From your WunderBrand Blueprint™</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Customer Journey"
        subtitle="Stage-by-stage journey, touchpoints, and messaging focus."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Digital Marketing Strategy — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Customer Journey */}
        <Text style={s.h1}>Customer Journey Map</Text>
        <View style={s.accentCard}>
          <Text style={s.h3}>ICP Conversion Intelligence References</Text>
          <Text style={s.small}>Content Strategy: {formatRef(contentRef)}</Text>
          <Text style={s.small}>Email & Nurture: {formatRef(emailRef)}</Text>
          <Text style={s.small}>Paid Media: {formatRef(paidRef)}</Text>
          <Text style={s.small}>Social: {formatRef(socialRef)}</Text>
          <Text style={s.small}>Thought Leadership: {formatRef(thoughtRef)}</Text>
        </View>
        <Text style={s.body} wrap={false}>{d.customerJourneyMap?.overview}</Text>
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
      </Page>

      <SectionDividerPage
        label="Section"
        title="Search Strategy"
        subtitle="SEO priorities and AI answer engine readiness."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Digital Marketing Strategy — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* SEO */}
        <Text style={s.h1}>SEO & Keyword Strategy</Text>
        <Text style={s.body} wrap={false}>{d.seoStrategy?.overview}</Text>
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
        <View style={s.accentCard} wrap={false}><Text style={s.body}>{d.seoStrategy?.contentSEOPlaybook}</Text></View>

        {/* AEO */}
        <Text style={s.h1}>AEO & AI Search Strategy</Text>
        <Text style={s.body} wrap={false}>{d.aeoStrategy?.overview}</Text>
        <Text style={s.h2}>Entity Optimization</Text>
        <Text style={s.body}>{d.aeoStrategy?.entityOptimization?.currentEntityStatus}</Text>
        {d.aeoStrategy?.entityOptimization?.entityBuildingActions?.map((a, i) => <Text key={i} style={s.bullet}>• {a}</Text>)}
        <Text style={s.h2}>Content for AI Citation</Text>
        <Text style={s.body}>{d.aeoStrategy?.contentForAICitation?.strategy}</Text>
        {d.aeoStrategy?.contentForAICitation?.formatRecommendations?.map((r, i) => <Text key={i} style={s.bullet}>• {r}</Text>)}
        <Text style={s.h2}>Priority FAQs</Text>
        {d.aeoStrategy?.faqStrategy?.priorityFAQs?.map((faq, i) => <Text key={i} style={s.bullet}>• {faq}</Text>)}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Lifecycle Channels"
        subtitle="Email and social channel strategy for consistent execution."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Digital Marketing Strategy — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Email */}
        <Text style={s.h1}>Email Marketing Strategy</Text>
        <Text style={s.body} wrap={false}>{d.emailMarketingFramework?.overview}</Text>
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
        <Text style={s.body} wrap={false}>{d.socialMediaStrategy?.overview}</Text>
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
            {p.exampleImagePrompts && p.exampleImagePrompts.length > 0 ? (
              <>
                <Text style={s.label}>Image prompts</Text>
                {p.exampleImagePrompts.map((ip: string, j: number) => (
                  <Text key={`img-${j}`} style={s.bullet}>• {ip}</Text>
                ))}
              </>
            ) : null}
            {p.exampleVideoPrompts && p.exampleVideoPrompts.length > 0 ? (
              <>
                <Text style={s.label}>Video prompts</Text>
                {p.exampleVideoPrompts.map((vp: string, j: number) => (
                  <Text key={`vid-${j}`} style={s.bullet}>• {vp}</Text>
                ))}
              </>
            ) : null}
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
        {d.paidMediaStrategy?.channels?.length ? (
          <>
            <Text style={s.h1}>Paid Media Strategy</Text>
            <Text style={s.body} wrap={false}>{d.paidMediaStrategy?.overview}</Text>
            {d.paidMediaStrategy?.platformsCovered && d.paidMediaStrategy.platformsCovered.length > 0 ? (
              <>
                <Text style={s.label}>Platforms</Text>
                <View style={s.tagsRow}>
                  {d.paidMediaStrategy.platformsCovered.map((p, i) => (
                    <View key={i} style={s.tag}>
                      <Text style={s.tagText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            {d.paidMediaStrategy?.channels?.map((ch, i) => (
              <View key={i} style={s.card} wrap={false}>
                <Text style={s.cardTitle}>{ch.channel}</Text>
                {ch.platform ? (
                  <>
                    <Text style={s.label}>Platform</Text>
                    <Text style={s.body}>{ch.platform}</Text>
                  </>
                ) : null}
                {ch.placement ? (
                  <>
                    <Text style={s.label}>Placement</Text>
                    <Text style={s.body}>{ch.placement}</Text>
                  </>
                ) : null}
                {ch.headline ? (
                  <>
                    <Text style={s.label}>Headline</Text>
                    <Text style={s.body}>{ch.headline}</Text>
                  </>
                ) : null}
                {ch.subheadline ? (
                  <>
                    <Text style={s.label}>Subheadline</Text>
                    <Text style={s.body}>{ch.subheadline}</Text>
                  </>
                ) : null}
                {ch.bodyCopy ? (
                  <>
                    <Text style={s.label}>Body copy</Text>
                    <Text style={s.body}>{ch.bodyCopy}</Text>
                  </>
                ) : null}
                {ch.imagePrompt ? (
                  <>
                    <Text style={s.label}>Image prompt</Text>
                    <Text style={s.body}>{ch.imagePrompt}</Text>
                  </>
                ) : null}
                {ch.videoPrompt ? (
                  <>
                    <Text style={s.label}>Video prompt</Text>
                    <Text style={s.body}>{ch.videoPrompt}</Text>
                  </>
                ) : null}
                {ch.cta ? (
                  <>
                    <Text style={s.label}>CTA</Text>
                    <Text style={s.body}>{ch.cta}</Text>
                  </>
                ) : null}
                <Text style={s.small}>Objective: {ch.objective}</Text>
                <Text style={s.body}>{ch.audienceAngle}</Text>
                {ch.creativeDirection ? <Text style={s.body}>{ch.creativeDirection}</Text> : null}
                <Text style={s.small}>Offer: {ch.offerStrategy} | KPI: {ch.kpiToTrack}</Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Conversion Pathways"
        subtitle="Trust-building and CTA hierarchy designed to drive action."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Digital Marketing Strategy — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* Conversion */}
        <Text style={s.h1}>Conversion Strategy</Text>
        <Text style={s.label}>How Trust Is Built</Text>
        <Text style={s.body} wrap={false}>{d.conversionStrategy?.howTrustIsBuilt}</Text>
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
        {spendContext ? (
          <>
            <Text style={s.h2}>Spend-Aligned Growth Roadmap</Text>
            <View style={s.accentCard}>
              <Text style={s.body}>
                {d.conversionStrategy?.spendAlignmentPlan?.currentBudgetPlan?.focus ||
                  spendContext?.budgetConstrainedPlan?.focus}
              </Text>
              <Text style={s.small}>
                Confidence: {d.conversionStrategy?.spendAlignmentPlan?.confidence || spendContext?.confidence || "medium"}
              </Text>
            </View>
            {spendAllocation.map((a, i) => (
              <Text key={`alloc-${i}`} style={s.bullet}>
                • {a.percent}% {String(a.channel || "").replace(/_/g, " ")} (~$
                {Number(a.monthlySpend || 0).toLocaleString()}/mo)
              </Text>
            ))}
            {spendPhases.length > 0 && (
              <>
                <Text style={s.label}>30/60/90 Spend Path</Text>
                {spendPhases.map((phase, i) => (
                  <Text key={`phase-${i}`} style={s.bullet}>
                    • {String(phase.phase || "").replace("_", " ")}: ~$
                    {Number(phase.monthlySpend || 0).toLocaleString()} / month — {phase.milestone}
                  </Text>
                ))}
              </>
            )}
          </>
        ) : null}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}
