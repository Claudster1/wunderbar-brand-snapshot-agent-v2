/**
 * Split / strip model intake payloads so JSON never renders in the chat bubble.
 */

const FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/gi;

function tryParseObject(raw: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Soften trailing commas so near-valid model JSON still parses. */
function tryParseLenient(raw: string): Record<string, unknown> | null {
  const direct = tryParseObject(raw);
  if (direct) return direct;
  const noTrailingCommas = raw.replace(/,\s*([}\]])/g, "$1");
  return tryParseObject(noTrailingCommas);
}

function looksLikeIntakePayload(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.userName === "string" ||
    typeof obj.businessName === "string" ||
    typeof obj.brandAlignmentScore === "number" ||
    (obj.scores != null && typeof obj.scores === "object") ||
    typeof obj.industry === "string" ||
    typeof obj.website === "string" ||
    obj.website === null
  );
}

/**
 * Extract the first intake / scoring JSON object from assistant text (fenced or raw).
 */
export function extractIntakeJsonPayload(text: string): {
  payload: Record<string, unknown> | null;
  matchIndex: number;
  matchLength: number;
} {
  const trimmed = text.trim();
  if (!trimmed) return { payload: null, matchIndex: -1, matchLength: 0 };

  FENCE_RE.lastIndex = 0;
  let fence: RegExpExecArray | null;
  while ((fence = FENCE_RE.exec(trimmed)) !== null) {
    const inner = (fence[1] || "").trim();
    const parsed = tryParseLenient(inner);
    if (parsed && looksLikeIntakePayload(parsed)) {
      return { payload: parsed, matchIndex: fence.index, matchLength: fence[0].length };
    }
  }

  const start = trimmed.search(/\{[\s\S]*"(?:userName|businessName|brandAlignmentScore)"/);
  if (start < 0) {
    const anyStart = trimmed.indexOf("{");
    if (anyStart < 0) return { payload: null, matchIndex: -1, matchLength: 0 };
    const end = trimmed.lastIndexOf("}");
    if (end <= anyStart) return { payload: null, matchIndex: -1, matchLength: 0 };
    const slice = trimmed.slice(anyStart, end + 1);
    const parsed = tryParseLenient(slice);
    if (parsed && looksLikeIntakePayload(parsed)) {
      return { payload: parsed, matchIndex: anyStart, matchLength: end - anyStart + 1 };
    }
    return { payload: null, matchIndex: -1, matchLength: 0 };
  }

  const end = trimmed.lastIndexOf("}");
  if (end <= start) return { payload: null, matchIndex: -1, matchLength: 0 };
  const slice = trimmed.slice(start, end + 1);
  const parsed = tryParseLenient(slice);
  if (parsed && looksLikeIntakePayload(parsed)) {
    return { payload: parsed, matchIndex: start, matchLength: end - start + 1 };
  }

  return { payload: null, matchIndex: -1, matchLength: 0 };
}

/**
 * Remove fenced / raw intake JSON (and orphan fence markers) from assistant copy for display.
 */
export function stripIntakeJsonFromAssistantText(text: string): string {
  let out = String(text || "");

  // Remove complete fenced blocks that look like JSON payloads.
  out = out.replace(FENCE_RE, (full, inner: string) => {
    const parsed = tryParseLenient(String(inner || "").trim());
    if (parsed && looksLikeIntakePayload(parsed)) return "";
    // Incomplete fence body that still looks like answers JSON — hide it.
    if (/"(?:userName|businessName|brandAlignmentScore|industry)"/.test(inner)) return "";
    return full;
  });

  // Remove raw JSON object payloads.
  const extracted = extractIntakeJsonPayload(out);
  if (extracted.payload && extracted.matchIndex >= 0) {
    out =
      out.slice(0, extracted.matchIndex) + out.slice(extracted.matchIndex + extracted.matchLength);
  } else {
    // Incomplete / unclosed JSON: drop from first intake-looking `{` onward.
    const leak = out.search(/\{[\s\S]*"(?:userName|businessName|brandAlignmentScore)"/);
    if (leak >= 0) out = out.slice(0, leak);
  }

  // Orphan fence openers left after a bad stream.
  out = out.replace(/```(?:json)?\s*$/gim, "");
  out = out.replace(/^\s*```(?:json)?\s*$/gim, "");

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Aggressive strip for live streaming — hide JSON as soon as a fence or object starts,
 * so users never see scoring payloads flash before the stream finishes.
 */
export function stripStreamingAssistantDisplay(text: string): string {
  const raw = String(text || "");
  // Cut at opening JSON fence immediately (even before keys arrive).
  const fenceIdx = raw.search(/```(?:json)?\s*[\r\n]*\s*\{/);
  if (fenceIdx >= 0) {
    return raw.slice(0, fenceIdx).replace(/\n{3,}/g, "\n\n").trim();
  }
  // Cut at a bare `{` that already looks like intake / scoring JSON.
  const objIdx = raw.search(/\{[\s\S]*"(?:userName|businessName|brandAlignmentScore|industry)"/);
  if (objIdx >= 0) {
    return raw.slice(0, objIdx).replace(/\n{3,}/g, "\n\n").trim();
  }
  // Late stream: model opens `{` right after handoff with no keys yet — hide from last line-start `{`.
  const lateOpen = raw.search(/\n\{[\s\S]*$/);
  if (lateOpen >= 0 && /(?:finaliz|redirect|results page|WunderBrand Snapshot™)/i.test(raw.slice(0, lateOpen))) {
    return raw.slice(0, lateOpen).replace(/\n{3,}/g, "\n\n").trim();
  }
  return stripIntakeJsonFromAssistantText(raw);
}

/** Display prose + optional parsed payload for scoring. */
export function splitAssistantIntakePayload(text: string): {
  displayText: string;
  payload: Record<string, unknown> | null;
} {
  const extracted = extractIntakeJsonPayload(text);
  const displayText = stripIntakeJsonFromAssistantText(text);
  return { displayText, payload: extracted.payload };
}
