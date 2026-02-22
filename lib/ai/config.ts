// lib/ai/config.ts
// ─────────────────────────────────────────────────────────────────
// Model routing configuration.
// Maps each use case to a provider + model combination.
// Override any route via environment variables for A/B testing.
//
// ENV OVERRIDES (optional):
//   AI_PROVIDER_WUNDY_GENERAL=gemini
//   AI_MODEL_WUNDY_GENERAL=gemini-2.0-flash
//   AI_PROVIDER_REPORT_GENERATION=anthropic
//   AI_MODEL_REPORT_GENERATION=claude-sonnet-4-20250514
// ─────────────────────────────────────────────────────────────────

import type { AIProvider } from "./types";

/** A route configuration: which provider + model to use */
export interface ModelRoute {
  provider: AIProvider;
  model: string;
  /** Fallback provider if primary is unavailable */
  fallbackProvider?: AIProvider;
  fallbackModel?: string;
  /** Default temperature for this use case */
  temperature?: number;
  /** Default max tokens */
  maxTokens?: number;
  /** Timeout in ms for retry wrapper */
  timeoutMs?: number;
}

/** Named use cases throughout the app */
export type UseCase =
  | "wundy_general"         // Wundy™ chat — general/FAQ mode (everyone)
  | "wundy_report"          // Wundy™ chat — report companion mode (paid tiers)
  | "assessment_chat"       // WunderBrand Snapshot™ assessment conversation
  | "refine_chat"           // Refinement conversation
  | "report_free"           // Free WunderBrand Snapshot™ report generation
  | "report_snapshot_plus"  // Snapshot+ report generation
  | "report_blueprint"      // Blueprint report generation
  | "report_blueprint_plus" // Blueprint+ report generation
  | "voc_analysis"          // VOC survey analysis
  | "refinement_engine"     // Pillar refinement engine
  | "wundy_marketing";      // Wundy™ marketing widget (external site embed)

/**
 * Default model routing table.
 * Each use case maps to a provider, model, and optional fallback.
 *
 * STRATEGY:
 * - Cost-sensitive routes (free tier, Wundy™ general) → cheapest viable option
 * - Quality-sensitive routes (paid reports) → best writing quality
 * - Tool-calling routes (Wundy™ with support) → OpenAI (most mature function calling)
 */
const DEFAULT_ROUTES: Record<UseCase, ModelRoute> = {
  // ─── Wundy™ Chat ────────────────────────────────────────────
  wundy_general: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-2.0-flash",
    temperature: 0.6,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },
  wundy_report: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "anthropic",
    fallbackModel: "claude-sonnet-4-20250514",
    temperature: 0.6,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },

  // ─── Assessment / Conversation ─────────────────────────────
  assessment_chat: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "anthropic",
    fallbackModel: "claude-sonnet-4-20250514",
    temperature: 0.6,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },
  refine_chat: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "anthropic",
    fallbackModel: "claude-sonnet-4-20250514",
    temperature: 0.6,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },

  // ─── Report Generation ─────────────────────────────────────
  // Model selection calibrated to tier pricing and content complexity:
  // - Free: cost-efficient model for basic diagnostics
  // - Snapshot+ ($497): high-quality model for strategic depth
  // - Blueprint ($997): premium model for operating-system-level output
  // - Blueprint+ ($1,997): best available model for enterprise-grade strategy
  report_free: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-2.0-flash",
    temperature: 0.5,
    maxTokens: 4000,
    timeoutMs: 30_000,
  },
  report_snapshot_plus: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    fallbackProvider: "openai",
    fallbackModel: "gpt-4o",
    temperature: 0.5,
    maxTokens: 12000,
    timeoutMs: 90_000,
  },
  report_blueprint: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    fallbackProvider: "openai",
    fallbackModel: "gpt-4o",
    temperature: 0.5,
    maxTokens: 16000,
    timeoutMs: 120_000,
  },
  report_blueprint_plus: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    fallbackProvider: "openai",
    fallbackModel: "gpt-4o",
    temperature: 0.5,
    maxTokens: 16000,
    timeoutMs: 180_000,
  },

  // ─── Analysis / Engine ─────────────────────────────────────
  voc_analysis: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.4,
    maxTokens: 2000,
    timeoutMs: 30_000,
  },
  refinement_engine: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "anthropic",
    fallbackModel: "claude-sonnet-4-20250514",
    temperature: 0.7,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },

  // ─── Marketing Widget ───────────────────────────────────────
  wundy_marketing: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallbackProvider: "gemini",
    fallbackModel: "gemini-2.0-flash",
    temperature: 0.6,
    maxTokens: 2000,
    timeoutMs: 25_000,
  },
};

/**
 * Get the model route for a given use case.
 * Checks environment variable overrides first, then falls back to defaults.
 *
 * Override format:
 *   AI_PROVIDER_{USE_CASE}=anthropic
 *   AI_MODEL_{USE_CASE}=claude-sonnet-4-20250514
 */
export function getModelRoute(useCase: UseCase): ModelRoute {
  const defaults = DEFAULT_ROUTES[useCase];
  const envKey = useCase.toUpperCase();

  // Check for env overrides
  const providerOverride = process.env[`AI_PROVIDER_${envKey}`] as AIProvider | undefined;
  const modelOverride = process.env[`AI_MODEL_${envKey}`];

  return {
    ...defaults,
    ...(providerOverride ? { provider: providerOverride } : {}),
    ...(modelOverride ? { model: modelOverride } : {}),
  };
}

/**
 * Get all configured routes (for debugging/admin).
 */
export function getAllRoutes(): Record<UseCase, ModelRoute> {
  const useCases = Object.keys(DEFAULT_ROUTES) as UseCase[];
  const result = {} as Record<UseCase, ModelRoute>;
  for (const uc of useCases) {
    result[uc] = getModelRoute(uc);
  }
  return result;
}
