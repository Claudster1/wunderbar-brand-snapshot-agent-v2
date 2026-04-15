/**
 * Shared rule: spell out abbreviations on first reference so readers without
 * marketing fluency can follow. Import into Wundy and engine prompts; use
 * `uiAbbreviationNote` in high-traffic UI surfaces.
 * Heading capitalization: `capitalizationPolicy.ts` (`aiApTitleCaseHeadingsRule`).
 */

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
• Do not assume readers know pillar jargon (e.g. "conversion path") without a short plain-language gloss the first time.
• After first spell-out in a given email, page, or report section, you may use the short form freely.
`.trim();

/** Short line for tooltips, accordions, or tab intros (not a substitute for in-copy spell-out). */
export const uiAbbreviationNote =
  "We spell out abbreviations on first use (for example: key performance indicator (KPI), call to action (CTA)).";
