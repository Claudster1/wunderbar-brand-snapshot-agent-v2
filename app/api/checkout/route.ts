// app/api/checkout/route.ts
import Stripe from "stripe";
import { PRICING } from "@/lib/pricing";
import { normalizeProductKey } from "@/lib/productIds";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { productKey, userId, metadata } = await req.json();
    const normalizedKey = normalizeProductKey(productKey);

    if (!normalizedKey) {
      return new Response("Invalid product", { status: 400 });
    }

    const product = PRICING[normalizedKey];
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
        product_key: normalizedKey,
        user_id: userId,
        ...(metadata ?? {}),
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
