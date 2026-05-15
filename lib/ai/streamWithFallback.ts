import type { CompletionOptions } from "@/lib/ai/types";
import { getModelRoute, type UseCase } from "@/lib/ai/config";
import { streamOpenAIChat } from "@/lib/ai/providers/openai";
import { logger } from "@/lib/logger";

/**
 * Stream chat completion tokens. Falls back to a single buffered completion if streaming fails.
 */
export async function* streamWithFallback(
  useCase: UseCase,
  options: CompletionOptions,
): AsyncGenerator<string> {
  const route = getModelRoute(useCase);
  const opts: CompletionOptions = {
    ...options,
    temperature: options.temperature ?? route.temperature,
    maxTokens: options.maxTokens ?? route.maxTokens,
  };

  if (route.provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      yield* streamOpenAIChat(route.model, opts);
      return;
    } catch (err) {
      logger.warn("[AI] OpenAI stream failed, falling back to buffered completion", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const { completeWithFallback } = await import("@/lib/ai");
  const buffered = await completeWithFallback(useCase, opts);
  if (buffered.content) yield buffered.content;
}
