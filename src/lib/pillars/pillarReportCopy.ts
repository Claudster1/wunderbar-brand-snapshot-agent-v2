// src/lib/pillars/pillarReportCopy.ts
// Pillar-specific copy for the results report: stage copy, score bands, and biggest opportunity

import type { PillarKey } from "./pillarCopy";

export type BrandStage = "early" | "scaling" | "growing";

/** Why this pillar matters at your current stage — different per pillar and stage */
export function getPillarStageCopy(
  pillar: PillarKey,
  businessName: string,
  stage: BrandStage
): string {
  const name = businessName;
  const copy: Record<PillarKey, Record<BrandStage, string>> = {
    positioning: {
      early: `${name}'s positioning now sets the foundation everything else builds on — early clarity compounds fastest.`,
      scaling: `Inconsistent positioning slows ${name} as you add channels and team — alignment becomes critical.`,
      growing: `As ${name} scales, how you're understood in the market drives every other pillar — sharpen it first.`,
    },
    messaging: {
      early: `Getting ${name}'s message consistent now means it compounds as you grow — one voice, everywhere.`,
      scaling: `Mixed messaging creates confusion as ${name} expands — one clear story speeds every decision.`,
      growing: `At ${name}'s size, inconsistent messaging slows growth — align the narrative across touchpoints.`,
    },
    visibility: {
      early: `Making ${name} easier to find now pays off as you scale — discoverability compounds over time.`,
      scaling: `If ${name} is hard to find, even strong positioning goes unseen — visibility unlocks growth.`,
      growing: `As ${name} grows, being discoverable (search, AI, referrals) becomes a major growth lever.`,
    },
    credibility: {
      early: `Building ${name}'s trust signals now means every future touchpoint starts from strength.`,
      scaling: `Inconsistencies in how ${name} shows up erode trust — credibility accelerates conversion.`,
      growing: `At scale, ${name} needs to feel credible everywhere — proof points and consistency matter most.`,
    },
    conversion: {
      early: `Smoothing ${name}'s path from interest to action now shortens sales cycles as you grow.`,
      scaling: `Friction in how people say yes to ${name} slows growth — conversion clarity pays off fast.`,
      growing: `As ${name} scales, small conversion gaps compound — fix the path from interest to action.`,
    },
  };
  return copy[pillar][stage];
}

/** Score band label and short description (0–20 scale) */
export function getScoreBand(score: number): { label: string; description: string } {
  if (score >= 17) return { label: "Strong", description: "This pillar is a strength. Look for small refinements." };
  if (score >= 13) return { label: "Developing", description: "Solid base with clear room to improve." };
  if (score >= 9) return { label: "Needs focus", description: "Worth prioritizing — gains here will lift overall alignment." };
  return { label: "Critical opportunity", description: "Your biggest leverage; improving here will move the needle most." };
}

/** Short one-liner for biggest opportunity (shown when score < 20) */
export const PILLAR_OPPORTUNITY: Record<PillarKey, string> = {
  positioning: "Sharpen how you're understood at a glance — clarity on who you are and why you matter.",
  messaging: "Align your core message across every channel so your brand sounds intentional, not improvised.",
  visibility: "Make your brand easier to find and reference — SEO, AEO, and where you show up.",
  credibility: "Strengthen trust signals everywhere you show up — proof points, consistency, and social proof.",
  conversion: "Smooth the path from interest to action — remove friction and make the next step obvious.",
};

/** Expanded recommendation for biggest opportunity: actionable detail per pillar */
export const PILLAR_OPPORTUNITY_EXPANDED: Record<PillarKey, string> = {
  positioning:
    "Get one clear line that answers 'who you serve' and 'why you're different' and use it everywhere — homepage, bios, sales one-pagers. When positioning is fuzzy, everything downstream (messaging, ads, sales) stays inconsistent. Start by writing that line, testing it with a few ideal customers, then rolling it out across your main touchpoints.",
  messaging:
    "Pick one core message (the promise or outcome you want to own) and repeat it across your site, emails, and sales conversations. Right now your message may shift by channel or page; aligning on one story makes your brand feel intentional and builds trust. Draft a single 'hero message,' use it in 3 places this week, and note what resonates.",
  visibility:
    "Improve how people find you: tighten your site and content around the terms your ideal customers use (and how AI might cite you). Add a clear 'about' and value proposition so search and AI can surface you accurately. One high-impact step: audit your homepage and key pages — do they state who you are and who you're for in the first screen?",
  credibility:
    "Make proof visible: testimonials, case studies, or results where your audience already looks. Inconsistency (different tone, missing proof, outdated info) undermines trust. Choose one proof format (e.g. 3 short testimonials or one case study), place it prominently on your site and in sales materials, and keep it updated.",
  conversion:
    "Reduce friction between 'interested' and 'action': one clear primary CTA per page, a simple next step (e.g. book a call, get the guide), and no competing choices. Often the biggest win is making the one thing you want people to do obvious and easy. Map the path from first visit to conversion and remove or simplify one step.",
};
