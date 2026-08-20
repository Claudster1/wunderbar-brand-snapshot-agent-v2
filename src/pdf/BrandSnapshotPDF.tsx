// src/pdf/BrandSnapshotPDF.tsx
// WunderBrand Snapshot™ PDF — mirrors SnapshotDocumentResults UI

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import { PdfHeader, PDF_HEADER_RESERVED } from "./components/PdfHeader";
import { PdfFooter, PDF_FOOTER_RESERVED } from "./components/PdfFooter";
import { PillarScoreBar } from "./components/PillarScoreBar";
import { MainGaugePDF } from "./components/MainGaugePDF";
import { registerPdfFonts } from "./registerFonts";
import { DisclaimerPage } from "./components/DisclaimerPage";
import { getPrimaryPillar } from "@/src/lib/pillars/getPrimaryPillar";
import { getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_PAGE,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SECTION_ACTIVE_BG,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

registerPdfFonts();

const PRODUCT = "WunderBrand Snapshot™";
const GREEN = "#22C55E";
const GOOD_GREEN = "#4ADE80";
const YELLOW = "#EAB308";
const ORANGE = "#F97316";
const RED_S = "#EF4444";
const WHITE = "#FFFFFF";
const INTRO_BORDER = "#B8E6F8";
const QUOTE_BG = "#E8F6FE";

const PILLAR_KEYS = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
type PillarKey = (typeof PILLAR_KEYS)[number];
const PILLAR_LABELS: Record<PillarKey, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

function scoreColor(percent: number) {
  if (percent >= 80) return GREEN;
  if (percent >= 60) return GOOD_GREEN;
  if (percent >= 40) return YELLOW;
  if (percent >= 20) return ORANGE;
  return RED_S;
}

function scoreLabel(percent: number) {
  if (percent >= 80) return "Strong";
  if (percent >= 60) return "Good";
  if (percent >= 40) return "Fair";
  if (percent >= 20) return "Weak";
  return "Critical";
}

function normalizePillarScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  // Heuristic: values above 20 are on a 0–100 scale → map to /20
  if (raw > 20) return Math.max(0, Math.min(20, Math.round(raw / 5)));
  return Math.max(0, Math.min(20, Math.round(raw)));
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    fontSize: 10,
    paddingTop: PDF_HEADER_RESERVED + 10,
    paddingBottom: PDF_FOOTER_RESERVED + 6,
    paddingHorizontal: 28,
    backgroundColor: SUITE_BG_PAGE,
  },
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: SUITE_RADIUS_MD,
    backgroundColor: SUITE_SECTION_ACTIVE_BG,
    borderWidth: 1,
    borderColor: INTRO_BORDER,
    marginBottom: 14,
  },
  introIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: SUITE_ACCENT_BRIGHT,
    color: SUITE_ACCENT_BRIGHT,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 1,
    marginRight: 10,
  },
  introText: {
    flex: 1,
    fontFamily: "Lato",
    fontSize: 9,
    color: SUITE_MUTED,
    lineHeight: 1.45,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Lato",
    fontSize: 16,
    fontWeight: 700,
    color: SUITE_NAVY,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionDesc: {
    fontFamily: "Lato",
    fontSize: 9.5,
    color: SUITE_MUTED,
    marginBottom: 12,
    lineHeight: 1.45,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    padding: 10,
    marginRight: 8,
  },
  summaryCardLast: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    padding: 10,
    marginRight: 0,
  },
  summaryLabel: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    color: SUITE_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: "Lato",
    fontSize: 18,
    fontWeight: 900,
    color: SUITE_NAVY,
  },
  summaryMeta: {
    fontFamily: "Lato",
    fontSize: 8.5,
    color: SUITE_MUTED,
    marginTop: 2,
  },
  diagnosisQuote: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SUITE_RADIUS_MD,
    backgroundColor: QUOTE_BG,
    borderLeftWidth: 3,
    borderLeftColor: SUITE_ACCENT_BRIGHT,
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_NAVY,
    lineHeight: 1.5,
    fontStyle: "italic",
    marginBottom: 10,
  },
  body: {
    fontFamily: "Lato",
    fontSize: 10,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.55,
  },
  signalRail: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: SUITE_RADIUS_MD,
    borderLeftWidth: 3,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    marginBottom: 6,
  },
  signalLabel: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  signalBody: {
    fontFamily: "Lato",
    fontSize: 9.5,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.45,
  },
  metersWrap: {
    backgroundColor: SUITE_BG_PAGE,
    borderRadius: SUITE_RADIUS_MD,
    padding: 14,
    marginBottom: 10,
  },
  meterRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  meterCol: { flex: 1, marginRight: 14 },
  meterColLast: { flex: 1, marginRight: 0 },
  insightCard: {
    backgroundColor: WHITE,
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    padding: 12,
    marginBottom: 8,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: "Lato",
    fontSize: 12,
    fontWeight: 900,
    color: SUITE_NAVY,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 900,
    color: WHITE,
  },
  insightBody: {
    fontFamily: "Lato",
    fontSize: 9.5,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.5,
  },
  kicker: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: SUITE_ACCENT_BRIGHT,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  listItem: {
    fontFamily: "Lato",
    fontSize: 10,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  ctaLabel: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: SUITE_ACCENT_BRIGHT,
    marginTop: 8,
  },
  muted: {
    fontFamily: "Lato",
    fontSize: 9.5,
    color: SUITE_MUTED,
    lineHeight: 1.45,
  },
  fieldLabel: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: SUITE_ACCENT_BRIGHT,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: "Lato",
    fontSize: 10,
    color: SUITE_TEXT_PRIMARY,
    marginBottom: 8,
  },
});

