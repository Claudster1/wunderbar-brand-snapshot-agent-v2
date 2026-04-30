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
  | "competitive_pressure_point"
  | "has_email_list"
  | "has_lead_magnet"
  | "has_clear_cta"
  | "marketing_channel_mix";

type IntakeTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

function normalizeIntakeTier(raw: unknown): IntakeTier {
  if (typeof raw !== "string") return "snapshot";
  const tier = raw.trim().toLowerCase().replace(/_/g, "-");
  if (tier === "snapshot-plus") return "snapshot-plus";
  if (tier === "blueprint") return "blueprint";
  if (tier === "blueprint-plus") return "blueprint-plus";
  return "snapshot";
}

function isActivationPlanningTier(raw: unknown): boolean {
  const tier = normalizeIntakeTier(raw);
  return tier === "blueprint" || tier === "blueprint-plus";
}

function shouldIncludeCaptureForTier(capture: CaptureKey, tier: IntakeTier): boolean {
  // Base captures for all tiers.
  const core: CaptureKey[] = [
    "business_type_classifier",
    "primary_acquisition_channel",
    "competitive_pressure_point",
  ];

  // Snapshot+ and above need stronger performance signal coverage.
  const advanced: CaptureKey[] = [
    "monthly_revenue_range",
    "average_transaction_value",
    "conversion_rate_estimate",
    "content_creation_capacity",
  ];

  if (core.includes(capture)) return true;

  if (tier === "snapshot") return false;
  if (tier === "snapshot-plus") return advanced.includes(capture);

  // Blueprint tiers include advanced captures and budget for activation planning.
  if (tier === "blueprint" || tier === "blueprint-plus") {
    return (
      advanced.includes(capture) ||
      [
        "monthly_marketing_budget",
        "has_email_list",
        "has_lead_magnet",
        "has_clear_cta",
        "marketing_channel_mix",
      ].includes(capture)
    );
  }

  return false;
}

type CaptureState = {
  key: CaptureKey;
  label: string;
  completed: boolean;
};

/** Plain-language hint for the model only — keep internal `label` for logs/debug. */
function modelFacingCaptureHint(key: CaptureKey): string {
  switch (key) {
    case "business_type_classifier":
      return "how you primarily get paid and who you sell to";
    case "monthly_revenue_range":
      return "roughly what the business brings in month to month";
    case "average_transaction_value":
      return "a typical deal, order, or transaction size";
    case "conversion_rate_estimate":
      return "how you think about conversion or close rates — or if you do not track that yet";
    case "primary_acquisition_channel":
      return "where most new customers find you today";
    case "monthly_marketing_budget":
      return "what you are comfortable spending on marketing each month";
    case "content_creation_capacity":
      return "how much time you can realistically put into content each week";
    case "competitive_pressure_point":
      return "what usually tilts prospects toward a competitor instead of you";
    case "has_email_list":
      return "whether you are emailing a list today — even a small list counts";
    case "has_lead_magnet":
      return "whether you offer something simple and free (guide, checklist, template, etc.) when someone shares their email — or not yet";
    case "has_clear_cta":
      return "how clear the main next step feels when someone lands on your site or profile";
    case "marketing_channel_mix":
      return "which channels you are actively using to show up for people";
    default:
      return "one more detail to tailor your plan";
  }
}

const REFUSAL_PATTERN = /\b(skip|prefer not|rather not|don'?t want to|do not want to|not sure|unsure|unknown|i don'?t know)\b/i;

