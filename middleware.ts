// middleware.ts
// ─────────────────────────────────────────────────────────────────
// Edge-level middleware for request filtering and security.
// Runs on Vercel Edge Runtime BEFORE any API route or page renders.
//
// Responsibilities:
// 1. Block suspicious/malicious request patterns
// 2. Enforce request size limits at the edge (before body parsing)
// 3. Add security headers to API responses
// 4. Block known scanner/bot paths to reduce noise
// ─────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Blocked Path Patterns ────────────────────────────────────
// Common vulnerability scanner paths that waste resources
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
  "/.well-known/security.txt", // allow this one — it's legit
];

// Paths that should be blocked outright (scanner noise)
const EXACT_BLOCKED = new Set([
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/.env",
  "/.env.local",
  "/.env.production",
  "/phpmyadmin",
  "/admin",
  "/administrator",
]);

// ─── Suspicious User-Agent patterns ───────────────────────────
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // ─── 1. Block scanner/bot paths ──────────────────────────────
  const lowerPath = pathname.toLowerCase();

  if (EXACT_BLOCKED.has(lowerPath)) {
    return new NextResponse(null, { status: 404 });
  }

  for (const blocked of BLOCKED_PATHS) {
    if (lowerPath.startsWith(blocked) && blocked !== "/.well-known/security.txt") {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ─── 2. Block suspicious user agents ─────────────────────────
  const userAgent = request.headers.get("user-agent") || "";
  for (const pattern of SUSPICIOUS_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // ─── 3. Block oversized API request bodies ───────────────────
  // Content-Length check at the edge (before body is parsed)
  if (pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      // Block requests > 500KB (generous limit — individual routes enforce tighter limits)
      if (!isNaN(size) && size > 512_000) {
        return NextResponse.json(
          { error: "Request too large" },
          { status: 413 }
        );
      }
    }

    // Block non-JSON content types on POST/PUT/PATCH to API routes
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const contentType = request.headers.get("content-type") || "";
      // Allow JSON, form data, and multipart (for file uploads)
      const validTypes = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "text/plain", // some fetch libraries use this
      ];
      if (contentType && !validTypes.some((t) => contentType.includes(t))) {
        return NextResponse.json(
          { error: "Unsupported content type" },
          { status: 415 }
        );
      }
    }
  }

  // ─── 4. Add security headers to API responses ────────────────
  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    // Routes that manage their own caching (read-only, safe to cache)
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

// ─── Route Matcher ────────────────────────────────────────────
// Apply middleware to API routes and known scanner targets.
// Skip static files, images, and Next.js internals for performance.
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match common scanner targets
    "/wp-admin/:path*",
    "/wp-login/:path*",
    "/.env/:path*",
    "/phpmyadmin/:path*",
    // Match all page routes (but not static assets)
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
