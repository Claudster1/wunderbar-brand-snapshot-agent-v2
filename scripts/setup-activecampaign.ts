#!/usr/bin/env npx tsx
/**
 * ActiveCampaign Setup Script
 *
 * Creates all tags and custom fields needed for the WunderBrand nurture sequences.
 * Run once to seed your AC account, then build automations in the AC visual builder
 * using these tags as triggers and custom fields for email personalization.
 *
 * Usage:
 *   npx tsx scripts/setup-activecampaign.ts
 *
 * Required env vars:
 *   ACTIVE_CAMPAIGN_API_URL  — e.g. https://youraccountname.api-us1.com
 *   ACTIVE_CAMPAIGN_API_KEY  — your AC API key
 */

// ─── Config ───

const AC_API_URL = process.env.ACTIVE_CAMPAIGN_API_URL;
const AC_API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY;

if (!AC_API_URL || !AC_API_KEY) {
  console.error(
    "Missing env vars. Set ACTIVE_CAMPAIGN_API_URL and ACTIVE_CAMPAIGN_API_KEY."
  );
  process.exit(1);
}

function acHeaders() {
  return {
    "Api-Token": AC_API_KEY!,
    "Content-Type": "application/json",
  };
}

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// ─── Tags to create ───

const TAGS = [
  // ── Purchase tags ──
  "purchased:snapshot-plus",
  "purchased:blueprint",
  "purchased:blueprint-plus",
  "purchased:snapshot-plus-refresh",
  "purchased:blueprint-refresh",

  // ── Onboarding (trigger welcome sequences) ──
  "onboarding:snapshot",
  "onboarding:snapshot-plus",
  "onboarding:blueprint",
  "onboarding:blueprint-plus",

  // ── Completion ──
  "completed:snapshot",

  // ── Upgrade intent (nurture escalation) ──
  "intent:upgrade-snapshot-plus",
  "intent:upgrade-blueprint",
  "intent:upgrade-blueprint-plus",

  // ── Cross-sell services (after Blueprint+) ──
  "nurture:other-services",

  // ── Quarterly Refresh ──
  "refresh:eligible",
  "refresh:snapshot-plus-ready",
  "refresh:blueprint-ready",

  // ── Session (Blueprint+ strategy activation) ──
  "session:pending",
  "session:booked",
  "session:completed",

  // ── Report readiness ──
  "report:snapshot-ready",
  "report:snapshot-plus-ready",
  "report:blueprint-ready",
  "report:blueprint-plus-ready",

  // ── Checkout abandonment ──
  "checkout:abandoned",
  "checkout:abandoned:snapshot_plus",
  "checkout:abandoned:blueprint",
  "checkout:abandoned:blueprint_plus",

  // ── Save & resume ──
  "snapshot:paused",
  "snapshot:resume-link-sent",

  // ── NPS ──
  "nps:promoter",
  "nps:passive",
  "nps:detractor",
  "nps:snapshot:promoter",
  "nps:snapshot:passive",
  "nps:snapshot:detractor",
  "nps:snapshot_plus:promoter",
  "nps:snapshot_plus:passive",
  "nps:snapshot_plus:detractor",
  "nps:blueprint:promoter",
  "nps:blueprint:passive",
  "nps:blueprint:detractor",
  "nps:blueprint_plus:promoter",
  "nps:blueprint_plus:passive",
  "nps:blueprint_plus:detractor",

  // ── Reviews & testimonials ──
  "review:eligible",
  "testimonial:eligible",
  "testimonial:submitted",
  "testimonial:publishable",
  "case-study:interested",

  // ── Retention ──
  "retention:at-risk",

  // ── Lifecycle ──
  "lifecycle:lead",
  "lifecycle:customer",
  "lifecycle:advocate",
  "lifecycle:at-risk",

  // ── Call / Session follow-ups ──
  "call:expert-completed",
  "call:expert-scheduled",
  "session:activation-completed",
  "session:activation-scheduled",
  "followup:pending-review",
  "followup:sent-talk-to-expert",
  "followup:sent-activation-session",

  // ── No-shows ──
  "call:expert-no-show",
  "call:expert-canceled",
  "session:activation-no-show",
  "session:activation-canceled",
  "noshow:needs-followup",
  "noshow:rescheduled",
];

// ─── Custom fields to create ───

interface FieldDef {
  title: string;
  type: "text" | "textarea" | "date" | "dropdown" | "hidden";
}

