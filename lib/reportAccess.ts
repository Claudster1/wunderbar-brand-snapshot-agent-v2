// lib/reportAccess.ts
// Report access control utilities

export interface ReportAccessCheck {
  hasAccess: boolean;
  reason: "owner" | "denied";
}

/**
 * Check if a user has access to a report
 * Access is granted if:
 * - user.email === report.owner_email (or report.email/user_email)
 * 
 * TODO: Team member access removed - add back in future phase if needed
 */
export async function checkReportAccess(
  userEmail: string,
  reportOwnerEmail: string
): Promise<ReportAccessCheck> {
  // Check if user is the owner
  if (userEmail === reportOwnerEmail) {
    return {
      hasAccess: true,
      reason: "owner",
    };
  }

  return {
    hasAccess: false,
    reason: "denied",
  };
}
