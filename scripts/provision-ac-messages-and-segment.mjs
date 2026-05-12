#!/usr/bin/env node
// scripts/provision-ac-messages-and-segment.mjs
//
// Pre-creates the AC email messages for Automation A (transactional report-ready)
// and Automation C (welcome / first marketing email), plus the "Active subscribers"
// segment used by all future marketing sends. After this runs, the user only needs to
// build the visual automation flow in the AC UI and pick these messages from the dropdown.
//
// Idempotent: skips creation if a message with the same name or a segment with the same
// name already exists.

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

// ─── Email A: transactional report-ready ────────────────────────────────────
const EMAIL_A = {
  name: "Wunderbrand — Snapshot Report Ready (Automation A)",
  subject: "Your %COMPANY_NAME% Brand Snapshot is ready",
  preheader: "Your full report is one click away. Plus: what your score actually means.",
  fromname: "Wunderbrand",
  fromemail: "claudine@wunderbardigital.com",
  reply2: "claudine@wunderbardigital.com",
  text: `Hi %FIRSTNAME%,

Your Brand Snapshot for %COMPANY_NAME% is ready.

View your full report:
%REPORT_LINK%

---

A QUICK ORIENTATION

Your overall Brand Alignment Score is %BRAND_ALIGNMENT_SCORE%/100, built from five pillars:

  Positioning: %POSITIONING_SCORE%
  Messaging:   %MESSAGING_SCORE%
  Visibility:  %VISIBILITY_SCORE%
  Credibility: %CREDIBILITY_SCORE%
  Conversion:  %CONVERSION_SCORE%

Your strongest pillar is %PRIMARY_PILLAR%. That's the foundation we'd build from. Inside the report you'll find the specific opportunities tied to your lower pillars — ranked by impact, not difficulty.

Take 10 minutes with it. The "Top Opportunities" section at the top is where the highest-leverage moves live.

If anything's confusing or you want a human to walk you through it, just reply to this email.

—
The Wunderbrand team

This is a one-time delivery email for the snapshot you just completed. You'll only receive ongoing emails from us if you opted in during the form.

%SENDER-INFO-SINGLELINE%`,
  html: `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">

<p>Hi %FIRSTNAME%,</p>

<p>Your <strong>Brand Snapshot</strong> for %COMPANY_NAME% is ready.</p>

<p style="margin:24px 0; text-align:center;">
  <a href="%REPORT_LINK%"
     style="display:inline-block; background:#0a0a0a; color:#ffffff; padding:14px 28px; border-radius:6px; text-decoration:none; font-weight:600;">
    View your full report &rarr;
  </a>
</p>

<p style="font-size:14px; color:#666;">Or paste this link into your browser:<br />
<a href="%REPORT_LINK%" style="color:#0a0a0a;">%REPORT_LINK%</a></p>

<hr style="border:0; border-top:1px solid #e5e5e5; margin:24px 0;" />

<h3 style="margin-bottom:8px; color:#1a1a1a;">A quick orientation</h3>

<p>Your overall Brand Alignment Score is <strong>%BRAND_ALIGNMENT_SCORE%/100</strong>, built from five pillars:</p>

<table cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin:16px 0; border:1px solid #e5e5e5;">
  <tr style="background:#fafafa;"><td>Positioning</td><td><strong>%POSITIONING_SCORE%</strong></td></tr>
  <tr><td>Messaging</td><td><strong>%MESSAGING_SCORE%</strong></td></tr>
  <tr style="background:#fafafa;"><td>Visibility</td><td><strong>%VISIBILITY_SCORE%</strong></td></tr>
  <tr><td>Credibility</td><td><strong>%CREDIBILITY_SCORE%</strong></td></tr>
  <tr style="background:#fafafa;"><td>Conversion</td><td><strong>%CONVERSION_SCORE%</strong></td></tr>
</table>

<p>Your strongest pillar is <strong>%PRIMARY_PILLAR%</strong>. That's the foundation we'd build from. Inside the report you'll find the specific opportunities tied to your lower pillars &mdash; ranked by impact, not difficulty.</p>

<p>Take 10 minutes with it. The "Top Opportunities" section at the top is where the highest-leverage moves live.</p>

<p>If anything's confusing or you want a human to walk you through it, just reply to this email.</p>

<p>&mdash;<br />
<strong>The Wunderbrand team</strong></p>

<p style="color:#888; font-size:13px; margin-top:32px; padding-top:16px; border-top:1px solid #e5e5e5;">
  This is a one-time delivery email for the snapshot you just completed. You'll only receive ongoing emails from us if you opted in during the form.
</p>

<p style="color:#aaa; font-size:11px;">%SENDER-INFO-SINGLELINE%</p>

</body></html>`,
};

