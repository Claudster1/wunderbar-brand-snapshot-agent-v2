# UX Flow Gaps & Data Integrity Audit

Audit date: 2025-02-14. Areas: checkout-to-chat, save/resume, results/report access, Stripe checkout, PDF generation, dashboard.

---

## 1. Checkout-to-chat flow

### 1.1 Invalid or expired Stripe `session_id` when fetching customer name

| Field | Value |
|-------|--------|
| **File** | `app/checkout/success/page.tsx`, `app/api/stripe/session-email/route.ts` |
| **Severity** | Low |
| **Description** | Success page calls `/api/stripe/session-email?session_id=...`. If the session is invalid or expired, Stripe throws; the API returns 500 and the client `catch` swallows it. The UI still renders; the "Start your …" CTA is built without `customerFirstName`, so the link is `/?tier=product` with no `name` param. User can still start the diagnostic but loses personalized greeting. No user-visible error. |
| **Suggested fix** | In success page: if `session_id` is present and the session fetch returns non-ok (404/500), optionally show a short message like "We couldn't load your name — you can still start below." Keep the CTA without `name`. In session-email route: for invalid/expired session return 404 with a clear body (e.g. `{ error: "Session not found or expired" }`) so the client can distinguish from generic 500. |

### 1.2 User arrives at `/?tier=blueprint` without having paid

| Field | Value |
|-------|--------|
| **File** | `app/page.tsx`, `lib/chatTierConfig.ts` |
| **Severity** | High |
| **Description** | Tier is taken only from the URL (`parseTierFromParam(searchParams.get("tier"))`). Anyone can open `/?tier=blueprint` or `/?tier=blueprint-plus` and get the full paid-tier experience (heading, value prop, greeting, and — critically — the same chat flow and report generation). There is no server- or client-side check that the user has completed checkout for that tier. |
| **Suggested fix** | After checkout, pass a short-lived token (e.g. in URL or cookie) that the app validates before allowing a paid tier. Options: (1) Success page redirects to `/?tier=blueprint&token=...` where token is a signed JWT or server-issued one-time token tied to session_id; home page or an API validates token and only then allows paid tier. (2) Store “tier granted” in a secure cookie when returning from Stripe success, and have the chat API (or a middleware) require that cookie for paid-tier report generation. Without a server-side gate, paid content is accessible without payment. |

### 1.3 `name` param missing for a paid tier

| Field | Value |
|-------|--------|
| **File** | `app/page.tsx`, `lib/chatTierConfig.ts` |
| **Severity** | Low |
| **Description** | If the user lands on `/?tier=blueprint` without `name` (e.g. direct link, or session-email failed), `customerName` is null. The app uses the standard two-message intro: greeting asks for name, then welcome-back after they type it. Flow is correct; only the “skip name question” optimization is lost. |
| **Suggested fix** | No change required for correctness. Optional: on success page, always pass `name` when available from session-email so the CTA includes it and the single-message intro is used. |

### 1.4 User refreshes the success page multiple times

| Field | Value |
|-------|--------|
| **File** | `app/checkout/success/page.tsx` |
| **Severity** | Low |
| **Description** | Each refresh re-runs the effect: persist email (if in URL), call session-email again. Stripe session retrieve is idempotent. No duplicate charges. Possible downsides: (1) multiple ActiveCampaign or analytics events if any are fired from this page; (2) rate limits on session-email if many refreshes. |
| **Suggested fix** | If you track “success page view” server- or client-side, do it once per session (e.g. sessionStorage flag). Keep session-email calls as-is or add a short client-side cache (e.g. only call once per session_id per page load). |

---

## 2. Save/resume flow

### 2.1 What happens when the user clicks “Save and exit”?

