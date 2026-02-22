// POST /api/chat/marketing
// CORS-enabled Wundy™ chat endpoint for the marketing website widget.
// Uses the marketing-specific system prompt with appropriate UTMs.

import { NextRequest, NextResponse } from "next/server";
import { wundyMarketingPrompt } from "@/src/prompts/wundyMarketingPrompt";
import {
  completeWithFallback,
  type ChatMessage,
} from "@/lib/ai";
import { sanitizeString } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";

const ALLOWED_ORIGINS = (process.env.MARKETING_WIDGET_ORIGINS || "https://wunderbardigital.com,https://www.wunderbardigital.com")
  .split(",")
  .map((o) => o.trim());

const WIDGET_API_KEY = process.env.MARKETING_WIDGET_API_KEY;

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin === o || o === "*");
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Widget-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function isAuthorized(req: NextRequest): boolean {
  if (!WIDGET_API_KEY) return true;
  const key = req.headers.get("x-widget-key") || "";
  return key === WIDGET_API_KEY;
}

// Rate limiting: simple in-memory sliding window per IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

// Prune rate buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateBuckets) {
    if (val.resetAt < now) rateBuckets.delete(key);
  }
}, 60_000);

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: cors },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { messages } = body as {
      messages?: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400, headers: cors },
      );
    }

    if (messages.length > 40) {
      return NextResponse.json(
        { error: "Conversation too long. Please start a new chat." },
        { status: 400, headers: cors },
      );
    }

    const sanitizedMessages = messages.map((m) =>
      m.role === "user" && typeof m.content === "string"
        ? { ...m, content: sanitizeString(m.content) }
        : m,
    );

    const aiMessages: ChatMessage[] = [
      { role: "system", content: wundyMarketingPrompt },
      ...sanitizedMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await completeWithFallback("wundy_marketing", {
      messages: aiMessages,
    });

    const content =
      completion.content || "Sorry, I had trouble with that. Could you try asking again?";

    return NextResponse.json({ content }, { headers: cors });
  } catch (err) {
    logger.error("[Marketing Widget] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500, headers: cors },
    );
  }
}
