// src/pdf/BrandBlueprintPDF.tsx
// WunderBrand Blueprint™ PDF Document ($997)
// Includes AEO integrated with brand strategy

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
import { InsightBlock } from "./components/InsightBlock";
import { RecommendationBlock } from "./components/RecommendationBlock";
import { ColorSwatch } from "./components/ColorSwatch";
import { pdfTheme } from "./theme";
import { registerPdfFonts } from "./registerFonts";

// Register fonts
registerPdfFonts();

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    paddingBottom: pdfTheme.spacing.xl,
    paddingTop: pdfTheme.spacing.lg,
  },
  heading: {
    fontSize: pdfTheme.fontSizes.xl,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  subheading: {
    fontSize: pdfTheme.fontSizes.md,
    fontWeight: 600,
    color: pdfTheme.colors.midnight,
    marginTop: pdfTheme.spacing.md,
    marginBottom: pdfTheme.spacing.sm,
  },
  para: {
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
    marginBottom: pdfTheme.spacing.md,
  },
});

export interface BrandBlueprintReport {
  userName: string;
  businessName: string;
  industry?: string;
  targetCustomers?: string;
  competitorNames?: string[];
  brandPersonalityWords?: string[];
  brandVoiceDescription?: string;
  positioningStatement?: string;
  valueProposition?: string;
  differentiation?: string;
  brandPromise?: string;
  brandProofPoints?: string[];
  narrative?: string;
  toneGuidelines?: string[];
  audienceSegments?: { label: string; description: string }[];
  brandArchetype?: string;
  brandTheme?: string;
  colorPalette?: { name: string; hex: string; role?: string; meaning?: string }[];
  contentPillars?: { title: string; description: string }[];
  aiPrompts?: string[];
  visualDirection?: string;
  opportunities?: string;
  // AEO integrated strategy (required for Blueprint tier)
  aeoIntegratedStrategy?: {
    messagingFramework?: string;
    positioningForAI?: string;
    contentStrategy?: string;
    visibilityPriorities?: string;
    competitorGapAnalysis?: string;
  };
}

