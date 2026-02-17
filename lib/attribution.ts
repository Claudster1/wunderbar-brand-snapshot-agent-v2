// lib/attribution.ts
// First-visit attribution capture: referrer, UTM params, AI source detection.
// Runs client-side. Persists to localStorage and sends to /api/attribution.

const STORAGE_KEY = "wb_attribution";
const ANON_ID_KEY = "wb_anon_id";

/** Known AI referrer domains and their labels. */
const AI_DOMAINS: Record<string, string> = {
  "chat.openai.com": "chatgpt",
  "chatgpt.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "labs.perplexity.ai": "perplexity",
  "gemini.google.com": "gemini",
  "claude.ai": "claude",
  "copilot.microsoft.com": "copilot",
  "you.com": "you",
  "poe.com": "poe",
  "phind.com": "phind",
  "bard.google.com": "gemini",
};

export interface Attribution {
  anonymousId: string;
  referrer: string;
  referrerDomain: string;
  isAiReferral: boolean;
  aiSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string;
  screenWidth: number;
  capturedAt: number;
}

/** Generate or retrieve a stable anonymous visitor ID. */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

/** Extract domain from a full URL. */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Detect AI source from referrer domain. */
function detectAiSource(domain: string): string | null {
  if (!domain) return null;
  for (const [pattern, label] of Object.entries(AI_DOMAINS)) {
    if (domain === pattern || domain.endsWith(`.${pattern}`)) {
      return label;
    }
  }
  return null;
}

/** Parse UTM parameters from the current URL. */
function parseUtmParams(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
  };
}

/** Check if attribution has already been captured for this visitor. */
export function hasAttribution(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

/** Get stored attribution data. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Capture attribution on first visit.
 * Only runs once per visitor (checks localStorage).
 * Sends data to /api/attribution for Supabase persistence.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  if (hasAttribution()) return getAttribution();

  const referrer = document.referrer || "";
  const referrerDomain = extractDomain(referrer);
  const aiSource = detectAiSource(referrerDomain);
  const utms = parseUtmParams();
  const anonymousId = getAnonymousId();

  const attribution: Attribution = {
    anonymousId,
    referrer,
    referrerDomain,
    isAiReferral: !!aiSource,
    aiSource,
    utmSource: utms.utmSource ?? null,
    utmMedium: utms.utmMedium ?? null,
    utmCampaign: utms.utmCampaign ?? null,
    utmContent: utms.utmContent ?? null,
    utmTerm: utms.utmTerm ?? null,
    landingPage: window.location.pathname + window.location.search,
    screenWidth: window.innerWidth,
    capturedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));

  // Fire-and-forget to API
  fetch("/api/attribution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attribution),
  }).catch(() => {
    // Non-blocking — attribution still saved locally
  });

  return attribution;
}

/**
 * Link a known email to the stored attribution record.
 * Called when the user provides their email (e.g. after snapshot completion).
 */
export function linkEmailToAttribution(email: string, reportId?: string): void {
  if (typeof window === "undefined") return;
  const attribution = getAttribution();
  if (!attribution) return;

  fetch("/api/attribution", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      anonymousId: attribution.anonymousId,
      email,
      reportId,
    }),
  }).catch(() => {});
}
