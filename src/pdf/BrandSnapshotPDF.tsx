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
  } = report;

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
        <PdfHeader title="Next Steps" />
        
        <PageTitle
          title="Strategic Recommendations"
          subtitle={`Priority actions to strengthen ${businessName}\u2019s brand performance`}
        />

        <Section>
          <RecommendationBlock
            title="Positioning"
            text={recommendations.positioning}
          />
        </Section>

        <Section>
          <RecommendationBlock
            title="Messaging"
            text={recommendations.messaging}
          />
        </Section>

        <Section>
          <RecommendationBlock
            title="Visibility"
            text={recommendations.visibility}
          />
        </Section>

        <Section>
          <RecommendationBlock
            title="Credibility"
            text={recommendations.credibility}
          />
        </Section>

        <Section>
          <RecommendationBlock
            title="Conversion"
            text={recommendations.conversion}
          />
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
            <Text style={{ ...styles.smallHeading, marginBottom: 8 }}>Go deeper with Snapshot+™</Text>
            <Text style={styles.body}>
              This diagnostic identified where {businessName} stands. Snapshot+™ transforms these scores into a strategic roadmap — with brand persona analysis, archetype system, voice and tone guide, recommended color palette, a prioritized 30/60/90 action plan, and 8 AI-ready prompts calibrated to your brand.
            </Text>
            <Text style={{ ...styles.body, marginTop: 12, fontWeight: 600, color: pdfTheme.colors.blue }}>
              wunderbrand.ai/snapshot-plus
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
}
