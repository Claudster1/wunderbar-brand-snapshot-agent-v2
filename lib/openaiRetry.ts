// lib/openaiRetry.ts
// Retry wrapper for OpenAI API calls with exponential backoff and timeout.
// Handles transient errors (rate limits, network issues, server errors).
//
// Usage:
//   import { withRetry } from "@/lib/openaiRetry";
//   const completion = await withRetry(() => openai.chat.completions.create({...}));

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

interface RetryOptions {
  /** Max number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay cap in ms (default: 15000) */
  maxDelayMs?: number;
  /** Abort the entire operation after this many ms (default: 30000) */
  timeoutMs?: number;
}

class OpenAIRetryError extends Error {
  public readonly attempts: number;
  public readonly lastError: unknown;

  constructor(message: string, attempts: number, lastError: unknown) {
    super(message);
    this.name = "OpenAIRetryError";
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Execute an async function with retry + exponential backoff.
 * Designed for OpenAI API calls but works with any async operation.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 15_000,
    timeoutMs = 30_000,
  } = options;

  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check timeout before each attempt
    const elapsed = Date.now() - startTime;
    if (attempt > 0 && elapsed >= timeoutMs) {
      throw new OpenAIRetryError(
        `Operation timed out after ${elapsed}ms (${attempt} attempts)`,
        attempt,
        lastError
      );
    }

    try {
      // Race the function against the remaining timeout
      const remaining = timeoutMs - elapsed;
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`OpenAI call timed out after ${remaining}ms`)),
            remaining
          )
        ),
      ]);
      return result;
    } catch (err: any) {
      lastError = err;

      // Don't retry on the last attempt
      if (attempt >= maxRetries) break;

      // Only retry on transient/retryable errors
      const statusCode = err?.status ?? err?.response?.status;
      const isRetryable =
        RETRYABLE_STATUS_CODES.has(statusCode) ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        err?.code === "ENOTFOUND" ||
        err?.message?.includes("timed out") ||
        err?.message?.includes("network") ||
        err?.message?.includes("fetch failed");

      if (!isRetryable) {
        // Non-retryable error (400, 401, 403, etc.) — throw immediately
        throw err;
      }

      // Exponential backoff with jitter
      const baseDelay = initialDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * initialDelayMs;
      const delay = Math.min(baseDelay + jitter, maxDelayMs);

      // If rate-limited (429), use the Retry-After header if available
      const retryAfter = err?.headers?.get?.("retry-after");
      const retryDelay = retryAfter
        ? Math.min(Number(retryAfter) * 1000, maxDelayMs)
        : delay;

      console.warn(
        `[OpenAI Retry] Attempt ${attempt + 1}/${maxRetries} failed (${statusCode || err?.code || "unknown"}). Retrying in ${Math.round(retryDelay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new OpenAIRetryError(
    `All ${maxRetries + 1} attempts failed`,
    maxRetries + 1,
    lastError
  );
}
