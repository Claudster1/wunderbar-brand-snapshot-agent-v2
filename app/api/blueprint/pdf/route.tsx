// app/api/blueprint/pdf/route.tsx
// Generates any Blueprint/Blueprint+ document PDF by type.
// GET /api/blueprint/pdf?reportId=xxx&type=complete|executive|messaging|prompts|voice-checklist|icp-conversion-snapshot|icp-conversion-intelligence|activation|digital|competitive|standards|standards-internal|standards-external|standards-vendor&tier=blueprint|blueprint-plus

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import React from "react";
import { supabaseServer } from "@/lib/supabase";
import type { BlueprintEngineOutput } from "@/src/pdf/types/blueprintReport";
import { normalizeBrandImageryDirection } from "@/lib/brand/brandImageryNormalize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_TYPES = [
  "complete",
  "executive",
  "messaging",
  "prompts",
  "voice-checklist",
  "icp-conversion-snapshot",
  "icp-conversion-intelligence",
  "activation",
  "digital",
  "competitive",
  "standards",
  "standards-internal",
  "standards-external",
  "standards-vendor",
  "battle-cards",
] as const;
type DocType = (typeof VALID_TYPES)[number];
type WorkbookShape = Record<string, any>;

const BLUEPRINT_TYPES: DocType[] = ["complete", "executive", "messaging", "prompts", "voice-checklist", "icp-conversion-snapshot"];
const BLUEPRINT_PLUS_TYPES: DocType[] = [
  "complete",
  "executive",
  "messaging",
  "prompts",
  "voice-checklist",
  "icp-conversion-intelligence",
  "activation",
  "digital",
  "competitive",
  "standards",
  "standards-internal",
  "standards-external",
  "standards-vendor",
  "battle-cards",
];
const BLUEPRINT_STANDARDS_TYPES: DocType[] = ["standards", "standards-external", "standards-vendor"];

const DOC_LABELS: Record<DocType, string> = {
  complete: "Complete_Blueprint",
  executive: "Executive_Summary",
  messaging: "Messaging_Playbook",
  prompts: "AI_Prompt_Library",
  "voice-checklist": "Voice_Do_Dont_Checklist",
  "icp-conversion-snapshot": "ICP_Conversion_Snapshot",
  "icp-conversion-intelligence": "ICP_Conversion_Intelligence_Framework",
  activation: "90_Day_Activation_Plan",
  digital: "Digital_Marketing_Strategy",
  competitive: "Competitive_Intelligence_Brief",
  standards: "Brand_Standards_Guide",
  "standards-internal": "Internal_Brand_Master_Guide",
  "standards-external": "External_Brand_Guide",
  "standards-vendor": "Partner_Vendor_Spec_Sheet",
  "battle-cards": "Battle_Cards",
};

function normalizeTier(value: string | null | undefined): "blueprint" | "blueprint-plus" {
  if (!value) return "blueprint";
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  return normalized === "blueprint-plus" ? "blueprint-plus" : "blueprint";
}

