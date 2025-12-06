// src/services/dynamicInsights.ts
// Dynamic insight generation based on score severity and gap analysis

export interface PillarScores {
  positioning: number;
  messaging: number;
  visibility: number;
  credibility: number;
  conversion: number;
}

export type GapSeverity = "major" | "moderate" | "light";

/**
 * Determine gap severity based on score
 */
export function getGapSeverity(score: number): GapSeverity {
  if (score <= 8) return "major";
  if (score <= 12) return "moderate";
  return "light";
}

/**
 * Find the weakest pillar (lowest score)
 */
export function findWeakestPillar(pillars: PillarScores): {
  pillar: keyof PillarScores;
  score: number;
  severity: GapSeverity;
} {
  const entries = Object.entries(pillars) as [keyof PillarScores, number][];
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0];
  
  return {
    pillar: weakest[0],
    score: weakest[1],
    severity: getGapSeverity(weakest[1]),
  };
}

/**
 * Find strong pillars (score >= 16)
 */
export function findStrongPillars(pillars: PillarScores): (keyof PillarScores)[] {
  return Object.entries(pillars)
    .filter(([_, value]) => value >= 16)
    .map(([key]) => key as keyof PillarScores);
}

/**
 * Generate dynamic positioning insight
 */
export function positioningInsight(score: number, severity: GapSeverity): string {
  if (severity === "major") {
    return "Your positioning isn't yet giving people a clear reason to choose you over alternatives. This usually means your value proposition, audience segmentation, or differentiation isn't articulated enough to create demand or pricing power.";
  }
  
  if (severity === "moderate") {
    return "Your positioning has the right foundation, but it isn't sharply defined. With more focused messaging and clearer differentiation, you'll quickly improve recognition and perceived authority.";
  }
  
  return "Your positioning is headed in the right direction, but refining how you articulate your value can boost memorability and customer confidence.";
}

/**
 * Generate dynamic messaging insight
 */
export function messagingInsight(score: number, severity: GapSeverity): string {
  if (severity === "major") {
    return "Your messaging lacks clarity or consistency across touchpoints, which makes it harder for people to understand your offer quickly. This often impacts conversion and retention.";
  }
  
  if (severity === "moderate") {
    return "Your messaging communicates the essentials, but it's not consistently reinforcing your core narrative. Strengthening repetition and clarity will significantly improve brand recall.";
  }
  
  return "Your messaging is strong, but tightening structure, headlines, and emotional cues will help create a more compelling brand story.";
}

/**
 * Generate dynamic visibility insight
 */
export function visibilityInsight(score: number, severity: GapSeverity): string {
  if (severity === "major") {
    return "Your visibility is limiting your growth — not enough people are seeing your content, offers, or expertise. Increasing frequency and channel reach will bring immediate lift.";
  }
  
  if (severity === "moderate") {
    return "You're visible, but not consistently enough to stay top-of-mind. A predictable visibility rhythm will increase inbound awareness and trust.";
  }
  
  return "Your visibility is solid, but optimizing content formats and platform mix will help you reach more ideal customers with less effort.";
}

/**
 * Generate dynamic credibility insight
 */
export function credibilityInsight(score: number, severity: GapSeverity): string {
  if (severity === "major") {
    return "Your credibility markers don't yet reflect the quality of your work. Updating visuals, social proof, and authority content will dramatically increase buyer trust.";
  }
  
  if (severity === "moderate") {
    return "You have credibility, but it's not consistently communicated. More testimonials, cleaner design, and authority-building content will strengthen trust.";
  }
  
  return "Your credibility is strong—enhancing refinement and recency can elevate perception even further.";
}

/**
 * Generate dynamic conversion insight
 */
export function conversionInsight(score: number, severity: GapSeverity): string {
  if (severity === "major") {
    return "Your conversion flow likely contains friction points—unclear CTAs, missing steps, or unclear value communication. Fixing this creates fast revenue lift without new traffic.";
  }
  
  if (severity === "moderate") {
    return "Your conversion path works, but not as efficiently as it could. Simplifying steps and reinforcing messaging will increase action rates.";
  }
  
  return "Conversion is strong—tightening UX and adding social proof will push results even higher.";
}

/**
 * Generate dynamic insight for a specific pillar
 */
export function generatePillarInsight(
  pillar: keyof PillarScores,
  score: number
): string {
  const severity = getGapSeverity(score);
  
  switch (pillar) {
    case "positioning":
      return positioningInsight(score, severity);
    case "messaging":
      return messagingInsight(score, severity);
    case "visibility":
      return visibilityInsight(score, severity);
    case "credibility":
      return credibilityInsight(score, severity);
    case "conversion":
      return conversionInsight(score, severity);
    default:
      return "This pillar shows opportunity for improvement.";
  }
}

/**
 * Generate personalized upsell copy based on weakest pillar
 */
export function generateUpsellCopy(pillars: PillarScores): string {
  const weakest = findWeakestPillar(pillars);
  const dynamicInsight = generatePillarInsight(weakest.pillar, weakest.score);
  
  const pillarName = weakest.pillar.charAt(0).toUpperCase() + weakest.pillar.slice(1);
  
  return `Your biggest opportunity right now is:

🎯 **${pillarName}**  
Score: ${weakest.score}/20

${dynamicInsight}

Snapshot+ gives you the full roadmap to strengthen this area with personalized recommendations, examples, and next steps.`;
}

/**
 * Generate all pillar insights dynamically
 */
export function generateAllPillarInsights(pillars: PillarScores): {
  positioning: string;
  messaging: string;
  visibility: string;
  credibility: string;
  conversion: string;
} {
  return {
    positioning: generatePillarInsight("positioning", pillars.positioning),
    messaging: generatePillarInsight("messaging", pillars.messaging),
    visibility: generatePillarInsight("visibility", pillars.visibility),
    credibility: generatePillarInsight("credibility", pillars.credibility),
    conversion: generatePillarInsight("conversion", pillars.conversion),
  };
}

