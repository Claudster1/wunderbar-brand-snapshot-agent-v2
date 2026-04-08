# Report System Release Notes (2026-01-26)

## Scope

This release upgrades report navigation, restores missing tier deliverables, modernizes PDF output design, and unifies report PDF generation paths.

## Highlights

- Converted report navigation from anchor scrolling to section routing (`?section=...`) with consistent top nav behavior.
- Added report Overview entry pages (tile-based navigation) across active report routes.
- Restored Snapshot+ deep content (archetype depth, roadmap continuity, strategic signals) in both page and PDF paths.
- Added explicit 30/60/90 activation blocks in Blueprint and Blueprint+ PDF outputs.
- Added Snapshot/Snapshot+ continuity carryover into higher-tier PDFs where data is available.
- Centralized checkout UTM generation with typed tracking mediums to preserve funnel attribution consistency.
- Unified active Snapshot/Snapshot+ PDF endpoints and legacy API paths to the modern `src/pdf` generation pipeline.

## Report UX Updates

- Shared section navigation behavior applied to:
  - `app/report/[id]/page.tsx`
  - `app/preview/report/page.tsx`
  - `app/brand-snapshot/results/[id]/page.tsx`
  - `app/snapshot-plus/[id]/page.tsx`
- Added reusable overview component:
  - `components/reports/SectionOverviewTiles.tsx`
- Enhanced report header/nav behavior:
  - `components/reports/BlueprintPlusHeader.tsx`

## Deliverable Restoration

- Snapshot+ page and PDF now support richer archetype and roadmap handling:
  - Archetype includes icon, meaning, risk, behavior/tone guidance, secondary/pairing context when available.
  - 30/60/90 roadmap supports fallback keys from varied payload shapes.
- Blueprint PDF now includes:
  - explicit 30/60/90 continuity section,
  - foundation carryover blocks when baseline data exists.
- Blueprint+ PDF now includes:
  - foundation baseline (score/pillars/recommendations),
  - Snapshot+ carryover (persona/archetype/voice/palette, context coverage, opportunities map),
  - explicit 90-day activation plan blocks.

## PDF Design Modernization

Shared PDF style system was upgraded for a cleaner, premium look:

- `src/pdf/components/PdfHeader.tsx`
- `src/pdf/components/PdfFooter.tsx`
- `src/pdf/components/PageTitle.tsx`
- `src/pdf/components/Section.tsx`
- `src/pdf/theme.ts`

Core doc styling refinements applied in:

- `src/pdf/BrandSnapshotPDF.tsx`
- `src/pdf/BrandSnapshotPlusPDF.tsx`
- `src/pdf/BrandBlueprintPDF.tsx`
- `src/pdf/documents/BrandBlueprintPlusPDF.tsx`

## Endpoint / Pipeline Unification

Updated to use `src/pdf/generatePdf` pipeline for consistency:

- `app/api/report/pdf/route.tsx`
- `app/api/report/pdf/[id]/route.ts`
- `app/api/report/route.ts`
- `app/api/generateReport/route.ts`
- `lib/pdf/renderReportPDF.ts`

Active download links now standardized to explicit Snapshot routes:

- Snapshot: `/api/snapshot/pdf?id=...`
- Snapshot+: `/api/snapshot-plus/pdf?id=...`

## Tracking / Attribution

- Added centralized checkout URL helper:
  - `lib/checkoutUrls.ts`
- Added typed `medium` UTM values for consistency.
- Updated CTA links across report/landing/modal surfaces to helper-generated tracked Stripe URLs.

## Prompt Context Policy Alignment

- Removed remaining score-specific placeholders from outward-facing shared prompt context helper:
  - `src/lib/prompts/blueprintPlusPrompts.ts`

## Verification

- Lint checks across edited files: pass.
- Full production build (`npm run build`): pass after all update phases.

## Notes

- Legacy re-export shim files remain for compatibility, but active user-facing report download flows now resolve through modernized Snapshot/Snapshot+ PDF generators.

---

## Quick QA Checklist

Estimated time: 15-25 minutes

### Preconditions

- App runs locally (`npm run dev`) or on preview deployment.
- Test data exists for Snapshot, Snapshot+, Blueprint, and Blueprint+ report IDs.

### 1) Navigation and section routing

- Open Snapshot routes and confirm default redirect to `?section=overview`.
- Confirm section tabs update URL + active state correctly.
- Confirm Snapshot+ tabs include `signals`, `archetype`, and `roadmap`.

### 2) Overview tiles

- On each routed report page, confirm Overview tiles render and navigate correctly.

### 3) CTA + checkout tracking

- Verify CTA links use Stripe paths and include `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.

### 4) Snapshot+ deep content (page)

- Confirm archetype depth renders (icon/name/context; secondary/pairing when present).
- Confirm roadmap shows 30/60/90 cards and deliverable bullets.

### 5) PDF output checks

- Snapshot PDF (`/api/snapshot/pdf?id=...`): modern styling + score/pillars present.
- Snapshot+ PDF (`/api/snapshot-plus/pdf?id=...`): enriched archetype/persona/voice/palette + 30/60/90 roadmap when data exists.
- Blueprint PDF: explicit 30/60/90 blocks + archetype icon/meaning + baseline carryover when available.
- Blueprint+ PDF: baseline section + carryover sections + explicit 90-day activation plan.

### 6) Endpoint consistency

- Confirm active UI links use:
  - `/api/snapshot/pdf?id=...`
  - `/api/snapshot-plus/pdf?id=...`
- Confirm no active user-facing links still use:
  - `/api/report/pdf?id=...`
  - `/api/pdf?id=...&type=snapshot-plus`

### 7) Prompt policy spot check

- Verify no outward-facing score placeholders remain in `src/lib/prompts/blueprintPlusPrompts.ts`.

### 8) Regression sanity

- Run `npm run build` and confirm clean pass.

### Pass criteria

- Routing, tiles, and nav behavior are correct.
- PDFs reflect modern design + restored deliverables.
- CTA tracking is intact.
- Build passes.
