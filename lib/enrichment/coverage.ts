export type ContextCoverage = {
  pillar: string;
  covered: boolean;
};

export function buildContextCoverageMap(input: any): ContextCoverage[] {
  return [
    { pillar: "Positioning", covered: !!input.targetCustomers },
    { pillar: "Messaging", covered: !!input.messagingClarity },
    { pillar: "Visibility", covered: !!(input.website || input.socials?.length) },
    { pillar: "Credibility", covered: !!input.hasBrandGuidelines },
    { pillar: "Conversion", covered: !!input.offerClarity },
  ];
}

export function uncoveredPillars(coverage: ContextCoverage[]): string[] {
  return coverage.filter((item) => !item.covered).map((item) => item.pillar.toLowerCase());
}
