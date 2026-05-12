#!/usr/bin/env node
// scripts/audit-ac-objects.mjs
//
// Read-only audit. Lists all custom fields and tags currently in the AC workspace so we know
// exactly what needs to be provisioned for the new email automations.
//
// Run: `node scripts/audit-ac-objects.mjs` from the project root.

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
  console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY.");
  process.exit(1);
}

const headers = {
  "Api-Token": API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function listAllFields() {
  const all = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/fields?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /fields: ${res.status}`);
    const json = await res.json();
    const fields = json.fields ?? [];
    all.push(...fields);
    if (fields.length < 100) break;
    offset += 100;
  }
  return all;
}

async function listAllTags() {
  const all = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/tags?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /tags: ${res.status}`);
    const json = await res.json();
    const tags = json.tags ?? [];
    all.push(...tags);
    if (tags.length < 100) break;
    offset += 100;
  }
  return all;
}

const [fields, tags] = await Promise.all([listAllFields(), listAllTags()]);

console.log(`\n=== CUSTOM FIELDS (${fields.length}) ===`);
for (const f of fields.sort((a, b) => a.title.localeCompare(b.title))) {
  console.log(`  id=${String(f.id).padStart(4)}  type=${String(f.type).padEnd(10)} title="${f.title}"`);
}

console.log(`\n=== TAGS (${tags.length}) ===`);
for (const t of tags.sort((a, b) => a.tag.localeCompare(b.tag))) {
  console.log(`  id=${String(t.id).padStart(5)}  ${t.tag}`);
}
