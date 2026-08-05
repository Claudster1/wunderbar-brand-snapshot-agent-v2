// Fire-and-forget persistence of AI token usage for P&L.

import type { UseCase } from "@/lib/ai/config";
import { estimateCostUsd } from "@/lib/ai/pricing";
import type { AIProvider, AiUsageTelemetry, CompletionResponse } from "@/lib/ai/types";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type { AiUsageTelemetry };

export function logAiUsageEvent(params: {
  useCase: UseCase | string;
  response: CompletionResponse;
  wasFallback?: boolean;
  latencyMs?: number;
  telemetry?: AiUsageTelemetry;
}): void {
  const { useCase, response, wasFallback, latencyMs, telemetry } = params;
  void persistAiUsage({
    useCase,
    provider: response.provider,
    model: response.model,
    inputTokens: response.usage?.inputTokens ?? null,
    outputTokens: response.usage?.outputTokens ?? null,
    totalTokens: response.usage?.totalTokens ?? null,
    wasFallback: Boolean(wasFallback),
    latencyMs: latencyMs ?? null,
    telemetry,
  }).catch((err) => {
    logger.warn("[AI Usage] Failed to persist", {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

async function persistAiUsage(params: {
  useCase: string;
  provider: AIProvider | string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  wasFallback: boolean;
  latencyMs: number | null;
  telemetry?: AiUsageTelemetry;
}): Promise<void> {
  if (!supabaseAdmin) return;

  const estimated = estimateCostUsd({
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
  });

  const { error } = await supabaseAdmin.from("ai_usage_events").insert({
    use_case: params.useCase,
    provider: params.provider,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    total_tokens:
      params.totalTokens ??
      (params.inputTokens != null || params.outputTokens != null
        ? (params.inputTokens ?? 0) + (params.outputTokens ?? 0)
        : null),
    estimated_cost_usd: estimated,
    report_id: params.telemetry?.reportId || null,
    user_email: params.telemetry?.userEmail?.toLowerCase().trim() || null,
    session_id: params.telemetry?.sessionId || null,
    product_tier: params.telemetry?.productTier || null,
    latency_ms: params.latencyMs,
    was_fallback: params.wasFallback,
  });

  if (error) {
    throw new Error(error.message);
  }
}
