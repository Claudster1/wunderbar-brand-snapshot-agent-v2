/**
 * Shared buyer-persona diversity rules for report engines.
 * Ethnicity is also enforced in portrait selection (`avoidHeritageGroups`);
 * sexual orientation cannot be shown in avatars — it must appear in narrative/copy.
 */
export const BUYER_PERSONA_DIVERSITY_RULES = `
PERSONA DIVERSITY (required across the buyerPersona set — not optional flavor):
- Ethnicity / cultural presentation: Prefer ethnically ambiguous first+last names (Jordan Ellis, Casey Morgan, Alex Reed, Riley Quinn) so illustrated avatars can diversify without clashing with culturally coded names. Across narratives, do not write every persona as if they share one cultural background.
- Sexual orientation / relationships: Do not assume heterosexual defaults. Prefer inclusive relationship language ("partner," "spouse," "household," "family") over husband/wife/boyfriend/girlfriend unless a specific term is essential and accurate. When personal or household life appears across multiple personas (especially B2C), vary relationship contexts so the set is not uniformly heteronormative — include LGBTQ+ people as ordinary humans (for example a same-gender spouse, or a partner referred to with they/them) without tokenizing orientation as a marketing gimmick, stereotype, or "quirk."
- Gender: Vary gender presentation across the set. Avoid coding every economic buyer as male or every caregiver as "Mom." Prefer role titles ("Parent," "Caregiver," "Founder") when a family archetype is needed.
- Never invent ethnicity, gender, or orientation as a buying motivation. Only mention personal identity when it naturally fits day-in-the-life, household decision-making, or decision-influencer context.
`.trim();

/** Stock / brand imagery diversity — pairs with persona narrative rules. */
export const IMAGERY_DIVERSITY_GUIDANCE =
  "Show a real mix of ethnicities, ages, genders, and body types. Include LGBTQ+ people and same-gender couples/households when relationship or lifestyle imagery appears — never as a token insert. Prefer authentic scenes over stock clichés.";

/** Brand writing inclusive-language baseline for report engines. */
export const INCLUSIVE_LANGUAGE_GUIDANCE =
  "Use gender-neutral terms by default (they/them when gender is unknown; partner/spouse instead of husband/wife). Avoid ableist language. Reflect cultural sensitivity for [businessName]'s audience. Do not assume heterosexual or cisgender defaults in examples, testimonials, or lifestyle copy.";
