// POST /api/assets/analyze
// Analyzes uploaded marketing assets using AI vision/text extraction.
// Called after report generation to enrich the report with asset insights.
//
// Blueprint:  Visual consistency check (colors, tone, general alignment)
// Blueprint+: Full per-asset audit (messaging, voice, visual identity, channel fit)

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

function buildAnalysisPrompt(tier: string, fileName: string, category: string): string {
  const base = `You are a brand consistency auditor. Analyze this marketing asset ("${fileName}", category: ${category}) and provide a structured assessment.`;

  if (tier === "blueprint-plus") {
    return `${base}

Return a JSON object with these fields:
{
  "overallScore": (1-10, brand consistency rating),
  "visualAssessment": {
    "colorConsistency": "assessment of color usage",
    "typographyConsistency": "assessment of font usage and hierarchy",
    "layoutProfessionalism": "assessment of layout quality",
    "imageQuality": "assessment of image/graphic quality"
  },
  "messagingAssessment": {
    "voiceConsistency": "does the copy align with professional brand voice?",
    "valueProposition": "is the value proposition clear?",
    "callToAction": "is the CTA effective and clear?"
  },
  "channelFit": "how well does this asset fit its intended channel?",
  "strengths": ["what works well"],
  "improvements": ["specific actionable recommendations"],
  "beforeAfterSuggestion": {
    "current": "what it does now",
    "recommended": "what it should do instead"
  }
}`;
  }

  return `${base}

Return a JSON object with these fields:
{
  "overallScore": (1-10, brand consistency rating),
  "visualConsistency": "brief assessment of visual alignment (colors, style, professionalism)",
  "strengths": ["1-2 things working well"],
  "improvements": ["1-2 key recommendations"]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, tier } = await req.json();

    if (!email || !tier) {
      return NextResponse.json({ error: "Missing email or tier" }, { status: 400 });
    }

    const sb = supabaseServer();

    const { data: assets, error: fetchErr } = await sb
      .from("brand_asset_uploads")
      .select("id, file_name, file_type, file_size, storage_path, asset_category, tier")
      .eq("user_email", email.toLowerCase())
      .eq("tier", tier)
      .is("analysis", null);

    if (fetchErr || !assets || assets.length === 0) {
      return NextResponse.json({
        analyzed: 0,
        message: "No unanalyzed assets found.",
      });
    }

    const results: Array<{ id: string; file_name: string; analysis: unknown }> = [];

    for (const asset of assets as AssetRow[]) {
      try {
        let analysis: unknown = null;

        if (asset.file_type.startsWith("image/")) {
          // Download the image and send to GPT-4o vision
          const { data: fileData } = await sb.storage
            .from("brand-assets")
            .download(asset.storage_path);

          if (!fileData) continue;

          const buffer = await fileData.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const dataUri = `data:${asset.file_type};base64,${base64}`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 1000,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: buildAnalysisPrompt(tier, asset.file_name, asset.asset_category),
                  },
                  {
                    type: "image_url",
                    image_url: { url: dataUri, detail: "low" },
                  },
                ],
              },
            ],
          });

          const raw = completion.choices[0]?.message?.content;
          if (raw) {
            try { analysis = JSON.parse(raw); } catch { analysis = { raw }; }
          }
        } else {
          // For PDFs/docs: text-based analysis (describe the file metadata)
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 600,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: `${buildAnalysisPrompt(tier, asset.file_name, asset.asset_category)}

Note: This is a non-image file (${asset.file_type}, ${(asset.file_size / 1024).toFixed(0)} KB). Analyze based on the file name, type, and category. Provide general brand consistency recommendations for this type of marketing asset.`,
              },
            ],
          });

          const raw = completion.choices[0]?.message?.content;
          if (raw) {
            try { analysis = JSON.parse(raw); } catch { analysis = { raw }; }
          }
        }

        if (analysis) {
          await sb
            .from("brand_asset_uploads")
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
