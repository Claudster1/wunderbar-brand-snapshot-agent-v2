import { describe, expect, it } from "vitest";
import { isBillingOrQuotaError } from "@/lib/health/billingDetect";

describe("isBillingOrQuotaError", () => {
  it("detects OpenAI and Anthropic quota messages", () => {
    expect(
      isBillingOrQuotaError(
        "429 You have no credits remaining. Add credits to continue using the API",
      ),
    ).toBe(true);
    expect(
      isBillingOrQuotaError(
        '400 {"error":{"message":"Your credit balance is too low to access the Anthropic API"}}',
      ),
    ).toBe(true);
    expect(isBillingOrQuotaError("insufficient_quota")).toBe(true);
  });

  it("ignores model-not-found and generic errors", () => {
    expect(isBillingOrQuotaError('404 {"message":"model: claude-sonnet-4-20250514"}')).toBe(
      false,
    );
    expect(isBillingOrQuotaError("timeout")).toBe(false);
    expect(isBillingOrQuotaError(undefined)).toBe(false);
  });
});
