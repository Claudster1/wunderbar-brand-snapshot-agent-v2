/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { BrandSnapshotPDF, type BrandSnapshotReport } from "@/src/pdf/BrandSnapshotPDF";
import { BrandSnapshotPlusPDF, type BrandSnapshotPlusReport } from "@/src/pdf/BrandSnapshotPlusPDF";

type LegacyReportProps = {
  userName?: string;
  businessName?: string;
  brandAlignmentScore?: number;
  pillarScores?: Record<string, number>;
  pillarInsights?: Record<string, unknown>;
  recommendations?: unknown;
  suggestedPalette?: unknown[];
  isPlus?: boolean;
  report?: Record<string, unknown>;
  persona?: unknown;
  archetype?: unknown;
  brandVoice?: unknown;
  voice?: unknown;
  opportunitiesMap?: unknown;
  roadmap30?: unknown;
  roadmap60?: unknown;
  roadmap90?: unknown;
};

const DEFAULT_PILLAR_SCORES = {
  positioning: 0,
  messaging: 0,
  visibility: 0,
  credibility: 0,
  conversion: 0,
};

const DEFAULT_PILLAR_TEXT = {
  positioning: "",
  messaging: "",
  visibility: "",
  credibility: "",
  conversion: "",
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizePillarScores(input: unknown): BrandSnapshotReport["pillarScores"] {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    positioning: Number(source.positioning ?? 0),
    messaging: Number(source.messaging ?? 0),
    visibility: Number(source.visibility ?? 0),
    credibility: Number(source.credibility ?? 0),
    conversion: Number(source.conversion ?? 0),
  };
}

function normalizePillarTextMap(input: unknown): BrandSnapshotReport["pillarInsights"] {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    positioning: asString(source.positioning),
    messaging: asString(source.messaging),
    visibility: asString(source.visibility),
    credibility: asString(source.credibility),
    conversion: asString(source.conversion),
  };
}

function normalizeRecommendations(input: unknown): BrandSnapshotReport["recommendations"] {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const source = input as Record<string, unknown>;
    return {
      positioning: asString(source.positioning),
      messaging: asString(source.messaging),
      visibility: asString(source.visibility),
      credibility: asString(source.credibility),
      conversion: asString(source.conversion),
    };
  }
  if (Array.isArray(input)) {
    const values = input.map((item) => asString(item)).filter(Boolean);
    return {
      positioning: values[0] ?? "",
      messaging: values[1] ?? "",
      visibility: values[2] ?? "",
      credibility: values[3] ?? "",
      conversion: values[4] ?? "",
    };
  }
  return { ...DEFAULT_PILLAR_TEXT };
}

function normalizeColorPalette(input: unknown): Array<{ name?: string; hex?: string; role?: string; meaning?: string }> {
  if (!Array.isArray(input)) return [];
  const palette: Array<{ name?: string; hex?: string; role?: string; meaning?: string }> = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    palette.push({
      name: asString(c.name) || undefined,
      hex: asString(c.hex) || undefined,
      role: asString(c.role) || undefined,
      meaning: asString(c.meaning) || undefined,
    });
  }
  return palette;
}

function normalizePersona(value: unknown): BrandSnapshotPlusReport["persona"] {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    return {
      summary: asString(v.summary) || undefined,
      description: asString(v.description) || undefined,
    };
  }
  return undefined;
}

function normalizeArchetype(value: unknown): BrandSnapshotPlusReport["archetype"] {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    const secondary =
      typeof v.secondary === "string"
        ? v.secondary
        : v.secondary && typeof v.secondary === "object"
          ? {
              name: asString((v.secondary as Record<string, unknown>).name) || undefined,
              summary: asString((v.secondary as Record<string, unknown>).summary) || undefined,
              description: asString((v.secondary as Record<string, unknown>).description) || undefined,
            }
          : undefined;
    return {
      name: asString(v.name) || undefined,
      summary: asString(v.summary) || undefined,
      description: asString(v.description) || undefined,
      risk: asString(v.risk) || undefined,
      languageTone: asString(v.languageTone) || undefined,
      behaviorGuide: asString(v.behaviorGuide) || undefined,
      secondary,
      pairingGuidance: asString(v.pairingGuidance) || undefined,
      activation:
        v.activation && typeof v.activation === "object"
          ? (v.activation as Record<string, unknown>)
          : undefined,
    };
  }
  return undefined;
}

