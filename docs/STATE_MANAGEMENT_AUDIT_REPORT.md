# State Management, Race Conditions & Data Flow Audit

Audit date: 2025-02-14. Areas: chat state, tier config, email verification gate, behavioral tracker, report generation, dashboard data.

---

## 1. Chat state — `src/hooks/useBrandChat.ts`

### 1.1 Double send (double-click / fast Enter)

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | Two messages can be sent in quick succession. The guard `if (!trimmed \|\| isLoading) return` is checked at the start of `sendMessage`, but `setIsLoading(true)` is asynchronous (state update). A second invocation (double-click or double Enter) can run before the first re-render, so both see `isLoading === false` and both proceed. This leads to duplicate API calls, duplicate user bubbles, and possible message ordering/merge issues. |
| **Suggested fix** | Use a synchronous ref guard in addition to `isLoading`: e.g. `const sendingRef = useRef(false)`. At the very start of `sendMessage`, `if (sendingRef.current) return; sendingRef.current = true;` and in `finally` set `sendingRef.current = false`. Keep the `isLoading` check for UX (disabled button); the ref prevents double-invocation. |

### 1.2 Stale closure over `messages` in async callbacks

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | `nextHistory` is computed as `[...messages, userMessage]` from the `messages` value captured when `sendMessage` runs. If two sends are in flight (see 1.1), the second call may still see the previous `messages` (without the first new user message), so `getBrandSnapshotReply(nextHistory)` and later `saveProgress(..., nextHistory)` use an outdated history. Result: API gets wrong conversation state; progress saves can overwrite with stale data. |
| **Suggested fix** | (1) Eliminate double send with the ref guard above. (2) For robustness, derive “current history” from a ref updated in sync with state: e.g. `const messagesRef = useRef(messages); useEffect(() => { messagesRef.current = messages; }, [messages]);`. When appending the user message, use the functional form `setMessages(prev => { const next = [...prev, userMessage]; messagesRef.current = next; return next; });` and use `messagesRef.current` (or a variable set from it after the state update) for the API call and progress save, so the async path always uses the latest history. |

### 1.3 Welcome-back intercept vs second message

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | The welcome-back branch sets `hasReceivedName.current = true` synchronously before any `await`, so in practice only the first message is treated as the name. A second message that passes the double-send guard would see `hasReceivedName.current === true` and skip the intercept. The remaining risk is only if double send (1.1) occurs and the first send hasn’t yet set the ref (e.g. if the ref were set after an await). Current code sets the ref before `await import(...)`, so the main concern is double send, not a separate welcome-back race. |
| **Suggested fix** | Fix double send (1.1). Optionally set a “sending” ref at the very top of `sendMessage` and clear it in `finally` so the welcome-back path and the rest of the function are both protected by the same guard. |

### 1.4 `isLoading` guard adequacy

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | The `isLoading` check plus `disabled={isLoading}` on the submit button reduce double send in normal use, but they are not sufficient because: (1) state updates are async, so two rapid calls can both see `isLoading === false`; (2) `retry()` calls `sendMessage(inputToRetry)` without checking `isLoading`, so retry can overlap with another send if the user is fast. |
| **Suggested fix** | Add the synchronous ref guard (1.1). In `retry`, either check `isLoading` (and optionally the same ref) before calling `sendMessage`, or rely on the ref inside `sendMessage` to make the second call a no-op. |

### 1.5 Options change mid-conversation (e.g. user navigates)

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | `customGreeting` is used only to build `initialMessage` in `useState(initialMessage)`, so the first message is fixed at mount. If `options` (e.g. from `searchParams`: tier, `customerName`) change mid-conversation, the greeting in state does not change. `welcomeBackTemplate` is read from `options` in the closure each time; so the *next* user message after a navigation could use a different template. `onComplete` is kept in a ref and updated in `useEffect`, so it stays current. Net effect: possible slight inconsistency (e.g. header shows new tier, first bubble still shows old greeting); no crash. |
| **Suggested fix** | Either document that tier/name are “session-scoped” and not intended to change during a conversation, or add an effect that resets conversation (e.g. reset messages and refs) when a stable “session key” (e.g. `tier` + `customerName`) changes, so the UI and options stay aligned. |

---

## 2. Tier config state — `app/page.tsx`

### 2.1 `searchParams` change while conversation is active

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | `tier`, `customerName`, and `resolvedGreeting` are derived from `searchParams` and memoized. If the user or an external link changes the URL (e.g. `?tier=snapshot-plus` → `?tier=blueprint`) while the chat is open, `tierConfig` and `resolvedGreeting` update. The chat hook’s initial message was set at first render and does not update, so the first bubble can still show the old greeting while the header shows the new tier. |
| **Suggested fix** | Treat tier/name as fixed for the lifetime of the page, or reset the chat when tier/name change (e.g. `useEffect` that calls `reset()` and re-initializes when `tier` or `customerName` change). |

