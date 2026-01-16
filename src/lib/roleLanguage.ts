// src/lib/roleLanguage.ts
// Utility functions for converting user role context into descriptive phrases

import { UserRoleContext } from "@/src/types/snapshot";

/**
 * Convert user role context into a descriptive phrase
 * Used for personalizing language based on the user's role
 */
export function rolePhrase(role?: UserRoleContext): string {
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

/**
 * Generate a personalized opening line for snapshot reports
 * Based on the user's role context
 */
export function getSnapshotOpeningLine(
  userRoleContext?: UserRoleContext
): string {
  return `Based on what you shared, this Snapshot was designed to support you in ${rolePhrase(userRoleContext)}.`;
}