function normalizeVoice(value: unknown): BrandSnapshotPlusReport["voice"] {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    return {
      summary: asString(v.summary) || undefined,
      description: asString(v.description) || undefined,
      pillars: Array.isArray(v.pillars)
        ? v.pillars.map((p) => asString(p)).filter(Boolean)
        : undefined,
    };
  }
  return undefined;
}

export function ReportDocument(props: LegacyReportProps) {
  const report = props.report && typeof props.report === "object" ? props.report : {};
  const full = report.full_report && typeof report.full_report === "object"
    ? (report.full_report as Record<string, unknown>)
    : {};

  const pillarScores = normalizePillarScores(
    props.pillarScores ?? full.pillar_scores ?? full.pillarScores ?? report.pillar_scores ?? report.pillarScores
  );
  const pillarInsights = normalizePillarTextMap(
    props.pillarInsights ?? full.pillar_insights ?? full.pillarInsights ?? report.pillar_insights ?? report.pillarInsights
  );
  const recommendations = normalizeRecommendations(
    props.recommendations ?? full.recommendations ?? report.recommendations
  );
  const colorPalette = normalizeColorPalette(
    props.suggestedPalette ?? full.enriched_color_palette ?? full.color_palette ?? report.enriched_color_palette ?? report.color_palette
  );

  const shared = {
    userName:
      props.userName ||
      asString(full.user_name) ||
      asString(report.user_name) ||
      "User",
    businessName:
      props.businessName ||
      asString(full.company) ||
      asString(full.business_name) ||
      asString(report.company) ||
      asString(report.business_name) ||
      "Your Company",
    brandAlignmentScore:
      typeof props.brandAlignmentScore === "number"
        ? props.brandAlignmentScore
        : Number(full.brand_alignment_score ?? report.brand_alignment_score ?? 0),
    pillarScores,
    pillarInsights,
    recommendations,
  };

  if (props.isPlus) {
    const plusReport: BrandSnapshotPlusReport = {
      ...shared,
      industry: asString(full.industry) || asString(report.industry),
      website: asString(full.website) || asString(report.website) || null,
      socials: Array.isArray(full.socials)
        ? (full.socials as string[])
        : Array.isArray(report.socials)
          ? (report.socials as string[])
          : [],
      persona: normalizePersona(
        props.persona ?? full.enriched_persona ?? full.persona ?? report.enriched_persona ?? report.persona
      ),
      archetype: normalizeArchetype(
        props.archetype ??
          full.enriched_archetype ??
          full.archetype ??
          report.enriched_archetype ??
          report.archetype ??
          report.brand_archetype
      ),
      voice: normalizeVoice(
        props.voice ?? props.brandVoice ?? full.enriched_voice ?? full.voice ?? report.enriched_voice ?? report.voice
      ),
      colorPalette,
      opportunities_map:
        asString(props.opportunitiesMap) || asString(full.opportunities_map) || asString(report.opportunities_map),
      roadmap_30: asString(props.roadmap30) || asString(full.roadmap_30) || asString(report.roadmap_30),
      roadmap_60: asString(props.roadmap60) || asString(full.roadmap_60) || asString(report.roadmap_60),
      roadmap_90: asString(props.roadmap90) || asString(full.roadmap_90) || asString(report.roadmap_90),
      contextCoverage: Number(full.context_coverage ?? report.context_coverage ?? 0) || undefined,
    };
    return <BrandSnapshotPlusPDF report={plusReport} />;
  }

  const snapshotReport: BrandSnapshotReport = {
    ...shared,
    industry: asString(full.industry) || asString(report.industry),
    website: asString(full.website) || asString(report.website) || null,
    socials: Array.isArray(full.socials)
      ? (full.socials as string[])
      : Array.isArray(report.socials)
        ? (report.socials as string[])
        : [],
    fullReportAnswers:
      full.answers && typeof full.answers === "object" ? (full.answers as Record<string, unknown>) : undefined,
  };
  return <BrandSnapshotPDF report={snapshotReport} />;
}

export default ReportDocument;
