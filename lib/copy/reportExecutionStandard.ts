/**
 * Shared rule: Suite reports deliver execution-ready artifacts (copy, criteria,
 * prompts) — not vague consulting to-do lists. Import into all report + engine prompts.
 */

export const reportExecutionReadyContentRule = `
EXECUTION-READY CONTENT (ALL WUNDERBRAND SUITE™ REPORTS — MANDATORY):
Products are judged on **usable output**: language teams can **paste, brief, or verify** — not a pile of reminders to "work on brand."

**Artifact-first (default)**
• Lead with **finished material** where the schema allows: exact headlines, CTAs, one-liners, email subject lines, positioning lines, proof bullets, channel lines, comparison tables, AI prompt bodies, talk tracks, discovery questions, and leave-behind lines written **for [businessName]** in **their brand voice / tone / archetype**.
• **"Actionable"** means **the deliverable exists in the text** — not only "you should improve X." If you name a gap (visibility, messaging, proof), include **concrete replacement copy or a binary check** (e.g. "Hero matches this line: \\"…\\"") not empty homework.

**Not a how-to guide**
• Do **not** write meta coaching ("Why ask this," "How to approach," "Separates messaging drift from ops…") as the main content.
• Write **ready-to-use scripts and assets**: what to **say**, what to **show**, what to **publish**, and what the buyer should hear next — using [businessName]'s vocabulary from intake and earlier report sections.
• Every example must be **specific to this company** (name, offer, ICP, proof, stage). Ban interchangeable B2B filler that could apply to any firm.

**Avoid vague task-speak**
• Ban bulk imperatives without artifacts: "improve messaging," "increase visibility," "align positioning," "build credibility," "audit the website," "optimize the funnel," "invest in content" **as the whole answer**. Pair every lever with **specific words, structures, or criteria** this business can use this week.

**Narrative vs. roadmap**
• **Synthesis, diagnosis, purpose, promise, pillar interpretations, archetype framing** stay **declarative** — stated beliefs, stakes, and clarity — **not** disguised project lists (see Brand Purpose rules in Blueprint prompts).
• **Sequenced work** belongs in fields designed for it: Strategic Action Plan (with howTo + example), roadmaps, activation plans, explicit checklist sections. There, steps must still name **outputs** ("Publish hero using: …") not "refine homepage."

**Checklists & QA blocks**
• Each item = **one verifiable criterion** or **ready comparison line** — not "do better on tone."

**Paired guidance labels**
• In layouts, prefer **Do This** / **Not This** for side-by-side guidance (AP-style title case on those headers). JSON may still use "use" and "avoid" array keys — list values are plain lines, not prefixed with "Avoid example" or "Avoid:".

**Capitalization (headings only)**
• Use **AP-style title case** for section titles, subheads, table headers, and short UI labels — not for body paragraphs or long explanatory copy. Lowercase articles (**a**, **an**, **the**), coordinating conjunctions (**and**, **but**, **for**, **or**, **nor**), and prepositions of **four or fewer letters** unless first or last word. No ALL CAPS for multi-word headings.

**Free WunderBrand Snapshot™**
• The three Immediate Clarity Actions must each be a **specific move** the reader recognizes as **doable this week** (with enough detail or sample wording that it is not generic advice).
`.trim();
