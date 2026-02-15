// app/api/verify-email/send/route.ts
// Generates a 6-digit verification code, stores it in Supabase, and sends it via email.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateEmail } from "@/lib/security/emailValidation";
import { fireACEvent } from "@/lib/fireACEvent";

function generateCode(): string {
  // Cryptographically random 6-digit code
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "verify-email-send", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const { email, reportId } = await req.json();

    if (!email || !reportId) {
      return NextResponse.json({ error: "Email and reportId are required" }, { status: 400 });
    }

    // Full email validation (format + disposable + MX)
    const validation = await validateEmail(email);
    if (!validation.valid) {
      console.warn("[Verify Email Send] Validation failed:", validation.reason);
      return NextResponse.json(
        { error: validation.friendlyMessage },
        { status: 422 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store verification code in the report record
    if (supabaseAdmin) {
      const { error: dbError } = await (supabaseAdmin as any)
        .from("brand_snapshot_reports")
        .update({
          user_email: normalized,
          email_verification_code: code,
          email_verification_expires: expiresAt,
          email_verified: false,
        })
        .eq("report_id", reportId);
      if (dbError) {
        console.error("[Verify Email Send] Supabase update error:", dbError);
        return NextResponse.json({ error: "Failed to save verification code." }, { status: 500 });
      }
    }

    // Send verification email via ActiveCampaign
    await fireACEvent({
      email: normalized,
      eventName: "email_verification",
      tags: ["snapshot:email-verification"],
      fields: {
        verification_code: code,
        report_id: reportId,
      },
    });

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error("[Verify Email Send] Error:", err);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
