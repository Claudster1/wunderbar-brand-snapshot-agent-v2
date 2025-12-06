// app/api/snapshot/get/route.ts
// API route to get Brand Snapshot reports

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Try to get report with all fields, including legacy field names
    const { data, error } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", id)
      .single();
    
    // Transform data to support both old and new schema
    if (data) {
      // Map old field names to new ones for backward compatibility
      if (data.company_name && !data.company) {
        data.company = data.company_name;
      }
      if (data.user_email && !data.email) {
        data.email = data.user_email;
      }
      if (data.insights && !data.pillar_insights) {
        data.pillar_insights = data.insights;
      }
    }

    if (error || !data) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Snapshot Get API] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to get snapshot" },
      { status: 500 }
    );
  }
}

