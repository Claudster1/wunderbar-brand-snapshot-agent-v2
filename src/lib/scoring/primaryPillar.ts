import { PillarKey } from "@/types/pillars";
import { getPrimaryPillar as getPrimaryPillarFromSpec } from "@/lib/pillars/getPrimaryPillar";

export function getPrimaryPillar(
  scores: Record<PillarKey, number>,
  businessType?: string | null,
): PillarKey {
  const result = getPrimaryPillarFromSpec(scores, { businessType });
  return (result.type === "single" ? result.pillar : result.pillars?.[0]) as PillarKey;
}
