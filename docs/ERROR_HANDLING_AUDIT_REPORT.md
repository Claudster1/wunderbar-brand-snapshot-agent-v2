# Error Handling & Edge Case Audit Report

**Date:** February 14, 2025  
**Scope:** API routes, chat hook, env vars, Supabase usage, browser edge cases.

---

## 1. API route error handling

### 1.1 Stack trace / internal detail leakage

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/save-report/route.ts` | ~112–114 | **High** | Catch block returns `err?.message` to the client. Internal errors (e.g. from `calculateScores`, Supabase, or stack traces in message) can be exposed. | Return a generic message: `{ error: "Failed to save report" }`. Log `err` server-side only. |
| `app/api/save-report/route.ts` | ~92–95 | **Medium** | On Supabase insert failure, response sends `insertError.message` to the client. DB/constraint messages can leak schema or internal details. | Return generic: `{ error: "Failed to save report" }` and log `insertError` server-side. |
| `app/api/coverage/route.ts` | ~28–31 | **High** | Catch returns `err?.message` to the client. Any thrown error (e.g. from `req.json()` or `fetch`) exposes internal text. | Return generic: `{ error: "Coverage request failed" }`. |
| `app/api/analytics/route.ts` | ~38–43 | **High** | Same pattern: `err?.message` in response. | Return generic: `{ error: "Analytics request failed" }`. |
| `app/api/snapshot/draft/route.ts` | ~42–45 | **High** | On DB error, response includes `details: error.message`. Leaks DB/constraint details. | Remove `details` from response; return only `{ error: "Failed to create draft report" }`. |

### 1.2 Unhandled promise rejections / missing try-catch

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/coverage-email/route.ts` | Entire handler | **Critical** | No try-catch. `req.json()` can throw (invalid JSON). `process.env.ACTIVE_CAMPAIGN_WEBHOOK!` may be undefined, so `fetch(undefined, …)` throws. Unhandled rejection crashes the route. | Wrap handler in try-catch. Return 500 with generic message on error. Check `ACTIVE_CAMPAIGN_WEBHOOK` before calling `fetch`; if missing, return 503 or skip and return `{ skipped: true }`. |
| `app/api/snapshot/route.ts` | ~108 | **Medium** | `const body = await req.json();` is outside a safe parse. Malformed or non-JSON body throws before the try block (guard is before try). | Move `req.json()` inside the try, or use `req.json().catch(() => ({}))` and then validate required fields. |
| `app/api/save-report/route.ts` | ~15 | **Medium** | `const body = await req.json();` can throw on invalid JSON. | Use `req.json().catch(() => null)` and return 400 if body is null, or keep inside try (already in try) — ensure JSON parse failure is caught and returns 400 with generic message. |
| `app/api/snapshot/save-exit/route.ts` | ~26 | **Medium** | `await req.json()` can throw. | Wrap in try (already in try) — ensure parse errors don’t leak; return 400 for invalid JSON. |
| `app/api/verify-email/send/route.ts` | ~23 | **Low** | `await req.json()` can throw. Already inside try. | Optional: explicit 400 for invalid JSON. |
| `app/api/verify-email/confirm/route.ts` | ~14 | **Low** | Same. | Optional: explicit 400 for invalid JSON. |

### 1.3 Missing or unsafe use of environment variables (API routes)

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/coverage/route.ts` | ~16 | **High** | `process.env.ACTIVE_CAMPAIGN_WEBHOOK!` — if unset, `fetch(undefined, …)` throws. | Check `if (!process.env.ACTIVE_CAMPAIGN_WEBHOOK) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });` or return `{ skipped: true }`. |
| `app/api/coverage-email/route.ts` | ~21 | **High** | Same. No check before `fetch`. | Same as above. |
| `app/api/analytics/route.ts` | ~27 | **High** | Same pattern with `ACTIVE_CAMPAIGN_WEBHOOK!`. | Same as above. |

### 1.4 Supabase update result not checked

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/snapshot/save-exit/route.ts` | ~46–51 | **High** | `supabase.from(...).update(...).eq(...)` result is not checked. Client gets 200 even if update failed (e.g. wrong reportId or DB error). | Destructure `{ error }` and if `error`, log and return 500 with generic message. |
| `app/api/verify-email/send/route.ts` | ~43–52 | **High** | Update to store verification code is not checked. User can get “Verification code sent” when DB update failed. | Check `{ error }` from update; on error return 500 and do not call `fireACEvent`. |

