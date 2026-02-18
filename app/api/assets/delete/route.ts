// DELETE /api/assets/delete
// Removes an uploaded asset from storage and the tracking table.

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }

    const sb = supabaseServer();

    const { data: asset, error: fetchErr } = await sb
      .from("brand_asset_uploads")
      .select("id, storage_path")
      .eq("id", id)
      .eq("user_email", email.toLowerCase())
      .single();

    if (fetchErr || !asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    await sb.storage.from("brand-assets").remove([asset.storage_path]);

    await sb.from("brand_asset_uploads").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Asset Delete]", err);
    return NextResponse.json({ error: "Failed to delete asset." }, { status: 500 });
  }
}