function getAudienceAlignmentTeaser(primaryPillar: PillarKey): string {
  const teasers: Record<PillarKey, string> = {
    positioning:
      "The question your ideal client asks before choosing between you and a competitor is identified in Snapshot+.",
    messaging:
      "The language pattern your audience uses when they are ready to buy is identified in Snapshot+.",
    visibility:
      "The channel where your ideal audience is actively searching and where your presence is weak is identified in Snapshot+.",
    credibility:
      "The trust signal your audience looks for before committing is identified in Snapshot+.",
    conversion:
      "The point in your buyer journey where interest most often drops off is identified in Snapshot+.",
  };
  return teasers[primaryPillar];
}

function contentFormatChannelTeaser(type: string): string {
  switch (type) {
    case "service_b2b":
      return "Your audience-mapped format and channel plan is ready: long-form authority content, relationship-driven channels, and funnel-stage priorities.";
    case "service_b2c":
      return "Your audience-mapped format and channel plan is ready: social proof formats, high-trust channels, and conversion-oriented booking flow priorities.";
    case "retail":
      return "Your audience-mapped format and channel plan is ready: local demand formats, store-discovery channels, and repeat-purchase priority actions.";
    case "ecommerce":
      return "Your audience-mapped format and channel plan is ready: product-led content formats, high-intent channels, and conversion/retention funnel priorities.";
    case "saas":
      return "Your audience-mapped format and channel plan is ready: education-led formats, activation-focused channels, and lifecycle conversion priorities.";
    case "local_service":
      return "Your audience-mapped format and channel plan is ready: trust-building formats, local discovery channels, and booking/show-rate priorities.";
    default:
      return "Your audience-mapped format and channel plan is ready: top content formats, highest-leverage channels, and funnel-stage priorities.";
  }
}

function normalizeBusinessType(input?: string | null): string {
  if (!input) return "general";
  const v = String(input).toLowerCase();
  if (v.includes("service_b2b")) return "service_b2b";
  if (v.includes("service_b2c")) return "service_b2c";
  if (v.includes("retail")) return "retail";
  if (v.includes("ecommerce")) return "ecommerce";
  if (v.includes("saas") || v.includes("software")) return "saas";
  if (v.includes("local_service")) return "local_service";
  return "general";
}

