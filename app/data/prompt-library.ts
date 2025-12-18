// app/data/prompt-library.ts
// Central prompt library used for AI-ready brand workflows.

export const promptLibrary = {
  messaging: `
You are my brand voice assistant. Rewrite the following message in my defined tone:

Tone: {{tone}}
Brand Personality: {{persona}}

Message: {{input}}
  `.trim(),

  contentIdeas: `
Generate 20 high-performing content ideas based on my:

Audience: {{audience}}
Offer: {{offer}}
Tone: {{tone}}
  `.trim(),

  emailRewrite: `
Rewrite this email to match our brand style:

Tone: {{tone}}
Email: {{email}}
  `.trim(),

  adCopy: `
Write 5 variations of ad copy optimized for {{platform}}.

CTA: {{cta}}
Tone: {{tone}}
  `.trim(),
} as const;

export type PromptLibraryKey = keyof typeof promptLibrary;


