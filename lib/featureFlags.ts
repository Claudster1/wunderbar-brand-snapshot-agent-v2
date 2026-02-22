// lib/featureFlags.ts
// Server-side feature flags / kill switch.
// Override via environment variables: FEATURE_FLAG_<NAME>=true|false
//
// Usage:
//   import { isFeatureEnabled, FEATURES } from "@/lib/featureFlags";
//   if (!isFeatureEnabled(FEATURES.AI_INSIGHTS)) return fallbackResponse;

import { logger } from "@/lib/logger";

export const FEATURES = {
  AI_INSIGHTS: "ai_insights",
  STRIPE_CHECKOUT: "stripe_checkout",
  ACTIVE_CAMPAIGN: "active_campaign",
  CALENDLY_WEBHOOK: "calendly_webhook",
  PDF_GENERATION: "pdf_generation",
  BENCHMARK_COLLECTION: "benchmark_collection",
  VOC_SURVEYS: "voc_surveys",
  BLUEPRINT_PLUS: "blueprint_plus",
} as const;

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES];

const DEFAULTS: Record<FeatureName, boolean> = {
  [FEATURES.AI_INSIGHTS]: true,
  [FEATURES.STRIPE_CHECKOUT]: true,
  [FEATURES.ACTIVE_CAMPAIGN]: true,
  [FEATURES.CALENDLY_WEBHOOK]: true,
  [FEATURES.PDF_GENERATION]: true,
  [FEATURES.BENCHMARK_COLLECTION]: true,
  [FEATURES.VOC_SURVEYS]: true,
  [FEATURES.BLUEPRINT_PLUS]: true,
};

/**
 * Check whether a feature is enabled.
 * Resolution order:
 *   1. Environment variable FEATURE_FLAG_<NAME> (case-insensitive "true"/"1" = on)
 *   2. Default from DEFAULTS map
 */
export function isFeatureEnabled(feature: FeatureName): boolean {
  const envKey = `FEATURE_FLAG_${feature.toUpperCase()}`;
  const envVal = process.env[envKey];

  if (envVal !== undefined) {
    const enabled = envVal === "true" || envVal === "1";
    return enabled;
  }

  return DEFAULTS[feature] ?? true;
}

/**
 * Guard wrapper — logs a warning and returns false when a feature is disabled.
 * Useful at the top of API routes as a kill switch.
 *
 * ```ts
 * if (!featureGuard(FEATURES.AI_INSIGHTS, "generate-ai")) {
 *   return NextResponse.json({ error: "Temporarily unavailable" }, { status: 503 });
 * }
 * ```
 */
export function featureGuard(feature: FeatureName, context?: string): boolean {
  const enabled = isFeatureEnabled(feature);
  if (!enabled) {
    logger.warn(`[FeatureFlag] ${feature} is DISABLED`, {
      feature,
      ...(context ? { context } : {}),
    });
  }
  return enabled;
}

/**
 * Get a snapshot of all feature flag states (useful for health/status endpoints).
 */
export function getAllFeatureFlags(): Record<FeatureName, boolean> {
  const flags = {} as Record<FeatureName, boolean>;
  for (const feature of Object.values(FEATURES)) {
    flags[feature] = isFeatureEnabled(feature);
  }
  return flags;
}
