/** Visual chrome for labeled field cards (Response / Pillar / Proof, etc.). */
export type LabeledFieldChrome = {
  rail: string;
  bg: string;
  border: string;
  label: string;
};

const DEFAULT_CHROME: LabeledFieldChrome = {
  rail: "#07B0F2",
  bg: "#F8FBFF",
  border: "rgba(148, 163, 184, 0.45)",
  label: "#021859",
};

const RESPONSE_CHROME: LabeledFieldChrome = {
  rail: "#07B0F2",
  bg: "#EEF8FE",
  border: "rgba(7, 176, 242, 0.28)",
  label: "#0369A1",
};

const PILLAR_CHROME: LabeledFieldChrome = {
  rail: "#6366F1",
  bg: "#F5F3FF",
  border: "rgba(99, 102, 241, 0.28)",
  label: "#4338CA",
};

const PROOF_CHROME: LabeledFieldChrome = {
  rail: "#D97706",
  bg: "#FFFBEB",
  border: "rgba(217, 119, 6, 0.28)",
  label: "#92400E",
};

const GOAL_CHROME: LabeledFieldChrome = {
  rail: "#0D9488",
  bg: "#F0FDFA",
  border: "rgba(13, 148, 136, 0.28)",
  label: "#0F766E",
};

const SAY_CHROME: LabeledFieldChrome = {
  rail: "#07B0F2",
  bg: "#EEF8FE",
  border: "rgba(7, 176, 242, 0.28)",
  label: "#0369A1",
};

const ASK_CHROME: LabeledFieldChrome = {
  rail: "#2563EB",
  bg: "#EFF6FF",
  border: "rgba(37, 99, 235, 0.28)",
  label: "#1E40AF",
};

/**
 * Role-colored chrome for common strategy/activation field labels so Response /
 * Pillar / Proof (and siblings) scan as distinct layers, not one blue stack.
 */
export function chromeForLabeledField(label: string): LabeledFieldChrome {
  const key = label.trim().toLowerCase();
  if (!key) return DEFAULT_CHROME;

  if (
    /^(response|reply|say this|key message|supporting copy|email body)$/.test(key) ||
    key.includes("response") ||
    key.startsWith("say ")
  ) {
    return RESPONSE_CHROME;
  }
  if (/^(pillar|message pillar|pillar connection)$/.test(key) || key.includes("pillar")) {
    return PILLAR_CHROME;
  }
  if (
    /^(proof|proof point|show this|proof they need|how you hand it over)$/.test(key) ||
    key.startsWith("proof") ||
    key.startsWith("show ")
  ) {
    return PROOF_CHROME;
  }
  if (/^(goal|goal in the room|objective|use when)$/.test(key) || key.startsWith("goal")) {
    return GOAL_CHROME;
  }
  if (/^(ask this|listen for|question)$/.test(key) || key.startsWith("ask ") || key.startsWith("listen")) {
    return ASK_CHROME;
  }
  if (key.startsWith("say ") || key === "say this") {
    return SAY_CHROME;
  }

  return DEFAULT_CHROME;
}

/** Strip redundant "Acme reply:" / "Brand reply:" prefixes that duplicate the Response label. */
export function stripBrandReplyPrefix(value: string): string {
  return value.replace(/^[A-Za-z0-9 .&'’-]{1,48}\s+reply:\s*/i, "").trim();
}
