// lib/logger.ts
// ─────────────────────────────────────────────────────────────────
// Structured logging utility for production.
//
// In production (NODE_ENV=production):
//   - debug() is silenced
//   - info(), warn(), error() output structured JSON
//
// In development:
//   - All levels output in a readable format
//   - debug() is enabled
//
// USAGE:
//   import { logger } from "@/lib/logger";
//   logger.info("[Snapshot API] Report saved", { reportId });
//   logger.error("[Stripe Webhook] Payment failed", { sessionId, error: err.message });
//   logger.warn("[BenchmarkCollector] Low sample size", { sampleSize: 5 });
//   logger.debug("[AI] Response received", { provider, model, tokens });
// ─────────────────────────────────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function formatEntry(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    // Structured JSON for production log aggregation (Vercel, Datadog, etc.)
    return JSON.stringify({
      level: entry.level,
      msg: entry.message,
      ts: entry.timestamp,
      ...entry.data,
    });
  }

  // Human-readable for local development
  const dataStr = entry.data && Object.keys(entry.data).length > 0
    ? ` ${JSON.stringify(entry.data)}`
    : "";
  return `[${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  // Silence debug in production
  if (level === "debug" && IS_PRODUCTION) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log("debug", message, data),
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
};

export default logger;
