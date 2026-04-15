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
