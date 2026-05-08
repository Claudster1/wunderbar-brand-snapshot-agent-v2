/**
 * Phrases that mean the user is declining to answer a capture question.
 * Used by the brand-snapshot route and by prompt-anchored pairing so refusals don't rely on a global user corpus.
 */
export const CAPTURE_REFUSAL_PATTERN =
  /\b(skip|prefer not to answer|rather not|don'?t want to|do not want to|not sure|unsure|unknown|i don'?t know|\bidk\b|\bdunno\b|beats me|n\/a|no idea|rather skip|pass on (that|this)|not comfortable (sharing|answering)|hard to say|couldn'?t tell you)\b/i;
