// lib/health/aiSmoke.ts
// Tiny live completions for health cron — catches retired models, quota, and key issues
// before users hit "connection issue" in chat.

import { getAIDirect } from "@/lib/ai";
import { getModelRoute, type UseCase } from "@/lib/ai/config";
import type { AIProvider } from "@/lib/ai/types";
import { isBillingOrQuotaError } from "@/lib/health/billingDetect";
import { logger } from "@/lib/logger";

const AI_SMOKE_TIMEOUT_MS = 20_000;

/** Cheap canary models per provider for account/billing probes. */
const PROVIDER_CANARY: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5",
  gemini: "gemini-2.0-flash",
};

export type AiSmokeResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
  /** True when chat still works only via fallback */
  primaryFailed?: boolean;
  usedProvider?: string;
  usedModel?: string;
  /** True when failure text looks like billing/quota (not a model-id bug) */
  billingIssue?: boolean;
};

export type ProviderSmokeResult = {
  provider: AIProvider;
  ok: boolean;
  configured: boolean;
  latencyMs: number;
  error?: string;
  billingIssue?: boolean;
  model?: string;
};

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), timeoutMs);
    }),
  ]);
}

function shortenError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/\s+/g, " ").trim().slice(0, 180);
}

async function tryProviderComplete(
  provider: AIProvider,
  model: string,
): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
  model?: string;
  billingIssue?: boolean;
}> {
  const start = Date.now();
  const client = getAIDirect(provider, model);
  if (!client.isConfigured) {
    return { ok: false, latencyMs: 0, error: "not configured" };
  }

  try {
    const res = await withTimeout(
      client.complete({
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
        maxTokens: 8,
        temperature: 0,
      }),
      AI_SMOKE_TIMEOUT_MS,
    );
    const text = (res.content || "").trim();
    if (!text) {
      return { ok: false, latencyMs: Date.now() - start, error: "empty response" };
    }
    return {
      ok: true,
      latencyMs: Date.now() - start,
      model: res.model || model,
    };
  } catch (err) {
    const error = shortenError(err);
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error,
      billingIssue: isBillingOrQuotaError(error),
    };
  }
}

/**
 * Smoke a use case: try primary, then fallback.
 * `ok` is true if either path returns content (users would still get a reply).
 */
export async function runUseCaseAiSmoke(useCase: UseCase): Promise<AiSmokeResult> {
  const route = getModelRoute(useCase);
  const started = Date.now();

  const primary = await tryProviderComplete(route.provider, route.model);
  if (primary.ok) {
    return {
      ok: true,
      latencyMs: primary.latencyMs,
      usedProvider: route.provider,
      usedModel: primary.model || route.model,
    };
  }

  logger.warn("[AI Smoke] Primary failed", {
    useCase,
    provider: route.provider,
    model: route.model,
    error: primary.error,
    billingIssue: primary.billingIssue,
  });

  if (route.fallbackProvider && route.fallbackModel) {
    const fallback = await tryProviderComplete(route.fallbackProvider, route.fallbackModel);
    if (fallback.ok) {
      return {
        ok: true,
        latencyMs: Date.now() - started,
        primaryFailed: true,
        billingIssue: primary.billingIssue,
        usedProvider: route.fallbackProvider,
        usedModel: fallback.model || route.fallbackModel,
        error: `primary ${route.provider}/${route.model}: ${primary.error}`,
      };
    }

    return {
      ok: false,
      latencyMs: Date.now() - started,
      billingIssue: Boolean(primary.billingIssue || fallback.billingIssue),
      error:
        `primary ${route.provider}/${route.model}: ${primary.error}; ` +
        `fallback ${route.fallbackProvider}/${route.fallbackModel}: ${fallback.error}`,
    };
  }

  return {
    ok: false,
    latencyMs: Date.now() - started,
    billingIssue: primary.billingIssue,
    error: `primary ${route.provider}/${route.model}: ${primary.error}; no fallback configured`,
  };
}

/** Critical path: assessment chat (users talking to Wundy). */
export async function runAssessmentChatSmoke(): Promise<AiSmokeResult> {
  return runUseCaseAiSmoke("assessment_chat");
}

/** Cheap report path: free Snapshot generation route. */
export async function runReportFreeSmoke(): Promise<AiSmokeResult> {
  return runUseCaseAiSmoke("report_free");
}

/**
 * Probe each configured AI provider account (OpenAI / Anthropic / Gemini).
 * Used for billing Slack alerts independent of use-case routing.
 */
export async function runProviderAccountSmokes(): Promise<ProviderSmokeResult[]> {
  const providers = Object.keys(PROVIDER_CANARY) as AIProvider[];
  const results: ProviderSmokeResult[] = [];

  for (const provider of providers) {
    const model = PROVIDER_CANARY[provider];
    const client = getAIDirect(provider, model);
    if (!client.isConfigured) {
      results.push({
        provider,
        ok: true,
        configured: false,
        latencyMs: 0,
        error: "not configured (skipped)",
      });
      continue;
    }

    const attempt = await tryProviderComplete(provider, model);
    results.push({
      provider,
      ok: attempt.ok,
      configured: true,
      latencyMs: attempt.latencyMs,
      error: attempt.error,
      billingIssue: attempt.billingIssue,
      model: attempt.model || model,
    });
  }

  return results;
}
