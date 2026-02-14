// src/pdf/documents/BrandBlueprintPlusPDF.tsx
// WunderBrand Blueprint+™ PDF Document ($1,997)
// Complete AEO system with implementation guidance

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { stylePresets, colors, fonts, spacing } from "../theme";
import { registerPdfFonts } from "../registerFonts";

// Register fonts
registerPdfFonts();

interface CompleteAEOSystem {
  platformOptimizations?: {
    chatgpt?: string;
    perplexity?: string;
    googleAI?: string;
    other?: string;
  };
  implementationRoadmap?: {
    steps?: string[];
    timeline?: string;
    prioritization?: string;
  };
  measurementGuidance?: string;
  aiPrompts?: Array<{
    name: string;
    prompt: string;
    purpose: string;
  }>;
  contentImprovementPrompts?: string[];
}

export interface BrandBlueprintPlusPDFProps {
  userName?: string;
  businessName?: string;
  brandStory?: {
    short?: string;
    long?: string;
  };
  positioning?: {
    statement?: string;
    differentiators?: Array<{ name: string; detail: string }>;
  };
  journey?: Array<{
    stage: string;
    goal: string;
    emotion: string;
    opportunities: string;
  }>;
  contentRoadmap?: Array<{
    month: string;
    theme: string;
    messagingAngles?: string[];
    growthPriorities?: string[];
    aeoStrategies?: string[];
  }>;
  visualDirection?: Array<{
    category: string;
    description: string;
  }>;
  personality?: string;
  decisionFilters?: string[];
  aiPrompts?: Array<{
    name: string;
    prompt: string;
  }>;
  completeAEOSystem?: CompleteAEOSystem;
}

