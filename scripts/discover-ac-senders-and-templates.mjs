#!/usr/bin/env node
// scripts/discover-ac-senders-and-templates.mjs (round 2 — schema inspector)

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

async function getJSON(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, { headers });
  return { status: res.status, json: await res.json() };
}

// Inspect one full message
const m = await getJSON("/api/3/messages/5");
console.log("\n=== /api/3/messages/5 (full) ===");
console.log(JSON.stringify(m.json, null, 2).slice(0, 3000));

// Inspect one full address
const a = await getJSON("/api/3/addresses/1");
console.log("\n=== /api/3/addresses/1 (full) ===");
console.log(JSON.stringify(a.json, null, 2));

// Inspect one full segment
const s = await getJSON("/api/3/segments/1");
console.log("\n=== /api/3/segments/1 (full) ===");
console.log(JSON.stringify(s.json, null, 2).slice(0, 2000));
