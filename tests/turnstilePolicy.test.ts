import { describe, expect, it, afterEach } from "vitest";
import { isTurnstileEnforced } from "@/lib/security/turnstilePolicy";

describe("isTurnstileEnforced", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("skips Turnstile on Vercel preview by default", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    delete process.env.ENABLE_TURNSTILE_DEV;
    delete process.env.NEXT_PUBLIC_ENABLE_TURNSTILE_DEV;
    expect(isTurnstileEnforced()).toBe(false);
  });

  it("enforces Turnstile on Vercel production when site key is set", () => {
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    expect(isTurnstileEnforced()).toBe(true);
  });
});
