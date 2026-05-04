// src/pdf/documents/ReportDocument.tsx
// WunderBrand Snapshot+™ Report Document
// Focused, strategic PDF for Snapshot+ reports

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { registerPdfFonts } from '../registerFonts';
import { BrandAlignmentScorePanel } from '../components/BrandAlignmentScorePanel';
import { ContextCoverageMeter } from '../components/ContextCoverageMeter';
import { PrimaryPillar } from '../components/PrimaryPillar';
import { PillarSummaryRow, Score, Text as PillarText } from '../components/PillarSummaryRow';
import { SectionHeader } from '../components/SectionHeader';
import { BlueprintPlusSection } from '../components/BlueprintPlusSection';
import { DisclaimerPage } from '../components/DisclaimerPage';
import { PdfHeader } from "../components/PdfHeader";
import { PdfFooter } from "../components/PdfFooter";
import { resolvePillarPriority } from '@/src/lib/pillars/pillarPriority';
import { rolePhrase } from '@/src/lib/roleLanguage';
import { pillarCopy, PillarKey } from '@/src/copy/pillars';
import { pdfTheme } from '../theme';

// Register fonts
registerPdfFonts();

/* ----------------------------
   STYLES
----------------------------- */
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 32,
    paddingBottom: 60,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#0C1526',
    lineHeight: 1.65,
    backgroundColor: "#FFFFFF",
  },
  h1: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy,
  },
  h2: {
    fontSize: 15,
    marginTop: 24,
    marginBottom: 8,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy,
  },
  h3: {
    fontSize: 12,
    marginTop: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 9,
  },
  muted: {
    color: pdfTheme.colors.muted,
  },
  scoreBlock: {
    marginTop: 10,
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#F8FCFF",
    border: `1 solid ${pdfTheme.colors.border}`,
    borderRadius: 10,
  },
  section: {
    marginTop: 16,
    marginBottom: 12,
  },
  pillarBlock: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.border,
  },
  pillarSection: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.border,
  },
  pillarHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: pdfTheme.colors.navy,
  },
  insight: {
    fontSize: 10.5,
    marginTop: 7,
    marginBottom: 9,
    lineHeight: 1.6,
    color: pdfTheme.colors.text,
  },
  recommendation: {
    fontSize: 10.5,
    marginTop: 7,
    lineHeight: 1.6,
    color: pdfTheme.colors.text,
  },
  primaryEmphasisBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: pdfTheme.colors.blue,
    borderRadius: 10,
  },
  emphasisTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    marginBottom: 6,
    color: pdfTheme.colors.navy,
  },
  emphasis: {
    fontWeight: 'bold',
  },
});

/* ----------------------------
   TYPES
----------------------------- */
export type Pillar = {
  key?: string;
  name: string;
  score: number;
  insight: string;
  recommendation: string;
  priorityExplanation?: string;
  // Legacy fields (for backward compatibility)
  whatWeSee?: string;
  whyItMatters?: string;
  riskIfUnchanged?: string;
  nextFocus?: string;
};

export type ReportProps = {
  companyName: string;
  brandAlignmentScore: number;
  primaryPillar: string;
  stageLabel: string;
  pillars: Pillar[];
  contextCoverage?: number | { percentage: number }; // Optional context coverage
  userRoleContext?: string; // Optional user role context
  isBlueprintPlus?: boolean;
  blueprintPlusInsights?: {
    visibility?: string[];
  };
};

