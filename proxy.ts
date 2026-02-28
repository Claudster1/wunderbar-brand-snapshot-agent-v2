// proxy.ts
// ─────────────────────────────────────────────────────────────────
// Edge-level proxy for request filtering and security.
// Runs on Vercel Edge Runtime BEFORE any API route or page renders.
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_PATHS = [
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wp-includes",
  "/xmlrpc.php",
  "/.env",
  "/.git",
  "/phpmyadmin",
  "/admin/config",
  "/actuator",
  "/debug",
  "/cgi-bin",
  "/vendor",
  "/telescope",
  "/.well-known/security.txt",
];

const EXACT_BLOCKED = new Set([
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/.env",
  "/.env.local",
  "/.env.production",
  "/phpmyadmin",
  "/administrator",
]);

const SUSPICIOUS_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /scanner/i,
  /exploit/i,
];

const ALLOWED_ORIGINS = new Set(
  [
    "https://app.wunderbrand.ai",
    "https://app.brandsnapshot.ai",
    "https://wunderbardigital.com",
    "https://www.wunderbardigital.com",
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean)
);

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

const CSRF_EXEMPT_PREFIXES = [
  "/api/analytics",
  "/api/stripe/webhook",
  "/api/calendly/webhook",
  "/api/cron/",
  "/api/health",
  "/api/test/",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const lowerPath = pathname.toLowerCase();

  if (EXACT_BLOCKED.has(lowerPath)) return new NextResponse(null, { status: 404 });

  for (const blocked of BLOCKED_PATHS) {
    if (lowerPath.startsWith(blocked) && blocked !== "/.well-known/security.txt") {
      return new NextResponse(null, { status: 404 });
    }
  }

  const userAgent = request.headers.get("user-agent") || "";
  for (const pattern of SUSPICIOUS_UA_PATTERNS) {
    if (pattern.test(userAgent)) return new NextResponse(null, { status: 403 });
  }

  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
    !CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const origin = request.headers.get("origin");
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json({ error: "Forbidden — origin not allowed" }, { status: 403 });
    }
  }

  if (pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (!isNaN(size) && size > 512_000) {
        return NextResponse.json({ error: "Request too large" }, { status: 413 });
      }
    }

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const contentType = request.headers.get("content-type") || "";
      const validTypes = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "text/plain",
      ];
      if (contentType && !validTypes.some((t) => contentType.includes(t))) {
        return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
      }
    }
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api/")) {
    const CACHEABLE_API_ROUTES = [
      "/api/snapshot/get",
      "/api/history",
      "/api/user-tier",
      "/api/score-history",
      "/api/refresh-eligibility",
    ];
    const isCacheable = CACHEABLE_API_ROUTES.some((r) => pathname.startsWith(r));
    if (!isCacheable) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
    }
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/wp-admin/:path*",
    "/wp-login/:path*",
    "/.env/:path*",
    "/phpmyadmin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
