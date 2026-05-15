import type { IntakeMessage } from "@/lib/intake/buildIntakeTopicResume";

/** Routing-guard lines derived from prior structured JSON (upgrade / answers_only). */
export function buildPriorAnswerResumeLines(prior: Record<string, unknown>): string[] {
  const lines: string[] = [];

  const website = prior.website;
  if (typeof website === "string" && website.trim()) {
    lines.push(`PRIMARY WEBSITE (prior intake): ${website.trim()} — do **not** re-ask (§9).`);
  } else if (website === null || website === false) {
    lines.push("WEBSITE (prior intake): user indicated no website yet — do **not** re-ask (§9).");
  }

  const socials = prior.socials;
  if (Array.isArray(socials) && socials.length > 0) {
    lines.push(`SOCIAL (prior intake): ${socials.join(", ")} — do **not** re-ask (§10).`);
  } else if (socials === null || (Array.isArray(socials) && socials.length === 0)) {
    lines.push("SOCIAL (prior intake): not active on social — do **not** re-ask (§10).");
  }

  if (hasNonEmptyArray(prior.competitorNames)) {
    lines.push(
      `COMPETITORS (prior intake): ${(prior.competitorNames as string[]).slice(0, 5).join(", ")} — do **not** re-ask (§11).`,
    );
  }

  if (str(prior.currentCustomers)) {
    lines.push(`CURRENT CUSTOMERS (prior intake): on file — do **not** repeat §12.`);
  }
  if (str(prior.idealCustomers)) {
    lines.push(`IDEAL CUSTOMERS (prior intake): on file — do **not** repeat §13.`);
  }

  if (str(prior.businessType)) {
    lines.push(`BUSINESS TYPE (prior intake): ${prior.businessType} — do **not** re-ask classifier.`);
  }

  if (str(prior.whatMakesYouDifferent)) {
    lines.push("DIFFERENTIATION (prior intake): on file — do **not** re-ask §17.");
  }
  if (str(prior.biggestChallenge)) {
    lines.push("BIGGEST CHALLENGE (prior intake): on file — do **not** re-ask §16.");
  }
  if (str(prior.missionStatement)) {
    lines.push("PURPOSE / WHY (prior intake): on file — do **not** re-ask §18.");
  }
  if (str(prior.brandVoiceDescription)) {
    lines.push("BRAND VOICE (prior intake): on file — do **not** re-ask §21.");
  }

  if (typeof prior.hasEmailList === "boolean") {
    lines.push(`EMAIL LIST (prior intake): ${prior.hasEmailList ? "yes" : "no"} — do **not** re-ask.`);
  }
  if (typeof prior.hasLeadMagnet === "boolean") {
    lines.push(`LEAD MAGNET (prior intake): ${prior.hasLeadMagnet ? "yes" : "no"} — do **not** re-ask.`);
  }
  if (typeof prior.hasClearCTA === "boolean") {
    lines.push(`CTA CLARITY (prior intake): recorded — do **not** re-ask.`);
  }

  if (hasNonEmptyArray(prior.marketingChannels)) {
    lines.push(
      `MARKETING CHANNELS (prior intake): ${(prior.marketingChannels as string[]).slice(0, 8).join(", ")} — do **not** re-ask channel mix unless tier requires new detail.`,
    );
  }

  if (str(prior.monthlyRevenueRange) || str(prior.revenueRange)) {
    lines.push("REVENUE BASELINE (prior intake): on file — do **not** re-ask unless upgrading to a tier that needs updated figures.");
  }

  return lines;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function hasNonEmptyArray(v: unknown): boolean {
  return Array.isArray(v) && v.length > 0;
}

/** Synthetic corpus so topic-resume heuristics see prior tier content during answers_only upgrades. */
export function priorAnswersToSyntheticMessages(prior: Record<string, unknown>): IntakeMessage[] {
  const parts: string[] = [];
  const userName = str(prior.userName);
  if (userName) parts.push(userName);
  const businessName = str(prior.businessName);
  if (businessName) parts.push(`Business: ${businessName}`);
  const website = str(prior.website);
  if (website) parts.push(website);
  if (Array.isArray(prior.socials)) parts.push(`Social: ${prior.socials.join(" ")}`);
  const currentCustomers = str(prior.currentCustomers);
  if (currentCustomers) parts.push(`Customers today: ${currentCustomers}`);
  const idealCustomers = str(prior.idealCustomers);
  if (idealCustomers) parts.push(`Ideal customers: ${idealCustomers}`);
  if (hasNonEmptyArray(prior.competitorNames)) {
    parts.push(`Competitors: ${(prior.competitorNames as string[]).join(", ")}`);
  }
  const diff = str(prior.whatMakesYouDifferent);
  if (diff) parts.push(diff);
  const challenge = str(prior.biggestChallenge);
  if (challenge) parts.push(challenge);
  const mission = str(prior.missionStatement);
  if (mission) parts.push(mission);
  const voice = str(prior.brandVoiceDescription);
  if (voice) parts.push(voice);

  if (!parts.length) return [];
  return [{ role: "user", content: parts.join("\n") }];
}

export function mergeMessagesWithPriorSynthetic(
  messages: IntakeMessage[],
  prior: Record<string, unknown> | null | undefined,
): IntakeMessage[] {
  if (!prior) return messages;
  const synthetic = priorAnswersToSyntheticMessages(prior);
  if (!synthetic.length) return messages;
  return [...synthetic, ...messages];
}
