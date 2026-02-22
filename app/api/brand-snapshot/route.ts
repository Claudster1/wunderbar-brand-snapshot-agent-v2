// app/api/brand-snapshot/route.ts
// Assessment conversation + report save endpoint.
// Uses multi-provider AI abstraction with automatic fallback.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { wundySystemPrompt } from "@/src/prompts/wundySystemPrompt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import { completeWithFallback, type ChatMessage } from "@/lib/ai";

function getSupabaseClient() {
  return supabaseAdmin;
}

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "brand-snapshot", rateLimit: AI_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    
    // Check if this is a report save request (has brand_alignment_score)
    if (body.brand_alignment_score !== undefined || body.brandAlignmentScore !== undefined) {
      // This is a report save request
      const {
        user_email,
        user_name,
        brand_alignment_score,
        pillar_scores,
        pillar_insights,
        recommendations,
        website_notes,
        full_report,
        // Also support camelCase variants
        email,
        userName,
        brandAlignmentScore,
        pillarScores,
        pillarInsights,
        websiteNotes,
        fullReport,
      } = body;

      // Normalize field names (support both snake_case and camelCase)
      const finalEmail = user_email || email;
      const finalUserName = user_name || userName;
      const finalBrandAlignmentScore = brand_alignment_score || brandAlignmentScore;
      const finalPillarScores = pillar_scores || pillarScores;
      const finalPillarInsights = pillar_insights || pillarInsights;
      const finalRecommendations = recommendations || {};
      const finalWebsiteNotes = website_notes || websiteNotes;
      const finalFullReport = full_report || fullReport || {};

      if (!finalEmail) {
        return NextResponse.json(
          { error: "Missing required field: user_email or email" },
          { status: 400 }
        );
      }

      if (!finalBrandAlignmentScore || !finalPillarScores) {
        return NextResponse.json(
          { error: "Missing required fields: brand_alignment_score and pillar_scores" },
          { status: 400 }
        );
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        return NextResponse.json(
          { error: "Database not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
          { status: 500 }
        );
      }

      const reportId = randomUUID();

      const { data, error } = await supabase
        .from("brand_snapshot_reports")
        .insert([
          {
            report_id: reportId,
            user_name: finalUserName ?? null,
            email: finalEmail,
            brand_alignment_score: finalBrandAlignmentScore,
            pillar_scores: finalPillarScores,
            pillar_insights: finalPillarInsights || {},
            recommendations: finalRecommendations,
            website_notes: finalWebsiteNotes ?? null,
            full_report: finalFullReport,
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error("Insert error", { error: error.message });
        return NextResponse.json(
          { error: "Database insert failed", details: error.message },
          { status: 500 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json(
        {
          success: true,
          report_id: reportId,
          redirectUrl: `${baseUrl}/report/${reportId}`,
        },
        { status: 200 }
      );
    }

    // Otherwise, treat as chat/conversation request
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    // Build universal messages
    const aiMessages: ChatMessage[] = [
      { role: "system", content: wundySystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await completeWithFallback("assessment_chat", {
      messages: aiMessages,
    });

    return NextResponse.json({
      content:
        completion.content ||
        "Sorry, I had trouble creating your WunderBrand Snapshot™. Please try again.",
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: any) {
    logger.error("[WunderBrand Snapshot™ API] error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      {
        error:
          err?.message ||
          "There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
