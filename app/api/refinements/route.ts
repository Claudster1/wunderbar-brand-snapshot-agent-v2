// app/api/refinements/route.ts
// API route for creating snapshot refinement requests

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("snapshot_refinement_requests")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Error inserting refinement request:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in refinements API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
