import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const tags: string[] = [];

  if (body.event === "RESULTS_VIEWED") {
    tags.push("snapshot:viewed-results");
    if (body.meta?.returnVisit) {
      tags.push("snapshot:return-visit");
    }
  }

  if (body.event === "UPGRADE_CLICKED") {
    tags.push("snapshot:clicked-upgrade");
  }

  if (body.event === "SNAPSHOT_COMPLETED") {
    tags.push("snapshot:completed");
  }

  await fetch(process.env.ACTIVE_CAMPAIGN_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: body.event,
      ...body.meta,
      tags,
    }),
  });

  return NextResponse.json({ ok: true });
}
