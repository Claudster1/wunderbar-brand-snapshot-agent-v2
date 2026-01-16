// components/blueprint/PromptActions.tsx

"use client";

export function PromptActions({ prompt }: { prompt: string }) {
  return (
    <div className="flex gap-3 mt-3">
      <button
        className="btn-secondary"
        onClick={() => navigator.clipboard.writeText(prompt)}
      >
        Copy Prompt
      </button>

      <a
        className="btn-secondary"
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(prompt)}`}
        download="blueprint-prompt.txt"
      >
        Download
      </a>
    </div>
  );
}
