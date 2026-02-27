import * as Sentry from "@sentry/nextjs";

const baseConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  environment: process.env.NODE_ENV,
} as const;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init(baseConfig);
    return;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(baseConfig);
  }
}

export const onRequestError = Sentry.captureRequestError;
