// lib/security/apiGuard.ts
// Unified API protection: rate limiting + request size validation + standardized error responses.
// Import and call at the top of any API route handler.

import { NextResponse } from "next/server";
import {
  getClientIp,
  RateLimitConfig,
  RateLimitResult,
  GENERAL_RATE_LIMIT,
  sessionRateLimitId,
} from "./rateLimit";

export interface ApiGuardConfig {
  /** Rate limit configuration (defaults to GENERAL_RATE_LIMIT) */
  rateLimit?: RateLimitConfig;
  /** Route identifier for rate limit bucketing (e.g., "wundy", "snapshot") */
  routeId: string;
  /** Maximum request body size in bytes (default: 100KB) */
  maxBodySize?: number;
  /**
   * Optional draft/report UUID — when set, the primary budget is per-report so
   * save-and-return does not share a depleted IP window with a prior visit.
   */
  sessionReportId?: string | null;
  /** Soft IP abuse ceiling (checked in addition to the session budget). */
  abuseRateLimit?: RateLimitConfig;
  /** Bucket name for the IP abuse check (defaults to `${routeId}-ip`). */
  abuseRouteId?: string;
}

export type ApiGuardResult =
  | {
      passed: true;
      clientIp: string;
    }
  | {
      passed: false;
      clientIp: string;
      /** Pre-built error response — always set when passed is false */
      errorResponse: NextResponse;
    };

function deniedResponse(
  rl: RateLimitResult,
  rateConfig: RateLimitConfig,
): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(rl.retryAfterSeconds),
        "X-RateLimit-Limit": String(rateConfig.maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
      },
    },
  );
}

/**
 * Run security checks on an incoming API request.
 * Returns { passed: true } if ok, or { passed: false, errorResponse } to return immediately.
 *
 * Uses Upstash when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set;
 * otherwise in-memory (per serverless isolate).
 *
 * Usage:
 * ```ts
 * const guard = await apiGuard(req, { routeId: "wundy", rateLimit: AI_RATE_LIMIT });
 * if (!guard.passed) return guard.errorResponse;
 * ```
 */
export async function apiGuard(
  req: Request,
  config: ApiGuardConfig
): Promise<ApiGuardResult> {
  const clientIp = getClientIp(req);
  const rateConfig = config.rateLimit ?? GENERAL_RATE_LIMIT;
  const sessionId = sessionRateLimitId(config.sessionReportId, clientIp);

  // ─── Primary budget (per-report when available, else IP) ───
  const { checkRateLimitAsync } = await import("./rateLimit");
  const rl = await checkRateLimitAsync(sessionId, config.routeId, rateConfig);
  if (!rl.allowed) {
    return {
      passed: false as const,
      clientIp,
      errorResponse: deniedResponse(rl, rateConfig),
    };
  }

  // ─── Soft IP abuse ceiling (always by raw IP) ───
  if (config.abuseRateLimit) {
    const abuseRoute = config.abuseRouteId ?? `${config.routeId}-ip`;
    const abuseRl = await checkRateLimitAsync(clientIp, abuseRoute, config.abuseRateLimit);
    if (!abuseRl.allowed) {
      return {
        passed: false as const,
        clientIp,
        errorResponse: deniedResponse(abuseRl, config.abuseRateLimit),
      };
    }
  }

  // ─── Request size check (for POST/PUT/PATCH) ───
  const contentLength = req.headers.get("content-length");
  const maxSize = config.maxBodySize ?? 100_000; // 100KB default
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return {
      passed: false as const,
      clientIp,
      errorResponse: NextResponse.json(
        { error: "Request body too large." },
        { status: 413 }
      ),
    };
  }

  return { passed: true as const, clientIp };
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
