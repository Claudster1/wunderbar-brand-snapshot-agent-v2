#!/usr/bin/env node
// scripts/provision-double-opt-in-ac.mjs
//
// One-shot operational script. Provisions the ActiveCampaign tag + custom fields used by the
// double-opt-in flow (/api/marketing/confirm). Idempotent: existing objects are reused.
//
// Run: `node scripts/provision-double-opt-in-ac.mjs` from the project root. Requires
// ACTIVE_CAMPAIGN_API_URL and ACTIVE_CAMPAIGN_API_KEY in the environment (read from .env.local
// automatically below).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Minimal .env.local loader — keeps the script dependency-free.
function loadDotenv(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const rawLine of text.split("\n")) {
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
  console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY. Aborting.");
  process.exit(1);
}

const headers = {
  "Api-Token": API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function findTag(name) {
  const res = await fetch(`${API_URL}/api/3/tags?filters[search]=${encodeURIComponent(name)}`, { headers });
  if (!res.ok) throw new Error(`GET /tags failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.tags?.find((t) => t.tag === name) ?? null;
}

async function createTag(name) {
  const existing = await findTag(name);
  if (existing) return { id: existing.id, created: false };
  const res = await fetch(`${API_URL}/api/3/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tag: { tag: name, tagType: "contact", description: "" } }),
  });
  if (!res.ok) throw new Error(`POST /tags failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { id: json.tag?.id, created: true };
}

async function findField(title) {
  // /api/3/fields paginates 100 at a time. We loop until we find it or run out.
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/fields?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /fields failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    const fields = json.fields ?? [];
    const match = fields.find((f) => f.title === title);
    if (match) return match;
    if (fields.length < 100) return null;
    offset += 100;
  }
}

async function createField(title, type) {
  const existing = await findField(title);
  if (existing) return { id: existing.id, created: false, type: existing.type };
  const res = await fetch(`${API_URL}/api/3/fields`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      field: { type, title, descript: "", visible: 1, ordernum: 0 },
    }),
  });
  if (!res.ok) throw new Error(`POST /fields failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { id: json.field?.id, created: true, type };
}

const PLAN = {
  tags: ["email:marketing-pending"],
  fields: [
    { title: "marketing_confirmation_link", type: "text" },
    { title: "email_marketing_opt_in_intent", type: "text" },
    { title: "email_marketing_confirmed", type: "text" },
    { title: "email_marketing_confirmed_at", type: "date" },
  ],
};

const results = { tags: [], fields: [] };
let exitCode = 0;

for (const name of PLAN.tags) {
  try {
    const out = await createTag(name);
    results.tags.push({ name, ...out });
  } catch (err) {
    results.tags.push({ name, error: err.message });
    exitCode = 1;
  }
}

for (const { title, type } of PLAN.fields) {
  try {
    const out = await createField(title, type);
    results.fields.push({ title, type, ...out });
  } catch (err) {
    results.fields.push({ title, type, error: err.message });
    exitCode = 1;
  }
}

console.log("\n=== TAGS ===");
for (const t of results.tags) {
  if (t.error) console.log(`  ✗ ${t.name}  ERROR: ${t.error}`);
  else console.log(`  ${t.created ? "✓ created" : "= existing"}  ${t.name}  (id=${t.id})`);
}
console.log("\n=== FIELDS ===");
for (const f of results.fields) {
  if (f.error) console.log(`  ✗ ${f.title} (${f.type})  ERROR: ${f.error}`);
  else console.log(`  ${f.created ? "✓ created" : "= existing"}  ${f.title} (${f.type})  (id=${f.id})`);
}
console.log("");
process.exit(exitCode);
