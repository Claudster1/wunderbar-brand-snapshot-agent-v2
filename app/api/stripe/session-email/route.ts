// app/api/stripe/session-email/route.ts
// Returns the customer email from a Stripe checkout session.
// Used by the success page to persist the email in localStorage.

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

    if (!email) {
      return NextResponse.json({ email: null });
    }

    return NextResponse.json({ email: email.toLowerCase() });
  } catch (err) {
    console.error("[Session Email] Stripe error:", err);
    return NextResponse.json({ error: "Unable to retrieve session" }, { status: 500 });
  }
}
