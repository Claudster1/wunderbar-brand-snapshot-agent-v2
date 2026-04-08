export type QualityContext = {
  businessName?: string;
  audience?: string;
  differentiator?: string;
  primaryPillar?: string;
};

export type SectionQualityReport = {
  sectionKey: string;
  score: number;
  passed: boolean;
  reasons: string[];
};

export type SectionsQualityReport = {
  overallScore: number;
  passed: boolean;
  threshold: number;
  criticalThreshold: number;
  failedSections: string[];
  reports: SectionQualityReport[];
};

const SECTION_THRESHOLD = 75;
const CRITICAL_SECTION_THRESHOLD = 82;
const CRITICAL_SECTIONS = new Set([
  "positioning_statement",
  "unique_value_proposition",
  "competitive_differentiation",
  "executive_summary",
  "conversion_strategy",
  "implementation_action_plan",
]);

const GENERIC_PATTERNS = [
  /\bthis brand\b/i,
  /\byour business\b/i,
  /\boptimi[sz]e results\b/i,
  /\bimprove results\b/i,
  /\bprimary buyer persona\b/i,
  /\brefreshed from workbook\b/i,
];

const CTA_PATTERNS = [
  /\bcta\b/i,
  /\bnext step\b/i,
  /\bbook\b/i,
  /\bschedule\b/i,
  /\bcontact\b/i,
  /\brequest\b/i,
  /\bstart\b/i,
  /\bapply\b/i,
  /\bdownload\b/i,
  /\bsign up\b/i,
];

const PROOF_PATTERNS = [
  /\bproof\b/i,
  /\bcase study\b/i,
  /\btestimonial\b/i,
  /\bresults?\b/i,
  /\boutcome\b/i,
  /\bevidence\b/i,
  /\bdata\b/i,
];

function containsAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

export function evaluateSectionQuality(
  sectionKey: string,
  rawText: unknown,
  context: QualityContext
): SectionQualityReport {
  const text = normalizeText(rawText);
  const reasons: string[] = [];

  if (!text) {
    return {
      sectionKey,
      score: 0,
      passed: false,
      reasons: ["Section is empty."],
    };
  }

  let score = 35; // base for non-empty, readable output
  const words = countWords(text);

  if (words >= 45) score += 8;
  else if (words >= 25) score += 4;
  else reasons.push("Section is short; add more concrete detail.");

  const businessName = normalizeText(context.businessName);
  const audience = normalizeText(context.audience);
  const differentiator = normalizeText(context.differentiator);
  const primaryPillar = normalizeText(context.primaryPillar);

  if (businessName && text.toLowerCase().includes(businessName.toLowerCase())) score += 14;
  else reasons.push("Missing explicit business-name personalization.");

  if (audience && text.toLowerCase().includes(audience.toLowerCase().slice(0, 24))) score += 10;
  else if (/\baudience|buyer|customer|prospect|persona\b/i.test(text)) score += 5;
  else reasons.push("Missing clear audience targeting language.");

  if (
    (differentiator && text.toLowerCase().includes(differentiator.toLowerCase().slice(0, 24))) ||
    /\bdifferentiat|position|white ?space|advantage\b/i.test(text)
  ) {
    score += 8;
  } else {
    reasons.push("Missing strong differentiation or positioning signal.");
  }

  if (containsAny(text, CTA_PATTERNS)) score += 10;
  else reasons.push("Missing explicit conversion next step / CTA language.");

  if (containsAny(text, PROOF_PATTERNS)) score += 8;
  else reasons.push("Missing proof or evidence framing.");

  if (primaryPillar && text.toLowerCase().includes(primaryPillar.toLowerCase())) score += 5;

  if (containsAny(text, GENERIC_PATTERNS)) {
    score -= 18;
    reasons.push("Contains generic/template phrasing.");
  }

  score = Math.max(0, Math.min(100, score));
  const threshold = CRITICAL_SECTIONS.has(sectionKey)
    ? CRITICAL_SECTION_THRESHOLD
    : SECTION_THRESHOLD;

  return {
    sectionKey,
    score,
    passed: score >= threshold,
    reasons,
  };
}

export function evaluateSectionsQuality(
  sections: Record<string, unknown>,
  context: QualityContext
): SectionsQualityReport {
  const reports = Object.entries(sections).map(([key, value]) =>
    evaluateSectionQuality(key, value, context)
  );

  if (reports.length === 0) {
    return {
      overallScore: 0,
      passed: false,
      threshold: SECTION_THRESHOLD,
      criticalThreshold: CRITICAL_SECTION_THRESHOLD,
      failedSections: [],
      reports,
    };
  }

  let weightedTotal = 0;
  let totalWeight = 0;
  for (const report of reports) {
    const weight = CRITICAL_SECTIONS.has(report.sectionKey) ? 1.35 : 1;
    weightedTotal += report.score * weight;
    totalWeight += weight;
  }
  const overallScore = Math.round(weightedTotal / Math.max(totalWeight, 1));
  const failedSections = reports
    .filter((report) => !report.passed)
    .map((report) => report.sectionKey);

  const criticalFailures = reports.some(
    (report) =>
      CRITICAL_SECTIONS.has(report.sectionKey) &&
      report.score < CRITICAL_SECTION_THRESHOLD
  );

  return {
    overallScore,
    passed:
      overallScore >= 80 &&
      !criticalFailures &&
      failedSections.length === 0,
    threshold: SECTION_THRESHOLD,
    criticalThreshold: CRITICAL_SECTION_THRESHOLD,
    failedSections,
    reports,
  };
}
