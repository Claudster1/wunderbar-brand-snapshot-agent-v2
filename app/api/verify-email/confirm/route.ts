// app/api/verify-email/confirm/route.ts
// Verifies the 6-digit code against the stored code for the report.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";

// ─── Per-reportId brute-force lockout ───
// Max 5 failed attempts per report; resets on deploy or after TTL.
const MAX_ATTEMPTS = 5;
const LOCKOUT_TTL_MS = 15 * 60 * 1000; // 15 minutes (matches code expiry)
const failedAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function checkLockout(reportId: string): boolean {
  const entry = failedAttempts.get(reportId);
  if (!entry) return false;
  // Expired lockout — clear it
  if (Date.now() - entry.firstAttemptAt > LOCKOUT_TTL_MS) {
    failedAttempts.delete(reportId);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(reportId: string): void {
  const entry = failedAttempts.get(reportId);
  if (!entry || Date.now() - entry.firstAttemptAt > LOCKOUT_TTL_MS) {
    failedAttempts.set(reportId, { count: 1, firstAttemptAt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearFailedAttempts(reportId: string): void {
  failedAttempts.delete(reportId);
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "verify-email-confirm", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const { reportId, code } = await req.json();

    if (!reportId || !code) {
      return NextResponse.json({ error: "Report ID and code are required" }, { status: 400 });
    }

    // Check lockout before processing
    if (checkLockout(reportId)) {
      const { logSecurityEvent, getRequestContext } = await import("@/lib/security/securityEvents");
      logSecurityEvent("verification_lockout", { ...getRequestContext(req), reportId });
      return NextResponse.json(
        { error: "Too many attempts. Please request a new verification code." },
        { status: 429 }
      );
    }

    const sanitizedCode = String(code).trim().replace(/\D/g, "").slice(0, 6);
    if (sanitizedCode.length !== 6) {
      return NextResponse.json({ error: "Please enter a 6-digit code" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // Fetch stored code
    const { data: report, error } = await (supabaseAdmin as any)
      .from("brand_snapshot_reports")
      .select("email_verification_code, email_verification_expires, email_verified")
      .eq("report_id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Already verified
    if (report.email_verified) {
      return NextResponse.json({ success: true, verified: true });
    }

    // Check expiry
    if (new Date(report.email_verification_expires) < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check code — use constant-time comparison to prevent timing attacks
    const storedCode = String(report.email_verification_code || "").padEnd(6, "0");
    const inputCode = sanitizedCode.padEnd(6, "0");
    const { timingSafeEqual } = await import("crypto");
    const isMatch = timingSafeEqual(Buffer.from(inputCode), Buffer.from(storedCode));
    if (!isMatch) {
      recordFailedAttempt(reportId);
      const entry = failedAttempts.get(reportId);
      const remaining = MAX_ATTEMPTS - (entry?.count || 0);
      return NextResponse.json(
        { error: remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many attempts. Please request a new verification code."
        },
        { status: 401 }
      );
    }

    // Success — clear lockout counter
    clearFailedAttempts(reportId);

    // Mark as verified
    const { error: updateError } = await (supabaseAdmin as any)
      .from("brand_snapshot_reports")
      .update({
        email_verified: true,
        email_verification_code: null, // Clear code after successful verification
      })
      .eq("report_id", reportId);

    if (updateError) {
      logger.error("[Verify Email Confirm] Supabase update error", { error: updateError instanceof Error ? updateError.message : String(updateError) });
      return NextResponse.json({ error: "Verification succeeded but failed to update record." }, { status: 500 });
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    logger.error("[Verify Email Confirm] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
