import {
  evaluateSectionQuality,
  evaluateSectionsQuality,
  type QualityContext,
  type SectionsQualityReport,
} from "@/lib/personalizationQuality";

type OptimizeResult = {
  optimizedSections: Record<string, string>;
  quality: SectionsQualityReport;
  changedKeys: string[];
};

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function appendOnce(base: string, line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return base;
  if (base.toLowerCase().includes(trimmed.toLowerCase())) return base;
  return `${base}\n${trimmed}`.trim();
}

function optimizeSectionText(
  sectionKey: string,
  text: string,
  context: QualityContext
): string {
  let next = text
    .replace(/\bThis brand\b/g, context.businessName || "The brand")
    .replace(/\byour business\b/gi, context.businessName || "the business")
    .replace(/\brefreshed from workbook edits?\b/gi, "updated using your workbook strategy inputs")
    .trim();

  const businessName = asText(context.businessName);
  const audience = asText(context.audience);
  const differentiator = asText(context.differentiator);
  const primaryPillar = asText(context.primaryPillar);

  if (businessName && !next.toLowerCase().includes(businessName.toLowerCase())) {
    next = `${businessName}: ${next}`.trim();
  }

  if (audience && !/\baudience|buyer|customer|prospect|persona\b/i.test(next)) {
    next = appendOnce(next, `Primary audience focus: ${audience}.`);
  }

  if (
    differentiator &&
    !/\bdifferentiat|position|advantage|white ?space\b/i.test(next)
  ) {
    next = appendOnce(next, `Differentiation to reinforce: ${differentiator}.`);
  }

  const needsConversionSignal =
    /conversion|cta|email_framework|social_strategy|content_type_channel_plan|implementation_action_plan|executive_summary|journey_map|seo_aeo/.test(
      sectionKey
    );
  if (needsConversionSignal && !/\bcta|next step|book|schedule|contact|request|start\b/i.test(next)) {
    next = appendOnce(
      next,
      "Conversion next step: pair one proof-backed primary CTA with a lower-friction secondary action."
    );
  }

  if (!/\bproof|case study|testimonial|results?|evidence|data|outcome\b/i.test(next)) {
    next = appendOnce(
      next,
      "Proof requirement: support each core claim with one concrete result, case example, or testimonial."
    );
  }

  if (primaryPillar && !next.toLowerCase().includes(primaryPillar.toLowerCase())) {
    next = appendOnce(next, `Execution priority should stay anchored to ${primaryPillar}.`);
  }

  return next;
}

export function optimizeSectionsForDelivery(
  sections: Record<string, unknown>,
  context: QualityContext
): OptimizeResult {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(sections || {})) {
    normalized[key] = asText(value);
  }

  const changedKeys: string[] = [];
  // Max two passes to avoid over-writing user voice.
  for (let pass = 0; pass < 2; pass += 1) {
    let changedThisPass = false;

    for (const [key, value] of Object.entries(normalized)) {
      const report = evaluateSectionQuality(key, value, context);
      if (report.passed) continue;
      const optimized = optimizeSectionText(key, value, context);
      if (optimized !== value) {
        normalized[key] = optimized;
        changedThisPass = true;
        if (!changedKeys.includes(key)) changedKeys.push(key);
      }
    }

    if (!changedThisPass) break;
  }

  const quality = evaluateSectionsQuality(normalized, context);
  return {
    optimizedSections: normalized,
    quality,
    changedKeys,
  };
}
