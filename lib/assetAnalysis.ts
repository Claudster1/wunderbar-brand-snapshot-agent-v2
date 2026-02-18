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

/**
 * Fetch all asset analyses for a user/tier. If any assets haven't been
 * analyzed yet, trigger analysis via the internal API first, then re-fetch.
 */
export async function getAssetAnalyses(
  email: string,
  tier: string
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
        body: JSON.stringify({ email, tier }),
      });

      // Re-fetch after analysis
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
 * Format asset analyses as a context string for inclusion in report prompts.
 * Blueprint gets a summary; Blueprint+ gets full per-asset detail.
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
      "The user uploaded current marketing assets for analysis. Use these insights to provide a dedicated 'Current Asset Audit' section in the report with per-asset before/after recommendations.",
      ""
    );

    for (const asset of summary.assets) {
      lines.push(`Asset: ${asset.fileName} (${asset.category})`);
      lines.push(JSON.stringify(asset.analysis, null, 2));
      lines.push("");
    }
  } else {
    lines.push(
      "The user uploaded current marketing assets. Incorporate these visual consistency findings into the Visual Direction section.",
      ""
    );

    for (const asset of summary.assets) {
      lines.push(`Asset: ${asset.fileName} (${asset.category})`);
      const a = asset.analysis;
      if (a.overallScore) lines.push(`  Score: ${a.overallScore}/10`);
      if (a.visualConsistency) lines.push(`  Visual: ${a.visualConsistency}`);
      if (a.strengths) lines.push(`  Strengths: ${(a.strengths as string[]).join("; ")}`);
      if (a.improvements) lines.push(`  Improvements: ${(a.improvements as string[]).join("; ")}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
