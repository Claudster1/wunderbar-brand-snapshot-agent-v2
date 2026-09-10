/**
 * Resolve locked audience / vertical context for AI report generation.
 * Injected into assessment JSON so engines don't guess from prose alone.
 */

import {
  resolveActivationAudienceVoice,
  type ActivationAudienceVoice,
} from "@/lib/activation/activationAudienceVoice";
import {
  inferConsumerVertical,
  type ConsumerVerticalId,
} from "@/lib/intake/consumerVertical";
import { normalizeBusinessTypeOrGeneral } from "@/lib/intake/normalizeBusinessType";
import { resolveToneProfile, type ToneProfileId } from "@/lib/intake/toneProfile";

export type LockedReportAudienceContext = {
  consumerFacing: boolean;
  consumerVertical: ConsumerVerticalId | null;
  toneProfile: ToneProfileId;
  audienceVoice: {
    who: string;
    primaryCta: string;
    secondaryCta: string;
    channelsLine: string;
    proofLine: string;
    paidPlatforms: ActivationAudienceVoice["paidPlatforms"];
  };
  languageDirective: string;
};

export function buildLockedReportAudienceContext(
  input: Record<string, unknown>,
): LockedReportAudienceContext {
  const industry = typeof input.industry === "string" ? input.industry : null;
  const businessTypeRaw =
    (typeof input.businessType === "string" && input.businessType) ||
    (typeof input.business_type === "string" && input.business_type) ||
    null;
  const audienceType =
    (typeof input.audienceType === "string" && input.audienceType) ||
    (typeof input.audience_type === "string" && input.audience_type) ||
    null;
  const marketingFocus =
    (typeof input.marketingAudienceFocus === "string" && input.marketingAudienceFocus) ||
    (typeof input.marketing_audience_focus === "string" && input.marketing_audience_focus) ||
    null;

  const normalized = normalizeBusinessTypeOrGeneral(businessTypeRaw);
  const businessType = normalized === "general" ? null : normalized;
  const corpus = [
    industry,
    businessTypeRaw,
    audienceType,
    marketingFocus,
    typeof input.idealCustomers === "string" ? input.idealCustomers : null,
    typeof input.currentCustomers === "string" ? input.currentCustomers : null,
    typeof input.whatMakesYouDifferent === "string" ? input.whatMakesYouDifferent : null,
  ]
    .filter(Boolean)
    .join("\n");

  const vertical = inferConsumerVertical({
    industry,
    businessType: businessTypeRaw,
    audienceType,
    corpus,
  });
  const voice = resolveActivationAudienceVoice({
    industry,
    businessType: businessTypeRaw,
    audienceType,
    corpus,
  });
  const toneProfile = resolveToneProfile({
    businessType,
    audienceType: audienceType as "B2B" | "B2C" | "both" | null,
    marketingAudienceFocus: marketingFocus as "B2B" | "B2C" | null,
    industryHint: industry,
    userCorpus: corpus,
  });

  const languageDirective = voice.consumer
    ? [
        `LOCKED consumer vertical: ${vertical ?? "consumer_general"} — do not use B2B vocabulary.`,
        `Speak to ${voice.who}. Primary next step: "${voice.primaryCta}".`,
        `Prefer channels: ${voice.channelsLine}. Proof: ${voice.proofLine}.`,
        "Banned unless clearly B2B: prospects, pipeline, ICP, decision-makers, scope fit, SQL, ABM, LinkedIn-first, demo/intro-call CTAs.",
      ].join(" ")
    : [
        `LOCKED audience mode: B2B / professional.`,
        `Buyer language OK when evidence supports it. Primary CTA style: "${voice.primaryCta}".`,
      ].join(" ");

  return {
    consumerFacing: voice.consumer,
    consumerVertical: vertical,
    toneProfile,
    audienceVoice: {
      who: voice.who,
      primaryCta: voice.primaryCta,
      secondaryCta: voice.secondaryCta,
      channelsLine: voice.channelsLine,
      proofLine: voice.proofLine,
      paidPlatforms: voice.paidPlatforms,
    },
    languageDirective,
  };
}
