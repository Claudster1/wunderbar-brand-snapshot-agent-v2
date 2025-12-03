// app/api/brand-snapshot/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { wundySystemPrompt } from "@/src/prompts/wundySystemPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
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
