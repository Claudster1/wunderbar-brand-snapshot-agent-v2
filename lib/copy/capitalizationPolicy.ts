/**
 * AP-style title case for headings and subheads only (not body paragraphs, bullets, or long prose).
 * Use with `abbreviationPolicy` in engines, Wundy, refinement, and follow-up prompts.
 */

export const aiApTitleCaseHeadingsRule = `
HEADINGS & SUBHEADS — AP-STYLE TITLE CASE (NOT BODY COPY):
• Apply this rule only to **titles, subtitles, section headings, eyebrow labels, table column headers, card headers, and UI subheads** — not to sentences, long descriptions, tooltips, or narrative paragraphs (those stay normal sentence capitalization).
• Follow Associated Press headline-style capitalization:
  – Capitalize the **first word** and **last word** of the heading.
  – Capitalize **principal words**: nouns, pronouns, verbs, adjectives, adverbs, and subordinating conjunctions longer than four letters (e.g. Because, Although, Whenever).
  – **Lowercase** articles (**a**, **an**, **the**); coordinating conjunctions (**and**, **but**, **for**, **or**, **nor**); and **prepositions of four or fewer letters** (e.g. **of**, **to**, **in**, **on**, **at**, **by**, **for**, **from**, **with**, **per**, **via**, **as**, **up**) unless they are the **first or last** word of the heading.
• Keep **trademarked product names** exactly as specified (e.g. WunderBrand Snapshot+™, Wundy™). Preserve **acronyms** in standard caps (ICP, CTA, SEO, SWOT, Q&A).
• Do **not** use ALL CAPS for multi-word headings; use title case in the string (no CSS forced uppercase for headings).
• Examples: "Diagnostic Confidence", "Score Ranges", "Brand Persona Profile", "Best Call to Action", "Voice & Expression", "In Use on Key Surfaces", "Before / After", "4.4 Do / Don't Examples".
`.trim();
