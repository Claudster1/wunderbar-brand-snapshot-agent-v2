// app/api/wundy/route.ts
// Unified Wundy™ chat endpoint supporting two modes:
//   - "general": Brand education, product FAQs, concept explanations (everyone)
//   - "report":  Report-aware companion with user's report data (paid tiers only)
// Supports tool calling for support request submission.
// Uses multi-provider AI abstraction with automatic fallback.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { wundyGuidePrompt } from "@/src/prompts/wundyGuidePrompt";
import { buildWundyReportCompanionPrompt } from "@/src/prompts/wundyReportCompanionPrompt";
import {
  completeWithFallback,
  completeToolFollowUp,
  type ChatMessage,
  type ToolDefinition,
} from "@/lib/ai";
import { apiGuard } from "@/lib/security/apiGuard";
import { AI_RATE_LIMIT } from "@/lib/security/rateLimit";
import { sanitizeString } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";

// Tier names by product key
const TIER_NAMES: Record<string, string> = {
  "snapshot-plus": "WunderBrand Snapshot+™",
  "blueprint": "WunderBrand Blueprint™",
  "blueprint-plus": "WunderBrand Blueprint+™",
};

// Use shared singleton admin client
function getSupabase() {
  return supabaseAdmin;
}

/* ─── Support Request Tool (provider-agnostic format) ─── */
const SUPPORT_TOOL: ToolDefinition = {
  name: "submit_support_request",
  description:
    "Submit a support request after collecting all required information from the user. " +
    "Call this function ONLY when you have gathered: email used for purchase, company name, " +
    "product name, and issue category.",
  parameters: {
    type: "object",
    properties: {
      emailUsedForPurchase: {
        type: "string",
        description: "The email address the user used for their purchase",
      },
      companyName: {
        type: "string",
        description: "The user's company name",
      },
      productName: {
        type: "string",
        enum: [
          "WunderBrand Snapshot™",
          "WunderBrand Snapshot+™",
          "WunderBrand Blueprint™",
          "WunderBrand Blueprint+™",
        ],
        description: "The product the user is having issues with",
      },
      issueCategory: {
        type: "string",
        enum: ["access", "download", "payment", "account"],
        description: "The category of the issue",
      },
      issueDescription: {
        type: "string",
        description:
          "Brief description of the issue in the user's own words",
      },
      purchaseTiming: {
        type: "string",
        enum: ["today", "yesterday", "earlier"],
        description:
          "When the user made their purchase, if mentioned",
      },
      errorMessage: {
        type: "string",
        description:
          "Any error message the user reported seeing",
      },
      userNotes: {
        type: "string",
        description:
          "Any other relevant context the user shared that doesn't fit other fields",
      },
    },
    required: [
      "emailUsedForPurchase",
      "companyName",
      "productName",
      "issueCategory",
    ],
  },
};

/* ─── Handle support request submission ─── */
async function handleSupportRequest(
  args: {
    emailUsedForPurchase: string;
    companyName: string;
    productName: string;
    issueCategory: string;
    issueDescription?: string;
    purchaseTiming?: "today" | "yesterday" | "earlier";
    errorMessage?: string;
    userNotes?: string;
  },
  meta?: {
    userId?: string;
    stripeSessionId?: string;
    acContactId?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();

  // Store in Supabase
  if (supabase) {
    const { error: dbError } = await supabase
      .from("support_requests")
      .insert({
        email: args.emailUsedForPurchase,
        company_name: args.companyName,
        product_name: args.productName,
        issue_category: args.issueCategory,
        issue_description: args.issueDescription || null,
        purchase_timing: args.purchaseTiming || null,
        error_message: args.errorMessage || null,
        user_notes: args.userNotes || null,
        user_id: meta?.userId || null,
        stripe_session_id: meta?.stripeSessionId || null,
        ac_contact_id: meta?.acContactId || null,
        status: "new",
        source: "wundy_chat",
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      logger.error("[Wundy™] Support request DB error", { error: dbError.message });
    }
  }

  // Send notification via ActiveCampaign webhook (if available)
  const acWebhookUrl =
    process.env.ACTIVECAMPAIGN_SUPPORT_WEBHOOK_URL ||
    process.env.ACTIVECAMPAIGN_WEBHOOK_URL;

  if (acWebhookUrl) {
    try {
      await fetch(acWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "support@wunderbardigital.com",
          fields: {
            support_customer_email: args.emailUsedForPurchase,
            support_company_name: args.companyName,
            support_product: args.productName,
            support_category: args.issueCategory,
            support_description: args.issueDescription || "No description",
            support_purchase_timing: args.purchaseTiming || "",
            support_error_message: args.errorMessage || "",
            support_user_notes: args.userNotes || "",
            support_user_id: meta?.userId || "",
            support_stripe_session: meta?.stripeSessionId || "",
            support_ac_contact_id: meta?.acContactId || "",
            support_source: "wundy_chat",
          },
          tags: ["support:new_request", `support:${args.issueCategory}`],
        }),
      });
    } catch {
      // Non-critical — don't fail the flow
    }
  }

  logger.debug("[Support Request]", {
    category: args.issueCategory,
    product: args.productName,
    hasEmail: !!args.emailUsedForPurchase,
  });

  return {
    success: true,
    message:
      "Support request submitted successfully. The support team will receive this within minutes.",
  };
}

