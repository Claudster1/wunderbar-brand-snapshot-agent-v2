// components/blueprint/PromptBlock.tsx
// Component for displaying a single prompt in a block

"use client";

export function PromptBlock({
  prompt
}: {
  prompt: string;
}) {
  return (
    <div className="border rounded-md p-4 mb-4">
      <pre className="whitespace-pre-wrap">
        {prompt}
      </pre>
      <button
        onClick={() => navigator.clipboard.writeText(prompt)}
        className="mt-2 text-sm text-brand-blue"
      >
        Copy prompt
      </button>
    </div>
  );
}
