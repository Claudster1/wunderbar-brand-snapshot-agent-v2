// DELETE /api/assets/delete
// Removes an uploaded asset from storage and the tracking table.
// SECURITY: Requires verified email session; only owner can delete.

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { isValidUUID } from "@/lib/security/inputValidation";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const guard = await apiGuard(req, { routeId: "assets-delete", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json()) as { id?: string; email?: string };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const claimedEmail = typeof body.email === "string" ? body.email : null;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
    }

    const { requireVerifiedEmail } = await import("@/lib/reportAccess");
    const auth = requireVerifiedEmail(req, claimedEmail);
    if ("error" in auth) return auth.error;

    const sb = supabaseServer();

    const { data: asset, error: fetchErr } = (await sb
      .from("brand_asset_uploads")
      .select("id, storage_path")
      .eq("id", id)
      .eq("user_email", auth.email)
      .single()) as { data: { id: string; storage_path: string } | null; error: unknown };

    if (fetchErr || !asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    if (!asset.storage_path || asset.storage_path.includes("..")) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    await sb.storage.from("brand-assets").remove([asset.storage_path]);

    await (sb.from("brand_asset_uploads") as any)
      .delete()
      .eq("id", id)
      .eq("user_email", auth.email);

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("[Asset Delete]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to delete asset." }, { status: 500 });
  }
}
