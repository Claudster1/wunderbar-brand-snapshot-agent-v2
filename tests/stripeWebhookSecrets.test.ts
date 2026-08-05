import { afterEach, describe, expect, it } from "vitest";
import {
  getStripeWebhookSecrets,
  stripeWebhookSecretFingerprint,
  stripeWebhookSecretsConfigured,
} from "@/lib/stripeWebhookSecrets";

const ORIGINAL = {
  primary: process.env.STRIPE_WEBHOOK_SECRET,
  test: process.env.STRIPE_WEBHOOK_SECRET_TEST,
};

afterEach(() => {
  if (ORIGINAL.primary === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = ORIGINAL.primary;
  if (ORIGINAL.test === undefined) delete process.env.STRIPE_WEBHOOK_SECRET_TEST;
  else process.env.STRIPE_WEBHOOK_SECRET_TEST = ORIGINAL.test;
});

describe("stripeWebhookSecrets", () => {
  it("fingerprints without exposing the full secret", () => {
    expect(stripeWebhookSecretFingerprint("whsec_abcdefghijklmnop")).toBe(
      "whsec_…mnop (len=22)",
    );
  });

  it("returns primary and optional distinct test secret", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_primary_value_xxxxx";
    process.env.STRIPE_WEBHOOK_SECRET_TEST = "whsec_test_value_yyyyyy";
    expect(getStripeWebhookSecrets()).toEqual([
      { name: "STRIPE_WEBHOOK_SECRET", secret: "whsec_primary_value_xxxxx" },
      { name: "STRIPE_WEBHOOK_SECRET_TEST", secret: "whsec_test_value_yyyyyy" },
    ]);
    expect(stripeWebhookSecretsConfigured()).toBe(true);
  });

  it("dedupes when test matches primary", () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_same";
    process.env.STRIPE_WEBHOOK_SECRET_TEST = "whsec_same";
    expect(getStripeWebhookSecrets()).toHaveLength(1);
  });
});
