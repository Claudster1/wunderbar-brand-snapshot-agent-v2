// src/pdf/documents/BrandBlueprintPlusPDF.tsx
// WunderBrand Blueprint+™ PDF Document ($1,997)
// Complete AEO system with implementation guidance

import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { stylePresets, colors, fonts, spacing } from "../theme";
import { registerPdfFonts } from "../registerFonts";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { ColorSwatch } from "../components/ColorSwatch";
import { getArchetypeIcon, getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";

// Register fonts
registerPdfFonts();

function normalizeRoadmapPhase(text: string): string[] {
  return text
    .split(/[•\n;]+/g)
    .map((item) => item.replace(/^\d+[\).\-\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function getBlueprintPlusRoadmap(
  activationSessionPlan?: string,
  roadmap30?: string,
  roadmap60?: string,
  roadmap90?: string
) {
  if (roadmap30 || roadmap60 || roadmap90) {
    return {
      next30: roadmap30 ? normalizeRoadmapPhase(roadmap30) : [],
      next60: roadmap60 ? normalizeRoadmapPhase(roadmap60) : [],
      next90: roadmap90 ? normalizeRoadmapPhase(roadmap90) : [],
    };
  }

  if (!activationSessionPlan || activationSessionPlan.trim().length === 0) {
    return {
      next30: [
        "Finalize positioning language and top-value proof points for all core pages.",
        "Publish one authority asset aligned to your highest-intent audience question.",
      ],
      next60: [
        "Roll out messaging consistency across email, social, and sales touchpoints.",
        "Launch one conversion-focused campaign with clear KPI ownership.",
      ],
      next90: [
        "Scale winning channels and codify the playbook into repeatable workflows.",
        "Run a full strategic review with corrective actions for the next quarter.",
      ],
    };
  }

  const lines = normalizeRoadmapPhase(activationSessionPlan);
  const chunk = Math.max(1, Math.ceil(lines.length / 3));
  return {
    next30: lines.slice(0, chunk),
    next60: lines.slice(chunk, chunk * 2),
    next90: lines.slice(chunk * 2),
  };
}

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
  brandAlignmentScore?: number;
  pillarScores?: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
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
  persona?: string | { summary?: string; description?: string };
  archetype?:
    | string
    | {
        name?: string;
        summary?: string;
        description?: string;
        risk?: string;
        languageTone?: string;
        behaviorGuide?: string;
      };
  voice?: string | { summary?: string; description?: string; pillars?: string[] };
  colorPalette?: Array<{ name?: string; hex?: string; role?: string; meaning?: string }>;
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
  marketingRoiPrioritization?: string;
  activationSessionPlan?: string;
  competitiveVulnerabilitySignal?: string;
  marketingSpendEfficiencySignal?: string;
  revenueImpactStatement?: string;
}

export const BrandBlueprintPlusPDF = ({
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
  persona,
  archetype,
  voice,
  colorPalette = [],
  brandStory,
  positioning,
  journey = [],
  contentRoadmap = [],
  visualDirection = [],
  personality,
  decisionFilters = [],
  aiPrompts = [],
  completeAEOSystem,
  marketingRoiPrioritization,
  activationSessionPlan,
  competitiveVulnerabilitySignal,
  marketingSpendEfficiencySignal,
  revenueImpactStatement,
}: BrandBlueprintPlusPDFProps) => {
  const roadmap = getBlueprintPlusRoadmap(activationSessionPlan, roadmap30, roadmap60, roadmap90);
  const carryoverArchetypeName =
    typeof archetype === "string" ? archetype : archetype?.name || "";
  const carryoverArchetypeMeaning = getArchetypeMeaning(carryoverArchetypeName);
  const carryoverArchetypeIcon = getArchetypeIcon(carryoverArchetypeName);

  return (
    <Document>
      {(typeof brandAlignmentScore === "number" || pillarScores) && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Foundation Baseline</Text>
          {typeof brandAlignmentScore === "number" && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>WunderBrand Score™</Text>
              <Text style={{ ...stylePresets.h1, marginBottom: 0, color: colors.blue }}>
                {brandAlignmentScore}/100
              </Text>
              <Text style={stylePresets.body}>
                This baseline is included for continuity as Blueprint+ strategy layers on top.
              </Text>
            </View>
          )}
          {pillarScores && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Five-Pillar Scores</Text>
              {Object.entries(pillarScores).map(([pillar, score]) => (
                <Text key={pillar} style={stylePresets.body}>
                  • {pillar.charAt(0).toUpperCase() + pillar.slice(1)}: {score}/20
                </Text>
              ))}
            </View>
          )}
          {recommendations && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Top Priority Actions</Text>
              {Object.entries(recommendations)
                .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
                .slice(0, 3)
                .map(([pillar, value]) => (
                  <Text key={pillar} style={stylePresets.body}>
                    • {pillar.charAt(0).toUpperCase() + pillar.slice(1)}: {value}
                  </Text>
                ))}
            </View>
          )}
          <Text style={stylePresets.footer}>
            Foundation diagnostics carried forward into Blueprint+™.
          </Text>
        </Page>
      )}

      {/* PAGE 1 — COVER */}
      <Page style={stylePresets.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={{ width: 132, marginBottom: spacing.md }} />
        <View style={{ borderBottom: `3px solid ${colors.navy}`, paddingBottom: spacing.lg, marginBottom: spacing["2xl"] }}>
          <Text style={{ ...stylePresets.h1, fontSize: 32, marginBottom: 4 }}>WunderBrand Blueprint+™</Text>
          <Text style={{ fontSize: fonts.md, color: colors.textSecondary, fontWeight: fonts.medium }}>
            {businessName ? `Strategic Brand Operating System for ${businessName}` : "Advanced Strategic Brand Operating System"}
          </Text>
        </View>

        <Text style={{ ...stylePresets.body, marginTop: spacing.xl }}>
          {businessName ? `${businessName}\u2019s` : "Your"} WunderBrand Blueprint+™ is a comprehensive brand operating system — synthesizing customer intelligence, narrative architecture, positioning strategy, competitive analysis, and a complete AEO implementation roadmap into a single, execution-ready document. Every section is designed to be handed directly to your team, agency, or freelancers as a production brief.
        </Text>

        <View style={{ marginTop: spacing.xl, padding: spacing.md, backgroundColor: colors.bgSecondary, borderRadius: 8 }}>
          <Text style={{ ...stylePresets.h4, marginTop: 0 }}>What this document includes:</Text>
          <Text style={{ ...stylePresets.body, marginTop: spacing.sm }}>
            {"\u2022"} Brand story framework and positioning architecture{"\n"}
            {"\u2022"} Customer journey mapping with conversion triggers{"\n"}
            {"\u2022"} 12-month content roadmap with AEO integration{"\n"}
            {"\u2022"} Complete Answer Engine Optimization system{"\n"}
            {"\u2022"} Advanced AI Prompt Library calibrated to your brand{"\n"}
            {"\u2022"} Visual and verbal direction with decision filters
          </Text>
        </View>

        <Text style={stylePresets.footer}>
          © {new Date().getFullYear()} Wunderbar Digital. WunderBrand Blueprint+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      {(persona || archetype || voice || (colorPalette && colorPalette.length > 0)) && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Brand Foundation Carryover</Text>
          <Text style={stylePresets.body}>
            Snapshot+ foundation context is included below so this Blueprint+ plan remains continuous from diagnostic to execution.
          </Text>

          {persona && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Brand Persona</Text>
              <Text style={stylePresets.body}>
                {typeof persona === "string" ? persona : persona.summary || persona.description || ""}
              </Text>
            </View>
          )}

          {archetype && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Brand Archetype</Text>
              {typeof archetype === "string" ? (
                <>
                  <Text style={stylePresets.body}>
                    {carryoverArchetypeIcon ? `${carryoverArchetypeIcon} ` : ""}
                    {archetype}
                  </Text>
                  {carryoverArchetypeMeaning ? (
                    <Text style={stylePresets.body}>{carryoverArchetypeMeaning}</Text>
                  ) : null}
                </>
              ) : (
                <>
                  {archetype.name ? (
                    <Text style={stylePresets.h4}>
                      {carryoverArchetypeIcon ? `${carryoverArchetypeIcon} ` : ""}
                      {archetype.name}
                    </Text>
                  ) : null}
                  <Text style={stylePresets.body}>{archetype.summary || archetype.description || ""}</Text>
                  {carryoverArchetypeMeaning ? (
                    <Text style={stylePresets.body}>
                      <Text style={stylePresets.semibold}>Core pattern: </Text>
                      {carryoverArchetypeMeaning}
                    </Text>
                  ) : null}
                  {archetype.risk ? (
                    <Text style={stylePresets.body}>
                      <Text style={stylePresets.semibold}>Risk if overused: </Text>
                      {archetype.risk}
                    </Text>
                  ) : null}
                  {archetype.languageTone ? (
                    <Text style={stylePresets.body}>
                      <Text style={stylePresets.semibold}>How it should sound: </Text>
                      {archetype.languageTone}
                    </Text>
                  ) : null}
                  {archetype.behaviorGuide ? (
                    <Text style={stylePresets.body}>
                      <Text style={stylePresets.semibold}>Brand impact: </Text>
                      {archetype.behaviorGuide}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          )}

          {voice && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Brand Voice</Text>
              {typeof voice === "string" ? (
                <Text style={stylePresets.body}>{voice}</Text>
              ) : (
                <>
                  <Text style={stylePresets.body}>{voice.summary || voice.description || ""}</Text>
                  {voice.pillars?.length ? (
                    <>
                      <Text style={stylePresets.h4}>Tone Pillars</Text>
                      {voice.pillars.map((pillar, idx) => (
                        <Text key={`voice-pillar-${idx}`} style={stylePresets.body}>• {pillar}</Text>
                      ))}
                    </>
                  ) : null}
                </>
              )}
            </View>
          )}

          {colorPalette && colorPalette.length > 0 && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Recommended Color Palette</Text>
              {colorPalette.map((item, idx) => (
                <View key={`palette-${idx}`} style={{ marginBottom: 8 }}>
                  <ColorSwatch name={item.name || "Color"} hex={item.hex || "#000000"} />
                  {(item.role || item.meaning) && (
                    <Text style={{ ...stylePresets.small, marginTop: 2 }}>
                      {item.role ? `${item.role}` : "Brand role"}
                      {item.meaning ? ` • ${item.meaning}` : ""}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
          <Text style={stylePresets.footer}>
            Foundation continuity from Snapshot+™ into Blueprint+™.
          </Text>
        </Page>
      )}

      {(typeof contextCoverage === "number" || opportunitiesMap || roadmap30 || roadmap60 || roadmap90) && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Snapshot+ Strategic Continuity</Text>
          <Text style={stylePresets.body}>
            The following Snapshot+ strategic signals are preserved here to keep your Blueprint+ execution path connected to original diagnostics.
          </Text>

          {typeof contextCoverage === "number" && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Context Coverage</Text>
              <Text style={{ ...stylePresets.h1, marginBottom: 0, color: colors.blue }}>
                {Math.max(0, Math.min(100, Math.round(contextCoverage)))}%
              </Text>
            </View>
          )}

          {opportunitiesMap && (
            <View style={stylePresets.card}>
              <Text style={stylePresets.h3}>Opportunities Map</Text>
              <Text style={stylePresets.body}>{opportunitiesMap}</Text>
            </View>
          )}

          {(roadmap30 || roadmap60 || roadmap90) && (
            <>
              <Text style={stylePresets.h3}>Snapshot+ 30/60/90 Roadmap</Text>
              {[
                { title: "Next 30 Days", body: roadmap30 },
                { title: "Next 60 Days", body: roadmap60 },
                { title: "Next 90 Days", body: roadmap90 },
              ]
                .filter((phase) => typeof phase.body === "string" && phase.body.trim().length > 0)
                .map((phase, idx) => (
                  <View key={`${phase.title}-${idx}`} style={stylePresets.card}>
                    <Text style={stylePresets.h4}>{phase.title}</Text>
                    <Text style={stylePresets.body}>{phase.body}</Text>
                  </View>
                ))}
            </>
          )}

          <Text style={stylePresets.footer}>
            Snapshot+ strategy retained for continuity into Blueprint+ activation.
          </Text>
        </Page>
      )}

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

      {/* PAGE 11 — STRATEGIC SIGNALS */}
      {(competitiveVulnerabilitySignal || marketingSpendEfficiencySignal || revenueImpactStatement) && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Strategic Signals</Text>

          {competitiveVulnerabilitySignal && (
            <View style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h3, marginTop: 0 }}>Competitive Vulnerability Signal</Text>
              <Text style={stylePresets.body}>{competitiveVulnerabilitySignal}</Text>
            </View>
          )}

          {marketingSpendEfficiencySignal && (
            <View style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h3, marginTop: 0 }}>Marketing Spend Efficiency Signal</Text>
              <Text style={stylePresets.body}>{marketingSpendEfficiencySignal}</Text>
            </View>
          )}

          {revenueImpactStatement && (
            <View style={{ ...stylePresets.card, marginBottom: spacing.md }}>
              <Text style={{ ...stylePresets.h3, marginTop: 0 }}>Revenue Impact Statement</Text>
              <Text style={stylePresets.body}>{revenueImpactStatement}</Text>
            </View>
          )}

          <Text style={stylePresets.footer}>
            Strategic signals link market exposure, spend discipline, and revenue outcomes.
          </Text>
        </Page>
      )}

      {/* PAGE 12 — NEXT STEPS */}
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

        <Text style={stylePresets.h3}>Marketing ROI Prioritization</Text>
        <Text style={stylePresets.body}>
          {marketingRoiPrioritization ||
            "Use your Blueprint+ outputs to rank channels by expected return, allocate budget by near-term wins vs long-game growth, and avoid vanity metrics that do not correlate with revenue."}
        </Text>

        <Text style={stylePresets.h3}>90-Day Activation Plan</Text>
        <View style={stylePresets.card}>
          <Text style={stylePresets.h4}>Next 30 Days</Text>
          {roadmap.next30.map((item, idx) => (
            <Text key={`bpplus-30-${idx}`} style={stylePresets.body}>• {item}</Text>
          ))}
        </View>
        <View style={stylePresets.card}>
          <Text style={stylePresets.h4}>Next 60 Days</Text>
          {(roadmap.next60.length > 0 ? roadmap.next60 : ["Operationalize cross-channel consistency with a KPI dashboard."]).map((item, idx) => (
            <Text key={`bpplus-60-${idx}`} style={stylePresets.body}>• {item}</Text>
          ))}
        </View>
        <View style={stylePresets.card}>
          <Text style={stylePresets.h4}>Next 90 Days</Text>
          {(roadmap.next90.length > 0 ? roadmap.next90 : ["Scale the highest-performing motions and document governance standards."]).map((item, idx) => (
            <Text key={`bpplus-90-${idx}`} style={stylePresets.body}>• {item}</Text>
          ))}
        </View>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. WunderBrand Blueprint+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      <DisclaimerPage tier="blueprint_plus" />
    </Document>
  );
};

export default BrandBlueprintPlusPDF;
