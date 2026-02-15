// app/api/snapshot/save-exit/route.ts
// Stores the user's email against their draft report and triggers
// an ActiveCampaign event to send them a resume link.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fireACEvent } from "@/lib/fireACEvent";

function getSupabase() {
  return supabaseAdmin;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://app.wunderbrand.ai";

export async function POST(req: Request) {
  // ─── Security: Rate limit ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "save-exit", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();
    const { reportId, email } = body;

    // ─── Security: Verify Turnstile token (bot protection) ───
    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      req.headers.get("x-forwarded-for") || undefined
    );
    if (!turnstileResult.success) {
      console.warn("[Save-Exit] Turnstile verification failed:", turnstileResult["error-codes"]);
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Enhanced email validation (disposable domain + MX check)
    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.friendlyMessage, reason: emailCheck.reason },
        { status: 422 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const resumeLink = `${BASE_URL}/?resume=${reportId}`;

    // Update the draft report with the user's email
    const supabase = getSupabase();
    if (supabase && reportId) {
      const { error: dbError } = await supabase
        .from("brand_snapshot_reports")
        .update({ user_email: normalized })
        .eq("report_id", reportId);
      if (dbError) {
        console.error("[Save-Exit] Supabase update error:", dbError);
        return NextResponse.json({ error: "Failed to save your progress." }, { status: 500 });
      }
    }

    // Set contact fields for personalized resume email
    const { setContactFields, getOrCreateContactId } = await import("@/lib/applyActiveCampaignTags");
    const firstName = body.firstName || body.userName || "";
    const tier = body.tier || "snapshot";

    try {
      if (firstName) {
        await getOrCreateContactId(normalized, { firstName });
      }
      await setContactFields({
        email: normalized,
        fields: {
          resume_link: resumeLink,
          report_id: reportId || "",
          product_key: tier,
          ...(firstName ? { first_name_custom: firstName } : {}),
        },
      });
    } catch (fieldErr) {
      console.error("[Save-Exit] AC field sync failed:", fieldErr);
    }

    // Fire AC event to send the resume email
    await fireACEvent({
      email: normalized,
      eventName: "assessment_paused",
      tags: ["snapshot:paused", "snapshot:resume-link-sent"],
      fields: {
        first_name: firstName,
        resume_link: resumeLink,
        report_id: reportId || "",
        product_tier: tier,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Save-Exit API] Error:", err);
    return NextResponse.json(
      { error: "Failed to save progress." },
      { status: 500 }
    );
  }
}
