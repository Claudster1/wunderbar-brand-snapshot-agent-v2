export function PromptPackPanel() {
  const promptPacks = [
    {
      title: "Positioning Prompts",
      description:
        "Clarify how your brand should be described, compared, and positioned in any context.",
      examples: [
        "Explain our value proposition to a new customer",
        "Position our brand against a common alternative",
      ],
    },
    {
      title: "Messaging Prompts",
      description:
        "Ensure consistent tone, clarity, and language across all touchpoints.",
      examples: [
        "Rewrite this message in our brand voice",
        "Create a short homepage headline",
      ],
    },
    {
      title: "Visibility & AEO Prompts",
      description:
        "Help AI systems and search engines clearly understand and surface your brand.",
      examples: [
        "Generate AI-friendly brand summaries",
        "Structure content for answer engines",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {promptPacks.map((pack) => (
        <div
          key={pack.title}
          className="border border-slate-200 rounded-lg p-6"
        >
          <h3 className="font-semibold mb-2">{pack.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{pack.description}</p>

          <ul className="text-sm list-disc pl-5 space-y-1">
            {pack.examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>

          <button className="mt-4 text-sm font-medium text-brand-blue">
            View prompts →
          </button>
        </div>
      ))}
    </div>
  );
}
