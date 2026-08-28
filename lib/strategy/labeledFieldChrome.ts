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

/**
 * Strip stage-direction / meta prefixes from spoken lines
 * (e.g. "Acme close (Sage): …", "Acme opener (Sage voice — calm): …").
 */
export function stripSpokenScriptMetaPrefix(value: string): string {
  let out = value.trim();
  out = out.replace(
    /^[A-Za-z0-9 .&'’-]{1,48}\s+(?:close|opener|opening|talk track)\s*(?:\([^)]*\))?\s*:\s*/i,
    "",
  );
  out = out.replace(/^offer:\s*/i, "");
  return out.trim();
}

/**
 * Soften common pushy / meeting-takeover phrasing in spoken scripts
 * so stored reports still read collaborative even if generated with older prompts.
 */
export function softenPushySpokenScript(value: string): string {
  let out = value.trim();
  out = out.replace(
    /\bBefore we talk\s+[^,.]+[,.]\s*I (?:want|need)\s+(?:\w+\s+)?(?:five|ten|fifteen|twenty|\d+)\s+minutes?\s+(?:on|about|for)\s+/gi,
    "Would it help if we start with a quick look at ",
  );
  out = out.replace(
    /\b(?:Give me|I(?:['’]ll)? take|I want to spend|I need to spend)\s+(?:\w+\s+)?(?:five|ten|fifteen|twenty|\d+)\s+minutes?\s+(?:on|about|for)\s+/gi,
    "Would it help if we spend a few minutes on ",
  );
  out = out.replace(
    /\bI (?:want|need)\s+(?:\w+\s+)?(?:five|ten|fifteen|twenty|\d+)\s+minutes?\s+(?:on|about|for)\s+/gi,
    "Would it help if we spend a few minutes on ",
  );
  out = out.replace(/\bI['’]ll map\b/gi, "we could map");
  out = out.replace(/\bI['’]ll need\b/gi, "it would help to");
  out = out.replace(/\bLet['’]s lock\b/gi, "Can we agree on");
  out = out.replace(/\bwe(?:['’]ll| will) lock\b/gi, "we can agree on");
  return out.trim();
}

/** Meta-prefix strip + pushy-phrase soften for customer-facing spoken lines. */
export function sanitizeSpokenCustomerScript(value: string): string {
  if (!value || typeof value !== "string") return "";
  return softenPushySpokenScript(stripSpokenScriptMetaPrefix(value));
}

type SalesGuideLike = {
  openingFramework?: string;
  closingLanguage?: string;
  talkTrackFramework?: Array<Record<string, unknown>>;
  discoveryQuestions?: Array<Record<string, unknown>>;
  proofPointDeployment?: Array<Record<string, unknown>>;
  objectionHandlingPlaybook?: Array<Record<string, unknown>>;
  personaConversationTracks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

function sanitizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return sanitizeSpokenCustomerScript(value);
}

/**
 * Sanitize Blueprint / Blueprint+ salesConversationGuide fields for UI + PDF
 * so every tier surfaces collaborative language, including older stored reports.
 */
export function sanitizeSalesConversationGuide<T extends SalesGuideLike | null | undefined>(
  guide: T,
): T {
  if (!guide || typeof guide !== "object") return guide;

  const next: SalesGuideLike = { ...guide };

  const opening = sanitizeOptionalString(next.openingFramework);
  if (opening !== undefined) next.openingFramework = opening;

  const closing = sanitizeOptionalString(next.closingLanguage);
  if (closing !== undefined) next.closingLanguage = closing;

  if (Array.isArray(next.talkTrackFramework)) {
    next.talkTrackFramework = next.talkTrackFramework.map((row) => {
      const keyMessage = sanitizeOptionalString(row.keyMessage ?? row.sayThis);
      const objective = sanitizeOptionalString(row.objective);
      const proofToUse = sanitizeOptionalString(row.proofToUse ?? row.proof);
      return {
        ...row,
        ...(keyMessage !== undefined ? { keyMessage } : {}),
        ...(objective !== undefined ? { objective } : {}),
        ...(proofToUse !== undefined ? { proofToUse } : {}),
      };
    });
  }

  if (Array.isArray(next.discoveryQuestions)) {
    next.discoveryQuestions = next.discoveryQuestions.map((row) => {
      const question = sanitizeOptionalString(row.question);
      const whyThisQuestion = sanitizeOptionalString(row.whyThisQuestion ?? row.useWhen);
      const listenFor = sanitizeOptionalString(row.listenFor);
      return {
        ...row,
        ...(question !== undefined ? { question } : {}),
        ...(whyThisQuestion !== undefined ? { whyThisQuestion } : {}),
        ...(listenFor !== undefined ? { listenFor } : {}),
      };
    });
  }

  if (Array.isArray(next.proofPointDeployment)) {
    next.proofPointDeployment = next.proofPointDeployment.map((row) => {
      const proofPoint = sanitizeOptionalString(row.proofPoint ?? row.proof);
      const howToDeliver = sanitizeOptionalString(row.howToDeliver ?? row.delivery);
      return {
        ...row,
        ...(proofPoint !== undefined ? { proofPoint } : {}),
        ...(howToDeliver !== undefined ? { howToDeliver } : {}),
      };
    });
  }

  if (Array.isArray(next.objectionHandlingPlaybook)) {
    next.objectionHandlingPlaybook = next.objectionHandlingPlaybook.map((row) => {
      const responseRaw = sanitizeOptionalString(row.response);
      const proofPoint = sanitizeOptionalString(row.proofPoint);
      return {
        ...row,
        ...(responseRaw !== undefined
          ? { response: stripBrandReplyPrefix(responseRaw) }
          : {}),
        ...(proofPoint !== undefined ? { proofPoint } : {}),
      };
    });
  }

  if (Array.isArray(next.personaConversationTracks)) {
    next.personaConversationTracks = next.personaConversationTracks.map((row) => {
      const openingVariation = sanitizeOptionalString(row.openingVariation);
      const closingApproach = sanitizeOptionalString(row.closingApproach);
      const samplePitch = sanitizeOptionalString(row.samplePitch);
      const presentationEmphasis = sanitizeOptionalString(row.presentationEmphasis);
      return {
        ...row,
        ...(openingVariation !== undefined ? { openingVariation } : {}),
        ...(closingApproach !== undefined ? { closingApproach } : {}),
        ...(samplePitch !== undefined ? { samplePitch } : {}),
        ...(presentationEmphasis !== undefined ? { presentationEmphasis } : {}),
        keyDiscoveryQuestions: Array.isArray(row.keyDiscoveryQuestions)
          ? row.keyDiscoveryQuestions.map((q) =>
              typeof q === "string" ? sanitizeSpokenCustomerScript(q) : q,
            )
          : row.keyDiscoveryQuestions,
        likelyObjections: Array.isArray(row.likelyObjections)
          ? row.likelyObjections.map((o) =>
              typeof o === "string" ? sanitizeSpokenCustomerScript(o) : o,
            )
          : row.likelyObjections,
      };
    });
  }

  return next as T;
}
