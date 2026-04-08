# Viewing sample reports with dummy data

Use the **design preview** pages to view all report layouts with mock data — no database, completed snapshot, or API keys required.

## How to view

1. **Stop any other Next.js dev server**  
   If you see "Unable to acquire lock" or pages don’t load, close the terminal where `npm run dev` is running, or run:  
   `kill $(lsof -t -i:3000 -i:3001 -i:3010)` (macOS/Linux) to free the port.

2. **Start the preview dev server**
   ```bash
   npm run dev:preview
   ```
   This runs Next.js on **port 3010** so the URL is always the same.

3. **Open the preview index**
   - In the browser go to: **http://localhost:3010/preview**

4. **Open any preview** (direct URLs: /preview/results-tabs, /preview/results, /preview/snapshot-plus, /preview/report, /preview/blueprint, /preview/blueprint-plus)
   - **Updated Results Tabs UI** — New shell with compact header, executive summary above tabs, and Foundation → Strategy → Activation → Workbook → Downloads flow.
   - **WunderBrand Snapshot™ results** — New results UI: gauge, score breakdown, context coverage, upgrade CTAs.
   - **Snapshot+™ report** — Score, pillars, persona, archetype, voice, palette, roadmap, Blueprint upsell.
   - **Legacy report** — Classic WunderBrand Snapshot™ report layout with Snapshot+ upsell.
   - **Blueprint™ report** — “Your Blueprint is Ready”: focus area, pillar map, prompt library, Blueprint+ upsell.
   - **Blueprint+™ report** — Advanced prompt packs and “Work with us” (Managed Marketing, AI Consulting).

All of these use **inline mock/dummy data** only. No Supabase, OpenAI, or Stripe is needed to view them.

## What works

- **Viewing** every report type with realistic content.
- **Layout and styling** — Use these pages for design and copy review.
- **Navigation** — “← All previews” and links between previews (e.g. Blueprint → Blueprint+).

## If a preview route spins forever or stays blank

1. **Use the URL that matches your dev server port** — `npm run dev` is **http://localhost:3000/preview**; `npm run dev:preview` is **http://localhost:3010/preview**. Opening 3010 while only 3000 is running (or the reverse) will not load.
2. **Free the port** if the dev server failed to start (`EADDRINUSE`): stop other Next processes or run the `lsof`/`kill` step in the section above.
3. **Hard refresh** after upgrading Next.js (Cmd+Shift+R / Ctrl+Shift+R). Heavy preview routes (`/preview/results-tabs`, `/preview/blueprint`) stream client UI; a stuck cache can look like a blank page.
4. **Production / `next start` with `output: 'standalone'`** — the CLI may warn that `next start` is not the right entry; use `node .next/standalone/server.js` (or your host’s documented command). Vercel ignores `standalone` for serverless and serves the app normally.

## What does not work from preview

- **PDF download** from the Snapshot+ and Legacy report preview pages. The “Download … PDF” links call the real PDF API with a fake ID (`preview-mock`), so they will return an error. To test PDF generation, use a real report ID from your database or a dedicated preview-PDF endpoint if you add one.

## Optional: link from marketing

You can link to the preview index from internal or staging docs, e.g.:

- `https://your-staging-domain.com/preview`

Do not expose this URL as the main entry for end users; it is for design and QA with dummy data.
