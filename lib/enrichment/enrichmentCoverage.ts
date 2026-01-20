export type EnrichmentCoverage = {
  percent: number;
  present: string[];
  missing: string[];
};

export function calculateEnrichmentCoverage(
  enrichment?: Record<string, any>
): EnrichmentCoverage {
  if (!enrichment) {
    return { percent: 0, present: [], missing: [] };
  }

  const fields = Object.entries(enrichment);
  const present = fields.filter(([, v]) => Boolean(v)).map(([k]) => k);
  const missing = fields.filter(([, v]) => !v).map(([k]) => k);

  return {
    percent: Math.round((present.length / fields.length) * 100),
    present,
    missing,
  };
}
