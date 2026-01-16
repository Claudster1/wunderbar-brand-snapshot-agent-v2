// app/api/purchase/lookup/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId: string };
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const sb = supabaseServer();
    const { data, error } = await sb
      .from("brand_snapshot_purchases")
      .select("id, user_email, product_sku, status, fulfilled, pdf_url, created_at")
      .eq("stripe_checkout_session_id", sessionId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Return minimal info (avoid exposing too much)
    return NextResponse.json({
      purchase: {
        id: data.id,
        userEmail: data.user_email,
        productSku: data.product_sku,
        status: data.status,
        fulfilled: data.fulfilled,
        pdfUrl: data.pdf_url,
        createdAt: data.created_at,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