### 2.2 `customerName` from URL (XSS via name param)

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | `customerName` comes from `searchParams.get("name")` and is interpolated into `resolvedGreeting` and then into the first message text. That text is rendered as React children (`message.text` in JSX), so React escapes it by default and classic DOM XSS is avoided. Risk is low unless the string is later used in a non-escaped context (e.g. `dangerouslySetInnerHTML`) or sent to a third party that renders HTML. |
| **Suggested fix** | Sanitize/validate the name param: e.g. strip or escape HTML, limit length, restrict to a safe character set before using in `resolvedGreeting`. This avoids odd UX and future misuse if the value is ever rendered in a different context. |

### 2.3 `resolvedGreeting` memoization

| Field | Detail |
|-------|--------|
| **Severity** | None |
| **Description** | `resolvedGreeting` is correctly memoized with `useMemo(..., [tier, tierConfig, customerName])`. `tierConfig` is from `getChatTierConfig(tier)` and is stable for the same `tier`. No change needed. |

---

## 3. Email verification gate — `components/security/EmailVerificationGate.tsx`

### 3.1 Multiple form submissions

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | `handleEmailSubmit` and `verifyCode` set `loading` to `true` only after starting the async work. Two quick clicks on “Send verification code” can both pass the `disabled={loading}` check and run `sendCode` twice; same idea for code verification (e.g. auto-submit on 6th digit plus a second trigger). That can send duplicate emails or duplicate verify requests. |
| **Suggested fix** | Guard at the very start of the async handlers: e.g. `if (loading) return; setLoading(true);` so the flag is set synchronously before any `await`. Optionally use a ref (e.g. `submittingRef`) for a hard guard and keep `loading` for UI. |

### 3.2 Unmount during verification

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | If the component unmounts while a `fetch` (send code or verify code) is in flight, the promise still resolves and the handlers call `setLoading`, `setError`, `setStep`, etc. That causes “Can’t perform a state update on an unmounted component” warnings and keeps references alive. |
| **Suggested fix** | Use an `AbortController` in a `useEffect`: create the controller, pass `signal` to `fetch`, and in the effect cleanup call `controller.abort()`. In the response handlers, check `signal.aborted` (or catch `AbortError`) and skip all `setState` calls when aborted. Alternatively use an `isMounted` ref set to `true` on mount and `false` in cleanup, and only call `setState` if `isMounted.current`. Prefer abort so the in-flight request is actually cancelled. |

### 3.3 Pending fetch and memory leaks

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | Pending `fetch` promises are not cancelled on unmount, so they complete and then run `setState`. That keeps component closure in memory until the promise settles and can trigger the unmount warning above. |
| **Suggested fix** | Same as 3.2: abort the request on unmount and avoid `setState` when aborted so no dangling closure work runs after unmount. |

---

## 4. Behavioral tracker — `lib/security/behavioralScoring.ts`

### 4.1 Ref / listener cleanup

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | `BehaviorTracker` is created in `app/page.tsx` in a `useEffect` with empty deps and assigned to `behaviorTrackerRef.current`. The constructor adds `mousemove`, `touchstart`, and `scroll` listeners to `window` with `{ once: true, passive: true }`. There is no cleanup. If the component unmounts before the user moves the mouse or scrolls, those listeners remain on `window` until they fire once. |
| **Suggested fix** | Add a `destroy()` (or `cleanup()`) method that removes the three listeners. Store the bound handler and options in instance fields so you can call `window.removeEventListener(type, handler, options)` in `destroy()`. In the page’s `useEffect`, return a cleanup that calls `behaviorTrackerRef.current?.destroy()`. |

### 4.2 Performance with frequent event handlers

| Field | Detail |
|-------|--------|
| **Severity** | None |
| **Description** | Listeners use `{ once: true, passive: true }`, so each fires at most once and then is removed. No long-lived high-frequency handlers. The only remaining concern is the three listeners left on `window` if the component unmounts before any of them fire; cleanup (4.1) addresses that. |

---

## 5. Report generation — `src/hooks/useGenerateReport.ts`, `src/services/reportGenerator.ts`

### 5.1 Report generation triggered twice

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | `useGenerateReport`’s `generateReport` has no guard against concurrent calls. If the completion path in `useBrandChat` ever calls `generateReport` twice (e.g. due to a bug, or a future change that triggers completion twice), two PDF generations and two uploads can run. The hook only sets `loading` to `true`; it does not block a second invocation. |
| **Suggested fix** | In `useGenerateReport`, use a ref (e.g. `generatingRef`) and at the start of `generateReport`: `if (generatingRef.current) return null; generatingRef.current = true;` and in `finally`: `generatingRef.current = false`. Return a shared promise or the same result for overlapping calls if you want idempotent behavior. |