/* ----------------------------
   DOCUMENT
----------------------------- */
export function ReportDocument({
  companyName,
  brandAlignmentScore,
  primaryPillar,
  stageLabel,
  pillars,
  contextCoverage,
  userRoleContext,
  isBlueprintPlus,
  blueprintPlusInsights,
}: ReportProps) {
  // Determine primary and secondary pillars
  const pillarScores = pillars.reduce((acc, p) => {
    const key = p.key || p.name.toLowerCase().replace(/\s+/g, '_');
    acc[key] = p.score;
    return acc;
  }, {} as Record<string, number>);
  
  const { primary, secondary } = resolvePillarPriority(pillarScores);
  
  // Find primary pillar data
  const primaryPillarData = pillars.find(p => 
    (p.key || p.name.toLowerCase().replace(/\s+/g, '_')) === primary
  );
  
  // Calculate context coverage if not provided
  const coverage =
    typeof contextCoverage === "number"
      ? contextCoverage
      : contextCoverage?.percentage ?? 70;
  
  // Get resolved pillars (primary + secondary) with proper names
  const resolvedPillars = [primary, ...secondary]
    .slice(0, 3)
    .map((key) => {
      const pillar = pillars.find(p => 
        (p.key || p.name.toLowerCase().replace(/\s+/g, '_')) === key
      );
      return pillar?.name || pillarCopy[key as PillarKey]?.title || key;
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader
          title="WunderBrand Snapshot+™ — Brand Direction Summary"
          businessName={companyName}
          date={new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        />
        {/* 1️⃣ COVER & SUMMARY */}
        <SectionHeader>Your WunderBrand Snapshot™ Summary</SectionHeader>
        
        <Text style={styles.paragraph}>
          Prepared for <Text style={styles.emphasis}>{companyName}</Text>
        </Text>

        <Text style={styles.paragraph}>
          This Snapshot+™ was generated to support you in{" "}
          {userRoleContext ? rolePhrase(userRoleContext as import("@/src/types/snapshot").UserRoleContext) : "your brand leadership"} — 
          based on the inputs you provided and the areas where focused alignment 
          will have the greatest impact.
        </Text>

        {/* 2️⃣ BRAND ALIGNMENT SCORE */}
        <SectionHeader>WunderBrand Score™</SectionHeader>

        <View style={styles.scoreBlock}>
          <BrandAlignmentScorePanel score={brandAlignmentScore} />

          <Text style={styles.paragraph}>
            Your WunderBrand Score™ reflects how effectively your positioning, 
            messaging, visibility, credibility, and conversion signals work together 
            as a unified system.
          </Text>
        </View>

        {/* 3️⃣ CONTEXT COVERAGE METER */}
        <View style={styles.section}>
          <ContextCoverageMeter percent={coverage} />
        </View>

        {isBlueprintPlus && blueprintPlusInsights?.visibility?.length && (
          <BlueprintPlusSection
            pillar="Visibility"
            insights={blueprintPlusInsights.visibility}
            contextCoverage={coverage}
          />
        )}

        {/* 4️⃣ PRIMARY PILLAR (Expanded) */}
        {primaryPillarData && (
          <PrimaryPillar
            pillar={{
              name: primaryPillarData.name,
              insight: primaryPillarData.insight || primaryPillarData.whatWeSee || '',
              whyItMatters: primaryPillarData.whyItMatters || `At your ${stageLabel} stage, ${primaryPillarData.name.toLowerCase()} directly impacts your ability to attract and convert customers.`,
              recommendation: primaryPillarData.recommendation || primaryPillarData.nextFocus || '',
            }}
          />
        )}

        {/* 5️⃣ SECONDARY PILLARS (Summary Rows) */}
        {secondary.length > 0 && (
          <View style={styles.section}>
            <SectionHeader>Supporting Pillars</SectionHeader>
            {secondary.map((pillarKey) => {
              const pillar = pillars.find(p => 
                (p.key || p.name.toLowerCase().replace(/\s+/g, '_')) === pillarKey
              );
              if (!pillar) return null;
              
              return (
                <PillarSummaryRow key={pillarKey}>
                  <Score>{pillar.score}/20</Score>
                  <PillarText>
                    {pillar.name}: {pillar.insight || pillar.whatWeSee || 'Review and refine your strategy.'}
                  </PillarText>
                </PillarSummaryRow>
              );
            })}
          </View>
        )}

        {/* 6️⃣ CONTEXT GAPS */}
        <View style={styles.section}>
          <Text style={styles.h2}>What We Could Go Deeper On</Text>
          <Text style={styles.paragraph}>
            We were able to generate strong insights for {companyName}, but a few
            areas would benefit from deeper context.
          </Text>
          <Text style={styles.paragraph}>
            That’s exactly what Snapshot+™ unlocks — not more questions, just
            clearer recommendations.
          </Text>
        </View>

        {/* 7️⃣ NEXT STEP (No Sales Tone) */}
        <View style={styles.section}>
          <Text style={styles.h2}>What Comes Next</Text>

          <Text style={styles.paragraph}>
            Blueprint™ builds on the clarity uncovered in Snapshot+™ — turning
            insight into a fully aligned brand foundation.
          </Text>

          <Text style={styles.paragraph}>
            If Blueprint™ feels like the right next step, it’s designed to
            activate the same {primaryPillar} that stood out in your
            Snapshot+™.
          </Text>

          <Text style={styles.paragraph}>
            As your brand scales, the Blueprint+™ layer adds advanced
            activation, segmentation, and campaign-level guidance.
          </Text>

          <Text style={styles.paragraph}>
            If not, no pressure — your Snapshot+™ remains available.
          </Text>
        </View>

        <Text style={styles.muted}>
          Prepared by Wunderbar Digital
        </Text>
        <PdfFooter businessName={companyName} productName="WunderBrand Snapshot+™" />

      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}