export const BrandBlueprintPDF = ({
  report,
}: {
  report: BrandBlueprintReport;
}) => {
  const {
    userName,
    businessName,
    industry,
    targetCustomers,
    competitorNames = [],
    brandPersonalityWords = [],
    brandVoiceDescription,
    positioningStatement,
    valueProposition,
    differentiation,
    brandPromise,
    brandProofPoints = [],
    narrative,
    toneGuidelines = [],
    audienceSegments = [],
    brandArchetype,
    brandTheme,
    colorPalette = [],
    contentPillars = [],
    aiPrompts = [],
    visualDirection,
    opportunities,
    aeoIntegratedStrategy,
  } = report;

  return (
    <Document>
      {/* ------------ PAGE 1 — EXECUTIVE SUMMARY ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="WunderBrand Blueprint™" />

        <PageTitle
          title="Your WunderBrand Blueprint™"
          subtitle="A complete, AI-ready brand foundation"
        />

        <Section>
          <Text style={styles.heading}>Executive Summary</Text>
          <Text style={styles.para}>
            This WunderBrand Blueprint™ captures the essential elements of your brand —
            including your positioning, narrative, voice, personality, audience,
            differentiation, and visual direction. It serves as the foundation for
            consistent communication, effective marketing, and AI-powered brand application.
          </Text>

          <Text style={styles.para}>
            It is designed to support both human teams and AI systems, ensuring your
            brand shows up with clarity, consistency, and confidence across every channel.
          </Text>
        </Section>

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 2 — POSITIONING SYSTEM ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Positioning System" />

        <PageTitle
          title="Brand Positioning"
          subtitle="The strategic foundation for differentiation"
        />

        {positioningStatement && (
          <Section>
            <Text style={styles.subheading}>Positioning Statement</Text>
            <Text style={styles.para}>{positioningStatement}</Text>
          </Section>
        )}

        {valueProposition && (
          <Section>
            <Text style={styles.subheading}>Value Proposition</Text>
            <Text style={styles.para}>{valueProposition}</Text>
          </Section>
        )}

        {differentiation && (
          <Section>
            <Text style={styles.subheading}>Differentiation Strategy</Text>
            <Text style={styles.para}>{differentiation}</Text>
          </Section>
        )}

        {aeoIntegratedStrategy?.positioningForAI && (
          <Section>
            <Text style={styles.subheading}>Positioning for AI Discoverability</Text>
            <Text style={styles.para}>{aeoIntegratedStrategy.positioningForAI}</Text>
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 3 — BRAND PROMISE & PROOF ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Commitment" />

        <PageTitle
          title="Brand Promise"
          subtitle="What your brand stands for — and how you deliver on it"
        />

        {brandPromise && (
          <Section>
            <Text style={styles.subheading}>Brand Promise</Text>
            <Text style={styles.para}>{brandPromise}</Text>
          </Section>
        )}

        {brandProofPoints && brandProofPoints.length > 0 && (
          <Section>
            <Text style={styles.subheading}>Proof Points</Text>
            {brandProofPoints.map((p, i) => (
              <Text key={i} style={styles.para}>• {p}</Text>
            ))}
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 4 — BRAND NARRATIVE ------------ */}
      {narrative && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="Brand Narrative" />

          <PageTitle
            title="Brand Narrative"
            subtitle="The story your brand tells — and why it matters"
          />

          <Section>
            <Text style={styles.para}>{narrative}</Text>
          </Section>

          <PdfFooter />
        </Page>
      )}

      {/* ------------ PAGE 5 — VOICE & TONE ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Voice & Tone" />

        <PageTitle
          title="Voice & Tone"
          subtitle="How your brand speaks across every context"
        />

        {brandVoiceDescription && (
          <Section>
            <Text style={styles.subheading}>Brand Voice</Text>
            <Text style={styles.para}>{brandVoiceDescription}</Text>
          </Section>
        )}

        {aeoIntegratedStrategy?.messagingFramework && (
          <Section>
            <Text style={styles.subheading}>Messaging Framework (AEO-Optimized)</Text>
            <Text style={styles.para}>{aeoIntegratedStrategy.messagingFramework}</Text>
          </Section>
        )}

        {toneGuidelines && toneGuidelines.length > 0 && (
          <Section>
            <Text style={styles.subheading}>Tone Guidelines</Text>
            {toneGuidelines.map((t, i) => (
              <Text key={i} style={styles.para}>• {t}</Text>
            ))}
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 6 — AUDIENCE SEGMENTS ------------ */}
      {audienceSegments && audienceSegments.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="Audience Blueprint" />

          <PageTitle
            title="Audience Segmentation"
            subtitle="Who you serve — and what they care about"
          />

          {audienceSegments.map((seg, i) => (
            <Section key={i}>
              <Text style={styles.subheading}>{seg.label}</Text>
              <Text style={styles.para}>{seg.description}</Text>
            </Section>
          ))}

          <PdfFooter />
        </Page>
      )}

      {/* ------------ PAGE 7 — BRAND PERSONALITY ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Brand Personality" />

        <PageTitle
          title="Brand Personality & Archetype"
          subtitle="The character behind your brand"
        />

        {brandPersonalityWords && brandPersonalityWords.length > 0 && (
          <Section>
            <Text style={styles.subheading}>Personality Words</Text>
            <Text style={styles.para}>{brandPersonalityWords.join(", ")}</Text>
          </Section>
        )}

        {brandArchetype && (
          <Section>
            <Text style={styles.subheading}>Brand Archetype</Text>
            <Text style={styles.para}>{brandArchetype}</Text>
          </Section>
        )}

        {brandTheme && (
          <Section>
            <Text style={styles.subheading}>Brand Theme</Text>
            <Text style={styles.para}>{brandTheme}</Text>
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 8 — COMPETITIVE LANDSCAPE & AEO ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Competitive Landscape" />

        <PageTitle
          title="Competitive Context & AI-Powered Analysis"
          subtitle="How your brand fits into the market"
        />

        <Section>
          <Text style={styles.heading}>Key Competitors</Text>
          <Text style={styles.para}>
            {competitorNames?.length
              ? competitorNames.join(", ")
              : "No competitors were provided."}
          </Text>
        </Section>

        {aeoIntegratedStrategy?.competitorGapAnalysis && (
          <Section>
            <Text style={styles.heading}>AI-Powered Competitor Gap Analysis</Text>
            <Text style={styles.para}>{aeoIntegratedStrategy.competitorGapAnalysis}</Text>
          </Section>
        )}

        {opportunities && (
          <Section>
            <Text style={styles.heading}>Opportunity Overview</Text>
            <Text style={styles.para}>{opportunities}</Text>
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 9 — VISUAL DIRECTION ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Visual Identity" />

        <PageTitle
          title="Visual Direction"
          subtitle="The look-and-feel that reinforces your brand"
        />

        {visualDirection && (
          <Section>
            <Text style={styles.para}>{visualDirection}</Text>
          </Section>
        )}

        {colorPalette && colorPalette.length > 0 && (
          <Section>
            <Text style={styles.subheading}>Color Palette</Text>
            {colorPalette.map((c, i) => (
              <View key={i} style={{ marginBottom: pdfTheme.spacing.sm }}>
                <ColorSwatch name={c.name} hex={c.hex} />
                {c.role && (
                  <Text style={{ ...styles.para, fontSize: pdfTheme.fontSizes.sm, marginTop: pdfTheme.spacing.xs }}>
                    Role: {c.role}
                  </Text>
                )}
                {c.meaning && (
                  <Text style={{ ...styles.para, fontSize: pdfTheme.fontSizes.sm }}>
                    Meaning: {c.meaning}
                  </Text>
                )}
              </View>
            ))}
          </Section>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 10 — CONTENT STRATEGY & AEO ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Content Strategy" />

        <PageTitle
          title="Content Strategy & AEO Integration"
          subtitle="Strategic themes that guide your marketing"
        />

        {aeoIntegratedStrategy?.contentStrategy && (
          <Section>
            <Text style={styles.heading}>Content Strategy for AI Reference</Text>
            <Text style={styles.para}>{aeoIntegratedStrategy.contentStrategy}</Text>
          </Section>
        )}

        {aeoIntegratedStrategy?.visibilityPriorities && (
          <Section>
            <Text style={styles.heading}>Visibility Priorities (SEO + AEO)</Text>
            <Text style={styles.para}>{aeoIntegratedStrategy.visibilityPriorities}</Text>
          </Section>
        )}

        {contentPillars && contentPillars.length > 0 && (
          <>
            {contentPillars.map((p, i) => (
              <Section key={i}>
                <Text style={styles.subheading}>{p.title}</Text>
                <Text style={styles.para}>{p.description}</Text>
              </Section>
            ))}
          </>
        )}

        <PdfFooter />
      </Page>

      {/* ------------ PAGE 11 — AI PROMPT PACK ------------ */}
      {aiPrompts && aiPrompts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="AI Prompt Pack" />

          <PageTitle
            title="AI Prompt Pack"
            subtitle="Use these prompts to apply your brand consistently"
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

          <PdfFooter />
        </Page>
      )}

      {/* ------------ PAGE 12 — NEXT STEPS ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="Next Steps" />

        <PageTitle
          title="Your Strategic Next Steps"
          subtitle="Where your brand can grow from here"
        />

        {opportunities && (
          <Section>
            <Text style={styles.heading}>Recommendations</Text>
            <RecommendationBlock title="Strategic Opportunities" text={opportunities} />
          </Section>
        )}

        <Section>
          <Text style={styles.para}>
            This WunderBrand Blueprint™ gives you a complete foundation for your brand's
            identity, communication, differentiation, and direction. If you'd like help
            applying this blueprint to your marketing, content, or website, Wunderbar
            Digital offers additional support and implementation services.
          </Text>
        </Section>

        <Section>
          <Text style={styles.subheading}>Upgrade to Blueprint+™</Text>
          <Text style={styles.para}>
            For a complete AEO system with implementation guidance, platform-specific
            optimizations, and AI prompts to generate improved versions of your content,
            consider upgrading to WunderBrand Blueprint+™ ($1,997).
          </Text>
        </Section>

        <PdfFooter />
      </Page>

    </Document>
  );
};
