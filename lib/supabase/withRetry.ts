// lib/supabase/withRetry.ts
// Retry wrapper for Supabase operations that may fail due to transient issues
// (network blips, connection resets, brief Supabase outages).

import { logger } from "@/lib/logger";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 200,
  maxDelayMs: 5000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function isTransientError(error: unknown, retryableStatuses: number[]): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;

  if (typeof err.code === "string") {
    const transientCodes = [
      "ECONNRESET",
      "ECONNREFUSED",
      "ETIMEDOUT",
      "EPIPE",
      "EAI_AGAIN",
      "FETCH_ERROR",
    ];
    if (transientCodes.includes(err.code as string)) return true;
  }

  if (typeof err.status === "number" && retryableStatuses.includes(err.status)) return true;

  if (typeof err.message === "string") {
    const msg = (err.message as string).toLowerCase();
    if (
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("socket hang up") ||
      msg.includes("econnreset")
    ) {
      return true;
    }
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a Supabase operation with exponential-backoff retry.
 *
 * Usage:
 * ```ts
 * const { data, error } = await withRetry(() =>
 *   supabase.from("reports").select("*").eq("id", reportId).single()
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  label: string = "supabase",
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await operation();

      // Supabase client returns { data, error } — check for retryable error status
      if (result && typeof result === "object" && "error" in result) {
        const supaResult = result as { error: { code?: string; message?: string; status?: number } | null };
        if (
          supaResult.error &&
          isTransientError(supaResult.error, opts.retryableStatuses) &&
          attempt < opts.maxAttempts
        ) {
          lastError = supaResult.error;
          const delay = Math.min(
            opts.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100,
            opts.maxDelayMs
          );
          logger.warn(`[withRetry:${label}] Transient error, retrying (${attempt}/${opts.maxAttempts})`, {
            delay: Math.round(delay),
            error: supaResult.error.message || supaResult.error.code || "unknown",
          });
          await sleep(delay);
          continue;
        }
      }

      return result;
    } catch (thrown) {
      lastError = thrown;
      if (!isTransientError(thrown, opts.retryableStatuses) || attempt === opts.maxAttempts) {
        throw thrown;
      }

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100,
        opts.maxDelayMs
      );
      logger.warn(`[withRetry:${label}] Exception, retrying (${attempt}/${opts.maxAttempts})`, {
        delay: Math.round(delay),
        error: thrown instanceof Error ? thrown.message : String(thrown),
      });
      await sleep(delay);
    }
  }

  throw lastError;
}
