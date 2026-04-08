// Admin-only: regenerate paid rows in `brand_snapshot_plus_reports` (Snapshot+™, Blueprint™, Blueprint+™)
// to backfill new prompt fields and tier signals. Re-runs full AI generation (content may drift).
//
// GET ?limit=&tier=snapshot_plus|blueprint|blueprint_plus — preview candidates (tier optional).
//
// POST JSON:
// - dryRun?: boolean (default true)
// - limit?: number (dry-run default 10, max 100; live run always 1 row)
// - reportIds?: string[]
// - tier?: snapshot_plus | blueprint | blueprint_plus — when scanning without reportIds, only these rows
//
// When dryRun is false: exactly one reportIds entry is required (explicit target + serverless timeouts).

import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import {
  buildAssessmentInputForPaidRow,
  filterRowsByTierParam,
  isPaidRegenerableTier,
  paidTierFromFullReport,
  runPaidReportRegeneration,
  type PaidPlusRow,
  type PaidRegenerableTier,
} from "@/lib/admin/regeneratePaidReports";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function selectRegenerableRows(rows: PaidPlusRow[]): PaidPlusRow[] {
  return rows.filter((r) => paidTierFromFullReport(r.full_report) !== null);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const tierFilter = url.searchParams.get("tier");

  if (tierFilter && !isPaidRegenerableTier(tierFilter)) {
    return NextResponse.json(
      { error: "Invalid tier. Use snapshot_plus, blueprint, or blueprint_plus." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("brand_snapshot_plus_reports")
    .select("report_id, base_snapshot_report_id, user_email, user_name, full_report, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    logger.error("[Admin Regenerate Plus] list failed", { error: error.message });
    return NextResponse.json({ error: "Failed to list reports." }, { status: 500 });
  }

  let rows = selectRegenerableRows((data ?? []) as PaidPlusRow[]);
  rows = filterRowsByTierParam(rows, tierFilter);
  const sliced = rows.slice(0, limit);

  const preview = await Promise.all(
    sliced.map(async (row) => {
      const tier = paidTierFromFullReport(row.full_report) as PaidRegenerableTier;
      const built = await buildAssessmentInputForPaidRow(row);
      return {
        reportId: row.report_id,
        tier,
        baseSnapshotReportId: row.base_snapshot_report_id,
        userEmail: row.user_email,
        canRegenerate: built.ok,
        assessmentError: built.ok ? undefined : built.reason,
      };
    }),
  );

  const counts = {
    snapshot_plus: 0,
    blueprint: 0,
    blueprint_plus: 0,
  };
  for (const r of rows) {
    const t = paidTierFromFullReport(r.full_report);
    if (t) counts[t] += 1;
  }

  return NextResponse.json({
    counts,
    matched: rows.length,
    returned: preview.length,
    items: preview,
    note: 'POST { "dryRun": true } to validate; { "dryRun": false, "reportIds": ["<one id>"] } to regenerate that row (tier read from _meta).',
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  let body: {
    dryRun?: boolean;
    limit?: number;
    reportIds?: string[];
    tier?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (body.tier != null && body.tier !== "" && !isPaidRegenerableTier(body.tier)) {
    return NextResponse.json(
      { error: "Invalid tier. Use snapshot_plus, blueprint, blueprint_plus, or omit." },
      { status: 400 },
    );
  }

  const tierFilter = body.tier && isPaidRegenerableTier(body.tier) ? body.tier : null;

  const dryRun = body.dryRun !== false;
  const requestedLimit = typeof body.limit === "number" && Number.isFinite(body.limit) ? body.limit : dryRun ? 10 : 1;
  const maxInDryRun = 100;
  const limit = dryRun ? Math.min(maxInDryRun, Math.max(1, requestedLimit)) : 1;

  if (!dryRun && requestedLimit > 1) {
    return NextResponse.json(
      {
        error:
          "When dryRun is false, only one report per request is allowed. Pass a single reportIds value.",
      },
      { status: 400 },
    );
  }

  const reportIds = Array.isArray(body.reportIds)
    ? body.reportIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [];

  if (!dryRun && reportIds.length !== 1) {
    return NextResponse.json(
      {
        error:
          "When dryRun is false, pass exactly one reportIds entry so the target customer report is explicit.",
      },
      { status: 400 },
    );
  }

  let query = supabaseAdmin
    .from("brand_snapshot_plus_reports")
    .select("report_id, base_snapshot_report_id, user_email, user_name, full_report")
    .order("created_at", { ascending: false })
    .limit(500);

  if (reportIds.length > 0) {
    query = query.in("report_id", reportIds);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("[Admin Regenerate Plus] fetch failed", { error: error.message });
    return NextResponse.json({ error: "Failed to load reports." }, { status: 500 });
  }

  let allRows = selectRegenerableRows((data ?? []) as PaidPlusRow[]);
  allRows = filterRowsByTierParam(allRows, tierFilter);
  const rows = allRows.slice(0, limit);

  if (rows.length === 0) {
    return NextResponse.json({
      dryRun,
      processed: 0,
      message: "No matching paid reports (check reportIds, optional tier filter, and full_report._meta.tier).",
      results: [],
    });
  }

  if (!dryRun && rows.length !== 1) {
    return NextResponse.json(
      {
        error:
          "Exactly one row must match when dryRun is false. Use a unique reportId or remove ambiguous filters.",
        matchedCount: rows.length,
      },
      { status: 400 },
    );
  }

  type ResultItem = {
    reportId: string;
    tier: PaidRegenerableTier;
    status: "skipped" | "validated" | "regenerated" | "error";
    detail?: string;
  };

  const results: ResultItem[] = [];

  for (const row of rows) {
    const tier = paidTierFromFullReport(row.full_report) as PaidRegenerableTier;
    const built = await buildAssessmentInputForPaidRow(row);
    if (!built.ok) {
      results.push({ reportId: row.report_id, tier, status: "skipped", detail: built.reason });
      continue;
    }

    if (dryRun) {
      results.push({ reportId: row.report_id, tier, status: "validated" });
      continue;
    }

    const regen = await runPaidReportRegeneration({ row, tier, adminUserId: auth.identity.id });
    if (regen.ok) {
      logger.info("[Admin Regenerate Plus] report regenerated", {
        reportId: row.report_id,
        tier,
        adminUserId: auth.identity.id,
      });
      results.push({ reportId: row.report_id, tier, status: "regenerated" });
    } else {
      logger.error("[Admin Regenerate Plus] failed", {
        reportId: row.report_id,
        tier,
        error: regen.message,
      });
      results.push({ reportId: row.report_id, tier, status: "error", detail: regen.message });
    }
  }

  return NextResponse.json({
    dryRun,
    processed: results.length,
    results,
    warning:
      dryRun === false
        ? "Content is fully re-generated; narrative may differ from the customer’s prior PDF. Blueprint+ uses a long multi-call pipeline."
        : undefined,
  });
}
