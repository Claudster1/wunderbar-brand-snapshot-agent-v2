import { describe, expect, it } from "vitest";
import {
  CHECKOUT_BRAND_FIELD_KEY,
  STRIPE_SUBMIT_CUSTOM_TEXT_MAX,
  brandNameFromCheckoutSession,
  checkoutBrandPolicyMessage,
} from "@/lib/stripe/checkoutBrandField";

describe("brandNameFromCheckoutSession", () => {
  it("prefers metadata.brand_name", () => {
    expect(
      brandNameFromCheckoutSession({
        metadata: { brand_name: "Meta Brand" },
        custom_fields: [
          {
            key: CHECKOUT_BRAND_FIELD_KEY,
            type: "text",
            label: { type: "custom", custom: "Brand" },
            text: { value: "Field Brand" },
          },
        ],
      } as never),
    ).toBe("Meta Brand");
  });

  it("reads canonical custom field", () => {
    expect(
      brandNameFromCheckoutSession({
        metadata: {},
        custom_fields: [
          {
            key: CHECKOUT_BRAND_FIELD_KEY,
            type: "text",
            label: { type: "custom", custom: "Brand this purchase is for" },
            text: { value: " Acme Co " },
          },
        ],
      } as never),
    ).toBe("Acme Co");
  });

  it("falls back to a brand-keyed Payment Link field", () => {
    expect(
      brandNameFromCheckoutSession({
        metadata: null,
        custom_fields: [
          {
            key: "purchased_brand",
            type: "text",
            label: { type: "custom", custom: "One brand per Snapshot+" },
            text: { value: "Northlight" },
          },
        ],
      } as never),
    ).toBe("Northlight");
  });

  it("returns null when missing", () => {
    expect(brandNameFromCheckoutSession({ metadata: {}, custom_fields: [] })).toBeNull();
  });
});

describe("checkoutBrandPolicyMessage", () => {
  it("stays within Stripe's 50-character submit limit for every product", () => {
    const keys = [
      "snapshot_plus",
      "blueprint",
      "blueprint_plus",
      "snapshot_plus_refresh",
      "blueprint_refresh",
      null,
    ] as const;
    for (const key of keys) {
      const msg = checkoutBrandPolicyMessage(key);
      expect(msg.length).toBeLessThanOrEqual(STRIPE_SUBMIT_CUSTOM_TEXT_MAX);
      expect(msg.toLowerCase()).toMatch(/brand/);
    }
  });

  it("names Blueprint in the Blueprint message", () => {
    expect(checkoutBrandPolicyMessage("blueprint")).toBe(
      "One brand per Blueprint™. Sales final.",
    );
  });
});
