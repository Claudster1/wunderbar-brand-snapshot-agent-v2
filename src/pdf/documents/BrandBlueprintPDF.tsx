// src/pdf/documents/BrandBlueprintPDF.tsx
// Brand Blueprint™ PDF Document ($749)
// AEO integrated with brand strategy

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { stylePresets, colors, fonts, spacing } from "../theme";
import { registerPdfFonts } from "../registerFonts";

// Register fonts
registerPdfFonts();

interface AEOIntegratedStrategy {
  competitorGapAnalysis?: string;
  messagingForAI?: string;
  contentStrategy?: string;
  signatureContent?: string[];
  visibilityPriorities?: string;
}

interface BrandBlueprintPDFProps {
  userName?: string;
  businessName?: string;
  positioningPlatform?: string;
  valueProposition?: string;
  audienceProfile?: string;
  messagingFramework?: {
    coreMessage?: string;
    supportingPoints?: string[];
    differentiators?: string[];
    aeoOptimization?: string;
  };
  brandVoiceSystem?: {
    voiceAttributes?: string[];
    toneGuidance?: {
      website?: string;
      social?: string;
      email?: string;
      sales?: string;
    };
  };
  brandNarrative?: string;
  brandPillars?: Array<{
    name: string;
    explanation: string;
    whyItSupports: string;
  }>;
  visualDirection?: {
    colorDirection?: string;
    photographyDirection?: string;
    typographyDirection?: string;
  };
  aeoIntegratedStrategy?: AEOIntegratedStrategy;
}

