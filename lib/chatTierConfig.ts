// lib/chatTierConfig.ts
// Product tier configuration for the diagnostic chat page.
// Controls heading, value-prop, Wundy's greeting, and welcome-back.
//
// Intro flow:
//   1. greeting  — first message for new users (uses {firstName} from URL params)
//   2. welcomeBack — message for returning users resuming a saved session
// Both support {firstName} interpolation.

export type ChatTier = "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus";

export interface ChatTierConfig {
  /** The eyebrow heading above the chat */
  heading: string;
  /** The full product name (for CTAs, emails, etc.) */
  productName: string;
  /** The value-prop line below the heading */
  valueProp: string;
  /** Estimated time for the diagnostic */
  timeEstimate: string;
  /** Wundy's intro for first-time users — uses {firstName} interpolation */
  greeting: string;
  /** Wundy's message for returning users resuming a saved session — uses {firstName} interpolation */
  welcomeBack: string;
}

const TIER_CONFIGS: Record<ChatTier, ChatTierConfig> = {
  // ─── WunderBrand Snapshot™ (Free) ───────────────────────────────
  snapshot: {
    heading: "WUNDERBRAND SNAPSHOT™",
    productName: "WunderBrand Snapshot™",
    valueProp: "See how aligned your brand really is — in about 15–20 minutes.",
    timeEstimate: "about 15–20 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide. A few quick questions and we'll build your personalized WunderBrand Snapshot™. No wrong answers. Ready when you are — let's get started.`,

    welcomeBack: `Nice to meet you, {firstName}.

I'll ask a few questions about your business and brand — no prep, and you can save anytime below if you need a break.

What's the name of your business?`,
  },

  // ─── WunderBrand Snapshot+™ ($497) ──────────────────────────────
  "snapshot-plus": {
    heading: "WUNDERBRAND SNAPSHOT+™",
    productName: "WunderBrand Snapshot+™",
    valueProp: "A deeper diagnostic with strategic recommendations tailored to your business — even if you're early-stage.",
    timeEstimate: "about 15–20 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide. A few questions and we'll build your personalized WunderBrand Snapshot+™: where you're strong, where there's opportunity, and what to focus on first. No wrong answers. Ready when you are — let's get started.`,

    welcomeBack: `Nice to meet you, {firstName}.

We'll go a bit deeper than a standard Snapshot so your recommendations are specific — still no wrong answers, and you can save anytime below.

What's your business called?`,
  },

  // ─── WunderBrand Blueprint™ ($997) ──────────────────────────────
  blueprint: {
    heading: "WUNDERBRAND BLUEPRINT™",
    productName: "WunderBrand Blueprint™",
    valueProp: "Your brand strategy, mapped — with an activation-ready action plan, whether you're starting or scaling.",
    timeEstimate: "about 20–25 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide. A few questions and we'll build your personalized WunderBrand Blueprint™: strategy mapped, with an activation-ready plan. No wrong answers. Ready when you are — let's get started.`,

    welcomeBack: `Welcome, {firstName}.

We'll map your brand strategy one step at a time — I'll keep each question clear. You can save anytime below if you need a break.

What's the name of the business we're mapping today?`,
  },

  // ─── WunderBrand Blueprint+™ ($1,997) ──────────────────────────
  "blueprint-plus": {
    heading: "WUNDERBRAND BLUEPRINT+™",
    productName: "WunderBrand Blueprint+™",
    valueProp: "The complete strategic diagnostic — with a 1:1 Strategy Activation Session and startup-friendly guidance.",
    timeEstimate: "about 25–35 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide. A few questions and we'll build your personalized WunderBrand Blueprint+™ for your Strategy Activation Session. No wrong answers. Ready when you are — let's get started.`,

    welcomeBack: `Welcome, {firstName}.

We'll go deep, one clear question at a time — take your time, and save below anytime if you need a break.

What's the name of your business?`,
  },
};

/**
 * Parse a tier from a URL query parameter.
 * Accepts formats like "snapshot-plus", "snapshot_plus", "blueprint", etc.
 * Returns "snapshot" (free) as the default if unrecognized.
 */