| Field | Value |
|-------|--------|
| **File** | `app/page.tsx`, `app/api/snapshot/save-exit/route.ts`, `src/hooks/useBrandChat.ts` |
| **Description** | User enters email in the modal; front-end calls `POST /api/snapshot/save-exit` with `{ reportId, email }`. API: rate-limited; validates email (format, disposable, MX); updates `brand_snapshot_reports` setting `user_email` for that `report_id`; fires ActiveCampaign event with `resume_link: ${BASE_URL}/?resume=${reportId}`. Modal shows “Progress saved … Check your email for a link.” Progress itself is stored earlier by `useBrandChat` via `POST /api/snapshot/progress` after each assistant reply (messages + metadata in `progress`). So “save and exit” mainly ties the draft to an email and sends the link; the draft and progress are already in the DB. |

### 2.2 Can they actually resume? What’s the resume URL?

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot/save-exit/route.ts`, `src/hooks/useBrandChat.ts`, `app/api/snapshot/resume/route.ts` |
| **Severity** | Medium (if schema mismatch; see 2.4) |
| **Description** | Resume URL is `https://<BASE_URL>/?resume=<reportId>`. On load, `useBrandChat` sees `resume` param, calls `GET /api/snapshot/resume?reportId=<id>`. Resume API loads progress via `loadSnapshotProgress(reportId)` and the report row by `report_id`. If both exist, it returns `reportId`, `progress.messages`, etc.; the hook restores `reportId` and `messages`, so the user continues the same thread. |
| **Suggested fix** | Ensure draft creation sets the same identifier that resume and progress use (see 2.4). Document the resume URL in the email template and in-app copy. |

### 2.3 Resume link used on a different device/browser

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot/resume/route.ts`, `app/api/snapshot/progress/route.ts` |
| **Severity** | Low |
| **Description** | Resume is keyed only by `reportId` (UUID). There is no check that the request comes from the same device or that the user’s email matches the draft’s `user_email`. Anyone with the link can open it and continue (or view) that draft. |
| **Suggested fix** | Optional hardening: when resuming, require a one-time token (e.g. in URL) that was stored when “save and exit” was clicked and that is tied to reportId + email; validate it in the resume API. Or send a signed link (e.g. JWT with reportId, email, expiry) and validate on GET resume. Until then, treat the resume link as a “secret link” and advise users not to share it. |

### 2.4 Is progress actually persisted to Supabase?

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot/draft/route.ts`, `app/api/snapshot/progress/route.ts`, `lib/saveSnapshotProgress.ts`, `lib/loadSnapshotProgress.ts`, `app/api/snapshot/resume/route.ts` |
| **Severity** | High (if table has separate `id` and `report_id`) |
| **Description** | Draft creates a row with `id: reportId` only (no `report_id` in insert). Progress save/load use `.eq("id", reportId)`. Resume API: (1) loads progress with `loadSnapshotProgress(reportId)` (by `id`), (2) fetches report row with `.eq("report_id", reportId)`. If the table has both `id` and `report_id` and drafts never set `report_id`, the second query returns 404 and resume fails even though progress exists. Save-exit also updates by `report_id`; if draft didn’t set it, that update may affect zero rows. |
| **Suggested fix** | (1) In draft route, set both `id` and `report_id` to the same UUID when inserting (if the schema has both). (2) In save-exit, if the table is keyed by `id` for drafts, update by `id` when `report_id` is missing, or set `report_id` on the draft row when saving. (3) In resume route, fetch report row by `id` if query by `report_id` fails, so drafts created with only `id` still resolve. Unify all lookups so draft, progress, save-exit, and resume use the same key. |

