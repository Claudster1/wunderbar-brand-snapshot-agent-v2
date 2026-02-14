// app/api/access/send-links/route.ts
// Looks up reports by email and triggers an ActiveCampaign event
// so the user receives an email with links to all their reports.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fireACEvent } from "@/lib/fireACEvent";

function getSupabase() {
  return supabaseAdmin;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://app.wunderbrand.ai";

export async function POST(req: Request) {
  // ─── Security: Rate limit (email-sending endpoint) ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "access-links", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { email } = await req.json();

    const { isValidEmail } = await import("@/lib/security/inputValidation");
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (!supabase) {
      console.error("[Access API] Supabase not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }

    // Look up all reports for this email
    const { data: reports, error: dbError } = await supabase
      .from("brand_snapshot_reports")
      .select("report_id, company_name, brand_alignment_score, created_at")
      .eq("user_email", normalized)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[Access API] DB error:", dbError.message);
      return NextResponse.json(
        { error: "Unable to look up reports." },
        { status: 500 }
      );
    }

    // Always return success to the client (don't reveal whether the email exists)
    // This prevents email enumeration.
    if (!reports || reports.length === 0) {
      // Still return 200 so we don't leak account info
      return NextResponse.json({
        success: true,
        message:
          "If we have reports associated with that email, you'll receive a link shortly.",
      });
    }

    // Build report links for the email
    const reportLinks = reports.map((r: any) => ({
      name: r.company_name || "WunderBrand Snapshot™",
      score: r.brand_alignment_score,
      url: `${BASE_URL}/report/${r.report_id}`,
      date: r.created_at,
    }));

    // Fire AC event so the automation sends the email with report links
    try {
      await fireACEvent({
        email: normalized,
        eventName: "report_access_requested",
        tags: ["access:report-links-sent"],
        fields: {
          report_count: String(reports.length),
          latest_report_link: reportLinks[0]?.url || "",
          report_links_json: JSON.stringify(reportLinks.slice(0, 5)),
        },
      });
    } catch (acErr) {
      console.error("[Access API] AC event failed:", acErr);
      // Don't fail the request — the lookup succeeded
    }

    return NextResponse.json({
      success: true,
      message:
        "If we have reports associated with that email, you'll receive a link shortly.",
    });
  } catch (err) {
    console.error("[Access API] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
