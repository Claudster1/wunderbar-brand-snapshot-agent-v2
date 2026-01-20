export { uncoveredPillars } from "@/lib/enrichment/coverage";

export type ContextCoverage = {
  total: number;
  completed: number;
  percentage: number;
  missing: string[];
};

const REQUIRED_CONTEXT_FIELDS = [
  "businessName",
  "industry",
  "website",
  "targetCustomers",
  "offerClarity",
  "messagingClarity",
  "brandVoiceDescription",
  "brandPersonalityWords",
  "marketingChannels",
  "visualConfidence",
];

export function calculateContextCoverage(
  input: Record<string, any>
): ContextCoverage {
  const missing = REQUIRED_CONTEXT_FIELDS.filter((field) => {
    const value = input[field];
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  });

  const completed = REQUIRED_CONTEXT_FIELDS.length - missing.length;

  return {
    total: REQUIRED_CONTEXT_FIELDS.length,
    completed,
    percentage: Math.round((completed / REQUIRED_CONTEXT_FIELDS.length) * 100),
    missing,
  };
}
