import { NextResponse } from "next/server";
import { fireACEvent } from "@/lib/fireACEvent";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, primaryPillar, alignmentScore, stage, tag } = body || {};

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  await fireACEvent({
    email,
    eventName: "test_ac_trigger",
    tags: tag ? [tag] : undefined,
    fields: {
      primary_pillar: primaryPillar,
      brand_alignment_score: alignmentScore,
      brand_stage: stage,
    },
  });

  return NextResponse.json({ ok: true });
}
