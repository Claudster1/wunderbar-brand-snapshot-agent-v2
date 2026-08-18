// lib/security/upstashRateLimit.ts
// Optional distributed rate-limit backend. When UPSTASH_* env is unset,
// callers fall back to the in-memory store in rateLimit.ts.

import { Redis } from "@upstash/redis";
import type { RateLimitConfig, RateLimitResult } from "./rateLimit";
import { logger } from "@/lib/logger";

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redis = null;
    return null;
  }
  try {
    redis = new Redis({ url, token });
  } catch (err) {
    logger.warn("[rateLimit] Upstash init failed; using memory", {
      error: err instanceof Error ? err.message : String(err),
    });
    redis = null;
  }
  return redis;
}

export function isDistributedRateLimitEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function bucketKey(prefix: string, identifier: string): string {
  return `rl:${prefix}:${identifier}`;
}

/** Fixed-window counter in Redis (consistent across Vercel isolates). */
export async function checkUpstashRateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig,
): Promise<RateLimitResult | null> {
  const client = getRedis();
  if (!client) return null;

  const key = bucketKey(prefix, identifier);
  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, config.windowSeconds);
    }
    const ttl = await client.ttl(key);
    const retryAfterSeconds = ttl > 0 ? ttl : config.windowSeconds;
    const resetAt = Date.now() + retryAfterSeconds * 1000;

    if (count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
      retryAfterSeconds: 0,
    };
  } catch (err) {
    logger.warn("[rateLimit] Upstash check failed; falling back to memory", {
      error: err instanceof Error ? err.message : String(err),
      prefix,
    });
    return null;
  }
}

export async function resetUpstashRateLimit(
  identifier: string,
  prefix: string,
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(bucketKey(prefix, identifier));
  } catch (err) {
    logger.warn("[rateLimit] Upstash reset failed", {
      error: err instanceof Error ? err.message : String(err),
      prefix,
    });
  }
}
