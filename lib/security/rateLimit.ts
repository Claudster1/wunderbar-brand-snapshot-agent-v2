// lib/security/rateLimit.ts
// In-memory rate limiter for API routes.
// Uses a sliding window approach. Suitable for single-instance deployments (Vercel serverless).
// For multi-instance/distributed deployments, upgrade to Upstash Redis rate limiting.
//
// SECURITY: Prevents abuse of expensive operations (OpenAI calls, email sends, etc.)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds to prevent memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 60_000);
  // Don't prevent process exit
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    (cleanupInterval as NodeJS.Timeout).unref();
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given identifier (IP, email, etc.)
 */
export function checkRateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup();

  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  // No entry or window expired — reset
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Window still active
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
      retryAfterSeconds: 0,
    };
  }

  // Rate limited
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  // Vercel
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  // Cloudflare
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  // Real IP
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  // Fallback
  return "unknown";
}

// ─── Pre-configured rate limit profiles ───

/** For expensive AI operations (OpenAI calls): 10 requests per minute */
export const AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/** For general API endpoints: 30 requests per minute */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowSeconds: 60,
};

/** For authentication/sensitive operations: 5 requests per minute */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

/** For email-sending operations: 3 requests per 5 minutes */
export const EMAIL_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowSeconds: 300,
};
