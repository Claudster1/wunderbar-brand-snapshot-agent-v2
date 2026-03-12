// POST /api/workbook/refine
// Uses OpenAI to polish/refine a specific section of the Brand Workbook.
// The customer can click "AI Refine" next to any section to get a polished version.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { withRetry } from "@/lib/openaiRetry";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getWorkbookEditability } from "@/lib/workbookAccess";

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

const LOCKED_DIAGNOSTIC_SECTIONS = new Set([
  "brand_alignment_score",
  "pillar_scores",
  "primary_pillar",
  "brand_archetype",
  "archetype_description",
  "archetype_application",
  "voice_attributes",
  "brand_voice_attributes",
]);

function fallbackRefine(content: string, businessName?: string): string {
  const normalized = content
    .split(/\s+/)
    .join(" ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
  if (!normalized) return content;
  const withPrefix =
    businessName && !normalized.toLowerCase().includes(businessName.toLowerCase())
      ? `${businessName}: ${normalized}`
      : normalized;
  return withPrefix.charAt(0).toUpperCase() + withPrefix.slice(1);
}

export async function POST(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "workbook-refine", rateLimit: AI_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  let requestBody: any = null;
  try {
    const body = await req.json();
    requestBody = body;
    const { section, content, businessName, context, reportId, email, archetypeName, voiceTraits } = body;

    if (!section || typeof section !== "string") {
      return NextResponse.json({ error: "section is required." }, { status: 400 });
    }
    if (LOCKED_DIAGNOSTIC_SECTIONS.has(section)) {
      return NextResponse.json(
        {
          error:
            "This field is diagnosis-derived and locked. Re-run the questionnaire to update underlying assessment results.",
        },
        { status: 403 }
      );
    }
    if (!content || typeof content !== "string" || content.length < 5) {
      return NextResponse.json({ error: "Content must be at least 5 characters." }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Content too long (max 5000 chars)." }, { status: 400 });
    }

    // In preview/sample mode, return a deterministic local refinement immediately.
    const isSampleMode =
      reportId === "preview" ||
      (typeof reportId === "string" && (reportId.startsWith("sample-") || reportId.startsWith("preview-")));
    if (isSampleMode) {
      return NextResponse.json({
        refined: fallbackRefine(content, businessName),
        section,
        fallback: true,
      });
    }

    // Check editability if reportId and email are provided
    let resolvedArchetype = typeof archetypeName === "string" ? archetypeName.trim() : "";
    let resolvedVoiceTraits = Array.isArray(voiceTraits)
      ? voiceTraits.map((v: unknown) => String(v).trim()).filter(Boolean)
      : [];

    if (reportId && email && supabaseAdmin) {
      const { data: workbook } = await supabaseAdmin
        .from("brand_workbook")
        .select("product_tier, created_at, finalized_at, brand_archetype, brand_voice_attributes")
        .eq("report_id", reportId)
        .single();

      if (workbook) {
        const editability = getWorkbookEditability({
          productTier: workbook.product_tier,
          createdAt: workbook.created_at,
          finalizedAt: workbook.finalized_at,
        });

        if (!editability.canEdit) {
          return NextResponse.json({
            error: "AI Refine is unavailable — this workbook is read-only.",
            reason: editability.reason,
          }, { status: 403 });
        }
      }
      if (workbook) {
        if (!resolvedArchetype && typeof workbook.brand_archetype === "string") {
          resolvedArchetype = workbook.brand_archetype.trim();
        }
        if (resolvedVoiceTraits.length === 0 && Array.isArray(workbook.brand_voice_attributes)) {
          resolvedVoiceTraits = workbook.brand_voice_attributes
            .map((v: unknown) => String(v).trim())
            .filter(Boolean);
        }
      }
    }

    const systemPrompt = SECTION_PROMPTS[section] || `You are a brand strategist. Refine this brand content to be clearer, more compelling, and more professional. Keep the core message and intent. Return only the refined text, no explanation or preamble.`;

    let userMessage = content;
    if (businessName) {
      userMessage = `Business: ${businessName}\n\nContent to refine:\n${content}`;
    }
    if (context) {
      userMessage += `\n\nAdditional context: ${context}`;
    }
    const styleGuard = [
      resolvedArchetype ? `Archetype: ${resolvedArchetype}` : "",
      resolvedVoiceTraits.length > 0 ? `Voice traits: ${resolvedVoiceTraits.join(", ")}` : "",
      "Constraint: keep style aligned to archetype and voice traits; stay specific, practical, and channel-ready.",
    ]
      .filter(Boolean)
      .join("\n");
    if (styleGuard) {
      userMessage += `\n\nStyle guardrails:\n${styleGuard}`;
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ refined: fallbackRefine(content, businessName), section, fallback: true });
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
    const content = typeof requestBody?.content === "string" ? requestBody.content : "";
    const businessName = typeof requestBody?.businessName === "string" ? requestBody.businessName : undefined;
    if (content.trim().length >= 5) {
      return NextResponse.json({
        refined: fallbackRefine(content, businessName),
        section: requestBody?.section || "generic",
        fallback: true,
      });
    }
    return NextResponse.json({ error: "Refinement failed." }, { status: 500 });
  }
}