### 1.5 Stripe / checkout routes — missing env checks

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/checkout/route.ts` | ~8–10 | **High** | `new Stripe(process.env.STRIPE_SECRET_KEY!)` — if unset, Stripe may throw or behave unpredictably. | At start of POST: `if (!process.env.STRIPE_SECRET_KEY) return new Response("Payment system unavailable", { status: 503 });` |
| `app/api/stripe/createCheckout/route.ts` | ~12–14 | **High** | Same. | Same as above. |
| `app/api/stripe/create-checkout-session/route.ts` | ~9–11 | **High** | Same. | Same as above. |
| `app/api/stripe/session-email/route.ts` | ~11–13 | **High** | Same. | Same as above. |
| `app/api/stripe/webhook/route.ts` | ~16, 62 | **Critical** | `STRIPE_SECRET_KEY!` and `STRIPE_WEBHOOK_SECRET!`. If missing, signature verification or Stripe calls throw; webhook returns 500 and Stripe may retry. | Check both env vars at startup or at top of POST; return 500 with no body or “Webhook misconfigured” so Stripe doesn’t retry indefinitely. |
| `app/api/refresh-checkout/route.ts` | ~14–16 | **High** | Same as checkout. | Same as checkout. |

### 1.6 Other API route issues

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `app/api/save-report/route.ts` | ~15 | **Low** | If `req.json()` throws (e.g. body already consumed), it’s caught by outer catch but then `err?.message` is returned. | Already covered by “no leak” fix above. |
| `app/api/verify-email/confirm/route.ts` | ~57–63 | **Medium** | Second update (mark verified) has no `{ error }` check. Verification could be reported success but DB not updated. | Check `{ error }` and return 500 if update failed. |

---

## 2. Chat hook resilience (`src/hooks/useBrandChat.ts`)

### 2.1 Network failure mid-conversation

| Location | Severity | Description | Suggested fix |
|----------|----------|-------------|----------------|
| ~191–342 | **Medium** | On `getBrandSnapshotReply` failure (network/5xx), catch adds an assistant error message and sets `lastFailedInput`; user can tap “Retry”. Progress is not re-sent to the server before retry — only the last user message is retried. | Document that “Retry” resends only the last message. Optionally: persist last N messages to `sessionStorage` and show “Resume from last save” if the tab was closed after a failure. |
| ~68–81 (resume) | **High** | Resume `fetch(/api/snapshot/resume?reportId=...)` has `.catch` that only logs. On network failure, user sees no error and no progress; they think they have no saved progress. | Set a small “resume failed” state (e.g. `resumeLoadFailed: true`) and show a banner: “We couldn’t load your previous progress. You can start a new assessment or try again.” with a retry button. |
| ~84–94 (draft) | **High** | Draft `fetch(/api/snapshot/draft)` same pattern — on failure, `reportId` stays null. Subsequent progress saves (e.g. `saveProgress`) no-op because `if (!reportId) return`. User can lose progress. | On draft failure, show a non-intrusive message and retry once or twice; if still failing, set state so UI can show “Unable to start. Check connection and refresh.” |
| ~132–154 (saveProgress) | **Medium** | `saveProgress` is fire-and-forget (catch only logs). If the progress API fails, user is not informed and refresh/resume may lose messages. | Optionally: track last successful save; if a save fails, show “Progress may not be saved — check your connection” and/or retry once. |

### 2.2 Malformed JSON from AI

| Location | Severity | Description | Suggested fix |
|----------|----------|-------------|----------------|
| ~210–248, 311–316 | **Medium** | When the reply contains something that matches a JSON-like pattern, code does `JSON.parse(jsonString)`. If the AI returns malformed JSON, `parse` throws and is caught at ~311; then the whole `replyText` is added as an assistant message (line 313). So malformed “score” JSON can appear as raw text in the chat. | In the inner catch (parseError), treat as non-JSON and add only a safe, truncated or sanitized version of `replyText` (e.g. strip obvious JSON fragments), or add a generic “I had trouble formatting that — here’s the gist” and a short summary. Avoid dumping raw API output. |
| ~246 | **Low** | `throw new Error('Invalid JSON structure')` is caught by the same catch and again results in full `replyText` in the chat. | Same as above: don’t show raw reply when structure is invalid. |

### 2.3 getBrandSnapshotReply throws

| Location | Severity | Description | Suggested fix |
|----------|----------|-------------|----------------|
| ~191, 336–342 | **Medium** | If `getBrandSnapshotReply` throws (e.g. API 5xx, network, or error from `openaiService`), the catch adds a generic connection message and sets `lastFailedInput`. No retry limit. | Consider a simple retry (e.g. 1–2 retries with backoff) before showing the error message. Optionally cap retries to avoid infinite loops. |

### 2.4 Progress / report ID consistency

| Location | Severity | Description | Suggested fix |
|----------|----------|-------------|----------------|
| ~265–291 | **Medium** | After extracting scores, code calls `/api/snapshot/progress` and `/api/snapshot/complete`. If these fail, it only logs; then it still calls `/api/save-report`. So the report can be saved and the user redirected even if “progress” or “complete” didn’t persist. | Acceptable if “complete” is best-effort. If not, consider retrying progress/complete or surfacing a warning when they fail. |
| ~296–310 | **High** | `saveResponse.ok` is false: code only logs `await saveResponse.text()`. User is not told that the report save failed; they may still get a redirect or postMessage from later logic. | If save report fails, do not redirect or call `onComplete`; show an explicit error in the UI and offer “Retry” or “Try again”. |

---

## 3. Missing environment variables

### 3.1 Startup / first-use behavior

| Variable | Severity | Description | Suggested fix |
|----------|----------|-------------|----------------|
| `OPENAI_API_KEY` | **High** | `lib/ai/providers/openai.ts` throws in `getClient()`: “OPENAI_API_KEY is not set”. Brand-snapshot chat and any route using this provider will get a 500 with that message (if it propagates) or generic error. | In API route that uses AI (e.g. brand-snapshot), catch “not set” and return 503 with generic “AI service unavailable”. Do not expose the env var name in client response. |
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | **High** | `lib/supabase/server.ts` uses `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `serviceKey!`. If missing, `createClient(undefined, …)` can create a broken client; first DB call may throw. Same for `lib/supabaseServer.ts` with `SUPABASE_URL!`. | Validate URL and key before creating client; return null or throw a clear internal error. Routes that use Supabase should check for null/throw and return 503 with a generic message. |
| `SUPABASE_SERVICE_ROLE_KEY` | **High** | Same as above. `supabase-admin` already returns `null` if URL or key missing; other code may call `supabaseServer()` which doesn’t. | Use a single server client factory that returns null when env is missing; all routes check and return 503. |
| `STRIPE_SECRET_KEY` | **High** | See “Stripe / checkout routes” above — routes crash or return 500. | Add checks at route entry and return 503 with generic message. |
| `STRIPE_WEBHOOK_SECRET` | **Critical** | Webhook verification fails; Stripe retries. | Check at start of webhook handler; if missing, return 500 once and log “Webhook secret not configured”. |
| `TURNSTILE_SECRET_KEY` | **Low** | `lib/security/turnstile.ts` skips verification and returns success when unset. In production this weakens bot protection. | In production, require the key and return 503 or 403 for verify endpoint if not set, or fail the route that depends on it. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Low** | Client-side widget may not render or may show a warning. No server crash. | Document required env for production. |
| `ACTIVECAMPAIGN_*` / `ACTIVE_CAMPAIGN_WEBHOOK` | **Medium** | Several routes use `process.env.ACTIVE_CAMPAIGN_WEBHOOK!` or similar. If missing, `fetch(undefined)` throws. | Check before fetch; return 503 or skip the webhook and return a safe response (e.g. `{ skipped: true }`). |

