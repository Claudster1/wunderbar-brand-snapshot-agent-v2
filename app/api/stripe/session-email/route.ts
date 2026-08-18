// app/api/stripe/session-email/route.ts
// Returns the customer email and name from a Stripe checkout session.
// Used by the success page to persist the email and pass name to the chat.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { logger } from "@/lib/logger";
import {
  createSessionToken,
  sessionCookieOptions,
  VERIFIED_SESSION_COOKIE,
} from "@/lib/auth/session";

// Only auto-establish a verified session from a checkout session that is both
// fully paid and recent — bounds replay risk if a session_id leaks later.
const CHECKOUT_SESSION_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function GET(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = await apiGuard(req, { routeId: "stripe-session-email", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email || session.customer_email;
    const name = session.customer_details?.name || null;

    if (!email) {
      return NextResponse.json({ email: null, name });
    }

    // Determine product tier from session metadata and generate a signed access token
    const metadata = session.metadata || {};
    const rawProduct = metadata.product || metadata.product_key || metadata.productKey || "";
    const resumeReportIdRaw = metadata.snapshot_id || metadata.snapshotId || "";
    const resumeReportId =
      typeof resumeReportIdRaw === "string" && /^[0-9a-f-]{36}$/i.test(resumeReportIdRaw.trim())
        ? resumeReportIdRaw.trim()
        : null;
    let tierToken: string | null = null;
    if (rawProduct && email) {
      try {
        const { createTierToken } = await import("@/lib/security/tierToken");
        tierToken = createTierToken(rawProduct, email);
      } catch (err) {
        logger.warn("[Session Email] Failed to create tier token", { error: err instanceof Error ? err.message : String(err) });
      }
    }

    const response = NextResponse.json({
      email: email.toLowerCase(),
      name,
      tierToken,
      resumeReportId,
    });

    // Post-checkout auto-login: Stripe already verified this email during
    // payment, so establish a verified-email session for the buyer — but only
    // for a genuinely completed, recently-paid session (bounds replay risk).
    const isPaid = session.payment_status === "paid" || session.status === "complete";
    const createdMs = typeof session.created === "number" ? session.created * 1000 : 0;
    const isRecent = createdMs > 0 && Date.now() - createdMs < CHECKOUT_SESSION_MAX_AGE_MS;
    if (isPaid && isRecent) {
      const token = createSessionToken(email.toLowerCase());
      if (token) {
        response.cookies.set(VERIFIED_SESSION_COOKIE, token, sessionCookieOptions());
      }
    }

    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (err) {
    logger.error("[Session Email] Stripe error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Unable to retrieve session" }, { status: 500 });
  }
}
