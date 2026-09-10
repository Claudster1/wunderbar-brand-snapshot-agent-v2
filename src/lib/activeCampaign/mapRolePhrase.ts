// src/lib/activeCampaign/mapRolePhrase.ts
// Maps user role context to descriptive phrases for ActiveCampaign integration

import { UserRoleContext } from "@/src/types/snapshot";

/** Normalize enum or chip/free-text role answers to UserRoleContext. */
export function normalizeUserRoleContext(raw: unknown): UserRoleContext | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const t = raw.trim().toLowerCase().replace(/[–—]/g, "-");
  if (
    t === "operator" ||
    t === "strategic_lead" ||
    t === "marketing_lead" ||
    t === "founder" ||
    t === "other"
  ) {
    return t;
  }
  if (/\bin[- ]?house marketing\b|\boversee marketing\b|\bmarketing\s*\/\s*brand\b|\bmarketing lead\b|\bcmo\b/.test(t)) {
    return "marketing_lead";
  }
  if (/\bfounder\b|\bco-?founder\b/.test(t)) return "founder";
  if (/\bday[- ]?to[- ]?day\b|\bi run the business\b|\boperator\b/.test(t)) return "operator";
  if (/\blead strategy\b|\bstrategic lead\b|\bstrategy and growth\b/.test(t)) return "strategic_lead";
  return "other";
}

export function mapRolePhrase(role?: UserRoleContext | string): string {
  const normalized =
    typeof role === "string" &&
    !["operator", "strategic_lead", "marketing_lead", "founder", "other"].includes(role)
      ? normalizeUserRoleContext(role)
      : (role as UserRoleContext | undefined);
  switch (normalized) {
    case "operator":
      return "running and growing the business day-to-day";
    case "strategic_lead":
      return "setting direction and shaping long-term growth";
    case "marketing_lead":
      return "owning brand clarity, messaging, and visibility";
    case "founder":
      return "building the business you set out to create";
    default:
      return "leading the brand and business forward";
  }
}
