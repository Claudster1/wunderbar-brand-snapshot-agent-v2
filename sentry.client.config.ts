// sentry.client.config.ts
// Sentry configuration for client-side error tracking.
// This file is automatically loaded by @sentry/nextjs.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring: sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session replay: capture 1% of sessions, 100% of error sessions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors (user's connection)
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // Browser extensions
    "ResizeObserver loop",
    // User cancelled
    "AbortError",
  ],

  // Don't send PII (email, name) by default
  sendDefaultPii: false,

  // Tag with environment
  environment: process.env.NODE_ENV,
});
