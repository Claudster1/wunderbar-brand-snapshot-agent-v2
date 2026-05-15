import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
import { mergeMessagesWithPriorSynthetic } from "@/lib/intake/priorAnswersResume";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Read-only bullets for the “What I've noted” panel — derived from user messages + prior tier JSON. */
export function buildCapturedSummary(
  messages: IntakeMessage[],
  priorAnswers?: Record<string, unknown> | null,
): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const seen = new Set<string>();

  const push = (label: string, value: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    items.push({ label, value });
  };

  if (priorAnswers) {
    if (str(priorAnswers.userName)) push("Name", priorAnswers.userName as string);
    if (str(priorAnswers.businessName)) push("Business", priorAnswers.businessName as string);
    if (str(priorAnswers.website)) push("Website", priorAnswers.website as string);
    else if (priorAnswers.website === null) push("Website", "Not on the web yet");
    if (Array.isArray(priorAnswers.socials) && priorAnswers.socials.length) {
      push("Social", (priorAnswers.socials as string[]).join(", "));
    }
    const audience = str(priorAnswers.idealCustomers) || str(priorAnswers.currentCustomers);
    if (audience) push("Audience", audience.slice(0, 140));
  }

  const merged = mergeMessagesWithPriorSynthetic(messages, priorAnswers ?? undefined);
  const users = merged
    .filter((m) => m.role === "user")
    .map((m) => (m.content || "").trim())
    .filter(Boolean);
  const corpus = users.join("\n");

  const first = users[0];
  if (first && first.length < 40 && !first.includes("@") && !/^https?:/i.test(first)) {
    push("Name", first);
  }

  const url =
    corpus.match(/\b(https?:\/\/[^\s]+|www\.[a-z0-9][-a-z0-9.]+\S*)/i)?.[1] ||
    corpus.match(/\b([a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app))\b/i)?.[1];
  if (url) push("Website", url.replace(/[.,;]+$/, ""));
  else if (/\b(no website|not on the web)\b/i.test(corpus)) push("Website", "Not on the web yet");

  const platforms: string[] = [];
  if (/\blinked\s*in|linkedin\b/i.test(corpus)) platforms.push("LinkedIn");
  if (/\bfacebook|fb\b/i.test(corpus)) platforms.push("Facebook");
  if (/\binstagram|\big\b/i.test(corpus)) platforms.push("Instagram");
  if (/\btiktok\b/i.test(corpus)) platforms.push("TikTok");
  if (/\byoutube|yt\b/i.test(corpus)) platforms.push("YouTube");
  if (platforms.length) push("Social", platforms.join(", "));
  else if (/\b(not active|no social)\b/i.test(corpus)) push("Social", "Not very active yet");

  if (/\b(agency|agencies|competitor)\b/i.test(corpus)) {
    const line = users.find((u) => /agency|competitor/i.test(u));
    if (line) push("Competition", line.slice(0, 120));
  }

  if (/\b(smbs?|startups?|customers?|clients?|ideal)\b/i.test(corpus)) {
    const line = users.find((u) => /smbs?|startup|ideal|customers?|launching/i.test(u));
    if (line) push("Audience", line.slice(0, 140));
  }

  return items.slice(0, 8);
}
