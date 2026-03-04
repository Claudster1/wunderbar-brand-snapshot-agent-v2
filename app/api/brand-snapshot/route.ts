// app/api/brand-snapshot/route.ts
// Assessment conversation + report save endpoint.
// Uses multi-provider AI abstraction with automatic fallback.

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { wundySystemPrompt } from "@/src/prompts/wundySystemPrompt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import { completeWithFallback, type ChatMessage } from "@/lib/ai";

type BusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

function computeBrandAlignmentFromPillars(
  pillarScores: Record<string, unknown> | null | undefined,
): number | null {
  if (!pillarScores || typeof pillarScores !== "object") return null;
  const keys = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const values = keys.map((key) => {
    const raw = Number((pillarScores as Record<string, unknown>)[key] ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(20, Math.round(raw)));
  });
  return values.reduce((sum, v) => sum + v, 0);
}

function getSupabaseClient() {
  return supabaseAdmin;
}

function inferBusinessTypeFromHistory(
  messages: Array<{ role: string; content: string }>
): BusinessType | null {
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ")
    .toLowerCase();

  if (!userCorpus) return null;
  if (/\bsaas|software|app|subscription|platform\b/.test(userCorpus)) return "saas";
  if (/\be-?commerce|shopify|dtc|amazon|online store|product brand\b/.test(userCorpus)) return "ecommerce";
  if (/\bretail|storefront|boutique|restaurant|cafe|food|beverage\b/.test(userCorpus)) return "retail";
  if (/\blocal service|clinic|dental|medical|legal|salon|studio|contractor|trades?\b/.test(userCorpus)) return "local_service";
  if (/\bb2b|other businesses|business clients|enterprise\b/.test(userCorpus)) return "service_b2b";
  if (/\bb2c|consumers|consumer clients|personal service\b/.test(userCorpus)) return "service_b2c";
  return null;
}

function getBusinessTypeRoutingNotes(type: BusinessType | null): string {
  switch (type) {
    case "service_b2b":
      return "Prioritize B2B track: LinkedIn/email attention channels, deal-size and sales-cycle capture, consultation/proposal conversion language.";
    case "service_b2c":
      return "Prioritize B2C service track: social proof and referral patterns, booking/call conversion path, trust and process clarity signals.";
    case "retail":
      return "Prioritize retail track: local search/GBP behavior, foot-traffic + repeat purchase dynamics, in-store + local channel emphasis.";
    case "ecommerce":
      return "Prioritize e-commerce track: product discovery channels, add-to-cart/checkout/retention funnel, AOV and repeat purchase levers.";
    case "saas":
      return "Prioritize SaaS track: acquisition-to-activation flow, trial/freemium conversion, retention/churn and expansion signals.";
    case "local_service":
      return "Prioritize local service track: local discovery channels, review/trust signals, booking-to-show-rate conversion path.";
    default:
      return "Business type not confidently inferred yet: ask the Business Type Classifier early and lock one primary revenue model before proceeding.";
  }
}

function hasSignal(messages: Array<{ role: string; content: string }>, pattern: RegExp): boolean {
  const corpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");
  return pattern.test(corpus);
}

type CaptureKey =
  | "business_type_classifier"
  | "monthly_revenue_range"
  | "average_transaction_value"
  | "conversion_rate_estimate"
  | "primary_acquisition_channel"
  | "monthly_marketing_budget"
  | "content_creation_capacity"
  | "competitive_pressure_point";

type CaptureState = {
  key: CaptureKey;
  label: string;
  completed: boolean;
};

const REFUSAL_PATTERN = /\b(skip|prefer not|rather not|don'?t want to|do not want to|not sure|unsure|unknown|i don'?t know)\b/i;

