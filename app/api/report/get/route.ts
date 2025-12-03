// app/api/report/get/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("brand_snapshot_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("[Report API] Error fetching report:", error);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Report API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

