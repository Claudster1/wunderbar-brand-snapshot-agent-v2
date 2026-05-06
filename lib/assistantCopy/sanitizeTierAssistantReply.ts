import { getChatTierConfig, type ChatTier } from "@/lib/chatTierConfig";

const UPLOAD_HINT_PATTERN =
  /\b(paperclip|paper\s*clip|paper-clip|attach(?:ed|ing|ments?)?|upload(?:ed|ing)?|file\s+upload|choose\s+a\s+file|drag[\s-]*and[\s-]*drop)\b/i;

/**
 * Post-process assistant reply text from /api/brand-snapshot:
 * - Snapshot / Snapshot+ have no in-chat uploads — remove any paperclip/upload guidance.
 * - Prefer product names and "diagnostic" language for Snapshot tiers (never bare "report").
 * - Preserves trailing JSON (first `{` onward) untouched so scoring/handoff still works.
 */
export function sanitizeTierAssistantReply(
  content: string,
  options: { hasInChatUploads: boolean; intakeTier: ChatTier },
): string {
  const { hasInChatUploads, intakeTier } = options;
  const firstBrace = content.indexOf("{");
  let prefix = firstBrace >= 0 ? content.slice(0, firstBrace) : content;
  const suffix = firstBrace >= 0 ? content.slice(firstBrace) : "";

  if (!hasInChatUploads) {
    prefix = stripDisallowedUploadGuidance(prefix, intakeTier);
  }

  if (intakeTier === "snapshot" || intakeTier === "snapshot-plus") {
    prefix = applySnapshotDiagnosticWording(prefix, intakeTier);
  }

  const spacer = prefix.trim() && suffix ? "\n\n" : "";
  const out = `${prefix.trim()}${suffix ? `${spacer}${suffix}` : ""}`;
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function stripDisallowedUploadGuidance(prefix: string, tier: ChatTier): string {
  let p = prefix;

  // Pass 1: remove whole lines that mention uploads / paperclip
  p = p
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !UPLOAD_HINT_PATTERN.test(line))
    .join("\n\n");

  // Pass 2: remove sentences (handles single long paragraph)
  if (UPLOAD_HINT_PATTERN.test(p)) {
    p = p
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !UPLOAD_HINT_PATTERN.test(s))
      .join(" ");
  }

  if (UPLOAD_HINT_PATTERN.test(p)) {
    const product = getChatTierConfig(tier).productName;
    p = `Thanks — what you've typed here is enough for ${product}. This chat doesn't include file attachments; we'll work from your answers.`;
  }

  return p.trim();
}

function applySnapshotDiagnosticWording(prefix: string, tier: ChatTier): string {
  const product = getChatTierConfig(tier).productName;
  return prefix
    .replace(/\bBefore I generate your report\b/gi, `Before I finalize your ${product}`)
    .replace(/\bmake your report\b/gi, `shape your ${product}`)
    .replace(/\byour report\b/gi, "your diagnostic")
    .replace(/\bthe report\b/gi, "the diagnostic")
    .replace(/\bgenerate your report\b/gi, `deliver your ${product}`)
    .replace(/results will appear below[^.!?]*/gi, "use **Open full diagnostic** below the chat to view your results")
    .replace(/\breport\b/gi, "diagnostic");
}
