import type { PillarKey } from "./pillarCopy";

export type BrandStage = "early" | "scaling" | "growing";

export function getPillarStageCopy(
  pillar: PillarKey,
  businessName: string,
  stage: BrandStage
): string {
  const name = businessName;
  const copy: Record<PillarKey, Record<BrandStage, string>> = {
    positioning: {
      early: `${name}\u2019s positioning today determines acquisition cost for the next 2\u20133 years \u2014 brands that define their position early spend significantly less to attract the right customers.`,
      scaling: `As ${name} adds channels, team members, and campaigns, positioning inconsistency becomes a multiplier problem \u2014 every misalignment compounds across every touchpoint.`,
      growing: `At ${name}\u2019s scale, how the market understands your brand drives margin, retention, and competitive defensibility \u2014 sharpening positioning protects the premium you\u2019ve earned.`,
    },
    messaging: {
      early: `Getting ${name}\u2019s core narrative right now creates a compounding asset \u2014 each new touchpoint reinforces the last instead of diluting it.`,
      scaling: `Inconsistent messaging across ${name}\u2019s channels means each interaction starts from scratch rather than building on previous ones \u2014 the cumulative trust gap widens with every new campaign.`,
      growing: `At ${name}\u2019s size, messaging precision is a margin lever \u2014 the gap between \u2018they\u2019re good\u2019 and \u2018they\u2019re the obvious choice\u2019 is often one sentence, consistently deployed.`,
    },
    visibility: {
      early: `Making ${name} discoverable in the right 2\u20133 channels now creates the organic foundation that makes every future marketing dollar work harder.`,
      scaling: `If ${name} isn\u2019t appearing where high-intent buyers are searching, even strong positioning and messaging never get the chance to work \u2014 visibility is the prerequisite for every other pillar.`,
      growing: `As buying behavior shifts toward AI-powered discovery, ${name}\u2019s visibility strategy must evolve \u2014 the brands that appear in AI-generated answers will capture the next wave of organic growth.`,
    },
    credibility: {
      early: `Building ${name}\u2019s trust signals now means every future touchpoint starts from a position of credibility rather than having to earn it from zero.`,
      scaling: `As ${name}\u2019s visibility grows, credibility gaps get amplified \u2014 more people seeing an inconsistent trust story means more qualified deals lost to competitors who simply look more established.`,
      growing: `At scale, ${name}\u2019s credibility needs active maintenance \u2014 proof points that powered early growth may not resonate with the next tier of customers you\u2019re targeting.`,
    },
    conversion: {
      early: `For ${name}, conversion infrastructure isn\u2019t a luxury \u2014 it\u2019s the difference between growing through intention and growing through luck.`,
      scaling: `Every percentage point of conversion improvement at ${name}\u2019s traffic level has outsized revenue impact \u2014 this is where operational leverage lives.`,
      growing: `As ${name} scales, the audience already exists \u2014 the highest-ROI investment is removing every unnecessary barrier between intent and action.`,
    },
  };
  return copy[pillar][stage];
}

export function getScoreBand(score: number): { label: string; description: string } {
  if (score >= 17)
    return {
      label: "Strong",
      description: "This pillar is performing well \u2014 focus on refinement, consistency at scale, and protecting this advantage."
    };
  if (score >= 13)
    return {
      label: "Developing",
      description: "A solid base with clear room for strategic improvement \u2014 targeted investment here will compound across the system."
    };
  if (score >= 9)
    return {
      label: "Needs focus",
      description: "This pillar is constraining performance in other areas \u2014 improving it will create cascading impact across your brand."
    };
  return {
    label: "Critical opportunity",
    description: "This is where focused effort will create the most disproportionate improvement in overall brand performance."
  };
}

export const PILLAR_OPPORTUNITY: Record<PillarKey, string> = {
  positioning: "Define how the market understands you \u2014 so the right customers self-select and the wrong ones don\u2019t waste your time.",
  messaging: "Codify one consistent narrative across every touchpoint \u2014 so each interaction compounds trust instead of starting from zero.",
  visibility: "Close the discovery gap between where your best customers search and where your brand appears \u2014 including AI-powered platforms.",
  credibility: "Deploy trust signals where buying decisions happen \u2014 so prospects choose with confidence instead of defaulting to safer alternatives.",
  conversion: "Remove the structural friction between interest and action \u2014 so the attention you generate becomes the revenue you deserve.",
};

export const PILLAR_OPPORTUNITY_EXPANDED: Record<PillarKey, string> = {
  positioning:
    "Write one sentence that answers \u2018who you serve, what you do, and why it matters\u2019 \u2014 then deploy it on your homepage hero, LinkedIn headline, email signature, and sales deck opening slide. When positioning is unclear, every downstream investment (messaging, campaigns, sales) underperforms. Test the statement with 3\u20135 ideal customers this week: if they can repeat it back accurately, you\u2019ve found your position.",
  messaging:
    "Define 3 messaging pillars \u2014 the strategic themes your brand always comes back to \u2014 and use them as the backbone of every piece of content, copy, and communication. Right now, your message likely shifts by channel and context, which prevents trust from compounding. Start by auditing your homepage, top social profile, and most-used email template: do they tell the same story?",
  visibility:
    "Audit the 5 highest-intent search queries your ideal customer uses when looking for what you offer. Then check: does your brand appear? If not, create one comprehensive, authoritative content piece for each query \u2014 structured so both search engines and AI assistants can surface it. The brands that invest in AEO (Answer Engine Optimization) now will own the discovery advantage for the next 3\u20135 years.",
  credibility:
    "Place your 3 strongest proof points where buying decisions actually happen: your homepage hero area, your pricing/services page, and the first follow-up email after an inquiry. Most brands bury proof on a testimonials page nobody visits. The fix is deployment, not collection \u2014 move your best evidence to the moments of highest buyer hesitation.",
  conversion:
    "Map the exact path from first visit to first conversion on your site. Count the clicks, choices, and distractions. Then reduce it to 3 steps maximum: arrive \u2192 understand the value \u2192 take one clear action. The most common conversion killer isn\u2019t missing features or wrong pricing \u2014 it\u2019s too many options competing for the same click.",
};