### 2.5 Save-exit Supabase update result not checked

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot/save-exit/route.ts` |
| **Severity** | Medium |
| **Description** | The `supabase.from(...).update(...).eq("report_id", reportId)` result is not checked. If the update fails (wrong reportId, RLS, or DB error), the API still returns 200 and the user is told to check their email. They may never get a correct resume link. |
| **Suggested fix** | Destructure `{ error }` from the update; if `error`, log it and return 500 with a generic message (e.g. “Failed to save progress. Please try again.”). Do not fire the AC event if the update failed. |

---

## 3. Results/report access

### 3.1 How is the report loaded? By ID? By email?

| Field | Value |
|-------|--------|
| **File** | `app/results/page.tsx`, `app/api/snapshot/get/route.ts` |
| **Description** | Results page is server-rendered; it reads `reportId` from searchParams (`id` or `reportId`), then calls `GET ${baseUrl}/api/snapshot/get?id=<reportId>` with no email. Snapshot get API fetches the report by `report_id`, then runs `checkReportAccess(getUserEmailFromRequest(req), report.user_email)`. Because the server-side fetch does not send an email, `userEmail` is null and `checkReportAccess` returns `hasAccess: true` (uuid_only). So the report is loaded by ID only; email is not used for this flow. |

### 3.2 Can someone access another user’s report by guessing the ID?

| Field | Value |
|-------|--------|
| **File** | `lib/reportAccess.ts`, `app/api/snapshot/get/route.ts`, `app/report/[id]/page.tsx` |
| **Severity** | Medium |
| **Description** | UUIDs are not guessable; risk is link leakage (sharing, referrer, logs). Snapshot get: when no email is sent, access is “uuid_only” so anyone with the ID can read the report. Report page `app/report/[id]/page.tsx` fetches directly from Supabase by `report_id` with no access check, so again possession of the ID is enough. So yes: anyone with the report ID can access that report. |
| **Suggested fix** | For higher sensitivity: (1) Require proof of ownership for reports that have `user_email` or `email_verified`: e.g. signed token or session set after email verification, and reject uuid_only when the report has an owner. (2) In `lib/reportAccess.ts`, add an option or branch so that when the report has `email_verified === true`, require matching email or a verification token and do not allow uuid_only. |

### 3.3 Report not finished generating yet

| Field | Value |
|-------|--------|
| **File** | `app/results/page.tsx`, `app/api/snapshot/get/route.ts` |
| **Description** | Results page fetches once; if 404 it shows “Report not found.” There is no “generating” or “pending” state: the report either exists (and is returned) or not. If the user is redirected to results before the save-report + PDF flow has written the row, they get “Report not found.” |
| **Suggested fix** | Option A: Redirect to a “Your report is being generated” page with the same reportId and poll `/api/snapshot/get?id=...` (or a dedicated status endpoint) until the report exists, then show results. Option B: Ensure redirect to results happens only after save-report (and optionally PDF) has completed so the row exists before first load. |

### 3.4 Is the email verification gate enforced before showing results?

| Field | Value |
|-------|--------|
| **File** | `app/page.tsx`, `components/security/EmailVerificationGate.tsx`, `app/report/[id]/page.tsx`, `app/api/snapshot/get/route.ts`, `app/api/snapshot-plus/pdf/route.ts` |
| **Severity** | Critical |
| **Description** | On the chat page, after assessment completion the app shows `EmailVerificationGate` and only after verification does it redirect to the report URL. So for the normal flow, the user must verify before being sent to the report. However: (1) The report page `app/report/[id]/page.tsx` does not check `email_verified`; it loads by `report_id` and renders full content. (2) Snapshot get API does not require `email_verified`; it only checks optional email vs owner. (3) So anyone with the report link (e.g. from email, shared URL) can open `/report/<id>` or hit the get API with the id and see the report without ever verifying. The gate is UX-only; it is not enforced by the report or API. |
| **Suggested fix** | (1) In `app/report/[id]/page.tsx`, after fetching the report row, if the report has `email_verified === false` (or has `user_email` and verification is required), render a “Verify your email to view this report” view (or redirect to a verification step with reportId). (2) In snapshot get API, if the report has `email_verified === true` or has an owner, require proof of ownership (e.g. email match or verification token) and do not allow uuid_only. (3) In PDF route (see below), enforce the same rule before returning the PDF. |

---

## 4. Stripe checkout flow

### 4.1 Two different checkout routes? Why?

| Field | Value |
|-------|--------|
| **File** | `app/api/stripe/createCheckout/route.ts`, `app/api/stripe/create-checkout-session/route.ts`, `app/api/checkout/route.ts` |
| **Description** | There are three relevant routes: (1) **createCheckout** (`/api/stripe/createCheckout`): expects `productKey`, normalizes via `normalizeProductKey`, looks up `PRICING[normalizedKey]`, uses `product.stripePriceId` for the session; success URL includes product and session_id. (2) **create-checkout-session** (`/api/stripe/create-checkout-session`): expects `priceId` (and optional snapshotId, email, productKey); uses that `priceId` directly as the Stripe price; success URL is hardcoded to snapshot-plus. (3) **checkout** (`/api/checkout`): same pattern as createCheckout (productKey → PRICING), but success/cancel go to dashboard. So: createCheckout and checkout are productKey-based and server-controlled price; create-checkout-session is priceId-based and client can pass any priceId. |
| **Suggested fix** | Prefer a single checkout entry that always uses server-side product keys and `PRICING` (or env price IDs). If create-checkout-session is still needed, validate `priceId` against a server-side allowlist (e.g. env STRIPE_PRICE_*) and do not accept arbitrary client-supplied price IDs. |

### 4.2 Are product IDs validated?

| Field | Value |
|-------|--------|
| **File** | `app/api/stripe/createCheckout/route.ts`, `app/api/checkout/route.ts`, `lib/productIds.ts`, `lib/pricing.ts` |
| **Description** | In createCheckout and checkout: `productKey` is normalized with `normalizeProductKey(productKey)`; if null or not in `PRICING`, the API returns 400 “Invalid product.” So product IDs are validated and the Stripe price comes from `PRICING[normalizedKey].stripePriceId` (env). |
| **Suggested fix** | No change needed for these two routes. |

### 4.3 Can someone tamper with the price?

| Field | Value |
|-------|--------|
| **File** | `app/api/stripe/create-checkout-session/route.ts` |
| **Severity** | High |
| **Description** | create-checkout-session accepts `priceId` from the request body and passes it to Stripe as the line item price. There is no check that `priceId` is one of your intended prices. A client could send another Stripe price ID (e.g. a cheaper product or a test price) and complete checkout at the wrong price. |
| **Suggested fix** | Do not trust client-supplied `priceId`. Map product intent (e.g. `productKey` or a fixed set of price IDs) on the server. For example: accept only `productKey`, resolve to `PRICING[productKey].stripePriceId` (or an env allowlist of price IDs), and use that when creating the session. If you need to support multiple products from the same route, validate `priceId` against a server-side list (e.g. `[process.env.STRIPE_PRICE_SNAPSHOT_PLUS, ...]`) and reject otherwise. |

---

## 5. PDF generation

### 5.1 Is access controlled?

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot-plus/pdf/route.ts` |
| **Severity** | High |
| **Description** | GET handler takes `id` (reportId) from query, fetches the report from Supabase by `report_id` (and fallback to brand_snapshot_reports), then generates and returns the PDF. There is no check that the requester is the report owner or has verified email. Anyone with the report ID can call `/api/snapshot-plus/pdf?id=<reportId>` and download the PDF. |
| **Suggested fix** | Before generating the PDF: (1) Require proof of ownership (e.g. email query/header that matches report’s `user_email`, or a signed token/cookie set after email verification). (2) If you enforce `email_verified`, require that the report is verified before allowing PDF download. Return 403 when access is denied. |

