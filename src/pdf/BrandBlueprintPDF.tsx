// src/pdf/BrandBlueprintPDF.tsx
// WunderBrand Blueprint™ PDF Document ($997)
// Includes AEO integrated with brand strategy
/* eslint-disable react/no-unescaped-entities */

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
import { DisclaimerPage } from "./components/DisclaimerPage";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";

// Register fonts
registerPdfFonts();

function normalizeRoadmapItems(text: string): string[] {
  return text
    .split(/[•\n;]+/g)
    .map((item) => item.replace(/^\d+[\).\-\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getBlueprintRoadmap(campaignArchitectureStarter?: string) {
  if (!campaignArchitectureStarter || campaignArchitectureStarter.trim().length === 0) {
    return {
      next30: [
        "Align positioning and messaging hierarchy across top customer touchpoints.",
        "Publish one authority-led narrative asset tied to your primary buyer need.",
      ],
      next60: [
        "Deploy channel-specific campaign variants with a shared brand core.",
        "Strengthen trust proof placement on conversion-critical pages.",
      ],
      next90: [
        "Scale highest-performing campaign structure and retire low-yield tactics.",
        "Review performance trends and lock the next quarter operating plan.",
      ],
    };
  }
  const lines = normalizeRoadmapItems(campaignArchitectureStarter);
  const chunk = Math.max(1, Math.ceil(lines.length / 3));
  return {
    next30: lines.slice(0, chunk),
    next60: lines.slice(chunk, chunk * 2),
    next90: lines.slice(chunk * 2),
  };
}

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingBottom: pdfTheme.spacing.xl,
    paddingTop: pdfTheme.spacing.md,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0F2A57",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subheading: {
    fontSize: 12,
    fontWeight: 600,
    color: pdfTheme.colors.midnight,
    marginTop: 8,
    marginBottom: 6,
  },
  para: {
    fontSize: 11,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.55,
    marginBottom: 10,
  },
  heroCard: {
    backgroundColor: "#F3F8FF",
    border: "1px solid #DCE7F5",
    borderRadius: 10,
    padding: 14,
  },
  signalCard: {
    backgroundColor: "#F7FAFF",
    border: "1px solid #DCE7F5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
});

export interface BrandBlueprintReport {
  userName: string;
  businessName: string;
  brandAlignmentScore?: number;
  pillarScores?: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
  pillarInsights?: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
  recommendations?: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
  contextCoverage?: number;
  opportunitiesMap?: string;
  roadmap30?: string;
  roadmap60?: string;
  roadmap90?: string;
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
  campaignArchitectureStarter?: string;
  revenueMappedWorkbook?: string;
  competitiveVulnerabilitySignal?: string;
  marketingSpendEfficiencySignal?: string;
  revenueImpactStatement?: string;
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
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const {
    userName,
    businessName,
    brandAlignmentScore,
    pillarScores,
    recommendations,
    contextCoverage,
    opportunitiesMap,
    roadmap30,
    roadmap60,
    roadmap90,
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
    campaignArchitectureStarter,
    revenueMappedWorkbook,
    competitiveVulnerabilitySignal,
    marketingSpendEfficiencySignal,
    revenueImpactStatement,
    aeoIntegratedStrategy,
  } = report;
  const archetypeMeaning = getArchetypeMeaning(brandArchetype);
  const archetypeIcon = getArchetypeIcon(brandArchetype);
  const roadmap = getBlueprintRoadmap(campaignArchitectureStarter);

  return (
    <Document>
      {/* ------------ FOUNDATION CONTEXT (IF AVAILABLE) ------------ */}
      {(typeof brandAlignmentScore === "number" || pillarScores) && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="Foundation Context" />
          <PageTitle
            title="Snapshot Foundation Carryover"
            subtitle="Baseline diagnostics carried into your Blueprint strategy"
          />

          {typeof brandAlignmentScore === "number" && (
            <Section>
              <Text style={styles.heading}>WunderBrand Score™ Baseline</Text>
              <View style={styles.heroCard}>
                <Text style={{ ...styles.para, fontSize: 26, fontWeight: 700, color: pdfTheme.colors.blue }}>
                  {brandAlignmentScore}/100
                </Text>
                <Text style={styles.para}>
                  This baseline provides the strategic context for Blueprint recommendations and sequencing.
                </Text>
              </View>
            </Section>
          )}

          {pillarScores && (
            <Section>
              <Text style={styles.heading}>Five-Pillar Baseline</Text>
              {Object.entries(pillarScores).map(([pillar, score]) => (
                <Text key={pillar} style={styles.para}>
                  • {pillar.charAt(0).toUpperCase() + pillar.slice(1)}: {score}/20
                </Text>
              ))}
            </Section>
          )}

          {recommendations && (
            <Section>
              <Text style={styles.heading}>Priority Activation Focus</Text>
              {Object.entries(recommendations)
                .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
                .slice(0, 3)
                .map(([pillar, value]) => (
                  <Text key={pillar} style={styles.para}>
                    • {pillar.charAt(0).toUpperCase() + pillar.slice(1)}: {value}
                  </Text>
                ))}
            </Section>
          )}

          {typeof contextCoverage === "number" && (
            <Section>
              <Text style={styles.heading}>Context Coverage</Text>
              <View style={styles.signalCard}>
                <Text style={{ ...styles.para, fontSize: 24, color: pdfTheme.colors.blue, fontWeight: 700 }}>
                  {Math.max(0, Math.min(100, Math.round(contextCoverage)))}%
                </Text>
              </View>
            </Section>
          )}

          {opportunitiesMap && (
            <Section>
              <Text style={styles.heading}>Opportunities Map</Text>
              <View style={styles.signalCard}>
                <Text style={styles.para}>{opportunitiesMap}</Text>
              </View>
            </Section>
          )}

          {(roadmap30 || roadmap60 || roadmap90) && (
            <Section>
              <Text style={styles.heading}>Snapshot+ 30/60/90 Continuity</Text>
              {[
                { title: "Next 30 Days", body: roadmap30 },
                { title: "Next 60 Days", body: roadmap60 },
                { title: "Next 90 Days", body: roadmap90 },
              ]
                .filter((phase) => typeof phase.body === "string" && phase.body.trim().length > 0)
                .map((phase, idx) => (
                  <View key={`${phase.title}-${idx}`} style={styles.signalCard}>
                    <Text style={styles.subheading}>{phase.title}</Text>
                    <Text style={styles.para}>{phase.body}</Text>
                  </View>
                ))}
            </Section>
          )}

          <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
        </Page>
      )}

      {/* ------------ PAGE 1 — EXECUTIVE SUMMARY ------------ */}
      <Page size="A4" style={styles.page}>
        <PdfHeader title="WunderBrand Blueprint™" businessName={businessName} date={reportDate} />

        <PageTitle
          title="Your WunderBrand Blueprint™"
          subtitle="A complete, AI-ready brand foundation"
        />

        <Section>
          <Text style={styles.heading}>Executive Summary</Text>
          <View style={styles.heroCard}>
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
          </View>
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

          <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

          <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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
            <Text style={styles.para}>{archetypeIcon ? `${archetypeIcon} ` : ""}{brandArchetype}</Text>
            {archetypeMeaning ? <Text style={styles.para}>{archetypeMeaning}</Text> : null}
          </Section>
        )}

        {brandTheme && (
          <Section>
            <Text style={styles.subheading}>Brand Theme</Text>
            <Text style={styles.para}>{brandTheme}</Text>
          </Section>
        )}

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
      </Page>

      {/* ------------ STRATEGIC SIGNALS ------------ */}
      {(competitiveVulnerabilitySignal || marketingSpendEfficiencySignal || revenueImpactStatement) && (
        <Page size="A4" style={styles.page}>
          <PdfHeader title="Strategic Signals" />

          <PageTitle
            title="Strategic Signals"
            subtitle="Priority exposure, spend efficiency, and revenue pathway"
          />

          {competitiveVulnerabilitySignal && (
            <Section>
              <Text style={styles.heading}>Competitive Vulnerability Signal</Text>
              <View style={styles.signalCard}>
                <Text style={styles.para}>{competitiveVulnerabilitySignal}</Text>
              </View>
            </Section>
          )}

          {marketingSpendEfficiencySignal && (
            <Section>
              <Text style={styles.heading}>Marketing Spend Efficiency Signal</Text>
              <View style={styles.signalCard}>
                <Text style={styles.para}>{marketingSpendEfficiencySignal}</Text>
              </View>
            </Section>
          )}

          {revenueImpactStatement && (
            <Section>
              <Text style={styles.heading}>Revenue Impact Statement</Text>
              <View style={styles.signalCard}>
                <Text style={styles.para}>{revenueImpactStatement}</Text>
              </View>
            </Section>
          )}

          <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
        </Page>
      )}

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

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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

          <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
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
          <Text style={styles.subheading}>Revenue-Mapped Implementation Modules</Text>
          <Text style={styles.para}>
            {revenueMappedWorkbook ||
              "Blueprint implementation is organized around six execution modules: Audience Clarity, Positioning for Conversion, Channel-Mapped Messaging, Content Architecture, Conversion Path Audit, and Marketing Spend Allocation. Use this as your 90-day operating structure."}
          </Text>
        </Section>

        <Section>
          <Text style={styles.subheading}>Campaign Architecture Starter (90 Days)</Text>
          <View style={styles.signalCard}>
            <Text style={styles.subheading}>Next 30 Days</Text>
            {roadmap.next30.map((item, idx) => (
              <Text key={`bp-30-${idx}`} style={styles.para}>• {item}</Text>
            ))}
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.subheading}>Next 60 Days</Text>
            {(roadmap.next60.length > 0 ? roadmap.next60 : ["Refine conversion pathways and trust reinforcement in campaign assets."]).map((item, idx) => (
              <Text key={`bp-60-${idx}`} style={styles.para}>• {item}</Text>
            ))}
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.subheading}>Next 90 Days</Text>
            {(roadmap.next90.length > 0 ? roadmap.next90 : ["Scale repeatable campaign architecture with KPI-based optimization cycles."]).map((item, idx) => (
              <Text key={`bp-90-${idx}`} style={styles.para}>• {item}</Text>
            ))}
          </View>
        </Section>

        <Section>
          <Text style={styles.subheading}>Upgrade to Blueprint+™</Text>
          <Text style={styles.para}>
            For a complete AEO system with implementation guidance, platform-specific
            optimizations, and AI prompts to generate improved versions of your content,
            consider upgrading to WunderBrand Blueprint+™ ($1,997).
          </Text>
        </Section>

        <PdfFooter businessName={businessName} productName="WunderBrand Blueprint™" />
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
};