function parseMoney(input?: string | null): number | null {
  if (!input) return null;
  const match = input.replace(/,/g, "").match(/(\d+(?:\.\d+)?)(k)?/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return match[2] ? value * 1000 : value;
}

function parseConversionRate(input?: string | null): number | null {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v.includes("don't track") || v.includes("do not track")) return null;
  const match = v.match(/(\d+(?:\.\d+)?)\s*%?/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0 || n >= 100) return null;
  return n / 100;
}

function monthlyRevenueFromRanges(monthlyRange?: string | null, annualRange?: string | null): number | null {
  const monthlyMap: Record<string, number> = {
    under_5k: 2500,
    "5k_20k": 12500,
    "20k_50k": 35000,
    "50k_150k": 100000,
    "150k_plus": 175000,
  };
  if (monthlyRange && monthlyMap[monthlyRange]) return monthlyMap[monthlyRange];
  const annualMap: Record<string, number> = {
    "under 100k": 50000,
    "100k-500k": 300000,
    "500k-1M": 750000,
    "1M-5M": 3000000,
    "5M+": 7000000,
  };
  if (annualRange && annualMap[annualRange]) return annualMap[annualRange] / 12;
  return null;
}

function pillarRisk(primaryPillar: PillarKey): string {
  switch (primaryPillar) {
    case "positioning":
      return "attracting attention from lower-fit buyers";
    case "messaging":
      return "losing response at first contact";
    case "visibility":
      return "being under-discovered where buyers are already searching";
    case "credibility":
      return "losing trust at the decision point";
    case "conversion":
      return "leakage between interest and action";
    default:
      return "conversion inefficiency";
  }
}

