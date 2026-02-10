// lib/refinementEngine.ts
// Generates refined insights and recommendations for specific pillars.
// Uses multi-provider AI abstraction with automatic fallback.

import { supabaseServer } from "./supabaseServer";
import { PILLARS, PillarKey } from "./pillars";
import { completeWithFallback } from "@/lib/ai";

export type RefinementInput = {
  snapshotReportId: string;
  pillar: "positioning" | "messaging" | "visibility" | "credibility" | "conversion";
  additionalContext: string;
  supportingUrls?: string[];
};

export type RefinementOutput = {
  insight: {
    headline: string;
    analysis: string;
    whyThisMatters: string;
  };
  recommendations: {
    priority: "high" | "medium";
    actions: string[];
  };
};

interface GenerateRefinementInput {
  snapshotReportId: string;
  pillar: PillarKey;
  additionalContext: string;
  supportingUrls?: string[];
}

type RefinementResult = RefinementOutput;

export async function generateRefinement(
  input: GenerateRefinementInput
): Promise<RefinementResult> {
  const { snapshotReportId, pillar, additionalContext, supportingUrls } = input;

  // Fetch the original snapshot report
  const sb = supabaseServer();
  
  // Try querying by report_id first (most common)
  let { data: report, error } = await sb
    .from("brand_snapshot_reports")
    .select("*")
    .eq("report_id", snapshotReportId)
    .single();

  // If not found, try by UUID id
  if (error || !report) {
    const uuidMatch = snapshotReportId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    if (uuidMatch) {
      const result = await sb
        .from("brand_snapshot_reports")
        .select("*")
        .eq("id", snapshotReportId)
        .single();
      report = result.data;
      error = result.error;
    }
  }

  if (error || !report) {
    throw new Error("Snapshot report not found");
  }

  const pillarContent = PILLARS[pillar];
  const pillarInsights = report.pillar_insights as Record<string, string> | null;
  const recommendations = report.recommendations as Record<string, string | string[]> | null;
  
  const originalInsight = pillarInsights?.[pillar] || "";
  const originalRec = recommendations?.[pillar];
  const originalRecommendations = Array.isArray(originalRec)
    ? originalRec.join("\n")
    : typeof originalRec === "string"
    ? originalRec
    : "";

  // Build context for refinement
  const context = `
Original ${pillarContent.title} Insight:
${originalInsight}

Original Recommendations:
${originalRecommendations}

User's Additional Context:
${additionalContext}

${supportingUrls && supportingUrls.length > 0
  ? `Supporting URLs:\n${supportingUrls.join("\n")}`
  : ""}

Business: ${(report as any).company || (report as any).company_name || "Unknown"}
Industry: ${(report as any).industry || "Unknown"}
  `.trim();

  // Generate refined insight and recommendations
  const prompt = `You are refining the ${pillarContent.title} pillar analysis for a Brand Snapshot+™ report.

${context}

Based on the user's additional context, provide a structured refinement with:

1. **Insight** (object with three parts):
   - headline: A concise, impactful headline (1 sentence)
   - analysis: A detailed analysis (2-3 sentences) that incorporates their new information
   - whyThisMatters: Explain why this insight matters for their brand (1-2 sentences)

2. **Recommendations** (object with priority and actions):
   - priority: "high" or "medium" based on impact and urgency
   - actions: 3-5 specific, actionable recommendations as an array of strings

Return as JSON with this exact structure:
{
  "insight": {
    "headline": "Concise headline here",
    "analysis": "Detailed analysis incorporating user context...",
    "whyThisMatters": "Why this insight matters for their brand..."
  },
  "recommendations": {
    "priority": "high",
    "actions": [
      "Action 1: specific recommendation",
      "Action 2: specific recommendation",
      "Action 3: specific recommendation"
    ]
  }
}`;

  try {
    const completion = await completeWithFallback("refinement_engine", {
      messages: [
        {
          role: "system",
          content:
            "You are a brand strategist refining a Brand Snapshot+™ report. Provide clear, actionable insights and recommendations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      jsonMode: true,
    });

    const content = completion.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    
    // Validate and structure the response
    const insight = parsed.insight;
    const recs = parsed.recommendations;
    
    // Ensure proper structure with fallbacks
    return {
      insight: {
        headline: insight?.headline || `Refined ${pillarContent.title} Insight`,
        analysis: insight?.analysis || originalInsight,
        whyThisMatters: insight?.whyThisMatters || "This insight helps clarify your brand's positioning and messaging strategy.",
      },
      recommendations: {
        priority: recs?.priority === "high" || recs?.priority === "medium" 
          ? recs.priority 
          : "medium",
        actions: Array.isArray(recs?.actions) && recs.actions.length > 0
          ? recs.actions
          : originalRecommendations 
            ? [originalRecommendations]
            : ["Review and refine your brand strategy based on the new context provided."],
      },
    };
  } catch (err) {
    console.error("[Refinement Engine] Error:", err);
    // Fallback to structured format with original content if AI fails
    return {
      insight: {
        headline: `Refined ${pillarContent.title} Insight`,
        analysis: originalInsight || "Unable to generate refined insight at this time.",
        whyThisMatters: "This insight helps clarify your brand's positioning and messaging strategy.",
      },
      recommendations: {
        priority: "medium",
        actions: originalRecommendations 
          ? [originalRecommendations]
          : ["Review and refine your brand strategy based on the new context provided."],
      },
    };
  }
}
