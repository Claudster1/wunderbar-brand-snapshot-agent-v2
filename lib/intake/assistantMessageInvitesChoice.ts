/**
 * True when an assistant bubble is asking the user to answer (not a pure acknowledgment).
 * Used to avoid showing leftover chips under wrap-up / thank-you copy.
 */
export function assistantMessageInvitesChoice(text: string | null | undefined): boolean {
  const t = String(text || "").trim();
  if (!t) return false;
  // Pure wrap-up / confidentiality acknowledgments must never show leftover chips.
  if (
    /\b(brand insights stay yours|everything you'?ve shared is confidential|diagnostic will have plenty)\b/i.test(
      t,
    ) &&
    !/\?/.test(t) &&
    !/\btap (below|a few|one|all)\b/i.test(t)
  ) {
    return false;
  }
  if (/\?/.test(t)) return true;
  if (/\btap (below|a few|one|all|the)\b/i.test(t)) return true;
  if (/\b(choose|select|pick) (one|below|from|all)\b/i.test(t)) return true;
  if (/\bor type (your own|below)\b/i.test(t)) return true;
  return false;
}
