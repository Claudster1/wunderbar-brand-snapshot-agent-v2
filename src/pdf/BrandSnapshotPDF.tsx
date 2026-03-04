// src/pdf/BrandSnapshotPDF.tsx
// WunderBrand Snapshot™ PDF Document (Free tier)
// Uses reusable components for consistent styling

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { PdfHeader } from "./components/PdfHeader";
import { PdfFooter } from "./components/PdfFooter";
import { PageTitle } from "./components/PageTitle";
import { Section } from "./components/Section";
import { PillarScoreBar } from "./components/PillarScoreBar";
import { InsightBlock } from "./components/InsightBlock";
import { RecommendationBlock } from "./components/RecommendationBlock";
import { pdfTheme } from "./theme";
import { registerPdfFonts } from "./registerFonts";
import { DisclaimerPage } from "./components/DisclaimerPage";
import { getPrimaryPillar } from "@/src/lib/pillars/getPrimaryPillar";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";

// Register fonts
registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    paddingBottom: pdfTheme.spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: pdfTheme.colors.border,
    marginVertical: pdfTheme.spacing.lg,
  },
  smallHeading: {
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  body: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
  },
  scoreDisplay: {
    marginTop: pdfTheme.spacing.lg,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
  },
});

type PillarKey = "positioning" | "messaging" | "visibility" | "credibility" | "conversion";

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
    month: "long",
    day: "numeric",
  });

  const {
    userName,
    businessName,
    industry,
    website,
    socials,
    brandAlignmentScore,
    pillarScores,
    pillarInsights,
    recommendations,
    fullReportAnswers,
  } = report;
  const primaryResult = getPrimaryPillar(pillarScores as any);
  const primaryPillar =
    (primaryResult.type === "tie" ? primaryResult.pillars?.[0] : primaryResult.pillar) ||
    "positioning";
  const primaryLabel = primaryPillar.charAt(0).toUpperCase() + primaryPillar.slice(1);

  const answers = (fullReportAnswers || {}) as Record<string, unknown>;
  const monthlyRevenueRange =
    (typeof report.monthlyRevenueRange === "string"
      ? report.monthlyRevenueRange
      : typeof answers.monthlyRevenueRange === "string"
        ? answers.monthlyRevenueRange
        : null);
  const annualRevenueRange =
    (typeof report.annualRevenueRange === "string"
      ? report.annualRevenueRange
      : typeof answers.revenueRange === "string"
        ? answers.revenueRange
        : null);
  const averageTransactionValue =
    (typeof report.averageTransactionValue === "string"
      ? report.averageTransactionValue
      : typeof answers.averageTransactionValue === "string"
        ? answers.averageTransactionValue
        : null);
  const conversionRateEstimate =
    (typeof report.conversionRateEstimate === "string"
      ? report.conversionRateEstimate
      : typeof answers.conversionRateEstimate === "string"
        ? answers.conversionRateEstimate
        : null);
  const monthlyMarketingBudget =
    (typeof report.monthlyMarketingBudget === "string"
      ? report.monthlyMarketingBudget
      : typeof answers.monthlyMarketingBudget === "string"
        ? answers.monthlyMarketingBudget
        : null);
  const businessType =
    (typeof report.businessType === "string"
      ? report.businessType
      : typeof answers.businessType === "string"
        ? answers.businessType
        : null);
  const normalizedBusinessType = normalizeBusinessType(businessType);
  const promptPackLabel = `8 prompts built for ${businessName?.trim() || "your brand"}`;
  const likelyArchetype =
    (typeof report.likelyArchetype === "string"
      ? report.likelyArchetype
      : typeof answers.likelyArchetype === "string"
        ? answers.likelyArchetype
        : typeof answers.archetype === "string"
          ? answers.archetype
          : null);
  const archetypeMeaning = getArchetypeMeaning(likelyArchetype);
  const archetypeIcon = getArchetypeIcon(likelyArchetype);

  const monthlyRevenue = monthlyRevenueFromRanges(monthlyRevenueRange, annualRevenueRange);
  const avgValue = parseMoney(averageTransactionValue);
  const conversionRate = parseConversionRate(conversionRateEstimate);
  const canEstimateRevenueImpact = Boolean(monthlyRevenue && avgValue && conversionRate);
  const estimatedLift = canEstimateRevenueImpact
    ? Math.round((monthlyRevenue as number) * 0.1)
    : null;

  return (
    <Document>
      {/* ---------------- PAGE 1 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="WunderBrand Snapshot™ Report" businessName={businessName} date={reportDate} />

        <PageTitle
          title={`${businessName} — WunderBrand Snapshot™`}
          subtitle="Strategic brand diagnostic across five core performance pillars"
        />

        <Section>
          <Text style={styles.smallHeading}>Executive Summary</Text>
          <Text style={styles.smallHeading}>WunderBrand Score™</Text>

          <Text style={styles.body}>
            {businessName}&rsquo;s WunderBrand Score™ evaluates how clearly and consistently the brand performs across positioning, messaging, visibility, credibility, and conversion — the five pillars that drive growth, trust, and competitive advantage.
          </Text>

          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreNumber}>
              {brandAlignmentScore}/100
            </Text>
            <Text style={{ fontSize: pdfTheme.fontSizes.sm, color: "#5a6c8a", marginTop: 4 }}>
              {brandAlignmentScore >= 80 ? "Strong alignment — focus on refinement and consistency at scale" :
               brandAlignmentScore >= 60 ? "Solid foundation — targeted pillar investment will compound" :
               brandAlignmentScore >= 40 ? "Clear strengths with material improvement opportunities" :
               "Foundational work ahead — clarity now creates disproportionate returns"}
            </Text>
          </View>
        </Section>

        <Section>
          <Text style={styles.smallHeading}>Pillar-by-Pillar Performance</Text>

          <PillarScoreBar label="Positioning" score={pillarScores.positioning} />
          <PillarScoreBar label="Messaging" score={pillarScores.messaging} />
          <PillarScoreBar label="Visibility" score={pillarScores.visibility} />
          <PillarScoreBar label="Credibility" score={pillarScores.credibility} />
          <PillarScoreBar label="Conversion" score={pillarScores.conversion} />
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Snapshot™" />
      </Page>

      {/* ---------------- PAGE 2 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Pillar Insights" />

        <PageTitle title="Diagnostic Insights" subtitle={`What the data reveals about ${businessName}\u2019s brand performance`} />

        <Section>
          <InsightBlock
            title="Positioning"
            text={pillarInsights.positioning}
          />
        </Section>

        <Section>
          <InsightBlock
            title="Messaging"
            text={pillarInsights.messaging}
          />
        </Section>

        <Section>
          <InsightBlock
            title="Visibility"
            text={pillarInsights.visibility}
          />
        </Section>

        <Section>
          <InsightBlock
            title="Credibility"
            text={pillarInsights.credibility}
          />
        </Section>

        <Section>
          <InsightBlock
            title="Conversion"
            text={pillarInsights.conversion}
          />
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Snapshot™" />
      </Page>

      {/* ---------------- PAGE 3 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Free Snapshot Unlock Preview" />
        
        <PageTitle
          title="Your Full Results Are Ready"
          subtitle="You are seeing your core score outputs; the deeper strategy layer is identified and waiting."
        />

        <Section>
          <Text style={styles.smallHeading}>Competitive Vulnerability Signal</Text>
          <Text style={styles.body}>
            Your score pattern indicates an exposure around {primaryLabel}. Snapshot+ prioritizes
            which gap to address first for the fastest commercial impact.
          </Text>
        </Section>

        <Section>
          <Text style={styles.smallHeading}>Locked Sections Identified</Text>
          {likelyArchetype ? (
            <Text style={styles.body}>
              - Your Brand Archetype: {archetypeIcon} {likelyArchetype}
              {archetypeMeaning ? ` — ${archetypeMeaning}` : ""}
            </Text>
          ) : (
            <Text style={styles.body}>- Your Brand Archetype: included in your results</Text>
          )}
          <Text style={styles.body}>
            - {primaryLabel} Deep Dive: dominant contributing factor identified, available in Snapshot+
          </Text>
          <Text style={styles.body}>- Audience Alignment Gap: identified, available in Snapshot+</Text>
          <Text style={styles.body}>- Foundational Prompt Pack: {promptPackLabel}, available in Snapshot+</Text>
          <Text style={styles.body}>
            - Content Format & Channel Recommendations: {contentFormatChannelTeaser(
              normalizedBusinessType,
            )}
          </Text>
        </Section>

        <Section>
          <Text style={styles.smallHeading}>Audience Alignment Gap (Preview)</Text>
          <Text style={styles.body}>{getAudienceAlignmentTeaser(primaryPillar as PillarKey)}</Text>
        </Section>

        <Section>
          <Text style={styles.smallHeading}>Call to Action</Text>
          <Text style={styles.body}>See Your Full Results — $497</Text>
          <Text style={styles.body}>
            Get full archetype activation guidance and implementation steps in Snapshot+.
          </Text>
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Snapshot™" />
      </Page>

      {/* ---------------- PAGE 4 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Foundations Summary" />

        <PageTitle
          title="Brand Footprint"
          subtitle={`${businessName}\u2019s current brand infrastructure`}
        />

        <Section>
          <View style={{ backgroundColor: pdfTheme.colors.gray, padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={styles.body}>
              <Text style={{ fontWeight: 700 }}>Business:</Text> {businessName}
              {"\n"}
              <Text style={{ fontWeight: 700 }}>Industry:</Text> {industry}
              {"\n"}
              <Text style={{ fontWeight: 700 }}>Website:</Text> {website || "Not provided"}
              {"\n"}
              <Text style={{ fontWeight: 700 }}>Active platforms:</Text>{" "}
              {socials?.length ? socials.join(", ") : "None identified"}
            </Text>
          </View>
        </Section>

        <Section>
          <View style={{ backgroundColor: "#F2F7FF", padding: 20, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#07B0F2" }}>
            <Text style={{ ...styles.smallHeading, marginBottom: 8 }}>Marketing Spend Efficiency Signal</Text>
            <Text style={styles.body}>
              {monthlyMarketingBudget
                ? `Based on your declared budget (${monthlyMarketingBudget}), your current highest-risk inefficiency is ${pillarRisk(
                    primaryPillar as PillarKey,
                  )}.`
                : `Your score pattern suggests potential spend inefficiency through ${pillarRisk(
                    primaryPillar as PillarKey,
                  )}.`}{" "}
              Snapshot+ maps exactly where to focus first so spend works harder before scaling.
            </Text>
          </View>
        </Section>

        <Section>
          <View style={{ backgroundColor: "#F7FBFF", padding: 20, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#021859" }}>
            <Text style={{ ...styles.smallHeading, marginBottom: 8 }}>Revenue Impact Statement</Text>
            <Text style={styles.body}>
              {canEstimateRevenueImpact && estimatedLift
                ? `Based on your inputs, addressing ${primaryLabel} could represent approximately $${estimatedLift.toLocaleString()}/month in additional revenue at conservative estimates (assuming a 10% improvement).`
                : `Your ${primaryLabel} score suggests measurable revenue drag. The likely cost appears in conversion efficiency and sales-cycle friction. Snapshot+ shows where the gap lives and what to fix first.`}
            </Text>
            <Text style={{ ...styles.body, marginTop: 12, fontWeight: 600, color: pdfTheme.colors.blue }}>
              See Your Full Results — $497
            </Text>
          </View>
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Snapshot™" />
      </Page>

      <DisclaimerPage tier="snapshot" />
    </Document>
  );
};

// ------------------------
// TYPES
// ------------------------
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
