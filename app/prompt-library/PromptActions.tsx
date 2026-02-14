// app/prompt-library/PromptActions.tsx
// Thin client component for copy/download buttons

"use client";

import { copyPrompt, downloadPrompt } from "@/src/utils/prompts/copy";

interface PromptActionsProps {
  content: string;
  filename: string;
}

export default function PromptActions({ content, filename }: PromptActionsProps) {
  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={() => copyPrompt(content)}
        className="text-sm underline"
      >
        Copy
      </button>
      <button
        onClick={() => downloadPrompt(content, filename)}
        className="text-sm underline"
      >
        Download
      </button>
    </div>
  );
}
