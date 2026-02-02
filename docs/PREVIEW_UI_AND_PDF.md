# How to Preview Results Pages, PDFs, and UI

Ways to see what the results pages, report PDFs, and UI look like without guessing.

---

## 1. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** (or the port Next.js prints).

---

## 2. Results UI (with mock data — no DB)

**URL:** **http://localhost:3000/preview/results**

- Uses mock scores and insights (e.g. 72 overall, pillar scores 13–16).
- Shows the same layout as the real results view: gauge, pillars, context coverage, upgrade CTAs, Suite CTA.
- No Supabase or completed Brand Snapshot required.
- Use this to tweak layout, copy, and components.

---

## 3. Report page (real data — needs a report ID)

**URL:** **http://localhost:3000/report/[report_id]**

- Replace `[report_id]` with a real `report_id` from your `brand_snapshot_reports` table.
- Fetches that report from Supabase and renders the report-style page (score, pillars, recommendations, upgrade box).
- **How to get a report ID:**
  1. **Complete a Brand Snapshot** in the app; you’ll be redirected to `/report/[report_id]` when done.
  2. **From Supabase:** Table `brand_snapshot_reports`, column `report_id` — copy any value and open `/report/that-value`.

---

## 4. Brand Snapshot results page (alternative design)

**URL:** **http://localhost:3000/brand-snapshot/results/[id]**

- Same idea: use a real report `id` (same as `report_id` in the DB).
- This page uses a different layout (WundyHero, ScoreMeter, PillarBreakdown, etc.). Good for comparing designs.

---

## 5. PDF (real data — needs a report ID)

**URL (in browser or as link):**  
**http://localhost:3000/api/report/pdf?id=[report_id]**

- Replace `[report_id]` with a real report ID.
- Returns a PDF (download or open in browser).
- Same report must exist in `brand_snapshot_reports`; the API loads it and renders the PDF.

**Optional:** The report page often has a “Download PDF” link that points to this URL, so you can also go to `/report/[report_id]` and click that link.

---

## 6. Snapshot+ report and PDF

- **Snapshot+ report page:** **http://localhost:3000/snapshot-plus/[id]**  
  Use an ID from `brand_snapshot_plus_reports` (or your Snapshot+ table).

- **Snapshot+ PDF:** **http://localhost:3000/api/snapshot-plus/pdf?reportId=[id]**  
  (Exact query param may vary — check the Snapshot+ page’s download link.)

---

## 7. Quick reference

| What you want to see | URL | Needs |
|----------------------|-----|--------|
| Results UI (gauge, pillars, CTAs) with fake data | `/preview/results` | Nothing |
| Report page (single-report layout) | `/report/[report_id]` | Real report ID from DB or after completing snapshot |
| Brand Snapshot results (alternate layout) | `/brand-snapshot/results/[id]` | Real report ID |
| Brand Snapshot PDF | `/api/report/pdf?id=[report_id]` | Real report ID |
| Snapshot+ report page | `/snapshot-plus/[id]` | Snapshot+ report ID |
| Snapshot+ PDF | `/api/snapshot-plus/pdf?...` | Snapshot+ report ID |

---

## 8. Getting a real report ID once

1. Run `npm run dev` and open the app.
2. Go through the Brand Snapshot flow (chat, complete, save).
3. After completion you’re redirected to `/report/[report_id]` — that `report_id` is your real ID.
4. Use that same ID for:
   - `/report/[report_id]`
   - `/brand-snapshot/results/[report_id]`
   - `/api/report/pdf?id=[report_id]`

If you don’t want to run the full flow, use Supabase (or your DB client) to read one `report_id` from `brand_snapshot_reports` and use it in the URLs above.
