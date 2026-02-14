// GET /api/user-tier?email=xxx — Returns the user's highest purchased tier
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SKU_RANK: Record<string, { tier: string; rank: number }> = {
  BLUEPRINT_PLUS: { tier: "blueprint_plus", rank: 3 },
  BLUEPRINT: { tier: "blueprint", rank: 2 },
  SNAPSHOT_PLUS: { tier: "snapshot_plus", rank: 1 },
};

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "user-tier", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ tier: "free" });
  }

  try {
    const supabase = supabaseServer();

    const { data } = await supabase
      .from("brand_snapshot_purchases")
      .select("product_sku")
      .eq("user_email", email.toLowerCase())
      .eq("status", "paid");

    if (!data || data.length === 0) {
      return NextResponse.json({ tier: "free" });
    }

    // Find highest tier
    let highestRank = 0;
    let highestTier = "free";

    for (const row of data) {
      const info = SKU_RANK[row.product_sku as string];
      if (info && info.rank > highestRank) {
        highestRank = info.rank;
        highestTier = info.tier;
      }
    }

    return NextResponse.json(
      { tier: highestTier },
      { headers: { "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ tier: "free" });
  }
}
