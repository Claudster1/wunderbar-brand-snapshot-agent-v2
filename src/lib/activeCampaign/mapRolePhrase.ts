// src/lib/activeCampaign/mapRolePhrase.ts
// Maps user role context to descriptive phrases for ActiveCampaign integration

import { UserRoleContext } from "@/src/types/snapshot";

export function mapRolePhrase(role?: UserRoleContext | string): string {
  switch (role) {
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
