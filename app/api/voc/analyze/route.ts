// POST /api/voc/analyze — Generate VOC analysis from survey responses
// Uses multi-provider AI abstraction with automatic fallback.
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { completeWithFallback } from "@/lib/ai";
import { apiGuard } from "@/lib/security/apiGuard";
import { AUTH_RATE_LIMIT } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const VOC_ANALYSIS_PROMPT = `You are a brand perception analyst. You've received anonymous customer survey responses about a business. Your job is to synthesize these into actionable brand intelligence.

Analyze the responses and return a JSON object with:

{
  "npsScore": <average NPS score as number>,
  "npsCategory": "Promoter-heavy" | "Mixed" | "Detractor-heavy",
  "topWords": ["top 8-10 most frequently mentioned descriptive words across all responses"],
  "perceptionSummary": "A 2-3 sentence synthesis of how customers perceive this brand — what the dominant narrative is",
  "alignmentGaps": {
    "positioning": "How customers describe what the company does vs. how the company positions itself (or null if aligned)",
    "messaging": "Whether customers use the same language the company uses (or null if aligned)",
    "credibility": "What trust signals customers mention vs. what the company emphasizes (or null if aligned)",
    "visibility": "How customers discover the brand vs. where the company invests (or null if aligned)",
    "conversion": "What drives purchase decisions vs. what the company's CTAs emphasize (or null if aligned)"
  },
  "strengthsCustomersSee": ["3-5 strengths customers consistently mention"],
  "blindSpots": ["2-4 areas where customers want improvement or see gaps the business may not realize"],
  "discoveryChannels": {"channel_name": count, ...},
  "keyInsight": "The single most important takeaway from this data — what the business owner needs to hear"
}

RULES:
- Be specific and actionable, not generic
- Use direct quotes from responses when impactful
- If alignment gaps don't exist for a pillar, set that pillar to null
- NPS categories: 0-6 = Detractor, 7-8 = Passive, 9-10 = Promoter
- Return ONLY valid JSON, no commentary`;

export async function POST(req: NextRequest) {
  const guard = apiGuard(req, { routeId: "voc-analyze", rateLimit: AUTH_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const { surveyToken } = await req.json();
    if (!surveyToken) {
      return NextResponse.json({ error: "Missing surveyToken" }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Get survey and responses in parallel (instead of sequential)
    const [surveyResult, responsesResult] = await Promise.all([
      supabase
        .from("voc_surveys")
        .select("id, business_name, report_id")
        .eq("survey_token", surveyToken)
        .single(),
      // We need survey.id for responses, but we can fetch by token join
      // Workaround: fetch survey first, then responses. However, since we need survey.id,
      // we can't fully parallelize. Instead we optimize the post-analysis writes below.
      Promise.resolve(null), // placeholder
    ]);

    const survey = surveyResult.data as any;
    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    // Now fetch responses (depends on survey.id)
    const { data: responses } = await supabase
      .from("voc_responses")
      .select("*")
      .eq("survey_id", survey.id)
      .order("created_at", { ascending: true }) as { data: any[] | null };

    if (!responses || responses.length < 3) {
      return NextResponse.json({ error: "Need at least 3 responses to generate analysis" }, { status: 400 });
    }

    // Format responses for the AI prompt
    const formattedResponses = responses.map((r: any, i: number) => {
      const parts = [`Response ${i + 1}:`];
      if (r.three_words?.length) parts.push(`  Words: ${r.three_words.join(", ")}`);
      if (r.differentiator) parts.push(`  What they do better: ${r.differentiator}`);
      if (r.discovery_channel) parts.push(`  How they found them: ${r.discovery_channel}`);
      if (r.friend_description) parts.push(`  What they'd tell a friend: ${r.friend_description}`);
      if (r.improvement) parts.push(`  What could improve: ${r.improvement}`);
      if (r.nps_score !== null) parts.push(`  NPS: ${r.nps_score}/10`);
      if (r.choose_reason) parts.push(`  Why they chose them: ${r.choose_reason}`);
      if (r.elevator_description) parts.push(`  Elevator description: ${r.elevator_description}`);
      return parts.join("\n");
    }).join("\n\n");

    const userPrompt = `Business name: ${survey.business_name}
Number of responses: ${responses.length}

CUSTOMER RESPONSES:
${formattedResponses}`;

    // Generate analysis (with retry + fallback)
    const completion = await completeWithFallback("voc_analysis", {
      messages: [
        { role: "system", content: VOC_ANALYSIS_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      jsonMode: true,
    });

    const raw = completion.content || "{}";

    // Parse the JSON
    let analysis: any;
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      logger.error("[VOC Analyze] Failed to parse AI response", { rawLength: raw.length });
      return NextResponse.json({ error: "Analysis generation failed" }, { status: 500 });
    }

    // Save analysis + update survey timestamp in parallel
    const [upsertResult] = await Promise.all([
      (supabase.from("voc_analysis") as any).upsert({
        survey_id: survey.id,
        response_count: responses.length,
        nps_score: analysis.npsScore ?? null,
        nps_category: analysis.npsCategory ?? null,
        top_words: analysis.topWords ?? [],
        perception_summary: analysis.perceptionSummary ?? "",
        alignment_gaps: analysis.alignmentGaps ?? {},
        strengths_customers_see: analysis.strengthsCustomersSee ?? [],
        blind_spots: analysis.blindSpots ?? [],
        discovery_channels: analysis.discoveryChannels ?? {},
        raw_analysis: analysis,
      }, { onConflict: "survey_id" }),
      (supabase.from("voc_surveys") as any)
        .update({ analysis_generated_at: new Date().toISOString() })
        .eq("id", survey.id),
    ]);

    if (upsertResult.error) {
      logger.error("[VOC Analyze] Save error", { error: upsertResult.error?.message });
    }

    return NextResponse.json({
      success: true,
      analysis,
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: any) {
    logger.error("[VOC Analyze] Error", { error: err?.message ?? String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
