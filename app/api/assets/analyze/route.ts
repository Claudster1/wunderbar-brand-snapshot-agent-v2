// POST /api/assets/analyze
// Analyzes uploaded marketing assets using AI vision/text extraction.
// Includes pillar-aligned optimization recommendations.
//
// Blueprint:  Quick wins tied to weakest pillar + visual consistency check
// Blueprint+: Full per-asset audit with pillar alignment matrix,
//             rewrite/redesign recommendations, and custom AI prompts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AssetRow {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  asset_category: string;
  tier: string;
}

interface BrandContext {
  pillarScores?: Record<string, number>;
  primaryPillar?: string;
  weakestPillar?: string;
  brandArchetype?: string;
  positioningStatement?: string;
  brandVoice?: string;
  businessName?: string;
}

function getWeakestPillar(scores: Record<string, number>): string {
  let weakest = "";
  let lowest = Infinity;
  for (const [pillar, score] of Object.entries(scores)) {
    if (score < lowest) {
      lowest = score;
      weakest = pillar;
    }
  }
  return weakest;
}

function buildPillarContext(ctx: BrandContext): string {
  const parts: string[] = [];
  if (ctx.businessName) parts.push(`Business: ${ctx.businessName}`);
  if (ctx.pillarScores) {
    const formatted = Object.entries(ctx.pillarScores)
      .map(([k, v]) => `${k}: ${v}/20`)
      .join(", ");
    parts.push(`Pillar scores: ${formatted}`);
  }
  if (ctx.weakestPillar) parts.push(`Weakest pillar: ${ctx.weakestPillar}`);
  if (ctx.primaryPillar) parts.push(`Primary pillar: ${ctx.primaryPillar}`);
  if (ctx.brandArchetype) parts.push(`Brand archetype: ${ctx.brandArchetype}`);
  if (ctx.positioningStatement) parts.push(`Positioning: ${ctx.positioningStatement}`);
  if (ctx.brandVoice) parts.push(`Brand voice: ${ctx.brandVoice}`);
  return parts.length > 0 ? `\n\nBrand context:\n${parts.join("\n")}` : "";
}

