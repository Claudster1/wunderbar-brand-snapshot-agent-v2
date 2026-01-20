import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: body.event,
      pillar: body.pillar,
    }),
  });

  return NextResponse.json({ ok: true });
}
