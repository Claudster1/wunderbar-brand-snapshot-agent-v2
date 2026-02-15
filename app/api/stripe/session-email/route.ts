// app/api/stripe/session-email/route.ts
// Returns the customer email and name from a Stripe checkout session.
// Used by the success page to persist the email and pass name to the chat.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function GET(req: NextRequest) {
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
    let tierToken: string | null = null;
    if (rawProduct && email) {
      try {
        const { createTierToken } = await import("@/lib/security/tierToken");
        tierToken = createTierToken(rawProduct, email);
      } catch (err) {
        console.warn("[Session Email] Failed to create tier token:", err);
      }
    }

    return NextResponse.json({ email: email.toLowerCase(), name, tierToken });
  } catch (err) {
    console.error("[Session Email] Stripe error:", err);
    return NextResponse.json({ error: "Unable to retrieve session" }, { status: 500 });
  }
}
