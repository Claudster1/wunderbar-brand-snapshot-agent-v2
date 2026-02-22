import { UserRoleContext } from "@/src/types/snapshot";

export function rolePhrase(role?: UserRoleContext): string {
  switch (role) {
    case "operator":
      return "driving operations and growth execution";
    case "strategic_lead":
      return "setting strategic direction and shaping long-term brand equity";
    case "marketing_lead":
      return "owning brand clarity, messaging architecture, and market visibility";
    case "founder":
      return "building and scaling the business from the ground up";
    default:
      return "leading the brand and business forward";
  }
}

export function getSnapshotOpeningLine(
  userRoleContext?: UserRoleContext
): string {
  return `This diagnostic was calibrated to support you in ${rolePhrase(userRoleContext)}.`;
}
