// GET /api/admin/pnl?days=30
// AI spend (estimated) vs Stripe revenue vs snapshot volume for unit economics / P&L.

import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UsageRow = {
  use_case: string;
  provider: string;
  model: string;
  product_tier: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  estimated_cost_usd: number | string | null;
  created_at: string;
};

type PurchaseRow = {
  product_sku: string;
  amount_total: number | null;
  currency: string | null;
  status: string;
  created_at: string;
};

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 90);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    const [usageRes, purchasesRes, reportsRes] = await Promise.all([
      supabaseAdmin
        .from("ai_usage_events")
        .select(
          "use_case, provider, model, product_tier, input_tokens, output_tokens, total_tokens, estimated_cost_usd, created_at",
        )
        .gte("created_at", since)
        .limit(20000),
      supabaseAdmin
        .from("brand_snapshot_purchases")
        .select("product_sku, amount_total, currency, status, created_at")
        .gte("created_at", since)
        .limit(5000),
      supabaseAdmin
        .from("brand_snapshot_reports")
        .select("report_id, status, snapshot_stage, created_at")
        .gte("created_at", since)
        .limit(10000),
    ]);

    if (usageRes.error) {
      // Table may not exist until migration is applied
      if (/ai_usage_events|schema cache|does not exist/i.test(usageRes.error.message)) {
        return NextResponse.json({
          days,
          since,
          migrationRequired: true,
          message:
            "Run database/migration_ai_usage_events.sql in Supabase, then traffic will populate AI spend.",
          overview: emptyOverview(),
        });
      }
      throw new Error(usageRes.error.message);
    }
    if (purchasesRes.error) throw new Error(purchasesRes.error.message);
    if (reportsRes.error) throw new Error(reportsRes.error.message);

    const usage = (usageRes.data || []) as UsageRow[];
    const purchases = ((purchasesRes.data || []) as PurchaseRow[]).filter(
      (p) => p.status === "paid" || !p.status,
    );
    const reports = reportsRes.data || [];

    const completedReports = reports.filter((r) => {
      const status = String(r.status || "").toLowerCase();
      const stage = String(r.snapshot_stage || "").toLowerCase();
      return status === "completed" || stage === "completed" || status === "complete";
    });

    let aiCostUsd = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let aiCalls = 0;
    const byProvider: Record<string, { costUsd: number; calls: number; tokens: number }> = {};
    const byUseCase: Record<string, { costUsd: number; calls: number; tokens: number }> = {};
    const byModel: Record<string, { costUsd: number; calls: number; tokens: number }> = {};

    for (const row of usage) {
      aiCalls += 1;
      const cost = num(row.estimated_cost_usd);
      const tokens =
        num(row.total_tokens) || num(row.input_tokens) + num(row.output_tokens);
      aiCostUsd += cost;
      inputTokens += num(row.input_tokens);
      outputTokens += num(row.output_tokens);

      const prov = row.provider || "unknown";
      byProvider[prov] = byProvider[prov] || { costUsd: 0, calls: 0, tokens: 0 };
      byProvider[prov].costUsd += cost;
      byProvider[prov].calls += 1;
      byProvider[prov].tokens += tokens;

      const uc = row.use_case || "unknown";
      byUseCase[uc] = byUseCase[uc] || { costUsd: 0, calls: 0, tokens: 0 };
      byUseCase[uc].costUsd += cost;
      byUseCase[uc].calls += 1;
      byUseCase[uc].tokens += tokens;

      const model = row.model || "unknown";
      byModel[model] = byModel[model] || { costUsd: 0, calls: 0, tokens: 0 };
      byModel[model].costUsd += cost;
      byModel[model].calls += 1;
      byModel[model].tokens += tokens;
    }

    let revenueUsd = 0;
    const byProduct: Record<
      string,
      { revenueUsd: number; count: number; avgUsd: number }
    > = {};

    for (const p of purchases) {
      const cents = num(p.amount_total);
      const usd = cents / 100;
      revenueUsd += usd;
      const sku = p.product_sku || "UNKNOWN";
      byProduct[sku] = byProduct[sku] || { revenueUsd: 0, count: 0, avgUsd: 0 };
      byProduct[sku].revenueUsd += usd;
      byProduct[sku].count += 1;
    }
    for (const sku of Object.keys(byProduct)) {
      const row = byProduct[sku];
      row.avgUsd = row.count ? roundMoney(row.revenueUsd / row.count) : 0;
      row.revenueUsd = roundMoney(row.revenueUsd);
    }

    const freeCompletions = completedReports.length;
    const paidConversions = purchases.length;
    const conversionRate =
      freeCompletions > 0 ? paidConversions / freeCompletions : null;
    const aiCostPerCompletion =
      freeCompletions > 0 ? aiCostUsd / freeCompletions : null;
    const aiCostPerPaid =
      paidConversions > 0 ? aiCostUsd / paidConversions : null;
    const grossAfterAi = revenueUsd - aiCostUsd;

    const formatBucket = (bucket: Record<string, { costUsd: number; calls: number; tokens: number }>) =>
      Object.entries(bucket)
        .map(([key, v]) => ({
          key,
          costUsd: roundMoney(v.costUsd, 4),
          calls: v.calls,
          tokens: v.tokens,
        }))
        .sort((a, b) => b.costUsd - a.costUsd);

    return NextResponse.json({
      days,
      since,
      migrationRequired: false,
      overview: {
        revenueUsd: roundMoney(revenueUsd),
        aiCostUsd: roundMoney(aiCostUsd, 4),
        grossAfterAiUsd: roundMoney(grossAfterAi, 4),
        aiCalls,
        inputTokens,
        outputTokens,
        freeSnapshotCompletions: freeCompletions,
        paidConversions,
        conversionRate,
        aiCostPerFreeCompletionUsd:
          aiCostPerCompletion != null ? roundMoney(aiCostPerCompletion, 4) : null,
        aiCostPerPaidConversionUsd:
          aiCostPerPaid != null ? roundMoney(aiCostPerPaid, 4) : null,
        note:
          "AI cost is estimated from token usage × public list rates. Compare to vendor invoices for true P&L. Streaming chat turns often omit tokens until buffered fallback.",
      },
      byProduct: Object.entries(byProduct)
        .map(([sku, v]) => ({ sku, ...v }))
        .sort((a, b) => b.revenueUsd - a.revenueUsd),
      byProvider: formatBucket(byProvider),
      byUseCase: formatBucket(byUseCase),
      byModel: formatBucket(byModel),
    });
  } catch (err) {
    logger.error("[Admin PnL]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}

function emptyOverview() {
  return {
    revenueUsd: 0,
    aiCostUsd: 0,
    grossAfterAiUsd: 0,
    aiCalls: 0,
    inputTokens: 0,
    outputTokens: 0,
    freeSnapshotCompletions: 0,
    paidConversions: 0,
    conversionRate: null,
    aiCostPerFreeCompletionUsd: null,
    aiCostPerPaidConversionUsd: null,
    note: "Apply migration_ai_usage_events.sql to start logging AI spend.",
  };
}
