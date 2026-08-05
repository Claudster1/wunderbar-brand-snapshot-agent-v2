// Stripe endpoint signing secrets — Production (Live) vs Preview/Test can differ.

export type StripeWebhookSecretCandidate = {
  name: "STRIPE_WEBHOOK_SECRET" | "STRIPE_WEBHOOK_SECRET_TEST";
  secret: string;
};

/** Safe fingerprint for logs (never the full secret). */
export function stripeWebhookSecretFingerprint(secret: string): string {
  const s = secret.trim();
  if (!s) return "empty";
  return `${s.slice(0, 6)}…${s.slice(-4)} (len=${s.length})`;
}

export function getStripeWebhookSecrets(): StripeWebhookSecretCandidate[] {
  const out: StripeWebhookSecretCandidate[] = [];
  const primary = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const test = process.env.STRIPE_WEBHOOK_SECRET_TEST?.trim();

  if (primary) {
    out.push({ name: "STRIPE_WEBHOOK_SECRET", secret: primary });
  }
  if (test && test !== primary) {
    out.push({ name: "STRIPE_WEBHOOK_SECRET_TEST", secret: test });
  }
  return out;
}

export function stripeWebhookSecretsConfigured(): boolean {
  return getStripeWebhookSecrets().length > 0;
}
