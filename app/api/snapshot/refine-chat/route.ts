// app/api/snapshot/refine-chat/route.ts
// API route for the refinement conversation with Wundy™.
// Uses a special system prompt that knows the user's existing report data.
// Uses multi-provider AI abstraction with automatic fallback.

import { NextResponse } from "next/server";
import { buildRefinementSystemPrompt } from "@/src/prompts/refinementSystemPrompt";
import { completeWithFallback, type ChatMessage } from "@/lib/ai";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "refine-chat", rateLimit: AI_RATE_LIMIT, maxBodySize: 50_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const { messages = [], reportContext } = body;

    if (!reportContext) {
      return NextResponse.json(
        { error: "Missing reportContext" },
        { status: 400 }
      );
    }

    // Build the refinement system prompt with the user's existing data
    const systemPrompt = buildRefinementSystemPrompt({
      businessName: reportContext.businessName || "Your Business",
      brandAlignmentScore: reportContext.brandAlignmentScore || 0,
      pillarScores: reportContext.pillarScores || {},
      primaryPillar: reportContext.primaryPillar || "positioning",
      contextCoverage: reportContext.contextCoverage || 60,
    });

    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await completeWithFallback("refine_chat", {
      messages: aiMessages,
    });

    return NextResponse.json({
      content:
        completion.content ||
        "Sorry, I had trouble processing your refinement. Please try again.",
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: unknown) {
    logger.error("[Refinement Chat API] Error", { error: err instanceof Error ? err.message : String(err) });
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process refinement conversation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
