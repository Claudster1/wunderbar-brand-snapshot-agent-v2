# Results suite content audit (tabs, tiers, tone)

**Date:** 2026-03-27  
**Sources of truth:** `docs/TIER_DELIVERABLES_LOCKED.md`, `lib/tierDeliverables.ts`, `lib/copy/reportExecutionStandard.ts`, `components/results/tabConfig.ts`

## Summary

| Area | Status | Notes |
| --- | --- | --- |
| Tab availability vs tier | Aligned | `TAB_DEFINITIONS` + `TIER_RANK` match the lock doc. |
| Activation sections vs tier | Aligned | `TIER_DELIVERABLES` + `filterActivationPlanSections` match the lock doc. |
| Download list vs tier | Aligned | `DownloadsTab` / `buildDownloadsNavModel` driven by `TIER_DELIVERABLES`. |
| Suite chrome copy (intros, how-to, progress hints) | Updated | `lib/copy/resultsSuiteGuidance.ts` — plain language, tier-deliverable accurate, Blueprint+ framed as **artifacts** not generic to-do lists; optional **Quick terms** row with info icons via `TabIntroGuidanceBlock`. |
| Company-specific chrome | Partial | Tab intros prefix with **For {Company}** when `businessName` / `companyName` is on `diagnosticData`. Deeper body content still depends on report JSON + prompts. |
| Report body (pillar text, activation bodies, etc.) | Separate layer | Governed by engine/report prompts + `reportExecutionReadyContentRule`. Audit prompts separately for goal-aware, non-task-list output. |

## Tab-by-tab expectations (what “complete” means)

### Results (all tiers)

- **Must include:** WunderBrand Score™, pillar scores / narrative, priority focus, upgrade path only when tier is Snapshot (no teasers inside paid tiers per lock doc).
- **Gaps / opportunities:** Tie hero copy to stated goals when stored on report (e.g. growth, launch, repositioning) — requires schema + UI field. Context meter already tier-aware for paid.

### Foundation (Snapshot+ and above)

- **Must include:** Positioning, pillars, audience/personas as tier allows, voice — aligned to `FOUNDATION_*` filters.
- **Gaps / opportunities:** Ensure workbook refinements surface in previews; glossary terms now include Positioning / Messaging pillars at tab intro.

### Strategy (Snapshot+ and above; section set shrinks on Snapshot if ever surfaced)

- **Must include:** Sections from `STRATEGY_SECTION_IDS_BY_TIER` only (no extra panels for lower tiers).
- **Blueprint vs Blueprint+:** Same Strategy depth per product decision — intros and progress hints now state that explicitly.
- **Gaps / opportunities:** Narrative blocks should keep using diagnostic fields (`companyName`, `industry`, audiences); review `StrategyTab` / extractors for fallback strings that sound generic.

### Brand Standards (Blueprint+)

- **Must include:** Voice, messaging, visual QA aligned to standards downloads for that tier.
- **Gaps / opportunities:** Intro now split Blueprint vs Blueprint+ (internal/vendor depth called out for B+ downloads).

### Activation (Snapshot+ and above; section IDs per tier)

- **Snapshot+:** No `audience-segments` / `competitive-motion-plan` / `pr-plan` / `lead-magnet-planning` per lock — enforced in config.
- **Blueprint+:** Full section list including `lead-magnet-planning`; copy should stress **ship-ready artifacts** vs chore lists (`reportExecutionStandard`).

### Workbook (Snapshot+ and above)

- **Must include:** Section list per `buildWorkbookNavMenuItems`; saves feed Downloads regeneration.
- **Gaps / opportunities:** Optional one-line hint when a section is empty vs locked.

### Downloads (all tiers)

- **Snapshot:** Snapshot PDF only — intro fixed (was previously overlapping Snapshot+ copy).
- **Snapshot+:** Executive summary + prompt guide — intro lists exactly those.
- **Blueprint / Blueprint+:** Intros list bundles consistent with `TIER_DELIVERABLES`.

## Blueprint+ “not a todo list” alignment

- **Product rule:** `lib/copy/reportExecutionStandard.ts` — artifacts first, sequenced work only in roadmap fields with named outputs.
- **UI rule:** Activation tab intro + `getSuiteProgressHint` for `blueprint-plus` now describe paste-ready assets and exports, not generic checklists.

## Recommended next steps (engineering + content)

1. **Prompts:** Re-read `blueprintPlusReportPrompt.ts` and activation JSON schemas so every list field prefers *outputs* (“Publish hero using: …”) over *tasks* (“Improve homepage”).
2. **Goals:** If diagnostics capture a primary goal string, pass `goalSummary` into `getSuiteTabIntro` options and open Results hero with one sentence tied to that goal.
3. **Glossary:** Extend `SuiteTabGlossaryTerm` lists per tab as you see support tickets — keep to 2–4 terms per tab to avoid noise.
4. **QA pass:** Snapshot preview pages that build `diagnosticData` without `businessName` — intros still read fine without the “For {company}” prefix.
