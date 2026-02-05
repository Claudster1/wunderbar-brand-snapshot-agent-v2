// src/prompts/index.ts
// Central export for all report generation prompts

// Engine prompts (scoring, data transformation)
export { scoringEnginePrompt } from "./scoringEnginePrompt";
export { snapshotPlusEnginePrompt } from "./snapshotPlusEnginePrompt";
export { blueprintEnginePrompt } from "./blueprintEnginePrompt";

// Report generation prompts (content structure)
export { brandSnapshotReportPrompt } from "./brandSnapshotReportPrompt";
export { snapshotPlusReportPrompt } from "./snapshotPlusReportPrompt";
export { blueprintReportPrompt } from "./blueprintReportPrompt";
export { blueprintPlusReportPrompt } from "./blueprintPlusReportPrompt";

// Wundy system prompt (chatbot)
export { wundySystemPrompt } from "./wundySystemPrompt";
