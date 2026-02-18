// src/pdf/documents/SnapshotPlusPDF.tsx
// WunderBrand Snapshot+™ PDF Document ($497)
// Includes full structured AEO section as required for this tier

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { stylePresets, colors, fonts, spacing, getMeterFill, getScoreLabel, getPillarScoreLabel } from "../theme";
import { registerPdfFonts } from "../registerFonts";
import { DisclaimerPage } from "../components/DisclaimerPage";

// Register fonts
registerPdfFonts();

interface AEORecommendations {
  keywordClarity?: string;
  messagingStructure?: string;
  visualOptimization?: string;
  performanceHeuristics?: string;
  prioritizationMatrix?: string;
  practicalActions?: string[];
  industryGuidance?: string;
}

interface SnapshotPlusPDFProps {
  userName?: string;
  businessName?: string;
  brandAlignmentScore: number;
  pillarScores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
  pillarInsights: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
  brandSummary?: string;
  pillarDeepDive?: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
  opportunityMap?: Array<{
    title: string;
    whyItMatters: string;
    whatItUnlocks: string;
    difficulty: "low" | "medium" | "high";
  }>;
  firstFiveActions?: string[];
  aeoRecommendations?: AEORecommendations;
  reportDate?: string;
}

export const SnapshotPlusPDF = ({
  userName,
  businessName,
  brandAlignmentScore,
  pillarScores,
  pillarInsights,
  brandSummary,
  pillarDeepDive,
  opportunityMap = [],
  firstFiveActions = [],
  aeoRecommendations,
  reportDate,
}: SnapshotPlusPDFProps) => {
  const scoreLabel = getScoreLabel(brandAlignmentScore);

  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>WunderBrand Snapshot+™</Text>
        <Text style={stylePresets.body}>
          Prepared for {userName || "you"}
        </Text>
        {businessName && (
          <Text style={stylePresets.body}>{businessName}</Text>
        )}
        {reportDate && (
          <Text style={{ ...stylePresets.small, marginTop: spacing.xs }}>
            Report Date: {reportDate}
          </Text>
        )}

        <View style={{ marginTop: spacing["3xl"] }}>
          <Text style={stylePresets.h2}>WunderBrand Score™</Text>
          <View style={stylePresets.scoreBox}>
            <Text style={{ fontSize: fonts["5xl"], fontWeight: fonts.bold, color: colors.navy }}>
              {brandAlignmentScore}/100
            </Text>
            <Text style={{ fontSize: fonts.base, marginTop: spacing.xs }}>
              {scoreLabel}
            </Text>
            <View style={stylePresets.meterTrack}>
              <View style={getMeterFill(brandAlignmentScore)} />
            </View>
          </View>
        </View>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. WunderBrand Snapshot+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      {/* PAGE 2 — EXECUTIVE SUMMARY */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Executive Summary</Text>
        
        {brandSummary ? (
          <Text style={stylePresets.body}>{brandSummary}</Text>
        ) : (
          <>
            <Text style={stylePresets.body}>
              This WunderBrand Snapshot+™ report provides a comprehensive analysis of your brand's
              alignment across five foundational pillars: Positioning, Messaging, Visibility,
              Credibility, and Conversion.
            </Text>
            <Text style={{ marginTop: spacing.md, ...stylePresets.body }}>
              Your WunderBrand Score™ of {brandAlignmentScore}/100 indicates{" "}
              {scoreLabel.toLowerCase()}. This report identifies specific opportunities to
              strengthen your brand's clarity, consistency, and market presence.
            </Text>
          </>
        )}

        <Text style={stylePresets.h3}>Key Opportunities</Text>
        <Text style={stylePresets.body}>
          The analysis reveals several high-impact opportunities to elevate your brand's
          performance and market position. These are detailed in the Opportunity Map on page 9.
        </Text>

        <Text style={stylePresets.footer}>
          Ready to take action? See page 10 for next steps.
        </Text>
      </Page>

      {/* PAGE 3 — BRAND ALIGNMENT SCORE DEEP DIVE */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>WunderBrand Score™ Deep Dive</Text>

        <Text style={stylePresets.body}>
          Your WunderBrand Score™ is calculated as the average of your five pillar scores,
          each measured on a 0–20 scale.
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          {Object.entries(pillarScores).map(([pillar, score]) => {
            const pct = (score / 20) * 100;
            const label = getPillarScoreLabel(score);
            
            return (
              <View key={pillar} style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs }}>
                  <Text style={stylePresets.h4}>
                    {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  </Text>
                  <Text style={{ ...stylePresets.body, fontWeight: fonts.semibold }}>
                    {score}/20 — {label}
                  </Text>
                </View>
                <View style={stylePresets.meterTrack}>
                  <View style={getMeterFill(pct)} />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={stylePresets.footer}>
          Each pillar is analyzed in detail on the following pages.
        </Text>
      </Page>

      {/* PAGES 4–8 — PILLAR DEEP DIVES */}
      {Object.entries(pillarScores).map(([pillar, score], index) => {
        const pct = (score / 20) * 100;
        const label = getPillarScoreLabel(score);
        const insight = pillarInsights[pillar as keyof typeof pillarInsights];
        const deepDive = pillarDeepDive?.[pillar as keyof typeof pillarDeepDive];
        const isVisibility = pillar === "visibility";

        return (
          <Page key={pillar} style={stylePresets.page}>
            <Text style={stylePresets.h1}>
              {pillar.charAt(0).toUpperCase() + pillar.slice(1)} Deep Dive
            </Text>

            {/* Top Section: Score & Rating */}
            <View style={stylePresets.scoreBox}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
                <Text style={{ fontSize: fonts["2xl"], fontWeight: fonts.bold }}>
                  {score}/20
                </Text>
                <Text style={{ ...stylePresets.body, fontWeight: fonts.semibold }}>
                  {label}
                </Text>
              </View>
              <View style={stylePresets.meterTrack}>
                <View style={getMeterFill(pct)} />
              </View>
              <Text style={{ marginTop: spacing.sm, ...stylePresets.body }}>
                {typeof insight === 'string' ? insight : (insight as unknown as { opportunity?: string; strength?: string })?.opportunity || (insight as unknown as { opportunity?: string; strength?: string })?.strength || "Analysis available."}
              </Text>
            </View>

            {/* Middle Section: Deep Dive Analysis */}
            {deepDive ? (
              <Text style={{ marginTop: spacing.lg, ...stylePresets.body }}>
                {deepDive}
              </Text>
            ) : (
              <>
                <Text style={stylePresets.h3}>What This Means for Growth</Text>
                <Text style={stylePresets.body}>
                  Your {pillar} score of {score}/20 indicates {label.toLowerCase()}. 
                  {score >= 15 
                    ? " Continue building on this strength to maintain momentum."
                    : score >= 12
                    ? " There's opportunity to elevate this area for greater impact."
                    : " This area needs focused attention to strengthen your overall brand alignment."
                  }
                </Text>
              </>
            )}

            {/* Bottom Section: Recommendations */}
            <Text style={{ ...stylePresets.h3, marginTop: spacing.lg }}>
              Strategic Recommendations
            </Text>
            
            {isVisibility && aeoRecommendations ? (
              <>
                {/* AEO SECTION (REQUIRED for Visibility pillar) */}
                <Text style={{ ...stylePresets.h4, marginTop: spacing.md, color: colors.blue }}>
                  AEO (Answer Engine Optimization) Strategy
                </Text>
                
                {aeoRecommendations.keywordClarity && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Keyword Clarity
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.keywordClarity}
                    </Text>
                  </>
                )}

                {aeoRecommendations.messagingStructure && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Messaging Structure
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.messagingStructure}
                    </Text>
                  </>
                )}

                {aeoRecommendations.visualOptimization && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Visual Optimization
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.visualOptimization}
                    </Text>
                  </>
                )}

                {aeoRecommendations.performanceHeuristics && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Performance Heuristics
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.performanceHeuristics}
                    </Text>
                  </>
                )}

                {aeoRecommendations.prioritizationMatrix && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Prioritization Matrix
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.prioritizationMatrix}
                    </Text>
                  </>
                )}

                {aeoRecommendations.practicalActions && aeoRecommendations.practicalActions.length > 0 && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Practical Actions
                    </Text>
                    {aeoRecommendations.practicalActions.map((action, i) => (
                      <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                        • {action}
                      </Text>
                    ))}
                  </>
                )}

                {aeoRecommendations.industryGuidance && (
                  <>
                    <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                      Industry-Specific Guidance
                    </Text>
                    <Text style={stylePresets.body}>
                      {aeoRecommendations.industryGuidance}
                    </Text>
                  </>
                )}
              </>
            ) : (
              <Text style={stylePresets.body}>
                Focus on strengthening {pillar} fundamentals to improve your overall brand alignment.
                Consider upgrading to Blueprint™ for deeper strategic guidance.
              </Text>
            )}

            <Text style={stylePresets.footer}>
              See page 9 for prioritized opportunities across all pillars.
            </Text>
          </Page>
        );
      })}

      {/* PAGE 9 — OPPORTUNITY MAP */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Your Brand Opportunities Map</Text>

        <Text style={{ marginBottom: spacing.lg, ...stylePresets.body }}>
          These opportunities are ranked by potential impact and implementation difficulty.
        </Text>

        {opportunityMap.length > 0 ? (
          opportunityMap.map((opp, i) => (
            <View key={i} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {i + 1}. {opp.title}
              </Text>
              <Text style={{ ...stylePresets.body, marginBottom: spacing.xs }}>
                <Text style={stylePresets.semibold}>Why it matters: </Text>
                {opp.whyItMatters}
              </Text>
              <Text style={{ ...stylePresets.body, marginBottom: spacing.xs }}>
                <Text style={stylePresets.semibold}>What it unlocks: </Text>
                {opp.whatItUnlocks}
              </Text>
              <Text style={stylePresets.small}>
                Difficulty: {opp.difficulty.charAt(0).toUpperCase() + opp.difficulty.slice(1)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={stylePresets.body}>
            Opportunities will be generated based on your specific brand inputs and scores.
          </Text>
        )}

        {firstFiveActions.length > 0 && (
          <>
            <Text style={{ ...stylePresets.h3, marginTop: spacing.xl }}>
              First 5 Strategic Actions
            </Text>
            {firstFiveActions.map((action, i) => (
              <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                {i + 1}. {action}
              </Text>
            ))}
          </>
        )}

        <Text style={stylePresets.footer}>
          Ready to implement? See page 10 for next steps.
        </Text>
      </Page>

      {/* PAGE 10 — WHAT TO DO NEXT */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>What to Do Next</Text>

        <Text style={{ marginBottom: spacing.lg, ...stylePresets.body }}>
          Your WunderBrand Snapshot+™ provides a comprehensive foundation for strengthening your brand.
          Here are your options for moving forward:
        </Text>

        <Text style={stylePresets.h3}>Do-It-Yourself Action Path</Text>
        <Text style={stylePresets.body}>
          Use the recommendations and opportunity map in this report to guide your brand improvements.
          Focus on quick wins first, then tackle medium-term opportunities.
        </Text>

        <Text style={stylePresets.h3}>Done-With-You</Text>
        <Text style={stylePresets.body}>
          Schedule a strategy session with Wunderbar Digital to walk through your Snapshot+™ results
          and create a customized implementation plan.
        </Text>

        <Text style={stylePresets.h3}>Done-For-You</Text>
        <Text style={stylePresets.body}>
          Activate your Snapshot+™ priorities with Blueprint™ or Blueprint+™ for a complete strategic brand system
          with AEO fully integrated into your brand strategy.
        </Text>

        <Text style={{ marginTop: spacing.xl, ...stylePresets.body }}>
          Ready to take the next step? Visit WunderbarDigital.com or contact us to schedule
          your strategy session.
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. WunderBrand Snapshot+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
};

export default SnapshotPlusPDF;
