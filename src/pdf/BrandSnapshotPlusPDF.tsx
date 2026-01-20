// src/pdf/BrandSnapshotPlusPDF.tsx
// Brand Snapshot+™ PDF Document ($249)
// Includes full structured AEO section as required for this tier

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
import { PillarScoreRow } from "./components/PillarScoreRow";
import { InsightBlock } from "./components/InsightBlock";
import { RecommendationBlock } from "./components/RecommendationBlock";
import { ColorSwatch } from "./components/ColorSwatch";
import { ScoreGauge } from "./components/ScoreGauge";
import { ContextCoverageMeter } from "./components/ContextCoverageMeter";
import { pdfTheme } from "./theme";
import { registerPdfFonts } from "./registerFonts";
import { getPrimaryPillar } from "@/src/lib/pillars/getPrimaryPillar";
import { PILLAR_COPY } from "@/lib/pillars/pillarCopy";

// Types
import { BrandSnapshotReport } from "./BrandSnapshotPDF";

// Register fonts
registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    paddingBottom: pdfTheme.spacing.xl,
  },
  heading: {
    fontSize: pdfTheme.fontSizes.xl,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  subheading: {
    fontSize: pdfTheme.fontSizes.md,
    fontWeight: 500,
    color: pdfTheme.colors.midnight,
    marginTop: pdfTheme.spacing.sm,
    marginBottom: pdfTheme.spacing.sm,
  },
  para: {
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
    marginBottom: pdfTheme.spacing.md,
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
  },
});

export interface BrandSnapshotPlusReport extends BrandSnapshotReport {
  personalityWords?: string[];
  competitorNames?: string[];
  targetCustomers?: string;
  brandOpportunities?: string;
  messagingGaps?: string;
  visibilityPlan?: string;
  visualIdentityNotes?: string;
  aiPrompts?: string[];
  contextCoverage?: number; // 0-100 percentage
  // AEO recommendations (required for Snapshot+)
  aeoRecommendations?: {
    keywordClarity?: string;
    messagingStructure?: string;
    visualOptimization?: string;
    performanceHeuristics?: string;
    prioritizationMatrix?: string;
    practicalActions?: string[];
    industryGuidance?: string;
  };
}