// ─── Response Cache for General Mode ────────────────────────────
// Caches identical general-mode queries to avoid redundant AI calls.
// Short TTL (5 minutes) ensures freshness while absorbing duplicate traffic.
const generalCache = new Map<string, { content: string; provider: string; model: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

function getCacheKey(messages: { role: string; content: string }[]): string {
  // Use the last user message as the cache key (most unique identifier)
  const lastUserMsg = messages.filter(m => m.role === "user").pop();
  return lastUserMsg ? lastUserMsg.content.trim().toLowerCase().slice(0, 200) : "";
}

function pruneCache() {
  if (generalCache.size <= MAX_CACHE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of generalCache) {
    if (entry.expiresAt < now) generalCache.delete(key);
  }
  // If still over limit, remove oldest entries
  if (generalCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(generalCache.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    for (let i = 0; i < entries.length - MAX_CACHE_SIZE; i++) {
      generalCache.delete(entries[i][0]);
    }
  }
}

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const guard = apiGuard(req, { routeId: "wundy", rateLimit: AI_RATE_LIMIT, maxBodySize: 50_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const {
      mode = "general",
      messages,
      reportId,
      tier,
      sessionMeta,
    } = body as {
      mode?: "general" | "report";
      messages?: { role: "user" | "assistant"; content: string }[];
      reportId?: string;
      tier?: string;
      sessionMeta?: {
        userId?: string;
        stripeSessionId?: string;
        acContactId?: string;
      };
    };

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    const sanitizedMessages = messages.map((m: { role: string; content: string }) =>
      m.role === "user" && typeof m.content === "string"
        ? { ...m, content: sanitizeString(m.content) }
        : m
    );

    let systemPrompt: string;

    // ─── GENERAL MODE ───────────────────────────────────────────
    if (mode === "general") {
      systemPrompt = wundyGuidePrompt;
    }

    // ─── REPORT COMPANION MODE ──────────────────────────────────
    else if (mode === "report") {
      if (!reportId) {
        return NextResponse.json(
          { error: "Report mode requires a reportId." },
          { status: 400 }
        );
      }

      if (!tier || !TIER_NAMES[tier]) {
        return NextResponse.json(
          { error: "Report mode requires a valid tier (snapshot-plus, blueprint, blueprint-plus)." },
          { status: 400 }
        );
      }

      // Preview pages don't have real report data — fall back to general mode
      if (reportId === "preview") {
        systemPrompt = wundyGuidePrompt;
      } else {
        // Load report data from Supabase
        const supabase = getSupabase();
        if (!supabase) {
          return NextResponse.json(
            { error: "Database not configured." },
            { status: 500 }
          );
        }

        const { data: report, error: dbError } = await supabase
          .from("brand_snapshot_reports")
          .select(
            "full_report, brand_alignment_score, pillar_scores, pillar_insights, recommendations, user_name"
          )
          .eq("report_id", reportId)
          .single();

        if (dbError || !report) {
          return NextResponse.json(
            { error: "Report not found. Please check your report ID." },
            { status: 404 }
          );
        }

        const reportData = {
          ...(report.full_report || {}),
          brandAlignmentScore: report.brand_alignment_score,
          pillarScores: report.pillar_scores,
          pillarInsights: report.pillar_insights,
          recommendations: report.recommendations,
        };

        const tierName = TIER_NAMES[tier];
        systemPrompt = buildWundyReportCompanionPrompt(tierName, reportData);
      }
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Use 'general' or 'report'." },
        { status: 400 }
      );
    }

    // ─── Build universal messages ────────────────────────────────
    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...sanitizedMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // ─── Determine use case for routing ──────────────────────────
    const useCase = mode === "general" ? "wundy_general" : "wundy_report";

    // ─── Cache check for general mode (identical questions) ──────
    if (mode === "general") {
      const cacheKey = getCacheKey(sanitizedMessages);
      if (cacheKey) {
        const cached = generalCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          return NextResponse.json({
            content: cached.content,
            mode,
            _ai: { provider: cached.provider, model: cached.model, cached: true },
          });
        }
      }
    }

    // ─── First completion (with tools + retry + fallback) ────────
    const completion = await completeWithFallback(useCase as any, {
      messages: aiMessages,
      tools: [SUPPORT_TOOL],
    });

    // ─── Handle tool calls (support request submission) ──────────
    if (completion.hasToolCalls && completion.toolCalls.length > 0) {
      const toolCall = completion.toolCalls[0];

      if (toolCall.name === "submit_support_request") {
        const args = toolCall.arguments as any;

        // Execute the support request (inject session metadata silently)
        const result = await handleSupportRequest(args, sessionMeta);

        // Send the tool result back so the model can compose a confirmation
        const followUp = await completeToolFollowUp(useCase as any, {
          messages: aiMessages,
          originalResponse: completion,
          toolResults: [
            {
              toolCallId: toolCall.id,
              content: JSON.stringify(result),
            },
          ],
        });

        return NextResponse.json({
          content:
            followUp.content ||
            "Got it — I've passed this along to our support team. You should hear back within one business day, often sooner.",
          mode,
          supportRequestSubmitted: true,
          _ai: { provider: completion.provider, model: completion.model },
        });
      }
    }

    // ─── Standard response (no tool call) ────────────────────────
    const content =
      completion.content ||
      "Sorry, I had trouble with that. Could you try asking again?";

    // Cache general-mode responses for identical future queries
    if (mode === "general" && content) {
      const cacheKey = getCacheKey(sanitizedMessages);
      if (cacheKey) {
        pruneCache();
        generalCache.set(cacheKey, {
          content,
          provider: completion.provider,
          model: completion.model,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }
    }

    return NextResponse.json({
      content,
      mode,
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("[Wundy™ API] Error", { error: message });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
