import type { BlueprintPlusPromptPack } from "./types";

export const messagingCampaignExpansion: BlueprintPlusPromptPack = {
  pillar: "Messaging",
  expansionType: "Campaign",
  description:
    "Builds campaigns that reinforce your brand instead of fragmenting it.",
  prompts: [
    {
      id: "msg-camp-theme",
      title: "Campaign Message Spine",
      purpose: "Anchor campaigns to brand strategy",
      prompt: `
Create a campaign message spine using the brand’s core messaging.

Define:
• One unifying theme
• One primary takeaway
• One emotional hook

Ensure this campaign strengthens long-term brand memory,
not just short-term clicks.
      `.trim(),
    },
    {
      id: "msg-camp-sequence",
      title: "Campaign Narrative Flow",
      purpose: "Create message progression",
      prompt: `
Map a 5-touch campaign narrative.

Each touch should:
• Advance understanding
• Reinforce positioning
• Avoid repetition

Label each touch with its strategic role.
      `.trim(),
    },
  ],
};
