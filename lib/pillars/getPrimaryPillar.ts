// lib/pillars/getPrimaryPillar.ts
// Get the primary pillar, with tie detection

export function getPrimaryPillar(pillars: Record<string, number>) {
  const sorted = Object.entries(pillars ?? {}).sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (!top) {
    return { type: "single" as const, pillar: "positioning" };
  }

  if (second && top[1] === second[1]) {
    return {
      type: "tie" as const,
      pillars: [top[0], second[0]],
    };
  }

  return {
    type: "single" as const,
    pillar: top[0],
  };
}
