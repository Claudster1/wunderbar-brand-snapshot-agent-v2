/**
 * Shared rule: spell out abbreviations on first reference so readers without
 * marketing fluency can follow. Import into Wundy and engine prompts; use
 * `uiAbbreviationNote` / `PRODUCT_ACRONYM_GLOSSARY` in high-traffic UI surfaces.
 * Heading capitalization: `capitalizationPolicy.ts` (`aiApTitleCaseHeadingsRule`).
 */

export type ProductAcronymEntry = {
  /** Short form shown after first reference (e.g. CTA). */
  term: string;
  /** Expanded phrase without the acronym (e.g. call to action). */
  expanded: string;
  /** Plain-language glossary definition. */
  definition: string;
};

/**
 * Canonical product / marketing acronyms for Suite UI glossary + first-reference copy.
 * Prefer `firstReferenceForm(term)` in UI strings on first use in a section.
 */
export const PRODUCT_ACRONYM_GLOSSARY: readonly ProductAcronymEntry[] = [
  {
    term: "KPI",
    expanded: "key performance indicator",
    definition: "A measurable number that shows whether a goal is working (for example: qualified leads, conversion rate, or reply rate).",
  },
  {
    term: "CTA",
    expanded: "call to action",
    definition: "The next step you ask someone to take—usually a button or link (for example: “Review your plan”).",
  },
  {
    term: "ICP",
    expanded: "ideal customer profile",
    definition:
      "The customers you focus on first—who they are, what they need, and why they’re a good fit.",
  },
  {
    term: "ROI",
    expanded: "return on investment",
    definition: "What you get back relative to what you spent—time, money, or effort.",
  },
  {
    term: "SEO",
    expanded: "search engine optimization",
    definition: "Making your site easier to find in traditional search results (Google, Bing, and similar).",
  },
  {
    term: "AEO",
    expanded: "answer engine optimization",
    definition:
      "Making your expertise easy to surface in AI answers and featured-style results—not only classic search rankings.",
  },
  {
    term: "GTM",
    expanded: "go-to-market",
    definition:
      "Your practical plan for reaching and winning buyers—who first, which channels, what message, and how you use time and budget.",
  },
  {
    term: "JTBD",
    expanded: "jobs to be done",
    definition:
      "The job a buyer is trying to get done when they buy—progress they want, not just their job title.",
  },
  {
    term: "CRM",
    expanded: "customer relationship management",
    definition: "The system where leads, deals, and customer history live so marketing and sales share one picture.",
  },
  {
    term: "CMS",
    expanded: "content management system",
    definition: "The tool used to publish and update website pages and content.",
  },
  {
    term: "POV",
    expanded: "point of view",
    definition: "A clear stance or opinion your brand owns in content—so posts sound like you, not generic advice.",
  },
  {
    term: "QA",
    expanded: "quality assurance",
    definition: "A quick check before publish to confirm voice, proof, and next step still match your standards.",
  },
  {
    term: "SWOT",
    expanded: "strengths, weaknesses, opportunities, threats",
    definition: "A simple grid for weighing internal strengths/weaknesses against external opportunities and risks.",
  },
  {
    term: "B2B",
    expanded: "business-to-business",
    definition: "Selling to other companies (not individual consumers).",
  },
  {
    term: "B2C",
    expanded: "business-to-consumer",
    definition: "Selling directly to individual consumers.",
  },
  {
    term: "UTM",
    expanded: "campaign tracking tags",
    definition:
      "Short labels added to links so you can tell which campaign, email, or post drove a visit or form fill.",
  },
] as const;

const GLOSSARY_BY_TERM = new Map(
  PRODUCT_ACRONYM_GLOSSARY.map((e) => [e.term.toUpperCase(), e] as const),
);

/** First-reference form: “call to action (CTA)”. Falls back to the term if unknown. */
export function firstReferenceForm(term: string): string {
  const entry = GLOSSARY_BY_TERM.get(term.trim().toUpperCase());
  if (!entry) return term;
  return `${entry.expanded} (${entry.term})`;
}

/** Glossary row shape used by Suite tab intros. */
export function glossaryTerm(term: string, definitionOverride?: string): { term: string; definition: string } {
  const entry = GLOSSARY_BY_TERM.get(term.trim().toUpperCase());
  if (!entry) {
    return { term, definition: definitionOverride || "" };
  }
  return {
    term: `${entry.expanded} (${entry.term})`,
    definition: definitionOverride || entry.definition,
  };
}

export const aiAbbreviationFirstReferenceRule = `
ABBREVIATIONS — FIRST REFERENCE (MANDATORY FOR ALL USER-FACING OUTPUT):
• On first use in any response, report section, or UI string, spell out the full term, then give the abbreviation in parentheses. Example: "key performance indicator (KPI)" — then "KPI" is fine later in the same document or thread.
• Apply to common marketing and product terms, including (not limited to):
  - KPI — key performance indicator
  - CTA — call to action
  - ICP — ideal customer profile
  - ROI — return on investment
  - SEO — search engine optimization
  - AEO — answer engine optimization (or "AI and answer-based discovery" when that phrase is clearer)
  - GTM — go-to-market
  - JTBD — jobs to be done
  - WCAG — Web Content Accessibility Guidelines
  - CMS — content management system
  - CRM — customer relationship management
  - PDF — Portable Document Format (only if audience may not know)
  - UI / UX — user interface / user experience (spell on first use in a screen)
  - B2B / B2C — business-to-business / business-to-consumer (already often spelled in our flows; keep consistent)
  - POV — point of view
  - QA — quality assurance
  - SWOT — strengths, weaknesses, opportunities, threats
  - UTM — Urchin Tracking Module parameters (campaign link labels)
• Do not assume readers know pillar jargon (e.g. "conversion path") without a short plain-language gloss the first time.
• After first spell-out in a given email, page, or report section, you may use the short form freely.
`.trim();

/** Short line for tooltips, accordions, or tab intros (not a substitute for in-copy spell-out). */
export const uiAbbreviationNote =
  "We spell out abbreviations on first use (for example: key performance indicator (KPI), call to action (CTA), ideal customer profile (ICP), search engine optimization (SEO)).";
