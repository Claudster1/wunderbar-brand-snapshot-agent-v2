#!/usr/bin/env node
// scripts/provision-ac-email-automations.mjs
//
// Idempotently provisions the AC custom fields and tags needed for:
//   • Email A — transactional snapshot-ready delivery
//   • Email C — welcome / first marketing touchpoint
//   • Engagement-decay automation (45-day inactivity → warning → stale tag)
//
// Also retroactively creates fields the snapshot route already tries to write but never had
// a matching field title for (silent data-loss bug). Once these exist, future snapshot
// completions will start populating them in AC.
//
// Run: `node scripts/provision-ac-email-automations.mjs` from project root.
// Requires ACTIVE_CAMPAIGN_API_URL + ACTIVE_CAMPAIGN_API_KEY in .env.local.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadDotenv(file) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotenv(path.join(projectRoot, ".env.local"));

const API_URL = process.env.ACTIVE_CAMPAIGN_API_URL;
const API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY;

if (!API_URL || !API_KEY) {
  console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY in .env.local.");
  process.exit(1);
}

const headers = {
  "Api-Token": API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function findTag(name) {
  const res = await fetch(`${API_URL}/api/3/tags?filters[search]=${encodeURIComponent(name)}`, { headers });
  if (!res.ok) throw new Error(`GET /tags: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.tags?.find((t) => t.tag === name) ?? null;
}

async function createTag(name, description = "") {
  const existing = await findTag(name);
  if (existing) return { id: existing.id, created: false };
  const res = await fetch(`${API_URL}/api/3/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tag: { tag: name, tagType: "contact", description } }),
  });
  if (!res.ok) throw new Error(`POST /tags: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { id: json.tag?.id, created: true };
}

async function findField(title) {
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/fields?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /fields: ${res.status} ${await res.text()}`);
    const json = await res.json();
    const fields = json.fields ?? [];
    const match = fields.find((f) => f.title === title);
    if (match) return match;
    if (fields.length < 100) return null;
    offset += 100;
  }
}

