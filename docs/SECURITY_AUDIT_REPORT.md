# Security Audit Report — Next.js App

**Audit date:** 2025-02-14  
**Scope:** Turnstile, email validation, behavioral scoring, email verification gate, save-report, Stripe webhook, session-email.

---

## Executive summary

Critical and high-severity issues were found: **email verification can be bypassed** (report and PDF are accessible by report ID only), **Turnstile is fail-open on network error** and only enforced on one route, **behavioral scoring is not enforced server-side**, and **6-digit code verification is not constant-time** and has no lockout. The Stripe webhook correctly verifies signatures. Session-email is unauthenticated but session IDs are unguessable; rate limits and verification flows need hardening.

---

## 1. Turnstile integration

### 1.1 Token reuse

- **File:** `lib/security/turnstile.ts`, `app/api/save-report/route.ts`
- **Severity:** Low
- **Description:** Cloudflare Turnstile tokens are intended to be single-use. The server calls `siteverify` once per request; Cloudflare invalidates the token after successful verification. There is no server-side tracking of “already used” tokens. If Cloudflare’s invalidation were delayed or a token could be replayed within a small window, the same token could theoretically be used more than once.
- **Fix:** Rely on Cloudflare’s single-use semantics (documented). Optionally store hashes of recently verified tokens in a short-TTL cache (e.g. Redis or in-memory with 5-minute TTL) and reject duplicates.

### 1.2 Dev bypass when secret is unset

- **File:** `lib/security/turnstile.ts` (lines 26–32)
- **Severity:** High (if deployed without env)
- **Description:** When `TURNSTILE_SECRET_KEY` is not set, `verifyTurnstileToken` returns `{ success: true }` and logs a warning. In production, if the env var is missing or misconfigured, **all Turnstile checks are effectively disabled** and bots can pass.
- **Fix:** In production, require the secret and fail closed:
  - Use a dedicated env (e.g. `NODE_ENV === "production"`) or an explicit `TURNSTILE_DISABLED=true` for dev-only bypass.
  - If `NODE_ENV === "production"` and `!secret`, return `{ success: false }` and do not allow requests that depend on Turnstile to succeed.

### 1.3 Fail-open on network error

- **File:** `lib/security/turnstile.ts` (lines 59–62)
- **Severity:** High
- **Description:** On catch (e.g. network failure calling Cloudflare), the code returns `{ success: true }`. An attacker who can cause network errors (e.g. DNS or outbound blocking) can bypass Turnstile.
- **Fix:** On verification failure (including network/exception), return `{ success: false }` and reject the request. Optionally retry once with backoff; if still failing, return failure and surface a “try again later” message to the user.

### 1.4 Turnstile not enforced on all sensitive routes

- **Files:** `app/api/save-report/route.ts` (enforced), `app/api/snapshot/save-exit/route.ts` (not enforced), others
- **Severity:** Medium
- **Description:** Only `POST /api/save-report` verifies a Turnstile token. Other write/sensitive routes do not:
  - `app/api/snapshot/save-exit/route.ts` — accepts reportId + email, sends resume email; no Turnstile.
  - `app/api/snapshot/complete/route.ts` — marks report completed; no Turnstile.
  A bot can abuse save-exit (associate arbitrary email with reportId, trigger emails) or complete (pollute completion state) without solving a challenge.
- **Fix:** Add Turnstile verification to `save-exit` and any other routes that perform sensitive or state-changing actions (e.g. send email, update report state). Use a shared helper so enforcement is consistent.

---

## 2. Email validation

### 2.1 Disposable email bypass

- **File:** `lib/security/emailValidation.ts` (lines 9–21, 36–39)
- **Severity:** Medium
- **Description:** Disposable check uses the `disposable-email-domains` package. Any domain **not in the list** passes. New or lesser-known disposable domains are not blocked; the list is only as good as its maintenance.
- **Fix:** Accept the limitation in docs; consider supplementing with a paid or API-based disposable check for high-value flows. Optionally add a small allowlist of known-good corp domains to reduce false positives.

### 2.2 MX check reliability and timeout