// ─── Email C: welcome / first marketing email ───────────────────────────────
const EMAIL_C = {
  name: "Wunderbrand — Welcome to Insights (Automation C)",
  subject: "%FIRSTNAME%, the one thing most %BUSINESS_TYPE% brands miss",
  preheader: "You're in. Here's what to expect — plus one tactic you can use this week.",
  fromname: "Wunderbrand Insights",
  fromemail: "claudine@wunderbardigital.com",
  reply2: "claudine@wunderbardigital.com",
  text: `Hi %FIRSTNAME%,

You just unlocked your Brand Snapshot for %COMPANY_NAME%, and you opted in to keep getting insights from us. Quick note to say: welcome, and to make sure that decision pays off for you.

Here's what you can expect:
- One useful email a week — usually Tuesday morning. No daily blasts.
- Tactics, not theory. Frameworks you can apply the same day, with examples from real brands.
- The trade-offs nobody else covers — what to do AND what to skip, because attention is the scarce resource.

You can unsubscribe anytime in one click. We don't take it personally.

---

YOUR SNAPSHOT, IN ONE SENTENCE

Your overall Brand Alignment Score came in at %BRAND_ALIGNMENT_SCORE%/100, and your strongest pillar was %PRIMARY_PILLAR%.

That's a useful starting line — but the score that moves the needle isn't always the lowest one. It's usually the one that compounds the others. For most %BUSINESS_TYPE% brands, that's messaging clarity: when your message gets sharper, your visibility, credibility, and conversion all lift at the same time.

ONE THING TO TRY THIS WEEK

Open your homepage. Read the first sentence above the fold. Ask yourself:
1. Could a competitor write this exact sentence about themselves?
2. Does it name a specific person and a specific outcome?
3. Would the customer you wish you had more of nod and say "yes, that's me"?

If you answered "yes, no, no" — that's your highest-leverage edit of the quarter. Sharpen it to a sentence only %COMPANY_NAME% could credibly say, and you'll feel the lift in everything downstream.

---

Next week we'll go deeper on the messaging diagnostic — the exact three-question filter we use to pressure-test a homepage before we'll let it ship.

Talk soon,
The Wunderbrand team

P.S. — Hit reply and tell me one thing you're working on this quarter. I read every reply, and the ones I can help with usually become the next week's email.

Unsubscribe: %UNSUBSCRIBELINK%
%SENDER-INFO-SINGLELINE%`,
  html: `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">

<p>Hi %FIRSTNAME%,</p>

<p>You just unlocked your <strong>Brand Snapshot</strong> for %COMPANY_NAME%, and you opted in to keep getting insights from us. Quick note to say: <strong>welcome</strong>, and to make sure that decision pays off for you.</p>

<p>Here's what you can expect:</p>

<ul>
  <li><strong>One useful email a week</strong> &mdash; usually Tuesday morning. No daily blasts.</li>
  <li><strong>Tactics, not theory.</strong> Frameworks you can apply the same day, with examples from real brands.</li>
  <li><strong>The trade-offs nobody else covers</strong> &mdash; what to do <em>and</em> what to skip, because attention is the scarce resource.</li>
</ul>

<p>You can unsubscribe anytime in one click. We don't take it personally.</p>

<hr style="border:0; border-top:1px solid #e5e5e5; margin:24px 0;" />

<h3 style="margin-bottom:8px; color:#1a1a1a;">Your snapshot, in one sentence</h3>

<p>Your overall Brand Alignment Score came in at <strong>%BRAND_ALIGNMENT_SCORE%/100</strong>, and your strongest pillar was <strong>%PRIMARY_PILLAR%</strong>.</p>

<p>That's a useful starting line &mdash; but the score that moves the needle isn't always the lowest one. It's usually the one that <em>compounds</em> the others. For most %BUSINESS_TYPE% brands, that's <strong>messaging clarity</strong>: when your message gets sharper, your visibility, credibility, and conversion all lift at the same time, because every channel is now selling the same idea.</p>

<h3 style="margin-bottom:8px; color:#1a1a1a;">One thing to try this week</h3>

<p>Open your homepage. Read the first sentence above the fold. Ask yourself:</p>

<ol>
  <li>Could a competitor write this exact sentence about themselves?</li>
  <li>Does it name a specific person and a specific outcome?</li>
  <li>Would the customer you wish you had more of nod and say "yes, that's me"?</li>
</ol>

<p>If you answered "yes, no, no" &mdash; that's your highest-leverage edit of the quarter. Sharpen it down to a sentence only %COMPANY_NAME% could credibly say, and you'll feel the lift in everything downstream.</p>

<hr style="border:0; border-top:1px solid #e5e5e5; margin:24px 0;" />

<p>Next week we'll go deeper on the messaging diagnostic &mdash; the exact three-question filter we use to pressure-test a homepage before we'll let it ship.</p>

<p>Talk soon,<br />
<strong>The Wunderbrand team</strong></p>

<p style="color:#888; font-size:13px; margin-top:32px;">
  P.S. &mdash; Hit reply and tell me one thing you're working on this quarter. I read every reply, and the ones I can help with usually become the next week's email.
</p>

<p style="color:#aaa; font-size:11px; margin-top:32px; padding-top:16px; border-top:1px solid #e5e5e5;">
  <a href="%UNSUBSCRIBELINK%" style="color:#aaa;">Unsubscribe</a><br />
  %SENDER-INFO-SINGLELINE%
</p>

</body></html>`,
};

