import { describe, expect, it } from "vitest";
import {
  CHECKOUT_BRAND_FIELD_KEY,
  brandNameFromCheckoutSession,
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