### 5.2 What if the report data is incomplete?

| Field | Value |
|-------|--------|
| **File** | `app/api/snapshot-plus/pdf/route.ts` |
| **Severity** | Low |
| **Description** | `transformReportData` uses defaults for missing fields (e.g. `userName: "User"`, `businessName: "Your Company"`, `defaultPillarScores`, empty strings for recommendations). So incomplete data produces a valid but generic-looking PDF rather than a crash. |
| **Suggested fix** | Optional: if critical fields are missing (e.g. no pillar scores and no full_report), return 400 or 404 with a clear message instead of generating a mostly-empty PDF. Otherwise current behavior is acceptable. |

---

## 6. Dashboard

### 6.1 How does the dashboard identify the user? By email in localStorage?

| Field | Value |
|-------|--------|
| **File** | `components/dashboard/DashboardHistory.tsx`, `lib/persistEmail.ts`, `app/api/history/route.ts` |
| **Description** | Dashboard history uses `getPersistedEmail()` from `lib/persistEmail.ts`, which reads from localStorage (key `bs_u`, obfuscated). That email is sent as the `email` query param to `GET /api/history?email=...`. The API filters `brand_snapshot_reports` by `user_email` (or `user_id` if provided). So the user is identified only by the persisted email; there is no server-side session or signed token. |

