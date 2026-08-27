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
• Finished artifacts may use the brand’s own words. **Diagnostic and strategy narrative around those artifacts** must stay plain and defined (see PLAIN LANGUAGE rule) — artifact-first does not mean jargon-first.

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

/**
 * Shared rule: customer-facing report narrative must be readable by smart operators
 * who are not marketing specialists. Inject next to reportExecutionReadyContentRule.
 */
export const aiPlainLanguageCustomerOutputRule = `
PLAIN LANGUAGE — CUSTOMER OUTPUT (MANDATORY FOR ALL USER-FACING REPORT TEXT):
Applies to **every** suite tier: free WunderBrand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™.
Write for a smart founder, owner, or operator who may **not** live in brand/marketing jargon.

**Prefer concrete over prestige**
• Prefer everyday nouns and verbs over abstract strategy stacks.
• Ban empty consulting filler unless you replace it with a specific, company-named action or artifact. Examples to rewrite: "leverage synergies," "operationalize alignment," "unlock clarity," "drive brand equity," "messaging fragmentation," "conversion architecture," "authority playbook," "GTM motion," "execution governance," "visibility leverage."
• Depth means **specific recommendations and finished copy** — not dense jargon.

**Define useful terms once, then use them**
• Useful terms (ideal customer profile / ICP, call to action / CTA, positioning, conversion path, go-to-market / GTM, etc.) are allowed when you **define them in plain words on first use in that section**, then use the short form freely.
• Do **not** skip a short gloss on first use for core terms like positioning or messaging when those words carry the claim.
• Do not sacrifice accuracy for “simple.” Sacrifice prestige phrasing.

**Readable structure**
• Short sentences. One idea per sentence when possible.
• Tie every strategic claim to a business consequence the reader can act on this week or this quarter.

**Human, friendly, expert (not pushy) — ALL customer-facing paste fields**
Applies to **every** user-facing artifact: talk tracks, openers, closers, discovery questions, objection replies, homepage/hero/CTAs, messaging examples, email subjects and bodies, nurture, ads/social, pricing language, website copy, testimonial asks, competitive conversation cues, and illustrative examples in the report.

• Tone: approachable expert peer — warm, clear, confident. Never arrogant, lecture-y, guilt-tripping, or sales-aggressive.
• Sound like a helpful human colleague with real expertise — not a consultant taking over the meeting, and not a generic chatbot.
• Prefer natural language (contractions OK in spoken and email copy). Collaborative invites over commands. Prefer “Would it help if we…”, “Can we start with…”, “I’d love to understand…”, “If this matches what you’re seeing…” over “I want ten minutes…”, “I’ll need…”, “Before we talk X, you will…”, “You must…”.
• Ban controlling openers, meeting takeovers, and rude or demeaning frames about the prospect’s business.
• Ban urgency/FOMO gimmicks and shame frames in subjects and body copy by default (e.g. “blind spot … costing you”, “last chance”, “expires in X days”, “don’t miss out”, “Your competitors just…”) unless the company’s real brand voice is explicitly challenger/urgent — and even then keep respect.
• Do **not** prefix scripts with stage directions or meta labels inside the quote (no “Acme opener (Sage voice — calm, precise): …”). Put voice notes outside the spoken line if needed; the spoken line itself is only what the person says.
• “Decisive” and “stronger CTA” mean clear and useful — never pushy, pressuring, or belittling.
• Expertise shows as useful insight and respect for the buyer’s time — not jargon density or pressure.
`.trim();
