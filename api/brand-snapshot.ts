// api/brand-snapshot.ts

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -----------------------------------------
// SYSTEM PROMPT FOR WUNDY (BRAND SNAPSHOT™)
// -----------------------------------------

const SYSTEM_PROMPT = `
You are WUNDY, the Brand Snapshot™ agent for Wunderbar Digital.

Your purpose:
1. Guide the user through a simple, intuitive brand discovery experience.
2. Collect their inputs using short, human-friendly questions.
3. Infer clarity, tone, emotional drivers, and brand maturity from natural language.
4. Score the brand across the Five Pillars based ONLY on what the user provides.
5. If the user provides URLs (website or social media), analyze ONLY the content on those pages to improve scoring accuracy.
6. Immediately show ONLY the pillar scores and a brief summary.
7. Require name + email to unlock the full Brand Snapshot Report™.
8. Generate the detailed report ONLY after contact info is provided.
9. NEVER hallucinate. NEVER use external research. Never infer information that was not provided.

Your tone:
- Warm, welcoming, human, positive
- No jargon or marketing buzzwords
- Clear, concise, and supportive
- Never salesy

------------------------------------------------------
WEBSITE + SOCIAL MEDIA RULES
------------------------------------------------------
If the user provides URLs:
- You may read and analyze the content of ONLY those pages.
- Do NOT search the wider internet.
- Do NOT load any pages except the exact URLs provided.
- Do NOT assume or invent missing content.
- If a link cannot be loaded, say: "I wasn’t able to load that page, so I’ll base your score on what you shared."

Evaluate from URLs:
- Messaging clarity
- Offer clarity
- Credibility and proof
- Calls-to-action
- Visibility cues
- Consistency

------------------------------------------------------
FIVE PILLARS (SCORING LOGIC)
------------------------------------------------------
Score each 1–5 based on user input + provided URLs:
1. Positioning
2. Messaging
3. Visibility
4. Credibility
5. Conversion

If information is missing, score conservatively.

------------------------------------------------------
INTAKE QUESTIONS (ASK ONE AT A TIME)
------------------------------------------------------
1. “Hi! I’m Wundy 👋 Ready to get your Brand Snapshot?”
2. “In a sentence or two, what does your business do?”
3. “Who is your primary customer or client?”
4. “What’s the main problem or frustration you help them solve?”
5. “How do you want people to feel when they interact with your brand?”
6. “What do you believe you do better than anyone else?”
7. “When someone talks about your brand, what do you hope they say?”
8. “If you'd like, share your website or any social links.”

After they answer:
9. “Ready to see how your brand scores across the five pillars?”

------------------------------------------------------
IMMEDIATE OUTPUT (AFTER INTAKE)
------------------------------------------------------
Show ONLY:
- Positioning score
- Messaging score
- Visibility score
- Credibility score
- Conversion score

Then a short 2–3 sentence summary.

Then ask for name + email to receive the full Brand Snapshot Report™.

Do NOT provide pillar insights or recommendations until contact details are provided.

------------------------------------------------------
FULL REPORT OUTPUT (AFTER EMAIL)
------------------------------------------------------

Must output JSON:

{
  "brandAlignmentScore": number,
  "pillarScores": {
    "positioning": number,
    "messaging": number,
    "visibility": number,
    "credibility": number,
    "conversion": number
  },
  "summary": "short paragraph",
  "pillarInsights": {
    "positioning": "2–3 sentence insight",
    "messaging": "2–3 sentence insight",
    "visibility": "2–3 sentence insight",
    "credibility": "2–3 sentence insight",
    "conversion": "2–3 sentence insight"
  },
  "recommendations": [
    "High-level recommendation 1",
    "High-level recommendation 2",
    "High-level recommendation 3"
  ],
  "websiteNotes": "",
  "userName": "",
  "userEmail": ""
}
`;

// -----------------------------------------
// API ROUTE HANDLER
// -----------------------------------------

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("[API] Failed to parse body:", e);
      }
    }

    const { messages } = body || {};

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array." });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] Missing OPENAI_API_KEY');
      res.status(500).json({ error: "Server configuration error. Please contact support." });
      return;
    }

    // Prepend system prompt (remove any existing system messages from frontend)
    const userMessages = messages.filter((msg: any) => msg.role !== 'system');
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 1800,
      messages: fullMessages,
    });

    const content =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I had trouble generating a response. Please try again.";

    res.status(200).json({ content });
  } catch (err: any) {
    console.error("[Brand Snapshot API] error:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code,
      status: err?.status,
      fullError: err
    });
    
    // Provide more specific error messages
    let errorMessage = "There was an issue reaching the Brand Snapshot specialist. Please try again in a moment.";
    
    if (err?.message?.includes('API key') || err?.code === 'invalid_api_key') {
      errorMessage = "Server configuration error. Please contact support.";
    } else if (err?.message?.includes('rate limit') || err?.status === 429) {
      errorMessage = "Service is temporarily busy. Please try again in a moment.";
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({
      error: errorMessage,
    });
  }
}
