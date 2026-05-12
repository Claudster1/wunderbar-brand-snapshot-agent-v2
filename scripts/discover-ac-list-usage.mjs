#!/usr/bin/env node
// scripts/discover-ac-list-usage.mjs
//
// Read-only: lists all existing AC lists and shows how many contacts are subscribed to each.
// Helps us recommend which list (if any) the new automations should be scoped to.

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
const headers = { "Api-Token": API_KEY, "Content-Type": "application/json", Accept: "application/json" };

async function getJSON(ep) {
  const r = await fetch(`${API_URL}${ep}`, { headers });
  return r.ok ? await r.json() : null;
}

const lists = (await getJSON("/api/3/lists?limit=100")).lists ?? [];

console.log(`\n=== LISTS (${lists.length}) ===`);
for (const l of lists.sort((a, b) => Number(a.id) - Number(b.id))) {
  const sub = await getJSON(`/api/3/contacts?listid=${l.id}&limit=1`);
  const count = sub?.meta?.total ?? "?";
  console.log(`  id=${String(l.id).padStart(3)}  count=${String(count).padStart(5)}  name="${l.name}"  ${l.subscription_count ? `(subscription_count=${l.subscription_count})` : ""}`);
}

// Also list automations to see what already exists
const autos = (await getJSON("/api/3/automations?limit=50")).automations ?? [];
console.log(`\n=== EXISTING AUTOMATIONS (${autos.length}) ===`);
for (const a of autos) {
  console.log(`  id=${String(a.id).padStart(3)}  status=${a.status ?? "?"}  entered=${a.entered ?? "?"}  name="${a.name}"`);
}

// Also list campaigns
const camps = (await getJSON("/api/3/campaigns?limit=20")).campaigns ?? [];
console.log(`\n=== RECENT CAMPAIGNS (${camps.length} shown) ===`);
for (const c of camps.slice(0, 10)) {
  console.log(`  id=${String(c.id).padStart(3)}  type=${c.type ?? "?"}  status=${c.status ?? "?"}  name="${c.name}"`);
}
