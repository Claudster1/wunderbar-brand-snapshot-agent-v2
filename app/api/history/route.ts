import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

type SnapshotRow = {
  id?: string;
  report_id?: string;
  company_name?: string;
  business_name?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
  created_at?: string;
  user_email?: string;
};

type PaidReportRow = {
  id?: string;
  report_id?: string;
  user_email?: string;
  user_name?: string;
  brand_alignment_score?: number;
  pillar_scores?: Record<string, number>;
  full_report?: {
    businessName?: string;
    brandAlignmentScore?: number;
    executiveSummary?: { primaryFocusArea?: string };
    _meta?: { tier?: string };
    [key: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
};

export type HistoryItem = {
  id: string;
  businessName: string;
  brandAlignmentScore: number;
  primaryPillar: string | null;
  createdAt: string;
  tier: "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";
  completed: boolean;
  pdfUrl: string;
  reportUrl: string;
};

function getTierFromMeta(row: PaidReportRow): HistoryItem["tier"] {
  const meta = row.full_report?._meta?.tier;
  if (meta === "blueprint_plus" || meta === "blueprint-plus") return "blueprint_plus";
  if (meta === "blueprint") return "blueprint";
  if (meta === "snapshot_plus" || meta === "snapshot-plus") return "snapshot_plus";
  return "snapshot_plus";
}

function getPdfType(tier: HistoryItem["tier"]): string {
  switch (tier) {
    case "snapshot": return "snapshot";
    case "snapshot_plus": return "snapshot-plus";
    case "blueprint": return "blueprint";
    case "blueprint_plus": return "blueprint-plus";
  }
}

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "history", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const search = searchParams.get("q")?.toLowerCase().trim();
  const brandFilter = searchParams.get("brand")?.trim();

  if (!userId && !email) return NextResponse.json([]);

  const supabase = supabaseServer();
  const items: HistoryItem[] = [];

  // 1. Free Snapshot reports
  {
    let query = supabase
      .from("brand_snapshot_reports")
      .select("id,report_id,company_name,business_name,brand_alignment_score,primary_pillar,created_at,user_email,pillar_insights,recommendations")
      .eq("email_verified", true)
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("user_id", userId);
    else if (email) query = query.eq("user_email", email);

    const { data } = await query;

    for (const r of (data ?? []) as (SnapshotRow & { pillar_insights?: unknown; recommendations?: unknown })[]) {
      const reportId = r.report_id ?? r.id ?? "";
      const businessName = r.business_name ?? r.company_name ?? "Your brand";

      items.push({
        id: reportId,
        businessName,
        brandAlignmentScore: r.brand_alignment_score ?? 0,
        primaryPillar: r.primary_pillar ?? null,
        createdAt: r.created_at ?? "",
        tier: "snapshot",
        completed: true,
        pdfUrl: `/api/pdf?id=${encodeURIComponent(reportId)}&type=snapshot`,
        reportUrl: `/results?reportId=${encodeURIComponent(reportId)}`,
      });
    }
  }

  // 2. Paid reports (Snapshot+, Blueprint, Blueprint+) — all in brand_snapshot_plus_reports
  {
    let query = supabase
      .from("brand_snapshot_plus_reports")
      .select("id,report_id,user_email,user_name,brand_alignment_score,pillar_scores,full_report,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("user_id", userId);
    else if (email) query = query.eq("user_email", email);

    const { data } = await query;

    for (const r of (data ?? []) as PaidReportRow[]) {
      const reportId = r.report_id ?? r.id ?? "";
      const tier = getTierFromMeta(r);
      const pdfType = getPdfType(tier);
      const businessName =
        r.full_report?.businessName ??
        r.user_name ??
        "Your brand";
      const score =
        r.brand_alignment_score ??
        r.full_report?.brandAlignmentScore ??
        (r.pillar_scores
          ? Math.round(
              Object.values(r.pillar_scores).reduce((a, b) => a + b, 0) /
              Object.values(r.pillar_scores).length * 5
            )
          : 0);
      const primaryPillar = r.full_report?.executiveSummary?.primaryFocusArea ?? null;

      let reportUrl: string;
      if (tier === "snapshot_plus" || tier === "blueprint" || tier === "blueprint_plus") {
        reportUrl = `/snapshot-plus/${encodeURIComponent(reportId)}`;
      } else {
        reportUrl = `/results?reportId=${encodeURIComponent(reportId)}`;
      }

      items.push({
        id: reportId,
        businessName,
        brandAlignmentScore: score,
        primaryPillar: typeof primaryPillar === "string" ? primaryPillar : null,
        createdAt: r.created_at ?? r.updated_at ?? "",
        tier,
        completed: true,
        pdfUrl: `/api/pdf?id=${encodeURIComponent(reportId)}&type=${pdfType}`,
        reportUrl,
      });
    }
  }

  // Sort by date descending
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply brand filter if provided
  let filtered = brandFilter
    ? items.filter(
        (item) => item.businessName.toLowerCase() === brandFilter.toLowerCase()
      )
    : items;

  // Apply search filter if provided
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.businessName.toLowerCase().includes(search) ||
        (item.primaryPillar?.toLowerCase().includes(search) ?? false) ||
        item.tier.replace("_", " ").includes(search)
    );
  }

  return NextResponse.json(filtered, {
    headers: {
      "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
