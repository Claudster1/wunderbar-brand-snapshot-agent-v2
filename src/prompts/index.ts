// src/prompts/index.ts
// Central export for all report generation prompts
//
// IMPORTANT — PROMPT SOURCE OF TRUTH:
// Each tier has ONE canonical prompt used for AI generation:
//   - Free tier:      scoringEnginePrompt (scoring + insights)
//                     brandSnapshotReportPrompt (full report structure)
//   - Snapshot+:      snapshotPlusEnginePrompt (CANONICAL — used by lib/ai/reportGeneration.ts)
//   - Blueprint:      blueprintEnginePrompt (CANONICAL — used by lib/ai/reportGeneration.ts)
//   - Blueprint+:     blueprintPlusReportPrompt (CANONICAL — used by lib/ai/reportGeneration.ts)
//
// The "report prompts" (snapshotPlusReportPrompt, blueprintReportPrompt) are
// legacy/reference copies. If you need to update prompt content, update the
// CANONICAL version and keep the others in sync.

// Engine/canonical prompts (scoring, report generation — these are the prompts used in production)
export { scoringEnginePrompt } from "./scoringEnginePrompt";
export { snapshotPlusEnginePrompt } from "./snapshotPlusEnginePrompt";
export { blueprintEnginePrompt } from "./blueprintEnginePrompt";

// Report generation prompts (used for free tier + reference for other tiers)
export { brandSnapshotReportPrompt } from "./brandSnapshotReportPrompt";
export { snapshotPlusReportPrompt } from "./snapshotPlusReportPrompt";
export { blueprintReportPrompt } from "./blueprintReportPrompt";
export { blueprintPlusReportPrompt } from "./blueprintPlusReportPrompt";

// Wundy™ system prompt (chatbot — original conversation flow)
export { wundySystemPrompt } from "./wundySystemPrompt";

// Wundy™ Guide & Companion modes (two-mode chat system)
export { wundyGuidePrompt } from "./wundyGuidePrompt";
export { buildWundyReportCompanionPrompt } from "./wundyReportCompanionPrompt";