- **File:** `lib/security/emailValidation.ts` (lines 46–68)
- **Severity:** Medium
- **Description:** (1) On DNS timeout (3s), the code resolves with `resolve(true)`, so **timeout is treated as “has MX”**. A slow or failing DNS can allow invalid domains to pass. (2) MX check uses Node `dns.resolveMx` (and fallback A); results depend on server DNS and can be affected by DNS poisoning in hostile networks (out of scope for app logic).
- **Fix:** On timeout, resolve with `resolve(false)` (fail closed) or a distinct result (e.g. `"unknown"`) and treat as “cannot verify” — either reject or require an alternative verification (e.g. sending a code). Prefer failing closed for strict flows like verification or signup.

### 2.3 Timing / enumeration via validation errors

- **File:** `app/api/verify-email/send/route.ts` (uses `validateEmail`); `lib/security/emailValidation.ts`
- **Severity:** Low
- **Description:** The send route returns different HTTP and messages for `invalid_format`, `disposable_domain`, and `no_mx_records`. An attacker can **enumerate** whether an address is considered valid, disposable, or “no MX” by probing the send endpoint.
- **Fix:** Use a single generic error for “email not accepted” (e.g. “Please use a valid work or personal email”) and avoid exposing `reason` in the API response. Log `reason` server-side only.

---

## 3. Behavioral scoring

### 3.1 No server-side enforcement

- **Files:** `lib/security/behavioralScoring.ts` (client-only), `app/api/save-report/route.ts` (no use of signals)
- **Severity:** High
- **Description:** Behavioral signals and `riskScore` are computed **only on the client** and are **never sent to or checked by the server**. `save-report` does not require or validate `behavioralSignals` or `riskScore`. A bot can call the API with arbitrary payload (plus a valid Turnstile token) and get a report saved; it does not need to fake a high score because the server ignores it.
- **Fix:** (1) Have the client send a signed or hashed summary of behavioral signals (or the score) with the save-report request. (2) Server-side: require the payload and enforce a **maximum allowed risk score** (e.g. reject if `riskScore > 70`). (3) Define the threshold in config and document it. (4) Consider storing risk score for analytics and abuse review.

### 3.2 Client-side only / easy to fake

- **File:** `lib/security/behavioralScoring.ts`
- **Severity:** Medium (in conjunction with 3.1)
- **Description:** All signals (pointer, scroll, keystroke timing, message count, time) are gathered in the browser. A determined attacker can simulate events (e.g. dispatch synthetic mouse/scroll events, send messages with delays) to produce a “human-like” payload. Without server-side enforcement, this is irrelevant for access control.
- **Fix:** Once server-side enforcement exists, treat behavioral scoring as a **signal**, not sole gate. Combine with Turnstile and rate limiting. Accept that sophisticated bots can mimic behavior; the goal is to raise the bar.

---

## 4. Email verification gate

### 4.1 Verification can be skipped entirely (report and PDF)

- **Files:** `app/report/[id]/page.tsx` (lines 25–29), `app/api/report/pdf/route.tsx` (GET, lines 95–116), `lib/reportAccess.ts` (lines 27–29)
- **Severity:** **Critical**
- **Description:** The email verification gate is only a **UI step** before redirect. **No route that serves report data checks `email_verified`.**
  - `app/report/[id]/page.tsx` fetches the report by `report_id` only and renders full content. No check of `email_verified` or ownership.
  - `app/api/report/pdf/route.tsx` (GET) fetches by `reportId` and returns the PDF. No `email_verified` or owner check.
  - `app/api/report/get/route.ts` uses `reportAccess`: if **no** email is sent (header/query), it returns `hasAccess: true` (“uuid_only”). So knowing the report UUID is enough to read the report via API as well.
  Anyone who obtains a report ID (e.g. from the save-report response, URL, or history) can **view the report and download the PDF without ever entering or verifying an email**.
- **Fix:** (1) **Report page:** Before rendering report data, fetch the row and require `email_verified === true`. If not verified, render a “Verify your email to view this report” view (e.g. same UX as EmailVerificationGate) or redirect to a verification step that includes the report id. (2) **PDF route:** After fetching the report, require `email_verified === true` (and optionally that the request is tied to the same user/session) before generating the PDF; otherwise return 403. (3) **Report get API:** For reports that have `email_verified`, require proof of ownership (e.g. cookie/session set after verify-email/confirm, or signed token containing reportId+email) instead of allowing UUID-only access. Align with `lib/reportAccess.ts` so that “uuid_only” is not allowed when the report requires verification.

### 4.2 Rate limiting on code send

