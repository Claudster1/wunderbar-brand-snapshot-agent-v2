// src/lib/context/contextCoverage.ts
// Calculate context coverage percentage from input data

export function calculateCoverage(inputs: {
  website?: string;
  socials?: string[];
  competitors?: string[];
  brandGuidelines?: boolean;
}): number {
  let score = 0;

  if (inputs.website) score += 25;
  if (inputs.socials?.length) score += 20;
  if (inputs.competitors?.length) score += 20;
  if (inputs.brandGuidelines) score += 15;

  return Math.min(score, 100);
}
