/**
 * scripts/setup-followup-ac.ts
 *
 * One-time setup script to create the required ActiveCampaign
 * custom fields and tags for the follow-up email automation.
 *
 * Run with:
 *   npx tsx scripts/setup-followup-ac.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  console.log("Setting up ActiveCampaign resources for follow-up emails...\n");

  const apiUrl = process.env.ACTIVE_CAMPAIGN_API_URL;
  const apiKey = process.env.ACTIVE_CAMPAIGN_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY in .env.local");
    process.exit(1);
  }

  console.log(`AC API URL: ${apiUrl}`);
  console.log(`AC API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}\n`);

  // Dynamic import so the module reads process.env AFTER dotenv has loaded
  const { ensureFollowupACResources } = await import("../lib/activeCampaign/sendFollowup");

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
     - From: Claudine Waters / hello@wunderbardigital.com

  b) Remove Tag → "followup:send"
     (So the automation can be re-triggered for future follow-ups)

  c) Add Tag → "followup:sent"
     (For tracking purposes)

3. Set the automation to ACTIVE
4. Done!
`);
}

main().catch(console.error);