export const BrandBlueprintPlusPDF = ({
  userName,
  businessName,
  brandStory,
  positioning,
  journey = [],
  contentRoadmap = [],
  visualDirection = [],
  personality,
  decisionFilters = [],
  aiPrompts = [],
  completeAEOSystem,
}: BrandBlueprintPlusPDFProps) => {
  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page style={stylePresets.page}>
        <View style={{ borderBottom: `2px solid ${colors.navy}`, paddingBottom: spacing.md, marginBottom: spacing["2xl"] }}>
          <Text style={stylePresets.h1}>WunderBrand Blueprint+™</Text>
          <Text style={stylePresets.body}>
            The advanced strategic foundation for scalable brand growth.
          </Text>
        </View>

        <Text style={stylePresets.body}>Hello {userName || "there"},</Text>
        <Text style={{ marginTop: spacing.md, ...stylePresets.body }}>
          Your WunderBrand Blueprint+™ synthesizes deeper customer insights, narrative frameworks,
          positioning strategy, and execution plans into a single, actionable system designed
          for clarity, alignment, and growth. This includes a complete AEO system with full
          implementation guidance.
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. WunderBrand Blueprint+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      {/* PAGE 2 — BRAND STORY FRAMEWORK */}
      {brandStory && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Brand Story Framework</Text>
          
          {brandStory.long && (
            <>
              <Text style={stylePresets.h3}>Brand Story (Long)</Text>
              <View style={stylePresets.card}>
                <Text style={stylePresets.body}>{brandStory.long}</Text>
              </View>
            </>
          )}

          {brandStory.short && (
            <>
              <Text style={stylePresets.h3}>Elevator Pitch</Text>
              <View style={stylePresets.card}>
                <Text style={stylePresets.body}>{brandStory.short}</Text>
              </View>
            </>
          )}

          <Text style={stylePresets.footer}>
            Story structured for both human connection and AI discoverability.
          </Text>
        </Page>
      )}

      {/* PAGE 3 — POSITIONING PLATFORM */}
      {positioning && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Positioning Platform</Text>

          {positioning.statement && (
            <>
              <Text style={stylePresets.h3}>Positioning Statement</Text>
              <View style={stylePresets.card}>
                <Text style={stylePresets.body}>{positioning.statement}</Text>
              </View>
            </>
          )}

          {positioning.differentiators && positioning.differentiators.length > 0 && (
            <>
              <Text style={stylePresets.h3}>Differentiation Matrix</Text>
              {positioning.differentiators.map((diff, idx) => (
                <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                    {diff.name}
                  </Text>
                  <Text style={stylePresets.body}>{diff.detail}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={stylePresets.footer}>
            Positioning optimized for competitive advantage in AI search results.
          </Text>
        </Page>
      )}

      {/* PAGE 4 — CUSTOMER JOURNEY */}
      {journey.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Customer Journey Map</Text>
          {journey.map((stage, idx) => (
            <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {stage.stage}
              </Text>
              <Text style={stylePresets.body}>
                <Text style={stylePresets.semibold}>Goal: </Text>
                {stage.goal}
              </Text>
              <Text style={stylePresets.body}>
                <Text style={stylePresets.semibold}>Emotion: </Text>
                {stage.emotion}
              </Text>
              <Text style={stylePresets.body}>
                <Text style={stylePresets.semibold}>Opportunities: </Text>
                {stage.opportunities}
              </Text>
            </View>
          ))}
          <Text style={stylePresets.footer}>
            Journey mapped with AEO touchpoints for AI discoverability.
          </Text>
        </Page>
      )}

      {/* PAGE 5 — 12-MONTH CONTENT ROADMAP (with AEO strategies) */}
      {contentRoadmap.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>12-Month Content Roadmap</Text>
          <Text style={{ marginBottom: spacing.md, ...stylePresets.body }}>
            Monthly themes, messaging angles, growth priorities, and AEO optimization strategies.
          </Text>

          {contentRoadmap.map((month, idx) => (
            <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {month.month}
              </Text>
              <Text style={stylePresets.body}>
                <Text style={stylePresets.semibold}>Theme: </Text>
                {month.theme}
              </Text>
              
              {month.messagingAngles && month.messagingAngles.length > 0 && (
                <>
                  <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                    Messaging Angles
                  </Text>
                  {month.messagingAngles.map((angle, i) => (
                    <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                      • {angle}
                    </Text>
                  ))}
                </>
              )}

              {month.growthPriorities && month.growthPriorities.length > 0 && (
                <>
                  <Text style={{ ...stylePresets.h4, marginTop: spacing.sm }}>
                    Growth Priorities
                  </Text>
                  {month.growthPriorities.map((priority, i) => (
                    <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                      • {priority}
                    </Text>
                  ))}
                </>
              )}

              {month.aeoStrategies && month.aeoStrategies.length > 0 && (
                <>
                  <Text style={{ ...stylePresets.h4, marginTop: spacing.sm, color: colors.blue }}>
                    AEO Strategies
                  </Text>
                  {month.aeoStrategies.map((strategy, i) => (
                    <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                      • {strategy}
                    </Text>
                  ))}
                </>
              )}
            </View>
          ))}

          <Text style={stylePresets.footer}>
            Content roadmap includes AEO optimization strategies for each month.
          </Text>
        </Page>
      )}

      {/* PAGE 6 — COMPLETE AEO SYSTEM */}
      {completeAEOSystem && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Complete AEO System</Text>

          {completeAEOSystem.platformOptimizations && (
            <>
              <Text style={stylePresets.h3}>Platform-Specific Optimizations</Text>
              
              {completeAEOSystem.platformOptimizations.chatgpt && (
                <View style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                    ChatGPT Optimization
                  </Text>
                  <Text style={stylePresets.body}>
                    {completeAEOSystem.platformOptimizations.chatgpt}
                  </Text>
                </View>
              )}

              {completeAEOSystem.platformOptimizations.perplexity && (
                <View style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                    Perplexity Optimization
                  </Text>
                  <Text style={stylePresets.body}>
                    {completeAEOSystem.platformOptimizations.perplexity}
                  </Text>
                </View>
              )}

              {completeAEOSystem.platformOptimizations.googleAI && (
                <View style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                    Google AI Overview Optimization
                  </Text>
                  <Text style={stylePresets.body}>
                    {completeAEOSystem.platformOptimizations.googleAI}
                  </Text>
                </View>
              )}
            </>
          )}

          {completeAEOSystem.implementationRoadmap && (
            <>
              <Text style={stylePresets.h3}>Implementation Roadmap</Text>
              
              {completeAEOSystem.implementationRoadmap.steps && completeAEOSystem.implementationRoadmap.steps.length > 0 && (
                <>
                  <Text style={stylePresets.h4}>Step-by-Step Implementation</Text>
                  {completeAEOSystem.implementationRoadmap.steps.map((step, i) => (
                    <Text key={i} style={{ marginTop: spacing.xs, ...stylePresets.body }}>
                      {i + 1}. {step}
                    </Text>
                  ))}
                </>
              )}

              {completeAEOSystem.implementationRoadmap.timeline && (
                <>
                  <Text style={{ ...stylePresets.h4, marginTop: spacing.md }}>
                    Timeline
                  </Text>
                  <Text style={stylePresets.body}>
                    {completeAEOSystem.implementationRoadmap.timeline}
                  </Text>
                </>
              )}

              {completeAEOSystem.implementationRoadmap.prioritization && (
                <>
                  <Text style={{ ...stylePresets.h4, marginTop: spacing.md }}>
                    Prioritization
                  </Text>
                  <Text style={stylePresets.body}>
                    {completeAEOSystem.implementationRoadmap.prioritization}
                  </Text>
                </>
              )}
            </>
          )}

          {completeAEOSystem.measurementGuidance && (
            <>
              <Text style={stylePresets.h3}>Measurement & Tracking</Text>
              <Text style={stylePresets.body}>
                {completeAEOSystem.measurementGuidance}
              </Text>
            </>
          )}

          <Text style={stylePresets.footer}>
            Complete AEO system with full implementation guidance.
          </Text>
        </Page>
      )}

      {/* PAGE 7 — AI PROMPTS FOR CONTENT IMPROVEMENT */}
      {completeAEOSystem?.aiPrompts && completeAEOSystem.aiPrompts.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>AI Prompts for Content Improvement</Text>
          <Text style={{ marginBottom: spacing.md, ...stylePresets.body }}>
            Use these prompts to generate AEO-optimized versions of your content.
          </Text>

          {completeAEOSystem.aiPrompts.map((prompt, idx) => (
            <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {prompt.name}
              </Text>
              <Text style={{ ...stylePresets.body, marginBottom: spacing.xs }}>
                {prompt.prompt}
              </Text>
              <Text style={stylePresets.small}>
                <Text style={stylePresets.semibold}>Purpose: </Text>
                {prompt.purpose}
              </Text>
            </View>
          ))}

          {completeAEOSystem.contentImprovementPrompts && completeAEOSystem.contentImprovementPrompts.length > 0 && (
            <>
              <Text style={stylePresets.h3}>Content Rewriting Prompts</Text>
              {completeAEOSystem.contentImprovementPrompts.map((prompt, i) => (
                <View key={i} style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={stylePresets.body}>{prompt}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={stylePresets.footer}>
            AI prompts help you create AEO-optimized content consistently.
          </Text>
        </Page>
      )}

      {/* PAGE 8 — VISUAL DIRECTION */}
      {visualDirection.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Visual Direction</Text>
          {visualDirection.map((v, idx) => (
            <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {v.category}
              </Text>
              <Text style={stylePresets.body}>{v.description}</Text>
            </View>
          ))}
          <Text style={stylePresets.footer}>
            Visual elements optimized for brand recognition and AI image understanding.
          </Text>
        </Page>
      )}

      {/* PAGE 9 — PERSONALITY & DECISION FILTERS */}
      {(personality || decisionFilters.length > 0) && (
        <Page style={stylePresets.page}>
          {personality && (
            <>
              <Text style={stylePresets.h1}>Brand Personality</Text>
              <View style={stylePresets.card}>
                <Text style={stylePresets.body}>{personality}</Text>
              </View>
            </>
          )}

          {decisionFilters.length > 0 && (
            <>
              <Text style={stylePresets.h3}>Decision Filters</Text>
              {decisionFilters.map((filter, idx) => (
                <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.sm }}>
                  <Text style={stylePresets.body}>• {filter}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={stylePresets.footer}>
            Personality and filters guide all brand decisions.
          </Text>
        </Page>
      )}

      {/* PAGE 10 — AI PROMPT LIBRARY */}
      {aiPrompts.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>AI Prompt Library — Extended</Text>
          {aiPrompts.map((p, idx) => (
            <View key={idx} style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h4, marginBottom: spacing.xs }}>
                {p.name}
              </Text>
              <Text style={stylePresets.body}>{p.prompt}</Text>
            </View>
          ))}
          <Text style={stylePresets.footer}>
            Use these prompts to generate on-brand content across all platforms.
          </Text>
        </Page>
      )}

      {/* PAGE 11 — NEXT STEPS */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Next Steps</Text>

        <View style={stylePresets.card}>
          <Text style={stylePresets.body}>
            Your WunderBrand Blueprint+™ provides a complete strategic foundation with AEO fully
            integrated. Use this system to guide all brand decisions, content creation, and
            marketing initiatives.
          </Text>
        </View>

        <Text style={stylePresets.h3}>Implementation Support</Text>
        <Text style={stylePresets.body}>
          Schedule a strategy session with Wunderbar Digital to walk through your Blueprint+™
          and create a customized implementation plan.
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. WunderBrand Blueprint+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default BrandBlueprintPlusPDF;
