// tests/marketingConfirmationToken.test.ts
// Unit tests for the HMAC-signed marketing-confirmation token helper.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  signMarketingConfirmationToken,
  verifyMarketingConfirmationToken,
  isMarketingConfirmationConfigured,
} from "../lib/marketing/confirmationToken";

const TEST_SECRET = "test-secret-needs-to-be-at-least-16-chars";

describe("marketing confirmation token", () => {
  let originalSecret: string | undefined;

  beforeEach(() => {
    originalSecret = process.env.MARKETING_CONFIRM_SECRET;
    process.env.MARKETING_CONFIRM_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.MARKETING_CONFIRM_SECRET;
    } else {
      process.env.MARKETING_CONFIRM_SECRET = originalSecret;
    }
  });

  it("round-trips a valid token", () => {
    const token = signMarketingConfirmationToken({
      email: "user@example.com",
      reportId: "abc-123",
      contentOptIn: "both",
      source: "diagnostic_lead_capture",
    });
    expect(token).not.toBeNull();
    const payload = verifyMarketingConfirmationToken(token!);
    expect(payload).toMatchObject({
      email: "user@example.com",
      reportId: "abc-123",
      contentOptIn: "both",
      source: "diagnostic_lead_capture",
    });
    expect(payload!.expiresAt).toBeGreaterThan(Date.now());
  });

  it("normalizes email to lowercase", () => {
    const token = signMarketingConfirmationToken({
      email: "  User@Example.COM  ",
      reportId: "abc-123",
    });
    const payload = verifyMarketingConfirmationToken(token!);
    expect(payload!.email).toBe("user@example.com");
  });

  it("returns null when the secret is missing", () => {
    delete process.env.MARKETING_CONFIRM_SECRET;
    expect(isMarketingConfirmationConfigured()).toBe(false);
    const token = signMarketingConfirmationToken({
      email: "user@example.com",
      reportId: "abc-123",
    });
    expect(token).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const token = signMarketingConfirmationToken({
      email: "user@example.com",
      reportId: "abc-123",
    })!;
    const [, sig] = token.split(".");
    // Re-encode a different email but keep the original signature.
    const tampered =
      Buffer.from(JSON.stringify({ email: "attacker@example.com", reportId: "abc-123", expiresAt: Date.now() + 1000 }))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "") +
      "." +
      sig;
    expect(verifyMarketingConfirmationToken(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = signMarketingConfirmationToken({
      email: "user@example.com",
      reportId: "abc-123",
    })!;
    process.env.MARKETING_CONFIRM_SECRET = "different-secret-needs-to-be-at-least-16-chars";
    expect(verifyMarketingConfirmationToken(token)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signMarketingConfirmationToken({
      email: "user@example.com",
      reportId: "abc-123",
      ttlMs: -1000, // already expired
    })!;
    expect(verifyMarketingConfirmationToken(token)).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(verifyMarketingConfirmationToken("")).toBeNull();
    expect(verifyMarketingConfirmationToken("not-a-token")).toBeNull();
    expect(verifyMarketingConfirmationToken("a.b.c")).toBeNull();
  });
});
