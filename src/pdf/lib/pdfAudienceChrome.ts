/**
 * Audience-aware chrome labels for Blueprint PDFs (B2C vs B2B).
 */
import { resolveActivationAudienceVoice } from "@/lib/activation/activationAudienceVoice";
import type { BlueprintEngineOutput } from "@/src/pdf/types/blueprintReport";

export function blueprintReportIsConsumerFacing(data: BlueprintEngineOutput): boolean {
  const audience =
    data.audienceClarity?.audienceSignals?.primaryAudience ||
    data.audienceClarity?.audienceSignals?.audienceLanguage ||
    "";
  const industryHint =
    data.visibilityDiscovery?.discoveryDiagnosis?.whereTheyShouldFind ||
    data.audienceClarity?.audienceSignals?.audienceCharacteristics ||
    "";
  const voice = resolveActivationAudienceVoice({
    industry: audience || industryHint,
    corpus: [audience, industryHint].filter(Boolean).join("\n"),
    audienceType: /\b(b2b|businesses?|companies)\b/i.test(audience) ? "B2B" : /\b(b2c|consumers?|guests?|patients?|clients?|shoppers?)\b/i.test(audience) ? "B2C" : null,
  });
  return voice.consumer;
}

export function pdfAudienceChrome(data: BlueprintEngineOutput) {
  const consumer = blueprintReportIsConsumerFacing(data);
  if (consumer) {
    return {
      consumer: true as const,
      primarySegmentLabel: "Primary audience",
      secondarySegmentLabel: "Secondary audience",
      segmentVsPersonaTitle: "Audiences & customer personas",
      segmentVsPersonaBlurb:
        "An audience segment is who you prioritize (for example local families or regular guests). A persona is a person inside that segment — how they discover you, decide, and buy. Keep persona tags matched to the audience labels below.",
      conversionBackboneLabel: "How customers decide",
      conversionSnapshotTitle: "Customer Conversion Snapshot",
      conversionIntelligenceTitle: "Customer Conversion Framework",
      conversionIntelligenceProduct: "Customer Conversion Framework",
      icpPlaybooksTitle: "Audience playbooks",
      activationFallbackActions: [
        "Align core messaging across homepage, service pages, and booking or contact paths.",
        "Front-load trust signals and proof on the pages where people decide.",
        "Keep a simple content cadence on the channels your customers already use.",
        "Map clear next steps (book, reserve, call, shop) and remove friction.",
        "Keep voice and visuals consistent across outbound posts and ads.",
        "Review weekly: inquiries, bookings, and review momentum.",
      ],
    };
  }
  return {
    consumer: false as const,
    primarySegmentLabel: "Primary ICP — best-fit segment",
    secondarySegmentLabel: "Secondary ICP — adjacent or expansion segment",
    segmentVsPersonaTitle: "Audience Personas & ICPs",
    segmentVsPersonaBlurb:
      "An ideal customer profile (ICP) describes a strategic segment — who you prioritize. Personas describe the people inside each segment — how they discover, evaluate, and buy. Every persona’s ICP alignment tag must match exactly one ICP label in this section.",
    conversionBackboneLabel: "ICP Conversion Intelligence Backbone",
    conversionSnapshotTitle: "ICP Conversion Snapshot",
    conversionIntelligenceTitle: "ICP Conversion Intelligence Framework",
    conversionIntelligenceProduct: "ICP Conversion Intelligence",
    icpPlaybooksTitle: "ICP playbooks",
    activationFallbackActions: [
      "Align core messaging hierarchy across homepage, service pages, and sales assets.",
      "Front-load trust signals and proof sequence on conversion-critical pages.",
      "Launch a recurring authority content cadence tied to brand pillars.",
      "Map offer-specific CTA paths and reduce friction in high-intent journeys.",
      "Operationalize voice and visual consistency checks for all outbound assets.",
      "Activate monthly KPI review and decision rituals to prevent brand drift.",
    ],
  };
}
