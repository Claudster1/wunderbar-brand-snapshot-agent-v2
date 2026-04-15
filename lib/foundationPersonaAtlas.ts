import { buildPersonaPortraitSeed, dicebearPersonaPortraitUrlForPersona } from "@/lib/personaPortrait";

export type FoundationPersonaAtlasEntry = {
  key: string;
  tabLabel: string;
  title: string;
  role: string;
  portraitSrc: string;
  portraitAlt: string;
  /** Local `/assets/...` vs DiceBear URL */
  portraitRemote: boolean;
  goals: string[];
  fears: string[];
  messageAngle: string;
  channels: string;
  cta: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Pull buyer persona objects from diagnostic / full_report-shaped blobs. */
export function extractBuyerPersonasRaw(diagnostic: Record<string, unknown>): unknown[] {
  if (Array.isArray(diagnostic.buyerPersonas) && diagnostic.buyerPersonas.length > 0) {
    return diagnostic.buyerPersonas;
  }
  const bpe = asRecord(diagnostic.buyerPersonaEcosystem);
  if (bpe && Array.isArray(bpe.buyerPersonas) && bpe.buyerPersonas.length > 0) {
    return bpe.buyerPersonas;
  }
  return [];
}

function channelsFromPersona(o: Record<string, unknown>): string {
  const cp = o.channelPriority;
  if (Array.isArray(cp)) {
    return cp.map((c) => String(c).trim()).filter(Boolean).join(", ");
  }
  const s = asString(cp);
  return s || "LinkedIn, email, and high-intent landing pages.";
}

function goalsFromPersona(o: Record<string, unknown>): string[] {
  const out: string[] = [];
  const pm = asString(o.primaryMotivation);
  if (pm) out.push(pm);
  const cp = asString(o.contentPreferences);
  if (cp) out.push(cp);
  const sh = asString(o.sampleHeadline);
  if (sh) out.push(sh);
  if (out.length === 0) {
    out.push("Make a confident, low-regret buying decision with clear proof and ownership.");
  }
  return out.slice(0, 4);
}

function fearsFromPersona(o: Record<string, unknown>): string[] {
  const out: string[] = [];
  const cf = asString(o.coreFrustration);
  if (cf) out.push(cf);
  const or = asRecord(o.objectionAndResponse);
  const obj = or ? asString(or.objection) : "";
  if (obj) out.push(obj);
  const ds = asString(o.decisionStyle);
  if (ds && out.length < 2) out.push(`Decision style: ${ds}`);
  if (out.length === 0) {
    out.push("Wasting budget on vendors who cannot prove execution.");
  }
  return out.slice(0, 4);
}

function tabLabelFromRole(role: string, index: number): string {
  const r = role.trim();
  if (r.length > 0 && r.length <= 48) return r;
  if (r.length > 48) return `${r.slice(0, 45)}…`;
  return `Persona ${index + 1}`;
}

const STATIC_ATLAS: FoundationPersonaAtlasEntry[] = [
  {
    key: "static-vp-ops",
    tabLabel: "VP Operations",
    title: "Sarah Chen",
    role: "VP Operations",
    portraitSrc: "/assets/persona-icons/persona-vp-operations.svg",
    portraitAlt: "Illustrated portrait for Sarah Chen, VP Operations persona",
    portraitRemote: false,
    goals: [
      "Build coordination infrastructure before the next hiring wave.",
      "Reduce leadership escalations caused by cross-team misalignment.",
    ],
    fears: [
      "Buying another tool that creates implementation overhead.",
      "Failing to show finance-legible ROI for operations investments.",
    ],
    messageAngle: "", // filled at runtime in UI with brandName + topGap
    channels: "LinkedIn thought leadership, operations-focused landing pages, diagnostic call follow-up email.",
    cta: "Review my operations rollout plan",
  },
  {
    key: "static-cfo-coo",
    tabLabel: "CFO / COO",
    title: "David Park",
    role: "CFO / COO",
    portraitSrc: "/assets/persona-icons/persona-cfo-coo.svg",
    portraitAlt: "Illustrated portrait for David Park, CFO / COO persona",
    portraitRemote: false,
    goals: [
      "Increase revenue efficiency from current headcount investments.",
      "Reduce operational waste and duplicated execution costs.",
    ],
    fears: [
      "Unclear payback period and soft strategic claims without measurable outcomes.",
      "Platform risk that creates financial and change-management drag.",
    ],
    messageAngle: "",
    channels: "Executive summary, ROI email brief, finance-review one-pager.",
    cta: "See the financial impact model",
  },
  {
    key: "static-revops",
    tabLabel: "RevOps / Chief of Staff",
    title: "Alex Rivera",
    role: "Head of RevOps / Chief of Staff",
    portraitSrc: "/assets/persona-icons/persona-revops.svg",
    portraitAlt: "Illustrated portrait for Alex Rivera, RevOps / Chief of Staff persona",
    portraitRemote: false,
    goals: [
      "Create one trusted data narrative across GTM teams.",
      "Improve implementation confidence without adding integration sprawl.",
    ],
    fears: [
      "Conflicting data models and added systems complexity.",
      "Technical promises that are not operationally defensible.",
    ],
    messageAngle: "",
    channels: "Technical validation call, implementation doc, RevOps enablement sequence.",
    cta: "Validate integration and ownership plan",
  },
];

export function buildFoundationPersonaAtlasEntries(params: {
  diagnosticData: Record<string, unknown>;
  businessName: string;
  reportId?: string;
  topGap: string;
  primaryPillar: string;
}): FoundationPersonaAtlasEntry[] {
  const raw = extractBuyerPersonasRaw(params.diagnosticData);
  const brandName = params.businessName.trim() || "Your Brand";
  const pillar = params.primaryPillar.toLowerCase();
  const gap = params.topGap.toLowerCase();

  if (raw.length === 0) {
    return STATIC_ATLAS.map((row) => ({
      ...row,
      messageAngle:
        row.key === "static-vp-ops"
          ? `${brandName} helps operations leaders remove ${gap} with owner-ready rollout sequencing.`
          : row.key === "static-cfo-coo"
            ? `${brandName} improves ${pillar} outcomes with measurable impact on decision velocity and execution efficiency.`
            : `${brandName} gives RevOps leaders a clarity-first operating model that keeps cross-functional execution accountable.`,
    }));
  }

  return raw.slice(0, 3).map((item, index) => {
    const o = asRecord(item) ?? {};
    const personaName = asString(o.personaName) || asString(o.name) || `Persona ${index + 1}`;
    const role = asString(o.role) || asString(o.jobTitle) || "Decision maker";
    const seed = buildPersonaPortraitSeed({
      reportId: params.reportId,
      companyName: params.businessName,
      personaName,
      role,
      index,
    });
    const portraitSrc = dicebearPersonaPortraitUrlForPersona({
      seed,
      index,
      diagnostic: params.diagnosticData,
      personaName,
      personaRecord: o,
    });
    const ma = asString(o.messagingAngle) || asString(o.messaging_angle);
    const messageAngle =
      ma ||
      `${brandName} should speak to ${personaName} with proof, clear ownership, and ${pillar}-aligned outcomes—especially where ${gap} shows up in the buying path.`;

    return {
      key: `report-${index}-${personaName.slice(0, 24).replace(/\s+/g, "-")}`,
      tabLabel: tabLabelFromRole(role, index),
      title: personaName,
      role,
      portraitSrc,
      portraitAlt: `Generated illustration for buyer persona: ${personaName} (${role})`,
      portraitRemote: true,
      goals: goalsFromPersona(o),
      fears: fearsFromPersona(o),
      messageAngle,
      channels: channelsFromPersona(o),
      cta: asString(o.sampleCTA) || asString(o.sampleCta) || "Review the priority plan for your team",
    };
  });
}
