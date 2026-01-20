// src/pdf/documents/ReportDocument.tsx
// Brand Snapshot+™ Report Document
// Focused, strategic PDF for Snapshot+ reports

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { registerPdfFonts } from '../registerFonts';
import { ScoreGauge } from '../components/ScoreGauge';
import { ContextCoverageMeter } from '../components/ContextCoverageMeter';
import { PrimaryPillar } from '../components/PrimaryPillar';
import { PillarSummaryRow, Score, Text as PillarText } from '../components/PillarSummaryRow';
import { SectionHeader } from '../components/SectionHeader';
import { BlueprintPlusSection } from '../components/BlueprintPlusSection';
import { resolvePillarPriority } from '@/src/lib/pillars/pillarPriority';
import { rolePhrase } from '@/src/lib/roleLanguage';
import { pillarCopy, PillarKey } from '@/src/copy/pillars';

// Register fonts
registerPdfFonts();

/* ----------------------------
   STYLES
----------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#0C1526',
    lineHeight: 1.6,
  },
  h1: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#021859',
  },
  h2: {
    fontSize: 18,
    marginTop: 28,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#021859',
  },
  h3: {
    fontSize: 14,
    marginTop: 18,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 10,
  },
  muted: {
    color: '#4A5568',
  },
  scoreBlock: {
    marginTop: 12,
    marginBottom: 18,
    padding: 14,
    backgroundColor: '#F7FAFC',
    borderRadius: 6,
  },
  pillarBlock: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pillarSection: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pillarHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#021859',
  },
  insight: {
    fontSize: 11,
    marginTop: 8,
    marginBottom: 10,
    lineHeight: 1.6,
    color: '#0C1526',
  },
  recommendation: {
    fontSize: 11,
    marginTop: 10,
    lineHeight: 1.6,
    color: '#0C1526',
  },
  primaryEmphasisBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#07B0F2',
    borderRadius: 4,
  },
  emphasisTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#021859',
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
        {/* 1️⃣ COVER & SUMMARY */}
        <SectionHeader>Your Brand Snapshot™ Summary</SectionHeader>
        
        <Text style={styles.paragraph}>
          Prepared for <Text style={styles.emphasis}>{companyName}</Text>
        </Text>

        <Text style={styles.paragraph}>
          This Snapshot+™ was generated to support you in{" "}
          {userRoleContext ? rolePhrase(userRoleContext) : "your brand leadership"} — 
          based on the inputs you provided and the areas where focused alignment 
          will have the greatest impact.
        </Text>

        {/* 2️⃣ BRAND ALIGNMENT SCORE */}
        <SectionHeader>Brand Alignment Score™</SectionHeader>

        <View style={styles.scoreBlock}>
          <ScoreGauge value={brandAlignmentScore} />

          <Text style={styles.paragraph}>
            Your Brand Alignment Score™ reflects how effectively your positioning, 
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
            Additional strategic context would enable more precise recommendations 
            and deeper insight into {companyName}'s brand opportunities.
          </Text>
        </View>

        {/* 7️⃣ NEXT STEP (No Sales Tone) */}
        <View style={styles.section}>
          <Text style={styles.h2}>What Comes Next</Text>

          <Text style={styles.paragraph}>
            Snapshot+™ provides clarity on what matters most right now. 
            Blueprint™ transforms that clarity into a repeatable system — ensuring 
            your brand operates with consistency, confidence, and momentum.
          </Text>

          <Text style={styles.paragraph}>
            Blueprint™ builds on your Snapshot+™ insights, activating them into a 
            system designed to support you with clarity you can execute on. 
            {resolvedPillars.length > 0 && (
              <> It resolves your {resolvedPillars.slice(0, 2).join(' and ')} priorities 
              identified in this report.</>
            )}
          </Text>

          <Text style={styles.paragraph}>
            When alignment is resolved at the system level, execution becomes 
            significantly easier — and far more effective.
          </Text>
        </View>

        <Text style={styles.muted}>
          Prepared by Wunderbar Digital
        </Text>

      </Page>
    </Document>
  );
}
