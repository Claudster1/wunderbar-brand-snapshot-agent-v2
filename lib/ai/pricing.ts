// Approximate USD per 1M tokens for cost estimates (update when vendors change list prices).
// Sources: public list pricing as of 2026 — treat as directional for P&L, not invoices.

export type ModelTokenRates = {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
};

/** Fallback when a model id is unknown — mid-tier ballpark. */
const DEFAULT_RATES: ModelTokenRates = {
  inputPerMillionUsd: 3,
  outputPerMillionUsd: 15,
};

const MODEL_RATES: Record<string, ModelTokenRates> = {
  // OpenAI
  "gpt-4o-mini": { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.6 },
  "gpt-4o": { inputPerMillionUsd: 2.5, outputPerMillionUsd: 10 },
  // Anthropic (2026 list rates — directional for P&L)
  "claude-sonnet-5": { inputPerMillionUsd: 2, outputPerMillionUsd: 10 },
  "claude-sonnet-4-6": { inputPerMillionUsd: 3, outputPerMillionUsd: 15 },
  "claude-sonnet-4-5-20250929": { inputPerMillionUsd: 3, outputPerMillionUsd: 15 },
  "claude-opus-5": { inputPerMillionUsd: 5, outputPerMillionUsd: 25 },
  "claude-opus-4-7": { inputPerMillionUsd: 5, outputPerMillionUsd: 25 },
  "claude-haiku-4-5-20251001": { inputPerMillionUsd: 1, outputPerMillionUsd: 5 },
  // Gemini
  "gemini-2.0-flash": { inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 },
  "gemini-2.0-flash-001": { inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 },
};

export function ratesForModel(model: string): ModelTokenRates {
  const exact = MODEL_RATES[model];
  if (exact) return exact;
  const key = Object.keys(MODEL_RATES).find((k) => model.startsWith(k));
  return key ? MODEL_RATES[key] : DEFAULT_RATES;
}

export function estimateCostUsd(params: {
  model: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
}): number | null {
  const input = params.inputTokens ?? 0;
  const output = params.outputTokens ?? 0;
  if (input <= 0 && output <= 0) return null;
  const rates = ratesForModel(params.model);
  const usd =
    (input / 1_000_000) * rates.inputPerMillionUsd +
    (output / 1_000_000) * rates.outputPerMillionUsd;
  return Math.round(usd * 1_000_000) / 1_000_000;
}
