// lib/reportAccess.ts
// Report access control utilities
//
// SECURITY: Reports with an owner email require a verified-email session cookie
// (issued after OTP). UUID possession alone is NOT enough — UUIDs leak via email,
// logs, and referrers. Sample report IDs remain public.
//
// Intentional public exceptions:
//   • sample-* report IDs (fixtures)
//   • Valid shared_links token (?shareToken=) resolved server-side

import { readSessionEmailFromCookieHeader } from "@/lib/auth/session";

export interface ReportAccessCheck {
  hasAccess: boolean;
  reason: "owner" | "sample" | "no_owner" | "share_token" | "denied";
}

export function isSampleReportId(reportId: string | null | undefined): boolean {
  return typeof reportId === "string" && reportId.startsWith("sample-");
}

/**
 * Check if a user has access to a report.
 *
 * Access rules:
 * 1. Sample fixtures → allow
 * 2. Report has no owner email (legacy) → allow by UUID (no PII owner to protect)
 * 3. Verified/session email matches owner → allow
 * 4. Otherwise → deny (including bare UUID with no session)
 */
export function checkReportAccess(
  userEmail: string | null | undefined,
  reportOwnerEmail: string | null | undefined,
  reportId?: string | null,
): ReportAccessCheck {
  if (isSampleReportId(reportId)) {
    return { hasAccess: true, reason: "sample" };
  }

  const owner = reportOwnerEmail?.trim().toLowerCase() || null;
  if (!owner) {
    // Legacy / orphan rows with no owner — UUID is the only handle.
    return { hasAccess: true, reason: "no_owner" };
  }

  const email = userEmail?.trim().toLowerCase() || null;
  if (email && email === owner) {
    return { hasAccess: true, reason: "owner" };
  }

  return { hasAccess: false, reason: "denied" };
}

/**
 * Extract the VERIFIED user email from the request — i.e. only from the
 * httpOnly session cookie issued after OTP confirmation. This is the trusted
 * identity primitive; never spoofable by a client-supplied header/query param.
 * Returns null if there is no valid session.
 */
export function getVerifiedEmailFromRequest(req: Request): string | null {
  return readSessionEmailFromCookieHeader(req.headers.get("cookie"));
}

/**
 * @deprecated Prefer getVerifiedEmailFromRequest for any sensitive read.
 * Falls back to spoofable header/query — do not use for PII/enumeration.
 */
export function getUserEmailFromRequest(req: Request): string | null {
  const sessionEmail = getVerifiedEmailFromRequest(req);
  if (sessionEmail) return sessionEmail;

  const headerEmail = req.headers.get("x-user-email");
  if (headerEmail) return headerEmail.trim().toLowerCase();

  const url = new URL(req.url);
  const paramEmail = url.searchParams.get("email");
  if (paramEmail) return paramEmail.trim().toLowerCase();

  return null;
}

/**
 * For dashboard/enumeration APIs: require verified session.
 * Optionally ensure query/body email (if provided) matches the session.
 */
export function requireVerifiedEmail(
  req: Request,
  claimedEmail?: string | null,
): { email: string } | { error: Response } {
  const email = getVerifiedEmailFromRequest(req);
  if (!email) {
    return {
      error: new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  if (claimedEmail && claimedEmail.trim().toLowerCase() !== email) {
    return {
      error: new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { email };
}

/**
 * Validate a share token for a given report. Returns true if the token is
 * active, non-expired, and bound to reportId.
 */
export async function isValidShareTokenForReport(
  shareToken: string | null | undefined,
  reportId: string,
): Promise<boolean> {
  const token = shareToken?.trim();
  if (!token || token.length < 10) return false;

  const { supabaseAdmin } = await import("@/lib/supabase-admin");
  if (!supabaseAdmin) return false;

  const { data, error } = await (supabaseAdmin.from("shared_links" as any) as any)
    .select("report_id, is_revoked, expires_at, max_access_count, access_count")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return false;
  if (data.is_revoked) return false;
  if (String(data.report_id) !== String(reportId)) return false;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return false;
  if (
    data.max_access_count != null &&
    typeof data.access_count === "number" &&
    data.access_count >= data.max_access_count
  ) {
    return false;
  }
  return true;
}

/**
 * Authorize a report read from page-level inputs (cookie header + optional share token).
 * Prefer this from Server Components where you have `headers()` / searchParams.
 */
export async function authorizeReportPageRead(params: {
  reportId: string;
  reportOwnerEmail?: string | null;
  cookieHeader?: string | null;
  shareToken?: string | null;
}): Promise<ReportAccessCheck> {
  const { reportId, reportOwnerEmail, cookieHeader, shareToken } = params;

  if (isSampleReportId(reportId)) {
    return { hasAccess: true, reason: "sample" };
  }

  const verified = readSessionEmailFromCookieHeader(cookieHeader ?? null);
  const access = checkReportAccess(verified, reportOwnerEmail, reportId);
  if (access.hasAccess) return access;

  if (shareToken && (await isValidShareTokenForReport(shareToken, reportId))) {
    return { hasAccess: true, reason: "share_token" };
  }

  return { hasAccess: false, reason: "denied" };
}

/**
 * Authorize reading a report/PDF: verified owner, sample, no-owner legacy,
 * or valid ?shareToken=.
 */
export async function authorizeReportRead(params: {
  req: Request;
  reportId: string;
  reportOwnerEmail?: string | null;
}): Promise<ReportAccessCheck> {
  const { req, reportId, reportOwnerEmail } = params;
  const url = new URL(req.url);
  const shareToken = url.searchParams.get("shareToken") || url.searchParams.get("token");
  return authorizeReportPageRead({
    reportId,
    reportOwnerEmail,
    cookieHeader: req.headers.get("cookie"),
    shareToken,
  });
}
