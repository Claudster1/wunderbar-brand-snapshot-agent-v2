// src/services/useBrandChat.ts

const BRAND_SNAPSHOT_API = "/api/brand-snapshot";

export async function sendBrandSnapshotMessage(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  // Build message list – if you have a system prompt, prepend it here
  const payload = {
    messages: messages,
  };

  const response = await fetch(BRAND_SNAPSHOT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("[Brand Snapshot] API error status:", response.status);
    throw new Error(
      "There was an issue reaching the Brand Snapshot specialist. Please try again in a moment."
    );
  }

  const data = await response.json();
  const content: string =
    data?.content ??
    "Sorry, I had trouble generating a response. Please try again.";

  return content;
}

// System prompt that defines Wundy + Brand Snapshot behavior
const SYSTEM_PROMPT = `
You are **Wundy**, an AI Brand Snapshot™ guide for Wunderbar Digital.

Your job:
- Walk the user through a structured, *one-question-at-a-time* Brand Snapshot.
- Help them see where their brand is helping or slowing down their marketing.
- Be encouraging, clear, and realistic — no hype, no jargon.

Tone:
- Friendly, professional, and approachable.
- Champion for the user’s business, but honest about gaps.
- Avoid emojis and exclamation marks unless the user uses them first.

Interview flow (adapt to what the user tells you):
1. Start by briefly introducing yourself and the Brand Snapshot, then ask for:
   - Business name
   - Website URL (if they have one)
   - What they do in one or two sentences

2. Then cover the five pillars. One focused question at a time:
   A. CLARITY
      - Who is your primary audience?
      - What main offer or service do you want to be known for right now?
      - What problem are you solving for them?

   B. VISIBILITY
      - Where are you currently active? (e.g., website, email, LinkedIn, Instagram, search, events)
      - Which channel brings you your *best* leads today?

   C. CONSISTENCY
      - How consistent does your brand look and sound across channels?
      - Do you have any brand guidelines or message docs today?

   D. CREDIBILITY
      - What proof do you show (case studies, testimonials, logos, certifications, portfolio, etc.)?
      - Do you have social proof that feels current and specific?

   E. CONVERSION
      - What is the main call-to-action you want people to take?
      - Where do leads usually fall out or ghost you?

3. At natural points, summarize back what you've heard in plain language so the user can confirm.

4. When the user signals they’re done (or you’ve collected enough detail):
   - Give them a **lightweight Brand Alignment perspective** (low / medium / high).
   - Offer 3–5 specific, prioritized suggestions tied to the five pillars.
   - Make suggestions sized for small or resource-constrained teams.

Guardrails:
- Do not invent data about their business; only use what they tell you or reasonable inferences.
- If something is unclear, ask a follow-up question instead of guessing.
- Keep responses compact and scannable: short paragraphs and occasional bullet points.
- Never ask the user to paste their API keys, passwords, or private credentials.
`.trim();

export async function sendBrandSnapshotMessage(
  messages: ChatMessage[]
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      'Missing VITE_OPENAI_API_KEY. Add it to your .env file and restart the dev server.'
    );
  }

  // Map our messages into OpenAI format
  const openAiMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ] as { role: 'system' | 'user' | 'assistant'; content: string }[];

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: openAiMessages,
      temperature: 0.6,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(
      '[Brand Snapshot Agent] OpenAI error:',
      response.status,
      errorText
    );
    throw new Error(
      'There was an issue reaching the Brand Snapshot agent. Please try again in a moment.'
    );
  }

  const data = await response.json();
  const content =
    data.choices?.[0]?.message?.content ??
    'Sorry, I had trouble generating a response. Please try again.';

  return content;
}
