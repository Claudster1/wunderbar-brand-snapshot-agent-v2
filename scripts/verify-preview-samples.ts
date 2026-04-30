/**
 * Sanity-check preview “sample report” merge (buildActivationDiagnostics on previewFullBlueprintReport).
 * Run: npm run verify:preview-samples
 */
import { getPreviewActivationEngineMerge } from "../app/preview/results-tabs/previewActivationMockData";

const dx = getPreviewActivationEngineMerge("Acme Co");
const keys = Object.keys(dx.channelPlans);
const required = ["email", "ads", "social", "content-seo"];
for (const k of required) {
  if (!keys.includes(k)) {
    throw new Error(`Missing channelPlans.${k} — got: ${keys.join(", ")}`);
  }
}
if (!dx.buyerJourneySummary?.trim()) throw new Error("Missing buyerJourneySummary");
if (!dx.audienceSegmentsBody?.trim()) throw new Error("Missing audienceSegmentsBody");

console.log("Preview samples OK — channelPlans:", keys.join(", "));
