import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";
import { mergeMessagesWithPriorSynthetic } from "@/lib/intake/priorAnswersResume";

export type CapturedSummaryItem = {
  id: string;
  label: string;
  value: string;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function pairs(messages: IntakeMessage[]): Array<{ q: string; a: string }> {
  const out: Array<{ q: string; a: string }> = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i]?.role !== "assistant") continue;
    const q = String(messages[i]?.content || "");
    for (let j = i + 1; j < messages.length; j++) {
      if (messages[j]?.role === "assistant") break;
      if (messages[j]?.role === "user") {
        const a = String(messages[j]?.content || "").trim();
        if (a && !/^(skip|n\/?a)$/i.test(a)) out.push({ q, a });
        break;
      }
    }
  }
  return out;
}

/** Editable bullets for “What I've noted” — Q&A pairs + prior JSON. */
export function buildCapturedSummary(
  messages: IntakeMessage[],
  priorAnswers?: Record<string, unknown> | null,
): CapturedSummaryItem[] {
  const items: CapturedSummaryItem[] = [];
  const seen = new Set<string>();

  const push = (id: string, label: string, value: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    items.push({ id, label, value: value.slice(0, 180) });
  };

  if (priorAnswers) {
    if (str(priorAnswers.userName)) push("name", "Name", priorAnswers.userName as string);
    if (str(priorAnswers.businessName)) push("business", "Business", priorAnswers.businessName as string);
    if (str(priorAnswers.website)) push("website", "Website", priorAnswers.website as string);
    else if (priorAnswers.website === null) push("website", "Website", "Not on the web yet");
    if (Array.isArray(priorAnswers.socials) && priorAnswers.socials.length) {
      push("social", "Social", (priorAnswers.socials as string[]).join(", "));
    }
    if (str(priorAnswers.geographicScope)) {
      push("geographic", "Geographic scope", priorAnswers.geographicScope as string);
    }
    if (str(priorAnswers.industry)) push("industry", "Industry", priorAnswers.industry as string);
    const audience = str(priorAnswers.idealCustomers) || str(priorAnswers.currentCustomers);
    if (audience) push("audience", "Audience", audience);
  }

  const merged = mergeMessagesWithPriorSynthetic(messages, priorAnswers ?? undefined);
  const qa = pairs(merged);
  const users = merged
    .filter((m) => m.role === "user")
    .map((m) => (m.content || "").trim())
    .filter(Boolean);
  const corpus = users.join("\n");

  const first = users[0];
  if (first && first.length < 40 && !first.includes("@") && !/^https?:/i.test(first) && !/^skip$/i.test(first)) {
    push("name", "Name", first);
  }

  for (const { q, a } of qa) {
    if (/\b(name of your business|business (called|name)|what('s| is) your business)\b/i.test(q)) {
      push("business", "Business", a);
    }
    if (/\b(primarily get paid|earn revenue|business model|services\/consulting)\b/i.test(q)) {
      push("model", "Business model", a);
    }
    if (/\b(website|url|landing page|not on the web)\b/i.test(q)) {
      push("website", "Website", a);
    }
    if (/\b(social|linkedin|instagram|platforms?)\b/i.test(q) && !/\bcompetitor\b/i.test(q)) {
      push("social", "Social", a);
    }
    if (
      /\b(geographic|locally|regionally|nationally|globally|serve customers|do business)\b/i.test(q)
    ) {
      push("geographic", "Geographic scope", a);
    }
    if (/\b(industry|what space|line of business)\b/i.test(q)) {
      push("industry", "Industry", a);
    }
    if (/\b(mainly sell to|b2b|b2c|audience type|who do you)\b/i.test(q)) {
      push("audience", "Audience", a);
    }
    if (/\b(your role|think about your role|founder)\b/i.test(q)) {
      push("role", "Role", a);
    }
    if (/\b(team size|how big is (your|the) team|how many people)\b/i.test(q)) {
      push("team", "Team size", a);
    }
    if (/\b(how long|years in business|been operating)\b/i.test(q)) {
      push("years", "Years operating", a);
    }
    if (/\b(6\s*[–-]\s*12|outcomes that matter|primary goals|hoping to achieve)\b/i.test(q)) {
      push("goals", "Goals", a);
    }
    if (/\b(biggest challenge|magic wand|struggle)\b/i.test(q)) {
      push("challenge", "Biggest challenge", a);
    }
    if (/\b(makes you different|competitive advantage|stand out|look-?alike)\b/i.test(q)) {
      push("differentiation", "Differentiation", a);
    }
    if (/\b(choose a competitor|competitive pressure|reason comes up most)\b/i.test(q)) {
      push("pressure", "Competitive pressure", a);
    }
    if (/\b(discovers you|acquisition|brand-?new prospect|usually happen)\b/i.test(q)) {
      push("acquisition", "How prospects find you", a);
    }
    if (/\b(how clear is your offer|offer to someone encountering)\b/i.test(q)) {
      push("offer", "Offer clarity", a);
    }
    if (/\b(customer proof|testimonials?|case stud)\b/i.test(q)) {
      push("proof", "Customer proof", a);
    }
    if (/\b(visual|brand looks|confident do you feel)\b/i.test(q)) {
      push("visual", "Visual confidence", a);
    }
    if (/\b(person in a room|brand personality|personality words)\b/i.test(q)) {
      push("voice", "Brand personality", a);
    }
    if (/\b(formal brand strategy|previous brand|diy work)\b/i.test(q)) {
      push("prior_brand", "Prior brand work", a);
    }
    if (/\b(content formats?|audience engages?|types? of content)\b/i.test(q)) {
      push("formats", "Content formats", a);
    }
  }

  const url =
    corpus.match(/\b(https?:\/\/[^\s]+|www\.[a-z0-9][-a-z0-9.]+\S*)/i)?.[1] ||
    corpus.match(/\b([a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app))\b/i)?.[1];
  if (url) push("website", "Website", url.replace(/[.,;]+$/, ""));
  else if (/\b(no website|not on the web)\b/i.test(corpus)) push("website", "Website", "Not on the web yet");

  const platforms: string[] = [];
  if (/\blinked\s*in|linkedin\b/i.test(corpus)) platforms.push("LinkedIn");
  if (/\bfacebook|fb\b/i.test(corpus)) platforms.push("Facebook");
  if (/\binstagram|\big\b/i.test(corpus)) platforms.push("Instagram");
  if (/\btiktok\b/i.test(corpus)) platforms.push("TikTok");
  if (/\byoutube|yt\b/i.test(corpus)) platforms.push("YouTube");
  if (platforms.length) push("social", "Social", platforms.join(", "));
  else if (/\b(not active|no social)\b/i.test(corpus)) push("social", "Social", "Not very active yet");

  return items.slice(0, 24);
}
