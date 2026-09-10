/**
 * Human sender identity for Snapshot transactional mail (results + resume).
 * Marketing/nurture stays on ActiveCampaign with brand-level From + preference language.
 *
 * From display name wraps the verified transactional mailbox (domain unchanged).
 * Override fully with TRANSACTIONAL_RESULTS_EMAIL_FROM if needed.
 */

export const TRANSACTIONAL_HUMAN_FROM_DISPLAY = "Claudine at Wunderbar Digital";

export const TRANSACTIONAL_HUMAN_SIGN_OFF_NAME = "Claudine Waters";
export const TRANSACTIONAL_HUMAN_SIGN_OFF_TITLE = "Founder · Wunderbar Digital";

/** Plain-text / HTML footer clarifying transactional (not promo) intent. */
export const TRANSACTIONAL_RESULTS_NOT_PROMO_FOOTER =
  "This is your Snapshot results link (not a promo).";

export const TRANSACTIONAL_RESUME_NOT_PROMO_FOOTER =
  "This is your saved diagnostic link (not a promo).";

export function transactionalHumanSignOffText(): string {
  return `— ${TRANSACTIONAL_HUMAN_SIGN_OFF_NAME}\n${TRANSACTIONAL_HUMAN_SIGN_OFF_TITLE}`;
}

/** Extract bare email from `Name <email@x>` or bare address. */
export function extractEmailAddress(from: string): string {
  const m = String(from || "").match(/<([^>]+)>/);
  if (m?.[1]) return m[1].trim();
  return String(from || "").trim();
}

/**
 * Build `Claudine at Wunderbar Digital <verified@domain>`.
 * Keeps the mailbox on the verified domain so Resend delivery stays valid.
 */
export function buildTransactionalHumanFrom(baseFrom: string): string {
  const dedicated = process.env.TRANSACTIONAL_RESULTS_EMAIL_FROM?.trim();
  if (dedicated) return dedicated;
  const email = extractEmailAddress(baseFrom);
  if (!email) {
    return `${TRANSACTIONAL_HUMAN_FROM_DISPLAY} <auth@mail.wunderbardigital.com>`;
  }
  return `${TRANSACTIONAL_HUMAN_FROM_DISPLAY} <${email}>`;
}
