/**
 * Split / strip model intake payloads so JSON never renders in the chat bubble.
 */

const FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/gi;

/** High-signal intake keys (quoted). */
const INTAKE_KEY =
  "(?:userName|businessName|businessType|industry|website|brandAlignmentScore|primaryGoals|biggestChallenge|socials|offerClarity|hasBrandGuidelines|missionStatement|credibilityDetails|thoughtLeadershipActivity)";

const INTAKE_KEY_RE = new RegExp(`"${INTAKE_KEY}"\\s*:`);

/** Any JSON object key — used to detect dense orphan dumps mid-stream. */
const ANY_JSON_KEY_RE = /"([A-Za-z_][A-Za-z0-9_]*)"\s*:/g;

/**
 * Orphan dump: model (or a mid-stream strip) left `"businessName": ...` without a wrapping `{`.
 */
const ORPHAN_INTAKE_DUMP_RE = new RegExp(
  `(?:Here(?:'s| is) the information (?:you've provided|I gathered|we gathered|gathered):?\\s*)?"${INTAKE_KEY}"\\s*:`,
  "i",
);

/** Model mirror intros that must never appear in the chat bubble. */
const MIRROR_INTRO_RE =
  /Here(?:'s| is) the information (?:you've provided|I gathered|we gathered|gathered):?/i;

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
    obj.website === null ||
    typeof obj.offerClarity === "string" ||
    typeof obj.businessType === "string" ||
    typeof obj.hasBrandGuidelines === "boolean"
  );
}

/** True when text is (or contains) a dense answers JSON dump — for progress / finalize cues. */
export function textLooksLikeIntakeJsonDump(text: string): boolean {
  const t = String(text || "");
  if (!t.trim()) return false;
  if (/\{[\s\S]*"(?:userName|businessName|brandAlignmentScore|offerClarity|businessType)"/.test(t)) {
    return true;
  }
  const keys = t.match(ANY_JSON_KEY_RE);
  return Boolean(keys && keys.length >= 4);
}

/**
 * Index where an orphan / mid-payload JSON dump begins (no wrapping `{` required).
 * Returns -1 when none.
 */
export function findOrphanJsonDumpStart(text: string): number {
  const t = String(text || "");
  if (!t) return -1;

  const mirror = t.search(MIRROR_INTRO_RE);
  if (mirror >= 0) return mirror;

  const known = t.search(ORPHAN_INTAKE_DUMP_RE);
  if (known >= 0) return known;

  ANY_JSON_KEY_RE.lastIndex = 0;
  const matches: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = ANY_JSON_KEY_RE.exec(t)) !== null) {
    matches.push(m.index);
    if (matches.length >= 4) {
      // Dense key dump — cut from the first key (or from the `{` just before it).
      const first = matches[0]!;
      const braceBefore = t.lastIndexOf("{", first);
      if (braceBefore >= 0 && first - braceBefore < 40) return braceBefore;
      return first;
    }
  }

  // Two known intake keys close together.
  const firstKnown = t.search(INTAKE_KEY_RE);
  if (firstKnown >= 0) {
    const rest = t.slice(firstKnown + 1);
    if (INTAKE_KEY_RE.test(rest) || ANY_JSON_KEY_RE.test(rest)) {
      const braceBefore = t.lastIndexOf("{", firstKnown);
      if (braceBefore >= 0 && firstKnown - braceBefore < 40) return braceBefore;
      return firstKnown;
    }
  }

  return -1;
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

  const start = trimmed.search(/\{[\s\S]*"(?:userName|businessName|brandAlignmentScore|offerClarity|businessType)"/);
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
    if (/"(?:userName|businessName|brandAlignmentScore|industry|offerClarity|businessType)"/.test(inner)) {
      return "";
    }
    if ((inner.match(ANY_JSON_KEY_RE) || []).length >= 4) return "";
    return full;
  });

  // Remove raw JSON object payloads.
  const extracted = extractIntakeJsonPayload(out);
  if (extracted.payload && extracted.matchIndex >= 0) {
    out =
      out.slice(0, extracted.matchIndex) + out.slice(extracted.matchIndex + extracted.matchLength);
  } else {
    // Incomplete / unclosed JSON: drop from first intake-looking `{` onward.
    const leak = out.search(
      /\{[\s\S]*"(?:userName|businessName|brandAlignmentScore|offerClarity|businessType)"/,
    );
    if (leak >= 0) out = out.slice(0, leak);
  }

  // Orphan fence openers left after a bad stream.
  out = out.replace(/```(?:json)?\s*$/gim, "");
  out = out.replace(/^\s*```(?:json)?\s*$/gim, "");

  const orphanIdx = findOrphanJsonDumpStart(out);
  if (orphanIdx >= 0) {
    out = out.slice(0, orphanIdx);
  }

  // Drop mirror intros even if JSON was already removed / never arrived.
  out = out
    .replace(/\n*Here(?:'s| is) the information (?:you've provided|I gathered|we gathered|gathered):?\s*$/i, "")
    .replace(/\n*Here(?:'s| is) the information (?:you've provided|I gathered|we gathered|gathered):?\s*\n+/gi, "\n\n");

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
  const objIdx = raw.search(
    /\{[\s\S]*"(?:userName|businessName|brandAlignmentScore|industry|offerClarity|businessType)"/,
  );
  if (objIdx >= 0) {
    return raw.slice(0, objIdx).replace(/\n{3,}/g, "\n\n").trim();
  }
  // Late stream: model opens `{` right after handoff with no keys yet — hide from last line-start `{`.
  const lateOpen = raw.search(/\n\{[\s\S]*$/);
  if (
    lateOpen >= 0 &&
    /(?:finaliz|redirect|results page|WunderBrand Snapshot™|confidential)/i.test(raw.slice(0, lateOpen))
  ) {
    return raw.slice(0, lateOpen).replace(/\n{3,}/g, "\n\n").trim();
  }
  // Orphan / mid-payload keys after `{` was already stripped from the display buffer.
  const orphanIdx = findOrphanJsonDumpStart(raw);
  if (orphanIdx >= 0) {
    return raw.slice(0, orphanIdx).replace(/\n{3,}/g, "\n\n").trim();
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
