# How to See PDFs and UI Results of All Four Reports

The app has **four report types**: Brand Snapshot, Snapshot+, Blueprint, and Blueprint+.  
UI pages and PDF endpoints are below. **PDFs and most UIs require a real report ID** from your database (from completing a flow or from history).

---

## 1. Run the app locally

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## 2. Brand Snapshot (basic)

| What | URL | Notes |
|------|-----|--------|
| **UI (with real data)** | `/brand-snapshot/results/[report_id]` | Replace `[report_id]` with a row’s `report_id` from `brand_snapshot_reports`. |
| **UI (unified results)** | `/results?reportId=[report_id]` | Same report data, different layout. |
| **UI (preview, no DB)** | **`/preview/results`** | Mock data only. Use this to see the results UI without any report in the DB. |
| **PDF** | `/api/snapshot/pdf?id=[report_id]` | Or: `/api/reports/pdf?id=[report_id]` |

**Example:**  
- Preview (no ID): http://localhost:3000/preview/results  
- Real report: http://localhost:3000/brand-snapshot/results/abc-123 (use a real `report_id`)

---

## 3. Snapshot+

| What | URL | Notes |
|------|-----|--------|
| **UI** | `/snapshot-plus/[report_id]` | Needs a row in `brand_snapshot_plus_reports`. |
| **PDF** | `/api/snapshot-plus/pdf?id=[report_id]` | Or: `/api/report/pdf?id=[report_id]&plus=1` |

**Example:**  
- UI: http://localhost:3000/snapshot-plus/xyz-456  
- PDF: http://localhost:3000/api/snapshot-plus/pdf?id=xyz-456  

---

## 4. Blueprint

| What | URL | Notes |
|------|-----|--------|
| **UI (landing)** | `/blueprint` | Product/landing page. |
| **UI (activation)** | `/blueprint/activation` | Post-purchase activation (currently uses fallback copy when no report context). |
| **PDF** | `/api/pdf?id=[report_id]&type=blueprint` | Needs a row in `brand_blueprint_results`. |

**Example:**  
- UI: http://localhost:3000/blueprint  
- PDF: http://localhost:3000/api/pdf?id=REPORT_ID&type=blueprint  

---

## 5. Blueprint+

| What | URL | Notes |
|------|-----|--------|
| **UI** | `/blueprint-plus` | Prompt-pack / activation page. |
| **PDF** | `/api/pdf?id=[report_id]&type=blueprint-plus` | Needs a row in `brand_blueprint_plus_reports`. |

**Example:**  
- UI: http://localhost:3000/blueprint-plus  
- PDF: http://localhost:3000/api/pdf?id=REPORT_ID&type=blueprint-plus  

---

## 6. Unified PDF API (all four types)

One route can serve any report type by `type`:

```text
GET /api/pdf?id=[report_id]&type=[snapshot|snapshot-plus|blueprint|blueprint-plus]
```

- **Snapshot:** `type=snapshot` (default) → `brand_snapshot_reports`
- **Snapshot+:** `type=snapshot-plus` → `brand_snapshot_plus_reports`
- **Blueprint:** `type=blueprint` → `brand_blueprint_results`
- **Blueprint+:** `type=blueprint-plus` → `brand_blueprint_plus_reports`

---

## 7. How to get report IDs

- **Brand Snapshot:** Complete a Brand Snapshot flow, or open **Dashboard → History** (`/dashboard/history` or `/history`) and use the link/ID from each snapshot. Stored in `brand_snapshot_reports.report_id`.
- **Snapshot+:** Complete Snapshot+ for a snapshot; ID is in `brand_snapshot_plus_reports.report_id`.
- **Blueprint / Blueprint+:** Complete the Blueprint or Blueprint+ flow; IDs are in `brand_blueprint_results` and `brand_blueprint_plus_reports` (exact column names may be `report_id` or `id` depending on schema).

You can also read IDs directly from Supabase (e.g. Table Editor) from the tables above.

---

## 8. Quick reference – all four

| Report        | UI page (real data)              | Preview / no-ID UI        | PDF |
|---------------|----------------------------------|----------------------------|-----|
| Brand Snapshot| `/brand-snapshot/results/[id]`   | **`/preview/results`**     | `/api/snapshot/pdf?id=[id]` or `/api/pdf?id=[id]&type=snapshot` |
| Snapshot+     | `/snapshot-plus/[id]`           | —                          | `/api/snapshot-plus/pdf?id=[id]` or `/api/pdf?id=[id]&type=snapshot-plus` |
| Blueprint     | `/blueprint`, `/blueprint/activation` | —                    | `/api/pdf?id=[id]&type=blueprint` |
| Blueprint+    | `/blueprint-plus`               | —                          | `/api/pdf?id=[id]&type=blueprint-plus` |

To **see all four PDFs and UIs**, run `npm run dev`, use **`/preview/results`** for Brand Snapshot UI without a DB, and for the rest open the URLs above with real `report_id` values from your database (or complete each flow once to create them).
