// lib/marketing/buildConfirmationUrl.ts
// Builds the absolute URL that goes into the AC welcome email as `{{marketing_confirmation_link}}`.

export function buildMarketingConfirmationUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://app.wunderbrand.ai";
  return `${base.replace(/\/$/, "")}/api/marketing/confirm?token=${encodeURIComponent(token)}`;
}
