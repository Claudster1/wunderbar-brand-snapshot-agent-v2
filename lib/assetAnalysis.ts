// lib/assetAnalysis.ts
// Fetches and formats uploaded asset analyses for inclusion in report generation.
// Triggers analysis for unanalyzed assets before returning results.

import { supabaseServer } from "@/lib/supabase";

interface AssetAnalysisRecord {
  id: string;
  file_name: string;
  file_type: string;
  asset_category: string;
  analysis: Record<string, unknown> | null;
}

export interface AssetAnalysisSummary {
  totalAssets: number;
  analyzedAssets: number;
  assets: Array<{
    fileName: string;
    category: string;
    analysis: Record<string, unknown>;
  }>;
}

export interface BrandContextForAssets {
  pillarScores?: Record<string, number>;
  primaryPillar?: string;
  weakestPillar?: string;
  brandArchetype?: string;
  positioningStatement?: string;
  brandVoice?: string;
  businessName?: string;
}

/**
 * Fetch all asset analyses for a user/tier. If any assets haven't been
 * analyzed yet, trigger analysis via the internal API first (with brand
 * context for pillar-aligned recommendations), then re-fetch.
 */
export async function getAssetAnalyses(
  email: string,
  tier: string,
  brandContext?: BrandContextForAssets
): Promise<AssetAnalysisSummary | null> {
  const sb = supabaseServer();

  const { data: assets, error } = await sb
    .from("brand_asset_uploads")
    .select("id, file_name, file_type, asset_category, analysis")
    .eq("user_email", email.toLowerCase())
    .eq("tier", tier)
    .order("created_at", { ascending: true });

  if (error || !assets || assets.length === 0) return null;

  let typedAssets = assets as AssetAnalysisRecord[];
  const unanalyzed = typedAssets.filter((a) => a.analysis === null);

  if (unanalyzed.length > 0) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.wunderbrand.ai";
      await fetch(`${baseUrl}/api/assets/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, brandContext }),
      });

      const { data: refreshed } = await sb
        .from("brand_asset_uploads")
        .select("id, file_name, file_type, asset_category, analysis")
        .eq("user_email", email.toLowerCase())
        .eq("tier", tier)
        .order("created_at", { ascending: true });

      if (refreshed) typedAssets = refreshed as AssetAnalysisRecord[];
    } catch {
      // Continue with whatever we have
    }
  }

  const analyzed = typedAssets.filter((a) => a.analysis !== null);
  if (analyzed.length === 0) return null;

  return {
    totalAssets: typedAssets.length,
    analyzedAssets: analyzed.length,
    assets: analyzed.map((a) => ({
      fileName: a.file_name,
      category: a.asset_category,
      analysis: a.analysis!,
    })),
  };
}

/**
 * Format asset analyses as context for report prompts.
 *
 * Blueprint:  "Asset Alignment Notes" — quick wins tied to weakest pillar,
 *             included within the Visual Direction section.
 * Blueprint+: "Asset Optimization Playbook" — full per-asset pillar alignment
 *             matrix, before/after recommendations, and custom AI prompts as
 *             a dedicated report section.
 */
export function formatAssetContext(
  summary: AssetAnalysisSummary,
  tier: string
): string {
  if (summary.assets.length === 0) return "";

  const lines = [
    `--- UPLOADED MARKETING ASSET ANALYSIS (${summary.analyzedAssets} asset${summary.analyzedAssets > 1 ? "s" : ""}) ---`,
    "",
  ];

  if (tier === "blueprint-plus" || tier === "blueprint_plus") {
    lines.push(
      `The user uploaded ${summary.analyzedAssets} current marketing asset(s) for analysis. Each asset has been evaluated against the five brand pillars (Positioning, Messaging, Visibility, Credibility, Conversion).`,
      "",
      "INSTRUCTION: Generate a dedicated \"assetOptimizationPlaybook\" section in the report JSON with this structure:",
      '  "assetOptimizationPlaybook": {',
      '    "summary": "1-2 paragraph executive summary of overall asset alignment health",',
      '    "overallAlignmentScore": (1-10 average across all assets),',
      '    "assetAudits": [',
      '      {',
      '        "fileName": "",',
      '        "category": "",',
      '        "overallScore": (1-10),',
      '        "pillarAlignment": {',
      '          "positioning": { "score": 1-10, "observation": "", "fix": "" },',
      '          "messaging": { ... }, "visibility": { ... }, "credibility": { ... }, "conversion": { ... }',
      '        },',
      '        "optimizationSteps": [{ "priority": "high|medium|low", "pillar": "", "current": "", "recommended": "", "impact": "" }],',
      '        "customPrompts": [{ "useCase": "", "prompt": "ready-to-use AI prompt referencing the brand archetype, voice, and positioning to rewrite/redesign this asset" }]',
      '      }',
      '    ],',
      '    "crossAssetPatterns": {',
      '      "strongestPillar": "which pillar is best represented across assets",',
      '      "weakestPillar": "which pillar is most underrepresented — this should align with the overall weakest pillar score",',
      '      "systemicIssues": ["patterns that appear across multiple assets"],',
      '      "topPriorityActions": ["3-5 highest-impact changes across all assets, ranked"]',
      '    }',
      '  }',
      "",
      "Here is the per-asset analysis data:",
      ""
    );

    for (const asset of summary.assets) {
      lines.push(`Asset: ${asset.fileName} (${asset.category})`);
      lines.push(JSON.stringify(asset.analysis, null, 2));
      lines.push("");
    }
  } else {
    lines.push(
      `The user uploaded ${summary.analyzedAssets} current marketing asset(s). Each has been analyzed for brand consistency with quick-win recommendations tied to their weakest pillar.`,
      "",
      'INSTRUCTION: Include an "assetAlignmentNotes" field within the "visualDirection" section of the report JSON:',
      '  "assetAlignmentNotes": {',
      '    "summary": "1-2 sentences on overall asset alignment health",',
      '    "quickWins": [',
      '      { "asset": "file name", "pillar": "which pillar", "issue": "what is misaligned", "fix": "specific actionable change", "impact": "expected improvement" }',
      '    ],',
      '    "weakestPillarGap": "How the uploaded assets reveal the gap in their weakest pillar — make this tangible and specific"',
      '  }',
      "",
      "Here is the per-asset analysis data:",
      ""
    );

    for (const asset of summary.assets) {
      lines.push(`Asset: ${asset.fileName} (${asset.category})`);
      const a = asset.analysis;
      if (a.overallScore) lines.push(`  Score: ${a.overallScore}/10`);
      if (a.visualConsistency) lines.push(`  Visual: ${a.visualConsistency}`);
      if (a.strengths) lines.push(`  Strengths: ${(a.strengths as string[]).join("; ")}`);
      if (a.quickWins) {
        const wins = a.quickWins as Array<Record<string, string>>;
        for (const w of wins) {
          lines.push(`  Quick Win (${w.pillar}): ${w.issue} → ${w.fix}`);
        }
      }
      if (a.weakestPillarNote) lines.push(`  Weakest Pillar Note: ${a.weakestPillarNote}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
