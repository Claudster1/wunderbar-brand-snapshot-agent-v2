// app/api/stripe/createCheckout/route.ts
// Stripe checkout session creation endpoint

import Stripe from "stripe";
import { PRICING } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
});

export async function POST(req: Request) {
  try {
    const { productKey, userId } = await req.json();

    const product = PRICING[productKey as keyof typeof PRICING];
    if (!product) {
      return new Response("Invalid product", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        product_key: productKey,
        user_id: userId
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return new Response("Unable to create checkout session", { status: 500 });
  }
}
