// src/lib/prompts/blueprint/formatPrompts.ts
// Utility function to format prompts for export

import { PromptPack } from './promptPacks';

export function formatPromptsForExport(
  pack: PromptPack,
  format: 'plain' | 'markdown'
): string {
  if (format === 'markdown') {
    return `## ${pack.title}

${pack.prompts
  .map((p, i) => `### Prompt ${i + 1}\n\n${p}`)
  .join('\n\n')}
`;
  }

  return pack.prompts.join('\n\n---\n\n');
}
