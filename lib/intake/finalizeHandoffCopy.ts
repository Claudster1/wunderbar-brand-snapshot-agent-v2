import { getChatTierConfig, type ChatTier } from "@/lib/chatTierConfig";

const CONFIDENTIALITY_OPENER_RE =
  /^excellent\s*[—.]\s*everything you'?ve shared is confidential/i;

/** Closing copy when intake is complete — used in system prompt, sanitizer, and tests. */
export function getIntakeFinalizeHandoffMessage(tier: ChatTier): string {
  const { productName } = getChatTierConfig(tier);
  return [
    "Excellent — everything you've shared is confidential and your brand insights stay yours.",
    "",
    `**We're generating your ${productName} now.** You'll be taken to your results automatically in a moment.`,
  ].join("\n");
}

const FINALIZE_HANDOFF_MARKERS =
  /\b(being finalized|generating your|see my results|pillar breakdown|results will appear below|open your results page|won't see your full)\b/i;

const MIRROR_RECAP_MARKERS =
  /Here(?:'s| is) the information (?:you've provided|I gathered|we gathered|gathered):?/i;

/** Replace legacy handoff lines (pillars / See my results) with tier-aware seamless copy. */
export function normalizeFinalizeHandoffPrefix(prefix: string, tier: ChatTier): string {
  if (
    !FINALIZE_HANDOFF_MARKERS.test(prefix) &&
    !MIRROR_RECAP_MARKERS.test(prefix) &&
    !CONFIDENTIALITY_OPENER_RE.test(prefix.trim())
  ) {
    return prefix;
  }

  const target = getIntakeFinalizeHandoffMessage(tier);
  const paragraphs = prefix.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = paragraphs.filter(
    (p) =>
      !FINALIZE_HANDOFF_MARKERS.test(p) &&
      !MIRROR_RECAP_MARKERS.test(p) &&
      !CONFIDENTIALITY_OPENER_RE.test(p),
  );

  if (kept.length === 0) {
    return target;
  }

  return `${kept.join("\n\n")}\n\n${target}`;
}
