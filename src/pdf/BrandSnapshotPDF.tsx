// src/pdf/BrandSnapshotPDF.tsx
// Brand Snapshot™ PDF Document (Free tier)
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
        <PdfHeader title="Brand Snapshot™ Report" />

        <PageTitle
          title="Your Brand Snapshot™"
          subtitle="A concise, insight-led overview of your brand's current alignment"
        />

        <Section>
          <Text style={styles.smallHeading}>Brand Alignment Score™</Text>

          <Text style={styles.body}>
            Your Brand Alignment Score™ represents how clearly and consistently your
            brand shows up today across five core pillars: Positioning, Messaging,
            Visibility, Credibility, and Conversion.
          </Text>

          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreNumber}>
              {brandAlignmentScore}/100
            </Text>
          </View>
        </Section>

        <Section>
          <Text style={styles.smallHeading}>Pillar Breakdown</Text>

          <PillarScoreBar label="Positioning" score={pillarScores.positioning} />
          <PillarScoreBar label="Messaging" score={pillarScores.messaging} />
          <PillarScoreBar label="Visibility" score={pillarScores.visibility} />
          <PillarScoreBar label="Credibility" score={pillarScores.credibility} />
          <PillarScoreBar label="Conversion" score={pillarScores.conversion} />
        </Section>

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 2 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Pillar Insights" />

        <PageTitle title="Your Brand Insights" subtitle="High-level opportunities" />

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

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 3 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Next Steps" />
        
        <PageTitle
          title="Strategic Recommendations"
          subtitle="Quick wins to strengthen alignment across your brand"
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

        <PdfFooter />
      </Page>

      {/* ---------------- PAGE 4 ---------------- */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Foundations Summary" />

        <PageTitle
          title="Your Brand Foundations"
          subtitle="A snapshot of your current brand footprint"
        />

        <Section>
          <Text style={styles.smallHeading}>Business Overview</Text>
          <Text style={styles.body}>
            <Text style={{ fontWeight: 600 }}>Business Name:</Text> {businessName}
            {"\n"}
            <Text style={{ fontWeight: 600 }}>Industry:</Text> {industry}
            {"\n"}
            <Text style={{ fontWeight: 600 }}>Website:</Text> {website || "None"}
            {"\n"}
            <Text style={{ fontWeight: 600 }}>Social Platforms:</Text>{" "}
            {socials?.length ? socials.join(", ") : "None"}
          </Text>
        </Section>

        <Section>
          <View style={{ backgroundColor: "#F2F7FF", padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#07B0F2" }}>
            <Text style={{ ...styles.smallHeading, marginBottom: 8 }}>Ready for more?</Text>
            <Text style={styles.body}>
              Upgrade to Brand Snapshot+™ for a deeper strategic report — including brand persona,
              archetype, voice guidance, recommended color palette, 30/60/90 roadmap, and AI-ready prompts.
            </Text>
            <Text style={{ ...styles.body, marginTop: 8, fontSize: 10, color: "#5a6c8a" }}>
              Explore at wunderbardigital.com/brand-snapshot/plus
            </Text>
          </View>
        </Section>

        <PdfFooter />
      </Page>
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
