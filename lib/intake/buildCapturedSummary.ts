import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";

/** Read-only bullets for the “What I've noted” panel — derived from user messages. */
export function buildCapturedSummary(messages: IntakeMessage[]): { label: string; value: string }[] {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => (m.content || "").trim())
    .filter(Boolean);
  if (!users.length) return [];

  const corpus = users.join("\n");
  const items: { label: string; value: string }[] = [];

  const first = users[0];
  if (first && first.length < 40 && !first.includes("@") && !/^https?:/i.test(first)) {
    items.push({ label: "Name", value: first });
  }

  const url =
    corpus.match(/\b(https?:\/\/[^\s]+|www\.[a-z0-9][-a-z0-9.]+\S*)/i)?.[1] ||
    corpus.match(/\b([a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app))\b/i)?.[1];
  if (url) {
    items.push({ label: "Website", value: url.replace(/[.,;]+$/, "") });
  } else if (/\b(no website|not on the web)\b/i.test(corpus)) {
    items.push({ label: "Website", value: "Not on the web yet" });
  }

  const platforms: string[] = [];
  if (/\blinked\s*in|linkedin\b/i.test(corpus)) platforms.push("LinkedIn");
  if (/\bfacebook|fb\b/i.test(corpus)) platforms.push("Facebook");
  if (/\binstagram|\big\b/i.test(corpus)) platforms.push("Instagram");
  if (/\btiktok\b/i.test(corpus)) platforms.push("TikTok");
  if (/\byoutube|yt\b/i.test(corpus)) platforms.push("YouTube");
  if (platforms.length) {
    items.push({ label: "Social", value: platforms.join(", ") });
  } else if (/\b(not active|no social)\b/i.test(corpus)) {
    items.push({ label: "Social", value: "Not very active yet" });
  }

  if (/\b(agency|agencies|competitor)\b/i.test(corpus)) {
    const line = users.find((u) => /agency|competitor/i.test(u));
    if (line) items.push({ label: "Competition", value: line.slice(0, 120) });
  }

  if (/\b(smbs?|startups?|customers?|clients?|ideal)\b/i.test(corpus)) {
    const line = users.find((u) => /smbs?|startup|ideal|customers?|launching/i.test(u));
    if (line) items.push({ label: "Audience", value: line.slice(0, 140) });
  }

  if (/\b(trust|proof|price|clarity)\b/i.test(corpus) && /\b(competitor|choose|instead)\b/i.test(corpus)) {
    const line = users.find((u) => /trust|proof|price/i.test(u));
    if (line) items.push({ label: "Competitive pressure", value: line.slice(0, 80) });
  }

  return items.slice(0, 8);
}
