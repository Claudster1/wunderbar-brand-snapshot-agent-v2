// api/brand-snapshot.ts

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    // Parse the body - Vercel may already parse it, but handle both cases
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('[API] Failed to parse body:', e);
      }
    }
    
    const { messages } = body || {};

    if (!messages || !Array.isArray(messages)) {
      console.error('[API] Invalid messages:', { messages, body, rawBody: req.body });
      res.status(400).json({ error: "Missing or invalid 'messages' array." });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] Missing OPENAI_API_KEY');
      res.status(500).json({ error: "Server configuration error. Please contact support." });
      return;
    }

    // Call OpenAI (this is now on the server, so your key is safe)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 800,
      messages,
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
      // Include the actual error message for debugging (remove in production if needed)
      errorMessage = err.message;
    }
    
    res.status(500).json({
      error: errorMessage,
    });
  }
}
