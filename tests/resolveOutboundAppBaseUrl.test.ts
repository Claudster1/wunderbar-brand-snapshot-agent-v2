import { describe, expect, it, afterEach, vi } from "vitest";
import { resolveOutboundAppBaseUrl } from "@/lib/server/runtimeBaseUrl";

describe("resolveOutboundAppBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the request host over a localhost env var", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000");
    const req = new Request("https://preview.example/api/snapshot/lead-email", {
      headers: {
        host: "wunderbar-brand-snapshot-agent-git-b16dc1-claudster1s-projects.vercel.app",
        "x-forwarded-proto": "https",
      },
    });
    expect(resolveOutboundAppBaseUrl(req)).toBe(
      "https://wunderbar-brand-snapshot-agent-git-b16dc1-claudster1s-projects.vercel.app",
    );
  });

  it("uses VERCEL_URL when request host is missing and env is localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    expect(resolveOutboundAppBaseUrl()).toBe("https://my-app.vercel.app");
  });

  it("falls back to production app origin when nothing public is available", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveOutboundAppBaseUrl()).toBe("https://app.wunderbrand.ai");
  });
});
