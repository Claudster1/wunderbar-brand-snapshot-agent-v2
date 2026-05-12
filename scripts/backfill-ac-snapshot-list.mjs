#!/usr/bin/env node
// scripts/backfill-ac-snapshot-list.mjs
//
// Backfills all existing snapshot-funnel contacts into the canonical
// `Brand Snapshot Leads` list (id=4 by default; override with --list-id=<n>).
//
// "Snapshot-funnel contacts" are defined as anyone who has at least one of these tags:
//   - snapshot:lead-email-captured   (early email capture)
//   - purchased:snapshot              (completed snapshot)
//   - purchased:snapshot-plus, blueprint, etc. (paid upgrades)
//   - email:marketing-opted-in        (any marketing-eligible contact)
//
// Idempotent: AC's POST /api/3/contactLists for an already-active subscription returns 200
// without changing anything, so it's safe to re-run.
//
// Run: `node scripts/backfill-ac-snapshot-list.mjs [--list-id=4] [--dry-run]`

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

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const listIdArg = args.find((a) => a.startsWith("--list-id="));
const LIST_ID = listIdArg ? listIdArg.split("=")[1] : "4";

const API_URL = process.env.ACTIVE_CAMPAIGN_API_URL;
const API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY;

if (!API_URL || !API_KEY) {
  console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY in .env.local.");
  process.exit(1);
}

const headers = { "Api-Token": API_KEY, "Content-Type": "application/json", Accept: "application/json" };

// Tags that mark a contact as part of the snapshot funnel.
const SNAPSHOT_TAGS = [
  "snapshot:lead-email-captured",
  "purchased:snapshot",
  "purchased:snapshot-plus",
  "purchased:snapshot-plus-refresh",
  "purchased:blueprint",
  "purchased:blueprint-plus",
  "email:marketing-opted-in",
  "email:marketing-pending",
  "completed:snapshot",
];

// AC's /tags?filters[search]= is unreliable for tags containing colons (the snapshot
// funnel uses tags like `purchased:snapshot`). Load all tags once and resolve client-side.
let _allTagsCache = null;
async function loadAllTags() {
  if (_allTagsCache) return _allTagsCache;
  const map = new Map();
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/tags?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /tags: ${res.status}`);
    const json = await res.json();
    const list = json.tags ?? [];
    for (const t of list) map.set(t.tag, t.id);
    if (list.length < 100) break;
    offset += 100;
  }
  _allTagsCache = map;
  return map;
}

async function getTagId(tagName) {
  const map = await loadAllTags();
  return map.get(tagName) ?? null;
}

// AC's /contacts?tagid= and /contacts?filters[tagid]= URL parameters are silently
// ignored on most accounts — they return all contacts unfiltered. Walk the contactTags
// association table instead. It's accurate and paginates predictably.
let _allContactTagsCache = null;
async function loadAllContactTags() {
  if (_allContactTagsCache) return _allContactTagsCache;
  const all = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/contactTags?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /contactTags: ${res.status}`);
    const json = await res.json();
    const list = json.contactTags ?? [];
    all.push(...list);
    if (list.length < 100) break;
    offset += 100;
  }
  _allContactTagsCache = all;
  return all;
}

async function listContactIdsByTag(tagId) {
  const all = await loadAllContactTags();
  return all.filter((ct) => String(ct.tag) === String(tagId)).map((ct) => String(ct.contact));
}

async function getContactEmail(contactId) {
  const res = await fetch(`${API_URL}/api/3/contacts/${contactId}`, { headers });
  if (!res.ok) return null;
  const json = await res.json();
  return json.contact?.email ?? null;
}

async function subscribeContactToList(contactId, listId) {
  const res = await fetch(`${API_URL}/api/3/contactLists`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contactList: { list: String(listId), contact: String(contactId), status: 1 },
    }),
  });
  return res.ok;
}

// ─── EXECUTE ─────────────────────────────────────────────────────────────────
console.log(`\nBackfill target: list id=${LIST_ID}${dryRun ? "   [DRY RUN — no writes]" : ""}\n`);

const contactIds = new Set();

for (const tagName of SNAPSHOT_TAGS) {
  const tagId = await getTagId(tagName);
  if (!tagId) {
    console.log(`  - tag "${tagName}" not found in AC, skipping`);
    continue;
  }
  const ids = await listContactIdsByTag(tagId);
  for (const id of ids) contactIds.add(id);
  console.log(`  + tag "${tagName}" (id=${tagId}) → ${ids.length} contacts (running total: ${contactIds.size} unique)`);
}

const allContacts = new Map();
for (const id of contactIds) {
  const email = await getContactEmail(id);
  if (email) allContacts.set(id, email);
}

console.log(`\nUnique contacts to subscribe: ${allContacts.size}`);

if (dryRun) {
  console.log("\n[dry run] sample of first 10 emails to be subscribed:");
  for (const [, email] of [...allContacts.entries()].slice(0, 10)) {
    console.log(`    ${email}`);
  }
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const [contactId, email] of allContacts) {
  const success = await subscribeContactToList(contactId, LIST_ID);
  if (success) ok++; else failed++;
  // Light throttle to avoid hitting AC's rate limit (5 req/s on most plans).
  if ((ok + failed) % 5 === 0) await new Promise((r) => setTimeout(r, 250));
}

console.log(`\n=== SUMMARY ===`);
console.log(`  Subscribed (or already active): ${ok}`);
console.log(`  Failed:                         ${failed}`);
console.log("");
process.exit(failed > 0 ? 1 : 0);