- **File:** `app/api/verify-email/send/route.ts` (line 19), `lib/security/rateLimit.ts` (EMAIL_RATE_LIMIT)
- **Severity:** Low
- **Description:** Send is rate-limited with `EMAIL_RATE_LIMIT` (3 requests per 5 minutes per IP). This is appropriate to limit abuse. Rate limit is keyed by IP only; many users behind NAT share one IP.
- **Fix:** Consider a secondary limit per `reportId` (e.g. max 5 sends per report per hour) to avoid one user burning through codes for a single report. Document the limits.

### 4.3 Code expiry

- **File:** `app/api/verify-email/send/route.ts` (line 39)
- **Severity:** Low
- **Description:** Code expires in 15 minutes (`expiresAt`). This is reasonable.
- **Fix:** None required. Optionally make expiry configurable via env.

### 4.4 Brute force on 6-digit code

- **File:** `app/api/verify-email/confirm/route.ts` (lines 51–54), `lib/security/rateLimit.ts` (GENERAL_RATE_LIMIT)
- **Severity:** Medium
- **Description:** Code is 6 digits (10^6 possibilities). Confirm is rate-limited to **30 requests per minute per IP** (GENERAL_RATE_LIMIT). No lockout after N failed attempts. At 30/min, brute force is slow (~23 days per report per IP) but feasible with many IPs. No cap on failed attempts per report.
- **Fix:** (1) Add **per-report lockout** after e.g. 5 failed attempts (disable that report’s code for 15–30 minutes or require a new code to be sent). (2) Optionally use longer or alphanumeric codes (e.g. 8 digits or 6 alphanumeric) to increase entropy. (3) Consider logging failed attempts and alerting on many failures for the same report or IP.

### 4.5 Non–constant-time code comparison

- **File:** `app/api/verify-email/confirm/route.ts` (line 52)
- **Severity:** Low
- **Description:** Code is compared with `sanitizedCode !== report.email_verification_code`. JavaScript string comparison is **not guaranteed constant-time** and can short-circuit, enabling potential timing side channels to guess the code character-by-character.
- **Fix:** Use constant-time comparison. Example:

```ts
import { timingSafeEqual } from "crypto";

const a = Buffer.from(sanitizedCode.padEnd(6).slice(0, 6), "utf8");
const b = Buffer.from((report.email_verification_code ?? "").padEnd(6).slice(0, 6), "utf8");
if (a.length !== b.length || !timingSafeEqual(a, b)) {
  return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });
}
```

### 4.6 verify-email/send does not validate reportId existence

- **File:** `app/api/verify-email/send/route.ts` (lines 41–51)
- **Severity:** Low
- **Description:** The route does not check that `reportId` is a valid UUID or that the report exists before calling `validateEmail` and sending the email. Supabase `update(...).eq("report_id", reportId)` may update 0 rows; the code is still sent. For a non-existent or invalid reportId, the user will never be able to confirm, and the system sends an email with a code that is not stored anywhere.
- **Fix:** Validate `reportId` with `isValidUUID(reportId)` and optionally check that the report exists (e.g. select `report_id` and require one row) before updating and sending. Return a generic error for invalid/missing report to avoid leaking existence of report IDs.

---

## 5. Save-report route

### 5.1 Turnstile is enforced

- **File:** `app/api/save-report/route.ts` (lines 17–28)
- **Severity:** N/A (positive finding)
- **Description:** The route correctly verifies the Turnstile token and returns 403 on failure (when not in dev bypass / network-fail-open cases).

### 5.2 Direct POST without going through chat

- **File:** `app/api/save-report/route.ts`
- **Severity:** Medium
- **Description:** Anyone who can obtain a valid Turnstile token (e.g. solve the challenge once in a browser or abuse dev/network bypass) can **POST directly** to `/api/save-report` with arbitrary `brandAlignmentScore`, `pillarScores`, `pillarInsights`, `recommendations`, etc. There is no server-side check that the payload was produced by the real assessment pipeline (e.g. no signing, no server-side re-run of scoring). So fake or manipulated reports can be written to the DB.
- **Fix:** (1) Keep Turnstile and consider fixing fail-open and dev bypass so tokens are required and not bypassable. (2) Optionally have the assessment flow produce a **server-generated nonce or signature** (e.g. from an earlier step that runs scoring server-side), and require that token in save-report so only a real run can produce a valid save. (3) Rate limiting (already via apiGuard) helps but does not prevent one-off forged reports.

---

## 6. Stripe webhook

### 6.1 Signature verification

