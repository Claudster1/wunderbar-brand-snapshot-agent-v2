export function getCoverageFollowUp(coverage: number) {
  if (coverage < 60) return "LOW_CONTEXT";
  if (coverage < 80) return "MID_CONTEXT";
  return null;
}
