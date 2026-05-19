import { getChatTierConfig, type ChatTier } from "@/lib/chatTierConfig";

/** Closing copy when intake is complete — used in system prompt, sanitizer, and tests. */
export function getIntakeFinalizeHandoffMessage(tier: ChatTier): string {
  const { productName } = getChatTierConfig(tier);
  return `Excellent — everything you've shared is confidential and your brand insights stay yours. Your ${productName} is being finalized now. You'll be redirected to your results page automatically in a moment.`;
}

const FINALIZE_HANDOFF_MARKERS =
  /\b(being finalized|see my results|pillar breakdown|results will appear below|open your results page|won't see your full)\b/i;

/** Replace legacy handoff lines (pillars / See my results) with tier-aware seamless copy. */
export function normalizeFinalizeHandoffPrefix(prefix: string, tier: ChatTier): string {
  if (!FINALIZE_HANDOFF_MARKERS.test(prefix)) {
    return prefix;
  }

  const target = getIntakeFinalizeHandoffMessage(tier);
  const paragraphs = prefix.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const kept = paragraphs.filter((p) => !FINALIZE_HANDOFF_MARKERS.test(p));

  if (kept.length === 0) {
    return target;
  }

  return `${kept.join("\n\n")}\n\n${target}`;
}
