import { NextResponse } from "next/server";
import { getUserBrands } from "@/lib/userBrands";

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "brands", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json([]);

  const brands = await getUserBrands(email);

  return NextResponse.json(
    brands.map((b) => ({
      id: b.id,
      brandName: b.brand_name,
      industry: b.industry,
      website: b.website,
      latestScore: b.latest_score,
      latestReportId: b.latest_report_id,
      latestReportTier: b.latest_report_tier,
      hasSnapshotPlus: b.has_snapshot_plus,
      hasBlueprint: b.has_blueprint,
      hasBlueprintPlus: b.has_blueprint_plus,
      reportCount: b.report_count,
      updatedAt: b.updated_at,
    })),
    {
      headers: {
        "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
