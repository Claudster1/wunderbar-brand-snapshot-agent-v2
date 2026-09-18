/**
 * Post-generate sanitizer: reduce B2B jargon drift in consumer-facing report JSON.
 */

import type { LockedReportAudienceContext } from "@/lib/results/reportAudienceContext";

const B2B_DRIFT_RE =
  /\b(prospects?|decision[- ]makers?|sales cycle|pipeline|ICP|SQLs?|ABM|scope fit|LinkedIn-first|RFP theater|procurement team)\b/i;

export function textHasB2bAudienceDrift(text: string): boolean {
  return B2B_DRIFT_RE.test(String(text || ""));
}

function replacementsFor(who: string, primaryCta: string): Array<[RegExp, string]> {
  const ctaLower = primaryCta.charAt(0).toLowerCase() + primaryCta.slice(1);
  return [
    [/\bdecision[- ]makers?\b/gi, who],
    [/\bprospects?\b/gi, who],
    [/\bsales cycles?\b/gi, "path to purchase"],
    [/\bpipeline-sourced conversations\b/gi, "inquiries and bookings"],
    [/\bpipeline influence\b/gi, "booking and inquiry influence"],
    [/\bpipeline quality\b/gi, "inquiry quality"],
    [/\bpipeline\b/gi, "bookings and inquiries"],
    [/\bICP filters\b/gi, "audience filters"],
    [/\bICP tiers?\b/gi, "audience segments"],
    [/\bPrimary ICP\b/g, "Primary audience"],
    [/\bSecondary ICP\b/g, "Secondary audience"],
    [/\bICPs?\b/g, "audience"],
    [/\bSQLs?\b/g, "qualified inquiries"],
    [/\bABM\b/g, "targeted campaigns"],
    [/\bBook a 20-minute scope fit\b/gi, primaryCta],
    [/\bscope fit\b/gi, ctaLower],
    [/\bLinkedIn-first\b/gi, "Instagram and Google first"],
    [/\bRFP theater\b/gi, "lengthy comparisons"],
    [/\bprocurement team\b/gi, "whoever decides"],
    [/\bgrowth lead\b/gi, "owner"],
    [/\bsales deck slide one\b/gi, "homepage headline"],
  ];
}

export function sanitizeConsumerFacingText(
  text: string,
  ctx: Pick<LockedReportAudienceContext, "audienceVoice">,
): string {
  let out = String(text || "");
  if (!out || !textHasB2bAudienceDrift(out)) return out;
  const who = ctx.audienceVoice.who || "customers";
  const cta = ctx.audienceVoice.primaryCta || "Get in touch";
  for (const [re, replacement] of replacementsFor(who, cta)) {
    out = out.replace(re, replacement);
  }
  return out;
}

/**
 * Deep-walk JSON and sanitize string leaves when the report is consumer-facing.
 * Skips huge binary-ish / base64-looking strings.
 */
export function sanitizeConsumerReportContent(
  content: Record<string, unknown>,
  ctx: LockedReportAudienceContext,
): Record<string, unknown> {
  if (!ctx.consumerFacing) return content;

  const walk = (value: unknown, depth: number): unknown => {
    if (depth > 14) return value;
    if (typeof value === "string") {
      if (value.length > 20000 || /^data:/.test(value)) return value;
      return sanitizeConsumerFacingText(value, ctx);
    }
    if (Array.isArray(value)) {
      return value.map((item) => walk(item, depth + 1));
    }
    if (value && typeof value === "object") {
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        next[k] = walk(v, depth + 1);
      }
      return next;
    }
    return value;
  };

  return walk(content, 0) as Record<string, unknown>;
}