async function createField(title, type, descript = "") {
  const existing = await findField(title);
  if (existing) return { id: existing.id, created: false, type: existing.type };
  const res = await fetch(`${API_URL}/api/3/fields`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      field: { type, title, descript, visible: 1, ordernum: 0 },
    }),
  });
  if (!res.ok) throw new Error(`POST /fields: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { id: json.field?.id, created: true, type };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN
// ─────────────────────────────────────────────────────────────────────────────

const PLAN = {
  // Tags used by the new email automations. Tags auto-create on first apply, but explicit
  // creation makes them available in AC's segment-builder dropdown immediately.
  tags: [
    { name: "email:snapshot-delivery-sent", desc: "Applied by Automation A after Email A sends." },
    { name: "email:welcome-sent",           desc: "Applied by Automation C after Email C sends." },
    { name: "email:engagement-stale",       desc: "Applied to contacts inactive 45d+ and unresponsive to the warning email. Excludes them from marketing sends." },
    { name: "email:engagement-warning-sent", desc: "Internal marker — set when the engagement-decay warning email goes out." },
    { name: "email:re-engaged",             desc: "Applied when a stale/warning contact replies or re-opens. Rescues them from the decay flow." },
    { name: "content:opted_in",             desc: "Generic content-opt-in flag. Applied alongside any content:* preference tag." },
    { name: "content:marketing_trends",     desc: "Preference signal for marketing/growth content." },
    { name: "content:ai_updates",           desc: "Preference signal for AI tools / model updates content." },
    { name: "email:content-opt-marketing-trends", desc: "Email-segmentation tag mirroring content:marketing_trends." },
    { name: "email:content-opt-ai-updates", desc: "Email-segmentation tag mirroring content:ai_updates." },
  ],

  // Custom fields the snapshot route already attempts to populate via fireACEvent /
  // setContactFields. Most of these have never existed in AC (silent data-loss bug).
  // Creating them now lets the existing code start filling them on every snapshot.
  fields: [
    // Score / pillar fields used by email perstags.
    { title: "company_name",          type: "text", desc: "Lowercase mirror of 'Company Name'. Matches the snake_case key the snapshot route writes." },
    { title: "primary_pillar",        type: "text", desc: "Strongest brand pillar from the snapshot (positioning/messaging/visibility/credibility/conversion)." },
    { title: "positioning_score",     type: "text", desc: "Positioning pillar score (0-100)." },
    { title: "messaging_score",       type: "text", desc: "Messaging pillar score (0-100)." },
    { title: "visibility_score",      type: "text", desc: "Visibility pillar score (0-100)." },
    { title: "credibility_score",     type: "text", desc: "Credibility pillar score (0-100)." },
    { title: "conversion_score",      type: "text", desc: "Conversion pillar score (0-100)." },

    // Snapshot demographic / business signal fields (used in personalization + segmentation).
    { title: "business_type",         type: "text", desc: "B2B / B2C / DTC / etc. — captured during snapshot intake." },
    { title: "experience_tier",       type: "text", desc: "Product tier the contact most recently engaged with (snapshot / blueprint / etc.)." },
    { title: "experience_survey_link", type: "text", desc: "Personalized post-snapshot experience survey link." },
    { title: "monthly_revenue_range", type: "text", desc: "Monthly revenue range from snapshot intake." },
    { title: "average_transaction_value", type: "text", desc: "Average transaction value from snapshot intake." },
    { title: "conversion_rate_estimate", type: "text", desc: "Self-reported conversion rate from snapshot intake." },
    { title: "primary_acquisition_channel", type: "text", desc: "Primary customer-acquisition channel from snapshot intake." },
    { title: "monthly_marketing_budget", type: "text", desc: "Monthly marketing budget from snapshot intake." },
    { title: "content_creation_capacity", type: "text", desc: "Self-reported content creation capacity from snapshot intake." },

    // Namespaced snapshot_* fields written by the snapshot route's secondary setContactFields call.
    { title: "snapshot_business_type",              type: "text", desc: "Namespaced snapshot signal — business type." },
    { title: "snapshot_primary_revenue_driver",     type: "text", desc: "Namespaced snapshot signal — primary revenue driver." },
    { title: "snapshot_monthly_revenue_range",      type: "text", desc: "Namespaced snapshot signal — monthly revenue range." },
    { title: "snapshot_average_transaction_value",  type: "text", desc: "Namespaced snapshot signal — average transaction value." },
    { title: "snapshot_conversion_rate_estimate",   type: "text", desc: "Namespaced snapshot signal — conversion rate estimate." },
    { title: "snapshot_primary_acquisition_channel", type: "text", desc: "Namespaced snapshot signal — primary acquisition channel." },
    { title: "snapshot_monthly_marketing_budget",   type: "text", desc: "Namespaced snapshot signal — monthly marketing budget." },
    { title: "snapshot_content_creation_capacity",  type: "text", desc: "Namespaced snapshot signal — content creation capacity." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE
// ─────────────────────────────────────────────────────────────────────────────

const results = { tags: [], fields: [] };
let exitCode = 0;

console.log("\nProvisioning AC objects for email automations...\n");

for (const { name, desc } of PLAN.tags) {
  try {
    const out = await createTag(name, desc);
    results.tags.push({ name, ...out });
  } catch (err) {
    results.tags.push({ name, error: err.message });
    exitCode = 1;
  }
}

for (const { title, type, desc } of PLAN.fields) {
  try {
    const out = await createField(title, type, desc);
    results.fields.push({ title, type, ...out });
  } catch (err) {
    results.fields.push({ title, type, error: err.message });
    exitCode = 1;
  }
}

console.log("=== TAGS ===");
for (const t of results.tags) {
  if (t.error) console.log(`  ✗ ${t.name}  ERROR: ${t.error}`);
  else console.log(`  ${t.created ? "✓ created" : "= existing"}  ${t.name}  (id=${t.id})`);
}

console.log("\n=== FIELDS ===");
for (const f of results.fields) {
  if (f.error) console.log(`  ✗ ${f.title} (${f.type})  ERROR: ${f.error}`);
  else console.log(`  ${f.created ? "✓ created" : "= existing"}  ${f.title.padEnd(40)} (${f.type})  (id=${f.id})`);
}

const tagsCreated = results.tags.filter((t) => t.created).length;
const tagsExisting = results.tags.filter((t) => t.created === false).length;
const tagsFailed = results.tags.filter((t) => t.error).length;
const fieldsCreated = results.fields.filter((f) => f.created).length;
const fieldsExisting = results.fields.filter((f) => f.created === false).length;
const fieldsFailed = results.fields.filter((f) => f.error).length;

console.log("\n=== SUMMARY ===");
console.log(`  Tags:   ${tagsCreated} created, ${tagsExisting} already existed, ${tagsFailed} failed`);
console.log(`  Fields: ${fieldsCreated} created, ${fieldsExisting} already existed, ${fieldsFailed} failed`);
console.log("");

process.exit(exitCode);