### 6.2 Can someone see another user’s history by changing the email?

| Field | Value |
|-------|--------|
| **File** | `app/api/history/route.ts`, `components/dashboard/DashboardHistory.tsx` |
| **Severity** | High |
| **Description** | The history API trusts the `email` (and optionally `userId`) query parameter. The dashboard sends whatever is in localStorage. A user can change the stored email (e.g. via devtools or a different browser profile) to another person’s email and reload; the API will return that person’s reports. There is no authentication or authorization; the only “auth” is the client-supplied email. |
| **Suggested fix** | (1) Do not rely on client-supplied email alone for authorization. After email verification, set a secure cookie or signed token that binds the session to a verified email (or reportId). (2) History API: require that the request is tied to a verified session (e.g. cookie or token that includes email), and only return reports for that email. (3) Alternatively, require the user to re-verify email (or use a magic link) when opening the dashboard, and then issue a short-lived token for that session. Until then, treat the dashboard as “best effort” and avoid displaying highly sensitive data; document that sharing a device can expose history. |

---

## Summary table

| # | File(s) | Severity | Topic |
|---|--------|----------|--------|
| 1.1 | checkout/success, session-email | Low | Invalid/expired session_id → no name, silent |
| 1.2 | page.tsx, chatTierConfig | **High** | Paid tier without payment (URL only) |
| 1.3 | page.tsx | Low | Missing name param → standard flow |
| 1.4 | checkout/success | Low | Multiple refresh → idempotent, possible duplicate events |
| 2.2 | save-exit, useBrandChat, resume | Medium | Resume URL and schema consistency |
| 2.3 | resume, progress | Low | Resume link is device-agnostic (secret link) |
| 2.4 | draft, progress, save-exit, resume | **High** | Progress/resume key: id vs report_id |
| 2.5 | save-exit | Medium | Supabase update result not checked |
| 3.2 | reportAccess, snapshot/get, report/[id] | Medium | Report access by ID only (UUID leak) |
| 3.3 | results/page, snapshot/get | Low | No “generating” state |
| 3.4 | report/[id], snapshot/get, EmailVerificationGate | **Critical** | Email verification not enforced on report/API |
| 4.1 | createCheckout, create-checkout-session, checkout | Medium | Two patterns; create-checkout-session is weaker |
| 4.3 | create-checkout-session | **High** | Client-supplied priceId → price tampering |
| 5.1 | snapshot-plus/pdf | **High** | No access control on PDF |
| 5.2 | snapshot-plus/pdf | Low | Incomplete data → defaults |
| 6.2 | history, DashboardHistory | **High** | History by client-supplied email → impersonation |

Recommended order of fixes: 1.2 (paid tier gate), 3.4 (enforce email verification on report/API), 4.3 (validate priceId), 5.1 (PDF access control), 6.2 (history authorization), 2.4 (draft/report_id consistency), 2.5 (save-exit error handling).
