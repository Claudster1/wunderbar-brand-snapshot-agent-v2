// POST /api/voc/create — Create a VOC survey for a report
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AUTH_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "voc-create", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { reportId, businessName } = await req.json();

    if (!reportId || !businessName) {
      return NextResponse.json({ error: "Missing reportId or businessName" }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Check if a survey already exists for this report
    const { data: existing } = await (supabase.from("voc_surveys") as any)
      .select("survey_token")
      .eq("report_id", reportId)
      .single();

    if (existing?.survey_token) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.brandsnapshot.ai";
      return NextResponse.json({
        surveyUrl: `${baseUrl}/survey/${existing.survey_token}`,
        surveyToken: existing.survey_token,
        alreadyExists: true,
      });
    }

    // Generate a short, URL-friendly token
    const surveyToken = randomBytes(8).toString("hex");

    const { error } = await (supabase.from("voc_surveys") as any).insert({
      report_id: reportId,
      business_name: businessName,
      survey_token: surveyToken,
    });

    if (error) {
      console.error("[VOC Create] Insert error:", error);
      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.brandsnapshot.ai";

    return NextResponse.json({
      surveyUrl: `${baseUrl}/survey/${surveyToken}`,
      surveyToken,
    });
  } catch (err: any) {
    console.error("[VOC Create] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
