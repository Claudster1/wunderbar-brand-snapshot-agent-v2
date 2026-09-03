// GET /api/access/resume-tier
// For verified-session buyers returning later: mint a fresh chat tier token from purchases.

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { createTierToken, normalizeAccessTier } from "@/lib/security/tierToken";

export const dynamic = "force-dynamic";

const SKU_RANK: Record<string, { tier: string; rank: number }> = {
  BLUEPRINT_PLUS: { tier: "blueprint-plus", rank: 3 },
  BLUEPRINT: { tier: "blueprint", rank: 2 },
  SNAPSHOT_PLUS: { tier: "snapshot-plus", rank: 1 },
  SNAPSHOT_PLUS_REFRESH: { tier: "snapshot-plus", rank: 1 },
  BLUEPRINT_REFRESH: { tier: "blueprint", rank: 2 },
};

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "access-resume-tier", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { requireVerifiedEmail } = await import("@/lib/reportAccess");
  const auth = requireVerifiedEmail(req, null);
  if ("error" in auth) return auth.error;

  const requested = new URL(req.url).searchParams.get("tier");
  const requestedNorm = requested ? normalizeAccessTier(requested) : "";

  try {
    const supabase = supabaseServer();
    const { data } = await (supabase
      .from("brand_snapshot_purchases" as any)
      .select("product_sku")
      .eq("user_email", auth.email)
      .eq("status", "paid") as any);

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, reason: "no_purchase" }, { status: 404 });
    }

    let highestRank = 0;
    let highestTier = "";
    for (const row of data as Array<{ product_sku?: string }>) {
      const info = SKU_RANK[String(row.product_sku || "")];
      if (info && info.rank > highestRank) {
        highestRank = info.rank;
        highestTier = info.tier;
      }
    }

    if (!highestTier) {
      return NextResponse.json({ ok: false, reason: "no_paid_tier" }, { status: 404 });
    }

    // If URL asks for a specific paid tier, only allow if purchase rank covers it
    const REQUEST_RANK: Record<string, number> = {
      "snapshot-plus": 1,
      blueprint: 2,
      "blueprint-plus": 3,
    };
    let chatTier = highestTier;
    if (requestedNorm && REQUEST_RANK[requestedNorm]) {
      if ((REQUEST_RANK[requestedNorm] || 0) > highestRank) {
        return NextResponse.json({ ok: false, reason: "tier_not_purchased" }, { status: 403 });
      }
      chatTier = requestedNorm;
    }

    const token = createTierToken(chatTier, auth.email);
    return NextResponse.json(
      { ok: true, tier: chatTier, token, email: auth.email },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    logger.error("[Access Resume Tier] Failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
