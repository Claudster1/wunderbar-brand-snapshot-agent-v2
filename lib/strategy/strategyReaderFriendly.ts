/**
 * Optional “parallel” phrasing for dense GTM / measurement rows.
 * Model-provided copy wins; heuristics only fill gaps so existing reports still improve in UI.
 */

function collapseWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function sentenceCase(s: string): string {
  const t = collapseWs(s);
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function freqPhrase(freq: string): string {
  const f = collapseWs(freq).toLowerCase();
  if (!f) return "";
  if (f.includes("week")) return "on a weekly rhythm";
  if (f.includes("month")) return "on a monthly rhythm";
  if (f.includes("quarter")) return "each quarter";
  if (f.includes("day")) return "on the cadence you chose above";
  return `on the rhythm you noted (${freq.trim()})`;
}

/** Clarify acronyms only when they appear—keeps tone informational, not remedial. */
function jargonGloss(tool: string, how: string, metric: string): string | null {
  const blob = `${tool} ${how} ${metric}`.toLowerCase();
  const out: string[] = [];

  if (/\butm(s)?\b/.test(blob)) {
    out.push(
      "UTM parameters are short labels on links so you can tell which campaign or email drove a visit or form fill.",
    );
  }
  if (/\bsql\b/.test(blob) && !/\bstructured query\b/i.test(how + metric)) {
    out.push(
      'In GTM contexts "SQL" usually means a sales-qualified lead—agreed criteria that a prospect is ready for direct sales follow-up.',
    );
  }
  if (/\bcrm\b/.test(blob) && /stage|pipeline|funnel|deal/.test(blob)) {
    out.push("CRM stages are the agreed steps a lead moves through so marketing and sales see the same picture.");
  }
  if (/\btaxonomy\b|campaign name|naming/.test(blob)) {
    out.push("A single naming scheme keeps channel reports comparable over time.");
  }

  if (out.length === 0) return null;
  return out.slice(0, 2).join(" ");
}

const MAX_READER_LEN = 320;

function softCap(s: string): string {
  if (s.length <= MAX_READER_LEN) return s;
  return `${s.slice(0, MAX_READER_LEN - 1).trim()}…`;
}

/**
 * One or two sentences suitable for founders, finance, or vendors—parallel to tool/how/frequency, not a replacement.
 */
export function readerFriendlyTrackingRow(input: {
  metric: string;
  tool: string;
  howToSetUp: string;
  frequency: string;
  /** When the model already supplied a plain line, use it as-is (trimmed). */
  readerFriendlyOneLiner?: string | null;
}): string | null {
  const explicit = typeof input.readerFriendlyOneLiner === "string" ? input.readerFriendlyOneLiner.trim() : "";
  if (explicit) return explicit;

  const how = collapseWs(input.howToSetUp);
  const tool = collapseWs(input.tool);
  const metric = collapseWs(input.metric);
  const freq = collapseWs(input.frequency);

  if (!how && !tool && !metric && !freq) return null;

  const parts: string[] = [];

  if (how) {
    parts.push(sentenceCase(how) + (how.endsWith(".") ? "" : "."));
  } else if (metric && tool) {
    parts.push(`Track “${metric}” using ${tool}.`.replace(/""/g, '"'));
  } else if (metric) {
    parts.push(`Focus on ${metric}.`);
  }

  const gloss = jargonGloss(tool, how, metric);
  if (gloss) parts.push(gloss);

  if (freq && parts.length > 0 && !parts.join(" ").toLowerCase().includes(freq.toLowerCase())) {
    parts.push(`Revisit ${freqPhrase(freq)}.`);
  }

  const joined = softCap(collapseWs(parts.join(" ")));
  if (joined.length < 12) return null;
  return joined;
}
