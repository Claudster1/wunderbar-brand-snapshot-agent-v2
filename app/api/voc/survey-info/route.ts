// GET /api/voc/survey-info?token=xxx — Public endpoint to get survey metadata
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const supabase = supabaseServer();

    const { data: survey } = await (supabase.from("voc_surveys") as any)
      .select("business_name, status, max_responses, id")
      .eq("survey_token", token)
      .single();

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.status !== "active") {
      return NextResponse.json({ error: "Survey closed", closed: true }, { status: 410 });
    }

    // Check if response limit reached
    const { count } = await (supabase.from("voc_responses") as any)
      .select("id", { count: "exact", head: true })
      .eq("survey_id", survey.id);

    if (count !== null && count >= survey.max_responses) {
      return NextResponse.json({ error: "Survey full", closed: true }, { status: 410 });
    }

    return NextResponse.json({
      businessName: survey.business_name,
      status: survey.status,
    });
  } catch (err: any) {
    console.error("[VOC Survey Info] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