function getCaptureStates(messages: Array<{ role: string; content: string }>): CaptureState[] {
  const inferredType = inferBusinessTypeFromHistory(messages);
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");

  const refused = (topicPattern: RegExp) =>
    topicPattern.test(userCorpus) && REFUSAL_PATTERN.test(userCorpus);

  return [
    {
      key: "business_type_classifier",
      label: "business type classifier",
      completed:
        inferredType !== null ||
        hasSignal(messages, /\bservice_b2b|service_b2c|local_service|ecommerce|retail|saas\b/i) ||
        hasSignal(messages, /\bit sounds like you're|based on what you shared.*business\b/i),
    },
    {
      key: "monthly_revenue_range",
      label: "monthly revenue baseline range",
      completed:
        hasSignal(
          messages,
          /\bunder \$?5k|\$?5k\s*[–-]\s*\$?20k|\$?20k\s*[–-]\s*\$?50k|\$?50k\s*[–-]\s*\$?150k|\$?150k\+|monthly revenue\b/i,
        ) ||
        refused(/\bmonthly revenue|month to month|transaction volume\b/i),
    },
    {
      key: "average_transaction_value",
      label: "average transaction/deal value",
      completed:
        hasSignal(messages, /\baverage (transaction|deal|order) (value|size)\b/i) ||
        refused(/\baverage (transaction|deal|order) (value|size)\b/i),
    },
    {
      key: "conversion_rate_estimate",
      label: "conversion/close rate (or explicit 'I don't track this')",
      completed:
        hasSignal(messages, /\bconversion rate|close rate|i don't track this|do not track\b/i) ||
        refused(/\bconversion rate|close rate\b/i),
    },
    {
      key: "primary_acquisition_channel",
      label: "primary acquisition channel",
      completed:
        hasSignal(messages, /\breferral|organic search|social media|paid advertising|direct|events\b/i) ||
        refused(/\bacquisition channel|channel\b/i),
    },
    {
      key: "monthly_marketing_budget",
      label: "monthly marketing budget",
      completed:
        hasSignal(
          messages,
          /\bunder \$?500|\$?500\s*[–-]\s*\$?2,?000|\$?2,?000\s*[–-]\s*\$?5,?000|\$?5,?000\+|marketing budget\b/i,
        ) ||
        refused(/\bmarketing budget|budget range\b/i),
    },
    {
      key: "content_creation_capacity",
      label: "weekly content creation capacity",
      completed:
        hasSignal(messages, /\bunder 2 hours|2[–-]5 hours|5[–-]10 hours|10\+ hours|content creation\b/i) ||
        refused(/\bcontent creation|hours per week\b/i),
    },
    {
      key: "competitive_pressure_point",
      label: "competitive pressure point",
      completed:
        hasSignal(
          messages,
          /\bwhere .*lose deals|lose to competitors|competitive pressure|prospects choose.*instead|win[- ]?loss|why buyers choose competitors\b/i,
        ) ||
        refused(/\bcompetitor|competitive pressure|lose deals|win[- ]?loss\b/i),
    },
  ];
}

function getNextPendingCapture(
  messages: Array<{ role: string; content: string }>
): CaptureState | null {
  return getCaptureStates(messages).find((x) => !x.completed) ?? null;
}

function buildCaptureQuestion(
  key: CaptureKey,
  inferredType: BusinessType | null
): string {
  const businessTypeLabel = (type: BusinessType) => {
    switch (type) {
      case "service_b2b":
        return "B2B service";
      case "service_b2c":
        return "B2C service";
      case "retail":
        return "retail";
      case "ecommerce":
        return "e-commerce/product";
      case "saas":
        return "SaaS/software";
      case "local_service":
        return "local service";
      default:
        return "business";
    }
  };

  const typeHint =
    inferredType === null
      ? ""
      : `\nBusiness model context locked: ${inferredType.replace(/_/g, " ")}.`;

  switch (key) {
    case "business_type_classifier":
      return inferredType
        ? `Quick gut check so I can tailor this to your reality: it sounds like you're primarily running a ${businessTypeLabel(
            inferredType,
          )} business. Does that feel accurate, or would you describe your revenue model differently?`
        : "Quick context check before we go deeper: in one sentence, how do you primarily get paid, and who are you mainly selling to?";
    case "monthly_revenue_range":
      return "To keep your impact framing grounded in your real numbers, roughly what does the business generate month to month? A range is perfect.";
    case "average_transaction_value":
      return "About what is your average transaction value or deal size today? A rough estimate is absolutely fine.";
    case "conversion_rate_estimate":
      return "If you track it, what is your approximate conversion or close rate today? If not, totally okay — just say you don't track it yet.";
    case "primary_acquisition_channel":
      return "Where do most new customers find you right now (for example: referral, organic search, social, paid ads, direct, or events)? Whatever comes to mind first is fine.";
    case "monthly_marketing_budget":
      return "What is your approximate monthly marketing budget today? Ballpark is perfect — this just helps prioritize what is realistic for you.";
    case "content_creation_capacity":
      return "How much time can your team realistically invest in content creation each week? Even a rough range works — no need to overthink it.";
    case "competitive_pressure_point":
      return "When prospects choose a competitor over you, what reason comes up most often (for example: price, trust, clarity, speed, proof, or fit)?";
    default:
      return `Great context so far. Let's grab one more input so your recommendations stay precise.${typeHint}`;
  }
}

function capturePromptPatternForKey(key: CaptureKey): RegExp {
  switch (key) {
    case "business_type_classifier":
      return /\b(primary revenue|how you generate revenue|how do you get paid|it sounds like you're|business model)\b/i;
    case "monthly_revenue_range":
      return /\bmonthly revenue|under \$?5k|\$?5k|\$?20k|\$?50k|\$?150k\+\b/i;
    case "average_transaction_value":
      return /\baverage (transaction|deal|order) (value|size)\b/i;
    case "conversion_rate_estimate":
      return /\bconversion rate|close rate|i don't track this\b/i;
    case "primary_acquisition_channel":
      return /\b(acquisition channel|qualified opportunities|referral|organic search|social media|paid ads|events)\b/i;
    case "monthly_marketing_budget":
      return /\bmonthly marketing budget|under \$?500|\$?2,?000|\$?5,?000\+\b/i;
    case "content_creation_capacity":
      return /\bcontent creation|hours per week|under 2 hours|2-5 hours|5-10 hours|10\+ hours\b/i;
    case "competitive_pressure_point":
      return /\blose deals|competitive pressure|price|trust|clarity|proof|fit|why buyers choose competitors\b/i;
    default:
      return /\?/;
  }
}

function responseRequestsExpectedCapture(content: string, key: CaptureKey): boolean {
  return capturePromptPatternForKey(key).test(content);
}

function normalizeBusinessTypeLabel(raw: unknown): BusinessType | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("service_b2b") || value.includes("b2b service")) return "service_b2b";
  if (value.includes("service_b2c") || value.includes("b2c service")) return "service_b2c";
  if (value.includes("retail")) return "retail";
  if (value.includes("ecommerce") || value.includes("e-commerce") || value.includes("product brand")) return "ecommerce";
  if (value.includes("saas") || value.includes("software") || value.includes("app")) return "saas";
  if (value.includes("local_service") || value.includes("local service")) return "local_service";
  return null;
}

function inferBusinessTypeFromAnswers(answers: Record<string, unknown>): BusinessType {
  const corpus = [
    answers.businessName,
    answers.industry,
    answers.what_you_do,
    answers.businessDescription,
    answers.response_1,
    answers.response_2,
    answers.response_3,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();

  if (/\bsaas|software|app|subscription|platform\b/.test(corpus)) return "saas";
  if (/\be-?commerce|shopify|amazon|dtc|product\b/.test(corpus)) return "ecommerce";
  if (/\bretail|storefront|restaurant|boutique|food|beverage\b/.test(corpus)) return "retail";
  if (/\blocal|dental|medical|legal|salon|studio|clinic|contractor|trade\b/.test(corpus)) return "local_service";
  if (/\bb2c|consumer|clients|customers\b/.test(corpus)) return "service_b2c";
  return "service_b2b";
}

function normalizeStoredAnswers(raw: unknown): Record<string, unknown> {
  const answers =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? ({ ...(raw as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  const explicitType =
    normalizeBusinessTypeLabel(answers.businessType) ||
    normalizeBusinessTypeLabel(answers.business_type) ||
    normalizeBusinessTypeLabel(answers.primaryRevenueModel);
  answers.businessType = explicitType || inferBusinessTypeFromAnswers(answers);

  if (typeof answers.monthlyRevenueRange !== "string" && typeof answers.monthly_revenue_range === "string") {
    answers.monthlyRevenueRange = answers.monthly_revenue_range;
  }
  if (typeof answers.averageTransactionValue !== "string" && typeof answers.average_transaction_value === "string") {
    answers.averageTransactionValue = answers.average_transaction_value;
  }
  if (typeof answers.conversionRateEstimate !== "string" && typeof answers.conversion_rate_estimate === "string") {
    answers.conversionRateEstimate = answers.conversion_rate_estimate;
  }
  if (typeof answers.monthlyMarketingBudget !== "string" && typeof answers.monthly_marketing_budget === "string") {
    answers.monthlyMarketingBudget = answers.monthly_marketing_budget;
  }
  if (typeof answers.contentCreationCapacity !== "string" && typeof answers.content_creation_capacity === "string") {
    answers.contentCreationCapacity = answers.content_creation_capacity;
  }

  return answers;
}

function buildDeterministicRoutingGuard(
  messages: Array<{ role: string; content: string }>
): string {
  const inferredType = inferBusinessTypeFromHistory(messages);
  const captureStates = getCaptureStates(messages);
  const pending = captureStates.filter((x) => !x.completed);
  const nextCapture = pending[0]?.label ?? "none";
  const completionPercent = Math.round(
    (captureStates.filter((x) => x.completed).length / captureStates.length) * 100,
  );

  return [
    "DETERMINISTIC ROUTING GUARD (SERVER ENFORCED):",
    `- ${getBusinessTypeRoutingNotes(inferredType)}`,
    "- Ask one question at a time, and prioritize missing required captures before wrap-up.",
    `- Step-state completion: ${completionPercent}%`,
    `- Next required capture (strict order): ${nextCapture}.`,
    `- Pending required captures right now: ${pending.length ? pending.map((x) => x.label).join(", ") : "none"}.`,
    `- Step-state map (json): ${JSON.stringify(
      captureStates.reduce<Record<string, boolean>>((acc, c) => {
        acc[c.key] = c.completed;
        return acc;
      }, {}),
    )}`,
    "- Do not skip required captures unless user explicitly refuses; if they refuse, record null and proceed.",
  ].join("\n");
}

export async function POST(req: Request) {
  // ─── Security: Rate limit + request size ───
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { AI_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "brand-snapshot", rateLimit: AI_RATE_LIMIT, maxBodySize: 200_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    
    // Check if this is a report save request (has brand_alignment_score)
    if (body.brand_alignment_score !== undefined || body.brandAlignmentScore !== undefined) {
      // This is a report save request
      const {
        user_email,
        user_name,
        brand_alignment_score,
        pillar_scores,
        pillar_insights,
        recommendations,
        website_notes,
        full_report,
        // Also support camelCase variants
        email,
        userName,
        brandAlignmentScore,
        pillarScores,
        pillarInsights,
        websiteNotes,
        fullReport,
      } = body;

      // Normalize field names (support both snake_case and camelCase)
      const finalEmail = user_email || email;
      const finalUserName = user_name || userName;
      const computedScore = computeBrandAlignmentFromPillars(
        (pillar_scores || pillarScores) as Record<string, unknown> | null | undefined,
      );
      const finalBrandAlignmentScore =
        computedScore ??
        (typeof brand_alignment_score === "number"
          ? brand_alignment_score
          : typeof brandAlignmentScore === "number"
            ? brandAlignmentScore
            : null);
      const finalPillarScores = pillar_scores || pillarScores;
      const finalPillarInsights = pillar_insights || pillarInsights;
      const finalRecommendations = recommendations || {};
      const finalWebsiteNotes = website_notes || websiteNotes;
      const incomingFullReport = full_report || fullReport || {};
      const normalizedAnswers = normalizeStoredAnswers(
        (incomingFullReport as Record<string, unknown>)?.answers,
      );
      const finalFullReport =
        incomingFullReport && typeof incomingFullReport === "object"
          ? {
              ...(incomingFullReport as Record<string, unknown>),
              answers: normalizedAnswers,
            }
          : { answers: normalizedAnswers };

      if (!finalEmail) {
        return NextResponse.json(
          { error: "Missing required field: user_email or email" },
          { status: 400 }
        );
      }

      if (!finalBrandAlignmentScore || !finalPillarScores) {
        return NextResponse.json(
          { error: "Missing required fields: brand_alignment_score and pillar_scores" },
          { status: 400 }
        );
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        return NextResponse.json(
          { error: "Database not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
          { status: 500 }
        );
      }

      const reportId = randomUUID();

      const { data, error } = await supabase
        .from("brand_snapshot_reports")
        .insert([
          {
            report_id: reportId,
            user_name: finalUserName ?? null,
            email: finalEmail,
            brand_alignment_score: finalBrandAlignmentScore,
            pillar_scores: finalPillarScores,
            pillar_insights: finalPillarInsights || {},
            recommendations: finalRecommendations,
            website_notes: finalWebsiteNotes ?? null,
            full_report: finalFullReport,
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error("Insert error", { error: error.message });
        return NextResponse.json(
          { error: "Database insert failed", details: error.message },
          { status: 500 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json(
        {
          success: true,
          report_id: reportId,
          redirectUrl: `${baseUrl}/report/${reportId}`,
        },
        { status: 200 }
      );
    }

    // Otherwise, treat as chat/conversation request
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    const inferredType = inferBusinessTypeFromHistory(messages);
    const nextPendingCapture = getNextPendingCapture(messages);
    const forcedCapturePrompt = nextPendingCapture
      ? buildCaptureQuestion(nextPendingCapture.key, inferredType)
      : null;

    // Build universal messages with server-side deterministic routing guard
    const routingGuard = buildDeterministicRoutingGuard(messages);
    const aiMessages: ChatMessage[] = [
      { role: "system", content: wundySystemPrompt },
      { role: "system", content: routingGuard },
      ...(forcedCapturePrompt
        ? [
            {
              role: "system" as const,
              content: `If required captures are pending, ask ONLY the next required question now.\n${forcedCapturePrompt}`,
            },
          ]
        : []),
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await completeWithFallback("assessment_chat", {
      messages: aiMessages,
    });

    const fallbackMessage =
      "Sorry, I had trouble creating your WunderBrand Snapshot™. Please try again.";
    let finalContent = completion.content || fallbackMessage;

    // Hard guard: if required capture is still pending but model drifted, force the expected question.
    if (
      nextPendingCapture &&
      forcedCapturePrompt &&
      !responseRequestsExpectedCapture(finalContent, nextPendingCapture.key)
    ) {
      finalContent = forcedCapturePrompt;
    }

    return NextResponse.json({
      content: finalContent,
      _ai: { provider: completion.provider, model: completion.model },
    });
  } catch (err: any) {
    logger.error("[WunderBrand Snapshot™ API] error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      {
        error:
          err?.message ||
          "There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