### 3.2 Centralized env validation

- **Suggestion:** Add a small module (e.g. `lib/env.ts`) that validates required env per context (e.g. “api”, “stripe”, “supabase”) and exports safe getters or throws at startup. Use it in route handlers or in `getStripe()` / `supabaseServer()` so missing keys yield 503 instead of 500 or raw errors.

---

## 4. Supabase queries

### 4.1 Errors not handled or not surfaced

| File | Location | Severity | Description | Suggested fix |
|------|----------|----------|-------------|----------------|
| `lib/saveSnapshotProgress.ts` | ~17–22 | **High** | `await supabase.from(...).update(...).eq("id", reportId)` — result not checked. Errors are silent; progress may not be saved. | Destructure `{ error }`; if `error`, log and throw (or return a result object) so the caller (e.g. progress API route) can return 500. |
| `lib/loadSnapshotProgress.ts` | ~9–14 | **Medium** | Only `{ data }` is used; `error` is ignored. On DB error, `data` is null and function returns null. Caller (resume route) treats that as “report not found”. | Either: (a) treat as 404 as now but log `error` for debugging, or (b) distinguish “not found” vs “DB error” and let the route return 500 for DB errors. |
| `lib/recordStripePurchase.ts` | ~35–49 | **Medium** | Insert `error` is checked and rethrown. Webhook handler doesn’t wrap in try-catch; so failed insert can cause webhook to return 500 and Stripe to retry. | Webhook already in try; ensure all steps that can throw (including `recordStripePurchase`) are inside it and return a consistent 500 message. Optionally: idempotency by sessionId so retries don’t duplicate. |
| `app/api/snapshot/save-exit/route.ts` | ~46–51 | **High** | Already noted: update result not checked. | Check `{ error }` and return 500 if failed. |
| `app/api/verify-email/send/route.ts` | ~43–52 | **High** | Already noted: update not checked. | Check `{ error }` and return 500 if failed. |
| `app/api/verify-email/confirm/route.ts` | ~57–63 | **Medium** | Already noted: second update not checked. | Check `{ error }` and return 500 if failed. |

