// lib/security/apiGuard.ts
// Unified API protection: rate limiting + request size validation + standardized error responses.
// Import and call at the top of any API route handler.

import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  RateLimitConfig,
  GENERAL_RATE_LIMIT,
} from "./rateLimit";

export interface ApiGuardConfig {
  /** Rate limit configuration (defaults to GENERAL_RATE_LIMIT) */
  rateLimit?: RateLimitConfig;
  /** Route identifier for rate limit bucketing (e.g., "wundy", "snapshot") */
  routeId: string;
  /** Maximum request body size in bytes (default: 100KB) */
  maxBodySize?: number;
}

export interface ApiGuardResult {
  /** Whether the request passed all checks */
  passed: boolean;
  /** Pre-built error response if checks failed (return this from your handler) */
  errorResponse?: NextResponse;
  /** Client IP address (for logging without PII) */
  clientIp: string;
}

/**
 * Run security checks on an incoming API request.
 * Returns { passed: true } if ok, or { passed: false, errorResponse } to return immediately.
 *
 * Usage:
 * ```ts
 * const guard = apiGuard(req, { routeId: "wundy", rateLimit: AI_RATE_LIMIT });
 * if (!guard.passed) return guard.errorResponse;
 * ```
 */
export function apiGuard(
  req: Request,
  config: ApiGuardConfig
): ApiGuardResult {
  const clientIp = getClientIp(req);
  const rateConfig = config.rateLimit ?? GENERAL_RATE_LIMIT;

  // ─── Rate limiting ───
  const rl = checkRateLimit(clientIp, config.routeId, rateConfig);
  if (!rl.allowed) {
    return {
      passed: false,
      clientIp,
      errorResponse: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateConfig.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
          },
        }
      ),
    };
  }

  // ─── Request size check (for POST/PUT/PATCH) ───
  const contentLength = req.headers.get("content-length");
  const maxSize = config.maxBodySize ?? 100_000; // 100KB default
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return {
      passed: false,
      clientIp,
      errorResponse: NextResponse.json(
        { error: "Request body too large." },
        { status: 413 }
      ),
    };
  }

  return { passed: true, clientIp };
}

/**
 * Create a standardized error response that doesn't leak internal details.
 */
export function safeErrorResponse(
  publicMessage: string,
  status: number = 500,
  internalError?: unknown
): NextResponse {
  // Log internal details server-side only
  if (internalError) {
    const msg =
      internalError instanceof Error
        ? internalError.message
        : String(internalError);
    console.error(`[API Error] ${publicMessage}: ${msg}`);
  }

  return NextResponse.json({ error: publicMessage }, { status });
}
