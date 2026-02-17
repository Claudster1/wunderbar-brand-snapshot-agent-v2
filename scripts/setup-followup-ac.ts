/**
 * scripts/setup-followup-ac.ts
 *
 * One-time setup script to create the required ActiveCampaign
 * custom fields and tags for the follow-up email automation.
 *
 * Run with:
 *   npx tsx scripts/setup-followup-ac.ts
 *
 * (Requires ACTIVE_CAMPAIGN_API_KEY and ACTIVE_CAMPAIGN_API_URL in .env.local)
 */

import "dotenv/config";

// Load from .env.local if dotenv/config didn't pick it up
import { config } from "dotenv";
config({ path: ".env.local" });

import { ensureFollowupACResources } from "../lib/activeCampaign/sendFollowup";

async function main() {
  console.log("Setting up ActiveCampaign resources for follow-up emails...\n");

  const apiUrl = process.env.ACTIVE_CAMPAIGN_API_URL;
  const apiKey = process.env.ACTIVE_CAMPAIGN_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY in env.");
    process.exit(1);
  }

  console.log(`AC API URL: ${apiUrl}`);
  console.log(`AC API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}\n`);

  const result = await ensureFollowupACResources();

  console.log("\nCustom fields ensured:");
  for (const f of result.fields) {
    console.log(`  ✓ ${f}`);
  }

  console.log("\nTags ensured:");
  for (const t of result.tags) {
    console.log(`  ✓ ${t}`);
  }

  console.log("\n✅ Setup complete!");
  console.log("\nNext step: Create the AC automation (see instructions below).");
  console.log("─".repeat(60));
  console.log(`
ACTIVECAMPAIGN AUTOMATION SETUP
================================

You need ONE automation in ActiveCampaign to send the follow-up emails.

1. Go to ActiveCampaign → Automations → Create Automation
2. Start from scratch → Name it: "Send Follow-Up Email"

TRIGGER:
  • Tag is added → "followup:send"

ACTIONS (in order):
  a) Send Email
     - Subject line: Use personalization tag %FOLLOWUP_EMAIL_SUBJECT%
     - Body: Use personalization tag %FOLLOWUP_EMAIL_BODY%
     - From: Your preferred sender (e.g., hello@wunderbardigital.com)
     - Design tip: Create a simple, clean template that wraps the body content

  b) Remove Tag → "followup:send"
     (So the automation can be re-triggered for future follow-ups)

  c) Add Tag → "followup:sent"
     (For tracking purposes)

3. Set the automation to ACTIVE
4. Done! The review dashboard will now auto-send emails when you click
   "Approve & Send".

ALTERNATIVE (Two Automations by Session Type):
  • Trigger 1: Tag "followup:talk_to_expert" → uses a Talk to an Expert email template
  • Trigger 2: Tag "followup:activation_session" → uses a Strategy Activation email template
  • Both still remove the "followup:send" tag and add "followup:sent"
`);
}

main().catch(console.error);
