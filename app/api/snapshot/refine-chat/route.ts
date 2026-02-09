// app/api/snapshot/refine-chat/route.ts
// API route for the refinement conversation with Wundy.
// Uses a special system prompt that knows the user's existing report data.

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildRefinementSystemPrompt } from "@/src/prompts/refinementSystemPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], reportContext } = body;

    if (!reportContext) {
      return NextResponse.json(
        { error: "Missing reportContext" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error. Missing API key." },
        { status: 500 }
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

    const openAIMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAIMessages,
      temperature: 0.6,
      max_tokens: 2000,
    });

    const content =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I had trouble processing your refinement. Please try again.";

    return NextResponse.json({ content });
  } catch (err: unknown) {
    console.error("[Refinement Chat API] Error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process refinement conversation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