function parseKeyValueLines(input: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9 /&()_-]{2,40}):\s*(.+)$/);
    if (!match) continue;
    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    result[key] = value;
  }
  return result;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitBlocks(input: string): string[] {
  return input
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function parseConversionReference(value: string | undefined) {
  const text = (value || "").trim();
  if (!text) return undefined;
  const kv = parseKeyValueLines(text);
  const matrixCell =
    kv["matrixcell"] || kv["matrix cell"] || kv["cell"] || text;
  const icpTier = kv["icptier"] || kv["icp tier"] || "Primary ICP";
  const funnelStage = kv["funnelstage"] || kv["funnel stage"] || "Consideration";
  return {
    type: "ref" as const,
    framework: "icp_conversion_intelligence_framework" as const,
    icpTier,
    funnelStage,
    matrixCell,
    note: kv["note"] || "",
  };
}

function parsePersonaAtlas(input: string) {
  const blocks = splitBlocks(input);
  const personas = blocks
    .map((block, index) => {
      const kv = parseKeyValueLines(block);
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const header =
        kv["persona"] ||
        kv["persona name"] ||
        kv["name"] ||
        kv["title"] ||
        lines[0] ||
        `Persona ${index + 1}`;
      const role = kv["role"] || kv["job title"] || kv["job titles"] || "Decision maker";
      const frustration =
        kv["core frustration"] ||
        kv["frustration"] ||
        kv["pain"] ||
        kv["pain points"] ||
        "Unclear path to measurable outcomes.";
      const motivation = kv["primary motivation"] || kv["motivation"] || kv["goals"] || "Achieve target business outcomes.";
      const decisionStyle = kv["decision style"] || kv["buying behavior"] || "Evidence-driven";
      const informationSources = kv["information sources"] || kv["sources"] || "Peer insight and practical examples";
      const messagingAngle =
        kv["messaging angle"] ||
        kv["value narrative"] ||
        kv["jtbd"] ||
        kv["primary jtbd"] ||
        lines.slice(0, 3).join(" ");
      const objections = parseList(kv["objections"] || kv["key objections"]);
      const channels = parseList(kv["channels"] || kv["channel priority"] || kv["preferred channels"]);
      return {
        personaName: header,
        icpAlignment: index === 0 ? "Primary ICP" : "Secondary ICP",
        role,
        coreFrustration: frustration,
        primaryMotivation: motivation,
        decisionStyle,
        informationSources,
        messagingAngle: messagingAngle || "Outcome-oriented, proof-backed messaging.",
        contentPreferences:
          kv["content preferences"] || kv["preferred content formats"] || "Case studies, tactical guides, and benchmarks",
        objectionAndResponse: {
          objection: objections[0] || "This may be hard to implement across teams.",
          response: "Start with the highest-impact sequence and assign clear owners per stage.",
        },
        channelPriority: channels.length > 0 ? channels : ["Email", "Search", "LinkedIn"],
        sampleHeadline:
          kv["sample headline"] ||
          `A clearer path to ${motivation.toLowerCase().replace(/\.$/, "")}`,
        sampleCTA: kv["sample cta"] || "Review the recommended rollout",
        summary: lines.slice(0, 4).join(" "),
      };
    })
    .filter((item) => item.personaName || item.messagingAngle);

  return personas;
}

function parseBuyerJourneyMap(input: string) {
  const blocks = splitBlocks(input);
  const normalizedStages = blocks
    .map((block, index) => {
      const kv = parseKeyValueLines(block);
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const stage = kv["stage"] || kv["stage name"] || lines[0] || `Stage ${index + 1}`;
      const primaryQuestion =
        kv["primary question"] || kv["question"] || kv["key question"] || "";
      const objections = parseList(kv["objections"] || kv["key objections"]);
      const touchpoints = parseList(
        kv["touchpoints"] || kv["owned touchpoints"] || kv["paid touchpoints"] || kv["sales touchpoints"]
      );
      const contentTypes = parseList(
        kv["content types"] || kv["primary content type"] || kv["assets"] || kv["content assets"]
      );
      const mindset =
        kv["mindset"] ||
        kv["buyer mindset"] ||
        kv["jobs active at this stage"] ||
        "Buyer is evaluating fit, risk, and expected outcomes.";
      const cta = kv["cta"] || kv["stage-exit cta"] || "Advance to next stage action";
      const kpi = kv["kpi"] || kv["conversion metric"] || "Progression to next stage";
      return {
        stage,
        customerMindset: mindset,
        keyQuestions: [
          primaryQuestion || `What is the best way to solve this priority at the ${stage.toLowerCase()} stage?`,
          ...objections.slice(0, 2),
        ].filter(Boolean),
        touchpoints: touchpoints.length > 0 ? touchpoints : ["Website", "Email", "Sales call"],
        messagingFocus:
          kv["messaging focus"] ||
          kv["message focus"] ||
          lines.slice(0, 2).join(" ") ||
          "Clarify outcome, reduce uncertainty, and provide proof.",
        contentTypes: contentTypes.length > 0 ? contentTypes : ["Brief", "Case study", "Email"],
        conversionTrigger: cta,
        kpiToTrack: kpi,
      };
    })
    .filter((item) => item.stage);

  return normalizedStages;
}

function parseCompetitiveMatrix(input: string) {
  const blocks = splitBlocks(input);
  const competitors = blocks
    .map((block, index) => {
      const kv = parseKeyValueLines(block);
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const name =
        kv["competitor"] ||
        kv["competitor name"] ||
        kv["name"] ||
        lines[0] ||
        `Competitor ${index + 1}`;
      const claim = kv["claim"] || kv["their headline claim"] || kv["positioning"] || "";
      const overlap = kv["icp overlap"] || kv["primary icp overlap"] || kv["target persona"] || "";
      const strengths = kv["strengths"] || kv["key differentiators"] || "";
      const weaknesses = kv["weaknesses"] || kv["perceived weaknesses"] || "";
      const whereWeWin = kv["where we win"] || kv["counter-positioning"] || "";
      const displacement = kv["displacement narrative"] || kv["counter narrative"] || "";
      const narrative = [claim, overlap ? `ICP overlap: ${overlap}` : "", strengths ? `Strengths: ${strengths}` : "", weaknesses ? `Weaknesses: ${weaknesses}` : "", whereWeWin ? `Where we win: ${whereWeWin}` : "", displacement ? `Displacement: ${displacement}` : ""]
        .filter(Boolean)
        .join(" | ");
      return {
        name,
        narrative: narrative || lines.slice(0, 4).join(" "),
        whereWeWin,
        displacement,
      };
    })
    .filter((item) => item.name);

  return competitors;
}

/**
 * Blueprint+ stores audience under `audiencePersonaDefinition` / `buyerPersonaEcosystem`;
 * Complete Blueprint PDF expects `audiencePersonas` / `buyerPersonas`.
 */
function normalizeAudienceFieldsForPdf(data: BlueprintEngineOutput): BlueprintEngineOutput {
  const d = data as unknown as Record<string, unknown>;
  const apd = d.audiencePersonaDefinition as Record<string, unknown> | undefined;
  const ap = d.audiencePersonas as Record<string, unknown> | undefined;
  const bpe = d.buyerPersonaEcosystem as { buyerPersonas?: unknown[] } | undefined;
  let next: Record<string, unknown> = { ...d };

  if (apd?.primaryICP && !ap?.primaryICP) {
    next = { ...next, audiencePersonas: apd };
  }

  const buyers = d.buyerPersonas as unknown[] | undefined;
  if ((!Array.isArray(buyers) || buyers.length === 0) && Array.isArray(bpe?.buyerPersonas) && bpe.buyerPersonas.length > 0) {
    next = { ...next, buyerPersonas: bpe.buyerPersonas };
  }

  return next as unknown as BlueprintEngineOutput;
}

function applyWorkbookOverrides(data: BlueprintEngineOutput, workbook?: WorkbookShape | null): BlueprintEngineOutput {
  if (!workbook) return data;

  const next: any = {
    ...(data as any),
    brandFoundation: { ...((data as any).brandFoundation || {}) },
    audiencePersonas: { ...((data as any).audiencePersonas || {}) },
    buyerPersonas: Array.isArray((data as any).buyerPersonas) ? [...(data as any).buyerPersonas] : [],
    companyDescription: { ...((data as any).companyDescription || {}) },
    competitivePositioning: { ...((data as any).competitivePositioning || {}) },
    visualVerbalSignals: { ...((data as any).visualVerbalSignals || {}) },
    brandPersona: { ...((data as any).brandPersona || {}) },
    brandStory: { ...((data as any).brandStory || {}) },
    audienceSignals: { ...((data as any).audienceSignals || {}) },
    executiveSummary: { ...((data as any).executiveSummary || {}) },
    customerJourneyMap: { ...((data as any).customerJourneyMap || {}) },
    visibilityAndDiscovery: { ...((data as any).visibilityAndDiscovery || {}) },
    conversionOptimization: { ...((data as any).conversionOptimization || {}) },
    emailMarketingFramework: { ...((data as any).emailMarketingFramework || {}) },
    socialMediaStrategy: { ...((data as any).socialMediaStrategy || {}) },
    paidMediaStrategy: { ...((data as any).paidMediaStrategy || {}) },
    contentCalendarFramework: { ...((data as any).contentCalendarFramework || {}) },
    thoughtLeadershipStrategy: { ...((data as any).thoughtLeadershipStrategy || {}) },
    icpConversionIntelligenceFramework: { ...((data as any).icpConversionIntelligenceFramework || {}) },
    strategicSignals: { ...((data as any).strategicSignals || {}) },
    swotAnalysis: { ...((data as any).swotAnalysis || {}) },
    brandStrategyRollout: { ...((data as any).brandStrategyRollout || {}) },
  };

  const reportSections = workbook?.custom_sections?.report_sections || {};
  const strategic = workbook?.custom_sections?.strategic || {};
  const workbookTabSections = workbook?.custom_sections?.workbook_tab_sections || {};

  if (typeof workbook.positioning_statement === "string" && workbook.positioning_statement.trim()) {
    next.brandFoundation.positioningStatement = workbook.positioning_statement.trim();
  }
  if (typeof workbook.unique_value_proposition === "string" && workbook.unique_value_proposition.trim()) {
    next.brandFoundation.differentiationNarrative = workbook.unique_value_proposition.trim();
  }
  if (typeof workbook.competitive_differentiation === "string" && workbook.competitive_differentiation.trim()) {
    next.competitivePositioning.differentiationSummary = workbook.competitive_differentiation.trim();
  }
  if (typeof workbook.elevator_pitch_30s === "string" && workbook.elevator_pitch_30s.trim()) {
    next.brandStory.elevatorPitch = workbook.elevator_pitch_30s.trim();
    next.companyDescription.oneLiner = workbook.elevator_pitch_30s.trim();
  }
  if (typeof workbook.elevator_pitch_60s === "string" && workbook.elevator_pitch_60s.trim()) {
    next.companyDescription.shortDescription = workbook.elevator_pitch_60s.trim();
  }
  if (typeof workbook.elevator_pitch_email === "string" && workbook.elevator_pitch_email.trim()) {
    next.companyDescription.proposalIntro = workbook.elevator_pitch_email.trim();
  }
  if (Array.isArray(workbook.messaging_pillars) && workbook.messaging_pillars.length > 0) {
    next.messagingPillars = workbook.messaging_pillars.map((item: any) => ({
      name: item?.title || item?.name || "Messaging Pillar",
      whatItCommunicates: item?.description || "",
      exampleMessage: Array.isArray(item?.proof_points) ? item.proof_points[0] || "" : "",
      proofPoints: Array.isArray(item?.proof_points) ? item.proof_points : [],
    }));
  }
  if (Array.isArray(workbook.brand_voice_attributes) && workbook.brand_voice_attributes.length > 0) {
    next.visualVerbalSignals.voiceTraits = workbook.brand_voice_attributes;
  }
  if (typeof workbook.tone_guidelines === "string" && workbook.tone_guidelines.trim()) {
    next.visualVerbalSignals.toneGuidelines = workbook.tone_guidelines.trim();
    next.brandPersona.communicationStyle = {
      ...(next.brandPersona.communicationStyle || {}),
      tone: workbook.tone_guidelines.trim(),
    };
  }
  if (Array.isArray(workbook.voice_dos) || Array.isArray(workbook.voice_donts)) {
    next.brandPersona.doAndDont = {
      do: Array.isArray(workbook.voice_dos)
        ? workbook.voice_dos.map((v: any) => ({ guideline: String(v || "").trim() })).filter((v: any) => v.guideline)
        : next.brandPersona?.doAndDont?.do || [],
      dont: Array.isArray(workbook.voice_donts)
        ? workbook.voice_donts.map((v: any) => ({ guideline: String(v || "").trim() })).filter((v: any) => v.guideline)
        : next.brandPersona?.doAndDont?.dont || [],
    };
  }
  if (workbook.primary_audience) {
    const desc = typeof workbook.primary_audience === "string"
      ? workbook.primary_audience
      : workbook.primary_audience?.description;
    if (typeof desc === "string" && desc.trim()) {
      next.targetAudience = desc.trim();
      next.audienceSignals.segments = [
        { ...(next.audienceSignals?.segments?.[0] || {}), summary: desc.trim(), label: desc.trim() },
        ...(Array.isArray(next.audienceSignals?.segments) ? next.audienceSignals.segments.slice(1) : []),
      ];
    }
  }
  if (Array.isArray(workbook.key_differentiators) && workbook.key_differentiators.length > 0) {
    next.competitivePositioning.differentiators = workbook.key_differentiators.map((d: any) => ({
      title: d?.differentiator || d?.title || String(d || ""),
      advantage: d?.competitive_advantage || "",
      proof: d?.proof || "",
    }));
  }

  if (typeof reportSections.executive_summary === "string" && reportSections.executive_summary.trim()) {
    next.executiveSummary.synthesis = reportSections.executive_summary.trim();
  }
  if (typeof reportSections.score_analysis === "string" && reportSections.score_analysis.trim()) {
    next.executiveSummary.industryBenchmark = reportSections.score_analysis.trim();
  }
  if (typeof reportSections.strategic_signals === "string" && reportSections.strategic_signals.trim()) {
    next.strategicSignals.narrative = reportSections.strategic_signals.trim();
  }
  if (typeof reportSections.competitive_positioning === "string" && reportSections.competitive_positioning.trim()) {
    next.competitivePositioning.positioningSummary = reportSections.competitive_positioning.trim();
  }
  if (typeof reportSections.journey_map === "string" && reportSections.journey_map.trim()) {
    next.customerJourneyMap.overview = reportSections.journey_map.trim();
  }
  if (typeof reportSections.seo_aeo === "string" && reportSections.seo_aeo.trim()) {
    next.visibilityAndDiscovery.searchStrategy = reportSections.seo_aeo.trim();
  }
  if (typeof reportSections.conversion_strategy === "string" && reportSections.conversion_strategy.trim()) {
    next.conversionOptimization.overview = reportSections.conversion_strategy.trim();
  }
  if (typeof reportSections.email_framework === "string" && reportSections.email_framework.trim()) {
    next.emailMarketingFramework.overview = reportSections.email_framework.trim();
  }
  if (typeof reportSections.social_strategy === "string" && reportSections.social_strategy.trim()) {
    next.socialMediaStrategy.overview = reportSections.social_strategy.trim();
  }
  if (
    typeof reportSections.icp_conversion_intelligence_overview === "string" &&
    reportSections.icp_conversion_intelligence_overview.trim()
  ) {
    next.icpConversionIntelligenceFramework.overview =
      reportSections.icp_conversion_intelligence_overview.trim();
  }
  const contentRef = parseConversionReference(
    typeof reportSections.content_strategy_conversion_intelligence_reference === "string"
      ? reportSections.content_strategy_conversion_intelligence_reference
      : undefined
  );
  if (contentRef) {
    next.contentCalendarFramework.conversion_intelligence_reference = contentRef;
  }
  const emailRef = parseConversionReference(
    typeof reportSections.email_nurture_conversion_intelligence_reference === "string"
      ? reportSections.email_nurture_conversion_intelligence_reference
      : undefined
  );
  if (emailRef) {
    next.emailMarketingFramework.conversion_intelligence_reference = emailRef;
  }
  const paidRef = parseConversionReference(
    typeof reportSections.paid_media_conversion_intelligence_reference === "string"
      ? reportSections.paid_media_conversion_intelligence_reference
      : undefined
  );
  if (paidRef) {
    next.paidMediaStrategy.conversion_intelligence_reference = paidRef;
  }
  const socialRef = parseConversionReference(
    typeof reportSections.social_media_conversion_intelligence_reference === "string"
      ? reportSections.social_media_conversion_intelligence_reference
      : undefined
  );
  if (socialRef) {
    next.socialMediaStrategy.conversion_intelligence_reference = socialRef;
  }
  const salesRef = parseConversionReference(
    typeof reportSections.sales_enablement_conversion_intelligence_reference === "string"
      ? reportSections.sales_enablement_conversion_intelligence_reference
      : undefined
  );
  if (salesRef) {
    next.salesConversationGuide.conversion_intelligence_reference = salesRef;
  }
  const thoughtRef = parseConversionReference(
    typeof reportSections.thought_leadership_conversion_intelligence_reference === "string"
      ? reportSections.thought_leadership_conversion_intelligence_reference
      : undefined
  );
  if (thoughtRef) {
    next.thoughtLeadershipStrategy.conversion_intelligence_reference = thoughtRef;
  }
  if (typeof reportSections.implementation_action_plan === "string" && reportSections.implementation_action_plan.trim()) {
    next.brandStrategyRollout.brandStrategyOnePager = reportSections.implementation_action_plan.trim();
  }

  // Workbook tab overlays so user edits appear in generated PDFs.
  if (typeof workbookTabSections["persona-atlas"] === "string" && workbookTabSections["persona-atlas"].trim()) {
    const personaAtlas = workbookTabSections["persona-atlas"].trim();
    const parsedPersonas = parsePersonaAtlas(personaAtlas);
    next.targetAudience = personaAtlas;
    next.audienceSignals = {
      ...(next.audienceSignals || {}),
      segments: [
        {
          ...((next.audienceSignals?.segments?.[0] as Record<string, unknown>) || {}),
          label: "Persona Atlas",
          summary: personaAtlas,
        },
        ...(Array.isArray(next.audienceSignals?.segments) ? next.audienceSignals.segments.slice(1) : []),
      ],
    };
    next.audiencePersonas = {
      ...(next.audiencePersonas || {}),
      primaryICP: {
        ...((next.audiencePersonas?.primaryICP as Record<string, unknown>) || {}),
        summary: personaAtlas,
      },
    };
    if (parsedPersonas.length > 0) {
      next.buyerPersonas = parsedPersonas.map((persona) => ({
        personaName: persona.personaName,
        icpAlignment: persona.icpAlignment,
        role: persona.role,
        coreFrustration: persona.coreFrustration,
        primaryMotivation: persona.primaryMotivation,
        decisionStyle: persona.decisionStyle,
        informationSources: persona.informationSources,
        messagingAngle: persona.messagingAngle,
        contentPreferences: persona.contentPreferences,
        objectionAndResponse: persona.objectionAndResponse,
        channelPriority: persona.channelPriority,
        sampleHeadline: persona.sampleHeadline,
        sampleCTA: persona.sampleCTA,
      }));
      const primary = parsedPersonas[0];
      const secondary = parsedPersonas[1];
      next.audiencePersonas = {
        ...(next.audiencePersonas || {}),
        primaryICP: {
          ...((next.audiencePersonas?.primaryICP as Record<string, unknown>) || {}),
          name: primary.personaName,
          summary: primary.summary,
          goals: primary.primaryMotivation,
          objections: [primary.objectionAndResponse.objection],
        },
        secondaryICP: secondary
          ? {
              ...((next.audiencePersonas?.secondaryICP as Record<string, unknown>) || {}),
              name: secondary.personaName,
              summary: secondary.summary,
              goals: secondary.primaryMotivation,
              objections: [secondary.objectionAndResponse.objection],
            }
          : next.audiencePersonas?.secondaryICP,
      };
    }
  }

  if (typeof workbookTabSections["buyer-journey-map"] === "string" && workbookTabSections["buyer-journey-map"].trim()) {
    const journeyMap = workbookTabSections["buyer-journey-map"].trim();
    const stages = parseBuyerJourneyMap(journeyMap);
    next.customerJourneyMap = {
      ...(next.customerJourneyMap || {}),
      overview: journeyMap,
      stages: stages.length > 0 ? stages : next.customerJourneyMap?.stages,
    };
  }

  if (
    typeof workbookTabSections["competitive-landscape-matrix"] === "string" &&
    workbookTabSections["competitive-landscape-matrix"].trim()
  ) {
    const competitiveMatrix = workbookTabSections["competitive-landscape-matrix"].trim();
    const competitors = parseCompetitiveMatrix(competitiveMatrix);
    next.competitivePositioning = {
      ...(next.competitivePositioning || {}),
      strategicWhitespace: competitiveMatrix,
      differentiationSummary: competitiveMatrix,
      vulnerabilities:
        (typeof next.competitivePositioning?.vulnerabilities === "string" &&
          next.competitivePositioning.vulnerabilities) ||
        "Monitor claims overlap and update counter-positioning narratives quarterly.",
      players:
        competitors.length > 0
          ? competitors.map((competitor, index) => ({
              name: competitor.name,
              position: { x: `P${index + 1}`, y: "Mapped from workbook" },
              narrative: competitor.narrative,
            }))
          : next.competitivePositioning?.players,
    };
    next.salesConversationGuide = {
      ...(next.salesConversationGuide || {}),
      openingFramework:
        (typeof next.salesConversationGuide?.openingFramework === "string" &&
          next.salesConversationGuide.openingFramework) ||
        competitiveMatrix,
      objectionHandlingPlaybook:
        competitors.length > 0
          ? competitors
              .filter((competitor) => competitor.whereWeWin || competitor.displacement)
              .map((competitor) => ({
                objection: `Why not ${competitor.name}?`,
                response:
                  competitor.whereWeWin ||
                  competitor.displacement ||
                  "Use counter-positioning anchored to proof and fit.",
                pillarConnection: "Positioning",
                proofPoint: competitor.displacement || "Use role-specific evidence.",
              }))
          : next.salesConversationGuide?.objectionHandlingPlaybook,
    };
  }
  if (
    typeof workbookTabSections["icp-conversion-intelligence"] === "string" &&
    workbookTabSections["icp-conversion-intelligence"].trim()
  ) {
    const icpText = workbookTabSections["icp-conversion-intelligence"].trim();
    next.icpConversionIntelligenceFramework = {
      ...(next.icpConversionIntelligenceFramework || {}),
      overview: icpText,
    };
  }

  if (typeof strategic.swot_overview === "string" && strategic.swot_overview.trim()) {
    next.swotAnalysis.summary = strategic.swot_overview.trim();
  }
  if (typeof strategic.swot_strengths === "string" && strategic.swot_strengths.trim()) {
    next.swotAnalysis.strengths = strategic.swot_strengths.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_weaknesses === "string" && strategic.swot_weaknesses.trim()) {
    next.swotAnalysis.weaknesses = strategic.swot_weaknesses.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_opportunities === "string" && strategic.swot_opportunities.trim()) {
    next.swotAnalysis.opportunities = strategic.swot_opportunities.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof strategic.swot_threats === "string" && strategic.swot_threats.trim()) {
    next.swotAnalysis.threats = strategic.swot_threats.split("\n").map((s: string) => s.trim()).filter(Boolean);
  }

  return next as BlueprintEngineOutput;
}

function toBrandStandardsData(d: BlueprintEngineOutput, brandName: string, workbook?: WorkbookShape | null) {
  const bsd = (d as any).brandStandardsGuide || {};
  const wb = workbook as WorkbookShape | null | undefined;
  const csMood =
    wb &&
    typeof wb === "object" &&
    wb.custom_sections &&
    typeof wb.custom_sections === "object" &&
    !Array.isArray(wb.custom_sections) &&
    Array.isArray((wb.custom_sections as Record<string, unknown>).mood_board_image_samples)
      ? ((wb.custom_sections as Record<string, unknown>).mood_board_image_samples as unknown[])
      : undefined;
  const wbMoodSamples = csMood?.length ? csMood : wb?.brandStandardsGuide?.moodBoardImageSamples;
  const imageryBase = d.brandImageryDirection;
  const mergedImagery =
    imageryBase && typeof imageryBase === "object"
      ? {
          ...imageryBase,
          moodBoardImageSamples: wbMoodSamples ?? (imageryBase as any).moodBoardImageSamples,
        }
      : wbMoodSamples
        ? { moodBoardImageSamples: wbMoodSamples }
        : null;
  const brandImageryNormalized = normalizeBrandImageryDirection(mergedImagery);
  const visualSystemModeRaw = workbook?.custom_sections?.visual_system_mode;
  const visualSystemMode =
    visualSystemModeRaw === "existing" || visualSystemModeRaw === "optimize" || visualSystemModeRaw === "refresh"
      ? visualSystemModeRaw
      : undefined;
  return {
    business_name: brandName,
    positioning_statement: d.brandFoundation?.positioningStatement,
    unique_value_proposition: d.brandFoundation?.differentiationNarrative,
    brand_archetype: d.brandArchetypeSystem?.primary?.name,
    archetype_description: d.brandArchetypeSystem?.primary?.whenAligned,
    archetype_application: d.brandArchetypeActivation?.activation?.messaging,
    brand_alignment_score: d.executiveSummary?.brandAlignmentScore,
    brand_voice_attributes: d.visualVerbalSignals?.voiceTraits,
    tone_guidelines: d.brandPersona?.communicationStyle?.tone,
    voice_dos: d.brandPersona?.doAndDont?.do?.map((i: any) => i.guideline || i),
    voice_donts: d.brandPersona?.doAndDont?.dont?.map((i: any) => i.guideline || i),
    elevator_pitch_30s: d.brandStory?.elevatorPitch,
    messaging_pillars: d.messagingPillars?.map(mp => ({
      name: mp.name,
      description: mp.whatItCommunicates,
      example: mp.exampleMessage,
    })),
    ...(brandImageryNormalized ? { brand_imagery_direction: brandImageryNormalized } : {}),
    brand_standards_data: {
      visual_system_mode: visualSystemMode,
      brand_story: d.brandStory ? {
        headline: d.brandStory.headline,
        narrative: d.brandStory.narrative,
        founder_story: d.brandStory.founderStory,
      } : undefined,
      brand_purpose: d.brandFoundation?.brandPurpose,
      brand_promise: d.brandFoundation?.brandPromise,
      mission: d.brandFoundation?.mission,
      vision: d.brandFoundation?.vision,
      values: d.brandFoundation?.values,
      persona_summary: d.brandPersona?.personaSummary,
      core_identity: d.brandPersona?.coreIdentity ? {
        who_you_are: d.brandPersona.coreIdentity.whoYouAre,
        what_you_stand_for: d.brandPersona.coreIdentity.whatYouStandFor,
        how_you_show_up: d.brandPersona.coreIdentity.howYouShowUp,
      } : undefined,
      color_palette: d.visualDirection?.colorPalette,
      avoid_colors: d.visualVerbalSignals?.avoidColors,
      visual_consistency_principles: d.visualDirection?.visualConsistencyPrinciples,
      logo_guidelines: bsd.logoGuidelines ? {
        overview: bsd.logoGuidelines.overview,
        clear_space: bsd.logoGuidelines.clearSpace,
        minimum_size: bsd.logoGuidelines.minimumSize,
        placement_rules: bsd.logoGuidelines.placementRules,
        incorrect_uses: bsd.logoGuidelines.incorrectUses,
      } : undefined,
      layout_guidelines: bsd.layoutGuidelines ? {
        overview: bsd.layoutGuidelines.overview,
        margins: bsd.layoutGuidelines.margins,
        spacing: bsd.layoutGuidelines.spacing,
        grid_system: bsd.layoutGuidelines.gridSystem,
        digital_patterns: bsd.layoutGuidelines.digitalPatterns,
        print_patterns: bsd.layoutGuidelines.printPatterns,
      } : undefined,
      writing_guidelines: bsd.writingGuidelines ? {
        overview: bsd.writingGuidelines.overview,
        grammar_preferences: bsd.writingGuidelines.grammarPreferences,
        jargon_rules: bsd.writingGuidelines.jargonRules,
        point_of_view: bsd.writingGuidelines.pointOfView,
        inclusive_language: bsd.writingGuidelines.inclusiveLanguage,
        style_preferences: bsd.writingGuidelines.stylePreferences,
      } : undefined,
      taglines: d.taglineRecommendations?.map(t => ({ tagline: t.tagline, usage: t.bestUsedOn })),
      boilerplate: d.companyDescription ? {
        one_liner: d.companyDescription.oneLiner,
        short_description: d.companyDescription.shortDescription,
        full_boilerplate: d.companyDescription.fullBoilerplate,
        proposal_intro: d.companyDescription.proposalIntro,
      } : undefined,
      sample_executions: bsd.sampleExecutions,
      do_and_dont_pages: bsd.doAndDontPages,
      content_pillars: d.contentPillars?.map((cp: any) => ({
        name: cp.name,
        description: cp.description,
        example_topics: cp.exampleTopics,
      })),
      governance_template: bsd.governanceTemplate ? {
        brand_owner_role: bsd.governanceTemplate.brandOwnerRole,
        review_cadence: bsd.governanceTemplate.reviewCadence,
        exception_process: bsd.governanceTemplate.exceptionProcess,
      } : undefined,
    },
  };
}

async function renderDocument(
  type: DocType,
  data: BlueprintEngineOutput,
  brandName: string,
  userName?: string,
  workbook?: WorkbookShape | null,
) {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  switch (type) {
    case "complete": {
      const { CompleteBlueprintDocument } = await import("@/src/pdf/documents/CompleteBlueprintDocument");
      return renderToBuffer(<CompleteBlueprintDocument data={data} brandName={brandName} userName={userName} />);
    }
    case "executive": {
      const { ExecutiveSummaryDocument } = await import("@/src/pdf/documents/ExecutiveSummaryDocument");
      return renderToBuffer(<ExecutiveSummaryDocument data={data} brandName={brandName} userName={userName} />);
    }
    case "messaging": {
      const { MessagingPlaybookDocument } = await import("@/src/pdf/documents/MessagingPlaybookDocument");
      return renderToBuffer(<MessagingPlaybookDocument data={data} brandName={brandName} />);
    }
    case "prompts": {
      const { PromptLibraryDocument } = await import("@/src/pdf/documents/PromptLibraryDocument");
      return renderToBuffer(<PromptLibraryDocument data={data} brandName={brandName} />);
    }
    case "voice-checklist": {
      const { VoiceChecklistDocument } = await import("@/src/pdf/documents/VoiceChecklistDocument");
      return renderToBuffer(<VoiceChecklistDocument data={data} brandName={brandName} />);
    }
    case "icp-conversion-snapshot": {
      const { ICPConversionSnapshotDocument } = await import("@/src/pdf/documents/ICPConversionSnapshotDocument");
      return renderToBuffer(<ICPConversionSnapshotDocument data={data} brandName={brandName} />);
    }
    case "icp-conversion-intelligence": {
      const { ICPConversionIntelligenceDocument } = await import("@/src/pdf/documents/ICPConversionIntelligenceDocument");
      return renderToBuffer(<ICPConversionIntelligenceDocument data={data} brandName={brandName} />);
    }
    case "activation": {
      const { ActivationPlanDocument } = await import("@/src/pdf/documents/ActivationPlanDocument");
      return renderToBuffer(<ActivationPlanDocument data={data} brandName={brandName} />);
    }
    case "digital": {
      const { DigitalStrategyDocument } = await import("@/src/pdf/documents/DigitalStrategyDocument");
      return renderToBuffer(<DigitalStrategyDocument data={data} brandName={brandName} />);
    }
    case "competitive": {
      const { CompetitiveIntelDocument } = await import("@/src/pdf/documents/CompetitiveIntelDocument");
      return renderToBuffer(<CompetitiveIntelDocument data={data} brandName={brandName} />);
    }
    case "standards": {
      const { BrandStandardsDocument } = await import("@/src/pdf/documents/BrandStandardsDocument");
      const workbookData = toBrandStandardsData(data, brandName, workbook);
      return renderToBuffer(<BrandStandardsDocument data={workbookData as any} />);
    }
    case "standards-internal": {
      const { InternalBrandMasterGuideDocument } = await import("@/src/pdf/documents/InternalBrandMasterGuideDocument");
      const workbookData = toBrandStandardsData(data, brandName, workbook);
      return renderToBuffer(<InternalBrandMasterGuideDocument data={workbookData as any} />);
    }
    case "standards-external": {
      const { ExternalBrandGuideDocument } = await import("@/src/pdf/documents/ExternalBrandGuideDocument");
      const workbookData = toBrandStandardsData(data, brandName, workbook);
      return renderToBuffer(<ExternalBrandGuideDocument data={workbookData as any} />);
    }
    case "standards-vendor": {
      const { PartnerVendorSpecSheetDocument } = await import("@/src/pdf/documents/PartnerVendorSpecSheetDocument");
      const workbookData = toBrandStandardsData(data, brandName, workbook);
      return renderToBuffer(<PartnerVendorSpecSheetDocument data={workbookData as any} />);
    }
    case "battle-cards": {
      const { BattleCardsDocument } = await import("@/src/pdf/documents/BattleCardsDocument");
      return renderToBuffer(<BattleCardsDocument data={data} brandName={brandName} />);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const reportId = req.nextUrl.searchParams.get("reportId");
    const type = req.nextUrl.searchParams.get("type") as DocType | null;
    const email = req.nextUrl.searchParams.get("email");
    const tier = req.nextUrl.searchParams.get("tier") || "blueprint";

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const requestedTier = normalizeTier(tier);
    const requestedTypes =
      requestedTier === "blueprint-plus"
        ? BLUEPRINT_PLUS_TYPES
        : [...BLUEPRINT_TYPES, ...BLUEPRINT_STANDARDS_TYPES];
    const allowedTypes = requestedTypes;
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: `Document type "${type}" requires Blueprint+™` },
        { status: 403 }
      );
    }

    const sb = supabaseServer();

    type ReportShape = { report_data: BlueprintEngineOutput; company_name: string; user_email: string; user_name?: string; tier?: string };
    let report: ReportShape | null = null;

    const { data: primary, error: primaryErr } = await sb
      .from("blueprint_reports" as any)
      .select("report_data, company_name, user_email, user_name, tier")
      .eq("id", reportId)
      .single();

    if (primary && !primaryErr) {
      report = primary as unknown as ReportShape;
    } else {
      const { data: primaryByReportId, error: primaryByReportIdErr } = await sb
        .from("blueprint_reports" as any)
        .select("report_data, company_name, user_email, user_name, tier")
        .eq("report_id", reportId)
        .single();

      if (primaryByReportId && !primaryByReportIdErr) {
        report = primaryByReportId as unknown as ReportShape;
      } else {
      // Backward compatibility: some links persist report_id while others use id.
      let fallbackRecord: Record<string, unknown> | null = null;

      const { data: fallbackById } = await sb
        .from("brand_snapshot_plus_reports" as any)
        .select("full_report, company_name, user_email, user_name, tier")
        .eq("id", reportId)
        .single();

      if (fallbackById) {
        fallbackRecord = fallbackById as Record<string, unknown>;
      } else {
        const { data: fallbackByReportId } = await sb
          .from("brand_snapshot_plus_reports" as any)
          .select("full_report, company_name, user_email, user_name, tier")
          .eq("report_id", reportId)
          .single();
        if (fallbackByReportId) {
          fallbackRecord = fallbackByReportId as Record<string, unknown>;
        }
      }

        if (fallbackRecord) {
          const fb = fallbackRecord;
          const fullReport = typeof fb.full_report === "string"
            ? JSON.parse(fb.full_report)
            : fb.full_report;
          report = {
            report_data: fullReport as BlueprintEngineOutput,
            company_name: (fb.company_name as string) || (fullReport as any)?.businessName || "Your Brand",
            user_email: (fb.user_email as string) || "",
            user_name: fb.user_name as string | undefined,
            tier: normalizeTier((fb.tier as string) || requestedTier),
          };
        }
      }
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (email && report.user_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    const reportTier = normalizeTier(report.tier || requestedTier);
    const serverAllowed =
      reportTier === "blueprint-plus"
        ? BLUEPRINT_PLUS_TYPES
        : [...BLUEPRINT_TYPES, ...BLUEPRINT_STANDARDS_TYPES];
    if (!serverAllowed.includes(type)) {
      return NextResponse.json(
        { error: `This report's tier does not include the "${type}" document` },
        { status: 403 }
      );
    }

    let workbook: WorkbookShape | null = null;
    try {
      let workbookQuery = sb
        .from("brand_workbook" as any)
        .select("*")
        .eq("report_id", reportId)
        .limit(1);
      if (email) {
        workbookQuery = workbookQuery.eq("email", email.toLowerCase());
      }
      const { data: workbookRows } = await workbookQuery;
      if (Array.isArray(workbookRows) && workbookRows.length > 0) {
        workbook = workbookRows[0] as WorkbookShape;
      }
    } catch (wbErr) {
      logger.warn("[Blueprint PDF] Workbook overlay skipped", {
        error: wbErr instanceof Error ? wbErr.message : String(wbErr),
        reportId,
      });
    }

    const brandName = (workbook?.business_name as string) || report.company_name || "Your Brand";
    const userName = report.user_name || undefined;
    const engineData = normalizeAudienceFieldsForPdf(applyWorkbookOverrides(report.report_data, workbook));

    if (!engineData) {
      return NextResponse.json({ error: "Report has no engine data" }, { status: 404 });
    }

    const buffer = await renderDocument(type, engineData, brandName, userName, workbook);
    const uint8 = new Uint8Array(buffer);

    const tierSuffix = reportTier === "blueprint-plus" ? "Blueprint_Plus" : "Blueprint";
    const sanitizedName = brandName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${sanitizedName}_${DOC_LABELS[type]}_${tierSuffix}.pdf`;

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    logger.error("[Blueprint PDF]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
