// app/api/brand-snapshot/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { wundySystemPrompt } from "@/src/prompts/wundySystemPrompt";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⛑️ Supabase client for saving reports
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
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

      // 🧪 Basic validation
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

      // Generate unique report ID
      const reportId = randomUUID();

      // 🎯 Insert into Supabase table
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
        console.error("❌ Insert error:", error);
        return NextResponse.json(
          { error: "Database insert failed", details: error.message },
          { status: 500 }
        );
      }

      // 🎉 Success — return the created report ID
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error. Missing API key." },
        { status: 500 }
      );
    }

    // Insert system prompt at the beginning
    const openAIMessages = [
      { role: "system", content: wundySystemPrompt },
      ...messages,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAIMessages,
      temperature: 0.6,
      max_tokens: 2000,
    });

    const content =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I had trouble creating your Brand Snapshot. Please try again.";

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("[Brand Snapshot API] error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "There was an issue reaching the Brand Snapshot specialist. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
