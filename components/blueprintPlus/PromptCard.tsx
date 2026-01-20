"use client";

type Prompt = {
  id: string;
  title: string;
  description: string;
  body: string;
};

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <div className="border border-brand-border rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-brand-navy mb-1">
        {prompt.title}
      </h3>

      <p className="text-sm text-brand-midnight mb-4">
        {prompt.description}
      </p>

      <pre className="text-xs bg-brand-soft p-4 rounded-md overflow-auto whitespace-pre-wrap mb-4">
        {prompt.body}
      </pre>

      <div className="flex gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(prompt.body)}
          className="px-4 py-2 text-sm bg-brand-blue text-white rounded-md hover:bg-brand-blueHover"
        >
          Copy Prompt
        </button>

        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(
            prompt.body
          )}`}
          download={`${prompt.id}.txt`}
          className="px-4 py-2 text-sm border border-brand-border rounded-md"
        >
          Download
        </a>
      </div>
    </div>
  );
}
