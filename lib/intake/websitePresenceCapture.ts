/**
 * Website presence capture helpers — yes/URL/no-site must stay aligned across
 * flexible completion, forced prompts, chips, extract, and scoring.
 */

const WEBSITE_URL_RE =
  /\b(https?:\/\/|www\.)\S+|[a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk|shop)(\b|[/.?#])/i;

const WEBSITE_NO_SITE_RE =
  /\b(no|nope|don'?t|do not) (have|got)|not yet|no website|no site|instagram only|facebook only|linkedin only|linktr\.?ee|etsy only|marketplace only|coming soon|building (the )?site|not live|not on the web|social \/ marketplace only\b/i;

/** Chip / freeform affirmations that mean “I have a site” but do not supply a URL. */
const WEBSITE_AFFIRM_WITHOUT_URL_RE =
  /^(yes|yeah|yep|yup|sure)([,.!]|\s|$)|yes[,\s—–-]*(here'?s|i'?ll|i will|i can)?\s*(the\s+)?(url|link|website)|yes\s*[—–-]\s*i'?ll paste|i('?ll| will) paste (the )?(url|link)|we (do )?have (a )?(website|site)|i have (a )?(website|site)|our (website|site) (is|exists)|yes i have/i;

export const WEBSITE_PRESENCE_INITIAL_PROMPT =
  "**Do you have a website?** If yes, you can share the URL next — or say if you are not on the web yet.";

export const WEBSITE_PRESENCE_URL_FOLLOWUP_PROMPT =
  "**Great — what's the URL?** Paste the link (even a simple landing page or store). If you'd rather skip the link for now, say *skip for now*.";

export function textHasWebsiteUrl(text: string): boolean {
  return WEBSITE_URL_RE.test(String(text || ""));
}

export function textDeclaresNoWebsite(text: string): boolean {
  return WEBSITE_NO_SITE_RE.test(String(text || "").trim());
}

export function textAffirmsWebsiteWithoutUrl(text: string): boolean {
  const t = String(text || "").trim();
  if (!t || textHasWebsiteUrl(t) || textDeclaresNoWebsite(t)) return false;
  if (/^(yes|yeah|yep|yup|sure)\.?$/i.test(t.replace(/[""''`]/g, "").trim())) return true;
  return WEBSITE_AFFIRM_WITHOUT_URL_RE.test(t) && !textHasWebsiteUrl(t);
}

export function textSkipsWebsiteUrl(text: string): boolean {
  return /\b(skip( for now)?|no url|prefer not|rather not|don'?t (want to )?share|no link)\b/i.test(
    String(text || "").trim(),
  );
}

/** Capture completes only on URL, explicit no-site, or skip-after-affirm. */
export function websitePresenceUserSatisfiesCapture(userText: string): boolean {
  const t = String(userText || "").trim();
  if (!t) return false;
  return textHasWebsiteUrl(t) || textDeclaresNoWebsite(t) || textSkipsWebsiteUrl(t);
}

export function lastUserAndAssistant(
  messages: Array<{ role: string; content?: string }>,
): { lastAssistant: string; lastUser: string } {
  let lastAssistant = "";
  let lastUser = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!lastUser && m.role === "user") lastUser = m.content || "";
    if (!lastAssistant && m.role === "assistant") lastAssistant = m.content || "";
    if (lastUser && lastAssistant) break;
  }
  return { lastAssistant, lastUser };
}

/** True when we already got a yes (no URL) and must ask for the link next. */
export function shouldAskWebsiteUrlFollowUp(
  messages: Array<{ role: string; content?: string }>,
): boolean {
  const { lastAssistant, lastUser } = lastUserAndAssistant(messages);
  if (!textAffirmsWebsiteWithoutUrl(lastUser)) return false;
  // Assistant was on the website topic (initial or any website ask).
  return /\b(website|url|web address|domain|site to share|online home|landing page|not on the web)\b/i.test(
    lastAssistant,
  );
}

export function buildWebsitePresenceCaptureQuestion(
  messages?: Array<{ role: string; content?: string }>,
): string {
  if (messages && shouldAskWebsiteUrlFollowUp(messages)) {
    return WEBSITE_PRESENCE_URL_FOLLOWUP_PROMPT;
  }
  return WEBSITE_PRESENCE_INITIAL_PROMPT;
}

/** Initial yes/no chips vs URL follow-up chips. */
export function getWebsitePresenceSuggestedReplies(
  messages?: Array<{ role: string; content?: string }>,
): string[] {
  if (messages && shouldAskWebsiteUrlFollowUp(messages)) {
    return ["I'll paste the URL", "Skip for now", "Actually — no website yet"];
  }
  return ["Yes", "Yes — I'll paste the URL", "No website yet", "Social / marketplace only", "Coming soon"];
}

/** Create/build-a-site coaching is never a valid website capture turn. */
export function assistantSuggestsCreatingWebsite(content: string): boolean {
  const t = String(content || "");
  if (/\b(what'?s|share|paste|send|drop).{0,24}(url|link|website)\b/i.test(t)) return false;
  return /\b(create|build|launch|start|set up|make|need|should (get|have)|consider (getting|building))\b.{0,48}\b(a |your )?(website|site|homepage|web presence)\b/i.test(
    t,
  );
}

/** On-topic = asking for presence/URL, not inventing create-a-site advice. */
export function assistantWebsiteReplyLooksOnTopic(content: string): boolean {
  const t = String(content || "");
  if (assistantSuggestsCreatingWebsite(t)) return false;
  return /\b(do you have (a )?website|website url|what'?s (the )?url|share .{0,20}(url|link)|paste .{0,16}(url|link)|landing page or store|not on the web|online home|web address)\b/i.test(
    t,
  );
}

/**
 * Transcript implies they have a website even if no URL was captured
 * (bare yes / “I’ll paste” then skip / soft-skip after affirm).
 */
export function transcriptImpliesHasWebsite(
  messages: Array<{ role: string; content?: string }>,
): boolean {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content || "");
  if (users.some((u) => textHasWebsiteUrl(u))) return true;
  if (users.some((u) => textDeclaresNoWebsite(u))) return false;
  // Affirm near a website assistant ask
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role !== "user") continue;
    if (!textAffirmsWebsiteWithoutUrl(m.content || "")) continue;
    const prevAssistant = [...messages.slice(0, i)].reverse().find((x) => x.role === "assistant");
    if (
      prevAssistant &&
      /\b(website|url|web address|domain|site to share|landing|not on the web)\b/i.test(
        prevAssistant.content || "",
      )
    ) {
      return true;
    }
  }
  return false;
}

export function extractWebsiteUrlFromText(text: string): string | null {
  const users = String(text || "");
  const m = users.match(/\b(https?:\/\/[^\s]+|www\.[a-z0-9][-a-z0-9.]+(?:\/[^\s]*)?)/i);
  if (m?.[1]) return m[1].replace(/[.,;]+$/, "");
  const domain = users.match(
    /\b([a-z0-9][-a-z0-9]{0,48}\.(com|io|ai|co|org|net|app|dev|us|uk|shop))\b/i,
  );
  if (domain?.[1]) return `https://${domain[1]}`;
  return null;
}
