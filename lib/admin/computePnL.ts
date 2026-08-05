// Shared P&L aggregation for Admin UI and weekly Slack digest.

import { supabaseAdmin } from "@/lib/supabase-admin";

export type PnLOverview = {
  revenueUsd: number;
  aiCostUsd: number;
  grossAfterAiUsd: number;
  aiCalls: number;
  inputTokens: number;
  outputTokens: number;
  freeSnapshotCompletions: number;
  paidConversions: number;
  conversionRate: number | null;
  aiCostPerFreeCompletionUsd: number | null;
  aiCostPerPaidConversionUsd: number | null;
  note?: string;
};

export type PnLBucket = {
  key: string;
  costUsd: number;
  calls: number;
  tokens: number;
};

export type PnLProduct = {
  sku: string;
  revenueUsd: number;
  count: number;
  avgUsd: number;
};

export type PnLSummary = {
  days: number;
  since: string;
  migrationRequired: boolean;
  message?: string;
  overview: PnLOverview;
  byProduct: PnLProduct[];
  byProvider: PnLBucket[];
  byUseCase: PnLBucket[];
  byModel: PnLBucket[];
};

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

function emptyOverview(note: string): PnLOverview {
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
    note,
  };
}

function formatBucket(
  bucket: Record<string, { costUsd: number; calls: number; tokens: number }>,
): PnLBucket[] {
  return Object.entries(bucket)
    .map(([key, v]) => ({
      key,
      costUsd: roundMoney(v.costUsd, 4),
      calls: v.calls,
      tokens: v.tokens,
    }))
    .sort((a, b) => b.costUsd - a.costUsd);
}

export async function computePnLSummary(days: number): Promise<PnLSummary> {
  const safeDays = Math.min(Math.max(days, 1), 90);
  const since = new Date(Date.now() - safeDays * 86400000).toISOString();

  if (!supabaseAdmin) {
    return {
      days: safeDays,
      since,
      migrationRequired: false,
      message: "Database not configured.",
      overview: emptyOverview("Database not configured."),
      byProduct: [],
      byProvider: [],
      byUseCase: [],
      byModel: [],
    };
  }

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
    if (/ai_usage_events|schema cache|does not exist/i.test(usageRes.error.message)) {
      return {
        days: safeDays,
        since,
        migrationRequired: true,
        message:
          "Run database/migration_ai_usage_events.sql in Supabase, then traffic will populate AI spend.",
        overview: emptyOverview(
          "Apply migration_ai_usage_events.sql to start logging AI spend.",
        ),
        byProduct: [],
        byProvider: [],
        byUseCase: [],
        byModel: [],
      };
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
    const tokens = num(row.total_tokens) || num(row.input_tokens) + num(row.output_tokens);
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
  const byProduct: Record<string, { revenueUsd: number; count: number; avgUsd: number }> = {};

  for (const p of purchases) {
    const usd = num(p.amount_total) / 100;
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
  const conversionRate = freeCompletions > 0 ? paidConversions / freeCompletions : null;
  const aiCostPerCompletion = freeCompletions > 0 ? aiCostUsd / freeCompletions : null;
  const aiCostPerPaid = paidConversions > 0 ? aiCostUsd / paidConversions : null;

  return {
    days: safeDays,
    since,
    migrationRequired: false,
    overview: {
      revenueUsd: roundMoney(revenueUsd),
      aiCostUsd: roundMoney(aiCostUsd, 4),
      grossAfterAiUsd: roundMoney(revenueUsd - aiCostUsd, 4),
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
        "AI cost is estimated from token usage × public list rates. Compare to vendor invoices for true P&L.",
    },
    byProduct: Object.entries(byProduct)
      .map(([sku, v]) => ({ sku, ...v }))
      .sort((a, b) => b.revenueUsd - a.revenueUsd),
    byProvider: formatBucket(byProvider),
    byUseCase: formatBucket(byUseCase),
    byModel: formatBucket(byModel),
  };
}
