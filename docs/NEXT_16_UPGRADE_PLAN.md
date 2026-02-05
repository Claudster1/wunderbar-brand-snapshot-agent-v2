# Next.js 16 Upgrade Plan

This document outlines the upgrade from Next.js 15.5.10 to Next.js 16.x, including breaking changes that apply to this project and a test plan.

---

## Methodology: Upgrade to latest vs stay as is

**Your approach (upgrade to latest) is sound** for minimizing issues down the road, as long as you run the test plan and fix regressions.

| Approach | Benefits | Risks |
|----------|----------|--------|
| **Upgrade to latest (Next 16)** | New features, performance (Turbopack), **security patches** (e.g. PPR/memory advisory), aligned with React 19 and ecosystem. Active LTS = ongoing fixes. | One-time breaking changes (params, lint, Turbopack); possible dependency incompatibilities (e.g. React 19); need to run tests and fix issues. |
| **Stay on current (Next 15)** | No immediate code churn; known behavior. | **Moderate security advisory** remains (PPR resume). Over time: fewer patches, harder upgrade path when 15 exits maintenance; more breaking changes to absorb later. |

**Recommendation:** Proceed with the upgrade. Staying on 15 is valid if you need maximum short-term stability, but upgrading now (with tests) reduces long-term risk and keeps you on Active LTS with full security fixes.

---

## 1. Pre-upgrade checklist

- [ ] **Node.js:** Ensure Node.js **20.9+** (project already has `engines: "node": ">=20.0.0"`; confirm local/Vercel use 20.9+).
- [ ] **Backup:** Commit all current work; ensure clean `git status`.
- [ ] **Branch:** Create a dedicated branch, e.g. `git checkout -b upgrade/next-16`.
- [ ] **Dependencies:** Run `npm install` and `npm run build` once to confirm current state is green.

---

## 2. Upgrade method (recommended: codemod first)

### Option A: Automated codemod (recommended)

Run the official upgrade codemod:

```bash
npx @next/codemod@canary upgrade latest
```

The codemod can:

- Update `next.config.js` for Turbopack.
- Migrate `next lint` to ESLint CLI.
- Migrate `middleware` → `proxy` (this project has **no middleware**).
- Remove `unstable_` prefixes (none in this project).
- Remove `experimental_ppr` (none in this project).

Then install latest Next and React:

```bash
npm install next@latest react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```

### Option B: Manual upgrade

If you prefer not to use the codemod:

```bash
npm install next@latest react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```

Then apply the breaking-change fixes below manually.

---

## 3. Breaking changes that apply to this project

### 3.1 Already done (Next 15)

- **Async `params` and `searchParams`:** Already migrated; all route handlers and pages use `Promise<{ id: string }>` and `await params` / `await searchParams`. No change needed for Next 16.

### 3.2 Turbopack by default

- **Build:** Next 16 uses Turbopack for `next dev` and `next build` by default.
- **This project:** No custom `webpack` in `next.config.js`, so Turbopack should work as-is.
- **If build fails:** You can opt out with `next build --webpack` (add to `package.json` script temporarily).

### 3.3 `next lint` removed

- **Change:** Next 16 removes `next lint`. Use ESLint (or Biome) directly.
- **Action:** After upgrade, run the codemod:
  ```bash
  npx @next/codemod@canary next-lint-to-eslint-cli
  ```
  Or update `package.json` manually, e.g.:
  ```json
  "lint": "eslint . --ext .ts,.tsx",
  ```
  and ensure ESLint is configured (e.g. `eslint.config.js` or `.eslintrc`). Next 16’s codemod can generate this.
- **Note:** `next build` no longer runs linting; run `npm run lint` separately or in CI.

### 3.4 React 19

- Next 16 uses React 19.x (Canary/stable as per Next docs). The upgrade command above installs `react@latest` and `react-dom@latest`.
- **Possible impact:** Third-party packages (e.g. `@react-pdf/renderer`, `@vercel/og`) should be checked for React 19 compatibility. If you see runtime or type errors, check their release notes or temporarily pin React 18 until they support React 19.

### 3.5 Config: `experimental.turbopack` → `turbopack`

- **This project:** Does not use `experimental.turbopack` in `next.config.js`. No change required unless you add Turbopack options later; then use the top-level `turbopack` key.

### 3.6 Middleware → proxy

- **This project:** No `middleware.ts` or `middleware.js`. Nothing to do.

### 3.7 Opengraph / metadata images

- **This project:** Uses API route `app/api/og/[id]/route.tsx` for OG images, not the file-based `opengraph-image.ts`. No change required for the async image API.

### 3.8 Parallel routes and `default.js`

