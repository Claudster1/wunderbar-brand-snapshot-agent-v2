// lib/reportAccess.ts
// Report access control utilities
//
// SECURITY: Reports use UUID-based access (unguessable tokens) as the primary
// access control. When the client also provides an email (via X-User-Email header
// or `email` query param), we verify it matches the report owner for defense-in-depth.

export interface ReportAccessCheck {
  hasAccess: boolean;
  reason: "owner" | "uuid_only" | "denied";
}

/**
 * Check if a user has access to a report.
 *
 * Access rules:
 * 1. If userEmail is provided AND matches reportOwnerEmail → "owner" (full access)
 * 2. If userEmail is provided but does NOT match → "denied"
 * 3. If userEmail is not provided → "uuid_only" (UUID grants access for backward compat)
 *
 * This means: if you send an email, it MUST match. If you don't send one, UUID alone works.
 */
export function checkReportAccess(
  userEmail: string | null | undefined,
  reportOwnerEmail: string | null | undefined
): ReportAccessCheck {
  // No email provided — UUID-only access (backward compatible)
  if (!userEmail) {
    return { hasAccess: true, reason: "uuid_only" };
  }

  // Email provided — must match report owner
  if (!reportOwnerEmail) {
    // Report has no owner email (e.g., old records) — allow access
    return { hasAccess: true, reason: "uuid_only" };
  }

  if (userEmail.toLowerCase() === reportOwnerEmail.toLowerCase()) {
    return { hasAccess: true, reason: "owner" };
  }

  return { hasAccess: false, reason: "denied" };
}

/**
 * Extract user email from request (header or query param).
 * Used by report access routes for authorization.
 */
export function getUserEmailFromRequest(req: Request): string | null {
  // Check X-User-Email header first
  const headerEmail = req.headers.get("x-user-email");
  if (headerEmail) return headerEmail.trim().toLowerCase();

  // Check query param
  const url = new URL(req.url);
  const paramEmail = url.searchParams.get("email");
  if (paramEmail) return paramEmail.trim().toLowerCase();

  return null;
}
