/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import { PdfHeader } from "../components/PdfHeader";
import { parseHexAccent } from "@/src/pdf/lib/promptPackDisplay";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";

const s = StyleSheet.create({
  page: { padding: 48, paddingBottom: 92, fontFamily: "Helvetica", fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 18, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 8, marginTop: 14 },
  h2: { fontSize: 12, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 5, marginTop: 10 },
  h3: { fontSize: 10, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 8 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: pdfTheme.colors.text },
  small: { fontSize: 9, color: pdfTheme.colors.muted, lineHeight: 1.45 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: `1 solid ${pdfTheme.colors.border}` },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6, alignItems: "stretch" },
  col2: { width: "50%", paddingRight: 8 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
  stat: { fontSize: 10, color: pdfTheme.colors.navy, fontWeight: 700, marginBottom: 3 },
});

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
}

const FALLBACK_STAGES = ["Aware", "Considering", "Evaluating", "Decision"];

export function ICPConversionIntelligenceDocument({ data, brandName }: Props) {
  const palette = data.visualDirection?.colorPalette as Array<{ hex?: string }> | undefined;
  const brandAccent = parseHexAccent(Array.isArray(palette) ? palette.map((entry) => entry?.hex).find(Boolean) : undefined) || pdfTheme.colors.blue;
  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const framework = data.icpConversionIntelligenceFramework;
  const personas = data.buyerPersonas || [];
  const icpFromPersonas = personas.slice(0, 3).map((p) => p.personaName || p.role).filter(Boolean);
  const icpTiers = Array.from(
    new Set([
      ...(framework?.conversionProfile?.map((row) => row.icpTier) || []),
      ...icpFromPersonas,
      "Primary ICP",
    ].filter(Boolean)),
  ).slice(0, 4);

  const conversionProfiles =
    framework?.conversionProfile && framework.conversionProfile.length > 0
      ? framework.conversionProfile
      : icpTiers.map((tier, index) => ({
          icpTier: tier,
          buyingCycleLength: index === 0 ? "30-60 days" : "45-90 days",
          primaryConversionBarrier: "Unclear proof that this strategy is implementable for their team context.",
          decisionTrigger: "Sees a role-specific roadmap plus evidence from a comparable business.",
          conversionBehaviorPattern: "Consumes one insight asset, one proof asset, then books a strategy call.",
        }));

  const hookTypePerformance =
    framework?.hookTypePerformance && framework.hookTypePerformance.length > 0
      ? framework.hookTypePerformance
      : conversionProfiles.map((row) => ({
          icpTier: row.icpTier,
          reliableHookTypes: [
            { hookType: "Data-led insight", whyItConverts: "Signals strategic credibility and low-risk decision confidence." },
            { hookType: "Peer social proof", whyItConverts: "Reduces uncertainty through relevance and comparability." },
          ],
          hookTypesToAvoid: [{ hookType: "Generic hype claim", whyToAvoid: "Creates skepticism and lowers trust velocity." }],
        }));

  const channelMechanics =
    framework?.channelLevelConversionMechanics && framework.channelLevelConversionMechanics.length > 0
      ? framework.channelLevelConversionMechanics
      : icpTiers.flatMap((tier) =>
          ["Email", "LinkedIn", "Search/SEO", "Sales Call"].map((channel) => ({
            icpTier: tier,
            channel,
            convertingFormats: ["Proof-backed framework", "Diagnostic interpretation", "Outcome case snapshot"],
            optimalMessageLength: channel === "Email" ? "120-220 words" : "Short-form with one strong proof line",
            conversionAction: "Book strategy activation call",
            followUpLogic: "If no action in 72 hours, send objection-aware proof follow-up.",
            failurePatterns: ["Too generic", "No proof point", "Too many CTAs"],
          })),
        );

  const multiTouch =
    framework?.multiTouchConversionSequence && framework.multiTouchConversionSequence.length > 0
      ? framework.multiTouchConversionSequence
      : icpTiers.map((tier) => ({
          icpTier: tier,
          sequence: [
            { order: 1, channel: "LinkedIn", touchType: "Authority post", objective: "Create problem urgency", conversionSignal: "Post engagement" },
            { order: 2, channel: "Website", touchType: "Proof-led page visit", objective: "Build trust", conversionSignal: "Case-study view" },
            { order: 3, channel: "Email", touchType: "Nurture proof email", objective: "Resolve objections", conversionSignal: "CTA click" },
            { order: 4, channel: "Sales", touchType: "Strategy call", objective: "Close", conversionSignal: "Proposal request" },
          ],
          criticalTouch: "Proof-led page visit with a role-specific CTA.",
          salesHandoffTrigger: "Any high-intent signal after proof consumption (CTA click, pricing page revisit, schedule intent).",
        }));

  const matrix =
    framework?.contentTypeConversionMatrix && framework.contentTypeConversionMatrix.length > 0
      ? framework.contentTypeConversionMatrix
      : icpTiers.flatMap((tier) =>
          FALLBACK_STAGES.map((stage) => ({
            icpTier: tier,
            funnelStage: stage,
            highestConvertingContentType: stage === "Decision" ? "Offer + case-study hybrid page" : "Insight-to-proof narrative asset",
            whyItConverts: "Connects business pain to credible outcomes with minimal cognitive load.",
            requiredContentAttributes: ["One core claim", "Specific proof", "Single CTA"],
            leadMessagePillar: "Credibility",
            convertingCTA: stage === "Decision" ? "Start Implementation Plan" : "Review My Priority Plan",
          })),
        );

  const signals =
    framework?.behavioralSignalLibrary && framework.behavioralSignalLibrary.length > 0
      ? framework.behavioralSignalLibrary
      : icpTiers.flatMap((tier) => [
          {
            icpTier: tier,
            signal: "Returns to pricing/services page within 7 days",
            indicatesStageTransition: "Consideration -> Decision",
            triggeredAction: "Send proof + objection-response email within 24 hours",
          },
          {
            icpTier: tier,
            signal: "Downloads strategic asset + views case study",
            indicatesStageTransition: "Aware -> Considering",
            triggeredAction: "Trigger nurture sequence mapped to primary barrier",
          },
        ]);

  const scoring = framework?.scoringSignals || {
    icpConversionPathCoverage: 75,
    contentMatrixCompleteness: 72,
    behavioralSignalCoverage: 70,
    channelConversionDataPopulated: 68,
    activeTestCoverage: "Baseline active tests defined for primary ICP; expand to secondary tiers.",
    lastReviewedAt: new Date().toISOString(),
  };

  const linkedRefs = [
    { name: "Content Strategy & Editorial Calendar", ref: data.contentCalendarFramework?.conversion_intelligence_reference },
    { name: "Email & Nurture Architecture", ref: data.emailMarketingFramework?.conversion_intelligence_reference },
    { name: "Paid Media Strategy", ref: data.paidMediaStrategy?.conversion_intelligence_reference },
    { name: "Social Media Plan", ref: data.socialMediaStrategy?.conversion_intelligence_reference },
    { name: "Sales Enablement Suite", ref: data.salesConversationGuide?.conversion_intelligence_reference },
    { name: "Thought Leadership Program", ref: data.thoughtLeadershipStrategy?.conversion_intelligence_reference },
  ];

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverTitle}>ICP Conversion Intelligence Framework</Text>
        <Text style={s.coverSub}>{brandName} — Blueprint+ Performance Backbone</Text>
        <View style={{ width: 76, height: 3, borderRadius: 999, backgroundColor: brandAccent, marginTop: 10, marginBottom: 16 }} />
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{printedDate}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>
          Links Master Messaging to all channel activation systems
        </Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="ICP Conversion Diagnostics"
        subtitle="Conversion profile, hook performance, and channel-level mechanics by ICP tier."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ICP Conversion Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <PdfHeader title="ICP Conversion Intelligence Framework" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        {framework?.overview ? <View style={s.accentCard}><Text style={s.body}>{framework.overview}</Text></View> : null}

        <Text style={s.h1}>1) Conversion Profile</Text>
        {conversionProfiles.map((row, i) => (
          <View key={`profile-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            <Text style={s.body}>Buying cycle length: {row.buyingCycleLength}</Text>
            <Text style={s.body}>Primary conversion barrier: {row.primaryConversionBarrier}</Text>
            <Text style={s.body}>Decision trigger: {row.decisionTrigger}</Text>
            <Text style={s.small}>Behavior pattern: {row.conversionBehaviorPattern}</Text>
          </View>
        ))}

        <Text style={s.h1}>2) Hook Type Performance</Text>
        {hookTypePerformance.map((row, i) => (
          <View key={`hook-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            <Text style={s.h3}>High-performing hooks</Text>
            {row.reliableHookTypes.map((item, j) => (
              <Text key={`good-${j}`} style={s.bullet}>• {item.hookType}: {item.whyItConverts}</Text>
            ))}
            <Text style={s.h3}>Avoid hooks</Text>
            {row.hookTypesToAvoid.map((item, j) => (
              <Text key={`bad-${j}`} style={s.bullet}>• {item.hookType}: {item.whyToAvoid}</Text>
            ))}
          </View>
        ))}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Conversion Execution System"
        subtitle="Channel mechanics, multi-touch sequencing, matrix mapping, and behavioral triggers."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ICP Conversion Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <PdfHeader title="ICP Conversion Intelligence Framework" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>3) Channel-Level Conversion Mechanics</Text>
        {channelMechanics.slice(0, 12).map((row, i) => (
          <View key={`chan-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier} — {row.channel}</Text>
            <Text style={s.body}>Converting formats: {row.convertingFormats.join(", ")}</Text>
            <Text style={s.body}>Optimal message length: {row.optimalMessageLength}</Text>
            <Text style={s.body}>Conversion action: {row.conversionAction}</Text>
            <Text style={s.small}>Follow-up: {row.followUpLogic}</Text>
            {row.failurePatterns?.length > 0 ? <Text style={s.small}>Failure patterns: {row.failurePatterns.join("; ")}</Text> : null}
          </View>
        ))}

        <Text style={s.h1}>4) Multi-Touch Conversion Sequence</Text>
        {multiTouch.map((row, i) => (
          <View key={`seq-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            {row.sequence.map((step, j) => (
              <Text key={`step-${j}`} style={s.bullet}>
                {step.order}. {step.channel} — {step.touchType}: {step.objective} (signal: {step.conversionSignal})
              </Text>
            ))}
            <Text style={s.small}>Critical touch: {row.criticalTouch}</Text>
            <Text style={s.small}>Sales handoff trigger: {row.salesHandoffTrigger}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ICP Conversion Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <PdfHeader title="ICP Conversion Intelligence Framework" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>5) Content Type × Conversion Matrix</Text>
        {matrix.slice(0, 16).map((row, i) => (
          <View key={`matrix-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier} — {row.funnelStage}</Text>
            <Text style={s.body}>Highest-converting content type: {row.highestConvertingContentType}</Text>
            <Text style={s.body}>Why it converts: {row.whyItConverts}</Text>
            <Text style={s.small}>Required attributes: {row.requiredContentAttributes.join("; ")}</Text>
            <Text style={s.small}>Lead pillar: {row.leadMessagePillar} | Converting CTA: {row.convertingCTA}</Text>
          </View>
        ))}

        <Text style={s.h1}>6) Behavioral Signal Library</Text>
        {signals.slice(0, 14).map((row, i) => (
          <View key={`signal-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            <Text style={s.body}>Signal: {row.signal}</Text>
            <Text style={s.small}>Stage transition: {row.indicatesStageTransition}</Text>
            <Text style={s.small}>Triggered action: {row.triggeredAction}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ICP Conversion Intelligence — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <PdfHeader title="ICP Conversion Intelligence Framework" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Scoring Signals</Text>
        <View style={s.accentCard}>
          <Text style={s.stat}>ICP conversion path coverage (auto): {scoring.icpConversionPathCoverage}%</Text>
          <Text style={s.stat}>Content matrix completeness (auto): {scoring.contentMatrixCompleteness}%</Text>
          <Text style={s.stat}>Behavioral signal coverage (auto): {scoring.behavioralSignalCoverage}%</Text>
          <Text style={s.stat}>Channel conversion data populated (derived): {scoring.channelConversionDataPopulated}%</Text>
          <Text style={s.stat}>Active test coverage (user): {scoring.activeTestCoverage}</Text>
          <Text style={s.stat}>Last reviewed (user): {scoring.lastReviewedAt}</Text>
        </View>

        <Text style={s.h1}>Linked Activation References</Text>
        {linkedRefs.map((row, i) => (
          <View key={`ref-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.name}</Text>
            {row.ref ? (
              <>
                <Text style={s.body}>Type: {row.ref.type}</Text>
                <Text style={s.body}>Framework: {row.ref.framework}</Text>
                <Text style={s.small}>
                  ICP: {row.ref.icpTier} | Stage: {row.ref.funnelStage} | Matrix cell: {row.ref.matrixCell}
                </Text>
              </>
            ) : (
              <Text style={s.small}>Reference not set yet. Add a matrix-cell link during editor review.</Text>
            )}
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="blueprint_plus" />
    </Document>
  );
}

