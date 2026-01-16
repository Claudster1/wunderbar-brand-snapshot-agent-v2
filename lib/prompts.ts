// lib/prompts.ts
// Prompt pack utilities

import { PillarKey } from "@/types/pillars";
import { blueprintPromptPacks } from "@/src/lib/blueprint/promptPacks";

export interface PromptPack {
  pillar: PillarKey;
  title: string;
  prompt: string;
}

// Map capitalized pillar names to PillarKey
const pillarNameMap: Record<string, PillarKey> = {
  Positioning: "positioning",
  Messaging: "messaging",
  Visibility: "visibility",
  Credibility: "credibility",
  Conversion: "conversion",
};

export async function getPromptPack(): Promise<PromptPack[]> {
  // Convert blueprintPromptPacks to array format
  return Object.entries(blueprintPromptPacks).map(([pillarName, pack]) => ({
    pillar: pillarNameMap[pillarName] || pillarName.toLowerCase() as PillarKey,
    title: pack.title,
    prompt: pack.prompts.join("\n\n"), // Join multiple prompts with newlines
  }));
}
