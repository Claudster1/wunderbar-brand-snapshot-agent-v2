// lib/security/rateLimit.ts
// Rate limiter for API routes.
// Default: in-memory fixed window (per Vercel isolate).
// Optional: Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
//
// SECURITY: Prevents abuse of expensive operations (OpenAI calls, email sends, etc.)
// PRODUCT: Intake + finalize use per-report session keys so save-and-return gets a full
// budget to finish. Soft IP ceilings still stop botnet spam.

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
 * Check rate limit for a given identifier (IP, report session, etc.).
 * Sync in-memory path — prefer checkRateLimitAsync in API routes.
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
 * Prefer Upstash when configured; otherwise in-memory (per isolate).
 */
export async function checkRateLimitAsync(
  identifier: string,
  prefix: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { checkUpstashRateLimit } = await import("./upstashRateLimit");
  const distributed = await checkUpstashRateLimit(identifier, prefix, config);
  if (distributed) return distributed;
  return checkRateLimit(identifier, prefix, config);
}

/** Clear a bucket so save-and-return / resume starts with a fresh session budget. */
export function resetRateLimit(identifier: string, prefix: string): void {
  ensureCleanup();
  store.delete(`${prefix}:${identifier}`);
}

export async function resetRateLimitAsync(
  identifier: string,
  prefix: string,
): Promise<void> {
  resetRateLimit(identifier, prefix);
  const { resetUpstashRateLimit } = await import("./upstashRateLimit");
  await resetUpstashRateLimit(identifier, prefix);
}

const REPORT_SESSION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSessionReportId(value: unknown): value is string {
  return typeof value === "string" && REPORT_SESSION_UUID_RE.test(value.trim());
}

/** Prefer per-report session key; fall back to IP for pre-draft turns. */
export function sessionRateLimitId(
  reportId: string | null | undefined,
  clientIp: string,
): string {
  const id = typeof reportId === "string" ? reportId.trim() : "";
  if (isSessionReportId(id)) {
    return `report:${id}`;
  }
  return `ip:${clientIp}`;
}

/** Pull draft/report id from common intake / finalize body shapes. */
export function pickSessionReportId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  for (const key of ["reportId", "continuationReportId", "snapshotReportId", "base_snapshot_report_id"]) {
    const v = b[key];
    if (isSessionReportId(v)) return String(v).trim();
  }
  return null;
}

/**
 * When a user opens a saved draft (`?resume=`), grant a fresh chat + completion budget
 * for that report so they can finish even if an earlier visit depleted the window.
 */
export function refreshReportSessionBudgets(reportId: string): void {
  const id = typeof reportId === "string" ? reportId.trim() : "";
  if (!isSessionReportId(id)) return;
  const sessionId = `report:${id}`;
  for (const prefix of REPORT_SESSION_RATE_PREFIXES) {
    resetRateLimit(sessionId, prefix);
  }
}

const REPORT_SESSION_RATE_PREFIXES = [
  "brand-snapshot",
  "snapshot_transcript",
  "snapshot",
  "snapshot-plus-generate",
  "blueprint-generate",
  "blueprint-plus-generate",
  "report-generate-ai",
] as const;

export async function refreshReportSessionBudgetsAsync(reportId: string): Promise<void> {
  const id = typeof reportId === "string" ? reportId.trim() : "";
  if (!isSessionReportId(id)) return;
  const sessionId = `report:${id}`;
  await Promise.all(
    REPORT_SESSION_RATE_PREFIXES.map((prefix) => resetRateLimitAsync(sessionId, prefix)),
  );
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

/**
 * Per draft/report chat budget (keyed by reportId when present).
 * Covers Blueprint+ depth + clarifications + a full return visit in one window.
 */
export const CHAT_AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 120,
  windowSeconds: 86_400, // 24 hours — save-and-return same day still finishes
};

/** Soft IP ceiling so shared NAT / bots cannot burn infinite report keys. */
export const CHAT_IP_ABUSE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 400,
  windowSeconds: 3600, // 1 hour
};

/**
 * Wrap-up (transcript extract + scoring). Separate from chat so burning turns
 * never blocks results. Per-report key + soft IP abuse ceiling.
 */
export const COMPLETION_AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 80,
  windowSeconds: 86_400,
};

export const COMPLETION_IP_ABUSE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 120,
  windowSeconds: 3600,
};

/** @deprecated Prefer COMPLETION_AI_RATE_LIMIT */
export const FINALIZE_AI_RATE_LIMIT = COMPLETION_AI_RATE_LIMIT;

/**
 * Heavy report generation: Snapshot+, Blueprint, Blueprint+.
 */
export const REPORT_AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 40,
  windowSeconds: 86_400,
};

export const REPORT_IP_ABUSE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 3600,
};

/**
 * Refine / companion chat after purchase.
 */
export const REFINE_AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 80,
  windowSeconds: 3600,
};

/** Default AI profile for miscellaneous AI routes */
export const AI_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 40,
  windowSeconds: 180,
};

/** For general API endpoints */
export const GENERAL_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 120,
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
