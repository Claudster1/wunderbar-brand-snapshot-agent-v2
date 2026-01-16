// app/prompt-library/page.tsx
// Prompt library page displaying all available prompts

"use client";

import { PROMPT_LIBRARY } from "@/lib/prompts/library";
import { copyPrompt, downloadPrompt } from "@/src/utils/prompts/copy";

export default function PromptLibraryPage() {

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-6">
        Prompt Library
      </h1>

      <div className="grid gap-6">
        {PROMPT_LIBRARY.map((prompt) => (
          <div
            key={prompt.id}
            className="border rounded-xl p-6 bg-white"
          >
            <h3 className="font-medium mb-2">{prompt.title}</h3>
            <p className="text-sm text-slate-600 mb-4">
              Pillar: {prompt.pillar} · Stage: {prompt.stage}
            </p>

            <textarea
              readOnly
              className="w-full text-sm p-4 border rounded-md"
              rows={6}
              value={prompt.content}
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => copyPrompt(prompt.content)}
                className="text-sm underline"
              >
                Copy
              </button>
              <button
                onClick={() =>
                  downloadPrompt(
                    prompt.content,
                    `${prompt.title.toLowerCase().replace(/\s+/g, "-")}.txt`
                  )
                }
                className="text-sm underline"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
