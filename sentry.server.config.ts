// sentry.server.config.ts
// Sentry configuration for server-side (API routes, SSR) error tracking.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Performance: sample 10% of server transactions
  tracesSampleRate: 0.1,

  // Don't send PII by default
  sendDefaultPii: false,

  environment: process.env.NODE_ENV,
});