### 4.2 Connection failure

- Most Supabase calls are awaited and either return `{ data, error }` or throw on network/connection errors. If the Supabase client is created with invalid/missing env, the first call can throw. Mitigation: env checks and null client as above; wrap DB calls in try-catch in routes and return 503 with a generic message.

### 4.3 Column naming consistency

| File | Description | Suggested fix |
|------|-------------|----------------|
| `lib/loadSnapshotProgress.ts`, `lib/saveSnapshotProgress.ts` | Use `.eq("id", reportId)`. Draft creates with `id: reportId` and returns it as `reportId`. Resume uses `reportId` from URL. If the table uses `report_id` as the public id and `id` as PK, ensure draft and progress use the same column consistently. | Confirm schema: if reports are keyed by `report_id` in other routes (e.g. save-exit), ensure draft inserts `report_id` and progress/resume query by `report_id` where appropriate. |

---

## 5. Browser edge cases (`app/page.tsx`)

### 5.1 Back/forward during chat

| Severity | Description | Suggested fix |
|----------|-------------|----------------|
| **Medium** | On back, the page may re-mount. `useBrandChat` runs again; `isInitialized.current` resets to false, so the init effect runs again. If the user had been in the middle of a conversation, they might get a new draft (or resume) and state can be inconsistent (e.g. new reportId, old messages in state). | Use `sessionStorage` or a ref that survives b/f (e.g. keyed by a stable id) to avoid re-creating draft on back; or show “Your session was restored” and keep existing messages/reportId when URL hasn’t changed. Consider `beforeunload` or `popstate` to warn or restore state. |
| **Low** | Forward after back: same re-init risk. | Same as above. |

### 5.2 Page refresh mid-conversation

| Severity | Description | Suggested fix |
|----------|-------------|----------------|
| **High** | On refresh, `useBrandChat` remounts. Without `?resume=`, it creates a new draft; previous in-memory messages are lost. Progress is only restored if the user had “Save and continue later” or if progress was saved in the background (which is best-effort and not checked). | Persist `reportId` (and optionally last N messages) in `sessionStorage` on each progress save or message update. On load, if `sessionStorage` has a reportId and no `?resume=`, call resume with that reportId or redirect to `?resume=<id>` so the user returns to the same session. |
| **Medium** | If user had `?resume=XXX` and refreshes, resume is called again; if it fails (network), they only see empty chat (see “Resume fetch” in section 2). | Already covered: surface resume failure and offer retry. |

### 5.3 JavaScript disabled

| Severity | Description | Suggested fix |
|----------|-------------|----------------|
| **High** | The app is a client-rendered chat (`use client`). With JS disabled, the shell may render but the chat and all API-driven behavior (send message, save progress, Turnstile, etc.) do not work. | Add a `<noscript>` message: “This assessment requires JavaScript. Please enable it and refresh.” and/or a server-rendered fallback page that explains the requirement and links to support. |

---

## Summary by severity

- **Critical:** 2 (coverage-email no try-catch; Stripe webhook env)
- **High:** 24 (detail leakage, unhandled req.json/env, unchecked Supabase updates, Stripe env, chat resume/draft/save-report UX, refresh/session)
- **Medium:** 18 (req.json in other routes, retry/parsing in chat, Supabase error handling, back/forward)
- **Low:** 8 (optional validation, Turnstile/env docs, forward, JS disabled messaging)

---

## Recommended order of fixes

1. **Critical:** Add try-catch and env checks to `app/api/coverage-email/route.ts`. Validate `STRIPE_WEBHOOK_SECRET` (and optionally `STRIPE_SECRET_KEY`) in the webhook route.
2. **High:** Stop returning `err?.message` or `error.message` to the client in save-report, coverage, analytics, snapshot/draft. Check Supabase update results in save-exit, verify-email send/confirm. Check `ACTIVE_CAMPAIGN_WEBHOOK` before fetch in coverage, coverage-email, analytics. Add Stripe env checks in all checkout/session routes.
3. **High (chat):** Handle resume and draft fetch failures in the UI; do not redirect or call onComplete when save-report fails.
4. **Medium:** Validate `req.json()` or use `.catch()` in snapshot, save-exit, verify-email, etc.; add retry/backoff for `getBrandSnapshotReply`; improve malformed-JSON handling in the chat hook; check Supabase errors in saveSnapshotProgress and loadSnapshotProgress.
5. **Low:** Document env requirements; add noscript message; consider sessionStorage for refresh/resume and back/forward.
