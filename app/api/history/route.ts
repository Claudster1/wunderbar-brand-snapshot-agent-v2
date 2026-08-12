import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

type SnapshotRow = {
  id?: string;
  report_id?: string;
  brand_name?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
  created_at?: string;
  user_email?: string;
  status?: string | null;
  snapshot_stage?: string | null;
  email_verified?: boolean | null;
  full_report?: {
    email_verified?: boolean;
    businessName?: string;
    company_name?: string;
    [key: string]: unknown;
  } | null;
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

function getPdfUrl(reportId: string, tier: HistoryItem["tier"]): string {
  const encodedId = encodeURIComponent(reportId);
  switch (tier) {
    case "snapshot":
      return `/api/snapshot/pdf?id=${encodedId}`;
    case "snapshot_plus":
      return `/api/snapshot-plus/pdf?id=${encodedId}`;
    case "blueprint":
      return `/api/blueprint/pdf?reportId=${encodedId}&type=complete&tier=blueprint`;
    case "blueprint_plus":
      return `/api/blueprint/pdf?reportId=${encodedId}&type=complete&tier=blueprint-plus`;
  }
}

function isCompletedSnapshot(r: SnapshotRow): boolean {
  if (r.status === "draft" || r.snapshot_stage === "in_progress") return false;
  if ((r.brand_alignment_score ?? 0) <= 0) return false;
  if (r.brand_name === "Draft") return false;
  // Prefer explicit verification when present; otherwise include completed scored reports.
  const frVerified = r.full_report?.email_verified === true;
  if (r.email_verified === false && !frVerified) return false;
  return true;
}

function pushSnapshotHistoryItem(items: HistoryItem[], r: SnapshotRow) {
  if (!isCompletedSnapshot(r)) return;
  const reportId = r.report_id ?? r.id ?? "";
  if (!reportId) return;
  const businessName =
    r.full_report?.businessName ||
    r.full_report?.company_name ||
    r.brand_name ||
    "Your brand";

  items.push({
    id: reportId,
    businessName: String(businessName),
    brandAlignmentScore: r.brand_alignment_score ?? 0,
    primaryPillar: r.primary_pillar ?? null,
    createdAt: r.created_at ?? "",
    tier: "snapshot",
    completed: true,
    pdfUrl: getPdfUrl(reportId, "snapshot"),
    reportUrl: `/results?reportId=${encodeURIComponent(reportId)}`,
  });
}

export async function GET(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "history", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const claimedEmail = searchParams.get("email");
  const search = searchParams.get("q")?.toLowerCase().trim();
  const brandFilter = searchParams.get("brand")?.trim();

  const { requireVerifiedEmail } = await import("@/lib/reportAccess");
  const auth = requireVerifiedEmail(req, claimedEmail);
  if ("error" in auth) return auth.error;

  const normalizedEmail = auth.email;
  const supabase = supabaseServer();
  const items: HistoryItem[] = [];

  // 1. Free Snapshot reports
  // Prod schema uses `brand_name` (not company_name/business_name).
  // email_verified may be a column (after migration) and/or nested in full_report.
  {
    const baseSelectWithoutEmailVerified =
      "id,report_id,brand_name,brand_alignment_score,primary_pillar,created_at,user_email,status,snapshot_stage,full_report";
    const baseSelect =
      `${baseSelectWithoutEmailVerified},email_verified`;

    let { data, error } = await supabase
      .from("brand_snapshot_reports")
      .select(baseSelect)
      .eq("user_email", normalizedEmail)
      .order("created_at", { ascending: false });

    if (error) {
      // Column may be absent until migration_fix_missing_snapshot_columns.sql is re-run.
      ({ data, error } = await supabase
        .from("brand_snapshot_reports")
        .select(baseSelectWithoutEmailVerified)
        .eq("user_email", normalizedEmail)
        .order("created_at", { ascending: false }));
    }

    if (!error) {
      for (const r of (data ?? []) as SnapshotRow[]) {
        pushSnapshotHistoryItem(items, r);
      }
    }
  }

  // 2. Paid reports (Snapshot+, Blueprint, Blueprint+) — all in brand_snapshot_plus_reports
  {
    const { data } = await supabase
      .from("brand_snapshot_plus_reports")
      .select("id,report_id,user_email,user_name,brand_alignment_score,pillar_scores,full_report,created_at,updated_at")
      .eq("user_email", normalizedEmail)
      .order("created_at", { ascending: false });

    for (const r of (data ?? []) as PaidReportRow[]) {
      const reportId = r.report_id ?? r.id ?? "";
      const tier = getTierFromMeta(r);
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
        pdfUrl: getPdfUrl(reportId, tier),
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
