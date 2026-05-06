/**
 * Detects when the model emitted final handoff copy without a JSON payload.
 * Must stay aligned with `wundySystemPrompt` closing lines and `sanitizeTierAssistantReply`.
 */

/** Used before calling /api/snapshot with extracted answers — keep false positives rare. */
export function isAssistantFinalHandoffWithoutJsonBlock(text: string): boolean {
  const n = text.toLowerCase();
  if (n.includes("{")) return false;
  return (
    n.includes("being generated now") ||
    n.includes("results will appear below") ||
    n.includes("being finalized now") ||
    (n.includes("being finalized") && n.includes("diagnostic")) ||
    n.includes("open full diagnostic") ||
    n.includes("open the full diagnostic") ||
    (n.includes("won't see scores") && n.includes("chat"))
  );
}

/** Broader cues for “promised a button / results outside chat” — recovery UI when URL never registered. */
export function assistantPromisedExternalResultsEntry(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("being generated") ||
    t.includes("being finalized") ||
    t.includes("finalized now") ||
    t.includes("results will appear below") ||
    t.includes("appear below") ||
    t.includes("open full diagnostic") ||
    t.includes("open the full diagnostic") ||
    (t.includes("won't see scores") && t.includes("chat")) ||
    (t.includes("full results") && (t.includes("open") || t.includes("button")))
  );
}
