// components/blueprint/PillarPromptSection.tsx
// Section component for displaying pillar-specific activation prompts

"use client";

export function PillarPromptSection({
  pillar,
  prompts,
}: {
  pillar: string;
  prompts: { title: string; body: string }[];
}) {
  return (
    <section className="mb-14">
      <h3 className="text-lg font-semibold text-brand-navy mb-2">
        {pillar} Activation Prompts
      </h3>

      <p className="text-sm text-slate-600 mb-5 max-w-2xl">
        Use these prompts to apply your {pillar.toLowerCase()} strategy consistently
        across channels and initiatives.
      </p>

      <div className="space-y-4">
        {prompts.map((prompt, idx) => (
          <div
            key={idx}
            className="border border-brand-border rounded-lg p-4 bg-white"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm text-brand-midnight">
                {prompt.title}
              </h4>

              <button
                onClick={() => navigator.clipboard.writeText(prompt.body)}
                className="text-xs text-brand-blue hover:underline"
              >
                Copy
              </button>
            </div>

            <pre className="text-[13px] whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded">
              {prompt.body}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