export const BrandBlueprintPDF = ({
  userName,
  businessName,
  positioningPlatform,
  valueProposition,
  audienceProfile,
  messagingFramework,
  brandVoiceSystem,
  brandNarrative,
  brandPillars = [],
  visualDirection,
  aeoIntegratedStrategy,
}: BrandBlueprintPDFProps) => {
  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page style={stylePresets.page}>
        <View style={{ borderBottom: `2px solid ${colors.navy}`, paddingBottom: spacing.md, marginBottom: spacing["2xl"] }}>
          <Text style={stylePresets.h1}>Brand Blueprint™</Text>
          <Text style={stylePresets.body}>
            A strategic foundation for your brand's growth
          </Text>
        </View>

        <Text style={stylePresets.body}>Hello {userName || "there"},</Text>
        <Text style={{ marginTop: spacing.md, ...stylePresets.body }}>
          Your Brand Blueprint™ translates your brand's essence, language, and visual direction into
          a unified and actionable system. AEO (Answer Engine Optimization) is fully integrated
          throughout to ensure your brand shows up in AI-powered search results.
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. Brand Blueprint™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      {/* PAGE 2 — POSITIONING PLATFORM */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Brand Positioning Platform</Text>
        
        {positioningPlatform ? (
          <Text style={stylePresets.body}>{positioningPlatform}</Text>
        ) : (
          <Text style={stylePresets.body}>
            Your positioning platform defines what your brand does, who it serves, the problem it solves,
            and the transformation it delivers.
          </Text>
        )}

        {valueProposition && (
          <>
            <Text style={stylePresets.h3}>Value Proposition</Text>
            <View style={stylePresets.card}>
              <Text style={stylePresets.body}>{valueProposition}</Text>
            </View>
          </>
        )}

        {audienceProfile && (
          <>
            <Text style={stylePresets.h3}>Audience Profile</Text>
            <Text style={stylePresets.body}>{audienceProfile}</Text>
          </>
        )}

        <Text style={stylePresets.footer}>
          Positioning optimized for AI discoverability and search visibility.
        </Text>
      </Page>

      {/* PAGE 3 — MESSAGING FRAMEWORK (with AEO integration) */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Messaging Framework</Text>

        {messagingFramework?.coreMessage && (
          <>
            <Text style={stylePresets.h3}>Core Message</Text>
            <View style={stylePresets.card}>
              <Text style={stylePresets.body}>{messagingFramework.coreMessage}</Text>
            </View>
          </>
        )}

        {messagingFramework?.supportingPoints && messagingFramework.supportingPoints.length > 0 && (
          <>
            <Text style={stylePresets.h3}>Supporting Proof Points</Text>
            {messagingFramework.supportingPoints.map((point, i) => (
              <View key={i} style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                <Text style={stylePresets.body}>{point}</Text>
              </View>
            ))}
          </>
        )}

        {messagingFramework?.differentiators && messagingFramework.differentiators.length > 0 && (
          <>
            <Text style={stylePresets.h3}>Differentiators</Text>
            {messagingFramework.differentiators.map((diff, i) => (
              <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                • {diff}
              </Text>
            ))}
          </>
        )}

        {/* AEO Optimization for Messaging */}
        {messagingFramework?.aeoOptimization && (
          <>
            <Text style={{ ...stylePresets.h3, marginTop: spacing.lg, color: colors.blue }}>
              AEO-Optimized Messaging Structure
            </Text>
            <View style={stylePresets.card}>
              <Text style={stylePresets.body}>{messagingFramework.aeoOptimization}</Text>
            </View>
          </>
        )}

        <Text style={stylePresets.footer}>
          Messaging structured for both human understanding and AI consumption.
        </Text>
      </Page>

      {/* PAGE 4 — AEO-INTEGRATED STRATEGY */}
      {aeoIntegratedStrategy && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>AEO-Integrated Brand Strategy</Text>

          {aeoIntegratedStrategy.competitorGapAnalysis && (
            <>
              <Text style={stylePresets.h3}>Competitor Gap Analysis (AI-Powered)</Text>
              <View style={stylePresets.card}>
                <Text style={stylePresets.body}>
                  {aeoIntegratedStrategy.competitorGapAnalysis}
                </Text>
              </View>
            </>
          )}

          {aeoIntegratedStrategy.messagingForAI && (
            <>
              <Text style={stylePresets.h3}>Messaging for AI Discoverability</Text>
              <Text style={stylePresets.body}>
                {aeoIntegratedStrategy.messagingForAI}
              </Text>
            </>
          )}

          {aeoIntegratedStrategy.contentStrategy && (
            <>
              <Text style={stylePresets.h3}>Content Strategy for AI Reference</Text>
              <Text style={stylePresets.body}>
                {aeoIntegratedStrategy.contentStrategy}
              </Text>
            </>
          )}

          {aeoIntegratedStrategy.signatureContent && aeoIntegratedStrategy.signatureContent.length > 0 && (
            <>
              <Text style={stylePresets.h3}>Signature Content Pieces</Text>
              {aeoIntegratedStrategy.signatureContent.map((content, i) => (
                <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                  • {content}
                </Text>
              ))}
            </>
          )}

          {aeoIntegratedStrategy.visibilityPriorities && (
            <>
              <Text style={stylePresets.h3}>Visibility Priorities (SEO + AEO)</Text>
              <Text style={stylePresets.body}>
                {aeoIntegratedStrategy.visibilityPriorities}
              </Text>
            </>
          )}

          <Text style={stylePresets.footer}>
            AEO fully integrated with brand strategy for maximum AI search visibility.
          </Text>
        </Page>
      )}

      {/* PAGE 5 — BRAND VOICE & TONE */}
      {brandVoiceSystem && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Brand Voice & Tone System</Text>

          {brandVoiceSystem.voiceAttributes && brandVoiceSystem.voiceAttributes.length > 0 && (
            <>
              <Text style={stylePresets.h3}>Voice Attributes</Text>
              {brandVoiceSystem.voiceAttributes.map((attr, i) => (
                <View key={i} style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={stylePresets.body}>{attr}</Text>
                </View>
              ))}
            </>
          )}

          {brandVoiceSystem.toneGuidance && (
            <>
              <Text style={stylePresets.h3}>Tone Guidance by Channel</Text>
              {brandVoiceSystem.toneGuidance.website && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={stylePresets.h4}>Website</Text>
                  <Text style={stylePresets.body}>{brandVoiceSystem.toneGuidance.website}</Text>
                </View>
              )}
              {brandVoiceSystem.toneGuidance.social && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={stylePresets.h4}>Social Media</Text>
                  <Text style={stylePresets.body}>{brandVoiceSystem.toneGuidance.social}</Text>
                </View>
              )}
              {brandVoiceSystem.toneGuidance.email && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={stylePresets.h4}>Email</Text>
                  <Text style={stylePresets.body}>{brandVoiceSystem.toneGuidance.email}</Text>
                </View>
              )}
              {brandVoiceSystem.toneGuidance.sales && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={stylePresets.h4}>Sales</Text>
                  <Text style={stylePresets.body}>{brandVoiceSystem.toneGuidance.sales}</Text>
                </View>
              )}
            </>
          )}

          <Text style={stylePresets.footer}>
            Voice guidelines ensure consistency across all touchpoints.
          </Text>
        </Page>
      )}

      {/* PAGE 6 — BRAND NARRATIVE */}
      {brandNarrative && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Brand Narrative</Text>
          <View style={stylePresets.card}>
            <Text style={stylePresets.body}>{brandNarrative}</Text>
          </View>
          <Text style={stylePresets.footer}>
            Narrative structured for both storytelling and AI discoverability.
          </Text>
        </Page>
      )}

      {/* PAGE 7 — BRAND PILLARS */}
      {brandPillars.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Recommended Brand Pillars</Text>
          {brandPillars.map((pillar, i) => (
            <View key={i} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {pillar.name}
              </Text>
              <Text style={{ ...stylePresets.body, marginBottom: spacing.xs }}>
                {pillar.explanation}
              </Text>
              <Text style={stylePresets.small}>
                <Text style={stylePresets.semibold}>Why it supports long-term strength: </Text>
                {pillar.whyItSupports}
              </Text>
            </View>
          ))}
          <Text style={stylePresets.footer}>
            These pillars form the foundation of your brand strategy.
          </Text>
        </Page>
      )}

      {/* PAGE 8 — VISUAL DIRECTION */}
      {visualDirection && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Visual Direction</Text>

          {visualDirection.colorDirection && (
            <>
              <Text style={stylePresets.h3}>Color Direction</Text>
              <Text style={stylePresets.body}>{visualDirection.colorDirection}</Text>
            </>
          )}

          {visualDirection.photographyDirection && (
            <>
              <Text style={stylePresets.h3}>Photography Direction</Text>
              <Text style={stylePresets.body}>{visualDirection.photographyDirection}</Text>
            </>
          )}

          {visualDirection.typographyDirection && (
            <>
              <Text style={stylePresets.h3}>Typography Direction</Text>
              <Text style={stylePresets.body}>{visualDirection.typographyDirection}</Text>
            </>
          )}

          <Text style={stylePresets.footer}>
            Visual elements optimized for brand recognition and AI image understanding.
          </Text>
        </Page>
      )}

      {/* PAGE 9 — NEXT STEPS */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Next Steps</Text>

        <View style={stylePresets.card}>
          <Text style={stylePresets.body}>
            Your Brand Blueprint™ sets the foundation for consistent messaging, aligned marketing,
            and scalable brand growth. Use it as your core reference for all creative and
            communication decisions.
          </Text>
        </View>

        <Text style={stylePresets.h3}>Upgrade to Blueprint+™</Text>
        <Text style={stylePresets.body}>
          For a complete AEO system with implementation guidance, platform-specific optimizations,
          and AI prompts to generate improved content versions, upgrade to Blueprint+™ ($1499).
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. Brand Blueprint™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default BrandBlueprintPDF;
