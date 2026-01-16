// src/lib/prompts/exportPrompts.ts
// Utility function to export prompt packs to markdown format

import { PillarPromptPack, BrandArchetype, BrandStage } from "./types";

export function exportPromptsToMarkdown(
  packs: PillarPromptPack[],
  archetype: BrandArchetype,
  stage: BrandStage
): string {
  let output = `# Blueprint™ Prompt Pack\n\n`;

  packs.forEach((pack) => {
    const prompts = pack.archetypes[archetype]?.[stage];
    if (!prompts?.length) return;

    output += `## ${pack.pillar}\n\n`;

    prompts.forEach((p) => {
      output += `### ${p.title}\n`;
      output += `${p.prompt}\n\n`;
    });
  });

  return output;
}
