// app/api/brand-snapshot/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { wundySystemPrompt } from "../../../src/prompts/wundySystemPrompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error('[API] Invalid messages:', { messages, body });
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] Missing OPENAI_API_KEY - env check:', {
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
      });
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Filter out any system messages from frontend, we add our own
    const userMessages = messages.filter((msg: any) => msg.role !== 'system');
    
    // Prepend the system prompt
    const openAIMessages = [
      { role: "system", content: wundySystemPrompt },
      ...userMessages,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAIMessages as any,
      max_tokens: 1800,
      temperature: 0.6,
    });

    const content =
      completion.choices[0]?.message?.content ??
      "Sorry, I had trouble generating a response.";

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("[Brand Snapshot API] error:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code,
      status: err?.status,
    });
    
    let errorMessage = "There was an issue reaching the Brand Snapshot specialist. Please try again in a moment.";
    
    if (err?.message?.includes('API key') || err?.code === 'invalid_api_key') {
      errorMessage = "Server configuration error. Please contact support.";
    } else if (err?.message?.includes('rate limit') || err?.status === 429) {
      errorMessage = "Service is temporarily busy. Please try again in a moment.";
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