function getCaptureStates(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
): CaptureState[] {
  const tier = options?.tier ?? "snapshot";
  const includeBudgetCapture = options?.includeBudgetCapture === true;
  const inferredType = inferBusinessTypeFromHistory(messages);
  const userCorpus = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join(" ");

  const refused = (topicPattern: RegExp) =>
    topicPattern.test(userCorpus) && REFUSAL_PATTERN.test(userCorpus);

  const captures: CaptureState[] = [
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
    {
      key: "has_email_list",
      label: "email list status",
      completed:
        hasSignal(
          messages,
          /\bemail list|newsletter list|mailing list|we (have|don't have|do not have) an email list|no email list|not yet|starting|building (a )?list|small list\b/i,
        ) ||
        refused(/\bemail list|newsletter\b/i),
    },
    {
      key: "has_lead_magnet",
      label: "free offer / lead capture status",
      completed:
        hasSignal(
          messages,
          /\blead magnet|lead capture|opt-?in|downloadable guide|free checklist|gated content|lead form|free resource|not yet|don't have|do not have|haven't|no we don't|nothing yet|we're not|we are not|skipped|no,? not really\b/i,
        ) ||
        refused(/\blead magnet|lead capture|opt-?in|free (download|resource)\b/i),
    },
    {
      key: "has_clear_cta",
      label: "primary CTA clarity",
      completed:
        hasSignal(
          messages,
          /\bclear cta|call to action|book a call|get started|schedule (a )?demo|request a quote|next step is clear|next step|a bit mixed|still figuring|not sure yet\b/i,
        ) ||
        refused(/\bcall to action|cta|next step\b/i),
    },
    {
      key: "marketing_channel_mix",
      label: "active marketing channels",
      completed:
        hasSignal(
          messages,
          /\bmarketing channels|active channels|we use (email|social|paid ads|seo|search|events|referrals|youtube|linkedin|instagram)\b/i,
        ) ||
        refused(/\bmarketing channels|active channels\b/i),
    },
  ];

  return captures.filter((capture) => {
    if (capture.key === "monthly_marketing_budget" && !includeBudgetCapture) return false;
    return shouldIncludeCaptureForTier(capture.key, tier);
  });
}

function getNextPendingCapture(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
): CaptureState | null {
  return getCaptureStates(messages, options).find((x) => !x.completed) ?? null;
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
    case "has_email_list":
      return `One gentle logistics question — do you have an email list you're sending to today (even a small one is perfect)? A simple yes or no is totally enough. If you're just starting, that's okay too — your report can include a friendly path forward.`;
    case "has_lead_magnet":
      return `Lots of strong brands don't use a "lead magnet" yet — totally normal. Do you have any free download, template, guide, or similar that people get in exchange for their email? If the answer is no, that's useful too: say something like "not yet" or "we don't," and your plan can include a short list of ideas we'll weave into the email and social campaigns we draft for you.`;
    case "has_clear_cta":
      return `When someone lands on your site or main profile, how clear does the next step feel — pretty obvious (like one main button or action), or still a little mixed? Whatever you share is the right answer.`;
    case "marketing_channel_mix":
      return `Where are you showing up for people lately — things like email, social, SEO or search, paid ads, referrals, events, YouTube, or something else? Name whatever fits; "mostly one channel" is a great answer too.`;
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
    case "has_email_list":
      return /\bemail list|newsletter list|mailing list|small list|starting\b/i;
    case "has_lead_magnet":
      return /\blead magnet|lead capture|opt-?in|gated content|downloadable|not yet|don't have|do not have|haven't|nothing yet\b/i;
    case "has_clear_cta":
      return /\bcta|call to action|book a call|get started|next step|mixed\b/i;
    case "marketing_channel_mix":
      return /\bmarketing channels|email|social|seo|search|paid ads|referrals|events|youtube|linkedin|instagram\b/i;
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

  if (!answers.leadMagnetDetails && answers.lead_magnet_details && typeof answers.lead_magnet_details === "object") {
    answers.leadMagnetDetails = answers.lead_magnet_details;
  }

  return answers;
}

function buildDeterministicRoutingGuard(
  messages: Array<{ role: string; content: string }>,
  options?: { includeBudgetCapture?: boolean; tier?: IntakeTier },
): string {
  const tier = options?.tier ?? "snapshot";
  const includeBudgetCapture = options?.includeBudgetCapture === true;
  const inferredType = inferBusinessTypeFromHistory(messages);
  const captureStates = getCaptureStates(messages, { includeBudgetCapture, tier });
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
    `- Tier capture policy: ${tier}.`,
    `- Step-state map (json): ${JSON.stringify(
      captureStates.reduce<Record<string, boolean>>((acc, c) => {
        acc[c.key] = c.completed;
        return acc;
      }, {}),
    )}`,
    "- Do not skip required captures unless user explicitly refuses; if they refuse, record null and proceed.",
    includeBudgetCapture
      ? "- Activation planning tier detected: monthly marketing budget capture is required."
      : "- Non-activation tier detected: do NOT ask budget questions (monthlyMarketingBudget, paidAdsBudgetBand, paidAdsPrimaryObjective). Keep these as null.",
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
    const { messages, productTier } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array." },
        { status: 400 }
      );
    }

    const intakeTier = normalizeIntakeTier(productTier);
    const includeBudgetCapture = isActivationPlanningTier(productTier);
    const inferredType = inferBusinessTypeFromHistory(messages);
    const nextPendingCapture = getNextPendingCapture(messages, {
      includeBudgetCapture,
      tier: intakeTier,
    });
    const forcedCapturePrompt = nextPendingCapture
      ? buildCaptureQuestion(nextPendingCapture.key, inferredType)
      : null;

    // Build universal messages with server-side deterministic routing guard
    const routingGuard = buildDeterministicRoutingGuard(messages, {
      includeBudgetCapture,
      tier: intakeTier,
    });
    const aiMessages: ChatMessage[] = [
      { role: "system", content: wundySystemPrompt },
      { role: "system", content: routingGuard },
      ...(!includeBudgetCapture
        ? [
            {
              role: "system" as const,
              content:
                "TIER GUARDRAIL: This user is not in an activation-planning tier. Do not ask about monthly marketing budget, paid ads budget, or paid ads objective. If those fields are needed in final JSON, set them to null and continue.",
            },
          ]
        : []),
      ...(forcedCapturePrompt && nextPendingCapture
        ? [
            {
              role: "system" as const,
              content: [
                "NEXT REQUIRED CAPTURE (this turn — single question only):",
                `This turn we're gently checking in on: ${modelFacingCaptureHint(nextPendingCapture.key)}.`,
                "Use the approved wording below verbatim, OR add at most one short warm sentence before it.",
                "Do not ask any other conversion, budget, or channel question in this same reply — including paraphrases of email list, free download/lead capture, CTA clarity, or marketing channels.",
                "",
                "Approved wording:",
                forcedCapturePrompt,
              ].join("\n"),
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
