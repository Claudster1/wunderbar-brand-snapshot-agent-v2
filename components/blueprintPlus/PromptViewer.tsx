"use client";

import { PromptActions } from "./PromptActions";

export function PromptViewer({
  prompts,
}: {
  prompts: { title?: string; content: string }[];
}) {
  return (
    <div className="mt-6 space-y-6">
      {prompts.map((prompt, index) => (
        <div
          key={index}
          className="rounded-lg border border-brand-border bg-brand-soft p-5"
        >
          {prompt.title ? (
            <h4 className="text-sm font-semibold text-brand-navy mb-2">
              {prompt.title}
            </h4>
          ) : null}

          <pre className="text-sm text-brand-mid whitespace-pre-wrap leading-relaxed">
            {prompt.content}
          </pre>

          <PromptActions content={prompt.content} />
        </div>
      ))}
    </div>
  );
}