/** First assistant message after checkout when prior Snapshot answers are on file but chat transcript is not restored. */
/** Rough remaining questions after Snapshot → paid upgrade (prior answers on file). */
export function estimateUpgradeQuestionsRemaining(tier: ChatTier): number {
  const full = intakeProgressDenominator(tier);
  switch (tier) {
    case "snapshot-plus":
      return Math.max(8, Math.round(full * 0.45));
    case "blueprint":
      return Math.max(12, Math.round(full * 0.55));
    case "blueprint-plus":
      return Math.max(14, Math.round(full * 0.6));
    default:
      return Math.max(6, Math.round(full * 0.35));
  }
}

export function buildUpgradeGapFillAssistantMessage(
  tier: ChatTier,
  firstNameHint?: string | null,
): string {
  const first =
    firstNameHint?.trim().split(/\s+/)[0] ||
    (firstNameHint?.trim() ? firstNameHint.trim() : "");
  const namePart = first ? `, ${first}` : "";
  const productName = TIER_CONFIGS[tier]?.productName ?? "your upgraded diagnostic";
  const approx = estimateUpgradeQuestionsRemaining(tier);
  return `Welcome back${namePart}! Your WunderBrand Snapshot™ answers are already on file — we won't redo that work. For **${productName}**, I'll only cover what's **still missing** for this tier — about **${approx} focused questions** from here.

When you're ready, say **continue** or just dive into the first question — either works.`;
}

export function parseTierFromParam(param: string | null | undefined): ChatTier {
  if (!param) return "snapshot";
  const normalized = param.toLowerCase().replace(/_/g, "-").trim();
  if (normalized === "snapshot-plus") return "snapshot-plus";
  if (normalized === "blueprint") return "blueprint";
  if (normalized === "blueprint-plus") return "blueprint-plus";
  if (normalized === "snapshot") return "snapshot";
  return "snapshot";
}

/**
 * Get the chat configuration for a given product tier.
 */
export function getChatTierConfig(tier: ChatTier): ChatTierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Denominator for the intake progress bar (assistant turns vs expected depth).
 * Snapshot completes in fewer turns than Blueprint+; using one global count made Snapshot look “stuck” in the 50–65% range at the real end.
 */
export function intakeProgressDenominator(tier: ChatTier): number {
  switch (tier) {
    /** Typical Snapshot thread is short vs Blueprint; denominator only affects the bar until wrap-up copy (then 100%). */
    case "snapshot":
      return 14;
    case "snapshot-plus":
      return 32;
    case "blueprint":
      return 38;
    case "blueprint-plus":
      return 41;
    default:
      return 22;
  }
}

/** PDF download path for a completed diagnostic, by product tier. */
export function pdfDownloadPathForTier(tier: ChatTier, reportId: string): string {
  const id = encodeURIComponent(reportId);
  switch (tier) {
    case "snapshot":
      return `/api/snapshot/pdf?id=${id}`;
    case "snapshot-plus":
      return `/api/snapshot-plus/pdf?id=${id}`;
    case "blueprint":
      return `/api/pdf?id=${id}&type=blueprint`;
    case "blueprint-plus":
      return `/api/pdf?id=${id}&type=blueprint-plus`;
    default:
      return `/api/snapshot/pdf?id=${id}`;
  }
}

/**
 * Interpolate {firstName} into any chat template (greeting or welcomeBack).
 */
export function interpolateWelcomeBack(template: string, firstName: string): string {
  return template.replace(/\{firstName\}/g, firstName);
}

/**
 * Interpolate {firstName} into greeting or welcomeBack templates.
 * Alias for interpolateWelcomeBack — works on any template string.
 */
export function interpolateTemplate(template: string, firstName: string): string {
  return template.replace(/\{firstName\}/g, firstName);
}

/**
 * Extract a first name from the user's response to "What's your name?"
 * Handles inputs like "John", "John Smith", "My name is John", "I'm Sarah", "It's Mike", etc.
 */
export function extractFirstName(input: string): string {
  const trimmed = input.trim();

  // Remove common prefixes: "My name is", "I'm", "It's", "I am", "Call me", "Hi, I'm", etc.
  const cleaned = trimmed
    .replace(/^(hi[,!.]?\s*)?/i, "")
    .replace(/^(hey[,!.]?\s*)?/i, "")
    .replace(/^(hello[,!.]?\s*)?/i, "")
    .replace(/^(my name is|i'?\s*m|i am|it'?\s*s|call me|they call me|people call me|you can call me)\s+/i, "")
    .replace(/[.!,]+$/, "")
    .trim();

  // Take the first word as the first name
  const firstName = cleaned.split(/\s+/)[0] || trimmed;

  // Capitalize first letter
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}