export const BrandSnapshotPlusPDF = ({
  report,
}: {
  report: BrandSnapshotPlusReport;
}) => {
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
    personalityWords = [],
    competitorNames = [],
    targetCustomers,
    brandOpportunities,
    messagingGaps,
    visibilityPlan,
    visualIdentityNotes,
    aiPrompts = [],
    aeoRecommendations,
    contextCoverage,
  } = report;

  const primaryPillar = getPrimaryPillar(pillarScores);
  const primaryPillarCopy = PILLAR_COPY[primaryPillar];

  return (
    <Document>
      {/* ---------------- PAGE 1 — EXEC SUMMARY ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Snapshot+™ Report" />

        <PageTitle
          title="Your Brand Snapshot+™"
          subtitle="A deeper, strategic review of your brand foundation and growth opportunities"
        />

        <Section>
          <Text style={styles.heading}>Executive Summary</Text>
          <Text style={styles.para}>
            This expanded Snapshot+™ builds on your initial Brand Snapshot™, offering
            strategic insight into how clearly, confidently, and consistently your brand
            shows up today — and where meaningful improvements can accelerate trust,
            differentiation, and conversion.
          </Text>

          {/* Brand Alignment Score Gauge */}
          <View style={{ marginTop: pdfTheme.spacing.lg, alignItems: "center" }}>
            <ScoreGauge value={brandAlignmentScore} size={100} />
          </View>

          {/* Primary Pillar Highlight */}
          <View style={{ marginTop: pdfTheme.spacing.lg }}>
            <Text style={styles.subheading}>Primary Opportunity</Text>
            <Text style={styles.para}>
              <Text style={{ fontWeight: 600 }}>
                {primaryPillarCopy.label}
              </Text>
              {" — "}
              {primaryPillarCopy.headline(businessName)}
            </Text>
            <Text style={{ ...styles.para, fontSize: pdfTheme.fontSizes.sm, color: "#6B7280" }}>
              {primaryPillarCopy.whyItMatters(businessName)}
            </Text>
          </View>

          {/* Context Coverage Meter */}
          {contextCoverage !== undefined && (
            <ContextCoverageMeter percent={contextCoverage} />
          )}
        </Section>

        {brandOpportunities && (
          <Section>
            <Text style={styles.subheading}>Core Brand Opportunities</Text>
            <Text style={styles.para}>{brandOpportunities}</Text>
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 2 — PILLAR DEEP DIVES ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Pillar Deep-Dive" />

        <PageTitle
          title="Brand Pillar Analysis"
          subtitle="What's working — and where refinement unlocks clarity"
        />

        <Section>
          <PillarScoreRow
            label="Positioning"
            score={pillarScores.positioning}
            emphasis={primaryPillar === "positioning"}
          />
          <InsightBlock title="Positioning Insight" text={pillarInsights.positioning} />
          <RecommendationBlock title="Positioning Opportunity" text={recommendations.positioning} />
        </Section>

        <Section>
          <PillarScoreRow
            label="Messaging"
            score={pillarScores.messaging}
            emphasis={primaryPillar === "messaging"}
          />
          <InsightBlock title="Messaging Insight" text={pillarInsights.messaging} />
          <RecommendationBlock 
            title="Messaging Opportunity" 
            text={messagingGaps || recommendations.messaging} 
          />
        </Section>

        <Section>
          <PillarScoreRow
            label="Visibility"
            score={pillarScores.visibility}
            emphasis={primaryPillar === "visibility"}
          />
          <InsightBlock title="Visibility Insight" text={pillarInsights.visibility} />
          <RecommendationBlock 
            title="Visibility Opportunity" 
            text={visibilityPlan || recommendations.visibility} 
          />
        </Section>

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 3 — PILLAR CONTINUED ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Pillar Deep-Dive (Cont.)" />

        <Section>
          <PillarScoreRow
            label="Credibility"
            score={pillarScores.credibility}
            emphasis={primaryPillar === "credibility"}
          />
          <InsightBlock title="Credibility Insight" text={pillarInsights.credibility} />
          <RecommendationBlock title="Credibility Opportunity" text={recommendations.credibility} />
        </Section>

        <Section>
          <PillarScoreRow
            label="Conversion"
            score={pillarScores.conversion}
            emphasis={primaryPillar === "conversion"}
          />
          <InsightBlock title="Conversion Insight" text={pillarInsights.conversion} />
          <RecommendationBlock title="Conversion Opportunity" text={recommendations.conversion} />
        </Section>

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 4 — AEO SECTION (REQUIRED for Visibility) ---------------- */}
      {aeoRecommendations && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="AEO Strategy" />

          <PageTitle
            title="Answer Engine Optimization (AEO)"
            subtitle="Full structured AEO section — ensuring your brand shows up in AI search results"
          />

          {aeoRecommendations.keywordClarity && (
            <Section>
              <Text style={styles.heading}>Keyword Clarity</Text>
              <Text style={styles.para}>{aeoRecommendations.keywordClarity}</Text>
            </Section>
          )}

          {aeoRecommendations.messagingStructure && (
            <Section>
              <Text style={styles.heading}>Messaging Structure</Text>
              <Text style={styles.para}>{aeoRecommendations.messagingStructure}</Text>
            </Section>
          )}

          {aeoRecommendations.visualOptimization && (
            <Section>
              <Text style={styles.heading}>Visual Optimization</Text>
              <Text style={styles.para}>{aeoRecommendations.visualOptimization}</Text>
            </Section>
          )}

          {aeoRecommendations.performanceHeuristics && (
            <Section>
              <Text style={styles.heading}>Performance Heuristics</Text>
              <Text style={styles.para}>{aeoRecommendations.performanceHeuristics}</Text>
            </Section>
          )}

          {aeoRecommendations.prioritizationMatrix && (
            <Section>
              <Text style={styles.heading}>Prioritization Matrix</Text>
              <Text style={styles.para}>{aeoRecommendations.prioritizationMatrix}</Text>
            </Section>
          )}

          {aeoRecommendations.practicalActions && aeoRecommendations.practicalActions.length > 0 && (
            <Section>
              <Text style={styles.heading}>Practical Actions</Text>
              {aeoRecommendations.practicalActions.map((action, i) => (
                <Text key={i} style={{ ...styles.para, marginBottom: pdfTheme.spacing.sm }}>
                  {i + 1}. {action}
                </Text>
              ))}
            </Section>
          )}

          {aeoRecommendations.industryGuidance && (
            <Section>
              <Text style={styles.heading}>Industry-Specific Guidance</Text>
              <Text style={styles.para}>{aeoRecommendations.industryGuidance}</Text>
            </Section>
          )}

          <PdfFooter />
        </Page>
      )}

      {/* ---------------- PAGE 5 — AUDIENCE, COMPETITORS, PERSONALITY ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Foundations" />

        <PageTitle
          title="Brand Foundations & Landscape"
          subtitle="Understanding your market position"
        />

        {targetCustomers && (
          <Section>
            <Text style={styles.heading}>Audience Summary</Text>
            <Text style={styles.para}>{targetCustomers}</Text>
          </Section>
        )}

        <Section>
          <Text style={styles.heading}>Competitor Awareness</Text>
          <Text style={styles.para}>
            {competitorNames?.length
              ? competitorNames.join(", ")
              : "No competitors listed"}
          </Text>
        </Section>

        {personalityWords && personalityWords.length > 0 && (
          <Section>
            <Text style={styles.heading}>Brand Personality</Text>
            <Text style={styles.para}>{personalityWords.join(", ")}</Text>
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 6 — VISUAL IDENTITY ---------------- */}
      {visualIdentityNotes && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="Visual Identity" />

          <PageTitle
            title="Visual Identity Overview"
            subtitle="How your brand shows up visually"
          />

          <Section>
            <Text style={styles.heading}>Visual Strengths & Opportunities</Text>
            <Text style={styles.para}>{visualIdentityNotes}</Text>
          </Section>

          <PdfFooter />
        </Page>
      )}

      {/* ---------------- PAGE 7 — AI PROMPTS & NEXT STEPS ---------------- */}
      {aiPrompts && aiPrompts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="AI Prompt Pack" />

          <PageTitle
            title="AI-Ready Prompt Starter Pack"
            subtitle="Strategic prompts that help you apply your brand with consistency"
          />

          <Section>
            {aiPrompts.map((p, i) => (
              <Text
                key={i}
                style={{
                  marginBottom: pdfTheme.spacing.md,
                  fontSize: pdfTheme.fontSizes.base,
                  lineHeight: 1.5,
                }}
              >
                {i + 1}. {p}
              </Text>
            ))}
          </Section>

          <Section>
            <Text style={styles.heading}>Next Steps</Text>
            <Text style={styles.para}>
              Your Snapshot+™ gives you a strong foundation. If you'd like a complete,
              AI-ready brand system — messaging, voice, positioning, personality, and
              visual direction — the Brand Blueprint™ ($749) is your next step.
            </Text>
          </Section>

          <PdfFooter />
        </Page>
      )}

    </Document>
  );
};
