// POST /api/workbook/refine
// Uses OpenAI to polish/refine a specific section of the Brand Workbook.
// The customer can click "AI Refine" next to any section to get a polished version.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { withRetry } from "@/lib/openaiRetry";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

const SECTION_PROMPTS: Record<string, string> = {
  positioning_statement: `You are a brand strategist. Refine this positioning statement to be clear, compelling, and differentiated. Keep the core message but make it stronger. Return only the refined text, no explanation.`,

  unique_value_proposition: `You are a brand strategist. Refine this unique value proposition to be concise, benefit-driven, and memorable. Focus on what makes this brand uniquely valuable to their audience. Return only the refined text.`,

  competitive_differentiation: `You are a brand strategist. Sharpen this competitive differentiation to be specific, defensible, and compelling. Avoid generic claims. Return only the refined text.`,

  elevator_pitch_30s: `You are a brand strategist. Refine this 30-second elevator pitch. It should be conversational, hook the listener in the first sentence, and end with a clear value statement. Keep it under 75 words. Return only the refined pitch.`,

  elevator_pitch_60s: `You are a brand strategist. Refine this 60-second elevator pitch. It should expand on the value proposition with a brief story or proof point. Keep it under 150 words. Return only the refined pitch.`,

  elevator_pitch_email: `You are a brand strategist. Refine this email-ready pitch. It should work as the core paragraph in an outreach email — professional, personable, and action-oriented. Keep it under 100 words. Return only the refined text.`,

  tone_guidelines: `You are a brand voice expert. Refine these tone guidelines to be actionable and clear. Include specific guidance on when to adjust tone (e.g., social vs. formal communications). Return only the refined guidelines.`,

  archetype_description: `You are a brand strategist. Refine this brand archetype description to be vivid, relatable, and actionable. Explain how the archetype manifests in the brand's communication and customer experience. Return only the refined text.`,

  archetype_application: `You are a brand strategist. Refine this section on how to apply the brand archetype. Make it practical with specific examples of how the archetype should influence content, visuals, and customer interactions. Return only the refined text.`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, content, businessName, context } = body;

    if (!section || typeof section !== "string") {
      return NextResponse.json({ error: "section is required." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.length < 5) {
      return NextResponse.json({ error: "Content must be at least 5 characters." }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Content too long (max 5000 chars)." }, { status: 400 });
    }

    const systemPrompt = SECTION_PROMPTS[section] || `You are a brand strategist. Refine this brand content to be clearer, more compelling, and more professional. Keep the core message and intent. Return only the refined text, no explanation or preamble.`;

    let userMessage = content;
    if (businessName) {
      userMessage = `Business: ${businessName}\n\nContent to refine:\n${content}`;
    }
    if (context) {
      userMessage += `\n\nAdditional context: ${context}`;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await withRetry(
      () =>
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      { maxRetries: 2, timeoutMs: 25_000 }
    );

    const refined = completion.choices[0]?.message?.content?.trim() || "";

    if (!refined) {
      return NextResponse.json({ error: "AI returned empty result." }, { status: 502 });
    }

    return NextResponse.json({ refined, section });
  } catch (err) {
    logger.error("[Workbook Refine] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Refinement failed." }, { status: 500 });
  }
}
