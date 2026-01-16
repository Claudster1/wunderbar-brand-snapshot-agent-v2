// src/lib/context/coverage.ts
// Context coverage computation utilities

/**
 * Compute context coverage from a report object
 * Checks 10 key signals to determine coverage percentage
 */
export function computeContextCoverage(report: any): number {
  const totalSignals = 10;
  let present = 0;

  if (report.website) present++;
  if (report.socials?.length) present++;
  if (report.targetCustomers) present++;
  if (report.competitors?.length) present++;
  if (report.brandVoice) present++;
  if (report.marketingChannels?.length) present++;
  if (report.visualConfidence) present++;
  if (report.offerClarity) present++;
  if (report.messagingClarity) present++;
  if (report.brandConsistency) present++;

  return Math.round((present / totalSignals) * 100);
}
