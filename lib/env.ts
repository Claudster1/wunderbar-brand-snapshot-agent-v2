// lib/env.ts
// Environment variable validation — surfaces missing config early
// instead of mysterious runtime crashes deep in API routes.

type EnvRule = {
  key: string;
  required: boolean;
  label: string;
};

const RULES: EnvRule[] = [
  // ─── Supabase ───
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, label: "Supabase URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, label: "Supabase anon key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, label: "Supabase service role key" },
  { key: "SUPABASE_SECRET_KEY", required: false, label: "Supabase secret key (fallback)" },

  // ─── AI ───
  { key: "OPENAI_API_KEY", required: true, label: "OpenAI API key" },

  // ─── Stripe ───
  { key: "STRIPE_SECRET_KEY", required: true, label: "Stripe secret key" },
  { key: "STRIPE_WEBHOOK_SECRET", required: true, label: "Stripe webhook secret" },
  { key: "STRIPE_PRICE_SNAPSHOT_PLUS", required: true, label: "Stripe price ID: Snapshot+" },
  { key: "STRIPE_PRICE_BLUEPRINT", required: true, label: "Stripe price ID: Blueprint" },
  { key: "STRIPE_PRICE_BLUEPRINT_PLUS", required: true, label: "Stripe price ID: Blueprint+" },

  // ─── App ───
  { key: "NEXT_PUBLIC_BASE_URL", required: true, label: "App base URL" },

  // ─── ActiveCampaign ───
  { key: "ACTIVE_CAMPAIGN_API_URL", required: false, label: "ActiveCampaign API URL" },
  { key: "ACTIVE_CAMPAIGN_API_KEY", required: false, label: "ActiveCampaign API key" },

  // ─── Security ───
  { key: "NEXT_PUBLIC_TURNSTILE_SITE_KEY", required: false, label: "Turnstile site key" },
  { key: "TURNSTILE_SECRET_KEY", required: false, label: "Turnstile secret key" },
  { key: "ADMIN_API_KEY", required: false, label: "Admin API key" },
  { key: "CRON_SECRET", required: false, label: "Cron secret" },
  { key: "CALENDLY_WEBHOOK_SECRET", required: false, label: "Calendly webhook secret" },

  // ─── Monitoring ───
  { key: "NEXT_PUBLIC_SENTRY_DSN", required: false, label: "Sentry DSN" },
];

export interface EnvStatus {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvStatus {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const rule of RULES) {
    const value = process.env[rule.key];
    if (!value || value.trim() === "") {
      if (rule.required) {
        missing.push(`${rule.key} (${rule.label})`);
      } else {
        warnings.push(`${rule.key} (${rule.label})`);
      }
    }
  }

  // Supabase needs at least one of the two key variants
  const hasSupabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!hasSupabaseKey) {
    missing.push(
      "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY (at least one required)"
    );
  }

  // Warn if Stripe keys look like test keys in production
  if (process.env.NODE_ENV === "production") {
    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    if (stripeKey.startsWith("sk_test_")) {
      warnings.push("STRIPE_SECRET_KEY appears to be a test key in production!");
    }
    for (const priceKey of ["STRIPE_PRICE_SNAPSHOT_PLUS", "STRIPE_PRICE_BLUEPRINT", "STRIPE_PRICE_BLUEPRINT_PLUS"]) {
      const val = process.env[priceKey] || "";
      if (val.startsWith("price_") && val.length < 20) {
        warnings.push(`${priceKey} looks suspiciously short — verify it's correct`);
      }
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

/**
 * Log env validation results on first import.
 * In production, missing required vars log an error.
 * In development, they log a warning.
 */
let _validated = false;
export function ensureEnv(): void {
  if (_validated) return;
  _validated = true;

  const { valid, missing, warnings } = validateEnv();
  const isProd = process.env.NODE_ENV === "production";

  if (warnings.length > 0 && !isProd) {
    console.warn(
      `[env] Optional vars not set: ${warnings.join(", ")}`
    );
  }

  // Surface test-key warnings even in production
  if (isProd && warnings.length > 0) {
    const criticalWarnings = warnings.filter(w => w.includes("test key") || w.includes("suspiciously"));
    if (criticalWarnings.length > 0) {
      console.error(`[env] CRITICAL warnings:\n  - ${criticalWarnings.join("\n  - ")}`);
    }
  }

  if (!valid) {
    const msg = `[env] Missing required environment variables:\n  - ${missing.join("\n  - ")}`;
    if (isProd) {
      console.error(msg);
    } else {
      console.warn(msg);
    }
  }
}
