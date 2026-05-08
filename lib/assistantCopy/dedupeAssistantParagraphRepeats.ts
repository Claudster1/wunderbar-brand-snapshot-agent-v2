/** Match `stripChatMarkdownBold` / `normalizedCapturePromptSlice` in brand-snapshot route. */
function stripChatMarkdownBold(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function normalizedParagraphKey(s: string): string {
  return stripChatMarkdownBold(s).replace(/\s+/g, " ").trim();
}

/**
 * Collapse duplicate long paragraphs (models often paste the same approved capture block twice).
 * Preserves a trailing JSON block starting at the first `{` so scoring payloads stay intact.
 */
export function dedupeAssistantRepeatedParagraphChunks(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return content;

  const firstBrace = trimmed.indexOf("{");
  const prefix = firstBrace >= 0 ? trimmed.slice(0, firstBrace) : trimmed;
  const suffix = firstBrace >= 0 ? trimmed.slice(firstBrace) : "";

  const chunks = prefix.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const chunk of chunks) {
    const norm = normalizedParagraphKey(chunk);
    if (norm.length < 48) {
      kept.push(chunk);
      continue;
    }
    if (seen.has(norm)) continue;
    seen.add(norm);
    kept.push(chunk);
  }

  const nextPrefix = kept.join("\n\n").trim();
  const spacer = nextPrefix && suffix ? "\n\n" : "";
  return `${nextPrefix}${suffix ? `${spacer}${suffix}` : ""}`.replace(/\n{3,}/g, "\n\n").trim();
}
