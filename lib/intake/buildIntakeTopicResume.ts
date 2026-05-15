/**
 * Full-thread intake signals for the brand-snapshot routing guard.
 * Derived from all user messages (not the truncated model window) to prevent replay loops.
 */

import {
  buildPriorAnswerResumeLines,
  mergeMessagesWithPriorSynthetic,
} from "@/lib/intake/priorAnswersResume";

export type IntakeMessage = { role: string; content?: string };

function userCorpus(messages: IntakeMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
}

function fullCorpus(messages: IntakeMessage[]): string {
  return messages.map((m) => m.content || "").join("\n");
}

export function buildIntakeTopicResumeLines(
  messages: IntakeMessage[],
  priorAnswers?: Record<string, unknown> | null,
): string[] {
  const mergedMessages = mergeMessagesWithPriorSynthetic(messages, priorAnswers ?? undefined);
  const users = userCorpus(mergedMessages);
  const all = fullCorpus(mergedMessages);
  if (!users.trim()) return [];

  const lines: string[] = [];
  const urlLike =
    /\b(https?:\/\/|www\.)\S+|[a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk|shop)(\b|[/.?#])/i;

  if (urlLike.test(users) || /\b(no website|no site yet|not on the web|not on the web yet)\b/i.test(users)) {
    lines.push(
      "PRIMARY WEBSITE / ONLINE HOME: already answered — do **not** ask for the URL again (playbook §9).",
    );
  }

  if (
    /\b(instagram|ig|linked\s*in|linkedin|tiktok|facebook|fb|meta|youtube|yt|threads|twitter|\bx\b|pinterest|snapchat|reddit|bluesky)\b/i.test(
      users,
    ) ||
    /@[a-z0-9_]{2,}/i.test(users) ||
    /\b(no social|not really on social|not active on social|none on social|linkedin, facebook)\b/i.test(users)
  ) {
    lines.push("SOCIAL PLATFORMS: already answered — do **not** re-run social discovery (playbook §10).");
  }

  if (
    /\b(competitor|competition|competing|versus|vs\.|who else|similar in your space|agencies targeting|marketing agencies|other (marketing )?agencies|look-alike)\b/i.test(
      all,
    )
  ) {
    lines.push("COMPETITORS / ALTERNATIVES: already discussed — do **not** re-ask competitor discovery (playbook §11).");
  }

  if (
    /\b(current customers?|customers today|who'?s actually buying|ideal customers?|perfect fit|client roster|no customers? yet|no clients? yet|just launching|don'?t have clients|targeting smbs?|smbs? and startups?|small,? medium|startups? who)\b/i.test(
      all,
    )
  ) {
    lines.push(
      "CURRENT / IDEAL CUSTOMERS: already explored — do **not** repeat the current-vs-ideal customer sequence (playbook §12–13).",
    );
  }

  if (
    /\b(service[- ]?based|b2b|b2c|saas|e-?commerce|how you (get paid|make money)|primarily (running|selling)|revenue model|marketing agency|consulting)\b/i.test(
      all,
    )
  ) {
    lines.push(
      "BUSINESS TYPE / REVENUE MODEL: already discussed — do **not** re-ask the business-type classifier unless they want to correct it.",
    );
  }

  if (/\b(email|newsletter|seo\b|\baeo\b|paid ads?|referrals?|word of mouth|partnerships?)\b/i.test(users)) {
    lines.push(
      "MARKETING SURFACES / CHANNELS: already mentioned — do **not** re-ask the broad “outside website and social” channel question unless a required capture is still pending in the routing guard.",
    );
  }

  if (/\b(trust|proof|price|clarity|speed|fit)\b/i.test(users) && /\b(competitor|choose|instead|over you|prospects?)\b/i.test(all)) {
    lines.push("COMPETITIVE PRESSURE: already answered — do **not** re-ask why prospects choose competitors.");
  }

  if (/\b(proprietary|different|unique|ai[- ]?driven|platform|what makes you|level the playing)\b/i.test(all)) {
    lines.push("DIFFERENTIATION: already covered — do **not** re-ask what makes them different (playbook §17).");
  }

  if (/\b(launching|scaling|biggest challenge|challenge with)\b/i.test(all)) {
    lines.push("BIGGEST CHALLENGE: already discussed — do **not** re-ask the magic-wand challenge question (playbook §16).");
  }

  if (/\b(mission|why behind|passionate about|fortune 500|deeper why|purpose)\b/i.test(all)) {
    lines.push("PURPOSE / WHY: already explored — do **not** restart purpose/direction discovery (playbook §18).");
  }

  if (/\b(very clear|somewhat clear|messaging|offer clarity|consistent)\b/i.test(all) && /\b(clear|messaging|offer)\b/i.test(all)) {
    lines.push("OFFER / MESSAGING CLARITY: already answered — do **not** re-ask clarity questions (playbook §19–20).");
  }

  if (/\b(voice|tone|approachable experts|brand speaks)\b/i.test(all)) {
    lines.push("BRAND VOICE: already answered — do **not** re-ask voice/tone (playbook §21).");
  }

  if (/\b(topics?|themes?|content pillars|brand foundation|consistency in messaging)\b/i.test(all)) {
    lines.push("KEY TOPICS: already answered — do **not** re-ask key themes (playbook §22).");
  }

  if (/\b(thought leadership|blog posts?|speaking|publicly|not yet|first ai)\b/i.test(all)) {
    lines.push("THOUGHT LEADERSHIP: already discussed — do **not** restart thought-leadership discovery (playbook §23).");
  }

  const priorLines = priorAnswers ? buildPriorAnswerResumeLines(priorAnswers) : [];
  const seen = new Set<string>();
  return [...priorLines, ...lines].filter((line) => {
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });
}

/** When server-side captures are complete, steer the model to wrap-up only. */
export function buildIntakeWrapUpGuardLines(
  messages: IntakeMessage[],
  captureCompletePercent: number,
  pendingCaptureLabels: string[],
): string[] {
  if (pendingCaptureLabels.length > 0 || captureCompletePercent < 100) return [];

  const userTurns = messages.filter((m) => m.role === "user").length;
  if (userTurns < 6) return [];

  return [
    "INTAKE CAPTURES COMPLETE (SERVER): All required tier captures are satisfied.",
    "Do **not** ask website, social, competitors, current/ideal customers, or business-type classifier again.",
    "Continue with the **next unanswered narrative playbook section** (§14+), or if those are done, deliver the **FINAL HANDOFF** message and output the closing JSON payload per system instructions.",
    "Never restart at playbook §9–13.",
  ];
}
