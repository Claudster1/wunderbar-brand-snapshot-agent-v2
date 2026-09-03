import { afterEach, describe, expect, it } from "vitest";
import {
  productKeyFromStripePriceId,
  normalizeStripeProductKey,
  productKeyFromMetadata,
} from "@/lib/stripe/resolveCheckoutProductKey";
import {
  createPurchaseAccessToken,
  verifyPurchaseAccessToken,
  PURCHASE_ACCESS_TTL_MS,
} from "@/lib/security/purchaseAccessLink";
import { buildPurchaseConfirmationEmail } from "@/lib/email/purchaseConfirmationEmail";

const ORIGINAL = {
  snap: process.env.STRIPE_PRICE_SNAPSHOT_PLUS,
  blue: process.env.STRIPE_PRICE_BLUEPRINT,
  plus: process.env.STRIPE_PRICE_BLUEPRINT_PLUS,
};

afterEach(() => {
  if (ORIGINAL.snap === undefined) delete process.env.STRIPE_PRICE_SNAPSHOT_PLUS;
  else process.env.STRIPE_PRICE_SNAPSHOT_PLUS = ORIGINAL.snap;
  if (ORIGINAL.blue === undefined) delete process.env.STRIPE_PRICE_BLUEPRINT;
  else process.env.STRIPE_PRICE_BLUEPRINT = ORIGINAL.blue;
  if (ORIGINAL.plus === undefined) delete process.env.STRIPE_PRICE_BLUEPRINT_PLUS;
  else process.env.STRIPE_PRICE_BLUEPRINT_PLUS = ORIGINAL.plus;
});

describe("resolveCheckoutProductKey", () => {
  it("maps env price IDs", () => {
    process.env.STRIPE_PRICE_SNAPSHOT_PLUS = "price_snap_test";
    process.env.STRIPE_PRICE_BLUEPRINT = "price_blue_test";
    process.env.STRIPE_PRICE_BLUEPRINT_PLUS = "price_plus_test";
    expect(productKeyFromStripePriceId("price_snap_test")).toBe("snapshot_plus");
    expect(productKeyFromStripePriceId("price_blue_test")).toBe("blueprint");
    expect(productKeyFromStripePriceId("price_plus_test")).toBe("blueprint_plus");
    expect(productKeyFromStripePriceId("price_unknown")).toBeNull();
  });

  it("reads metadata product_key", () => {
    expect(productKeyFromMetadata({ product_key: "blueprint_plus" })).toBe("blueprint_plus");
    expect(normalizeStripeProductKey("snapshot-plus")).toBe("snapshot_plus");
  });
});

describe("purchaseAccessLink", () => {
  it("creates a 90-day claim token for paid chat tiers", () => {
    const token = createPurchaseAccessToken({
      email: "Buyer@Example.com",
      tier: "snapshot_plus",
      brand: "Acme",
      firstName: "Alex",
    });
    expect(token).toBeTruthy();
    const verified = verifyPurchaseAccessToken(token);
    expect(verified.valid).toBe(true);
    if (!verified.valid) return;
    expect(verified.email).toBe("buyer@example.com");
    expect(verified.tier).toBe("snapshot-plus");
    expect(verified.brand).toBe("Acme");
    expect(verified.firstName).toBe("Alex");
    expect(PURCHASE_ACCESS_TTL_MS).toBeGreaterThan(30 * 24 * 60 * 60 * 1000);
  });

  it("rejects free tier tokens", () => {
    expect(
      createPurchaseAccessToken({ email: "a@b.com", tier: "snapshot" }),
    ).toBeNull();
  });
});

describe("purchaseConfirmationEmail", () => {
  it("reinforces purchase and includes access + dashboard URLs", () => {
    const built = buildPurchaseConfirmationEmail({
      tier: "blueprint",
      firstName: "Sam",
      accessUrl: "https://app.example/api/access/claim?token=abc",
      dashboardUrl: "https://app.example/dashboard",
      brandName: "Northlight",
      amountPaidLabel: "$997",
    });
    expect(built.subject.toLowerCase()).toMatch(/brand strategy|blueprint/);
    expect(built.text).toContain("https://app.example/api/access/claim?token=abc");
    expect(built.text).toContain("https://app.example/dashboard");
    expect(built.html).toContain("Northlight");
    expect(built.html).toContain("$997");
    expect(built.html.toLowerCase()).toMatch(/smart move|activation-ready|chose/);
  });
});
