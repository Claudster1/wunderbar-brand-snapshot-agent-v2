// app/data/prompt-library.ts
// Central prompt library used for AI-ready brand workflows.

export const promptLibrary = {
  messaging: `
You are my brand voice assistant. Rewrite the following message in my defined tone:

Tone: {{tone}}

Brand Personality: {{persona}}

Message: {{input}}

  `,
  contentIdeas: `
Generate 20 high-performing content ideas based on my:

Audience: {{audience}}

Offer: {{offer}}

Tone: {{tone}}

  `,
  emailRewrite: `
Rewrite this email to match our brand style:

Tone: {{tone}}

Email: {{email}}

  `,
  adCopy: `
Write 5 variations of ad copy optimized for {{platform}}.

CTA: {{cta}}

Tone: {{tone}}

  `,
};


