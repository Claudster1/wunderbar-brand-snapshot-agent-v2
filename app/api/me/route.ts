// app/api/me/route.ts
// Returns the current verified-email session identity (or null), and lets the
// client sign out by clearing the session cookie. This is the trusted
// replacement for the spoofable localStorage email used by the dashboard.

import { NextRequest, NextResponse } from "next/server";
import {
  readSessionEmailFromCookieHeader,
  sessionCookieOptions,
  VERIFIED_SESSION_COOKIE,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = readSessionEmailFromCookieHeader(req.headers.get("cookie"));
  const res = NextResponse.json({ authenticated: Boolean(email), email: email ?? null });
  // Never cache identity.
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

// Sign out — clear the session cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VERIFIED_SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