const FIELDS: FieldDef[] = [
  // ── Contact info ──
  { title: "first_name_custom", type: "text" },

  // ── Product & purchase ──
  { title: "product_purchased", type: "text" },
  { title: "product_key", type: "text" },
  { title: "purchase_date", type: "text" },
  { title: "amount_paid", type: "text" },

  // ── Report ──
  { title: "report_link", type: "text" },
  { title: "report_id", type: "hidden" },
  { title: "dashboard_link", type: "text" },

  // ── Scores ──
  { title: "brand_alignment_score", type: "text" },
  { title: "weakest_pillar", type: "text" },

  // ── Upgrade path ──
  { title: "upgrade_product_name", type: "text" },
  { title: "upgrade_product_url", type: "text" },
  { title: "upgrade_price", type: "text" },
  { title: "services_url", type: "text" },

  // ── Refresh ──
  { title: "refresh_price", type: "text" },
  { title: "refresh_type", type: "text" },

  // ── NPS ──
  { title: "nps_score", type: "text" },
  { title: "nps_category", type: "text" },
  { title: "nps_tier", type: "text" },
  { title: "nps_date", type: "text" },
  { title: "nps_survey_link", type: "text" },
  { title: "testimonial_link", type: "text" },
  { title: "google_review_url", type: "text" },

  // ── Abandoned cart ──
  { title: "abandoned_product", type: "text" },
  { title: "abandoned_product_key", type: "hidden" },
  { title: "abandoned_product_url", type: "text" },
  { title: "abandoned_product_price", type: "text" },
  { title: "abandoned_date", type: "text" },

  // ── Resume ──
  { title: "resume_link", type: "text" },

  // ── Call / Session follow-ups ──
  { title: "last_call_type", type: "text" },
  { title: "last_call_date", type: "text" },
  { title: "last_call_strategist", type: "text" },
  { title: "followup_subject", type: "text" },
  { title: "followup_body", type: "textarea" },
  { title: "followup_session_type", type: "text" },
  { title: "followup_sent_date", type: "text" },

  // ── No-shows ──
  { title: "last_noshow_type", type: "text" },
  { title: "last_noshow_date", type: "text" },
];

// ─── Create tag (idempotent) ───

async function ensureTag(tagName: string): Promise<boolean> {
  // Check if exists
  const { res, data } = await fetchJson(
    `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
    { method: "GET", headers: acHeaders() }
  );
  if (res.ok && data.tags?.length) {
    const exact = data.tags.find(
      (t: { tag: string }) => t.tag === tagName
    );
    if (exact) return false; // Already exists
  }

  // Create
  const { res: createRes, data: createData } = await fetchJson(
    `${AC_API_URL}/api/3/tags`,
    {
      method: "POST",
      headers: acHeaders(),
      body: JSON.stringify({
        tag: { tag: tagName, tagType: "contact", description: "" },
      }),
    }
  );

  if (!createRes.ok) {
    console.error(`  FAIL: ${tagName}`, createData);
    return false;
  }
  return true;
}

// ─── Create custom field (idempotent) ───

async function ensureField(field: FieldDef): Promise<boolean> {
  // Check if exists
  const { res, data } = await fetchJson(
    `${AC_API_URL}/api/3/fields?search=${encodeURIComponent(field.title)}`,
    { method: "GET", headers: acHeaders() }
  );
  if (res.ok && data.fields?.length) {
    const exact = data.fields.find(
      (f: { title: string }) => f.title === field.title
    );
    if (exact) return false;
  }

  // Create
  const { res: createRes, data: createData } = await fetchJson(
    `${AC_API_URL}/api/3/fields`,
    {
      method: "POST",
      headers: acHeaders(),
      body: JSON.stringify({
        field: {
          type: field.type,
          title: field.title,
          descript: "",
          visible: 1,
          ordernum: 0,
        },
      }),
    }
  );

  if (!createRes.ok) {
    console.error(`  FAIL: ${field.title}`, createData);
    return false;
  }
  return true;
}

// ─── Main ───

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ActiveCampaign Setup — WunderBrand Nurture");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  API URL: ${AC_API_URL}`);
  console.log("");

  // ── Tags ──
  console.log(`Creating ${TAGS.length} tags...`);
  let tagsCreated = 0;
  let tagsExisted = 0;

  for (const tag of TAGS) {
    const created = await ensureTag(tag);
    if (created) {
      tagsCreated++;
      console.log(`  + ${tag}`);
    } else {
      tagsExisted++;
    }
  }
  console.log(
    `  Done: ${tagsCreated} created, ${tagsExisted} already existed.\n`
  );

  // ── Custom Fields ──
  console.log(`Creating ${FIELDS.length} custom fields...`);
  let fieldsCreated = 0;
  let fieldsExisted = 0;

  for (const field of FIELDS) {
    const created = await ensureField(field);
    if (created) {
      fieldsCreated++;
      console.log(`  + ${field.title} (${field.type})`);
    } else {
      fieldsExisted++;
    }
  }
  console.log(
    `  Done: ${fieldsCreated} created, ${fieldsExisted} already existed.\n`
  );

  // ── Summary ──
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Setup complete!");
  console.log(
    `  Tags:   ${tagsCreated} new / ${tagsExisted} existing = ${TAGS.length} total`
  );
  console.log(
    `  Fields: ${fieldsCreated} new / ${fieldsExisted} existing = ${FIELDS.length} total`
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log(
    "Next step: Build automations in the AC visual builder using"
  );
  console.log("these tags as triggers and custom fields for personalization.");
  console.log("See docs/ACTIVECAMPAIGN_AUTOMATIONS.md for full sequence specs.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
