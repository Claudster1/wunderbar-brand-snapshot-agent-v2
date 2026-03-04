import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type AcEventPayload = {
  eventName: string;
  email?: string;
  tags?: string[];
  fields?: Record<string, string | number>;
};

function normalizePayload(raw: unknown): AcEventPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  if (!eventName) return null;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 20)
    : undefined;
  const fields =
    body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
      ? (body.fields as Record<string, string | number>)
      : undefined;

  return { eventName, email, tags, fields };
}

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "ac-event-relay", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  const webhookUrl =
    process.env.ACTIVECAMPAIGN_WEBHOOK_URL || process.env.ACTIVE_CAMPAIGN_WEBHOOK || "";
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "ActiveCampaign webhook is not configured." }, { status: 503 });
  }

  const payload = normalizePayload(await req.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: payload.eventName,
        email: payload.email,
        tags: payload.tags,
        fields: payload.fields,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("[AC Event Relay] Forward failed", {
      error: error instanceof Error ? error.message : String(error),
      eventName: payload.eventName,
    });
    return NextResponse.json({ ok: false, error: "Failed to forward AC event." }, { status: 502 });
  }
}
