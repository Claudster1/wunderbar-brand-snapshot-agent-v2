import { SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES } from "@/src/lib/prompts/promptLibrary";

export function PromptPackPanel() {
  const promptPacks = [
    {
      title: "Snapshot+ Prompt Pack",
      description: "Put your brand to work immediately with day-one prompts.",
      examples: SNAPSHOT_PLUS_LOCKED_PROMPT_TITLES,
    },
    {
      title: "Blueprint Prompt Systems",
      description:
        "Build repeatable channel systems for email, social, website, conversion, SEO, and AEO.",
      examples: [
        "Core Messaging Framework",
        "Email Sequence Architect",
        "Social Media Content System",
        "SEO Strategy Prompt (S1)",
        "AEO / Answer Engine Optimization Prompt (A0)",
      ],
    },
    {
      title: "Blueprint+ Strategic Library",
      description:
        "Scale with persona-level, funnel-level, and campaign-cycle operating systems.",
      examples: [
        "Audience Persona Messaging Map",
        "Quarterly Campaign Planning Framework",
        "Full-Funnel Messaging Architecture",
        "AEO Advanced: Thought Leadership & Authority System (AA1)",
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

          <ul className="strategy-suite-ul text-sm">
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