export const BrandSnapshotPDF = ({
  report,
}: {
  report: BrandSnapshotReport;
}) => {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const {
    businessName,
    industry,
    website,
    socials,
    brandAlignmentScore,
    pillarScores,
    pillarInsights,
    fullReportAnswers,
  } = report;

  const entries = PILLAR_KEYS.map((key) => ({
    key,
    label: PILLAR_LABELS[key],
    score: normalizePillarScore(Number(pillarScores[key]) || 0),
  }));
  const strongest = [...entries].sort((a, b) => b.score - a.score)[0];
  const weakest = [...entries].sort((a, b) => a.score - b.score)[0];
  const score = Math.max(0, Math.min(100, Math.round(brandAlignmentScore)));
  const scoreBand = scoreLabel(score).toLowerCase();

  const primaryResult = getPrimaryPillar(pillarScores as any);
  const primaryPillar =
    (primaryResult.type === "tie" ? primaryResult.pillars?.[0] : primaryResult.pillar) ||
    weakest.key;
  const primaryLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);

  const diagnosis = `${businessName} has a ${scoreBand} brand foundation, with the clearest opportunity concentrated in ${weakest.label.toLowerCase()}.`;
  const overview = `${businessName}'s strongest signal is ${strongest.label.toLowerCase()} at ${strongest.score}/20. ${weakest.label} is the highest-leverage area to improve next at ${weakest.score}/20.`;
  const opportunity = `Strengthen ${weakest.label.toLowerCase()} first so improvements carry through the rest of the customer journey.`;
  const risk = `If ${weakest.label.toLowerCase()} remains unresolved, stronger pillars may not translate into consistent trust or action.`;

  const answers = (fullReportAnswers || {}) as Record<string, unknown>;
  const monthlyRevenueRange =
    typeof report.monthlyRevenueRange === "string"
      ? report.monthlyRevenueRange
      : typeof answers.monthlyRevenueRange === "string"
        ? answers.monthlyRevenueRange
        : null;
  const annualRevenueRange =
    typeof report.annualRevenueRange === "string"
      ? report.annualRevenueRange
      : typeof answers.revenueRange === "string"
        ? answers.revenueRange
        : null;
  const averageTransactionValue =
    typeof report.averageTransactionValue === "string"
      ? report.averageTransactionValue
      : typeof answers.averageTransactionValue === "string"
        ? answers.averageTransactionValue
        : null;
  const conversionRateEstimate =
    typeof report.conversionRateEstimate === "string"
      ? report.conversionRateEstimate
      : typeof answers.conversionRateEstimate === "string"
        ? answers.conversionRateEstimate
        : null;
  const monthlyMarketingBudget =
    typeof report.monthlyMarketingBudget === "string"
      ? report.monthlyMarketingBudget
      : typeof answers.monthlyMarketingBudget === "string"
        ? answers.monthlyMarketingBudget
        : null;
  const businessType =
    typeof report.businessType === "string"
      ? report.businessType
      : typeof answers.businessType === "string"
        ? answers.businessType
        : null;
  const normalizedBusinessType = normalizeBusinessType(businessType);
  const promptPackLabel = `8 prompts built for ${businessName?.trim() || "your brand"}`;
  const likelyArchetype =
    typeof report.likelyArchetype === "string"
      ? report.likelyArchetype
      : typeof answers.likelyArchetype === "string"
        ? answers.likelyArchetype
        : typeof answers.archetype === "string"
          ? answers.archetype
          : null;
  const archetypeMeaning = getArchetypeMeaning(likelyArchetype);

  const monthlyRevenue = monthlyRevenueFromRanges(monthlyRevenueRange, annualRevenueRange);
  const avgValue = parseMoney(averageTransactionValue);
  const conversionRate = parseConversionRate(conversionRateEstimate);
  const canEstimateRevenueImpact = Boolean(monthlyRevenue && avgValue && conversionRate);
  const estimatedLift = canEstimateRevenueImpact
    ? Math.round((monthlyRevenue as number) * 0.1)
    : null;

  const headerProps = {
    businessName,
    date: reportDate,
    productName: PRODUCT,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Executive Summary" {...headerProps} />

        <View style={styles.introBanner}>
          <Text style={styles.introIcon}>i</Text>
          <Text style={styles.introText}>
            How to read this: Each pillar is rated out of 20. Scores are Critical (0–19%), Weak
            (20–39%), Fair (40–59%), Good (60–79%), or Strong (80–100%). The WunderBrand Score™ is
            the composite total out of 100.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.sectionDesc}>
            A high-level view of your brand’s alignment across five key pillars.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Overall Score</Text>
              <Text style={[styles.summaryValue, { color: scoreColor(score) }]}>{score}/100</Text>
              <Text style={styles.summaryMeta}>{scoreLabel(score)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Strongest Pillar</Text>
              <Text style={styles.summaryValue}>{strongest.score}/20</Text>
              <Text style={styles.summaryMeta}>{strongest.label}</Text>
            </View>
            <View style={styles.summaryCardLast}>
              <Text style={styles.summaryLabel}>Opportunity</Text>
              <Text style={styles.summaryValue}>{weakest.score}/20</Text>
              <Text style={styles.summaryMeta}>{weakest.label}</Text>
            </View>
          </View>

          <Text style={styles.diagnosisQuote}>{diagnosis}</Text>
          <Text style={styles.body}>{overview}</Text>
        </View>

        <PdfFooter businessName={businessName} productName={PRODUCT} />
      </Page>

      <Page size="A4" style={styles.page} wrap={false}>
        <PdfHeader title="WunderBrand Score™" {...headerProps} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>WunderBrand Score™</Text>
          <Text style={styles.sectionDesc}>
            A composite measure of how clearly and consistently your brand communicates across all
            five pillars.
          </Text>
          <MainGaugePDF score={score} showLegend width={220} />
          <View style={{ marginTop: 14 }}>
            <View style={[styles.signalRail, { borderLeftColor: SUITE_NAVY }]}>
              <Text style={[styles.signalLabel, { color: SUITE_NAVY }]}>Diagnosis</Text>
              <Text style={styles.signalBody}>{diagnosis}</Text>
            </View>
            <View style={[styles.signalRail, { borderLeftColor: GREEN }]}>
              <Text style={[styles.signalLabel, { color: GREEN }]}>Primary Opportunity</Text>
              <Text style={styles.signalBody}>{opportunity}</Text>
            </View>
            <View style={[styles.signalRail, { borderLeftColor: ORANGE }]}>
              <Text style={[styles.signalLabel, { color: ORANGE }]}>Risk if Unchanged</Text>
              <Text style={styles.signalBody}>{risk}</Text>
            </View>
          </View>
        </View>

        <PdfFooter businessName={businessName} productName={PRODUCT} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PdfHeader title="Pillar Scores" {...headerProps} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Brand Pillar Scores</Text>
          <Text style={styles.sectionDesc}>
            Each pillar is scored out of 20, reflecting the strength and clarity of that dimension of
            your brand.
          </Text>
          <View style={styles.metersWrap}>
            <View style={styles.meterRow}>
              <View style={styles.meterCol}>
                <PillarScoreBar label="Positioning" score={entries[0].score} maxScore={20} />
              </View>
              <View style={styles.meterColLast}>
                <PillarScoreBar label="Messaging" score={entries[1].score} maxScore={20} />
              </View>
            </View>
            <View style={styles.meterRow}>
              <View style={styles.meterCol}>
                <PillarScoreBar label="Visibility" score={entries[2].score} maxScore={20} />
              </View>
              <View style={styles.meterColLast}>
                <PillarScoreBar label="Credibility" score={entries[3].score} maxScore={20} />
              </View>
            </View>
            <View style={styles.meterRow}>
              <View style={styles.meterCol}>
                <PillarScoreBar label="Conversion" score={entries[4].score} maxScore={20} />
              </View>
              <View style={styles.meterColLast} />
            </View>
          </View>
        </View>

        <Text style={[styles.kicker, { marginBottom: 8 }]}>Detailed Breakdown</Text>
        {entries.map((pillar) => {
          const percent = (pillar.score / 20) * 100;
          const insight =
            typeof pillarInsights[pillar.key] === "string" ? pillarInsights[pillar.key] : "";
          return (
            <View key={pillar.key} style={styles.insightCard} wrap={false}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{pillar.label}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: scoreColor(percent),
                      textTransform: "uppercase",
                    }}
                  >
                    {scoreLabel(percent)}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: scoreColor(percent) }]}>
                    <Text style={styles.badgeText}>
                      {pillar.score}/20
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.insightBody}>{insight || "Insight pending for this pillar."}</Text>
            </View>
          );
        })}

        <PdfFooter businessName={businessName} productName={PRODUCT} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PdfHeader title="What’s Next" {...headerProps} />

        <View style={styles.card}>
          <Text style={styles.kicker}>Go Deeper</Text>
          <Text style={styles.sectionTitle}>Your Full Strategy Layer Is Ready</Text>
          <Text style={styles.sectionDesc}>
            Core scores are unlocked. Snapshot+ expands the diagnosis into actionable strategy.
          </Text>

          <View style={[styles.signalRail, { borderLeftColor: SUITE_ACCENT_BRIGHT, marginBottom: 10 }]}>
            <Text style={[styles.signalLabel, { color: SUITE_ACCENT_BRIGHT }]}>
              Competitive Vulnerability
            </Text>
            <Text style={styles.signalBody}>
              Your score pattern indicates an exposure around {primaryLabel}. Snapshot+ prioritizes
              which gap to address first for the fastest commercial impact.
            </Text>
          </View>

          <Text style={styles.kicker}>Identified in Your Results</Text>
          {likelyArchetype ? (
            <Text style={styles.listItem}>
              • Brand Archetype: {likelyArchetype}
              {archetypeMeaning ? ` — ${archetypeMeaning}` : ""}
            </Text>
          ) : (
            <Text style={styles.listItem}>• Brand Archetype: included in your results</Text>
          )}
          <Text style={styles.listItem}>
            • {primaryLabel} Deep Dive: dominant contributing factor identified
          </Text>
          <Text style={styles.listItem}>• Audience Alignment Gap: identified</Text>
          <Text style={styles.listItem}>• Foundational Prompt Pack: {promptPackLabel}</Text>
          <Text style={styles.listItem}>
            • Content Format & Channel Plan: {contentFormatChannelTeaser(normalizedBusinessType)}
          </Text>

          <View style={[styles.signalRail, { borderLeftColor: SUITE_ACCENT_BRIGHT, marginTop: 8 }]}>
            <Text style={[styles.signalLabel, { color: SUITE_ACCENT_BRIGHT }]}>
              Audience Alignment Gap
            </Text>
            <Text style={styles.signalBody}>
              {getAudienceAlignmentTeaser(primaryPillar as PillarKey)}
            </Text>
            <Text style={styles.ctaLabel}>Explore Snapshot+™</Text>
            <Text style={[styles.muted, { marginTop: 4 }]}>
              Unlock archetype activation, messaging frameworks, and implementation steps.
            </Text>
          </View>
        </View>

        <PdfFooter businessName={businessName} productName={PRODUCT} />
      </Page>

      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Footprint" {...headerProps} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Brand Infrastructure</Text>
          <Text style={styles.sectionDesc}>{businessName}’s footprint and commercial signals</Text>

          <Text style={styles.fieldLabel}>Business</Text>
          <Text style={styles.fieldValue}>{businessName}</Text>
          <Text style={styles.fieldLabel}>Industry</Text>
          <Text style={styles.fieldValue}>{industry || "Not provided"}</Text>
          <Text style={styles.fieldLabel}>Website</Text>
          <Text style={styles.fieldValue}>{website || "Not provided"}</Text>
          <Text style={styles.fieldLabel}>Active Platforms</Text>
          <Text style={[styles.fieldValue, { marginBottom: 0 }]}>
            {socials?.length ? socials.join(", ") : "None identified"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Marketing Spend Efficiency</Text>
          <Text style={styles.body}>
            {monthlyMarketingBudget
              ? `Based on your declared budget (${monthlyMarketingBudget}), your current highest-risk inefficiency is ${pillarRisk(
                  primaryPillar as PillarKey,
                )}.`
              : `Your score pattern suggests potential spend inefficiency through ${pillarRisk(
                  primaryPillar as PillarKey,
                )}.`}{" "}
            Snapshot+ maps where to focus first so spend works harder before scaling.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Revenue Impact</Text>
          <Text style={styles.body}>
            {canEstimateRevenueImpact && estimatedLift
              ? `Based on your inputs, addressing ${primaryLabel} could represent approximately $${estimatedLift.toLocaleString()}/month in additional revenue at conservative estimates (assuming a 10% improvement).`
              : `Your ${primaryLabel} score suggests measurable revenue drag. The likely cost appears in conversion efficiency and sales-cycle friction. Snapshot+ shows where the gap lives and what to fix first.`}
          </Text>
          <Text style={styles.ctaLabel}>Explore Snapshot+™</Text>
        </View>

        <PdfFooter businessName={businessName} productName={PRODUCT} />
      </Page>

      <DisclaimerPage tier="snapshot" />
    </Document>
  );
};

export interface BrandSnapshotReport {
  userName: string;
  businessName: string;
  industry: string;
  website: string | null;
  socials: string[];
  brandAlignmentScore: number;
  pillarScores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
  pillarInsights: {
    positioning: string;
    messaging: string;
    visibility: string;
    credibility: string;
    conversion: string;
  };
  recommendations: {
    positioning: string;
    messaging: string;
    visibility: string;
    credibility: string;
    conversion: string;
  };
  fullReportAnswers?: Record<string, unknown>;
  businessType?: string | null;
  monthlyMarketingBudget?: string | null;
  monthlyRevenueRange?: string | null;
  annualRevenueRange?: string | null;
  averageTransactionValue?: string | null;
  conversionRateEstimate?: string | null;
  likelyArchetype?: string | null;
}