- **This project:** No parallel route slots (`@folder`) in `app/`. No action.

### 3.9 Other removals

- **AMP:** Not used.
- **`serverRuntimeConfig` / `publicRuntimeConfig`:** Not used.
- **`next/legacy/image`:** Not used (use `next/image` only).

---

## 4. Post-upgrade config checks

- [ ] **next.config.js:** Ensure no deprecated options. Current config (`output: 'standalone'`, `headers`) is valid. If you add Turbopack options, use the top-level `turbopack` key.
- [ ] **TypeScript:** Project uses TypeScript 5.5; Next 16 requires 5.1+. No change needed.
- [ ] **Lint:** After migrating off `next lint`, run `npm run lint` and fix any new issues.

---

## 5. Test plan

Run these after the upgrade and fix any failures before merging.

### 5.1 Build and lint

| Step | Command | Expectation |
|------|---------|-------------|
| 1 | `npm run build` | Build completes without errors. |
| 2 | `npm run lint` | Lint passes (after updating lint script/config). |

### 5.2 Dev server

| Step | Command | Expectation |
|------|---------|-------------|
| 3 | `npm run dev` | Dev server starts; no console errors on load. |

### 5.3 Key routes (manual or E2E)

| Route | What to check |
|-------|----------------|
| `/` | Homepage loads. |
| `/brand-snapshot` | Snapshot entry/flow loads. |
| `/results?reportId=...` | Report loads (use a real report ID or stub). |
| `/preview/results` | Sample data report renders. |
| `/brand-snapshot/results/[id]` | Full report page by ID. |
| `/checkout/success` | Success page (and Stripe webhook if applicable). |
| `/api/snapshot/get?id=...` | Returns report JSON. |
| `/api/og/[id]` | OG image returns (e.g. for report share). |

### 5.4 Critical user flows

- [ ] Complete a Brand Snapshot (or use existing data) and open results.
- [ ] Open preview report at `/preview/results`.
- [ ] Trigger checkout (test or real) and confirm success/cancel and webhook behavior.
- [ ] Confirm report PDF generation if used (`/api/snapshot/pdf`, etc.).

### 5.5 Optional: React 19 / dependency checks

- [ ] If using `@react-pdf/renderer`, generate a PDF and confirm no runtime errors.
- [ ] If using `@vercel/og`, confirm OG image generation still works.

---

## 6. Rollback plan

If the upgrade causes blocking issues:

1. Revert the upgrade branch:
   ```bash
   git checkout main
   git branch -D upgrade/next-16
   ```
2. Or revert only package changes:
   ```bash
   git checkout -- package.json package-lock.json
   npm install
   ```
3. Restore any modified files (e.g. `next.config.js`, lint config) from `main`.
4. Re-run `npm run build` and `npm run dev` on `main` to confirm pre-upgrade state.

---

## 7. Summary checklist

- [ ] Create branch `upgrade/next-16`.
- [ ] Run `npx @next/codemod@canary upgrade latest` (and `next-lint-to-eslint-cli` if needed).
- [ ] Run `npm install next@latest react@latest react-dom@latest` and update `@types/react` / `@types/react-dom`.
- [ ] Fix any new TypeScript or runtime errors (especially from React 19 or Turbopack).
- [ ] Update lint script/config and run `npm run lint`.
- [ ] Complete test plan (build, dev, key routes, report, preview, checkout).
- [ ] Commit, push, and open PR; run CI if applicable.
- [ ] After merge, redeploy and smoke-test production.

---

## Upgrade completed (actual changes)

- **Next.js:** Upgraded to 16.1.6; **React:** 19.2.4; **@types/react / @types/react-dom:** 19.x.
- **Build:** Turbopack fails on `/api/email/snapshot-upgrade` (module not found). Production build uses **Webpack** via `next build --webpack` in `package.json`.
- **Lint:** Next 16 removes `next lint`. Switched to **ESLint 8** with `.eslintrc.json` and `extends: ["next/core-web-vitals"]`; lint script is `eslint . --ext .ts,.tsx`. (ESLint 9 flat config + FlatCompat with `next/core-web-vitals` caused circular structure; ESLint 8 + legacy config works.)
- **tsconfig:** Next 16 may add `.next/dev/types/**/*.ts` to `include` and set `jsx: "react-jsx"`; keep if present.
- **Pre-existing lint:** Some files still report `react/no-unescaped-entities`, `@next/next/no-img-element`, etc.; fix separately.

## References

- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 codemod](https://nextjs.org/docs/app/guides/upgrading/codemods#160)
- [Next.js 16 blog](https://nextjs.org/blog/next-16)
