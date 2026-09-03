import { describe, expect, it } from "vitest";
import {
  createTierToken,
  normalizeAccessTier,
  validateTierToken,
} from "@/lib/security/tierToken";

describe("normalizeAccessTier", () => {
  it("maps underscore Stripe keys to chat slugs", () => {
    expect(normalizeAccessTier("snapshot_plus")).toBe("snapshot-plus");
    expect(normalizeAccessTier("blueprint_plus")).toBe("blueprint-plus");
    expect(normalizeAccessTier("blueprint")).toBe("blueprint");
  });

  it("maps refresh SKUs to parent chat tiers", () => {
    expect(normalizeAccessTier("snapshot_plus_refresh")).toBe("snapshot-plus");
    expect(normalizeAccessTier("blueprint-refresh")).toBe("blueprint");
  });
});

describe("tierToken create/validate", () => {
  it("stores hyphenated tier so success-page URL matches", () => {
    const token = createTierToken("snapshot_plus", "Buyer@Example.com");
    const result = validateTierToken(token);
    expect(result.valid).toBe(true);
    expect(result.tier).toBe("snapshot-plus");
    expect(result.email).toBe("buyer@example.com");
  });

  it("accepts legacy underscore payload when compared via normalizeAccessTier", () => {
    // Simulate an older token that stored snapshot_plus literally
    const crypto = require("crypto") as typeof import("crypto");
    const secret =
      process.env.TIER_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "dev-tier-token-secret";
    const payloadB64 = Buffer.from(
      JSON.stringify({ tier: "snapshot_plus", email: "a@b.com", ts: Date.now() }),
    ).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
    const legacy = `${payloadB64}.${sig}`;
    const result = validateTierToken(legacy);
    expect(result.valid).toBe(true);
    expect(result.tier).toBe("snapshot-plus");
    expect(normalizeAccessTier(result.tier)).toBe(normalizeAccessTier("snapshot-plus"));
  });
});
