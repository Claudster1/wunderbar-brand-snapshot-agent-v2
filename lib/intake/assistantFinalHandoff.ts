/**
 * Detects when the model emitted final handoff copy without a JSON payload.
 * Must stay aligned with `wundySystemPrompt` closing lines and `sanitizeTierAssistantReply`.
 */

/** True when the reply embeds a scored answers payload (not a stray `{` in prose). */
export function textContainsScoringJsonPayload(text: string): boolean {
  return (
    /\{[\s\S]*"userName"[\s\S]*"businessName"[\s\S]*\}/.test(text) ||
    /\{[\s\S]*"brandAlignmentScore"[\s\S]*\}/.test(text)
  );
}

/** Used before calling /api/snapshot with extracted answers — keep false positives rare. */
export function isAssistantFinalHandoffWithoutJsonBlock(text: string): boolean {
  const n = text.toLowerCase();
  if (textContainsScoringJsonPayload(text)) return false;
  return (
    n.includes("being generated now") ||
    n.includes("results will appear below") ||
    n.includes("being finalized now") ||
    (n.includes("being finalized") && n.includes("diagnostic")) ||
    n.includes("open full diagnostic") ||
    n.includes("open the full diagnostic") ||
    n.includes("see my results") ||
    (n.includes("won't see scores") && n.includes("chat")) ||
    // Common model variants when JSON is accidentally omitted (must stay aligned with wundySystemPrompt).
    (n.includes("finalize your diagnostic") &&
      (n.includes("now") || n.includes("shortly") || n.includes("so you can") || n.includes("available"))) ||
    n.includes("i'll finalize your diagnostic") ||
    (n.includes("completed all") && n.includes("necessary questions") && n.includes("diagnostic")) ||
    (n.includes("diagnostic will be available") && (n.includes("shortly") || n.includes("soon")))
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
    (t.includes("full results") && (t.includes("open") || t.includes("button"))) ||
    t.includes("see my results")
  );
}

/** True when the latest assistant turn reads like wrap-up but the client may not yet have a results URL. */
export function conversationSuggestsIntakeComplete(
  messages: Array<{ role: string; text?: string; content?: string }>,
): boolean {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const t = lastAssistant
    ? String(lastAssistant.text ?? (lastAssistant as { content?: string }).content ?? "").trim()
    : "";
  const userCount = messages.filter((m) => m.role === "user").length;
  return userCount >= 3 && assistantPromisedExternalResultsEntry(t);
}