function buildAnalysisPrompt(
  tier: string,
  fileName: string,
  category: string,
  brandCtx: BrandContext
): string {
  const pillarCtx = buildPillarContext(brandCtx);
  const weakest = brandCtx.weakestPillar || "unknown";

  if (tier === "blueprint-plus") {
    return `You are a brand strategist auditing marketing assets against a brand's five pillars: Positioning, Messaging, Visibility, Credibility, and Conversion.

Analyze this asset ("${fileName}", category: ${category}).${pillarCtx}

Return a JSON object:
{
  "overallScore": (1-10),
  "visualAssessment": {
    "colorConsistency": "assessment",
    "typographyConsistency": "assessment",
    "layoutProfessionalism": "assessment",
    "imageQuality": "assessment"
  },
  "messagingAssessment": {
    "voiceConsistency": "does copy align with the brand voice and archetype?",
    "valueProposition": "is the value proposition clear and differentiated?",
    "callToAction": "is the CTA effective?"
  },
  "pillarAlignment": {
    "positioning": { "score": (1-10), "observation": "how this asset supports or undermines positioning", "fix": "specific change to improve" },
    "messaging": { "score": (1-10), "observation": "", "fix": "" },
    "visibility": { "score": (1-10), "observation": "", "fix": "" },
    "credibility": { "score": (1-10), "observation": "", "fix": "" },
    "conversion": { "score": (1-10), "observation": "", "fix": "" }
  },
  "channelFit": "how well does this asset fit its intended channel?",
  "strengths": ["what works well — tied to specific pillars"],
  "optimizationPlaybook": [
    {
      "priority": "high|medium|low",
      "pillar": "which pillar this addresses",
      "current": "what the asset does now",
      "recommended": "exact change to make",
      "impact": "expected improvement"
    }
  ],
  "customPrompts": [
    {
      "useCase": "what this prompt helps with",
      "prompt": "ready-to-use AI prompt referencing the brand's archetype, voice, and positioning to rewrite/redesign this specific asset"
    }
  ]
}`;
  }

  return `You are a brand consistency auditor. Analyze this marketing asset ("${fileName}", category: ${category}).${pillarCtx}

The brand's weakest pillar is "${weakest}". Focus your quick-win recommendations on how this asset can better support that pillar.

Return a JSON object:
{
  "overallScore": (1-10),
  "visualConsistency": "brief assessment of visual alignment",
  "strengths": ["1-2 things working well"],
  "quickWins": [
    {
      "pillar": "which pillar this addresses (focus on ${weakest})",
      "issue": "what's misaligned",
      "fix": "specific actionable change",
      "impact": "how this improves the pillar score"
    }
  ],
  "weakestPillarNote": "1-2 sentences on how this specific asset could better support the ${weakest} pillar"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, tier, brandContext } = await req.json();

    if (!email || !tier) {
      return NextResponse.json({ error: "Missing email or tier" }, { status: 400 });
    }

    const sb = supabaseServer();

    // Build brand context from request or fetch from latest report
    let ctx: BrandContext = brandContext || {};
    if (!ctx.pillarScores) {
      try {
        const { data: report } = await sb
          .from("blueprint_reports")
          .select("pillar_scores, company_name")
          .eq("user_email", email.toLowerCase())
          .order("created_at", { ascending: false })
          .limit(1)
          .single() as { data: { pillar_scores: Record<string, number> | null; company_name: string | null } | null };

        if (report) {
          const scores = report.pillar_scores;
          if (scores) {
            ctx.pillarScores = scores;
            ctx.weakestPillar = getWeakestPillar(scores);
          }
          if (report.company_name) ctx.businessName = report.company_name;
        }
      } catch {
        // Continue without pillar context
      }
    }

    if (ctx.pillarScores && !ctx.weakestPillar) {
      ctx.weakestPillar = getWeakestPillar(ctx.pillarScores);
    }

    const { data: assets, error: fetchErr } = await sb
      .from("brand_asset_uploads")
      .select("id, file_name, file_type, file_size, storage_path, asset_category, tier")
      .eq("user_email", email.toLowerCase())
      .eq("tier", tier)
      .is("analysis", null) as { data: AssetRow[] | null; error: unknown };

    if (fetchErr || !assets || assets.length === 0) {
      return NextResponse.json({
        analyzed: 0,
        message: "No unanalyzed assets found.",
      });
    }

    const results: Array<{ id: string; file_name: string; analysis: unknown }> = [];

    for (const asset of assets!) {
      try {
        let analysis: unknown = null;
        const prompt = buildAnalysisPrompt(tier, asset.file_name, asset.asset_category, ctx);

        if (asset.file_type.startsWith("image/")) {
          const { data: fileData } = await sb.storage
            .from("brand-assets")
            .download(asset.storage_path);

          if (!fileData) continue;

          const buffer = await fileData.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const dataUri = `data:${asset.file_type};base64,${base64}`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 1500,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: dataUri, detail: "low" } },
                ],
              },
            ],
          });

          const raw = completion.choices[0]?.message?.content;
          if (raw) {
            try { analysis = JSON.parse(raw); } catch { analysis = { raw }; }
          }
        } else {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1000,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: `${prompt}\n\nNote: This is a non-image file (${asset.file_type}, ${(asset.file_size / 1024).toFixed(0)} KB). Analyze based on the file name, type, and category. Provide pillar-aligned recommendations for this type of marketing asset.`,
              },
            ],
          });

          const raw = completion.choices[0]?.message?.content;
          if (raw) {
            try { analysis = JSON.parse(raw); } catch { analysis = { raw }; }
          }
        }

        if (analysis) {
          await (sb
            .from("brand_asset_uploads") as any)
            .update({ analysis, analyzed_at: new Date().toISOString() })
            .eq("id", asset.id);

          results.push({ id: asset.id, file_name: asset.file_name, analysis });
        }
      } catch (assetErr) {
        console.error(`[Asset Analyze] Error analyzing ${asset.file_name}:`, assetErr);
      }
    }

    return NextResponse.json({
      analyzed: results.length,
      results,
    });
  } catch (err) {
    console.error("[Asset Analyze] Unexpected error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
