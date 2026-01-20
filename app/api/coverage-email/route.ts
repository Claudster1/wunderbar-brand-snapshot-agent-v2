import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, coverage, missing } = await req.json();

  const tag =
    coverage < 60
      ? "Coverage:Low"
      : coverage < 80
      ? "Coverage:Mid"
      : null;

  if (!tag) return NextResponse.json({ skipped: true });

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      tag,
      missing_context: missing.join(", "),
    }),
  });

  return NextResponse.json({ sent: true });
}
