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

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide here at Wunderbar Digital. My job is to ask you the right questions so our diagnostic can give you a clear picture of where your brand stands today. It's a real conversation — not a quiz, no wrong answers, nothing to prepare. Just talk to me like you'd talk to a curious colleague who wants to understand your business. Ready when you are — let's get into it.`,

    welcomeBack: `Great to meet you, {firstName}.

Here's how this works — I'll ask you a series of questions about your business, your customers, and how your brand shows up in the world. Some will be easy, some might make you think a little. If anything feels unfamiliar or you're not sure how to answer, that's completely fine — just tell me what you know and I'll work with it.

For example, I might ask about your "positioning." That's really just a fancy way of saying: when someone finds you, what do you want them to think about you compared to the alternatives? If you already know that — great. If not, that's literally what we're here to figure out.

The whole thing takes about 15–20 minutes. If you need to step away, just tap "Save and continue later" below the chat — we'll email you a link to pick up right where you left off.

Ready when you are, {firstName}. Let's see where your brand stands.`,
  },

  // ─── WunderBrand Snapshot+™ ($497) ──────────────────────────────
  "snapshot-plus": {
    heading: "WUNDERBRAND SNAPSHOT+™",
    productName: "WunderBrand Snapshot+™",
    valueProp: "A deeper diagnostic with strategic recommendations tailored to your business.",
    timeEstimate: "about 15–20 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide here at Wunderbar Digital. I'm here to make sure our diagnostic gets everything it needs to give you a sharp, personalized picture of your brand — where you're strong, where there's opportunity, and what to focus on first. We're going to have a real conversation about your business, your customers, and how your brand shows up in the world. Some questions will be easy, some might make you think. Either way, I've got you — just answer naturally and we'll get where we need to go. Let's get started.`,

    welcomeBack: `Really glad to have you here, {firstName}.

Let me tell you what to expect. I'm going to ask you about your business, your audience, your competitors, and how your brand shows up across different touchpoints. We'll go a bit deeper than a standard Snapshot — that extra depth is what allows me to give you specific strategic recommendations, not just a score.

Plan on about 15–20 minutes. If I ask something that feels unfamiliar — like "brand pillars" or "messaging framework" — don't worry about it. I'll explain as we go, and I'll always give you an example so it's clear what I'm looking for. There's no wrong way to answer.

Your results will also include a Foundational Prompt Pack — 8 AI prompts built from your specific results that you can use in any AI tool to start building your brand platform right away.

If you need to step away, just tap "Save and continue later" below the chat — we'll email you a link to pick up right where you left off. No need to rush through it, {firstName}.

Let's get into it.`,
  },

  // ─── WunderBrand Blueprint™ ($997) ──────────────────────────────
  blueprint: {
    heading: "WUNDERBRAND BLUEPRINT™",
    productName: "WunderBrand Blueprint™",
    valueProp: "Your brand strategy, mapped — with an execution-ready action plan.",
    timeEstimate: "about 20–25 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide here at Wunderbar Digital. We've got a good conversation ahead of us. My job is to get a complete picture of your business — your positioning, your audience, how your brand shows up across every channel — so our diagnostic can build you something you can actually use. We'll cover more ground than a quick check-in, so take your time with each answer. No prep needed, no wrong answers — the more honest you are, the better your results will be. Let's get into it.`,

    welcomeBack: `{firstName}, welcome — this is going to be a great conversation.

WunderBrand Blueprint™ is designed to give you a complete strategic picture of your brand, with an execution-ready plan you can act on across your marketing. To get there, I'll ask you some deeper questions about your positioning, messaging, competitive landscape, and how you're reaching your audience today.

Plan on about 20–25 minutes. Some of these questions will be straightforward and some will ask you to think more strategically. If you're someone who lives and breathes marketing, you'll move through quickly. If some of this is newer territory, that's equally fine — I'll give you context and examples along the way. Like if I ask about your "go-to-market approach," I'm really just asking: how do people find you and what's the path from discovering you to becoming a customer?

Your results will include an Execution Prompt Pack — 8 AI prompts for building campaigns, email sequences, and content systems that stay aligned with your brand.

If you need to step away, just tap "Save and continue later" below the chat — we'll email you a link to pick up right where you left off. Take the time you need with the questions that matter most, {firstName} — that's where the real value comes from.

Let's map your brand.`,
  },

  // ─── WunderBrand Blueprint+™ ($1,997) ──────────────────────────
  "blueprint-plus": {
    heading: "WUNDERBRAND BLUEPRINT+™",
    productName: "WunderBrand Blueprint+™",
    valueProp: "The complete strategic diagnostic — with a 1:1 Strategy Activation Session.",
    timeEstimate: "about 25–35 minutes",

    greeting: `Hi {firstName}, I'm Wundy™ — your brand guide here at Wunderbar Digital. I want to make sure we get the most out of this conversation, because what comes out of it matters — your results feed directly into your Strategy Activation Session with our team. My job is to understand your business as thoroughly as possible — your positioning, your audience, your goals, and how your brand shows up across every touchpoint. We'll cover a lot of ground, and I'll be with you the whole way. Answer naturally, be as specific as you can, and don't worry if you don't have everything figured out — that's exactly what we're here for. Let's begin.`,

    welcomeBack: `{firstName}, thank you for investing in this — I want to make sure the experience matches the investment.

WunderBrand Blueprint+™ is the deepest strategic work we do, and the quality of your results and your Strategy Activation Session both depend on what we cover together here. I'll be asking you thoughtful questions about your positioning, messaging, audience, competitive landscape, funnel strategy, and go-to-market approach. That sounds like a lot, but we'll take it one step at a time and I'll make sure every question is clear.

Plan on about 25–35 minutes. If you're a seasoned marketer, some of this will feel like second nature. If you're earlier in the journey, don't let the terminology slow you down — I'll walk you through it. For example, when I ask about "funnel strategy," I'm really asking: what happens between someone hearing about you for the first time and them deciding to buy? Even if the answer is "I'm not sure yet," that's valuable information.

Your results will include an Advanced Prompt Library — 12 AI frameworks for persona-based messaging, funnel-stage campaigns, and stakeholder communications. And your complimentary 30-minute Strategy Activation Session will turn all of this into a prioritized action plan you can execute on.

Take your time with this, {firstName}. If you need to step away, just tap "Save and continue later" below the chat — we'll email you a link to pick up right where you left off. The more you share, the more we can build together.

It's helpful to have your website, audience info, key competitors, and any existing brand work you can reference — but work with what you have. The diagnostic meets you where you are.

Let's build something strategic.`,
  },
};

/**
 * Parse a tier from a URL query parameter.
 * Accepts formats like "snapshot-plus", "snapshot_plus", "blueprint", etc.
 * Returns "snapshot" (free) as the default if unrecognized.
 */
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
