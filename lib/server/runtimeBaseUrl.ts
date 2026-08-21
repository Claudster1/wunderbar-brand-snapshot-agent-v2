import { headers } from "next/headers";

export async function resolveBaseUrlFromHeaders(): Promise<string | null> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  if (!host) return null;
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Server-side `fetch` to the same Next process: Node often resolves `localhost` to IPv6 (::1)
 * while `next dev` listens on IPv4 first — requests can hang or fail. Force IPv4 loopback.
 */
export function normalizeLoopbackHostnameForServerFetch(baseUrl: string): string {
  try {
    const u = new URL(baseUrl);
    if (u.hostname === "localhost" || u.hostname === "[::1]" || u.hostname === "::1") {
      u.hostname = "127.0.0.1";
    }
    return u.origin;
  } catch {
    return baseUrl;
  }
}

/** Base URL for same-origin API calls from Server Components (dev + prod). */
export async function resolveRuntimeBaseUrlForServerFetch(): Promise<string> {
  const requestBaseUrl = await resolveBaseUrlFromHeaders();
  if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || "3000";
    const raw =
      requestBaseUrl?.trim() ||
      process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
      `http://127.0.0.1:${port}`;
    return normalizeLoopbackHostnameForServerFetch(raw);
  }
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    requestBaseUrl ||
    "http://127.0.0.1:3000";
  return normalizeLoopbackHostnameForServerFetch(raw);
}

function isLoopbackOrigin(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      host === "::1" ||
      host.endsWith(".localhost")
    );
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function normalizePublicOrigin(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto).origin;
  } catch {
    return null;
  }
}

function baseUrlFromRequest(req: Request): string | null {
  try {
    const host =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim() ||
      "";
    if (!host) return null;
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    return normalizePublicOrigin(`${proto}://${host}`);
  } catch {
    return null;
  }
}

/**
 * Absolute origin for links in emails / CRM (must be reachable by the recipient).
 * Prefer the current request host (preview or prod), then VERCEL_URL, then public env —
 * and never fall through to a localhost env var when running on a deployed host.
 */
export function resolveOutboundAppBaseUrl(req?: Request): string {
  const fromRequest = req ? baseUrlFromRequest(req) : null;
  if (fromRequest && !isLoopbackOrigin(fromRequest)) {
    return fromRequest;
  }

  const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercelHost && !isLoopbackOrigin(`https://${vercelHost}`)) {
    return `https://${vercelHost}`;
  }

  for (const candidate of [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]) {
    const origin = normalizePublicOrigin(candidate);
    if (origin && !isLoopbackOrigin(origin)) {
      return origin;
    }
  }

  // Local development only — allow loopback so emails in `next dev` still link somewhere.
  if (process.env.NODE_ENV !== "production" && fromRequest) {
    return fromRequest;
  }

  return "https://app.wunderbrand.ai";
}