### 5.2 Failure partway through

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | In `useBrandChat`, the flow is: update progress → mark complete → save report → `generateReport` (PDF). If `generateReport` fails, the hook returns `null` and the code uses `pdfResult?.reportId || saveResult.reportId`, so the user still gets a report ID and redirect. The report is already saved and marked complete before PDF generation. `reportGenerator.ts` is synchronous and pure; failure would be in the API (e.g. upload). No partial state left on the client; backend may have partial upload state, which is an API/storage concern. |
| **Suggested fix** | Client-side flow is acceptable. For the API route, consider cleaning up or marking failed uploads so storage and DB stay consistent. |

---

## 6. Dashboard data — `components/dashboard/DashboardHistory.tsx`, `hooks/useSnapshotHistory.ts`, `lib/fetchSnapshotHistory.ts`

### 6.1 Race conditions in data fetching

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **Description** | In `DashboardHistory`, the initial load runs in `useEffect` with `[email]`. There is no `AbortController` or request ID. If `email` changes (e.g. from storage or parent), a new effect runs and a second fetch starts. Whichever completes last will call `setHistory`/`setLoading`/`setError`, which can overwrite the result of the newer request with the older one. The “Try again” button also fetches without any cancellation or request identity, so the same race can occur with retries. |
| **Suggested fix** | Use an `AbortController` per effect: create it at the start of the effect, pass `signal` to `fetch`, and in the cleanup call `controller.abort()`. In the `.then` chain, check `signal.aborted` before calling `setHistory`/`setLoading`/`setError`; if aborted, ignore the response. For “Try again”, either use the same pattern (e.g. a shared controller or a ref that the effect respects) or ensure only one fetch runs at a time. |

### 6.2 Loading and error state

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **Description** | Loading and error are set correctly for the happy path: `loading` true at start, then false with either `history` or `error` set. The “Try again” button clears error and sets loading, but does not clear `history`, so the previous list can remain visible until the new fetch completes. If the new fetch fails, the user sees the error and the old list; that’s acceptable. No explicit “empty” vs “loading” conflict. |
| **Suggested fix** | Optional: when starting a new fetch (initial or retry), set `error` to `null` and, if desired, clear or keep `history` for a consistent UX (e.g. keep showing old list with a “Refreshing…” indicator). Ensure the abort logic (6.1) does not leave loading stuck; when aborted, set loading to false if the component is still mounted and the abort was due to email change. |

### 6.3 `useSnapshotHistory` and `fetchSnapshotHistory`

| Field | Detail |
|-------|--------|
| **Severity** | N/A |
| **Description** | `hooks/useSnapshotHistory.ts` only re-exports `fetchSnapshotHistory` from `lib/fetchSnapshotHistory.ts`. `DashboardHistory` does not use a hook that encapsulates loading/error; it uses local state and `fetch("/api/history?email=...")` directly. So the race and cleanup issues are in `DashboardHistory`, not in the shared fetch or the thin hook. `lib/fetchSnapshotHistory.ts` is server-side (Supabase) and not used by `DashboardHistory` for the client fetch; the client calls `/api/history`. |

---

## Summary table

| # | File | Severity | Issue |
|---|------|----------|--------|
| 1.1 | useBrandChat.ts | Medium | Double send possible; add ref guard |
| 1.2 | useBrandChat.ts | Medium | Stale `messages` in async path; ref + functional setState |
| 1.3 | useBrandChat.ts | Low | Welcome-back race mitigated by ref; fix double send |
| 1.4 | useBrandChat.ts | Low | isLoading not sufficient; add ref guard |
| 1.5 | useBrandChat.ts | Low | Options change mid-conversation; document or reset on tier/name change |
| 2.1 | app/page.tsx | Low | searchParams change; document or reset chat |
| 2.2 | app/page.tsx | Low | customerName XSS; sanitize name param |
| 2.3 | app/page.tsx | None | resolvedGreeting memoization OK |
| 3.1 | EmailVerificationGate.tsx | Medium | Double submit; synchronous loading guard (and/or ref) |
| 3.2 | EmailVerificationGate.tsx | Medium | Unmount during verification; AbortController + skip setState when aborted |
| 3.3 | EmailVerificationGate.tsx | Low | Pending fetch; same abort/cleanup as 3.2 |
| 4.1 | behavioralScoring.ts | Low | No listener cleanup; add destroy(), cleanup in page effect |
| 4.2 | behavioralScoring.ts | None | Performance OK (once + passive) |
| 5.1 | useGenerateReport.ts | Medium | Double report generation; ref guard in generateReport |
| 5.2 | useGenerateReport / reportGenerator | Low | Partial failure handled; API cleanup optional |
| 6.1 | DashboardHistory.tsx | Medium | Fetch race; AbortController and ignore aborted responses |
| 6.2 | DashboardHistory.tsx | Low | Loading/error OK; optional UX tweaks with abort |
| 6.3 | useSnapshotHistory / fetchSnapshotHistory | N/A | Re-export / server fetch; issues in DashboardHistory |

Recommended order of fixes: 1.1 + 1.2 (chat), 3.1 + 3.2 (email gate), 5.1 (report), 6.1 (dashboard), then the remaining low-severity items.
