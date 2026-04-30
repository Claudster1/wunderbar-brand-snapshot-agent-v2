# Workstream State

Use this file as the single source of truth when resuming after a crash or interruption.

Release go/no-go checklist: `docs/RELEASE_READINESS_CHECKLIST.md`

Release gate checklist: `docs/RELEASE_READINESS_CHECKLIST.md`

## Current Objective

Close remaining deltas for the rebuild strategy in this order:

1. Verify Snapshot+ PDF section ordering and copy parity with on-screen experience.
2. Expand deterministic business-type branching from guardrails into explicit step-state tracking.
3. Verify Blueprint and Blueprint+ report framing for ROI/activation parity.
4. Run focused lint/typecheck and final QA pass.

## Completed Recently

- Free results rebuilt with locked preview architecture, spend efficiency signal, and revenue impact statement.
- Snapshot upgrade CTA framing standardized to `See Your Full Results — $497`.
- Locked-section interaction analytics added and surfaced in `/admin/unified`.
- Snapshot PDF generation paths unified to centralized pipeline:
  - `/api/pdf`
  - `/api/snapshot/pdf`
  - `/api/reports/pdf`
- Snapshot/Snapshot+ PDF templates updated with new strategic sections.
- Blueprint / Blueprint+ transformer mappings added for campaign architecture, workbook, ROI prioritization, and activation session fields.
- Deterministic routing guard + normalized answer persistence added in `app/api/brand-snapshot/route.ts`.
- Deterministic routing enforcement hardened in `app/api/brand-snapshot/route.ts` with strict next-capture fallback when model output drifts.
- Strategy v3 conversational model alignment completed:
  - business-type classifier moved to inference-and-confirm (internal taxonomy routing)
  - diagnostic capture reframed to signal extraction behavior
  - revenue baseline/fallback language updated to "fallback without fabrication"
  - implementation mapping documented in `docs/STRATEGY_V3_ALIGNMENT.md`
- Nurture guidance docs synced to strategy v3 language:
  - `docs/NURTURE_IMPLEMENTATION_GUIDE.md` includes strategy-v3 language guardrails
  - `docs/NURTURE_SEQUENCE_PROMPT.md` includes strategy-v3 alignment rules for diagnostic references
- Blueprint parity pass completed:
  - `src/pdf/BrandBlueprintPDF.tsx` Next Steps wording aligned to `Campaign Architecture Starter (90 Days)`
- Blueprint+ parity pass completed:
  - `src/pdf/documents/BrandBlueprintPlusPDF.tsx` Next Steps wording aligned to `Activation Session Framework`
- Typecheck blockers resolved:
  - duplicate `RevenueImpactStatement` file sections removed and component normalized
  - `scripts/check-pdf-parity.ts` duplicate blocks removed and script restored to single canonical implementation
- Validation status:
  - `npm run typecheck` passes
  - `npm run check:pdf-parity` passes
- Snapshot+ PDF copy/order pass completed for parity with on-screen Snapshot+ report framing:
  - updated intro/overview wording
  - aligned voice section naming (`Brand Voice Guidance`)
  - aligned roadmap heading (`Recommended 30/60/90-Day Roadmap`)
  - made Blueprint next-step CTA page always present
- Crash-safe resume tooling added:
  - `scripts/resume-dev.sh`
  - `scripts/resume-snapshot.sh`
  - `scripts/check-pdf-parity.ts`
  - npm scripts `resume:dev`, `resume:dev:full`, `resume:snapshot`, `check:pdf-parity`.

## In Progress

- Final cross-tier report/template parity and deterministic routing hardening.

## Next Tasks (Priority Queue)

1. Optional polish: convert remaining internal upgrade links in result components from `<a>` to `next/link` to clear navigation warnings.
2. Optional QA: run end-to-end clickthrough on free snapshot → locked previews → Snapshot+ CTA paths.

## Resume Commands

- Quick resume: `npm run resume:dev`
- Full resume checks: `npm run resume:dev:full`
- Write checkpoint: `npm run resume:snapshot`
- PDF parity only: `npm run check:pdf-parity`

## Notes for Next Agent Run

- Preserve Wundy conversational behavior and upgrade funnel mechanics.
- Keep snapshot upgrade CTA text consistent: `See Your Full Results — $497`.
- Prefer centralized `/api/pdf?type=...` generation path for parity.
- Do not remove existing analytics tracking (`trackEvent`, `fireACEvent`, `trackUpgradeClick`).
- Use `docs/RELEASE_READINESS_CHECKLIST.md` for final go/no-go launch validation.
