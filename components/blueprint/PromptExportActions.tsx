// components/blueprint/PromptExportActions.tsx
// Component for exporting prompt packs (copy/download actions)

"use client";

import { PromptPack } from '@/src/lib/prompts/blueprint/promptPacks';
import { formatPromptsForExport } from '@/src/lib/prompts/blueprint/formatPrompts';

export function PromptExportActions({ pack }: { pack: PromptPack }) {
  function copy(format: 'plain' | 'markdown') {
    navigator.clipboard.writeText(
      formatPromptsForExport(pack, format)
    );
  }

  function download(format: 'plain' | 'markdown') {
    const content = formatPromptsForExport(pack, format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id}.${format === 'markdown' ? 'md' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-3">
      <button onClick={() => copy('plain')}>Copy</button>
      <button onClick={() => download('plain')}>Download</button>
    </div>
  );
}