- **File:** `app/api/stripe/webhook/route.ts` (lines 46–68)
- **Severity:** N/A (positive finding)
- **Description:** The handler uses `getStripe().webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)`. This verifies the Stripe-Signature and rejects invalid or missing signature with 400. Raw body is used as required for verification. Forged webhook events cannot be accepted without the signing secret.

### 6.2 Missing STRIPE_WEBHOOK_SECRET

- **File:** `app/api/stripe/webhook/route.ts` (line 61)
- **Severity:** Medium
- **Description:** If `STRIPE_WEBHOOK_SECRET` is undefined, `constructEvent` receives `undefined` and will throw (Stripe SDK validates the secret). The route returns 400 and does not process the event, so **no silent accept of forged events**. However, in production this would break all webhook processing (e.g. purchases not recorded).
- **Fix:** At startup or first use, check that `process.env.STRIPE_WEBHOOK_SECRET` is set when Stripe webhooks are enabled, and log a clear error or fail fast so misconfiguration is caught early.

---

## 7. Session-email route

### 7.1 Unauthenticated access and PII disclosure

- **File:** `app/api/stripe/session-email/route.ts` (lines 16–36)
- **Severity:** Medium
- **Description:** The route is a **GET** that takes `session_id` from query and returns the customer email and name for that Stripe Checkout session. There is **no authentication** or proof that the caller is the same user who completed checkout. Anyone who obtains the session ID (e.g. from success URL, referrer, logs, or support tools) can call this endpoint and get **PII (email and name)**. Stripe session IDs (e.g. `cs_live_...`) are long and random, so **guessing or enumerating** session IDs is not practical; the main risk is **leakage** of a valid session_id.
- **Fix:** (1) Prefer using Stripe’s success URL or session metadata to pass the needed data to the success page (e.g. server-side redirect with session id only, then success page gets email from your backend only after a one-time token or server-rendered data). (2) If this endpoint must stay, add a **short-lived, single-use token** (e.g. signed JWT or random token stored server-side) that is set when redirecting to success (e.g. in a cookie or fragment), and require that token (or session cookie) when calling session-email so only the same browser that completed checkout can retrieve the email/name. (3) Optionally rate-limit by IP to reduce scraping if a token were ever leaked.

---

## Summary table

| # | Location | Severity | Issue |
|---|----------|----------|--------|
| 1.2 | turnstile.ts | High | Dev bypass when secret unset can disable Turnstile in prod |
| 1.3 | turnstile.ts | High | Fail-open on network error allows bypass |
| 1.4 | save-exit, etc. | Medium | Turnstile not enforced on other sensitive routes |
| 2.1 | emailValidation.ts | Medium | New disposable domains not in list bypass check |
| 2.2 | emailValidation.ts | Medium | MX timeout resolves to true (fail open) |
| 2.3 | verify-email/send | Low | Error messages allow email enumeration |
| 3.1 | behavioralScoring + save-report | High | Behavioral score not enforced server-side |
| 3.2 | behavioralScoring.ts | Medium | Client-only signals easy to fake (once enforced) |
| 4.1 | report/[id], report/pdf, report/get | **Critical** | Report and PDF viewable without email verification |
| 4.4 | verify-email/confirm | Medium | No lockout; 6-digit code brute-force possible with many IPs |
| 4.5 | verify-email/confirm | Low | Code comparison not constant-time |
| 4.6 | verify-email/send | Low | reportId not validated / existence not checked |
| 5.2 | save-report | Medium | Direct POST with arbitrary payload possible with valid token |
| 6.2 | stripe/webhook | Medium | Missing webhook secret breaks processing (no silent forge) |
| 7.1 | session-email | Medium | Unauthenticated; anyone with session_id gets PII |

---

## Recommended priority order

1. **Critical:** Enforce `email_verified` (and optionally ownership) on report page, report PDF, and report get API so verification cannot be skipped.
2. **High:** Turnstile: fail closed on network error; restrict dev bypass to non-production; add Turnstile to save-exit (and other sensitive routes).
3. **High:** Enforce behavioral score (or equivalent) server-side on save-report with a defined threshold.
4. **Medium:** Verify-email: add per-report lockout after N failed attempts; constant-time code comparison; optional reportId existence check on send.
5. **Medium:** Session-email: require a one-time or session-bound token; Stripe webhook: validate presence of STRIPE_WEBHOOK_SECRET in prod.
6. **Low:** Email validation: fail closed on MX timeout; generic error messages for send; document disposable/MX limitations.
