// app/api/snapshot/save-exit/route.ts
// Stores the user's email against their draft report and triggers
// an ActiveCampaign event to send them a resume link.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fireACEvent } from "@/lib/fireACEvent";

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://app.brandsnapshot.ai";

export async function POST(req: Request) {
  // ─── Security: Rate limit ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "save-exit", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { reportId, email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const resumeLink = `${BASE_URL}/?resume=${reportId}`;

    // Update the draft report with the user's email
    const supabase = getSupabase();
    if (supabase && reportId) {
      await supabase
        .from("brand_snapshot_reports")
        .update({ user_email: normalized })
        .eq("report_id", reportId);
    }

    // Fire AC event to send the resume email
    await fireACEvent({
      email: normalized,
      eventName: "assessment_paused",
      tags: ["snapshot:paused", "snapshot:resume-link-sent"],
      fields: {
        resume_link: resumeLink,
        report_id: reportId || "",
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
