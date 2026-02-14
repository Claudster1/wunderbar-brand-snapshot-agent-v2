// lib/ai/index.ts
// ─────────────────────────────────────────────────────────────────
// Multi-provider AI abstraction layer.
//
// USAGE:
//   import { getAI } from "@/lib/ai";
//
//   // Simple completion
//   const result = await getAI("wundy_general").complete({
//     messages: [
//       { role: "system", content: "You are a brand advisor." },
//       { role: "user", content: "What is a brand archetype?" },
//     ],
//   });
//   console.log(result.content);
//
//   // With tools
//   const result = await getAI("wundy_report").complete({
//     messages,
//     tools: [supportToolDef],
//   });
//   if (result.hasToolCalls) { ... }
//
//   // With retry + automatic fallback
//   const result = await completeWithFallback("report_blueprint_plus", {
//     messages,
//   });
//
// ENV OVERRIDES:
//   AI_PROVIDER_WUNDY_GENERAL=gemini
//   AI_MODEL_WUNDY_GENERAL=gemini-2.0-flash
// ─────────────────────────────────────────────────────────────────

import type {
  AIProvider,
  AIProviderClient,
  CompletionOptions,
  CompletionResponse,
  ToolFollowUpOptions,
} from "./types";
import { getModelRoute, type UseCase } from "./config";
import { createOpenAIProvider } from "./providers/openai";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGeminiProvider } from "./providers/gemini";
import { logger } from "@/lib/logger";

// Re-export types for convenience
export type {
  AIProvider,
  AIProviderClient,
  ChatMessage,
  CompletionOptions,
  CompletionResponse,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ToolFollowUpOptions,
} from "./types";
export type { UseCase, ModelRoute } from "./config";
export { getModelRoute, getAllRoutes } from "./config";

// ─── Provider Factory ────────────────────────────────────────────

/** Cache provider instances to avoid re-creating clients */
const providerCache = new Map<string, AIProviderClient>();

function getProviderClient(provider: AIProvider, model: string): AIProviderClient {
  const cacheKey = `${provider}:${model}`;
  const cached = providerCache.get(cacheKey);
  if (cached) return cached;

  let client: AIProviderClient;
  switch (provider) {
    case "openai":
      client = createOpenAIProvider(model);
      break;
    case "anthropic":
      client = createAnthropicProvider(model);
      break;
    case "gemini":
      client = createGeminiProvider(model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  providerCache.set(cacheKey, client);
  return client;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Get an AI provider client for a specific use case.
 * Reads the routing config to determine which provider + model to use.
 *
 * @example
 * const ai = getAI("wundy_general");
 * const response = await ai.complete({ messages });
 */
export function getAI(useCase: UseCase): AIProviderClient {
  const route = getModelRoute(useCase);
  return getProviderClient(route.provider, route.model);
}

/**
 * Get an AI provider client directly by provider + model.
 * Use this when you need a specific provider regardless of routing config.
 *
 * @example
 * const claude = getAIDirect("anthropic", "claude-sonnet-4-20250514");
 */
export function getAIDirect(provider: AIProvider, model: string): AIProviderClient {
  return getProviderClient(provider, model);
}

/**
 * Complete a chat with automatic retry + fallback to backup provider.
 * This is the recommended way to call the AI layer from API routes.
 *
 * Flow:
 * 1. Try primary provider with retry
 * 2. If primary fails completely, try fallback provider
 * 3. If both fail, throw the last error
 *
 * @example
 * const response = await completeWithFallback("wundy_general", {
 *   messages: [{ role: "user", content: "Hello" }],
 * });
 */
export async function completeWithFallback(
  useCase: UseCase,
  options: CompletionOptions
): Promise<CompletionResponse> {
  const route = getModelRoute(useCase);
  const { withRetry } = await import("@/lib/openaiRetry");

  // Apply route defaults
  const opts: CompletionOptions = {
    ...options,
    temperature: options.temperature ?? route.temperature,
    maxTokens: options.maxTokens ?? route.maxTokens,
  };

  // ─── Try primary provider ──────────────────────────────────
  const primary = getProviderClient(route.provider, route.model);

  if (primary.isConfigured) {
    try {
      return await withRetry(
        () => primary.complete(opts),
        { maxRetries: 2, timeoutMs: route.timeoutMs ?? 25_000 }
      );
    } catch (err) {
      logger.warn("[AI] Primary provider failed", {
        provider: route.provider,
        model: route.model,
        error: err instanceof Error ? err.message : String(err),
      });
      // Fall through to fallback
    }
  } else {
    logger.warn("[AI] Primary provider not configured, trying fallback", { provider: route.provider });
  }

  // ─── Try fallback provider ─────────────────────────────────
  if (route.fallbackProvider && route.fallbackModel) {
    const fallback = getProviderClient(route.fallbackProvider, route.fallbackModel);

    if (fallback.isConfigured) {
      try {
        logger.info("[AI] Using fallback provider", { provider: route.fallbackProvider, model: route.fallbackModel });
        return await withRetry(
          () => fallback.complete(opts),
          { maxRetries: 2, timeoutMs: route.timeoutMs ?? 25_000 }
        );
      } catch (err) {
        logger.error("[AI] Fallback provider also failed", {
          provider: route.fallbackProvider,
          model: route.fallbackModel,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    } else {
      logger.warn("[AI] Fallback provider not configured", { provider: route.fallbackProvider });
    }
  }

  throw new Error(
    `[AI] No configured provider available for use case "${useCase}". ` +
    `Primary: ${route.provider} (${primary.isConfigured ? "configured" : "not configured"}), ` +
    `Fallback: ${route.fallbackProvider ?? "none"}`
  );
}

/**
 * Complete a tool follow-up with automatic retry.
 * Use after a tool call has been executed and you need the model to
 * compose a final response.
 */
export async function completeToolFollowUp(
  useCase: UseCase,
  options: ToolFollowUpOptions
): Promise<CompletionResponse> {
  const route = getModelRoute(useCase);
  const { withRetry } = await import("@/lib/openaiRetry");

  // Tool follow-ups must use the same provider as the original call
  const provider = getProviderClient(
    options.originalResponse.provider,
    options.originalResponse.model
  );

  return withRetry(
    () =>
      provider.completeWithToolResults({
        ...options,
        temperature: options.temperature ?? route.temperature,
        maxTokens: options.maxTokens ?? route.maxTokens,
      }),
    { maxRetries: 2, timeoutMs: route.timeoutMs ?? 25_000 }
  );
}
