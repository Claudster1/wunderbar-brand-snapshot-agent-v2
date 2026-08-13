import { getSuggestedRepliesForCapture } from "@/lib/intake/captureSuggestedReplies";
import type { CaptureKey } from "@/lib/intake/flexibleDirectCaptureComplete";

export const CONTINUE_ANYWAY_CHIP = "Continue anyway";

const LABEL_TO_CAPTURE: Array<{ match: RegExp; key: CaptureKey }> = [
  { match: /business type/i, key: "business_type_classifier" },
  { match: /acquisition channel/i, key: "primary_acquisition_channel" },
  { match: /revenue range/i, key: "monthly_revenue_range" },
  { match: /transaction value|deal size/i, key: "average_transaction_value" },
  { match: /conversion|close rate/i, key: "conversion_rate_estimate" },
  { match: /content creation/i, key: "content_creation_capacity" },
  { match: /marketing budget/i, key: "monthly_marketing_budget" },
  { match: /email list/i, key: "has_email_list" },
  { match: /free download|lead magnet|sign-up offer/i, key: "has_lead_magnet" },
  { match: /next step|cta/i, key: "has_clear_cta" },
  { match: /channels you are active/i, key: "marketing_channel_mix" },
];

/** Chips for the first missing high-impact signal + Continue anyway. */
export function buildCompletenessNudgeChips(missingLabels: string[]): string[] {
  const first = missingLabels[0];
  if (!first) return [CONTINUE_ANYWAY_CHIP];

  const mapped = LABEL_TO_CAPTURE.find((row) => row.match.test(first));
  const topicChips = mapped ? getSuggestedRepliesForCapture(mapped.key) : [];
  const deduped = [...topicChips.filter((c) => c !== CONTINUE_ANYWAY_CHIP), CONTINUE_ANYWAY_CHIP];
  return deduped.slice(0, 9);
}

export function completenessNudgePrompt(missingLabels: string[], isActivationTier: boolean): string {
  const focus = missingLabels[0] ?? "one more detail";
  const warmth = isActivationTier
    ? "A quick signal helps us match campaigns to your real world — “not yet” is a fine answer. "
    : "";
  const more =
    missingLabels.length > 1
      ? ` (${missingLabels.length - 1} more optional after this)`
      : "";
  return `${warmth}Before we finalize — quick gap: **${focus}**${more}. Tap a chip below, type a short answer, or tap **Continue anyway**.`;
}
