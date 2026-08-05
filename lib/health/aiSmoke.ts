// lib/health/aiSmoke.ts
// Tiny live completions for health cron — catches retired models, quota, and key issues
// before users hit "connection issue" in chat.

import { getAIDirect } from "@/lib/ai";
import { getModelRoute, type UseCase } from "@/lib/ai/config";
import type { AIProvider } from "@/lib/ai/types";
import { logger } from "@/lib/logger";

const AI_SMOKE_TIMEOUT_MS = 20_000;

export type AiSmokeResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
  /** True when chat still works only via fallback */
  primaryFailed?: boolean;
  usedProvider?: string;
  usedModel?: string;
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
): Promise<{ ok: boolean; latencyMs: number; error?: string; model?: string }> {
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
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: shortenError(err),
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
  });

  if (route.fallbackProvider && route.fallbackModel) {
    const fallback = await tryProviderComplete(route.fallbackProvider, route.fallbackModel);
    if (fallback.ok) {
      return {
        ok: true,
        latencyMs: Date.now() - started,
        primaryFailed: true,
        usedProvider: route.fallbackProvider,
        usedModel: fallback.model || route.fallbackModel,
        error: `primary ${route.provider}/${route.model}: ${primary.error}`,
      };
    }

    return {
      ok: false,
      latencyMs: Date.now() - started,
      error:
        `primary ${route.provider}/${route.model}: ${primary.error}; ` +
        `fallback ${route.fallbackProvider}/${route.fallbackModel}: ${fallback.error}`,
    };
  }

  return {
    ok: false,
    latencyMs: Date.now() - started,
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
