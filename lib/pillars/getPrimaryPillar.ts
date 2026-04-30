// lib/pillars/getPrimaryPillar.ts
// Primary pillar selection using Strategy v2 algorithm:
// 1) Upstream override check (Positioning, then Messaging)
// 2) Adjusted Priority Gap ranking with business-type multipliers
// 3) Upstream tie-break when values are within threshold

const PILLAR_ORDER = [
  "positioning",
  "messaging",
  "visibility",
  "credibility",
  "conversion",
] as const;

type PillarKey = (typeof PILLAR_ORDER)[number];
type BusinessType =
  | "service_b2b"
  | "service_b2c"
  | "retail"
  | "ecommerce"
  | "saas"
  | "local_service";

export type PrimaryPillarResult = {
  type: "single" | "tie";
  pillar: PillarKey;
  pillars?: PillarKey[];
};

const REVENUE_RISK_MULTIPLIERS: Record<BusinessType, Record<PillarKey, number>> = {
  service_b2b: {
    positioning: 1.3,
    messaging: 1.2,
    visibility: 1.0,
    credibility: 1.1,
    conversion: 1.0,
  },
  service_b2c: {
    positioning: 1.1,
    messaging: 1.0,
    visibility: 1.1,
    credibility: 1.3,
    conversion: 1.2,
  },
  retail: {
    positioning: 0.9,
    messaging: 1.0,
    visibility: 1.3,
    credibility: 1.2,
    conversion: 1.2,
  },
  ecommerce: {
    positioning: 1.0,
    messaging: 1.1,
    visibility: 1.2,
    credibility: 1.0,
    conversion: 1.3,
  },
  saas: {
    positioning: 1.2,
    messaging: 1.1,
    visibility: 1.0,
    credibility: 1.1,
    conversion: 1.3,
  },
  local_service: {
    positioning: 0.9,
    messaging: 0.85,
    visibility: 1.3,
    credibility: 1.3,
    conversion: 1.1,
  },
};

function normalizeBusinessType(input?: string | null): BusinessType | null {
  if (!input) return null;
  const value = String(input).toLowerCase().trim();
  if (value.includes("service_b2b")) return "service_b2b";
  if (value.includes("service_b2c")) return "service_b2c";
  if (value.includes("retail")) return "retail";
  if (value.includes("ecommerce")) return "ecommerce";
  if (value.includes("saas") || value.includes("software")) return "saas";
  if (value.includes("local_service") || value.includes("local")) return "local_service";
  return null;
}

function scoreOf(pillars: Record<string, number>, key: PillarKey): number {
  const raw = Number(pillars?.[key] ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(20, raw));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function getPrimaryPillar(
  pillars: Record<string, number>,
  options?: { businessType?: string | null },
): PrimaryPillarResult {
  const scores: Record<PillarKey, number> = {
    positioning: scoreOf(pillars, "positioning"),
    messaging: scoreOf(pillars, "messaging"),
    visibility: scoreOf(pillars, "visibility"),
    credibility: scoreOf(pillars, "credibility"),
    conversion: scoreOf(pillars, "conversion"),
  };

  // Pass 1: Upstream override check (threshold >= 4.0)
  const positioningGap =
    avg([scores.messaging, scores.visibility, scores.credibility, scores.conversion]) -
    scores.positioning;
  if (positioningGap >= 4) {
    return { type: "single", pillar: "positioning" };
  }

  const messagingGap =
    avg([scores.visibility, scores.credibility, scores.conversion]) - scores.messaging;
  if (messagingGap >= 4) {
    return { type: "single", pillar: "messaging" };
  }

  // Pass 2: Adjusted Priority Gap with business-type multipliers
  const businessType = normalizeBusinessType(options?.businessType);
  const multipliers = businessType
    ? REVENUE_RISK_MULTIPLIERS[businessType]
    : {
        positioning: 1,
        messaging: 1,
        visibility: 1,
        credibility: 1,
        conversion: 1,
      };

  const adjusted = PILLAR_ORDER.map((pillar) => ({
    pillar,
    value: (20 - scores[pillar]) * multipliers[pillar],
  })).sort((a, b) => b.value - a.value);

  const top = adjusted[0];
  const second = adjusted[1];
  if (!top) {
    return { type: "single", pillar: "positioning" };
  }

  // Tie / near-tie rule (within 0.5): upstream pillar wins.
  if (second && Math.abs(top.value - second.value) <= 0.5) {
    const tied = [top.pillar, second.pillar].sort(
      (a, b) => PILLAR_ORDER.indexOf(a) - PILLAR_ORDER.indexOf(b),
    );
    return { type: "tie", pillars: tied, pillar: tied[0] };
  }

  return { type: "single", pillar: top.pillar };
}