// ─── helpers ─────────────────────────────────────────────────────────────────
async function findMessageByName(name) {
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/messages?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /messages: ${res.status}`);
    const j = await res.json();
    const list = j.messages ?? [];
    const match = list.find((m) => m.name === name);
    if (match) return match;
    if (list.length < 100) return null;
    offset += 100;
  }
}

async function createMessage(spec) {
  const existing = await findMessageByName(spec.name);
  if (existing) return { id: existing.id, created: false, name: spec.name };

  const payload = {
    message: {
      userid: "1",
      name: spec.name,
      fromname: spec.fromname,
      fromemail: spec.fromemail,
      reply2: spec.reply2,
      subject: spec.subject,
      preheader_text: spec.preheader,
      text: spec.text,
      html: spec.html,
      format: "mime",
      charset: "utf-8",
      encoding: "8bit",
      priority: "3",
    },
  };

  const res = await fetch(`${API_URL}/api/3/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`POST /messages: ${res.status} — ${body.slice(0, 400)}`);
  const json = JSON.parse(body);
  return { id: json.message?.id, created: true, name: spec.name };
}

async function findSegmentByName(name) {
  let offset = 0;
  for (;;) {
    const res = await fetch(`${API_URL}/api/3/segments?limit=100&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`GET /segments: ${res.status}`);
    const j = await res.json();
    const list = j.segments ?? [];
    const match = list.find((s) => s.name === name);
    if (match) return match;
    if (list.length < 100) return null;
    offset += 100;
  }
}

async function createSegment(name) {
  const existing = await findSegmentByName(name);
  if (existing) return { id: existing.id, created: false, name };

  // AC v3 segment creation: minimal version. The real filter rules are set in the UI
  // because the v3 segment rule syntax is poorly documented and brittle to construct
  // programmatically. Creating a named, empty segment gives the user a head start.
  const res = await fetch(`${API_URL}/api/3/segments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      segment: {
        name,
        logic: "and",
        hidden: "0",
      },
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`POST /segments: ${res.status} — ${body.slice(0, 400)}`);
  const json = JSON.parse(body);
  return { id: json.segment?.id, created: true, name };
}

// ─── EXECUTE ─────────────────────────────────────────────────────────────────
const results = { messages: [], segments: [] };
let exitCode = 0;

console.log("\nProvisioning AC messages + segment...\n");

for (const spec of [EMAIL_A, EMAIL_C]) {
  try {
    const out = await createMessage(spec);
    results.messages.push(out);
  } catch (err) {
    results.messages.push({ name: spec.name, error: err.message });
    exitCode = 1;
  }
}

try {
  const out = await createSegment("Active subscribers");
  results.segments.push(out);
} catch (err) {
  results.segments.push({ name: "Active subscribers", error: err.message });
  exitCode = 1;
}

console.log("=== MESSAGES ===");
for (const m of results.messages) {
  if (m.error) console.log(`  ✗ ${m.name}\n      ERROR: ${m.error}`);
  else console.log(`  ${m.created ? "✓ created" : "= existing"}  ${m.name}  (id=${m.id})`);
}

console.log("\n=== SEGMENTS ===");
for (const s of results.segments) {
  if (s.error) console.log(`  ✗ ${s.name}\n      ERROR: ${s.error}`);
  else console.log(`  ${s.created ? "✓ created" : "= existing"}  ${s.name}  (id=${s.id})`);
}

console.log("");
process.exit(exitCode);
