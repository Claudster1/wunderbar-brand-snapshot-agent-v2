# Execution-ready report content

**Source of truth:** `lib/copy/reportExecutionStandard.ts` → `reportExecutionReadyContentRule`

That block is injected into:

| Product | Prompt / surface |
|--------|-------------------|
| WunderBrand Snapshot™ (free) | `brandSnapshotReportPrompt.ts`, `scoringEnginePrompt.ts` |
| WunderBrand Snapshot+™ | `snapshotPlusEnginePrompt.ts`, `snapshotPlusReportPrompt.ts` |
| WunderBrand Blueprint™ | `blueprintEnginePrompt.ts`, `blueprintReportPrompt.ts` |
| WunderBrand Blueprint+™ | `blueprintPlusReportPrompt.ts` |
| Snapshot+ refinement | `lib/refinementEngine.ts` (system prompt + action instructions) |

**Intent:** Deliver **artifacts** (copy, prompts, criteria, filled templates) — not reports that read like a generic consulting to-do list. Narrative sections stay declarative; sequenced work lives in roadmap/action-plan fields and still names **outputs**.

**Related:** Brand Purpose vs. tactics → `docs/REPORT_VISUAL_LANGUAGE.md` (Brand Purpose subsection).
