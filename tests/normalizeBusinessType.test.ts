import { describe, expect, it } from "vitest";
import {
  normalizeBusinessTypeLabel,
  normalizeBusinessTypeOrGeneral,
} from "@/lib/intake/normalizeBusinessType";

describe("normalizeBusinessTypeLabel", () => {
  it("maps common aliases onto canonical types", () => {
    expect(normalizeBusinessTypeLabel("service_b2b")).toBe("service_b2b");
    expect(normalizeBusinessTypeLabel("B2B service company")).toBe("service_b2b");
    expect(normalizeBusinessTypeLabel("Business consulting / agency")).toBe("service_b2b");
    expect(normalizeBusinessTypeLabel("Local / personal services")).toBe("local_service");
    expect(normalizeBusinessTypeLabel("e-commerce / DTC")).toBe("ecommerce");
    expect(normalizeBusinessTypeLabel("Shopify product brand")).toBe("ecommerce");
    expect(normalizeBusinessTypeLabel("Retail or in-person")).toBe("retail");
    expect(normalizeBusinessTypeLabel("SaaS / software / app")).toBe("saas");
  });

  it("does not treat bare 'app' inside unrelated words as SaaS", () => {
    expect(normalizeBusinessTypeLabel("appointment booking for salons")).toBeNull();
  });

  it("leaves legacy ambiguous services chip unresolved", () => {
    expect(normalizeBusinessTypeLabel("Services / consulting")).toBeNull();
  });

  it("falls back to general for PDF/results paths", () => {
    expect(normalizeBusinessTypeOrGeneral(null)).toBe("general");
    expect(normalizeBusinessTypeOrGeneral("mystery")).toBe("general");
    expect(normalizeBusinessTypeOrGeneral("local_service")).toBe("local_service");
  });
});
