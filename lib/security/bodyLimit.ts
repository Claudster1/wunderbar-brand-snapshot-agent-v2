// lib/security/bodyLimit.ts
// Request body size enforcement for API routes.
// Prevents abuse via oversized payloads.

import { NextResponse } from "next/server";

/**
 * Check if the request body exceeds a size limit.
 * Returns a 413 response if too large, or null if within limits.
 *
 * @param req - The incoming request
 * @param maxBytes - Maximum allowed body size in bytes (default: 50KB)
 */
export function checkBodySize(
  req: Request,
  maxBytes: number = 50 * 1024
): NextResponse | null {
  const contentLength = req.headers.get("content-length");

  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return NextResponse.json(
      { error: "Request too large." },
      { status: 413 }
    );
  }

  return null;
}

/** Common body size limits */
export const BODY_LIMITS = {
  /** Chat messages: 10KB max (single message) */
  CHAT_MESSAGE: 10 * 1024,
  /** Save report: 100KB max (includes all pillar data) */
  SAVE_REPORT: 100 * 1024,
  /** Email/simple forms: 2KB max */
  EMAIL_FORM: 2 * 1024,
  /** General API: 50KB max */
  DEFAULT: 50 * 1024,
} as const;
